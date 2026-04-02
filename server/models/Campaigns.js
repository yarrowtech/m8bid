const mongoose = require("mongoose");

const recentDonorSchema = new mongoose.Schema(
  {
    author: { type: String, default: "Anonymous" },
    amount: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    paidAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const investorEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    anonymous: { type: Boolean, default: false },
  },
  { _id: false }
);

const docSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    kind: {
      type: String,
      enum: ["LICENSE", "KYC", "PAN", "GST", "OTHER"],
      default: "OTHER",
    },
  },
  { _id: false }
);

const campaignSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "completed"],
      default: "pending",
      index: true,
    },

    projectTitle: { type: String, required: true, trim: true },
    projectOverview: { type: String, required: true, trim: true },

    projectCategory: {
      type: String,
      enum: ["Business", "Startup", "Company Growth"],
      required: true,
    },

    projectLocation: {
      state: { type: String, default: "" },
      city: { type: String, default: "" },
      country: { type: String, default: "" },
    },

    photo: { type: String, default: "" },
    video: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    gallery: { type: [String], default: [] },

    moneyToRaise: { type: Number, required: true, min: 0 },
    daysToRaise: { type: Number, required: true, min: 1 },

    fundingType: {
      type: String,
      enum: ["Profit Return", "Non-Profit Return"],
      required: true,
    },
    profitPercentage: { type: Number, default: 0, min: 0, max: 100 },

    deadline: { type: Date, default: null },

    moneyRaised: { type: Number, default: 0, min: 0 },
    raisedAmount: { type: Number, default: 0, min: 0 },

    // Payment-flow friendly aliases / fields
    currentFunding: { type: Number, default: 0, min: 0 },
    fundingGoal: { type: Number, default: 0, min: 0 },
    minInvestment: { type: Number, default: 1000, min: 0 },
    maxInvestment: { type: Number, default: 0, min: 0 },

    introduction: { type: String, required: true, trim: true },

    license: { type: String, default: "" },
    kyc: { type: String, default: "" },
    pan: { type: String, default: "" },

    documents: { type: [docSchema], default: [] },

    bankDetails: {
      bankName: { type: String, default: "" },
      accountHolderName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifsc: { type: String, default: "" },
      branch: { type: String, default: "" },
      upiId: { type: String, default: "" },
    },

    // Razorpay Route support
    razorpayLinkedAccountId: { type: String, default: "" },

    investors: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },

    investorEntries: { type: [investorEntrySchema], default: [] },

    recentDonors: { type: [recentDonorSchema], default: [] },

    totalInvestors: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

campaignSchema.pre("save", function (next) {
  if (typeof this.moneyRaised === "number") {
    this.raisedAmount = this.moneyRaised;
    this.currentFunding = this.moneyRaised;
  }

  if (typeof this.raisedAmount === "number") {
    this.moneyRaised = this.raisedAmount;
    this.currentFunding = this.raisedAmount;
  }

  if (!this.fundingGoal || this.fundingGoal === 0) {
    this.fundingGoal = this.moneyToRaise || 0;
  }

  if (this.deadline && this.status === "approved") {
    this.status = "active";
  }

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Campaigns", campaignSchema);