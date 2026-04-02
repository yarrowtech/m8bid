import React from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  BadgeCheck,
  Landmark,
  FileText,
  ShieldCheck,
} from "lucide-react";
import FundraiserSidebar from "./FundraiserSidebar";

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

export default function FundraiserProfile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const profileData = {
    fullName: user?.name || "Raktim Maity",
    email: user?.email || "raktim@example.com",
    phone: user?.phone || "+91 9876543210",
    address:
      user?.addressLine
        ? `${user.addressLine}${user.city ? `, ${user.city}` : ""}${
            user.state ? `, ${user.state}` : ""
          }${user.pincode ? ` - ${user.pincode}` : ""}`
        : "Salt Lake, Kolkata, West Bengal, India",

    kycStatus: user?.kycStatus || "Pending Review",
    aadhaarNumber: user?.aadhaarNumber || "Not Added",
    panNumber: user?.panNumber || "Not Added",
    addressProofType: user?.addressProofType || "Not Added",

    bankStatus: user?.bankDetails?.accountNumber ? "Linked" : "Not Linked",
    bankName: user?.bankDetails?.bankName || "Not Added",
    accountHolder: user?.bankDetails?.accountHolderName || "Not Added",
    accountNumber: user?.bankDetails?.accountNumber
      ? `XXXXXX${String(user.bankDetails.accountNumber).slice(-4)}`
      : "Not Added",
    ifsc: user?.bankDetails?.ifscCode || "Not Added",
  };

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

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            <div className="space-y-4 xl:col-span-2">
              <SectionCard title="Person Details" icon={User}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Full Name" value={profileData.fullName} icon={User} />
                  <Field label="Email Address" value={profileData.email} icon={Mail} />
                  <Field label="Phone Number" value={profileData.phone} icon={Phone} />
                  <Field label="Address" value={profileData.address} icon={MapPin} />
                </div>
              </SectionCard>

              <SectionCard title="KYC Details" icon={ShieldCheck}>
                <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-600">KYC Status</span>
                  <StatusBadge value={profileData.kycStatus} type="kyc" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Aadhaar Number" value={profileData.aadhaarNumber} icon={FileText} />
                  <Field label="PAN Number" value={profileData.panNumber} icon={FileText} />
                  <Field
                    label="Address Proof Type"
                    value={profileData.addressProofType}
                    icon={FileText}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Bank Details" icon={Landmark}>
                <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-600">Bank Status</span>
                  <StatusBadge value={profileData.bankStatus} type="bank" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Bank Name" value={profileData.bankName} icon={Landmark} />
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
                  <Field label="IFSC Code" value={profileData.ifsc} icon={FileText} />
                </div>
              </SectionCard>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>

                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => navigate("/fundraiser/profile/kyc")}
                    className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Edit KYC Details
                  </button>

                  <button
                    onClick={() => navigate("/fundraiser/profile/bank")}
                    className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Edit Bank Details
                  </button>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Profile Status</h3>

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