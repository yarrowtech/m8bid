// models/Fundraiser.js
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    kind: {
      type: String,
      enum: ["LICENSE", "KYC", "PAN", "GST", "OTHER"],
      default: "OTHER",
    },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const fundraiserSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    projectTitle: { type: String, required: true, trim: true },
    projectOverview: { type: String, required: true, trim: true },

    campaignType: { type: String, default: "" },
    campaignSubcategory: { type: String, default: "" },
    entityName: { type: String, default: "" },
    useOfFunds: { type: String, default: "" },

    projectCategory: { type: String, required: true, trim: true },

    projectLocation: {
      state: { type: String, default: "" },
      city: { type: String, default: "" },
      country: { type: String, default: "" },
    },

    photo: { type: String, default: "" },
    projectPhotos: { type: [String], default: [] },
    video: { type: String, default: "" },

    promoVideo: { type: String, default: "" },
    promoPoster: { type: String, default: "" },

    moneyToRaise: { type: Number, required: true, min: 0 },
    daysToRaise: { type: Number, required: true, min: 1 },

    fundingType: {
      type: String,
      enum: ["Profit Return", "Non-Profit Return"],
      required: true,
    },

    profitPercentage: { type: Number, default: 0 },

    deadline: { type: Date, default: null },

    introduction: { type: String, required: true, trim: true },

    license: { type: String, default: "" },
    gst: { type: String, default: "" },
    companyRegistration: { type: String, default: "" },
    legalDocument: { type: String, default: "" },
    documents: { type: [documentSchema], default: [] },
    documentProfile: { type: [mongoose.Schema.Types.Mixed], default: [] },



    raisedAmount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },

    promoteCampaign: { type: Boolean, default: false },
    promotion: { type: String, enum: ["yes", "no"], default: "no" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fundraiser", fundraiserSchema);
