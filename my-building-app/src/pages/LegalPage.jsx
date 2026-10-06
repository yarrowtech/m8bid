import React from "react";
import { ArrowRight, FileText } from "lucide-react";
import SEO from "../components/SEO.jsx";

export default function LegalPage({
  seoTitle,
  seoDescription,
  keywords,
  canonical,
  title,
  intro,
  sections,
  icon: Icon = FileText,
  embedded = false,
}) {
  if (embedded) {
    return (
      <div className="w-full">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-600">{intro}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {sections.map((section, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
              {Array.isArray(section.content) ? (
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex gap-2">
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-blue-700" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-7 text-slate-600">{section.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={keywords}
        canonical={canonical}
      />

      <section
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 px-6 py-16 md:py-20"
        style={{
          fontFamily:
            "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
              <Icon className="h-4 w-4 text-blue-700" />
              {title}
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              {title}
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              {intro}
            </p>
          </div>

          <div className="mt-12 space-y-6">
            {sections.map((section, index) => (
              <div
                key={index}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                    {Array.isArray(section.content) ? (
                      <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                        {section.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex gap-2">
                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-blue-700" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {section.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
