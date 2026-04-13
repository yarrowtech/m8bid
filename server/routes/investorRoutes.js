const express = require("express");
const multer = require("multer");
const {
  getInvestorProfile,
  updateInvestorKYC,
  updateInvestorBank,
  deleteInvestorDocument,
} = require("../controllers/investor");
const { protect, requireInvestor } = require("../middleware/authmiddleware");

const storage = multer.diskStorage({});
const upload = multer({ storage });
const investorRouter = express.Router();

investorRouter.get("/profile", protect, requireInvestor, getInvestorProfile);

investorRouter.put(
  "/kyc",
  protect,
  requireInvestor,
  upload.fields([
    { name: "identityProofFile", maxCount: 1 },
    { name: "panCardFile", maxCount: 1 },
    { name: "addressProofFile", maxCount: 1 },
  ]),
  updateInvestorKYC
);

investorRouter.put(
  "/bank",
  protect,
  requireInvestor,
  upload.fields([{ name: "bankProof", maxCount: 1 }]),
  updateInvestorBank
);

investorRouter.delete(
  "/document/:type",
  protect,
  requireInvestor,
  deleteInvestorDocument
);

module.exports = investorRouter;
