import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Landmark,
  FileText,
  ShieldCheck,
  Eye,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import InvestorSidebar from "./InvestorSidebar";
import { getInvestorProfile } from "../../api/investor.api";

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1edff] text-[#6f5cf2]">
          <Icon size={18} />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-start gap-3">
        {Icon ? (
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500">
            <Icon size={16} />
          </div>
        ) : null}

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-semibold text-slate-900">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ value, type = "default" }) {
  let tone = "bg-slate-100 text-slate-700";

  if (type === "kyc") {
    const v = String(value || "").toLowerCase();
    if (v.includes("approved") || v.includes("verified")) {
      tone = "bg-emerald-100 text-emerald-700";
    } else if (v.includes("rejected")) {
      tone = "bg-rose-100 text-rose-700";
    } else {
      tone = "bg-amber-100 text-amber-700";
    }
  }

  if (type === "bank") {
    const v = String(value || "").toLowerCase();
    if (v.includes("linked") || v.includes("verified")) {
      tone = "bg-emerald-100 text-emerald-700";
    } else {
      tone = "bg-amber-100 text-amber-700";
    }
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      {value || "—"}
    </span>
  );
}

const normalizeStatus = (value, fallbackPending = false) => {
  const v = String(value || "").toUpperCase();

  if (v === "VERIFIED") return "Verified";
  if (v === "REJECTED") return "Rejected";
  if (v === "PENDING") return "Pending Review";
  if (v === "NONE") return fallbackPending ? "Pending Review" : "Not Linked";

  return value || "—";
};

