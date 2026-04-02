import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="rounded-3xl border bg-white shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-3xl font-bold mb-2">Payment Successful</h1>
        <p className="text-gray-600 mb-6">
          Your investment has been confirmed successfully.
        </p>

        <div className="text-left rounded-2xl bg-gray-50 border p-4 space-y-2 mb-6">
          <div><strong>Campaign:</strong> {state?.campaign?.title}</div>
          <div><strong>Amount:</strong> ₹{state?.amount}</div>
          <div><strong>Payment ID:</strong> {state?.paymentId}</div>
          <div><strong>Order ID:</strong> {state?.orderId}</div>
          <div><strong>Transfer ID:</strong> {state?.transferId || "Processing"}</div>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 rounded-full bg-black text-white hover:bg-gray-800"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;