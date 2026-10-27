import AdminCampaignRecord from "./AdminCampaignRecord";
import "./AdminUserRecords.css";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, UserRound, Mail, Phone, ShieldCheck, Landmark, FolderKanban, HeartHandshake, Receipt, FileText, ExternalLink } from "lucide-react";
import { getAdminUserDetails, updateUserDocumentStatus, approveCampaign, rejectCampaign, deleteCampaign } from "../../api/admin";
import AdminRecordHeader from "./AdminRecordHeader";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
const date = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const card = "rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm";
const statuses = ["NONE", "PENDING", "VERIFIED", "REJECTED"];
const title = (value) => String(value).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ");
function Badge({ value = "NONE" }) {
  const status = String(value).toLowerCase();
  const color = ["verified", "approved", "completed", "confirmed", "active", "processed"].includes(status) ? "bg-emerald-50 text-emerald-700" : ["pending", "processing", "created"].includes(status) ? "bg-amber-50 text-amber-700" : ["rejected", "disabled", "failed", "refunded"].includes(status) ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-500";
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${color}`}>{status === "none" ? "Not submitted" : status}</span>;
}
function Fields({ entries }) {
  return <dl className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">{entries.map(([label, value]) => <div key={label}><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1.5 break-words text-sm font-medium text-slate-800">{value || "—"}</dd></div>)}</dl>;
}
function Records({ columns, rows, empty }) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{columns.map((label) => <th key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map(([id, cells]) => <tr key={id} className="hover:bg-slate-50/50">{cells.map((cell, index) => <td key={index} className="px-4 py-4 align-top text-sm text-slate-600">{cell}</td>)}</tr>)}</tbody></table>{!rows.length && <p className="py-10 text-center text-sm text-slate-400">{empty}</p>}</div>;
}
function documentUrl(value) {
  const raw = typeof value === "string" ? value : value?.url || value?.secure_url || "";
  if (!raw) return "";
  try { const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "/"); const url = new URL(raw, base); return ["http:", "https:"].includes(url.protocol) ? url.href : ""; } catch { return ""; }
}

export default function AdminUserDetails() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [tab, setTab] = useState("profile");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true; setLoading(true); setError(""); setUser(null);
    getAdminUserDetails(userId).then((response) => { if (active) setUser(response.user); }).catch((err) => { if (active) setError(err.response?.data?.message || "Unable to load this user."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, revision]);
  const refresh = async () => { const response = await getAdminUserDetails(userId); setUser(response.user); };
  const verify = async (kind, status) => {
    setBusy(kind); setError(""); setNotice("");
    try { await updateUserDocumentStatus(userId, kind === "company" ? "raiser" : "contributor", kind, status); await refresh(); setNotice(`${title(kind)} status updated.`); }
    catch (err) { setError(err.response?.data?.message || "Unable to update verification."); }
    finally { setBusy(""); }
  };
  const campaignAction = async (entry, action) => {
    if (action === "delete" && !window.confirm(`Delete ${entry.projectTitle}? Campaigns with contribution history cannot be deleted.`)) return;
    setBusy(entry._id); setError(""); setNotice("");
    try { await ({ approve: approveCampaign, reject: rejectCampaign, delete: deleteCampaign })[action](entry._id); await refresh(); setNotice("Campaign updated."); }
    catch (err) { setError(err.response?.data?.message || "Unable to update campaign."); }
    finally { setBusy(""); }
  };
  const raiser = user?.raiserAccess || user?.fundraiserAccess || {};
  const contributor = user?.contributorAccess || user?.investorAccess || {};
  const profile = user?.profile || {}, bank = user?.bankDetails || {};
  const campaigns = user?.campaigns || [], contributions = user?.contributions || [], transactions = user?.transactions || [];
  const confirmed = contributions.filter((entry) => entry.paymentStatus === "completed" && entry.status === "confirmed");
  const docs = { ...raiser.documents, ...Object.fromEntries(Object.entries(contributor.documents || {}).filter(([, value]) => value)) };
  const shared = [["kyc", "Identity verification", user?.kycStatus || contributor.kycStatus || raiser.kycStatus || "NONE", docs.kyc || docs.addressProof], ["pan", "PAN verification", contributor.panStatus || raiser.panStatus || "NONE", docs.pan], ["bank", "Bank verification", contributor.bankStatus || raiser.bankStatus || "NONE", docs.bankProof]];
  if (raiser.type === "company") shared.push(["company", "Company documents", raiser.companyStatus || "NONE", docs.gst || docs.license || docs.incorporation]);
  const tabs = [["profile", "Profile & Bank", UserRound], ["verification", "Verification & Documents", ShieldCheck], ["campaigns", `Campaigns (${campaigns.length})`, FolderKanban], ["contributions", `Contributions (${contributions.length})`, HeartHandshake], ["transactions", `Transactions (${transactions.length})`, Receipt]];
  return <div className="admin-user-records admin-user-detail space-y-6">
    <AdminRecordHeader title="Account Workspace" description="Profile, verification and financial activity in one place." refreshing={loading} onRefresh={() => setRevision(revision + 1)}><Link to="/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><ArrowLeft size={16} />All users</Link></AdminRecordHeader>
    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
    {!user ? <p role="status" className={`${card} py-12 text-center text-slate-500`}>{loading ? "Loading user records..." : "User records unavailable."}</p> : <>
      <section className="user-identity-card overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm"><div className="user-identity-banner flex flex-wrap items-center justify-between gap-5 p-6 sm:p-7"><div className="flex items-center gap-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-indigo-100 text-2xl font-semibold text-slate-600">{user.photo ? <img src={user.photo} alt="" className="h-full w-full object-cover" /> : user.name?.charAt(0) || "U"}</div><div><h2 className="user-identity-name text-[28px] font-bold tracking-tight text-slate-900">{user.name || "Unnamed user"}</h2><p className="user-identity-contact mt-1 flex items-center gap-1.5 text-sm text-slate-500"><Mail size={13} />{user.email}</p><p className="user-identity-contact mt-1 flex items-center gap-1.5 text-xs text-slate-400"><Phone size={12} />{user.phone || profile.phone || "Phone not provided"}</p></div></div><div className="space-y-2 text-right"><Badge value={user.accountStatus || "active"} /><p className="user-identity-contact text-xs text-slate-400">Joined {date(user.createdAt)}</p></div></div><div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-xs text-slate-500"><span className="break-all">Account ID: {user._id}</span><span>Role: {user.role || "user"}</span><span>Updated {date(user.updatedAt)}</span></div></section>
      <section aria-label="Funding summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Campaigns created", campaigns.length], ["Total raised", money(campaigns.reduce((sum, entry) => sum + Number(entry.moneyRaised || entry.currentFunding || 0), 0))], ["Confirmed contributions", confirmed.length], ["Total contributed", money(confirmed.reduce((sum, entry) => sum + Number(entry.amount), 0))]].map(([label, value]) => <div key={label} className={`${card} user-summary-card`}><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p></div>)}</section>
      <nav aria-label="User record sections" className="user-record-tabs flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-white p-2">{tabs.map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold ${tab === id ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-500 hover:bg-slate-50"}`}><Icon size={15} />{label}</button>)}</nav>
      {tab === "profile" && <div className="grid items-start gap-5 xl:grid-cols-2"><section className={card}><h3 className="flex items-center gap-2 text-base font-semibold"><UserRound size={17} className="text-indigo-500" />Personal information</h3><Fields entries={[["Full name", user.name], ["Username", user.username], ["Email", user.email], ["Phone", profile.phone || user.phone], ["Address", profile.addressLine], ["City", profile.city], ["State", profile.state], ["PIN code", profile.pincode], ["Saved campaigns", String(user.savedCampaigns?.length || 0)]]} /></section><section className={card}><h3 className="flex items-center gap-2 text-base font-semibold"><Landmark size={17} className="text-indigo-500" />Shared bank account</h3><Fields entries={[["Account holder", bank.accountHolderName], ["Bank", bank.bankName], ["Account number", bank.accountNumber], ["IFSC", bank.ifscCode], ["Branch", bank.branchName]]} /><div className="mt-5 border-t border-slate-100 pt-4"><Badge value={contributor.bankStatus || raiser.bankStatus} /></div></section>{[...Object.entries(raiser.details || {}), ...Object.entries(contributor.details || {})].length > 0 && <section className={`${card} xl:col-span-2`}><h3 className="text-base font-semibold">Additional account details</h3><Fields entries={Object.entries({ ...raiser.details, ...contributor.details }).filter(([, value]) => value && typeof value !== "object").map(([key, value]) => [title(key), String(value)])} /></section>}</div>}
      {tab === "verification" && <div className="space-y-5"><section className={card}><h3 className="text-base font-semibold">Shared verification</h3><p className="mt-1 text-xs text-slate-500">Identity and bank approvals apply to both funding activities.</p><div className="mt-5 grid gap-4 lg:grid-cols-2">{shared.map(([kind, label, status, document]) => <div key={kind} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"><div className="flex justify-between gap-3"><h4 className="text-sm font-semibold">{label}</h4><Badge value={status} /></div><div className="mt-4 flex flex-wrap gap-2">{statuses.map((value) => <button key={value} disabled={Boolean(busy) || (!document && value === "VERIFIED")} onClick={() => verify(kind, value)} className={`rounded-lg border px-2.5 py-2 text-[10px] font-semibold disabled:opacity-40 ${value === status ? "border-slate-900 bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "border-slate-200 bg-white text-slate-500"}`}>{value === "NONE" ? "Not submitted" : value.toLowerCase()}</button>)}</div>{!document && <p className="mt-3 text-xs text-slate-400">No matching document uploaded.</p>}</div>)}</div></section><section className={card}><h3 className="text-base font-semibold">Uploaded documents</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(docs).filter(([, value]) => documentUrl(value)).map(([key, value]) => <a key={key} href={documentUrl(value)} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50"><span className="flex items-center gap-3 text-sm font-medium capitalize"><FileText size={18} className="text-indigo-500" />{title(key)}</span><ExternalLink size={15} className="text-slate-400" /></a>)}</div>{!Object.values(docs).some(documentUrl) && <p className="py-8 text-center text-sm text-slate-400">No documents uploaded.</p>}</section></div>}
      {tab === "campaigns" && <div className="space-y-4"><div className="flex items-center justify-between"><h3 className="text-base font-bold">Created campaigns</h3><span className="text-xs text-slate-400">{campaigns.length} records</span></div>{campaigns.length ? campaigns.map((entry, index) => <AdminCampaignRecord key={entry._id} campaign={entry} defaultOpen={index === 0} busy={busy} onAction={campaignAction} />) : <p className={`${card} py-10 text-center text-sm text-slate-400`}>No campaigns created.</p>}</div>}

      {tab === "contributions" && <Records columns={["Campaign", "Amount", "Payment", "Payout", "Refund", "Date"]} empty="No contributions recorded." rows={contributions.map((entry) => [entry._id, [entry.campaign?._id ? <Link to={`/contribution-detail/${entry.campaign._id}`} className="font-semibold hover:text-indigo-600">{entry.campaign.projectTitle}<ArrowUpRight size={12} className="ml-1 inline" /></Link> : "Campaign unavailable", <span>{money(entry.amount)}<span className="mt-1 block text-xs text-slate-400">Fee {money(entry.platformFee)}</span></span>, <span><Badge value={entry.paymentStatus} /><span className="mt-2 block break-all text-[10px] text-slate-400">{entry.paymentId || entry.orderId}</span></span>, <Badge value={entry.transferStatus} />, <span><Badge value={entry.refundStatus} />{entry.refundId && <span className="mt-1 block text-xs">{entry.refundId}</span>}</span>, date(entry.createdAt)]])} />}
      {tab === "transactions" && <Records columns={["Reference", "Campaign", "Type", "Amount", "Status", "Date"]} empty="No financial transactions." rows={transactions.map((entry) => [entry._id, [<span className="break-all text-xs">{entry.transactionId}</span>, entry.campaign?.title || "Account transaction", <span className="capitalize">{entry.type === "investment" ? "contribution" : entry.type}</span>, <span>{money(entry.amount)}<span className="mt-1 block text-xs text-slate-400">Net {money(entry.netAmount)}</span></span>, <Badge value={entry.status} />, date(entry.createdAt)]])} />}
    </>}
  </div>;
}
