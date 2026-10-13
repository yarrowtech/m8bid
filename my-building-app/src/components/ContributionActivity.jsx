import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axiox";

const money = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;
export default function ContributionActivity({ analytics = false }) {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    api.get("/contributions/my", { signal: controller.signal }).then((response) => setEntries(response.data.contributions || [])).catch((err) => { if (!controller.signal.aborted) setError(err.response?.data?.message || "Unable to load contributions"); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const confirmed = entries.filter((entry) => entry.paymentStatus === "completed" && entry.status === "confirmed");
  const total = confirmed.reduce((sum, entry) => sum + entry.amount, 0);
  const campaignCount = new Set(confirmed.map((entry) => String(entry.campaign?._id || entry.campaign))).size;
  const categories = confirmed.reduce((result, entry) => {
    const key = entry.campaign?.projectCategory || "General";
    result[key] = (result[key] || 0) + entry.amount;
    return result;
  }, {});
  const downloadReceipt = async (entry) => {
    try {
      const response = await api.get(`/contributions/${entry._id}/receipt`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `MateBid-receipt-${entry._id}.html`;
      link.click();
      URL.revokeObjectURL(url);
    } catch { setError("Unable to download receipt. Please try again."); }
  };
  return <main className="h-full flex-1 overflow-y-auto bg-[#f7f7fb] px-4 py-6 md:px-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold text-slate-900">{analytics ? "Contribution Analytics" : "Supported Campaigns"}</h1><p className="mt-2 text-sm text-slate-500">Track contributions and the funding campaigns you support.</p></div><Link to="/browse-contributors" className="rounded-2xl bg-[#6f5cf2] px-5 py-3 font-semibold text-white">Explore Funding Campaigns</Link></div>
    {loading ? <p className="mt-6">Loading contributions…</p> : <>
      {error && <p role="alert" className="mt-6 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}
      <div className="mt-6 grid gap-4 md:grid-cols-3">{[["Total Contributed", money(total)], ["Campaigns Supported", campaignCount], ["Pending Contributions", entries.filter((entry) => ["created", "pending"].includes(entry.paymentStatus)).length]].map(([title, value]) => <div key={title} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div>
      {analytics && <section className="mt-6 rounded-3xl bg-white p-6"><h2 className="text-xl font-bold">Contributions by category</h2>{Object.entries(categories).map(([category, amount]) => <div key={category} className="mt-4"><div className="flex justify-between text-sm"><span>{category}</span><strong>{money(amount)}</strong></div><div className="mt-2 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-[#6f5cf2]" style={{ width: `${total ? amount / total * 100 : 0}%` }} /></div></div>)}{confirmed.length === 0 && <p className="mt-4 text-slate-500">Confirmed contributions will appear here.</p>}</section>}
      <section className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="text-xl font-bold">Contribution History</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Funding Campaign", "Date", "Contribution", "Payment Status", "Receipt"].map((label) => <th key={label} className="border-b px-3 py-3 text-slate-500">{label}</th>)}</tr></thead><tbody>{entries.map((entry) => <tr key={entry._id}><td className="px-3 py-4">{entry.campaign?._id ? <Link to={`/contribution-detail/${entry.campaign._id}`} className="font-semibold text-[#6f5cf2]">{entry.campaign.projectTitle}</Link> : "Campaign unavailable"}</td><td className="px-3 py-4">{new Date(entry.date || entry.createdAt).toLocaleDateString("en-IN")}</td><td className="px-3 py-4">{money(entry.amount)}</td><td className="px-3 py-4">{entry.paymentStatus}</td><td className="px-3 py-4">{entry.paymentStatus === "completed" && <button onClick={() => downloadReceipt(entry)} className="font-semibold text-blue-700">Download receipt</button>}</td></tr>)}</tbody></table>{entries.length === 0 && <p className="py-8 text-center text-slate-500">No contributions yet. Explore a funding campaign to get started.</p>}</div></section>
    </>}
  </main>;
}
