const Contribution = require("../models/Contribution");
const Transaction = require("../models/Transaction");
const User = require("../models/userSchema");
const { createTransferFromPayment } = require("./razorpayService");

async function processPayout(contribution) {
  const transaction = await Transaction.findOne({ investment: contribution._id });
  const owner = transaction && await User.findById(transaction.fundraiser);
  const linkedAccountId = contribution.linkedAccountId || owner?.razorpayLinkedAccountId;
  if (!linkedAccountId) return "pending";
  if (owner?.accountStatus === "disabled" || owner?.access?.fundraiser?.bankStatus !== "VERIFIED") return "pending";
  const claim = await Contribution.findOneAndUpdate({
    _id: contribution._id, paymentStatus: "completed", transferStatus: "pending",
    $or: [{ refundStatus: "none" }, { refundStatus: { $exists: false } }],
  }, { transferStatus: "processing", linkedAccountId }, { new: true });
  if (!claim) return contribution.transferStatus;
  try {
    const response = await createTransferFromPayment({ paymentId: claim.paymentId, linkedAccountId: claim.linkedAccountId, amount: claim.netAmount, notes: { contributionId: String(claim._id) } });
    const transfer = response?.items?.[0] || response?.transfers?.[0];
    const status = !transfer?.id ? "unknown" : transfer.status === "processed" ? "processed" : transfer.status === "failed" ? "failed" : "processing";
    await Contribution.findByIdAndUpdate(claim._id, { transferStatus: status, transferId: transfer?.id });
    await Transaction.findOneAndUpdate({ investment: claim._id }, { transferResponse: response, transferId: transfer?.id });
    if (transfer?.id) await Transaction.findOneAndUpdate({ transactionId: `PAYOUT${claim._id}` }, { $setOnInsert: {
      transactionId: `PAYOUT${claim._id}`, user: transaction.fundraiser, fundraiser: transaction.fundraiser,
      campaign: claim.campaign, investment: claim._id, type: "payout", amount: claim.netAmount,
      netAmount: claim.netAmount, status: status === "processed" ? "completed" : status === "failed" ? "failed" : "pending", transferId: transfer.id, processedAt: new Date(),
    } }, { upsert: true, runValidators: true });
    return status;
  } catch (error) {
    // An uncertain gateway response must be reconciled, never transferred again.
    await Contribution.findByIdAndUpdate(claim._id, { transferStatus: "unknown" });
    console.error("Contribution payout requires reconciliation:", error.message);
    return "unknown";
  }
}
module.exports = { processPayout };
