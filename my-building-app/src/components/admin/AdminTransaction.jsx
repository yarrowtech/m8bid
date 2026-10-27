import AdminRecordHeader from "./AdminRecordHeader";
import { Avatar, Pill, StatTile } from "./AdminUi";
import { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock3, Receipt, RotateCcw, Wallet, XCircle } from "lucide-react";
import { getAdminTransactions } from "../../api/admin";

const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (date) => {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const INR = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

const typeLabel = (type) => (type === "investment" ? "contribution" : String(type || "other").replace(/_/g, " "));
const TYPE_STYLE = {
  contribution: ["bg-indigo-50 text-indigo-700", ArrowDownLeft],
  refund: ["bg-rose-50 text-rose-700", RotateCcw],
  payout: ["bg-sky-50 text-sky-700", ArrowUpRight],
  "platform fee": ["bg-violet-50 text-violet-700", Wallet],
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await getAdminTransactions();
        setTransactions(res?.transactions || res?.data?.transactions || []);
      } catch (e) {
        setError("Unable to load transaction records.");
      } finally { setLoading(false); }
    };
    run();
  }, [revision]);

  const stats = useMemo(() => {
    const by = (s) => transactions.filter((t) => t.status === s);
    const sum = (list) => list.reduce((total, t) => total + Number(t.amount || 0), 0);
    return { completed: by("completed"), pending: by("pending"), failed: by("failed"), volume: sum(by("completed")), sum };
  }, [transactions]);

  const filtered = transactions
    .filter((t) => status === "all" || t.status === status)
    .filter((t) =>
      [t?.transactionId, t?.status, t?.type, t?.user?.name, t?.user?.email, t?.campaign?.projectTitle]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const tiles = [
    ["all", "All transactions", transactions.length, `${INR(stats.sum(transactions))} total`, Receipt, "#4f46e5"],
    ["completed", "Completed", stats.completed.length, `${INR(stats.volume)} settled`, CheckCircle2, "#10b981"],
    ["pending", "Pending", stats.pending.length, `${INR(stats.sum(stats.pending))} in flight`, Clock3, "#f59e0b"],
    ["failed", "Failed", stats.failed.length, `${INR(stats.sum(stats.failed))} not collected`, XCircle, "#f43f5e"],
  ];

  return (
    <div className="space-y-6">
      <AdminRecordHeader title="Transactions" description="Inspect the contribution, payout and refund ledger." refreshing={loading} onRefresh={() => setRevision(revision + 1)} />

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      <section aria-label="Transactions by status" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map(([key, label, value, hint, Icon, color]) => <StatTile key={key} label={label} value={value} hint={hint} icon={Icon} color={color} active={status === key} onClick={() => setStatus(key)} />)}
      </section>

      <div className="admin-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div><h2 className="text-lg font-extrabold tracking-tight text-slate-900">Ledger</h2><p className="text-xs text-slate-500">{filtered.length} of {transactions.length} records shown · latest 500</p></div>
          <label className="relative w-full sm:w-80"><FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search transactions" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ID, user, campaign..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:bg-white" /></label>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-sm">
            <thead className="text-left">
              <tr>{["Transaction", "User", "Campaign", "Type", "Amount", "Status", "Date"].map((label) => <th key={label} className="px-5 py-3.5">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((t, i) => {
                  const type = typeLabel(t.type);
                  const [typeClass, TypeIcon] = TYPE_STYLE[type] || ["bg-slate-100 text-slate-600", Receipt];
                  return (
                    <tr key={t?._id || i}>
                      <td className="px-5 py-4"><p className="font-mono text-xs font-semibold text-slate-800">{t?.transactionId || "—"}</p>{t.paymentMethod && <p className="mt-1 text-[11px] capitalize text-slate-400">{t.paymentMethod.replace(/_/g, " ")}</p>}</td>
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={t?.user?.name || t?.user?.email} /><div className="min-w-0"><p className="font-semibold text-slate-800">{t?.user?.name || "—"}</p><p className="truncate text-xs text-slate-400">{t?.user?.email}</p></div></div></td>
                      <td className="max-w-[220px] truncate px-5 py-4 text-slate-600">{t.campaign?.projectTitle || <span className="text-slate-400">Account transaction</span>}</td>
                      <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${typeClass}`}><TypeIcon size={13} />{type}</span></td>
                      <td className="px-5 py-4"><p className="font-extrabold text-slate-900">{INR(t?.amount || 0)}</p>{Number(t.fee) > 0 && <p className="text-[11px] text-slate-400">Fee {INR(t.fee)}</p>}</td>
                      <td className="px-5 py-4"><Pill value={t?.status} /></td>
                      <td className="whitespace-nowrap px-5 py-4"><p className="text-slate-700">{formatDate(t?.createdAt)}</p><p className="text-[11px] text-slate-400">{formatTime(t?.createdAt)}</p></td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-14 text-center">
                    <Receipt size={30} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">{loading ? "Loading transaction records..." : error ? "Records unavailable." : "No transactions match these filters."}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
