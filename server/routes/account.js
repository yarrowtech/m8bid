const express = require("express");
const mongoose = require("mongoose");
const { protect } = require("../middleware/authmiddleware");
const Campaign = require("../models/Fundraiser");
const Contribution = require("../models/Contribution");
const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");
const User = require("../models/userSchema");
const { normalizeUser } = require("../utils/unifiedUser");
const router = express.Router();
router.use(protect);
router.get("/payouts", async (req, res) => {
  const campaigns = await Campaign.distinct("_id", { userId: req.user._id });
  const contributions = await Contribution.find({ campaign: { $in: campaigns }, paymentStatus: "completed" }).populate("campaign", "projectTitle").lean();
  const net = (entry) => Number(entry.netAmount || Math.max(0, entry.amount - (entry.platformFee || 0)));
  res.json({ success: true, contributions,
    totalPaid: contributions.filter((entry) => entry.transferStatus === "processed").reduce((sum, entry) => sum + net(entry), 0),
    pending: contributions.filter((entry) => entry.transferStatus !== "processed").reduce((sum, entry) => sum + net(entry), 0),
  });
});
router.post("/payouts/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid contribution ID" });
  const contribution = await Contribution.findById(req.params.id);
  if (!contribution || !await Campaign.exists({ _id: contribution.campaign, userId: req.user._id })) return res.status(404).json({ success: false, message: "Contribution not found for your funding campaign" });
  if (req.user.access?.fundraiser?.bankStatus !== "VERIFIED") return res.status(403).json({ success: false, message: "Verify your bank details before requesting a payout" });
  if (contribution.paymentStatus !== "completed") return res.status(409).json({ success: false, message: "Payment must be confirmed before payout" });
  const status = await require("../services/contributionPayout").processPayout(contribution);
  res.json({ success: true, status });
});
router.post("/campaigns/:id/updates", async (req, res) => {
  const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
  if (!mongoose.isValidObjectId(req.params.id) || !message || message.length > 2000) return res.status(400).json({ success: false, message: "A valid campaign and an update of up to 2000 characters are required" });
  const campaign = await Campaign.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $push: { updates: { message, date: new Date() } } }, { new: true });
  if (!campaign) return res.status(404).json({ success: false, message: "Your funding campaign was not found" });
  const supporters = await Contribution.distinct("investor", { campaign: campaign._id, paymentStatus: "completed" });
  if (supporters.length) await Notification.insertMany(supporters.map((user) => ({ user, campaign: campaign._id, message: `${campaign.projectTitle}: ${message}` })));
  res.json({ success: true, campaign });
});
router.patch("/security/password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: "Current password and a new password of at least 8 characters are required" });
  }
  const user = await User.findById(req.user._id);
  if (!await user.matchPassword(currentPassword)) return res.status(400).json({ success: false, message: "Current password is incorrect" });
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: "Password updated" });
});
router.get("/overview", async (req, res) => {
  try {
    const userId = req.user._id;
    const [campaigns, contributions, transactions, notifications, savedCampaigns] = await Promise.all([
      Campaign.find({ userId }).lean(),
      Contribution.find({ investor: userId }).populate("campaign", "projectTitle status deadline").lean(),
      Transaction.find({ $or: [{ user: userId }, { fundraiser: userId }] }).sort({ createdAt: -1 }).limit(10).populate("campaign", "projectTitle").lean(),
      Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(20).lean(),
      Campaign.find({ _id: { $in: req.user.savedCampaigns || [] }, status: { $in: ["approved", "completed"] } }).select("projectTitle status").lean(),
    ]);
    const confirmed = contributions.filter((entry) => entry.status === "confirmed" && entry.paymentStatus === "completed");
    const incoming = await Contribution.find({ campaign: { $in: campaigns.map((entry) => entry._id) }, paymentStatus: "completed" }).populate("investor", "name").populate("campaign", "projectTitle").sort({ date: -1 }).limit(20).lean();
    const receivedContributions = incoming.map((entry) => ({
      _id: entry._id, amount: entry.amount, date: entry.date,
      campaign: entry.campaign?.projectTitle, contributor: entry.anonymous ? "Anonymous" : entry.contributorName || entry.investor?.name || "Contributor",
    }));
    res.json({ success: true, data: {
      totalRaised: campaigns.reduce((sum, entry) => sum + Number(entry.raisedAmount || 0), 0),
      totalContributed: confirmed.reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
      activeCampaigns: campaigns.filter((entry) => entry.status === "approved" && (!entry.deadline || new Date(entry.deadline) > new Date())).length,
      supportedCampaigns: new Set(confirmed.map((entry) => String(entry.campaign?._id || entry.campaign))).size,
      campaigns, contributions, receivedContributions, transactions, notifications, savedCampaigns, user: normalizeUser(req.user),
    } });
  } catch (error) { res.status(500).json({ success: false, message: "Unable to load account overview" }); }
});
router.get("/saved-campaigns", async (req, res) => {
  const user = await User.findById(req.user._id).populate("savedCampaigns");
  res.json({ success: true, campaigns: user.savedCampaigns });
});
router.put("/saved-campaigns/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id) || !await Campaign.exists({ _id: req.params.id, status: { $in: ["approved", "completed"] } })) {
    return res.status(404).json({ success: false, message: "Funding campaign not found" });
  }
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedCampaigns: req.params.id } });
  res.json({ success: true });
});
router.delete("/saved-campaigns/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid campaign ID" });
  await User.findByIdAndUpdate(req.user._id, { $pull: { savedCampaigns: req.params.id } });
  res.json({ success: true });
});
router.patch("/notifications/:id/read", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid notification ID" });
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true });
  if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
  res.json({ success: true, notification });
});
module.exports = router;
