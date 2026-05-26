import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

// Components
import Header from "../src/components/Header.jsx";
import Hero from "../src/components/Hero.jsx";
import HowItWorks from "../src/components/HowItWorks.jsx";
import TrendingCampaigns from "../src/components/TrendingCampaigns.jsx";
import Plan from "../src/components/Plan.jsx";
import Footer from "../src/components/Footer.jsx";
import FeaturedProperties from "./components/FeaturedProperties.jsx";
import SecurityCompliance from "./components/SecurityCompliance.jsx";
import MoneyGrowth from "./components/MoneyGrowth.jsx";
import Testimonials from "./components/Testimonials.jsx";
import FundraisingCauses from "./components/FundraisingCauses.jsx";
import WhatWeProvide from "./components/WhatWeProvide.jsx";
import ProtectedRoute from "./pages/ProtectedRoutes.jsx";
import PageTransition from "./components/PageTransition.jsx";
import GlobalScrollMotion from "./components/GlobalScrollMotion.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import AccessModeModal from "./components/AccessModeModal.jsx";
import SEO from "./components/SEO.jsx";

// Pages
import BrowseInvestors from "./pages/BrowseInvestors.jsx";
import InvestmentDetail from "./pages/InvestmentDetail.jsx";
import FundraisingPage from "./pages/FundraisingPage.jsx";
import StartFundraiser from "./pages/StartAFundraiser.jsx";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage.jsx";

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminUsers from "./components/admin/AdminUsers";
import AdminCampaigns from "./components/admin/AdminCampaigns";
import AdminTransactions from "./components/admin/AdminTransaction";
import AdminAnalytics from "./components/admin/AdminAnalytics";
import AdminUserDetails from "./components/admin/AdminUserDetails";

import PaymentPage from "./pages/PaymentPage.jsx";

import SupporterSpace from "./pages/SupporterSpace";
import ReturnBasedOptions from "./pages/ReturnBasedOptions";
import VerifiedOpportunities from "./pages/VerifiedOpportunities";

import BusinessCampaigns from "./pages/BusinessCampaigns";
import CauseBasedFunding from "./pages/CauseBasedFunding";
import FundraisingIdeas from "./pages/FundraisingIdeas";
import FundraisingCauseTopicPage from "./pages/FundraisingCauseTopicPage.jsx";
import HowToStartFundraising from "./pages/HowToStartFundraising.jsx";
import HowToInvest from "./pages/HowToInvest.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import About from "./pages/About.jsx";

import SelectAccountMode from "./pages/SelectAccountType.jsx";
import CompanyInvestorDashboard from "./pages/investor/CompanyInvestorDashboard";
import FundraiserDashboard from "./pages/Fundraiser/FundraiserDashboard";
import CompanyFundraiserDashboard from "./pages/Fundraiser/CompanyFundraiserDashboard";

import FundraiserCampaigns from "./pages/Fundraiser/FundraiserCampaign.jsx";
import FundraiserAnalytics from "./pages/Fundraiser/FundraiserAnalytics.jsx";
import FundraiserWithdrawals from "./pages/Fundraiser/FundraiserWithdrawal.jsx";
import FundraiserProfile from "./pages/Fundraiser/FundraiserProfile.jsx";
import FundraiserKYC from "./pages/Fundraiser/FundraiserKyc.jsx";
import FundraiserBank from "./pages/Fundraiser/FundraiserBank.jsx";
import FundraiserSidebar from "./pages/Fundraiser/FundraiserSidebar.jsx";

import InvestorDashboard from "./pages/investor/InvestorDashboard.jsx";
import InvestorPortfolio from "./pages/investor/InvestorPortfolio.jsx";
import InvestorAnalytics from "./pages/investor/InvestorAnalytics.jsx";
import InvestorTransactions from "./pages/investor/InvestorTransactions.jsx";
import InvestorProfile from "./pages/investor/InvestorProfile.jsx";
import InvestorKyc from "./pages/investor/InvestorKyc.jsx";
import InvestorBank from "./pages/investor/InvestorBank.jsx";
import InvestorSidebar from "./pages/investor/InvestorSidebar.jsx";
// Context
import { FundraiserProvider } from "./context/FundraiserContext.jsx";

function getStoredSession() {
  try {
    const rawUser =
      localStorage.getItem("user") || localStorage.getItem("loggedInUser");
    const rawToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    return {
      user: rawUser ? JSON.parse(rawUser) : null,
      token: rawToken,
    };
  } catch {
    return { user: null, token: null };
  }
}

