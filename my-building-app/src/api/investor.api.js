import api from "../lib/axiox";

export const getInvestorProfile = async () => {
  try {
    const response = await api.get("/investor/profile");
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to fetch investor profile");
  }
};

export const updateInvestorKYC = async (kycData) => {
  try {
    const response = await api.put("/investor/kyc", kycData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to update investor KYC");
  }
};

export const updateInvestorBank = async (bankData) => {
  try {
    const response = await api.put("/investor/bank", bankData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to update investor bank details");
  }
};

export const deleteInvestorDocument = async (type) => {
  try {
    const response = await api.delete(`/investor/document/${type}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to delete investor document");
  }
};
