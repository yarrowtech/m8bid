const WebsiteAnalyticsDaily = require("../../models/WebsiteAnalyticsDaily");
const { parseFilters, report, validateImport } = require("../../services/websiteAnalytics");
const { syncSearchConsole } = require("../../services/searchConsole");

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
    const match = { date: { $gte: filters.previousStartDate, $lte: filters.endDate } };
    if (filters.device !== "All devices") match.device = filters.device;
    const records = await WebsiteAnalyticsDaily.find(match).sort({ date: 1 }).lean();
    const data = report(records, filters);
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
    const match = { date: { $gte: filters.previousStartDate, $lte: filters.endDate } };
    if (filters.device !== "All devices") match.device = filters.device;
    const records = await WebsiteAnalyticsDaily.find(match).sort({ date: 1 }).lean();
    res.set("Cache-Control", "private, no-store");
    return res.json({ success: true, data: report(records, filters) });
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
    return res.json({ success: true, imported: records.length });
  } catch (error) {
    console.error("Website analytics import failed:", error.message);
    return res.status(500).json({ success: false, message: "Could not import website analytics" });
  }
};
