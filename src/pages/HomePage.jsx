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
 * - Teal: #00A19C
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
            <MessageSquare className="w-5 h-5 text-[#00A19C]" />
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
  };

  return (
    <>
      <Link to={`/cars/${carData.id}`} className="block group">
        <Card className="relative overflow-hidden h-full flex flex-col bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-[#00A19C] transition-all duration-500 hover:shadow-2xl hover:shadow-[#00A19C]/20 hover:-translate-y-2">
          
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e5f7a]/0 via-[#00A19C]/0 to-[#8EDC81]/0 group-hover:from-[#1e5f7a]/5 group-hover:via-[#00A19C]/5 group-hover:to-[#8EDC81]/5 transition-all duration-500 pointer-events-none" />
          
          {/* Image Section */}
          <div className="relative overflow-hidden aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
            )}
            <img
              src={carData.image}
              alt={`${carData.brand} ${carData.model}`}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Enhanced Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

            {/* Favorite Button */}
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`absolute top-3 right-3 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 z-20 shadow-lg ${
                favorite
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 scale-110'
                  : 'bg-white/95 dark:bg-gray-800/95 hover:scale-110'
              } ${favLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Heart
                className={`w-5 h-5 transition-all ${
                  favorite ? 'fill-white text-white scale-110' : 'text-gray-700 dark:text-gray-300'
                }`}
              />
            </button>

            {/* Category Badge */}
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-[#00A19C] dark:text-[#8EDC81] border border-[#00A19C]/30 dark:border-[#8EDC81]/30 text-xs font-semibold px-3 py-1 shadow-lg">
                {carData.category}
              </Badge>
            </div>

            {/* Popular Badge */}
            {carData.popular && (
              <div className="absolute bottom-3 left-3 z-10">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold border-0 px-3 py-1 flex items-center gap-1.5 shadow-lg">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  Popular
                </Badge>
              </div>
            )}

            {/* Price Badge */}
            <div className="absolute top-3 right-16 md:right-3 md:top-16 z-10">
              <Badge className="bg-gradient-to-r from-[#00A19C] to-[#8EDC81] text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                ${carData.price}/day
              </Badge>
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="p-4 flex-grow relative z-10">
            {/* Brand & Model */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-[#00A19C] dark:text-[#8EDC81] uppercase tracking-wide">
                {carData.brand}
              </p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#00A19C] dark:group-hover:text-[#8EDC81] transition-colors">
                {carData.model}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Year {carData.year}
              </p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="flex flex-col items-center p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 group-hover:bg-[#00A19C]/10 dark:group-hover:bg-[#00A19C]/20 transition-colors border border-gray-200 dark:border-gray-700">
                <Users className="w-4 h-4 text-[#00A19C] dark:text-[#8EDC81] mb-1" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {carData.seats}
                </span>
              </div>

              <div className="flex flex-col items-center p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 group-hover:bg-[#00A19C]/10 dark:group-hover:bg-[#00A19C]/20 transition-colors border border-gray-200 dark:border-gray-700">
                <Settings className="w-4 h-4 text-[#00A19C] dark:text-[#8EDC81] mb-1" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate w-full text-center">
                  {carData.transmission.slice(0, 4)}
                </span>
              </div>

              <div className="flex flex-col items-center p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 group-hover:bg-[#00A19C]/10 dark:group-hover:bg-[#00A19C]/20 transition-colors border border-gray-200 dark:border-gray-700">
                <Fuel className="w-4 h-4 text-[#00A19C] dark:text-[#8EDC81] mb-1" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate w-full text-center">
                  {carData.fuelType.slice(0, 4)}
                </span>
              </div>
            </div>

            {/* Pricing Info */}
            {(carData.holidayRate || carData.isDeposit) && (
              <div className="flex items-center gap-2 mb-3 text-xs">
                {carData.holidayRate && (
                  <div className="flex-1 text-center p-2 bg-gradient-to-br from-[#00A19C]/10 to-[#8EDC81]/10 dark:from-[#1e5f7a]/20 dark:to-[#00A19C]/20 rounded-lg border border-[#00A19C]/20">
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-0.5">Holiday</p>
                    <p className="font-bold text-[#1e5f7a] dark:text-[#8EDC81]">${carData.holidayRate}</p>
                  </div>
                )}
                {carData.isDeposit && (
                  <div className="flex-1 text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-0.5">Deposit</p>
                    <p className="font-bold text-amber-600 dark:text-amber-400">${carData.deposit}</p>
                  </div>
                )}
              </div>
            )}

            {/* Feedback Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowFeedbacksModal(true);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-[#00A19C]/10 dark:hover:bg-[#00A19C]/20 transition-all border border-gray-200 dark:border-gray-700 hover:border-[#00A19C] group/feedback"
              aria-label="Open customer feedback"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#00A19C] dark:text-[#8EDC81] group-hover/feedback:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-gray-900 dark:text-white">Reviews</span>
              </div>
              <Badge className="bg-gradient-to-r from-[#00A19C] to-[#8EDC81] text-white text-xs font-bold px-2 py-0.5">
                {carData.feedbacks.length}
              </Badge>
            </button>

            {/* CTA Button */}
            <Button className="w-full mt-3 bg-gradient-to-r from-[#1e5f7a] via-[#00A19C] to-[#8EDC81] hover:from-[#184a5e] hover:via-[#008c88] hover:to-[#7bc876] text-white font-bold py-6 rounded-xl shadow-lg shadow-[#00A19C]/30 hover:shadow-xl hover:shadow-[#00A19C]/40 transition-all duration-300 hover:scale-105 group/btn">
              <span className="flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View Details
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
        const res = await api.get('/cars');
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
    window.location.href = '/cars';
  };

  const features = [
    {
      icon: Shield,
      title: 'Premium Insurance',
      description: 'Comprehensive coverage with every rental',
      gradient: 'from-[#1e5f7a] to-[#00A19C]',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer service',
      gradient: 'from-[#00A19C] to-[#8EDC81]',
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
      gradient: 'from-[#8EDC81] to-[#00A19C]',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Happy Customers', icon: Users, color: 'from-[#1e5f7a] to-[#00A19C]' },
    { value: '50+', label: 'Luxury Vehicles', icon: Car, color: 'from-[#00A19C] to-[#8EDC81]' },
    { value: '15', label: 'Years Experience', icon: TrendingUp, color: 'from-[#1e5f7a] to-[#8EDC81]' },
    { value: '99%', label: 'Satisfaction Rate', icon: Star, color: 'from-[#8EDC81] to-[#00A19C]' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#8EDC81]/10 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-[#1e5f7a]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-[#00A19C]/10 rounded-full blur-3xl animate-pulse animation-delay-700" />
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
            poster="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12 animate-fade-in-up">
            <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-[#1e5f7a] via-[#00A19C] to-[#8fdc81bf] text-white border-0 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold shadow-lg shadow-[#00A19C]/30 hover:shadow-xl hover:scale-105 transition-all animate-pulse-glow">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 inline" />
              Premium Car Rental Service
            </Badge>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
              Discover Lebanon's
              <span className="block mt-2 bg-gradient-to-r from-[#8EDC81] via-[#00A19C] to-[#1e5f7a] bg-clip-text text-transparent">
                10,000+ Premium Cars
              </span>
            </h1>
            
            <p className="text-base sm:text-xl md:text-2xl text-gray-100 mb-6 sm:mb-12 max-w-2xl mx-auto font-medium drop-shadow-lg px-4">
              All you need in one place — the only platform with full search and filters
            </p>

            {/* Enhanced Search Card - Mobile Optimized */}
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl shadow-black/20 p-4 sm:p-6 md:p-8 rounded-2xl animate-scale-in">
              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 sm:mb-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#00A19C] pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Location"
                      value={searchData.location}
                      onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                      className="pl-10 sm:pl-12 h-12 sm:h-14 border-2 border-gray-300 dark:border-gray-600 focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 rounded-xl text-sm sm:text-base transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#00A19C] pointer-events-none" />
                    <Input
                      type="date"
                      value={searchData.pickupDate}
                      onChange={(e) => setSearchData({ ...searchData, pickupDate: e.target.value })}
                      className="pl-10 sm:pl-12 h-12 sm:h-14 border-2 border-gray-300 dark:border-gray-600 focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 rounded-xl text-sm sm:text-base transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#00A19C] pointer-events-none" />
                    <Input
                      type="date"
                      value={searchData.returnDate}
                      onChange={(e) => setSearchData({ ...searchData, returnDate: e.target.value })}
                      className="pl-10 sm:pl-12 h-12 sm:h-14 border-2 border-gray-300 dark:border-gray-600 focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 rounded-xl text-sm sm:text-base transition-all"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 sm:h-16 bg-gradient-to-r from-[#1e5f7a] via-[#00A19C] to-[#8EDC81] hover:from-[#184a5e] hover:via-[#008c88] hover:to-[#7bc876] text-white font-bold text-base sm:text-lg rounded-xl shadow-lg shadow-[#00A19C]/30 hover:shadow-xl hover:shadow-[#00A19C]/40 transition-all duration-300 hover:scale-[1.02] group"
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

      {/* Stats Section - Mobile Optimized */}
      <section className="py-12 sm:py-20 bg-white dark:bg-gray-900 relative overflow-hidden border-y border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e5f7a] via-[#00A19C] to-[#8EDC81]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-default animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-[#00A19C]/20`}>
                  <stat.icon className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                </div>
                <p className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-[#1e5f7a] via-[#00A19C] to-[#8EDC81] bg-clip-text text-transparent mb-1 sm:mb-2 group-hover:scale-105 transition-transform">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cars Section - Mobile Optimized */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-[#8EDC81]/10 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <Badge className="mb-3 sm:mb-4 bg-[#8EDC81]/20 dark:bg-[#8EDC81]/10 text-[#1e5f7a] dark:text-[#8EDC81] border border-[#00A19C]/30 dark:border-[#8EDC81]/30 px-4 sm:px-5 py-1.5 sm:py-2 font-bold text-xs sm:text-sm">
              <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
              Premium Cars, Endless Choices
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
              Search, Filter, 10,000+ Vehicles
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              From sports cars to SUVs, find the vehicle that suits your style
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-16 sm:py-20">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#00A19C] border-t-transparent rounded-full animate-spin mb-4" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-10 sm:mb-12">
                {cars.slice(0, 8).map((car, index) => (
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
                <Link to="/cars">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#1e5f7a] via-[#00A19C] to-[#8EDC81] hover:from-[#184a5e] hover:via-[#008c88] hover:to-[#7bc876] text-white font-bold px-8 sm:px-10 py-6 sm:py-7 rounded-xl shadow-lg shadow-[#00A19C]/30 hover:shadow-xl hover:shadow-[#00A19C]/40 transition-all duration-300 hover:scale-105 text-base sm:text-lg group"
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

      {/* Features Section - Mobile Optimized */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-[#1e5f7a] via-[#00A19C] to-[#8EDC81] text-white border-0 px-4 sm:px-5 py-1.5 sm:py-2 font-bold shadow-lg shadow-[#00A19C]/20 text-xs sm:text-sm">
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
                className="text-center border-2 border-gray-200 dark:border-gray-700 hover:border-[#00A19C] dark:hover:border-[#8EDC81] transition-all duration-500 hover:shadow-2xl hover:shadow-[#00A19C]/20 hover:-translate-y-2 bg-white dark:bg-gray-800 group/card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="pt-8 sm:pt-10 pb-8 sm:pb-10 px-4">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg shadow-[#00A19C]/20 group-hover/card:scale-110 group-hover/card:rotate-3 transition-all duration-300`}>
                    <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white group-hover/card:text-[#00A19C] dark:group-hover/card:text-[#8EDC81] transition-colors">
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
