import React from "react";
import {
  Lightbulb,
  Megaphone,
  Target,
  LayoutTemplate,
  PenSquare,
  Users,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO.jsx";
import { useState } from "react";

const ideaCategories = [
  { title: "Startups & technology", ideas: ["Build a product prototype", "Launch an app or software tool", "Develop a hardware pilot", "Test a service with your first customers"] },
  { title: "Small businesses", ideas: ["Open a local shop", "Expand an existing business", "Buy equipment or tools", "Build an online store"] },
  { title: "Food & hospitality", ideas: ["Launch a bakery or café", "Start a food truck", "Upgrade a catering kitchen", "Create a packaged food brand"] },
  { title: "Education & learning", ideas: ["Fund course fees or study materials", "Create a learning app", "Set up a tutoring space", "Run practical skills workshops"] },
  { title: "Art & design", ideas: ["Produce an art exhibition", "Launch a handmade collection", "Create a design studio", "Buy materials for a public art project"] },
  { title: "Film, music & publishing", ideas: ["Produce a short film", "Record an independent album", "Publish a book or comic", "Launch a podcast or documentary series"] },
  { title: "Agriculture & food production", ideas: ["Install farm irrigation", "Build a greenhouse", "Buy processing or storage equipment", "Start a local produce delivery service"] },
  { title: "Environment & sustainability", ideas: ["Develop reusable packaging", "Start a repair and reuse workshop", "Install rainwater collection", "Pilot a recycling service"] },
  { title: "Sports & recreation", ideas: ["Buy team equipment", "Support tournament participation", "Build a training space", "Organize a local sports event"] },
  { title: "Community spaces & events", ideas: ["Create a shared workshop", "Improve a neighborhood reading space", "Organize a cultural festival", "Build a community garden"] },
  { title: "Fashion & handmade products", ideas: ["Launch a clothing collection", "Buy sewing or crafting equipment", "Create a local artisan marketplace", "Produce a first batch of accessories"] },
  { title: "Personal projects & careers", ideas: ["Build a professional portfolio", "Fund a certification course", "Buy tools for freelance work", "Develop an independent research project"] },
];

const ideaCards = [
  {
    icon: Lightbulb,
    title: "Campaign direction ideas",
    desc: "Helpful starting points for people who know they want to raise funds, but are unsure how to shape the campaign.",
  },
  {
    icon: PenSquare,
    title: "Storytelling ideas",
    desc: "Practical ways to make a raising page more compelling, understandable, and emotionally engaging.",
  },
  {
    icon: Megaphone,
    title: "Promotion ideas",
    desc: "Simple approaches for sharing your raiser and building momentum after launch.",
  },
];

const ideaSections = [
  {
    icon: Target,
    title: "Good raising campaign ideas often start with",
    points: [
      "A very clear purpose for why funds are needed",
      "A target amount that feels realistic and explainable",
      "A story people can understand quickly",
      "A timeline or milestone idea that makes progress easier to follow",
    ],
  },
  {
    icon: LayoutTemplate,
    title: "Strong page-building ideas",
    points: [
      "Use a simple and specific campaign title",
      "Explain the campaign in plain language, not overly formal text",
      "Break the goal into visible milestones where possible",
      "Add visuals or updates that make the page feel active and real",
    ],
  },
  {
    icon: Users,
    title: "Ways to improve engagement",
    points: [
      "Share early with close supporters before wider promotion",
      "Post campaign updates to keep attention alive",
      "Use real examples, progress snapshots, or milestone wins",
      "Keep the message consistent across all places where the campaign is shared",
    ],
  },
  {
    icon: Megaphone,
    title: "What raising ideas should avoid",
    points: [
      "Vague titles that do not explain the campaign clearly",
      "Unclear funding goals with no explanation",
      "Pages with no updates or weak storytelling",
      "Overpromising without enough substance or structure",
    ],
  },
];

const sampleIdeas = [
  "Raise for a product launch or first market entry",
  "Fund a small business expansion or second location",
  "Support a cause-based initiative or community need",
  "Launch a startup prototype or MVP build",
  "Raise operational support for a high-potential project",
  "Build a campaign around a milestone such as hiring, equipment, or growth capacity",
];

const faqs = [
  {
    q: "What if I do not know how to start my campaign?",
    a: "Start with the funding purpose, the amount needed, and why it matters now. Those three points are usually enough to shape the first version of a strong campaign.",
  },
  {
    q: "Do raising ideas need to be very unique?",
    a: "Not always. A campaign does not need to be unusual — it needs to be clear, well structured, and believable.",
  },
  {
    q: "What makes a raising idea effective?",
    a: "A good idea becomes effective when it is presented with clarity, trust, realistic goals, and a story that connects with people.",
  },
];

function SectionCard({ icon: Icon, title, points }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
          <Icon className="h-5 w-5 text-amber-700" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      </div>

      <div className="mt-5 space-y-3">
        {points.map((point, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-amber-600" />
            <p className="text-sm leading-7 text-slate-600">{point}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RaisingIdeas() {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const visibleCategories = ideaCategories.map((category) => ({
    ...category,
    ideas: category.title.toLowerCase().includes(query)
      ? category.ideas
      : category.ideas.filter((idea) => idea.toLowerCase().includes(query)),
  })).filter((category) => category.ideas.length > 0);
  return (
    <>
      <SEO
        title="Raising Ideas — Business, Education & Creative Projects"
        description="Explore 48 raising ideas across business, education, art, agriculture, sports, and community projects. Find your next campaign idea on MateBid."
        keywords="raising campaign ideas, how to start a raising campaign, campaign direction tips, storytelling for raising, raising page ideas, MateBid raising, crowdfunding ideas India, campaign promotion tips, startup raising ideas, business campaign ideas"
        canonical="/raising-ideas"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://www.matebid.com/raising-ideas",
              url: "https://www.matebid.com/raising-ideas",
              name: "Raising Ideas — Business, Education & Creative Projects | M8BID",
              description:
                "Explore 48 raising ideas across business, education, art, agriculture, sports, and community projects on MateBid.",
              isPartOf: { "@id": "https://www.matebid.com/#website" },
              breadcrumb: {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: "https://www.matebid.com" },
                  { "@type": "ListItem", position: 2, name: "Raising Ideas", item: "https://www.matebid.com/raising-ideas" },
                ],
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What if I do not know how to start my campaign?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Start with the funding purpose, the amount needed, and why it matters now. Those three points are usually enough to shape the first version of a strong campaign.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Do raising ideas need to be very unique?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Not always. A campaign does not need to be unusual — it needs to be clear, well structured, and believable.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What makes a raising idea effective?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "A good idea becomes effective when it is presented with clarity, trust, realistic goals, and a story that connects with people.",
                  },
                },
              ],
            },
          ],
        }}
      />
      <section
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 px-6 py-16 md:py-20"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
            <Lightbulb className="h-4 w-4 text-amber-700" />
            Raising Ideas
          </div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Find an idea worth raising for
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Explore practical ideas for business, education, creative work,
            agriculture, sports, and community projects. Choose a purpose,
            explain the costs, and show supporters what their contribution helps achieve.
          </p>
        </div>

        <section className="mt-12" aria-labelledby="idea-catalog-title">
          <h2 id="idea-catalog-title" className="text-2xl font-bold text-slate-900">Explore raising ideas</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Browse 12 categories and 48 starting points for your campaign.</p>
          <label htmlFor="raising-idea-search" className="mt-6 block text-sm font-semibold text-slate-700">Search ideas or categories</label>
          <input id="raising-idea-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try equipment, education, art, or business" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200" />
          <p role="status" className="mt-3 text-sm text-slate-500">{visibleCategories.reduce((total, category) => total + category.ideas.length, 0)} ideas found</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleCategories.map((category) => (
              <article key={category.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <Lightbulb className="h-6 w-6 text-amber-600" />
                <h3 className="mt-4 text-lg font-bold text-slate-900">{category.title}</h3>
                <ul className="mt-4 space-y-3">
                  {category.ideas.map((idea) => <li key={idea} className="flex items-start gap-2 text-sm leading-6 text-slate-600"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-amber-600" /><span>{idea}</span></li>)}
                </ul>
              </article>
            ))}
          </div>
          {visibleCategories.length === 0 && <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">No ideas match your search. Try another word or clear the search to see all ideas.</p>}
        </section>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ideaCards.map((item, idx) => {
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
          {ideaSections.map((section, idx) => (
            <SectionCard key={idx} {...section} />
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-900 px-6 py-8 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-amber-300" />
            <h2 className="text-xl font-bold">Example raising idea directions</h2>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {sampleIdeas.map((idea, idx) => (
              <div key={idx} className="rounded-2xl bg-white/10 p-4 text-sm text-slate-200">
                {idea}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <div className="mt-6 grid gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 h-5 w-5 text-amber-700" />
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
            <h3 className="text-xl font-bold text-slate-900">Turn your idea into a campaign</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Start with a clear purpose, shape the story, and build a page that feels credible and easy to understand.
            </p>
          </div>

          <Link
            to="/raising"
            className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
          >
            Start a raiser
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
    </>
  );
}
