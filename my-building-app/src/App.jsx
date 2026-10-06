import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

//Components
import Header from "../src/components/Header.jsx";
import Hero from "../src/components/Hero.jsx";
import HowItWorks from "../src/components/HowItWorks.jsx";
import TrendingCampaigns from "../src/components/TrendingCampaigns.jsx";
import Plan from "../src/components/Plan.jsx";
import Footer from "../src/components/Footer.jsx";
import FeaturedProperties from "./components/FeaturedProperties.jsx";
import SecurityCompliance from "./components/SecurityCompliance.jsx";
import HomeFAQ from "./components/HomeFAQ.jsx";
import { homeFaqs, launchCampaignSteps } from "./data/homeFaq";
import MoneyGrowth from "./components/MoneyGrowth.jsx";
import Testimonials from "./components/Testimonials.jsx";
import RaisingCauses from "./components/FundraisingCauses.jsx";
import WhatWeProvide from "./components/WhatWeProvide.jsx";
import PageTransition from "./components/PageTransition.jsx";
import GlobalScrollMotion from "./components/GlobalScrollMotion.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import AccessModeModal from "./components/AccessModeModal.jsx";
import SEO from "./components/SEO.jsx";

// Pages
import BrowseContributors from "./pages/BrowseInvestors.jsx";
import ContributionDetail from "./pages/InvestmentFundDetails.jsx";
import RaisingPage from "./pages/FundraisingPage.jsx";
import StartRaiser from "./pages/StartAFundraiser.jsx";

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
import PaymentSuccess from "./pages/paymentsucess.jsx";

import SupporterSpace from "./pages/SupporterSpace";
import ReturnBasedOptions from "./pages/ReturnBasedOptions";
import VerifiedOpportunities from "./pages/VerifiedOpportunities";

import BusinessCampaigns from "./pages/BusinessCampaigns";
import CauseBasedFunding from "./pages/CauseBasedFunding";
import RaisingIdeas from "./pages/FundraisingIdeas.jsx";
import RaisingCauseTopicPage from "./pages/FundraisingCauseTopicPage.jsx";
import HowToStartRaising from "./pages/HowToStartFundraising.jsx";
import HowToContribute from "./pages/HowToInvest.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import About from "./pages/About.jsx";
import MateBidBrandPage from "./pages/MateBidBrandPage.jsx";

import SelectAccountMode from "./pages/SelectAccountType.jsx";
import CompanyContributorDashboard from "./pages/investor/CompanyInvestorDashboard";
import RaiserDashboard from "./pages/Fundraiser/FundraiserDashboard.jsx";
import CompanyRaiserDashboard from "./pages/Fundraiser/CompanyFundraiserDashboard.jsx";

import RaiserCampaigns from "./pages/Fundraiser/FundraiserCampaign.jsx";
import RaiserAnalytics from "./pages/Fundraiser/FundraiserAnalytics.jsx";
import RaiserWithdrawals from "./pages/Fundraiser/FundraiserWithdrawal.jsx";
import RaiserProfile from "./pages/Fundraiser/FundraiserProfile.jsx";
import RaiserKYC from "./pages/Fundraiser/FundraiserKyc.jsx";
import RaiserBank from "./pages/Fundraiser/FundraiserBank.jsx";
import RaiserSidebar from "./pages/Fundraiser/FundraiserSidebar.jsx";

import ContributorDashboard from "./pages/investor/InvestorDashboard.jsx";
import ContributorPortfolio from "./pages/investor/InvestorPortfolio.jsx";
import ContributorAnalytics from "./pages/investor/InvestorAnalytics.jsx";
import ContributorTransactions from "./pages/investor/InvestorTransactions.jsx";
import ContributorProfile from "./pages/investor/InvestorProfile.jsx";
import ContributorKyc from "./pages/investor/InvestorKyc.jsx";
import ContributorBank from "./pages/investor/InvestorBank.jsx";
import ContributorSidebar from "./pages/investor/InvestorSidebar.jsx";
// Context
import { RaiserProvider } from "./context/FundraiserContext.jsx";

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

  if (mode === "raiser") {
    return user?.access?.raiser?.type === "company"
      ? "/raiser/company/dashboard"
      : "/raiser/dashboard";
  }

  if (mode === "contributor") {
    return user?.access?.contributor?.type === "company"
      ? "/contributor/company/dashboard"
      : "/contributor/dashboard";
  }

  return "/";
}

