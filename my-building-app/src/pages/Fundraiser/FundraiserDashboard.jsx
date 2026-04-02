import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Mail,
  Bell,
  ArrowRight,
  MoreVertical,
  FolderKanban,
  IndianRupee,
  Wallet,
  ChevronDown,
  FileCheck,
  Landmark,
  Settings,
  Home,
  BadgeCheck,
  BriefcaseBusiness,
  CircleDollarSign,
} from "lucide-react";
import FundraiserSidebar from "./FundraiserSidebar";
import { getDashboardData } from "../../api/fundraiser.api";

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

function MiniStatCard({ icon: Icon, title, value, subtitle, iconWrapClass }) {
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

function getStatusClass(status) {
  if (status === "approved") return "text-emerald-600";
  if (status === "pending") return "text-amber-600";
  if (status === "rejected") return "text-rose-600";
  return "text-slate-600";
}

function CampaignCard({
  tag,
  title,
  raised,
  target,
  status,
  daysLeft,
  progress,
  onView,
}) {
  return (
    <div className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-sky-700">
          {tag || "General"}
        </span>
        <button className="rounded-full p-1 text-slate-400 hover:bg-slate-50">
          <MoreVertical size={13} />
        </button>
      </div>

      <h3 className="mt-3 text-[15px] font-semibold leading-5 text-slate-900">
        {title}
      </h3>

      <div className="mt-3 flex items-center justify-between text-[12px]">
        <span className="text-slate-500">Raised</span>
        <span className="font-semibold text-slate-900">{raised}</span>
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
          <p className={`mt-1 text-[12px] font-semibold ${getStatusClass(status)}`}>
            {status}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 px-2.5 py-2">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
            Days Left
          </p>
          <p className="mt-1 text-[12px] font-semibold text-slate-900">
            {daysLeft}
          </p>
        </div>
      </div>

    <button
  onClick={onView}
  className="mt-3 w-full rounded-xl bg-slate-900 py-2 text-[12px] font-semibold text-white transition hover:bg-slate-800"
>
  View Campaign
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
    rose: "bg-rose-100 text-rose-700",
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
          {user?.name?.charAt(0) || "J"}
        </div>

        <div className="hidden text-left md:block">
          <p className="text-[13px] font-medium text-slate-900">
            {user?.name || "Fundraiser"}
          </p>
        </div>

        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {open ? (
        <div className="absolute right-0 top-[110%] z-30 w-[280px] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <button
            onClick={() => navigate("/fundraiser/profile/kyc")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <FileCheck size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Update your KYC & Documents
              </p>
              <p className="text-[11px] text-slate-400">
                Upload fundraiser required documents
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/fundraiser/profile/bank")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Landmark size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Link your Bank Account Here
              </p>
              <p className="text-[11px] text-slate-400">
                Add payout and withdrawal details
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/fundraiser/profile")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Settings size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Profile Settings
              </p>
              <p className="text-[11px] text-slate-400">
                Manage your fundraiser account
              </p>
            </div>
          </button>
        </div>
      ) : null}
    </div>
  );
}

const formatINR = (amount) => {
  const n = Number(amount || 0);
  return `₹${n.toLocaleString("en-IN")}`;
};

const calcDaysLeft = (deadline) => {
  if (!deadline) return "—";
  const now = new Date();
  const end = new Date(deadline);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Ended";
  return `${diff} Days`;
};

const calcProgress = (raised, target) => {
  const r = Number(raised || 0);
  const t = Number(target || 0);
  if (!t || t <= 0) return 0;
  return Math.min(100, Math.round((r / t) * 100));
};

export default function FundraiserDashboard() {
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [user] = useState(localUser || null);
  const [fundraisers, setFundraisers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const userId = localUser?._id || localUser?.id;
        if (!userId) {
          setError("User not found. Please login again.");
          return;
        }

        const res = await getDashboardData(userId);
        setFundraisers(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        setError(err?.message || err?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [localUser?._id, localUser?.id]);

  const filteredFundraisers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return fundraisers;

    return fundraisers.filter((item) => {
      return (
        item?.projectTitle?.toLowerCase().includes(q) ||
        item?.projectCategory?.toLowerCase().includes(q) ||
        item?.status?.toLowerCase().includes(q)
      );
    });
  }, [fundraisers, search]);

  const totalCampaigns = fundraisers.length;
  const approvedCount = fundraisers.filter((f) => f.status === "approved").length;
  const totalRaised = fundraisers.reduce(
    (sum, item) => sum + Number(item?.raisedAmount || 0),
    0
  );

  const totalTarget = fundraisers.reduce(
    (sum, item) => sum + Number(item?.moneyToRaise || 0),
    0
  );

  const profileCompletion = useMemo(() => {
    let score = 0;
    if (user?.name) score += 20;
    if (user?.email) score += 20;
    if (user?.phone) score += 15;
    if (user?.avatar || user?.profileImage) score += 15;
    if (user?.kycStatus) score += 15;
    if (user?.bankDetails?.accountNumber) score += 15;
    return Math.min(score, 100);
  }, [user]);

  const kycStatus = user?.kycStatus || "Pending";

  const bankLinked = Boolean(user?.bankDetails?.accountNumber);

  const stats = [
    {
      icon: FolderKanban,
      title: "No of Campaigns",
      value: String(totalCampaigns).padStart(2, "0"),
      subtitle: "Your total created campaigns",
      iconWrapClass: "bg-sky-100",
    },
    {
      icon: IndianRupee,
      title: "Total Fund Raised",
      value: formatINR(totalRaised),
      subtitle: "Raised across all your campaigns",
      iconWrapClass: "bg-emerald-100",
    },
    {
      icon: Wallet,
      title: "Total Withdrawals",
      value: formatINR(0),
      subtitle: "No withdrawal API connected yet",
      iconWrapClass: "bg-indigo-100",
    },
  ];

  const firstName = user?.name?.split(" ")[0] || "Fundraiser";

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
        <FundraiserSidebar active="dashboard" />

        <div className="flex min-w-0 flex-1">
          <main
            className="min-w-0 flex-1 overflow-y-auto border-l border-slate-200 bg-[#f5f8fc] px-4 py-4 scrollbar-hide md:px-5"
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
                  placeholder="Search your campaigns..."
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
                  Fundraiser Dashboard
                </p>

                <h1 className="mt-2 text-[22px] font-semibold leading-tight md:text-[24px]">
                  Manage your fundraiser profile, documents, campaigns and withdrawals.
                </h1>

                <div className="mt-2 text-sm text-sky-100">
                  Hello {firstName}, all your real fundraiser data is shown here.
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate("/start-fundraiser")}
                    className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100 active:scale-[0.98]"
                  >
                    Start a Fundraiser
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white">
                      <ArrowRight size={13} />
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/browse-investors")}
                    className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-900 active:scale-[0.98]"
                  >
                    Explore Investments →
                  </button>
                </div>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {stats.map((item, i) => (
                <MiniStatCard key={i} {...item} />
              ))}
            </div>

            <section className="mt-5 rounded-[24px] bg-[#f5f8fc]">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[22px] font-semibold tracking-tight text-slate-900">
                  Campaign Cards
                </h2>

                <button
                  onClick={() => navigate("/fundraiser/campaigns")}
                  className="text-sm font-semibold text-sky-700 hover:text-sky-800"
                >
                  See all
                </button>
              </div>

              <div className="mt-3 pr-2">
                {filteredFundraisers.length === 0 ? (
                  <div className="rounded-[20px] border border-dashed border-slate-300 bg-white p-8 text-center">
                    <p className="text-lg font-semibold text-slate-800">
                      No campaigns found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Create a fundraiser and it will appear here.
                    </p>
                    <button
                      onClick={() => navigate("/start-fundraiser")}
                      className="mt-4 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Create Campaign
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 xl:grid-cols-3">
                    {filteredFundraisers.map((item) => (
                     <CampaignCard
  key={item._id}
  tag={item.projectCategory}
  title={item.projectTitle}
  raised={formatINR(item.raisedAmount)}
  target={formatINR(item.moneyToRaise)}
  status={item.status}
  daysLeft={calcDaysLeft(item.deadline)}
  progress={calcProgress(item.raisedAmount, item.moneyToRaise)}
   onView={() =>
  navigate(`/investment-detail/${item._id}`, {
    state: { campaign: item },
  })
}
/>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </main>

          <aside className="hidden w-[320px] shrink-0 border-l border-slate-200 bg-white px-4 py-5 xl:block">
            <div className="flex items-center justify-between">
              <h3 className="text-[28px] font-semibold tracking-tight text-slate-900">
                My Fundraiser Profile
              </h3>
            </div>

            <div
              onClick={() => navigate("/fundraiser/profile")}
              className="mt-5 flex cursor-pointer flex-col items-center rounded-[24px] border border-slate-100 bg-[#fafcff] p-4 transition hover:bg-slate-50 hover:shadow-sm"
            >
              <div className="relative flex h-[122px] w-[122px] items-center justify-center rounded-full border-[8px] border-sky-100">
                <div className="absolute inset-0 rotate-[28deg] rounded-full border-[8px] border-transparent border-r-sky-500 border-t-indigo-500" />
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-200 to-indigo-200 text-lg font-semibold text-slate-800">
                  {user?.name?.charAt(0) || "J"}
                </div>

                <div className="absolute right-0 top-4 rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-semibold text-white">
                  {approvedCount > 0 ? "Live" : "New"}
                </div>
              </div>

              <h4 className="mt-4 text-center text-[25px] font-semibold tracking-tight text-slate-900">
                Hello {firstName} 👋
              </h4>
              <p className="mt-1 max-w-[230px] text-center text-[11px] leading-5 text-slate-500">
                Complete your fundraiser profile to improve campaign trust and approvals.
              </p>
              <p className="mt-2 text-xs font-medium text-sky-700">
                View Profile →
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              <div
                onClick={() => navigate("/fundraiser/profile")}
                className="cursor-pointer rounded-2xl transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <RightMetricCard
                  title="Profile Completion"
                  value={`${profileCompletion}%`}
                  sub="Based on available user details"
                  icon={BadgeCheck}
                  tone="sky"
                />
              </div>

              <div
                onClick={() => navigate("/fundraiser/profile/kyc")}
                className="cursor-pointer rounded-2xl transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <RightMetricCard
                  title="KYC Status"
                  value={String(kycStatus)}
                  sub="Based on current account data"
                  icon={FileCheck}
                  tone={
                    String(kycStatus).toLowerCase().includes("approved") ||
                    String(kycStatus).toLowerCase().includes("verified")
                      ? "emerald"
                      : String(kycStatus).toLowerCase().includes("rejected")
                      ? "rose"
                      : "amber"
                  }
                />
              </div>

              <div
                onClick={() => navigate("/fundraiser/profile/bank")}
                className="cursor-pointer rounded-2xl transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <RightMetricCard
                  title="Bank Account"
                  value={bankLinked ? "Linked" : "Not Linked"}
                  sub="Based on account details"
                  icon={Landmark}
                  tone={bankLinked ? "emerald" : "indigo"}
                />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div
                onClick={() => navigate("/fundraiser/campaigns")}
                className="cursor-pointer rounded-2xl transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <RightMetricCard
                  title="Approved Campaigns"
                  value={String(approvedCount).padStart(2, "0")}
                  sub="Visible to investors"
                  icon={BriefcaseBusiness}
                  tone="sky"
                />
              </div>

              <div
                onClick={() => navigate("/fundraiser/analytics")}
                className="cursor-pointer rounded-2xl transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <RightMetricCard
                  title="Total Raised"
                  value={formatINR(totalRaised)}
                  sub={`Against target ${formatINR(totalTarget)}`}
                  icon={IndianRupee}
                  tone="emerald"
                />
              </div>

              <div
                onClick={() => navigate("/fundraiser/withdrawals")}
                className="cursor-pointer rounded-2xl transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <RightMetricCard
                  title="Total Withdrawals"
                  value={formatINR(0)}
                  sub="Withdrawal system not connected yet"
                  icon={CircleDollarSign}
                  tone="indigo"
                />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <PrimaryBlueButton
                onClick={() => navigate("/fundraiser/profile/kyc")}
                fullWidth
              >
                Update KYC & Documents
              </PrimaryBlueButton>

              <PrimaryBlueButton
                onClick={() => navigate("/fundraiser/profile/bank")}
                fullWidth
              >
                Link Bank Account
              </PrimaryBlueButton>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}