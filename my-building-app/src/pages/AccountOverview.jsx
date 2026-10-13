import { readDashboardCache } from "../lib/dashboardCache";
import DashboardPlaceholder from "../components/DashboardPlaceholder";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IndianRupee, HeartHandshake, FolderKanban, Users, ArrowUpRight, ChevronDown, Send } from "lucide-react";
import api from "../lib/axiox";

const currency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
export default function AccountOverview() {
  const [data, setData] = useState(() => readDashboardCache("/account/overview")?.data || null);
  const [error, setError] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [update, setUpdate] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [activityTab, setActivityTab] = useState("transactions");
  const [showAllSaved, setShowAllSaved] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const postUpdate = async (event) => {
    event.preventDefault(); setPosting(true); setUpdateMessage("");
    try { await api.post(`/account/campaigns/${campaignId}/updates`, { message: update }); setUpdate(""); setUpdateMessage("Campaign update published and supporters notified."); }
    catch (err) { setUpdateMessage(err.response?.data?.message || "Unable to publish update"); }
    finally { setPosting(false); }
  };
  useEffect(() => {
    const controller = new AbortController();
    api.get("/account/overview", { signal: controller.signal }).then((response) => setData(response.data.data)).catch((err) => { if (!controller.signal.aborted) setError(err.response?.data?.message || "Unable to load your account"); });
    return () => controller.abort();
  }, []);
  return <div className="dashboard-overview min-h-full bg-[#f5f8fc]"><main className="mx-auto max-w-7xl px-4 py-5 md:px-5">
    <div className="rounded-[24px] bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-6 text-white shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-100">Your Dashboard Overview</p>
      <h1 className="mt-2 text-[24px] font-semibold leading-tight">Your funding at a glance</h1>
      <p className="mt-2 text-sm text-sky-100">Your campaigns, contributions and recent activity.</p>
      <div className="mt-5 flex flex-wrap gap-3"><Link to="/start-raiser" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-900">Create Campaign <ArrowUpRight size={16} /></Link><Link to="/browse-contributors" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold">Browse Campaigns <ArrowUpRight size={16} /></Link></div>
    </div>
    {error ? <p role="alert" className="mt-6 text-red-600">{error}</p> : !data ? <DashboardPlaceholder /> : <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[["Funds raised", currency(data.totalRaised), IndianRupee, "bg-sky-100"], ["Contributed", currency(data.totalContributed), HeartHandshake, "bg-[#f1edff]"], ["Active campaigns", data.activeCampaigns, FolderKanban, "bg-indigo-100"], ["Campaigns supported", data.supportedCampaigns, Users, "bg-emerald-100"]].map(([label, value, Icon, tone]) => <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white px-4 py-4"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone}`}><Icon size={20} className="text-slate-700" /></div><div className="min-w-0"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 break-words text-[24px] font-bold text-slate-900">{value}</p></div></div>)}
      </div>


      <div className="mt-5 grid items-start gap-5 xl:grid-cols-2">
      <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold">Saved campaigns</h2>{data.savedCampaigns?.length ? <ul className="mt-4 space-y-3">{(showAllSaved ? data.savedCampaigns : data.savedCampaigns.slice(0, 3)).map((entry) => <li key={entry._id}><Link to={`/contribution-detail/${entry._id}`} className="font-semibold text-blue-700">{entry.projectTitle}</Link><span className="ml-3 text-sm text-slate-500">{entry.status}</span></li>)}</ul> : <p className="mt-4 text-slate-500">Save campaigns you want to revisit.</p>}{data.savedCampaigns?.length > 3 && <button onClick={() => setShowAllSaved(!showAllSaved)} className="mt-4 text-xs font-semibold text-indigo-600">{showAllSaved ? "Show less" : "Show all saved campaigns"}</button>}</section>
        <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">My campaigns</h2><Link to="/raiser/campaigns" className="text-xs font-semibold text-indigo-600">View all</Link></div>{data.campaigns.length ? <ul className="mt-4 divide-y divide-slate-100">{data.campaigns.slice(0, 3).map((entry) => <li key={entry._id} className="py-3"><Link to={`/contribution-detail/${entry._id}`} className="text-sm font-semibold text-slate-800 hover:text-indigo-600">{entry.projectTitle}</Link><div className="mt-2 flex justify-between gap-3 text-xs text-slate-500"><span className="capitalize">{entry.status}</span><span>{currency(entry.raisedAmount)} raised</span></div></li>)}</ul> : <p className="py-6 text-sm text-slate-500">Your campaigns will appear here.</p>}</section>
      </div>
      <section className="mt-5 rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Recent activity</h2><Link to="/contributor/transactions" className="text-xs font-semibold text-indigo-600">View history</Link></div>
        <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-100 pb-3">{[["transactions", "Transactions"], ["received", "Received"], ["updates", "Updates"]].map(([id, label]) => <button key={id} aria-pressed={activityTab === id} onClick={() => { setActivityTab(id); setShowAllActivity(false); }} className={`rounded-lg px-3 py-2 text-xs font-semibold ${activityTab === id ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"}`}>{label}</button>)}</div>
        {(() => {
          const entries = (activityTab === "transactions" ? data.transactions : activityTab === "received" ? data.receivedContributions : data.notifications) || [];
          return <>{entries.length ? <ul className="divide-y divide-slate-100">{(showAllActivity ? entries : entries.slice(0, 4)).map((entry) => <li key={entry._id} className="flex justify-between gap-4 py-4"><div className="min-w-0"><p className="text-sm font-medium text-slate-800">{activityTab === "updates" ? entry.message : activityTab === "received" ? entry.contributor : entry.campaign?.projectTitle || "Account transaction"}</p>{activityTab !== "updates" && <p className="mt-1 text-xs text-slate-500">{activityTab === "received" ? entry.campaign : `${entry.status} · ${new Date(entry.createdAt).toLocaleDateString("en-IN")}`}</p>}</div>{activityTab !== "updates" && <strong className="shrink-0 text-sm">{currency(entry.amount)}</strong>}</li>)}</ul> : <p className="py-6 text-center text-sm text-slate-500">{activityTab === "updates" ? "You are all caught up." : activityTab === "received" ? "No contributions received yet." : "No transactions yet."}</p>}{entries.length > 4 && <button onClick={() => setShowAllActivity(!showAllActivity)} className="mt-2 text-xs font-semibold text-indigo-600">{showAllActivity ? "Show less" : "Show more activity"}</button>}</>;
        })()}
      </section>
      {data.campaigns.length > 0 && <details className="group mt-5 rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm"><summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-800"><span className="flex items-center gap-2"><Send size={16} className="text-indigo-500" />Share a campaign update</span><ChevronDown size={16} className="text-slate-400 transition group-open:rotate-180" /></summary><form onSubmit={postUpdate} className="mt-4 space-y-4 border-t border-slate-100 pt-4"><label className="block text-sm font-semibold">Campaign<select required value={campaignId} onChange={(event) => setCampaignId(event.target.value)} className="mt-2 block w-full rounded-xl border p-3"><option value="">Choose a campaign</option>{data.campaigns.map((entry) => <option key={entry._id} value={entry._id}>{entry.projectTitle}</option>)}</select></label><label className="block text-sm font-semibold">Update<textarea required rows={3} maxLength={2000} value={update} onChange={(event) => setUpdate(event.target.value)} className="mt-2 block w-full rounded-xl border p-3" placeholder="Share progress with your supporters." /></label><button disabled={posting} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-50">{posting ? "Publishing…" : "Publish update"}</button>{updateMessage && <p role="status">{updateMessage}</p>}</form></details>}
    </>}
  </main></div>;
}
