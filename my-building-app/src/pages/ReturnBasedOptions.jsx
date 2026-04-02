import React, { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Wallet,
  ShieldCheck,
  BadgeCheck,
  ArrowRight,
  HelpCircle,
  CircleDollarSign,
  Landmark,
  RefreshCcw,
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

function InfoCard({ icon: Icon, title, desc }) {
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

function SmallSection({ icon: Icon, title, points }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-900" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-slate-900">{title}</h3>
      </div>

      <div className="mt-4 space-y-3">
        {points.map((point, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-600" />
            <p className="text-sm leading-6 text-slate-600">{point}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignCard({ campaign, onOpen }) {
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
  const percent = target > 0 ? clamp((raised / target) * 100, 0, 100) : 0;
  const profit = Number(pickFirst(campaign?.profitPercentage, 0));

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-52 w-full overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
            Profit Return
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
              Expected Return
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              {profit ? `${profit}%` : "Structured Return"}
            </p>
          </div>

          <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow">
            {Math.round(percent)}% funded
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 line-clamp-1">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-3">
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
            <span className="font-semibold text-slate-900">{Math.round(percent)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            <BadgeCheck className="h-3.5 w-3.5" />
            Profit enabled
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

export default function ReturnBasedOptions() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const overviewCards = [
    {
      icon: Wallet,
      title: "Profit-based participation",
      desc: "For users looking at campaigns with structured return expectations.",
    },
    {
      icon: CircleDollarSign,
      title: "Clearer money flow",
      desc: "Understand how contributions, returns, and payout visibility connect.",
    },
    {
      icon: ShieldCheck,
      title: "Structured trust",
      desc: "Return campaigns need stronger clarity, discipline, and transparency.",
    },
  ];

  const detailSections = [
    {
      icon: TrendingUp,
      title: "What Profit Return means",
      points: [
        "These campaigns are designed for participants expecting structured returns, not just support-based contribution.",
        "The campaign should clearly communicate why returns exist and how the model is intended to work.",
      ],
    },
    {
      icon: Landmark,
      title: "How money and withdrawals work",
      points: [
        "Investor money first enters the campaign contribution flow and supports the campaign objective.",
        "Returns and withdrawals depend on the campaign’s own structure, payout logic, and timeline.",
      ],
    },
  ];

  const notes = [
    "Profit return campaigns should explain return logic clearly.",
    "Investors should understand payout expectations before participating.",
    "Clear campaign structure builds confidence and reduces ambiguity.",
  ];

  const faqs = [
    {
      q: "What is a profit return campaign?",
      a: "A campaign designed with a structured return model where investors participate with return expectations tied to campaign terms.",
    },
    {
      q: "How is it different from supporter participation?",
      a: "Supporter participation is contribution-focused, while profit return campaigns are more structured and tied to expected value or return visibility.",
    },
    {
      q: "Can investors withdraw anytime?",
      a: "Not always. Withdrawal and payout depend on the campaign’s own return cycle, policy, and payout workflow.",
    },
  ];

  useEffect(() => {
    const fetchProfitCampaigns = async () => {
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
          const fundingType = String(c?.fundingType || "").toLowerCase();
          return (
            fundingType.includes("profit") ||
            fundingType.includes("return") ||
            Number(c?.profitPercentage || 0) > 0
          );
        });

        setCampaigns(filtered);
      } catch (err) {
        setError(err.message || "Something went wrong while fetching campaigns.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfitCampaigns();
  }, []);

  const campaignCountText = useMemo(() => {
    if (loading) return "Loading opportunities...";
    return `${campaigns.length} profit return campaign${campaigns.length === 1 ? "" : "s"} available`;
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
            <TrendingUp className="h-4 w-4 text-blue-700" />
            Return Based Options
          </div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Profit Return Opportunities
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Explore campaigns offering structured profit return models and review them with better clarity around returns, payout visibility, and funding progress.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            <BadgeCheck className="h-4 w-4 text-blue-300" />
            {campaignCountText}
          </div>
        </div>

        {/* Overview */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {overviewCards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <InfoCard
                key={idx}
                icon={Icon}
                title={item.title}
                desc={item.desc}
              />
            );
          })}
        </div>

        {/* Campaigns moved upper */}
        <div className="mt-14">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Profit Return Campaigns
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Campaigns filtered from backend based on profit return type or defined profit percentage.
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
              <p className="font-semibold">Unable to load profit return campaigns.</p>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">
                No profit return campaigns found
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Once campaigns with a profit return model are available, they will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {campaigns.map((campaign) => (
                <CampaignCard
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

        {/* Important explanation below campaigns */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {detailSections.map((section, idx) => (
            <SmallSection key={idx} {...section} />
          ))}
        </div>

        {/* Important notes */}
        <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-900 px-6 py-8 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <RefreshCcw className="h-5 w-5 text-blue-300" />
            <h2 className="text-xl font-bold">Important notes</h2>
          </div>

          <div className="mt-5 space-y-3">
            {notes.map((note, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-white/70" />
                <p className="text-sm leading-7 text-slate-300">{note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <div className="mt-6 grid gap-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 h-5 w-5 text-blue-700" />
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{faq.q}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Explore more active opportunities
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Browse all campaigns and compare opportunities with better confidence.
            </p>
          </div>

          <Link
            to="/browse-investors"
            className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
          >
            Browse all campaigns
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}