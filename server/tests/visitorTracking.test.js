const { test } = require("node:test");
const assert = require("node:assert/strict");
const { parseHit, summarizeSessions, classifySource, deviceFromUserAgent, cleanPath, rollupTraffic } = require("../services/visitorTracking");
const { validateImport, report, parseFilters } = require("../services/websiteAnalytics");
const Session = require("../models/WebsiteVisitSession");
const Daily = require("../models/WebsiteAnalyticsDaily");

const session = (overrides) => ({
  device: "Mobile", source: "Direct", entryPage: "/", exitPage: "/", views: 1, engagementSeconds: 4,
  pages: [{ path: "/", title: "Home", views: 1, seconds: 4 }], ...overrides,
});

test("paths drop query strings, fragments and admin pages", () => {
  assert.equal(cleanPath("/raising?email=a@b.com#top"), "/raising");
  assert.equal(cleanPath("/how-to-contribute/"), "/how-to-contribute");
  assert.equal(cleanPath("/admin/users"), null);
  assert.equal(cleanPath("https://evil.example/"), null);
});

test("hits are validated before anything is stored", () => {
  assert.throws(() => parseHit('{"type":"pageview","sessionId":"x","path":"/"}'), /session id/);
  assert.throws(() => parseHit({ type: "delete", sessionId: "abcdefgh", path: "/" }), /hit type/);
  assert.throws(() => parseHit("not json"), SyntaxError);
  assert.equal(parseHit({ type: "engagement", sessionId: "abcdefgh", path: "/", seconds: 99999 }).seconds, 1800);
});

test("sources and devices are classified from referrer, UTM tags and user agent", () => {
  assert.equal(classifySource({ referrer: "https://www.google.com/", siteHost: "matebid.com" }), "Organic search");
  assert.equal(classifySource({ referrer: "https://l.instagram.com/", siteHost: "matebid.com" }), "Social");
  assert.equal(classifySource({ referrer: "https://matebid.com/raising", siteHost: "matebid.com" }), "Direct");
  assert.equal(classifySource({ referrer: "", siteHost: "matebid.com" }), "Direct");
  assert.equal(classifySource({ referrer: "https://news.example.org/a", siteHost: "matebid.com" }), "Referral");
  assert.equal(classifySource({ utmSource: "mailer", utmMedium: "email" }), "Email");
  assert.equal(deviceFromUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile"), "Mobile");
  assert.equal(deviceFromUserAgent("Mozilla/5.0 (iPad; CPU OS 17_0)"), "Tablet");
  assert.equal(deviceFromUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)"), "Desktop");
});

test("sessions roll up into valid daily traffic that the report reads back", () => {
  const traffic = summarizeSessions([
    session({ source: "Organic search", entryPage: "/", exitPage: "/raising", views: 3, engagementSeconds: 45, pages: [{ path: "/", title: "Home", views: 2, seconds: 20 }, { path: "/raising", title: "Raising", views: 1, seconds: 25 }] }),
    session({}),
    session({ views: 0, pages: [] }), // engagement-only leftovers are not visits
  ]);
  assert.deepEqual(traffic.totals, { entries: 2, exits: 2, views: 4, engaged: 1, engagementSeconds: 49 });
  const home = traffic.pages.find((row) => row.name === "/");
  assert.deepEqual(home.metrics, { entries: 2, exits: 1, views: 3, engaged: 1, engagementSeconds: 49 });
  assert.equal(traffic.pages.find((row) => row.name === "/raising").metrics.exits, 1);
  // Same rules the manual import enforces: engaged <= entries, exits <= views, breakdowns fit totals.
  assert.doesNotThrow(() => validateImport([{ date: "2026-10-20", device: "Mobile", traffic }]));

  const filters = parseFilters({ days: "7" }, new Date("2026-10-22T05:00:00Z"));
  const data = report([{ date: "2026-10-20", device: "Mobile", traffic }], filters);
  assert.equal(data.totals.entries, 2);
  assert.equal(data.totals.engagementRate, 50);
  assert.equal(data.sources.find((row) => row.name === "Organic search").entries, 1);
  assert.equal(data.availability.traffic.status, "partial");
});

test("rollup rebuilds changed completed days and fills untracked days with zeros", async (t) => {
  const writes = [];
  const lean = (value) => ({ sort: () => ({ lean: async () => value }), lean: async () => value });
  t.mock.method(Session, "findOne", () => lean({ date: "2026-10-19" }));
  t.mock.method(Session, "distinct", async () => ["2026-10-19"]);
  t.mock.method(Daily, "distinct", async () => ["2026-10-19"]);
  t.mock.method(Session, "find", ({ date }) => lean(date === "2026-10-19" ? [session({})] : []));
  t.mock.method(Daily, "updateOne", async (filter, update) => { writes.push([filter, update.$set.traffic.totals.entries]); });
  t.mock.method(Session, "updateMany", async () => ({}));

  const result = await rollupTraffic({ now: new Date("2026-10-21T06:00:00Z") }); // IST 2026-10-21
  assert.deepEqual(result.dates, ["2026-10-19", "2026-10-20"]);
  assert.equal(writes.length, 6); // 2 days x 3 devices
  assert.deepEqual(writes[0], [{ date: "2026-10-19", device: "Mobile" }, 1]);
  assert.ok(writes.filter(([filter]) => filter.date === "2026-10-20").every(([, entries]) => entries === 0));
});
