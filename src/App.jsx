import "@/index.css";
import "@/App.css";
import "@/i18n/config";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import BalancePage from "@/pages/BalancePage";
import { SEO } from "@/components/SEO";
import CompleteProfilePage from "@/pages/CompleteProfilePage";
import { ClientBookingChat } from "@/pages/ClientBookingChat";
import api from "@/lib/axios";
import { StatisticPage } from "@/pages/StatisticPage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import MobileAppPage from "@/pages/MobileAppPage";
import AdminPanelPage from "@/pages/AdminPanelPage";
import AdminAuthPage from "@/pages/AdminAuthPage";

// New admin dashboard layout & pages
import { AdminLayout } from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminCarsPage from "@/pages/admin/AdminCarsPage";
import AdminBookingsPage from "@/pages/admin/AdminBookingsPage";
import AdminPaymentsPage from "@/pages/admin/AdminPaymentsPage";
import AdminAdsPage from "@/pages/admin/AdminAdsPage";
import AdminFeaturedCarsPage from "@/pages/admin/AdminFeaturedCarsPage";
import AdminHolidaysPage from "@/pages/admin/AdminHolidaysPage";
import AdminAnnouncementsPage from "@/pages/admin/AdminAnnouncementsPage";
import AdminAppealsPage from "@/pages/admin/AdminAppealsPage";
import AdminSuggestionsPage from "@/pages/admin/AdminSuggestionsPage";
import AdminNotificationsPage from "@/pages/admin/AdminNotificationsPage";
import AdminOtpsPage from "@/pages/admin/AdminOtpsPage";
import AdminPromoCodesPage from "@/pages/admin/AdminPromoCodesPage";
import AdminBrokersPage from "@/pages/admin/AdminBrokersPage";
import AdminServicesPage from "@/pages/admin/AdminServicesPage";
import AdminRealUserDataPage from "@/pages/admin/AdminRealUserDataPage";
import AdsAnalyticsPage from "@/pages/AdsAnalyticsPage";
import AdsPopup from "@/components/AdsPopup";
import { WatchPage } from "@/pages/WatchPage";
import AgencyDetailsPage from "@/pages/AgencyDetailsPage";
import AdminAgenciesPage from "@/pages/admin/AdminAgenciesPage";

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

const AdminRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!isAuthenticated) return <Navigate to="/admin-auth" replace />;
  if (user.role !== "admin")
    return <Navigate to="/admin-auth" replace />;

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
function AppContent() {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const currentLang = localStorage.getItem("language") || "en";
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
  }, []);

  // Meta Pixel: track PageView on route change (SPA)
  useEffect(() => {
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <Routes>
          {/* Public Routes */}
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
          <Route
            path="/watch"
            element={<WatchPage />}
          />
          <Route
            path="/mobile-app"
            element={
              <PageLayout>
                <MobileAppPage />
              </PageLayout>
            }
          />
          <Route
  path="/agency/:id"
  element={
    <PageLayout>
      <AgencyDetailsPage />
    </PageLayout>
  }
/>
          <Route path="/Privacy-Policy" element={<PrivacyPolicy />} />
          <Route path="/Terms-and-Conditions" element={<TermsAndConditions />} />

          {/* Admin Routes */}
          <Route
            path="/admin-auth"
            element={
              <PageLayout noIndex>
                <AdminAuthPage />
              </PageLayout>
            }
          />
          <Route
            path="/admin-panel-page"
            element={
              <AdminRoute>
                <PageLayout noIndex>
                  <AdminPanelPage />
                </PageLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/ads-analytics"
            element={
              <AdminRoute>
                <PageLayout noIndex>
                  <AdsAnalyticsPage />
                </PageLayout>
              </AdminRoute>
            }
          />

          {/* New Admin Dashboard (nested under /admin) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            
            {/* Default admin dashboard */}
            <Route index element={<AdminDashboard />} />

            {/* Management */}
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="cars" element={<AdminCarsPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="real-user-data" element={<AdminRealUserDataPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="promo-codes" element={<AdminPromoCodesPage />} />
            <Route path="brokers" element={<AdminBrokersPage />} />
            <Route path="ads" element={<AdminAdsPage />} />
            <Route path="featured" element={<AdminFeaturedCarsPage />} />
            <Route path="holidays" element={<AdminHolidaysPage />} />
            <Route path="agencies" element={<AdminAgenciesPage />} />
            

            {/* System */}
            <Route path="announcements" element={<AdminAnnouncementsPage />} />
            <Route path="appeals" element={<AdminAppealsPage />} />
            <Route path="suggestions" element={<AdminSuggestionsPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="otps" element={<AdminOtpsPage />} />
          </Route>

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
          <Route
            path="/Mycars-bookings"
            element={
              <AgentRoute>
                <AgentLayout>
                  <AgentBookingsPage />
                </AgentLayout>
              </AgentRoute>
            }
          />
          <Route
            path="/Balance"
            element={
              <AgentRoute>
                <AgentLayout>
                  <BalancePage />
                </AgentLayout>
              </AgentRoute>
            }
          />
          <Route
            path="/add-car"
            element={
              <AgentRoute>
                <AgentLayout>
                  <CreateCarPage />
                </AgentLayout>
              </AgentRoute>
            }
          />
          <Route
            path="/Add/car/qualification"
            element={
              <AgentRoute>
                <AgentLayout>
                  <CarQualificationsPage />
                </AgentLayout>
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
              <>
                <ProfileCompleteRoute>
                  <PageLayout>
                    <CarsPage />
                  </PageLayout>
                </ProfileCompleteRoute>
                <AdsPopup />
              </>
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
              <>
                <ProfileCompleteRoute>
                  <PageLayout>
                    <CarsPage />
                  </PageLayout>
                </ProfileCompleteRoute>
                <AdsPopup />
              </>
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
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div>
  );
}

export default App;
