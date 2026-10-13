const entries = new Map();
let session = "";
const paths = ["/account/overview", "/auth/profile", "/contributor/profile", "/raiser/profile", "/contributions/my", "/investments/my"];
function currentSession() {
  const token = window.__BUILDING_AUTH_TOKEN || localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  if (session !== token) { entries.clear(); session = token; }
  return token;
}
export function readDashboardCache(path) {
  return currentSession() ? entries.get(path) : undefined;
}
export function cacheDashboardResponse(response) {
  const token = currentSession();
  const requestToken = response.config.headers?.Authorization;
  if (!token || requestToken !== `Bearer ${token}`) return;
  const path = response.config.url;
  if (response.config.method !== "get") { entries.clear(); return; }
  if (paths.includes(path) || /^\/raiser\/raiser\/[^/]+$/.test(path)) entries.set(path, response.data);
}
