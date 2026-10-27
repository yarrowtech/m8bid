const { test } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const jwt = require("jsonwebtoken");
const { parseFilters, report, validateImport } = require("../services/websiteAnalytics");
const Model = require("../models/WebsiteAnalyticsDaily");
const User = require("../models/userSchema");
const { decodeToken, isAdmin } = require("../middleware/authmiddleware");
const controller = require("../controllers/adminController/WebsiteAnalytics");
const Session = require("../models/WebsiteVisitSession");
// Report handlers roll up tracked visits first; with no sessions stored, that is a no-op.
Session.findOne = () => ({ sort: () => ({ lean: async () => null }) });

const search = (clicks, impressions, position) => ({ clicks, impressions, position });
const traffic = (entries, exits, views, engaged, engagementSeconds) => ({ entries, exits, views, engaged, engagementSeconds });
const record = {
  date: "2026-10-06", device: "Mobile",
  search: { provider: "Search Console", totals: search(10, 100, 4), pages: [{ name: "/", title: "Home", metrics: search(10, 100, 4) }], queries: [] },
  traffic: { provider: "Website analytics", totals: traffic(20, 20, 40, 10, 600), pages: [{ name: "/", metrics: traffic(20, 20, 40, 10, 600) }], sources: [{ name: "Direct", metrics: traffic(20, 20, 40, 10, 600) }] },
};

test("date filters validate completed dates and equal-length previous periods", () => {
  const filters = parseFilters({ days: "7", device: "Mobile" }, new Date("2026-10-07T05:00:00Z"));
  assert.equal(filters.endDate, "2026-10-06");
  assert.equal(filters.startDate, "2026-09-30");
  assert.equal(filters.previousStartDate, "2026-09-23");
  assert.equal(filters.previousEndDate, "2026-09-29");
  for (const query of [{ days: "999" }, { device: "$ne" }, { endDate: "2026-02-30" }, { endDate: "2026-10-07" }]) {
    assert.throws(() => parseFilters(query, new Date("2026-10-07T05:00:00Z")));
  }
});

test("reports weight rates, separate previous periods, and leave missing sources unavailable", () => {
  const filters = parseFilters({ days: "7", endDate: "2026-10-06" }, new Date("2026-10-07T05:00:00Z"));
  const other = { ...record, device: "Desktop", search: { ...record.search, totals: search(20, 300, 8), pages: [{ name: "/", metrics: search(20, 300, 8) }] }, traffic: null };
  const data = report([record, other, { ...record, date: "2026-09-29" }], filters);
  assert.equal(data.totals.clicks, 30);
  assert.equal(data.totals.ctr, 7.5);
  assert.equal(data.totals.position, 7);
  assert.equal(data.comparison.clicks, 10);
  assert.equal(data.totals.engagementRate, 50);
  assert.equal(data.totals.engagementSeconds, 30);
  assert.equal(data.pages[0].clicks, 30);
  assert.equal(data.pages[0].entries, 20);
  assert.equal(data.daily.length, 7);
  assert.equal(data.daily[0].clicks, null);
  assert.equal(data.daily[6].clicks, 30);
  assert.equal(data.availability.search.status, "partial");
  const empty = report([], filters);
  assert.deepEqual(empty.totals, {});
  assert.equal(empty.availability.search.status, "unavailable");
  assert.deepEqual(empty.queries, []);
});

test("imports reject invalid metrics, duplicate grains, unsafe page URLs, and inconsistent totals", () => {
  validateImport([record]);
  assert.throws(() => validateImport([record, record]));
  assert.throws(() => validateImport([{ ...record, search: { ...record.search, totals: search(101, 100, 4) } }]));
  assert.throws(() => validateImport([{ ...record, traffic: { ...record.traffic, totals: traffic(10, 10, 20, 11, 100) } }]));
  assert.throws(() => validateImport([{ ...record, search: { ...record.search, pages: [{ name: "/?token=secret", metrics: search(1, 10, 4) }] } }]));
  assert.throws(() => validateImport([{ ...record, search: { ...record.search, pages: [{ name: "/", metrics: search(11, 110, 4) }] } }]));
});

