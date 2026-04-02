import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  RefreshCw,
  Eye,
  Trash2,
  FolderOpen,
  Clock3,
  CircleDollarSign,
} from "lucide-react";
import FundraiserSidebar from "./FundraiserSidebar";
import {
  getDashboardData,
  deleteFundraiserCampaign,
} from "../../api/fundraiser.api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const formatCurrency = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatCategory = (value = "") => {
  if (!value) return "—";
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDaysLeft = (deadline, createdAt, daysToRaise) => {
  let endDate = null;

  if (deadline) {
    const parsed = new Date(deadline);
    if (!Number.isNaN(parsed.getTime())) endDate = parsed;
  }

  if (!endDate && createdAt && daysToRaise) {
    const created = new Date(createdAt);
    if (!Number.isNaN(created.getTime())) {
      endDate = new Date(
        created.getTime() + Number(daysToRaise || 0) * 24 * 60 * 60 * 1000
      );
    }
  }

  if (!endDate) return "—";

  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return "Ended";
  if (days === 0) return "Today";
  if (days === 1) return "1 Day";
  return `${days} Days`;
};

const getStatusTone = (status = "") => {
  const s = String(status).toLowerCase();

  if (["approved", "live", "active", "success"].includes(s)) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (["pending", "review", "processing"].includes(s)) {
    return "bg-amber-100 text-amber-700";
  }

  if (["rejected", "failed", "inactive"].includes(s)) {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
};

function StatCard({ title, value, icon: Icon, valueClass = "text-slate-900" }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className={cn("mt-2 text-2xl font-bold", valueClass)}>{value}</h3>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function CampaignRow({ item, deletingId, onView, onDelete }) {
  const title = item?.projectTitle || "Untitled Campaign";
  const category = formatCategory(item?.projectCategory);
  const raised = formatCurrency(item?.raisedAmount || 0);
  const target = formatCurrency(item?.moneyToRaise || 0);
  const status = item?.status || "pending";
  const daysLeft = getDaysLeft(item?.deadline, item?.createdAt, item?.daysToRaise);
  const isDeleting = deletingId === item?._id;

  return (
    <div className="grid min-w-[1180px] grid-cols-7 items-center gap-3 border-t border-slate-100 px-4 py-4 text-sm">
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-500">
          Created: {formatDate(item?.createdAt)}
        </p>
      </div>

      <div className="text-slate-600">{category}</div>
      <div className="font-medium text-slate-900">{raised}</div>
      <div className="text-slate-600">{target}</div>

      <div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-semibold capitalize",
            getStatusTone(status)
          )}
        >
          {status}
        </span>
      </div>

      <div className="text-slate-600">{daysLeft}</div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(item)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Eye size={14} />
          View Details
        </button>

        <button
          onClick={() => onDelete(item)}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 size={14} />
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default function FundraiserCampaigns() {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const userId = user?._id || user?.id || user?.userId;

  const fetchCampaigns = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      if (!userId) {
        setCampaigns([]);
        setError("User not found. Please login again.");
        return;
      }

      const res = await getDashboardData(userId);
      const list = res?.data || res?.fundraisers || [];
      setCampaigns(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch fundraiser campaigns:", err);
      setCampaigns([]);
      setError(err?.message || "Failed to fetch campaigns");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [userId]);

  const stats = useMemo(() => {
    const total = campaigns.length;
    const approved = campaigns.filter(
      (c) => String(c?.status).toLowerCase() === "approved"
    ).length;
    const pending = campaigns.filter(
      (c) => String(c?.status).toLowerCase() === "pending"
    ).length;
    const rejected = campaigns.filter(
      (c) => String(c?.status).toLowerCase() === "rejected"
    ).length;

    return { total, approved, pending, rejected };
  }, [campaigns]);

  const handleViewCampaign = (campaign) => {
    const id = campaign?._id;
    if (!id) return;

    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      navigate(`/campaign/${id}`);
    }, 150);
  };

  const handleDeleteCampaign = async (campaign) => {
    const id = campaign?._id;
    if (!id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${campaign?.projectTitle || "this campaign"}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteFundraiserCampaign(id);

      setCampaigns((prev) => prev.filter((item) => item?._id !== id));
    } catch (err) {
      console.error("Failed to delete campaign:", err);
      alert(err?.message || "Failed to delete campaign");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="h-screen w-full bg-[#e3e8f0]">
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7fb]">
        <FundraiserSidebar active="campaigns" />

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Campaigns</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage all your fundraising campaigns from one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => fetchCampaigns(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>

              <button
                onClick={() => navigate("/start-fundraiser")}
                className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <PlusCircle size={16} />
                Start a Fundraiser
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Campaigns"
              value={stats.total}
              icon={FolderOpen}
            />
            <StatCard
              title="Approved"
              value={stats.approved}
              icon={CircleDollarSign}
              valueClass="text-emerald-600"
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              icon={Clock3}
              valueClass="text-amber-600"
            />
            <StatCard
              title="Rejected"
              value={stats.rejected}
              icon={Trash2}
              valueClass="text-rose-600"
            />
          </div>

          <div className="mt-6 rounded-[28px] border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <div className="grid min-w-[1180px] grid-cols-7 gap-3 px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <div>Campaign</div>
                <div>Category</div>
                <div>Raised</div>
                <div>Target</div>
                <div>Status</div>
                <div>Days Left</div>
                <div>Actions</div>
              </div>

              {loading ? (
                <div className="border-t border-slate-100 px-4 py-10 text-center text-sm text-slate-500">
                  Loading campaigns...
                </div>
              ) : error ? (
                <div className="border-t border-slate-100 px-4 py-10 text-center text-sm text-rose-600">
                  {error}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="border-t border-slate-100 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No campaigns found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Start your first fundraiser to see it here.
                  </p>
                </div>
              ) : (
                campaigns.map((item) => (
                  <CampaignRow
                    key={item?._id}
                    item={item}
                    deletingId={deletingId}
                    onView={handleViewCampaign}
                    onDelete={handleDeleteCampaign}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}