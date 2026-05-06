import api from "../lib/axiox";

export const sendContactEnquiry = async (payload) => {
  try {
    const response = await api.post("/contact/enquiry", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Failed to send enquiry");
  }
};
