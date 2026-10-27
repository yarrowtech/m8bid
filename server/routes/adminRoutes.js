const express = require("express");

const {
  AdminDashboard,
  getAdminUsers,
  getAdminCampaigns,
  getAdminTransactions,
  getAdminAnalytics,
  getAdminUserDetails,
  deleteAdminUser,
  approveCampaign,
  rejectCampaign,
  updateCampaignStatus,
  deleteCampaign,
  updateUserDocumentStatus,
  updateAdminUserOverview,
} = require("../controllers/adminController/AdminDashboard.js");

const { decodeToken, isAdmin } = require("../middleware/authmiddleware.js");

const router = express.Router();
const { getWebsiteAnalytics, importWebsiteAnalytics, syncWebsiteSearch } = require("../controllers/adminController/WebsiteAnalytics");
const { analyticsSections, getAnalyticsSection } = require("../controllers/adminController/WebsiteAnalytics");
for (const section of analyticsSections) {
  router.get(`/website-analytics/${section}`, decodeToken, isAdmin, getAnalyticsSection(section));
}
router.post("/website-analytics/sync-search", decodeToken, isAdmin, syncWebsiteSearch);
router.get("/website-analytics", decodeToken, isAdmin, getWebsiteAnalytics);
router.post("/website-analytics/import", decodeToken, isAdmin, importWebsiteAnalytics);

router.get("/dashboard", decodeToken, isAdmin, AdminDashboard);

router.get("/users", decodeToken, isAdmin, getAdminUsers);
router.get("/users/:userId", decodeToken, isAdmin, getAdminUserDetails);
router.put("/users/:userId", decodeToken, isAdmin, updateAdminUserOverview);
router.delete("/users/:userId", decodeToken, isAdmin, deleteAdminUser);
router.patch("/users/:userId/document-status", decodeToken, isAdmin, updateUserDocumentStatus);

router.get("/campaigns", decodeToken, isAdmin, getAdminCampaigns);
router.patch("/campaigns/:campaignId/approve", decodeToken, isAdmin, approveCampaign);
router.patch("/campaigns/:campaignId/reject", decodeToken, isAdmin, rejectCampaign);
router.patch("/campaigns/:campaignId/status", decodeToken, isAdmin, updateCampaignStatus);
router.delete("/campaigns/:campaignId", decodeToken, isAdmin, deleteCampaign);

router.get("/transactions", decodeToken, isAdmin, getAdminTransactions);
router.get("/analytics", decodeToken, isAdmin, getAdminAnalytics);

module.exports = router;
