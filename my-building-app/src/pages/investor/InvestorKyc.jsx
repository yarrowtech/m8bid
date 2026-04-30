import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  FileCheck,
  CreditCard,
  MapPin,
  BadgeCheck,
  Upload,
  ShieldCheck,
  CalendarDays,
  Trash2,
  Eye,
} from "lucide-react";
import InvestorSidebar from "./InvestorSidebar";
import { getInvestorProfile, updateInvestorKYC, deleteInvestorDocument } from "../../api/investor.api";

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

function InputField({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  name,
  type = "text",
  readOnly = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#8d7bff]">
        {Icon ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500">
            <Icon size={16} />
          </div>
        ) : null}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 read-only:cursor-default"
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, name, options, icon: Icon }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#8d7bff]">
        {Icon ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500">
            <Icon size={16} />
          </div>
        ) : null}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

const statusToLabel = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "VERIFIED") return "Verified";
  if (s === "REJECTED") return "Rejected";
  if (s === "PENDING") return "Pending Review";
  if (s === "NONE") return "Pending Review";
  return status || "Pending Review";
};

export default function InvestorKyc() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    aadhaarNumber: "",
    panNumber: "",
    addressProofType: "aadhaar",
    pincode: "",
    addressLine: "",
    city: "",
    state: "",
    kycStatus: "Pending Review",
    identityProofFile: null,
    panCardFile: null,
    addressProofFile: null,
  });

  const [existingDocs, setExistingDocs] = useState({
    kyc: "",
    pan: "",
    addressProof: "",
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingType, setDeletingType] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const user = (await getInvestorProfile()) || {};

      setFormData((prev) => ({
        ...prev,
        fullName: user?.name || "",
        aadhaarNumber:
          user?.access?.investor?.details?.aadhaarNumber || "",
        panNumber: user?.access?.investor?.details?.panNumber || "",
        addressProofType:
          user?.access?.investor?.details?.addressProofType || "aadhaar",
        addressLine: user?.profile?.addressLine || "",
        city: user?.profile?.city || "",
        state: user?.profile?.state || "",
        pincode: user?.profile?.pincode || "",
        kycStatus: statusToLabel(user?.access?.investor?.kycStatus),
      }));

      setExistingDocs({
        kyc: user?.access?.investor?.documents?.kyc || "",
        pan: user?.access?.investor?.documents?.pan || "",
        addressProof: user?.access?.investor?.documents?.addressProof || "",
      });
    } catch (error) {
      console.error("Failed to fetch KYC profile:", error);
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

    if (files) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    try {
      setSaving(true);
      setSaved(false);

      const fd = new FormData();
      fd.append("aadhaarNumber", formData.aadhaarNumber);
      fd.append("panNumber", formData.panNumber);
      fd.append("addressProofType", formData.addressProofType);
      fd.append("addressLine", formData.addressLine);
      fd.append("city", formData.city);
      fd.append("state", formData.state);
      fd.append("pincode", formData.pincode);

      if (formData.identityProofFile) {
        fd.append("identityProofFile", formData.identityProofFile);
      }
      if (formData.panCardFile) {
        fd.append("panCardFile", formData.panCardFile);
      }
      if (formData.addressProofFile) {
        fd.append("addressProofFile", formData.addressProofFile);
      }

      await updateInvestorKYC(fd);
      await fetchProfile();

      setFormData((prev) => ({
        ...prev,
        kycStatus: "Pending Review",
        identityProofFile: null,
        panCardFile: null,
        addressProofFile: null,
      }));

      setSaved(true);
    } catch (error) {
      console.error("Failed to update KYC:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDoc = async (type) => {
    try {
      setDeletingType(type);
      await deleteInvestorDocument(type);
      await fetchProfile();
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
    } finally {
      setDeletingType("");
    }
  };

  const summary = useMemo(
    () => ({
      status: formData.kycStatus,
      aadhaar: formData.aadhaarNumber || "Not added",
      pan: formData.panNumber || "Not added",
      addressProof: formData.addressProofType || "Not added",
    }),
    [formData]
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
                Investor KYC & Documents
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Add identity, PAN, address proof for verification.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#6f5cf2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5f4ae6] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save KYC Details"}
            </button>
          </div>

          {saved ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              KYC details saved successfully.
            </div>
          ) : null}

          <form onSubmit={handleSave} className="mt-6 grid gap-4 xl:grid-cols-3">
            <div className="space-y-4 xl:col-span-2">
              <SectionCard title="Identity Details" icon={ShieldCheck}>
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    icon={User}
                    readOnly
                  />

                  <InputField
                    label="Aadhaar Number"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    placeholder="Enter Aadhaar number"
                    icon={CreditCard}
                  />

                  <InputField
                    label="PAN Card Number"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    placeholder="Enter PAN number"
                    icon={FileCheck}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Address Details" icon={MapPin}>
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField
                    label="Address Proof Type"
                    name="addressProofType"
                    value={formData.addressProofType}
                    onChange={handleChange}
                    icon={FileCheck}
                    options={[
                      { label: "Aadhaar", value: "aadhaar" },
                      { label: "Passport", value: "passport" },
                      { label: "Voter ID", value: "voter-id" },
                      { label: "Driving License", value: "driving-license" },
                      { label: "Utility Bill", value: "utility-bill" },
                    ]}
                  />

                  <InputField
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter pincode"
                    icon={MapPin}
                  />

                  <div className="md:col-span-2">
                    <InputField
                      label="Full Address"
                      name="addressLine"
                      value={formData.addressLine}
                      onChange={handleChange}
                      placeholder="Enter full address"
                      icon={MapPin}
                    />
                  </div>

                  <InputField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    icon={MapPin}
                  />

                  <InputField
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    icon={MapPin}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Document Uploads" icon={Upload}>
                <div className="grid gap-4 md:grid-cols-2">
                  <FileField
                    label="Upload Aadhaar Card"
                    name="identityProofFile"
                    onChange={handleChange}
                    fileName={formData.identityProofFile?.name}
                    existingUrl={existingDocs.kyc}
                    disableUpload={Boolean(existingDocs.kyc)}
                    onDelete={() => handleDeleteDoc("kyc")}
                    deleting={deletingType === "kyc"}
                  />

                  <FileField
                    label="Upload PAN Card"
                    name="panCardFile"
                    onChange={handleChange}
                    fileName={formData.panCardFile?.name}
                    existingUrl={existingDocs.pan}
                    disableUpload={Boolean(existingDocs.pan)}
                    onDelete={() => handleDeleteDoc("pan")}
                    deleting={deletingType === "pan"}
                  />

                  <FileField
                    label="Upload Address Proof"
                    name="addressProofFile"
                    onChange={handleChange}
                    fileName={formData.addressProofFile?.name}
                    existingUrl={existingDocs.addressProof}
                    disableUpload={Boolean(existingDocs.addressProof)}
                    onDelete={() => handleDeleteDoc("addressProof")}
                    deleting={deletingType === "addressProof"}
                  />
                </div>
              </SectionCard>
            </div>

            <div className="space-y-4">
              <SectionCard title="KYC Summary" icon={BadgeCheck}>
                <div className="space-y-3">
                  <SummaryRow label="Status" value={summary.status} />
                  <SummaryRow label="Aadhaar" value={summary.aadhaar} />
                  <SummaryRow label="PAN" value={summary.pan} />
                  <SummaryRow
                    label="Address Proof"
                    value={summary.addressProof}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Verification Information" icon={CalendarDays}>
                <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Review Process
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    Your submitted KYC documents will be checked by the admin
                    team. After successful review, your status can move from
                    pending to verified.
                  </p>
                </div>

                <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Important Note
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    Please ensure that all details exactly match your official
                    documents. Wrong or incomplete data may delay approval.
                  </p>
                </div>
              </SectionCard>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
