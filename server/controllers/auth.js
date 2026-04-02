const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret", {
    expiresIn: "40h",
  });
};

const sanitizeUser = (user) => ({
  id: user._id,
  _id: user._id,
  username: user.username,
  name: user.name,
  email: user.email,
  role: user.role,
  profile: user.profile,
  access: user.access,
  activeMode: user.activeMode,
});

const registerUser = async (req, res) => {
  const {
    username,
    name,
    email,
    phone,
    password,
    accountMode,
    profileType,
  } = req.body;

  try {
    if (!username || !name || !email || !password || !accountMode) {
      return res.status(400).json({
        success: false,
        message:
          "username, name, email, password, and accountMode are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message:
          "An account with this email already exists. Please login to continue.",
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

    const safeProfileType = profileType || "individual";

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
          enabled: accountMode === "investor",
          type: accountMode === "investor" ? safeProfileType : "individual",
        },
        fundraiser: {
          enabled: accountMode === "fundraiser",
          type: accountMode === "fundraiser" ? safeProfileType : "individual",
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
  const { emailOrUsername, password, preferredMode } = req.body;

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

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (
      preferredMode &&
      ["investor", "fundraiser"].includes(preferredMode) &&
      user.access?.[preferredMode]?.enabled
    ) {
      user.activeMode = preferredMode;
      await user.save();
    }

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
    user: req.user,
  });
};

const enableAccessMode = async (req, res) => {
  const { mode, profileType } = req.body;

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
  const { mode } = req.body;

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

    if (!user.access?.[mode]?.enabled) {
      return res.status(403).json({
        success: false,
        message: `You do not have ${mode} access yet`,
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