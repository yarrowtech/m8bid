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
const { protect } = require("../middleware/authmiddleware");

const storage = multer.diskStorage({});
const upload = multer({ storage });

const fundRaiserRouter = express.Router();

/* =========================
   CREATE FUNDRAISER
========================= */
fundRaiserRouter.post(
  "/create-fundraiser/:id",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "projectPhotos", maxCount: 10 },
    { name: "video", maxCount: 1 },
    { name: "promoVideo", maxCount: 1 },
    { name: "promoPoster", maxCount: 1 },
    { name: "license", maxCount: 1 },
    { name: "gst", maxCount: 1 },
    { name: "companyRegistration", maxCount: 1 },
    { name: "legalDocument", maxCount: 1 },
  ]),
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