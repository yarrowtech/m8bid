import React, { useMemo, useRef, useState, useEffect, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createFundraiser } from "../api/fundraiser.api";

/**
 * ✅ FIX for "typing needs click every time":
 * Your inputs were losing focus because Card/Input/etc. were defined INSIDE StartFundraiser,
 * so React remounted them on each keystroke.
 *
 * ✅ Solution:
 * Move ALL UI helper components OUTSIDE StartFundraiser + memo them.
 */

/* -------------------- UI HELPERS (MUST BE OUTSIDE) -------------------- */

const baseField =
  "w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400 " +
  "transition";

const Card = memo(function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-gray-600 leading-relaxed">{subtitle}</p> : null}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
});

const Label = memo(function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-800 mb-2">
      {children}
    </label>
  );
});

const Input = memo(function Input(props) {
  return (
    <input
      {...props}
      autoComplete={props.autoComplete ?? "off"}
      className={`${baseField} ${props.className || ""}`}
    />
  );
});

const Textarea = memo(function Textarea(props) {
  return (
    <textarea
      {...props}
      autoComplete={props.autoComplete ?? "off"}
      className={`${baseField} ${props.className || ""}`}
    />
  );
});

const Select = memo(function Select(props) {
  return (
    <select
      {...props}
      autoComplete={props.autoComplete ?? "off"}
      className={`${baseField} ${props.className || ""}`}
    />
  );
});

