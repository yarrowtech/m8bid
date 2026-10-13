import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import heroImg from "../assets/investors-hero.jpg";
import sampleImg from "../assets/fundraising-example.jpg";
import { getAllCampaigns } from "../api/campaign";
import SEO from "../components/SEO.jsx";

const INR = (n) => {
  const num = Number(n || 0);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `₹${num}`;
  }
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const pickFirst = (...vals) => {
  for (const v of vals) {
    if (v === 0) return 0;
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return null;
};

const getFileUrl = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.url || value.secure_url || value.fileUrl || value.path || "";
  }
  return "";
};

const statusTone = (status = "") => {
  const s = String(status).toLowerCase();
  if (
    ["verified", "approved", "clear", "available", "yes", "connected"].includes(s)
  )
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (["pending", "under review", "under_review", "processing"].includes(s))
    return "text-amber-700 bg-amber-50 border-amber-200";
  if (["rejected", "failed", "not available", "missing", "no"].includes(s))
    return "text-rose-700 bg-rose-50 border-rose-200";
  if (["uploaded"].includes(s))
    return "text-blue-700 bg-blue-50 border-blue-200";
  return "text-slate-700 bg-slate-50 border-slate-200";
};

const StatusIcon = ({ status }) => {
  const s = String(status || "").toLowerCase();
  const ok = [
    "verified",
    "approved",
    "clear",
    "available",
    "yes",
    "connected",
    "uploaded",
  ].includes(s);
  const bad = ["rejected", "failed", "missing", "not available", "no"].includes(
    s
  );

  if (ok)
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-[9px] font-bold text-emerald-700">
        ✓
      </span>
    );
  if (bad)
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-rose-300 bg-rose-50 text-[9px] font-bold text-rose-700">
        ✕
      </span>
    );
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-[9px] font-bold text-amber-700">
      •
    </span>
  );
};

function parseEndTime(raw) {
  const maybe =
    raw?.deadline ||
    raw?.endDate ||
    raw?.endsAt ||
    raw?.campaignEndDate ||
    raw?.closeDate ||
    raw?.companyId?.deadline ||
    null;
  if (!maybe) return null;
  const t = new Date(maybe).getTime();
  return Number.isFinite(t) ? t : null;
}

function formatCountdown(ms) {
  if (ms == null) return "No deadline";
  if (ms <= 0) return "Ended";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hrs = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `${days}d left`;
  if (hrs > 0) return `${hrs}h left`;
  return `${mins}m left`;
}

const QUICK_CHIPS = [
  { id: "ALL", label: "All" },
  { id: "ENDING", label: "Ending soon" },
  { id: "ALMOST", label: "Almost funded" },
  { id: "NEW", label: "New this week" },
];

