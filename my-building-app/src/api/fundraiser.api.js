import api from "../lib/axiox";

/* =========================
   DASHBOARD
========================= */
export const getDashboardData = async (userId) => {
  try {
    const response = await api.get(`/raiser/raiser/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to fetch dashboard data");
  }
};

/* =========================
   CREATE RAISER
========================= */
export const createRaiser = async (userId, raiserData) => {
  try {
    const response = await api.post(
      `/raiser/create-raiser/${userId}`,
      raiserData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to create raiser");
  }
};

/* =========================
   CAMPAIGNS
========================= */
export const getAllRaisers = async () => {
  try {
    const response = await api.get("/raiser/all");
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to fetch raisers");
  }
};

export const getCampaigns = async () => {
  try {
    const response = await api.get("/raiser/campaigns");
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to fetch campaigns");
  }
};

/* 🔥 FIXED ROUTES (IMPORTANT) */
export const getCampaignById = async (id) => {
  try {
    const response = await api.get(`/fundraiser/campaigns/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to fetch campaign details");
  }
};

export const deleteRaiserCampaign = async (id) => {
  try {
    const response = await api.delete(`/raiser/campaigns/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to delete campaign");
  }
};

/* =========================
   🔥 NEW: KYC UPDATE
========================= */
export const updateKYC = async (kycData) => {
  try {
    const response = await api.put("/raiser/kyc", kycData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to update KYC");
  }
};

export const updateBank = async (bankData) => {
  try {
    const response = await api.put("/raiser/bank", bankData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to update bank details");
  }
};



/* =========================
   🔥 NEW: PROFILE FETCH
========================= */
export const getFundraiserProfile = async () => {
  try {
    const response = await api.get("/raiser/profile");
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to fetch profile");
  }
};

export const deleteRaiserDocument = async (type) => {
  try {
    const response = await api.delete(`/raiser/document/${type}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to delete document");
  }
};
