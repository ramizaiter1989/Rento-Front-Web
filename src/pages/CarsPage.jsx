import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from "../lib/axios";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Slider } from '@/components/ui/slider';
import { CarCard } from '@/components/CarCard';

import { brands, carTypes, transmissionTypes } from '@/data/carsData';
import { Filter, SlidersHorizontal, Search, X, Sparkles, TrendingUp, LayoutGrid } from 'lucide-react';

export const CarsPage = () => {
  const [cars, setCars] = useState([]);
  const [originalCars, setOriginalCars] = useState([]);

  const [filters, setFilters] = useState({
    brand: 'All Brands',
    type: 'All Types',
    transmission: 'All',
    priceRange: [0, 500],
    search: '',
  });

  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch cars from backend
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await api.get("/cars");
        const data = res.data;

        const mappedCars = data.cars.map(car => ({
          id: car.id,
          brand: car.make,
          model: car.model,
          year: car.year,
          type: car.car_category,
          transmission: car.transmission,
          price: Number(car.daily_rate),
          image: car.main_image_url,
          rating: 4.5,
          reviews: car.feedbacks?.length ?? 0,
          popular: car.views_count > 20,
          seats: car.seats,
          fuel_type: car.fuel_type,
          feedbacks: car.feedbacks,
        }));

        setOriginalCars(mappedCars);
        setCars(mappedCars);

      } catch (err) {
        console.error("Cars fetch error:", err);
      }
    };

    fetchCars();
  }, []);

  // Filtering + Sorting
  useEffect(() => {
    let filtered = [...originalCars];

    if (filters.search) {
      filtered = filtered.filter(car =>
        `${car.brand} ${car.model}`.toLowerCase()
          .includes(filters.search.toLowerCase())
      );
    }

    if (filters.brand !== 'All Brands') {
      filtered = filtered.filter(car => car.brand === filters.brand);
    }

    if (filters.type !== 'All Types') {
      filtered = filtered.filter(car => car.type === filters.type);
    }

    if (filters.transmission !== 'All') {
      filtered = filtered.filter(car => car.transmission === filters.transmission);
    }

    filtered = filtered.filter(
      car =>
        car.price >= filters.priceRange[0] &&
        car.price <= filters.priceRange[1]
    );

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    setCars(filtered);
  }, [filters, sortBy, originalCars]);

  const resetFilters = () => {
    setFilters({
      brand: 'All Brands',
      type: 'All Types',
      transmission: 'All',
      priceRange: [0, 500],
      search: ''
    });
    setSortBy('featured');
  };

  const activeFiltersCount = [
    filters.brand !== 'All Brands',
    filters.type !== 'All Types',
    filters.transmission !== 'All',
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500,
    filters.search !== ''
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-teal-950 pt-20">
      
      {/* Enhanced Header */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 px-6 py-2.5 text-sm font-bold shadow-lg inline-flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Browse Our Premium Fleet
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
              Discover Your
              <span className="block mt-2 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Perfect Ride
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Explore our premium collection of <span className="font-bold text-teal-600 dark:text-teal-400">{cars.length}</span> luxury vehicles
            </p>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Premium Selection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Best Prices</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-teal-600 to-teal-400 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Enhanced Filters Sidebar */}
          <aside className="lg:w-96 flex-shrink-0">
            
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="w-full h-14 border-2 hover:border-teal-500 transition-colors rounded-xl font-semibold"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters & Sorting
                {activeFiltersCount > 0 && (
                  <Badge className="ml-auto bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Panel */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <Card className="sticky top-24 border-2 border-gray-200 dark:border-gray-800 shadow-xl">
                <CardHeader className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/50 dark:to-cyan-950/50 border-b-2 border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <SlidersHorizontal className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent font-black">
                        Filters
                      </span>
                    </CardTitle>

                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-teal-600 hover:text-teal-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 font-semibold"
                      >
                        Reset All
                      </Button>
                    )}
                  </div>
                  
                  {activeFiltersCount > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-6 pt-6">

                  {/* Search */}
                  <div>
                    <Label htmlFor="search" className="mb-3 text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Search className="w-4 h-4 text-teal-600" />
                      Search Vehicles
                    </Label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                      <Input
                        id="search"
                        placeholder="Brand or model..."
                        value={filters.search}
                        onChange={e => setFilters({ ...filters, search: e.target.value })}
                        className="pl-12 h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl"
                      />
                      {filters.search && (
                        <button
                          onClick={() => setFilters({ ...filters, search: '' })}
                          className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

                  {/* Brand */}
                  <div>
                    <Label className="mb-3 text-sm font-bold text-gray-900 dark:text-white block">
                      Brand
                    </Label>
                    <Select
                      value={filters.brand}
                      onValueChange={value => setFilters({ ...filters, brand: value })}
                    >
                      <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map(b => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type */}
                  <div>
                    <Label className="mb-3 text-sm font-bold text-gray-900 dark:text-white block">
                      Vehicle Type
                    </Label>
                    <Select
                      value={filters.type}
                      onValueChange={value => setFilters({ ...filters, type: value })}
                    >
                      <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {carTypes.map(t => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Transmission */}
                  <div>
                    <Label className="mb-3 text-sm font-bold text-gray-900 dark:text-white block">
                      Transmission
                    </Label>
                    <Select
                      value={filters.transmission}
                      onValueChange={value => setFilters({ ...filters, transmission: value })}
                    >
                      <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissionTypes.map(t => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

                  {/* Price Range */}
                  <div>
                    <Label className="mb-4 text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
                      <span>Daily Price Range</span>
                      <span className="text-teal-600 dark:text-teal-400 font-black">
                        ${filters.priceRange[0]} - ${filters.priceRange[1]}
                      </span>
                    </Label>

                    <Slider
                      value={filters.priceRange}
                      onValueChange={value => setFilters({ ...filters, priceRange: value })}
                      min={0}
                      max={500}
                      step={10}
                      className="mt-4"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span>$0</span>
                      <span>$500+</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Cars Grid Section */}
          <div className="flex-1">

            {/* Enhanced Sorting Bar */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-8 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Showing Results</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                      <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        {cars.length}
                      </span>
                      <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-2">
                        vehicles found
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <Label htmlFor="sort" className="text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Sort by:
                  </Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort" className="w-full sm:w-[200px] h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Cars Grid */}
            {cars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {cars.map(car => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <Card className="p-16 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 mx-auto mb-6 flex items-center justify-center">
                    <Search className="w-12 h-12 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
                    No vehicles found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                    Try adjusting your filters to see more results
                  </p>
                  <Button
                    onClick={resetFilters}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Reset All Filters
                  </Button>
                </div>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};