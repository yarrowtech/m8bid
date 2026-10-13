const express = require("express");
const mongoose = require("mongoose");
const { protect, isAdmin } = require("../middleware/authmiddleware");
const Contribution = require("../models/Contribution");
const Campaign = require("../models/Fundraiser");
const Transaction = require("../models/Transaction");
const User = require("../models/userSchema");
const Notification = require("../models/Notification");
const { refundPayment, fetchRefund } = require("../services/razorpayService");
const router = express.Router();
router.use(protect, isAdmin);
router.get("/", async (req, res) => {
  const contributions = await Contribution.find({}).populate("campaign", "projectTitle").populate("investor", "name email").sort({ date: -1 }).limit(500).lean();
  res.json({ success: true, contributions });
});

async function recordRefund(contribution, refund) {
  if (refund.payment_id !== contribution.paymentId || refund.amount !== Math.round(contribution.amount * 100) || refund.currency !== "INR") throw new Error("Refund does not match the contribution");
  const ledger = await Transaction.findOne({ investment: contribution._id, type: { $in: ["contribution", "investment"] } });
  if (!ledger) throw new Error("Original contribution ledger is missing");
  if (refund.status !== "processed") {
    const updated = await Contribution.findOneAndUpdate({ _id: contribution._id, refundStatus: { $ne: "processed" }, paymentStatus: { $ne: "refunded" } }, { refundId: refund.id, refundStatus: refund.status === "failed" ? "failed" : "processing" });
    if (!updated) return;
    await Transaction.findOneAndUpdate({ transactionId: `REFUND${contribution._id}` }, { $setOnInsert: {
      transactionId: `REFUND${contribution._id}`, user: contribution.investor, campaign: contribution.campaign,
      investment: contribution._id, fundraiser: ledger.fundraiser, type: "refund", amount: contribution.amount,
      netAmount: contribution.amount, status: refund.status === "failed" ? "failed" : "pending", paymentGatewayId: refund.id,
    } }, { upsert: true, runValidators: true });
    return;
  }
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const current = await Contribution.findById(contribution._id).session(session);
      if (current.refundStatus === "processed" || current.paymentStatus === "refunded") return;
      current.refundId = refund.id; current.refundStatus = "processed";
      current.paymentStatus = "refunded"; current.status = "refunded";
      await current.save({ session });
      const campaign = await Campaign.findByIdAndUpdate(current.campaign, { $inc: { raisedAmount: -current.amount } }, { new: true, session });
      if (!campaign) throw new Error("Funding campaign not found");
      if (campaign.status === "completed" && campaign.raisedAmount < campaign.moneyToRaise) { campaign.status = "approved"; await campaign.save({ session }); }
      const supported = await Contribution.distinct("campaign", { investor: current.investor, paymentStatus: "completed", status: "confirmed" }).session(session);
      await User.findByIdAndUpdate(current.investor, { $inc: { "contributorProfile.totalContributed": -current.amount }, $set: { "contributorProfile.supportedCampaigns": supported.length } }, { session });
      await User.findByIdAndUpdate(campaign.userId, { $inc: { "fundraiserProfile.totalRaised": -current.amount } }, { session });
      await Transaction.findByIdAndUpdate(ledger._id, { status: "refunded" }, { session });
      await Transaction.findOneAndUpdate({ transactionId: `REFUND${current._id}` }, {
        $setOnInsert: { transactionId: `REFUND${current._id}`, user: current.investor, campaign: current.campaign, investment: current._id, fundraiser: campaign.userId, type: "refund", amount: current.amount, netAmount: current.amount },
        $set: { status: "completed", paymentGatewayId: refund.id, paymentGatewayResponse: refund, processedAt: new Date() },
      }, { upsert: true, runValidators: true, session });
      await Notification.create([{ user: current.investor, campaign: current.campaign, message: `Your contribution to ${campaign.projectTitle} has been refunded.` }], { session });
    });
  } finally { await session.endSession(); }
}

router.post("/:id/refund", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid contribution ID" });
  const contribution = await Contribution.findById(req.params.id);
  if (!contribution) return res.status(404).json({ success: false, message: "Contribution not found" });
  if (contribution.refundStatus === "processed") return res.json({ success: true, status: "processed" });
  if (contribution.paymentStatus !== "completed" || contribution.status !== "confirmed") return res.status(409).json({ success: false, message: "Only confirmed contributions can be refunded" });
  if (contribution.refundId) return res.status(409).json({ success: false, message: "A refund already exists. Refresh its gateway status instead." });
  if (contribution.transferStatus && contribution.transferStatus !== "pending") return res.status(409).json({ success: false, message: "Transferred or uncertain payouts must be reconciled before a refund" });
  const claim = await Contribution.findOneAndUpdate({
    _id: contribution._id, paymentStatus: "completed", transferStatus: "pending",
    $or: [{ refundStatus: "none" }, { refundStatus: { $exists: false } }],
  }, { refundStatus: "processing" }, { new: true });
  if (!claim) return res.status(409).json({ success: false, message: "A refund or payout is already being processed" });
  try {
    const refund = await refundPayment({ paymentId: claim.paymentId, amount: claim.amount, receipt: `REFUND${claim._id}` });
    // Save the gateway reference before accounting, allowing safe reconciliation.
    await Contribution.findByIdAndUpdate(claim._id, { refundId: refund.id });
    await recordRefund(claim, refund);
    res.json({ success: true, status: refund.status });
  } catch (error) {
    await Contribution.findOneAndUpdate({ _id: claim._id, refundStatus: { $ne: "processed" } }, { refundStatus: "unknown" });
    res.status(502).json({ success: false, message: "Refund requires gateway reconciliation. Do not submit it again." });
  }
});
router.post("/:id/refund/reconcile", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid contribution ID" });
  const contribution = await Contribution.findById(req.params.id);
  if (!contribution?.refundId) return res.status(409).json({ success: false, message: "Check the payment gateway for the refund reference before reconciliation" });
  try { const refund = await fetchRefund(contribution.refundId); await recordRefund(contribution, refund); res.json({ success: true, status: refund.status }); }
  catch { res.status(502).json({ success: false, message: "Unable to reconcile refund" }); }
});
module.exports = router;
