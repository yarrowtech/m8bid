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
} from "lucide-react";
import FundraiserSidebar from "./FundraiserSidebar";
import { getFundraiserProfile } from "../../api/fundraiser.api";

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
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

export default function FundraiserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getFundraiserProfile();
      setUser(res?.data || null);
    } catch (err) {
      console.error("Failed to fetch fundraiser profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const profileData = useMemo(() => {
    const fullAddress = user?.profile?.addressLine
      ? `${user.profile.addressLine}${
          user?.profile?.city ? `, ${user.profile.city}` : ""
        }${user?.profile?.state ? `, ${user.profile.state}` : ""}${
          user?.profile?.pincode ? ` - ${user.profile.pincode}` : ""
        }`
      : "Not Added";

    const kycStatusRaw = user?.access?.fundraiser?.kycStatus || "NONE";
    const bankStatusRaw = user?.access?.fundraiser?.bankStatus || "NONE";

    return {
      fullName: user?.name || "—",
      email: user?.email || "—",
      phone: user?.profile?.phone || "—",
      address: fullAddress,

      kycStatus: normalizeStatus(kycStatusRaw, true),
      aadhaarNumber:
        user?.access?.fundraiser?.details?.aadhaarNumber || "Not Added",
      panNumber: user?.access?.fundraiser?.details?.panNumber || "Not Added",
      addressProofType:
        user?.access?.fundraiser?.details?.addressProofType || "Not Added",

      aadhaarFile: user?.access?.fundraiser?.documents?.kyc || "",
      panFile: user?.access?.fundraiser?.documents?.pan || "",
      addressProofFile: user?.access?.fundraiser?.documents?.addressProof || "",
      bankProofFile: user?.access?.fundraiser?.documents?.bankProof || "",

      bankStatus: user?.bankDetails?.accountNumber
        ? "Linked"
        : String(bankStatusRaw).toUpperCase() === "VERIFIED"
        ? "Linked"
        : normalizeStatus(bankStatusRaw, false),

      bankName: user?.bankDetails?.bankName || "Not Added",
      accountHolder: user?.bankDetails?.accountHolderName || "Not Added",
      accountNumber: user?.bankDetails?.accountNumber
        ? `XXXXXX${String(user.bankDetails.accountNumber).slice(-4)}`
        : "Not Added",
      ifsc: user?.bankDetails?.ifscCode || "Not Added",
      branchName: user?.bankDetails?.branchName || "Not Added",
    };
  }, [user]);

  return (
    <div
      className="h-screen w-full bg-[#e3e8f0] text-slate-900"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7fb]">
        <FundraiserSidebar active="profile" />

        <main
          className="scrollbar-hide flex-1 overflow-y-auto px-6 py-6"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Fundraiser Profile
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                View your personal details, KYC details and bank details.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/fundraiser/profile/kyc")}
                className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Edit KYC Details
              </button>
              <button
                onClick={() => navigate("/fundraiser/profile/bank")}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Edit Bank Details
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Loading profile details...
              </p>
            </div>
          ) : (
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
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
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
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
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
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
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
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
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
          )}
        </main>
      </div>
    </div>
  );
}