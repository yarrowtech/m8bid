const Session = require("../models/WebsiteVisitSession");
const Daily = require("../models/WebsiteAnalyticsDaily");

const PROVIDER = "Matebid visitor tracking";
const DEVICES = ["Mobile", "Desktop", "Tablet"];
const MAX_VIEWS_PER_SESSION = 500;
const MAX_SECONDS_PER_HIT = 1800;
const ENGAGED_SECONDS = 10; // A session is engaged after 10s of visible time or 2+ page views.
const BOT_PATTERN = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|axios/i;
const SEARCH_HOSTS = /(^|\.)(google|bing|yahoo|duckduckgo|yandex|baidu|ecosia)\./;
const SOCIAL_HOSTS = /(^|\.)(facebook|fb|instagram|linkedin|lnkd|twitter|x|t|youtube|whatsapp|wa|reddit|pinterest|telegram)\.(com|co|me|in|org)$/;

const istDate = (date = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
const shift = (date, days) => new Date(Date.parse(`${date}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);

function deviceFromUserAgent(userAgent = "") {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(userAgent)) return "Tablet";
  if (/Mobi|iPhone|iPod|Android|IEMobile|Opera Mini/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

// Paths only: query strings and fragments can carry personal data.
function cleanPath(value) {
  if (typeof value !== "string" || !value.startsWith("/")) return null;
  const path = value.split(/[?#]/)[0].replace(/\/{2,}/g, "/").slice(0, 300);
  const trimmed = path.length > 1 ? path.replace(/\/$/, "") : path;
  return trimmed.startsWith("/admin") ? null : trimmed;
}

function classifySource({ referrer, utmSource, utmMedium, siteHost }) {
  const medium = String(utmMedium || "").toLowerCase();
  if (utmSource) {
    if (/email|newsletter/.test(medium)) return "Email";
    if (/cpc|ppc|paid|ads?/.test(medium)) return "Paid campaigns";
    return "Campaigns";
  }
  let host = "";
  try { host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, ""); } catch { return "Direct"; }
  if (!host || host === siteHost) return "Direct";
  if (SEARCH_HOSTS.test(host)) return "Organic search";
  if (SOCIAL_HOSTS.test(host)) return "Social";
  return "Referral";
}

function parseHit(body) {
  const hit = typeof body === "string" ? JSON.parse(body || "{}") : body || {};
  if (typeof hit.sessionId !== "string" || !/^[A-Za-z0-9-]{8,64}$/.test(hit.sessionId)) throw new Error("Invalid session id");
  if (!["pageview", "engagement"].includes(hit.type)) throw new Error("Invalid hit type");
  const path = cleanPath(hit.path);
  if (!path) throw new Error("Invalid or excluded path");
  const seconds = Math.min(MAX_SECONDS_PER_HIT, Math.max(0, Number(hit.seconds) || 0));
  const title = typeof hit.title === "string" ? hit.title.slice(0, 200) : undefined;
  return { ...hit, path, title, seconds };
}

async function recordHit(hit, options = {}) {
  try { return await applyHit(hit, options); }
  catch (error) {
    // Two first hits of one session can race to create it; the retry updates the winner.
    if (error.code === 11000) return applyHit(hit, options);
    throw error;
  }
}

async function applyHit(hit, { userAgent = "", siteHost = "", now = new Date() } = {}) {
  if (BOT_PATTERN.test(userAgent)) return { ignored: "bot" };
  let session = await Session.findOne({ sessionId: hit.sessionId });
  if (!session) {
    if (hit.type !== "pageview") return { ignored: "unknown session" };
    session = new Session({
      sessionId: hit.sessionId, date: istDate(now), device: deviceFromUserAgent(userAgent),
      source: classifySource({ referrer: hit.referrer, utmSource: hit.utmSource, utmMedium: hit.utmMedium, siteHost }),
      entryPage: hit.path, exitPage: hit.path, pages: [],
    });
  }
  if (session.views >= MAX_VIEWS_PER_SESSION && hit.type === "pageview") return { ignored: "view limit" };
  let page = session.pages.find((entry) => entry.path === hit.path);
  if (!page) { session.pages.push({ path: hit.path, title: hit.title, views: 0, seconds: 0 }); page = session.pages[session.pages.length - 1]; }
  if (hit.title) page.title = hit.title;
  if (hit.type === "pageview") { page.views += 1; session.views += 1; session.exitPage = hit.path; }
  else { page.seconds += hit.seconds; session.engagementSeconds += hit.seconds; }
  session.lastSeenAt = now;
  session.rolledUp = false;
  await session.save();
  return { recorded: true };
}

const emptyMetrics = () => ({ entries: 0, exits: 0, views: 0, engaged: 0, engagementSeconds: 0 });
const isEngaged = (session) => session.engagementSeconds >= ENGAGED_SECONDS || session.views >= 2;

// Converts one day of sessions for one device into the WebsiteAnalyticsDaily traffic shape.
// Entry-based page/source rows carry the session's engagement so averages read per entrance.
function summarizeSessions(sessions) {
  const totals = emptyMetrics();
  const pages = new Map();
  const sources = new Map();
  const row = (map, name, title) => {
    if (!map.has(name)) map.set(name, { name, ...(title ? { title } : {}), metrics: emptyMetrics() });
    return map.get(name).metrics;
  };
  for (const session of sessions) {
    if (!session.views) continue;
    const engaged = isEngaged(session) ? 1 : 0;
    const seconds = Math.round(session.engagementSeconds);
    for (const metrics of [totals, row(sources, session.source)]) {
      metrics.entries += 1; metrics.exits += 1; metrics.views += session.views; metrics.engaged += engaged; metrics.engagementSeconds += seconds;
    }
    for (const page of session.pages) row(pages, page.path, page.title).views += page.views;
    const entry = row(pages, session.entryPage);
    entry.entries += 1; entry.engaged += engaged; entry.engagementSeconds += seconds;
    row(pages, session.exitPage).exits += 1;
  }
  const top = (map) => [...map.values()].sort((a, b) => b.metrics.views - a.metrics.views).slice(0, 1000);
  return { provider: PROVIDER, totals, pages: top(pages), sources: top(sources) };
}

let running = null;

// Rebuilds traffic for completed days that changed since the last rollup, and fills
// tracked days with no visits as confirmed zeros so coverage reads "available".
async function rollupTraffic({ now = new Date() } = {}) {
  if (running) return running;
  running = (async () => {
    const startedAt = now;
    const today = istDate(now);
    const first = await Session.findOne({}, { date: 1 }).sort({ date: 1 }).lean();
    if (!first || first.date >= today) return { dates: [] };
    const dirty = await Session.distinct("date", { rolledUp: false, date: { $lt: today } });
    const covered = new Set(await Daily.distinct("date", { date: { $gte: first.date, $lt: today }, "traffic.provider": PROVIDER }));
    const dates = new Set(dirty);
    for (let date = first.date; date < today; date = shift(date, 1)) if (!covered.has(date)) dates.add(date);
    for (const date of [...dates].sort()) {
      const sessions = await Session.find({ date }).lean();
      for (const device of DEVICES) {
        const traffic = summarizeSessions(sessions.filter((session) => session.device === device));
        await Daily.updateOne({ date, device }, { $set: { traffic } }, { upsert: true, runValidators: true });
      }
      await Session.updateMany({ date, lastSeenAt: { $lte: startedAt } }, { $set: { rolledUp: true } });
    }
    return { dates: [...dates].sort() };
  })().finally(() => { running = null; });
  return running;
}

module.exports = { parseHit, recordHit, rollupTraffic, summarizeSessions, classifySource, deviceFromUserAgent, cleanPath, PROVIDER };
