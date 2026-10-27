const { readFileSync } = require("node:fs");
const { createSign } = require("node:crypto");
const Daily = require("../models/WebsiteAnalyticsDaily");
let cachedToken;
let syncing = false;
const shift = (date, days) => new Date(Date.parse(`${date}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);

function config() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_FILE) {
    const error = new Error("Set GOOGLE_SERVICE_ACCOUNT_FILE to your backend service-account JSON file");
    error.status = 503; throw error;
  }
  let credentials;
  try { credentials = JSON.parse(readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_FILE, "utf8")); }
  catch (cause) {
    const error = new Error(cause.code === "ENOENT" ? "GOOGLE_SERVICE_ACCOUNT_FILE points to a file that does not exist. Check the path, including the .json extension." : "GOOGLE_SERVICE_ACCOUNT_FILE is not a valid JSON credential file.");
    error.status = 503; throw error;
  }
  if (!credentials.client_email || !credentials.private_key) throw new Error("Invalid service-account configuration");
  return { credentials, property: process.env.GSC_SITE_URL || "https://www.matebid.com/" };
}

async function accessToken(credentials, request = fetch) {
  if (cachedToken && cachedToken.email === credentials.client_email && cachedToken.expires > Date.now() + 60000) return cachedToken.token;
  const now = Math.floor(Date.now() / 1000);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: credentials.client_email, scope: "https://www.googleapis.com/auth/webmasters.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(credentials.private_key, "base64url");
  const response = await request("https://oauth2.googleapis.com/token", {
    method: "POST", signal: AbortSignal.timeout(30000),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error("Google authentication failed. Check the service-account credentials.");
  cachedToken = { email: credentials.client_email, token: data.access_token, expires: Date.now() + Number(data.expires_in || 3600) * 1000 };
  return data.access_token;
}

async function query(property, token, body, request = fetch) {
  const response = await request(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`, {
    method: "POST", signal: AbortSignal.timeout(30000), headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(response.status === 403 ? "Google denied access. Enable the Search Console API and grant the service account access to the exact property." : "Search Console request failed; stored data has been preserved.");
    error.status = 502; throw error;
  }
  return data.rows || [];
}

function metrics(row) { return { clicks: row.clicks, impressions: row.impressions, position: row.position ?? null }; }
function pageRows(rows) {
  const groups = new Map();
  for (const row of rows) {
    const url = new URL(row.keys[0]);
    const name = url.pathname; // Exclude personal query parameters and fragments.
    const current = groups.get(name) || { name, title: name, metrics: { clicks: 0, impressions: 0, position: null }, weight: 0 };
    current.metrics.clicks += row.clicks; current.metrics.impressions += row.impressions;
    current.weight += (row.position || 0) * row.impressions;
    current.metrics.position = current.metrics.impressions ? current.weight / current.metrics.impressions : null;
    groups.set(name, current);
  }
  return [...groups.values()].map(({ name, title, metrics }) => ({ name, title, metrics }));
}

// Google keeps about 16 months of data; 480 days covers a 12-month report plus most of its comparison year.
const SYNC_DAYS = [7, 28, 30, 60, 90, 180, 365, 480];
const PARALLEL_DAYS = 4; // Stays well under Search Console's per-site query quota.

async function syncSearchConsole({ days = 7, endDate } = {}) {
  if (!SYNC_DAYS.includes(Number(days))) { const error = new Error(`days must be one of ${SYNC_DAYS.join(", ")}`); error.status = 400; throw error; }
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  endDate = endDate || shift(today, -3);
  if (typeof endDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(endDate) || Number.isNaN(Date.parse(endDate)) || new Date(endDate).toISOString().slice(0, 10) !== endDate || endDate > shift(today, -3)) {
    const error = new Error("endDate must be a valid date at least three days before today in Pacific time"); error.status = 400; throw error;
  }
  if (syncing) { const error = new Error("A Search Console sync is already running"); error.status = 409; throw error; }
  syncing = true;
  try {
    const { credentials, property } = config();
    const token = await accessToken(credentials);
    let imported = 0;
    const dates = Array.from({ length: Number(days) }, (_, index) => shift(endDate, index + 1 - Number(days)));
    const syncDate = async (date) => {
      for (const device of ["Mobile", "Desktop", "Tablet"]) {
        const base = { startDate: date, endDate: date, type: "web", dataState: "final", dimensionFilterGroups: [{ groupType: "and", filters: [{ dimension: "device", operator: "equals", expression: device.toUpperCase() }] }] };
        const totals = await query(property, token, { ...base, aggregationType: "byProperty", rowLimit: 1 });
        // Keep absent provider dates unavailable rather than inventing confirmed zeros.
        if (!totals.length) continue;
        const pages = await query(property, token, { ...base, dimensions: ["page"], aggregationType: "byPage", rowLimit: 1000 });
        const queries = await query(property, token, { ...base, dimensions: ["query"], aggregationType: "byProperty", rowLimit: 1000 });
        await Daily.updateOne({ date, device }, { $set: { search: { provider: "Google Search Console (Pacific time; top 1000 rows)", totals: metrics(totals[0]), pages: pageRows(pages), queries: queries.map((row) => ({ name: row.keys[0], metrics: metrics(row) })) } } }, { upsert: true, runValidators: true });
        imported++;
      }
    };
    const workers = Array.from({ length: PARALLEL_DAYS }, async () => { while (dates.length) await syncDate(dates.shift()); });
    await Promise.all(workers);
    return { imported, days: Number(days), startDate: shift(endDate, 1 - Number(days)), endDate, property, timezone: "America/Los_Angeles", breakdownLimit: 1000 };
  } finally { syncing = false; }
}
module.exports = { syncSearchConsole, pageRows, query };
