const WebsiteAnalyticsDaily = require("../../models/WebsiteAnalyticsDaily");
const { parseFilters, report, validateImport } = require("../../services/websiteAnalytics");
const { syncSearchConsole } = require("../../services/searchConsole");
const { parseHit, recordHit, rollupTraffic } = require("../../services/visitorTracking");

// Bring tracked visitor sessions into the daily records before reporting.
// A rollup failure must not hide stored search data, so it is logged, not thrown.
const refreshTraffic = () => rollupTraffic().then((result) => { if (result.dates.length) clearReportCache(); }).catch((error) => console.error("Visitor traffic rollup failed:", error.message));

// The page loads ~9 sections in parallel for one period; share one database read between them.
// The comparison period only feeds headline totals, so its large breakdown arrays are skipped.
const CACHE_MS = 60 * 1000;
const reportCache = new Map();
const clearReportCache = () => reportCache.clear();
const loadReport = async (filters) => {
  await refreshTraffic();
  const key = JSON.stringify(filters);
  const cached = reportCache.get(key);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.promise;
  const device = filters.device !== "All devices" ? { device: filters.device } : {};
  const promise = Promise.all([
    WebsiteAnalyticsDaily.find({ ...device, date: { $gte: filters.startDate, $lte: filters.endDate } }).sort({ date: 1 }).lean(),
    WebsiteAnalyticsDaily.find({ ...device, date: { $gte: filters.previousStartDate, $lte: filters.previousEndDate } }, { date: 1, device: 1, updatedAt: 1, "search.provider": 1, "search.totals": 1, "traffic.provider": 1, "traffic.totals": 1 }).sort({ date: 1 }).lean(),
  ]).then(([current, previous]) => report([...previous, ...current], filters));
  reportCache.set(key, { at: Date.now(), promise });
  promise.catch(() => reportCache.delete(key));
  return promise;
};

const selectMetrics = (values, keys) => Object.fromEntries(keys.filter((key) => values[key] !== undefined).map((key) => [key, values[key]]));
const searchKeys = ["clicks", "impressions", "ctr", "position"];
const visitorKeys = ["entries", "exits", "views", "engagementRate", "engagementSeconds", "exitRate"];
const selectors = {
  "search-overview": (data) => ({ totals: selectMetrics(data.totals, searchKeys), comparison: selectMetrics(data.comparison, searchKeys) }),
  "search-trend": (data) => ({ rows: data.daily }),
  "top-pages": (data) => ({ rows: data.pages.filter((row) => row.clicks !== undefined) }),
  "queries": (data) => ({ rows: data.queries }),
  "visitor-overview": (data) => ({ totals: selectMetrics(data.totals, visitorKeys), comparison: selectMetrics(data.comparison, visitorKeys) }),
  "traffic-sources": (data) => ({ rows: data.sources }),
  "devices": (data) => ({ rows: data.devices }),
  "entry-pages": (data) => ({ rows: data.pages.filter((row) => row.entries !== undefined) }),
  "exit-pages": (data) => ({ rows: data.pages.filter((row) => row.exits !== undefined) }),
  "page-details": (data, req) => ({ page: data.pages.find((row) => row.name === req.query.page) || null }),
};

exports.analyticsSections = Object.keys(selectors);
exports.getAnalyticsSection = (section) => async (req, res) => {
  let filters;
  try {
    filters = parseFilters(req.query);
    if (section === "page-details" && (typeof req.query.page !== "string" || !req.query.page.startsWith("/") || /[?#]/.test(req.query.page))) throw new Error("page must be a website path without query strings or fragments");
  } catch (error) { return res.status(400).json({ success: false, message: error.message }); }
  try {
    const data = await loadReport(filters);
    res.set("Cache-Control", "private, no-store");
    return res.json({ success: true, data: { filters, availability: data.availability, updatedAt: data.updatedAt, timezone: data.timezone, ...selectors[section](data, req) } });
  } catch (error) {
    console.error(`Website analytics ${section} failed:`, error.message);
    return res.status(500).json({ success: false, message: `Could not load ${section}` });
  }
};

exports.syncWebsiteSearch = async (req, res) => {
  try {
    const data = await syncSearchConsole({ days: req.body?.days ?? 7, endDate: req.body?.endDate });
    clearReportCache();
    return res.json({ success: true, data });
  } catch (error) {
    // Never return credentials, tokens, or upstream response bodies.
    return res.status(error.status || 502).json({ success: false, message: error.status ? error.message : "Search Console sync failed. Check the backend credential configuration." });
  }
};

exports.getWebsiteAnalytics = async (req, res) => {
  let filters;
  try { filters = parseFilters(req.query); }
  catch (error) { return res.status(400).json({ success: false, message: error.message }); }
  try {
    const data = await loadReport(filters);
    res.set("Cache-Control", "private, no-store");
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Website analytics fetch failed:", error.message);
    return res.status(500).json({ success: false, message: "Could not load website analytics" });
  }
};

exports.importWebsiteAnalytics = async (req, res) => {
  const records = req.body.records;
  let operations;
  try {
    validateImport(records);
    // Validate the entire batch before any writes. Accept only modeled fields.
    const documents = records.map((record) => new WebsiteAnalyticsDaily({ date: record.date, device: record.device, search: record.search, traffic: record.traffic }));
    for (const document of documents) await document.validate();
    operations = documents.map((document, index) => {
      const fields = document.toObject(); delete fields._id;
      // A traffic-only import must not erase search data for the same day/device.
      if (!Object.hasOwn(records[index], "search")) delete fields.search;
      if (!Object.hasOwn(records[index], "traffic")) delete fields.traffic;
      return { updateOne: { filter: { date: fields.date, device: fields.device }, update: { $set: fields }, upsert: true } };
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
  try {
    await WebsiteAnalyticsDaily.bulkWrite(operations);
    clearReportCache();
    return res.json({ success: true, imported: records.length });
  } catch (error) {
    console.error("Website analytics import failed:", error.message);
    return res.status(500).json({ success: false, message: "Could not import website analytics" });
  }
};

// Public endpoint for the website's page-view beacon. Always answers 204 so the
// tracker never retries or surfaces errors to visitors.
exports.collectVisit = async (req, res) => {
  try {
    const hit = parseHit(req.body);
    let siteHost = "";
    try { siteHost = new URL(req.get("origin") || req.get("referer") || "").hostname.replace(/^www./, ""); } catch {}
    await recordHit(hit, { userAgent: req.get("user-agent") || "", siteHost });
  } catch (error) {
    if (!(error instanceof SyntaxError) && !/^Invalid/.test(error.message)) console.error("Visit collection failed:", error.message);
  }
  return res.status(204).end();
};
