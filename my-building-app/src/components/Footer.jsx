import React, { useState } from "react";
import { Mail, Phone, MapPin, ShieldCheck, X, Info, MessageCircle } from "lucide-react";

function DrawerSection({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-900" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="text-sm leading-6 text-slate-600">{children}</div>
    </div>
  );
}

function InfoDrawer({ open, onClose, type = "about" }) {
  if (!open) return null;

  const isAbout = type === "about";
  const title = isAbout ? "About M8-BID" : "Contact M8-BID";

  return (
    <div className="fixed inset-0 z-50" style={{ fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}>
      {/* overlay */}
      <button
        aria-label="Close overlay"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />

      {/* drawer */}
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 overflow-y-auto">
        {/* header */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                M8-BID
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">{title}</h2>
            </div>

            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
          {isAbout ? (
            <>
              <div className="rounded-3xl border border-white/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Platform Overview
                </p>
                <h3 className="mt-2 text-2xl font-bold">Built to make fundraising more credible, transparent, and accessible.</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  M8-BID is a modern crowdfunding platform designed to connect founders, fundraisers, and supporters through a secure and professional digital experience. 
                  We focus on trust, transparency, and clear campaign presentation so users can raise and contribute with confidence.
                </p>
              </div>

              <DrawerSection icon={Info} title="Who We Are">
                M8-BID is a fundraising and campaign platform built for modern startups, causes, and business initiatives. 
                Our goal is to simplify the way campaigns are created, presented, shared, and managed while maintaining a professional and reliable experience for all users.
              </DrawerSection>

              <DrawerSection icon={ShieldCheck} title="What We Believe">
                We believe fundraising should not feel confusing or unstructured. A good platform should help people tell their story clearly, 
                show progress transparently, and create trust between campaign creators and supporters. That is why M8-BID emphasizes secure workflows, 
                clean interfaces, and visibility into every important step.
              </DrawerSection>

              <DrawerSection icon={MessageCircle} title="Why M8-BID">
                <ul className="space-y-2 list-disc pl-5">
                  <li>Professional campaign creation and presentation</li>
                  <li>Support for both contribution-based and structured funding flows</li>
                  <li>Clear tracking of campaign progress and supporter engagement</li>
                  <li>Secure payment and trust-oriented platform design</li>
                  <li>Admin oversight and workflow-based credibility</li>
                </ul>
              </DrawerSection>

              <DrawerSection icon={ShieldCheck} title="Our Vision">
                Our vision is to make digital fundraising more trustworthy, more efficient, and more professional for founders, businesses, and supporters alike. 
                We want M8-BID to become a platform where campaigns are not only visible, but believable.
              </DrawerSection>
            </>
          ) : (
            <>
              <div className="rounded-3xl border border-white/40 bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                  Get in Touch
                </p>
                <h3 className="mt-2 text-2xl font-bold">We would love to hear from you.</h3>
                <p className="mt-3 text-sm leading-6 text-blue-50">
                  Whether you have a product question, fundraising inquiry, partnership proposal, or support request, the M8-BID team is here to help.
                </p>
              </div>

              <DrawerSection icon={Mail} title="Email">
                <div className="font-medium text-slate-900">support@M8-BID.com</div>
                <div className="mt-1">For platform support, campaign help, and general inquiries.</div>
              </DrawerSection>

              <DrawerSection icon={Phone} title="Phone">
                <div className="font-medium text-slate-900">+91 98765 43210</div>
                <div className="mt-1">Available during standard business support hours.</div>
              </DrawerSection>

              <DrawerSection icon={MapPin} title="Office / Operations">
                <div className="font-medium text-slate-900">M8-BID Operations Team</div>
                <div className="mt-1">Serving digital-first fundraising and campaign management workflows.</div>
              </DrawerSection>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

export default function Footer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState("about");

  const openDrawer = (type) => {
    setDrawerType(type);
    setDrawerOpen(true);
  };

  return (
    <>
      <footer
        className="relative mt-20 overflow-hidden border-t border-slate-200 bg-slate-950 text-white"
        style={{
          fontFamily:
            "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        }}
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.12),transparent_30%)]" />

        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-10 md:grid-cols-3">
            {/* brand */}
            <div>
              <h3 className="text-2xl font-bold tracking-tight">M8-BID</h3>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
                A modern platform for professional fundraising, transparent campaign storytelling, and secure supporter engagement.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200">
                <ShieldCheck className="h-4 w-4 text-green-400" />
                Trust-focused platform experience
              </div>
            </div>

            {/* about */}
            <div>
              <h4 className="text-lg font-semibold">About</h4>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <button
                  onClick={() => openDrawer("about")}
                  className="block hover:text-white transition"
                >
                  About Us
                </button>
                <button
                  onClick={() => openDrawer("about")}
                  className="block hover:text-white transition"
                >
                  Our Vision
                </button>
                <button
                  onClick={() => openDrawer("about")}
                  className="block hover:text-white transition"
                >
                  Platform Trust & Transparency
                </button>
              </div>
            </div>

            {/* contact */}
            <div>
              <h4 className="text-lg font-semibold">Contact</h4>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <button
                  onClick={() => openDrawer("contact")}
                  className="flex items-center gap-3 hover:text-white transition"
                >
                  <Mail className="h-4 w-4 text-blue-400" />
                  support@M8-BID.com
                </button>

                <button
                  onClick={() => openDrawer("contact")}
                  className="flex items-center gap-3 hover:text-white transition"
                >
                  <Phone className="h-4 w-4 text-blue-400" />
                  +91 98765 43210
                </button>

                <button
                  onClick={() => openDrawer("contact")}
                  className="flex items-center gap-3 hover:text-white transition"
                >
                  <MapPin className="h-4 w-4 text-blue-400" />
                  Contact Us
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} M8-BID. All rights reserved.
          </div>
        </div>
      </footer>

      <InfoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        type={drawerType}
      />
    </>
  );
}