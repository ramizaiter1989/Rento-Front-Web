import "@/index.css";
import "@/App.css";
import "@/i18n/config";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import api from "@/lib/axios";
import { StatisticPage } from "@/pages/StatisticPage";

// Helper function to check profile status from backend
const checkProfileComplete = async () => {
  try {
    const res = await api.get("/profile/status");
    return res.data.is_complete;
  } catch (err) {
    console.error("Profile status check failed:", err);
    return false;
  }
};

// Protected Route Component (auth-based)
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Profile Complete Check Route
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

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isComplete) {
    return <Navigate to="/Complete-Profile" replace />;
  }

  return children;
};

// Agent-Only Route Component
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

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user is agency or agent role
  if (user.role !== "agency" && user.role !== "agent") {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if profile is incomplete - redirect to complete profile
  if (!isComplete) {
    return <Navigate to="/Complete-Profile" replace />;
  }

  return children;
};

// Layout with Navbar and Footer
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set RTL/LTR based on language
    const currentLang = localStorage.getItem("language") || "en";
    if (currentLang === "ar") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <SEO />
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            }
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/about"
            element={
              <MainLayout>
                <AboutPage />
              </MainLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <MainLayout>
                <ContactPage />
              </MainLayout>
            }
          />

          {/* Profile Completion Route - Auth Only (No Profile Check) */}
          <Route
            path="/Complete-Profile"
            element={
              <ProtectedRoute>
                <CompleteProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Agent/Agency Only Routes - Requires Profile Complete */}
          <Route
            path="/Dashboard"
            element={
              <AgentRoute>
                <DashboardPage />
              </AgentRoute>
            }
          />
          <Route
            path="/Statistic"
            element={
              <AgentRoute>
                <StatisticPage />
              </AgentRoute>
            }
          />
          <Route
            path="/Mycars"
            element={
              <AgentRoute>
                <MainLayout>
                  <MyCarsPage />
                </MainLayout>
              </AgentRoute>
            }
          />
          <Route
            path="/Mycars-bookings"
            element={
              <AgentRoute>
                <MainLayout>
                  <AgentBookingsPage />
                </MainLayout>
              </AgentRoute>
            }
          />
          <Route
            path="/add-car"
            element={
              <AgentRoute>
                <MainLayout>
                  <CreateCarPage />
                </MainLayout>
              </AgentRoute>
            }
          />
          <Route
            path="/Add/car/qualification"
            element={
              <AgentRoute>
                <MainLayout>
                  <CarQualificationsPage />
                </MainLayout>
              </AgentRoute>
            }
          />

          {/* Protected routes (all authenticated users) - Requires Profile Complete */}
          <Route
            path="/BookingChat"
            element={
              <ProfileCompleteRoute>
                <MainLayout>
                  <BookingChatSystem />
                </MainLayout>
              </ProfileCompleteRoute>
            }
          />
          <Route
            path="/socialmedia"
            element={
              <ProfileCompleteRoute>
                <MainLayout>
                  <SocialMediaPage />
                </MainLayout>
              </ProfileCompleteRoute>
            }
          />
          <Route
            path="/cars"
            element={
              <ProfileCompleteRoute>
                <MainLayout>
                  <CarsPage />
                </MainLayout>
              </ProfileCompleteRoute>
            }
          />
          <Route
            path="/ClientBookings"
            element={
              <ProfileCompleteRoute>
                <MainLayout>
                  <ClientBookingPage />
                </MainLayout>
              </ProfileCompleteRoute>
            }
          />
          <Route
            path="/luxury-car-rental-lebanon"
            element={
              <ProfileCompleteRoute>
                <MainLayout>
                  <CarsPage />
                </MainLayout>
              </ProfileCompleteRoute>
            }
          />
          <Route
            path="/cars/:id"
            element={
              <ProfileCompleteRoute>
                <MainLayout>
                  <CarDetailPage />
                </MainLayout>
              </ProfileCompleteRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProfileCompleteRoute>
                <MainLayout>
                  <FavoritesPage />
                </MainLayout>
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