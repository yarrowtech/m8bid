import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ArrowDownToLine, ArrowUpRight, BarChart3, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Globe2, Info, Menu, MousePointer2, Search, Smartphone, TrendingUp, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getWebsiteAnalyticsSections, getPageDetails, syncWebsiteSearch } from "../../api/websiteAnalytics";
import "./WebsiteAnalytics.css";

const number = (value) => new Intl.NumberFormat("en-IN").format(Math.round(value));
const compact = (value) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
const percent = (value) => `${value.toFixed(1)}%`;
const shortDate = (value) => new Date(`${value}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
const duration = (seconds) => `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
const devices = ["Mobile", "Desktop", "Tablet"];
const percentage = (value, total) => total ? value / total * 100 : 0;
const emptyReport = { totals: {}, comparison: {}, daily: [], pages: [], queries: [], sources: [], devices: [], entryPages: [], exitPages: [], sectionErrors: [], availability: {} };
const definitions = {
  clicks: "Clicks from Google search results to your website.",
  impressions: "Times a link to your website appeared in Google search results.",
  ctr: "Search clicks divided by search impressions.",
  position: "Average search result position, weighted by impressions. Lower is better.",
  entries: "Sessions that started on this page.",
  views: "Page views, including repeated views.",
  engagementRate: "Engaged sessions divided by sessions. Engagement rules will be defined by the connected analytics source.",
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

function Metric({ label, value, previous, metric, color, icon, lowerBetter = false }) {
  const Icon = icon;
  const delta = Number.isFinite(value) && previous ? (value - previous) / previous * 100 : null;
  const improved = delta !== null && (lowerBetter ? delta < 0 : delta > 0);
  return <article className={`wa-metric wa-${color}`}>
    <div className="wa-metric-label"><span>{label}</span><span className="wa-metric-icon"><Icon size={17} aria-hidden="true" /></span></div>
    <div className="wa-metric-value">{display(value, metric)}</div>
    <div className="wa-metric-foot"><span className={delta === null || delta === 0 ? "" : improved ? "wa-positive" : "wa-negative"}>{delta === null ? "No comparison" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`}</span><span>vs previous period</span><Info size={13} aria-label={definitions[metric]}><title>{definitions[metric]}</title></Info></div>
  </article>;
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
  const [series, setSeries] = useState({ clicks: true, impressions: true });
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
      <div><strong>Google Search Console</strong><p>Import finalized search data for all devices. Use 60 days for the first import; recent days may still be unavailable.</p></div>
      <div className="wa-filters"><label className="wa-select"><select aria-label="Search sync period" value={syncDays} disabled={syncing} onChange={(event) => setSyncDays(Number(event.target.value))}><option value={7}>Sync last 7 days</option><option value={60}>Initial import · 60 days</option></select><ChevronDown size={14} /></label><button className="wa-button" disabled={syncing} onClick={handleSearchSync}>{syncing ? "Syncing Search Console…" : "Sync Search Console"}</button></div>
      {syncMessage && <p className={syncError ? "wa-sync-error" : "wa-sync-success"} role={syncError ? "alert" : "status"}>{syncMessage}</p>}
    </section>

    <div className="wa-toolbar"><div className="wa-filters"><label className="wa-select"><CalendarDays size={16} /><select aria-label="Date range" value={days} onChange={(event) => { setDays(Number(event.target.value)); setPageNumber(1); }}><option value={7}>Last 7 days</option><option value={28}>Last 28 days</option><option value={30}>Last 30 days</option></select><ChevronDown size={14} /></label><label className="wa-select"><Smartphone size={16} /><select aria-label="Device" value={device} onChange={(event) => { setDevice(event.target.value); setPageNumber(1); }}><option>All devices</option>{devices.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>{(days !== 28 || device !== "All devices") && <button className="wa-reset" onClick={() => { setDays(28); setDevice("All devices"); setPageNumber(1); }}>Reset filters</button>}</div><span className="wa-date">{startDate && endDate ? `${shortDate(startDate)} – ${shortDate(endDate)}, ${endDate.slice(0, 4)}` : "Reporting period loading…"} <span>· Completed days</span></span></div>

    <div className="wa-section-heading"><h2>Search performance</h2><span>Search data · {availabilityLabel("search")}</span></div>
    <div className="wa-metrics">
      <Metric label="Search clicks" value={totals.clicks} previous={comparison.clicks} metric="clicks" color="blue" icon={MousePointer2} />
      <Metric label="Search impressions" value={totals.impressions} previous={comparison.impressions} metric="impressions" color="purple" icon={Search} />
      <Metric label="Average CTR" value={totals.ctr} previous={comparison.ctr} metric="ctr" color="teal" icon={TrendingUp} />
      <Metric label="Average position" value={totals.position} previous={comparison.position} metric="position" color="amber" icon={BarChart3} lowerBetter />
    </div>

    <section className="wa-panel wa-trend"><div className="wa-panel-heading"><div><h2>Search visibility over time</h2><p>Daily clicks and impressions from organic search.</p></div><div className="wa-legend">{[["clicks", "Clicks"], ["impressions", "Impressions"]].map(([key, label]) => <label key={key}><input type="checkbox" checked={series[key]} onChange={() => setSeries((value) => ({ ...value, [key]: !value[key] }))} /><span className={`wa-dot wa-dot-${key}`} />{label}</label>)}</div></div>
      <div className="wa-chart" role="img" aria-label={`Search performance for ${days} days`}>{!daily.length ? <div className="wa-empty">{loading ? "Loading search performance…" : "No search data is available for this period."}</div> : !series.clicks && !series.impressions ? <div className="wa-empty">Select Clicks or Impressions to show a trend.</div> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={daily} margin={{ top: 12, right: 8, bottom: 8, left: 0 }}><defs><linearGradient id="waClicks" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0} /></linearGradient><linearGradient id="waImpr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.18} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#edf0f5" /><XAxis dataKey="name" tickFormatter={shortDate} minTickGap={34} axisLine={false} tickLine={false} tick={{ fill: "#7b8799", fontSize: 11 }} /><YAxis yAxisId="clicks" tickFormatter={compact} axisLine={false} tickLine={false} width={42} tick={{ fill: "#2563eb", fontSize: 11 }} /><YAxis yAxisId="impressions" orientation="right" tickFormatter={compact} axisLine={false} tickLine={false} width={46} tick={{ fill: "#6366f1", fontSize: 11 }} /><Tooltip labelFormatter={shortDate} formatter={(value, name) => [number(value), name]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 12px 28px -12px rgba(30,41,90,.25)" }} cursor={{ stroke: "#c7d2fe", strokeDasharray: "4 4" }} />{series.clicks && <Area yAxisId="clicks" name="Clicks" type="monotone" dataKey="clicks" stroke="#2563eb" fill="url(#waClicks)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} isAnimationActive={false} />}{series.impressions && <Area yAxisId="impressions" name="Impressions" type="monotone" dataKey="impressions" stroke="#6366f1" fill="url(#waImpr)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} isAnimationActive={false} />}</AreaChart></ResponsiveContainer>}</div><div className="wa-chart-note">Clicks use the left axis; impressions use the right axis. Search clicks and website sessions are different measures.</div>
    </section>

    <div className="wa-section-heading wa-spaced"><h2>Visitor behaviour</h2><span>Visitor data · {availabilityLabel("traffic")}</span></div>
    <div className="wa-visitor-metrics">{[["entries", "Sessions"], ["views", "Page views"], ["engagementRate", "Engagement rate"], ["engagementSeconds", "Avg. engagement / session"]].map(([key, label]) => <article key={key}><div>{label}<span title={definitions[key]}><Info size={13} /></span></div><strong>{display(totals[key], key)}</strong><span className="wa-small">{key === "entries" ? "Visits starting on your website" : key === "views" ? "Includes repeated page visits" : key === "engagementRate" ? "Share of engaged sessions" : "Time actively engaging with the site"}</span></article>)}</div>

    <div className="wa-breakdowns"><section className="wa-panel"><div className="wa-panel-heading"><div><h2>Where visitors come from</h2><p>Share of sessions by traffic source.</p></div><Globe2 size={19} /></div><div className="wa-bars">{!sources.length && <div className="wa-empty">{loading ? "Loading traffic sources…" : "No traffic source data yet."}</div>}{sources.map((row, index) => <div className="wa-bar-row" key={row.name}><div><span><i style={{ background: ["#2563eb", "#6366f1", "#14b8a6", "#f59e0b", "#94a3b8"][index] }} />{row.name}</span><span><strong>{number(row.entries)}</strong> {percent(percentage(row.entries, totals.entries))}</span></div><div className="wa-bar-track"><div style={{ width: `${percentage(row.entries, totals.entries)}%`, background: ["#2563eb", "#6366f1", "#14b8a6", "#f59e0b", "#94a3b8"][index] }} /></div></div>)}</div></section><section className="wa-panel"><div className="wa-panel-heading"><div><h2>Devices</h2><p>How visitors access the website.</p></div><Smartphone size={19} /></div><div className="wa-device-strip">{deviceRows.map((row, index) => <div key={row.name} title={`${row.name}: ${percent(percentage(row.entries, totals.entries))}`} style={{ width: `${percentage(row.entries, totals.entries)}%`, background: ["#2563eb", "#6366f1", "#14b8a6"][index] }} />)}</div><div className="wa-device-list">{!deviceRows.length && <div className="wa-empty">{loading ? "Loading devices…" : "No device data yet."}</div>}{deviceRows.map((row, index) => <div key={row.name}><span><i style={{ background: ["#2563eb", "#6366f1", "#14b8a6"][index] }} />{row.name}</span><strong>{number(row.entries)}<small>{percent(percentage(row.entries, totals.entries))}</small></strong></div>)}</div></section></div>

    <section className="wa-panel wa-detail-table"><div className="wa-panel-heading"><div><h2>Explore performance</h2><p>Compare pages, search queries, and visitor entry and exit points.</p></div></div><div className="wa-tabs" role="tablist" aria-label="Analytics breakdown">{tabs.map((item) => <button key={item.id} id={`wa-tab-${item.id}`} role="tab" aria-selected={tab === item.id} aria-controls="wa-table-panel" onClick={() => selectTab(item.id)}>{item.label}</button>)}</div><div className="wa-table-controls"><span>{tab === "exits" ? "Exits are final recorded page visits, not proof of abandonment." : tab === "entries" ? "Entry pages are where sessions begin." : tab === "queries" ? "Reported search queries; withheld queries may not appear in this breakdown." : tab === "sources" ? "Sessions across all website traffic sources." : "Click a page to inspect its search and visitor performance."}</span><label className="wa-search"><Search size={15} /><input aria-label="Search analytics table" placeholder={tab === "queries" ? "Search queries…" : tab === "sources" ? "Search sources…" : "Search pages…"} value={search} onChange={(event) => { setSearch(event.target.value); setPageNumber(1); }} /></label></div><div role="tabpanel" id="wa-table-panel" aria-labelledby={`wa-tab-${tab}`} className="wa-table-scroll"><table><thead><tr>{activeTab.columns.map(([key, label]) => <th key={key} aria-sort={sort.key === key ? sort.descending ? "descending" : "ascending" : "none"}><button title={definitions[key]} onClick={() => { setSort({ key, descending: sort.key === key ? !sort.descending : key !== "name" }); setPageNumber(1); }}>{label}{sort.key === key && <span>{sort.descending ? " ↓" : " ↑"}</span>}</button></th>)}</tr></thead><tbody>{visibleRows.map((row) => <tr key={row.name}>{activeTab.columns.map(([key]) => <td key={key}>{key === "name" && !["queries", "sources"].includes(tab) ? <button className="wa-page-link" onClick={() => setSelectedPage(row.name)}><span>{row.title}<small>{row.name}</small></span><ArrowUpRight size={14} /></button> : display(row[key], key)}</td>)}</tr>)}{!visibleRows.length && <tr><td colSpan={activeTab.columns.length}><div className="wa-empty">{loading ? "Loading analytics…" : error ? "Analytics could not be loaded. Use Retry above." : search ? `No results match “${search}”.` : "No analytics records for this period and device."} {search && <button className="wa-reset" onClick={() => setSearch("")}>Clear search</button>}</div></td></tr>}</tbody></table></div><div className="wa-pagination"><span>{tableRows.length ? `${(pageNumber - 1) * 5 + 1}–${Math.min(pageNumber * 5, tableRows.length)} of ${tableRows.length}` : "0 results"}</span><div><button className="wa-icon-button" aria-label="Previous table page" disabled={pageNumber === 1} onClick={() => setPageNumber((value) => value - 1)}><ChevronLeft size={16} /></button><span>Page {pageNumber} of {pageCount}</span><button className="wa-icon-button" aria-label="Next table page" disabled={pageNumber >= pageCount} onClick={() => setPageNumber((value) => value + 1)}><ChevronRight size={16} /></button></div></div></section>

    {detail && <section className="wa-panel wa-page-detail" aria-label="Selected page details"><div className="wa-panel-heading"><div><h2>{detail.title}</h2><p>{detail.name} · {days} days · {device}</p></div><button className="wa-icon-button" aria-label="Close page details" onClick={() => setSelectedPage(null)}><X size={18} /></button></div><div className="wa-detail-metrics">{[["clicks", "Search clicks"], ["impressions", "Impressions"], ["entries", "Entrances"], ["exits", "Exits"], ["exitRate", "Exit rate"], ["engagementRate", "Engagement rate"]].map(([key, label]) => <div key={key}><span title={definitions[key]}>{label}</span><strong>{display(detail[key], key)}</strong></div>)}</div></section>}
    <footer className="wa-footer"><Info size={14} /><span>Search and visitor metrics are fetched from the backend. Real source records must be imported before data appears. Search queries may be incomplete due to source privacy thresholds.</span></footer>
  </div>;
}
