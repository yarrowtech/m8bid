import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import {
  FaBars,
  FaArrowLeft,
  FaUser,
  FaFolderOpen,
  FaMoneyBillWave,
  FaReceipt,
  FaFileAlt,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaShieldAlt,
  FaPen,
  FaSave,
  FaTimes,
  FaImage,
  FaCheckCircle,
  FaBuilding,
  FaUserTie,
  FaExchangeAlt,
} from "react-icons/fa";
import {
  getAdminUserDetails,
  approveCampaign,
  rejectCampaign,
  deleteCampaign,
  updateAdminUser,
} from "../../api/admin";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") ||
  "http://localhost:5000";

const INR = (value) => {
  const num = Number(value || 0);
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

const getStatusTone = (status = "") => {
  const s = String(status).toLowerCase();

  if (["approved", "active", "completed", "success", "verified"].includes(s)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (["pending", "review", "processing", "under_review", "under review"].includes(s)) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (["rejected", "failed", "inactive", "blocked", "deleted"].includes(s)) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
};

const getProfileBadgeTone = (label = "") => {
  const v = String(label).toLowerCase();

  if (v.includes("investor")) {
    return "bg-violet-50 text-violet-700 border-violet-200";
  }
  if (v.includes("fundraiser")) {
    return "bg-sky-50 text-sky-700 border-sky-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
};

const isImageFile = (value = "") => {
  const str = String(value).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg"].some((ext) =>
    str.includes(ext)
  );
};

const normalizeUrl = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return `${API_BASE}${raw}`;
  return `${API_BASE}/${raw}`;
};

const getMediaItems = (input) => {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : [input];

  return arr
    .map((item, index) => {
      if (!item) return null;

      if (typeof item === "string") {
        const url = normalizeUrl(item);
        return {
          id: `${url}-${index}`,
          name: `File ${index + 1}`,
          url,
          isImage: isImageFile(url),
        };
      }

      const url = normalizeUrl(
        item.url ||
          item.secure_url ||
          item.path ||
          item.file ||
          item.src ||
          item.location
      );

      if (!url) return null;

      const name =
        item.name ||
        item.title ||
        item.originalname ||
        item.filename ||
        item.type ||
        `File ${index + 1}`;

      return {
        id: `${url}-${index}`,
        name,
        url,
        isImage:
          item.isImage ||
          isImageFile(url) ||
          String(item.mimetype || item.type || "")
            .toLowerCase()
            .startsWith("image"),
      };
    })
    .filter(Boolean);
};

const getUserPhoto = (details) => {
  const raw =
    details?.profile?.photo ||
    details?.photo ||
    details?.profilePhoto ||
    details?.avatar ||
    details?.image ||
    details?.profileImage;

  return normalizeUrl(raw);
};

const getAccountStatus = (details) => {
  return details?.status || (details?.isActive ? "active" : "inactive");
};

const getActiveMode = (details) => {
  const mode = String(details?.activeMode || "none").toLowerCase();
  return ["investor", "fundraiser", "none"].includes(mode) ? mode : "none";
};

const getAccessBlock = (details, type) => {
  const fallback = details?.[`${type}Profile`] || {};
  const directAccess = details?.access?.[type] || {};

  const enabled =
    directAccess?.enabled ??
    fallback?.enabled ??
    (String(details?.role || "").toLowerCase() === type);

  return {
    enabled: Boolean(enabled),
    type: directAccess?.type || fallback?.type || "individual",
    kycStatus:
      directAccess?.kycStatus || fallback?.kycStatus || details?.kycStatus || "NONE",
    panStatus: directAccess?.panStatus || fallback?.panStatus || "NONE",
    bankStatus: directAccess?.bankStatus || fallback?.bankStatus || "NONE",
    companyStatus: directAccess?.companyStatus || fallback?.companyStatus || "NONE",
    documents: directAccess?.documents || fallback?.documents || {},
  };
};

const getProfileLabels = (details) => {
  const investor = getAccessBlock(details, "investor");
  const fundraiser = getAccessBlock(details, "fundraiser");
  const labels = [];

  if (investor.enabled) {
    labels.push(
      investor.type === "company" ? "Investor Company" : "Investor Individual"
    );
  }

  if (fundraiser.enabled) {
    labels.push(
      fundraiser.type === "company"
        ? "Fundraiser Company"
        : "Fundraiser Individual"
    );
  }

  return labels;
};

const docsFromAccess = (details) => {
  const investor = getAccessBlock(details, "investor");
  const fundraiser = getAccessBlock(details, "fundraiser");

  const investorDocuments = getMediaItems(
    Object.values(investor.documents || {}).filter(Boolean)
  );

  const fundraiserDocuments = getMediaItems(
    Object.values(fundraiser.documents || {}).filter(Boolean)
  );

  return { investorDocuments, fundraiserDocuments };
};

export default function AdminUserDetails() {
  const { setSidebarOpen } = useOutletContext();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedCampaign, setExpandedCampaign] = useState(null);

  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [savingOverview, setSavingOverview] = useState(false);

  const [overviewForm, setOverviewForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    status: "active",
    activeMode: "none",

    investorEnabled: false,
    investorType: "individual",
    investorKycStatus: "NONE",
    investorPanStatus: "NONE",
    investorBankStatus: "NONE",

    fundraiserEnabled: false,
    fundraiserType: "individual",
    fundraiserKycStatus: "NONE",
    fundraiserPanStatus: "NONE",
    fundraiserBankStatus: "NONE",
    fundraiserCompanyStatus: "NONE",
  });

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getAdminUserDetails(userId);
      const data = res?.user || res?.data?.user || res?.data || res || {};
      setDetails(data);

      const investor = getAccessBlock(data, "investor");
      const fundraiser = getAccessBlock(data, "fundraiser");

      setOverviewForm({
        name: data?.name || "",
        email: data?.email || "",
        phone: data?.profile?.phone || data?.phone || data?.mobile || "",
        role: data?.role || "user",
        status: getAccountStatus(data),
        activeMode: getActiveMode(data),

        investorEnabled: investor.enabled,
        investorType: investor.type,
        investorKycStatus: investor.kycStatus,
        investorPanStatus: investor.panStatus,
        investorBankStatus: investor.bankStatus,

        fundraiserEnabled: fundraiser.enabled,
        fundraiserType: fundraiser.type,
        fundraiserKycStatus: fundraiser.kycStatus,
        fundraiserPanStatus: fundraiser.panStatus,
        fundraiserBankStatus: fundraiser.bankStatus,
        fundraiserCompanyStatus: fundraiser.companyStatus,
      });
    } catch (error) {
      console.error("Admin user details fetch error:", error);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [userId]);

  const campaigns = details?.campaigns || [];
  const investments = details?.investments || [];
  const transactions = details?.transactions || [];

  const investorAccess = useMemo(
    () => getAccessBlock(details || {}, "investor"),
    [details]
  );
  const fundraiserAccess = useMemo(
    () => getAccessBlock(details || {}, "fundraiser"),
    [details]
  );

  const userPhoto = useMemo(() => getUserPhoto(details), [details]);
  const profileLabels = useMemo(() => getProfileLabels(details || {}), [details]);
  const { investorDocuments, fundraiserDocuments } = useMemo(
    () => docsFromAccess(details || {}),
    [details]
  );

  const totalCampaignAmount = useMemo(
    () =>
      campaigns.reduce(
        (sum, c) =>
          sum +
          Number(
            c?.moneyRaised ||
              c?.currentFunding ||
              c?.raisedAmount ||
              0
          ),
        0
      ),
    [campaigns]
  );

  const totalInvestmentAmount = useMemo(
    () =>
      investments.reduce(
        (sum, i) => sum + Number(i?.amount || i?.investmentAmount || 0),
        0
      ),
    [investments]
  );

  const fundraiserCampaigns = useMemo(() => campaigns, [campaigns]);
  const investorInvestments = useMemo(() => investments, [investments]);

  const tabs = [
    { key: "overview", label: "Overview", icon: FaUser },
    { key: "profiles", label: "Profile Access", icon: FaUserTie },
    { key: "fundraiser", label: "Fundraiser Activity", icon: FaFolderOpen },
    { key: "investor", label: "Investor Activity", icon: FaMoneyBillWave },
    { key: "transactions", label: "Transactions", icon: FaReceipt },
    { key: "documents", label: "Documents", icon: FaFileAlt },
  ];

  const handleApproveCampaign = async (campaignId) => {
    try {
      await approveCampaign(campaignId);
      fetchDetails();
    } catch (e) {
      console.error("Approve campaign error:", e);
    }
  };

  const handleRejectCampaign = async (campaignId) => {
    try {
      await rejectCampaign(campaignId);
      fetchDetails();
    } catch (e) {
      console.error("Reject campaign error:", e);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await deleteCampaign(campaignId);
      fetchDetails();
    } catch (e) {
      console.error("Delete campaign error:", e);
    }
  };

  const handleOverviewInput = (field, value) => {
    setOverviewForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveOverview = async () => {
    try {
      setSavingOverview(true);

      const payload = {
        name: overviewForm.name,
        email: overviewForm.email,
        role: overviewForm.role,
        status: overviewForm.status,
        activeMode: overviewForm.activeMode,
        profile: {
          ...(details?.profile || {}),
          phone: overviewForm.phone,
        },
        access: {
          ...(details?.access || {}),
          investor: {
            ...(details?.access?.investor || {}),
            enabled: overviewForm.investorEnabled,
            type: overviewForm.investorType,
            kycStatus: overviewForm.investorKycStatus,
            panStatus: overviewForm.investorPanStatus,
            bankStatus: overviewForm.investorBankStatus,
          },
          fundraiser: {
            ...(details?.access?.fundraiser || {}),
            enabled: overviewForm.fundraiserEnabled,
            type: overviewForm.fundraiserType,
            kycStatus: overviewForm.fundraiserKycStatus,
            panStatus: overviewForm.fundraiserPanStatus,
            bankStatus: overviewForm.fundraiserBankStatus,
            companyStatus: overviewForm.fundraiserCompanyStatus,
          },
        },
      };

      await updateAdminUser(userId, payload);
      setIsEditingOverview(false);
      fetchDetails();
    } catch (e) {
      console.error("Update admin user error:", e);
    } finally {
      setSavingOverview(false);
    }
  };

  const handleCancelOverview = () => {
    if (!details) return;
    const investor = getAccessBlock(details, "investor");
    const fundraiser = getAccessBlock(details, "fundraiser");

    setOverviewForm({
      name: details?.name || "",
      email: details?.email || "",
      phone: details?.profile?.phone || details?.phone || details?.mobile || "",
      role: details?.role || "user",
      status: getAccountStatus(details),
      activeMode: getActiveMode(details),

      investorEnabled: investor.enabled,
      investorType: investor.type,
      investorKycStatus: investor.kycStatus,
      investorPanStatus: investor.panStatus,
      investorBankStatus: investor.bankStatus,

      fundraiserEnabled: fundraiser.enabled,
      fundraiserType: fundraiser.type,
      fundraiserKycStatus: fundraiser.kycStatus,
      fundraiserPanStatus: fundraiser.panStatus,
      fundraiserBankStatus: fundraiser.bankStatus,
      fundraiserCompanyStatus: fundraiser.companyStatus,
    });

    setIsEditingOverview(false);
  };

  return (
    <>
      <div className="mb-6 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-6 text-white sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-white hover:bg-white/15 lg:hidden"
              >
                <FaBars />
              </button>

              <button
                onClick={() => navigate("/admin/users")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
              >
                <FaArrowLeft />
                Back
              </button>

              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {details?.name || "User Profile"}
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Account, profiles, verification, fundraiser activity, investor activity and documents
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {profileLabels.length > 0 ? (
                    profileLabels.map((label) => (
                      <span
                        key={label}
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                          getProfileBadgeTone(label)
                        )}
                      >
                        {label}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90">
                      No profile enabled
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-300">User ID</p>
                <p className="max-w-[220px] break-all text-xs text-slate-400">
                  {details?._id || "—"}
                </p>
                <p className="mt-2 text-xs text-slate-300">
                  Active Mode:{" "}
                  <span className="font-semibold capitalize text-white">
                    {getActiveMode(details)}
                  </span>
                </p>
              </div>

              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={details?.name || "User"}
                  className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/10 text-xl text-white">
                  <FaUser />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading user details...
        </div>
      ) : !details ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          User details not found.
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatBox
              title="Campaigns Created"
              value={fundraiserCampaigns.length}
              accent="from-sky-500 to-blue-600"
            />
            <StatBox
              title="Total Campaign Raised"
              value={INR(totalCampaignAmount)}
              accent="from-emerald-500 to-green-600"
            />
            <StatBox
              title="Total Investments"
              value={INR(totalInvestmentAmount)}
              accent="from-violet-500 to-purple-600"
            />
            <StatBox
              title="Transactions"
              value={transactions.length}
              accent="from-amber-500 to-orange-500"
            />
          </div>

          <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition",
                      activeTab === tab.key
                        ? "bg-slate-900 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <Icon className="text-sm" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="xl:col-span-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt={details?.name || "User"}
                      className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="grid h-20 w-20 place-items-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
                      <FaUser />
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {details?.name || "—"}
                    </h3>
                    <p className="text-sm text-slate-500 capitalize">
                      System Role: {details?.role || "user"}
                    </p>
                    <span
                      className={cn(
                        "mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                        getStatusTone(getAccountStatus(details))
                      )}
                    >
                      {getAccountStatus(details)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <MiniInfo icon={FaEnvelope} label="Email" value={details?.email || "—"} />
                  <MiniInfo
                    icon={FaPhone}
                    label="Phone"
                    value={details?.profile?.phone || details?.phone || details?.mobile || "—"}
                  />
                  <MiniInfo
                    icon={FaCalendarAlt}
                    label="Joined"
                    value={formatDate(details?.createdAt)}
                  />
                  <MiniInfo
                    icon={FaExchangeAlt}
                    label="Current Mode"
                    value={getActiveMode(details)}
                  />
                  <MiniInfo
                    icon={FaShieldAlt}
                    label="Last Login"
                    value={formatDate(details?.lastLogin)}
                  />
                </div>
              </div>

              <div className="xl:col-span-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Account & Profile Controls</h3>
                    <p className="text-sm text-slate-500">
                      Manage system role, mode, and separate investor/fundraiser profile states
                    </p>
                  </div>

                  {!isEditingOverview ? (
                    <button
                      onClick={() => setIsEditingOverview(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <FaPen />
                      Edit
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleCancelOverview}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <FaTimes />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveOverview}
                        disabled={savingOverview}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <FaSave />
                        {savingOverview ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <EditableField
                    label="Name"
                    value={overviewForm.name}
                    isEditing={isEditingOverview}
                    onChange={(v) => handleOverviewInput("name", v)}
                  />
                  <EditableField
                    label="Email"
                    value={overviewForm.email}
                    isEditing={isEditingOverview}
                    onChange={(v) => handleOverviewInput("email", v)}
                    type="email"
                  />
                  <EditableField
                    label="Phone"
                    value={overviewForm.phone}
                    isEditing={isEditingOverview}
                    onChange={(v) => handleOverviewInput("phone", v)}
                  />

                  <EditableSelect
                    label="System Role"
                    value={overviewForm.role}
                    isEditing={isEditingOverview}
                    onChange={(v) => handleOverviewInput("role", v)}
                    options={["user", "admin"]}
                  />

                  <EditableSelect
                    label="Account Status"
                    value={overviewForm.status}
                    isEditing={isEditingOverview}
                    onChange={(v) => handleOverviewInput("status", v)}
                    options={["active", "inactive", "blocked", "pending"]}
                  />

                  <EditableSelect
                    label="Active Mode"
                    value={overviewForm.activeMode}
                    isEditing={isEditingOverview}
                    onChange={(v) => handleOverviewInput("activeMode", v)}
                    options={["none", "investor", "fundraiser"]}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "profiles" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ProfileAccessCard
                title="Investor Profile"
                icon={FaMoneyBillWave}
                badge={
                  investorAccess.enabled
                    ? investorAccess.type === "company"
                      ? "Investor Company"
                      : "Investor Individual"
                    : "Investor Disabled"
                }
                badgeTone={
                  investorAccess.enabled
                    ? getProfileBadgeTone("investor")
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }
                rows={[
                  {
                    label: "Enabled",
                    value: investorAccess.enabled ? "Yes" : "No",
                    editingKey: "investorEnabled",
                    type: "boolean",
                  },
                  {
                    label: "Type",
                    value: overviewForm.investorType,
                    editingKey: "investorType",
                    type: "select",
                    options: ["individual", "company"],
                  },
                  {
                    label: "KYC Status",
                    value: overviewForm.investorKycStatus,
                    editingKey: "investorKycStatus",
                    type: "select",
                    options: ["NONE", "PENDING", "VERIFIED", "REJECTED"],
                  },
                  {
                    label: "PAN Status",
                    value: overviewForm.investorPanStatus,
                    editingKey: "investorPanStatus",
                    type: "select",
                    options: ["NONE", "PENDING", "VERIFIED", "REJECTED"],
                  },
                  {
                    label: "Bank Status",
                    value: overviewForm.investorBankStatus,
                    editingKey: "investorBankStatus",
                    type: "select",
                    options: ["NONE", "PENDING", "VERIFIED", "REJECTED"],
                  },
                ]}
                isEditing={isEditingOverview}
                onChange={handleOverviewInput}
              />

              <ProfileAccessCard
                title="Fundraiser Profile"
                icon={FaFolderOpen}
                badge={
                  fundraiserAccess.enabled
                    ? fundraiserAccess.type === "company"
                      ? "Fundraiser Company"
                      : "Fundraiser Individual"
                    : "Fundraiser Disabled"
                }
                badgeTone={
                  fundraiserAccess.enabled
                    ? getProfileBadgeTone("fundraiser")
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }
                rows={[
                  {
                    label: "Enabled",
                    value: fundraiserAccess.enabled ? "Yes" : "No",
                    editingKey: "fundraiserEnabled",
                    type: "boolean",
                  },
                  {
                    label: "Type",
                    value: overviewForm.fundraiserType,
                    editingKey: "fundraiserType",
                    type: "select",
                    options: ["individual", "company"],
                  },
                  {
                    label: "KYC Status",
                    value: overviewForm.fundraiserKycStatus,
                    editingKey: "fundraiserKycStatus",
                    type: "select",
                    options: ["NONE", "PENDING", "VERIFIED", "REJECTED"],
                  },
                  {
                    label: "PAN Status",
                    value: overviewForm.fundraiserPanStatus,
                    editingKey: "fundraiserPanStatus",
                    type: "select",
                    options: ["NONE", "PENDING", "VERIFIED", "REJECTED"],
                  },
                  {
                    label: "Bank Status",
                    value: overviewForm.fundraiserBankStatus,
                    editingKey: "fundraiserBankStatus",
                    type: "select",
                    options: ["NONE", "PENDING", "VERIFIED", "REJECTED"],
                  },
                  {
                    label: "Company Status",
                    value: overviewForm.fundraiserCompanyStatus,
                    editingKey: "fundraiserCompanyStatus",
                    type: "select",
                    options: ["NONE", "PENDING", "VERIFIED", "REJECTED"],
                  },
                ]}
                isEditing={isEditingOverview}
                onChange={handleOverviewInput}
              />
            </div>
          )}

          {activeTab === "fundraiser" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DetailCard label="Fundraiser Enabled" value={fundraiserAccess.enabled ? "Yes" : "No"} />
                <DetailCard label="Type" value={fundraiserAccess.type} />
                <DetailCard label="Campaigns" value={fundraiserCampaigns.length} />
                <DetailCard label="Total Raised" value={INR(totalCampaignAmount)} />
              </div>

              {fundraiserCampaigns.length > 0 ? (
                fundraiserCampaigns.map((campaign, idx) => {
                  const campaignImages = getMediaItems(
                    campaign?.projectImages ||
                      campaign?.images ||
                      campaign?.photos ||
                      campaign?.gallery
                  );

                  const campaignDocs = getMediaItems(
                    campaign?.kycDocuments?.length > 0
                      ? campaign.kycDocuments
                      : campaign?.documents
                  );

                  const fundingGoal = Number(
                    campaign?.fundingGoal || campaign?.targetAmount || 0
                  );
                  const raised = Number(
                    campaign?.moneyRaised || campaign?.currentFunding || 0
                  );
                  const progress =
                    fundingGoal > 0 ? Math.min((raised / fundingGoal) * 100, 100) : 0;

                  const isExpanded = expandedCampaign === campaign?._id;

                  return (
                    <div
                      key={campaign?._id || idx}
                      className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                                  getStatusTone(campaign?.status)
                                )}
                              >
                                {campaign?.status || "pending"}
                              </span>

                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                {campaign?.projectCategory || campaign?.category || "General"}
                              </span>

                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                {formatDate(campaign?.createdAt)}
                              </span>
                            </div>

                            <h3 className="truncate text-lg font-bold text-slate-900">
                              {campaign?.projectTitle || campaign?.title || "Fundraiser"}
                            </h3>

                            <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                              {campaign?.projectOverview || campaign?.description || "No overview available"}
                            </p>

                            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                              <CompactMetric label="Goal" value={INR(fundingGoal)} />
                              <CompactMetric label="Raised" value={INR(raised)} />
                              <CompactMetric label="Progress" value={`${progress.toFixed(0)}%`} />
                              <CompactMetric label="Docs" value={campaignDocs.length} />
                            </div>

                            <div className="mt-3">
                              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 lg:justify-end">
                            <button
                              onClick={() =>
                                setExpandedCampaign(isExpanded ? null : campaign?._id)
                              }
                              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              {isExpanded ? "Hide Details" : "View More"}
                            </button>

                            <button
                              onClick={() => handleApproveCampaign(campaign?._id)}
                              className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => handleRejectCampaign(campaign?._id)}
                              className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-600"
                            >
                              Reject
                            </button>

                            <button
                              onClick={() => handleDeleteCampaign(campaign?._id)}
                              className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-slate-200 bg-slate-50/60 p-4">
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                            <DetailCard
                              label="Category"
                              value={campaign?.projectCategory || campaign?.category || "—"}
                            />
                            <DetailCard label="Created By" value={details?.name || "—"} />
                            <DetailCard label="Funding Goal" value={INR(fundingGoal)} />
                            <DetailCard label="Raised Amount" value={INR(raised)} />
                          </div>

                          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
                            <MediaGallery
                              title="Project Photos"
                              icon={FaImage}
                              items={campaignImages}
                              emptyText="No project photos found."
                            />

                            <MediaGallery
                              title="Campaign Documents"
                              icon={FaFileAlt}
                              items={campaignDocs}
                              emptyText="No campaign documents found."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <EmptyState text="No fundraiser campaigns found for this user." />
              )}
            </div>
          )}

          {activeTab === "investor" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DetailCard label="Investor Enabled" value={investorAccess.enabled ? "Yes" : "No"} />
                <DetailCard label="Type" value={investorAccess.type} />
                <DetailCard label="Investments" value={investorInvestments.length} />
                <DetailCard label="Total Invested" value={INR(totalInvestmentAmount)} />
              </div>

              {investorInvestments.length > 0 ? (
                investorInvestments.map((inv, idx) => (
                  <div
                    key={inv?._id || idx}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {inv?.campaign?.title ||
                            inv?.campaignTitle ||
                            inv?.projectTitle ||
                            "Investment"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDate(inv?.createdAt || inv?.investmentDate)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-violet-700">
                          {INR(inv?.amount || inv?.investmentAmount || 0)}
                        </p>
                        <span
                          className={cn(
                            "mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                            getStatusTone(inv?.status || inv?.paymentStatus)
                          )}
                        >
                          {inv?.status || inv?.paymentStatus || "pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="No investor activity found for this user." />
              )}
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-3">
              {transactions.length > 0 ? (
                transactions.map((txn, idx) => (
                  <div
                    key={txn?._id || idx}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold capitalize text-slate-900">
                          {txn?.type || "Transaction"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {txn?.transactionId || txn?._id || "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(txn?.createdAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {INR(txn?.amount || 0)}
                        </p>
                        <span
                          className={cn(
                            "mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                            getStatusTone(txn?.status)
                          )}
                        >
                          {txn?.status || "success"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="No transactions found for this user." />
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="space-y-4">
                <SectionHeader
                  icon={FaMoneyBillWave}
                  title="Investor Documents"
                  subtitle="Documents attached under investor profile"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailCard label="Investor KYC" value={investorAccess.kycStatus} />
                  <DetailCard label="PAN Status" value={investorAccess.panStatus} />
                  <DetailCard label="Bank Status" value={investorAccess.bankStatus} />
                  <DetailCard label="Profile Type" value={investorAccess.type} />
                </div>

                <MediaGallery
                  title="Investor Files"
                  icon={FaFileAlt}
                  items={investorDocuments}
                  emptyText="No investor documents found."
                />
              </div>

              <div className="space-y-4">
                <SectionHeader
                  icon={FaBuilding}
                  title="Fundraiser Documents"
                  subtitle="Documents attached under fundraiser profile"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailCard label="Fundraiser KYC" value={fundraiserAccess.kycStatus} />
                  <DetailCard label="PAN Status" value={fundraiserAccess.panStatus} />
                  <DetailCard label="Bank Status" value={fundraiserAccess.bankStatus} />
                  <DetailCard label="Company Status" value={fundraiserAccess.companyStatus} />
                </div>

                <MediaGallery
                  title="Fundraiser Files"
                  icon={FaFileAlt}
                  items={fundraiserDocuments}
                  emptyText="No fundraiser documents found."
                />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-1 text-slate-500">
          <Icon />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function ProfileAccessCard({
  title,
  icon: Icon,
  badge,
  badgeTone,
  rows = [],
  isEditing,
  onChange,
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-600">
            <Icon />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
            badgeTone
          )}
        >
          {badge}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {row.label}
            </p>

            {!isEditing ? (
              <p className="mt-2 text-sm font-semibold capitalize text-slate-900">
                {String(row.value ?? "—").toLowerCase() === "true"
                  ? "Yes"
                  : String(row.value ?? "—").toLowerCase() === "false"
                  ? "No"
                  : String(row.value ?? "—")}
              </p>
            ) : row.type === "boolean" ? (
              <select
                value={String(row.value === "Yes" || row.value === true)}
                onChange={(e) => onChange(row.editingKey, e.target.value === "true")}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-slate-400"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            ) : (
              <select
                value={row.value || ""}
                onChange={(e) => onChange(row.editingKey, e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium capitalize text-slate-900 outline-none focus:border-slate-400"
              >
                {(row.options || []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBox({ title, value, accent }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className={cn("h-1.5 bg-gradient-to-r", accent)} />
      <div className="p-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
      {text}
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold capitalize text-slate-900">
        {value || "—"}
      </p>
    </div>
  );
}

function MiniInfo({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mt-0.5 text-slate-500">
        <Icon />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold capitalize text-slate-900">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function MediaGallery({ title, icon: Icon, items = [], emptyText }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="text-slate-500">
          <Icon />
        </div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              {item.isImage ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="grid h-40 place-items-center bg-slate-100 text-slate-500">
                  <FaFileAlt className="text-3xl" />
                </div>
              )}
              <div className="border-t border-slate-200 px-3 py-2">
                <p className="truncate text-xs font-medium text-slate-700">
                  {item.name}
                </p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{emptyText}</p>
      )}
    </div>
  );
}

function EditableField({
  label,
  value,
  isEditing,
  onChange,
  type = "text",
  placeholder = "Enter value",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      {isEditing ? (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-slate-400"
        />
      ) : (
        <p className="mt-2 break-words text-sm font-semibold text-slate-900">
          {value || "—"}
        </p>
      )}
    </div>
  );
}

function EditableSelect({
  label,
  value,
  isEditing,
  onChange,
  options = [],
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      {isEditing ? (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium capitalize text-slate-900 outline-none focus:border-slate-400"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <p className="mt-2 break-words text-sm font-semibold capitalize text-slate-900">
          {value || "—"}
        </p>
      )}
    </div>
  );
}

function CompactMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}