export const fundraisingCauses = [
  {
    slug: "projects",
    title: "Projects",
    tagline: "Raise for creative, technical, or community project execution.",
    overview:
      "Project fundraising is useful when you are building something specific with a clear scope, timeline, and execution plan.",
    whatToInclude: [
      "Project goal, expected outcome, and timeline",
      "Budget split for tools, team, production, or launch",
      "Current progress and next milestones",
      "Why this project needs support right now",
    ],
  },
  {
    slug: "ngo",
    title: "NGO",
    tagline: "Support social impact missions and nonprofit initiatives.",
    overview:
      "NGO fundraising should communicate mission credibility, target beneficiaries, and transparent use of contributions.",
    whatToInclude: [
      "Mission statement and the exact social problem being addressed",
      "Who benefits and how many people are expected to be impacted",
      "Program budget and expected impact metrics",
      "Proof of trust: registrations, field updates, and testimonials",
    ],
  },
  {
    slug: "education",
    title: "Education",
    tagline: "Fund tuition, learning resources, skilling, and training goals.",
    overview:
      "Education fundraising works best with clear academic goals, fee details, and a realistic plan for completion.",
    whatToInclude: [
      "Course or academic objective and institution details",
      "Fee structure, books, tools, and living expense breakdown",
      "Timeline for admission, semester, or certification",
      "How support helps complete the education milestone",
    ],
  },
  {
    slug: "business",
    title: "Business",
    tagline: "Raise funds for expansion, operations, or growth initiatives.",
    overview:
      "Business fundraising pages should show clarity on opportunity, traction, and how funds create measurable growth.",
    whatToInclude: [
      "Business model, market need, and current traction",
      "Use of funds across hiring, inventory, marketing, or operations",
      "Growth milestones with realistic timelines",
      "Founder background and execution strategy",
    ],
  },
  {
    slug: "medical-emergency",
    title: "Medical Emergency",
    tagline: "Collect urgent support for treatment, surgery, or care.",
    overview:
      "Medical emergency fundraising must be transparent, urgent, and respectful, with verified treatment details.",
    whatToInclude: [
      "Patient condition and treatment requirement in simple terms",
      "Hospital estimate, doctor notes, or treatment documentation",
      "Immediate and upcoming expense requirements",
      "Frequent updates on treatment progress and fund utilization",
    ],
  },
  {
    slug: "companies",
    title: "Companies",
    tagline: "Raise for corporate initiatives, product lines, or scaling plans.",
    overview:
      "Company fundraising campaigns should communicate governance, purpose, and responsible use of contributor funds.",
    whatToInclude: [
      "Company profile, stage, and core product or service",
      "Funding objective tied to specific business outcomes",
      "Execution roadmap and operational milestones",
      "Compliance, reporting, and transparency commitments",
    ],
  },
  {
    slug: "startups",
    title: "Startups",
    tagline: "Launch and scale early-stage startup ideas with community backing.",
    overview:
      "Startup fundraising needs a strong problem-solution story, market potential, and a milestone-driven launch plan.",
    whatToInclude: [
      "Problem statement, solution, and target users",
      "MVP status, early validation, or pilot results",
      "Fund usage for product, team, and go-to-market",
      "Near-term roadmap with launch and growth checkpoints",
    ],
  },
];

export function getFundraisingCauseBySlug(causeSlug) {
  return fundraisingCauses.find((cause) => cause.slug === causeSlug) || null;
}