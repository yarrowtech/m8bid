import { useEffect, useRef } from "react";

// First-party page-view beacon feeding the admin Website Analytics traffic reports.
// Sends only the path (no query string), page title, referrer channel hints and visible time.
const ENDPOINT = `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "")}/analytics/collect`;
const SESSION_KEY = "mb_visit_session";
const SESSION_IDLE_MS = 30 * 60 * 1000;

const randomId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`);

// Sessions end after 30 idle minutes, like common analytics tools. Storage can be blocked.
function sessionId() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    const id = saved && Date.now() - saved.at < SESSION_IDLE_MS ? saved.id : randomId();
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id, at: Date.now() }));
    return { id, isNew: id !== saved?.id };
  } catch {
    return { id: (window.__mbSession ||= randomId()), isNew: false };
  }
}

function send(payload) {
  const body = JSON.stringify(payload);
  // text/plain keeps the beacon a simple cross-origin request (no preflight).
  if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "text/plain" }))) return;
  fetch(ENDPOINT, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
}

const excluded = (path) => path.startsWith("/admin");

export function useVisitorTracking(pathname) {
  const current = useRef({ path: null, visibleSince: null, seconds: 0 });

  useEffect(() => {
    const flush = () => {
      const page = current.current;
      if (!page.path) return;
      if (page.visibleSince) { page.seconds += (Date.now() - page.visibleSince) / 1000; page.visibleSince = document.visibilityState === "visible" ? Date.now() : null; }
      if (page.seconds >= 1) send({ type: "engagement", sessionId: sessionId().id, path: page.path, seconds: Math.round(page.seconds) });
      page.seconds = 0;
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else current.current.visibleSince = Date.now();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => { document.removeEventListener("visibilitychange", onVisibility); window.removeEventListener("pagehide", flush); };
  }, []);

  useEffect(() => {
    const page = current.current;
    if (page.path && page.path !== pathname) {
      if (page.visibleSince) page.seconds += (Date.now() - page.visibleSince) / 1000;
      if (page.seconds >= 1) send({ type: "engagement", sessionId: sessionId().id, path: page.path, seconds: Math.round(page.seconds) });
    }
    if (excluded(pathname)) { current.current = { path: null, visibleSince: null, seconds: 0 }; return; }
    if (page.path === pathname) return;
    const session = sessionId();
    const params = new URLSearchParams(window.location.search);
    // Wait a tick so route components can set document.title.
    setTimeout(() => send({
      type: "pageview", sessionId: session.id, path: pathname, title: document.title,
      ...(session.isNew ? { referrer: document.referrer, utmSource: params.get("utm_source") || undefined, utmMedium: params.get("utm_medium") || undefined } : {}),
    }), 300);
    current.current = { path: pathname, visibleSince: document.visibilityState === "visible" ? Date.now() : null, seconds: 0 };
  }, [pathname]);
}
