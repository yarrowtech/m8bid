const express = require("express");
const multer = require("multer");
const {
  createFundRaiser,
  getFundraisersByUser,
  getAllFundraisers,
  getFundraiserById,
  deleteFundraiserById,
  getFundraiserProfile,
  updateFundraiserKYC,
  updateFundraiserBank,
  deleteFundraiserDocument,
} = require("../controllers/fundraiser");
const { protect, requireFundraiser } = require("../middleware/authmiddleware");

const storage = multer.diskStorage({});
const upload = multer({ storage });

const fundRaiserRouter = express.Router();

/* =========================
   CREATE FUNDRAISER
========================= */
fundRaiserRouter.post(
  "/create-fundraiser/:id",
  protect,
  requireFundraiser,
  upload.any(),
  createFundRaiser
);

/* =========================
   FUNDRAISER / CAMPAIGNS
========================= */
fundRaiserRouter.get("/fundraiser/:id", getFundraisersByUser);
fundRaiserRouter.get("/all", getAllFundraisers);
fundRaiserRouter.get("/campaigns", getAllFundraisers);
fundRaiserRouter.get("/campaigns/:id", getFundraiserById);
fundRaiserRouter.delete("/campaigns/:id", deleteFundraiserById);

/* =========================
   PROFILE
========================= */
fundRaiserRouter.get("/profile", protect, getFundraiserProfile);

/* =========================
   KYC
========================= */
fundRaiserRouter.put(
  "/kyc",
  protect,
  upload.fields([
    { name: "identityProofFile", maxCount: 1 },
    { name: "panCardFile", maxCount: 1 },
    { name: "addressProofFile", maxCount: 1 },
  ]),
  updateFundraiserKYC
);

/* =========================
   BANK
========================= */
fundRaiserRouter.put(
  "/bank",
  protect,
  upload.fields([{ name: "bankProof", maxCount: 1 }]),
  updateFundraiserBank
);

/* =========================
   DELETE UPLOADED DOCUMENT
========================= */
fundRaiserRouter.delete("/document/:type", protect, deleteFundraiserDocument);

module.exports = fundRaiserRouter;
