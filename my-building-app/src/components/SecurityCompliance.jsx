import React from "react";
import {
  BarChart3,
  CircleDollarSign,
  HandCoins,
  HandHelping,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  WalletCards,
} from "lucide-react";

const whyM8BidPoints = [
  {
    title: "High campaign success potential",
    icon: ShieldCheck,
  },
  {
    title: "Strong contributor community",
    icon: Users,
  },
  {
    title: "Easy campaign management tools",
    icon: SlidersHorizontal,
  },
  {
    title: "Multiple secure payment options",
    icon: WalletCards,
  },
  {
    title: "24/7 support assistance",
    icon: HandHelping,
  },
  {
    title: "Smart dashboard insights",
    icon: BarChart3,
  },
  {
    title: "Smooth and faster withdrawals",
    icon: HandCoins,
  },
  {
    title: "Local and global payment reach",
    icon: CircleDollarSign,
  },
];

export default function SecurityCompliance() {
  return (
    <section
      className="relative overflow-hidden px-6 py-16 md:py-20"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-white" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-800 md:text-5xl">
            Why M8Bid?
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600 md:text-lg">
            Everything you need to launch, grow, and manage fundraising with trust.
          </p>
        </div>

        <div className="mt-12 grid gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {whyM8BidPoints.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-500/70 bg-white">
                  <Icon className="h-7 w-7 text-cyan-500" />
                </div>

                <div className="mt-4 h-1 w-16 rounded-full bg-amber-400" />

                <h3 className="mt-4 text-2xl leading-tight font-bold tracking-tight text-slate-800">
                  {item.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
