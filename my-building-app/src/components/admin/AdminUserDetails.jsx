import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBars,
  FaCalendarAlt,
  FaEnvelope,
  FaEye,
  FaFileAlt,
  FaFolderOpen,
  FaIdCard,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhone,
  FaReceipt,
  FaShieldAlt,
  FaUniversity,
  FaUser,
  FaUserTie,
} from "react-icons/fa";
import {
  approveCampaign,
  deleteCampaign,
  getAdminUserDetails,
  rejectCampaign,
  updateUserDocumentStatus,
} from "../../api/admin";

const cn = (...classes) => classes.filter(Boolean).join(" ");
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") || "http://localhost:5000";
const STATUS_OPTIONS = ["NONE", "PENDING", "VERIFIED", "REJECTED"];

const INR = (value) => {
  const num = Number(value || 0);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `Rs. ${num}`;
  }
};

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const tone = (status = "") => {
  const v = String(status).toLowerCase();
  if (["approved", "verified", "active", "success"].includes(v)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (["pending", "review", "processing", "under_review", "under review"].includes(v)) return "border-amber-200 bg-amber-50 text-amber-700";
  if (["rejected", "failed", "inactive", "blocked", "deleted"].includes(v)) return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
};

const normalizeUrl = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return `${API_BASE}${raw}`;
  return `${API_BASE}/${raw}`;
};

const isImageFile = (value = "") => [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg"].some((ext) => String(value).toLowerCase().includes(ext));
const pretty = (value = "") => String(value).replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());

const accessFrom = (details) => {
  const access = details?.fundraiserAccess || details?.access?.fundraiser || {};
  return {
    enabled: Boolean(access.enabled),
    type: access.type || "individual",
    kycStatus: access.kycStatus || "NONE",
    panStatus: access.panStatus || "NONE",
    bankStatus: access.bankStatus || "NONE",
    companyStatus: access.companyStatus || "NONE",
    details: access.details || {},
    documents: access.documents || {},
  };
};

const investorAccessFrom = (details) => {
  const access = details?.investorAccess || details?.access?.investor || {};
  return {
    enabled: Boolean(access.enabled),
    type: access.type || "individual",
    kycStatus: access.kycStatus || "NONE",
    bankStatus: access.bankStatus || "NONE",
    details: access.details || {},
    documents: access.documents || {},
  };
};

const campaignDocs = (campaign) => [
  { label: "License", url: campaign?.documents?.license },
  { label: "GST Certificate", url: campaign?.documents?.gst },
  { label: "Company Registration", url: campaign?.documents?.companyRegistration },
  { label: "Legal Document", url: campaign?.documents?.legalDocument },
  { label: "Project Video", url: campaign?.documents?.video },
].filter((item) => item.url);

const campaignGallery = (campaign) => [
  { label: "Cover Photo", url: campaign?.documents?.photo },
  ...(campaign?.documents?.projectPhotos || []).map((url, index) => ({ label: `Project Photo ${index + 1}`, url })),
].filter((item) => item.url);

