const express = require("express");
const { sendEnquiry } = require("../controllers/contact");

const router = express.Router();

router.post("/enquiry", sendEnquiry);

module.exports = router;