// category → colour identity
function catColor(name = "") {
  const s = String(name).toLowerCase();
  if (/tech|software|app|ai|saas|digital|fintech/.test(s))
    return { dot: "bg-blue-500", bar: "bg-blue-600" };
  if (/food|agri|farm|beverage|restaurant/.test(s))
    return { dot: "bg-emerald-500", bar: "bg-emerald-600" };
  if (/health|medical|care|pharma|wellness/.test(s))
    return { dot: "bg-rose-500", bar: "bg-rose-600" };
  if (/edu|school|learn|academy|training/.test(s))
    return { dot: "bg-amber-500", bar: "bg-amber-500" };
  if (/energy|solar|green|climate|environment|renewable/.test(s))
    return { dot: "bg-teal-500", bar: "bg-teal-600" };
  if (/fashion|retail|art|craft|design|media|creative/.test(s))
    return { dot: "bg-violet-500", bar: "bg-violet-600" };
  return { dot: "bg-blue-500", bar: "bg-blue-600" };
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[16/10] w-full animate-pulse bg-slate-100" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-1.5 w-full animate-pulse rounded-full bg-slate-100" />
        <div className="h-9 w-full animate-pulse rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export default function BrowseContributors() {
  const [raisers, setRaisers] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");
  const [quickFilter, setQuickFilter] = useState("ALL");
  const [tick, setTick] = useState(0);

  const [legalPopup, setLegalPopup] = useState({
    open: false,
    x: 0,
    y: 0,
    item: null,
  });

  const navigate = useNavigate();

  const fetchAllCampaigns = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const res = await getAllCampaigns();
      const list = Array.isArray(res?.data) ? res.data : [];
      setRaisers(list);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setErrMsg("Could not load campaigns. Please try again.");
      setRaisers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCampaigns();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const closePopup = () =>
      setLegalPopup({ open: false, x: 0, y: 0, item: null });
    if (legalPopup.open) window.addEventListener("click", closePopup);
    return () => window.removeEventListener("click", closePopup);
  }, [legalPopup.open]);

  const handleViewDetails = (campaign) => {
    const campaignId = campaign?._id || campaign?.id;
    navigate(
      campaignId ? `/contribution-detail/${campaignId}` : "/contribution-detail",
      { state: { campaign } }
    );
  };

  const showMore = () => setVisibleCount((prev) => prev + 9);

  const scrollToGrid = () => {
    document
      .getElementById("campaigns-grid")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const locationOptions = useMemo(() => {
    const set = new Set();
    (raisers || []).forEach((f) => {
      const city = f?.city ? String(f.city).trim() : "";
      const state = f?.state ? String(f.state).trim() : "";
      const country = f?.country ? String(f.country).trim() : "";
      const label = [city, state, country].filter(Boolean).join(", ");
      if (label) set.add(label);
    });
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [raisers]);

  const normalized = useMemo(() => {
    const now = Date.now();

    return (raisers || []).map((f, index) => {
      const title =
        f?.projectTitle ||
        f?.title ||
        f?.companyId?.projectTitle ||
        "Untitled Project";

      const owner = f?.userId?.name || "Unknown";

      const target = Number(
        f?.moneyToRaise ?? f?.fundingGoal ?? f?.goalAmount ?? 0
      );
      const raised = Number(
        f?.moneyRaised ?? f?.raisedAmount ?? f?.currentFunding ?? 0
      );

      const progress = target > 0 ? clamp((raised / target) * 100, 0, 100) : 0;

      const city = f?.city ? String(f.city).trim() : "";
      const state = f?.state ? String(f.state).trim() : "";
      const country = f?.country ? String(f.country).trim() : "";
      const locationLabel = [city, state, country].filter(Boolean).join(", ");

      const cover =
        getFileUrl(f?.imageUrl) ||
        getFileUrl(f?.companyId?.photo) ||
        getFileUrl(f?.photo) ||
        getFileUrl(f?.companyId?.images?.[0]) ||
        getFileUrl(f?.images?.[0]) ||
        sampleImg;

      const endsAt = parseEndTime(f);
      const msLeft = endsAt == null ? null : endsAt - now;

      const description = pickFirst(
        f?.projectOverview,
        f?.description,
        f?.introduction,
        f?.companyId?.projectOverview,
        f?.companyId?.description,
        "No description available."
      );

      const daysToRaise = pickFirst(f?.daysToRaise, f?.duration, "N/A");
      const category =
        f?.projectCategory ||
        f?.category ||
        f?.companyId?.projectTitle?. 
          split(" ")?.[0] ||
        (f?.state ? String(f.state).split(" ")[0] : "Campaign");

      const legalDocs = [
        {
          label: "Trade License",
          status: f?.licenseStatus || (f?.license ? "Uploaded" : "Pending"),
          details: pickFirst(f?.licenseNumber, f?.licenseDetails, "-"),
        },
        {
          label: "Company Registration",
          status:
            f?.companyRegistrationStatus ||
            (f?.companyRegistration ? "Uploaded" : "Pending"),
          details: pickFirst(f?.registrationNumber, f?.registrationDetails, "-"),
        },
        {
          label: "Tax Document",
          status: f?.gstStatus || (f?.gst ? "Uploaded" : "Pending"),
          details: pickFirst(f?.gstNumber, f?.gstDetails, "-"),
        },
        {
          label: "Legal Document",
          status:
            f?.legalDocumentStatus ||
            (f?.legalDocument ? "Uploaded" : "Pending"),
          details: pickFirst(f?.legalDocumentName, f?.legalDetails, "-"),
        },
        {
          label: "PAN Card",
          status: f?.panStatus || (f?.panCard ? "Uploaded" : "Pending"),
          details: pickFirst(f?.panNumber, "-"),
        },
        {
          label: "Address Proof",
          status:
            f?.addressProofStatus || (f?.addressProof ? "Uploaded" : "Pending"),
          details: pickFirst(f?.addressProofType, "-"),
        },
      ];

      return {
        raw: f,
        id: f?._id || `${title}-${owner}-${index}`,
        title,
        owner,
        target,
        raised,
        progress,
        locationLabel: locationLabel || "Location not provided",
        cover,
        category,
        createdAt: f?.createdAt ? new Date(f.createdAt).getTime() : 0,
        endsAt,
        msLeft,
        countdownLabel: formatCountdown(msLeft),
        isEndingSoon:
          msLeft != null && msLeft > 0 && msLeft <= 7 * 24 * 60 * 60 * 1000,
        description,
        daysToRaise,
        legalDocs,
      };
    });
  }, [raisers, tick]);

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    let list = normalized.filter((x) => {
      const matchesQuery =
        !q ||
        x.title.toLowerCase().includes(q) ||
        x.owner.toLowerCase().includes(q) ||
        x.locationLabel.toLowerCase().includes(q) ||
        x.description.toLowerCase().includes(q);

      const matchesLocation =
        locationFilter === "ALL" || x.locationLabel === locationFilter;

      const matchesQuick =
        quickFilter === "ALL" ||
        (quickFilter === "ENDING" && x.isEndingSoon) ||
        (quickFilter === "ALMOST" && x.progress >= 85) ||
        (quickFilter === "NEW" && x.createdAt > 0 && x.createdAt >= weekAgo);

      return matchesQuery && matchesLocation && matchesQuick;
    });

    list.sort((a, b) => {
      if (sort === "ENDING_SOON") {
        const aKey =
          a.msLeft != null && a.msLeft > 0 ? a.msLeft : Number.POSITIVE_INFINITY;
        const bKey =
          b.msLeft != null && b.msLeft > 0 ? b.msLeft : Number.POSITIVE_INFINITY;
        if (aKey !== bKey) return aKey - bKey;
        return b.createdAt - a.createdAt;
      }
      if (sort === "MOST_FUNDED") return b.progress - a.progress;
      if (sort === "TARGET_HIGH") return b.target - a.target;
      if (sort === "TARGET_LOW") return a.target - b.target;
      return b.createdAt - a.createdAt;
    });

    return list;
  }, [normalized, query, locationFilter, sort, quickFilter]);

  const visibleList = filteredAndSorted.slice(0, visibleCount);

  const stats = useMemo(() => {
    const total = filteredAndSorted.length;
    const totalRaised = filteredAndSorted.reduce(
      (s, x) => s + (x.raised || 0),
      0
    );
    const avgProgress =
      total > 0
        ? Math.round(
            filteredAndSorted.reduce((s, x) => s + (x.progress || 0), 0) / total
          )
        : 0;
    return { total, totalRaised, avgProgress };
  }, [filteredAndSorted]);

  const hasFilters =
    query.trim() !== "" ||
    locationFilter !== "ALL" ||
    sort !== "NEWEST" ||
    quickFilter !== "ALL";

  const resetFilters = () => {
    setQuery("");
    setLocationFilter("ALL");
    setSort("NEWEST");
    setQuickFilter("ALL");
    setVisibleCount(9);
  };

  return (
    <>
      <SEO
        title="Browse Campaigns — Discover & Contribute to Verified Startups"
        description="Discover active raising campaigns from verified startups, businesses, and founders on MateBid. Search, filter by location, evaluate funding progress and legal status, then contribute with full transparency."
        keywords="browse campaigns, contribute to startups India, verified raising campaigns, startup contribution platform, business crowdfunding, contribute to campaigns, active campaigns MateBid, crowdfunding India, campaign funding progress, contributor platform"
        canonical="/browse-contributors"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": "https://www.matebid.com/browse-contributors",
          name: "Browse Campaigns — Discover & Contribute to Verified Startups | M8BID",
          description:
            "Discover active Raising campaigns from verified startups, businesses, and founders. Search, filter, and contribute with full transparency on MateBid.",
          url: "https://www.matebid.com/browse-contributors",
          isPartOf: { "@id": "https://www.matebid.com/#website" },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.matebid.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Browse Campaigns",
                item: "https://www.matebid.com/browse-contributors",
              },
            ],
          },
        }}
      />
      <section
        className="min-h-screen bg-white text-slate-900"
        style={{
          fontFamily:
            "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        }}
      >
        {/* ===== HERO ===== */}
        <div className="relative border-b border-slate-200">
          <div className="relative h-[280px] w-full overflow-hidden sm:h-[360px]">
            <img
              src={heroImg}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/25 to-slate-950/25" />
          </div>

          <div className="relative mx-auto -mt-40 max-w-3xl px-6 pb-2 sm:-mt-52">
            <div className="rounded-3xl border border-slate-200 bg-white/95 p-7 text-center shadow-[0_28px_70px_-28px_rgba(15,23,42,0.4)] backdrop-blur sm:p-9">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Verified campaign directory
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-[2.75rem] sm:leading-[1.1]">
                Fund the ideas
                <span className="text-blue-600"> worth backing.</span>
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-slate-600">
                Browse startups and businesses raising on MateBid — live
                funding data, public legal status, full transparency.
              </p>

              <div className="mx-auto mt-6 flex max-w-xl items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10">
                <Search className="ml-2.5 h-5 w-5 shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setVisibleCount(9);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && scrollToGrid()}
                  placeholder="Search by project, founder or city"
                  className="min-w-0 flex-1 bg-transparent px-1.5 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  onClick={scrollToGrid}
                  className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Search
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[12px] font-medium text-slate-500">
                {["Approval status shown", "Legal status public", "Live funding data"].map(
                  (t) => (
                    <span key={t} className="inline-flex items-center gap-1.5">
                      <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-100 text-[8px] font-bold text-emerald-700">
                        ✓
                      </span>
                      {t}
                    </span>
                  )
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-slate-100 pt-5 text-sm text-slate-500">
                <span>
                  <b className="font-semibold text-slate-900">
                    {loading ? "—" : stats.total}
                  </b>{" "}
                  campaigns
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>
                  <b className="font-semibold text-slate-900">
                    {loading ? "—" : INR(stats.totalRaised)}
                  </b>{" "}
                  raised
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>
                  <b className="font-semibold text-slate-900">
                    {loading ? "—" : `${stats.avgProgress}%`}
                  </b>{" "}
                  avg funded
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== FILTER BAR ===== */}
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CHIPS.map((chip) => {
                  const active = quickFilter === chip.id;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => {
                        setQuickFilter(chip.id);
                        setVisibleCount(9);
                      }}
                      className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                        active
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    setVisibleCount(9);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  {locationOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "ALL" ? "All locations" : opt}
                    </option>
                  ))}
                </select>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="NEWEST">Newest</option>
                  <option value="ENDING_SOON">Ending soon</option>
                  <option value="MOST_FUNDED">Most funded</option>
                  <option value="TARGET_HIGH">Goal: high to low</option>
                  <option value="TARGET_LOW">Goal: low to high</option>
                </select>
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="px-2 text-sm font-medium text-slate-500 hover:text-slate-900"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== GRID ===== */}
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div id="campaigns-grid" className="scroll-mt-4" />

          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                <span className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
                Explore campaigns
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                {loading
                  ? "Loading the latest raises…"
                  : `${filteredAndSorted.length} listed ${
                      filteredAndSorted.length === 1 ? "campaign" : "campaigns"
                    } open for contribution`}
              </p>
            </div>
          </div>

          {errMsg && (
            <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {errMsg}
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
              <p className="text-base font-semibold text-slate-900">
                No campaigns found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try a different search or clear your filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleList.map((item) => {
                  const funded = item.progress >= 100;
                  const pct = Math.round(item.progress);
                  const cc = catColor(item.category);

                  return (
                    <article
                      key={item.id}
                      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition duration-200 hover:-translate-y-1.5 hover:ring-slate-300 hover:shadow-[0_22px_50px_-20px_rgba(15,23,42,0.28)]"
                    >
                      <span className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                      <button
                        type="button"
                        onClick={() => handleViewDetails(item.raw)}
                        className="relative block aspect-[16/10] w-full overflow-hidden bg-slate-100 text-left"
                      >
                        <img
                          src={item.cover}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur">
                          <span className={`h-1.5 w-1.5 rounded-full ${cc.dot}`} />
                          {item.category}
                        </span>
                        {item.raw.status === "pending" ? (
                          <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 shadow-sm">Awaiting approval</span>
                        ) : funded ? (
                          <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                            Funded
                          </span>
                        ) : item.isEndingSoon ? (
                          <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                            {item.countdownLabel}
                          </span>
                        ) : null}
                      </button>

                      <div className="flex flex-1 flex-col p-4">
                        <h3
                          onClick={() => handleViewDetails(item.raw)}
                          className="line-clamp-2 cursor-pointer text-[15px] font-semibold leading-snug text-slate-900 transition group-hover:text-blue-700"
                        >
                          {item.title}
                        </h3>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {item.owner} · {item.locationLabel}
                        </p>
                        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-slate-500">
                          {item.description}
                        </p>

                        <div className="mt-auto pt-4">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                funded ? "bg-emerald-500" : cc.bar
                              }`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <div className="mt-2.5 flex items-baseline justify-between">
                            <p className="text-[15px]">
                              <span className="font-bold text-slate-900">
                                {INR(item.raised)}
                              </span>{" "}
                              <span className="text-xs text-slate-400">
                                raised
                              </span>
                            </p>
                            <p className="text-xs font-semibold text-slate-600">
                              {pct}%
                              <span className="font-medium text-slate-400">
                                {" "}
                                of {INR(item.target)}
                              </span>
                            </p>
                          </div>
                          <p className="mt-2 text-[11px] text-slate-400">
                            {item.countdownLabel}
                          </p>
                        </div>

                        <button
                          onClick={() => handleViewDetails(item.raw)}
                          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          View campaign
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setLegalPopup((prev) => ({
                              open: !(prev.open && prev.item?.id === item.id),
                              x: rect.right,
                              y: rect.bottom + 8,
                              item,
                            }));
                          }}
                          className="mt-2 w-full text-center text-[11px] font-medium text-slate-400 transition hover:text-slate-700"
                        >
                          Legal &amp; civic status
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {visibleCount < filteredAndSorted.length && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={showMore}
                    className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {legalPopup.open && legalPopup.item && (
          <div
            className="fixed z-[9999]"
            style={{
              top: `${legalPopup.y}px`,
              left: `${Math.max(
                12,
                Math.min(legalPopup.x - 340, window.innerWidth - 352)
              )}px`,
              width: "340px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="app-popup-panel rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)]">
              <div className="mb-3 flex items-baseline justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Legal &amp; civic status
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Uploaded document review
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLegalPopup({ open: false, x: 0, y: 0, item: null })
                  }
                  className="text-xs text-slate-400 hover:text-slate-900"
                >
                  ✕
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {legalPopup.item.legalDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-slate-800">
                        {doc.label}
                      </p>
                      <p className="mt-0.5 truncate text-[9px] text-slate-400">
                        {doc.details || "-"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <StatusIcon status={doc.status} />
                      <span
                        className={`rounded-full border px-1.5 py-0.5 text-[8px] font-semibold ${statusTone(
                          doc.status
                        )}`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
