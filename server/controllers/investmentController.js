const Investment = require("../models/Investment");
const Campaign = require("../models/Fundraiser");
const Transaction = require("../models/Transaction");
const User = require("../models/userSchema");
const {
  createOrder,
  verifyPaymentSignature,
  fetchPayment,
  createTransferFromPayment,
} = require("../services/razorpayService");

const generateTxnId = () =>
  `TXN${Date.now()}${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const calculateFees = (amount) => {
  const gross = Number(amount);
  const feePercent = Number(process.env.PLATFORM_FEE_PERCENT || 5);
  const platformFee = Math.round(gross * feePercent * 100) / 100;
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

    console.log("Incoming createInvestment payload:", req.body);
    console.log("Incoming campaignId:", campaignId);
    console.log("Authenticated user:", req.user._id);

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: "Campaign ID is required",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const campaign = await Campaign.findById(campaignId).populate("userId");

    console.log("Found campaign:", campaign ? campaign._id : null);

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
        message: "Campaign is not active for investment",
      });
    }

    if (campaign.deadline && new Date() > new Date(campaign.deadline)) {
      return res.status(400).json({
        success: false,
        message: "Campaign has already ended",
      });
    }

    const minInvestment = Number(campaign.minInvestment || 1000);
    const maxInvestment = Number(campaign.maxInvestment || 0);

    const currentFunding = Number(
      campaign.currentFunding || campaign.moneyRaised || campaign.raisedAmount || 0
    );

    const fundingGoal = Number(
      campaign.fundingGoal || campaign.moneyToRaise || 0
    );

    if (Number(amount) < minInvestment) {
      return res.status(400).json({
        success: false,
        message: `Minimum investment is ₹${minInvestment}`,
      });
    }

    if (maxInvestment && Number(amount) > maxInvestment) {
      return res.status(400).json({
        success: false,
        message: `Maximum investment is ₹${maxInvestment}`,
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

    // local testing only
    // linkedAccountId = linkedAccountId || "acc_test_dummy";

    if (!linkedAccountId) {
      return res.status(400).json({
        success: false,
        message: "Fundraiser payout account is not configured yet",
      });
    }

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
      type: "investment",
      amount: Number(amount),
      fee: platformFee,
      netAmount,
      paymentMethod: "razorpay",
      campaign: campaignId,
      investment: investment._id,
      fundraiser: fundraiserUser._id || fundraiserUser,
      description: `Investment in ${campaignTitle}`,
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
      message: "Investment initiated",
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
      breakdown: {
        gross: Number(amount),
        platformFee,
        netAmount,
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
      message: err.message || "Failed to create investment",
    });
  }
};

// POST /api/investments/:id/confirm
exports.confirmInvestment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in again.",
      });
    }

    const inv = await Investment.findById(req.params.id).populate("campaign");

    if (!inv) {
      return res.status(404).json({
        success: false,
        message: "Investment not found",
      });
    }

    if (String(inv.investor) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this investment",
      });
    }

    if (inv.status === "confirmed" && inv.paymentStatus === "completed") {
      return res.status(200).json({
        success: true,
        message: "Investment already confirmed",
        investment: inv,
      });
    }

    if (inv.orderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Order mismatch",
      });
    }

    const isValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      await Transaction.findOneAndUpdate(
        { investment: inv._id },
        {
          status: "failed",
          failureReason: "Invalid Razorpay signature",
          processedAt: new Date(),
        }
      );

      inv.paymentStatus = "failed";
      inv.status = "failed";
      await inv.save();

      return res.status(400).json({
        success: false,
        message: "Signature verification failed",
      });
    }

    const payment = await fetchPayment(razorpay_payment_id);

    if (!payment || payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: "Payment is not captured",
      });
    }

    const transferResponse = await createTransferFromPayment({
      paymentId: razorpay_payment_id,
      linkedAccountId: inv.linkedAccountId,
      amount: inv.netAmount,
      notes: {
        investmentId: String(inv._id),
        campaignId: String(inv.campaign?._id),
        investorId: String(inv.investor),
      },
    });

    const transfer =
      transferResponse?.items?.[0] ||
      transferResponse?.transfers?.[0] ||
      null;

    inv.paymentId = razorpay_payment_id;
    inv.paymentStatus = "completed";
    inv.status = "confirmed";
    inv.transferId = transfer?.id || null;
    inv.transferStatus = transfer ? "processed" : "unknown";
    await inv.save();

    const camp = await Campaign.findById(inv.campaign?._id || inv.campaign);

    if (!camp) {
      return res.status(400).json({
        success: false,
        message: "Campaign linked to investment not found",
      });
    }

    const existingCurrent = Number(
      camp.currentFunding || camp.moneyRaised || camp.raisedAmount || 0
    );
    const newFunding = existingCurrent + Number(inv.amount || 0);

    camp.currentFunding = newFunding;
    camp.moneyRaised = newFunding;
    camp.raisedAmount = newFunding;
    camp.totalInvestors = Number(camp.totalInvestors || 0) + 1;

    if (!Array.isArray(camp.investors)) {
      camp.investors = [];
    }

    if (!camp.investors.some((id) => String(id) === String(inv.investor))) {
      camp.investors.push(inv.investor);
    }

    if (!Array.isArray(camp.recentDonors)) {
      camp.recentDonors = [];
    }

    camp.recentDonors.unshift({
      author: inv.anonymous ? "Anonymous" : req.user.name || "Investor",
      amount: Number(inv.amount || 0),
      userId: inv.investor,
      paidAt: new Date(),
    });

    if (camp.recentDonors.length > 20) {
      camp.recentDonors = camp.recentDonors.slice(0, 20);
    }

    const fundingGoal = Number(camp.fundingGoal || camp.moneyToRaise || 0);
    if (fundingGoal && newFunding >= fundingGoal) {
      camp.status = "completed";
    }

    await camp.save();

    await User.findByIdAndUpdate(inv.investor, {
      $inc: {
        "investorProfile.totalInvested": Number(inv.amount || 0),
        "investorProfile.activeInvestments": 1,
      },
    });

    await Transaction.findOneAndUpdate(
      { investment: inv._id },
      {
        status: "completed",
        paymentGatewayId: razorpay_payment_id,
        transferId: transfer?.id || null,
        paymentGatewayResponse: payment,
        transferResponse,
        processedAt: new Date(),
      }
    );

    return res.status(200).json({
      success: true,
      message: "Investment confirmed and payout transferred",
      investment: inv,
      payment,
      transfer: transfer || transferResponse,
    });
  } catch (err) {
    console.error("confirmInvestment error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to confirm investment",
    });
  }
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
          "projectTitle moneyToRaise fundingGoal moneyRaised raisedAmount currentFunding deadline status photo imageUrl",
      });

    return res.status(200).json({
      success: true,
      count: investments.length,
      investments,
    });
  } catch (err) {
    console.error("getMyInvestments error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch investments",
    });
  }
};