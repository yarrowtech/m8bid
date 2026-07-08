import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createFundraiser } from "../api/fundraiser.api";

const baseField =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 " +
  "placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-100 transition";

const CARD_TITLE_CLASS = "text-lg font-semibold tracking-tight text-gray-900";

const CAMPAIGN_TYPES = [
  { value: "ngo", label: "NGO / Nonprofit", description: "Raise for social impact, community, welfare, and mission-led work." },
  { value: "business", label: "Business", description: "Raise for operations, working capital, expansion, inventory, or growth." },
  { value: "medical", label: "Medical Emergency", description: "Raise for treatment, surgery, recovery, medicines, or urgent care." },
  { value: "education", label: "Education", description: "Raise for fees, learning tools, certification, training, or skill building." },
  { value: "company", label: "Company", description: "Raise for a registered company, product line, compliance, or scaling plans." },
  { value: "startup", label: "Startup", description: "Raise for MVPs, product development, pilots, and go-to-market growth." },
  { value: "project", label: "Project", description: "Raise for architecture, construction, pilot projects, or structured builds." },
];

const SUBCATEGORY_OPTIONS = {
  ngo: [
    { value: "health", label: "Health & Care" },
    { value: "women", label: "Women Empowerment" },
    { value: "community", label: "Community Development" },
    { value: "environment", label: "Environment" },
    { value: "education", label: "Education Support" },
    { value: "custom", label: "Custom / Other" },
  ],
  business: [
    { value: "small-business", label: "Small Business" },
    { value: "food-business", label: "Food Business" },
    { value: "normal-business", label: "Normal Business" },
    { value: "custom", label: "Custom / Other" },
  ],
  medical: [
    { value: "surgery", label: "Surgery" },
    { value: "critical-care", label: "Critical Care / ICU" },
    { value: "cancer-treatment", label: "Cancer Treatment" },
    { value: "medicines", label: "Medicines / Ongoing Treatment" },
    { value: "recovery", label: "Recovery Support" },
    { value: "custom", label: "Custom / Other" },
  ],
  education: [
    { value: "tuition", label: "Tuition / Fees" },
    { value: "architecture", label: "Architecture" },
    { value: "construction", label: "Construction" },
    { value: "pilot-project", label: "Pilot Project" },
    { value: "training", label: "Training / Certification" },
    { value: "custom", label: "Custom / Other" },
  ],
  company: [
    { value: "product-launch", label: "Product Launch" },
    { value: "r-and-d", label: "Research & Development" },
    { value: "compliance", label: "Compliance / Legal" },
    { value: "scaling", label: "Scaling / Expansion" },
    { value: "automation", label: "Automation / Systems" },
    { value: "custom", label: "Custom / Other" },
  ],
  startup: [
    { value: "mvp", label: "MVP / Prototype" },
    { value: "pilot", label: "Pilot Launch" },
    { value: "seed-growth", label: "Seed Growth" },
    { value: "go-to-market", label: "Go-To-Market" },
    { value: "product", label: "Product Development" },
    { value: "custom", label: "Custom / Other" },
  ],
  project: [
    { value: "architecture", label: "Architecture" },
    { value: "construction", label: "Construction" },
    { value: "pilot-project", label: "Pilot Project" },
    { value: "community-build", label: "Community Build" },
    { value: "creative", label: "Creative / Production" },
    { value: "custom", label: "Custom / Other" },
  ],
};

