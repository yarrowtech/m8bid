import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  IndianRupee,
  TrendingUp,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import InvestorSidebar from "./InvestorSidebar";
import { getMyInvestments } from "../../api/investmentapi";

const formatINR = (amount) => {
  const value = Number(amount || 0);
  return "Rs " + value.toLocaleString("en-IN");
};

const getExpectedReturn = (investment, campaign) => {
  const profitPercent = Number(campaign?.profitPercentage || 0);
  const amount = Number(investment?.amount || 0);
  return Math.round(amount * profitPercent / 100);
};

const getCurrentValue = (investment, campaign) => {
  const amount = Number(investment?.amount || 0);
  const expectedReturn = getExpectedReturn(investment, campaign);
  return amount + expectedReturn;
};

function MetricCard({ title, value, sub, icon: Icon, tone = "sky" }) {
  const tones = {
    sky: "bg-sky-100 text-sky-700",
    emerald: "bg-emerald-100 text-emerald-700",
    indigo: "bg-indigo-100 text-indigo-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
          <p className="mt-1 text-sm text-slate-500">{sub}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export default function InvestorAnalytics() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMyInvestments();
        const investmentList = Array.isArray(response?.investments)
          ? response.investments
          : [];
        setInvestments(investmentList);
      } catch (err) {
        setError(err?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const analytics = useMemo(() => {
    if (investments.length === 0) {
      return {
        totalInvested: 0,
        totalCurrentValue: 0,
        netReturns: 0,
        portfolioGrowth: 0,
        diversificationCount: 0,
        categoryBreakdown: [],
        insights: [],
      };
    }

    const totalInvested = investments.reduce((sum, inv) => sum + Number(inv?.amount || 0), 0);
    const totalCurrentValue = investments.reduce((sum, inv) => {
      const campaign = inv?.campaign || inv?.campaignId;
      return sum + getCurrentValue(inv, campaign);
    }, 0);
    const netReturns = totalCurrentValue - totalInvested;
    const portfolioGrowth = totalInvested > 0 ? (netReturns / totalInvested) * 100 : 0;

    // Calculate diversification
    const categories = new Set();
    const categoryCounts = {};

    investments.forEach((inv) => {
      const campaign = inv?.campaign || inv?.campaignId;
      const category = campaign?.projectCategory || "General";
      categories.add(category);
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const diversificationCount = categories.size;
    const categoryBreakdown = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / investments.length) * 100),
    }));

    // Generate insights
    const insights = [];
    if (diversificationCount < 3) {
      insights.push({
        title: "Diversification Opportunity",
        description: "Consider investing in more categories to spread risk across different sectors.",
      });
    }

    const topCategory = categoryBreakdown.reduce((max, cat) =>
      cat.count > max.count ? cat : max,
      categoryBreakdown[0] || { category: "None", count: 0 }
    );

    if (topCategory) {
      insights.push({
        title: "Top Performing Sector",
        description: `${topCategory.category} represents ${topCategory.percentage}% of your portfolio.`,
      });
    }

    if (portfolioGrowth > 10) {
      insights.push({
        title: "Strong Performance",
        description: "Your portfolio is showing excellent growth. Consider maintaining this strategy.",
      });
    } else if (portfolioGrowth < 0) {
      insights.push({
        title: "Portfolio Review",
        description: "Consider reviewing your investment strategy to improve returns.",
      });
    }

    return {
      totalInvested,
      totalCurrentValue,
      netReturns,
      portfolioGrowth: Math.round(portfolioGrowth * 100) / 100,
      diversificationCount,
      categoryBreakdown,
      insights,
    };
  }, [investments]);

  return (
    <div
      className="h-screen w-full bg-[#e3e8f0] text-slate-900"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7fb]">
        <InvestorSidebar active="analytics" />

        <main
          className="scrollbar-hide flex-1 overflow-y-auto px-6 py-6"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Analyze your portfolio performance and investment behavior.
          </p>

          {loading ? (
            <div className="mt-6 flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              <span className="ml-3 text-slate-600">Loading analytics...</span>
            </div>
          ) : error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">Error Loading Analytics</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <MetricCard
                  title="Portfolio Growth"
                  value={`${analytics.portfolioGrowth >= 0 ? '+' : ''}${analytics.portfolioGrowth}%`}
                  sub="Estimated returns"
                  icon={TrendingUp}
                  tone={analytics.portfolioGrowth >= 0 ? "emerald" : "red"}
                />
                <MetricCard
                  title="Invested Capital"
                  value={formatINR(analytics.totalInvested)}
                  sub="Total deployed"
                  icon={IndianRupee}
                  tone="sky"
                />
                <MetricCard
                  title="Active Investments"
                  value={investments.length}
                  sub="Current holdings"
                  icon={Eye}
                  tone="amber"
                />
                <MetricCard
                  title="Diversification"
                  value={`${analytics.diversificationCount} Sectors`}
                  sub="Across categories"
                  icon={BarChart3}
                  tone="indigo"
                />
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Investment Distribution
                  </h2>
                  <div className="mt-6 flex h-64 items-end gap-2">
                    {analytics.categoryBreakdown.slice(0, 6).map((cat, i) => {
                      const height = Math.max(20, (cat.count / investments.length) * 200);
                      return (
                        <div key={i} className="flex-1 text-center">
                          <div
                            className="w-full rounded-t-2xl bg-sky-500 transition-all hover:bg-sky-600"
                            style={{ height: `${height}px` }}
                            title={`${cat.category}: ${cat.count} investments`}
                          />
                          <p className="mt-2 text-xs font-medium text-slate-600 truncate">
                            {cat.category}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Investor Insights
                  </h2>
                  <div className="mt-5 space-y-4">
                    {analytics.insights.length > 0 ? (
                      analytics.insights.map((insight, index) => (
                        <div key={index} className="rounded-2xl bg-slate-50 p-4">
                          <p className="font-semibold text-slate-900">{insight.title}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {insight.description}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="font-semibold text-slate-900">Getting Started</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Start investing to see personalized insights about your portfolio performance.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}