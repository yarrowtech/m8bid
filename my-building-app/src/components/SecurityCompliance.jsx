// src/components/SecurityCompliance.jsx
import React from "react";
import { BadgeCheck, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import secureIcon from "../assets/secure.png";
import complianceIcon from "../assets/compliance.png";
import verifiedIcon from "../assets/verified.png";

const items = [
  {
    title: "Data Encryption",
    desc: "All transactions and personal information are protected with strong encryption and secure transmission standards.",
    image: secureIcon,
    icon: Lock,
    badge: "Secure by design",
  },
  {
    title: "Regulatory Compliance",
    desc: "The platform follows a structured compliance workflow to support secure onboarding, verification, and responsible operations.",
    image: complianceIcon,
    icon: ShieldCheck,
    badge: "Compliance focused",
  },
  {
    title: "Verified Opportunities",
    desc: "All listed fundraising opportunities go through a validation and review process before being made available on the platform.",
    image: verifiedIcon,
    icon: CheckCircle2,
    badge: "Reviewed carefully",
  },
];

function cx(...s) {
  return s.filter(Boolean).join(" ");
}

export default function SecurityCompliance() {
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
        <div className="h-full w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/25" />
        <div className="pointer-events-none absolute left-10 top-10 h-56 w-56 rounded-full bg-blue-200/10 blur-3xl" />
        <div className="pointer-events-none absolute right-10 bottom-10 h-64 w-64 rounded-full bg-slate-300/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
          <BadgeCheck className="h-4 w-4 text-blue-700" />
          Security first
        </div>

        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          Security & Compliance
        </h2>

        <p className="mt-3 text-base md:text-lg leading-7 text-slate-600">
          Built with a trust-first approach to protect users, secure transactions,
          and maintain a professional funding environment.
        </p>
      </div>

      {/* Cards */}
      <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
        {items.map((item, idx) => {
          const Icon = item.icon;

          return (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-[26px] border border-white/40 bg-white/80 p-6 text-center shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* subtle hover layer */}
              <div className="absolute inset-0 rounded-[26px] bg-gradient-to-br from-blue-50/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

              <div className="relative">
                {/* top icon chip */}
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-900" />
                </div>

                {/* custom image */}
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-9 w-9 object-contain"
                  />
                </div>

                {/* title */}
                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                  {item.title}
                </h3>

                {/* description */}
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.desc}
                </p>

                {/* badge */}
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {item.badge}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom trust strip */}
      <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-white/40 bg-slate-900 px-6 py-5 text-white shadow-lg">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-lg font-bold tracking-tight">
              Built to create trust at every step
            </p>
            <p className="mt-1 text-sm text-slate-300">
              From onboarding to contributions, every part of the experience is
              designed to feel secure, transparent, and professionally managed.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-green-400" />
            Trusted workflow
          </div>
        </div>
      </div>
    </section>
  );
}