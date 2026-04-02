import React from "react";
import FundraiserSidebar from "./FundraiserSidebar";

function MetricCard({ title, value, sub }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
    </div>
  );
}

export default function FundraiserAnalytics() {
  return (
    <div className="h-screen w-full bg-[#e3e8f0]">
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7fb]">
        <FundraiserSidebar active="analytics" />

        <main
          className="scrollbar-hide flex-1 overflow-y-auto px-6 py-6"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track campaign performance, visibility, and supporter engagement.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <MetricCard title="Total Reach" value="18.2K" sub="Monthly visibility" />
            <MetricCard title="Supporters" value="146" sub="Active backers" />
            <MetricCard title="Conversion Rate" value="12.4%" sub="View to support ratio" />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Monthly Growth</h2>
              <div className="mt-6 flex h-64 items-end gap-4">
                {[35, 52, 44, 68, 56, 72].map((h, i) => (
                  <div key={i} className="flex-1">
                    <div
                      className="w-full rounded-t-2xl bg-sky-500"
                      style={{ height: `${h * 2}px` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Top Insights</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Best performing campaign</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Sustainable Housing Initiative is getting the highest engagement.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Most active time</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Your campaigns get the most visits between 6 PM and 10 PM.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Recommendation</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Keep your KYC and bank profile complete to reduce approval delays.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}