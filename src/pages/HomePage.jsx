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

// Luxury Dark palette
// Header: #020617
// Primary (gold): #EAB308
// Accent gray: #4B5563
// Background: #0B1120
// Text: #F9FAFB

// Enhanced CarCard with Luxury Dark styling
const CarCard = ({ car }) => (
  <Card className="group relative overflow-hidden bg-[#020617] border border-slate-800 hover:border-[#EAB308] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl">
    <CardContent className="p-0">
      {/* Image Section */}
      <div className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br from-slate-900 to-slate-800">
        {car.main_image_url ? (
          <img
            src={car.main_image_url}
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-12 h-12 text-slate-500" />
          </div>
        )}

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Category badge */}
        <Badge className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-xs font-medium text-[#F9FAFB] border border-slate-700 px-2 py-1 shadow-md">
          {car.car_category}
        </Badge>

        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-[#EAB308] text-[#020617] px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
          ${car.daily_rate}/day
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-[#F9FAFB] mb-1 truncate group-hover:text-[#EAB308] transition-colors">
          {car.make} {car.model}
        </h3>
        <p className="text-xs text-slate-400 mb-3">{car.year}</p>

        {/* Specs */}
        <div className="grid grid-cols-4 gap-2 mb-3 pb-3 border-b border-slate-800">
          <div className="flex flex-col items-center">
            <Users className="w-3.5 h-3.5 text-[#EAB308] mb-1" />
            <span className="text-xs text-slate-300">{car.seats}</span>
          </div>
          <div className="flex flex-col items-center">
            <Car className="w-3.5 h-3.5 text-slate-300 mb-1" />
            <span className="text-xs text-slate-300">{car.doors}</span>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="w-3.5 h-3.5 text-[#EAB308] mb-1" />
            <span className="text-xs text-slate-300 truncate w-full text-center">
              {car.transmission.slice(0, 4)}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Sparkles className="w-3.5 h-3.5 text-slate-300 mb-1" />
            <span className="text-xs text-slate-300 truncate w-full text-center">
              {car.fuel_type.slice(0, 4)}
            </span>
          </div>
        </div>

        {/* Prices */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-center flex-1">
            <p className="text-xs text-slate-400">Holiday</p>
            <p className="text-sm font-bold text-[#EAB308]">${car.holiday_rate}</p>
          </div>
          {car.is_deposit && (
            <div className="text-center flex-1 border-l border-slate-800">
              <p className="text-xs text-slate-400">Deposit</p>
              <p className="text-sm font-bold text-amber-400">${car.deposit}</p>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="flex items-center justify-between mb-3 px-2 py-1.5 bg-slate-900 rounded-lg">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-[#EAB308] fill-[#EAB308]" />
            <span className="text-xs font-medium text-slate-200">
              {car.feedbacks?.length || 0} reviews
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link to={`/cars/${car.id}`}>
          <Button className="w-full bg-gradient-to-r from-[#EAB308] to-[#FACC15] hover:from-[#FACC15] hover:to-[#EAB308] text-[#020617] font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm">
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
      gradient: 'from-[#EAB308] to-[#FACC15]',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer service to assist you whenever you need',
      gradient: 'from-[#FACC15] to-[#F97316]',
    },
    {
      icon: DollarSign,
      title: 'Best Price Guarantee',
      description: 'Competitive rates with no hidden fees or surprises',
      gradient: 'from-[#EAB308] to-[#F59E0B]',
    },
    {
      icon: Award,
      title: 'Premium Fleet',
      description: 'Exclusive selection of luxury and high-performance vehicles',
      gradient: 'from-[#F59E0B] to-[#EAB308]',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Happy Customers', icon: Users },
    { value: '50+', label: 'Luxury Vehicles', icon: Car },
    { value: '15', label: 'Years Experience', icon: TrendingUp },
    { value: '99%', label: 'Satisfaction Rate', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0B1120] to-[#020617] text-[#F9FAFB]">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Hero video + overlay */}
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
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="absolute inset-0 " />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <Badge className="mb-6 bg-gradient-to-r from-[#EAB308] to-[#F97316] text-[#020617] border-0 px-6 py-2 text-sm font-bold shadow-lg">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Premium Car Rental Service
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#F9FAFB] mb-6 leading-tight">
              Discover Lebanon’s 10,000+ premium cars
              <span className="block mt-2 bg-gradient-to-r from-[#EAB308] via-[#FACC15] to-[#F97316] bg-clip-text text-transparent">
                On Every Journey
              </span>
            </h1>

            <p className="text-xl text-slate-200 mb-12 max-w-2xl mx-auto">
              All you need in one place — the only platform with full search and filters.
            </p>

            {/* Search button */}
            <Card className="bg-black/40 backdrop-blur-xl border border-slate-800 shadow-2xl p-1 rounded-2xl">
              <form onSubmit={handleSearch}>
                {/* Inputs are commented out for now */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-16 bg-gradient-to-r from-[#EAB308] to-[#FACC15] hover:from-[#FACC15] hover:to-[#EAB308] text-[#020617] font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
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
      <section className="py-24 bg-[#020617]/80">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-slate-900 text-[#EAB308] border border-slate-700 px-4 py-2">
              Premium Cars, Endless Choices
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-[#F9FAFB] mb-4">
              Search, filter, 10,000+ vehicles across Lebanon.
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              From sports cars to SUVs, find the vehicle that suits your style and occasion.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-[#EAB308] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-10 h-10 text-red-400" />
              </div>
              <p className="text-xl text-red-400 font-semibold">{error}</p>
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
                    className="bg-gradient-to-r from-[#EAB308] to-[#FACC15] hover:from-[#FACC15] hover:to-[#EAB308] text-[#020617] font-bold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    View All Vehicles
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <p className="text-center text-xl text-slate-400">
              No cars available at the moment.
            </p>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#020617] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                    index === 0
                      ? 'from-[#EAB308] to-[#FACC15]'
                      : index === 1
                      ? 'from-[#FACC15] to-[#F97316]'
                      : index === 2
                      ? 'from-[#EAB308] to-[#F59E0B]'
                      : 'from-[#F59E0B] to-[#EAB308]'
                  } flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <stat.icon className="w-8 h-8 text-[#020617]" />
                </div>
                <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#EAB308] to-[#FACC15] bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-slate-300 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#020617]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-[#EAB308] to-[#F97316] text-[#020617] border-0 px-4 py-2">
              Why Choose Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-[#F9FAFB] mb-4">
              All Cars, All Options, All in One Place
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Connecting you with the perfect car for every journey, we bring Lebanon’s
              finest cars and countless options right to you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center border border-slate-800 hover:border-[#EAB308]/70 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-[#020617] rounded-2xl"
              >
                <CardContent className="pt-10 pb-10">
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-10 h-10 text-[#020617]" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-[#F9FAFB]">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
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
