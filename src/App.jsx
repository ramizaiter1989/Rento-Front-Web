import "@/index.css";
import "@/App.css";
import '@/i18n/config';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { IntroPage } from '@/pages/IntroPage';
import { AuthPage } from '@/pages/AuthPage';
import { HomePage } from '@/pages/HomePage';
import { CarsPage } from '@/pages/CarsPage';
import { CarDetailPage } from '@/pages/CarDetailPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { ClientBookingPage } from '@/pages/ClientBookingPage';
import { CreateCarPage } from '@/pages/CreateCarPage';
import { MyCarsPage } from '@/pages/MyCarsPage';
import { AgentBookingsPage } from '@/pages/AgentBookingsPage';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const hasSeenIntro = localStorage.getItem('hasSeenIntro');
  
  if (!hasSeenIntro) {
    return <Navigate to="/intro" replace />;
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
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    // Check if user has seen intro
    const seenIntro = localStorage.getItem('hasSeenIntro');
    setHasSeenIntro(!!seenIntro);
    
    // Set RTL/LTR based on language
    const currentLang = localStorage.getItem('language') || 'en';
    if (currentLang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Intro and Auth Routes (no navbar/footer) */}
          <Route path="/intro" element={<IntroPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Main App Routes (with navbar/footer) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <HomePage />
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
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AboutPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ContactPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;