function getModeDashboardPath(user, fallbackMode) {
  if (!user) return "/";

  const mode = user?.activeMode || fallbackMode;

  if (mode === "fundraiser") {
    return user?.access?.fundraiser?.type === "company"
      ? "/fundraiser/company/dashboard"
      : "/fundraiser/dashboard";
  }

  if (mode === "investor") {
    return user?.access?.investor?.type === "company"
      ? "/investor/company/dashboard"
      : "/investor/dashboard";
  }

  return "/";
}

function RoleAccessBlocker({ mode, user }) {
  const navigate = useNavigate();
  const title =
    mode === "investor" ? "Investor account needed" : "Fundraiser account needed";
  const message =
    mode === "investor"
      ? "You need to login or register as an investor to access this page."
      : "You need to login or register as a fundraiser to access this page.";

  return (
    <div className="min-h-screen bg-slate-50">
      <AccessModeModal
        open
        onClose={() => navigate(getModeDashboardPath(user), { replace: true })}
        onLogin={() => navigate("/login", { replace: true })}
        title={title}
        message={message}
        buttonLabel="Go to Login"
      />
    </div>
  );
}

function RequireMode({ mode, children }) {
  const { user, token } = getStoredSession();

  if (!token || !user) {
    return <RoleAccessBlocker mode={mode} user={user} />;
  }

  if (!user?.access?.[mode]?.enabled) {
    return <RoleAccessBlocker mode={mode} user={user} />;
  }

  if (user?.activeMode !== mode) {
    return <RoleAccessBlocker mode={mode} user={user} />;
  }

  return children;
}

const HOME_ACCESS_ROUTES = {
  fundraiser: ["/how-to-start-a-fundraising"],
  investor: ["/how-to-invest"],
};

function RequireAccountMode({ mode, children }) {
  const location = useLocation();
  const { user, token } = getStoredSession();
  const allowHomeAccess =
    location.state?.allowHomeAccess &&
    HOME_ACCESS_ROUTES[mode]?.includes(location.pathname);

  if (allowHomeAccess) {
    return children;
  }

  if (!token || !user || !user?.access?.[mode]?.enabled || user?.activeMode !== mode) {
    return <RoleAccessBlocker mode={mode} user={user} />;
  }

  return children;
}

function getFundraiserSidebarActive(pathname) {
  if (pathname.includes("/campaigns")) return "campaigns";
  if (pathname.includes("/analytics")) return "analytics";
  if (pathname.includes("/withdrawals")) return "withdrawals";
  if (pathname.includes("/profile")) return "profile";
  return "dashboard";
}

function getInvestorSidebarActive(pathname) {
  if (pathname.includes("/portfolio")) return "portfolio";
  if (pathname.includes("/analytics")) return "analytics";
  if (pathname.includes("/transactions")) return "transactions";
  if (pathname.includes("/profile")) return "profile";
  return "dashboard";
}

function FundraiserWorkspaceRoutes() {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}${location.hash}`;

  return (
    <div className="h-screen w-full bg-[#e3e8f0] text-slate-900">
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7fb]">
        <FundraiserSidebar active={getFundraiserSidebarActive(location.pathname)} />

        <PageTransition
          routeKey={routeKey}
          className="fundraiser-workspace-content flex min-w-0 flex-1"
        >
          <Routes>
            <Route path="dashboard" element={<FundraiserDashboard embedded />} />
            <Route
              path="company/dashboard"
              element={<CompanyFundraiserDashboard embedded />}
            />
            <Route path="campaigns" element={<FundraiserCampaigns embedded />} />
            <Route path="analytics" element={<FundraiserAnalytics embedded />} />
            <Route path="withdrawals" element={<FundraiserWithdrawals embedded />} />
            <Route path="profile" element={<FundraiserProfile embedded />} />
            <Route path="profile/kyc" element={<FundraiserKYC embedded />} />
            <Route path="profile/bank" element={<FundraiserBank embedded />} />
          </Routes>
        </PageTransition>
      </div>
    </div>
  );
}

function InvestorWorkspaceRoutes() {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}${location.hash}`;

  return (
    <div className="h-screen w-full bg-[#e3e8f0] text-slate-900">
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7fb]">
        <InvestorSidebar active={getInvestorSidebarActive(location.pathname)} />

        <PageTransition
          routeKey={routeKey}
          className="investor-workspace-content flex min-w-0 flex-1"
        >
          <Routes>
            <Route path="dashboard" element={<InvestorDashboard />} />
            <Route path="company/dashboard" element={<CompanyInvestorDashboard />} />
            <Route path="portfolio" element={<InvestorPortfolio />} />
            <Route path="analytics" element={<InvestorAnalytics />} />
            <Route path="transactions" element={<InvestorTransactions />} />
            <Route path="profile" element={<InvestorProfile />} />
            <Route path="profile/kyc" element={<InvestorKyc />} />
            <Route path="profile/bank" element={<InvestorBank />} />
          </Routes>
        </PageTransition>
      </div>
    </div>
  );
}

