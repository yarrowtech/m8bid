// controllers/fundraiser.js
const mongoose = require("mongoose");
const Fundraiser = require("../models/Fundraiser");
const { uploadToCloudinary } = require("../utils/cloudinary");

const ALLOWED_CATEGORIES = [
  "technology",
  "fintech",
  "education",
  "ecommerce",
  "manufacturing",
  "agriculture",
  "cleanenergy",
  "realestate",
  "hospitality",
  "transport",
  "food",
  "retail",
  "sports",
  "creative",
  "others",
];

const ALLOWED_FUNDING_TYPES = ["Profit Return", "Non-Profit Return"];

const toNum = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const toBool = (v) =>
  v === true || v === "true" || v === 1 || v === "1";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const uploadSingle = async (files, field, folder) => {
  const file = files?.[field]?.[0];
  if (!file) return "";
  const uploaded = await uploadToCloudinary(file, folder);
  return uploaded?.secure_url || "";
};

const uploadMany = async (files, field, folder) => {
  const arr = files?.[field] || [];
  if (!arr.length) return [];

  const uploadedUrls = [];
  for (const file of arr) {
    const uploaded = await uploadToCloudinary(file, folder);
    if (uploaded?.secure_url) uploadedUrls.push(uploaded.secure_url);
  }
  return uploadedUrls;
};

const createFundRaiser = async (req, res) => {
  try {
    const { id: userId } = req.params;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Valid user id is required",
      });
    }

    const files = req.files || {};

    const projectTitle = (req.body.projectTitle || "").trim();
    const projectOverview = (req.body.projectOverview || "").trim();
    const projectCategory = (req.body.projectCategory || "").trim();
    const fundingType = (req.body.fundingType || "").trim();
    const introduction = (req.body.introduction || "").trim();

    const moneyToRaise = toNum(req.body.moneyToRaise, 0);
    const daysToRaise = toNum(req.body.daysToRaise, 0);
    const profitPercentage =
      fundingType === "Profit Return"
        ? toNum(req.body.profitPercentage, 0)
        : 0;

    if (!projectTitle) {
      return res.status(400).json({
        success: false,
        message: "Project title is required",
      });
    }

    if (!projectOverview) {
      return res.status(400).json({
        success: false,
        message: "Project overview is required",
      });
    }

    if (!projectCategory || !ALLOWED_CATEGORIES.includes(projectCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project category",
      });
    }

    if (!ALLOWED_FUNDING_TYPES.includes(fundingType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid funding type",
      });
    }

    if (moneyToRaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "Money to raise must be greater than 0",
      });
    }

    if (daysToRaise < 1) {
      return res.status(400).json({
        success: false,
        message: "Days to raise must be at least 1",
      });
    }

    if (!introduction) {
      return res.status(400).json({
        success: false,
        message: "Introduction is required",
      });
    }

    if (fundingType === "Profit Return" && profitPercentage < 0) {
      return res.status(400).json({
        success: false,
        message: "Profit percentage cannot be negative",
      });
    }

    const payload = {
      userId,
      projectTitle,
      projectOverview,
      projectCategory,

      projectLocation: {
        state: (req.body.state || "").trim(),
        city: (req.body.city || "").trim(),
        country: (req.body.country || "").trim(),
      },

      moneyToRaise,
      daysToRaise,
      fundingType,
      profitPercentage,
      introduction,

   
      promotion: req.body.promotion === "yes" ? "yes" : "no",
      promoteCampaign: toBool(req.body.promoteCampaign),

      // better default for admin workflow
      status: "pending",
    };

    if (req.body.deadline) {
      const parsedDeadline = new Date(req.body.deadline);
      if (Number.isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid deadline",
        });
      }
      payload.deadline = parsedDeadline;
    } else {
      payload.deadline = new Date(
        Date.now() + daysToRaise * 24 * 60 * 60 * 1000
      );
    }

    // media uploads
    payload.photo = await uploadSingle(files, "photo", "fundraisers/photos");
    payload.projectPhotos = await uploadMany(
      files,
      "projectPhotos",
      "fundraisers/gallery"
    );
    payload.video = await uploadSingle(files, "video", "fundraisers/videos");
    payload.promoVideo = await uploadSingle(
      files,
      "promoVideo",
      "fundraisers/promo"
    );
    payload.promoPoster = await uploadSingle(
      files,
      "promoPoster",
      "fundraisers/promo"
    );

    // docs
    payload.license = await uploadSingle(files, "license", "fundraisers/docs");
    payload.gst = await uploadSingle(files, "gst", "fundraisers/docs");
    payload.companyRegistration = await uploadSingle(
      files,
      "companyRegistration",
      "fundraisers/docs"
    );
    payload.legalDocument = await uploadSingle(
      files,
      "legalDocument",
      "fundraisers/docs"
    );

    const created = await Fundraiser.create(payload);

    return res.status(201).json({
      success: true,
      message: "Fundraiser created successfully",
      fundraiser: created,
    });
  } catch (error) {
    console.error("Error creating fundraiser:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getFundraisersByUser = async (req, res) => {
  try {
    const { id: userId } = req.params;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Valid user id is required",
      });
    }

    const data = await Fundraiser.find({ userId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching fundraisers by user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAllFundraisers = async (req, res) => {
  try {
    const query = { status: "approved" };

    if (req.query.category && ALLOWED_CATEGORIES.includes(req.query.category)) {
      query.projectCategory = req.query.category;
    }

    const data = await Fundraiser.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching all fundraisers:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getFundraiserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid fundraiser id is required",
      });
    }

    const fundraiser = await Fundraiser.findById(id)
      .populate("userId", "name email")
      .lean();

    if (!fundraiser) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: fundraiser,
    });
  } catch (error) {
    console.error("Error fetching fundraiser by id:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteFundraiserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid fundraiser id is required",
      });
    }

    const fundraiser = await Fundraiser.findById(id);

    if (!fundraiser) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    await Fundraiser.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting fundraiser:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createFundRaiser,
  getFundraisersByUser,
  getAllFundraisers,
  getFundraiserById,
  deleteFundraiserById,
};