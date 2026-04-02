const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  createInvestment,
  confirmInvestment,
  getMyInvestments,
} = require("../controllers/investmentController");

const { protect } = require("../middleware/authmiddleware");
const { handleValidationErrors } = require("../middleware/validation");

const investmentValidation = [
  body("campaignId").isMongoId().withMessage("Invalid campaign ID"),
  body("amount")
    .isNumeric()
    .isFloat({ min: 1000 })
    .withMessage("Minimum investment amount is ₹1,000"),
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
  investmentValidation,
  handleValidationErrors,
  createInvestment
);

router.get("/my", protect, getMyInvestments);
router.post("/:id/confirm", protect, confirmInvestment);

module.exports = router;