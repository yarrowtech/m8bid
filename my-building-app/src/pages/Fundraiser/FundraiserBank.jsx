import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Landmark, User, CreditCard, FileText, Upload } from "lucide-react";
import FundraiserSidebar from "./FundraiserSidebar";

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-sky-400">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500">
          <Icon size={16} />
        </div>
        {children}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[55%] text-right text-sm font-semibold text-slate-900">
        {value || "—"}
      </span>
    </div>
  );
}

export default function FundraiserBank() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    accountHolderName: user?.bankDetails?.accountHolderName || "",
    bankName: user?.bankDetails?.bankName || "",
    accountNumber: user?.bankDetails?.accountNumber || "",
    ifscCode: user?.bankDetails?.ifscCode || "",
    branchName: user?.bankDetails?.branchName || "",
    bankProof: null,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setSaved(false);

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      bankDetails: {
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        branchName: formData.branchName,
        proofName: formData.bankProof?.name || user?.bankDetails?.proofName || "",
      },
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setSaved(true);
  };

  const maskAccountNumber = (num) => {
    if (!num) return "Not added";
    return `XXXXXX${String(num).slice(-4)}`;
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
              <button
                onClick={() => navigate("/fundraiser/profile")}
                className="mb-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Back to Profile
              </button>

              <h1 className="text-3xl font-bold text-slate-900">Bank Account</h1>
              <p className="mt-1 text-sm text-slate-500">
                Add payout details for withdrawals and campaign fund transfers.
              </p>
            </div>

            <button
              onClick={handleSave}
              className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Save Bank Details
            </button>
          </div>

          {saved ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              Bank details saved successfully.
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <Landmark size={18} />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Bank Details Form
                </h2>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field label="Account Holder Name" icon={User}>
                  <input
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    placeholder="Enter account holder name"
                    className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </Field>

                <Field label="Bank Name" icon={Landmark}>
                  <input
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="Enter bank name"
                    className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </Field>

                <Field label="Account Number" icon={CreditCard}>
                  <input
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    placeholder="Enter account number"
                    className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </Field>

                <Field label="IFSC Code" icon={FileText}>
                  <input
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    placeholder="Enter IFSC code"
                    className="w-full bg-transparent text-sm font-medium uppercase text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Branch Name" icon={Landmark}>
                    <input
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleChange}
                      placeholder="Enter branch name"
                      className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Bank Proof
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-sky-400 hover:bg-sky-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-700">
                      <Upload size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {formData.bankProof?.name ||
                          user?.bankDetails?.proofName ||
                          "Upload bank proof"}
                      </p>
                      <p className="text-xs text-slate-500">
                        JPG, PNG or PDF supported
                      </p>
                    </div>

                    <input
                      type="file"
                      name="bankProof"
                      onChange={handleChange}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Bank Summary</h3>

                <div className="mt-4 space-y-3">
                  <SummaryRow
                    label="Account Holder"
                    value={formData.accountHolderName}
                  />
                  <SummaryRow label="Bank Name" value={formData.bankName} />
                  <SummaryRow
                    label="Account Number"
                    value={maskAccountNumber(formData.accountNumber)}
                  />
                  <SummaryRow label="IFSC Code" value={formData.ifscCode} />
                  <SummaryRow label="Branch Name" value={formData.branchName} />
                  <SummaryRow
                    label="Proof File"
                    value={
                      formData.bankProof?.name ||
                      user?.bankDetails?.proofName ||
                      "Not uploaded"
                    }
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>

                <div className="mt-4 space-y-3">
                  <button
                    onClick={handleSave}
                    className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                  >
                    Save Bank Details
                  </button>

                  <button
                    onClick={() => navigate("/fundraiser/profile")}
                    className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Back to Profile
                  </button>

                  <button
                    onClick={() => navigate("/fundraiser/profile/kyc")}
                    className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Go to KYC Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}