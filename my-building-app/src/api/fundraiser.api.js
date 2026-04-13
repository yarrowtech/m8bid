import api from "../lib/axiox";

/* =========================
   DASHBOARD
========================= */
export const getDashboardData = async (userId) => {
  try {
    const response = await api.get(`/fundraiser/fundraiser/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to fetch dashboard data");
  }
};

/* =========================
   CREATE FUNDRAISER
========================= */
export const createFundraiser = async (userId, fundraiserData) => {
  try {
    const response = await api.post(
      `/fundraiser/create-fundraiser/${userId}`,
      fundraiserData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to create fundraiser");
  }
};

/* =========================
   CAMPAIGNS
========================= */
export const getAllFundraisers = async () => {
  try {
    const response = await api.get("/fundraiser/all");
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to fetch fundraisers");
  }
};

export const getCampaigns = async () => {
  try {
    const response = await api.get("/fundraiser/campaigns");
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

export const deleteFundraiserCampaign = async (id) => {
  try {
    const response = await api.delete(`/fundraiser/campaigns/${id}`);
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
    const response = await api.put("/fundraiser/kyc", kycData, {
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
    const response = await api.put("/fundraiser/bank", bankData, {
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
    const response = await api.get("/fundraiser/profile");
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to fetch profile");
  }
};

export const deleteFundraiserDocument = async (type) => {
  try {
    const response = await api.delete(`/fundraiser/document/${type}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to delete document");
  }
};