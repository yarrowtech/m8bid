import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { getFundraisingCauseBySlug } from "../data/fundraisingCauses";

export default function FundraisingCauseTopicPage() {
  const { causeSlug } = useParams();
  const cause = getFundraisingCauseBySlug(causeSlug || "");

  if (!cause) {
    return <Navigate to="/" replace />;
  }

  return (
    <main
      className="min-h-screen px-6 py-14 md:py-20 bg-gradient-to-br from-white via-slate-50 to-blue-50/40"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Fundraising Topic
          </p>

          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            {cause.title}
          </h1>

          <p className="mt-3 text-base md:text-lg leading-7 text-slate-600">
            {cause.overview}
          </p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-bold text-slate-900">What should be there</h2>

            <div className="mt-4 space-y-3">
              {cause.whatToInclude.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/fundraising"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
            >
              Start this fundraiser
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm"
            >
              Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}