// controllers/fundraiser.js
const mongoose = require("mongoose");
const Fundraiser = require("../models/Fundraiser");
const { uploadToCloudinary } = require("../utils/cloudinary");
const User = require("../models/userSchema");

const ALLOWED_FUNDING_TYPES = ["Profit Return", "Non-Profit Return"];
const ALLOWED_CAMPAIGN_TYPES = ["ngo", "business", "medical", "education", "company", "startup", "project"];
const ALLOWED_BUSINESS_VARIANTS = ["small-business", "food-business", "normal-business", "custom"];

const DOCUMENT_KIND_BY_FIELD = {
  ngoRegistration: "LICENSE",
  tradeLicence: "LICENSE",
  trustDeed: "OTHER",
  trustAgreement: "OTHER",
  ngoDetails: "OTHER",
  ownerNames: "OTHER",
  impactProof: "OTHER",

  businessRegistration: "LICENSE",
  businessAddressProof: "OTHER",
  businessDocuments: "OTHER",
  shopAddressProof: "OTHER",
  addressLicence: "LICENSE",
  hawkerLicence: "LICENSE",
  businessProof: "OTHER",
  foodLicence: "LICENSE",
  fireLicence: "LICENSE",
  placeLicence: "LICENSE",

  hospitalQuotation: "OTHER",
  prescription: "OTHER",
  healthRecord: "KYC",
  operationDocument: "OTHER",

  trademark: "OTHER",
  patent: "OTHER",
  registrationCertificate: "LICENSE",
  moa: "OTHER",
  aoa: "OTHER",
  pitchDeck: "OTHER",

  admissionLetter: "OTHER",
  feeStructure: "OTHER",
  academicProof: "OTHER",

  incorporationCertificate: "LICENSE",
  gstCertificate: "GST",
  financialStatement: "OTHER",
  boardResolution: "OTHER",

  projectProposal: "OTHER",
  estimateSheet: "OTHER",
  approvalLetter: "LICENSE",
  planBlueprint: "OTHER",

  supportingDocument: "OTHER",
  budgetEstimate: "OTHER",
  additionalProof: "OTHER",

  businessPlan: "OTHER",
  financialReport: "OTHER",
  doctorNote: "OTHER",
  hospitalEstimate: "OTHER",
  diagnosisReport: "OTHER",
  mvpProof: "OTHER",
  tractionProof: "OTHER",
};

const REQUIRED_DOCUMENTS = {
  ngo: ["ngoRegistration", "tradeLicence", "trustDeed", "trustAgreement", "ngoDetails", "ownerNames"],
  medical: ["hospitalQuotation", "prescription", "healthRecord"],
  education: ["admissionLetter", "feeStructure"],
  company: ["incorporationCertificate", "gstCertificate", "financialStatement"],
  startup: ["trademark", "tradeLicence", "registrationCertificate", "moa", "aoa"],
  project: ["projectProposal", "estimateSheet", "approvalLetter"],
  business: {
    default: ["businessRegistration", "businessAddressProof", "tradeLicence"],
    "small-business": ["shopAddressProof", "addressLicence", "businessProof"],
    "food-business": ["foodLicence", "fireLicence", "placeLicence"],
  },
};

const toNum = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toBool = (v) =>
  v === true || v === "true" || v === 1 || v === "1";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeFilesInput = (files) => {
  if (!files) return {};
  if (Array.isArray(files)) {
    return files.reduce((acc, file) => {
      if (!file?.fieldname) return acc;
      if (!acc[file.fieldname]) acc[file.fieldname] = [];
      acc[file.fieldname].push(file);
      return acc;
    }, {});
  }
  return files;
};

const getBusinessVariant = (value = "") => {
  const normalized = String(value).toLowerCase();
  if (normalized.includes("small")) return "small-business";
  if (normalized.includes("food")) return "food-business";
  return "normal-business";
};

