import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
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

import InvestorDashboard from "./pages/investor/InvestorDashboard.jsx";
import InvestorPortfolio from "./pages/investor/InvestorPortfolio.jsx";
import InvestorAnalytics from "./pages/investor/InvestorAnalytics.jsx";
import InvestorTransactions from "./pages/investor/InvestorTransactions.jsx";
import InvestorProfile from "./pages/investor/InvestorProfile.jsx";
import InvestorKyc from "./pages/investor/InvestorKyc.jsx";
import InvestorBank from "./pages/investor/InvestorBank.jsx";
// Context
import { FundraiserProvider } from "./context/FundraiserContext.jsx";

function RequireMode({ mode, children }) {
  const rawUser = localStorage.getItem("user");
  const rawToken = localStorage.getItem("token");
  const user = rawUser ? JSON.parse(rawUser) : null;

  if (!rawToken || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.access?.[mode]?.enabled) {
    return (
      <Navigate
        to={mode === "investor" ? "/fundraiser/dashboard" : "/investor/dashboard"}
        replace
      />
    );
  }

  if (user?.activeMode !== mode) {
    return (
      <Navigate
        to={mode === "investor" ? "/investor/dashboard" : "/fundraiser/dashboard"}
        replace
      />
    );
  }

  return children;
}

function RequireLogin({ children }) {
  const rawUser = localStorage.getItem("user");
  const rawToken = localStorage.getItem("token");
  const user = rawUser ? JSON.parse(rawUser) : null;

  if (!rawToken || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RestrictPublicByMode({ blockedMode, children }) {
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  if (user?.activeMode === blockedMode) {
    return (
      <Navigate
        to={blockedMode === "investor" ? "/investor/dashboard" : "/fundraiser/dashboard"}
        replace
      />
    );
  }

  return children;
}

function AppRoutes({ loggedInUser, setLoggedInUser }) {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

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

      <PageTransition routeKey={`${location.pathname}${location.search}${location.hash}`}>
      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={
            <main className="homepage-flow">
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
            <RequireLogin>
              <>
                <BrowseInvestors />
                <Footer />
              </>
            </RequireLogin>
          }
        />

        <Route path="/investment-detail/:id" element={<InvestmentDetail />} />

        <Route
          path="/fundraising"
          element={
            <RequireLogin>
              <RestrictPublicByMode blockedMode="investor">
                <>
                  <FundraisingPage />
                  <Footer />
                </>
              </RestrictPublicByMode>
            </RequireLogin>
          }
        />

        <Route path="/select-account-mode" element={<SelectAccountMode />} />

        
        <Route
          path="/investor/company/dashboard"
          element={
            <RequireMode mode="investor">
              <CompanyInvestorDashboard />
            </RequireMode>
          }
        />
        <Route
          path="/fundraiser/dashboard"
          element={
            <RequireMode mode="fundraiser">
              <FundraiserDashboard />
            </RequireMode>
          }
        />
        <Route
          path="/fundraiser/company/dashboard"
          element={
            <RequireMode mode="fundraiser">
              <CompanyFundraiserDashboard />
            </RequireMode>
          }
        />
        <Route
          path="/fundraiser/campaigns"
          element={
            <RequireMode mode="fundraiser">
              <FundraiserCampaigns />
            </RequireMode>
          }
        />
        <Route
          path="/fundraiser/analytics"
          element={
            <RequireMode mode="fundraiser">
              <FundraiserAnalytics />
            </RequireMode>
          }
        />
        <Route
          path="/fundraiser/withdrawals"
          element={
            <RequireMode mode="fundraiser">
              <FundraiserWithdrawals />
            </RequireMode>
          }
        />
        <Route
          path="/fundraiser/profile"
          element={
            <RequireMode mode="fundraiser">
              <FundraiserProfile />
            </RequireMode>
          }
        />
        <Route
          path="/fundraiser/profile/kyc"
          element={
            <RequireMode mode="fundraiser">
              <FundraiserKYC />
            </RequireMode>
          }
        />
        <Route
          path="/fundraiser/profile/bank"
          element={
            <RequireMode mode="fundraiser">
              <FundraiserBank />
            </RequireMode>
          }
        />

        <Route path="/supporter-space" element={<SupporterSpace />} />
        <Route
          path="/contact"
          element={
            <>
              <ContactPage />
              <Footer />
            </>
          }
        />
        <Route path="/return-based-options" element={<ReturnBasedOptions />} />
        <Route
          path="/verified-opportunities"
          element={<VerifiedOpportunities />}
        />
        <Route path="/business-campaigns" element={<BusinessCampaigns />} />
        <Route path="/cause-based-funding" element={<CauseBasedFunding />} />
        <Route path="/fundraising-ideas" element={<FundraisingIdeas />} />
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
            <>
              <FundraisingCauseTopicPage />
              <Footer />
            </>
          }
        />

        <Route
          path="/start-fundraiser"
          element={
            <RestrictPublicByMode blockedMode="investor">
              <StartFundraiser />
            </RestrictPublicByMode>
          }
        />
        <Route path="/payment" element={<PaymentPage />} />


<Route path="/investor/dashboard" element={<RequireMode mode="investor"><InvestorDashboard /></RequireMode>} />
<Route path="/investor/portfolio" element={<RequireMode mode="investor"><InvestorPortfolio /></RequireMode>} />
<Route path="/investor/analytics" element={<RequireMode mode="investor"><InvestorAnalytics /></RequireMode>} />
<Route path="/investor/transactions" element={<RequireMode mode="investor"><InvestorTransactions /></RequireMode>} />
<Route path="/investor/profile" element={<RequireMode mode="investor"><InvestorProfile /></RequireMode>} />
<Route path="/investor/profile/kyc" element={<RequireMode mode="investor"><InvestorKyc /></RequireMode>} />
<Route path="/investor/profile/bank" element={<RequireMode mode="investor"><InvestorBank /></RequireMode>} />

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
