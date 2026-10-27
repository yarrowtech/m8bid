import AdminRecordHeader from "./AdminRecordHeader";
import AdminCampaignRecord, { CAMPAIGN_STATUSES } from "./AdminCampaignRecord";
import "./AdminUserRecords.css";
import { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FolderKanban } from "lucide-react";
import { getAdminCampaigns, approveCampaign, rejectCampaign, updateCampaignStatus, deleteCampaign } from "../../api/admin";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
const SORTS = { newest: "Newest first", oldest: "Oldest first", raised: "Most raised", goal: "Largest goal" };
const sorters = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  raised: (a, b) => b.moneyRaised - a.moneyRaised,
  goal: (a, b) => b.fundingGoal - a.fundingGoal,
};

export default function AdminCampaigns() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  const load = async () => {
    const res = await getAdminCampaigns();
    setCampaigns(res?.campaigns || res?.data?.campaigns || []);
  };

  useEffect(() => {
    setLoading(true);
    load().catch(() => setError("Unable to load campaigns.")).finally(() => setLoading(false));
  }, [revision]);

  const run = async (entry, task, message) => {
    setBusy(entry._id); setError(""); setNotice("");
    try { await task(); await load(); setNotice(message); }
    catch (err) { setError(err.response?.data?.message || err.message || "Unable to update campaign."); }
    finally { setBusy(""); }
  };

  const onAction = (entry, action) => {
    if (action === "delete" && !window.confirm(`Delete "${entry.projectTitle}" by ${entry.creator?.name || "unknown"}? This cannot be undone.`)) return;
    const task = { approve: approveCampaign, reject: rejectCampaign, delete: deleteCampaign }[action];
    run(entry, () => task(entry._id), action === "delete" ? `"${entry.projectTitle}" deleted.` : `"${entry.projectTitle}" ${action}d.`);
  };

  const onStatusChange = (entry, next) => {
    if (next === entry.status) return;
    run(entry, () => updateCampaignStatus(entry._id, next), `"${entry.projectTitle}" marked as ${next}.`);
  };

  const categories = useMemo(() => [...new Set(campaigns.map((c) => c.projectCategory).filter(Boolean))].sort(), [campaigns]);
  const counts = useMemo(() => Object.fromEntries(CAMPAIGN_STATUSES.map((s) => [s, campaigns.filter((c) => c.status === s).length])), [campaigns]);

  const visible = campaigns
    .filter((c) => status === "all" || c.status === status)
    .filter((c) => category === "all" || c.projectCategory === category)
    .filter((c) => [c.projectTitle, c.creator?.name, c.creator?.email, c.creator?.username, c.projectCategory, c.entityName].join(" ").toLowerCase().includes(search.toLowerCase()))
    .sort(sorters[sort]);

  const tiles = [["all", "All campaigns", campaigns.length, money(campaigns.reduce((sum, c) => sum + Number(c.moneyRaised || 0), 0)) + " raised"], ...CAMPAIGN_STATUSES.map((s) => [s, s.charAt(0).toUpperCase() + s.slice(1), counts[s], s === "pending" && counts[s] ? "Awaiting review" : ""])];
  const filtered = search || status !== "all" || category !== "all";

  return (
    <div className="admin-user-records admin-user-directory space-y-6">
      <AdminRecordHeader title="Campaigns" description="Every campaign with its creator, status and funding progress." refreshing={loading} onRefresh={() => setRevision(revision + 1)} />

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}

      <section aria-label="Campaigns by status" className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {tiles.map(([key, label, count, hint]) => (
          <button key={key} onClick={() => setStatus(key)} aria-pressed={status === key} className={`user-summary-card rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 ${status === key ? "ring-2 ring-indigo-400" : ""}`}>
            <p>{label}</p>
            <p className="mt-2 text-[31px] font-extrabold tracking-tight text-slate-900">{count}</p>
            {hint && <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{hint}</span>}
          </button>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="relative min-w-[220px] flex-1"><FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search campaigns" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, creator, email or category..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-indigo-400" /></label>
        <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm capitalize outline-none focus:border-indigo-400">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select aria-label="Sort campaigns" value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400">
          {Object.entries(SORTS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <span className="text-xs text-slate-400">{visible.length} of {campaigns.length} shown</span>
      </div>

      <div className="space-y-4">
        {visible.map((entry) => <AdminCampaignRecord key={entry._id} campaign={entry} busy={busy} onAction={onAction} onStatusChange={onStatusChange} />)}
        {!visible.length && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center">
            <FolderKanban size={30} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">{loading ? "Loading campaigns..." : filtered ? "No campaigns match these filters." : "No campaigns created yet."}</p>
            {filtered && !loading && <button onClick={() => { setSearch(""); setStatus("all"); setCategory("all"); }} className="mt-3 text-xs font-semibold text-indigo-600">Clear filters</button>}
          </div>
        )}
      </div>
    </div>
  );
}