function RoleAccessBlocker({ mode, user }) {
  const navigate = useNavigate();
  const title =
    mode === "contributor" ? "Contributor account needed" : "Raiser account needed";
  const message =
    mode === "contributor"
      ? "You need to login or register as an contributor to access this page."
      : "You need to login or register as a raiser to access this page.";

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
  raiser: ["/how-to-start-a-raising"],
  contributor: ["/how-to-contribute"],
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

function getRaiserSidebarActive(pathname) {
  if (pathname.includes("/campaigns")) return "campaigns";
  if (pathname.includes("/analytics")) return "analytics";
  if (pathname.includes("/withdrawals")) return "withdrawals";
  if (pathname.includes("/profile")) return "profile";
  return "dashboard";
}

function getContributorSidebarActive(pathname) {
  if (pathname.includes("/portfolio")) return "portfolio";
  if (pathname.includes("/analytics")) return "analytics";
  if (pathname.includes("/transactions")) return "transactions";
  if (pathname.includes("/profile")) return "profile";
  return "dashboard";
}

function RaiserWorkspaceRoutes() {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}${location.hash}`;

  return (
    <div className="h-screen w-full bg-[#e3e8f0] text-slate-900">
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7fb]">
        <RaiserSidebar active={getRaiserSidebarActive(location.pathname)} />

        <PageTransition
          routeKey={routeKey}
          className="raiser-workspace-content flex min-w-0 flex-1"
        >
          <Routes>
            <Route path="dashboard" element={<RaiserDashboard embedded />} />
            <Route
              path="company/dashboard"
              element={<CompanyRaiserDashboard embedded />}
            />
            <Route path="campaigns" element={<RaiserCampaigns embedded />} />
            <Route path="analytics" element={<RaiserAnalytics embedded />} />
            <Route path="withdrawals" element={<RaiserWithdrawals embedded />} />
            <Route path="profile" element={<RaiserProfile embedded />} />
            <Route path="profile/kyc" element={<RaiserKYC embedded />} />
            <Route path="profile/bank" element={<RaiserBank embedded />} />
          </Routes>
        </PageTransition>
      </div>
    </div>
  );
}

function ContributorWorkspaceRoutes() {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}${location.hash}`;

  return (
    <div className="h-screen w-full bg-[#e3e8f0] text-slate-900">
      <div className="flex h-screen w-full overflow-hidden bg-[#f7f7fb]">
        <ContributorSidebar active={getContributorSidebarActive(location.pathname)} />

        <PageTransition
          routeKey={routeKey}
          className="contributor-workspace-content flex min-w-0 flex-1"
        >
          <Routes>
            <Route path="dashboard" element={<ContributorDashboard />} />
            <Route path="company/dashboard" element={<CompanyContributorDashboard />} />
            <Route path="portfolio" element={<ContributorPortfolio />} />
            <Route path="analytics" element={<ContributorAnalytics />} />
            <Route path="transactions" element={<ContributorTransactions />} />
            <Route path="profile" element={<ContributorProfile />} />
            <Route path="profile/kyc" element={<ContributorKyc />} />
            <Route path="profile/bank" element={<ContributorBank />} />
          </Routes>
        </PageTransition>
      </div>
    </div>
  );
}