function AppRoutes({ loggedInUser, setLoggedInUser }) {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isFundraiserWorkspaceRoute = location.pathname.startsWith("/fundraiser/");
  const isInvestorWorkspaceRoute = location.pathname.startsWith("/investor/");
  const appTransitionKey = isFundraiserWorkspaceRoute
    ? "fundraiser-workspace"
    : isInvestorWorkspaceRoute
    ? "investor-workspace"
    : `${location.pathname}${location.search}${location.hash}`;

  const hideHeaderRoutes = [
    "/fundraiser/dashboard",
    "/fundraiser/campaigns",
    "/fundraiser/analytics",
    "/fundraiser/withdrawals",
    "/fundraiser/profile",
    "/fundraiser/profile/kyc",
    "/fundraiser/profile/bank",
    "/fundraiser/company/dashboard",
    "/investor/dashboard",
    "/investor/company/dashboard",
    "/investor/portfolio",
    "/investor/analytics",
    
    "/investor/transactions",
    "/investor/profile",
    "/investor/profile/kyc",
    "/investor/profile/bank",
  ];

  const shouldHideHeader =
    isAdminRoute ||
    hideHeaderRoutes.some((route) => location.pathname.startsWith(route));

  return (
    <div className="font-sans text-gray-900">
      <ScrollToTop />
      <GlobalScrollMotion />
      {!shouldHideHeader && (
        <Header
          loggedInUser={loggedInUser}
          setLoggedInUser={setLoggedInUser}
        />
      )}

      <PageTransition routeKey={appTransitionKey}>
      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={
            <main className="homepage-flow">
              <SEO
                title="#1 Crowdfunding Platform for Startups, Businesses & Causes"
                description="M8BID is India's professional crowdfunding platform. Launch a raising campaign for your startup, NGO, business, or cause — or contribute to verified campaigns securely. KYC-backed, transparent, and trusted by founders and backers."
                keywords="crowdfunding platform India, startup fundraising, raise funds online, business crowdfunding, NGO fundraising, donation crowdfunding, contribute to campaigns, verified campaigns, M8BID, campaign funding, crowdfunding for education, medical crowdfunding"
                canonical="/"
                jsonLd={{
                  "@context": "https://schema.org",
                  "@graph": [
                    {
                      "@type": "Organization",
                      "@id": "https://www.matebid.com/#organization",
                      name: "M8BID",
                      url: "https://www.matebid.com",
                      logo: "https://www.matebid.com/logo.png",
                      description:
                        "M8BID is a professional crowdfunding platform connecting fundraisers and contributors across startups, NGOs, education, businesses, and social causes.",
                      sameAs: [],
                    },
                    {
                      "@type": "WebSite",
                      "@id": "https://www.matebid.com/#website",
                      url: "https://www.matebid.com",
                      name: "M8BID",
                      publisher: { "@id": "https://www.matebid.com/#organization" },
                      potentialAction: {
                        "@type": "SearchAction",
                        target: "https://www.matebid.com/browse-investors?q={search_term_string}",
                        "query-input": "required name=search_term_string",
                      },
                    },
                    {
                      "@type": "WebPage",
                      "@id": "https://www.matebid.com/#webpage",
                      url: "https://www.matebid.com",
                      name: "#1 Crowdfunding Platform for Startups, Businesses & Causes | M8BID",
                      isPartOf: { "@id": "https://www.matebid.com/#website" },
                      about: { "@id": "https://www.matebid.com/#organization" },
                      description:
                        "Launch a raising campaign for your startup, NGO, business, or cause — or contribute to verified campaigns securely. KYC-backed, transparent, and trusted.",
                    },
                  ],
                }}
              />
              <section data-motion data-motion-delay="20">
                <Hero />
              </section>
              <section data-motion data-motion-delay="80">
                <WhatWeProvide />
              </section>
              <section data-motion data-motion-delay="120">
                <FundraisingCauses />
              </section>
              <section data-motion data-motion-delay="160">
                <HowItWorks />
              </section>
              <section data-motion data-motion-delay="200">
                <TrendingCampaigns />
              </section>
              <section data-motion data-motion-delay="240">
                <Plan />
              </section>
              <section data-motion data-motion-delay="280">
                <SecurityCompliance />
              </section>
              <section data-motion data-motion-delay="320">
                <Footer />
              </section>
            </main>
          }
        />

        {/* Login and Register */}
        <Route
          path="/login"
          element={<LoginPage setLoggedInUser={setLoggedInUser} />}
        />
        <Route path="/register" element={<RegisterPage />} />

        {/* Public pages */}
        <Route
          path="/browse-investors"
          element={
            <RequireAccountMode mode="investor">
              <>
                <BrowseInvestors />
                <Footer />
              </>
            </RequireAccountMode>
          }
        />

        <Route
          path="/investment-detail/:id"
          element={
            <RequireAccountMode mode="investor">
              <InvestmentDetail />
            </RequireAccountMode>
          }
        />

        <Route
          path="/fundraising"
          element={
            <RequireAccountMode mode="fundraiser">
              <>
                <FundraisingPage />
                <Footer />
              </>
            </RequireAccountMode>
          }
        />

        <Route path="/select-account-mode" element={<SelectAccountMode />} />

        
        <Route
          path="/fundraiser/*"
          element={
            <RequireMode mode="fundraiser">
              <FundraiserWorkspaceRoutes />
            </RequireMode>
          }
        />

        <Route
          path="/supporter-space"
          element={
            <RequireAccountMode mode="investor">
              <SupporterSpace />
            </RequireAccountMode>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <ContactPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <About />
              <Footer />
            </>
          }
        />
        <Route
          path="/return-based-options"
          element={
            <RequireAccountMode mode="investor">
              <ReturnBasedOptions />
            </RequireAccountMode>
          }
        />
        <Route
          path="/verified-opportunities"
          element={
            <RequireAccountMode mode="investor">
              <VerifiedOpportunities />
            </RequireAccountMode>
          }
        />
        <Route
          path="/business-campaigns"
          element={
            <RequireAccountMode mode="investor">
              <BusinessCampaigns />
            </RequireAccountMode>
          }
        />
        <Route
          path="/cause-based-funding"
          element={
            <RequireAccountMode mode="fundraiser">
              <CauseBasedFunding />
            </RequireAccountMode>
          }
        />
        <Route
          path="/fundraising-ideas"
          element={
            <RequireAccountMode mode="fundraiser">
              <FundraisingIdeas />
            </RequireAccountMode>
          }
        />
        <Route
          path="/how-to-start-a-fundraising"
          element={
            <>
              <HowToStartFundraising />
              <Footer />
            </>
          }
        />
        <Route
          path="/how-to-invest"
          element={
            <>
              <HowToInvest />
              <Footer />
            </>
          }
        />
        <Route
          path="/fundraising-causes/:causeSlug"
          element={
            <RequireAccountMode mode="fundraiser">
              <FundraisingCauseTopicPage />
              <Footer />
            </RequireAccountMode>
          }
        />

        <Route
          path="/start-fundraiser"
          element={
            <RequireAccountMode mode="fundraiser">
              <StartFundraiser />
            </RequireAccountMode>
          }
        />
        <Route
          path="/payment"
          element={
            <RequireAccountMode mode="investor">
              <PaymentPage />
            </RequireAccountMode>
          }
        />


<Route path="/investor/*" element={<RequireMode mode="investor"><InvestorWorkspaceRoutes /></RequireMode>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* USERS */}
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:userId" element={<AdminUserDetails />} />

          {/* CAMPAIGNS */}
          <Route path="campaigns" element={<AdminCampaigns />} />

          {/* TRANSACTIONS */}
          <Route path="transactions" element={<AdminTransactions />} />

          {/* ANALYTICS */}
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Routes>
      </PageTransition>
    </div>
  );
}

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (user) {
      setLoggedInUser(user);
    }
  }, []);

  return (
    <FundraiserProvider>
      <Router>
        <AppRoutes
          loggedInUser={loggedInUser}
          setLoggedInUser={setLoggedInUser}
        />
      </Router>
    </FundraiserProvider>
  );
}
