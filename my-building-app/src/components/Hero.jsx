import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import heroBg from "../assets/hero-bg.jpg";
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";
import img4 from "../assets/img4.jpg";
import img5 from "../assets/img5.jpg";
import img6 from "../assets/img6.jpg";

/* ----------------------------- Circular Card ----------------------------- */
function CircularProgressImage({
  src,
  label,
  size = 180,
  percentage = 80,
  strokeWidth = 6,
  bgColor = "#e5e7eb",
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * percentage) / 100;
  const gradientId = `gradient-${label?.replace(/\s+/g, "-")}-${size}-${percentage}`;

  return (
    <div
      className="group relative transition duration-300 hover:-translate-y-1"
      style={{ width: size, height: size }}
    >
      {/* soft glow (changed from blue → black/grey) */}
      <div className="absolute inset-0 rounded-full bg-black/15 blur-2xl opacity-0 transition group-hover:opacity-100" />

      {/* progress ring */}
      <svg
        width={size}
        height={size}
        className="absolute top-0 left-0 -rotate-90 drop-shadow-sm"
      >
        <defs>
          {/* gradient changed from blue → black/grey */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#111827" />
            <stop offset="50%" stopColor="#374151" />
            <stop offset="100%" stopColor="#6b7280" />
          </linearGradient>
        </defs>

        <circle
          stroke={bgColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        <circle
          stroke={`url(#${gradientId})`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>

      {/* image */}
      <div
        className="rounded-full overflow-hidden border border-white/70 shadow-xl"
        style={{
          width: size - strokeWidth * 2,
          height: size - strokeWidth * 2,
          margin: strokeWidth,
        }}
      >
        <img
          src={src}
          alt={label || "Campaign"}
          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      {/* badge */}
      {label && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] md:text-xs font-semibold text-gray-900 shadow-md">
          {label}
        </div>
      )}

      {/* percentage */}
      <div className="absolute top-3 right-3 rounded-full bg-black px-2 py-1 text-[10px] font-semibold text-white">
        {percentage}%
      </div>
    </div>
  );
}

/* ------------------------------ Stat chip ------------------------------ */
function StatChip({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl border border-white/50 bg-white/70 backdrop-blur px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Icon className="h-5 w-5 text-blue-700" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <p className="text-sm font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      {/* Top banner */}
      <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-800 text-white text-center py-3 px-4 text-sm md:text-base font-medium tracking-wide">
        🎉 Special Offer: Launch your startup fundraiser and get bonus visibility
        + reduced platform fees
      </div>

      <section className="relative min-h-screen overflow-hidden px-6 pt-10 pb-16 md:px-10 lg:px-14">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-center bg-cover scale-105"
          style={{ backgroundImage: `url(${heroBg})` }}
        />

        {/* bluish layered overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(239,246,255,0.92),rgba(240,249,255,0.84),rgba(224,231,255,0.78))]" />
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />

        {/* ambient glows */}
        <div className="pointer-events-none absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-blue-300/25 blur-3xl" />
        <div className="pointer-events-none absolute top-32 right-12 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-10 h-72 w-72 rounded-full bg-sky-300/15 blur-3xl" />

        {/* dotted rings */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div
            className="absolute rounded-full border-2 border-dashed border-slate-300/50"
            style={{ width: "1200px", height: "1000px" }}
          />
          <div
            className="absolute rounded-full border-2 border-dashed border-slate-300/45"
            style={{ width: "760px", height: "690px" }}
          />
        </div>

        {/* grid overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:48px_48px]" />

        {/* content */}
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-120px)] max-w-7xl items-center justify-between gap-8">
          {/* Left floating images */}
          <div className="hidden flex-1 md:flex flex-col items-start gap-3">
            <div style={{ transform: "translateY(-24px) translateX(10.5rem)" }}>
              <CircularProgressImage
                src={img4}
                label="Growth Campaign"
                size={178}
                percentage={85}
              />
            </div>
            <div style={{ transform: "translateY(-12px) translateX(-0.5rem)" }}>
              <CircularProgressImage
                src={img1}
                label="Early Support"
                size={174}
                percentage={72}
              />
            </div>
            <div style={{ transform: "translateY(-28px) translateX(10.75rem)" }}>
              <CircularProgressImage
                src={img3}
                label="Momentum"
                size={182}
                percentage={91}
              />
            </div>
          </div>

          {/* Center content */}
          <div className="w-full max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/70 px-4 py-2 text-sm font-semibold text-green-500 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              #1 Crowdfunding Platform
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
              Successful fundraisers
              <span className="block bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                start here
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-700 md:text-lg">
              Launch your campaign with a polished fundraising experience,
              inspire confidence, and raise support through a secure,
              professional platform built for modern startups and founders.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/fundraising")}
                className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-4 text-base font-semibold tracking-wide text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110 active:scale-[0.99]"
              >
                Start A Fundraiser
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => navigate("/browse-investors")}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/75 px-8 py-4 text-base font-semibold text-slate-900 shadow-sm backdrop-blur transition hover:bg-white"
              >
                Explore Campaigns
              </button>
            </div>

          

            {/* stats */}
            <div className="mx-auto mt-35 grid max-w-4xl gap-3 sm:grid-cols-3">
              <StatChip
                icon={ShieldCheck}
                title="Trust Layer"
                value="KYC + Review Workflow"
              />
              <StatChip
                icon={TrendingUp}
                title="Best For"
                value="Startup & Business Growth"
              />
              <StatChip
                icon={Users}
                title="Built For"
                value="Founders, Backers, Investors"
              />
            </div>
          </div>

          {/* Right floating images */}
          <div className="hidden flex-1 md:flex flex-col items-end gap-3">
            <div style={{ transform: "translateY(-24px) translateX(-10.25rem)" }}>
              <CircularProgressImage
                src={img5}
                label="Investor Ready"
                size={178}
                percentage={81}
              />
            </div>
            <div style={{ transform: "translateY(-18px) translateX(0.9rem)" }}>
              <CircularProgressImage
                src={img2}
                label="Community Backing"
                size={174}
                percentage={76}
              />
            </div>
            <div style={{ transform: "translateY(-30px) translateX(-10.35rem)" }}>
              <CircularProgressImage
                src={img6}
                label="Strong Traction"
                size={182}
                percentage={95}
              />
            </div>
          </div>
        </div>

        {/* bottom floating mini card */}
        <div className="relative z-10 mx-auto mt-2 hidden max-w-5xl md:block">
          <div className="grid grid-cols-3 gap-4 rounded-3xl border border-white/50 bg-white/60 p-4 shadow-lg backdrop-blur-xl">
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Campaign Setup
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Fast, guided, professional
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment Flow
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Secure contribution handling
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Founder Visibility
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Better trust, more traction
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}