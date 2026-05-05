import React from "react";
import {
  ArrowRight,
  BadgeCheck,
  HandCoinsIcon,
  LineChart,
  Workflow,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import fundraisingImage from "../assets/starter.jpg";
import investingImage from "../assets/growth-chart.jpg";

export default function WhatWeProvide() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden px-6 py-16 md:py-20">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-slate-100/70" />
      <div className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-slate-300/25 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/90 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
            <Workflow className="h-4 w-4 text-slate-900" />
            What We Provide
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Fundraising and investing in one clear platform flow
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600 md:text-lg">
            Understand exactly what we offer, how everything works, and where to
            begin based on your goal.
          </p>
        </div>

        <div className="mt-12 space-y-14">
          <article className="grid items-center gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl shadow-md">
              <img
                src={fundraisingImage}
                alt="People supporting a fundraiser campaign"
                className="h-[320px] w-full object-cover md:h-[360px]"
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <HandCoinsIcon className="h-4 w-4" />
                Fundraising
              </div>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                What fundraising means here
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                Fundraising is for people, founders, or teams who want to raise
                money for a business, project, or cause. On this platform, you
                create a campaign page with your story, target amount, timeline,
                and proof details so supporters can understand your goal clearly.
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                After publishing, you share your campaign and receive support
                through a secure process. You can track progress, responses, and
                updates from your dashboard while keeping your campaign transparent.
              </p>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Typical flow: create campaign, add details, publish, share,
                  collect support, monitor growth.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/start-fundraiser")}
                className="mt-5 inline-flex items-center rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-3 text-sm font-semibold text-white shadow transition hover:brightness-110"
              >
                Go To Fundraising
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </article>

          <article className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                <LineChart className="h-4 w-4" />
                Investing
              </div>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                What investing means here
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                Investing is for users who want to support selected campaigns with
                a contribution mindset focused on growth opportunities. You browse
                available campaigns, review their details, and choose where you
                want to participate.
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                The platform helps you compare options, understand campaign context,
                and invest through a guided and secure flow. You can keep track of
                your activity and performance through your investor-side experience.
              </p>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Typical flow: browse campaigns, review details, invest securely,
                  and track participation in dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/browse-investors")}
                className="mt-5 inline-flex items-center rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow transition hover:brightness-110"
              >
                Go To Browse Investors
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl shadow-md">
              <img
                src={investingImage}
                alt="Investment growth concept"
                className="h-[320px] w-full object-cover md:h-[360px]"
              />
            </div>
          </article>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-0.5 h-5 w-5 text-slate-900" />
            <p className="text-sm leading-6 text-slate-700 md:text-base">
              If you are raising money, start from the fundraising button. If you
              want to support campaigns as an investor, use the browse investors
              button. This makes your journey clear from the first click.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
