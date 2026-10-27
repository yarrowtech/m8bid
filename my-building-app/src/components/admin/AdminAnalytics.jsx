import AdminRecordHeader from "./AdminRecordHeader";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getAdminAnalytics } from "../../api/admin";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const INR = (value) => {
  const num = Number(value || 0);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `₹${num}`;
  }
};

export default function AdminAnalytics() {
  const { setSidebarOpen } = useOutletContext();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    let active = true; setLoading(true); setError("");
    getAdminAnalytics(timeRange).then((response) => { if (active) setDashboard(response.stats); }).catch(() => { if (active) setError("Unable to load funding analytics."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [timeRange]);

  const chartData = useMemo(() => {
    return (dashboard?.monthlyRaised || []).map((item) => ({
      month: item.month,
      raised: Number(item.raised || item.amount || 0),
    }));
  }, [dashboard]);

  return (
    <>
      <AdminRecordHeader title="Funding Analytics" description="Confirmed contribution trends and platform totals.">
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">{["24h", "7d", "30d", "90d"].map((range) => <button key={range} onClick={() => setTimeRange(range)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${timeRange === range ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>{range}</button>)}</div>
      </AdminRecordHeader>

      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {!dashboard && loading && <p role="status" className="mb-4 text-sm text-slate-500">Loading analytics...</p>}
      {dashboard && <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold tracking-tight text-slate-900">
            Confirmed Contributions Trend
          </h3>

          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 12 }} />
                <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip formatter={(val) => INR(val)} />
                <Line
                  type="monotone"
                  dataKey="raised"
                  stroke="#0f172a"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold tracking-tight text-slate-900">
            Analytics Summary
          </h3>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Funds Raised</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {INR(dashboard?.totalMoneyRaised ?? 0)}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Platform Fees</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {INR(dashboard?.platformFees ?? 0)}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total Users</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {dashboard?.totalUsers ?? 0}
              </h3>
            </div>
          </div>
        </div>
      </div>}
    </>
  );
}