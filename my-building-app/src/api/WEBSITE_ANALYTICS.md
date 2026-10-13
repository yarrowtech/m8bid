# Website analytics frontend APIs

All functions live in `websiteAnalytics.js` and use the shared Axios client (`../lib/axiox`). Set `VITE_API_BASE_URL` to the backend base URL including `/api`. The existing client sends the admin bearer token. All endpoints are admin-only.

| Function | Method | Endpoint |
| --- | --- | --- |
| getSearchOverview | GET | /api/admin/website-analytics/search-overview |
| getSearchTrend | GET | /api/admin/website-analytics/search-trend |
| getTopPages | GET | /api/admin/website-analytics/top-pages |
| getSearchQueries | GET | /api/admin/website-analytics/queries |
| getVisitorOverview | GET | /api/admin/website-analytics/visitor-overview |
| getTrafficSources | GET | /api/admin/website-analytics/traffic-sources |
| getDeviceAnalytics | GET | /api/admin/website-analytics/devices |
| getEntryPages | GET | /api/admin/website-analytics/entry-pages |
| getExitPages | GET | /api/admin/website-analytics/exit-pages |
| getPageDetails | GET | /api/admin/website-analytics/page-details |
| syncWebsiteSearch | POST | /api/admin/website-analytics/sync-search |
| importWebsiteAnalytics | POST | /api/admin/website-analytics/import |
| getWebsiteAnalytics | GET | /api/admin/website-analytics (legacy combined report) |

GET functions accept `{ days, device, endDate, signal }`. Page details also requires `page`, e.g. `{ days: 28, device: "All devices", page: "/about" }`. Date/device filters are applied by the backend. Overview endpoints return `totals` and `comparison`; trend/table endpoints return `rows`; details return `page` or null. Every section includes reporting filters, coverage metadata, timezone, and update timestamp.

`getWebsiteAnalyticsSections(filters)` concurrently calls the nine dashboard section endpoints and combines successful results for rendering. Failures are listed in `sectionErrors`; no fictional values replace missing sections. Selecting a page makes a separate details request. Refresh, filter changes, and a successful sync refetch the dashboard sections. Table search/sorting/pagination and CSV export operate on the fetched rows in the browser; those controls do not require extra APIs.

`syncWebsiteSearch({ days: 7 })` updates recent finalized search data; `{ days: 60 }` performs an initial backfill. `importWebsiteAnalytics(records)` accepts validated source records as documented in `server/WEBSITE_ANALYTICS.md`. The import API has no new upload UI. Backend Google credentials and real visitor-source records are still required for live numbers.
