import React, { useEffect, useMemo, useState } from "react";
import FundraiserSidebar from "./FundraiserSidebar";
import { getDashboardData } from "../../api/fundraiser.api";

function MetricCard({ title, value, sub }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
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

const formatCategory = (value = "") => {
  if (!value) return "General";
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getDaysLeft = (deadline, createdAt, daysToRaise) => {
  let endDate = null;

  if (deadline) {
    const parsed = new Date(deadline);
    if (!Number.isNaN(parsed.getTime())) endDate = parsed;
  }

  if (!endDate && createdAt && daysToRaise) {
    const created = new Date(createdAt);
    if (!Number.isNaN(created.getTime())) {
      endDate = new Date(
        created.getTime() + Number(daysToRaise || 0) * 24 * 60 * 60 * 1000
      );
    }
  }

  if (!endDate) return null;

  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function FundraiserAnalytics({ embedded = false }) {
  const [campaigns, setCampaigns] = useState([]);
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
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        if (!userId) {
          setCampaigns([]);
          setError("User not found. Please login again.");
          return;
        }

        const res = await getDashboardData(userId);
        const list = res?.data || res?.fundraisers || [];
        setCampaigns(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to fetch fundraiser analytics:", err);
        setCampaigns([]);
        setError(err?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [userId]);

  const analytics = useMemo(() => {
    const totalCampaigns = campaigns.length;
    const totalRaised = campaigns.reduce(
      (sum, item) => sum + Number(item?.raisedAmount || 0),
      0
    );
    const totalTarget = campaigns.reduce(
      (sum, item) => sum + Number(item?.moneyToRaise || 0),
      0
    );
    const approved = campaigns.filter(
      (item) => String(item?.status).toLowerCase() === "approved"
    ).length;
    const pending = campaigns.filter(
      (item) => String(item?.status).toLowerCase() === "pending"
    ).length;
    const conversionRate = totalTarget
      ? ((totalRaised / totalTarget) * 100).toFixed(1)
      : "0.0";

    const categoryMap = campaigns.reduce((acc, item) => {
      const key = item?.projectCategory || "others";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const topCategoryEntry =
      Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0] || null;

    const bestCampaign =
      [...campaigns].sort(
        (a, b) => Number(b?.raisedAmount || 0) - Number(a?.raisedAmount || 0)
      )[0] || null;

    const endingSoon = campaigns
      .map((item) => ({
        ...item,
        daysLeft: getDaysLeft(item?.deadline, item?.createdAt, item?.daysToRaise),
      }))
      .filter(
        (item) =>
          typeof item.daysLeft === "number" && item.daysLeft >= 0 && item.daysLeft <= 7
      ).length;

    const monthlyData = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      const monthLabel = date.toLocaleDateString("en-IN", { month: "short" });

      const total = campaigns
        .filter((item) => {
          if (!item?.createdAt) return false;
          const created = new Date(item.createdAt);
          return (
            created.getMonth() === date.getMonth() &&
            created.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, item) => sum + Number(item?.raisedAmount || 0), 0);

      return { month: monthLabel, total };
    });

    const maxMonthlyRaised = Math.max(...monthlyData.map((item) => item.total), 1);

    return {
      totalCampaigns,
      totalRaised,
      totalTarget,
      approved,
      pending,
      conversionRate,
      topCategoryEntry,
      bestCampaign,
      endingSoon,
      monthlyData,
      maxMonthlyRaised,
    };
  }, [campaigns]);

  const content = (
    <main
      className="scrollbar-hide flex-1 overflow-y-auto px-6 py-6"
      style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
    >
      <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
      <p className="mt-1 text-sm text-slate-500">
        Track campaign performance, funding progress, and account activity.
      </p>

      {loading ? (
        <div className="mt-6 rounded-[24px] border border-slate-100 bg-white px-5 py-10 text-center text-sm text-slate-500 shadow-sm">
          Loading analytics...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-[24px] border border-rose-100 bg-rose-50 px-5 py-10 text-center text-sm text-rose-600 shadow-sm">
          {error}
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <MetricCard title="Total Raised" value={formatCurrency(analytics.totalRaised)} sub={`Across ${analytics.totalCampaigns} campaigns`} />
            <MetricCard title="Approved Campaigns" value={analytics.approved} sub={`${analytics.pending} campaigns still pending`} />
            <MetricCard title="Funding Rate" value={`${analytics.conversionRate}%`} sub={`Against target ${formatCurrency(analytics.totalTarget)}`} />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Monthly Raised Amount</h2>
              {analytics.totalCampaigns === 0 ? (
                <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No campaign data available yet.
                </div>
              ) : (
                <div className="mt-6 flex h-64 items-end gap-4">
                  {analytics.monthlyData.map((item) => (
                    <div key={item.month} className="flex flex-1 flex-col items-center">
                      <div className="mb-2 text-[11px] font-medium text-slate-500">
                        {item.total > 0 ? formatCurrency(item.total) : "-"}
                      </div>
                      <div className="flex h-52 w-full items-end">
                        <div
                          className="w-full rounded-t-2xl bg-sky-500"
                          style={{ height: `${Math.max(16, (item.total / analytics.maxMonthlyRaised) * 100)}%` }}
                        />
                      </div>
                      <div className="mt-3 text-xs font-semibold text-slate-500">
                        {item.month}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Top Insights</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Best performing campaign</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {analytics.bestCampaign
                      ? `${analytics.bestCampaign.projectTitle} has raised ${formatCurrency(analytics.bestCampaign.raisedAmount)}.`
                      : "No campaign performance data is available yet."}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Most active category</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {analytics.topCategoryEntry
                      ? `${formatCategory(analytics.topCategoryEntry[0])} leads with ${analytics.topCategoryEntry[1]} campaign(s).`
                      : "Your categories will appear here once campaigns are created."}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Recommendation</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {analytics.endingSoon > 0
                      ? `${analytics.endingSoon} campaign(s) are ending within 7 days. Review and promote them if needed.`
                      : "Keep your KYC and bank profile complete to reduce approval delays."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );

  if (embedded) return content;

  return (
    <div className="h-screen w-full bg-[#e3e8f0]">
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7fb]">
        <FundraiserSidebar active="analytics" />
        {content}
      </div>
    </div>
  );
}
