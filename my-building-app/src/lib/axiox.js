import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_WHITELIST = ["/auth/login", "/auth/register"]; // endpoints that don't need token

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");

    // Skip adding token for whitelisted endpoints
    const isAuthRoute = AUTH_WHITELIST.some((url) => config.url?.includes(url));
    if (isAuthRoute) {
      return config;
    }

    // If no token and it's not an auth route, block the request
    if (!token) {
      return Promise.reject(new Error("No token found in cookies"));
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
