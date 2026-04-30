import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Flame, TrendingUp } from "lucide-react";
import AccessModeModal from "./AccessModeModal.jsx";
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
    return `INR ${num}`;
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

export default function TrendingCampaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [investorAccessOpen, setInvestorAccessOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchCampaigns() {
      try {
        setLoading(true);
        setError("");

        const base = String(import.meta.env.VITE_API_BASE_URL || "").replace(
          /\/$/,
          ""
        );
        const res = await fetch(`${base}/campaigns`);
        if (!res.ok) {
          throw new Error("Failed to fetch campaigns");
        }

        const data = await res.json();
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.campaigns)
          ? data.campaigns
          : Array.isArray(data)
          ? data
          : [];

        if (!mounted) return;
        setCampaigns(list);
      } catch (err) {
        if (!mounted) return;
        setCampaigns([]);
        setError(err?.message || "Could not load trending campaigns.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchCampaigns();
    return () => {
      mounted = false;
    };
  }, []);

  const normalized = useMemo(() => {
    return (campaigns || [])
      .map((item, idx) => {
        const title = pickFirst(
          item?.projectTitle,
          item?.title,
          item?.companyId?.projectTitle,
          "Untitled Campaign"
        );

        const image =
          getFileUrl(item?.imageUrl) ||
          getFileUrl(item?.companyId?.photo) ||
          getFileUrl(item?.photo) ||
          getFileUrl(item?.companyId?.images?.[0]) ||
          getFileUrl(item?.images?.[0]) ||
          sampleImg;

        const raised = Number(
          pickFirst(item?.raisedAmount, item?.moneyRaised, item?.currentFunding, 0)
        );
        const target = Number(
          pickFirst(item?.moneyToRaise, item?.goalAmount, item?.fundingGoal, 0)
        );
        const progress = target > 0 ? clamp((raised / target) * 100, 0, 100) : 0;
        const category = pickFirst(item?.projectCategory, item?.category, "General");
        const owner = pickFirst(item?.userId?.name, "Campaign Owner");

        return {
          raw: item,
          id: item?._id || item?.id || `campaign-${idx}`,
          title,
          image,
          raised,
          target,
          progress,
          category,
          owner,
        };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 6);
  }, [campaigns]);

  const hasInvestorAccess = () => {
    try {
      const rawUser =
        localStorage.getItem("user") || localStorage.getItem("loggedInUser");
      const rawToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!rawUser || !rawToken) return false;

      const user = JSON.parse(rawUser);
      return Boolean(
        user?.access?.investor?.enabled && user?.activeMode === "investor"
      );
    } catch {
      return false;
    }
  };

  const handleCampaignClick = (campaign) => {
    if (!hasInvestorAccess()) {
      setInvestorAccessOpen(true);
      return;
    }

    navigate(`/investment-detail/${campaign.id}`, { state: { campaign: campaign.raw } });
  };

  return (
    <section
      className="px-6 py-16 md:py-20 bg-white"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-700">
            <Flame className="h-4 w-4" />
            Trending Campaigns
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Trending Fundraising Campaigns
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600 md:text-lg">
            Discover the campaigns getting strong momentum right now on M8Bid.
          </p>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="h-40 animate-pulse bg-slate-200" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-2 w-full animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-10 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : normalized.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-700">
            No trending campaigns available right now.
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {normalized.map((campaign) => (
              <button
                key={campaign.id}
                type="button"
                onClick={() => handleCampaignClick(campaign)}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                    {campaign.category}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-slate-900">
                    {campaign.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    by {campaign.owner}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold">{Math.round(campaign.progress)}% funded</span>
                    <span>
                      {INR(campaign.raised)} / {INR(campaign.target)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                      style={{ width: `${campaign.progress}%` }}
                    />
                  </div>

                  <div className="mt-4 inline-flex items-center text-sm font-semibold text-blue-700">
                    View Campaign
                    <ArrowRight className="ml-1.5 h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (!hasInvestorAccess()) {
                setInvestorAccessOpen(true);
                return;
              }
              navigate("/browse-investors");
            }}
            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Explore all campaigns
          </button>
        </div>
      </div>

      <AccessModeModal
        open={investorAccessOpen}
        onClose={() => setInvestorAccessOpen(false)}
        onLogin={() => navigate("/login")}
        title="Investor account needed"
        message="You need to login or register as an investor to access trending campaigns."
        buttonLabel="Go to Login"
      />
    </section>
  );
}
