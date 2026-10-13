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
    accountStatus: { type: String, enum: ["active", "disabled"], default: "active" },

kycStatus: { type: String, enum: documentStatusEnum, default: "NONE" },
fundraiserVerification: { type: String, enum: documentStatusEnum, default: "NONE" },
contributorProfile: {
  totalContributed: { type: Number, default: 0 },
  supportedCampaigns: { type: Number, default: 0 },
},
fundraiserProfile: {
  totalRaised: { type: Number, default: 0 },
  activeCampaigns: { type: Number, default: 0 },
},
savedCampaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Fundraiser" }],
profile: {
  phone: { type: String, default: "" },
  photo: { type: String, default: "" },
  addressLine: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  pincode: { type: String, default: "" },
},

bankDetails: {
  accountHolderName: { type: String, default: "" },
  bankName: { type: String, default: "" },
  accountNumber: { type: String, default: "" },
  ifscCode: { type: String, default: "" },
  branchName: { type: String, default: "" },
},

razorpayLinkedAccountId: {
  type: String,
  default: "",
},

access: {
  investor: {
    enabled: { type: Boolean, default: true },
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
    panStatus: { type: String, enum: documentStatusEnum, default: "NONE" },
    bankStatus: {
      type: String,
      enum: documentStatusEnum,
      default: "NONE",
    },
    details: {
      aadhaarNumber: { type: String, default: "" },
      panNumber: { type: String, default: "" },
      addressProofType: { type: String, default: "" },
    },
    documents: {
      kyc: { type: String, default: "" },
      pan: { type: String, default: "" },
      addressProof: { type: String, default: "" },
      bankProof: { type: String, default: "" },
    },
  },
  fundraiser: {
    enabled: { type: Boolean, default: true },
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

    details: {
      aadhaarNumber: { type: String, default: "" },
      panNumber: { type: String, default: "" },
      addressProofType: { type: String, default: "" },
    },

    documents: {
      pan: { type: String, default: "" },
      kyc: { type: String, default: "" },
      addressProof: { type: String, default: "" },
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
    this.role = this.role === "admin" ? "admin" : "user";
    this.access.investor.enabled = true;
    this.access.fundraiser.enabled = true;
    // Identity and bank verification belong to the account, not a dashboard.
    for (const field of ["kycStatus", "panStatus", "bankStatus", "details", "documents"]) {
      const source = this.isModified(`access.investor.${field}`) ? "investor"
        : this.isModified(`access.fundraiser.${field}`) ? "fundraiser" : null;
      if (!source) continue;
      const target = source === "investor" ? "fundraiser" : "investor";
      if (field === "documents") {
        for (const key of ["kyc", "pan", "addressProof", "bankProof"]) {
          this.set(`access.${target}.documents.${key}`, this.get(`access.${source}.documents.${key}`) || "");
        }
      } else this.set(`access.${target}.${field}`, this.get(`access.${source}.${field}`));
    }
    this.kycStatus = this.access.investor.kycStatus;
    this.fundraiserVerification = this.access.fundraiser.kycStatus;
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

userSchema.post("save", async function (user) {
  await require("./KYC").findOneAndUpdate({ user: user._id }, { $set: {
    status: user.kycStatus,
    documents: {
      kyc: user.access.investor.documents.kyc,
      pan: user.access.investor.documents.pan,
      addressProof: user.access.investor.documents.addressProof,
      bankProof: user.access.investor.documents.bankProof,
    },
  } }, { upsert: true });
});

module.exports = mongoose.model("User", userSchema);
