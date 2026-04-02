const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      default: null,
      index: true,
    },

    investment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Investment",
      default: null,
      index: true,
    },

    fundraiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "investment",
        "refund",
        "payout",
        "platform_fee",
        "transfer_reversal",
        "other",
      ],
      required: true,
      default: "investment",
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    netAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "razorpay",
        "upi",
        "card",
        "netbanking",
        "wallet",
        "bank_transfer",
        "other",
      ],
      default: "razorpay",
      index: true,
    },

    paymentGatewayId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },

    orderId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },

    transferId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },

    refundId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },

    linkedAccountId: {
      type: String,
      trim: true,
      default: null,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    status: {
      type: String,
      enum: ["created", "pending", "completed", "failed", "cancelled", "refunded"],
      default: "created",
      index: true,
    },

    paymentGatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    transferResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    refundResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    processedAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      trim: true,
      default: "",
    },

    isReconciled: {
      type: Boolean,
      default: false,
    },

    reconciledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ campaign: 1, createdAt: -1 });
transactionSchema.index({ investment: 1, createdAt: -1 });
transactionSchema.index({ status: 1, type: 1 });
transactionSchema.index({ paymentGatewayId: 1 });
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ transferId: 1 });

transactionSchema.pre("save", function (next) {
  if (this.netAmount === undefined || this.netAmount === null) {
    this.netAmount = Math.max(0, Number(this.amount || 0) - Number(this.fee || 0));
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);