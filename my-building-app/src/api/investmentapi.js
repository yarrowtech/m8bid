import api from "../lib/axiox"; // use your existing axios instance file name

function getAuthHeader() {
  const cookieToken =
    typeof document !== "undefined"
      ? document.cookie
          .split(";")
          .map((part) => part.trim())
          .find((part) => part.startsWith("token="))
          ?.split("=")
          .slice(1)
          .join("=")
      : "";

  const token =
    (typeof localStorage !== "undefined" ? localStorage.getItem("token") : "") ||
    (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("token") : "") ||
    cookieToken ||
    "";

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const createContribution = async (payload) => {
  try {
    const { authToken, ...body } = payload || {};
    const headers = authToken
      ? { Authorization: `Bearer ${authToken}` }
      : getAuthHeader();

    const { data } = await api.post("/contributions", body, {
      headers,
    });
    return data;
  } catch (error) {
    console.error("createContribution error:", error);
    const validationErrors = error?.response?.data?.errors;
    const validationMessage =
      Array.isArray(validationErrors) && validationErrors.length > 0
        ? validationErrors.map((item) => item.message).join(", ")
        : "";
    throw new Error(
      validationMessage ||
        error?.response?.data?.message ||
        "Failed to create contribution"
    );
  }
};

export const confirmContribution = async (contributionId, payload) => {
  try {
    const { authToken, ...body } = payload || {};
    const headers = authToken
      ? { Authorization: `Bearer ${authToken}` }
      : getAuthHeader();

    const { data } = await api.post(`/contributions/${contributionId}/confirm`, body, {
      headers,
    });
    return data;
  } catch (error) {
    console.error("confirmContribution error:", error);
    const validationErrors = error?.response?.data?.errors;
    const validationMessage =
      Array.isArray(validationErrors) && validationErrors.length > 0
        ? validationErrors.map((item) => item.message).join(", ")
        : "";
    throw new Error(
      validationMessage ||
        error?.response?.data?.message ||
        "Failed to confirm contribution"
    );
  }
};

export const getMyInvestments = async () => {
  try {
    const { data } = await api.get("/contributions/my", {
      headers: getAuthHeader(),
    });
    return data;
  } catch (error) {
    console.error("getMyInvestments error:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to fetch contributions"
    );
  }
};

export const getMyTransactions = async () => {
  try {
    const { data } = await api.get("/contributions/transactions/my", {
      headers: getAuthHeader(),
    });
    return data;
  } catch (error) {
    console.error("getMyTransactions error:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to fetch transactions"
    );
  }
};
