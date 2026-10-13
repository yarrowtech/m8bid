const mongoose = require("mongoose");
module.exports = mongoose.model("KYC", new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  status: { type: String, enum: ["NONE", "PENDING", "VERIFIED", "REJECTED"], default: "NONE" },
  documents: { kyc: String, pan: String, addressProof: String, bankProof: String },
}, { timestamps: true }));
