import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../lib/axiox";

export default function AdminContributions() {
  const { setSidebarOpen } = useOutletContext();
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState("");
  const load = async () => {
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
  return <div className="space-y-6"><div className="flex items-center gap-4"><button onClick={() => setSidebarOpen(true)} className="rounded-xl border px-3 py-2 lg:hidden">Menu</button><div><h1 className="text-3xl font-bold text-slate-900">Contributions & Refunds</h1><p className="mt-2 text-sm text-slate-500">Monitor payments, payout status, and full contribution refunds.</p></div></div>{message && <p role="status" className="rounded-xl bg-amber-50 p-4">{message}</p>}<div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-5"><table className="w-full text-left text-sm"><thead><tr>{["Funding Campaign", "Contributor", "Amount", "Payment", "Payout", "Refund", "Action"].map((label) => <th key={label} className="border-b p-3">{label}</th>)}</tr></thead><tbody>{entries.map((entry) => <tr key={entry._id}><td className="p-3">{entry.campaign?.projectTitle || "Campaign unavailable"}</td><td className="p-3">{entry.investor?.name || "User unavailable"}</td><td className="p-3">INR {Number(entry.amount).toLocaleString("en-IN")}</td><td className="p-3">{entry.paymentStatus}</td><td className="p-3">{entry.transferStatus || "pending"}</td><td className="p-3">{entry.refundStatus || "none"}</td><td className="p-3">{entry.refundId && entry.refundStatus !== "processed" ? <button disabled={Boolean(processing)} onClick={() => refund(entry, true)} className="font-semibold text-blue-700 disabled:opacity-50">Refresh refund status</button> : entry.paymentStatus === "completed" && [undefined, "pending"].includes(entry.transferStatus) && [undefined, "none"].includes(entry.refundStatus) && <button disabled={Boolean(processing)} onClick={() => refund(entry)} className="font-semibold text-red-700 disabled:opacity-50">{processing === entry._id ? "Processing…" : "Refund contribution"}</button>}</td></tr>)}</tbody></table>{loading ? <p className="py-6">Loading contributions…</p> : entries.length === 0 && <p className="py-6 text-slate-500">No contributions recorded yet.</p>}</div></div>;
}
