import axios from "axios";
import Cookies from "js-cookie";
import { cacheDashboardResponse } from "./dashboardCache";

let redirectingToLogin = false;

function expireSession() {
  Cookies.remove("token");
  window.__BUILDING_AUTH_TOKEN = "";
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of ["token", "user", "loggedInUser", "activeMode"]) {
      storage.removeItem(key);
    }
  }
  if (!redirectingToLogin) {
    redirectingToLogin = true;
    const loginPath = window.location.pathname.startsWith("/admin")
      ? "/admin/login"
      : "/login";
    if (window.location.pathname !== loginPath) window.location.replace(loginPath);
  }
}

function isTokenExpired(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch {
    // The server remains responsible for verifying malformed or invalid tokens.
    return false;
  }
}

function getAuthToken() {
  const runtimeToken =
    typeof window !== "undefined" ? window.__BUILDING_AUTH_TOKEN : "";
  const storedToken =
    runtimeToken ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    Cookies.get("token");

  if (storedToken) {
    if (typeof window !== "undefined") {
      window.__BUILDING_AUTH_TOKEN = storedToken;
    }
    localStorage.setItem("token", storedToken);
    sessionStorage.setItem("token", storedToken);
    if (Cookies.get("token") !== storedToken) {
      Cookies.set("token", storedToken, { expires: 7 });
    }
  }

  return storedToken || "";
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_WHITELIST = ["/auth/login", "/auth/register", "/contact/enquiry"]; // endpoints that don't need token
const PUBLIC_GET_ROUTES = ["/campaigns", "/raiser/all", "/raiser/campaigns", "/fundraiser/campaigns", "/raiser/campaigns"];

api.interceptors.request.use(
  (config) => {
    // Skip adding token for whitelisted endpoints
    const isAuthRoute = AUTH_WHITELIST.some((url) => config.url?.includes(url));
    if (isAuthRoute) {
      return config;
    }

    const isPublicGet = config.method === "get" &&
      PUBLIC_GET_ROUTES.some((route) => config.url?.startsWith(route));

    if (isPublicGet) {
      return config;
    }

    const token = getAuthToken();
    if (token && isTokenExpired(token)) {
      expireSession();
      const error = new Error("Your session has expired. Please log in again.");
      error.code = "TOKEN_EXPIRED";
      return Promise.reject(error);
    }

    // If no token and it's not an auth route, block the request
    if (!token) {
      return Promise.reject(new Error("No auth token found"));
    }

    config.headers.Authorization = `Bearer ${token}`;

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => { cacheDashboardResponse(response); return response; },
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      // Ignore a late response from a previous session after a fresh login.
      const currentToken = getAuthToken();
      if (currentToken && error.config.headers.Authorization === `Bearer ${currentToken}`) {
        expireSession();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
