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
import { getAdminDashboard } from "../../api/admin";

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
  const [dashboard, setDashboard] = useState({});
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    const run = async () => {
      try {
        const res = await getAdminDashboard(timeRange);
        setDashboard(res?.data || res?.stats || res || {});
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, [timeRange]);

  const chartData = useMemo(() => {
    return (dashboard?.monthlyRaised || []).map((item) => ({
      month: item.month,
      raised: Number(item.raised || item.amount || 0),
    }));
  }, [dashboard]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 lg:hidden"
          >
            <FaBars />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Analytics
            </h1>
            <p className="mt-1 text-sm text-slate-500">Performance and growth trends</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["24h", "7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                timeRange === range
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold tracking-tight text-slate-900">
            Raised Amount Trend
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
              <p className="text-sm text-slate-500">Total Revenue</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {INR(dashboard?.overview?.totalRevenue || dashboard?.totalRevenue || 0)}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Platform Fees</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {INR(dashboard?.overview?.platformFees || dashboard?.platformFees || 0)}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total Users</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {dashboard?.overview?.totalUsers || dashboard?.totalUsers || 0}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}