const express = require("express");

const {
  AdminDashboard,
  getAdminUsers,
  getAdminCampaigns,
  getAdminTransactions,
  getAdminAnalytics,
  getAdminUserDetails,
  approveCampaign,
  rejectCampaign,
  deleteCampaign,
} = require("../controllers/adminController/AdminDashboard.js");

const { decodeToken, isAdmin } = require("../middleware/authmiddleware.js");

const router = express.Router();

router.get("/dashboard", decodeToken, isAdmin, AdminDashboard);

router.get("/users", decodeToken, isAdmin, getAdminUsers);
router.get("/users/:userId", decodeToken, isAdmin, getAdminUserDetails);

router.get("/campaigns", decodeToken, isAdmin, getAdminCampaigns);
router.patch("/campaigns/:campaignId/approve", decodeToken, isAdmin, approveCampaign);
router.patch("/campaigns/:campaignId/reject", decodeToken, isAdmin, rejectCampaign);
router.delete("/campaigns/:campaignId", decodeToken, isAdmin, deleteCampaign);

router.get("/transactions", decodeToken, isAdmin, getAdminTransactions);
router.get("/analytics", decodeToken, isAdmin, getAdminAnalytics);

module.exports = router;