import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { CarCard } from '@/components/CarCard';
import { carsData, brands, carTypes, transmissionTypes } from '@/data/carsData';
import { Filter, SlidersHorizontal, Search, X } from 'lucide-react';

export const CarsPage = () => {
  const [cars, setCars] = useState(carsData);
  const [filters, setFilters] = useState({
    brand: 'All Brands',
    type: 'All Types',
    transmission: 'All',
    priceRange: [0, 500],
    search: ''
  });
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = [...carsData];

    // Apply search
    if (filters.search) {
      filtered = filtered.filter(car =>
        `${car.brand} ${car.model}`.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply brand filter
    if (filters.brand !== 'All Brands') {
      filtered = filtered.filter(car => car.brand === filters.brand);
    }

    // Apply type filter
    if (filters.type !== 'All Types') {
      filtered = filtered.filter(car => car.type === filters.type);
    }

    // Apply transmission filter
    if (filters.transmission !== 'All') {
      filtered = filtered.filter(car => car.transmission === filters.transmission);
    }

    // Apply price range filter
    filtered = filtered.filter(
      car => car.price >= filters.priceRange[0] && car.price <= filters.priceRange[1]
    );

    // Apply sorting
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
        // Featured - popular cars first
        filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    setCars(filtered);
  }, [filters, sortBy]);

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
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
              Browse Fleet
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Your Perfect Ride
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore our premium collection of {carsData.length} luxury vehicles
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="w-full"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-accent text-accent-foreground">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Panel */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <SlidersHorizontal className="w-5 h-5 mr-2" />
                      Filters
                    </CardTitle>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-secondary hover:text-secondary"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search */}
                  <div>
                    <Label htmlFor="search" className="mb-2">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="search"
                        type="text"
                        placeholder="Brand or model..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-10"
                      />
                      {filters.search && (
                        <button
                          onClick={() => setFilters({ ...filters, search: '' })}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <Label className="mb-2">Brand</Label>
                    <Select
                      value={filters.brand}
                      onValueChange={(value) => setFilters({ ...filters, brand: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map(brand => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <Label className="mb-2">Vehicle Type</Label>
                    <Select
                      value={filters.type}
                      onValueChange={(value) => setFilters({ ...filters, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {carTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Transmission Filter */}
                  <div>
                    <Label className="mb-2">Transmission</Label>
                    <Select
                      value={filters.transmission}
                      onValueChange={(value) => setFilters({ ...filters, transmission: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissionTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <Label className="mb-4">
                      Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}/day
                    </Label>
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
                      min={0}
                      max={500}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Cars Grid */}
          <div className="flex-1">
            {/* Sort and Results */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{cars.length}</span> vehicles
              </p>

              <div className="flex items-center space-x-2">
                <Label htmlFor="sort" className="text-sm">Sort by:</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort" className="w-[180px]">
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

            {/* Cars Grid */}
            {cars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cars.map(car => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No vehicles found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters to see more results
                  </p>
                  <Button onClick={resetFilters} className="bg-primary hover:bg-primary-light text-primary-foreground">
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