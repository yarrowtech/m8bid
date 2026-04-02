import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import sampleImg from "../assets/fundraising-example.jpg";

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

const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const getFileUrl = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.url || value.secure_url || value.fileUrl || value.path || "";
  }
  return "";
};

const isPdf = (url = "") => /\.pdf($|\?)/i.test(url);
const isImage = (url = "") =>
  /\.(jpg|jpeg|png|gif|webp|bmp|svg)($|\?)/i.test(url);

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
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-[11px] font-bold text-emerald-700">
        ✓
      </span>
    );
  }

  if (bad) {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-rose-300 bg-rose-50 text-[11px] font-bold text-rose-700">
        ✕
      </span>
    );
  }

  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-[11px] font-bold text-amber-700">
      •
    </span>
  );
};

const InfoCard = ({ label, value, subValue, className = "" }) => (
  <div
    className={`rounded-2xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm ${className}`}
  >
    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </p>
    <p className="mt-1.5 break-words text-sm font-semibold text-slate-900">
      {value}
    </p>
    {subValue ? (
      <p className="mt-1 text-[11px] text-slate-500">{subValue}</p>
    ) : null}
  </div>
);

const SectionCard = ({
  eyebrow,
  title,
  right,
  children,
  compact = false,
  className = "",
}) => (
  <div
    className={`rounded-[26px] border border-slate-200/90 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] ${
      compact ? "p-4 sm:p-4" : "p-5 sm:p-5"
    } ${className}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {eyebrow}
        </p>
        <h2
          className={`mt-2 break-words font-semibold tracking-tight text-slate-900 ${
            compact ? "text-xl sm:text-[22px]" : "text-2xl sm:text-[28px]"
          }`}
        >
          {title}
        </h2>
      </div>
      {right}
    </div>
    <div className={compact ? "mt-4" : "mt-5"}>{children}</div>
  </div>
);

export default function InvestmentDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [showVideo, setShowVideo] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState(null);

  if (!state?.campaign) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-red-50 p-6 shadow-lg">
          <h1 className="text-lg font-semibold text-red-700">
            No campaign data found.
          </h1>
          <p className="mt-2 text-sm text-red-600">
            Please go back and open a campaign again.
          </p>
          <button
            className="mt-4 w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const campaign = state.campaign;

  const title = pickFirst(
    campaign?.projectTitle,
    campaign?.title,
    "Untitled Project"
  );

  const cover = pickFirst(
    getFileUrl(campaign?.photo),
    getFileUrl(campaign?.imageUrl),
    sampleImg
  );

  const raised = Number(
    pickFirst(
      campaign?.raisedAmount,
      campaign?.moneyRaised,
      campaign?.currentFunding,
      0
    )
  );

  const target = Number(
    pickFirst(
      campaign?.moneyToRaise,
      campaign?.goalAmount,
      campaign?.fundingGoal,
      0
    )
  );

  const progressPercent = useMemo(() => {
    if (!target || target <= 0) return 0;
    return clamp((raised / target) * 100, 0, 100);
  }, [raised, target]);

  const projectText = pickFirst(
    campaign?.projectOverview,
    campaign?.introduction,
    campaign?.description,
    "No description provided."
  );

  const companyText = pickFirst(
    campaign?.companyOverview,
    campaign?.companyDescription,
    campaign?.introduction,
    "Company details are not available yet."
  );

  const companyName = pickFirst(
    campaign?.companyName,
    campaign?.businessName,
    campaign?.organizationName,
    title
  );

  const city = pickFirst(campaign?.projectLocation?.city, campaign?.city, "N/A");
  const st = pickFirst(campaign?.projectLocation?.state, campaign?.state, "N/A");
  const country = pickFirst(
    campaign?.projectLocation?.country,
    campaign?.country,
    "N/A"
  );

  const createdAt = campaign?.createdAt
    ? new Date(campaign.createdAt).toLocaleDateString()
    : "N/A";

  const category = pickFirst(
    campaign?.projectCategory,
    campaign?.category,
    "General"
  );

  const fundingType = pickFirst(campaign?.fundingType, "Donation Based");
  const profitPercentage = pickFirst(campaign?.profitPercentage, 0);
  const daysToRaise = pickFirst(campaign?.daysToRaise, 0);
  const minInvestment = pickFirst(
    campaign?.minInvestment,
    campaign?.minimumAmount,
    0
  );

  const projectImages = useMemo(() => {
    const g = [
      ...toArray(campaign?.gallery),
      ...toArray(campaign?.images),
      ...toArray(campaign?.projectImages),
      ...toArray(campaign?.photos),
    ]
      .map((item) => getFileUrl(item) || item)
      .filter(Boolean);

    if (g.length === 0 && cover) return [cover];
    return g;
  }, [campaign, cover]);

  const thumbImages = projectImages.slice(0, 6);

  const documents = useMemo(() => {
    const docs = [
      {
        name: "Trade License",
        url: getFileUrl(campaign?.license),
        status:
          campaign?.licenseStatus || (campaign?.license ? "Uploaded" : "Pending"),
        details: pickFirst(campaign?.licenseNumber, campaign?.licenseDetails, "-"),
      },
      {
        name: "Company Registration",
        url: getFileUrl(campaign?.companyRegistration),
        status:
          campaign?.companyRegistrationStatus ||
          (campaign?.companyRegistration ? "Uploaded" : "Pending"),
        details: pickFirst(
          campaign?.registrationNumber,
          campaign?.registrationDetails,
          "-"
        ),
      },
      {
        name: "GST / Tax",
        url: getFileUrl(campaign?.gst),
        status: campaign?.gstStatus || (campaign?.gst ? "Uploaded" : "Pending"),
        details: pickFirst(campaign?.gstNumber, campaign?.gstDetails, "-"),
      },
      {
        name: "Legal Document",
        url: getFileUrl(campaign?.legalDocument),
        status:
          campaign?.legalDocumentStatus ||
          (campaign?.legalDocument ? "Uploaded" : "Pending"),
        details: pickFirst(
          campaign?.legalDocumentName,
          campaign?.legalDetails,
          "-"
        ),
      },
      {
        name: "PAN Card",
        url: getFileUrl(campaign?.panCard),
        status: campaign?.panStatus || (campaign?.panCard ? "Uploaded" : "Pending"),
        details: pickFirst(campaign?.panNumber, "-"),
      },
      {
        name: "Address Proof",
        url: getFileUrl(campaign?.addressProof),
        status:
          campaign?.addressProofStatus ||
          (campaign?.addressProof ? "Uploaded" : "Pending"),
        details: pickFirst(campaign?.addressProofType, "-"),
      },
    ];

    return docs.filter((doc) => doc.url && doc.url !== "");
  }, [campaign]);

  const legalDocumentsList = useMemo(() => {
    return [
      {
        label: "Trade License",
        status:
          campaign?.licenseStatus || (campaign?.license ? "Uploaded" : "Pending"),
        details: pickFirst(campaign?.licenseNumber, "Uploaded file"),
      },
      {
        label: "Company Registration",
        status:
          campaign?.companyRegistrationStatus ||
          (campaign?.companyRegistration ? "Uploaded" : "Pending"),
        details: pickFirst(campaign?.registrationNumber, "Uploaded file"),
      },
      {
        label: "GST / Tax Document",
        status: campaign?.gstStatus || (campaign?.gst ? "Uploaded" : "Pending"),
        details: pickFirst(campaign?.gstNumber, "Uploaded file"),
      },
      {
        label: "Legal Document",
        status:
          campaign?.legalDocumentStatus ||
          (campaign?.legalDocument ? "Uploaded" : "Pending"),
        details: pickFirst(campaign?.legalDocumentName, "Uploaded file"),
      },
      {
        label: "PAN Card",
        status: campaign?.panStatus || (campaign?.panCard ? "Uploaded" : "Pending"),
        details: pickFirst(campaign?.panNumber, "Uploaded file"),
      },
      {
        label: "Address Proof",
        status:
          campaign?.addressProofStatus ||
          (campaign?.addressProof ? "Uploaded" : "Pending"),
        details: pickFirst(campaign?.addressProofType, "-"),
      },
      {
        label: "Project free of legal issues",
        status: campaign?.legalIssueStatus || "Pending",
        details: pickFirst(campaign?.legalIssueNote, "-"),
      },
    ];
  }, [campaign]);

  const infraList = useMemo(() => {
    return [
      {
        label: "Road Access",
        status: campaign?.roadAccessStatus || "Pending",
        details: pickFirst(campaign?.roadAccessDetails, "-"),
      },
      {
        label: "Civic Approval",
        status: campaign?.civicStatus || "Pending",
        details: pickFirst(campaign?.civicStatusDetails, "-"),
      },
    ];
  }, [campaign]);

  const verifiedCount = [...legalDocumentsList, ...infraList].filter((item) =>
    [
      "verified",
      "approved",
      "clear",
      "available",
      "yes",
      "connected",
      "uploaded",
    ].includes(String(item.status || "").toLowerCase())
  ).length;

  const pendingCount = [...legalDocumentsList, ...infraList].filter((item) =>
    ["pending", "under review", "under_review", "processing"].includes(
      String(item.status || "").toLowerCase()
    )
  ).length;

  const moreDetails = useMemo(() => {
    return [
      { label: "Campaign Category", value: category },
      { label: "Funding Type", value: fundingType },
      {
        label: "Expected Return",
        value:
          fundingType === "Profit Return"
            ? `${profitPercentage || 0}%`
            : "Not Applicable",
      },
      {
        label: "Minimum Investment",
        value: minInvestment ? INR(minInvestment) : "Flexible",
      },
      { label: "Days To Raise", value: `${daysToRaise} days` },
      { label: "Location", value: `${city}, ${st}, ${country}` },
      { label: "Uploaded Documents", value: `${documents.length}` },
      {
        label: "Legal Review",
        value: campaign?.legalIssueStatus || "Pending",
      },
    ];
  }, [
    category,
    fundingType,
    profitPercentage,
    minInvestment,
    daysToRaise,
    city,
    st,
    country,
    documents.length,
    campaign?.legalIssueStatus,
  ]);

  const similarProjects = useMemo(() => {
    const raw = [
      ...toArray(state?.similarProjects),
      ...toArray(campaign?.similarProjects),
      ...toArray(campaign?.relatedProjects),
      ...toArray(campaign?.relatedCampaigns),
    ];

    const normalized = raw
      .map((item, index) => {
        const image = pickFirst(
          getFileUrl(item?.photo),
          getFileUrl(item?.imageUrl),
          getFileUrl(item?.coverImage),
          sampleImg
        );

        return {
          _id: item?._id || `similar-${index}`,
          title: pickFirst(item?.projectTitle, item?.title, "Untitled Project"),
          category: pickFirst(item?.projectCategory, item?.category, "General"),
          location: pickFirst(
            item?.projectLocation?.city,
            item?.city,
            item?.location,
            "N/A"
          ),
          fundingGoal: Number(
            pickFirst(item?.moneyToRaise, item?.goalAmount, item?.fundingGoal, 0)
          ),
          raisedAmount: Number(
            pickFirst(
              item?.raisedAmount,
              item?.moneyRaised,
              item?.currentFunding,
              0
            )
          ),
          image,
          original: item,
        };
      })
      .filter(Boolean);

    if (normalized.length > 0) return normalized;

    return [
      {
        _id: "fallback-1",
        title: "Smart Growth Venture",
        category: category,
        location: `${city}, ${st}`,
        fundingGoal: target || 250000,
        raisedAmount: raised || 120000,
        image: cover,
        original: null,
      },
      {
        _id: "fallback-2",
        title: "Next Phase Expansion",
        category: category,
        location: `${city}, ${st}`,
        fundingGoal: 500000,
        raisedAmount: 180000,
        image: projectImages[1] || cover,
        original: null,
      },
      {
        _id: "fallback-3",
        title: "Regional Opportunity Project",
        category: category,
        location: `${city}, ${st}`,
        fundingGoal: 750000,
        raisedAmount: 290000,
        image: projectImages[2] || cover,
        original: null,
      },
    ];
  }, [
    state?.similarProjects,
    campaign?.similarProjects,
    campaign?.relatedProjects,
    campaign?.relatedCampaigns,
    campaign,
    cover,
    category,
    city,
    st,
    target,
    raised,
    projectImages,
  ]);

  const openLightbox = (idx) => {
    setActiveIndex(idx);
    setLightboxOpen(true);
  };

  const nextImg = () => setActiveIndex((p) => (p + 1) % projectImages.length);
  const prevImg = () =>
    setActiveIndex((p) => (p - 1 + projectImages.length) % projectImages.length);

  const openDocPreview = (doc) => {
    setSelectedDoc(doc);
  };

  const closeDocPreview = () => setSelectedDoc(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") nextImg();
      if (e.key === "ArrowLeft") prevImg();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, projectImages.length]);

  return (
    <section
      className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.10),transparent_28%),linear-gradient(to_bottom,#eff6ff,#ffffff,#f8fafc)] text-slate-900"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-300/25 via-indigo-300/20 to-violet-300/25 blur-3xl" />
      </div>

      {campaign?.video ? (
        <button
          onClick={() => setShowVideo(true)}
          className="fixed right-3 top-3 z-30 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold tracking-wide text-white shadow-[0_12px_24px_rgba(15,23,42,0.20)] hover:bg-slate-800"
        >
          Company Overview
        </button>
      ) : null}

      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-[24px] border border-white/10 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold">Company Overview</h2>
              <button
                onClick={() => setShowVideo(false)}
                className="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                ✕
              </button>
            </div>
            <div className="p-3">
              <video
                src={campaign?.video}
                controls
                className="max-h-[75vh] w-full rounded-2xl bg-black"
              />
            </div>
          </div>
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="w-full max-w-6xl overflow-hidden rounded-[24px] bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Project Photos</p>
              <button
                onClick={() => setLightboxOpen(false)}
                className="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="relative bg-black">
              <img
                src={projectImages[activeIndex]}
                alt={`Project ${activeIndex + 1}`}
                className="max-h-[78vh] w-full object-contain"
              />

              {projectImages.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-xl bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900"
                  >
                    →
                  </button>
                </>
              )}

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                {activeIndex + 1} / {projectImages.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDoc && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4"
          onClick={closeDocPreview}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-[24px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {selectedDoc.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Status: {selectedDoc.status || "Uploaded"}
                </p>
              </div>
              <button
                onClick={closeDocPreview}
                className="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="p-3">
              {isImage(selectedDoc.url) ? (
                <img
                  src={selectedDoc.url}
                  alt={selectedDoc.name}
                  className="max-h-[75vh] w-full rounded-2xl border border-slate-200 bg-white object-contain"
                />
              ) : isPdf(selectedDoc.url) ? (
                <iframe
                  src={selectedDoc.url}
                  title={selectedDoc.name}
                  className="h-[75vh] w-full rounded-2xl border border-slate-200"
                />
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    Preview not available for this file type.
                  </p>
                  <a
                    href={selectedDoc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Open Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-[1450px] px-3 pb-10 pt-4 sm:px-4 lg:px-5">
        {/* HEADER */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            ← Back
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-700">
              {category}
            </span>
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-700">
              {fundingType}
            </span>
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              onClick={() => {
                try {
                  navigator.clipboard?.writeText(window.location.href);
                } catch {}
                alert("Link copied.");
              }}
            >
              Share
            </button>
          </div>
        </div>

        {/* TOP AREA */}
        <div className="-mt-1 grid grid-cols-1 gap-4 xl:grid-cols-[1.42fr_0.86fr]">
          {/* MERGED CARD */}
          <SectionCard
            eyebrow="Project Overview"
            title={title}
            className="bg-gradient-to-br from-white via-white to-slate-50"
            right={
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                  {city}, {st}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                  {createdAt}
                </span>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.92fr_1.08fr]">
              {/* LEFT IMAGE + MEDIA */}
              <div className="space-y-3">
                <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-100 shadow-sm">
                  <div className="relative h-[200px] sm:h-[220px] lg:h-[240px]">
                    <img
                      src={cover}
                      alt={title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                      <div>
                        <p className="line-clamp-2 text-lg font-semibold text-white">
                          {title}
                        </p>
                        <p className="mt-1 text-xs text-white/85">
                          {city}, {st}, {country}
                        </p>
                      </div>
                      <div className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-800">
                        {Math.round(progressPercent)}% funded
                      </div>
                    </div>
                  </div>
                </div>

                <div className="-mt-1">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Project Media
                    </h3>
                    {projectImages.length > 0 ? (
                      <button
                        onClick={() => openLightbox(0)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        View all
                      </button>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-4">
                    {thumbImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => openLightbox(i)}
                        className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm transition hover:-translate-y-0.5"
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${i + 1}`}
                          className="h-16 w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT ABOUT COMPANY */}
              <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-white to-indigo-50/40 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      About Company
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                      {companyName}
                    </h3>
                  </div>
                  <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-700">
                    {fundingType}
                  </span>
                </div>

                {fundingType === "Profit Return" && (
                  <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-700">
                      Profit Return
                    </p>
                    <p className="mt-1.5 text-base font-semibold text-indigo-900">
                      Expected Return: {profitPercentage || 0}%
                    </p>
                  </div>
                )}

                <p className="mt-4 line-clamp-[8] whitespace-pre-line text-[14px] leading-7 text-slate-700">
                  {companyText}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <InfoCard label="Company Type" value={category} />
                  <InfoCard label="Founded / Listed" value={createdAt} />
                  <InfoCard label="Country" value={country} />
                  <InfoCard
                    label="Legal Review"
                    value={campaign?.legalIssueStatus || "Pending"}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* FUNDING SUMMARY */}
          <SectionCard
            eyebrow="Funding Summary"
            title={INR(raised)}
            compact
            right={
              <div className="relative h-16 w-16 shrink-0">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="#e2e8f0"
                    strokeWidth="9"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="url(#heroGrad)"
                    strokeWidth="9"
                    fill="transparent"
                    strokeDasharray="276.46"
                    strokeDashoffset={`${
                      276.46 - (276.46 * progressPercent) / 100
                    }`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="50%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <span className="text-xs font-semibold text-slate-900">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
              </div>
            }
            className="h-fit bg-gradient-to-br from-white via-white to-violet-50/40"
          >
            <p className="-mt-1 text-sm text-slate-500">
              raised of {INR(target)}
            </p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[12px] font-medium text-slate-500">
                <span>Completion</span>
                <span className="font-semibold text-slate-900">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <InfoCard label="Goal" value={INR(target)} />
              <InfoCard label="Duration" value={`${daysToRaise} days`} />
              <InfoCard
                label="Min Amount"
                value={minInvestment ? INR(minInvestment) : "Flexible"}
              />
              <InfoCard label="Location" value={`${city}, ${st}`} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <button
                onClick={() => navigate("/payment", { state: { campaign } })}
                className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_12px_24px_rgba(79,70,229,0.22)] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                Donate / Invest
              </button>
              <button
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                onClick={() => {
                  try {
                    navigator.clipboard?.writeText(window.location.href);
                  } catch {}
                  alert("Link copied.");
                }}
              >
                Share Campaign
              </button>
            </div>
          </SectionCard>
        </div>

        {/* SECOND ROW */}
        <div className="mt-2 grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            eyebrow="Project Description"
            title="About the Project"
            compact
            className="self-start"
            right={
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-700">
                Investor View
              </span>
            }
          >
            <p className="whitespace-pre-line text-[13.5px] leading-7 text-slate-700">
              {projectText}
            </p>
          </SectionCard>

          <SectionCard
            eyebrow="Documents"
            title="Document Preview Panel"
            compact
            className="self-start"
            right={
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                {documents.length} files
              </span>
            }
          >
            {documents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center text-sm text-slate-500">
                No documents uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {documents.map((d, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-semibold text-slate-900">
                          {d.name}
                        </h3>
                        <p className="truncate text-[10px] text-slate-500">
                          {d.details || "Uploaded document"}
                        </p>
                      </div>

                      <span
                        className={`ml-2 shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${statusTone(
                          d.status
                        )}`}
                      >
                        {d.status}
                      </span>
                    </div>

                    <button
                      onClick={() => openDocPreview(d)}
                      className="block w-full text-left"
                    >
                      <div className="flex h-[110px] items-center justify-center overflow-hidden bg-slate-100">
                        {isImage(d.url) ? (
                          <img
                            src={d.url}
                            alt={d.name}
                            className="h-[115%] w-[115%] scale-110 object-contain"
                          />
                        ) : isPdf(d.url) ? (
                          <div className="text-xs font-semibold text-red-600">
                            PDF Preview
                          </div>
                        ) : (
                          <div className="text-xs font-semibold text-slate-600">
                            FILE
                          </div>
                        )}
                      </div>
                    </button>

                    <div className="flex items-center justify-between px-3 py-1.5">
                      <button
                        onClick={() => openDocPreview(d)}
                        className="text-[10px] font-semibold text-blue-600 hover:underline"
                      >
                        Preview
                      </button>

                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-semibold text-slate-700 hover:underline"
                      >
                        Open
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* LEGAL / CIVIC / APPROVAL STATUS PANEL */}
        <div className="mt-5">
          <SectionCard
            eyebrow="Legal Panel"
            title="Legal / Civic / Approval Status"
            right={
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
                  {verifiedCount} verified
                </span>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold text-amber-700">
                  {pendingCount} pending
                </span>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Legal Documents
                </h3>
                <div className="space-y-3">
                  {legalDocumentsList.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {item.label}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.details || "-"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon status={item.status} />
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusTone(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Infrastructure & Civic
                </h3>
                <div className="space-y-3">
                  {infraList.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {item.label}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.details || "-"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon status={item.status} />
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusTone(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* MORE DETAILS */}
        <div className="mt-5">
          <SectionCard eyebrow="More Details" title="Additional Information">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {moreDetails.map((item, idx) => (
                <InfoCard key={idx} label={item.label} value={item.value} />
              ))}
            </div>
          </SectionCard>
        </div>

        {/* SIMILAR PROJECTS LISTING PANEL */}
        <div className="mt-5">
          <SectionCard
            eyebrow="Discover More"
            title="Similar Projects Listing"
            right={
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-700">
                {similarProjects.length} projects
              </span>
            }
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {similarProjects.map((item, idx) => {
                const pct =
                  item.fundingGoal > 0
                    ? clamp((item.raisedAmount / item.fundingGoal) * 100, 0, 100)
                    : 0;

                return (
                  <div
                    key={item._id || idx}
                    className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={item.image || sampleImg}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-800">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-4">
                      <h3 className="line-clamp-1 text-base font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.location}
                      </p>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                          <span>Raised</span>
                          <span className="font-semibold text-slate-900">
                            {Math.round(pct)}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <InfoCard label="Raised" value={INR(item.raisedAmount)} />
                        <InfoCard label="Goal" value={INR(item.fundingGoal)} />
                      </div>

                      <button
                        onClick={() => {
                          if (item.original) {
                            navigate("/investment-detail", {
                              state: { campaign: item.original },
                            });
                          }
                        }}
                        className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                      >
                        View Project
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    </section>
  );
}