const DOCUMENT_SETS = {
  ngo: [
    { key: "ngoRegistration", label: "NGO Registration Certificate", hint: "Society, trust, or nonprofit registration.", accept: "image/*,application/pdf", required: true },
    { key: "tradeLicence", label: "Trade Licence", hint: "Trade or operating licence for the NGO office or activity.", accept: "image/*,application/pdf", required: true },
    { key: "trustDeed", label: "Trust Deed", hint: "Trust deed or founding deed for the NGO.", accept: "image/*,application/pdf", required: true },
    { key: "trustAgreement", label: "Trust Agreement", hint: "Trust agreement, bye-laws, or internal governing agreement.", accept: "image/*,application/pdf", required: true },
    { key: "ngoDetails", label: "NGO Details", hint: "Full NGO details, work area, mission, and office address proof.", accept: "image/*,application/pdf", required: true },
    { key: "ownerNames", label: "Trustee / Owner Names", hint: "Names of trustees, founders, or responsible persons.", accept: "image/*,application/pdf", required: true },
    { key: "impactProof", label: "Impact / Activity Proof", hint: "Photos, reports, testimonials, or project evidence.", accept: "image/*,application/pdf", required: false },
  ],
  business: {
    default: [
      { key: "businessRegistration", label: "Business Registration", hint: "Registration certificate, shop act, or business proof.", accept: "image/*,application/pdf", required: true },
      { key: "businessAddressProof", label: "Business Address Proof", hint: "Office, shop, warehouse, or place of business proof.", accept: "image/*,application/pdf", required: true },
      { key: "tradeLicence", label: "Trade Licence", hint: "Trade licence or local business permission.", accept: "image/*,application/pdf", required: true },
      { key: "businessDocuments", label: "Business Related Documents", hint: "Invoices, licences, permits, contracts, or any supporting business papers.", accept: "image/*,application/pdf", required: false },
    ],
    smallBusiness: [
      { key: "shopAddressProof", label: "Shop Address Proof", hint: "Shop address, rent receipt, utility bill, or location proof.", accept: "image/*,application/pdf", required: true },
      { key: "addressLicence", label: "Address Licence", hint: "Address-related licence or permission document.", accept: "image/*,application/pdf", required: true },
      { key: "hawkerLicence", label: "Hawker Licence", hint: "Hawker, vendor, or street trade licence if applicable.", accept: "image/*,application/pdf", required: false },
      { key: "businessProof", label: "Small Business Proof", hint: "GST, invoices, stock records, or other business papers.", accept: "image/*,application/pdf", required: true },
    ],
    food: [
      { key: "foodLicence", label: "Food Licence", hint: "FSSAI or food safety licence.", accept: "image/*,application/pdf", required: true },
      { key: "fireLicence", label: "Fire Licence", hint: "Fire safety permit or NOC.", accept: "image/*,application/pdf", required: true },
      { key: "placeLicence", label: "Place Licence", hint: "Shop, kitchen, stall, or place licence.", accept: "image/*,application/pdf", required: true },
      { key: "businessProof", label: "Food Business Proof", hint: "Menu, invoices, GST, or other business papers.", accept: "image/*,application/pdf", required: false },
    ],
  },
  medical: [
    { key: "hospitalQuotation", label: "Hospital Quotation", hint: "Treatment quotation or cost estimate from the hospital.", accept: "image/*,application/pdf", required: true },
    { key: "prescription", label: "Prescription", hint: "Doctor prescription or treatment recommendation.", accept: "image/*,application/pdf", required: true },
    { key: "healthRecord", label: "Health Record", hint: "Medical history, reports, scans, or lab records.", accept: "image/*,application/pdf", required: true },
    { key: "operationDocument", label: "Operation Document", hint: "Operation note, surgery request, or procedure paper if any.", accept: "image/*,application/pdf", required: false },
  ],
  education: [
    { key: "admissionLetter", label: "Admission / Enrollment Letter", hint: "Admission or course confirmation document.", accept: "image/*,application/pdf", required: true },
    { key: "feeStructure", label: "Fee Structure", hint: "Course fee, semester fee, or tuition breakup.", accept: "image/*,application/pdf", required: true },
    { key: "academicProof", label: "Academic / Merit Proof", hint: "Marksheets, offer letter, or achievement proof.", accept: "image/*,application/pdf", required: false },
  ],
  company: [
    { key: "incorporationCertificate", label: "Incorporation Certificate", hint: "Certificate of incorporation or registration.", accept: "image/*,application/pdf", required: true },
    { key: "gstCertificate", label: "GST / Tax Document", hint: "GST certificate or tax registration.", accept: "image/*,application/pdf", required: true },
    { key: "financialStatement", label: "Financial Statement", hint: "Revenue snapshot, profit/loss, or balance sheet.", accept: "image/*,application/pdf", required: true },
    { key: "boardResolution", label: "Board Resolution / Approval", hint: "Internal approval or corporate authorization.", accept: "image/*,application/pdf", required: false },
  ],
  startup: [
    { key: "trademark", label: "Trademark", hint: "Trademark certificate or filing proof.", accept: "image/*,application/pdf", required: true },
    { key: "patent", label: "Patent", hint: "Patent filing or granted patent document.", accept: "image/*,application/pdf", required: false },
    { key: "tradeLicence", label: "Trade Licence", hint: "Trade licence or operating permission.", accept: "image/*,application/pdf", required: true },
    { key: "registrationCertificate", label: "Registration Certificate", hint: "Startup or business registration certificate.", accept: "image/*,application/pdf", required: true },
    { key: "moa", label: "MOA", hint: "Memorandum of Association.", accept: "image/*,application/pdf", required: true },
    { key: "aoa", label: "AOA", hint: "Articles of Association.", accept: "image/*,application/pdf", required: true },
    { key: "pitchDeck", label: "Pitch Deck", hint: "Explain the idea, market, product, and traction.", accept: "image/*,application/pdf", required: false },
  ],
  project: [
    { key: "projectProposal", label: "Project Proposal", hint: "Scope, objective, timeline, and expected outcome.", accept: "image/*,application/pdf", required: true },
    { key: "estimateSheet", label: "Estimate / Cost Sheet", hint: "BOQ, budget sheet, or quotation document.", accept: "image/*,application/pdf", required: true },
    { key: "approvalLetter", label: "Approval / Sanction Letter", hint: "Permission, sanction, or project approval proof.", accept: "image/*,application/pdf", required: true },
    { key: "planBlueprint", label: "Plan / Blueprint", hint: "Layout, drawing, blueprint, or execution plan.", accept: "image/*,application/pdf", required: false },
  ],
  default: [
    { key: "supportingDocument", label: "Supporting Document", hint: "Upload one strong proof document for this campaign.", accept: "image/*,application/pdf", required: true },
    { key: "budgetEstimate", label: "Budget / Estimate", hint: "Show how the funds will be used.", accept: "image/*,application/pdf", required: true },
    { key: "additionalProof", label: "Additional Proof", hint: "Anything else that improves trust and clarity.", accept: "image/*,application/pdf", required: false },
  ],
};

