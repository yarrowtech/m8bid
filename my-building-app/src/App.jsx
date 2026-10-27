import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

//Components
const AccountSecurity = lazy(() => import("./pages/AccountSecurity.jsx"));
const AccountOverview = lazy(() => import("./pages/AccountOverview.jsx"));
const UserDashboardLayout = lazy(() => import("./components/UserDashboardLayout.jsx"));
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
import PageLoader from "./components/PageLoader.jsx";
import { useVisitorTracking } from "./lib/visitorTracking";

// Pages
const BrowseContributors = lazy(() => import("./pages/BrowseInvestors.jsx"));
const ContributionDetail = lazy(() => import("./pages/InvestmentDetail.jsx"));
const RaisingPage = lazy(() => import("./pages/FundraisingPage.jsx"));
const StartRaiser = lazy(() => import("./pages/StartAFundraiser.jsx"));

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx"));

const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./components/admin/AdminUsers"));
const AdminCampaigns = lazy(() => import("./components/admin/AdminCampaigns"));
const AdminTransactions = lazy(() => import("./components/admin/AdminTransaction"));
const AdminContributions = lazy(() => import("./components/admin/AdminContributions"));
const AdminAnalytics = lazy(() => import("./components/admin/AdminAnalytics"));
const WebsiteAnalytics = lazy(() => import("./components/admin/WebsiteAnalytics"));
const AdminUserDetails = lazy(() => import("./components/admin/AdminUserDetails"));

const PaymentPage = lazy(() => import("./pages/PaymentPage.jsx"));
const PaymentSuccess = lazy(() => import("./pages/paymentsucess.jsx"));

const SupporterSpace = lazy(() => import("./pages/SupporterSpace"));
const ReturnBasedOptions = lazy(() => import("./pages/ReturnBasedOptions"));
const VerifiedOpportunities = lazy(() => import("./pages/VerifiedOpportunities"));

const BusinessCampaigns = lazy(() => import("./pages/BusinessCampaigns"));
const CauseBasedFunding = lazy(() => import("./pages/CauseBasedFunding"));
const RaisingIdeas = lazy(() => import("./pages/FundraisingIdeas.jsx"));
const RaisingCauseTopicPage = lazy(() => import("./pages/FundraisingCauseTopicPage.jsx"));
const HowToStartRaising = lazy(() => import("./pages/HowToStartFundraising.jsx"));
const HowToContribute = lazy(() => import("./pages/HowToInvest.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const MateBidBrandPage = lazy(() => import("./pages/MateBidBrandPage.jsx"));

const SelectAccountMode = lazy(() => import("./pages/SelectAccountType.jsx"));
const CompanyContributorDashboard = lazy(() => import("./pages/investor/CompanyInvestorDashboard"));
const RaiserDashboard = lazy(() => import("./pages/Fundraiser/FundraiserDashboard.jsx"));
const CompanyRaiserDashboard = lazy(() => import("./pages/Fundraiser/CompanyFundraiserDashboard.jsx"));

const RaiserCampaigns = lazy(() => import("./pages/Fundraiser/FundraiserCampaign.jsx"));
const RaiserAnalytics = lazy(() => import("./pages/Fundraiser/FundraiserAnalytics.jsx"));
const RaiserWithdrawals = lazy(() => import("./pages/Fundraiser/FundraiserWithdrawal.jsx"));
const RaiserProfile = lazy(() => import("./pages/Fundraiser/FundraiserProfile.jsx"));
const RaiserKYC = lazy(() => import("./pages/Fundraiser/FundraiserKyc.jsx"));
const RaiserBank = lazy(() => import("./pages/Fundraiser/FundraiserBank.jsx"));
const RaiserSidebar = lazy(() => import("./pages/Fundraiser/FundraiserSidebar.jsx"));

const ContributorDashboard = lazy(() => import("./pages/investor/InvestorDashboard.jsx"));
const ContributorPortfolio = lazy(() => import("./pages/investor/InvestorPortfolio.jsx"));
const ContributorAnalytics = lazy(() => import("./pages/investor/InvestorAnalytics.jsx"));
const ContributorTransactions = lazy(() => import("./pages/investor/InvestorTransactions.jsx"));
const ContributorProfile = lazy(() => import("./pages/investor/InvestorProfile.jsx"));
const ContributorKyc = lazy(() => import("./pages/investor/InvestorKyc.jsx"));
const ContributorBank = lazy(() => import("./pages/investor/InvestorBank.jsx"));
const ContributorSidebar = lazy(() => import("./pages/investor/InvestorSidebar.jsx"));
// Context
import { RaiserProvider } from "./context/FundraiserContext.jsx";

// After the homepage is idle, fetch the most visited pages' code so clicks open instantly.
const PREFETCH = [
  () => import("./pages/LoginPage"),
  () => import("./pages/RegisterPage.jsx"),
  () => import("./pages/BrowseInvestors.jsx"),
  () => import("./pages/FundraisingPage.jsx"),
  () => import("./pages/VerifiedOpportunities"),
  () => import("./pages/HowToInvest.jsx"),
  () => import("./pages/HowToStartFundraising.jsx"),
  () => import("./pages/StartAFundraiser.jsx"),
];
function usePrefetchPages() {
  useEffect(() => {
    const connection = navigator.connection;
    if (connection?.saveData || /2g/.test(connection?.effectiveType || "")) return undefined;
    const run = () => PREFETCH.forEach((load) => load().catch(() => {}));
    const idle = window.requestIdleCallback || ((callback) => setTimeout(callback, 2500));
    const cancel = window.cancelIdleCallback || clearTimeout;
    let handle;
    const start = () => { handle = idle(run, { timeout: 5000 }); };
    if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true });
    return () => { window.removeEventListener("load", start); if (handle) cancel(handle); };
  }, []);
}

