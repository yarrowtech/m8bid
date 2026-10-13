import { readDashboardCache } from "../../lib/dashboardCache";
import DashboardPlaceholder from "../../components/DashboardPlaceholder";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Search,
  Mail,
  Bell,
  Home,
  ChevronDown,
  MoreVertical,
  ArrowRight,
  Wallet,
  IndianRupee,
  BriefcaseBusiness,
  Heart,
  BadgeCheck,
  Landmark,
  TrendingUp,
  Eye,
  Clock3,
  ShieldCheck,
  LineChart,
  User,
  FileCheck,
} from "lucide-react";
import ContributorSidebar from "./InvestorSidebar";
import { getMyInvestments } from "../../api/investmentapi";
import { getProfile } from "../../api/user";


function PrimaryBlueButton({
  children,
  onClick,
  className = "",
  fullWidth = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#6f5cf2] via-[#7b68f4] to-[#8d7bff] px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-lg shadow-[#6f5cf2]/25 transition hover:brightness-110 active:scale-[0.99] ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}

function StatCard({ icon: Icon, title, value, subtitle, iconWrapClass }) {
  return (
    <div className="flex items-center gap-4 rounded-[24px] border border-slate-100 bg-white px-5 py-5 shadow-md transition hover:shadow-lg">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconWrapClass}`}
      >
        <Icon size={20} className="text-slate-700" />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </p>
        <h3 className="mt-1 text-[24px] font-bold text-slate-900">{value}</h3>
        <p className="text-[11px] text-slate-500">{subtitle}</p>
      </div>

      <button className="ml-auto rounded-full p-2 text-slate-400 hover:bg-slate-100">
        <MoreVertical size={16} />
      </button>
    </div>
  );
}

function ContributionCard({
  tag,
  title,
  contributed,
  target,
  status,
  progress,
  onView,
}) {
  return (
    <div className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-[#f1edff] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-[#6f5cf2]">
          {tag}
        </span>
        <button className="rounded-full p-1 text-slate-400 hover:bg-slate-50">
          <MoreVertical size={13} />
        </button>
      </div>

      <h3 className="mt-3 text-[15px] font-semibold leading-5 text-slate-900">
        {title}
      </h3>

      <div className="mt-3 flex items-center justify-between text-[12px]">
        <span className="text-slate-500">Contributed</span>
        <span className="font-semibold text-slate-900">{contributed}</span>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#6f5cf2] to-[#8d7bff]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
        <span>{progress}% funded</span>
        <span>Target {target}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 px-2.5 py-2">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
            Status
          </p>
          <p className="mt-1 text-[12px] font-semibold text-emerald-600">
            {status}
          </p>
        </div>

      </div>

      <button
        onClick={onView}
        className="mt-3 w-full rounded-xl bg-slate-900 py-2 text-[12px] font-semibold text-white transition hover:bg-slate-800"
      >
        View Contribution
      </button>
    </div>
  );
}

function RightMetricCard({ title, value, sub, icon: Icon, tone = "sky" }) {
  const toneMap = {
    sky: "bg-[#f1edff] text-[#6f5cf2]",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    indigo: "bg-[#f3efff] text-[#7b68f4]",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-3">
        {Icon ? (
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneMap[tone]}`}
          >
            <Icon size={16} />
          </div>
        ) : null}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>
          <h4 className="mt-1 text-lg font-bold text-slate-900">{value}</h4>
          <p className="mt-1 text-xs text-slate-500">{sub}</p>
        </div>
      </div>
    </div>
  );
}


const formatINR = (amount) => {
  const value = Number(amount || 0);
  return `Rs ${value.toLocaleString("en-IN")}`;
};

const normalizeContributionStatus = (contribution) => {
  const paymentStatus = String(contribution?.paymentStatus || "").toLowerCase();
  const status = String(contribution?.status || "").toLowerCase();
  const campaignStatus = String(
    contribution?.campaign?.status || contribution?.campaignId?.status || ""
  ).toLowerCase();

  if (paymentStatus === "completed" || status === "confirmed") return "Confirmed";
  if (status === "failed" || paymentStatus === "failed") return "Failed";
  if (campaignStatus === "completed") return "Completed";
  return "Pending";
};

const getCampaignData = (contribution) =>
  contribution?.campaign || contribution?.campaignId || null;

const getCampaignTarget = (campaign) =>
  Number(campaign?.fundingGoal || campaign?.moneyToRaise || 0);

