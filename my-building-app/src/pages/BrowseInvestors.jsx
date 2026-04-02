import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/investors-hero.jpg";
import sampleImg from "../assets/fundraising-example.jpg";
import { getAllCampaigns } from "../api/campaign";

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
    ["verified", "approved", "clear", "available", "yes", "connected"].includes(
      s
    )
  ) {
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  }

  if (["pending", "under review", "under_review", "processing"].includes(s)) {
    return "text-amber-700 bg-amber-50 border-amber-200";
  }

  if (
    ["rejected", "failed", "not available", "missing", "no"].includes(s)
  ) {
    return "text-rose-700 bg-rose-50 border-rose-200";
  }

  if (["uploaded"].includes(s)) {
    return "text-blue-700 bg-blue-50 border-blue-200";
  }

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

  if (ok) {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-[9px] font-bold text-emerald-700">
        ✓
      </span>
    );
  }

  if (bad) {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-rose-300 bg-rose-50 text-[9px] font-bold text-rose-700">
        ✕
      </span>
    );
  }

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

  if (days > 0) return `${days}d ${hrs}h left`;
  if (hrs > 0) return `${hrs}h ${mins}m left`;
  return `${mins}m left`;
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[170px_1fr]">
        <div className="h-[150px] animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 md:h-full" />
        <div className="space-y-2.5 p-4">
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-full animate-pulse rounded bg-slate-200" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-11 animate-pulse rounded bg-slate-200" />
            <div className="h-11 animate-pulse rounded bg-slate-200" />
            <div className="h-11 animate-pulse rounded bg-slate-200" />
            <div className="h-11 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-8 w-full animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function BrowseInvestors() {
  const [fundraisers, setFundraisers] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");
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
      setFundraisers(list);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setErrMsg("Could not load campaigns. Please try again.");
      setFundraisers([]);
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

    if (legalPopup.open) {
      window.addEventListener("click", closePopup);
    }

    return () => window.removeEventListener("click", closePopup);
  }, [legalPopup.open]);

  const handleViewDetails = (campaign) => {
    navigate(`/investment-detail/:id`, { state: { campaign } });
  };

  const showMore = () => setVisibleCount((prev) => prev + 4);

  const locationOptions = useMemo(() => {
    const set = new Set();
    (fundraisers || []).forEach((f) => {
      const city = f?.city ? String(f.city).trim() : "";
      const state = f?.state ? String(f.state).trim() : "";
      const country = f?.country ? String(f.country).trim() : "";
      const label = [city, state, country].filter(Boolean).join(", ");
      if (label) set.add(label);
    });
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [fundraisers]);

  const normalized = useMemo(() => {
    const now = Date.now();

    return (fundraisers || []).map((f, index) => {
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

      const fundingType = pickFirst(f?.fundingType, "Donation Based");
      const profitPercentage = Number(pickFirst(f?.profitPercentage, 0));
      const daysToRaise = pickFirst(f?.daysToRaise, f?.duration, "N/A");

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
          details: pickFirst(
            f?.registrationNumber,
            f?.registrationDetails,
            "-"
          ),
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
            f?.addressProofStatus ||
            (f?.addressProof ? "Uploaded" : "Pending"),
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
        createdAt: f?.createdAt ? new Date(f.createdAt).getTime() : 0,
        endsAt,
        msLeft,
        countdownLabel: formatCountdown(msLeft),
        isEndingSoon:
          msLeft != null && msLeft > 0 && msLeft <= 7 * 24 * 60 * 60 * 1000,
        description,
        fundingType,
        profitPercentage,
        daysToRaise,
        legalDocs,
      };
    });
  }, [fundraisers, tick]);

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = normalized.filter((x) => {
      const matchesQuery =
        !q ||
        x.title.toLowerCase().includes(q) ||
        x.owner.toLowerCase().includes(q) ||
        x.locationLabel.toLowerCase().includes(q) ||
        x.description.toLowerCase().includes(q);

      const matchesLocation =
        locationFilter === "ALL" || x.locationLabel === locationFilter;

      return matchesQuery && matchesLocation;
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
  }, [normalized, query, locationFilter, sort]);

  const visibleList = filteredAndSorted.slice(0, visibleCount);

  const stats = useMemo(() => {
    const total = filteredAndSorted.length;
    const totalRaised = filteredAndSorted.reduce((s, x) => s + (x.raised || 0), 0);
    const avgProgress =
      total > 0
        ? Math.round(
            filteredAndSorted.reduce((s, x) => s + (x.progress || 0), 0) / total
          )
        : 0;
    return { total, totalRaised, avgProgress };
  }, [filteredAndSorted]);

  return (
    <section
      className="min-h-screen bg-white text-gray-900 [font-feature-settings:'ss01','cv02','cv03','cv04']"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-white to-white" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 -z-10 h-[380px] w-[760px] rounded-full bg-gradient-to-r from-blue-200/35 via-indigo-200/25 to-purple-200/35 blur-3xl" />

        <div className="mx-auto max-w-[1720px] px-5 pt-8 pb-7 sm:px-13 lg:px-20">
          {/* HERO */}
          <div className="grid items-center gap-7 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-blue-800 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                Verified fundraising & investor discovery
              </div>

              <h1 className="mt-4 text-[2rem] font-semibold tracking-[-0.02em] leading-[1.05] text-gray-900 sm:text-5xl">
                Discover Startups.
                <span className="block bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  Invest with confidence.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-[15px] leading-7 text-gray-600 sm:text-[16px]">
                Explore active campaigns, evaluate progress, and support innovative founders.
                Transparent targets, progress tracking, and clean profiles.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={() => {
                    const el = document.getElementById("campaigns-grid");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110 active:scale-[0.99]"
                >
                  Start Investing Today
                  <span className="ml-2 transition group-hover:translate-x-0.5">→</span>
                </button>

                <button
                  onClick={fetchAllCampaigns}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/85 px-6 py-3 text-sm font-semibold tracking-wide text-gray-900 shadow-sm transition hover:bg-white"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-7 grid max-w-xl grid-cols-3 gap-2.5">
                <div className="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-sm backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Campaigns
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
                    {loading ? "—" : stats.total}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-sm backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Total raised
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
                    {loading ? "—" : INR(stats.totalRaised)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-sm backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Avg progress
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
                    {loading ? "—" : `${stats.avgProgress}%`}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-2xl" />
              <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/40 shadow-xl backdrop-blur">
                <img
                  src={heroImg}
                  alt="Investors Hero"
                  className="h-[250px] w-full object-cover sm:h-[320px]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* FILTERS */}
          <div className="mt-7 rounded-2xl border border-white/50 bg-white/70 p-3.5 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-[340px_280px_220px]">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Search
                  </label>
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setVisibleCount(4);
                    }}
                    placeholder="Search by project, founder, city..."
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Location
                  </label>
                  <select
                    value={locationFilter}
                    onChange={(e) => {
                      setLocationFilter(e.target.value);
                      setVisibleCount(4);
                    }}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {locationOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt === "ALL" ? "All locations" : opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Sort
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="NEWEST">Newest</option>
                    <option value="ENDING_SOON">Ending soon</option>
                    <option value="MOST_FUNDED">Most funded</option>
                    <option value="TARGET_HIGH">Target: high → low</option>
                    <option value="TARGET_LOW">Target: low → high</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 xl:justify-end">
                <p className="text-sm font-medium text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">{visibleList.length}</span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">{filteredAndSorted.length}</span>
                </p>
                <button
                  onClick={() => {
                    setQuery("");
                    setLocationFilter("ALL");
                    setSort("NEWEST");
                    setVisibleCount(4);
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold tracking-wide text-gray-800 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>

            {errMsg && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errMsg}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CARDS */}
      <div className="mx-auto max-w-[1720px] px-5 pb-16 sm:px-6 lg:px-14">
        <div id="campaigns-grid" className="pt-1" />

        {loading ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold tracking-tight text-gray-900">
              No campaigns found
            </p>
            <p className="mt-2 text-sm font-medium text-gray-600">
              Try changing your search or filters.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setLocationFilter("ALL");
                setSort("NEWEST");
                setVisibleCount(4);
              }}
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold tracking-wide text-white hover:bg-blue-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-10 xl:grid-cols-2">
              {visibleList.map((item) => {
                const { raw: f } = item;

                const badge =
                  f?.projectCategory ||
                  f?.category ||
                  f?.companyId?.projectTitle?.split(" ")?.[0] ||
                  (f?.state ? String(f.state).split(" ")[0] : "Campaign");

                return (
                  <div
                    key={item.id}
                    className="group relative rounded-[20px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
                  >
                    <div className="grid min-h-[220px] grid-cols-1 md:grid-cols-[180px_1fr]">
                      {/* LEFT IMAGE */}
                      <div className="relative overflow-hidden rounded-t-[20px] md:rounded-l-[20px] md:rounded-tr-none">
                        <img
                          src={item.cover}
                          alt={item.title}
                          className="h-[145px] w-full object-cover md:h-full"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                        <div className="absolute left-2.5 top-2.5 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-white/95 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-800 shadow-sm">
                            {badge}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] shadow-sm ${
                              item.isEndingSoon
                                ? "bg-amber-500 text-white"
                                : "bg-white/95 text-slate-800"
                            }`}
                          >
                            {item.countdownLabel}
                          </span>
                        </div>

                        <div className="absolute bottom-2.5 left-2.5 right-2.5">
                          <p className="line-clamp-2 text-sm font-semibold text-white drop-shadow">
                            {item.locationLabel}
                          </p>
                        </div>
                      </div>

                      {/* RIGHT CONTENT */}
                      <div className="relative p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="line-clamp-1 text-[16px] font-semibold tracking-[-0.02em] text-slate-900">
                              {item.title}
                            </h3>
                            <p className="mt-0.5 text-[12px] text-slate-600">
                              by{" "}
                              <span className="font-semibold text-slate-800">
                                {item.owner}
                              </span>
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-indigo-700">
                            {item.fundingType}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-slate-600">
                          {item.description}
                        </p>

                        <div className="mt-2.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span className="font-semibold">
                              {Math.round(item.progress)}% funded
                            </span>
                            <span className="font-medium">
                              {INR(item.raised)}{" "}
                              <span className="text-slate-500">/ {INR(item.target)}</span>
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 w-full rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-2.5 grid grid-cols-2 gap-2 xl:grid-cols-4">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                              Target
                            </p>
                            <p className="mt-1 text-[11px] font-semibold text-slate-900">
                              {INR(item.target)}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                              Raised
                            </p>
                            <p className="mt-1 text-[11px] font-semibold text-slate-900">
                              {INR(item.raised)}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                              Countdown
                            </p>
                            <p className="mt-1 text-[11px] font-semibold text-slate-900">
                              {item.countdownLabel}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                              Profit Return
                            </p>
                            <p className="mt-1 text-[11px] font-semibold text-slate-900">
                              {item.fundingType === "Profit Return"
                                ? `${item.profitPercentage || 0}%`
                                : "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between gap-3">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                              Raise Time
                            </p>
                            <p className="mt-1 text-[11px] font-semibold text-slate-900">
                              {item.daysToRaise !== "N/A"
                                ? `${item.daysToRaise} days`
                                : item.endsAt
                                ? new Date(item.endsAt).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>

                          <button
                            onClick={() => handleViewDetails(item.raw)}
                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3.5 py-2 text-[11px] font-semibold tracking-wide text-white shadow-sm transition hover:bg-black active:scale-[0.99]"
                          >
                            View Profile
                            <span className="ml-1.5">→</span>
                          </button>
                        </div>

                        <div className="mt-2 flex justify-end">
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
                            className="text-[11px] font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-800"
                          >
                            Legal & Civic Status
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleCount < filteredAndSorted.length && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={showMore}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3 text-sm font-semibold tracking-wide text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110 active:scale-[0.99]"
                >
                  Show More
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
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
            <div className="mb-2.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Legal Status
                </p>
                <p className="text-[10px] text-slate-500">
                  Uploaded legal document review
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setLegalPopup({ open: false, x: 0, y: 0, item: null })
                }
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              {legalPopup.item.legalDocs.map((doc, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-800">
                        {doc.label}
                      </p>
                      <p className="mt-1 text-[9px] text-slate-500">
                        {doc.details || "-"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}