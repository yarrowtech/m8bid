import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Landmark,
  User,
  CreditCard,
  FileText,
  Upload,
  Save,
  Eye,
  Trash2,
} from "lucide-react";
import InvestorSidebar from "./InvestorSidebar";
import { getInvestorProfile, updateInvestorBank, deleteInvestorDocument } from "../../api/investor.api";

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#8d7bff]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500">
          <Icon size={16} />
        </div>
        {children}
      </div>
    </div>
  );
}

function FileField({
  label,
  fileName,
  onChange,
  name,
  existingUrl,
  onDelete,
  deleting = false,
  disableUpload = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="space-y-3">
        <label
          className={`flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition ${
            disableUpload ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:border-[#8d7bff] hover:bg-[#f1edff]"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#6f5cf2]">
            <Upload size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {fileName || "Upload file"}
            </p>
            <p className="text-xs text-slate-500">
              {disableUpload
                ? "Delete the existing document to upload a new file."
                : "JPG, PNG or PDF supported"}
            </p>
          </div>
          <input
            type="file"
            name={name}
            onChange={onChange}
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
            disabled={disableUpload}
          />
        </label>

        {existingUrl ? (
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={existingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#f1edff] px-3 py-2 text-sm font-semibold text-[#6f5cf2] transition hover:bg-[#e7e0ff]"
            >
              <Eye size={15} />
              View uploaded file
            </a>

            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={15} />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        ) : null}
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

export default function InvestorBank() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    bankProof: null,
  });

  const [existingBankProof, setExistingBankProof] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingProof, setDeletingProof] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const user = (await getInvestorProfile()) || {};

      setFormData((prev) => ({
        ...prev,
        accountHolderName: user?.bankDetails?.accountHolderName || "",
        bankName: user?.bankDetails?.bankName || "",
        accountNumber: user?.bankDetails?.accountNumber || "",
        ifscCode: user?.bankDetails?.ifscCode || "",
        branchName: user?.bankDetails?.branchName || "",
        bankProof: null,
      }));

      setExistingBankProof(
        user?.access?.investor?.documents?.bankProof || ""
      );
    } catch (error) {
      console.error("Failed to fetch bank profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setSaved(false);

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);

      const fd = new FormData();
      fd.append("accountHolderName", formData.accountHolderName);
      fd.append("bankName", formData.bankName);
      fd.append("accountNumber", formData.accountNumber);
      fd.append("ifscCode", formData.ifscCode);
      fd.append("branchName", formData.branchName);

      if (formData.bankProof) {
        fd.append("bankProof", formData.bankProof);
      }

      await updateInvestorBank(fd);
      await fetchProfile();

      setSaved(true);
    } catch (error) {
      console.error("Failed to update bank details:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBankProof = async () => {
    try {
      setDeletingProof(true);
      await deleteInvestorDocument("bankProof");
      await fetchProfile();
    } catch (error) {
      console.error("Failed to delete bank proof:", error);
    } finally {
      setDeletingProof(false);
    }
  };

  const maskAccountNumber = (num) => {
    if (!num) return "Not added";
    return `XXXXXX${String(num).slice(-4)}`;
  };

  const summary = useMemo(
    () => ({
      accountHolder: formData.accountHolderName || "—",
      bankName: formData.bankName || "—",
      accountNumber: maskAccountNumber(formData.accountNumber),
      ifscCode: formData.ifscCode || "—",
      branchName: formData.branchName || "—",
      proofFile: formData.bankProof?.name
        ? formData.bankProof.name
        : existingBankProof
        ? "Uploaded"
        : "Not uploaded",
    }),
    [formData, existingBankProof]
  );

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
              <button
                onClick={() => navigate("/investor/profile")}
                className="mb-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Back to Profile
              </button>

              <h1 className="text-3xl font-bold text-slate-900">
                Bank Account
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Add payout details for withdrawals and investment transfers.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="rounded-2xl bg-[#6f5cf2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5f4ae6] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Bank Details"}
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
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1edff] text-[#6f5cf2]">
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
                    placeholder="ENTER IFSC CODE"
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
                  <FileField
                    label="Bank Proof"
                    name="bankProof"
                    onChange={handleChange}
                    fileName={formData.bankProof?.name || "Upload bank proof"}
                    existingUrl={existingBankProof}
                    disableUpload={Boolean(existingBankProof)}
                    onDelete={handleDeleteBankProof}
                    deleting={deletingProof}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Bank Summary
                </h3>

                <div className="mt-4 space-y-3">
                  <SummaryRow
                    label="Account Holder"
                    value={summary.accountHolder}
                  />
                  <SummaryRow label="Bank Name" value={summary.bankName} />
                  <SummaryRow
                    label="Account Number"
                    value={summary.accountNumber}
                  />
                  <SummaryRow label="IFSC Code" value={summary.ifscCode} />
                  <SummaryRow label="Branch Name" value={summary.branchName} />
                  <SummaryRow label="Proof File" value={summary.proofFile} />
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Quick Actions
                </h3>

                <div className="mt-4 space-y-3">
                  <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="w-full rounded-2xl bg-[#6f5cf2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5f4ae6] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? "Saving..." : "Save Bank Details"}
                  </button>

                  <button
                    onClick={() => navigate("/investor/profile")}
                    className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Back to Profile
                  </button>

                  <button
                    onClick={() => navigate("/investor/profile/kyc")}
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
