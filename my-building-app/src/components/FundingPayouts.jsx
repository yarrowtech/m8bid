import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axiox";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
export default function FundingPayouts() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState("");
  const load = async () => {
    try { const response = await api.get("/account/payouts"); setData(response.data); }
    catch (error) { setMessage(error.response?.data?.message || "Unable to load payout records"); }
  };
  useEffect(() => { load(); }, []);
  const request = async (entry) => {
    setProcessing(entry._id); setMessage("");
    try { const response = await api.post(`/account/payouts/${entry._id}`); setMessage(response.data.status === "pending" ? "Payout is pending. Check your verified bank details and linked payout account." : `Payout status: ${response.data.status}`); await load(); }
    catch (error) { setMessage(error.response?.data?.message || "Unable to request payout"); }
    finally { setProcessing(""); }
  };
  return <main className="h-full flex-1 overflow-y-auto bg-[#f7f7fb] px-4 py-6 md:px-6"><div className="flex flex-wrap justify-between gap-4"><div><h1 className="text-3xl font-bold">Withdrawals & Payouts</h1><p className="mt-2 text-sm text-slate-500">Track confirmed funding and transfers to your verified bank account.</p></div><Link to="/contributor/profile/bank" className="rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white">Bank details</Link></div>{message && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-4">{message}</p>}{!data ? <p className="mt-6">Loading payout records…</p> : <><div className="mt-6 grid gap-4 sm:grid-cols-2">{[["Transferred to bank", data.totalPaid], ["Pending payouts", data.pending]].map(([label, value]) => <div key={label} className="rounded-3xl bg-white p-6"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{money(value)}</p></div>)}</div><section className="mt-6 overflow-x-auto rounded-3xl bg-white p-6"><h2 className="text-xl font-bold">Payout History</h2><table className="mt-4 w-full text-left text-sm"><thead><tr>{["Funding Campaign", "Contribution", "Platform Fee", "Net Payout", "Status", "Action"].map((label) => <th key={label} className="border-b p-3">{label}</th>)}</tr></thead><tbody>{data.contributions.map((entry) => <tr key={entry._id}><td className="p-3">{entry.campaign?.projectTitle}</td><td className="p-3">{money(entry.amount)}</td><td className="p-3">{money(entry.platformFee)}</td><td className="p-3">{money(entry.netAmount)}</td><td className="p-3">{entry.transferStatus}</td><td className="p-3">{entry.transferStatus === "pending" && <button disabled={Boolean(processing)} onClick={() => request(entry)} className="font-semibold text-blue-700 disabled:opacity-50">{processing === entry._id ? "Processing…" : "Request payout"}</button>}</td></tr>)}</tbody></table>{data.contributions.length === 0 && <p className="py-6 text-slate-500">Confirmed campaign contributions will appear here.</p>}</section></>}</main>;
}
