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
} from 'lucide-react';

// Enhanced CarCard for HomePage with Teal Brand Colors
const CarCard = ({ car }) => (
  <Card className="group relative overflow-hidden h-full bg-white dark:bg-gray-900 border-2 border-transparent hover:border-teal-500/90 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-900 hover:-translate-y-2">
    {/* Animated Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <CardContent className="p-0 relative">
      {/* Image Section */}
      <div className="relative overflow-hidden aspect-[16/10] bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20">
        {car.main_image_url ? (
          <img
            src={car.main_image_url}
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md text-gray-900 dark:text-white border-0 shadow-lg">
            {car.car_category}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 relative z-10">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {car.make} {car.model}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Year {car.year}</p>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 text-teal-500" />
            <span>{car.seats} Seats</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Car className="w-4 h-4 text-cyan-500" />
            <span>{car.doors} Doors</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Zap className="w-4 h-4 text-teal-600" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span>{car.fuel_type}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Daily Rate</span>
            <span className="text-lg font-bold text-teal-600 dark:text-teal-400">${car.daily_rate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Holiday Rate</span>
            <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">${car.holiday_rate}</span>
          </div>
        </div>

        {/* Deposit Info */}
        {car.is_deposit && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
              Deposit Required: ${car.deposit}
            </p>
          </div>
        )}

        {/* Feedback */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-4">
          <p className="font-semibold text-sm mb-2 text-gray-900 dark:text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            Reviews ({car.feedbacks?.length || 0})
          </p>
          <div className="max-h-20 overflow-y-auto">
            {car.feedbacks && car.feedbacks.length > 0 ? (
              <ul className="space-y-1">
                {/* {car.feedbacks.map((fb, index) => (
                  <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-teal-500">•</span>
                    <span>{fb.comments || 'No comment'}</span>
                  </li>
                ))} */}
              </ul>
            ) : (
              <p className="text-xs text-gray-500 italic">No reviews yet</p>
            )}
          </div>
        </div>

        {/* Button */}
        <Link to={`/cars/${car.id}`}>
          <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            View Details
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
);

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
      description: 'Comprehensive coverage included with every rental for your peace of mind',
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer service to assist you whenever you need',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: DollarSign,
      title: 'Best Price Guarantee',
      description: 'Competitive rates with no hidden fees or surprises',
      gradient: 'from-teal-600 to-teal-400',
    },
    {
      icon: Award,
      title: 'Premium Fleet',
      description: 'Exclusive selection of luxury and high-performance vehicles',
      gradient: 'from-cyan-600 to-blue-500',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Happy Customers', icon: Users },
    { value: '50+', label: 'Luxury Vehicles', icon: Car },
    { value: '15', label: 'Years Experience', icon: TrendingUp },
    { value: '99%', label: 'Satisfaction Rate', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-teal-950">
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Hero Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-0 overflow-hidden">
  <video
    autoPlay
    loop
    muted
    playsInline
    className="w-full h-full object-cover"
  >
    <source src="/hero.mp4" type="video/mp4" />
    {/* Fallback for browsers that don't support video */}
    Your browser does not support the video tag.
  </video>
  <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 via-teal-900/20 to-cyan-900/20" />
</div>

          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 via-teal-900/20 to-cyan-900/20" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <Badge className="mb-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 px-6 py-2 text-sm font-bold shadow-lg">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Premium Car Rental Service
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
              Discover Lebanon’s 10,000+ premium cars
              <span className="block mt-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                On Every Journey
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              All you need in one place — the only platform with full search and filters.
            </p>

            {/* Enhanced Search Form */}
            <Card className="bg-transparent backdrop-blur-xl border-0 shadow-2xl p-1">
              <form onSubmit={handleSearch}>
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500 group-focus-within:text-teal-600 transition-colors" />
                    <Input
                      type="text"
                      placeholder="Location"
                      value={searchData.location}
                      onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                      className="pl-12 h-14 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl text-base"
                    />
                  </div>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500 group-focus-within:text-teal-600 transition-colors" />
                    <Input
                      type="date"
                      placeholder="Pickup Date"
                      value={searchData.pickupDate}
                      onChange={(e) => setSearchData({ ...searchData, pickupDate: e.target.value })}
                      className="pl-12 h-14 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl text-base"
                    />
                  </div>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500 group-focus-within:text-teal-600 transition-colors" />
                    <Input
                      type="date"
                      placeholder="Return Date"
                      value={searchData.returnDate}
                      onChange={(e) => setSearchData({ ...searchData, returnDate: e.target.value })}
                      className="pl-12 h-14 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl text-base"
                    />
                  </div>
                </div> */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-16 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <Search className="w-6 h-6 mr-3" />
                  Search Available Cars
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-white  dark:bg-gray-900" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                  index === 0 ? 'from-teal-500 to-cyan-500' :
                  index === 1 ? 'from-cyan-500 to-blue-500' :
                  index === 2 ? 'from-teal-600 to-teal-400' :
                  'from-amber-500 to-yellow-500'
                } flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cars Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-0 px-4 py-2">
              Premium Cars, Endless Choices
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Search, filter, 10,000+ vehicles across Lebanon.
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From sports cars to SUVs, find the vehicle that suits your style and occasion.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-xl text-red-500 font-semibold">{error}</p>
            </div>
          ) : cars.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {cars.slice(0, 6).map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
              <div className="text-center">
                <Link to="/cars">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    View All Vehicles
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <p className="text-center text-xl text-gray-500">No cars available at the moment.</p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white  dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 px-4 py-2">
              Why Choose Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              All Cars, All Options, All in One Place
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Connecting you with the perfect car for every journey, We bring Lebanon’s finest cars and countless options right to you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-2 border-transparent hover:border-teal-500/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-gray-900">
                <CardContent className="pt-10 pb-10">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};