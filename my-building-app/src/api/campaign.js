// src/api/campaign.js
import api from "../lib/axiox";

export const getAllCampaigns = async () => {
  const { data } = await api.get("/campaigns");
  return data; // { data: [...] }
};