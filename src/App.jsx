import "@/index.css";
import "@/App.css";
import "@/i18n/config";
import React, { Suspense, useEffect, useState, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { useActiveHeartbeat } from "@/hooks/useActiveHeartbeat";

<<<<<<< HEAD
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
=======
// Lazy-loaded pages (code-split into separate chunks)
const HomePage = lazy(() => import("@/pages/HomePage").then(m => ({ default: m.HomePage })));
const AuthPage = lazy(() => import("@/pages/AuthPage").then(m => ({ default: m.AuthPage })));
const AboutPage = lazy(() => import("@/pages/AboutPage").then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("@/pages/ContactPage").then(m => ({ default: m.ContactPage })));
const CarsPage = lazy(() => import("@/pages/CarsPage").then(m => ({ default: m.CarsPage })));
const CarDetailPage = lazy(() => import("@/pages/CarDetailPage").then(m => ({ default: m.CarDetailPage })));
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage").then(m => ({ default: m.FavoritesPage })));
const ClientBookingPage = lazy(() => import("@/pages/ClientBookingPage").then(m => ({ default: m.ClientBookingPage })));
const BookingChatSystem = lazy(() => import("@/pages/BookingChatSystem").then(m => ({ default: m.BookingChatSystem })));
const ClientBookingChat = lazy(() => import("@/pages/ClientBookingChat").then(m => ({ default: m.ClientBookingChat })));
const SocialMediaPage = lazy(() => import("@/pages/SocialMediaPage").then(m => ({ default: m.SocialMediaPage })));
const StatisticPage = lazy(() => import("@/pages/StatisticPage").then(m => ({ default: m.StatisticPage })));
const WatchPage = lazy(() => import("@/pages/WatchPage").then(m => ({ default: m.WatchPage })));
const AgentBookingsPage = lazy(() => import("@/pages/AgentBookingsPage").then(m => ({ default: m.AgentBookingsPage })));
const AgentBookingDetailPage = lazy(() => import("@/pages/AgentBookingDetailPage").then(m => ({ default: m.AgentBookingDetailPage })));

const MobileAppPage = lazy(() => import("@/pages/MobileAppPage"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("@/pages/TermsAndConditions"));
const CompleteProfilePage = lazy(() => import("@/pages/CompleteProfilePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const CreateCarPage = lazy(() => import("@/pages/CreateCarPage").then(m => ({ default: m.CreateCarPage || m.default })));
const MyCarsPage = lazy(() => import("@/pages/MyCarsPage").then(m => ({ default: m.MyCarsPage || m.default })));
const CarQualificationsPage = lazy(() => import("@/pages/CarQualificationsPage"));
const DashboardPage = lazy(() => import("@/pages/DashoardPage"));
const BalancePage = lazy(() => import("@/pages/BalancePage"));
const AdminPanelPage = lazy(() => import("@/pages/AdminPanelPage"));
const AdminAuthPage = lazy(() => import("@/pages/AdminAuthPage"));
const AdsAnalyticsPage = lazy(() => import("@/pages/AdsAnalyticsPage"));
const AdsPopup = lazy(() => import("@/components/AdsPopup"));

// Admin pages (rarely visited, big savings from lazy loading)
const AgentLayout = lazy(() => import("@/components/AgentLayout").then(m => ({ default: m.AgentLayout })));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const AdminCarsPage = lazy(() => import("@/pages/admin/AdminCarsPage"));
const AdminBookingsPage = lazy(() => import("@/pages/admin/AdminBookingsPage"));
const AdminPaymentsPage = lazy(() => import("@/pages/admin/AdminPaymentsPage"));
const AdminAdsPage = lazy(() => import("@/pages/admin/AdminAdsPage"));
const AdminFeaturedCarsPage = lazy(() => import("@/pages/admin/AdminFeaturedCarsPage"));
const AdminHolidaysPage = lazy(() => import("@/pages/admin/AdminHolidaysPage"));
const AdminAnnouncementsPage = lazy(() => import("@/pages/admin/AdminAnnouncementsPage"));
const AdminAppealsPage = lazy(() => import("@/pages/admin/AdminAppealsPage"));
const AdminSuggestionsPage = lazy(() => import("@/pages/admin/AdminSuggestionsPage"));
const AdminNotificationsPage = lazy(() => import("@/pages/admin/AdminNotificationsPage"));
const AdminAlertsPage = lazy(() => import("@/pages/admin/AdminAlertsPage"));
const AdminOtpsPage = lazy(() => import("@/pages/admin/AdminOtpsPage"));
const AdminPromoCodesPage = lazy(() => import("@/pages/admin/AdminPromoCodesPage"));
const AdminBrokersPage = lazy(() => import("@/pages/admin/AdminBrokersPage"));
const AdminAgenciesPage = lazy(() => import("@/pages/admin/AdminAgenciesPage"));
const AdminServicesPage = lazy(() => import("@/pages/admin/AdminServicesPage"));
const AdminRealUserDataPage = lazy(() => import("@/pages/admin/AdminRealUserDataPage"));
>>>>>>> d7f0598ba238695ac2bb6c17afb46754360d3df2

// ============================
// Helper functions
// ============================
const checkProfileComplete = async () => {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  if (!token) return false;
  try {
    const res = await api.get("/profile/status");
    return res.data.is_complete;
  } catch {
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
const PageLayout = ({ children, noIndex = false, title, description, ogTitle, ogDescription }) => {
  return (
    <>
      <SEO noIndex={noIndex} title={title} description={description} ogTitle={ogTitle} ogDescription={ogDescription} />
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
  const { isAuthenticated } = useAuth();

  useActiveHeartbeat(isAuthenticated);

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

  const loadingFallback = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <Suspense fallback={loadingFallback}>
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
              <PageLayout
                title="About Rento LB | Car Rental Marketplace in Lebanon"
                description="Learn about Rento LB, Lebanon's car rental marketplace connecting renters with trusted agencies and private owners."
              >
                <AboutPage />
              </PageLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <PageLayout
                title="Contact Rento LB | Get in Touch"
                description="Contact Rento LB for car rental inquiries in Lebanon. Reach us by phone, email, or social media."
              >
                <ContactPage />
              </PageLayout>
            }
          />
          <Route
            path="/watch"
            element={
              <PageLayout
                title="Watch – Rento LB | Car Rental Lebanon"
                description="Watch Rento LB's premium car rental video. Compare and book from agencies and private owners in Lebanon."
              >
                <WatchPage />
              </PageLayout>
            }
          />
          <Route
            path="/mobile-app"
            element={
              <PageLayout
                title="Rento LB Mobile App | Download for iOS & Android"
                description="Download the Rento LB mobile app for iOS and Android. Book rental cars in Lebanon on the go from Google Play and Apple App Store."
              >
                <MobileAppPage />
              </PageLayout>
            }
          />
          <Route
<<<<<<< HEAD
  path="/agency/:id"
  element={
    <PageLayout>
      <AgencyDetailsPage />
    </PageLayout>
  }
/>
          <Route path="/Privacy-Policy" element={<PrivacyPolicy />} />
          <Route path="/Terms-and-Conditions" element={<TermsAndConditions />} />
=======
            path="/Privacy-Policy"
            element={
              <PageLayout
                title="Privacy Policy | Rento LB"
                description="Read Rento LB's privacy policy. Learn how we collect, use, and protect your personal data."
              >
                <PrivacyPolicy />
              </PageLayout>
            }
          />
          <Route
            path="/Terms-and-Conditions"
            element={
              <PageLayout
                title="Terms and Conditions | Rento LB"
                description="Read Rento LB's terms and conditions for car rental services in Lebanon."
              >
                <TermsAndConditions />
              </PageLayout>
            }
          />
>>>>>>> d7f0598ba238695ac2bb6c17afb46754360d3df2

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
            <Route path="agencies" element={<AdminAgenciesPage />} />
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
            <Route path="alerts" element={<AdminAlertsPage />} />
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
            path="/Mycars-bookings/detail"
            element={
              <AgentRoute>
                <AgentLayout>
                  <AgentBookingDetailPage />
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
              <PageLayout
                title="Follow Rento LB on Social Media"
                description="Follow Rento LB on Instagram, Facebook, TikTok, X, and LinkedIn for the latest car rental deals in Lebanon."
              >
                <SocialMediaPage />
              </PageLayout>
            }
          />
          <Route
            path="/cars"
            element={
              <>
                <ProfileCompleteRoute>
                  <PageLayout
                    title="Browse Rental Cars in Lebanon | Rento LB"
                    description="Browse and compare rental cars from agencies and private owners across Lebanon."
                    noIndex
                  >
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
                  <PageLayout
                    title="Luxury Car Rental in Lebanon | Rento LB"
                    description="Rent luxury cars in Lebanon. Browse premium vehicles from trusted agencies and private owners."
                    noIndex
                  >
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

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <PageLayout noIndex title="Page Not Found | Rento LB">
                <NotFoundPage />
              </PageLayout>
            }
          />
        </Routes>
      </Suspense>
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
