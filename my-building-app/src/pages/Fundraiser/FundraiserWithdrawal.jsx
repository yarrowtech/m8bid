import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FundraiserSidebar from "./FundraiserSidebar";
import {
  getDashboardData,
  getFundraiserProfile,
} from "../../api/fundraiser.api";

function WithdrawalRow({ amount, account, date, status }) {
  return (
    <div className="grid grid-cols-4 gap-3 border-t border-slate-100 px-4 py-4 text-sm">
      <div className="font-semibold text-slate-900">{amount}</div>
      <div className="text-slate-600">{account}</div>
      <div className="text-slate-600">{date}</div>
      <div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
            status === "Paid"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

const formatCurrency = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return "Bank account not linked";
  return `XXXXXX${String(accountNumber).slice(-4)}`;
};

export default function FundraiserWithdrawals() {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const userId = user?._id || user?.id || user?.userId;

  useEffect(() => {
    const loadWithdrawalData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!userId) {
          setCampaigns([]);
          setProfile(null);
          setError("User not found. Please login again.");
          return;
        }

        const [campaignRes, profileRes] = await Promise.all([
          getDashboardData(userId),
          getFundraiserProfile(),
        ]);

        setCampaigns(
          Array.isArray(campaignRes?.data)
            ? campaignRes.data
            : Array.isArray(campaignRes?.fundraisers)
            ? campaignRes.fundraisers
            : []
        );
        setProfile(profileRes?.data || null);
      } catch (err) {
        console.error("Failed to fetch withdrawal page data:", err);
        setCampaigns([]);
        setProfile(null);
        setError(err?.message || "Failed to load withdrawal data");
      } finally {
        setLoading(false);
      }
    };

    loadWithdrawalData();
  }, [userId]);

  const withdrawalData = useMemo(() => {
    const totalRaised = campaigns.reduce(
      (sum, item) => sum + Number(item?.raisedAmount || 0),
      0
    );

    const bankName = profile?.bankDetails?.bankName || "Bank not linked";
    const accountNumber = maskAccountNumber(profile?.bankDetails?.accountNumber);
    const linkedAccount =
      profile?.bankDetails?.accountNumber && profile?.bankDetails?.bankName
        ? `${profile.bankDetails.bankName} ${accountNumber}`
        : accountNumber;

    return {
      availableBalance: totalRaised,
      totalWithdrawn: 0,
      pendingRequest: 0,
      linkedAccount,
      bankLinked: Boolean(profile?.bankDetails?.accountNumber),
      bankName,
      rows: [],
    };
  }, [campaigns, profile]);

  return (
    <div className="h-screen w-full bg-[#e3e8f0]">
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7fb]">
        <FundraiserSidebar active="withdrawals" />

        <main
          className="scrollbar-hide flex-1 overflow-y-auto px-6 py-6"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Withdrawals</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage withdrawal requests and payout history.
              </p>
            </div>

            <button
              onClick={() => navigate("/fundraiser/profile/bank")}
              className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700"
            >
              {withdrawalData.bankLinked ? "Update Bank Account" : "Link Bank Account"}
            </button>
          </div>

          {loading ? (
            <div className="mt-6 rounded-[24px] border border-slate-100 bg-white px-5 py-10 text-center text-sm text-slate-500 shadow-sm">
              Loading withdrawal data...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-[24px] border border-rose-100 bg-rose-50 px-5 py-10 text-center text-sm text-rose-600 shadow-sm">
              {error}
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Available Balance
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {formatCurrency(withdrawalData.availableBalance)}
                  </h3>
                </div>
                <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Total Withdrawn
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {formatCurrency(withdrawalData.totalWithdrawn)}
                  </h3>
                </div>
                <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Pending Request
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-amber-600">
                    {formatCurrency(withdrawalData.pendingRequest)}
                  </h3>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Linked Bank Account
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {withdrawalData.linkedAccount}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {withdrawalData.bankLinked
                    ? "Bank details are available for future withdrawal requests."
                    : "Link your bank account to enable payout-related features when the withdrawal API is connected."}
                </p>
              </div>

              <div className="mt-6 rounded-[28px] border border-slate-100 bg-white shadow-sm">
                <div className="grid grid-cols-4 gap-3 px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <div>Amount</div>
                  <div>Bank Account</div>
                  <div>Date</div>
                  <div>Status</div>
                </div>

                {withdrawalData.rows.length > 0 ? (
                  withdrawalData.rows.map((item, idx) => (
                    <WithdrawalRow key={idx} {...item} />
                  ))
                ) : (
                  <div className="border-t border-slate-100 px-4 py-10 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      No withdrawal history available
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      This page is now using real backend fundraiser and bank data, but a dedicated withdrawal history API is not available yet.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