export default function InvestorProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const userData = await getInvestorProfile();
      setProfile(userData || {});
    } catch (err) {
      setError(err?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const userData = await getInvestorProfile();
      setProfile(userData || {});
    } catch (err) {
      setError(err?.message || "Failed to refresh profile");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // Refetch whenever the page comes into focus
    const handleFocus = () => {
      fetchProfile();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const profileData = useMemo(() => {
    const fullAddress = profile?.profile?.addressLine
      ? `${profile.profile.addressLine}${
          profile?.profile?.city ? `, ${profile.profile.city}` : ""
        }${profile?.profile?.state ? `, ${profile.profile.state}` : ""}${
          profile?.profile?.pincode ? ` - ${profile.profile.pincode}` : ""
        }`
      : "Not Added";

    const kycStatusRaw = profile?.access?.investor?.kycStatus || "NONE";
    const bankStatusRaw = profile?.access?.investor?.bankStatus || "NONE";

    return {
      fullName: profile?.name || "—",
      email: profile?.email || "—",
      phone: profile?.profile?.phone || "—",
      address: fullAddress,

      kycStatus: normalizeStatus(kycStatusRaw, true),
      aadhaarNumber:
        profile?.access?.investor?.details?.aadhaarNumber || "Not Added",
      panNumber: profile?.access?.investor?.details?.panNumber || "Not Added",
      addressProofType:
        profile?.access?.investor?.details?.addressProofType || "Not Added",

      aadhaarFile: profile?.access?.investor?.documents?.kyc || "",
      panFile: profile?.access?.investor?.documents?.pan || "",
      addressProofFile: profile?.access?.investor?.documents?.addressProof || "",
      bankProofFile: profile?.access?.investor?.documents?.bankProof || "",

      bankStatus: profile?.bankDetails?.accountNumber
        ? "Linked"
        : String(bankStatusRaw).toUpperCase() === "VERIFIED"
        ? "Linked"
        : normalizeStatus(bankStatusRaw, false),

      bankName: profile?.bankDetails?.bankName || "Not Added",
      accountHolder: profile?.bankDetails?.accountHolderName || "Not Added",
      accountNumber: profile?.bankDetails?.accountNumber
        ? `XXXXXX${String(profile.bankDetails.accountNumber).slice(-4)}`
        : "Not Added",
      ifsc: profile?.bankDetails?.ifscCode || "Not Added",
      branchName: profile?.bankDetails?.branchName || "Not Added",
    };
  }, [profile]);

  if (loading) {
    return (
      <div
        className="h-screen w-full bg-[#e3e8f0] text-slate-900"
        style={{
          fontFamily:
            "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        }}
      >
        <div className="flex h-screen w-full overflow-hidden bg-[#f7f7fb]">
          <InvestorSidebar active="profile" />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#6f5cf2]" />
              <span className="text-slate-600">Loading profile...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="h-screen w-full bg-[#e3e8f0] text-slate-900"
        style={{
          fontFamily:
            "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        }}
      >
        <div className="flex h-screen w-full overflow-hidden bg-[#f7f7fb]">
          <InvestorSidebar active="profile" />
          <main className="flex-1 flex items-center justify-center px-6 py-6">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 max-w-md">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">Error Loading Profile</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full bg-[#e3e8f0] text-slate-900"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7fb]">
        <InvestorSidebar active="profile" />

        <main
          className="scrollbar-hide flex-1 overflow-y-auto px-6 py-6"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Investor Profile
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                View your personal details, KYC details and bank details.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={() => navigate("/investor/profile/kyc")}
                className="rounded-2xl bg-[#6f5cf2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5f4ae6]"
              >
                Edit KYC Details
              </button>
              <button
                onClick={() => navigate("/investor/profile/bank")}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Edit Bank Details
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            <div className="space-y-4 xl:col-span-2">
              <SectionCard title="Person Details" icon={User}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Full Name"
                    value={profileData.fullName}
                    icon={User}
                  />
                  <Field
                    label="Email Address"
                    value={profileData.email}
                    icon={Mail}
                  />
                  <Field
                    label="Phone Number"
                    value={profileData.phone}
                    icon={Phone}
                  />
                  <Field
                    label="Address"
                    value={profileData.address}
                    icon={MapPin}
                  />
                </div>
              </SectionCard>

              <SectionCard title="KYC Details" icon={ShieldCheck}>
                <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-600">
                    KYC Status
                  </span>
                  <StatusBadge value={profileData.kycStatus} type="kyc" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Aadhaar Number"
                    value={profileData.aadhaarNumber}
                    icon={FileText}
                  />
                  <Field
                    label="PAN Number"
                    value={profileData.panNumber}
                    icon={FileText}
                  />
                  <Field
                    label="Address Proof Type"
                    value={profileData.addressProofType}
                    icon={FileText}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Bank Details" icon={Landmark}>
                <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-600">
                    Bank Status
                  </span>
                  <StatusBadge value={profileData.bankStatus} type="bank" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Bank Name"
                    value={profileData.bankName}
                    icon={Landmark}
                  />
                  <Field
                    label="Account Holder Name"
                    value={profileData.accountHolder}
                    icon={User}
                  />
                  <Field
                    label="Account Number"
                    value={profileData.accountNumber}
                    icon={Landmark}
                  />
                  <Field
                    label="IFSC Code"
                    value={profileData.ifsc}
                    icon={FileText}
                  />
                  <Field
                    label="Branch Name"
                    value={profileData.branchName}
                    icon={Landmark}
                  />
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-base font-semibold text-slate-900">
                      Uploaded Documents
                    </h3>

                    <div className="mt-4 space-y-3">
                      <Field
                        label="Aadhaar / ID Proof"
                        value={profileData.aadhaarFile ? "Uploaded" : "Not uploaded"}
                      />
                      {profileData.aadhaarFile ? (
                        <a
                          href={profileData.aadhaarFile}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl bg-[#f1edff] px-4 py-3 text-sm font-semibold text-[#6f5cf2] transition hover:bg-[#e7e0ff]"
                        >
                          <Eye size={14} />
                          View Aadhaar / ID Proof
                        </a>
                      ) : null}

                      <Field
                        label="PAN Document"
                        value={profileData.panFile ? "Uploaded" : "Not uploaded"}
                      />
                      {profileData.panFile ? (
                        <a
                          href={profileData.panFile}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl bg-[#f1edff] px-4 py-3 text-sm font-semibold text-[#6f5cf2] transition hover:bg-[#e7e0ff]"
                        >
                          <Eye size={14} />
                          View PAN Document
                        </a>
                      ) : null}

                      <Field
                        label="Address Proof"
                        value={profileData.addressProofFile ? "Uploaded" : "Not uploaded"}
                      />
                      {profileData.addressProofFile ? (
                        <a
                          href={profileData.addressProofFile}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl bg-[#f1edff] px-4 py-3 text-sm font-semibold text-[#6f5cf2] transition hover:bg-[#e7e0ff]"
                        >
                          <Eye size={14} />
                          View Address Proof
                        </a>
                      ) : null}

                      <Field
                        label="Bank Proof"
                        value={profileData.bankProofFile ? "Uploaded" : "Not uploaded"}
                      />
                      {profileData.bankProofFile ? (
                        <a
                          href={profileData.bankProofFile}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl bg-[#f1edff] px-4 py-3 text-sm font-semibold text-[#6f5cf2] transition hover:bg-[#e7e0ff]"
                        >
                          <Eye size={14} />
                          View Bank Proof
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Profile Status
                </h3>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-600">KYC</span>
                    <StatusBadge value={profileData.kycStatus} type="kyc" />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-600">Bank</span>
                    <StatusBadge value={profileData.bankStatus} type="bank" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
