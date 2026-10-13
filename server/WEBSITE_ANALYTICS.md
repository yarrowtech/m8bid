# Website analytics API

## Automatic Search Console import

The backend service is `services/searchConsole.js`. Enable the Google Search Console API in your Google Cloud project, create a service account, and give its email access to the exact Search Console property. Save its JSON credential file outside the repository. Copy the settings from `.env.analytics.example` into `server/.env`, using the actual credential path. Restart the backend.

Call `POST /api/admin/website-analytics/sync-search` with an admin bearer token and JSON `{ "days": 7 }`. Allowed windows are 7, 28, 30, and 60 days; use 60 for the first import to cover current and previous reporting periods. Optional `endDate` must be at least three days old in Pacific time. The sync returns the date range and number of imported date/device records. It updates search data while preserving traffic data. Requests can be long-running for initial imports; trigger this endpoint from a backend job or API client with an appropriate timeout. It does not run automatically on page visits. Schedule an authenticated daily call for ongoing updates. A process-local lock prevents overlapping runs in one server process; a multi-instance deployment needs a distributed job lock.

Google supplies Search Console dates in America/Los_Angeles. These are retained as provider dates; do not interpret them as India-local days. Recent dashboard days can remain unavailable until finalized data arrives. The service saves the top 1,000 page/query rows per day/device; those breakdowns are intentionally incomplete. Property-level totals remain independent of page totals, because Google can count impressions differently at those grains. Search Console query privacy limitations also mean query rows may not reconcile to headline totals. The manual import endpoint's stricter breakdown validation is intended for normalized records; this sync preserves Google's separate native aggregation grains.

Google authorization and API references: https://developers.google.com/identity/protocols/oauth2/service-account and https://developers.google.com/webmaster-tools/v1/searchanalytics/query.

Search Console only fills search metrics. Traffic, engagement, and exits still require a separate visitor analytics source; do not fabricate these from search clicks.

The admin page now requests `GET /api/admin/website-analytics` using its existing bearer token. Both reporting and import routes require an authenticated administrator. No generated demo values are returned.

Query parameters:

- `days`: 7, 28 (default), or 30.
- `device`: `All devices` (default), `Mobile`, `Desktop`, or `Tablet`.
- `endDate`: optional completed date in YYYY-MM-DD format. Defaults to yesterday in Asia/Kolkata.

The response has `success` and `data`. Data contains `filters`, `totals`, `comparison`, `daily`, `pages`, `queries`, `sources`, `devices`, `availability`, `updatedAt`, and `timezone`. Missing sources leave metrics absent instead of reporting false zeroes. Each source reports unavailable, partial, or available coverage. Stored records are daily per device; complete coverage requires a record for every selected date/device, including confirmed zero-traffic days. Missing dates are null gaps in charts.

## Loading real records

`POST /api/admin/website-analytics/import` accepts `{ "records": [...] }`. Import verified daily aggregates from your real search and visitor providers. The importer must normalize providers' reporting dates into the same reporting calendar; do not mix different date/timezone definitions. There is currently no automatic Google connection or visitor tracking script.

An example of the request shape (the numbers below are illustrative, not website measurements):

```json
{
  "records": [{
    "date": "2026-10-06",
    "device": "Mobile",
    "search": {
      "provider": "Google Search Console",
      "totals": { "clicks": 10, "impressions": 100, "position": 4 },
      "pages": [{ "name": "/", "title": "Homepage", "metrics": { "clicks": 10, "impressions": 100, "position": 4 } }],
      "queries": []
    },
    "traffic": {
      "provider": "Website analytics",
      "totals": { "entries": 20, "exits": 20, "views": 40, "engaged": 10, "engagementSeconds": 600 },
      "pages": [{ "name": "/", "title": "Homepage", "metrics": { "entries": 20, "exits": 20, "views": 40, "engaged": 10, "engagementSeconds": 600 } }],
      "sources": [{ "name": "Direct", "metrics": { "entries": 20, "exits": 20, "views": 40, "engaged": 10, "engagementSeconds": 600 } }]
    }
  }]
}
```

Send only source sections that are being updated. A traffic-only import preserves existing search data. Reimporting the same date/device replaces the provided source section, avoiding duplicate counts. Batches support 1–90 records; individual breakdowns support up to 1,000 rows and must fit the server's existing JSON body-size limit. Batch validation happens before writes; database failures during a bulk operation can still produce partial writes, so retry the idempotent batch.

Page names must be paths without query strings/fragments. Counts are nonnegative integers. Engagement seconds is the **total** duration, not an average. Position is the source average for that day/device, weighted by impressions when combining days. Search totals should come from provider totals rather than summing restricted query results; breakdowns may be incomplete but cannot exceed totals. Apply the source's agreed engagement definition consistently. Pages with no record in one source keep that source's metrics unavailable.

## Verification

Run `node --test tests/websiteAnalytics.test.js` from `server`. Tests cover date validation, weighted calculations, missing coverage, import validation, bearer/admin enforcement, persistence operations, and database error handling. Database operations are mocked; these tests do not access production data.
