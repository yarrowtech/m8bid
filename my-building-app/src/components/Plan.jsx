import React from "react";
import {
  ArrowRight,
  BadgeCheck,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import starterImg from "../assets/starter.jpg";
import incomeImg from "../assets/income.jpg";
import planIcon from "../assets/plan.png";

const plans = [
  {
    name: "Investment Without Return",
    desc: "Designed for supporters who want to back meaningful projects without expecting financial returns. Best suited for community-driven, cause-led, or trust-based funding.",
    min: "₹500",
    return: "No financial return",
    fund: "Support-based contribution model",
    image: starterImg,
    badge: "Support Plan",
    accent: "from-slate-900 to-slate-700",
    iconBg: "bg-slate-100",
    tag: "Simple entry",
  },
  {
    name: "Investment With Return",
    desc: "Built for users who want structured participation with expected returns. Suitable for business-oriented campaigns with clearer funding goals and return visibility.",
    min: "₹500",
    return: "~6–7%",
    fund: "Growth-focused contribution model",
    image: incomeImg,
    badge: "Return Plan",
    accent: "from-blue-600 to-indigo-600",
    iconBg: "bg-blue-50",
    tag: "Investor friendly",
  },
];

function cx(...s) {
  return s.filter(Boolean).join(" ");
}

export default function Plans() {
  return (
    <section
      className="relative overflow-hidden px-6 py-16 md:py-20"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/40" />
        <div className="pointer-events-none absolute left-10 top-10 h-56 w-56 rounded-full bg-blue-200/10 blur-3xl" />
        <div className="pointer-events-none absolute right-10 bottom-10 h-64 w-64 rounded-full bg-slate-300/10 blur-3xl" />
      </div>

      {/* Heading */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
          <BadgeCheck className="h-4 w-4 text-blue-700" />
          Flexible contribution options
        </div>

        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          Plans We Offer —{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Choose Your Plan
          </span>
        </h2>

        <p className="mt-3 text-base md:text-lg leading-7 text-slate-600">
          Select the contribution model that best fits your goals, whether you
          want to support a campaign or participate with return-focused intent.
        </p>
      </div>

      {/* Cards - reduced overall size */}
      <div className="mx-auto mt-10 grid max-w-6xl gap-14 md:grid-cols-2">
        {plans.map((plan) => (
          <button
            key={plan.name}
            onClick={() => alert(`You selected ${plan.name}`)}
            className="group overflow-hidden rounded-[24px] border border-white/40 bg-white/80 text-left shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {/* Image - smaller */}
            <div className="relative h-43 w-full overflow-hidden">
              <img
                src={plan.image}
                alt={plan.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

              <div className="absolute left-4 top-4">
                <span
                  className={cx(
                    "inline-flex items-center rounded-full bg-gradient-to-r px-3 py-1 text-[11px] font-semibold text-white shadow-lg",
                    plan.accent
                  )}
                >
                  {plan.badge}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                    Recommended for
                  </p>
                  <p className="mt-1 text-base font-bold text-white">
                    {plan.tag}
                  </p>
                </div>

                <div className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-900 shadow">
                  10 days left
                </div>
              </div>
            </div>

            {/* Content - tighter */}
            <div className="p-4">
              {/* Title */}
              <div className="flex items-start gap-3">
                <div
                  className={cx(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                    plan.iconBg
                  )}
                >
                  <img src={planIcon} alt="" className="h-5 w-5 object-contain" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-[13px] leading-5 text-slate-600">
                    {plan.desc}
                  </p>
                </div>
              </div>

              {/* Metrics - smaller */}
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-slate-700" />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Minimum
                    </p>
                  </div>
                  <p className="mt-1.5 text-xs font-bold text-slate-900">
                    {plan.min}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-slate-700" />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Return
                    </p>
                  </div>
                  <p className="mt-1.5 text-xs font-bold text-slate-900">
                    {plan.return}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-700" />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Structure
                    </p>
                  </div>
                  <p className="mt-1.5 text-xs font-bold text-slate-900">
                    Verified
                  </p>
                </div>
              </div>

              {/* Fund mix */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Fund Mix
                </p>
                <p className="mt-1.5 text-[13px] font-medium leading-5 text-slate-700">
                  {plan.fund}
                </p>
              </div>

              {/* CTA */}
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1.5 text-[10px] font-semibold text-green-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Available now
                </span>

                <span
                  className={cx(
                    "group inline-flex items-center justify-center rounded-xl bg-gradient-to-r px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:brightness-110",
                    plan.accent
                  )}
                >
                  Select Plan
                  <ArrowRight className="ml-1.5 h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}