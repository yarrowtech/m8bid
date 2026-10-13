import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { demoAnalyticsRows, devices, getQueryPreview, groupAnalytics, summarize } from "../src/data/websiteAnalyticsDemo.js";

for (const device of [null, ...devices]) {
  for (const days of [7, 28, 30]) {
    const dates = [...new Set(demoAnalyticsRows.map((row) => row.date))].slice(-days);
    const rows = demoAnalyticsRows.filter((row) => dates.includes(row.date) && (!device || row.device === device));
    const totals = summarize(rows);
    assert.equal(totals.entries, totals.exits, "Each completed demo session has one entrance and exit");
    assert.ok(totals.views >= totals.entries);
    assert.ok(totals.clicks <= totals.impressions);
    assert.ok(totals.engagementRate >= 0 && totals.engagementRate <= 100);
    for (const key of ["page", "channel", "device", "date"]) {
      const groups = groupAnalytics(rows, key);
      for (const metric of ["clicks", "impressions", "views", "entries", "exits"]) {
        assert.equal(groups.reduce((total, row) => total + row[metric], 0), totals[metric]);
      }
    }
    const queries = getQueryPreview(rows);
    assert.equal(queries.reduce((total, row) => total + row.clicks, 0), totals.clicks);
    assert.equal(queries.reduce((total, row) => total + row.impressions, 0), totals.impressions);
  }
}
console.log("Demo calculations passed: filters, totals, rates, and query reconciliation.");

