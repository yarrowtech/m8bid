import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createContribution, confirmContribution } from "../api/investmentapi";
import { loadRazorpayScript } from "../../utils/loadRazorpay";
import Cookies from "js-cookie";

const PRESETS = [2, 10, 50];

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const campaign = state?.campaign;
  const routeToken = state?.authToken || "";
  const initialAmount = Number(state?.amount || state?.suggestedAmount || campaign?.minContribution || 2);

  const [amount, setAmount] = useState(Number.isFinite(initialAmount) && initialAmount > 0 ? initialAmount : 2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = useMemo(() => Number(amount || 0), [amount]);
  const platformFeePercent = useMemo(() => {
    const rawPercent =
      state?.platformFeePercent ??
      campaign?.platformFeePercent ??
      campaign?.feePercent ??
      5;

    const parsed = Number(rawPercent);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 5;
  }, [campaign?.feePercent, campaign?.platformFeePercent, state?.platformFeePercent]);
  const platformFeeAmount = useMemo(() => {
    return Math.round((totalAmount * platformFeePercent) / 100);
  }, [platformFeePercent, totalAmount]);
  const recipientAmount = useMemo(() => {
    return Math.max(totalAmount - platformFeeAmount, 0);
  }, [platformFeeAmount, totalAmount]);
  const campaignId = campaign?._id || campaign?.id || "";
  const authToken = useMemo(() => {
    return (
      routeToken ||
      (typeof localStorage !== "undefined" ? localStorage.getItem("token") : "") ||
      (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("token") : "") ||
      Cookies.get("token") ||
      ""
    );
  }, [routeToken]);

  const validate = () => {
    if (!campaignId) {
      setError("Campaign details are missing.");
      return false;
    }

    if (!name.trim()) {
      setError("Please enter your name.");
      return false;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email.");
      return false;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return false;
    }

    if (phone.trim().length < 10) {
      setError("Please enter a valid phone number.");
      return false;
    }

    if (!Number(totalAmount) || Number(totalAmount) < 1) {
      setError("Minimum contribution amount is Rs 1 for testing.");
      return false;
    }

    setError("");
    return true;
  };

  const handlePayment = async () => {
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      console.log("Campaign from state:", campaign);
      console.log("Campaign ID being sent:", campaignId);

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Razorpay SDK failed to load.");
      }

      const createRes = await createContribution({
        campaignId,
        amount: totalAmount,
        paymentMethod: "razorpay",
        paymentRoute: "razorpay_route",
        authToken,
        contributorName: name.trim(),
        contributorEmail: email.trim(),
        contributorPhone: phone.trim(),
        anonymous,
        split: {
          platformFeePercent,
          platformFeeAmount,
          recipientAmount,
          totalAmount,
        },
      });

      console.log("Create contribution response:", createRes);

      const order = createRes?.order;
      const key = createRes?.key;
      const contributionId = createRes?.contributionId;
      const breakdown = createRes?.breakdown;
      const campaignData = createRes?.campaign;
      const prefill = createRes?.prefill;
      const payoutConfigured = Boolean(createRes?.payoutConfigured);

      if (!order?.id || !key || !contributionId) {
        throw new Error("Invalid payment initialization response from server.");
      }

      const options = {
        key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Your Platform Name",
        description: `Contribution in ${
          campaignData?.title || campaign?.title || "Campaign"
        }`,
        order_id: order.id,
        handler: async function (response) {
          try {
            console.log("Razorpay success response:", response);

            const confirmRes = await confirmContribution(contributionId, response);

            console.log("Confirm contribution response:", confirmRes);

            navigate("/payment-success", {
              state: {
                campaign,
                contributionId,
                paymentId: response?.razorpay_payment_id,
                orderId: response?.razorpay_order_id,
                transferId:
                  confirmRes?.transfer?.id ||
                  confirmRes?.transfer?.items?.[0]?.id ||
                  null,
                amount: totalAmount,
                breakdown: {
                  ...(breakdown || {}),
                  totalAmount,
                  platformFeePercent,
                  platformFeeAmount,
                  recipientAmount,
                },
                payoutConfigured,
              },
            });
          } catch (err) {
            console.error("confirmContribution failed:", err);
            setError(err.message || "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: prefill?.name || name.trim(),
          email: prefill?.email || email.trim(),
          contact: prefill?.contact || phone.trim(),
        },
        notes: {
          campaignId,
          campaignTitle: campaign?.title || "",
          anonymous: anonymous ? "yes" : "no",
          platformFeePercent: String(platformFeePercent),
          platformFeeAmount: String(platformFeeAmount),
        },
        theme: {
          color: "#111827",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzpay = new window.Razorpay(options);

      rzpay.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response);

        setError(
          response?.error?.description ||
            response?.error?.reason ||
            "Payment failed. Please try again."
        );
        setLoading(false);
      });

      rzpay.open();
    } catch (err) {
      console.error("handlePayment failed:", err);
      setError(err.message || "Unable to initiate payment.");
      setLoading(false);
    }
  };

  if (!campaign) {
    return (
      <div className="max-w-lg mx-auto py-10 px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          Campaign data is missing. Please go back and try again.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4 text-gray-800">
      <h2 className="text-3xl font-bold text-center mb-6 text-black">
        Choose a contribution amount
      </h2>

      <p className="text-center text-gray-500 mb-2">
        Most contributors contribute approx{" "}
        <span className="text-blue-500 font-semibold">â‚¹2500</span>
      </p>

      <p className="text-center text-sm text-gray-400 mb-6">
        Youâ€™ll pay securely via Razorpay. UPI, Cards, Net Banking and Wallets
        are available there.
      </p>

      <div className="flex justify-between gap-2 mb-4">
        {PRESETS.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => setAmount(amt)}
            className={`px-4 py-2 rounded-full border transition ${
              amount === amt
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
            }`}
          >
            â‚¹{amt}
          </button>
        ))}
      </div>

      <div className="flex mb-4 rounded overflow-hidden border border-gray-300">
        <span className="bg-gray-100 px-4 py-2 font-medium text-gray-700">â‚¹</span>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full px-4 py-2 outline-none"
        />
      </div>

      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Name *"
          className="w-full px-4 py-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={() => setAnonymous(!anonymous)}
          />
          <span>Make my contribution anonymous</span>
        </label>

        <input
          type="email"
          placeholder="Email ID *"
          className="w-full px-4 py-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex items-center border rounded">
          <span className="px-4 py-2 border-r">ðŸ‡®ðŸ‡³</span>
          <input
            type="tel"
            placeholder="Your Mobile Number *"
            className="w-full px-4 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <p className="text-sm text-gray-500">
          All payment updates will be sent on this number.
        </p>

        <div className="rounded-xl bg-gray-50 border p-4 text-sm">
          <div className="flex justify-between mb-2">
            <span>Contribution</span>
            <span>â‚¹{Number(totalAmount).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between mb-2 text-gray-500">
            <span>Platform fee</span>
            <span>{platformFeePercent}%</span>
          </div>
          <div className="flex justify-between mb-2 text-gray-500">
            <span>Campaign payout</span>
            <span>â‚¹{Number(recipientAmount).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t pt-2">
            <span>Total payable</span>
            <span>â‚¹{Number(totalAmount).toLocaleString("en-IN")}</span>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className={`w-full py-3 rounded-full text-lg font-bold transition ${
          loading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-black hover:bg-blue-800 text-white"
        }`}
      >
        {loading ? "Processing..." : `Proceed To Contribute â‚¹${totalAmount}`}
      </button>
    </div>
  );
};

export default PaymentPage;
