const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  orderId: { type: String },
paymentId: { type: String },
transferId: { type: String },
linkedAccountId: { type: String },
platformFee: { type: Number, default: 0 },
netAmount: { type: Number, default: 0 },
paymentStatus: {
  type: String,
  enum: ["created", "pending", "completed", "failed"],
  default: "created",
},
transferStatus: {
  type: String,
  enum: ["pending", "processed", "failed", "unknown"],
  default: "pending",
},
status: {
  type: String,
  enum: ["pending", "confirmed", "cancelled", "failed"],
  default: "pending",
},
contributorName: String,
contributorEmail: String,
contributorPhone: String,
anonymous: { type: Boolean, default: false },


});

module.exports = mongoose.model('Investment', investmentSchema);