const getRequiredDocuments = (campaignType, campaignSubcategory) => {
  if (campaignType === "business") {
    const variant = getBusinessVariant(campaignSubcategory);
    return REQUIRED_DOCUMENTS.business[variant] || REQUIRED_DOCUMENTS.business.default;
  }
  return REQUIRED_DOCUMENTS[campaignType] || [];
};

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

const uploadOptionalFile = async (files, field, folder, fallback = "") => {
  const file = files?.[field]?.[0];
  if (!file) return fallback;

  const uploaded = await uploadToCloudinary(file, folder);
  return uploaded?.secure_url || fallback;
};

const createFundRaiser = async (req, res) => {
  try {
    const { id: routeUserId } = req.params;
    const authenticatedUserId = req.user?._id?.toString();

    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in again.",
      });
    }

    if (
      routeUserId &&
      isValidObjectId(routeUserId) &&
      String(routeUserId) !== authenticatedUserId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only create a fundraiser for your own account",
      });
    }

    if (!isValidObjectId(authenticatedUserId)) {
      return res.status(400).json({
        success: false,
        message: "Valid user id is required",
      });
    }

    const files = normalizeFilesInput(req.files);

    const projectTitle = (req.body.projectTitle || "").trim();
    const projectOverview = (req.body.projectOverview || "").trim();
    const campaignType = (req.body.campaignType || "").trim().toLowerCase();
    const campaignSubcategory = (req.body.campaignSubcategory || "").trim();
    const projectCategory = (req.body.projectCategory || "").trim();
    const entityName = (req.body.entityName || "").trim();
    const useOfFunds = (req.body.useOfFunds || "").trim();
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

    if (!campaignType || !ALLOWED_CAMPAIGN_TYPES.includes(campaignType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign type",
      });
    }

    if (campaignType === "business") {
      const variant = getBusinessVariant(campaignSubcategory || projectCategory);
      if (!ALLOWED_BUSINESS_VARIANTS.includes(variant)) {
        return res.status(400).json({
          success: false,
          message: "Invalid business subcategory",
        });
      }
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

    if (!entityName) {
      return res.status(400).json({
        success: false,
        message: "Entity name is required",
      });
    }

    if (!useOfFunds) {
      return res.status(400).json({
        success: false,
        message: "Use of funds is required",
      });
    }

    if (fundingType === "Profit Return" && profitPercentage < 0) {
      return res.status(400).json({
        success: false,
        message: "Profit percentage cannot be negative",
      });
    }

    const requiredDocs = getRequiredDocuments(campaignType, campaignSubcategory || projectCategory);
    const missingRequiredDoc = requiredDocs.find((field) => !files?.[field]?.[0]);
    if (missingRequiredDoc) {
      return res.status(400).json({
        success: false,
        message: `Missing required document: ${missingRequiredDoc}`,
      });
    }

    const normalizedDocumentProfile = (() => {
      try {
        const parsed = JSON.parse(req.body.documentProfile || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();

    const resolvedProjectCategory =
      projectCategory ||
      `${campaignType.toUpperCase()} / ${campaignSubcategory || "General"}`;

    const payload = {
      userId: authenticatedUserId,
      projectTitle,
      projectOverview,
      campaignType,
      campaignSubcategory,
      entityName,
      useOfFunds,
      projectCategory: resolvedProjectCategory,

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
      documents: [],
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

    const docFiles = [];
    for (const [fieldName, fileList] of Object.entries(files)) {
      if (!DOCUMENT_KIND_BY_FIELD[fieldName]) continue;

      for (const file of fileList) {
        const uploaded = await uploadToCloudinary(file, "fundraisers/docs");
        const url = uploaded?.secure_url || "";
        if (!url) continue;

        docFiles.push({
          key: fieldName,
          name: file.originalname || file.fieldname || fieldName,
          url,
          kind: DOCUMENT_KIND_BY_FIELD[fieldName] || "OTHER",
          required: requiredDocs.includes(fieldName),
        });
      }
    }

    payload.documents = docFiles;
    payload.documentProfile = normalizedDocumentProfile;

    const aliasByPriority = {
      license: ["tradeLicence", "businessRegistration", "foodLicence", "shopAddressProof", "approvalLetter", "projectProposal"],
      gst: ["gstCertificate"],
      companyRegistration: ["registrationCertificate", "incorporationCertificate"],
      legalDocument: ["trustDeed", "trustAgreement", "moa", "aoa", "boardResolution", "operationDocument"],
    };

    for (const [alias, fields] of Object.entries(aliasByPriority)) {
      const match = docFiles.find((doc) => fields.includes(doc.key));
      if (match) payload[alias] = match.url;
    }

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

    if (req.query.category) {
      query.projectCategory = new RegExp(escapeRegex(req.query.category), "i");
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


const updateFundraiserKYC = async (req, res) => {
  try {
    const userId = req.user._id;
    const files = req.files || {};

    const {
      aadhaarNumber = "",
      panNumber = "",
      addressProofType = "",
      addressLine = "",
      city = "",
      state = "",
      pincode = "",
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.access.fundraiser.kycStatus = "PENDING";
    user.access.fundraiser.panStatus = panNumber ? "PENDING" : "NONE";

    user.access.fundraiser.details = {
      ...(user.access.fundraiser.details || {}),
      aadhaarNumber,
      panNumber,
      addressProofType,
    };

    user.profile.addressLine = addressLine;
    user.profile.city = city;
    user.profile.state = state;
    user.profile.pincode = pincode;

    user.access.fundraiser.documents.kyc = await uploadOptionalFile(
      files,
      "identityProofFile",
      "fundraiser/kyc",
      user.access.fundraiser.documents.kyc || ""
    );

    user.access.fundraiser.documents.pan = await uploadOptionalFile(
      files,
      "panCardFile",
      "fundraiser/pan",
      user.access.fundraiser.documents.pan || ""
    );

    user.access.fundraiser.documents.addressProof = await uploadOptionalFile(
      files,
      "addressProofFile",
      "fundraiser/address-proof",
      user.access.fundraiser.documents.addressProof || ""
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "KYC updated successfully",
      data: user,
    });
  } catch (err) {
    console.error("KYC UPDATE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update KYC",
    });
  }
};

const updateFundraiserBank = async (req, res) => {
  try {
    const userId = req.user._id;
    const files = req.files || {};

    const {
      accountHolderName = "",
      bankName = "",
      accountNumber = "",
      ifscCode = "",
      branchName = "",
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.access.fundraiser.bankStatus = "PENDING";

    user.bankDetails = {
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      branchName,
    };

    user.access.fundraiser.documents.bankProof = await uploadOptionalFile(
      files,
      "bankProof",
      "fundraiser/bank-proof",
      user.access.fundraiser.documents.bankProof || ""
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Bank details updated successfully",
      data: user,
    });
  } catch (err) {
    console.error("BANK UPDATE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update bank details",
    });
  }
};

const getFundraiserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const user = await User.findById(req.user._id);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

const deleteFundraiserDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const docs = user.access?.fundraiser?.documents;

    if (!docs) {
      return res.status(400).json({
        success: false,
        message: "No fundraiser document section found",
      });
    }

    const allowedTypes = ["kyc", "pan", "addressProof", "bankProof"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document type",
      });
    }

    docs[type] = "";

    if (type === "kyc") user.access.fundraiser.kycStatus = "NONE";
    if (type === "pan") user.access.fundraiser.panStatus = "NONE";
    if (type === "bankProof") user.access.fundraiser.bankStatus = "NONE";

    await user.save();

    return res.status(200).json({
      success: true,
      message: `${type} deleted successfully`,
      data: user,
    });
  } catch (err) {
    console.error("DELETE DOCUMENT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to delete document",
    });
  }
};

module.exports = {
  createFundRaiser,
  getFundraisersByUser,
  getAllFundraisers,
  getFundraiserById,
  deleteFundraiserById,
  getFundraiserProfile,
  updateFundraiserKYC,
  updateFundraiserBank,
  deleteFundraiserDocument
};
