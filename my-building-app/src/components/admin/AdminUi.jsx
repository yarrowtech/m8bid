const TONES = {
  success: ["completed", "confirmed", "processed", "approved", "verified", "active", "success", "paid"],
  warning: ["pending", "processing", "created", "initiated"],
  danger: ["failed", "rejected", "cancelled", "disabled", "unknown"],
  info: ["refunded", "reversed"],
};

export const toneFor = (value) => {
  const key = String(value || "").toLowerCase();
  return Object.keys(TONES).find((tone) => TONES[tone].includes(key)) || "neutral";
};

export function Pill({ value, label }) {
  return <span className={`admin-pill admin-pill-${toneFor(value)}`}>{String(label ?? value ?? "—").replace(/_/g, " ")}</span>;
}

export function StatTile({ label, value, hint, icon: Icon, color = "#4f46e5", active, onClick }) {
  const Tag = onClick ? "button" : "div";
  return <Tag type={onClick ? "button" : undefined} onClick={onClick} aria-pressed={onClick ? Boolean(active) : undefined} style={{ "--stat-color": color }} className={`admin-stat w-full text-left ${active ? "ring-2 ring-indigo-400" : ""}`}>
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="admin-stat-label">{label}</p><p className="admin-stat-value truncate">{value}</p></div>{Icon && <span className="admin-stat-icon shrink-0"><Icon size={18} /></span>}</div>
    {hint && <p className="mt-2 text-xs font-medium text-slate-500">{hint}</p>}
  </Tag>;
}

export function Avatar({ name, photo, size = "h-9 w-9" }) {
  return <span className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 text-xs font-bold text-indigo-700`}>{photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : (name || "?").charAt(0).toUpperCase()}</span>;
}