function getCampaignTypeMeta(type) {
  return CAMPAIGN_TYPES.find((item) => item.value === type) || CAMPAIGN_TYPES[0];
}

function getSubcategoryOptions(type) {
  return SUBCATEGORY_OPTIONS[type] || [{ value: "custom", label: "Custom / Other" }];
}

function getDocumentSet(type, subcategory) {
  if (type === "business") {
    if (subcategory === "small-business") return DOCUMENT_SETS.business.smallBusiness;
    if (subcategory === "food-business") return DOCUMENT_SETS.business.food;
    return DOCUMENT_SETS.business.default;
  }
  return DOCUMENT_SETS[type] || DOCUMENT_SETS.default;
}

function getSubcategoryLabel(type, subcategory, customSubcategory) {
  const option = getSubcategoryOptions(type).find((item) => item.value === subcategory);
  if (subcategory === "custom") return customSubcategory.trim() || "Custom / Other";
  return option?.label || customSubcategory.trim() || "General";
}

function buildCampaignCategory(type, subcategory, customSubcategory) {
  const typeLabel = getCampaignTypeMeta(type)?.label || "Campaign";
  const subcategoryLabel = getSubcategoryLabel(type, subcategory, customSubcategory);
  return `${typeLabel} / ${subcategoryLabel}`;
}

function getEntityLabel(type) {
  switch (type) {
    case "medical": return "Patient / beneficiary name";
    case "ngo": return "NGO / organization name";
    case "business": return "Business name";
    case "company": return "Company name";
    case "startup": return "Startup name";
    case "education": return "Student / learner name";
    case "project": return "Project owner / team name";
    default: return "Organizer / beneficiary name";
  }
}

const Card = memo(function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-5">
        <h3 className={CARD_TITLE_CLASS}>{title}</h3>
        {subtitle ? <p className="mt-1 text-sm leading-relaxed text-gray-600">{subtitle}</p> : null}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
});

const Label = memo(function Label({ children, htmlFor }) {
  return <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-gray-800">{children}</label>;
});

const Input = memo(function Input(props) {
  return <input {...props} autoComplete={props.autoComplete ?? "off"} className={`${baseField} ${props.className || ""}`} />;
});

