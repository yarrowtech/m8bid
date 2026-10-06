import api from "../lib/axiox";

export const getInvestorProfile = async () => {
  try {
    const response = await api.get("/contributor/profile");
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to fetch contributor profile");
  }
};

export const updateInvestorKYC = async (kycData) => {
  try {
    const response = await api.put("/contributor/kyc", kycData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to update contributor KYC");
  }
};

export const updateInvestorBank = async (bankData) => {
  try {
    const response = await api.put("/contributor/bank", bankData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to update contributor bank details");
  }
};

export const deleteInvestorDocument = async (type) => {
  try {
    const response = await api.delete(`/contributor/document/${type}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to delete contributor document");
  }
};
