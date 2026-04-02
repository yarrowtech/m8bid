// models/Fundraiser.js
const mongoose = require("mongoose");

const fundraiserSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    projectTitle: { type: String, required: true, trim: true },
    projectOverview: { type: String, required: true, trim: true },

    projectCategory: {
      type: String,
      enum: [
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
      ],
      required: true,
    },

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