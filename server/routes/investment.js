const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  createInvestment,
  confirmInvestment,
  getMyInvestments,
  getMyTransactions,
} = require("../controllers/investmentController");

const { protect, requireVerifiedIdentity } = require("../middleware/authmiddleware");
const { handleValidationErrors } = require("../middleware/validation");

const investmentValidation = [
  body("campaignId").isMongoId().withMessage("Invalid campaign ID"),
  body("amount")
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage("Minimum contribution amount is Rs 1 for testing"),
  body("paymentMethod")
    .optional()
    .isIn(["razorpay"])
    .withMessage("Only razorpay is supported right now"),
  body("contributorEmail").optional().isEmail().withMessage("Invalid email"),
  body("contributorPhone")
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage("Invalid phone number"),
];

router.post(
  "/",
  protect,
  requireVerifiedIdentity,
  investmentValidation,
  handleValidationErrors,
  createInvestment
);

router.get("/my", protect, getMyInvestments);
router.get("/transactions/my", protect, getMyTransactions);
router.get("/:id/receipt", protect, async (req, res) => {
  const mongoose = require("mongoose");
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid contribution ID" });
  const contribution = await require("../models/Contribution").findOne({ _id: req.params.id, investor: req.user._id, paymentStatus: "completed" }).populate("campaign", "projectTitle");
  if (!contribution) return res.status(404).json({ success: false, message: "Confirmed contribution not found" });
  const escape = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  res.type("html").send(`<!doctype html><html><head><meta charset="utf-8"><title>MateBid Contribution Receipt</title></head><body><h1>MateBid Contribution Receipt</h1><p>Contributor: ${escape(req.user.name)}</p><p>Funding Campaign: ${escape(contribution.campaign?.projectTitle)}</p><p>Contribution Amount: INR ${contribution.amount.toFixed(2)}</p><p>Payment ID: ${escape(contribution.paymentId)}</p><p>Order ID: ${escape(contribution.orderId)}</p><p>Payment Status: Confirmed</p><p>Receipt ID: ${contribution._id}</p></body></html>`);
});
router.post("/:id/confirm", protect, confirmInvestment);

module.exports = router;
