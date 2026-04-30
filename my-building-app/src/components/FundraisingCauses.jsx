import React from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  FolderKanban,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Lightbulb,
} from "lucide-react";
import { fundraisingCauses } from "../data/fundraisingCauses";

const iconByCause = {
  projects: FolderKanban,
  ngo: HandHeart,
  education: GraduationCap,
  business: BriefcaseBusiness,
  "medical-emergency": HeartPulse,
  companies: Building2,
  startups: Lightbulb,
};

export default function FundraisingCauses() {
  return (
    <section
      className="relative overflow-hidden px-6 py-16 md:py-20 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-slate-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-10 h-52 w-52 rounded-full bg-blue-200/20 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-800">
            Causes you can raise funds for
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base md:text-xl leading-7 text-slate-600">
            Pick the fundraising type that matches your goal and start building
            support from your community.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {fundraisingCauses.map((cause) => {
            const Icon = iconByCause[cause.slug] || FolderKanban;

            return (
              <Link
                key={cause.slug}
                to={`/fundraising-causes/${cause.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-700 to-blue-800 p-5 text-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_15%_20%,#ffffff_0px,#ffffff_5px,transparent_6px),radial-gradient(circle_at_70%_10%,#ffffff_0px,#ffffff_3px,transparent_4px),radial-gradient(circle_at_90%_75%,#ffffff_0px,#ffffff_4px,transparent_5px)]" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.1),transparent_50%)]" />

                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/25">
                  <Icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="relative mt-4 text-xl font-extrabold tracking-wide uppercase">
                  {cause.title}
                </h3>

                <div className="relative mt-2 h-1.5 w-10 rounded-full bg-white/80 transition group-hover:w-14" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