const Textarea = memo(function Textarea(props) {
  return <textarea {...props} autoComplete={props.autoComplete ?? "off"} className={`${baseField} ${props.className || ""}`} />;
});

const Select = memo(function Select(props) {
  return <select {...props} autoComplete={props.autoComplete ?? "off"} className={`${baseField} ${props.className || ""}`} />;
});

const File = memo(function File({ hint, ...props }) {
  return (
    <div>
      <input
        {...props}
        autoComplete="off"
        className={"w-full cursor-pointer rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-800 transition"}
      />
      {hint ? <p className="mt-2 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
});

const StepPill = memo(function StepPill({ active, label, idx, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={"flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition " + (active ? "border-yellow-200 bg-yellow-100 text-gray-900 shadow-sm" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50")}
    >
      <span className={"flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold " + (active ? "bg-yellow-300 text-gray-900" : "bg-gray-100 text-gray-700")}>{idx}</span>
      <span className="font-semibold">{label}</span>
    </button>
  );
});

const DocUpload = memo(function DocUpload({ label, hint, accept, required, value, onChange, name }) {
  return (
    <div>
      <Label htmlFor={name}>{label} {required ? <span className="text-rose-500">*</span> : null}</Label>
      <File id={name} type="file" name={name} accept={accept} onChange={onChange} hint={hint} />
      {value ? <p className="mt-2 text-xs font-medium text-emerald-700">Selected: {value.name}</p> : null}
    </div>
  );
});
export default function StartFundraiser() {
  const navigate = useNavigate();
  const TOTAL_STEPS = 5;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    campaignType: "",
    campaignSubcategory: "",
    customSubcategory: "",
    entityName: "",
    projectTitle: "",
    projectOverview: "",
    state: "",
    city: "",
    country: "",
    photo: null,
    projectPhotos: [],
    video: null,
    moneyToRaise: "",
    daysToRaise: "",
    fundingType: "",
    profitPercentage: "",
    useOfFunds: "",
    introduction: "",
    documents: {},
    promotion: "no",
    promoVideo: null,
    promoPoster: null,
  });

  const stepLabels = useMemo(
    () => [
      { id: 1, label: "Campaign" },
      { id: 2, label: "Funding" },
      { id: 3, label: "Story & Docs" },
      { id: 4, label: "Promotion" },
      { id: 5, label: "Review" },
    ],
    []
  );

  const campaignTypeMeta = useMemo(() => getCampaignTypeMeta(formData.campaignType || "project"), [formData.campaignType]);
  const subcategoryOptions = useMemo(() => getSubcategoryOptions(formData.campaignType || "project"), [formData.campaignType]);
  const documentSet = useMemo(
    () => getDocumentSet(formData.campaignType || "project", formData.campaignSubcategory),
    [formData.campaignSubcategory, formData.campaignType]
  );
  const selectedSubcategoryLabel = useMemo(
    () => getSubcategoryLabel(formData.campaignType || "project", formData.campaignSubcategory, formData.customSubcategory),
    [formData.campaignSubcategory, formData.campaignType, formData.customSubcategory]
  );
  const selectedCampaignCategory = useMemo(
    () => buildCampaignCategory(formData.campaignType || "project", formData.campaignSubcategory, formData.customSubcategory),
    [formData.campaignSubcategory, formData.campaignType, formData.customSubcategory]
  );
  const entityLabel = useMemo(() => getEntityLabel(formData.campaignType || "project"), [formData.campaignType]);

  const objectUrlsRef = useRef(new Map());
  const getObjectUrl = useCallback((file) => {
    if (!file) return "";
    const key = `${file.name}-${file.size}-${file.lastModified}`;
    if (objectUrlsRef.current.has(key)) return objectUrlsRef.current.get(key);
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.set(key, url);
    return url;
  }, []);

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      for (const url of urls.values()) {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          void error;
        }
      }
      urls.clear();
    };
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, files, type } = e.target;

    if (type === "file") {
      if (name === "projectPhotos") {
        setFormData((prev) => ({ ...prev, projectPhotos: Array.from(files || []) }));
        return;
      }
      if (name === "photo" || name === "video" || name === "promoVideo" || name === "promoPoster") {
        setFormData((prev) => ({ ...prev, [name]: files?.[0] || null }));
        return;
      }
      setFormData((prev) => ({ ...prev, documents: { ...prev.documents, [name]: files?.[0] || null } }));
      return;
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: value ?? "" };
      if (name === "campaignType") {
        next.campaignSubcategory = "";
        next.customSubcategory = "";
        next.documents = {};
      }
      if (name === "campaignSubcategory" && value !== "custom") {
        next.customSubcategory = "";
      }
      return next;
    });
  }, []);

  const removeProjectPhoto = useCallback((idx) => {
    setFormData((prev) => ({ ...prev, projectPhotos: prev.projectPhotos.filter((_, i) => i !== idx) }));
  }, []);

  const onFormKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag !== "textarea" && step !== TOTAL_STEPS) e.preventDefault();
    }
  }, [step]);

  const validateStep = useCallback((currentStep) => {
    if (currentStep === 1) {
      if (!formData.campaignType) return "Campaign type is required.";
      if (!formData.campaignSubcategory) return "Campaign subcategory is required.";
      if (formData.campaignSubcategory === "custom" && !formData.customSubcategory.trim()) return "Custom subcategory is required.";
      if (!formData.projectTitle.trim()) return "Campaign title is required.";
      if (!formData.projectOverview.trim()) return "Campaign overview is required.";
      if (!formData.entityName.trim()) return `${entityLabel} is required.`;
      if (!formData.state.trim() || !formData.city.trim() || !formData.country.trim()) return "Campaign location (state, city, country) is required.";
      if (!formData.photo) return "Main image is required.";
    }

    if (currentStep === 2) {
      if (!String(formData.moneyToRaise).trim()) return "Money to raise is required.";
      if (!String(formData.daysToRaise).trim()) return "Days to raise funds is required.";
      if (!formData.fundingType) return "Funding type is required.";
      if (formData.fundingType === "Profit Return" && !String(formData.profitPercentage).trim()) return "Profit percentage is required for Profit Return.";
      if (!formData.useOfFunds.trim()) return "Use of funds is required.";
    }

    if (currentStep === 3) {
      if (!formData.introduction.trim()) return "Campaign story is required.";
      const missingDoc = documentSet.find((doc) => doc.required && !formData.documents?.[doc.key]);
      if (missingDoc) return `${missingDoc.label} is required.`;
    }

    return null;
  }, [documentSet, entityLabel, formData]);

  const handleNext = useCallback(() => setStep((current) => (current < TOTAL_STEPS ? current + 1 : current)), []);
  const handleBack = useCallback(() => setStep((current) => (current > 1 ? current - 1 : current)), []);

  const handleSubmit = useCallback(async () => {
    const err = validateStep(1) || validateStep(2) || validateStep(3);
    if (err) return alert(err);

    setSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?._id || user?.id;
      if (!userId) {
        alert("User not found. Please login again.");
        return;
      }

      const form = new FormData();
      form.append("campaignType", formData.campaignType);
      form.append("campaignSubcategory", selectedSubcategoryLabel);
      form.append("projectCategory", selectedCampaignCategory);
      form.append("projectTitle", formData.projectTitle);
      form.append("projectOverview", formData.projectOverview);
      form.append("entityName", formData.entityName);
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
      form.append("useOfFunds", formData.useOfFunds);
      if (formData.fundingType === "Profit Return" && String(formData.profitPercentage).trim()) {
        form.append("profitPercentage", formData.profitPercentage);
      }
      form.append("introduction", formData.introduction);

      const submittedDocuments = [];
      documentSet.forEach((doc) => {
        const file = formData.documents?.[doc.key];
        if (file) {
          form.append(doc.key, file);
          submittedDocuments.push({ key: doc.key, label: doc.label, required: doc.required, fileName: file.name });
        }
      });
      form.append("documentProfile", JSON.stringify(submittedDocuments));

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
  }, [documentSet, formData, navigate, selectedCampaignCategory, selectedSubcategoryLabel, validateStep]);
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-gray-900">
            Fundraising - Multi category campaign builder
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Start Your Fundraiser
          </h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
            Create campaigns for NGOs, businesses, medical emergencies, education, companies,
            startups, and projects. The type and subcategory you choose will change the documents
            you upload.
          </p>
          <p className="mt-3 max-w-3xl rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-gray-700">
            This form is only for campaign details and campaign proof documents. Personal
            information, KYC, and bank details are filled later after login in your profile or
            verification flow.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">Progress</div>
                  <div className="text-xs font-medium text-gray-500">
                    Step {step} / {TOTAL_STEPS}
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full bg-yellow-300" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
                </div>
                <div className="mt-5 space-y-3">
                  {stepLabels.map((s) => (
                    <StepPill key={s.id} idx={s.id} label={s.label} active={s.id === step} onClick={() => setStep(s.id)} />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm leading-relaxed text-gray-600">
                  Different campaign types need different trust documents. Personal and bank
                  verification happens later after login, not in this creation form.
                </p>
              </div>
            </div>
          </aside>

          <section className="space-y-6 lg:col-span-8 xl:col-span-9">
            <form autoComplete="on" onKeyDown={onFormKeyDown} onSubmit={(e) => e.preventDefault()}>
              {step === 1 && (
                <Card title="Campaign Details" subtitle="Choose the campaign type first, then define the subcategory, title, and media.">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                      <Label htmlFor="campaignType">Campaign Type</Label>
                      <Select id="campaignType" name="campaignType" value={formData.campaignType} onChange={handleChange}>
                        <option value="">Select campaign type</option>
                        {CAMPAIGN_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </Select>
                      {formData.campaignType ? <p className="mt-2 text-xs text-gray-500">{campaignTypeMeta.description}</p> : null}
                    </div>

                    <div>
                      <Label htmlFor="campaignSubcategory">Subcategory</Label>
                      <Select id="campaignSubcategory" name="campaignSubcategory" value={formData.campaignSubcategory} onChange={handleChange} disabled={!formData.campaignType}>
                        <option value="">Select subcategory</option>
                        {subcategoryOptions.map((item) => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </Select>
                    </div>

                    {formData.campaignSubcategory === "custom" ? (
                      <div className="lg:col-span-2">
                        <Label htmlFor="customSubcategory">Custom Subcategory</Label>
                        <Input id="customSubcategory" name="customSubcategory" value={formData.customSubcategory} onChange={handleChange} placeholder="Example: Rural health drive, architecture build, pilot training, etc." />
                      </div>
                    ) : null}

                    <div className="lg:col-span-2">
                      <Label htmlFor="entityName">{entityLabel}</Label>
                      <Input id="entityName" name="entityName" value={formData.entityName} onChange={handleChange} placeholder={entityLabel} />
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="projectTitle">Campaign Title</Label>
                      <Input id="projectTitle" name="projectTitle" value={formData.projectTitle} onChange={handleChange} placeholder="Example: Build a Rural Health Outreach Hub" />
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="projectOverview">Campaign Overview</Label>
                      <Textarea id="projectOverview" name="projectOverview" rows={6} value={formData.projectOverview} onChange={handleChange} placeholder="Explain what the campaign is, who benefits, and why the fundraising matters." />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2">
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input id="state" name="state" value={formData.state} onChange={handleChange} placeholder="West Bengal" autoComplete="address-level1" />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Kolkata" autoComplete="address-level2" />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" name="country" value={formData.country} onChange={handleChange} placeholder="India" autoComplete="country-name" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="photo">Main Campaign Image</Label>
                      <File id="photo" type="file" name="photo" accept="image/*" onChange={handleChange} hint="This will be the main cover image on campaign cards." />
                      {formData.photo ? (
                        <div className="mt-3"><img src={getObjectUrl(formData.photo)} alt="Main campaign" className="h-40 w-full rounded-xl border object-cover" /></div>
                      ) : null}
                    </div>

                    <div>
                      <Label htmlFor="video">Campaign Video</Label>
                      <File id="video" type="file" name="video" accept="video/*" onChange={handleChange} hint="Optional short video or walkthrough." />
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="projectPhotos">Gallery Images</Label>
                      <File id="projectPhotos" type="file" name="projectPhotos" accept="image/*" multiple onChange={handleChange} hint="Upload supporting photos, team shots, office photos, plans, or proof images." />
                      {formData.projectPhotos?.length > 0 ? (
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                          {formData.projectPhotos.map((file, idx) => (
                            <div key={`${file.name}-${file.size}-${file.lastModified}`} className="group relative">
                              <img src={getObjectUrl(file)} alt={`Gallery ${idx + 1}`} className="h-28 w-full rounded-xl border object-cover" />
                              <button type="button" onClick={() => removeProjectPhoto(idx)} className="absolute right-2 top-2 rounded-lg bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">Remove</button>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Card>
              )}

              {step === 2 && (
                <Card title="Funding Plan" subtitle="Set the target amount, timeline, and how the funds will be used.">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                      <Label htmlFor="moneyToRaise">Money to Raise</Label>
                      <Input id="moneyToRaise" type="number" inputMode="numeric" name="moneyToRaise" value={formData.moneyToRaise} onChange={handleChange} placeholder="200000" />
                    </div>

                    <div>
                      <Label htmlFor="daysToRaise">Days to Raise Funds</Label>
                      <Input id="daysToRaise" type="number" inputMode="numeric" name="daysToRaise" value={formData.daysToRaise} onChange={handleChange} placeholder="40" />
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="fundingType">Funding Type</Label>
                      <Select id="fundingType" name="fundingType" value={formData.fundingType} onChange={handleChange}>
                        <option value="">Select funding type</option>
                        <option value="Profit Return">Profit Return</option>
                        <option value="Non-Profit Return">Non-Profit Return</option>
                      </Select>
                      <p className="mt-2 text-xs text-gray-500">Profit Return means backers expect a return. Non-Profit Return is donation style support.</p>
                    </div>

                    {formData.fundingType === "Profit Return" ? (
                      <div className="lg:col-span-2">
                        <Label htmlFor="profitPercentage">Profit Percentage</Label>
                        <Input id="profitPercentage" type="number" inputMode="numeric" name="profitPercentage" value={formData.profitPercentage} onChange={handleChange} placeholder="2" />
                      </div>
                    ) : null}

                    <div className="lg:col-span-2">
                      <Label htmlFor="useOfFunds">Use of Funds</Label>
                      <Textarea id="useOfFunds" name="useOfFunds" rows={5} value={formData.useOfFunds} onChange={handleChange} placeholder="Explain exactly where the money will go, for example fees, treatment, equipment, inventory, or construction." />
                    </div>
                  </div>
                </Card>
              )}
              {step === 3 && (
                <Card title="Story and Documents" subtitle="Tell the campaign story and upload only campaign-related proof documents.">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="introduction">Campaign Story</Label>
                        <Textarea id="introduction" name="introduction" rows={8} value={formData.introduction} onChange={handleChange} placeholder="Who are you? What is happening? Why should people support this campaign now?" />
                      </div>
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-gray-900">Selected campaign</p>
                        <div className="mt-3 space-y-1 text-sm text-gray-700">
                          <div><strong>Type:</strong> {campaignTypeMeta.label || "Campaign"}</div>
                          <div><strong>Subcategory:</strong> {selectedSubcategoryLabel}</div>
                          <div><strong>Document set:</strong> {documentSet.length} uploads</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-gray-900">Document guidance</p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                          Upload the exact proof documents that fit your campaign type. Identity,
                          KYC, and bank details are handled separately after login.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-5">
                        {documentSet.map((doc) => (
                          <DocUpload
                            key={doc.key}
                            name={doc.key}
                            label={doc.label}
                            hint={doc.hint}
                            accept={doc.accept}
                            required={doc.required}
                            value={formData.documents?.[doc.key]}
                            onChange={handleChange}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {step === 4 && (
                <Card title="Promotion" subtitle="Optional media to help your campaign reach more people.">
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <input type="radio" name="promotion" value="yes" onChange={handleChange} checked={formData.promotion === "yes"} />
                        Yes
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <input type="radio" name="promotion" value="no" onChange={handleChange} checked={formData.promotion === "no"} />
                        No
                      </label>
                    </div>

                    {formData.promotion === "yes" ? (
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div>
                          <Label htmlFor="promoVideo">Promotional Video</Label>
                          <File id="promoVideo" type="file" name="promoVideo" accept="video/*" onChange={handleChange} hint="Short promotional video." />
                        </div>
                        <div>
                          <Label htmlFor="promoPoster">Promotional Poster</Label>
                          <File id="promoPoster" type="file" name="promoPoster" accept="image/*" onChange={handleChange} hint="Poster image for sharing and campaigns." />
                          {formData.promoPoster ? (
                            <div className="mt-3"><img src={getObjectUrl(formData.promoPoster)} alt="Promo poster" className="h-40 w-full rounded-xl border object-cover" /></div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </Card>
              )}

              {step === 5 && (
                <Card title="Review and Submit" subtitle="Check everything once before submitting the campaign.">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div>
                      <div className="rounded-2xl border border-gray-200 p-5">
                        <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900">Summary</h4>
                        <ul className="mt-4 space-y-2 text-sm text-gray-800">
                          <li><strong>Type:</strong> {campaignTypeMeta.label || "-"}</li>
                          <li><strong>Subcategory:</strong> {selectedSubcategoryLabel}</li>
                          <li><strong>Entity:</strong> {formData.entityName || "-"}</li>
                          <li><strong>Title:</strong> {formData.projectTitle}</li>
                          <li><strong>Category:</strong> {selectedCampaignCategory}</li>
                          <li><strong>Location:</strong> {formData.state}, {formData.city}, {formData.country}</li>
                          <li><strong>Goal:</strong> Rs. {formData.moneyToRaise}</li>
                          <li><strong>Days:</strong> {formData.daysToRaise}</li>
                          <li><strong>Funding Type:</strong> {formData.fundingType}</li>
                          {formData.fundingType === "Profit Return" ? <li><strong>Profit %:</strong> {formData.profitPercentage}%</li> : null}
                          <li><strong>Use of Funds:</strong> {formData.useOfFunds || "-"}</li>
                          <li><strong>Promotion:</strong> {formData.promotion}</li>
                        </ul>
                      </div>

                      <div className="mt-6 rounded-2xl border border-gray-200 p-5">
                        <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900">Documents</h4>
                        <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-800">
                          {documentSet.map((doc) => (
                            <div key={doc.key}>{doc.label}: {formData.documents?.[doc.key]?.name || "-"}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {formData.photo ? (
                        <div>
                          <div className="mb-2 text-sm font-semibold text-gray-900">Main Image</div>
                          <img src={getObjectUrl(formData.photo)} alt="Campaign" className="h-52 w-full rounded-2xl border object-cover shadow-sm" />
                        </div>
                      ) : null}

                      {formData.projectPhotos?.length > 0 ? (
                        <div>
                          <div className="mb-2 text-sm font-semibold text-gray-900">Gallery</div>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {formData.projectPhotos.map((file, idx) => (
                              <img key={`${file.name}-${file.size}-${file.lastModified}-${idx}`} src={getObjectUrl(file)} alt={`Gallery ${idx + 1}`} className="h-24 w-full rounded-xl border object-cover" />
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {formData.video ? (
                        <div>
                          <div className="mb-2 text-sm font-semibold text-gray-900">Campaign Video</div>
                          <video src={getObjectUrl(formData.video)} controls className="w-full rounded-2xl border shadow-sm" />
                        </div>
                      ) : null}

                      {formData.promoVideo && formData.promotion === "yes" ? (
                        <div>
                          <div className="mb-2 text-sm font-semibold text-gray-900">Promotional Video</div>
                          <video src={getObjectUrl(formData.promoVideo)} controls className="w-full rounded-2xl border shadow-sm" />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Card>
              )}
            </form>

            <div className="flex items-center justify-between">
              <button type="button" onClick={handleBack} disabled={step === 1 || submitting} className="rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">Back</button>

              <div className="flex gap-3">
                {step < TOTAL_STEPS ? (
                  <button type="button" onClick={() => { const err = validateStep(step); if (err) return alert(err); handleNext(); }} disabled={submitting} className="rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60">Next</button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={submitting} className="rounded-xl bg-yellow-400 px-6 py-3 font-extrabold text-gray-900 transition hover:bg-yellow-300 disabled:opacity-60">{submitting ? "Submitting..." : "Submit Fundraiser"}</button>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500">By submitting, you confirm the information is accurate and you have rights to upload the selected documents.</p>
          </section>
        </div>
      </div>
    </main>
  );
}

