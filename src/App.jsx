import "@/index.css";
import "@/App.css";
import "@/i18n/config";
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
// Removed IntroPage import
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

import { SEO } from "@/components/SEO";

// Protected Route Component (auth-based now)
const ProtectedRoute = ({ children }) => {
  // Change this to match your real auth logic
  const isAuthenticated = !!localStorage.getItem("authToken");

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
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
  const { i18n } = useTranslation(); // if unused, you can remove this line + import

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
          {/* Public routes (no auth required) */}
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

          {/* Protected routes (auth required) */}
          <Route
            path="/BookingChat"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BookingChatSystem />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/socialmedia"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SocialMediaPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cars"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CarsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/Mycars"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MyCarsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ClientBookings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ClientBookingPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/Mycars/bookings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AgentBookingsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/Add/car"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CreateCarPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/Add/car/qualification"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CarQualificationsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/luxury-car-rental-lebanon"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CarsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cars/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CarDetailPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <FavoritesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback: redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
