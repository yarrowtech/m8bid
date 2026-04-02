import React from "react";
import {
  ArrowRight,
  ShieldCheck,
  Share2,
  Wallet,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import demoVideo from "../assets/how_it_works.mp4";

function StepCard({ step, icon: Icon, title, desc, isLast = false }) {
  return (
    <div className="relative flex gap-4 md:gap-5">
      {/* timeline */}
      <div className="relative flex flex-col items-center">
        <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20">
          <span className="text-sm font-bold">{step}</span>
        </div>

        {!isLast && (
          <div className="mt-2 h-full min-h-[72px] w-px bg-gradient-to-b from-blue-200 via-slate-200 to-transparent" />
        )}
      </div>

      {/* content */}
      <div className="group relative flex-1 rounded-2xl border border-white/40 bg-white/75 backdrop-blur-xl p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
              <Icon className="h-5 w-5 text-slate-900" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Step {step}
              </p>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                {title}
              </h3>
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600 md:text-[15px]">
            {desc}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Simple and guided flow
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorks() {
   const navigate = useNavigate();
  return (
    <section
      className="relative overflow-hidden px-4 py-16 md:py-20"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      {/* background */}
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/60" />
        <div className="pointer-events-none absolute left-10 top-10 h-56 w-56 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="pointer-events-none absolute right-10 bottom-10 h-64 w-64 rounded-full bg-indigo-200/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            How it works
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Fundraising here is easy, powerful, and trusted
          </h2>

          <p className="mt-3 text-base leading-7 text-slate-600 md:text-lg">
            Launch your campaign in minutes, share it with confidence, and
            receive contributions securely through a professional workflow.
          </p>
        </div>

        {/* body */}
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* left steps */}
          <div className="space-y-5">
            <StepCard
              step="1"
              icon={Sparkles}
              title="Create your fundraiser"
              desc="Use our guided tools to add your campaign story, funding goal, milestones, and visuals. You can update your fundraiser anytime as your campaign evolves."
            />

            <StepCard
              step="2"
              icon={Share2}
              title="Reach supporters by sharing"
              desc="Share your fundraiser link across your network and use your dashboard tools to build momentum, attract supporters, and keep your audience engaged."
            />

            <StepCard
              step="3"
              icon={Wallet}
              title="Receive funds securely"
              desc="Add your payout details and collect contributions through a secure process. Track progress clearly while maintaining trust and transparency."
              isLast
            />
          </div>

{/* right video card */}
<div className="relative flex justify-center">
  <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-blue-200/25 via-white to-indigo-200/15 blur-2xl" />

  {/* CARD WIDTH REDUCED */}
  <div className="relative w-[85%] max-w-[620px] overflow-hidden rounded-3xl border border-white/40 bg-white/75 shadow-xl backdrop-blur-xl">
    
    <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">
          Product walkthrough
        </p>
        <p className="text-xs text-slate-500">
          See how a campaign moves from setup to payout
        </p>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
        <ShieldCheck className="h-4 w-4 text-green-600" />
        Secure flow
      </div>
    </div>

    <div className="p-4 md:p-5">
      {/* VIDEO */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
        <video
          src={demoVideo}
          controls
          autoPlay
          muted
          loop
          playsInline
          className="w-200 h-120 object-cover"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Setup
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            Guided form flow
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Sharing
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            Campaign link ready
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Payout
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            Secure transfer flow
          </p>
        </div>
      </div>
    </div>

  </div>
</div>
        </div>

        {/* bottom small CTA strip */}
        <div className="mt-10 rounded-3xl border border-white/40 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-white shadow-lg">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-lg font-bold tracking-tight">
                Ready to launch your campaign?
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Create your fundraiser, publish your story, and start collecting
                support with confidence.
              </p>
            </div>

        <button
  type="button"
  onClick={() => navigate("/fundraising")}
  className="group inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
>
  Start now
  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
</button>
          </div>
        </div>
      </div>
    </section>
  );
}