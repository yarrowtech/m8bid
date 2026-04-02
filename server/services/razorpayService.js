const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const toPaise = (amount) => Math.round(Number(amount) * 100);

const createOrder = async ({
  amount,
  receipt,
  notes = {},
  currency = "INR",
}) => {
  const order = await razorpay.orders.create({
    amount: toPaise(amount),
    currency,
    receipt,
    payment_capture: 1,
    notes,
  });

  return order;
};

const verifyPaymentSignature = ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === razorpay_signature;
};

const fetchPayment = async (paymentId) => {
  return razorpay.payments.fetch(paymentId);
};

const createTransferFromPayment = async ({
  paymentId,
  linkedAccountId,
  amount,
  notes = {},
  onHold = false,
}) => {
  return razorpay.payments.transfer(paymentId, {
    transfers: [
      {
        account: linkedAccountId,
        amount: toPaise(amount),
        currency: "INR",
        notes,
        on_hold: onHold,
      },
    ],
  });
};

module.exports = {
  razorpay,
  createOrder,
  verifyPaymentSignature,
  fetchPayment,
  createTransferFromPayment,
  toPaise,
};