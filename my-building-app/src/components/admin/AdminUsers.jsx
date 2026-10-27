import "./AdminUserRecords.css";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserCheck, ShieldCheck, HeartHandshake, Search, ArrowUpRight, ChevronLeft, ChevronRight, Ban, Check, FolderKanban } from "lucide-react";
import { deleteAdminUser, getAdminUsers, updateAdminUser } from "../../api/admin";
import AdminRecordHeader from "./AdminRecordHeader";

const PAGE_SIZE = 10;
const date = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const identity = (user) => user.kycStatus || user.contributorAccess?.kycStatus || user.raiserAccess?.kycStatus || "NONE";
const bank = (user) => user.contributorAccess?.bankStatus || user.raiserAccess?.bankStatus || "NONE";
function Status({ value }) {
  const tone = ["VERIFIED", "active"].includes(value) ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60" : value === "PENDING" ? "bg-amber-50 text-amber-700 ring-amber-200/60" : ["REJECTED", "disabled"].includes(value) ? "bg-rose-50 text-rose-700 ring-rose-200/60" : "bg-slate-50 text-slate-500 ring-slate-200";
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${tone}`}>{({ VERIFIED: "Verified", PENDING: "Pending", REJECTED: "Rejected", NONE: "Not submitted", active: "Active", disabled: "Disabled" })[value] || value}</span>;
}

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [activity, setActivity] = useState("all");
  const [verification, setVerification] = useState("all");
  const [account, setAccount] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [processing, setProcessing] = useState("");
  useEffect(() => {
    let active = true; setLoading(true); setError("");
    getAdminUsers().then((response) => { if (active) setUsers((response.users || []).filter((user) => user.role !== "admin")); }).catch(() => { if (active) setError("Unable to load user accounts. Please retry."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = (users || []).filter((user) => {
      const raised = Number(user.activities?.raising || 0), contributed = Number(user.activities?.contributing || 0);
      return (!query || [user.name, user.email, user.username, user.phone, user._id].join(" ").toLowerCase().includes(query))
        && (activity === "all" || (activity === "raising" && raised > 0) || (activity === "contributing" && contributed > 0) || (activity === "both" && raised > 0 && contributed > 0) || (activity === "none" && !raised && !contributed))
        && (verification === "all" || identity(user) === verification)
        && (account === "all" || (user.accountStatus || "active") === account);
    });
    return list.sort((a, b) => sort === "name" ? String(a.name || "").localeCompare(String(b.name || "")) : (new Date(b.createdAt || 0) - new Date(a.createdAt || 0)) * (sort === "oldest" ? -1 : 1));
  }, [users, search, activity, verification, account, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const reset = () => { setSearch(""); setActivity("all"); setVerification("all"); setAccount("all"); setPage(1); };
  const changeStatus = async (user) => {
    const disabled = user.accountStatus === "disabled";
    if (!window.confirm(`${disabled ? "Enable" : "Disable"} ${user.name || "this account"}? ${disabled ? "The user will be able to sign in again." : "Their campaigns and financial history will be preserved."}`)) return;
    setProcessing(user._id); setError(""); setNotice("");
    try {
      if (disabled) await updateAdminUser(user._id, { accountStatus: "active" }); else await deleteAdminUser(user._id);
      setUsers((previous) => previous.map((entry) => entry._id === user._id ? { ...entry, accountStatus: disabled ? "active" : "disabled" } : entry));
      setNotice(`Account ${disabled ? "enabled" : "disabled"}.`);
    } catch (err) { setError(err.response?.data?.message || "Unable to update account status."); }
    finally { setProcessing(""); }
  };
  const metrics = [["Total accounts", users?.length, Users, "bg-slate-100 text-slate-700"], ["Active accounts", users?.filter((user) => user.accountStatus !== "disabled").length, UserCheck, "bg-emerald-50 text-emerald-600"], ["KYC awaiting review", users?.filter((user) => identity(user) === "PENDING").length, ShieldCheck, "bg-amber-50 text-amber-600"], ["Contributing accounts", users?.filter((user) => user.activities?.contributing > 0).length, HeartHandshake, "bg-violet-50 text-violet-600"]];
  return <div className="admin-user-records admin-user-directory">
    <AdminRecordHeader title="User Management" description="Every account. Every activity. One clear workspace." refreshing={loading} onRefresh={() => setRevision(revision + 1)} />
    <section aria-label="User summary" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, Icon, tone]) => <div key={label} className="user-summary-card relative flex items-center gap-4 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm"><span className={`rounded-xl p-3 ${tone}`}><Icon size={21} /></span><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-[30px] font-bold tracking-tight text-slate-900">{value ?? "—"}</p></div></div>)}</section>
    {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
    <section className="user-directory-table overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-lg font-bold tracking-tight text-slate-900">Account Directory <span className="ml-2 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">{users?.length ?? "—"}</span></h2><p className="mt-1 text-xs text-slate-500">Raise and contribute from the same account.</p></div><label className="relative w-full sm:w-80"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search users" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, email or account ID..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white" /></label></div>
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3">{[["Activity", activity, setActivity, [["all", "All activity"], ["raising", "Raise Funds"], ["contributing", "Contribute Funds"], ["both", "Both activities"], ["none", "No activity yet"]]], ["KYC", verification, setVerification, [["all", "All KYC statuses"], ["PENDING", "Pending review"], ["VERIFIED", "Verified"], ["REJECTED", "Rejected"], ["NONE", "Not submitted"]]], ["Account", account, setAccount, [["all", "All accounts"], ["active", "Active"], ["disabled", "Disabled"]]], ["Sort", sort, setSort, [["newest", "Newest first"], ["oldest", "Oldest first"], ["name", "Name A–Z"]]]].map(([label, value, setter, options]) => <label key={label} className="text-[11px] font-medium text-slate-500">{label}<select aria-label={label} value={value} onChange={(event) => { setter(event.target.value); setPage(1); }} className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700">{options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></label>)}{(search || activity !== "all" || verification !== "all" || account !== "all") && <button onClick={reset} className="text-xs font-semibold text-indigo-600">Reset filters</button>}</div>
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-400"><tr>{["User", "Funding activity", "KYC", "Bank", "Account", "Joined", "Actions"].map((label) => <th key={label} className="px-5 py-3 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{visible.map((user) => <tr key={user._id} className="transition hover:bg-slate-50/70"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-100 to-indigo-100 text-sm font-semibold text-slate-600">{user.photo ? <img src={user.photo} alt="" className="h-full w-full object-cover" /> : (user.name || "U").charAt(0).toUpperCase()}</span><div><Link to={`/admin/users/${user._id}`} className="text-[14px] font-bold tracking-tight text-slate-900 hover:text-indigo-600">{user.name || "Unnamed user"}</Link><p className="mt-1 text-xs text-slate-500">{user.email || "No email"}</p></div></div></td><td className="px-5 py-4"><div className="space-y-1.5">{user.activities?.raising > 0 && <p className="flex items-center gap-1.5 text-xs text-sky-700"><FolderKanban size={13} />Raise Funds <span className="font-semibold">{user.activities.raising}</span></p>}{user.activities?.contributing > 0 && <p className="flex items-center gap-1.5 text-xs text-violet-700"><HeartHandshake size={13} />Contribute Funds <span className="font-semibold">{user.activities.contributing}</span></p>}{!user.activities?.raising && !user.activities?.contributing && <span className="text-xs text-slate-400">No activity yet</span>}</div></td><td className="px-5 py-4"><Status value={identity(user)} /></td><td className="px-5 py-4"><Status value={bank(user)} /></td><td className="px-5 py-4"><Status value={user.accountStatus || "active"} /></td><td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{date(user.createdAt)}</td><td className="px-5 py-4"><div className="flex items-center gap-2"><Link to={`/admin/users/${user._id}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-white">View<ArrowUpRight size={13} /></Link><button title={user.accountStatus === "disabled" ? "Enable account" : "Disable account"} aria-label={`${user.accountStatus === "disabled" ? "Enable" : "Disable"} ${user.name || "user"}`} disabled={Boolean(processing)} onClick={() => changeStatus(user)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30">{user.accountStatus === "disabled" ? <Check size={16} /> : <Ban size={16} />}</button></div></td></tr>)}</tbody></table>{!visible.length && <div className="px-5 py-14 text-center"><Users size={30} className="mx-auto mb-3 text-slate-300" /><p className="text-sm font-medium text-slate-600">{!users && loading ? "Loading accounts..." : !users && error ? "Account records unavailable." : "No users match these filters."}</p>{users && <button onClick={reset} className="mt-3 text-xs font-semibold text-indigo-600">Clear filters</button>}</div>}</div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4"><p className="text-xs text-slate-500">{filtered.length ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length} users` : "0 users"}</p><div className="flex items-center gap-3"><button aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-30"><ChevronLeft size={15} /></button><span className="text-xs text-slate-500">Page {currentPage} of {pages}</span><button aria-label="Next page" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-30"><ChevronRight size={15} /></button></div></footer>
    </section>
  </div>;
}
