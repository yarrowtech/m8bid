export default function DashboardPlaceholder() {
  return <div aria-busy="true" aria-label="Updating dashboard" className="min-h-full bg-[#f5f8fc] p-5">
    <div className="h-44 rounded-[24px] bg-gradient-to-r from-sky-100 to-indigo-100" />
    <div className="mt-5 grid gap-4 sm:grid-cols-2">{[0, 1, 2, 3].map((item) => <div key={item} className="flex h-24 items-center gap-4 rounded-[24px] border border-slate-100 bg-white p-5"><div className="h-12 w-12 rounded-2xl bg-slate-100" /><div className="flex-1 space-y-3"><div className="h-2 w-28 rounded bg-slate-100" /><div className="h-5 w-20 rounded bg-slate-100" /></div></div>)}</div>
    <div className="mt-5 h-48 rounded-[24px] border border-slate-100 bg-white" />
  </div>;
}
