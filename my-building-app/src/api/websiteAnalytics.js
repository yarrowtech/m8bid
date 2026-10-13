import api from "../lib/axiox";

async function fetchSection(section, { days = 28, device = "All devices", endDate, signal, page } = {}) {
  const response = await api.get(`/admin/website-analytics/${section}`, { params: { days, device, endDate, page }, signal });
  return response.data.data;
}

export const getSearchOverview = (filters) => fetchSection("search-overview", filters);
export const getSearchTrend = (filters) => fetchSection("search-trend", filters);
export const getTopPages = (filters) => fetchSection("top-pages", filters);
export const getSearchQueries = (filters) => fetchSection("queries", filters);
export const getVisitorOverview = (filters) => fetchSection("visitor-overview", filters);
export const getTrafficSources = (filters) => fetchSection("traffic-sources", filters);
export const getDeviceAnalytics = (filters) => fetchSection("devices", filters);
export const getEntryPages = (filters) => fetchSection("entry-pages", filters);
export const getExitPages = (filters) => fetchSection("exit-pages", filters);
export const getPageDetails = (filters) => fetchSection("page-details", filters);

// Fetch independent sections concurrently. Keep successful sections usable if one fails.
export async function getWebsiteAnalyticsSections(filters) {
  const functions = { searchOverview: getSearchOverview, trend: getSearchTrend, pages: getTopPages, queries: getSearchQueries, visitorOverview: getVisitorOverview, sources: getTrafficSources, devices: getDeviceAnalytics, entryPages: getEntryPages, exitPages: getExitPages };
  const entries = Object.entries(functions);
  const results = await Promise.allSettled(entries.map(([, fetch]) => fetch(filters)));
  if (filters?.signal?.aborted) throw new Error("Request cancelled");
  const firstSuccess = results.find((result) => result.status === "fulfilled");
  if (!firstSuccess) throw results[0].reason;
  const sections = {};
  const sectionErrors = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") sections[entries[index][0]] = result.value;
    else sectionErrors.push(`${entries[index][0]}: ${result.reason.response?.data?.message || "Could not load"}`);
  });
  const metadata = sections.searchOverview || firstSuccess.value;
  return {
    filters: metadata.filters, availability: metadata.availability, updatedAt: metadata.updatedAt,
    totals: { ...sections.searchOverview?.totals, ...sections.visitorOverview?.totals },
    comparison: { ...sections.searchOverview?.comparison, ...sections.visitorOverview?.comparison },
    daily: sections.trend?.rows || [], pages: sections.pages?.rows || [], queries: sections.queries?.rows || [],
    sources: sections.sources?.rows || [], devices: sections.devices?.rows || [],
    entryPages: sections.entryPages?.rows || [], exitPages: sections.exitPages?.rows || [], sectionErrors,
  };
}

// The shared client supplies the API base URL and admin bearer token.
export async function getWebsiteAnalytics({ days = 28, device = "All devices", endDate, signal } = {}) {
  const response = await api.get("/admin/website-analytics", {
    params: { days, device, endDate }, signal,
  });
  return response.data.data;
}

export async function syncWebsiteSearch({ days = 7, endDate, signal } = {}) {
  const response = await api.post("/admin/website-analytics/sync-search", { days, endDate }, {
    signal, timeout: 15 * 60 * 1000,
  });
  return response.data.data;
}

export async function importWebsiteAnalytics(records, { signal } = {}) {
  const response = await api.post("/admin/website-analytics/import", { records }, { signal });
  return response.data;
}
