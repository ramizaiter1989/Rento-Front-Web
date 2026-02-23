/**
 * ============================================
 * RENTO LB - COMPLETE HOMEPAGE
 * ============================================
 * 
 * Features:
 * - Professional animations with logo colors
 * - Mobile-first responsive design
 * - Enhanced car cards with modal feedback
 * - Video hero section
 * - Stats and features sections
 * - Full accessibility support
 * 
 * Logo Colors:
 * - Dark Blue: #1e5f7a
 * - Teal: #007A76
 * - Lime Green: #8EDC81
 * 
 * Installation:
 * 1. Copy this file to: src/pages/HomePage.jsx
 * 2. Import the CSS: import './homepage-animations.css'
 * 3. Ensure all Shadcn UI components are installed
 * 4. Add hero video to: /public/hero.mp4
 * 
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '../lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { handleMobileAppStoreClick } from '@/lib/mobileAppClick';
import {
  Search,
  MapPin,
  Calendar,
  Car,
  Shield,
  Clock,
  DollarSign,
  ArrowRight,
  Star,
  Users,
  Zap,
  Award,
  TrendingUp,
  Sparkles,
  Heart,
  Fuel,
  Settings,
  MessageSquare,
  Eye,
} from 'lucide-react';

// ===========================================
// FEEDBACK MODAL COMPONENT
// ===========================================
const FeedbacksModal = ({ feedbacks, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#007A76]" />
            Customer Feedback
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors hover:scale-110 w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
            aria-label="Close feedbacks"
          >
            ✕
          </button>
        </div>

        {feedbacks && feedbacks.length > 0 ? (
          <ul className="space-y-4">
            {feedbacks.map((fb, index) => (
              <li 
                key={index} 
                className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-[#8EDC81] fill-[#8EDC81]" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {fb.rating ? `${fb.rating}/5` : 'N/A'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {fb.comments || 'No comment provided.'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic text-center py-8">
            No feedback yet. Be the first to review!
          </p>
        )}
      </div>
    </div>
  );
};

// ===========================================
// ENHANCED CAR CARD COMPONENT
// ===========================================
const CarCard = ({ car, forceFavorite = false, onToggleFavoriteApi }) => {
  const [favorite, setFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFeedbacksModal, setShowFeedbacksModal] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (forceFavorite) {
      setFavorite(true);
      return;
    }
    setFavorite(false);
  }, [car?.id, forceFavorite]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!car?.id || favLoading) return;
    if (!isAuthenticated) {
      toast.error('Please log in to save favorites.');
      return;
    }
    if (onToggleFavoriteApi) return onToggleFavoriteApi();

    const next = !favorite;
    setFavorite(next);
    setFavLoading(true);

    try {
      await api.post(`/cars/${car.id}/favorite`);
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (err) {
      console.error('Favorite toggle error:', err);
      setFavorite(!next);
    } finally {
      setFavLoading(false);
    }
  };

  // Extract data with fallbacks
  const carData = {
    id: car.id,
    image: car.main_image_url || car.image || '/placeholder.png',
    brand: car.make || car.brand || 'Car',
    model: car.model || 'Model',
    year: car.year || 'N/A',
    category: car.car_category || car.type || car.category || 'Standard',
    seats: car.seats || 4,
    transmission: car.transmission || 'Auto',
    fuelType: car.fuel_type || car.fuelType || 'Petrol',
    price: car.daily_rate || car.price || 0,
    holidayRate: car.holiday_rate || null,
    deposit: car.deposit || null,
    isDeposit: car.is_deposit || false,
    feedbacks: car.feedbacks || [],
    popular: car.popular || false,
    location: car.live_location?.address || car.location || null,
  };

  return (
    <>
      <Link to={`/cars/${carData.id}`} className="block group">
        <Card className="relative overflow-hidden h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#007A76] transition-all duration-300 hover:shadow-lg hover:shadow-[#007A76]/20 hover:-translate-y-1">
          {/* Image Section */}
          <div className="relative overflow-hidden aspect-square bg-gray-100 dark:bg-gray-700">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
            )}
            <img
              src={`/api/storage/${carData.image}`} 
              alt={`${carData.brand} ${carData.model}`}
              loading="lazy"
              width="400"
              height="400"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

            {/* Favorite Button */}
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`absolute top-2 right-2 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 z-20 ${
                favorite
                  ? 'bg-red-500 shadow-md'
                  : 'bg-white/90 dark:bg-gray-800/90 hover:scale-110'
              } ${favLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Heart
                className={`w-4 h-4 transition-all ${
                  favorite ? 'fill-white text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
              />
            </button>

            {/* Category Badge */}
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-[#007A76] dark:text-[#8EDC81] border border-[#007A76]/30 dark:border-[#8EDC81]/30 text-xs font-semibold px-2 py-0.5">
                {carData.category}
              </Badge>
            </div>

            {/* Popular Badge */}
            {carData.popular && (
              <div className="absolute bottom-2 left-2 z-10">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold border-0 px-2 py-0.5 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  Popular
                </Badge>
              </div>
            )}

            {/* Price Badge */}
            <div className="absolute bottom-2 right-2 z-10">
              <Badge className="bg-gradient-to-r from-[#007A76] to-[#8EDC81] text-white text-xs font-bold px-2 py-1">
                ${carData.price}/day
              </Badge>
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="p-2.5 flex-grow">
            {/* Brand & Model */}
            <div className="mb-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-semibold text-[#007A76] dark:text-[#8EDC81] uppercase tracking-wide">
                  {carData.brand}
                </p>
                <div className="flex flex-col items-end">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{carData.year}</p>
                  {carData.location && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-gray-400 dark:text-gray-500" />
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 line-clamp-1">{carData.location}</p>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#007A76] dark:group-hover:text-[#8EDC81] transition-colors">
                {carData.model}
              </h3>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-1 mb-1.5">
              <div className="flex flex-col items-center p-1 rounded bg-gray-50 dark:bg-gray-700/50 group-hover:bg-[#007A76]/10 dark:group-hover:bg-[#007A76]/20 transition-colors">
                <Users className="w-3 h-3 text-[#007A76] dark:text-[#8EDC81] mb-0.5" />
                <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                  {carData.seats}
                </span>
              </div>

              <div className="flex flex-col items-center p-1 rounded bg-gray-50 dark:bg-gray-700/50 group-hover:bg-[#007A76]/10 dark:group-hover:bg-[#007A76]/20 transition-colors">
                <Settings className="w-3 h-3 text-[#007A76] dark:text-[#8EDC81] mb-0.5" />
                <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 truncate w-full text-center">
                  {carData.transmission.slice(0, 4)}
                </span>
              </div>

              <div className="flex flex-col items-center p-1 rounded bg-gray-50 dark:bg-gray-700/50 group-hover:bg-[#007A76]/10 dark:group-hover:bg-[#007A76]/20 transition-colors">
                <Fuel className="w-3 h-3 text-[#007A76] dark:text-[#8EDC81] mb-0.5" />
                <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 truncate w-full text-center">
                  {carData.fuelType.slice(0, 4)}
                </span>
              </div>
            </div>

            {/* Pricing Info - Compact */}
            {(carData.holidayRate || carData.isDeposit) && (
              <div className="flex items-center gap-1 mb-1.5 text-[10px]">
                {carData.holidayRate && (
                  <div className="flex-1 text-center p-1 bg-gradient-to-br from-[#007A76]/10 to-[#8EDC81]/10 dark:from-[#1e5f7a]/20 dark:to-[#007A76]/20 rounded border border-[#007A76]/20">
                    <p className="text-gray-600 dark:text-gray-400 font-medium text-[9px] leading-tight">Holiday</p>
                    <p className="font-bold text-[#1e5f7a] dark:text-[#8EDC81] text-xs leading-tight">${carData.holidayRate}</p>
                  </div>
                )}
                {carData.isDeposit && (
                  <div className="flex-1 text-center p-1 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                    <p className="text-gray-600 dark:text-gray-400 font-medium text-[9px] leading-tight">Deposit</p>
                    <p className="font-bold text-amber-800 dark:text-amber-300 text-xs leading-tight">${carData.deposit}</p>
                  </div>
                )}
              </div>
            )}

            {/* Feedback Button - Compact */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowFeedbacksModal(true);
              }}
              className="w-full flex items-center justify-between p-1 rounded bg-gray-50 dark:bg-gray-700/50 hover:bg-[#007A76]/10 dark:hover:bg-[#007A76]/20 transition-all border border-gray-200 dark:border-gray-700 hover:border-[#007A76] group/feedback mb-1.5"
              aria-label="Open customer feedback"
            >
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-[#007A76] dark:text-[#8EDC81]" />
                <span className="text-[10px] font-semibold text-gray-900 dark:text-white">Reviews</span>
              </div>
              <Badge className="bg-gradient-to-r from-[#007A76] to-[#8EDC81] text-white text-[10px] font-bold px-1.5 py-0">
                {carData.feedbacks.length}
              </Badge>
            </button>

            {/* CTA Button - Compact */}
            <Button className="w-full bg-gradient-to-r from-[#1e5f7a] via-[#007A76] to-[#8EDC81] hover:from-[#184a5e] hover:via-[#008c88] hover:to-[#7bc876] text-white font-bold py-2 text-xs rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group/btn">
              <span className="flex items-center justify-center gap-1">
                <Eye className="w-3 h-3" />
                View Details
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </span>
            </Button>
          </CardContent>
        </Card>
      </Link>

      {showFeedbacksModal && (
        <FeedbacksModal
          feedbacks={carData.feedbacks}
          onClose={() => setShowFeedbacksModal(false)}
        />
      )}
    </>
  );
};

// ===========================================
// HOMEPAGE COMPONENT
// ===========================================
export const HomePage = () => {
  const [searchData, setSearchData] = useState({
    location: '',
    pickupDate: '',
    returnDate: '',
  });

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await api.get('/guest-cars');
        if (!res.data || !res.data.cars) {
          throw new Error('Invalid response from server');
        }
        setCars(res.data.cars);
      } catch (err) {
        console.error('Error fetching cars:', err.response?.data || err.message);
        setError('Failed to load cars. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = '/luxury-car-rental-lebanon';
  };

  const features = [
    {
      icon: Shield,
      title: 'Premium Insurance',
      description: 'Comprehensive coverage with every rental',
      gradient: 'from-[#1e5f7a] to-[#007A76]',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer service',
      gradient: 'from-[#007A76] to-[#8EDC81]',
    },
    {
      icon: DollarSign,
      title: 'Best Price Guarantee',
      description: 'Competitive rates, no hidden fees',
      gradient: 'from-[#1e5f7a] to-[#8EDC81]',
    },
    {
      icon: Award,
      title: 'Premium Fleet',
      description: 'Luxury and high-performance vehicles',
      gradient: 'from-[#8EDC81] to-[#007A76]',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Happy Customers', icon: Users, color: 'from-[#1e5f7a] to-[#007A76]' },
    { value: '50+', label: 'Luxury Vehicles', icon: Car, color: 'from-[#007A76] to-[#8EDC81]' },
    { value: '15', label: 'Years Experience', icon: TrendingUp, color: 'from-[#1e5f7a] to-[#8EDC81]' },
    { value: '99%', label: 'Satisfaction Rate', icon: Star, color: 'from-[#8EDC81] to-[#007A76]' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#8EDC81]/10 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-[#1e5f7a]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-[#007A76]/10 rounded-full blur-3xl animate-pulse animation-delay-700" />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 md:w-96 md:h-96 bg-[#8EDC81]/10 rounded-full blur-3xl animate-pulse animation-delay-1400" />
        </div>

        {/* Hero Video/Image */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-90"
            poster="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=75&fm=webp"
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12 animate-fade-in-up">
            <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-[#1e5f7a] via-[#007A76] to-[#8fdc81bf] text-white border-0 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold shadow-lg shadow-[#007A76]/30 hover:shadow-xl hover:scale-105 transition-all animate-pulse-glow">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 inline" />
              Premium Car Rental Service
            </Badge>
            
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
                Rent a Car in Lebanon
                <span className="block mt-2 bg-gradient-to-r from-[#8EDC81] via-[#007A76] to-[#1e5f7a] bg-clip-text text-transparent">
                  10,000+ Luxury & Premium Vehicles
                </span>
              </h1>

              {/* Get the App - Store badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6 sm:mb-12">
                <a
                  href="#"
                  onClick={(e) => handleMobileAppStoreClick(e, "playstore")}
                  className="inline-flex transition-all hover:scale-105 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg overflow-hidden"
                  aria-label="Get it on Google Play"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Get it on Google Play"
                    width="135"
                    height="40"
                    className="h-10 sm:h-12 w-auto"
                  />
                </a>
                <a
                  href="#"
                  onClick={(e) => handleMobileAppStoreClick(e, "appstore")}
                  className="inline-flex transition-all hover:scale-105 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg overflow-hidden"
                  aria-label="Download on the App Store"
                >
                  <img
                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                    alt="Download on the App Store"
                    width="120"
                    height="40"
                    className="h-10 sm:h-12 w-auto"
                  />
                </a>
              </div>

            <p className="text-base sm:text-xl md:text-2xl text-gray-100 mb-6 sm:mb-12 max-w-2xl mx-auto font-medium drop-shadow-lg px-4">
              All you need in one place — the only platform with full search and filters
            </p>

            {/* Enhanced Search Card - Mobile Optimized */}
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl shadow-black/20 p-4 sm:p-6 md:p-8 rounded-2xl animate-scale-in">
              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 sm:mb-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#007A76] pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Location"
                      value={searchData.location}
                      onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                      className="pl-10 sm:pl-12 h-12 sm:h-14 border-2 border-gray-300 dark:border-gray-600 focus:border-[#007A76] focus:ring-2 focus:ring-[#007A76]/20 rounded-xl text-sm sm:text-base transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#007A76] pointer-events-none" />
                    <Input
                      type="date"
                      value={searchData.pickupDate}
                      onChange={(e) => setSearchData({ ...searchData, pickupDate: e.target.value })}
                      className="pl-10 sm:pl-12 h-12 sm:h-14 border-2 border-gray-300 dark:border-gray-600 focus:border-[#007A76] focus:ring-2 focus:ring-[#007A76]/20 rounded-xl text-sm sm:text-base transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#007A76] pointer-events-none" />
                    <Input
                      type="date"
                      value={searchData.returnDate}
                      onChange={(e) => setSearchData({ ...searchData, returnDate: e.target.value })}
                      className="pl-10 sm:pl-12 h-12 sm:h-14 border-2 border-gray-300 dark:border-gray-600 focus:border-[#007A76] focus:ring-2 focus:ring-[#007A76]/20 rounded-xl text-sm sm:text-base transition-all"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 sm:h-16 bg-gradient-to-r from-[#1e5f7a] via-[#007A76] to-[#8EDC81] hover:from-[#184a5e] hover:via-[#008c88] hover:to-[#7bc876] text-white font-bold text-base sm:text-lg rounded-xl shadow-lg shadow-[#007A76]/30 hover:shadow-xl hover:shadow-[#007A76]/40 transition-all duration-300 hover:scale-[1.02] group"
                >
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:rotate-90 transition-transform duration-300" />
                  Search Available Cars
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      
      {/* Cars Section - Mobile Optimized */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-[#8EDC81]/10 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-16 sm:py-20">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#007A76] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">Loading premium vehicles...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 sm:py-20 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
              </div>
              <p className="text-lg sm:text-xl text-red-500 font-semibold mb-2">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          ) : cars.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12">
                {cars.slice(0, 4).map((car, index) => (
                  <div 
                    key={car.id} 
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CarCard car={car} />
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link to="/luxury-car-rental-lebanon">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#1e5f7a] via-[#007A76] to-[#8EDC81] hover:from-[#184a5e] hover:via-[#008c88] hover:to-[#7bc876] text-white font-bold px-8 sm:px-10 py-6 sm:py-7 rounded-xl shadow-lg shadow-[#007A76]/30 hover:shadow-xl hover:shadow-[#007A76]/40 transition-all duration-300 hover:scale-105 text-base sm:text-lg group"
                  >
                    View All Vehicles
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 sm:py-20 px-4">
              <Car className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400">No cars available at the moment.</p>
            </div>
          )}
        </div>
      </section>
      {/* Stats Section - Mobile Optimized */}
      <section className="py-12 sm:py-20 bg-white dark:bg-gray-900 relative overflow-hidden border-y border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e5f7a] via-[#007A76] to-[#8EDC81]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-default animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-[#007A76]/20`}>
                  <stat.icon className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                </div>
                <p className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-[#1e5f7a] via-[#007A76] to-[#8EDC81] bg-clip-text text-transparent mb-1 sm:mb-2 group-hover:scale-105 transition-transform">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Features Section - Mobile Optimized */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-[#1e5f7a] via-[#007A76] to-[#8EDC81] text-white border-0 px-4 sm:px-5 py-1.5 sm:py-2 font-bold shadow-lg shadow-[#007A76]/20 text-xs sm:text-sm">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
              Why Choose Us
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
              All Cars, All Options
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4">
              Connecting you with the perfect car for every journey
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="text-center border-2 border-gray-200 dark:border-gray-700 hover:border-[#007A76] dark:hover:border-[#8EDC81] transition-all duration-500 hover:shadow-2xl hover:shadow-[#007A76]/20 hover:-translate-y-2 bg-white dark:bg-gray-800 group/card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="pt-8 sm:pt-10 pb-8 sm:pb-10 px-4">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg shadow-[#007A76]/20 group-hover/card:scale-110 group-hover/card:rotate-3 transition-all duration-300`}>
                    <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white group-hover/card:text-[#007A76] dark:group-hover/card:text-[#8EDC81] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
