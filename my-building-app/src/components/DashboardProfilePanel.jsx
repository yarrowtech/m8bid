import { Link } from "react-router-dom";
import { BadgeCheck, ShieldCheck, Landmark, ArrowRight } from "lucide-react";

function Metric({ title, value, icon: Icon, tone = "sky", to }) {
  const tones = { sky: "bg-[#f1edff] text-[#6f5cf2]", emerald: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700", indigo: "bg-[#f3efff] text-[#7b68f4]" };
  return <Link to={to} className="block rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-indigo-300 focus-visible:outline-2 focus-visible:outline-indigo-500"><div className="flex items-center gap-3"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}><Icon size={16} /></div><div className="min-w-0"><p className="text-xs font-medium text-slate-500">{title}</p><p className="mt-1 text-base font-semibold text-slate-900">{value}</p></div></div></Link>;
}

export default function DashboardProfilePanel({ user, error, onRetry }) {
  const access = user?.access?.contributor || user?.access?.investor || {};
  const kyc = user?.kycStatus || access.kycStatus;
  const bank = access.bankStatus || user?.access?.fundraiser?.bankStatus;
  const status = (value) => value === "VERIFIED" ? "Verified" : value === "PENDING" ? "Pending Review" : value === "REJECTED" ? "Rejected" : "Not Submitted";
  const completion = Math.min(100, (user?.name ? 20 : 0) + (user?.email ? 20 : 0) + (user?.profile?.phone ? 15 : 0) + (user?.profile?.photo ? 15 : 0) + (kyc === "VERIFIED" ? 15 : 0) + ((user?.bankDetails?.accountNumber || access.bankDetails?.accountNumber) ? 15 : 0));
  const firstName = user?.name?.split(" ")[0] || "there";
  return <aside aria-label="My profile" className="dashboard-profile-panel w-[300px] shrink-0 overflow-y-auto border-l-2 border-[#c5b9e7] bg-gradient-to-b from-[#eee8fa] via-[#f2edfb] to-[#eaf0fb] px-5 py-5 shadow-[-6px_0_18px_-10px_rgba(76,57,130,0.25)]">
    <h2 className="text-[22px] font-semibold tracking-tight text-slate-900">My Profile</h2>
    <Link to="/account" className="mt-4 flex flex-col items-center border-b border-[#c2b5e6] pb-4">
      <div className="relative flex h-[96px] w-[96px] items-center justify-center rounded-full border-[8px] border-[#f1edff]">
        <div className="absolute inset-0 rotate-[28deg] rounded-full border-[8px] border-transparent border-r-[#6f5cf2] border-t-[#8d7bff]" />
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#ece6ff] to-[#f5f1ff] text-lg font-semibold text-slate-800">{user?.profile?.photo ? <img src={user.profile.photo} alt={user.name || "Profile"} className="h-full w-full object-cover" /> : user?.name?.charAt(0) || "M"}</div>
        <span className="absolute right-0 top-4 rounded-full bg-[#6f5cf2] px-2 py-0.5 text-[9px] font-semibold text-white">{completion}%</span>
      </div>
      <h3 className="mt-3 text-center text-[20px] font-semibold tracking-tight text-slate-900">Hello {firstName}</h3>
      <p className="mt-1 max-w-[230px] text-center text-[11px] leading-5 text-slate-500">Keep your profile complete to improve campaign trust, verification and payment readiness.</p>
      <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#6f5cf2]">View Profile <ArrowRight size={15} aria-hidden="true" /></span>

    </Link>
    {error && <p role="status" className="mt-3 text-sm text-red-600">{error}<button onClick={onRetry} className="ml-2 underline">Retry</button></p>}
    <div className="mt-4 grid gap-3">
      <Metric title="Profile Completion" value={`${completion}%`} icon={BadgeCheck} to="/account" />
      <Metric title="KYC Status" value={status(kyc)} icon={ShieldCheck} tone={kyc === "VERIFIED" ? "emerald" : "amber"} to="/contributor/profile/kyc" />
      <Metric title="Bank Account" value={bank === "VERIFIED" ? "Linked" : status(bank)} icon={Landmark} tone={bank === "VERIFIED" ? "indigo" : "amber"} to="/contributor/profile/bank" />
    </div>
  </aside>;
}
