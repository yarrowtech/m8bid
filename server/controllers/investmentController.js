const mongoose = require("mongoose");
const Investment = require("../models/Contribution");
const Campaign = require("../models/Fundraiser");
const Transaction = require("../models/Transaction");
const User = require("../models/userSchema");
const Notification = require("../models/Notification");
const { processPayout } = require("../services/contributionPayout");
const {
  createOrder,
  verifyPaymentSignature,
  fetchPayment,
} = require("../services/razorpayService");

const generateTxnId = () =>
  `TXN${Date.now()}${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const calculateFees = (amount) => {
  const gross = Number(amount);
  const feePercent = Number(process.env.PLATFORM_FEE_PERCENT || 5);
  if (!Number.isFinite(feePercent) || feePercent < 0 || feePercent > 100) throw new Error("Invalid platform fee configuration");
  const platformFee = Math.round(gross * feePercent) / 100;
  const netAmount = Math.round((gross - platformFee) * 100) / 100;

  return {
    gross,
    platformFee,
    netAmount,
    feePercent,
  };
};

// POST /api/investments
exports.createInvestment = async (req, res) => {
  try {
    const {
      campaignId,
      amount,
      paymentMethod = "razorpay",
      contributorName,
      contributorEmail,
      contributorPhone,
      anonymous = false,
    } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in again.",
      });
    }





    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: "Campaign ID is required",
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) < 1 || Number(amount) !== Number(Number(amount).toFixed(2)) || !Number.isSafeInteger(Math.round(Number(amount) * 100))) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const campaign = await Campaign.findById(campaignId).populate("userId");



    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    const campaignTitle = campaign.projectTitle || "Campaign";
    const fundraiserUser = campaign.userId;

    if (!fundraiserUser) {
      return res.status(400).json({
        success: false,
        message: "Campaign owner not found",
      });
    }

    if (!["approved", "active"].includes(campaign.status)) {
      return res.status(400).json({
        success: false,
        message: "Campaign is not active for contribution",
      });
    }

    if (campaign.deadline && new Date() > new Date(campaign.deadline)) {
      return res.status(400).json({
        success: false,
        message: "Campaign has already ended",
      });
    }

    const minInvestment = Number(campaign.minContribution || campaign.minInvestment || 1);
    const maxInvestment = Number(campaign.maxContribution || campaign.maxInvestment || 0);

    const currentFunding = Number(
      campaign.currentFunding || campaign.moneyRaised || campaign.raisedAmount || 0
    );

    const fundingGoal = Number(
      campaign.fundingGoal || campaign.moneyToRaise || 0
    );

    if (Number(amount) < minInvestment) {
      return res.status(400).json({
        success: false,
        message: `Minimum contribution is ₹${minInvestment}`,
      });
    }

    if (maxInvestment && Number(amount) > maxInvestment) {
      return res.status(400).json({
        success: false,
        message: `Maximum contribution is ₹${maxInvestment}`,
      });
    }

    if (fundingGoal && currentFunding + Number(amount) > fundingGoal) {
      const remaining = fundingGoal - currentFunding;

      return res.status(400).json({
        success: false,
        message: `Only ₹${remaining} remaining to reach goal`,
      });
    }

    let linkedAccountId =
      campaign.razorpayLinkedAccountId ||
      fundraiserUser?.razorpayLinkedAccountId ||
      "";

    const { platformFee, netAmount } = calculateFees(amount);
    const txnId = generateTxnId();

    const investment = await Investment.create({
      investor: req.user._id,
      campaign: campaignId,
      amount: Number(amount),
      paymentMethod,
      contributorName,
      contributorEmail,
      contributorPhone,
      anonymous,
      paymentStatus: "created",
      status: "pending",
      platformFee,
      netAmount,
      linkedAccountId,
    });

    const transaction = await Transaction.create({
      transactionId: txnId,
      user: req.user._id,
      type: "contribution",
      amount: Number(amount),
      fee: platformFee,
      netAmount,
      paymentMethod: "razorpay",
      campaign: campaignId,
      investment: investment._id,
      fundraiser: fundraiserUser._id || fundraiserUser,
      description: `Contribution to ${campaignTitle}`,
      status: "created",
      linkedAccountId,
    });

    const order = await createOrder({
      amount: Number(amount),
      receipt: txnId,
      notes: {
        investmentId: String(investment._id),
        campaignId: String(campaign._id),
        investorId: String(req.user._id),
        transactionId: txnId,
      },
    });

    investment.orderId = order.id;
    await investment.save();

    transaction.paymentGatewayResponse = order;
    transaction.orderId = order.id;
    await transaction.save();

    return res.status(201).json({
      success: true,
      message: "Contribution initiated",
      contributionId: investment._id,
      investmentId: investment._id,
      transactionId: txnId,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
      campaign: {
        id: campaign._id,
        title: campaignTitle,
      },
      payoutConfigured: Boolean(linkedAccountId),
      breakdown: {
        gross: Number(amount),
        platformFee,
        netAmount,
        linkedAccountIdConfigured: Boolean(linkedAccountId),
      },
      prefill: {
        name: contributorName || req.user.name || "",
        email: contributorEmail || req.user.email || "",
        contact: contributorPhone || req.user.phone || "",
      },
    });
  } catch (err) {
    console.error("createInvestment error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create contribution",
    });
  }
};

// Payment confirmation is committed atomically with funding progress and its ledger.
exports.confirmInvestment = async (req, res) => {
  let session;
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const inv = await Investment.findById(req.params.id);
    if (!inv) return res.status(404).json({ success: false, message: "Contribution not found" });
    if (String(inv.investor) !== String(req.user._id)) return res.status(403).json({ success: false, message: "Unauthorized contribution access" });
    if (inv.status === "confirmed" && inv.paymentStatus === "completed") {
      return res.json({ success: true, contribution: inv, investment: inv, message: "Contribution already confirmed" });
    }
    if (!razorpay_payment_id || inv.orderId !== razorpay_order_id || !verifyPaymentSignature(req.body)) {
      return res.status(400).json({ success: false, message: "Payment signature or order is invalid" });
    }
    const payment = await fetchPayment(razorpay_payment_id);
    if (payment?.status !== "captured" || payment.order_id !== inv.orderId || payment.currency !== "INR" || payment.amount !== Math.round(inv.amount * 100)) {
      return res.status(400).json({ success: false, message: "Payment amount, currency, order, or capture status does not match" });
    }
    session = await mongoose.startSession();
    let confirmed;
    await session.withTransaction(async () => {
      // A concurrent confirmation conflicts and retries, then observes completion.
      const current = await Investment.findById(inv._id).session(session);
      if (current.paymentStatus === "completed") { confirmed = current; return; }
      const reused = await Investment.findOne({ paymentId: razorpay_payment_id, _id: { $ne: inv._id } }).session(session);
      if (reused) throw new Error("Payment has already been used");
      current.paymentId = razorpay_payment_id;
      current.paymentStatus = "completed";
      current.status = "confirmed";
      await current.save({ session });
      const campaign = await Campaign.findByIdAndUpdate(current.campaign, { $inc: { raisedAmount: current.amount } }, { new: true, session });
      if (!campaign) throw new Error("Funding campaign not found");
      if (campaign.raisedAmount >= campaign.moneyToRaise) {
        campaign.status = "completed";
        await campaign.save({ session });
      }
      const supportedCampaigns = await Investment.distinct("campaign", { investor: current.investor, status: "confirmed", paymentStatus: "completed" }).session(session);
      await User.findByIdAndUpdate(current.investor, { $inc: { "contributorProfile.totalContributed": current.amount }, $set: { "contributorProfile.supportedCampaigns": supportedCampaigns.length } }, { session });
      await User.findByIdAndUpdate(campaign.userId, { $inc: { "fundraiserProfile.totalRaised": current.amount } }, { session });
      const ledger = await Transaction.findOneAndUpdate({ investment: current._id }, {
        status: "completed", type: "contribution", paymentGatewayId: razorpay_payment_id,
        paymentGatewayResponse: payment, processedAt: new Date(),
      }, { session });
      if (!ledger) throw new Error("Contribution ledger record is missing");
      await Notification.create([
        { user: current.investor, campaign: campaign._id, message: `Your contribution to ${campaign.projectTitle} is confirmed.` },
        { user: campaign.userId, campaign: campaign._id, message: `Your funding campaign ${campaign.projectTitle} received a contribution.` },
      ], { session });
      confirmed = current;
    });
    const payoutStatus = await processPayout(confirmed);
    return res.json({ success: true, contribution: confirmed, investment: confirmed, payment, payoutStatus, message: "Contribution confirmed." });
  } catch (err) {
    console.error("Contribution confirmation failed:", err.message);
    return res.status(500).json({ success: false, message: "Unable to confirm contribution. Please retry or contact support." });
  } finally { if (session) await session.endSession(); }
};

// GET /api/investments/my
exports.getMyInvestments = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in again.",
      });
    }

    const investments = await Investment.find({ investor: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "campaign",
        select:
          "projectTitle projectCategory moneyToRaise fundingGoal moneyRaised raisedAmount currentFunding deadline status photo imageUrl",
      });

    return res.status(200).json({
      success: true,
      count: investments.length,
      contributions: investments,
      investments,
    });
  } catch (err) {
    console.error("getMyInvestments error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch contributions",
    });
  }
};

// GET /api/investments/transactions/my
exports.getMyTransactions = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in again.",
      });
    }

    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "campaign",
        select: "projectTitle",
      })
      .populate({
        path: "investment",
        select: "amount paymentMethod",
      });

    // Format transactions for frontend
    const formattedTransactions = transactions.map((txn) => ({
      id: txn._id,
      transactionId: txn.transactionId,
      date: new Date(txn.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      campaign: txn.campaign?.projectTitle || "Unknown Campaign",
      amount: `₹${Number(txn.amount || 0).toLocaleString("en-IN")}`,
      method: txn.paymentMethod || "Unknown",
      status: txn.status === "completed" ? "Completed" : txn.status === "failed" ? "Failed" : "Pending",
      type: txn.type,
      description: txn.description,
    }));

    return res.status(200).json({
      success: true,
      count: formattedTransactions.length,
      transactions: formattedTransactions,
    });
  } catch (err) {
    console.error("getMyTransactions error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch transactions",
    });
  }
};
