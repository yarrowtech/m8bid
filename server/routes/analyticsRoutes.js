const express = require("express");
const { collectVisit } = require("../controllers/adminController/WebsiteAnalytics");

const router = express.Router();

// navigator.sendBeacon posts text/plain to stay a simple CORS request; parse it here.
router.post("/collect", express.text({ type: "*/*", limit: "4kb" }), collectVisit);

module.exports = router;
