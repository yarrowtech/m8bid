import { Menu, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function AdminRecordHeader({ title, description, onRefresh, refreshing, children }) {
  const { setSidebarOpen } = useOutletContext();
  return <header className="admin-page-header mb-6 flex flex-wrap items-center justify-between gap-4">
    <div className="flex items-center gap-3"><button type="button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)} className="rounded-xl border p-3 lg:hidden"><Menu size={20} /></button><div><p className="mb-1 text-[10px] font-semibold uppercase">Administration</p><h1 className="text-2xl sm:text-3xl">{title}</h1><p className="mt-1 text-sm">{description}</p></div></div>
    <div className="flex flex-wrap items-center gap-3">{children}{onRefresh && <button type="button" onClick={onRefresh} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60"><RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />{refreshing ? "Refreshing" : "Refresh"}</button>}</div>
  </header>;
}
