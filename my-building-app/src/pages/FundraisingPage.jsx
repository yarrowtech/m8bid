import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  BadgeCheck,
  Share2,
  BarChart3,
} from "lucide-react";

import heroImage from "../assets/fundraising-hero.jpg";

/* ---------- utils ---------- */
function cx(...s) {
  return s.filter(Boolean).join(" ");
}

const PRIMARY_BTN =
  "group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110 active:scale-[0.99]";
const OUTLINE_BTN =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white";

/* ---------- components ---------- */
function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Icon className="h-5 w-5 text-blue-700" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </div>
          <div className="text-lg font-semibold text-slate-900">{value}</div>
        </div>
      </div>
    </div>
  );
}

function StepCard({ step, title, desc, icon: Icon }) {
  return (
    <div className="group relative rounded-2xl border border-white/40 bg-white/70 backdrop-blur p-6 shadow-sm transition hover:shadow-lg">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-white opacity-0 transition group-hover:opacity-100" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-blue-700" />
            </div>
            <div className="text-sm font-semibold text-blue-700">
              Step {step}
            </div>
          </div>

          <div className="text-xs font-medium text-slate-500">
            ~ {step === 1 ? "3" : step === 2 ? "2" : "1"} min
          </div>
        </div>

        <h3 className="mt-4 text-xl font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-slate-600 leading-relaxed">{desc}</p>

        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          No setup fees
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Icon className="h-5 w-5 text-slate-800" />
        </div>
        <div>
          <div className="text-base font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-sm text-slate-600 leading-relaxed">
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur p-5 shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 text-left"
        type="button"
      >
        <span className="font-semibold text-slate-900">{q}</span>
        <span
          className={cx(
            "h-8 w-8 rounded-xl border border-slate-200 flex items-center justify-center transition select-none",
            open ? "bg-blue-50 text-blue-700" : "bg-white text-slate-700"
          )}
        >
          <span className={cx("transition", open ? "rotate-45" : "rotate-0")}>
            +
          </span>
        </span>
      </button>

      {open && (
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function FundraisingPage() {
  useEffect(() => {}, []);

  const highlights = useMemo(
    () => [
      { icon: ShieldCheck, label: "Secure payouts", value: "Bank transfer" },
      { icon: TrendingUp, label: "Best for", value: "Business growth" },
      { icon: Clock, label: "Setup time", value: "Under 5 minutes" },
    ],
    []
  );

  return (
    <main
      className="relative overflow-hidden text-slate-900"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      {/* ===== Bluish Background (less purple) ===== */}
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100" />
        <div className="pointer-events-none absolute left-1/2 top-24 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-blue-300/20 blur-[110px]" />
        <div className="pointer-events-none absolute right-10 top-40 h-[320px] w-[320px] rounded-full bg-indigo-300/18 blur-[110px]" />
        <div className="pointer-events-none absolute bottom-0 left-16 h-[420px] w-[420px] rounded-full bg-sky-300/15 blur-[130px]" />
      </div>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 pt-14 pb-10 md:pt-20 md:pb-14">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 backdrop-blur px-3 py-1 text-sm font-semibold text-blue-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Raise for your business — confidently
            </div>

            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Start a Business Fundraiser that{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                looks credible
              </span>{" "}
              and converts.
            </h1>

            <p className="mt-4 text-lg text-slate-700 leading-relaxed max-w-xl">
              Create your fundraiser, share it with your network, and collect
              contributions securely. Clear milestones, transparent story, and a
              professional campaign page that builds trust.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link to="/start-fundraiser" className={PRIMARY_BTN}>
                Start a Fundraiser
                <span className="ml-2 transition group-hover:translate-x-0.5">
                  →
                </span>
              </Link>

              <Link to="/browse-investors" className={OUTLINE_BTN}>
                Explore campaigns
                <ArrowRight className="ml-2 h-4 w-4 text-slate-700" />
              </Link>
            </div>

            <div className="mt-7 grid sm:grid-cols-3 gap-3">
              {highlights.map((s, i) => (
                <Stat key={i} icon={s.icon} label={s.label} value={s.value} />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <div className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-green-600" />
                Verified campaigns workflow
              </div>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <div className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-700" />
                Built for founders & investors
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-blue-200/30 via-white to-indigo-200/20 blur-xl" />
            <div className="relative rounded-3xl border border-white/40 bg-white/70 backdrop-blur shadow-lg overflow-hidden">
              <div className="p-4 border-b border-white/50 bg-white/60 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    Fundraiser Preview
                  </div>
                  <div className="text-xs font-medium text-slate-500">
                    Professional layout
                  </div>
                </div>
              </div>

              <div className="p-4">
                <img
                  src={heroImage}
                  alt="Fundraising hero"
                  className="w-full h-[320px] object-cover rounded-2xl"
                />

                <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-slate-900">
                      My Business Expansion
                    </div>
                    <span className="rounded-full bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1">
                      Active
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    Raising to launch the next milestone and hire our first team
                    members.
                  </p>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Raised</span>
                      <span className="font-semibold text-slate-900">
                        ₹2,40,000 / ₹5,00,000
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full w-[48%] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                      <span>120 supporters</span>
                      <span>18 days left</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-blue-700" />
                      Trust layer
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      KYC + Admin review
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-indigo-700" />
                      Payout
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      Secure bank transfer
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500 text-center">
              Tip: Keep your story clear, show milestones, add real photos.
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                How fundraising works
              </h2>
              <p className="mt-2 text-slate-600 max-w-2xl">
                A simple 3-step flow designed to help you launch quickly and
                raise with confidence.
              </p>
            </div>

            <Link to="/start-fundraiser" className={OUTLINE_BTN}>
              Create now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <StepCard
              step={1}
              icon={Sparkles}
              title="Create your fundraiser"
              desc="Add your story, goal, timeline, and visuals. Set clear milestones so supporters understand your plan."
            />
            <StepCard
              step={2}
              icon={Users}
              title="Share with your network"
              desc="Share your campaign link on WhatsApp, Instagram, and email. Momentum in the first 48 hours matters."
            />
            <StepCard
              step={3}
              icon={ShieldCheck}
              title="Collect funds securely"
              desc="Supporters contribute using secure payments. You can track progress, updates, and payouts transparently."
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-14 bg-white/40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900">
            Built for trust and conversion
          </h2>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Professional campaign pages, clear tracking, and platform controls
            to protect both founders and supporters.
          </p>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Feature
              icon={ShieldCheck}
              title="Secure payments"
              desc="Payment verification and clear transaction records for reliable fundraising."
            />
            <Feature
              icon={BadgeCheck}
              title="Review workflow"
              desc="Campaign and KYC review flow helps keep the platform credible and safer."
            />
            <Feature
              icon={BarChart3}
              title="Performance tracking"
              desc="Track raised amount, supporter count, and progress — with a clean dashboard view."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900">FAQs</h2>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Quick answers to common questions.
          </p>

          <div className="mt-8 grid md:grid-cols-2 gap-5">
            <FAQ
              q="Is there a fee to start a fundraiser?"
              a="You can start a fundraiser without setup fees. Platform charges (if any) are applied transparently based on your configured policy."
            />
            <FAQ
              q="How do payouts work?"
              a="After successful payment confirmation and platform checks, payouts are transferred to your linked bank account based on your configured workflow."
            />
            <FAQ
              q="Can I edit my fundraiser after publishing?"
              a="Yes. You can update your story, images, and milestones. Some changes may require review depending on your platform policy."
            />
            <FAQ
              q="How can I get more supporters?"
              a="Share early, post regular updates, add real photos/videos, and make your milestone plan clear. The first 48 hours are important for momentum."
            />
          </div>

          <div className="mt-10 rounded-3xl border border-white/40 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">Ready to start fundraising?</h3>
              <p className="mt-2 text-white/90 max-w-xl">
                Create a professional fundraiser page in minutes and start
                sharing today.
              </p>
            </div>

            <Link
              to="/start-fundraiser"
              className="group inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold tracking-wide text-slate-900 shadow-sm transition hover:bg-white/90 active:scale-[0.99]"
            >
              Start a Fundraiser
              <span className="ml-2 transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <div className="h-10" />
    </main>
  );
}