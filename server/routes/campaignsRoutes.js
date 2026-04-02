// routes/campaignsRoutes.js
const express = require("express");
const { getAllCampaigns } = require("../controllers/campaign");

const router = express.Router();

// GET /api/campaigns
router.get("/", getAllCampaigns);

module.exports = router;