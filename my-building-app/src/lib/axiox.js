import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_WHITELIST = ["/auth/login", "/auth/register", "/contact/enquiry"]; // endpoints that don't need token
const PUBLIC_GET_ROUTES = ["/campaigns", "/fundraiser/all", "/fundraiser/campaigns"];

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");

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
      return Promise.reject(new Error("No token found in cookies"));
    }

    config.headers.Authorization = `Bearer ${token}`;

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
