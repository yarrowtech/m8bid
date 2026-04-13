import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import InvestorSidebar from "./InvestorSidebar";
import { getMyTransactions } from "../../api/investmentapi";

function TransactionRow({ date, campaign, amount, method, status }) {
  return (
    <div className="grid grid-cols-5 gap-3 border-t border-slate-100 px-4 py-4 text-sm">
      <div className="text-slate-600">{date}</div>
      <div className="font-semibold text-slate-900">{campaign}</div>
      <div className="text-slate-900">{amount}</div>
      <div className="text-slate-600">{method}</div>
      <div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
            status === "Completed"
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

export default function InvestorTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMyTransactions();
        const transactionList = Array.isArray(response?.transactions)
          ? response.transactions
          : [];
        setTransactions(transactionList);
      } catch (err) {
        setError(err?.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  return (
    <div
      className="h-screen w-full bg-[#e3e8f0] text-slate-900"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7fb]">
        <InvestorSidebar active="transactions" />

        <main
          className="scrollbar-hide flex-1 overflow-y-auto px-6 py-6"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
          <p className="mt-1 text-sm text-slate-500">
            View your investment payment history and transaction records.
          </p>

          {loading ? (
            <div className="mt-6 flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              <span className="ml-3 text-slate-600">Loading transactions...</span>
            </div>
          ) : error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">Error Loading Transactions</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[28px] border border-slate-100 bg-white shadow-sm">
              <div className="grid grid-cols-5 gap-3 px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <div>Date</div>
                <div>Campaign</div>
                <div>Amount</div>
                <div>Method</div>
                <div>Status</div>
              </div>

              {transactions.length > 0 ? (
                transactions.map((item, idx) => (
                  <TransactionRow key={item.id || idx} {...item} />
                ))
              ) : (
                <div className="px-4 py-8 text-center text-slate-500">
                  No transactions found. Start investing to see your transaction history.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}