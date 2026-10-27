import AdminRecordHeader from "./AdminRecordHeader";
import { Avatar, Pill, StatTile } from "./AdminUi";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { CheckCircle2, HandCoins, RotateCcw, Send } from "lucide-react";
import api from "../../lib/axiox";

const INR = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
const date = (value) => { const d = new Date(value); return value && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"; };

export default function AdminContributions() {
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState("");
  const [search, setSearch] = useState("");
  const load = async () => {
    setLoading(true);
    try { const response = await api.get("/admin/contributions"); setEntries(response.data.contributions); }
    catch (error) { setMessage(error.response?.data?.message || "Unable to load contributions"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const refund = async (entry, reconcile = false) => {
    if (!reconcile && !window.confirm(`Refund the confirmed contribution of INR ${entry.amount} to ${entry.investor?.name || "this contributor"}?`)) return;
    setProcessing(entry._id); setMessage("");
    try { const response = await api.post(`/admin/contributions/${entry._id}/refund${reconcile ? "/reconcile" : ""}`); setMessage(`Refund status: ${response.data.status}`); await load(); }
    catch (error) { setMessage(error.response?.data?.message || "Unable to process refund"); }
    finally { setProcessing(""); }
  };

  const completed = entries.filter((entry) => entry.paymentStatus === "completed");
  const paidOut = entries.filter((entry) => entry.transferStatus === "processed");
  const refunded = entries.filter((entry) => entry.refundStatus && entry.refundStatus !== "none");
  const sum = (list) => list.reduce((total, entry) => total + Number(entry.amount || 0), 0);
  const visible = entries.filter((entry) => [entry.campaign?.projectTitle, entry.investor?.name, entry.investor?.email, entry.paymentStatus, entry.refundStatus].join(" ").toLowerCase().includes(search.toLowerCase()));

  return <div className="space-y-6">
    <AdminRecordHeader title="Contributions & Refunds" description="Monitor payments, payouts and refund status." refreshing={loading} onRefresh={load} />
    {message && <p role="status" className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-800">{message}</p>}

    <section aria-label="Contribution summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile label="Contributions" value={entries.length} hint={`${INR(sum(entries))} pledged`} icon={HandCoins} color="#4f46e5" />
      <StatTile label="Payments collected" value={completed.length} hint={`${INR(sum(completed))} received`} icon={CheckCircle2} color="#10b981" />
      <StatTile label="Paid out to raisers" value={paidOut.length} hint={`${INR(sum(paidOut))} transferred`} icon={Send} color="#0ea5e9" />
      <StatTile label="Refunds" value={refunded.length} hint={`${INR(sum(refunded))} returned or in progress`} icon={RotateCcw} color="#f43f5e" />
    </section>

    <div className="admin-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div><h2 className="text-lg font-extrabold tracking-tight text-slate-900">All contributions</h2><p className="text-xs text-slate-500">{visible.length} of {entries.length} records shown</p></div>
        <label className="relative w-full sm:w-80"><FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search contributions" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search campaign, contributor, status..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:bg-white" /></label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead><tr>{["Funding campaign", "Contributor", "Amount", "Payment", "Payout", "Refund", "Action"].map((label) => <th key={label} className="px-5 py-3.5">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{visible.map((entry) => <tr key={entry._id}>
            <td className="max-w-[240px] px-5 py-4"><p className="truncate font-semibold text-slate-800">{entry.campaign?.projectTitle || "Campaign unavailable"}</p><p className="mt-1 text-[11px] text-slate-400">{date(entry.createdAt)}</p></td>
            <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={entry.investor?.name} /><div className="min-w-0"><p className="font-semibold text-slate-800">{entry.investor?.name || "User unavailable"}</p>{entry.investor?.email && <p className="truncate text-xs text-slate-400">{entry.investor.email}</p>}</div></div></td>
            <td className="px-5 py-4 font-extrabold text-slate-900">{INR(entry.amount)}</td>
            <td className="px-5 py-4"><Pill value={entry.paymentStatus} /></td>
            <td className="px-5 py-4"><Pill value={entry.transferStatus || "pending"} /></td>
            <td className="px-5 py-4">{!entry.refundStatus || entry.refundStatus === "none" ? <span className="text-xs text-slate-400">None</span> : <Pill value={entry.refundStatus} />}</td>
            <td className="px-5 py-4">{entry.refundId && entry.refundStatus !== "processed" ? <button disabled={Boolean(processing)} onClick={() => refund(entry, true)} className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50">Refresh refund status</button> : entry.paymentStatus === "completed" && [undefined, "pending"].includes(entry.transferStatus) && [undefined, "none"].includes(entry.refundStatus) && <button disabled={Boolean(processing)} onClick={() => refund(entry)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"><RotateCcw size={13} />{processing === entry._id ? "Processing…" : "Refund"}</button>}</td>
          </tr>)}</tbody>
        </table>
        {!visible.length && <div className="px-5 py-14 text-center"><HandCoins size={30} className="mx-auto mb-3 text-slate-300" /><p className="text-sm font-medium text-slate-600">{loading ? "Loading contributions…" : entries.length ? "No contributions match your search." : "No contributions recorded yet."}</p></div>}
      </div>
    </div>
  </div>;
}
