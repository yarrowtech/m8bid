import api from "../lib/axiox";

export const getDashboardData = async (userId) => {
  try {
    const response = await api.get(`/fundraiser/fundraiser/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to fetch dashboard data");
  }
};

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

export const getCampaignById = async (id) => {
  try {
    const response = await api.get(`/fundraiser/investment-detail/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to fetch campaign details");
  }
};

export const deleteFundraiserCampaign = async (id) => {
  try {
    const response = await api.delete(`/fundraiser/investment-detail/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to delete campaign");
  }
};