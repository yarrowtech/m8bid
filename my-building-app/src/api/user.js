import api from "../lib/axiox";

export const loginUser = async (payload) => {
  try {
    const response = await api.post("/auth/login", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Login failed");
  }
};

export const registerUser = async (payload) => {
  try {
    const response = await api.post("/auth/register", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Registration failed");
  }
};

export const switchMode = async (payload) => {
  try {
    const response = await api.patch("/auth/switch-mode", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to switch mode");
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get("/auth/profile");
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to fetch profile");
  }
};

export const enableAccessMode = async (payload) => {
  try {
    const response = await api.patch("/auth/enable-access", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to enable access");
  }
};