import api from "../lib/axiox";

/* ---------------- Dashboard ---------------- */
export const getAdminDashboard = async (range = "7d") => {
  try {
    const response = await api.get(`/admin/dashboard?range=${range}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    throw error;
  }
};

/* ---------------- Users ---------------- */
export const getAdminUsers = async () => {
  try {
    const response = await api.get("/admin/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching admin users:", error);
    throw error;
  }
};

export const getAdminUserDetails = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin user details:", error);
    throw error;
  }
};

export const updateAdminUser = async (userId, payload) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating admin user:", error);
    throw error;
  }
};

/* ---------------- Campaigns ---------------- */
export const getAdminCampaigns = async () => {
  try {
    const response = await api.get("/admin/campaigns");
    return response.data;
  } catch (error) {
    console.error("Error fetching admin campaigns:", error);
    throw error;
  }
};

export const approveCampaign = async (campaignId) => {
  try {
    const response = await api.patch(`/admin/campaigns/${campaignId}/approve`);
    return response.data;
  } catch (error) {
    console.error("Error approving campaign:", error);
    throw error;
  }
};

export const rejectCampaign = async (campaignId) => {
  try {
    const response = await api.patch(`/admin/campaigns/${campaignId}/reject`);
    return response.data;
  } catch (error) {
    console.error("Error rejecting campaign:", error);
    throw error;
  }
};

export const deleteCampaign = async (campaignId) => {
  try {
    const response = await api.delete(`/admin/campaigns/${campaignId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting campaign:", error);
    throw error;
  }
};

/* ---------------- Transactions ---------------- */
export const getAdminTransactions = async () => {
  try {
    const response = await api.get("/admin/transactions");
    return response.data;
  } catch (error) {
    console.error("Error fetching admin transactions:", error);
    throw error;
  }
};

/* ---------------- Analytics ---------------- */
export const getAdminAnalytics = async () => {
  try {
    const response = await api.get("/admin/analytics");
    return response.data;
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    throw error;
  }
};