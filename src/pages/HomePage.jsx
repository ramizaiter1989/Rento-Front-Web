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

// Compact CarCard Component
const CarCard = ({ car }) => (
  <Card className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-teal-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <CardContent className="p-0">
      {/* Image Section - Compact */}
      <div className="relative overflow-hidden aspect-[16/9] bg-gray-100 dark:bg-gray-800">
        {car.main_image_url ? (
          <img
            src={car.main_image_url}
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-10 h-10 text-gray-400" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Category badge */}
        <Badge className="absolute top-2 left-2 bg-white/95 dark:bg-gray-900/95 text-xs px-2 py-0.5">
          {car.car_category}
        </Badge>

        {/* Price badge */}
        <div className="absolute top-2 right-2 bg-teal-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold">
          ${car.daily_rate}/day
        </div>
      </div>

      {/* Content Section - Very Compact */}
      <div className="p-3">
        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-teal-600 transition-colors">
          {car.make} {car.model}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{car.year}</p>

        {/* Compact Specs - Single row */}
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          <div className="flex flex-col items-center p-1.5 rounded bg-gray-50 dark:bg-gray-800">
            <Users className="w-3 h-3 text-teal-500 mb-0.5" />
            <span className="text-xs text-gray-600 dark:text-gray-400">{car.seats}</span>
          </div>
          <div className="flex flex-col items-center p-1.5 rounded bg-gray-50 dark:bg-gray-800">
            <Car className="w-3 h-3 text-cyan-500 mb-0.5" />
            <span className="text-xs text-gray-600 dark:text-gray-400">{car.doors}</span>
          </div>
          <div className="flex flex-col items-center p-1.5 rounded bg-gray-50 dark:bg-gray-800">
            <Zap className="w-3 h-3 text-teal-600 mb-0.5" />
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-full text-center">
              {car.transmission.slice(0, 4)}
            </span>
          </div>
          <div className="flex flex-col items-center p-1.5 rounded bg-gray-50 dark:bg-gray-800">
            <Sparkles className="w-3 h-3 text-cyan-600 mb-0.5" />
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-full text-center">
              {car.fuel_type.slice(0, 4)}
            </span>
          </div>
        </div>

        {/* Inline price info */}
        <div className="flex items-center gap-2 mb-2 text-xs">
          <div className="flex-1 text-center p-1.5 bg-cyan-50 dark:bg-cyan-900/20 rounded">
            <p className="text-gray-500 dark:text-gray-400">Holiday</p>
            <p className="font-bold text-cyan-600">${car.holiday_rate}</p>
          </div>
          {car.is_deposit && (
            <div className="flex-1 text-center p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded">
              <p className="text-gray-500 dark:text-gray-400">Deposit</p>
              <p className="font-bold text-amber-600">${car.deposit}</p>
            </div>
          )}
        </div>

        {/* Reviews - Compact */}
        <div className="flex items-center gap-1 mb-2 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-xs text-gray-700 dark:text-gray-300">
            {car.feedbacks?.length || 0} reviews
          </span>
        </div>

        {/* CTA Button - Compact */}
        <Link to={`/cars/${car.id}`}>
          <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-2 rounded-lg text-xs">
            View Details
            <ArrowRight className="w-3 h-3 ml-1" />
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
      description: 'Comprehensive coverage with every rental',
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer service',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: DollarSign,
      title: 'Best Price Guarantee',
      description: 'Competitive rates, no hidden fees',
      gradient: 'from-teal-600 to-teal-400',
    },
    {
      icon: Award,
      title: 'Premium Fleet',
      description: 'Luxury and high-performance vehicles',
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
      {/* Hero Section - Compact */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Hero Video */}
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 via-teal-900/20 to-cyan-900/20" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-24 pb-16">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <Badge className="mb-4 bg-gradient-to-r from-cyan-500 to-cyan-800 text-white px-4 py-1.5 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
              Premium Car Rental Service
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              Discover Lebanon's 10,000+ premium cars
              <span className="block mt-2 bg-gradient-to-r from-cyan-200 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                On Every Journey
              </span>
            </h1>
            
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              All you need in one place — the only platform with full search and filters.
            </p>

            {/* Compact Search Form */}
            <Card className="bg-white/10 backdrop-blur-xl border-0 shadow-xl p-4">
              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                    <Input
                      type="text"
                      placeholder="Location"
                      value={searchData.location}
                      onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                      className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-lg text-white"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                    <Input
                      type="date"
                      value={searchData.pickupDate}
                      onChange={(e) => setSearchData({ ...searchData, pickupDate: e.target.value })}
                      className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-lg text-white"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                    <Input
                      type="date"
                      value={searchData.returnDate}
                      onChange={(e) => setSearchData({ ...searchData, returnDate: e.target.value })}
                      className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-lg text-white"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-bold rounded-lg"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Available Cars
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Cars Section - Compact */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-cyan-500 dark:bg-teal-900/30 text-white dark:text-teal-300 px-3 py-1">
              Premium Cars, Endless Choices
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">
              Search, filter, 10,000+ vehicles across Lebanon
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From sports cars to SUVs, find the vehicle that suits your style
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Car className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-lg text-red-500 font-semibold">{error}</p>
            </div>
          ) : cars.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
                {cars.slice(0, 8).map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
              <div className="text-center">
                <Link to="/cars">
                  <Button className="bg-gradient-to-r from-cyan-600 to-cyan-800 hover:from-cyan-700 hover:to-cyan-900 text-white font-bold px-8 py-3 rounded-lg">
                    View All Vehicles
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <p className="text-center text-lg text-gray-500">No cars available at the moment.</p>
          )}
        </div>
      </section>

      {/* Stats Section - Compact */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  index === 0 ? 'from-teal-500 to-cyan-500' :
                  index === 1 ? 'from-cyan-500 to-blue-500' :
                  index === 2 ? 'from-teal-300 to-teal-400' :
                  'from-amber-500 to-yellow-500'
                } flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Compact */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-gradient-to-r from-cyan-500 to-cyan-800 text-white px-3 py-1">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">
              All Cars, All Options, All in One Place
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Connecting you with the perfect car for every journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border hover:border-teal-500/50 transition-all hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-gray-900">
                <CardContent className="pt-6 pb-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
