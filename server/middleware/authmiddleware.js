const jwt = require("jsonwebtoken");
const User = require("../models/userSchema.js");

const decodeToken = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    );

    const userId = decoded?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.accountStatus === "disabled") {
      return res.status(401).json({ success: false, message: "This account has been disabled. Contact support." });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Your session has expired. Please log in again.",
      });
    }
    if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid session. Please log in again.",
      });
    }
    console.error("Token verification failed:", error);

    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

const protect = decodeToken;

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied, admin only",
    });
  }

  next();
};

const requireAccess = (mode) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    next();
  };
};

const requireInvestor = requireAccess("investor");
const requireFundraiser = requireAccess("fundraiser");

const requireVerifiedIdentity = (req, res, next) => {
  const status = req.user?.kycStatus || req.user?.access?.investor?.kycStatus || req.user?.access?.fundraiser?.kycStatus;
  if (status !== "VERIFIED") return res.status(403).json({ success: false, code: "VERIFICATION_REQUIRED", message: "Complete your account identity verification before contributing funds" });
  next();
};

const requireInvestorVerification = (req, res, next) => {
  const investor = req.user?.access?.investor;

  if (!investor) {
    return res.status(403).json({
      success: false,
      code: "ACCESS_NOT_ENABLED",
      message: "You need an investor account to continue",
    });
  }

  if (
    investor.kycStatus !== "VERIFIED" ||
    investor.panStatus !== "VERIFIED" ||
    investor.bankStatus !== "VERIFIED"
  ) {
    return res.status(403).json({
      success: false,
      code: "INVESTOR_VERIFICATION_REQUIRED",
      message: "Complete investor KYC, PAN, and bank verification first",
    });
  }

  next();
};

const requireFundraiserVerification = (req, res, next) => {
  const fundraiser = req.user?.access?.fundraiser;

  if (!fundraiser) {
    return res.status(403).json({
      success: false,
      code: "ACCESS_NOT_ENABLED",
      message: "You need a fundraiser account to continue",
    });
  }

  if (
    fundraiser.kycStatus !== "VERIFIED" ||
    fundraiser.panStatus !== "VERIFIED" ||
    fundraiser.bankStatus !== "VERIFIED"
  ) {
    return res.status(403).json({
      success: false,
      code: "FUNDRAISER_VERIFICATION_REQUIRED",
      message: "Complete fundraiser KYC, PAN, and bank verification first",
    });
  }

  if (
    fundraiser.type === "company" &&
    fundraiser.companyStatus !== "VERIFIED"
  ) {
    return res.status(403).json({
      success: false,
      code: "COMPANY_VERIFICATION_REQUIRED",
      message: "Company verification is required for company fundraiser accounts",
    });
  }

  next();
};

module.exports = {
  decodeToken,
  protect,
  isAdmin,
  requireInvestor,
  requireFundraiser,
  requireVerifiedIdentity,
  requireInvestorVerification,
  requireFundraiserVerification,
};
