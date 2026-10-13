const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  processingVersion: { type: Number, default: 0 },
  investor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Fundraiser' },
  amount: { type: Number, required: true, min: 1 },
  paymentMethod: { type: String, default: 'razorpay' },
  date: { type: Date, default: Date.now },
  orderId: { type: String },
  paymentId: { type: String },
  refundId: String,
  refundStatus: { type: String, enum: ["none", "processing", "processed", "failed", "unknown"], default: "none" },
  transferId: { type: String },
  linkedAccountId: { type: String },
  platformFee: { type: Number, default: 0 },
  netAmount: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ["created", "pending", "completed", "failed", "refunded"],
    default: "created",
  },
  transferStatus: {
    type: String,
    enum: ["pending", "processing", "processed", "failed", "unknown"],
    default: "pending",
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "failed", "refunded"],
    default: "pending",
  },
  contributorName: String,
  contributorEmail: String,
  contributorPhone: String,
  anonymous: { type: Boolean, default: false },
});

investmentSchema.index({ paymentId: 1 }, { unique: true, partialFilterExpression: { paymentId: { $type: "string", $gt: "" } } });
module.exports = mongoose.model('Investment', investmentSchema);
