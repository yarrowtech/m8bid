import React, { useState } from "react";
import {
  ArrowRight,
  ClipboardCheck,
  LineChart,
  LogIn,
  Search,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/investors-hero.jpg";
import compareImage from "../assets/growth-chart.jpg";
import secureImage from "../assets/secure.png";
import campaignImage from "../assets/fundraising-example.jpg";
import AccessModeModal from "../components/AccessModeModal.jsx";

function ZigSection({ title, text, image, alt, reverse = false, children }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div className={reverse ? "order-2 lg:order-1" : "order-2 lg:order-2"}>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">
            {text}
          </p>
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

export default function HowToInvest() {
  const navigate = useNavigate();
  const [investorAccessOpen, setInvestorAccessOpen] = useState(false);
  const investingSteps = [
    {
      title: "Login As Investor",
      text: "Use an investor account so campaign browsing and transactions are connected to your profile.",
      icon: LogIn,
      bg: "bg-blue-100",
      iconColor: "text-blue-700",
      flowBg: "bg-blue-50",
    },
    {
      title: "Browse Campaigns",
      text: "Open campaign listings and compare categories, target amounts, progress, and purpose.",
      icon: Search,
      bg: "bg-emerald-100",
      iconColor: "text-emerald-700",
      flowBg: "bg-emerald-50",
    },
    {
      title: "Review Details",
      text: "Read the story, organizer information, use of funds, timeline, documents, and updates.",
      icon: ClipboardCheck,
      bg: "bg-amber-100",
      iconColor: "text-amber-700",
      flowBg: "bg-amber-50",
    },
    {
      title: "Choose Amount",
      text: "Select a contribution amount that matches your interest and comfort level.",
      icon: Wallet,
      bg: "bg-rose-100",
      iconColor: "text-rose-700",
      flowBg: "bg-rose-50",
    },
    {
      title: "Track Activity",
      text: "After payment, check dashboard records, transaction status, and campaign progress.",
      icon: LineChart,
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

  const handleBrowseInvestors = () => {
    const user = getSessionUser();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const hasInvestorAccount = Boolean(user?.access?.investor?.enabled);

    if (!user || !token || !hasInvestorAccount) {
      setInvestorAccessOpen(true);
      return;
    }

    navigate("/browse-investors");
  };

  return (
    <>
      <main className="bg-gradient-to-b from-white to-slate-50 text-slate-800">
        <section className="mx-auto max-w-6xl px-6 pb-10 pt-12 md:px-10 md:pb-14 md:pt-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
            Investor Guide
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
            How To Invest In Campaigns
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600 md:text-lg">
            A clear walkthrough for investors: what investing means on this
            platform, how to review campaigns, what details to check, and how to
            invest with confidence.
          </p>
        </section>

        <ZigSection
          title="What Does Investing Mean Here?"
          text="Investing means supporting selected campaigns after reviewing their idea, goal, documents, progress, and creator details. The purpose is to help users make informed decisions instead of clicking into campaigns without context."
          image={heroImage}
          alt="Investor reviewing campaign opportunities"
        >
          <p className="mt-3 text-sm leading-8 text-slate-700 md:text-base">
          On this platform, investors browse campaign pages, compare important
          information, understand the fundraising purpose, and contribute
          through a guided payment flow.
        </p>
          <p className="mt-3 text-sm leading-8 text-slate-700 md:text-base">
            The goal is not to click quickly. The goal is to understand the
            campaign well enough to decide whether the purpose, organizer,
            amount, timeline, and risk level make sense for you.
          </p>
        </ZigSection>

        <StepSection
          title="How Investing Works: Step By Step"
          intro="Use this visual flow to understand the investor journey before you browse campaigns. Each step helps you move from discovery to a more informed decision."
          steps={investingSteps}
        />

        <ZigSection
          title="How Investing Helps"
          text="Investing helps promising campaigns receive support while giving investors a structured way to discover projects, businesses, and causes that match their interests."
          image={compareImage}
          alt="Investment growth and comparison chart"
          reverse
        >
          <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-8 text-slate-700 md:text-base">
            <li>Discover campaigns with clear goals and public details.</li>
            <li>Compare campaign purpose, target amount, and progress.</li>
            <li>Support founders, projects, causes, or business growth.</li>
            <li>Track your investment activity from your dashboard.</li>
            <li>Build a personal history of campaigns you have reviewed.</li>
            <li>Use verification signals to avoid poorly explained campaigns.</li>
          </ul>
        </ZigSection>

        <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Before You Invest
          </h2>
          <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">
            A good investor slows down for a few minutes before paying. Read the
            campaign, compare the numbers, and check whether the organizer has
            explained the important details clearly.
          </p>
          <DetailGrid
            items={[
              {
                title: "Account Readiness",
                text: "Login with an investor account and complete any required profile, KYC, or bank details before investing.",
              },
              {
                title: "Campaign Fit",
                text: "Check whether the campaign type matches what you want to support: business, startup, cause, education, medical, or community.",
              },
              {
                title: "Amount Comfort",
                text: "Only invest an amount you are comfortable contributing after reviewing the campaign details.",
              },
              {
                title: "Organizer Clarity",
                text: "Look for a clear organizer name, profile details, location, and explanation of why funds are needed.",
              },
              {
                title: "Proof Review",
                text: "Review uploaded photos, documents, invoices, updates, or other signals that support the campaign story.",
              },
              {
                title: "Progress Check",
                text: "Notice how much has been raised, how recently the campaign was updated, and whether the goal looks realistic.",
              },
            ]}
          />
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            What To Check Before Investing
          </h2>
          <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">
            A good investment decision starts with reading the campaign carefully.
            These are the main details an investor should review before moving
            forward.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Campaign title and purpose",
              "Founder or organizer details",
              "Funding target and raised amount",
              "Timeline and urgency",
              "Use of funds",
              "Photos, videos, or proof documents",
              "Campaign status and verification signals",
              "Risks, updates, and communication quality",
              "Payment and transaction clarity",
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
            How To Read A Campaign Page
          </h2>
          <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">
            Campaign pages usually contain many details. Read them in a simple
            order so you do not miss the information that matters most.
          </p>
          <DetailGrid
            items={[
              {
                title: "Story First",
                text: "Understand the problem, goal, and reason the fundraiser exists before looking at the payment button.",
              },
              {
                title: "Money Second",
                text: "Check the target amount, raised amount, and how the organizer says the money will be used.",
              },
              {
                title: "Trust Third",
                text: "Look for verification status, documents, photos, updates, and profile completeness.",
              },
              {
                title: "Timeline Fourth",
                text: "Review how urgent the campaign is and whether the organizer has shared future milestones.",
              },
              {
                title: "Updates Fifth",
                text: "A campaign with regular updates usually gives investors better visibility into progress.",
              },
              {
                title: "Decision Last",
                text: "Invest only after the campaign purpose, amount, trust signals, and risk level are clear to you.",
              },
            ]}
          />
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Types Of Campaigns You Can Explore
          </h2>

          <div className="mt-8 space-y-10">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  1. Growth And Business Campaigns
                </h3>
                <p className="mt-3 text-sm leading-8 text-slate-700 md:text-base">
                  These campaigns usually focus on business expansion, product
                  launch, team hiring, production, or market growth. Investors
                  should check milestones, use of funds, and execution clarity.
                </p>
                <p className="mt-3 text-sm leading-8 text-slate-700 md:text-base">
                  Example: Supporting a startup raising Rs 1,000,000 to expand
                  production and reach new customers.
                </p>
              </div>
              <img
                src={campaignImage}
                alt="Campaign card preview for investors"
                className="h-[210px] w-full rounded-2xl object-cover shadow-md md:h-[250px]"
              />
            </div>

            <div className="grid items-center gap-8 lg:grid-cols-2">
              <img
                src={secureImage}
                alt="Secure investment process"
                className="order-1 h-[210px] w-full rounded-2xl object-cover shadow-md md:h-[250px] lg:order-2"
              />
              <div className="order-2 lg:order-1">
                <h3 className="text-xl font-bold text-slate-900">
                  2. Support And Cause Campaigns
                </h3>
                <p className="mt-3 text-sm leading-8 text-slate-700 md:text-base">
                  These campaigns focus on support, impact, or community needs.
                  Investors and supporters should review the story, proof,
                  beneficiary details, and transparency of updates.
                </p>
                <p className="mt-3 text-sm leading-8 text-slate-700 md:text-base">
                  Example: Supporting a verified campaign with a clear goal,
                  regular updates, and transparent fund usage.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Understanding Risk And Trust
          </h2>
          <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">
            Every campaign has some level of uncertainty. Trust signals do not
            remove all risk, but they help you understand whether the campaign
            has been explained responsibly.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">
                Strong Trust Signals
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-8 text-slate-700">
                <li>Specific use of funds with cost breakup.</li>
                <li>Real photos, documents, or proof files.</li>
                <li>Verified profile or completed required checks.</li>
                <li>Regular updates and clear communication.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">
                Warning Signs
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-8 text-slate-700">
                <li>Very large target with no cost explanation.</li>
                <li>Unclear organizer identity or missing details.</li>
                <li>No documents, images, milestones, or updates.</li>
                <li>Story sounds urgent but does not explain proof.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            After You Invest
          </h2>
          <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">
            The investment journey does not end after payment. Use your dashboard
            and campaign updates to keep track of your activity and understand
            how the campaign is progressing.
          </p>
          <DetailGrid
            items={[
              {
                title: "Check Dashboard",
                text: "Review your investment history, transaction status, and any campaign activity connected to your account.",
              },
              {
                title: "Follow Updates",
                text: "Look for progress notes from the fundraiser, especially after milestones or major campaign changes.",
              },
              {
                title: "Keep Records",
                text: "Save transaction references and review the campaign details again if you need to understand your contribution later.",
              },
              {
                title: "Compare Campaigns",
                text: "Over time, compare campaigns you supported with campaigns you skipped to sharpen your judgment.",
              },
              {
                title: "Avoid Pressure",
                text: "Do not invest only because a campaign looks urgent. Make sure the details are understandable.",
              },
              {
                title: "Support Responsibly",
                text: "Choose contribution amounts that fit your own budget and comfort level.",
              },
            ]}
          />
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Common Mistakes To Avoid
          </h2>
          <ul className="mt-5 list-disc space-y-3 pl-6 text-sm leading-8 text-slate-700 md:text-base">
            <li>Investing without opening the full campaign details page.</li>
            <li>Looking only at the title and ignoring use of funds.</li>
            <li>Assuming every campaign has the same risk level.</li>
            <li>Ignoring missing documents, unclear updates, or weak proof.</li>
            <li>Investing more than you are comfortable contributing.</li>
            <li>Forgetting to check transaction status after payment.</li>
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 pt-8 md:px-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Practical Investment Example
          </h2>
          <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">
            Suppose a food brand is raising Rs 500,000 for equipment, packaging,
            and first-month operations. You can review the campaign story, target,
            current progress, documents, and updates before deciding whether it
            matches your interest.
          </p>
          <p className="mt-4 text-sm leading-8 text-slate-700 md:text-base">
            This makes the investment process easier to understand and helps you
            support campaigns with more confidence.
          </p>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">
              Example Review Notes
            </h3>
            <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-3">Goal: Rs 500,000</div>
              <div className="rounded-xl bg-slate-50 p-3">Use: equipment and packaging</div>
              <div className="rounded-xl bg-slate-50 p-3">Proof: photos and invoices</div>
              <div className="rounded-xl bg-slate-50 p-3">Updates: weekly progress</div>
            </div>
            <p className="mt-4 text-sm leading-8 text-slate-700">
              Simple notes like these help an investor compare campaigns without
              relying only on emotion or urgency.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleBrowseInvestors}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Browse Investors Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/verified-opportunities")}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              View Verified Opportunities
            </button>
          </div>
        </section>
      </main>
      <AccessModeModal
        open={investorAccessOpen}
        onClose={() => setInvestorAccessOpen(false)}
        onLogin={() => {
          setInvestorAccessOpen(false);
          navigate("/login");
        }}
        title="Investor account needed"
        message="You need an investor account to browse and invest in campaigns. Please login with an investor account or create one first."
        buttonLabel="Go to Login"
      />
    </>
  );
}
