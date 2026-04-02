import React from "react";
import {
  HeartHandshake,
  ShieldCheck,
  BadgeCheck,
  Users,
  Megaphone,
  FileText,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const topCards = [
  {
    icon: HeartHandshake,
    title: "Support-oriented campaigns",
    desc: "Cause-based funding is best for campaigns built around help, support, care, community impact, or mission-driven fundraising.",
  },
  {
    icon: ShieldCheck,
    title: "Trust and transparency",
    desc: "Cause-based campaigns need emotional clarity, but also strong trust signals so supporters understand where the money goes.",
  },
  {
    icon: Users,
    title: "Community connection",
    desc: "The strongest cause-based campaigns build connection, urgency, and shared purpose without losing transparency.",
  },
];

const sections = [
  {
    icon: FileText,
    title: "What belongs in a cause-based funding page",
    points: [
      "A clear explanation of the cause, need, or mission",
      "An honest description of why support is required now",
      "A simple funding goal and purpose breakdown",
      "Updates or milestones that help supporters follow the journey",
    ],
  },
  {
    icon: Megaphone,
    title: "How cause-based campaigns should communicate",
    points: [
      "The message should be emotional, but still clear and responsible.",
      "Supporters should understand exactly what their contribution is helping to achieve.",
      "The page should avoid vague storytelling and focus on a real, understandable purpose.",
    ],
  },
  {
    icon: BadgeCheck,
    title: "What makes these campaigns stronger",
    points: [
      "A real and clearly defined cause",
      "Visible transparency around usage of funds",
      "Regular updates and honest communication",
      "A campaign page that feels human, respectful, and trustworthy",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Why this page matters",
    points: [
      "Cause-based funding pages help people support with empathy, but also with clarity.",
      "They reduce uncertainty by explaining what is needed and why the campaign deserves trust.",
      "A professional page makes support feel safer and more meaningful.",
    ],
  },
];

const faqs = [
  {
    q: "What is cause-based funding?",
    a: "Cause-based funding refers to campaigns focused on support, mission, or community need rather than structured return-oriented participation.",
  },
  {
    q: "What should supporters see on these pages?",
    a: "Supporters should see a clear cause explanation, funding purpose, trust signals, and updates that help them understand the campaign better.",
  },
  {
    q: "Why is transparency important in cause-based campaigns?",
    a: "Because emotional connection alone is not enough. Supporters also need confidence that the campaign is genuine and clearly explained.",
  },
];

function SectionCard({ icon: Icon, title, points }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
          <Icon className="h-5 w-5 text-rose-700" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      </div>

      <div className="mt-5 space-y-3">
        {points.map((point, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-rose-600" />
            <p className="text-sm leading-7 text-slate-600">{point}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CauseBasedFunding() {
  return (
    <section
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30 px-6 py-16 md:py-20"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
            <HeartHandshake className="h-4 w-4 text-rose-700" />
            Cause-Based Funding
          </div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Fundraising built around purpose, support, and trust
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Cause-based funding is designed for campaigns where the goal is support,
            community impact, or mission-driven fundraising. These pages should feel
            human, clear, and trustworthy.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {topCards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-900" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {sections.map((section, idx) => (
            <SectionCard key={idx} {...section} />
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-900 px-6 py-8 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-rose-300" />
            <h2 className="text-xl font-bold">What a strong cause-based page should communicate</h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm font-semibold">Why help is needed</p>
              <p className="mt-2 text-sm text-slate-300">The cause should be explained honestly and clearly.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm font-semibold">How support will be used</p>
              <p className="mt-2 text-sm text-slate-300">People should know what their money is contributing toward.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm font-semibold">Why the campaign deserves trust</p>
              <p className="mt-2 text-sm text-slate-300">Transparency and updates increase confidence.</p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <div className="mt-6 grid gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 h-5 w-5 text-rose-700" />
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{faq.q}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Start a support-driven campaign</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Build a cause-based page that is honest, supportive, and clear to the people you want to reach.
            </p>
          </div>

          <Link
            to="/fundraising"
            className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
          >
            Start now
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}