import React, { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  TrendingUp,
  Wallet,
  Target,
  ArrowRight,
  Building2,
  BarChart3,
  Rocket,
  Layers3,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import sampleImg from "../assets/fundraising-example.jpg";

const API_URL = "http://localhost:5000/api/campaigns"; // change if needed

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

function TopCard({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
        <Icon className="h-5 w-5 text-blue-700" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
    </div>
  );
}

function ProcessCard({ step, icon: Icon, title, desc }) {
  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="absolute right-5 top-5 text-xs font-bold text-slate-300">
        {step}
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
        <Icon className="h-5 w-5 text-slate-900" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
    </div>
  );
}

function BusinessCampaignCard({ campaign, onOpen }) {
  const title = pickFirst(campaign?.projectTitle, campaign?.title, "Untitled Campaign");
  const image = pickFirst(campaign?.photo, campaign?.imageUrl, sampleImg);
  const desc = pickFirst(
    campaign?.projectOverview,
    campaign?.description,
    campaign?.introduction,
    "No description available."
  );

  const raised = Number(pickFirst(campaign?.raisedAmount, campaign?.moneyRaised, 0));
  const target = Number(pickFirst(campaign?.moneyToRaise, campaign?.goalAmount, 0));
  const progress = target > 0 ? clamp((raised / target) * 100, 0, 100) : 0;

  const companyType = pickFirst(
    campaign?.companyType,
    campaign?.projectCategory,
    campaign?.category,
    campaign?.businessType,
    "Business"
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-52 w-full overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
        
          <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow">
            {companyType}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
              Growth Progress
            </p>
            <p className="mt-1 text-lg font-bold text-white">{Math.round(progress)}%</p>
          </div>

          <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow">
            {INR(raised)} raised
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-1 text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
          {desc}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Raised
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">{INR(raised)}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Goal
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">{INR(target)}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
            <span>Funding progress</span>
            <span className="font-semibold text-slate-900">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Business ready
          </div>

          <button
            onClick={() => onOpen(campaign)}
            className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
          >
            View details
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BusinessCampaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const topCards = [
    {
      icon: Building2,
      title: "Growth-focused",
      desc: "Built only for campaigns whose company type is business.",
    },
    {
      icon: Wallet,
      title: "Use of funds",
      desc: "Show how capital supports launch, hiring, operations, or scale.",
    },
    {
      icon: TrendingUp,
      title: "Investor confidence",
      desc: "Clear business pages attract stronger interest and trust.",
    },
  ];

  const processCards = [
    {
      step: "01",
      icon: Target,
      title: "Define the goal",
      desc: "Set a clear raise amount with a specific business purpose.",
    },
    {
      step: "02",
      icon: Layers3,
      title: "Show fund usage",
      desc: "Explain where the money goes and what milestones it unlocks.",
    },
    {
      step: "03",
      icon: Rocket,
      title: "Build momentum",
      desc: "Use updates, progress, and traction to strengthen trust.",
    },
    {
      step: "04",
      icon: BarChart3,
      title: "Track progress",
      desc: "Let users see growth and campaign movement clearly.",
    },
  ];

  const bottomPoints = [
    "Clear business objective",
    "Defined funding requirement",
    "Simple use-of-funds breakdown",
    "Visible milestones and traction",
    "Consistent updates for supporters",
    "Professional presentation and trust",
  ];

  useEffect(() => {
    const fetchBusinessCampaigns = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch campaigns");

        const data = await res.json();

        const allCampaigns = Array.isArray(data)
          ? data
          : Array.isArray(data?.campaigns)
          ? data.campaigns
          : Array.isArray(data?.data)
          ? data.data
          : [];

        const filtered = allCampaigns.filter((c) => {
          const companyType = String(
            c?.companyType ||
              c?.projectCategory ||
              c?.category ||
              c?.businessType ||
              ""
          )
            .trim()
            .toLowerCase();

          return companyType === "business";
        });

        setCampaigns(filtered);
      } catch (err) {
        setError(err.message || "Something went wrong while fetching campaigns.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessCampaigns();
  }, []);

  const campaignCountText = useMemo(() => {
    if (loading) return "Loading business campaigns...";
    return `${campaigns.length} business campaign${campaigns.length === 1 ? "" : "s"} available`;
  }, [campaigns.length, loading]);

  return (
    <section
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 px-6 py-16 md:py-20"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Hero */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
            <Briefcase className="h-4 w-4 text-blue-700" />
            Business Campaigns
          </div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Business-focused fundraising that looks structured and credible
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Explore only business-type campaigns built for growth, expansion,
            product launch, hiring, and operational scale.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            <CheckCircle2 className="h-4 w-4 text-blue-300" />
            {campaignCountText}
          </div>
        </div>

        {/* Top cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {topCards.map((item, idx) => {
            const Icon = item.icon;
            return <TopCard key={idx} icon={Icon} title={item.title} desc={item.desc} />;
          })}
        </div>

        {/* Campaigns first */}
        <div className="mt-14">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Business Campaign Opportunities
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Showing only campaigns where company type is marked as business.
              </p>
            </div>

            <Link
              to="/browse-investors"
              className="text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              View all campaigns →
            </Link>
          </div>

          {loading ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="h-52 animate-pulse bg-slate-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              <p className="font-semibold">Unable to load business campaigns.</p>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">
                No business campaigns found
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Only campaigns with company type set to <span className="font-semibold">business</span> will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {campaigns.map((campaign) => (
                <BusinessCampaignCard
                  key={campaign._id || campaign.id || campaign.title}
                  campaign={campaign}
                  onOpen={(selectedCampaign) =>
                    navigate("/investment-detail", {
                      state: { campaign: selectedCampaign },
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mt-14">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900">
              How business fundraising works
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Strong business campaigns are simple to understand: clear need, clear use of funds, clear progress.
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {processCards.map((item, idx) => {
              const Icon = item.icon;
              return (
                <ProcessCard
                  key={idx}
                  step={item.step}
                  icon={Icon}
                  title={item.title}
                  desc={item.desc}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-14 rounded-3xl border border-slate-200 bg-slate-900 px-6 py-8 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-300" />
            <h2 className="text-xl font-bold">What makes a strong business campaign</h2>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {bottomPoints.map((point, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-slate-200"
              >
                {point}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Start your business campaign
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Build a clearer fundraising page for product growth, expansion, hiring, or launch.
            </p>
          </div>

          <Link
            to="/fundraising"
            className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
          >
            Start fundraising
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}