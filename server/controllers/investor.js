const User = require("../models/userSchema");
const { uploadToCloudinary } = require("../utils/cloudinary");

const uploadOptionalFile = async (files, field, folder, fallback = "") => {
  const file = files?.[field]?.[0];
  if (!file) return fallback;

  const uploaded = await uploadToCloudinary(file, folder);
  return uploaded?.secure_url || fallback;
};

const statusToLabel = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "VERIFIED") return "Verified";
  if (s === "REJECTED") return "Rejected";
  if (s === "PENDING") return "Pending Review";
  if (s === "NONE") return "Pending Review";
  return status || "Pending Review";
};

const getInvestorProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("INVESTOR PROFILE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch investor profile",
    });
  }
};

const updateInvestorKYC = async (req, res) => {
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

    user.access.investor.kycStatus = "PENDING";

    user.access.investor.details = {
      ...(user.access.investor.details || {}),
      aadhaarNumber,
      panNumber,
      addressProofType,
    };

    user.profile.addressLine = addressLine;
    user.profile.city = city;
    user.profile.state = state;
    user.profile.pincode = pincode;

    user.access.investor.documents = {
      ...(user.access.investor.documents || {}),
      kyc: await uploadOptionalFile(
        files,
        "identityProofFile",
        "investor/kyc",
        user.access.investor.documents?.kyc || ""
      ),
      pan: await uploadOptionalFile(
        files,
        "panCardFile",
        "investor/pan",
        user.access.investor.documents?.pan || ""
      ),
      addressProof: await uploadOptionalFile(
        files,
        "addressProofFile",
        "investor/address-proof",
        user.access.investor.documents?.addressProof || ""
      ),
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Investor KYC updated successfully",
      data: user,
    });
  } catch (err) {
    console.error("INVESTOR KYC UPDATE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update investor KYC",
    });
  }
};

const updateInvestorBank = async (req, res) => {
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

    user.access.investor.bankStatus = "PENDING";

    user.bankDetails = {
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      branchName,
    };

    user.access.investor.documents = {
      ...(user.access.investor.documents || {}),
      bankProof: await uploadOptionalFile(
        files,
        "bankProof",
        "investor/bank-proof",
        user.access.investor.documents?.bankProof || ""
      ),
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Investor bank details updated successfully",
      data: user,
    });
  } catch (err) {
    console.error("INVESTOR BANK UPDATE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update investor bank details",
    });
  }
};

const deleteInvestorDocument = async (req, res) => {
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

    const docs = user.access?.investor?.documents;
    if (!docs) {
      return res.status(400).json({
        success: false,
        message: "No investor document section found",
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

    if (type === "kyc" || type === "pan" || type === "addressProof") {
      user.access.investor.kycStatus = "NONE";
    }

    if (type === "bankProof") {
      user.access.investor.bankStatus = "NONE";
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `${type} deleted successfully`,
      data: user,
    });
  } catch (err) {
    console.error("INVESTOR DELETE DOCUMENT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to delete investor document",
    });
  }
};

module.exports = {
  getInvestorProfile,
  updateInvestorKYC,
  updateInvestorBank,
  deleteInvestorDocument,
};
