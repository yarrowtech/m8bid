import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import InvestorSidebar from "./InvestorSidebar";
import { getMyInvestments } from "../../api/investmentapi";
import { getProfile } from "../../api/user";

function TopIconButton({ children }) {
  return (
    <button className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50">
      {children}
    </button>
  );
}

function PrimaryBlueButton({
  children,
  onClick,
  className = "",
  fullWidth = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110 active:scale-[0.99] ${
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

function InvestmentCard({
  tag,
  title,
  invested,
  target,
  status,
  expectedReturn,
  progress,
  onView,
}) {
  return (
    <div className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-sky-700">
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
        <span className="text-slate-500">Invested</span>
        <span className="font-semibold text-slate-900">{invested}</span>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
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
        <div className="rounded-xl bg-slate-50 px-2.5 py-2">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
            Expected Return
          </p>
          <p className="mt-1 text-[12px] font-semibold text-slate-900">
            {expectedReturn}
          </p>
        </div>
      </div>

      <button
        onClick={onView}
        className="mt-3 w-full rounded-xl bg-slate-900 py-2 text-[12px] font-semibold text-white transition hover:bg-slate-800"
      >
        View Investment
      </button>
    </div>
  );
}

function RightMetricCard({ title, value, sub, icon: Icon, tone = "sky" }) {
  const toneMap = {
    sky: "bg-sky-100 text-sky-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    indigo: "bg-indigo-100 text-indigo-700",
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

function ProfileDropdown({ user, navigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full px-1.5 py-1 transition hover:bg-white"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-200 to-indigo-200 text-[11px] font-semibold text-slate-800">
          {user?.name?.charAt(0) || "I"}
        </div>

        <div className="hidden md:block text-left">
          <p className="text-[13px] font-medium text-slate-900">
            {user?.name || "Investor"}
          </p>
        </div>

        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {open ? (
        <div className="absolute right-0 top-[110%] z-30 w-[280px] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <button
            onClick={() => navigate("/investor/profile/kyc")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <FileCheck size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Update KYC
              </p>
              <p className="text-[11px] text-slate-400">
                Manage investor verification details
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/investor/profile/bank")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Landmark size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Update Bank Details
              </p>
              <p className="text-[11px] text-slate-400">
                Add or edit payout account information
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/investor/profile")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <User size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Investor Profile
              </p>
              <p className="text-[11px] text-slate-400">
                View your investor account details
              </p>
            </div>
          </button>
        </div>
      ) : null}
    </div>
  );
}

const formatINR = (amount) => {
  const value = Number(amount || 0);
  return `Rs ${value.toLocaleString("en-IN")}`;
};

const normalizeInvestmentStatus = (investment) => {
  const paymentStatus = String(investment?.paymentStatus || "").toLowerCase();
  const status = String(investment?.status || "").toLowerCase();
  const campaignStatus = String(
    investment?.campaign?.status || investment?.campaignId?.status || ""
  ).toLowerCase();

  if (paymentStatus === "completed" || status === "confirmed") return "Confirmed";
  if (status === "failed" || paymentStatus === "failed") return "Failed";
  if (campaignStatus === "completed") return "Completed";
  return "Pending";
};

const getCampaignData = (investment) =>
  investment?.campaign || investment?.campaignId || null;

const getCampaignTarget = (campaign) =>
  Number(campaign?.fundingGoal || campaign?.moneyToRaise || 0);

const getCampaignRaised = (campaign) =>
  Number(campaign?.currentFunding || campaign?.moneyRaised || campaign?.raisedAmount || 0);

const getExpectedReturnText = (campaign) => {
  const percent = Number(campaign?.profitPercentage || 0);
  if (percent > 0) return `${percent}%`;
  return "N/A";
};

const getProfileCompletion = (user) => {
  let score = 0;
  if (user?.name) score += 20;
  if (user?.email) score += 20;
  if (user?.profile?.phone) score += 15;
  if (user?.profile?.photo) score += 15;
  if (
    ["VERIFIED", "APPROVED"].includes(
      String(user?.access?.investor?.kycStatus || "").toUpperCase()
    )
  ) {
    score += 15;
  }
  if (user?.bankDetails?.accountNumber) score += 15;
  return Math.min(score, 100);
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

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [user, setUser] = useState(localUser || null);
  const [investments, setInvestments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [investmentRes, profileRes] = await Promise.all([
          getMyInvestments(),
          getProfile(),
        ]);

        const investmentList = Array.isArray(investmentRes?.investments)
          ? investmentRes.investments
          : [];
        setInvestments(investmentList);

        const liveUser = profileRes?.user || null;
        if (liveUser) {
          setUser(liveUser);
          localStorage.setItem("user", JSON.stringify(liveUser));
        }
      } catch (err) {
        setError(err?.message || err?.error || "Failed to load investor dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const filteredInvestments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return investments;

    return investments.filter((investment) => {
      const campaign = getCampaignData(investment);
      return (
        String(campaign?.projectTitle || "").toLowerCase().includes(query) ||
        String(campaign?.projectCategory || "").toLowerCase().includes(query) ||
        String(investment?.status || "").toLowerCase().includes(query) ||
        String(investment?.paymentStatus || "").toLowerCase().includes(query)
      );
    });
  }, [investments, search]);

  const totalInvested = useMemo(
    () => investments.reduce((sum, item) => sum + Number(item?.amount || 0), 0),
    [investments]
  );

  const activeInvestments = useMemo(
    () =>
      investments.filter((item) => {
        const status = String(item?.status || "").toLowerCase();
        const paymentStatus = String(item?.paymentStatus || "").toLowerCase();
        return !["failed", "cancelled"].includes(status) && paymentStatus !== "failed";
      }).length,
    [investments]
  );

  const estimatedReturns = useMemo(
    () =>
      investments.reduce((sum, item) => {
        const campaign = getCampaignData(item);
        const percent = Number(campaign?.profitPercentage || 0);
        if (!percent) return sum;
        return sum + (Number(item?.amount || 0) * percent) / 100;
      }, 0),
    [investments]
  );

  const portfolioValue = totalInvested + estimatedReturns;
  const savedDeals = 0;
  const profileCompletion = getProfileCompletion(user);
  const kycStatus = normalizeStatusLabel(user?.access?.investor?.kycStatus, "kyc");
  const bankStatus = user?.bankDetails?.accountNumber
    ? "Linked"
    : normalizeStatusLabel(user?.access?.investor?.bankStatus, "bank");

  const chartBars = useMemo(() => {
    const monthly = Array(5).fill(0);
    const now = new Date();

    investments.forEach((item) => {
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
  }, [investments]);

  const statCards = useMemo(
    () => [
      {
        icon: Wallet,
        title: "Total Investments",
        value: formatINR(totalInvested),
        subtitle: "Amount invested from backend records",
        iconWrapClass: "bg-sky-100",
      },
      {
        icon: BriefcaseBusiness,
        title: "Active Investments",
        value: String(activeInvestments).padStart(2, "0"),
        subtitle: "Live and tracked investments",
        iconWrapClass: "bg-emerald-100",
      },
      {
        icon: IndianRupee,
        title: "Estimated Returns",
        value: formatINR(estimatedReturns),
        subtitle: "Based on campaign return percentages",
        iconWrapClass: "bg-indigo-100",
      },
      {
        icon: Heart,
        title: "Saved Opportunities",
        value: String(savedDeals).padStart(2, "0"),
        subtitle: "Not available from backend yet",
        iconWrapClass: "bg-amber-100",
      },
    ],
    [activeInvestments, estimatedReturns, totalInvested]
  );

  const firstName = user?.name?.split(" ")[0] || "Investor";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f5f8fc]">
        <p className="text-lg font-semibold text-slate-700">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full bg-[#c6d2df] text-slate-900"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="flex h-screen w-full overflow-hidden bg-[#f5f8fc]">
        <InvestorSidebar active="dashboard" />

        <div className="flex min-w-0 flex-1">
          <main
            className="scrollbar-hide min-w-0 flex-1 overflow-y-auto border-l border-slate-200 bg-[#f5f8fc] px-4 py-4 md:px-5"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full max-w-[380px]">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your investments..."
                  className="h-10 w-full rounded-full border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                />
              </div>

              <div className="ml-auto flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Home size={15} />
                  Home
                </button>
                <TopIconButton>
                  <Mail size={14} />
                </TopIconButton>

                <TopIconButton>
                  <Bell size={14} />
                </TopIconButton>

                <div className="h-6 w-px bg-slate-200" />

                <ProfileDropdown user={user} navigate={navigate} />
              </div>
            </div>

            <div className="mt-4 flex items-start justify-between gap-4">
              <div className="flex-1 rounded-[24px] bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-5 text-white shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-100">
                  Investor Dashboard
                </p>

                <h1 className="mt-2 text-[22px] font-semibold leading-tight md:text-[24px]">
                  Track your real investments, portfolio value, returns and account readiness.
                </h1>

                <div className="mt-2 text-sm text-sky-100">
                  Hello {firstName}, your dashboard is now connected to backend investment data.
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate("/browse-investors")}
                    className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100 active:scale-[0.98]"
                  >
                    Invest Now
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white">
                      <ArrowRight size={13} />
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/investor/portfolio")}
                    className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-900 active:scale-[0.98]"
                  >
                    View Portfolio -
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
                  My Investments
                </h2>

                <button
                  onClick={() => navigate("/investor/portfolio")}
                  className="text-sm font-semibold text-sky-700 hover:text-sky-800"
                >
                  See all
                </button>
              </div>

              <div className="mt-3 pr-2">
                {filteredInvestments.length === 0 ? (
                  <div className="rounded-[20px] border border-dashed border-slate-300 bg-white p-8 text-center">
                    <p className="text-lg font-semibold text-slate-800">
                      No investments found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Your confirmed and pending investments will appear here.
                    </p>
                    <button
                      onClick={() => navigate("/browse-investors")}
                      className="mt-4 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Explore Opportunities
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 xl:grid-cols-3">
                    {filteredInvestments.slice(0, 6).map((investment) => {
                      const campaign = getCampaignData(investment);
                      const target = getCampaignTarget(campaign);
                      const raised = getCampaignRaised(campaign);
                      const progress = target
                        ? Math.min(100, Math.round((raised / target) * 100))
                        : 0;

                      return (
                        <InvestmentCard
                          key={investment?._id}
                          tag={campaign?.projectCategory || "General"}
                          title={campaign?.projectTitle || "Campaign"}
                          invested={formatINR(investment?.amount)}
                          target={formatINR(target)}
                          status={normalizeInvestmentStatus(investment)}
                          expectedReturn={getExpectedReturnText(campaign)}
                          progress={progress}
                          onView={() =>
                            campaign?._id
                              ? navigate(`/investment-detail/${campaign._id}`, {
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

          <aside className="hidden w-[320px] shrink-0 border-l border-slate-200 bg-white px-4 py-5 xl:block">
            <div className="flex items-center justify-between">
              <h3 className="text-[28px] font-semibold tracking-tight text-slate-900">
                My Investor Profile
              </h3>
            </div>

            <div
              onClick={() => navigate("/investor/profile")}
              className="mt-5 flex cursor-pointer flex-col items-center rounded-[24px] border border-slate-100 bg-[#fafcff] p-4 transition hover:bg-slate-50 hover:shadow-sm"
            >
              <div className="relative flex h-[122px] w-[122px] items-center justify-center rounded-full border-[8px] border-sky-100">
                <div className="absolute inset-0 rounded-full border-[8px] border-transparent border-r-sky-500 border-t-indigo-500 rotate-[28deg]" />
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-200 to-indigo-200 text-lg font-semibold text-slate-800">
                  {user?.name?.charAt(0) || "I"}
                </div>

                <div className="absolute right-0 top-4 rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-semibold text-white">
                  {profileCompletion}%
                </div>
              </div>

              <h4 className="mt-4 text-center text-[25px] font-semibold tracking-tight text-slate-900">
                Hello {firstName}
              </h4>
              <p className="mt-1 max-w-[230px] text-center text-[11px] leading-5 text-slate-500">
                Keep your investor profile complete to improve onboarding, trust and transaction readiness.
              </p>
              <p className="mt-2 text-xs font-medium text-sky-700">
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
                sub="Live status from your investor access"
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
                          ? "bg-sky-500"
                          : "bg-sky-200"
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
                title="Portfolio Value"
                value={formatINR(portfolioValue)}
                sub="Invested amount plus estimated returns"
                icon={BriefcaseBusiness}
                tone="sky"
              />
              <RightMetricCard
                title="Returns Earned"
                value={formatINR(estimatedReturns)}
                sub="Estimated from profit-return campaigns"
                icon={LineChart}
                tone="emerald"
              />
              <RightMetricCard
                title="Saved Deals"
                value={String(savedDeals).padStart(2, "0")}
                sub="Saved opportunities API not available yet"
                icon={Heart}
                tone="indigo"
              />
            </div>

            <div
              onClick={() => navigate("/investor/analytics")}
              className="mt-5 cursor-pointer rounded-[22px] border border-slate-100 bg-[#fafcff] p-3 transition hover:bg-slate-50 hover:shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100">
                      <Eye size={15} className="text-sky-700" />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-slate-900">
                        Total Investments
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Backend investment records
                      </p>
                    </div>
                  </div>
                  <span className="text-[12px] font-semibold text-slate-900">
                    {String(investments.length).padStart(2, "0")}
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
                      investments.filter(
                        (item) => normalizeInvestmentStatus(item) === "Pending"
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
                        Portfolio Growth
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Estimated against invested capital
                      </p>
                    </div>
                  </div>
                  <span className="text-[12px] font-semibold text-emerald-600">
                    {totalInvested > 0
                      ? `+${Math.round((estimatedReturns / totalInvested) * 100)}%`
                      : "0%"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <PrimaryBlueButton
                onClick={() => navigate("/browse-investors")}
                fullWidth
              >
                Explore More Opportunities
              </PrimaryBlueButton>

              <PrimaryBlueButton
                onClick={() => navigate("/investor/portfolio")}
                fullWidth
              >
                View My Portfolio
              </PrimaryBlueButton>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
