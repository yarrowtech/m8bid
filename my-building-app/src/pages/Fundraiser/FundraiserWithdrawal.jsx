import React from "react";
import { useNavigate } from "react-router-dom";
import FundraiserSidebar from "./FundraiserSidebar";

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

export default function FundraiserWithdrawals() {
  const navigate = useNavigate();

  const withdrawals = [
    {
      amount: "₹50,000",
      account: "HDFC •••• 2381",
      date: "12 Aug 2026",
      status: "Paid",
    },
    {
      amount: "₹25,000",
      account: "ICICI •••• 6741",
      date: "20 Aug 2026",
      status: "Pending",
    },
  ];

  return (
    <div className="h-screen w-full bg-[#e3e8f0]">
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7fb]">
        <FundraiserSidebar active="withdrawals" />

        <main
          className="scrollbar-hide flex-1 overflow-y-auto px-6 py-6"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <div className="flex items-center justify-between">
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
              Link Bank Account
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Available Balance
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">₹1,20,000</h3>
            </div>
            <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Total Withdrawn
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">₹1,90,000</h3>
            </div>
            <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Pending Request
              </p>
              <h3 className="mt-2 text-2xl font-bold text-amber-600">₹25,000</h3>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-slate-100 bg-white shadow-sm">
            <div className="grid grid-cols-4 gap-3 px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <div>Amount</div>
              <div>Bank Account</div>
              <div>Date</div>
              <div>Status</div>
            </div>

            {withdrawals.map((item, idx) => (
              <WithdrawalRow key={idx} {...item} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}