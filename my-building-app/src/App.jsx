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
import Plan from "../src/components/Plan.jsx";
import Footer from "../src/components/Footer.jsx";
import FeaturedProperties from "./components/FeaturedProperties.jsx";
import SecurityCompliance from "./components/SecurityCompliance.jsx";
import MoneyGrowth from "./components/MoneyGrowth.jsx";
import Testimonials from "./components/Testimonials.jsx";
import ProtectedRoute from "./pages/ProtectedRoutes.jsx";

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

import SelectAccountMode from "./pages/SelectAccountType.jsx";
import InvestorDashboard from "./pages/investor/InvestorDashboard.jsx";
import CompanyInvestorDashboard from "./pages/investor/CompanyInvestorDashboard";
import FundraiserDashboard from "./pages/Fundraiser/FundraiserDashboard";
import CompanyFundraiserDashboard from "./pages/Fundraiser/CompanyFundraiserDashboard";

import FundraiserCampaigns from "./pages/Fundraiser/FundraiserCampaign.jsx";
import FundraiserAnalytics from "./pages/Fundraiser/FundraiserAnalytics.jsx";
import FundraiserWithdrawals from "./pages/Fundraiser/FundraiserWithdrawal.jsx";
import FundraiserProfile from "./pages/Fundraiser/FundraiserProfile.jsx";
import FundraiserKYC from "./pages/Fundraiser/FundraiserKyc.jsx";
import FundraiserBank from "./pages/Fundraiser/FundraiserBank.jsx";

// Context
import { FundraiserProvider } from "./context/FundraiserContext.jsx";

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
  ];

  const shouldHideHeader =
    isAdminRoute ||
    hideHeaderRoutes.some((route) => location.pathname.startsWith(route));

  return (
    <div className="font-sans text-gray-900">
      {!shouldHideHeader && (
        <Header
          loggedInUser={loggedInUser}
          setLoggedInUser={setLoggedInUser}
        />
      )}

      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <HowItWorks />
              <Plan />
              <Testimonials />
              <SecurityCompliance />
              <Footer />
            </>
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
            <>
              <BrowseInvestors />
              <Footer />
            </>
          }
        />

        <Route path="/investment-detail/:id" element={<InvestmentDetail />} />

        <Route
          path="/fundraising"
          element={
            <>
              <FundraisingPage />
              <Footer />
            </>
          }
        />

        <Route path="/select-account-mode" element={<SelectAccountMode />} />

        {/* Investor + Fundraiser routes */}
        <Route
          path="/investor/dashboard"
          element={<InvestorDashboard />}
        />
        <Route
          path="/investor/company/dashboard"
          element={<CompanyInvestorDashboard />}
        />
        <Route
          path="/fundraiser/dashboard"
          element={<FundraiserDashboard />}
        />
        <Route
          path="/fundraiser/company/dashboard"
          element={<CompanyFundraiserDashboard />}
        />
        <Route
          path="/fundraiser/campaigns"
          element={<FundraiserCampaigns />}
        />
        <Route
          path="/fundraiser/analytics"
          element={<FundraiserAnalytics />}
        />
        <Route
          path="/fundraiser/withdrawals"
          element={<FundraiserWithdrawals />}
        />
        <Route
          path="/fundraiser/profile"
          element={<FundraiserProfile />}
        />
        <Route
          path="/fundraiser/profile/kyc"
          element={<FundraiserKYC />}
        />
        <Route
          path="/fundraiser/profile/bank"
          element={<FundraiserBank />}
        />

        <Route path="/supporter-space" element={<SupporterSpace />} />
        <Route path="/return-based-options" element={<ReturnBasedOptions />} />
        <Route
          path="/verified-opportunities"
          element={<VerifiedOpportunities />}
        />
        <Route path="/business-campaigns" element={<BusinessCampaigns />} />
        <Route path="/cause-based-funding" element={<CauseBasedFunding />} />
        <Route path="/fundraising-ideas" element={<FundraisingIdeas />} />

        <Route path="/start-fundraiser" element={<StartFundraiser />} />
        <Route path="/payment" element={<PaymentPage />} />


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