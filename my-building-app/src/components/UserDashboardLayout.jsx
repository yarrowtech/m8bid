import { Suspense, useEffect, useState } from "react";
import PageLoader from "./PageLoader";
import { Link, NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, HeartHandshake, FolderOpen, UserRound, ShieldCheck, Landmark, ChartNoAxesCombined, Receipt, Wallet, ArrowLeft, Search } from "lucide-react";
import DashboardHeader from "./DashboardHeader";
import DashboardProfilePanel from "./DashboardProfilePanel";
import { getInvestorProfile } from "../api/investor.api";

const sections = [
  ["Your dashboard", [["/dashboard", "Overview", LayoutDashboard], ["/raiser/dashboard", "Raise Funds", FolderOpen], ["/contributor/dashboard", "Contribute Funds", HeartHandshake], ["/browse-contributors", "Browse Campaigns", Search]]],
  ["Funding activity", [["/raiser/campaigns", "My Campaigns", FolderOpen], ["/raiser/analytics", "Funding Analytics", ChartNoAxesCombined], ["/raiser/withdrawals", "Payouts", Wallet], ["/contributor/portfolio", "Supported Campaigns", HeartHandshake], ["/contributor/analytics", "Contribution Analytics", ChartNoAxesCombined], ["/contributor/transactions", "Transactions", Receipt]]],
  ["My account", [["/account", "Personal Profile", UserRound], ["/contributor/profile/kyc", "KYC & Verification", ShieldCheck], ["/contributor/profile/bank", "Bank Details", Landmark], ["/account/security", "Account Security", ShieldCheck]]],
];

export default function UserDashboardLayout() {
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null"); } catch { return null; }
  });
  const [error, setError] = useState("");
  const refreshProfile = () => getInvestorProfile().then(setProfile).catch(() => setError("Unable to load your profile."));
  useEffect(() => {
    let active = true;
    getInvestorProfile().then((data) => { if (active) setProfile(data); }).catch(() => { if (active) setError("Unable to load your profile."); });
    return () => { active = false; };
  }, []);
  const user = profile?.user || profile;
  return <div data-scroll-motion-disabled className="flex h-dvh overflow-hidden bg-[#f5f8fc] text-slate-900">
    <aside aria-label="Dashboard navigation" className="w-44 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-3 md:w-[255px] md:p-5">
      <Link to="/dashboard" className="mb-6 block text-2xl font-bold tracking-tight text-[#6f5cf2]">MateBid</Link>
      {sections.map(([title, links]) => <section key={title} className="mb-6"><h2 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</h2><nav aria-label={title} className="space-y-1">{links.map(([to, label, Icon]) => <NavLink end key={to} to={to} aria-label={label} title={label} className={({ isActive }) => `flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-[#f1edff] text-[#6f5cf2]" : "text-slate-600 hover:bg-slate-50"}`}><span className="dashboard-nav-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100"><Icon size={17} /></span><span>{label}</span></NavLink>)}</nav></section>)}
      <Link to="/" className="flex items-center gap-2 px-3 text-sm text-slate-500"><ArrowLeft size={16} />Back to website</Link>
    </aside>
    <div className="flex min-w-0 flex-1 flex-col">
      <DashboardHeader user={user} search={search} setSearch={setSearch} />
      <div className="flex min-h-0 flex-1">
        <main aria-label="Dashboard content" className="user-dashboard-content min-w-0 flex-1 overflow-y-auto"><Suspense fallback={<PageLoader />}><Outlet context={{ search }} /></Suspense></main>
        <DashboardProfilePanel user={user} error={error} onRetry={refreshProfile} />
      </div>
    </div>
  </div>;
}
