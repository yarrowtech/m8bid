import { NavLink, useLocation } from "react-router-dom";

export default function AccountNavigation() {
  const { pathname } = useLocation();
  const activityLinks = pathname.startsWith("/raiser/")
    ? [["/raiser/campaigns", "My Campaigns"], ["/raiser/analytics", "Funding Analytics"], ["/raiser/withdrawals", "Payouts"]]
    : pathname.startsWith("/contributor/")
    ? [["/contributor/portfolio", "Supported Campaigns"], ["/contributor/analytics", "Contribution Analytics"], ["/contributor/transactions", "Transactions"]]
    : [["/contributor/profile/kyc", "KYC & Verification"], ["/contributor/profile/bank", "Bank Details"], ["/account/security", "Account Security"]];
  return <div className="shrink-0"><nav aria-label="Account sections" className="flex flex-wrap gap-2 border-b border-slate-200 bg-white px-4 py-3">
    {[["/dashboard", "Overview"], ["/raiser/dashboard", "Raise Funds"], ["/contributor/dashboard", "Contribute Funds"], ["/account", "My Account"]].map(([to, label]) =>
      <NavLink key={to} to={to} className={({ isActive }) => `rounded-xl px-4 py-2 text-sm font-semibold ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{label}</NavLink>)}
  </nav><nav aria-label="Activity sections" className="flex flex-wrap gap-3 border-b border-slate-200 bg-white px-4 py-2 text-sm">{activityLinks.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? "font-bold text-blue-700" : "text-slate-600 hover:text-blue-700"}>{label}</NavLink>)}</nav></div>;
}
