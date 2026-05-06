import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Search,
  ChevronDown,
  LayoutDashboard,
  UserCircle2,
  LogOut,
  Info,
  HandCoins,
  BadgeDollarSign,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const navFont = {
  fontFamily:
    "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
};

/* --------------------------- dropdown panel --------------------------- */
function DropdownPanel({ title, subtitle, items, open, width = "w-[520px]" }) {
  if (!open) return null;

  return (
    <div
      className={cx(
        "absolute left-1/2 top-full z-50 mt-4 -translate-x-1/2 rounded-3xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl",
        width
      )}
    >
      <div className="p-5">
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
            {title}
          </p>
          <p className="mt-1 text-sm text-white/90">{subtitle}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {items.map((item) =>
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                onClick={item.onClick}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="text-sm font-semibold text-slate-900">
                  {item.label}
                </div>
                <div className="mt-1 text-xs leading-5 text-slate-500">
                  {item.desc}
                </div>
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="text-left rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="text-sm font-semibold text-slate-900">
                  {item.label}
                </div>
                <div className="mt-1 text-xs leading-5 text-slate-500">
                  {item.desc}
                </div>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- white drawer --------------------------- */
function DrawerSection({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-900" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="text-sm leading-6 text-slate-600">{children}</div>
    </div>
  );
}

function SideInfoDrawer({ open, onClose, type = "about" }) {
  if (!open) return null;

  const isAbout = type === "about";
  const title = isAbout ? "About M8-BID" : "Contact M8-BID";

  return (
    <div className="fixed inset-0 z-[100]" style={navFont}>
      <button
        aria-label="Close overlay"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                M8-BID
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {title}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          {isAbout ? (
            <>
              <div className="rounded-3xl border border-white/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Platform Overview
                </p>
                <h3 className="mt-2 text-2xl font-bold">
                  Built to make fundraising more credible, transparent, and
                  accessible.
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  M8-BID is a modern crowdfunding platform designed to connect
                  founders, fundraisers, and supporters through a secure and
                  professional digital experience. We focus on trust,
                  transparency, and clear campaign presentation so users can
                  raise and contribute with confidence.
                </p>
              </div>

              <DrawerSection icon={Info} title="Who We Are">
                M8-BID is a fundraising and campaign platform built for modern
                startups, causes, and business initiatives. Our goal is to
                simplify the way campaigns are created, presented, shared, and
                managed while maintaining a professional and reliable experience
                for all users.
              </DrawerSection>

              <DrawerSection icon={ShieldCheck} title="What We Believe">
                We believe fundraising should not feel confusing or
                unstructured. A good platform should help people tell their
                story clearly, show progress transparently, and create trust
                between campaign creators and supporters. That is why M8-BID
                emphasizes secure workflows, clean interfaces, and visibility
                into every important step.
              </DrawerSection>

              <DrawerSection icon={MessageCircle} title="Why M8-BID">
                <ul className="list-disc space-y-2 pl-5">
                  <li>Professional campaign creation and presentation</li>
                  <li>
                    Support for both contribution-based and structured funding
                    flows
                  </li>
                  <li>
                    Clear tracking of campaign progress and supporter engagement
                  </li>
                  <li>Secure payment and trust-oriented platform design</li>
                  <li>Admin oversight and workflow-based credibility</li>
                </ul>
              </DrawerSection>

              <DrawerSection icon={ShieldCheck} title="Our Vision">
                Our vision is to make digital fundraising more trustworthy, more
                efficient, and more professional for founders, businesses, and
                supporters alike. We want M8-BID to become a platform where
                campaigns are not only visible, but believable.
              </DrawerSection>
            </>
          ) : (
            <>
              <div className="rounded-3xl border border-white/40 bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                  Get in Touch
                </p>
                <h3 className="mt-2 text-2xl font-bold">
                  We would love to hear from you.
                </h3>
                <p className="mt-3 text-sm leading-6 text-blue-50">
                  Whether you have a product question, fundraising inquiry,
                  partnership proposal, or support request, the M8-BID team is
                  here to help.
                </p>
              </div>

              <DrawerSection icon={Mail} title="Email">
                <div className="font-medium text-slate-900">
                  support@M8-BID.com
                </div>
                <div className="mt-1">
                  For platform support, campaign help, and general inquiries.
                </div>
              </DrawerSection>

              <DrawerSection icon={Phone} title="Phone">
                <div className="font-medium text-slate-900">
                  +91 98765 43210
                </div>
                <div className="mt-1">
                  Available during standard business support hours.
                </div>
              </DrawerSection>

              <DrawerSection icon={MapPin} title="Office / Operations">
                <div className="font-medium text-slate-900">
                  M8-BID Operations Team
                </div>
                <div className="mt-1">
                  Serving digital-first fundraising and campaign management
                  workflows.
                </div>
              </DrawerSection>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function AccessModeModal({ open, onClose, onLogin, title, message, buttonLabel }) {
  if (!open) return null;

  return createPortal(
    <div className="app-popup-backdrop fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-md transition-all duration-300">
      <div className="app-popup-panel w-full max-w-lg rounded-[32px] border border-slate-200/80 bg-white/98 p-8 shadow-[0_40px_100px_-20px_rgba(15,23,42,0.4)] backdrop-blur-md transform transition-all duration-500 ease-out scale-100 animate-in fade-in-0 zoom-in-95">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/25">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
              Secure Access Required
            </p>
            <h3 className="mt-3 text-3xl font-bold text-slate-950 leading-tight">
              {title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-md"
            aria-label="Close notification"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border-2 border-slate-200 bg-slate-50 px-6 py-4 text-base font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:brightness-110 hover:shadow-2xl hover:scale-105"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* --------------------------- header --------------------------- */
export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [investOpen, setInvestOpen] = useState(false);
  const [fundraiseOpen, setFundraiseOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState("about");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [fundraiseBlockedOpen, setFundraiseBlockedOpen] = useState(false);
  const [investBlockedOpen, setInvestBlockedOpen] = useState(false);

  const headerRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const syncUser = () => {
      try {
        const rawUser =
          localStorage.getItem("user") || localStorage.getItem("loggedInUser");
        const user = rawUser ? JSON.parse(rawUser) : null;
        setLoggedInUser(user);
      } catch {
        setLoggedInUser(null);
      }
    };

    syncUser();
    window.addEventListener("storage", syncUser);

    return () => window.removeEventListener("storage", syncUser);
  }, [location.pathname]);

  useEffect(() => {
    const closeOnOutside = (e) => {
      if (!headerRef.current?.contains(e.target)) {
        setInvestOpen(false);
        setFundraiseOpen(false);
      }
      if (!profileRef.current?.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    const closeOnEsc = (e) => {
      if (e.key === "Escape") {
        setInvestOpen(false);
        setFundraiseOpen(false);
        setProfileOpen(false);
        setMobileOpen(false);
        setDrawerOpen(false);
        setFundraiseBlockedOpen(false);
        setInvestBlockedOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEsc);

    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEsc);
    };
  }, []);

  useEffect(() => {
    setInvestOpen(false);
    setFundraiseOpen(false);
    setProfileOpen(false);
    setMobileOpen(false);
    setFundraiseBlockedOpen(false);
    setInvestBlockedOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    setLoggedInUser(null);
    setProfileOpen(false);
    navigate("/login");
  };

  const getAvatarLetter = () => {
    if (loggedInUser?.name) return loggedInUser.name.charAt(0).toUpperCase();
    if (loggedInUser?.email) return loggedInUser.email.charAt(0).toUpperCase();
    return "U";
  };

  const toggleMenu = (menu) => {
    setInvestOpen(menu === "invest" ? !investOpen : false);
    setFundraiseOpen(menu === "fundraise" ? !fundraiseOpen : false);
  };

  const openDrawer = (type) => {
    setDrawerType(type);
    setDrawerOpen(true);
    setInvestOpen(false);
    setFundraiseOpen(false);
    setMobileOpen(false);
  };

  const openContactPage = () => {
    setInvestOpen(false);
    setFundraiseOpen(false);
    setProfileOpen(false);
    setMobileOpen(false);
    setDrawerOpen(false);
    navigate("/contact");
  };

  const activeMode = loggedInUser?.activeMode || "none";
  const hasSession = Boolean(loggedInUser && localStorage.getItem("token"));
  const isInvestorMode = activeMode === "investor";
  const isFundraiserMode = activeMode === "fundraiser";
  const dashboardPath =
    activeMode === "fundraiser"
      ? loggedInUser?.access?.fundraiser?.type === "company"
        ? "/fundraiser/company/dashboard"
        : "/fundraiser/dashboard"
      : loggedInUser?.access?.investor?.type === "company"
      ? "/investor/company/dashboard"
      : "/investor/dashboard";
  const profilePath =
    activeMode === "fundraiser" ? "/fundraiser/profile" : "/investor/profile";

  const handleFundraiseRestrictedAccess = () => {
    setInvestOpen(false);
    setFundraiseOpen(false);
    setMobileOpen(false);
    setFundraiseBlockedOpen(true);
  };

  const handleInvestRestrictedAccess = () => {
    setInvestOpen(false);
    setFundraiseOpen(false);
    setMobileOpen(false);
    setInvestBlockedOpen(true);
  };

  const handleFundraiseLoginRedirect = () => {
    setFundraiseBlockedOpen(false);
    navigate("/login");
  };

  const handleInvestLoginRedirect = () => {
    setInvestBlockedOpen(false);
    navigate("/login");
  };

  const handleGuestInvestAccess = () => {
    setInvestOpen(false);
    setFundraiseOpen(false);
    setMobileOpen(false);
    setInvestBlockedOpen(true);
  };

  const handleGuestFundraiseAccess = () => {
    setInvestOpen(false);
    setFundraiseOpen(false);
    setMobileOpen(false);
    setFundraiseBlockedOpen(true);
  };

const investItems = [
  {
    label: "Browse Investors",
    desc: "Explore active opportunities and investor-focused campaigns.",
    to: !hasSession ? null : isFundraiserMode ? null : "/browse-investors",
    onClick: !hasSession
      ? handleGuestInvestAccess
      : isFundraiserMode
      ? handleInvestRestrictedAccess
      : undefined,
  },
  {
    label: "Supporter Space",
    desc: "Discover FAQs, updates, and how contributions work.",
    to: !hasSession ? null : isFundraiserMode ? null : "/supporter-space",
    onClick: !hasSession
      ? handleGuestInvestAccess
      : isFundraiserMode
      ? handleInvestRestrictedAccess
      : undefined,
  },
  {
    label: "Return Based Options",
    desc: "Explore structured participation with expected returns.",
    to: !hasSession ? null : isFundraiserMode ? null : "/return-based-options",
    onClick: !hasSession
      ? handleGuestInvestAccess
      : isFundraiserMode
      ? handleInvestRestrictedAccess
      : undefined,
  },
  {
    label: "Verified Opportunities",
    desc: "See campaigns reviewed through platform workflows.",
    to: !hasSession ? null : isFundraiserMode ? null : "/verified-opportunities",
    onClick: !hasSession
      ? handleGuestInvestAccess
      : isFundraiserMode
      ? handleInvestRestrictedAccess
      : undefined,
  },
];

const fundraiseItems = [
  {
    label: "Start a Fundraiser",
    desc: "Launch your fundraiser with a guided creation flow.",
    to: !hasSession ? null : isInvestorMode ? null : "/fundraising",
    onClick: !hasSession
      ? handleGuestFundraiseAccess
      : isInvestorMode
      ? handleFundraiseRestrictedAccess
      : undefined,
  },
  {
    label: "How to Start a Fundraising",
    desc: "Understand fundraising clearly with step-by-step guidance.",
    to: !hasSession ? null : isInvestorMode ? null : "/how-to-start-a-fundraising",
    onClick: !hasSession
      ? handleGuestFundraiseAccess
      : isInvestorMode
      ? handleFundraiseRestrictedAccess
      : undefined,
  },
  {
    label: "Cause-Based Funding",
    desc: "Create campaigns for support-oriented fundraising.",
    to: !hasSession ? null : isInvestorMode ? null : "/cause-based-funding",
    onClick: !hasSession
      ? handleGuestFundraiseAccess
      : isInvestorMode
      ? handleFundraiseRestrictedAccess
      : undefined,
  },
  {
    label: "Fundraising Ideas",
    desc: "Get inspired with campaign direction and planning ideas.",
    to: !hasSession ? null : isInvestorMode ? null : "/fundraising-ideas",
    onClick: !hasSession
      ? handleGuestFundraiseAccess
      : isInvestorMode
      ? handleFundraiseRestrictedAccess
      : undefined,
  },
];

  const NavButton = ({ label, open, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold transition",
        open
          ? "bg-white/10 text-white"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      )}
    >
      {label}
      <ChevronDown
        className={cx("h-4 w-4 transition", open && "rotate-180")}
      />
    </button>
  );

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 shadow-xl backdrop-blur-xl"
        style={navFont}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          {/* Left */}
          <div
            className="flex cursor-pointer items-center gap-3"
            onClick={() => navigate("/")}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
              M8
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold tracking-tight text-white">
                M8BID
              </div>
              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Fundraising Platform
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-2 lg:flex">
           

            <Link
              to="/"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Home
            </Link>


            <div className="relative">
              <NavButton
                label="Invest"
                open={investOpen}
                onClick={() => toggleMenu("invest")}
              />
              <DropdownPanel
                title="Invest"
                subtitle="Discover verified opportunities and structured ways to participate."
                items={investItems}
                open={investOpen}
              />
            </div>

            <div className="relative">
              <NavButton
                label="Fundraise"
                open={fundraiseOpen}
                onClick={() => toggleMenu("fundraise")}
              />
              <DropdownPanel
                title="Fundraise"
                subtitle="Start a professional campaign and build momentum with clarity."
                items={fundraiseItems}
                open={fundraiseOpen}
              />
            </div>

            <button
              type="button"
              onClick={() => openDrawer("about")}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              About
            </button>

            <button
              type="button"
              onClick={openContactPage}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Contact
            </button>
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            {loggedInUser ? (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20"
                >
                  {getAvatarLetter()}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-5 text-white">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-xl font-bold">
                          {getAvatarLetter()}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-lg font-semibold">
                            {loggedInUser?.name || "User"}
                          </p>
                          <p className="line-clamp-1 text-sm text-slate-400">
                            {loggedInUser?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <button
                        onClick={() => navigate(dashboardPath)}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </button>

                      <button
                        onClick={() => navigate(profilePath)}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        <UserCircle2 className="h-4 w-4" />
                        My Profile
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="hidden items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110 active:scale-[0.99] sm:inline-flex"
              >
                Login
              </button>
            )}

            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-slate-200 lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="border-t border-white/10 bg-slate-950 lg:hidden">
            <div className="mx-auto max-w-7xl space-y-2 px-4 py-4">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
              >
                <Search className="h-4 w-4" />
                Search
              </button>

              <Link
                to="/"
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Home
              </Link>

              <Link
                to="/fundraising"
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
              >
                How it Works
              </Link>

              {!hasSession ? (
                <button
                  type="button"
                  onClick={handleGuestInvestAccess}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <BadgeDollarSign className="h-4 w-4" />
                  Browse Investors
                </button>
              ) : isFundraiserMode ? (
                <button
                  type="button"
                  onClick={handleInvestRestrictedAccess}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <BadgeDollarSign className="h-4 w-4" />
                  Browse Investors
                </button>
              ) : (
                <Link
                  to="/browse-investors"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <BadgeDollarSign className="h-4 w-4" />
                  Browse Investors
                </Link>
              )}

              {!hasSession ? (
                <button
                  type="button"
                  onClick={handleGuestFundraiseAccess}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <HandCoins className="h-4 w-4" />
                  Start a Fundraiser
                </button>
              ) : isInvestorMode ? (
                <button
                  type="button"
                  onClick={handleFundraiseRestrictedAccess}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <HandCoins className="h-4 w-4" />
                  Start a Fundraiser
                </button>
              ) : (
                <Link
                  to="/fundraising"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <HandCoins className="h-4 w-4" />
                  Start a Fundraiser
                </Link>
              )}

              <button
                type="button"
                onClick={() => openDrawer("about")}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
              >
                <Info className="h-4 w-4" />
                About M8-BID
              </button>

              <button
                type="button"
                onClick={openContactPage}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
              >
                <Mail className="h-4 w-4" />
                Contact
              </button>

              {!loggedInUser && (
                <button
                  onClick={() => navigate("/login")}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <SideInfoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        type={drawerType}
      />
      <AccessModeModal
        open={fundraiseBlockedOpen}
        onClose={() => setFundraiseBlockedOpen(false)}
        onLogin={handleFundraiseLoginRedirect}
        title="Fundraiser account needed"
        message="You need to login or register account as a fundraiser to start a fundraising campaign."
        buttonLabel="Go to Login"
      />
      <AccessModeModal
        open={investBlockedOpen}
        onClose={() => setInvestBlockedOpen(false)}
        onLogin={handleInvestLoginRedirect}
        title="Investor account needed"
        message="You need to login or register account as an investor to invest in a campaign."
        buttonLabel="Go to Login"
      />
    </>
  );
}
