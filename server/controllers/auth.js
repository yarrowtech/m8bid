const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const { normalizeUser } = require("../utils/unifiedUser");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret", {
    expiresIn: "40h",
  });
};

const sanitizeUser = normalizeUser;

const registerUser = async (req, res) => {
  const {
    username,
    name,
    email,
    phone,
    password,
  } = req.body;

  try {
    if (!username || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Username, name, email, and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message:
          "This email is already in use. One email can only be used for one account, so please use a different email address.",
      });
    }

    const existingUsername = await User.findOne({
      username: normalizedUsername,
    });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    await User.create({
      username: normalizedUsername,
      name: name.trim(),
      email: normalizedEmail,
      password,
      profile: {
        phone: phone || "",
      },
      access: {
        investor: {
          enabled: true,
        },
        fundraiser: {
          enabled: true,
        },
      },
      activeMode: "none",
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please login to continue.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Error registering user",
    });
  }
};

const loginUser = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    const identity = (emailOrUsername || "").trim().toLowerCase();

    if (!identity || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/username and password are required",
      });
    }

    let user = null;

    if (identity.includes("@")) {
      user = await User.findOne({ email: identity });
    } else {
      user = await User.findOne({ username: identity });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.accountStatus === "disabled") {
      return res.status(403).json({ success: false, message: "This account has been disabled. Contact support." });
    }
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    user.role = user.role === "admin" ? "admin" : "user";
    user.access.investor.enabled = true;
    user.access.fundraiser.enabled = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: sanitizeUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error logging in user",
    });
  }
};

const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });
};

const enableAccessMode = async (req, res) => {
  const { profileType } = req.body;
  const mode = ({ contributor: "investor", raiser: "fundraiser" })[req.body.mode] || req.body.mode;

  try {
    if (!["investor", "fundraiser"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Mode must be investor or fundraiser",
      });
    }

    if (profileType && !["individual", "company"].includes(profileType)) {
      return res.status(400).json({
        success: false,
        message: "Profile type must be individual or company",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.access[mode].enabled = true;

    if (profileType) {
      user.access[mode].type = profileType;
    }

    user.activeMode = mode;

    await user.save();

    return res.status(200).json({
      success: true,
      message: `${mode} access enabled successfully`,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Enable access error:", error);
    return res.status(500).json({
      success: false,
      message: "Error enabling access",
    });
  }
};

const switchMode = async (req, res) => {
  const mode = ({ contributor: "investor", raiser: "fundraiser" })[req.body.mode] || req.body.mode;

  try {
    if (!["investor", "fundraiser"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Mode must be investor or fundraiser",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    user.activeMode = mode;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Switched to ${mode} mode`,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Switch mode error:", error);
    return res.status(500).json({
      success: false,
      message: "Error switching mode",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  enableAccessMode,
  switchMode,
};
