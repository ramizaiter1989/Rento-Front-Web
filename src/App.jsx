import "@/index.css";
import "@/App.css";
import "@/i18n/config";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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

// ============================
// Helper functions
// ============================
const checkProfileComplete = async () => {
  try {
    const res = await api.get("/profile/status");
    return res.data.is_complete;
  } catch (err) {
    console.error("Profile status check failed:", err);
    return false;
  }
};

// ============================
// Route Guards
// ============================
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
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const isAuthenticated = !!localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

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
  if (user.role !== "agency" && user.role !== "agent")
    return <Navigate to="/" replace />;
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  if (!isComplete) return <Navigate to="/Complete-Profile" replace />;

  return children;
};

// ============================
// Page Layout Wrapper
// ============================
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

// ============================
// App
// ============================
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
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PageLayout>
                <HomePage />
              </PageLayout>
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
            path="/about"
            element={
              <PageLayout>
                <AboutPage />
              </PageLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <PageLayout>
                <ContactPage />
              </PageLayout>
            }
          />
          <Route path="/Privacy-Policy" element={<PrivacyPolicy />} />
          <Route path="/Terms-and-Conditions" element={<TermsAndConditions />} />

          {/* Profile Completion */}
          <Route
            path="/Complete-Profile"
            element={
              <ProtectedRoute>
                <PageLayout noIndex>
                  <CompleteProfilePage />
                </PageLayout>
              </ProtectedRoute>
            }
          />

          {/* Agent / Agency Routes */}
          <Route
            path="/Dashboard"
            element={
              <AgentRoute>
                <PageLayout>
                  <DashboardPage />
                </PageLayout>
              </AgentRoute>
            }
          />
          <Route
            path="/Statistic"
            element={
              <AgentRoute>
                <PageLayout>
                  <StatisticPage />
                </PageLayout>
              </AgentRoute>
            }
          />
          <Route
            path="/Mycars"
            element={
              <AgentRoute>
                <PageLayout>
                  <MyCarsPage />
                </PageLayout>
              </AgentRoute>
            }
          />
          <Route
            path="/Mycars-bookings"
            element={
              <AgentRoute>
                <PageLayout>
                  <AgentBookingsPage />
                </PageLayout>
              </AgentRoute>
            }
          />
          <Route
            path="/add-car"
            element={
              <AgentRoute>
                <PageLayout>
                  <CreateCarPage />
                </PageLayout>
              </AgentRoute>
            }
          />
          <Route
            path="/Add/car/qualification"
            element={
              <AgentRoute>
                <PageLayout>
                  <CarQualificationsPage />
                </PageLayout>
              </AgentRoute>
            }
          />

          {/* Protected / Authenticated Routes */}
          <Route
            path="/BookingChat"
            element={
              <ProfileCompleteRoute>
                <PageLayout>
                  <BookingChatSystem />
                </PageLayout>
              </ProfileCompleteRoute>
            }
          />
          <Route
            path="/client-Chat"
            element={
              <ProfileCompleteRoute>
                <PageLayout>
                  <ClientBookingChat />
                </PageLayout>
              </ProfileCompleteRoute>
            }
          />
          <Route
            path="/socialmedia"
            element={
              <PageLayout>
                <SocialMediaPage />
              </PageLayout>
            }
          />
          <Route
            path="/cars"
            element={
              <ProfileCompleteRoute>
                <PageLayout>
                  <CarsPage />
                </PageLayout>
              </ProfileCompleteRoute>
            }
          />
          <Route
            path="/ClientBookings"
            element={
              <ProfileCompleteRoute>
                <PageLayout>
                  <ClientBookingPage />
                </PageLayout>
              </ProfileCompleteRoute>
            }
          />
          <Route
            path="/luxury-car-rental-lebanon"
            element={
              <ProfileCompleteRoute>
                <PageLayout>
                  <CarsPage />
                </PageLayout>
              </ProfileCompleteRoute>
            }
          />
          <Route
            path="/cars/:id"
            element={
              <ProfileCompleteRoute>
                <PageLayout>
                  <CarDetailPage />
                </PageLayout>
              </ProfileCompleteRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProfileCompleteRoute>
                <PageLayout>
                  <FavoritesPage />
                </PageLayout>
              </ProfileCompleteRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
