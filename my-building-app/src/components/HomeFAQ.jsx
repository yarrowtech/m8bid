import React from "react";
import { HelpCircle } from "lucide-react";
import { homeFaqs } from "../data/homeFaq";

export default function HomeFAQ() {
  return (
    <section id="faq" className="relative overflow-hidden px-6 py-16 md:py-20">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-blue-50/40" />

      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Frequently asked questions about M8Bid
          </h2>
        </div>

        <div className="mt-10 space-y-4">
          {homeFaqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-slate-900">{faq.question}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 md:text-base">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
