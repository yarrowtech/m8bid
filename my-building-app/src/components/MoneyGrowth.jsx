// src/components/MoneyGrowth.jsx
import React from "react";
import growthChart from "../assets/growth-chart.jpg";

export default function MoneyGrowth() {
  return (
    <section className="bg-[#f6fbff] px-6 py-16">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">See How Your Money Grows</h2>
          <p className="text-gray-700 mb-4">
            With consistent contributions and compounding returns, your investments can grow significantly over time.
          </p>
          <ul className="list-disc ml-5 text-sm text-gray-700 space-y-2">
            <li>Earn rental income and appreciation</li>
            <li>Reinvest returns for compounding</li>
            <li>Withdraw profits any time after lock-in</li>
          </ul>
        </div>
        <div>
          <img
            src={growthChart}
            alt="Growth Chart"
            className="w-full rounded shadow"
          />
        </div>
      </div>
    </section>
  );
}
