import React, { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  FileText,
  HandCoins,
  Megaphone,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/fundraising-hero.jpg";
import helpsImage from "../assets/startup-sample.jpg";
import donationImage from "../assets/donation.jpg";
import investmentImage from "../assets/investors-hero.jpg";
import AccessModeModal from "../components/AccessModeModal.jsx";

function ZigSection({ title, text, image, alt, reverse = false, children }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
      <div className={`grid items-center gap-8 lg:grid-cols-2 ${reverse ? "" : ""}`}>
        <div className={reverse ? "order-2 lg:order-1" : "order-2 lg:order-2"}>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h2>
          <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">{text}</p>
          {children}
        </div>
        <div className={reverse ? "order-1 lg:order-2" : "order-1 lg:order-1"}>
          <img
            src={image}
            alt={alt}
            className="h-[210px] w-full rounded-2xl object-cover shadow-md md:h-[260px]"
          />
        </div>
      </div>
    </section>
  );
}

function DetailGrid({ items }) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
        >
          <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
        </div>
      ))}
    </div>
  );
}

function FlowChart({ steps }) {
  return (
    <div className="mt-8">
      <h3 className="text-base font-bold text-slate-900">
        Flowchart View
      </h3>
      <div className="mt-5 grid gap-4 md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step.title} className="relative">
            {index < steps.length - 1 && (
              <div className="absolute left-[calc(50%+1.5rem)] top-1/2 hidden h-0.5 w-[calc(100%-0.5rem)] bg-gradient-to-r from-slate-300 to-blue-300 md:block" />
            )}
            <div
              className={`relative rounded-2xl border border-white/70 px-4 py-5 text-center shadow-sm ${step.flowBg}`}
            >
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Step {index + 1}
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900">
                {step.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualSteps({ steps }) {
  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-5">
      {steps.map((step, index) => (
        <div key={step.title} className="relative">
          {index < steps.length - 1 && (
            <div className="absolute left-1/2 top-16 hidden h-0.5 w-full bg-slate-200 lg:block" />
          )}
          <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
              <div className="absolute inset-x-5 top-1/2 h-0.5 -translate-y-1/2 bg-slate-200" />
              <div className="absolute left-4 top-4 h-3 w-3 rounded-full bg-slate-300" />
              <div className="absolute bottom-4 right-4 h-3 w-3 rounded-full bg-slate-300" />
              <div
                className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ${step.bg} shadow-sm`}
              >
                <step.icon className={`h-8 w-8 ${step.iconColor}`} />
              </div>
              <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {index + 1}
              </div>
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {step.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StepSection({ title, intro, steps }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">
        {intro}
      </p>
      <VisualSteps steps={steps} />
      <FlowChart steps={steps} />
    </section>
  );
}

export default function HowToStartFundraising() {
  const navigate = useNavigate();
  const [fundraiserAccessOpen, setFundraiserAccessOpen] = useState(false);
  const fundraisingSteps = [
    {
      title: "Define The Goal",
      text: "Decide the exact purpose, target amount, deadline, and expected outcome.",
      icon: Target,
      bg: "bg-blue-100",
      iconColor: "text-blue-700",
      flowBg: "bg-blue-50",
    },
    {
      title: "Create The Page",
      text: "Add story, category, photos, amount breakup, location, and documents.",
      icon: FileText,
      bg: "bg-emerald-100",
      iconColor: "text-emerald-700",
      flowBg: "bg-emerald-50",
    },
    {
      title: "Publish And Share",
      text: "Share the campaign with close contacts first, then post on wider channels.",
      icon: Megaphone,
      bg: "bg-amber-100",
      iconColor: "text-amber-700",
      flowBg: "bg-amber-50",
    },
    {
      title: "Receive Support",
      text: "Supporters review the campaign and contribute through the platform flow.",
      icon: HandCoins,
      bg: "bg-rose-100",
      iconColor: "text-rose-700",
      flowBg: "bg-rose-50",
    },
    {
      title: "Track And Update",
      text: "Monitor progress, add updates, and keep supporters informed from dashboard.",
      icon: BarChart3,
      bg: "bg-indigo-100",
      iconColor: "text-indigo-700",
      flowBg: "bg-indigo-50",
    },
  ];

  const getSessionUser = () => {
    try {
      const rawUser =
        localStorage.getItem("user") || localStorage.getItem("loggedInUser");
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  };

  const handleStartFundraiser = () => {
    const user = getSessionUser();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const hasFundraiserAccount = Boolean(user?.access?.fundraiser?.enabled);

    if (!user || !token || !hasFundraiserAccount) {
      setFundraiserAccessOpen(true);
      return;
    }

    navigate("/fundraising");
  };

  return (
    <>
    <main className="bg-gradient-to-b from-white to-slate-50 text-slate-800">
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-12 md:px-10 md:pb-14 md:pt-16">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
          Fundraising Guide
        </p>
        <h1 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
          How To Start A Fundraising
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600 md:text-lg">
          A simple and professional walkthrough of fundraising: what it is, how it works,
          which model to choose, and how to run a campaign that people understand and trust.
        </p>
      </section>

      <ZigSection
        title="What Is Fundraising?"
        text="Fundraising means collecting financial support from people for a cause, project, startup, or business objective. A strong fundraiser clearly explains why money is needed, how much is needed, how it will be used, and what outcomes will be delivered."
        image={heroImage}
        alt="Fundraising presentation and campaign overview"
      >
        <p className="mt-3 text-sm leading-8 text-slate-700 md:text-base">
          On this platform, fundraising happens through a structured campaign page where you add your story,
          target amount, timeline, and supporting proof so contributors can make informed decisions.
        </p>
        <p className="mt-3 text-sm leading-8 text-slate-700 md:text-base">
          Think of your fundraiser page as a public explanation of your plan. It
          should answer the basic questions quickly: who you are, what you are
          building or solving, why support is needed now, and what progress
          people can expect after the funds are used.
        </p>
      </ZigSection>

      <StepSection
        title="How Fundraising Works: Step By Step"
        intro="This is the complete fundraising flow from idea to campaign tracking. Follow it in order so your page feels planned, trustworthy, and easy for supporters to understand."
        steps={fundraisingSteps}
      />

      <ZigSection
        title="How Fundraising Helps"
        text="Fundraising helps founders and creators move faster from idea to execution. It also builds trust because your campaign stays transparent with progress and updates."
        image={helpsImage}
        alt="Supporters contributing through donation-based fundraising"
        reverse
      >
        <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-8 text-slate-700 md:text-base">
          <li>Raises early capital for launch and growth.</li>
          <li>Creates a visible community of supporters.</li>
          <li>Validates your idea before large expansion.</li>
          <li>Encourages accountability through regular updates.</li>
          <li>Turns your campaign story into a shareable page.</li>
          <li>Helps supporters understand where every major rupee will go.</li>
        </ul>
      </ZigSection>

      <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Before You Create A Fundraiser
        </h2>
        <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">
          A campaign becomes much stronger when the important details are ready
          before you start filling the form. Keep the goal specific and avoid
          vague descriptions like "need funds for business" without explaining
          the plan.
        </p>
        <DetailGrid
          items={[
            {
              title: "Clear Goal",
              text: "Write one direct goal, such as buying equipment, paying treatment costs, launching a product, or expanding operations.",
            },
            {
              title: "Target Amount",
              text: "Break the amount into real cost heads so supporters can see why the requested total makes sense.",
            },
            {
              title: "Timeline",
              text: "Mention when the funds are needed and what milestones will happen after the campaign receives support.",
            },
            {
              title: "Proof Details",
              text: "Prepare documents, photos, invoices, medical papers, business proof, or any material that improves trust.",
            },
            {
              title: "Campaign Story",
              text: "Explain the background, the problem, your plan, and the outcome in simple language.",
            },
            {
              title: "Update Plan",
              text: "Decide how you will post progress updates after publishing so supporters feel informed.",
            },
          ]}
        />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Common Types Of Fundraisers
        </h2>
        <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">
          Before choosing donation-based or investment-based fundraising, it helps
          to identify your fundraiser category. Different categories attract
          different supporter behavior and communication style.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Startup Launch Fundraiser",
            "Business Expansion Fundraiser",
            "Medical Emergency Fundraiser",
            "Education Support Fundraiser",
            "Social Cause Fundraiser",
            "Community Development Fundraiser",
            "Creative Project Fundraiser",
            "NGO / Non-Profit Fundraiser",
            "Event-Based Fundraiser",
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          What A Strong Fundraiser Page Should Include
        </h2>
        <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">
          The best fundraiser pages are not complicated. They are complete,
          honest, and easy to scan. A supporter should understand your campaign
          without needing to ask basic follow-up questions.
        </p>
        <DetailGrid
          items={[
            {
              title: "Short Title",
              text: "Use a title that explains the purpose clearly, such as Help Us Open Our First Cloud Kitchen.",
            },
            {
              title: "Strong Opening",
              text: "The first paragraph should explain who you are, what you need, and why the campaign matters.",
            },
            {
              title: "Use Of Funds",
              text: "Show where the money will be spent: equipment, rent, medicine, education fees, production, or operations.",
            },
            {
              title: "Visual Proof",
              text: "Add real photos, campaign media, documents, or progress visuals that make the story believable.",
            },
            {
              title: "Milestones",
              text: "List what will happen after 25 percent, 50 percent, 75 percent, and 100 percent of the goal is reached.",
            },
            {
              title: "Contactable Identity",
              text: "Keep profile details, location, and organizer information accurate so the campaign feels accountable.",
            },
          ]}
        />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Types Of Fundraising On This Platform
        </h2>

        <div className="mt-8 space-y-10">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold text-slate-900">1. Donation-Based Fundraising</h3>
              <p className="mt-3 text-sm leading-8 text-slate-700 md:text-base">
                Donation-based fundraising is support-first. People contribute because they believe in your mission
                and impact, not because they expect financial return.
              </p>
              <p className="mt-3 text-sm leading-8 text-slate-700 md:text-base">
                Example: Raising Rs 300,000 for medical support with weekly treatment updates.
              </p>
            </div>
            <img
              src={donationImage}
              alt="Donation model for fundraising"
              className="h-[210px] w-full rounded-2xl object-cover shadow-md md:h-[250px]"
            />
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-2">
            <img
              src={investmentImage}
              alt="Investment model for fundraising"
              className="order-1 h-[210px] w-full rounded-2xl object-cover shadow-md md:h-[250px] lg:order-2"
            />
            <div className="order-2 lg:order-1">
              <h3 className="text-xl font-bold text-slate-900">2. Investment-Based Fundraising</h3>
              <p className="mt-3 text-sm leading-8 text-slate-700 md:text-base">
                Investment-based fundraising is growth-first. Contributors back campaigns with a business mindset,
                so your milestones, plan, and execution quality matter more.
              </p>
              <p className="mt-3 text-sm leading-8 text-slate-700 md:text-base">
                Example: Raising Rs 1,000,000 for expanding production and entering two new markets.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          How To Share Your Fundraiser
        </h2>
        <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">
          Publishing the page is only the first step. Fundraising works better
          when you share consistently with the right people and explain progress
          without sounding pushy.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">First 48 Hours</h3>
            <p className="mt-3 text-sm leading-8 text-slate-700">
              Share with close family, friends, colleagues, existing customers,
              and people who already understand your work. Early support makes
              the campaign look active and credible.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Weekly Updates</h3>
            <p className="mt-3 text-sm leading-8 text-slate-700">
              Post updates about amount raised, documents added, work completed,
              new photos, or next milestones. Regular updates build trust after
              the first contribution.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Common Mistakes To Avoid
        </h2>
        <ul className="mt-5 list-disc space-y-3 pl-6 text-sm leading-8 text-slate-700 md:text-base">
          <li>Asking for a large amount without explaining the cost breakup.</li>
          <li>Using generic images instead of real campaign photos or proof.</li>
          <li>Writing a long story without a clear goal or next step.</li>
          <li>Publishing once and never sharing updates.</li>
          <li>Changing important campaign details without explaining why.</li>
          <li>Ignoring profile, KYC, bank, or document verification steps.</li>
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-8 md:px-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Practical Campaign Example
        </h2>
        <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">
          Suppose you want to launch a home food brand and need Rs 500,000. Your campaign can explain costs for
          kitchen setup, licensing, packaging, and first-month delivery operations. Then share the page with your
          community and post weekly progress updates.
        </p>
        <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">
          This makes your campaign easy to understand, trustworthy, and actionable for supporters.
        </p>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-900">
            Example Cost Breakup
          </h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3">Kitchen setup: Rs 220,000</div>
            <div className="rounded-xl bg-slate-50 p-3">Licensing: Rs 60,000</div>
            <div className="rounded-xl bg-slate-50 p-3">Packaging: Rs 90,000</div>
            <div className="rounded-xl bg-slate-50 p-3">Operations: Rs 130,000</div>
          </div>
          <p className="mt-4 text-sm leading-8 text-slate-700">
            A simple breakup like this helps supporters understand that the goal
            is planned, not random.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleStartFundraiser}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Start Fundraiser Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/fundraising-ideas")}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Explore Fundraising Ideas
          </button>
        </div>
      </section>
    </main>
    <AccessModeModal
      open={fundraiserAccessOpen}
      onClose={() => setFundraiserAccessOpen(false)}
      onLogin={() => {
        setFundraiserAccessOpen(false);
        navigate("/login");
      }}
      title="Fundraiser account needed"
      message="You need a fundraiser account to start fundraising. Please login with a fundraiser account or create one first."
      buttonLabel="Go to Login"
    />
    </>
  );
}
