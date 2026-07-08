import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, HandCoins, Rocket, ShieldCheck } from "lucide-react";
import SEO from "../components/SEO.jsx";

const searchTopics = [
  {
    icon: Rocket,
    title: "MateBid raising",
    text: "Create a campaign for a startup, business, NGO, education need, medical need, or community cause with a guided raiser workflow.",
  },
  {
    icon: HandCoins,
    title: "MateBid contributing",
    text: "Support verified campaigns with clear goals, progress details, and secure contribution handling through the M8BID platform.",
  },
  {
    icon: BadgeCheck,
    title: "MateBid funding",
    text: "Use MateBid to present funding needs professionally, build trust with supporters, and keep campaign progress transparent.",
  },
  {
    icon: ShieldCheck,
    title: "MateBid trust",
    text: "M8BID focuses on KYC-backed workflows, campaign review, and clean information so raisers and contributors can act with confidence.",
  },
];

export default function MateBidBrandPage() {
  return (
    <>
      <SEO
        title="MateBid / M8BID - Raising, Funding & Contributing Platform"
        description="MateBid, also known as M8BID, is a raising, funding, and contributing platform for startups, businesses, NGOs, causes, and verified campaigns in India."
        keywords="MateBid, matebid, M8BID, m8bid, MateBid raising, MateBid funding, MateBid contributing, MateBid fundraiser, MateBid campaigns, M8BID funding, M8BID contributing, online raising India"
        canonical="/matebid"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": "https://www.matebid.com/matebid",
          url: "https://www.matebid.com/matebid",
          name: "MateBid / M8BID - Raising, Funding & Contributing Platform",
          description:
            "MateBid, also known as M8BID, is a raising, funding, and contributing platform for startups, businesses, NGOs, causes, and verified campaigns in India.",
          isPartOf: { "@id": "https://www.matebid.com/#website" },
          about: { "@id": "https://www.matebid.com/#organization" },
          mainEntity: {
            "@type": "Organization",
            "@id": "https://www.matebid.com/#organization",
            name: "MateBid",
            alternateName: ["M8BID", "matebid", "m8bid"],
            url: "https://www.matebid.com",
          },
        }}
      />

      <main className="bg-slate-50 text-slate-900">
        <section className="px-6 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                MateBid / M8BID
              </p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">
                MateBid is M8BID, a platform for raising, funding, and contributing.
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                MateBid, written as M8BID, helps founders, businesses, NGOs, and
                cause creators launch structured campaigns while giving contributors
                a clear way to discover and support verified opportunities.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/how-to-start-a-fundraising"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                >
                  Start raising
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  to="/how-to-invest"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100"
                >
                  Learn contributing
                </Link>
              </div>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {searchTopics.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                      <Icon className="h-5 w-5 text-blue-700" />
                    </div>
                    <h2 className="mt-4 text-xl font-bold">{item.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
