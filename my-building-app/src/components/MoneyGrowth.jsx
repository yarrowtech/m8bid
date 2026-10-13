// src/components/MoneyGrowth.jsx
import React from "react";

export default function MoneyGrowth() {
  return (
    <section className="bg-[#f6fbff] px-6 py-16">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">See Funding Campaigns Make Progress</h2>
          <p className="text-gray-700 mb-4">
            Follow funding goals, campaign updates, and milestones as contributions help bring projects to life.
          </p>
          <ul className="list-disc ml-5 text-sm text-gray-700 space-y-2">
            <li>Explore projects with a clear purpose and funding plan</li>
            <li>Track your confirmed contributions in one account</li>
            <li>Receive updates from the campaigns you support</li>
          </ul>
        </div>
        <div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">From idea to funding milestone</p>
            <ol className="mt-5 space-y-4 text-lg font-semibold text-slate-900">
              <li>1. Create a Funding Campaign</li>
              <li>2. Share your purpose</li>
              <li>3. Collect confirmed Contributions</li>
              <li>4. Keep supporters updated</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