const File = memo(function File({ hint, ...props }) {
  return (
    <div>
      <input
        {...props}
        autoComplete="off"
        className={
          "w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 " +
          "file:mr-4 file:rounded-lg file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white " +
          "hover:file:bg-gray-800 transition cursor-pointer"
        }
      />
      {hint ? <p className="mt-2 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
});

const StepPill = memo(function StepPill({ active, label, idx, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full text-left px-4 py-3 rounded-xl border transition flex items-center gap-3 " +
        (active
          ? "bg-yellow-100 border-yellow-200 text-gray-900 shadow-sm"
          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50")
      }
      type="button"
    >
      <span
        className={
          "h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold " +
          (active ? "bg-yellow-300 text-gray-900" : "bg-gray-100 text-gray-700")
        }
      >
        {idx}
      </span>
      <div className="font-semibold">{label}</div>
    </button>
  );
});

/* -------------------- MAIN COMPONENT -------------------- */

export default function StartFundraiser({ LoggedInUser }) {
  const navigate = useNavigate();

  const TOTAL_STEPS = 5;
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1
    projectTitle: "",
    projectCategory: "",
    projectOverview: "",
    state: "",
    city: "",
    country: "",
    photo: null,
    projectPhotos: [],
    video: null,

    // Step 2
    moneyToRaise: "",
    daysToRaise: "",
    fundingType: "",
    profitPercentage: "",

    // Step 3
    introduction: "",
    license: null,
    gst: null,
    companyRegistration: null,
    legalDocument: null,

   
    // Step 5
    promotion: "no",
    promoVideo: null,
    promoPoster: null,
  });

  // -------------------- Step labels --------------------
const stepLabels = useMemo(
  () => [
    { id: 1, label: "Project" },
    { id: 2, label: "Funding" },
    { id: 3, label: "Documents" },
    { id: 4, label: "Promotion" },
    { id: 5, label: "Review" },
  ],
  []
);

  const handleNext = useCallback(() => {
    setStep((s) => (s < TOTAL_STEPS ? s + 1 : s));
  }, []);

  const handleBack = useCallback(() => {
    setStep((s) => (s > 1 ? s - 1 : s));
  }, []);

  // -------------------- Stable Object URLs (previews) --------------------
  const objectUrlsRef = useRef(new Map());

  const getObjectUrl = useCallback((file) => {
    if (!file) return "";
    const key = `${file.name}-${file.size}-${file.lastModified}`;
    if (objectUrlsRef.current.has(key)) return objectUrlsRef.current.get(key);
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.set(key, url);
    return url;
  }, []);

  // cleanup URLs on unmount
  useEffect(() => {
    return () => {
      for (const url of objectUrlsRef.current.values()) {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      }
      objectUrlsRef.current.clear();
    };
  }, []);

  // -------------------- Change handler --------------------
  const handleChange = useCallback((e) => {
    const { name, value, files, type } = e.target;

    if (type === "file") {
      if (name === "projectPhotos") {
        const arr = Array.from(files || []);
        setFormData((prev) => ({ ...prev, projectPhotos: arr }));
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: files?.[0] || null }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value ?? "" }));
  }, []);

  const removeProjectPhoto = useCallback((idx) => {
    setFormData((prev) => ({
      ...prev,
      projectPhotos: prev.projectPhotos.filter((_, i) => i !== idx),
    }));
  }, []);

  // Prevent Enter key accidental submit while filling fields
  const onFormKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        const tag = e.target?.tagName?.toLowerCase();
        const isTextarea = tag === "textarea";
        if (!isTextarea && step !== TOTAL_STEPS) e.preventDefault();
      }
    },
    [step]
  );

  // -------------------- Validation --------------------
  const validateStep = useCallback(
    (currentStep) => {
      if (currentStep === 1) {
        if (!formData.projectTitle.trim()) return "Project Title is required.";
        if (!formData.projectOverview.trim()) return "Project Overview is required.";
        if (!formData.projectCategory) return "Project Category is required.";
        if (!formData.state.trim() || !formData.city.trim() || !formData.country.trim())
          return "Project location (state/city/country) is required.";
        if (!formData.photo) return "Project Main Image is required.";
      }

      if (currentStep === 2) {
        if (!String(formData.moneyToRaise).trim()) return "Money to Raise is required.";
        if (!String(formData.daysToRaise).trim()) return "Days to Raise is required.";
        if (!formData.fundingType) return "Funding Type is required.";
        if (
          formData.fundingType === "Profit Return" &&
          !String(formData.profitPercentage).trim()
        )
          return "Profit Percentage is required for Profit Return.";
      }

      if (currentStep === 3) {
        if (!formData.introduction.trim()) return "Introduction is required.";
        if (!formData.license) return "License is required.";
      }
      return null;
    },
    [formData]
  );

  // -------------------- Submit --------------------
 const handleSubmit = useCallback(async () => {
  const err = validateStep(1) || validateStep(2) || validateStep(3);
  if (err) return alert(err);

  setSubmitting(true);

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?._id || user?.id;

    if (!userId) {
      alert("User not found. Please login again.");
      setSubmitting(false);
      return;
    }

    const form = new FormData();

    form.append("projectTitle", formData.projectTitle);
    form.append("projectCategory", formData.projectCategory);
    form.append("projectOverview", formData.projectOverview);
    form.append("state", formData.state);
    form.append("city", formData.city);
    form.append("country", formData.country);

    if (formData.photo) form.append("photo", formData.photo);
    if (formData.video) form.append("video", formData.video);

    if (Array.isArray(formData.projectPhotos) && formData.projectPhotos.length) {
      formData.projectPhotos.forEach((file) => form.append("projectPhotos", file));
    }

    form.append("moneyToRaise", formData.moneyToRaise);
    form.append("daysToRaise", formData.daysToRaise);
    form.append("fundingType", formData.fundingType);

    if (
      formData.fundingType === "Profit Return" &&
      String(formData.profitPercentage).trim()
    ) {
      form.append("profitPercentage", formData.profitPercentage);
    }

    form.append("introduction", formData.introduction);
    if (formData.license) form.append("license", formData.license);
    if (formData.gst) form.append("gst", formData.gst);
    if (formData.companyRegistration) {
      form.append("companyRegistration", formData.companyRegistration);
    }
    if (formData.legalDocument) {
      form.append("legalDocument", formData.legalDocument);
    }

    form.append("promotion", formData.promotion);
    if (formData.promotion === "yes") {
      if (formData.promoVideo) form.append("promoVideo", formData.promoVideo);
      if (formData.promoPoster) form.append("promoPoster", formData.promoPoster);
    }

    await createFundraiser(userId, form);

    alert("Fundraiser submitted successfully!");
    navigate("/fundraiser/dashboard");
  } catch (error) {
    console.error("Error submitting fundraiser:", error);
    alert(error?.response?.data?.message || error?.message || "Error submitting fundraiser.");
  } finally {
    setSubmitting(false);
  }
}, [formData, navigate, validateStep]);

  // -------------------- Render --------------------
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-gray-900">
            Fundraising • Create Campaign
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Start Your Fundraiser
          </h1>
          <p className="mt-2 text-gray-600 max-w-2xl leading-relaxed">
            Add your project details, upload documents, and submit your campaign so investors can view and invest.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">Progress</div>
                  <div className="text-xs font-medium text-gray-500">
                    Step {step} / {TOTAL_STEPS}
                  </div>
                </div>

                <div className="mt-3 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-yellow-300"
                    style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                  />
                </div>

                <div className="mt-5 space-y-3">
                  {stepLabels.map((s) => (
                    <StepPill
                      key={s.id}
                      idx={s.id}
                      label={s.label}
                      active={s.id === step}
                      onClick={() => setStep(s.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tip: Use clear images and readable documents. PDF is allowed for legal docs.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <section className="lg:col-span-8 xl:col-span-9 space-y-6">
            <form autoComplete="on" onKeyDown={onFormKeyDown} onSubmit={(e) => e.preventDefault()}>
              {/* Step 1 */}
              {step === 1 && (
                <Card
                  title="Project Details"
                  subtitle="Add title, overview, category, location, and media uploads."
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2">
                      <Label htmlFor="projectTitle">Project Title</Label>
                      <Input
                        id="projectTitle"
                        name="projectTitle"
                        value={formData.projectTitle}
                        onChange={handleChange}
                        placeholder="Eg. HireMe Technology"
                        autoComplete="off"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="projectOverview">Project Overview</Label>
                      <Textarea
                        id="projectOverview"
                        name="projectOverview"
                        rows={6}
                        value={formData.projectOverview}
                        onChange={handleChange}
                        placeholder="Describe what you are building and why investors should care..."
                        autoComplete="off"
                      />
                    </div>
<div>
  <label
    htmlFor="projectCategory"
    className="mb-2 block text-sm font-semibold text-slate-700"
  >
    Project Category <span className="text-rose-500">*</span>
  </label>

  <select
    id="projectCategory"
    name="projectCategory"
    value={formData.projectCategory}
    onChange={handleChange}
    required
    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
  >
    <option value="">Select Category</option>
    <option value="technology">Technology</option>
    <option value="fintech">FinTech</option>
    <option value="education">Education</option>
    <option value="ecommerce">E-Commerce</option>
    <option value="manufacturing">Manufacturing</option>
    <option value="agriculture">Agriculture</option>
    <option value="cleanenergy">Clean Energy</option>
    <option value="realestate">Real Estate</option>
    <option value="hospitality">Hospitality & Tourism</option>
    <option value="transport">Transport & Logistics</option>
    <option value="food">Food & Beverage</option>
    <option value="retail">Retail</option>
    <option value="sports">Sports & Fitness</option>
    <option value="creative">Creative Projects</option>
    <option value="others">Others</option>
  </select>

  {!formData.projectCategory && (
    <p className="mt-1 text-xs text-slate-500">
      Please choose the category of your project.
    </p>
  )}
</div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:col-span-2">
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="West Bengal"
                          autoComplete="address-level1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Kolkata"
                          autoComplete="address-level2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          placeholder="India"
                          autoComplete="country-name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="photo">Main Project Image (Required)</Label>
                      <File
                        id="photo"
                        type="file"
                        name="photo"
                        accept="image/*"
                        onChange={handleChange}
                        hint="This will be the cover image shown on investor cards."
                      />
                      {formData.photo ? (
                        <div className="mt-3">
                          <img
                            src={getObjectUrl(formData.photo)}
                            alt="Main"
                            className="h-40 w-full object-cover rounded-xl border"
                          />
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <Label htmlFor="video">Project Overview Video (Optional)</Label>
                      <File
                        id="video"
                        type="file"
                        name="video"
                        accept="video/*"
                        onChange={handleChange}
                        hint="Optional short demo / walkthrough video."
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="projectPhotos">Project Photos Gallery (Multiple)</Label>
                      <File
                        id="projectPhotos"
                        type="file"
                        name="projectPhotos"
                        accept="image/*"
                        multiple
                        onChange={handleChange}
                        hint="Upload multiple images/screenshots (UI, product, team, office etc.)."
                      />

                      {formData.projectPhotos?.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {formData.projectPhotos.map((f, idx) => (
                            <div key={`${f.name}-${f.size}-${f.lastModified}`} className="relative group">
                              <img
                                src={getObjectUrl(f)}
                                alt={`Project ${idx + 1}`}
                                className="h-28 w-full object-cover rounded-xl border"
                              />
                              <button
                                type="button"
                                onClick={() => removeProjectPhoto(idx)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-black/70 text-white text-xs px-2 py-1 rounded-lg"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <Card title="Funding" subtitle="Set your goal, timeline and return type.">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="moneyToRaise">Money to Raise</Label>
                      <Input
                        id="moneyToRaise"
                        type="number"
                        inputMode="numeric"
                        name="moneyToRaise"
                        value={formData.moneyToRaise}
                        onChange={handleChange}
                        placeholder="200000"
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <Label htmlFor="daysToRaise">Days to Raise Funds</Label>
                      <Input
                        id="daysToRaise"
                        type="number"
                        inputMode="numeric"
                        name="daysToRaise"
                        value={formData.daysToRaise}
                        onChange={handleChange}
                        placeholder="40"
                        autoComplete="off"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="fundingType">Funding Type</Label>
                      <Select
                        id="fundingType"
                        name="fundingType"
                        value={formData.fundingType}
                        onChange={handleChange}
                        autoComplete="off"
                      >
                        <option value="">Select Type</option>
                        <option value="Profit Return">Profit Return</option>
                        <option value="Non-Profit Return">Non-Profit Return</option>
                      </Select>
                      <p className="mt-2 text-xs text-gray-500">
                        Profit Return: investors get a return percentage. Non-Profit: donation-like.
                      </p>
                    </div>

                    {formData.fundingType === "Profit Return" && (
                      <div className="lg:col-span-2">
                        <Label htmlFor="profitPercentage">Profit Percentage</Label>
                        <Input
                          id="profitPercentage"
                          type="number"
                          inputMode="numeric"
                          name="profitPercentage"
                          value={formData.profitPercentage}
                          onChange={handleChange}
                          placeholder="2"
                          autoComplete="off"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Step 3 */}
         {step === 3 && (
  <Card
    title="Legal Documents"
    subtitle="Upload project and business related documents."
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <Label htmlFor="introduction">Introduce Yourself</Label>
          <Textarea
            id="introduction"
            name="introduction"
            rows={4}
            value={formData.introduction}
            onChange={handleChange}
            placeholder="Who are you? What’s your motivation? Why this project?"
            autoComplete="off"
          />
        </div>

        <div>
          <Label htmlFor="license">License (Required)</Label>
          <File
            id="license"
            type="file"
            name="license"
            accept="image/*,application/pdf"
            onChange={handleChange}
            hint="Business license / Trade license"
          />
        </div>

        <div>
          <Label htmlFor="gst">GST / Tax Document</Label>
          <File
            id="gst"
            type="file"
            name="gst"
            accept="image/*,application/pdf"
            onChange={handleChange}
            hint="GST certificate / tax document"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="companyRegistration">Company Registration</Label>
          <File
            id="companyRegistration"
            type="file"
            name="companyRegistration"
            accept="image/*,application/pdf"
            onChange={handleChange}
            hint="Company registration certificate"
          />
        </div>

        <div>
          <Label htmlFor="legalDocument">Legal Document (MOA/Agreement/etc.)</Label>
          <File
            id="legalDocument"
            type="file"
            name="legalDocument"
            accept="image/*,application/pdf"
            onChange={handleChange}
            hint="MOA / partnership agreement / any legal proof"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-900">Uploaded</p>
          <ul className="mt-2 text-sm text-gray-700 space-y-1">
            <li>License: {formData.license?.name || "—"}</li>
            <li>GST/Tax: {formData.gst?.name || "—"}</li>
            <li>Registration: {formData.companyRegistration?.name || "—"}</li>
            <li>Legal Doc: {formData.legalDocument?.name || "—"}</li>
          </ul>
        </div>
      </div>
    </div>
  </Card>
)}

            

              {/* Step 5 */}
              {step === 4 && (
                <Card title="Promotion" subtitle="Optional: add promotional video/poster for better reach.">
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <input
                          type="radio"
                          name="promotion"
                          value="yes"
                          onChange={handleChange}
                          checked={formData.promotion === "yes"}
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <input
                          type="radio"
                          name="promotion"
                          value="no"
                          onChange={handleChange}
                          checked={formData.promotion === "no"}
                        />
                        No
                      </label>
                    </div>

                    {formData.promotion === "yes" && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="promoVideo">Promotional Video</Label>
                          <File
                            id="promoVideo"
                            type="file"
                            name="promoVideo"
                            accept="video/*"
                            onChange={handleChange}
                            hint="Short promotional video (optional)."
                          />
                        </div>

                        <div>
                          <Label htmlFor="promoPoster">Promotional Poster</Label>
                          <File
                            id="promoPoster"
                            type="file"
                            name="promoPoster"
                            accept="image/*"
                            onChange={handleChange}
                            hint="Poster image (optional)."
                          />
                          {formData.promoPoster ? (
                            <div className="mt-3">
                              <img
                                src={getObjectUrl(formData.promoPoster)}
                                alt="Promo"
                                className="h-40 w-full object-cover rounded-xl border"
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Step 6 */}
              {step === 5 && (
                <Card title="Review & Submit" subtitle="Confirm your details. Then submit.">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <div className="rounded-2xl border border-gray-200 p-5">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                          Summary
                        </h4>
                        <ul className="mt-4 space-y-2 text-sm text-gray-800">
                          <li>
                            <strong>Title:</strong> {formData.projectTitle}
                          </li>
                          <li>
                            <strong>Category:</strong> {formData.projectCategory}
                          </li>
                          <li>
                            <strong>Location:</strong> {formData.state}, {formData.city},{" "}
                            {formData.country}
                          </li>
                          <li>
                            <strong>Goal:</strong> ₹{formData.moneyToRaise}
                          </li>
                          <li>
                            <strong>Days:</strong> {formData.daysToRaise}
                          </li>
                          <li>
                            <strong>Funding Type:</strong> {formData.fundingType}
                          </li>
                          {formData.fundingType === "Profit Return" && (
                            <li>
                              <strong>Profit %:</strong> {formData.profitPercentage}%
                            </li>
                          )}
                          <li>
                            <strong>Promotion:</strong> {formData.promotion}
                          </li>
                        </ul>
                      </div>

                      <div className="mt-6 rounded-2xl border border-gray-200 p-5">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                          Documents
                        </h4>
                        <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-800">
                          <div>License: {formData.license?.name || "—"}</div>
                          <div>GST/Tax: {formData.gst?.name || "—"}</div>
                          <div>Registration: {formData.companyRegistration?.name || "—"}</div>
                          <div>Legal Doc: {formData.legalDocument?.name || "—"}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {formData.photo && (
                        <div>
                          <div className="text-sm font-semibold text-gray-900 mb-2">Main Image</div>
                          <img
                            src={getObjectUrl(formData.photo)}
                            alt="Project"
                            className="h-52 w-full object-cover rounded-2xl border shadow-sm"
                          />
                        </div>
                      )}

                      {formData.projectPhotos?.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold text-gray-900 mb-2">Gallery</div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {formData.projectPhotos.map((f, idx) => (
                              <img
                                key={`${f.name}-${f.size}-${f.lastModified}-${idx}`}
                                src={getObjectUrl(f)}
                                alt={`Gallery ${idx + 1}`}
                                className="h-24 w-full object-cover rounded-xl border"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {formData.video && (
                        <div>
                          <div className="text-sm font-semibold text-gray-900 mb-2">Project Video</div>
                          <video
                            src={getObjectUrl(formData.video)}
                            controls
                            className="w-full rounded-2xl border shadow-sm"
                          />
                        </div>
                      )}

                      {formData.promoVideo && formData.promotion === "yes" && (
                        <div>
                          <div className="text-sm font-semibold text-gray-900 mb-2">
                            Promotional Video
                          </div>
                          <video
                            src={getObjectUrl(formData.promoVideo)}
                            controls
                            className="w-full rounded-2xl border shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </form>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1 || submitting}
                className="px-5 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Back
              </button>

              <div className="flex gap-3">
                {step < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={() => {
                      const err = validateStep(step);
                      if (err) return alert(err);
                      handleNext();
                    }}
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-60 transition"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-yellow-400 text-gray-900 font-extrabold hover:bg-yellow-300 disabled:opacity-60 transition"
                  >
                    {submitting ? "Submitting..." : "Submit Fundraiser"}
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500">
              By submitting, you confirm the information is accurate and you have rights to upload
              these documents.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}