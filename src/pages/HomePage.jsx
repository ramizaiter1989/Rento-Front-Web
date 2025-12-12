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


// Enhanced CarCard with Better Proportions and UX
const CarCard = ({ car }) => (
  <Card className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-teal-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <CardContent className="p-0">
      {/* Image Section - Reduced height */}
      <div className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        {car.main_image_url ? (
          <img
            src={car.main_image_url}
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Category badge - smaller and cleaner */}
        <Badge className="absolute top-3 left-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-xs font-medium text-gray-900 dark:text-white border-0 px-2 py-1 shadow-md">
          {car.car_category}
        </Badge>

        {/* Price badge - top right */}
        <div className="absolute top-3 right-3 bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
          ${car.daily_rate}/day
        </div>
      </div>

      {/* Content Section - Compact */}
      <div className="p-4">
        {/* Title - Single line with truncate */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {car.make} {car.model}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{car.year}</p>

        {/* Compact Specs - 4 columns, single row */}
        <div className="grid grid-cols-4 gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center">
            <Users className="w-3.5 h-3.5 text-teal-500 mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400">{car.seats}</span>
          </div>
          <div className="flex flex-col items-center">
            <Car className="w-3.5 h-3.5 text-cyan-500 mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400">{car.doors}</span>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="w-3.5 h-3.5 text-teal-600 mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-full text-center">{car.transmission.slice(0, 4)}</span>
          </div>
          <div className="flex flex-col items-center">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-full text-center">{car.fuel_type.slice(0, 4)}</span>
          </div>
        </div>

        {/* Compact price row */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Holiday</p>
            <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">${car.holiday_rate}</p>
          </div>
          {car.is_deposit && (
            <div className="text-center flex-1 border-l border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Deposit</p>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400">${car.deposit}</p>
            </div>
          )}
        </div>

        {/* Reviews - Compact single line */}
        <div className="flex items-center justify-between mb-3 px-2 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {car.feedbacks?.length || 0} reviews
            </span>
          </div>
        </div>

        {/* CTA Button - Compact */}
        <Link to={`/cars/${car.id}`}>
          <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm">
            View Details
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
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
        {/* <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div> */}

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
  <div className="absolute inset-0 " />
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