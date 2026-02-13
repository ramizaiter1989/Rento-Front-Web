import "@/index.css";
import "@/App.css";
import "@/i18n/config";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AgentLayout } from "@/components/AgentLayout";
import { AuthPage } from "@/pages/AuthPage";
import { HomePage } from "@/pages/HomePage";
import { CarsPage } from "@/pages/CarsPage";
import { CarDetailPage } from "@/pages/CarDetailPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { ClientBookingPage } from "@/pages/ClientBookingPage";
import { CreateCarPage } from "@/pages/CreateCarPage";
import { MyCarsPage } from "@/pages/MyCarsPage";
import { BookingChatSystem } from "@/pages/BookingChatSystem";
import { AgentBookingsPage } from "@/pages/AgentBookingsPage";
import { SocialMediaPage } from "@/pages/SocialMediaPage";
import CarQualificationsPage from "@/pages/CarQualificationsPage";
import DashboardPage from "@/pages/DashoardPage";
import { SEO } from "@/components/SEO";
import CompleteProfilePage from "@/pages/CompleteProfilePage";
import { ClientBookingChat } from "@/pages/ClientBookingChat";
import api from "@/lib/axios";
import { StatisticPage } from "@/pages/StatisticPage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import AdminAuthPage from "@/pages/AdminAuthPage";
import RealUserDataPage from "@/pages/RealUserDataPage";
import AdsAnalyticsPage from "@/pages/AdsAnalyticsPage";
import AdsPopup from "@/components/AdsPopup";

/* ============================
   Helper
============================ */

const checkProfileComplete = async () => {
  try {
    const res = await api.get("/profile/status");
    return res.data.is_complete;
  } catch {
    return false;
  }
};

/* ============================
   Route Guards
============================ */

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
};

const ProfileCompleteRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const isAuthenticated = !!localStorage.getItem("authToken");

  useEffect(() => {
    const checkStatus = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      const complete = await checkProfileComplete();
      setIsComplete(complete);
      setLoading(false);
    };
    checkStatus();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  if (!isComplete) return <Navigate to="/Complete-Profile" replace />;

  return children;
};

const AgentRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (user.role !== "agency" && user.role !== "agent")
    return <Navigate to="/" replace />;

  return children;
};

const AdminRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!isAuthenticated) return <Navigate to="/admin-auth" replace />;
  if (user.role !== "admin")
    return <Navigate to="/admin-auth" replace />;

  return children;
};

/* ============================
   Layout Wrapper
============================ */

const PageLayout = ({ children, noIndex = false }) => {
  return (
    <>
      <SEO noIndex={noIndex} />
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

/* ============================
   App
============================ */

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = localStorage.getItem("language") || "en";
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route
            path="/"
            element={
              <>
                <PageLayout>
                  <HomePage />
                </PageLayout>
                <AdsPopup />
              </>
            }
          />

          <Route
            path="/auth"
            element={
              <PageLayout noIndex>
                <AuthPage />
              </PageLayout>
            }
          />

          <Route
            path="/admin-auth"
            element={
              <PageLayout noIndex>
                <AdminAuthPage />
              </PageLayout>
            }
          />

          {/* ============================
              ADMIN DEFAULT → DASHBOARD
          ============================ */}

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AgentLayout>
                  <DashboardPage />
                </AgentLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/real-user-data"
            element={
              <AdminRoute>
                <AgentLayout>
                  <RealUserDataPage />
                </AgentLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/ads-analytics"
            element={
              <AdminRoute>
                <AgentLayout>
                  <AdsAnalyticsPage />
                </AgentLayout>
              </AdminRoute>
            }
          />

          {/* Agent Dashboard */}
          <Route
            path="/Dashboard"
            element={
              <AgentRoute>
                <AgentLayout>
                  <DashboardPage />
                </AgentLayout>
              </AgentRoute>
            }
          />

          <Route
            path="/Statistic"
            element={
              <AgentRoute>
                <AgentLayout>
                  <StatisticPage />
                </AgentLayout>
              </AgentRoute>
            }
          />

          <Route
            path="/Mycars"
            element={
              <AgentRoute>
                <AgentLayout>
                  <MyCarsPage />
                </AgentLayout>
              </AgentRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
