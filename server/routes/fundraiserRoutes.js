const express = require("express");
const multer = require("multer");
const {
  createFundRaiser,
  getFundraisersByUser,
  getAllFundraisers,
  getFundraiserById,
  deleteFundraiserById,
} = require("../controllers/fundraiser");

const storage = multer.diskStorage({});
const upload = multer({ storage });

const fundRaiserRouter = express.Router();

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

fundRaiserRouter.get("/fundraiser/:id", getFundraisersByUser);
fundRaiserRouter.get("/all", getAllFundraisers);
fundRaiserRouter.get("/campaigns", getAllFundraisers);

// new routes
fundRaiserRouter.get("/campaigns/:id", getFundraiserById);
fundRaiserRouter.delete("/campaigns/:id", deleteFundraiserById);

module.exports = fundRaiserRouter;