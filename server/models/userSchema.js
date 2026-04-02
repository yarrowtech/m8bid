const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const documentStatusEnum = ["NONE", "PENDING", "VERIFIED", "REJECTED"];
const profileTypeEnum = ["individual", "company"];

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username can be at most 30 characters"],
      match: [
        /^[a-zA-Z0-9-_]+$/,
        "Username cannot contain special characters. Only letters, numbers, hyphens, and underscores are allowed.",
      ],
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Invalid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    profile: {
      phone: { type: String, default: "" },
      photo: { type: String, default: "" },
    },

    access: {
      investor: {
        enabled: { type: Boolean, default: false },
        type: {
          type: String,
          enum: profileTypeEnum,
          default: "individual",
        },
        kycStatus: {
          type: String,
          enum: documentStatusEnum,
          default: "NONE",
        },
        panStatus: {
          type: String,
          enum: documentStatusEnum,
          default: "NONE",
        },
        bankStatus: {
          type: String,
          enum: documentStatusEnum,
          default: "NONE",
        },
        documents: {
          pan: { type: String, default: "" },
          kyc: { type: String, default: "" },
          bankProof: { type: String, default: "" },
          gst: { type: String, default: "" },
          license: { type: String, default: "" },
          incorporation: { type: String, default: "" },
        },
      },

      fundraiser: {
        enabled: { type: Boolean, default: false },
        type: {
          type: String,
          enum: profileTypeEnum,
          default: "individual",
        },
        kycStatus: {
          type: String,
          enum: documentStatusEnum,
          default: "NONE",
        },
        panStatus: {
          type: String,
          enum: documentStatusEnum,
          default: "NONE",
        },
        bankStatus: {
          type: String,
          enum: documentStatusEnum,
          default: "NONE",
        },
        companyStatus: {
          type: String,
          enum: documentStatusEnum,
          default: "NONE",
        },
        documents: {
          pan: { type: String, default: "" },
          kyc: { type: String, default: "" },
          bankProof: { type: String, default: "" },
          gst: { type: String, default: "" },
          license: { type: String, default: "" },
          incorporation: { type: String, default: "" },
        },
      },
    },

    activeMode: {
      type: String,
      enum: ["investor", "fundraiser", "none"],
      default: "none",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    if (this.username) this.username = this.username.trim().toLowerCase();
    if (this.email) this.email = this.email.trim().toLowerCase();

    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);