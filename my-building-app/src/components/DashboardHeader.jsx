import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Home, Mail, Bell, ChevronDown, FileCheck, Landmark, Settings } from "lucide-react";
import api from "../lib/axiox";

export default function DashboardHeader({ user, search, setSearch }) {
  const [open, setOpen] = useState(null);
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");
  const ref = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const contributor = location.pathname.startsWith("/contributor/");
  useEffect(() => {
    const close = (event) => { if (!ref.current?.contains(event.target) || event.key === "Escape") setOpen(null); };
    document.addEventListener("pointerdown", close); document.addEventListener("keydown", close);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", close); };
  }, []);
  const toggle = (panel) => {
    setOpen(open === panel ? null : panel);
    if (panel !== "profile" && !activity) {
      setError("");
      api.get("/account/overview").then((response) => setActivity(response.data.data)).catch(() => setError("Unable to load your updates."));
    }
  };
  const updates = activity?.notifications?.filter((entry) => open !== "messages" || entry.message.includes(":")) || [];
  return <header ref={ref} className="relative z-30 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-5">
    <form className="relative w-full max-w-[380px] sm:flex-1" onSubmit={(event) => { event.preventDefault(); navigate(contributor ? "/contributor/dashboard" : "/raiser/dashboard"); }}>
      <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input aria-label={contributor ? "Search your contributions" : "Search your campaigns"} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={contributor ? "Search your contributions..." : "Search your campaigns..."} className="h-10 w-full rounded-full border border-slate-200 bg-[#fafcff] pl-9 pr-3 text-sm outline-none transition focus:border-[#8d7bff] focus:bg-white" />
    </form>
    <div className="ml-auto flex items-center gap-2">
      <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><Home size={15} />Home</Link>
      {[["messages", "Campaign messages", Mail], ["notifications", "Notifications", Bell]].map(([panel, label, Icon]) => <button key={panel} type="button" aria-label={label} title={label} aria-expanded={open === panel} onClick={() => toggle(panel)} className={`flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 ${open === panel ? "bg-[#f1edff] text-[#6f5cf2]" : "bg-white text-slate-500 hover:bg-slate-50"}`}><Icon size={14} /></button>)}
      <div className="mx-1 h-6 w-px bg-slate-200" />
      <button type="button" aria-label="Profile menu" aria-expanded={open === "profile"} onClick={() => toggle("profile")} className="flex items-center gap-2 rounded-full px-1.5 py-1 hover:bg-slate-50"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ece6ff] to-[#f5f1ff] text-[11px] font-semibold text-slate-800">{user?.name?.charAt(0) || "M"}</span><span className="hidden text-[13px] font-medium text-slate-900 md:block">{user?.name || "My Account"}</span><ChevronDown size={14} className="text-slate-400" /></button>
    </div>
    {open && <div className="absolute right-4 top-[calc(100%-4px)] z-40 w-[280px] max-w-[calc(100vw-32px)] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
      {open === "profile" ? [["/contributor/profile/kyc", "Update KYC & Documents", "Manage your verification details", FileCheck], ["/contributor/profile/bank", "Update Bank Details", "Manage your linked bank account", Landmark], ["/account", "Profile Settings", "View your shared account details", Settings]].map(([to, title, description, Icon]) => <Link key={to} to={to} onClick={() => setOpen(null)} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-50"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1edff] text-[#6f5cf2]"><Icon size={17} /></span><span><span className="block text-sm font-semibold">{title}</span><span className="block text-[11px] text-slate-400">{description}</span></span></Link>) : <><h2 className="px-3 py-2 text-sm font-semibold">{open === "messages" ? "Campaign updates" : "Notifications"}</h2><div className="max-h-72 overflow-y-auto px-3 pb-3">{error ? <p role="status" className="text-sm text-red-600">{error}</p> : !activity ? <p className="text-sm text-slate-500">Loading updates...</p> : updates.length ? updates.map((entry) => <p key={entry._id} className="border-t border-slate-100 py-3 text-sm text-slate-600">{entry.message}</p>) : <p className="text-sm text-slate-500">No new {open === "messages" ? "campaign updates" : "notifications"}.</p>}</div></>}
    </div>}
  </header>;
}
