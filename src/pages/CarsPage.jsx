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
import { Filter, SlidersHorizontal, Search, X, Car as CarIcon, TrendingUp } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      
      {/* Compact Header */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Browse Cars
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Explore <span className="font-semibold text-teal-600 dark:text-teal-400">{originalCars.length}</span> premium vehicles
              </p>
            </div>
            <Badge className="hidden sm:flex bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 px-4 py-2">
              {cars.length} Results
            </Badge>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Compact Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="w-full h-11 border-2 hover:border-teal-500 transition-colors rounded-lg font-semibold"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-auto bg-teal-600 text-white">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Panel */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <Card className="sticky top-24 border border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <SlidersHorizontal className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      Filters
                    </CardTitle>

                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 h-7"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">

                  {/* Search */}
                  <div>
                    <Label htmlFor="search" className="mb-2 text-xs font-semibold flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-teal-600" />
                      Search
                    </Label>
                    <div className="relative">
                      <Input
                        id="search"
                        placeholder="Brand or model..."
                        value={filters.search}
                        onChange={e => setFilters({ ...filters, search: e.target.value })}
                        className="h-9 text-sm pr-8"
                      />
                      {filters.search && (
                        <button
                          onClick={() => setFilters({ ...filters, search: '' })}
                          className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
                        >
                          <X className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 dark:bg-gray-700" />

                  {/* Brand */}
                  <div>
                    <Label className="mb-2 text-xs font-semibold block">Brand</Label>
                    <Select
                      value={filters.brand}
                      onValueChange={value => setFilters({ ...filters, brand: value })}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map(b => (
                          <SelectItem key={b} value={b} className="text-sm">
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type */}
                  <div>
                    <Label className="mb-2 text-xs font-semibold block">Type</Label>
                    <Select
                      value={filters.type}
                      onValueChange={value => setFilters({ ...filters, type: value })}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {carTypes.map(t => (
                          <SelectItem key={t} value={t} className="text-sm">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Transmission */}
                  <div>
                    <Label className="mb-2 text-xs font-semibold block">Transmission</Label>
                    <Select
                      value={filters.transmission}
                      onValueChange={value => setFilters({ ...filters, transmission: value })}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissionTypes.map(t => (
                          <SelectItem key={t} value={t} className="text-sm">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="h-px bg-gray-200 dark:bg-gray-700" />

                  {/* Price Range */}
                  <div>
                    <Label className="mb-3 text-xs font-semibold flex items-center justify-between">
                      <span>Price Range</span>
                      <span className="text-teal-600 dark:text-teal-400 font-bold">
                        ${filters.priceRange[0]} - ${filters.priceRange[1]}
                      </span>
                    </Label>

                    <Slider
                      value={filters.priceRange}
                      onValueChange={value => setFilters({ ...filters, priceRange: value })}
                      min={0}
                      max={500}
                      step={10}
                      className="mt-2"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1.5">
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

            {/* Compact Sorting Bar */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <CarIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Found</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {cars.length} {cars.length === 1 ? 'vehicle' : 'vehicles'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Label htmlFor="sort" className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Sort:
                  </Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort" className="w-full sm:w-[180px] h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured" className="text-sm">Featured</SelectItem>
                      <SelectItem value="price-low" className="text-sm">Price: Low to High</SelectItem>
                      <SelectItem value="price-high" className="text-sm">Price: High to Low</SelectItem>
                      <SelectItem value="rating" className="text-sm">Highest Rated</SelectItem>
                      <SelectItem value="popular" className="text-sm">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Cars Grid */}
            {cars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cars.map(car => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4 flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No vehicles found
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Try adjusting your filters
                  </p>
                  <Button
                    onClick={resetFilters}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold px-6 rounded-lg"
                    size="sm"
                  >
                    Reset Filters
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