const getCampaignRaised = (campaign) =>
  Number(campaign?.currentFunding || campaign?.moneyRaised || campaign?.raisedAmount || 0);

const getProfileCompletion = (user) => {
  return Math.min(100, (user?.name ? 20 : 0) + (user?.email ? 20 : 0)
    + (user?.profile?.phone ? 15 : 0) + (user?.profile?.photo ? 15 : 0)
    + (user?.kycStatus === "VERIFIED" ? 15 : 0) + (user?.bankDetails?.accountNumber ? 15 : 0));
};

const normalizeStatusLabel = (value, type) => {
  const status = String(value || "").toUpperCase();

  if (type === "kyc") {
    if (status === "VERIFIED" || status === "APPROVED") return "Verified";
    if (status === "PENDING") return "Pending Review";
    if (status === "REJECTED") return "Rejected";
    return "Not Submitted";
  }

  if (type === "bank") {
    if (status === "VERIFIED" || status === "APPROVED") return "Linked";
    if (status === "PENDING") return "Pending Review";
    if (status === "REJECTED") return "Rejected";
    return "Not Linked";
  }

  return value || "-";
};

export default function ContributorDashboard({ embedded = false }) {
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [user, setUser] = useState(localUser || null);
  const cached = readDashboardCache("/contributions/my");
  const [contributions, setContributions] = useState((cached?.contributions || []).filter((entry) => entry.paymentStatus === "completed" && entry.status === "confirmed"));
  const { search = "" } = useOutletContext() || {};
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError("");

        const [contributionRes, profileRes] = await Promise.all([
          getMyInvestments(),
          getProfile(),
        ]);

        const contributionList = Array.isArray(contributionRes?.contributions)
          ? contributionRes.contributions
          : [];
        setContributions(contributionList.filter((entry) => entry.paymentStatus === "completed" && entry.status === "confirmed"));

        const liveUser = profileRes?.user || null;
        if (liveUser) {
          setUser(liveUser);
          localStorage.setItem("user", JSON.stringify(liveUser));
        }
      } catch (err) {
        setError(err?.message || err?.error || "Failed to load Contributor dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const filteredContributions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contributions;

    return contributions.filter((contribution) => {
      const campaign = getCampaignData(contribution);
      return (
        String(campaign?.projectTitle || "").toLowerCase().includes(query) ||
        String(campaign?.projectCategory || "").toLowerCase().includes(query) ||
        String(contribution?.status || "").toLowerCase().includes(query) ||
        String(contribution?.paymentStatus || "").toLowerCase().includes(query)
      );
    });
  }, [contributions, search]);

  const totalContributed = useMemo(
    () => contributions.filter((item) => item.paymentStatus === "completed").reduce((sum, item) => sum + Number(item?.amount || 0), 0),
    [contributions]
  );

  const activeContributions = useMemo(
    () =>
      contributions.filter((item) => {
        const status = String(item?.status || "").toLowerCase();
        const paymentStatus = String(item?.paymentStatus || "").toLowerCase();
        return !["failed", "cancelled"].includes(status) && paymentStatus !== "failed";
      }).length,
    [contributions]
  );

  const savedDeals = user?.savedCampaigns?.length || 0;
  const profileCompletion = getProfileCompletion(user);
  const kycStatus = normalizeStatusLabel(user?.access?.contributor?.kycStatus, "kyc");
  const bankStatus = user?.bankDetails?.accountNumber
    ? "Linked"
    : normalizeStatusLabel(user?.access?.contributor?.bankStatus, "bank");

  const chartBars = useMemo(() => {
    const monthly = Array(5).fill(0);
    const now = new Date();

    contributions.forEach((item) => {
      const createdAt = new Date(item?.createdAt || item?.date || item?.updatedAt);
      if (Number.isNaN(createdAt.getTime())) return;

      const diffMonths =
        (now.getFullYear() - createdAt.getFullYear()) * 12 +
        (now.getMonth() - createdAt.getMonth());

      if (diffMonths >= 0 && diffMonths < 5) {
        const index = 4 - diffMonths;
        monthly[index] += Number(item?.amount || 0);
      }
    });

    const max = Math.max(...monthly, 1);
    return monthly.map((value) => Math.max(18, Math.round((value / max) * 84)));
  }, [contributions]);

  const statCards = useMemo(
    () => [
      {
        icon: Wallet,
        title: "Total Contributions",
        value: formatINR(totalContributed),
        subtitle: "Amount contributed from backend records",
        iconWrapClass: "bg-[#f1edff]",
      },
      {
        icon: BriefcaseBusiness,
        title: "Active Contributions",
        value: String(activeContributions).padStart(2, "0"),
        subtitle: "Live and tracked contributions",
        iconWrapClass: "bg-emerald-100",
      },

      {
        icon: Heart,
        title: "Saved Opportunities",
        value: String(savedDeals).padStart(2, "0"),
        subtitle: "Campaigns saved to your account",
        iconWrapClass: "bg-amber-100",
      },
    ],
    [activeContributions, totalContributed, savedDeals]
  );

  const firstName = user?.name?.split(" ")[0] || "Contributor";

  if (loading) return <DashboardPlaceholder />;

  return (
    <div
      className="h-screen w-full bg-[#c6d2df] text-slate-900"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="flex h-screen w-full overflow-hidden bg-[#f5f8fc]">
        {!embedded && <ContributorSidebar active="dashboard" />}

        <div className="flex min-w-0 flex-1">
          <main
            className="scrollbar-hide min-w-0 flex-1 overflow-y-auto border-l border-slate-200 bg-[#f5f8fc] px-4 py-4 md:px-5"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 rounded-[24px] bg-gradient-to-r from-[#6f5cf2] via-[#7b68f4] to-[#8d7bff] px-5 py-5 text-white shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ebe6ff]">
                   Contribute Funds Dashboard
                </p>

                <h1 className="mt-2 text-[22px] font-semibold leading-tight md:text-[24px]">
                  Track your contributions, supported funding campaigns, and account readiness.
                </h1>

                <div className="mt-2 text-sm text-[#ebe6ff]">
                  Hello {firstName}, your dashboard is now connected to backend contribution data.
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate("/browse-contributors")}
                    className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100 active:scale-[0.98]"
                  >
                    Contribute Now
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white">
                      <ArrowRight size={13} />
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/contributor/portfolio")}
                    className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-900 active:scale-[0.98]"
                  >
                    View Supported Campaigns
                  </button>
                </div>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((item, i) => (
                <StatCard key={i} {...item} />
              ))}
            </div>

            <section className="mt-5 rounded-[24px] bg-[#f5f8fc]">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[22px] font-semibold tracking-tight text-slate-900">
                  Campaigns I Supported
                </h2>

                <button
                  onClick={() => navigate("/contributor/portfolio")}
                  className="text-sm font-semibold text-[#6f5cf2] hover:text-[#5f4ae6]"
                >
                  See all
                </button>
              </div>

              <div className="mt-3 pr-2">
                {filteredContributions.length === 0 ? (
                  <div className="rounded-[20px] border border-dashed border-slate-300 bg-white p-8 text-center">
                    <p className="text-lg font-semibold text-slate-800">
                      No supported campaigns yet
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Your confirmed and pending contributions will appear here.
                    </p>
                    <button
                      onClick={() => navigate("/browse-contributors")}
                      className="mt-4 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Explore Opportunities
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 xl:grid-cols-3">
                    {filteredContributions.slice(0, 6).map((contribution) => {
                      const campaign = getCampaignData(contribution);
                      const target = getCampaignTarget(campaign);
                      const raised = getCampaignRaised(campaign);
                      const progress = target
                        ? Math.min(100, Math.round((raised / target) * 100))
                        : 0;

                      return (
                        <ContributionCard
                          key={contribution?._id}
                          tag={campaign?.projectCategory || "General"}
                          title={campaign?.projectTitle || "Campaign"}
                          contributed={formatINR(contribution?.amount)}
                          target={formatINR(target)}
                          status={normalizeContributionStatus(contribution)}
                          progress={progress}
                          onView={() =>
                            campaign?._id
                              ? navigate(`/contribution-detail/${campaign._id}`, {
                                  state: { campaign },
                                })
                              : null
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </main>

          {!embedded && <aside className="hidden w-[320px] shrink-0 border-l border-slate-200 bg-white px-4 py-5 xl:block">
            <div className="flex items-center justify-between">
              <h3 className="text-[28px] font-semibold tracking-tight text-slate-900">
                My Contributor Profile
              </h3>
            </div>

            <div
              onClick={() => navigate("/contributor/profile")}
              className="mt-5 flex cursor-pointer flex-col items-center rounded-[24px] border border-slate-100 bg-[#fafcff] p-4 transition hover:bg-slate-50 hover:shadow-sm"
            >
              <div className="relative flex h-[122px] w-[122px] items-center justify-center rounded-full border-[8px] border-[#f1edff]">
                <div className="absolute inset-0 rounded-full border-[8px] border-transparent border-r-[#6f5cf2] border-t-[#8d7bff] rotate-[28deg]" />
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ece6ff] to-[#f5f1ff] text-lg font-semibold text-slate-800">
                  {user?.name?.charAt(0) || "I"}
                </div>

                <div className="absolute right-0 top-4 rounded-full bg-[#6f5cf2] px-2 py-0.5 text-[9px] font-semibold text-white">
                  {profileCompletion}%
                </div>
              </div>

              <h4 className="mt-4 text-center text-[25px] font-semibold tracking-tight text-slate-900">
                Hello {firstName}
              </h4>
              <p className="mt-1 max-w-[230px] text-center text-[11px] leading-5 text-slate-500">
                Keep your contributor profile complete to improve onboarding, trust and transaction readiness.
              </p>
              <p className="mt-2 text-xs font-medium text-[#6f5cf2]">
                View Profile -
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              <RightMetricCard
                title="Profile Completion"
                value={`${profileCompletion}%`}
                sub="Based on live user, KYC, and bank details"
                icon={BadgeCheck}
                tone="sky"
              />
              <RightMetricCard
                title="KYC Status"
                value={kycStatus}
                sub="Live status from your contributor access"
                icon={ShieldCheck}
                tone={kycStatus === "Verified" ? "emerald" : "amber"}
              />
              <RightMetricCard
                title="Bank / Wallet"
                value={bankStatus}
                sub="Linked bank readiness from your profile"
                icon={Landmark}
                tone={bankStatus === "Linked" ? "indigo" : "amber"}
              />
            </div>

            <div className="mt-5 rounded-[22px] bg-[#f8fbff] p-3">
              <div className="flex h-28 items-end justify-between gap-2">
                {chartBars.map((h, i) => (
                  <div key={i} className="flex-1">
                    <div
                      className={`w-full rounded-t-xl ${
                        i === chartBars.length - 1 || i === chartBars.length - 2
                          ? "bg-[#6f5cf2]"
                          : "bg-[#d9d0ff]"
                      }`}
                      style={{ height: `${h}px` }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-2 flex justify-between text-[9px] text-slate-400">
                <span>5 mo</span>
                <span>3 mo</span>
                <span>Now</span>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <RightMetricCard
                title="Total Contributed"
                value={formatINR(totalContributed)}
                sub="Confirmed contributions to funding campaigns"
                icon={BriefcaseBusiness}
                tone="sky"
              />

              <RightMetricCard
                title="Saved Deals"
                value={String(savedDeals).padStart(2, "0")}
                sub="Campaigns saved to your account"
                icon={Heart}
                tone="indigo"
              />
            </div>

            <div
              onClick={() => navigate("/contributor/analytics")}
              className="mt-5 cursor-pointer rounded-[22px] border border-slate-100 bg-[#fafcff] p-3 transition hover:bg-slate-50 hover:shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f1edff]">
                      <Eye size={15} className="text-[#6f5cf2]" />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-slate-900">
                        Total Contributions
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Backend contribution records
                      </p>
                    </div>
                  </div>
                  <span className="text-[12px] font-semibold text-slate-900">
                    {String(contributions.length).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100">
                      <Clock3 size={15} className="text-amber-700" />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-slate-900">
                        Pending Items
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Awaiting completion or review
                      </p>
                    </div>
                  </div>
                  <span className="text-[12px] font-semibold text-slate-900">
                    {
                      contributions.filter(
                        (item) => normalizeContributionStatus(item) === "Pending"
                      ).length
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100">
                      <TrendingUp size={15} className="text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-slate-900">
                        Campaigns Supported
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Distinct funding campaigns you supported
                      </p>
                    </div>
                  </div>
                  <span className="text-[12px] font-semibold text-emerald-600">
                    {new Set(contributions.filter((item) => item.paymentStatus === "completed").map((item) => item.campaign?._id)).size}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <PrimaryBlueButton
                onClick={() => navigate("/browse-contributors")}
                fullWidth
              >
                Explore More Opportunities
              </PrimaryBlueButton>

              <PrimaryBlueButton
                onClick={() => navigate("/contributor/portfolio")}
                fullWidth
              >
                View Supported Campaigns
              </PrimaryBlueButton>
            </div>
          </aside>}
        </div>
      </div>
    </div>
  );
}
