import axios from "axios";
import Cookies from "js-cookie";

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
const PUBLIC_GET_ROUTES = ["/campaigns", "/raiser/all", "/raiser/campaigns"];

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

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
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
