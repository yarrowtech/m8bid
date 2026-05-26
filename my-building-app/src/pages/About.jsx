import React from "react";
import {
  Info,
  ShieldCheck,
  MessageCircle,
  Eye,
  BadgeCheck,
  ArrowRight,
  Users,
  Lightbulb,
} from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO.jsx";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Trust & Transparency",
    desc: "Every campaign on M8BID goes through structured workflows that ensure clearer information, visible progress, and credible presentation for supporters.",
  },
  {
    icon: Eye,
    title: "Clear Visibility",
    desc: "We believe supporters should always understand what they are contributing to — with honest raising goals, real updates, and milestone tracking.",
  },
  {
    icon: Users,
    title: "Community First",
    desc: "M8BID is built for founders, businesses, causes, and supporters — bringing them together through a professional and reliable digital experience.",
  },
  {
    icon: Lightbulb,
    title: "Simplicity at Scale",
    desc: "Creating and managing a campaign should feel straightforward. We focus on clean interfaces and guided workflows so anyone can launch with confidence.",
  },
];

const whyPoints = [
  "Professional campaign creation and structured presentation",
  "Support for both contribution-based and structured raising flows",
  "Clear tracking of campaign progress and supporter engagement",
  "Secure payment and trust-oriented platform design",
  "Admin oversight and workflow-based credibility",
  "KYC-backed verification for stronger campaign trust",
];

export default function About() {
  return (
    <>
      <SEO
        title="About M8BID — Trusted Raising & Campaign Platform in India"
        description="M8BID is a professional raising and campaign platform built to connect raisers, contributors, and supporters through transparent, credible, and structured campaigns."
        keywords="about M8BID, about MateBid, raising platform India, trusted campaign platform, campaign raising India, M8BID about us, raising for startups, campaign for causes, contributor platform India, transparent raising, credible campaigns India, professional raising platform"
        canonical="/about"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "AboutPage",
              "@id": "https://www.matebid.com/about",
              url: "https://www.matebid.com/about",
              name: "About M8BID — Trusted Raising & Campaign Platform in India | M8BID",
              description:
                "M8BID is a professional raising and campaign platform built to connect raisers, contributors, and supporters through transparent, credible, and structured campaigns.",
              isPartOf: { "@id": "https://www.matebid.com/#website" },
              about: { "@id": "https://www.matebid.com/#organization" },
              breadcrumb: {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: "https://www.matebid.com" },
                  { "@type": "ListItem", position: 2, name: "About", item: "https://www.matebid.com/about" },
                ],
              },
            },
          ],
        }}
      />
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
              <Info className="h-4 w-4 text-blue-700" />
              About M8BID
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Built to make raising more credible, transparent, and accessible
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              M8BID is a modern crowdfunding platform designed to connect founders,
              raisers, and supporters through a secure and professional digital
              experience. We focus on trust, transparency, and clear campaign
              presentation so users can raise and contribute with confidence.
            </p>
          </div>

          {/* Dark banner */}
          <div className="mt-14 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10 text-white shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Platform Overview
            </p>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">
              A platform where campaigns are not only visible — but believable.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              We believe raising should not feel confusing or unstructured. A good platform
              should help people tell their story clearly, show progress transparently, and
              create trust between campaign creators and supporters. That is why M8BID
              emphasizes secure workflows, clean interfaces, and visibility into every
              important step.
            </p>
          </div>

          {/* Pillars */}
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                    <Icon className="h-5 w-5 text-blue-700" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Who We Are + What We Believe */}
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <Info className="h-5 w-5 text-slate-900" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Who We Are</h3>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600">
                M8BID is a raising and campaign platform built for modern startups,
                causes, and business initiatives. Our goal is to simplify the way
                campaigns are created, presented, shared, and managed — while maintaining
                a professional and reliable experience for all users.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <ShieldCheck className="h-5 w-5 text-slate-900" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">What We Believe</h3>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600">
                We believe raising should not feel confusing or unstructured. A good
                platform should help people tell their story clearly, show progress
                transparently, and create trust between campaign creators and supporters.
                That is why M8BID emphasizes secure workflows, clean interfaces, and
                visibility into every important step.
              </p>
            </div>
          </div>

          {/* Why M8BID */}
          <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-900 px-8 py-8 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-blue-300" />
              <h2 className="text-xl font-bold">Why M8BID</h2>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {whyPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-2xl bg-white/10 p-4">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
                  <p className="text-sm leading-6 text-slate-200">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Our Vision */}
          <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <ShieldCheck className="h-5 w-5 text-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              Our vision is to make digital raising more trustworthy, more efficient, and
              more professional for founders, businesses, and supporters alike. We want
              M8BID to become a platform where campaigns are not only visible, but
              believable — where every user, whether raising or contributing, feels
              informed, respected, and confident in every step.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Ready to get started?</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Launch a raising campaign or discover verified opportunities on M8BID.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/how-to-start-a-fundraising"
                className="group inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                How to Start Raising
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
              >
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
