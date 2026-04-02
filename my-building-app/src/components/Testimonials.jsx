// src/components/Testimonials.jsx
import React from "react";
import { BadgeCheck, Quote, Star } from "lucide-react";
import investor1 from "../assets/investor3.jpg";
import investor2 from "../assets/investor2.jpg";
import investor3 from "../assets/investor1.jpg";

const testimonials = [
  {
    name: "Priya R.",
    role: "Retail Investor",
    comment:
      "Investing here has been seamless and profitable. The platform is easy to use, and my returns are consistent.",
    image: investor1,
  },
  {
    name: "Amit K.",
    role: "Growth Investor",
    comment:
      "I love how transparent everything is. I can track my investments in real-time and feel confident about every decision.",
    image: investor2,
  },
  {
    name: "Sneha M.",
    role: "Long-Term Supporter",
    comment:
      "The team is supportive, the process is smooth, and the overall experience feels professional and trustworthy.",
    image: investor3,
  },
];

function Stars() {
  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
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
        <div className="h-full w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30" />
        <div className="pointer-events-none absolute left-16 top-10 h-56 w-56 rounded-full bg-blue-200/10 blur-3xl" />
        <div className="pointer-events-none absolute right-10 bottom-10 h-64 w-64 rounded-full bg-slate-300/10 blur-3xl" />
      </div>

      {/* Heading */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
          <BadgeCheck className="h-4 w-4 text-blue-700" />
          Trusted by investors
        </div>

        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          What Our Investors Say
        </h2>

        <p className="mt-3 text-base md:text-lg leading-7 text-slate-600">
          Hear from people who trust the platform for a transparent, secure, and
          smooth investment experience.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
        {testimonials.map((t, idx) => (
          <div
            key={t.name}
            className="group relative rounded-[24px] border border-white/40 bg-white/80 p-6 text-center shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* subtle highlight */}
            <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-blue-50/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

            <div className="relative">
              {/* quote icon */}
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                <Quote className="h-5 w-5 text-slate-700" />
              </div>

              {/* image */}
              <img
                src={t.image}
                alt={t.name}
                className="mx-auto mb-4 h-20 w-20 rounded-full border-4 border-white object-cover shadow-md"
              />

              {/* stars */}
              <Stars />

              {/* comment */}
              <p className="mt-4 text-sm leading-6 text-slate-600">
                “{t.comment}”
              </p>

              {/* name */}
              <div className="mt-5">
                <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                <p className="text-sm text-slate-500">{t.role}</p>
              </div>
            </div>

            {/* optional badge */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified review
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}