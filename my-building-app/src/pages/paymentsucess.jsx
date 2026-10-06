import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
        <div className="mb-4 text-5xl">✅</div>
        <h1 className="mb-2 text-3xl font-bold">Payment Successful</h1>
        <p className="mb-6 text-gray-600">
          Your contribution has been confirmed successfully.
        </p>

        <div className="mb-6 space-y-2 rounded-2xl border bg-gray-50 p-4 text-left">
          <div>
            <strong>Campaign:</strong> {state?.campaign?.title || "Campaign"}
          </div>
          <div>
            <strong>Amount:</strong> ₹{state?.amount || 0}
          </div>
          <div>
            <strong>Platform Fee:</strong>{" "}
            {state?.breakdown?.platformFeePercent || 0}%
          </div>
          <div>
            <strong>Campaign Payout:</strong> ₹
            {state?.breakdown?.recipientAmount || 0}
          </div>
          <div>
            <strong>Payment ID:</strong> {state?.paymentId || "--"}
          </div>
          <div>
            <strong>Order ID:</strong> {state?.orderId || "--"}
          </div>
          <div>
            <strong>Transfer ID:</strong> {state?.transferId || "Processing"}
          </div>
          <div>
            <strong>Payout Status:</strong>{" "}
            {state?.payoutConfigured ? "Configured" : "Pending setup"}
          </div>
          {!state?.payoutConfigured ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Payment succeeded, but the raiser payout account is not yet
              linked for automated transfer. The transfer will stay pending
              until the Razorpay linked account is added.
            </p>
          ) : null}
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="rounded-full bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