const executablePath = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
].find(existsSync);
if (!executablePath) {
  console.log("Browser verification unavailable: no local Chrome or Edge executable found.");
  process.exit(0);
}
const root = fileURLToPath(new URL("../dist/", import.meta.url));
const types = { ".js": "application/javascript", ".css": "text/css", ".html": "text/html", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const server = createServer((req, res) => {
  const requested = path.resolve(root, `.${decodeURIComponent(new URL(req.url, "http://localhost").pathname)}`);
  if (!requested.startsWith(root)) { res.writeHead(403).end(); return; }
  const file = existsSync(requested) && path.extname(requested) ? requested : path.join(root, "index.html");
  try { res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream"); res.end(readFileSync(file)); }
  catch { res.writeHead(404).end(); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await puppeteer.launch({ executablePath, headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem("token", "frontend-test-only");
    localStorage.setItem("user", JSON.stringify({ role: "admin", name: "Preview admin" }));
  });
  let responseMode = "success";
  const fixtureReport = (url) => {
    const days = Number(url.searchParams.get("days") || 28);
    const device = url.searchParams.get("device") || "All devices";
    const dates = [...new Set(demoAnalyticsRows.map((row) => row.date))].slice(-days);
    const rows = responseMode === "empty" ? [] : demoAnalyticsRows.filter((row) => dates.includes(row.date) && (device === "All devices" || row.device === device));
    return { filters: { startDate: dates[0], endDate: dates.at(-1), days, device }, totals: rows.length ? summarize(rows) : {}, comparison: {}, daily: groupAnalytics(rows, "date"), pages: groupAnalytics(rows, "page"), queries: rows.length ? getQueryPreview(rows) : [], sources: groupAnalytics(rows, "channel"), devices: groupAnalytics(rows, "device"), availability: { search: { status: rows.length ? "available" : "unavailable" }, traffic: { status: rows.length ? "available" : "unavailable" } } };
  };
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.resourceType() !== "document" && url.pathname.includes("/admin/website-analytics")) {
      const report = fixtureReport(url);
      const section = url.pathname.split("/").at(-1);
      const rowKeys = { "search-trend": "daily", "top-pages": "pages", queries: "queries", "traffic-sources": "sources", devices: "devices", "entry-pages": "pages", "exit-pages": "pages" };
      const data = section === "page-details" ? { ...report, page: report.pages.find((row) => row.name === url.searchParams.get("page")) || null } : rowKeys[section] ? { ...report, rows: report[rowKeys[section]] } : report;
      request.respond({ status: responseMode === "error" ? 503 : 200, contentType: "application/json", body: JSON.stringify(responseMode === "error" ? { message: "Test backend unavailable" } : { success: true, data }) });
    } else if (!request.url().startsWith(`http://127.0.0.1:${server.address().port}`)) {
      request.respond({ status: 200, contentType: "application/json", body: "{}" });
    } else request.continue();
  });
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(`http://127.0.0.1:${server.address().port}/admin/website-analytics`, { waitUntil: "networkidle0" });
  try {
    await page.waitForSelector(".wa-chart .recharts-area-curve", { timeout: 10000 });
  } catch (error) {
    await page.screenshot({ path: path.join(root, "website-analytics-check-failure.png") });
    console.log(JSON.stringify({ url: page.url(), errors, text: await page.$eval("body", (node) => node.innerText.slice(0, 1500)) }));
    throw error;
  }
  assert.equal(await page.$$eval(".wa-chart .recharts-area-curve", (nodes) => nodes.length), 2);
  await page.screenshot({ path: path.join(root, "website-analytics-desktop.png") });
  const initialClicks = await page.$eval(".wa-metric-value", (node) => node.textContent);
  await page.select('select[aria-label="Date range"]', "7");
  await page.waitForFunction(() => document.querySelector(".wa-demo-banner").textContent.includes("Backend analytics"));
  assert.notEqual(await page.$eval(".wa-metric-value", (node) => node.textContent), initialClicks);
  await page.select('select[aria-label="Device"]', "Mobile");
  await page.waitForFunction(() => document.querySelector(".wa-demo-banner").textContent.includes("Backend analytics"));
  assert.equal(await page.$$eval(".wa-device-list > div", (nodes) => nodes.length), 1);
  await page.select('select[aria-label="Device"]', "All devices");
  await page.waitForFunction(() => document.querySelector(".wa-demo-banner").textContent.includes("Backend analytics"));
  assert.equal(await page.$$eval(".wa-device-list > div", (nodes) => nodes.length), 3);
  for (const tab of ["queries", "entries", "exits", "sources", "pages"]) {
    await page.click(`#wa-tab-${tab}`);
    assert.ok(await page.$$eval(".wa-table-scroll tbody tr", (nodes) => nodes.length) > 0);
  }
  await page.click(".wa-page-link");
  await page.waitForSelector(".wa-page-detail");
  await page.type('input[aria-label="Search analytics table"]', "no-matching-page");
  await page.waitForFunction(() => document.querySelector(".wa-table-scroll").textContent.includes("No results"));
  await page.$eval('input[aria-label="Search analytics table"]', (input) => { input.value = ""; });
  await page.type('input[aria-label="Search analytics table"]', "/");
  await page.click('button[aria-label="Next table page"]');
  assert.equal(await page.$$eval(".wa-table-scroll tbody tr", (nodes) => nodes.length), 1);
  await page.click('button[aria-label="Previous table page"]');
  await page.evaluate(() => {
    const original = URL.createObjectURL;
    URL.createObjectURL = (blob) => { window.exportedCsv = blob.text(); return original(blob); };
  });
  await page.click(".wa-export");
  const csv = await page.evaluate(() => window.exportedCsv);
  assert.ok(csv.includes("Backend website analytics"));
  assert.ok(csv.includes('"All devices"'));
  assert.equal(csv.trim().split("\r\n").length, 13, "Export contains metadata, header, and all six filtered pages");
  await page.evaluate(() => document.querySelector(".wa-detail-table").scrollIntoView({ behavior: "instant" }));
  await page.screenshot({ path: path.join(root, "website-analytics-table.png") });
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => document.querySelector(".admin-workspace main").scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: path.join(root, "website-analytics-mobile.png"), fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Mobile page must not overflow horizontally");
  await page.click('button[aria-label="Open admin navigation"]');
  await page.keyboard.press("Escape");
  responseMode = "empty";
  await page.click(".wa-demo-banner button");
  await page.waitForFunction(() => document.querySelector(".wa-chart").textContent.includes("No search data"));
  assert.equal(await page.$eval(".wa-metric-value", (node) => node.textContent), "—");
  assert.equal(await page.$eval(".wa-export", (node) => node.disabled), true);
  responseMode = "error";
  await page.click(".wa-demo-banner button");
  await page.waitForFunction(() => document.querySelector(".wa-demo-banner").textContent.includes("Test backend unavailable"));
  responseMode = "success";
  await page.click(".wa-demo-banner button");
  await page.waitForSelector(".wa-chart .recharts-area-curve");
  assert.deepEqual(errors, [], "No uncaught frontend errors");
  console.log("Browser checks passed: backend response rendering, filters, tabs, details, pagination, CSV, mobile overflow, empty data, error and retry states. API responses were fixtures.");
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
