const DEVICES = ["Mobile", "Desktop", "Tablet"];
const REPORT_DAYS = [7, 28, 30, 90, 180, 365];
const searchKeys = ["clicks", "impressions", "positionWeight", "positionImpressions"];
const trafficKeys = ["entries", "exits", "views", "engaged", "engagementSeconds"];
const rate = (value, total) => total ? value / total * 100 : 0;
const dateOnly = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
const shift = (date, days) => new Date(Date.parse(`${date}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);

function parseFilters(query, now = new Date()) {
  const days = query.days === undefined ? 28 : Number(query.days);
  if (!REPORT_DAYS.includes(days)) throw new Error(`days must be one of ${REPORT_DAYS.join(", ")}`);
  const device = query.device || "All devices";
  if (device !== "All devices" && !DEVICES.includes(device)) throw new Error("Invalid device filter");
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const endDate = query.endDate || shift(today, -1);
  if (typeof endDate !== "string" || !dateOnly(endDate) || endDate >= today) throw new Error("endDate must be a valid completed date before today (YYYY-MM-DD)");
  return { days, device, startDate: shift(endDate, 1 - days), endDate, previousStartDate: shift(endDate, 1 - days * 2), previousEndDate: shift(endDate, -days) };
}

function sumMetrics(rows, dataset) {
  if (!rows.length) return {};
  const keys = dataset === "search" ? searchKeys : trafficKeys;
  const totals = Object.fromEntries(keys.map((key) => [key, 0]));
  for (const metrics of rows) {
    if (dataset === "search") {
      totals.clicks += metrics.clicks;
      totals.impressions += metrics.impressions;
      if (metrics.position !== null && metrics.position !== undefined) {
        totals.positionWeight += metrics.position * metrics.impressions;
        totals.positionImpressions += metrics.impressions;
      }
    } else for (const key of keys) totals[key] += metrics[key];
  }
  if (dataset === "search") return { clicks: totals.clicks, impressions: totals.impressions, ctr: rate(totals.clicks, totals.impressions), position: totals.positionImpressions ? totals.positionWeight / totals.positionImpressions : null };
  return { entries: totals.entries, exits: totals.exits, views: totals.views, engagementRate: rate(totals.engaged, totals.entries), engagementSeconds: totals.entries ? totals.engagementSeconds / totals.entries : 0, exitRate: rate(totals.exits, totals.views) };
}

function group(records, dataset, dimension) {
  const groups = new Map();
  for (const record of records) for (const row of record[dataset]?.[dimension] || []) {
    if (!groups.has(row.name)) groups.set(row.name, { title: row.title, rows: [] });
    groups.get(row.name).rows.push(row.metrics);
  }
  return [...groups].map(([name, value]) => ({ name, title: value.title || name, ...sumMetrics(value.rows, dataset) }));
}

function report(records, filters) {
  const current = records.filter((row) => row.date >= filters.startDate && row.date <= filters.endDate);
  const previous = records.filter((row) => row.date >= filters.previousStartDate && row.date <= filters.previousEndDate);
  const summarize = (rows) => ({ ...sumMetrics(rows.filter((row) => row.search).map((row) => row.search.totals), "search"), ...sumMetrics(rows.filter((row) => row.traffic).map((row) => row.traffic.totals), "traffic") });
  const searchPages = group(current, "search", "pages");
  const trafficPages = group(current, "traffic", "pages");
  const names = [...new Set([...searchPages, ...trafficPages].map((row) => row.name))];
  const pages = names.map((name) => ({ ...searchPages.find((row) => row.name === name), ...trafficPages.find((row) => row.name === name), name }));
  const status = (dataset) => {
    const available = current.filter((row) => row[dataset]);
    return { status: !available.length ? "unavailable" : available.length < filters.days * (filters.device === "All devices" ? DEVICES.length : 1) ? "partial" : "available", records: available.length, providers: [...new Set(available.map((row) => row[dataset].provider))] };
  };
  const daily = current.some((row) => row.search) ? Array.from({ length: filters.days }, (_, index) => {
    const name = shift(filters.startDate, index);
    const rows = current.filter((row) => row.date === name && row.search);
    return { name, clicks: null, impressions: null, ...sumMetrics(rows.map((row) => row.search.totals), "search") };
  }) : [];
  return {
    filters, totals: summarize(current), comparison: summarize(previous), daily, pages,
    queries: group(current, "search", "queries"), sources: group(current, "traffic", "sources"),
    devices: DEVICES.map((name) => ({ name, ...sumMetrics(current.filter((row) => row.device === name && row.traffic).map((row) => row.traffic.totals), "traffic") })).filter((row) => row.entries !== undefined),
    availability: { search: status("search"), traffic: status("traffic") },
    updatedAt: records.reduce((latest, row) => row.updatedAt && (!latest || new Date(row.updatedAt) > new Date(latest)) ? row.updatedAt : latest, null),
    timezone: "Asia/Kolkata",
  };
}

function validateImport(records) {
  if (!Array.isArray(records) || !records.length || records.length > 90) throw new Error("Supply between 1 and 90 daily records");
  const seen = new Set();
  for (const record of records) {
    if (!record || typeof record.date !== "string" || !dateOnly(record.date) || !DEVICES.includes(record.device)) throw new Error("Each record needs a valid date and device");
    const id = `${record.date}:${record.device}`;
    if (seen.has(id)) throw new Error("Duplicate date/device records in request");
    seen.add(id);
    if (!record.search && !record.traffic) throw new Error("Each record needs search or traffic data");
    for (const dataset of ["search", "traffic"]) {
      const source = record[dataset];
      if (!source) continue;
      if (!source.provider || typeof source.provider !== "string") throw new Error("A real source provider is required");
      const validateMetrics = (metrics) => {
        const keys = dataset === "search" ? ["clicks", "impressions"] : trafficKeys;
        if (!metrics || keys.some((key) => !Number.isFinite(metrics[key]) || metrics[key] < 0 || (key !== "engagementSeconds" && !Number.isInteger(metrics[key])))) throw new Error("Metrics must be nonnegative numbers; counts must be integers");
        if (dataset === "search" && (metrics.clicks > metrics.impressions || (metrics.position != null && (!Number.isFinite(metrics.position) || metrics.position < 0)))) throw new Error("Invalid search metrics");
        if (dataset === "traffic" && (metrics.engaged > metrics.entries || metrics.exits > metrics.views || metrics.entries > metrics.views)) throw new Error("Invalid traffic metrics");
      };
      validateMetrics(source.totals);
      for (const dimension of dataset === "search" ? ["pages", "queries"] : ["pages", "sources"]) {
        if (!Array.isArray(source[dimension]) || source[dimension].length > 1000) throw new Error("Each breakdown must be an array of at most 1000 rows");
        const names = new Set();
        for (const row of source[dimension]) {
          if (!row || typeof row.name !== "string" || !row.name.trim() || names.has(row.name)) throw new Error("Breakdown names must be nonempty and unique");
          if (dimension === "pages" && (!row.name.startsWith("/") || /[?#]/.test(row.name))) throw new Error("Page names must be paths without query strings or fragments");
          names.add(row.name); validateMetrics(row.metrics);
        }
        for (const key of dataset === "search" ? ["clicks", "impressions"] : ["entries", "exits", "views", "engaged", "engagementSeconds"]) {
          if (source[dimension].reduce((total, row) => total + row.metrics[key], 0) > source.totals[key]) throw new Error("Breakdown totals exceed the source total");
        }
      }
    }
  }
}
module.exports = { parseFilters, report, validateImport, REPORT_DAYS };