function getStoredSession() {
  try {
    const rawUser =
      localStorage.getItem("user") || sessionStorage.getItem("user") || localStorage.getItem("loggedInUser");
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
    mode === "contributor" ? "Sign in to your account" : "Sign in to your account";
  const message =
    mode === "contributor"
      ? "Sign in to your MateBid account to continue."
      : "Sign in to your MateBid account to continue.";

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



  return children;
}

function RequireAdmin({ children }) {
  const location = useLocation();
  const { user, token } = getStoredSession();

  if (!token || user?.role !== "admin") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
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

  if (!token || !user) {
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

function AppRoutes({ loggedInUser, setLoggedInUser }) {
  const location = useLocation();
  useVisitorTracking(location.pathname);
  usePrefetchPages();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isUserDashboardRoute = ["/dashboard", "/account", "/raiser/", "/contributor/"].some((path) => location.pathname === path || location.pathname.startsWith(path.endsWith("/") ? path : `${path}/`));
  const appTransitionKey = isAdminRoute ? "admin-workspace" : isUserDashboardRoute ? "user-dashboard" : `${location.pathname}${location.search}${location.hash}`;

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
    isAdminRoute || isUserDashboardRoute ||
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

      <PageTransition routeKey={appTransitionKey} disabled={isAdminRoute || isUserDashboardRoute}>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={
            <main className="homepage-flow">
              <SEO
                title="MateBid / M8BID Crowdfunding Platform for Startups, Businesses & Causes"
                description="MateBid, also known as M8BID, is India's professional crowdfunding platform for raising, funding, and contributing to verified startup, business, NGO, and cause campaigns."
                keywords="MateBid, matebid, M8BID, m8bid, MateBid raising, MateBid contributing, MateBid funding, crowdfunding platform India, startup raising, raise funds online, business crowdfunding, NGO raising, contribution-based funding, contribute to campaigns, verified campaigns, campaign funding, crowdfunding for education, medical crowdfunding"
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
        <Route element={<RequireMode><UserDashboardLayout /></RequireMode>}>
          <Route path="/dashboard" element={<AccountOverview />} />
          <Route path="/account" element={<ContributorProfile embedded />} />
          <Route path="/account/security" element={<AccountSecurity />} />
          <Route path="/raiser/dashboard" element={<RaiserDashboard embedded />} />
          <Route path="/raiser/company/dashboard" element={<CompanyRaiserDashboard embedded />} />
          <Route path="/raiser/campaigns" element={<RaiserCampaigns embedded />} />
          <Route path="/raiser/analytics" element={<RaiserAnalytics embedded />} />
          <Route path="/raiser/withdrawals" element={<RaiserWithdrawals embedded />} />
          <Route path="/raiser/profile" element={<ContributorProfile embedded />} />
          <Route path="/raiser/profile/kyc" element={<ContributorKyc embedded />} />
          <Route path="/raiser/profile/bank" element={<ContributorBank embedded />} />
          <Route path="/contributor/dashboard" element={<ContributorDashboard embedded />} />
          <Route path="/contributor/company/dashboard" element={<CompanyContributorDashboard embedded />} />
          <Route path="/contributor/portfolio" element={<ContributorPortfolio />} />
          <Route path="/contributor/analytics" element={<ContributorAnalytics />} />
          <Route path="/contributor/transactions" element={<ContributorTransactions embedded />} />
          <Route path="/contributor/profile" element={<ContributorProfile embedded />} />
          <Route path="/contributor/profile/kyc" element={<ContributorKyc embedded />} />
          <Route path="/contributor/profile/bank" element={<ContributorBank embedded />} />
        </Route>

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
          path="/contribution-detail/:id?"
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

        <Route path="/select-account-mode" element={<Navigate to="/dashboard" replace />} />

        
        <Route
          path="/supporter-space"
          element={
            <SupporterSpace />
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
            <ReturnBasedOptions />
          }
        />
        <Route
          path="/verified-opportunities"
          element={
            <VerifiedOpportunities />
          }
        />
        <Route
          path="/business-campaigns"
          element={
            <BusinessCampaigns />
          }
        />
        <Route
          path="/cause-based-funding"
          element={
            <CauseBasedFunding />
          }
        />
        <Route
          path="/raising-ideas"
          element={
            <RaisingIdeas />
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
            <><RaisingCauseTopicPage /><Footer /></>
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




        {/* Admin routes */}
        <Route path="/admin/login" element={<LoginPage adminOnly setLoggedInUser={setLoggedInUser} />} />
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="contributions" element={<AdminContributions />} />
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
          <Route path="website-analytics" element={<WebsiteAnalytics />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
      </Suspense>
      </PageTransition>
    </div>
  );
}

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const { user } = getStoredSession();
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


