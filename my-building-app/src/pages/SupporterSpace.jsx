import React from "react";
import {
  HeartHandshake,
  ShieldCheck,
  HelpCircle,
  Bell,
  BadgeCheck,
  ArrowRight,
  Users,
  FileCheck,
  BarChart3,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const highlights = [
  {
    icon: HeartHandshake,
    title: "Support with clarity",
    desc: "Understand how contributions work and what campaign support means on the platform.",
  },
  {
    icon: ShieldCheck,
    title: "Trust-first experience",
    desc: "Supporter confidence is strengthened through structured workflows and better campaign visibility.",
  },
  {
    icon: Bell,
    title: "Stay updated",
    desc: "Follow campaign progress, milestone updates, and supporter-facing announcements.",
  },
];

const sections = [
  {
    icon: FileCheck,
    title: "How supporter contributions work",
    points: [
      "Supporters can contribute to campaigns that align with their interests, values, or goals.",
      "Each campaign is presented with a funding goal, campaign story, progress indicators, and relevant supporting details.",
      "The supporter journey is designed to be simple: discover a campaign, review it, contribute, and track progress over time.",
      "Campaign visibility and structure help supporters make decisions with more context instead of relying only on emotional appeal.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Why trust matters for supporters",
    points: [
      "Supporters need confidence that the platform is not just displaying campaigns, but presenting them within a reliable and transparent system.",
      "Trust comes from clearer campaign information, visible funding progress, structured review workflows, and secure contribution handling.",
      "A strong supporter ecosystem is built when people understand where they are contributing, why the campaign exists, and how progress is communicated.",
      "The platform experience should reduce uncertainty and increase confidence at every step.",
    ],
  },
  {
    icon: MessageCircle,
    title: "What supporters should review before contributing",
    points: [
      "Campaign purpose and funding goal",
      "Clarity of the story and whether the campaign objective is well explained",
      "Milestone structure and expected next steps",
      "Updates from the fundraiser and the consistency of communication",
      "Platform trust signals such as structured presentation and workflow-based credibility",
    ],
  },
  {
    icon: BarChart3,
    title: "What makes supporter space valuable",
    points: [
      "It provides a dedicated area for people who are not necessarily looking for financial return, but still want transparency and accountability.",
      "It helps explain campaign mechanics in a simpler way for new users.",
      "It encourages confidence through knowledge, not just promotion.",
      "It supports long-term engagement by giving supporters updates, clarity, and a stronger sense of campaign connection.",
    ],
  },
];

const faqs = [
  {
    q: "Who is supporter space for?",
    a: "Supporter Space is for users who want to contribute to campaigns, understand how funding works on the platform, and follow campaign progress with more confidence.",
  },
  {
    q: "Does supporter space only apply to donation-style campaigns?",
    a: "Not necessarily. It mainly supports users who want to understand and engage with campaigns from a supporter perspective, even if the campaign structure varies.",
  },
  {
    q: "What should a supporter expect after contributing?",
    a: "A supporter should expect transparency around campaign progress, updates from the fundraiser when applicable, and a clear record of their participation.",
  },
];

function SectionCard({ icon: Icon, title, points }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
          <Icon className="h-5 w-5 text-blue-700" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900">{title}</h3>
      </div>

      <div className="mt-5 space-y-3">
        {points.map((point, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-slate-400" />
            <p className="text-sm leading-7 text-slate-600">{point}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SupporterSpace() {
  return (
    <section
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 px-6 py-16 md:py-20"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Hero */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
            <HeartHandshake className="h-4 w-4 text-blue-700" />
            Supporter Space
          </div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            A clearer and more trusted space for supporters
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Supporter Space is designed for people who want to contribute with confidence.
            It explains how campaigns work, what to review before contributing, and why
            transparency, updates, and trust signals matter in a healthy fundraising ecosystem.
          </p>
        </div>

        {/* Highlights */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-900" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Main detail sections */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {sections.map((section, idx) => (
            <SectionCard key={idx} {...section} />
          ))}
        </div>

        {/* Informational strip */}
        <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-900 px-6 py-8 text-white shadow-lg">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Supporter confidence</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                A platform grows stronger when supporters feel informed, respected, and protected.
              </p>
            </div>

            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Better understanding</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                The goal is not just to increase contributions, but to improve how people understand what they are supporting.
              </p>
            </div>

            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Long-term engagement</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Good supporter spaces help build ongoing engagement through transparency, updates, and confidence.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <div className="mt-6 grid gap-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 h-5 w-5 text-blue-700" />
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{faq.q}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Explore live opportunities</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Browse active campaigns and discover how platform structure supports better supporter decisions.
            </p>
          </div>

          <Link
            to="/browse-investors"
            className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
          >
            Browse campaigns
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}