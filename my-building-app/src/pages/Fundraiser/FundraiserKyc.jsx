import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  FileCheck,
  CreditCard,
  MapPin,
  BadgeCheck,
  Building2,
  Upload,
  ShieldCheck,
  CalendarDays,
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

function InputField({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  name,
  type = "text",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-sky-400">
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
          className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
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
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-sky-400">
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

function FileField({ label, fileName, onChange, name }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-sky-400 hover:bg-sky-50">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-700">
          <Upload size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            {fileName || "Upload file"}
          </p>
          <p className="text-xs text-slate-500">
            JPG, PNG or PDF supported
          </p>
        </div>
        <input
          type="file"
          name={name}
          onChange={onChange}
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
        />
      </label>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  const tone =
    normalized.includes("approved") || normalized.includes("verified")
      ? "bg-emerald-100 text-emerald-700"
      : normalized.includes("rejected")
      ? "bg-rose-100 text-rose-700"
      : "bg-amber-100 text-amber-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      {status}
    </span>
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

export default function FundraiserKyc() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
   
    fullName: user?.name || "",
    companyName: user?.companyName || "",
    aadhaarNumber: user?.aadhaarNumber || "",
    panNumber: user?.panNumber || "",
    gstNumber: user?.gstNumber || "",
    companyRegistrationNumber: user?.companyRegistrationNumber || "",
    addressProofType: user?.addressProofType || "aadhaar",
    addressLine: user?.addressLine || "",
    city: user?.city || "",
    state: user?.state || "",
    pincode: user?.pincode || "",
    kycStatus: user?.kycStatus || "Pending Review",
    identityProofFile: null,
    panCardFile: null,
    addressProofFile: null,
    companyProofFile: null,
  });

  const [saved, setSaved] = useState(false);

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

  const handleSave = (e) => {
    e.preventDefault();

    const payload = {
      ...user,
      companyName: formData.companyName,
      aadhaarNumber: formData.aadhaarNumber,
      panNumber: formData.panNumber,
      gstNumber: formData.gstNumber,
      companyRegistrationNumber: formData.companyRegistrationNumber,
      addressProofType: formData.addressProofType,
      addressLine: formData.addressLine,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      kycStatus: "Pending Review",
    };

    localStorage.setItem("user", JSON.stringify(payload));
    setFormData((prev) => ({ ...prev, kycStatus: "Pending Review" }));
    setSaved(true);
  };

  const completion = useMemo(() => {
    let score = 0;
    if (formData.fullName) score += 15;
    if (formData.aadhaarNumber) score += 15;
    if (formData.panNumber) score += 15;
    if (formData.addressLine) score += 10;
    if (formData.city) score += 5;
    if (formData.state) score += 5;
    if (formData.pincode) score += 5;
    if (formData.identityProofFile) score += 10;
    if (formData.panCardFile) score += 10;



    return Math.min(score, 100);
  }, [formData]);

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

              <h1 className="text-3xl font-bold text-slate-900">
                Fundraiser KYC & Documents
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Add identity, PAN, address proof and company details for verification.
              </p>
            </div>

            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              <Save size={16} />
              Save KYC Details
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
                    label="Upload Aadhar card"
                    name="identityProofFile"
                    onChange={handleChange}
                    fileName={formData.identityProofFile?.name}
                  />

                  <FileField
                    label="Upload PAN Card"
                    name="panCardFile"
                    onChange={handleChange}
                    fileName={formData.panCardFile?.name}
                  />

                  <FileField
                    label="Upload Address Proof or ID card"
                    name="addressProofFile"
                    onChange={handleChange}
                    fileName={formData.addressProofFile?.name}
                  />

                
                </div>
              </SectionCard>
            </div>

            <div className="space-y-4">
              <SectionCard title="KYC Summary" icon={BadgeCheck}>
                <div className="space-y-3">
                  <SummaryRow label="Status" value={formData.kycStatus} />
                  <SummaryRow label="Aadhaar" value={formData.aadhaarNumber || "Not added"} />
                  <SummaryRow label="PAN" value={formData.panNumber || "Not added"} />
                  <SummaryRow label="Address Proof" value={formData.addressProofType} />
                 
                </div>
              </SectionCard>

              <SectionCard title="Verification Information" icon={CalendarDays}>
                <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Review Process
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    Your submitted KYC documents will be checked by the admin team.
                    After successful review, your status can move from pending to verified.
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

              <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
                <div className="mt-4 space-y-3">
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                  >
                    Save KYC Details
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/fundraiser/profile")}
                    className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Back to Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/fundraiser/profile/bank")}
                    className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Go to Bank Details
                  </button>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}