test("HTTP API enforces admin access, returns real stored reports, and persists validated imports", async () => {
  const oldFind = Model.find;
  const oldBulk = Model.bulkWrite;
  const oldUser = User.findById;
  let writes = [];
  // Honour the date range like MongoDB: current and comparison periods are read separately.
  Model.find = (match) => ({ sort: () => ({ lean: async () => [record].filter((row) => row.date >= match.date.$gte && row.date <= match.date.$lte) }) });
  Model.bulkWrite = async (operations) => { writes = operations; };
  User.findById = (id) => ({ select: async () => ({ _id: id, role: id === "admin" ? "admin" : "user" }) });
  const app = express(); app.use(express.json());
  app.get("/analytics", decodeToken, isAdmin, controller.getWebsiteAnalytics);
  for (const section of controller.analyticsSections) app.get(`/analytics/${section}`, decodeToken, isAdmin, controller.getAnalyticsSection(section));
  app.post("/analytics/import", decodeToken, isAdmin, controller.importWebsiteAnalytics);
  const server = await new Promise((resolve) => { const instance = app.listen(0, "127.0.0.1", () => resolve(instance)); });
  const url = `http://127.0.0.1:${server.address().port}/analytics`;
  const auth = (id) => ({ Authorization: `Bearer ${jwt.sign({ id }, process.env.JWT_SECRET || "default_secret")}` });
  try {
    assert.equal((await fetch(url)).status, 401);
    assert.equal((await fetch(url, { headers: auth("user") })).status, 403);
    assert.equal((await fetch(`${url}?days=100`, { headers: auth("admin") })).status, 400);
    for (const days of [90, 180, 365]) {
      const long = await (await fetch(`${url}?days=${days}&endDate=2026-10-06`, { headers: auth("admin") })).json();
      assert.equal(long.data.filters.days, days);
      assert.equal(long.data.totals.clicks, 10);
      assert.equal(long.data.comparison.clicks, undefined); // nothing stored for the previous period
    }
    const response = await fetch(url, { headers: auth("admin") });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal((await response.json()).data.totals.clicks, 10);
    for (const section of controller.analyticsSections) {
      const path = `${url}/${section}?endDate=2026-10-06${section === "page-details" ? "&page=%2F" : ""}`;
      assert.equal((await fetch(path)).status, 401);
      assert.equal((await fetch(path, { headers: auth("user") })).status, 403);
      const sectionResponse = await fetch(path, { headers: auth("admin") });
      assert.equal(sectionResponse.status, 200);
      const data = (await sectionResponse.json()).data;
      assert.equal(data.filters.endDate, "2026-10-06");
      if (section === "search-overview") { assert.equal(data.totals.clicks, 10); assert.equal(data.totals.entries, undefined); }
      if (section === "visitor-overview") { assert.equal(data.totals.entries, 20); assert.equal(data.totals.clicks, undefined); }
      if (section === "page-details") assert.equal(data.page.name, "/");
      if (section === "entry-pages") assert.equal(data.rows[0].entries, 20);
      if (section === "exit-pages") assert.equal(data.rows[0].exits, 20);
      if (section === "queries") assert.deepEqual(data.rows, []);
    }
    assert.equal((await fetch(`${url}/page-details?page=invalid`, { headers: auth("admin") })).status, 400);
    const imported = await fetch(`${url}/import`, { method: "POST", headers: { ...auth("admin"), "Content-Type": "application/json" }, body: JSON.stringify({ records: [{ date: record.date, device: record.device, traffic: record.traffic }] }) });
    assert.equal(imported.status, 200);
    assert.equal(writes.length, 1);
    assert.equal(Object.hasOwn(writes[0].updateOne.update.$set, "search"), false);
    const invalid = await fetch(`${url}/import`, { method: "POST", headers: { ...auth("admin"), "Content-Type": "application/json" }, body: JSON.stringify({ records: [] }) });
    assert.equal(invalid.status, 400);
    Model.find = () => ({ sort: () => ({ lean: async () => { throw new Error("Database unavailable"); } }) });
    assert.equal((await fetch(url, { headers: auth("admin") })).status, 500);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    Model.find = oldFind; Model.bulkWrite = oldBulk; User.findById = oldUser;
  }
});