export default function AdminUserDetails() {
  const { setSidebarOpen } = useOutletContext();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});
  const [campaignLoading, setCampaignLoading] = useState({});

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getAdminUserDetails(userId);
      setDetails(res?.user || res?.data?.user || res?.data || res || null);
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

  const fundraiserAccess = useMemo(() => accessFrom(details), [details]);
  const investorAccess = useMemo(() => investorAccessFrom(details), [details]);
  const profileMode = useMemo(() => {
    const activeMode = String(details?.activeMode || "").toLowerCase();
    if (activeMode === "investor" && investorAccess.enabled) return "investor";
    if (activeMode === "fundraiser" && fundraiserAccess.enabled) return "fundraiser";
    if (fundraiserAccess.enabled && !investorAccess.enabled) return "fundraiser";
    if (investorAccess.enabled && !fundraiserAccess.enabled) return "investor";
    if (fundraiserAccess.enabled) return "fundraiser";
    if (investorAccess.enabled) return "investor";
    return "fundraiser";
  }, [details, fundraiserAccess.enabled, investorAccess.enabled]);
  const isInvestorView = profileMode === "investor";

  const campaigns = details?.campaigns || [];
  const investments = details?.investments || [];
  const investorTransactions = details?.investorTransactions || [];
  const fundraiserTransactions = details?.fundraiserTransactions || [];
  const transactions = isInvestorView ? investorTransactions : fundraiserTransactions;
  const totalRaised = campaigns.reduce((sum, c) => sum + Number(c?.moneyRaised || c?.currentFunding || 0), 0);
  const totalGoal = campaigns.reduce((sum, c) => sum + Number(c?.fundingGoal || c?.moneyToRaise || 0), 0);
  const transactionRaised = transactions.reduce((sum, txn) => sum + Number(txn?.amount || 0), 0);
  const completedTransactions = transactions.filter((txn) => txn?.status === "completed").length;
  const pendingTransactions = transactions.filter((txn) => ["created", "pending"].includes(String(txn?.status || "").toLowerCase())).length;
  const failedTransactions = transactions.filter((txn) => ["failed", "cancelled", "refunded"].includes(String(txn?.status || "").toLowerCase())).length;
  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv?.amount || 0), 0);
  const estimatedCurrentValue = investments.reduce((sum, inv) => {
    const amount = Number(inv?.amount || 0);
    const profit = Number(inv?.campaign?.profitPercentage || 0);
    return sum + amount + Math.round((amount * profit) / 100);
  }, 0);
  const activeInvestments = investments.filter((inv) => {
    const paymentStatus = String(inv?.paymentStatus || "").toLowerCase();
    const status = String(inv?.status || "").toLowerCase();
    return paymentStatus === "completed" || status === "confirmed";
  }).length;
  const counts = {
    approved: campaigns.filter((c) => c?.status === "approved").length,
    pending: campaigns.filter((c) => c?.status === "pending").length,
    rejected: campaigns.filter((c) => c?.status === "rejected").length,
  };
  const completion = totalGoal > 0 ? Math.min((totalRaised / totalGoal) * 100, 100) : 0;
  const address = [details?.profile?.addressLine, details?.profile?.city, details?.profile?.state, details?.profile?.pincode].filter(Boolean).join(", ");

  const userDocs = isInvestorView
    ? [
        { title: "KYC Document", url: investorAccess.documents?.kyc, status: investorAccess.kycStatus },
        { title: "PAN Document", url: investorAccess.documents?.pan, status: investorAccess.kycStatus },
        { title: "Address Proof", url: investorAccess.documents?.addressProof, status: investorAccess.kycStatus },
        { title: "Bank Proof", url: investorAccess.documents?.bankProof, status: investorAccess.bankStatus },
      ].filter((item) => item.url)
    : [
        { title: "KYC Document", url: fundraiserAccess.documents?.kyc, status: fundraiserAccess.kycStatus },
        { title: "PAN Document", url: fundraiserAccess.documents?.pan, status: fundraiserAccess.panStatus },
        { title: "Address Proof", url: fundraiserAccess.documents?.addressProof, status: fundraiserAccess.kycStatus },
        { title: "Bank Proof", url: fundraiserAccess.documents?.bankProof, status: fundraiserAccess.bankStatus },
        { title: "GST Certificate", url: fundraiserAccess.documents?.gst, status: fundraiserAccess.companyStatus },
        { title: "Business License", url: fundraiserAccess.documents?.license, status: fundraiserAccess.companyStatus },
        { title: "Incorporation Certificate", url: fundraiserAccess.documents?.incorporation, status: fundraiserAccess.companyStatus },
      ].filter((item) => item.url);

  const tabs = isInvestorView
    ? [
        ["overview", "Overview", FaUser],
        ["access", "Profile Access", FaUserTie],
        ["activity", "Investor Activity", FaFolderOpen],
        ["campaigns", "Investor Campaigns", FaMoneyBillWave],
        ["transactions", "Transactions", FaReceipt],
        ["kyc", "KYC & Documents", FaShieldAlt],
      ]
    : [
        ["overview", "Overview", FaUser],
        ["access", "Profile Access", FaUserTie],
        ["activity", "Fundraiser Activity", FaFolderOpen],
        ["campaigns", "Campaigns Listed", FaMoneyBillWave],
        ["transactions", "Transactions", FaReceipt],
        ["kyc", "KYC & Documents", FaShieldAlt],
      ];

  const patchLocalStatus = (key, value) => {
    setDetails((prev) => {
      if (!prev) return prev;
      if (isInvestorView) {
        const current = investorAccessFrom(prev);
        return { ...prev, investorAccess: { ...current, [key]: value } };
      }
      const current = accessFrom(prev);
      return { ...prev, fundraiserAccess: { ...current, [key]: value } };
    });
  };

  const handleStatusUpdate = async (documentType, key, status) => {
    const loadingKey = `${documentType}-${status}`;
    try {
      setStatusLoading((prev) => ({ ...prev, [loadingKey]: true }));
      patchLocalStatus(key, status);
      await updateUserDocumentStatus(
        userId,
        isInvestorView ? "investor" : "fundraiser",
        documentType,
        status
      );
      await fetchDetails();
    } catch (error) {
      console.error("Document status update error:", error);
      await fetchDetails();
    } finally {
      setStatusLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleCampaignAction = async (campaignId, action) => {
    try {
      setCampaignLoading((prev) => ({ ...prev, [`${campaignId}-${action}`]: true }));
      if (action === "approve") await approveCampaign(campaignId);
      if (action === "reject") await rejectCampaign(campaignId);
      if (action === "delete") await deleteCampaign(campaignId);
      await fetchDetails();
    } catch (error) {
      console.error(`Campaign ${action} error:`, error);
    } finally {
      setCampaignLoading((prev) => ({ ...prev, [`${campaignId}-${action}`]: false }));
    }
  };

  return (
    <>
      <div className="mb-6 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_28%),linear-gradient(135deg,#082f49_0%,#0f172a_46%,#111827_100%)] px-5 py-6 text-white sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <button onClick={() => setSidebarOpen(true)} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-white hover:bg-white/15 lg:hidden"><FaBars /></button>
              <button onClick={() => navigate("/admin/users")} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"><FaArrowLeft />Back</button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">{isInvestorView ? "Investor Admin Profile" : "Fundraiser Admin Profile"}</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{details?.name || (isInvestorView ? "Investor User" : "Fundraiser User")}</h1>
                <p className="mt-2 text-sm text-slate-300">
                  {isInvestorView
                    ? "Investor overview, access, activity, portfolio, transactions, KYC, and documents are shown here."
                    : "Fundraiser overview, access, activity, campaigns, KYC, and documents are shown here."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    isInvestorView
                      ? investorAccess.enabled ? "Investor Enabled" : "Investor Disabled"
                      : fundraiserAccess.enabled ? "Fundraiser Enabled" : "Fundraiser Disabled",
                    `Type: ${pretty(isInvestorView ? investorAccess.type : fundraiserAccess.type)}`,
                    `Mode: ${pretty(details?.activeMode || "none")}`,
                    isInvestorView ? `Investments: ${investments.length}` : `Campaigns: ${campaigns.length}`,
                  ].map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/95">{item}</span>)}
                </div>
              </div>
            </div>
            <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/5 p-4 text-sm text-slate-200 sm:min-w-[290px]">
              <HeroInfo icon={FaEnvelope} label="Email" value={details?.email} />
              <HeroInfo icon={FaPhone} label="Phone" value={details?.profile?.phone || details?.phone} />
              <HeroInfo icon={FaCalendarAlt} label="Joined" value={formatDate(details?.createdAt)} />
              <HeroInfo icon={FaIdCard} label="User ID" value={details?._id} />
            </div>
          </div>
        </div>
      </div>

      {loading ? <Card className="p-10 text-center text-slate-500">Loading fundraiser profile...</Card> : !details ? <Card className="p-10 text-center text-slate-500">User details not found.</Card> : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              title={isInvestorView ? "Investments Made" : "Campaigns Created"}
              value={isInvestorView ? investments.length : campaigns.length}
              accent="from-sky-500 to-cyan-500"
            />
            <Stat
              title={isInvestorView ? "Total Invested" : "Total Goal"}
              value={INR(isInvestorView ? totalInvested : totalGoal)}
              accent="from-blue-600 to-indigo-600"
            />
            <Stat
              title={isInvestorView ? "Portfolio Value" : "Total Raised"}
              value={INR(isInvestorView ? estimatedCurrentValue : totalRaised)}
              accent="from-emerald-500 to-green-600"
            />
            <Stat
              title={isInvestorView ? "Transactions" : "Completion Rate"}
              value={isInvestorView ? transactions.length : `${completion.toFixed(0)}%`}
              accent="from-amber-500 to-orange-500"
            />
          </div>

          <Card className="mb-6 p-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
              {tabs.map(([key, label, Icon]) => (
                <button key={key} onClick={() => setActiveTab(key)} className={cn("flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition", activeTab === key ? "bg-slate-900 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50")}>
                  <Icon className="text-sm" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </Card>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="p-6">
                <SectionTitle
                  icon={FaUser}
                  title={isInvestorView ? "Investor Overview" : "Fundraiser Overview"}
                  subtitle={isInvestorView ? "Identity, contact, address, bank, and investor account information." : "Identity, contact, address, and bank information."}
                />
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Info label="Full Name" value={details?.name} icon={FaUser} />
                  <Info label="Email" value={details?.email} icon={FaEnvelope} />
                  <Info label="Phone" value={details?.profile?.phone || details?.phone} icon={FaPhone} />
                  <Info label="Address" value={address || "--"} icon={FaMapMarkerAlt} />
                  <Info label="Bank Name" value={details?.bankDetails?.bankName || "--"} icon={FaUniversity} />
                  <Info label="Account Holder" value={details?.bankDetails?.accountHolderName || "--"} icon={FaUniversity} />
                  {isInvestorView ? <Info label="Total Invested" value={INR(totalInvested)} icon={FaMoneyBillWave} /> : null}
                  {isInvestorView ? <Info label="Active Investments" value={activeInvestments} icon={FaReceipt} /> : null}
                </div>
              </Card>
              <div className="space-y-6">
                <Card className="p-6">
                  <SectionTitle
                    icon={FaShieldAlt}
                    title="Verification Snapshot"
                    subtitle={isInvestorView ? "Live investor verification state." : "Live fundraiser verification state."}
                  />
                  <div className="mt-5 space-y-3">
                    <StatusRow label="KYC Status" value={isInvestorView ? investorAccess.kycStatus : fundraiserAccess.kycStatus} />
                    {isInvestorView ? null : <StatusRow label="PAN Status" value={fundraiserAccess.panStatus} />}
                    <StatusRow label="Bank Status" value={isInvestorView ? investorAccess.bankStatus : fundraiserAccess.bankStatus} />
                    {isInvestorView ? null : <StatusRow label="Company Status" value={fundraiserAccess.companyStatus} />}
                  </div>
                </Card>
                <Card className="p-6">
                  <SectionTitle
                    icon={FaMoneyBillWave}
                    title={isInvestorView ? "Portfolio Summary" : "Campaign Summary"}
                    subtitle={isInvestorView ? "Quick investor portfolio and transaction numbers." : "Quick fundraiser numbers."}
                  />
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {isInvestorView ? (
                      <>
                        <Metric label="Investments" value={investments.length} />
                        <Metric label="Portfolio Value" value={INR(estimatedCurrentValue)} />
                        <Metric label="Active" value={activeInvestments} />
                        <Metric label="Transactions" value={transactions.length} />
                      </>
                    ) : (
                      <>
                        <Metric label="Approved" value={counts.approved} />
                        <Metric label="Pending" value={counts.pending} />
                        <Metric label="Rejected" value={counts.rejected} />
                        <Metric label="Transactions" value={transactions.length} />
                      </>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "access" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Card className="p-6">
                <SectionTitle
                  icon={FaUserTie}
                  title="Profile Access"
                  subtitle={isInvestorView ? "Investor-specific access configuration." : "Fundraiser-specific access configuration."}
                />
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Info label={isInvestorView ? "Investor Enabled" : "Fundraiser Enabled"} value={isInvestorView ? investorAccess.enabled ? "Yes" : "No" : fundraiserAccess.enabled ? "Yes" : "No"} />
                  <Info label="Profile Type" value={pretty(isInvestorView ? investorAccess.type : fundraiserAccess.type)} />
                  <Info label="Active Mode" value={pretty(details?.activeMode || "none")} />
                  <Info label="Account Role" value={pretty(details?.role || "user")} />
                </div>
              </Card>
              <Card className="p-6">
                <SectionTitle
                  icon={FaShieldAlt}
                  title="Access Review"
                  subtitle={isInvestorView ? "Approval states tied to investor documents." : "Approval states tied to fundraiser documents."}
                />
                <div className="mt-5 space-y-3">
                  <StatusRow label="KYC" value={isInvestorView ? investorAccess.kycStatus : fundraiserAccess.kycStatus} />
                  {isInvestorView ? null : <StatusRow label="PAN" value={fundraiserAccess.panStatus} />}
                  <StatusRow label="Bank" value={isInvestorView ? investorAccess.bankStatus : fundraiserAccess.bankStatus} />
                  {isInvestorView ? null : <StatusRow label="Company" value={fundraiserAccess.companyStatus} />}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {isInvestorView ? (
                  <>
                    <Info label="Total Investments" value={investments.length} />
                    <Info label="Total Invested" value={INR(totalInvested)} />
                    <Info label="Active Investments" value={activeInvestments} />
                    <Info label="Investor Transactions" value={transactions.length} />
                  </>
                ) : (
                  <>
                    <Info label="Total Campaigns" value={campaigns.length} />
                    <Info label="Approved Campaigns" value={counts.approved} />
                    <Info label="Pending Campaigns" value={counts.pending} />
                    <Info label="Rejected Campaigns" value={counts.rejected} />
                  </>
                )}
              </div>
              <Card className="p-6">
                <SectionTitle
                  icon={FaFolderOpen}
                  title={isInvestorView ? "Investor Activity" : "Fundraiser Activity"}
                  subtitle={isInvestorView ? "See where and how much money this investor has invested." : "Campaign creation and status activity timeline."}
                />
                <div className="mt-5 space-y-3">
                  {isInvestorView ? (
                    investments.length > 0 ? investments.map((investment) => {
                      const campaign = investment?.campaign || {};
                      return (
                        <div key={investment?._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{campaign?.projectTitle || "Campaign"}</p>
                            <p className="text-sm text-slate-500">Invested {INR(investment?.amount || 0)} in {pretty(campaign?.projectCategory || "general")}</p>
                            <p className="mt-1 text-xs text-slate-400">{formatDate(investment?.createdAt)}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-sm font-bold text-slate-900">{INR(investment?.amount || 0)}</p>
                            <span className={cn("mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold", tone(investment?.paymentStatus || investment?.status))}>
                              {investment?.paymentStatus || investment?.status || "pending"}
                            </span>
                          </div>
                        </div>
                      );
                    }) : <Empty text="No investor activity is available for this user yet." />
                  ) : (
                    campaigns.length > 0 ? campaigns.map((campaign) => (
                      <div key={campaign?._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{campaign?.projectTitle || "Campaign"}</p>
                          <p className="text-sm text-slate-500">{pretty(campaign?.status || "pending")} campaign update</p>
                          <p className="mt-1 text-xs text-slate-400">{formatDate(campaign?.createdAt)}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-bold text-slate-900">{INR(campaign?.moneyRaised || campaign?.currentFunding || 0)}</p>
                          <span className={cn("mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold", tone(campaign?.status))}>{campaign?.status || "pending"}</span>
                        </div>
                      </div>
                    )) : <Empty text="No fundraiser activity available for this user yet." />
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "campaigns" && (
            <div className="space-y-4">
              {isInvestorView ? (
                investments.length > 0 ? investments.map((investment) => {
                  const campaign = investment?.campaign || {};
                  const goal = Number(campaign?.fundingGoal || campaign?.moneyToRaise || 0);
                  const raised = Number(campaign?.currentFunding || campaign?.moneyRaised || 0);
                  const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
                  const expectedReturn = Math.round(
                    (Number(investment?.amount || 0) * Number(campaign?.profitPercentage || 0)) / 100
                  );
                  const gallery = campaignGallery({
                    documents: {
                      photo: campaign?.photo,
                      projectPhotos: campaign?.projectPhotos || [],
                    },
                  });

                  return (
                    <Card key={investment?._id} className="overflow-hidden">
                      <div className="p-5">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-3 flex flex-wrap gap-2">
                              <Tag text={campaign?.status || "pending"} className={tone(campaign?.status)} />
                              <Tag text={pretty(campaign?.projectCategory || "general")} />
                              <Tag text={formatDate(investment?.createdAt)} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{campaign?.projectTitle || "Campaign"}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{campaign?.projectOverview || "No campaign overview available."}</p>
                            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                              <Metric label="Invested" value={INR(investment?.amount || 0)} />
                              <Metric label="Current Raise" value={INR(raised)} />
                              <Metric label="Expected Return" value={expectedReturn > 0 ? INR(expectedReturn) : "N/A"} />
                              <Metric label="Payment Status" value={investment?.paymentStatus || "--"} />
                            </div>
                            <div className="mt-4">
                              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500"><span>Campaign progress</span><span>{progress.toFixed(0)}%</span></div>
                              <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500" style={{ width: `${progress}%` }} /></div>
                            </div>
                          </div>
                          <div className="grid min-w-[220px] grid-cols-2 gap-3 lg:grid-cols-1">
                            <Metric label="Goal" value={INR(goal)} />
                            <Metric label="Funding Type" value={campaign?.fundingType || "--"} />
                            <Metric label="Transfer Status" value={investment?.transferStatus || "--"} />
                            <Metric label="Order ID" value={investment?.orderId || "--"} />
                          </div>
                        </div>
                        <div className="mt-5">
                          <Media title="Campaign Media" items={gallery} emptyText="No campaign media available." />
                        </div>
                      </div>
                    </Card>
                  );
                }) : <Empty text="No investor campaign details found for this user yet." />
              ) : (
                campaigns.length > 0 ? campaigns.map((campaign) => {
                  const goal = Number(campaign?.fundingGoal || campaign?.moneyToRaise || 0);
                  const raised = Number(campaign?.moneyRaised || campaign?.currentFunding || 0);
                  const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
                  const docs = campaignDocs(campaign);
                  const gallery = campaignGallery(campaign);
                  const expanded = expandedCampaign === campaign?._id;
                  return (
                    <Card key={campaign?._id} className="overflow-hidden">
                      <div className="p-5">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-3 flex flex-wrap gap-2">
                              <Tag text={campaign?.status || "pending"} className={tone(campaign?.status)} />
                              <Tag text={pretty(campaign?.projectCategory || "general")} />
                              <Tag text={formatDate(campaign?.createdAt)} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{campaign?.projectTitle || "Campaign"}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{campaign?.projectOverview || "No project overview available."}</p>
                            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                              <Metric label="Goal" value={INR(goal)} />
                              <Metric label="Raised" value={INR(raised)} />
                              <Metric label="Funding Type" value={campaign?.fundingType || "--"} />
                              <Metric label="Documents" value={docs.length} />
                            </div>
                            <div className="mt-4">
                              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500"><span>Funding progress</span><span>{progress.toFixed(0)}%</span></div>
                              <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500" style={{ width: `${progress}%` }} /></div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 lg:justify-end">
                            <SmallButton label={expanded ? "Hide Details" : "View Details"} onClick={() => setExpandedCampaign(expanded ? null : campaign?._id)} />
                            <SmallButton label="Approve" tone="success" onClick={() => handleCampaignAction(campaign?._id, "approve")} loading={campaignLoading[`${campaign?._id}-approve`]} />
                            <SmallButton label="Reject" tone="danger" onClick={() => handleCampaignAction(campaign?._id, "reject")} loading={campaignLoading[`${campaign?._id}-reject`]} />
                            <SmallButton label="Delete" tone="dark" onClick={() => handleCampaignAction(campaign?._id, "delete")} loading={campaignLoading[`${campaign?._id}-delete`]} />
                          </div>
                        </div>
                      </div>
                      {expanded && (
                        <div className="border-t border-slate-200 bg-slate-50/70 p-5">
                          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            <div className="space-y-4">
                              <Info label="Category" value={pretty(campaign?.projectCategory || "--")} />
                              <Info label="Funding Type" value={campaign?.fundingType || "--"} />
                              <Info label="Created On" value={formatDate(campaign?.createdAt)} />
                              <Info label="Deadline" value={formatDate(campaign?.deadline)} />
                            </div>
                            <div className="space-y-4">
                              <Media title="Campaign Gallery" items={gallery} emptyText="No campaign images uploaded." />
                              <Media title="Attached Campaign Documents" items={docs} emptyText="No campaign documents uploaded." />
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                }) : <Empty text="No campaigns have been created by this fundraiser yet." />
              )}
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Info label="Total Transactions" value={transactions.length} />
                <Info label={isInvestorView ? "Total Invested via Transactions" : "Total Raised via Transactions"} value={INR(transactionRaised)} />
                <Info label="Completed" value={completedTransactions} />
                <Info label="Pending / Failed" value={`${pendingTransactions} / ${failedTransactions}`} />
              </div>

              <Card className="p-6">
                <SectionTitle
                  icon={FaReceipt}
                  title={isInvestorView ? "Investor Transactions" : "Fundraiser Transactions"}
                  subtitle={isInvestorView ? "Full investment transaction history showing where money was invested and whether payment was completed or not." : "Full transaction history showing raised amount and whether each payment was completed or not."}
                />
                <div className="mt-5 space-y-4">
                  {transactions.length > 0 ? transactions.map((txn) => (
                    <div key={txn?._id || txn?.transactionId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap gap-2">
                            <Tag text={txn?.status || "pending"} className={tone(txn?.status)} />
                            <Tag text={pretty(txn?.type || "investment")} />
                            <Tag text={pretty(txn?.paymentMethod || "razorpay")} />
                            <Tag text={formatDate(txn?.createdAt)} />
                          </div>

                          <h3 className="text-lg font-bold text-slate-900">
                            {txn?.campaign?.title || "Unknown Campaign"}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {txn?.description || "Fundraiser transaction record"}
                          </p>

                          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                            <Info label="Transaction ID" value={txn?.transactionId || "--"} />
                            <Info label={isInvestorView ? "Fundraiser" : "Investor"} value={isInvestorView ? txn?.fundraiser?.name || "--" : txn?.investor?.name || "--"} />
                            <Info label={isInvestorView ? "Fundraiser Email" : "Investor Email"} value={isInvestorView ? txn?.fundraiser?.email || "--" : txn?.investor?.email || "--"} />
                            <Info label="Order ID" value={txn?.orderId || "--"} />
                            <Info label="Gateway Payment ID" value={txn?.paymentGatewayId || "--"} />
                            <Info label="Transfer ID" value={txn?.transferId || "--"} />
                          </div>

                          {txn?.failureReason ? (
                            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                              Failure reason: {txn.failureReason}
                            </div>
                          ) : null}
                        </div>

                        <div className="grid min-w-[220px] grid-cols-2 gap-3 lg:grid-cols-1">
                          <Metric label={isInvestorView ? "Invested Amount" : "Raised Amount"} value={INR(txn?.amount || 0)} />
                          <Metric label="Platform Fee" value={INR(txn?.fee || 0)} />
                          <Metric label="Net Amount" value={INR(txn?.netAmount || 0)} />
                          <Metric label="Processed On" value={formatDate(txn?.processedAt)} />
                        </div>
                      </div>
                    </div>
                  )) : <Empty text={isInvestorView ? "No investor transactions found for this user yet." : "No fundraiser transactions found for this user yet."} />}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "kyc" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-6">
                <Card className="p-6">
                  <SectionTitle
                    icon={FaShieldAlt}
                    title="KYC Details"
                    subtitle={isInvestorView ? "Investor KYC details fetched from the backend." : "Fundraiser KYC details fetched from the backend."}
                  />
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Info label="Aadhaar Number" value={isInvestorView ? investorAccess.details?.aadhaarNumber || "--" : fundraiserAccess.details?.aadhaarNumber || "--"} icon={FaIdCard} />
                    <Info label="PAN Number" value={isInvestorView ? investorAccess.details?.panNumber || "--" : fundraiserAccess.details?.panNumber || "--"} icon={FaIdCard} />
                    <Info label="Address Proof Type" value={isInvestorView ? investorAccess.details?.addressProofType || "--" : fundraiserAccess.details?.addressProofType || "--"} icon={FaMapMarkerAlt} />
                    <Info label="Bank Account Number" value={details?.bankDetails?.accountNumber || "--"} icon={FaUniversity} />
                    <Info label="IFSC Code" value={details?.bankDetails?.ifscCode || "--"} icon={FaUniversity} />
                    <Info label="Branch Name" value={details?.bankDetails?.branchName || "--"} icon={FaUniversity} />
                  </div>
                </Card>
                <Card className="p-6">
                  <SectionTitle
                    icon={FaShieldAlt}
                    title="Live Status Controls"
                    subtitle={isInvestorView ? "Update investor KYC and bank statuses in real time." : "Update fundraiser KYC statuses in real time."}
                  />
                  <div className="mt-5 space-y-4">
                    <Approve label="KYC Status" value={isInvestorView ? investorAccess.kycStatus : fundraiserAccess.kycStatus} disabled={isInvestorView ? !investorAccess.documents?.kyc && !investorAccess.documents?.pan && !investorAccess.documents?.addressProof : !fundraiserAccess.documents?.kyc} loading={Object.keys(statusLoading).some((key) => key.startsWith("kyc-"))} onPick={(status) => handleStatusUpdate("kyc", "kycStatus", status)} />
                    {isInvestorView ? null : <Approve label="PAN Status" value={fundraiserAccess.panStatus} disabled={!fundraiserAccess.documents?.pan} loading={Object.keys(statusLoading).some((key) => key.startsWith("pan-"))} onPick={(status) => handleStatusUpdate("pan", "panStatus", status)} />}
                    <Approve label="Bank Status" value={isInvestorView ? investorAccess.bankStatus : fundraiserAccess.bankStatus} disabled={isInvestorView ? !investorAccess.documents?.bankProof : !fundraiserAccess.documents?.bankProof} loading={Object.keys(statusLoading).some((key) => key.startsWith("bank-"))} onPick={(status) => handleStatusUpdate("bank", "bankStatus", status)} />
                    {isInvestorView ? null : <Approve label="Company Status" value={fundraiserAccess.companyStatus} disabled={!fundraiserAccess.documents?.gst && !fundraiserAccess.documents?.license && !fundraiserAccess.documents?.incorporation} loading={Object.keys(statusLoading).some((key) => key.startsWith("company-"))} onPick={(status) => handleStatusUpdate("company", "companyStatus", status)} />}
                  </div>
                </Card>
              </div>
              <Card className="p-6">
                <SectionTitle
                  icon={FaFileAlt}
                  title={isInvestorView ? "Investor Documents" : "Fundraiser Documents"}
                  subtitle="All user documents are listed here and can be viewed."
                />
                <div className="mt-5 space-y-4">
                  {userDocs.length > 0 ? userDocs.map((doc) => <Doc key={`${doc.title}-${doc.url}`} title={doc.title} url={doc.url} status={doc.status} />) : <Empty text={isInvestorView ? "No investor KYC documents have been uploaded." : "No fundraiser KYC documents have been uploaded."} />}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </>
  );
}

function Card({ className, children }) { return <div className={cn("rounded-[28px] border border-slate-200 bg-white shadow-sm", className)}>{children}</div>; }
function SectionTitle({ icon: Icon, title, subtitle }) { return <div className="flex items-start gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sky-700"><Icon /></div><div><h2 className="text-lg font-bold text-slate-900">{title}</h2><p className="text-sm text-slate-500">{subtitle}</p></div></div>; }
function HeroInfo({ icon: Icon, label, value }) { return <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3"><div className="mt-0.5 text-sky-200"><Icon /></div><div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">{label}</p><p className="mt-1 break-all text-sm font-medium text-white">{value || "--"}</p></div></div>; }
function Stat({ title, value, accent }) { return <Card className="overflow-hidden"><div className={cn("h-1.5 bg-gradient-to-r", accent)} /><div className="p-4"><p className="text-sm font-medium text-slate-500">{title}</p><h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3></div></Card>; }
function Info({ label, value, icon: Icon }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start gap-3">{Icon ? <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-500"><Icon /></div> : null}<div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 break-words text-sm font-semibold text-slate-900">{value || "--"}</p></div></div></div>; }
function Metric({ label, value }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm font-bold text-slate-900">{value}</p></div>; }
function Tag({ text, className }) { return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold", className || "border-slate-200 bg-slate-50 text-slate-700")}>{text}</span>; }
function StatusRow({ label, value }) { return <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="text-sm font-medium text-slate-600">{label}</span><span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold", tone(value))}>{value || "NONE"}</span></div>; }
function SmallButton({ label, onClick, loading, tone: variant = "default" }) { const styles = { default: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50", success: "bg-emerald-600 text-white hover:bg-emerald-700", danger: "bg-rose-600 text-white hover:bg-rose-700", dark: "bg-slate-900 text-white hover:bg-slate-800" }; return <button onClick={onClick} disabled={loading} className={cn("rounded-xl px-3.5 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60", styles[variant])}>{loading ? "Please wait..." : label}</button>; }
function Approve({ label, value, disabled, loading, onPick }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-900">{label}</p><span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold", tone(value))}>{value || "NONE"}</span></div><div className="mt-4 flex flex-wrap gap-2">{STATUS_OPTIONS.map((status) => <button key={status} onClick={() => onPick(status)} disabled={disabled || loading} className={cn("rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition", value === status ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50", (disabled || loading) && "cursor-not-allowed opacity-60")}>{status}</button>)}</div>{disabled ? <p className="mt-3 text-xs text-amber-600">No matching document uploaded for this status yet.</p> : null}</div>; }
function Media({ title, items, emptyText }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm font-semibold text-slate-900">{title}</p>{items.length > 0 ? <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">{items.map((item) => { const url = normalizeUrl(item.url); const isImage = isImageFile(url); return <a key={`${item.label}-${url}`} href={url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">{isImage ? <img src={url} alt={item.label} className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : <div className="grid h-40 place-items-center bg-slate-100 text-slate-400"><FaFileAlt className="text-3xl" /></div>}<div className="border-t border-slate-200 px-3 py-2"><p className="truncate text-xs font-medium text-slate-700">{item.label}</p></div></a>; })}</div> : <p className="mt-3 text-sm text-slate-500">{emptyText}</p>}</div>; }
function Doc({ title, url, status }) { const href = normalizeUrl(url); const image = isImageFile(href); return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"><div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"><div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{title}</p><p className="mt-1 break-all text-xs text-slate-500">{href}</p><span className={cn("mt-3 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold", tone(status))}>{status || "NONE"}</span></div><a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"><FaEye />View Document</a></div>{image ? <div className="border-t border-slate-200 bg-white p-4"><img src={href} alt={title} className="max-h-72 w-full rounded-2xl bg-slate-100 object-contain" /></div> : null}</div>; }
function Empty({ text }) { return <Card className="border-dashed bg-slate-50 p-6 text-sm text-slate-500">{text}</Card>; }
