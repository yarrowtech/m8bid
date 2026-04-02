import api from "../lib/axiox"; // use your existing axios instance file name

export const createInvestment = async (payload) => {
  try {
    const { data } = await api.post("/investments", payload);
    return data;
  } catch (error) {
    console.error("createInvestment error:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to create investment"
    );
  }
};

export const confirmInvestment = async (investmentId, payload) => {
  try {
    const { data } = await api.post(`/investments/${investmentId}/confirm`, payload);
    return data;
  } catch (error) {
    console.error("confirmInvestment error:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to confirm investment"
    );
  }
};

export const getMyInvestments = async () => {
  try {
    const { data } = await api.get("/investments/my");
    return data;
  } catch (error) {
    console.error("getMyInvestments error:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to fetch investments"
    );
  }
};