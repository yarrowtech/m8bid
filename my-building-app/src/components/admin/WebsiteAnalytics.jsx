import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ArrowDownToLine, ArrowUpRight, BarChart3, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Globe2, Info, Menu, MousePointer2, Search, Smartphone, TrendingUp, X } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getWebsiteAnalyticsSections, getPageDetails, syncWebsiteSearch } from "../../api/websiteAnalytics";
import "./WebsiteAnalytics.css";

const number = (value) => new Intl.NumberFormat("en-IN").format(Math.round(value));
const compact = (value) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
const percent = (value) => `${value.toFixed(1)}%`;
const shortDate = (value) => new Date(`${value}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
const duration = (seconds) => `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
const devices = ["Mobile", "Desktop", "Tablet"];
const rangeOptions = [[7, "Last 7 days"], [28, "Last 28 days"], [30, "Last 30 days"], [90, "Last 3 months"], [180, "Last 6 months"], [365, "Last 12 months"]];
const rangeButtons = [[7, "7 days"], [28, "28 days"], [90, "3 months"], [180, "6 months"], [365, "12 months"]];
// Search Console's metric colours and order. Position is drawn inverted because 1 is best.
const searchSeries = [
  { key: "clicks", label: "Total clicks", color: "#4285f4", icon: MousePointer2 },
  { key: "impressions", label: "Total impressions", color: "#5e35b1", icon: Search },
  { key: "ctr", label: "Average CTR", color: "#00897b", icon: TrendingUp },
  { key: "position", label: "Average position", color: "#e8710a", icon: BarChart3, lowerBetter: true },
];
const axisTick = (key) => (value) => key === "ctr" ? `${value.toFixed(value < 10 ? 1 : 0)}%` : key === "position" ? value.toFixed(0) : compact(value);
// Google keeps ~16 months; the full import also fills the comparison period for 12-month reports.
const syncOptions = [[7, "Sync last 7 days"], [90, "Import 3 months"], [180, "Import 6 months"], [365, "Import 12 months"], [480, "Import all available · 16 months"]];
const periodLabel = (days) => rangeOptions.find(([value]) => value === days)?.[1].replace("Last ", "") || `${days} days`;
const percentage = (value, total) => total ? value / total * 100 : 0;
const emptyReport = { totals: {}, comparison: {}, daily: [], pages: [], queries: [], sources: [], devices: [], entryPages: [], exitPages: [], sectionErrors: [], availability: {} };
const definitions = {
  clicks: "Clicks from Google search results to your website.",
  impressions: "Times a link to your website appeared in Google search results.",
  ctr: "Search clicks divided by search impressions.",
  position: "Average search result position, weighted by impressions. Lower is better.",
  entries: "Sessions that started on this page.",
  views: "Page views, including repeated views.",
  engagementRate: "Engaged sessions divided by sessions. A session is engaged after 10 seconds of visible time or 2+ page views.",
  engagementSeconds: "Average engagement time per session.",
  exits: "Sessions whose final recorded page was this page.",
  exitRate: "Exits divided by page views. An exit does not necessarily mean a visitor had a poor experience.",
};
const tabs = [
  { id: "pages", label: "Top pages", columns: [["name", "Page"], ["clicks", "Search clicks"], ["impressions", "Impressions"], ["ctr", "CTR"], ["position", "Position"]] },
  { id: "queries", label: "Search queries", columns: [["name", "Query"], ["clicks", "Clicks"], ["impressions", "Impressions"], ["ctr", "CTR"]] },
  { id: "entries", label: "Entry pages", columns: [["name", "Page"], ["entries", "Entrances"], ["views", "Page views"], ["engagementRate", "Engagement rate"], ["engagementSeconds", "Avg. engagement"]] },
  { id: "exits", label: "Exit pages", columns: [["name", "Page"], ["exits", "Exits"], ["views", "Page views"], ["exitRate", "Exit rate"]] },
  { id: "sources", label: "Traffic sources", columns: [["name", "Source"], ["entries", "Sessions"], ["views", "Page views"], ["engagementRate", "Engagement rate"]] },
];
function display(value, key) {
  if (value === null || value === undefined) return "—";
  if (["ctr", "engagementRate", "exitRate"].includes(key)) return percent(value);
  if (key === "position") return value.toFixed(1);
  if (key === "engagementSeconds") return duration(value);
  return typeof value === "number" ? number(value) : value;
}

function SearchTile({ item, value, previous, selected, onToggle }) {
  const delta = Number.isFinite(value) && previous ? (value - previous) / previous * 100 : null;
  const improved = delta !== null && (item.lowerBetter ? delta < 0 : delta > 0);
  return <button type="button" role="switch" aria-checked={selected} onClick={onToggle} className={`wa-gsc-tile${selected ? " is-selected" : ""}`} style={{ "--tile": item.color }}>
    <span className="wa-gsc-tile-label"><span className="wa-gsc-check">{selected && <Check size={12} strokeWidth={3} />}</span>{item.label}<span title={definitions[item.key]} className="wa-gsc-help"><Info size={13} /></span></span>
    <span className="wa-gsc-tile-value">{display(value, item.key)}</span>
    <span className={`wa-gsc-delta${delta === null || delta === 0 ? "" : improved ? " is-up" : " is-down"}`}>{delta === null ? "No previous data" : `${delta > 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)}% vs previous`}</span>
  </button>;
}

export default function WebsiteAnalytics() {
  const { setSidebarOpen } = useOutletContext();
  const [days, setDays] = useState(28);
  const [device, setDevice] = useState("All devices");
  const [tab, setTab] = useState("pages");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "clicks", descending: true });
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedPage, setSelectedPage] = useState(null);
  const [series, setSeries] = useState({ clicks: true, impressions: true, ctr: false, position: false });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  useEffect(() => {
    if (!selectedPage) { setDetail(null); return undefined; }
    const controller = new AbortController();
    setDetail(null); setDetailLoading(true); setDetailError("");
    getPageDetails({ days, device, page: selectedPage, signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) setDetail(data.page);
    }).catch((err) => {
      if (!controller.signal.aborted) setDetailError(err.response?.data?.message || "Could not load page details");
    }).finally(() => { if (!controller.signal.aborted) setDetailLoading(false); });
    return () => controller.abort();
  }, [selectedPage, days, device, retry]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncError, setSyncError] = useState(false);
  const [syncDays, setSyncDays] = useState(7);
  const handleSearchSync = async () => {
    if (syncing) return;
    setSyncing(true); setSyncMessage(""); setSyncError(false);
    try {
      const synced = await syncWebsiteSearch({ days: syncDays });
      setSyncMessage(`Search Console sync complete: ${synced.imported} daily device records saved for ${synced.startDate} to ${synced.endDate}.`);
      setPageNumber(1);
      setRetry((value) => value + 1);
    } catch (err) {
      setSyncError(true);
      setSyncMessage(err.response?.data?.message || "Sync could not be completed. Check the backend connection and Search Console configuration. Refresh to check for any records saved before the error.");
    } finally { setSyncing(false); }
  };
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setResult(null);
    getWebsiteAnalyticsSections({ days, device, signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) setResult(data);
    }).catch((err) => {
      if (!controller.signal.aborted) setError(err.response?.data?.message || "Unable to load analytics. Check that the backend is running and you are signed in as an administrator.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [days, device, retry]);
  const report = result || emptyReport;
  const { totals, comparison, daily, pages } = report;
  const sources = useMemo(() => [...report.sources].sort((a, b) => b.entries - a.entries), [report.sources]);
  const deviceRows = useMemo(() => [...report.devices].sort((a, b) => b.entries - a.entries), [report.devices]);
  const availabilityLabel = (source) => loading ? "Loading…" : error ? "Unavailable" : report.availability[source]?.status === "available" ? "Data available" : report.availability[source]?.status === "partial" ? "Partial coverage" : "No data yet";
  const activeTab = tabs.find((item) => item.id === tab);
  const tableRows = useMemo(() => {
    const rows = tab === "queries" ? report.queries : tab === "sources" ? sources : tab === "entries" ? report.entryPages : tab === "exits" ? report.exitPages : pages;
    return rows.filter((row) => `${row.name} ${row.title || ""}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => {
      const result = typeof a[sort.key] === "string" ? a[sort.key].localeCompare(b[sort.key]) : (a[sort.key] ?? 0) - (b[sort.key] ?? 0);
      return sort.descending ? -result : result;
    });
  }, [tab, report.queries, report.entryPages, report.exitPages, sources, pages, search, sort]);
  const pageCount = Math.max(1, Math.ceil(tableRows.length / 5));
  const visibleRows = tableRows.slice((pageNumber - 1) * 5, pageNumber * 5);
  const startDate = report.filters?.startDate;
  const endDate = report.filters?.endDate;

  const selectTab = (id) => {
    setTab(id); setSearch(""); setPageNumber(1);
    setSort({ key: id === "entries" || id === "sources" ? "entries" : id === "exits" ? "exits" : "clicks", descending: true });
  };
  const exportCsv = () => {
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const metadata = [["Dataset", "Backend website analytics"], ["Period", `${startDate} to ${endDate}`], ["Device", device], ["Search coverage", availabilityLabel("search")], ["Traffic coverage", availabilityLabel("traffic")]];
    const rows = [...metadata, [], activeTab.columns.map(([, label]) => label), ...tableRows.map((row) => activeTab.columns.map(([key]) => row[key]))];
    const url = URL.createObjectURL(new Blob(["\uFEFF" + rows.map((row) => row.map(escape).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `website-analytics-${tab}-${days}d.csv`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <div className="website-analytics">
    <header className="wa-header">
      <div className="wa-title-row"><button className="wa-menu wa-icon-button" aria-label="Open admin navigation" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button><div><div className="wa-eyebrow"><Globe2 size={14} /> WEBSITE PERFORMANCE</div><h1>Website analytics</h1><p>Understand how people discover, visit, and leave your website.</p></div></div>
      <button className="wa-button wa-export" disabled={loading || !!error || !tableRows.length} onClick={exportCsv}><ArrowDownToLine size={16} /> Export CSV</button>
    </header>

    <div className="wa-demo-banner" role="status"><div><Info size={18} /><span><strong>{loading ? "Loading website analytics" : error ? "Analytics unavailable" : "Backend analytics"}</strong> {error || (loading ? "Fetching the selected reporting period." : "Metrics come from stored source records. Missing data is shown as unavailable; partial coverage is labelled.")}</span></div><button className="wa-button" disabled={loading} onClick={() => setRetry((value) => value + 1)}>{error ? "Retry" : "Refresh"}</button></div>

    {!!report.sectionErrors.length && <div className="wa-demo-banner" role="alert"><span>Some sections could not load: {report.sectionErrors.join("; ")}. Use Refresh to retry.</span></div>}
    {selectedPage && !detail && <div className="wa-demo-banner" role="status"><span>{detailLoading ? "Loading page details…" : detailError || "No data for the selected page."}</span><button className="wa-button" onClick={() => setSelectedPage(null)}>Close details</button></div>}
    <section className="wa-sync-panel" aria-label="Search Console sync">
      <div><strong>Google Search Console</strong><p>Import finalized search data for all devices. For 3, 6 or 12-month reports, import that period first; "all available" also fills the comparison period. Longer imports take several minutes, and the last 2–3 days are not final yet.</p></div>
      <div className="wa-filters"><label className="wa-select"><select aria-label="Search sync period" value={syncDays} disabled={syncing} onChange={(event) => setSyncDays(Number(event.target.value))}>{syncOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown size={14} /></label><button className="wa-button" disabled={syncing} onClick={handleSearchSync}>{syncing ? "Syncing Search Console…" : "Sync Search Console"}</button></div>
      {syncMessage && <p className={syncError ? "wa-sync-error" : "wa-sync-success"} role={syncError ? "alert" : "status"}>{syncMessage}</p>}
    </section>

    <div className="wa-toolbar"><div className="wa-filters"><div className="wa-range" role="group" aria-label="Date range"><CalendarDays size={15} aria-hidden="true" />{rangeButtons.map(([value, label]) => <button key={value} type="button" aria-pressed={days === value} onClick={() => { setDays(value); setPageNumber(1); }}>{label}</button>)}</div><label className="wa-select"><Smartphone size={16} /><select aria-label="Device" value={device} onChange={(event) => { setDevice(event.target.value); setPageNumber(1); }}><option>All devices</option>{devices.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>{(days !== 28 || device !== "All devices") && <button className="wa-reset" onClick={() => { setDays(28); setDevice("All devices"); setPageNumber(1); }}>Reset filters</button>}</div><span className="wa-date">{startDate && endDate ? `${shortDate(startDate)} – ${shortDate(endDate)}, ${endDate.slice(0, 4)}` : "Reporting period loading…"} <span>· Completed days</span></span></div>

    <div className="wa-section-heading"><h2>Search performance</h2><span>Search data · {availabilityLabel("search")}</span></div>
    <section className="wa-panel wa-gsc" aria-label="Search performance">
      <div className="wa-gsc-tiles">{searchSeries.map((item) => <SearchTile key={item.key} item={item} value={totals[item.key]} previous={comparison[item.key]} selected={series[item.key]} onToggle={() => setSeries((value) => ({ ...value, [item.key]: !value[item.key] }))} />)}</div>
      <div className="wa-chart wa-gsc-chart" role="img" aria-label={`Daily search performance for ${periodLabel(days)}`}>{!daily.length ? <div className="wa-empty">{loading ? "Loading search performance…" : "No search data is available for this period. Run a Search Console sync above."}</div> : !searchSeries.filter((item) => series[item.key]).length ? <div className="wa-empty">Select a metric above to show it on the chart.</div> : <ResponsiveContainer width="100%" height="100%"><LineChart data={daily} margin={{ top: 22, right: 4, bottom: 4, left: 4 }}>
        <CartesianGrid vertical={false} stroke="#eef1f6" />
        <XAxis dataKey="name" tickFormatter={(value) => new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })} minTickGap={40} axisLine={{ stroke: "#dadce0" }} tickLine={false} tick={{ fill: "#5f6368", fontSize: 11 }} />
        {searchSeries.filter((item) => series[item.key]).map((item, index) => <YAxis key={item.key} yAxisId={item.key} orientation={index === 1 ? "right" : "left"} hide={index > 1} reversed={item.key === "position"} domain={item.key === "position" ? [1, "auto"] : [0, "auto"]} allowDecimals={item.key !== "clicks" && item.key !== "impressions"} tickFormatter={axisTick(item.key)} axisLine={false} tickLine={false} width={44} tick={{ fill: "#5f6368", fontSize: 11 }} label={{ value: item.label.replace(/^(Total|Average) /, "").replace(/^./, (c) => c.toUpperCase()), position: "top", offset: 10, fill: "#5f6368", fontSize: 11, dx: index === 1 ? -6 : 6 }} />)}
        <Tooltip labelFormatter={(value) => new Date(`${value}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })} formatter={(value, name, entry) => [value === null || value === undefined ? "—" : display(value, entry.dataKey), name]} contentStyle={{ borderRadius: 10, border: "1px solid #dadce0", fontSize: 12, boxShadow: "0 8px 24px -10px rgba(60,64,67,.35)" }} cursor={{ stroke: "#bdc1c6" }} />
        {searchSeries.filter((item) => series[item.key]).map((item) => <Line key={item.key} yAxisId={item.key} name={item.label.replace(/^(Total|Average) /, "").replace(/^./, (c) => c.toUpperCase())} type="linear" dataKey={item.key} stroke={item.color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} connectNulls={false} isAnimationActive={false} />)}
      </LineChart></ResponsiveContainer>}</div>
      <div className="wa-chart-note">Daily values from Google Search Console. Click a metric to show or hide it; each metric has its own scale, and position is inverted (1 is the top result).</div>
    </section>

    <div className="wa-section-heading wa-spaced"><h2>Visitor behaviour</h2><span>Visitor data · {availabilityLabel("traffic")}</span></div>
    <div className="wa-visitor-metrics">{[["entries", "Sessions"], ["views", "Page views"], ["engagementRate", "Engagement rate"], ["engagementSeconds", "Avg. engagement / session"]].map(([key, label]) => <article key={key}><div>{label}<span title={definitions[key]}><Info size={13} /></span></div><strong>{display(totals[key], key)}</strong><span className="wa-small">{key === "entries" ? "Visits starting on your website" : key === "views" ? "Includes repeated page visits" : key === "engagementRate" ? "Share of engaged sessions" : "Time actively engaging with the site"}</span></article>)}</div>

    <div className="wa-breakdowns"><section className="wa-panel"><div className="wa-panel-heading"><div><h2>Where visitors come from</h2><p>Share of sessions by traffic source.</p></div><Globe2 size={19} /></div><div className="wa-bars">{!sources.length && <div className="wa-empty">{loading ? "Loading traffic sources…" : "No traffic source data yet."}</div>}{sources.map((row, index) => <div className="wa-bar-row" key={row.name}><div><span><i style={{ background: ["#2563eb", "#6366f1", "#14b8a6", "#f59e0b", "#94a3b8"][index] }} />{row.name}</span><span><strong>{number(row.entries)}</strong> {percent(percentage(row.entries, totals.entries))}</span></div><div className="wa-bar-track"><div style={{ width: `${percentage(row.entries, totals.entries)}%`, background: ["#2563eb", "#6366f1", "#14b8a6", "#f59e0b", "#94a3b8"][index] }} /></div></div>)}</div></section><section className="wa-panel"><div className="wa-panel-heading"><div><h2>Devices</h2><p>How visitors access the website.</p></div><Smartphone size={19} /></div><div className="wa-device-strip">{deviceRows.map((row, index) => <div key={row.name} title={`${row.name}: ${percent(percentage(row.entries, totals.entries))}`} style={{ width: `${percentage(row.entries, totals.entries)}%`, background: ["#2563eb", "#6366f1", "#14b8a6"][index] }} />)}</div><div className="wa-device-list">{!deviceRows.length && <div className="wa-empty">{loading ? "Loading devices…" : "No device data yet."}</div>}{deviceRows.map((row, index) => <div key={row.name}><span><i style={{ background: ["#2563eb", "#6366f1", "#14b8a6"][index] }} />{row.name}</span><strong>{number(row.entries)}<small>{percent(percentage(row.entries, totals.entries))}</small></strong></div>)}</div></section></div>

    <section className="wa-panel wa-detail-table"><div className="wa-panel-heading"><div><h2>Explore performance</h2><p>Compare pages, search queries, and visitor entry and exit points.</p></div></div><div className="wa-tabs" role="tablist" aria-label="Analytics breakdown">{tabs.map((item) => <button key={item.id} id={`wa-tab-${item.id}`} role="tab" aria-selected={tab === item.id} aria-controls="wa-table-panel" onClick={() => selectTab(item.id)}>{item.label}</button>)}</div><div className="wa-table-controls"><span>{tab === "exits" ? "Exits are final recorded page visits, not proof of abandonment." : tab === "entries" ? "Entry pages are where sessions begin." : tab === "queries" ? "Reported search queries; withheld queries may not appear in this breakdown." : tab === "sources" ? "Sessions across all website traffic sources." : "Click a page to inspect its search and visitor performance."}</span><label className="wa-search"><Search size={15} /><input aria-label="Search analytics table" placeholder={tab === "queries" ? "Search queries…" : tab === "sources" ? "Search sources…" : "Search pages…"} value={search} onChange={(event) => { setSearch(event.target.value); setPageNumber(1); }} /></label></div><div role="tabpanel" id="wa-table-panel" aria-labelledby={`wa-tab-${tab}`} className="wa-table-scroll"><table><thead><tr>{activeTab.columns.map(([key, label]) => <th key={key} aria-sort={sort.key === key ? sort.descending ? "descending" : "ascending" : "none"}><button title={definitions[key]} onClick={() => { setSort({ key, descending: sort.key === key ? !sort.descending : key !== "name" }); setPageNumber(1); }}>{label}{sort.key === key && <span>{sort.descending ? " ↓" : " ↑"}</span>}</button></th>)}</tr></thead><tbody>{visibleRows.map((row) => <tr key={row.name}>{activeTab.columns.map(([key]) => <td key={key}>{key === "name" && !["queries", "sources"].includes(tab) ? <button className="wa-page-link" onClick={() => setSelectedPage(row.name)}><span>{row.title}<small>{row.name}</small></span><ArrowUpRight size={14} /></button> : display(row[key], key)}</td>)}</tr>)}{!visibleRows.length && <tr><td colSpan={activeTab.columns.length}><div className="wa-empty">{loading ? "Loading analytics…" : error ? "Analytics could not be loaded. Use Retry above." : search ? `No results match “${search}”.` : "No analytics records for this period and device."} {search && <button className="wa-reset" onClick={() => setSearch("")}>Clear search</button>}</div></td></tr>}</tbody></table></div><div className="wa-pagination"><span>{tableRows.length ? `${(pageNumber - 1) * 5 + 1}–${Math.min(pageNumber * 5, tableRows.length)} of ${tableRows.length}` : "0 results"}</span><div><button className="wa-icon-button" aria-label="Previous table page" disabled={pageNumber === 1} onClick={() => setPageNumber((value) => value - 1)}><ChevronLeft size={16} /></button><span>Page {pageNumber} of {pageCount}</span><button className="wa-icon-button" aria-label="Next table page" disabled={pageNumber >= pageCount} onClick={() => setPageNumber((value) => value + 1)}><ChevronRight size={16} /></button></div></div></section>

    {detail && <section className="wa-panel wa-page-detail" aria-label="Selected page details"><div className="wa-panel-heading"><div><h2>{detail.title}</h2><p>{detail.name} · {periodLabel(days)} · {device}</p></div><button className="wa-icon-button" aria-label="Close page details" onClick={() => setSelectedPage(null)}><X size={18} /></button></div><div className="wa-detail-metrics">{[["clicks", "Search clicks"], ["impressions", "Impressions"], ["entries", "Entrances"], ["exits", "Exits"], ["exitRate", "Exit rate"], ["engagementRate", "Engagement rate"]].map(([key, label]) => <div key={key}><span title={definitions[key]}>{label}</span><strong>{display(detail[key], key)}</strong></div>)}</div></section>}
    <footer className="wa-footer"><Info size={14} /><span>Visitor metrics come from the site's own page-view tracking and cover completed days (India time); today appears tomorrow. Search metrics come from Google Search Console syncs and may omit queries below Google's privacy thresholds.</span></footer>
  </div>;
}