function AppRoutes({ loggedInUser, setLoggedInUser }) {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isRaiserWorkspaceRoute = location.pathname.startsWith("/raiser/");
  const isContributorWorkspaceRoute = location.pathname.startsWith("/contributor/");
  const appTransitionKey = isRaiserWorkspaceRoute
    ? "raiser-workspace"
    : isContributorWorkspaceRoute
    ? "contributor-workspace"
    : `${location.pathname}${location.search}${location.hash}`;

  const hideHeaderRoutes = [
    "/raiser/dashboard",
    "/raiser/campaigns",
    "/raiser/analytics",
    "/raiser/withdrawals",
    "/raiser/profile",
    "/raiser/profile/kyc",
    "/raiser/profile/bank",
    "/raiser/company/dashboard",
    "/contributor/dashboard",
    "/contributor/company/dashboard",
    "/contributor/portfolio",
    "/contributor/analytics",
    
    "/contributor/transactions",
    "/contributor/profile",
    "/contributor/profile/kyc",
    "/contributor/profile/bank",
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
                title="MateBid / M8BID Crowdfunding Platform for Startups, Businesses & Causes"
                description="MateBid, also known as M8BID, is India's professional crowdfunding platform for raising, funding, and contributing to verified startup, business, NGO, and cause campaigns."
                keywords="MateBid, matebid, M8BID, m8bid, MateBid raising, MateBid contributing, MateBid funding, crowdfunding platform India, startup raising, raise funds online, business crowdfunding, NGO raising, donation crowdfunding, contribute to campaigns, verified campaigns, campaign funding, crowdfunding for education, medical crowdfunding"
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
                        "M8BID is a professional crowdfunding platform connecting raisers and contributors across startups, NGOs, education, businesses, and social causes.",
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
                        target: "https://www.matebid.com/browse-contributors?q={search_term_string}",
                        "query-input": "required name=search_term_string",
                      },
                    },
                    {
                      "@type": "WebPage",
                      "@id": "https://www.matebid.com/#webpage",
                      url: "https://www.matebid.com",
                      name: "MateBid / M8BID Crowdfunding Platform for Startups, Businesses & Causes",
                      isPartOf: { "@id": "https://www.matebid.com/#website" },
                      about: { "@id": "https://www.matebid.com/#organization" },
                      description:
                        "Launch a raising campaign for your startup, NGO, business, or cause — or contribute to verified campaigns securely. KYC-backed, transparent, and trusted.",
                    },
                    {
                      "@type": "FAQPage",
                      "@id": "https://www.matebid.com/#faq",
                      mainEntity: homeFaqs.map((faq) => ({
                        "@type": "Question",
                        name: faq.question,
                        acceptedAnswer: { "@type": "Answer", text: faq.answer },
                      })),
                    },
                    {
                      "@type": "HowTo",
                      "@id": "https://www.matebid.com/#how-it-works",
                      name: "Launch a Campaign on M8Bid",
                      step: launchCampaignSteps.map((s, i) => ({
                        "@type": "HowToStep",
                        position: i + 1,
                        name: s.name,
                        text: s.text,
                      })),
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
                <RaisingCauses />
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
              <section data-motion data-motion-delay="300">
                <HomeFAQ />
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
          path="/browse-contributors"
          element={
            <>
              <BrowseContributors />
              <Footer />
            </>
          }
        />

        <Route
          path="/contribution-detail/:id"
          element={<ContributionDetail />}
        />

        <Route
          path="/raising"
          element={
            <>
              <RaisingPage />
              <Footer />
            </>
          }
        />

        <Route path="/select-account-mode" element={<SelectAccountMode />} />

        
        <Route
          path="/raiser/*"
          element={
            <RequireMode mode="raiser">
              <RaiserWorkspaceRoutes />
            </RequireMode>
          }
        />

        <Route
          path="/supporter-space"
          element={
            <RequireAccountMode mode="contributor">
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
          path="/matebid"
          element={
            <>
              <MateBidBrandPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/return-based-options"
          element={
            <RequireAccountMode mode="contributor">
              <ReturnBasedOptions />
            </RequireAccountMode>
          }
        />
        <Route
          path="/verified-opportunities"
          element={
            <RequireAccountMode mode="contributor">
              <VerifiedOpportunities />
            </RequireAccountMode>
          }
        />
        <Route
          path="/business-campaigns"
          element={
            <RequireAccountMode mode="contributor">
              <BusinessCampaigns />
            </RequireAccountMode>
          }
        />
        <Route
          path="/cause-based-funding"
          element={
            <RequireAccountMode mode="raiser">
              <CauseBasedFunding />
            </RequireAccountMode>
          }
        />
        <Route
          path="/raising-ideas"
          element={
            <RequireAccountMode mode="raiser">
              <RaisingIdeas />
            </RequireAccountMode>
          }
        />
        <Route
          path="/how-to-start-a-raising"
          element={
            <>
              <HowToStartRaising />
              <Footer />
            </>
          }
        />
        <Route
          path="/how-to-contribute"
          element={
            <>
              <HowToContribute />
              <Footer />
            </>
          }
        />
        <Route
          path="/raising-causes/:causeSlug"
          element={
            <RequireAccountMode mode="raiser">
              <RaisingCauseTopicPage />
              <Footer />
            </RequireAccountMode>
          }
        />

        <Route
          path="/start-raiser"
          element={
            <RequireAccountMode mode="raiser">
              <StartRaiser />
            </RequireAccountMode>
          }
        />
        <Route
          path="/payment"
          element={
            <RequireAccountMode mode="contributor">
              <PaymentPage />
            </RequireAccountMode>
          }
        />

        <Route path="/payment-success" element={<PaymentSuccess />} />


<Route path="/contributor/*" element={<RequireMode mode="contributor"><ContributorWorkspaceRoutes /></RequireMode>} />

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
    <RaiserProvider>
      <Router>
        <AppRoutes
          loggedInUser={loggedInUser}
          setLoggedInUser={setLoggedInUser}
        />
      </Router>
    </RaiserProvider>
  );
}


