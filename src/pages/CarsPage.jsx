import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import api from '@/lib/axios';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Slider } from '@/components/ui/slider';
import { CarCard } from '@/components/CarCard';

import { brands, carTypes, transmissionTypes } from '@/data/carsData';
import { 
  Filter, 
  SlidersHorizontal, 
  Search, 
  X, 
  Car as CarIcon,
  Settings2,
  Calendar,
  Gauge,
  Fuel,
  Palette,
  Users,
  DoorOpen,
  MapPin,
  DollarSign,
  CalendarDays,
  ChevronDown,
  TrendingUp,
  Star
} from 'lucide-react';

// Available features for cars
const carFeatures = [
  'GPS Navigation',
  'Bluetooth',
  'Backup Camera',
  'Sunroof',
  'Leather Seats',
  'Heated Seats',
  'Apple CarPlay',
  'Android Auto',
  'Parking Sensors',
  'Cruise Control',
  'Lane Assist',
  'Collision Warning',
  'Blind Spot Monitor',
  'Keyless Entry',
  'Push Start',
  'Climate Control',
  'USB Charging',
  'Premium Sound',
];

// Fuel types
const fuelTypes = [
  { value: 'all', label: 'All Fuel Types' },
  { value: 'benz', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
];

// Wheel drive options
const wheelDriveOptions = [
  { value: 'all', label: 'All Drive Types' },
  { value: '4x4', label: '4x4 / AWD' },
  { value: '2_front', label: 'Front Wheel Drive' },
  { value: '2_back', label: 'Rear Wheel Drive' },
  { value: 'autoblock', label: 'Autoblock' },
];

// Color options
const colorOptions = [
  'Black', 'White', 'Silver', 'Gray', 'Red', 
  'Blue', 'Green', 'Yellow', 'Orange', 'Brown'
];

// Cylinder options
const cylinderOptions = [
  { value: 'all', label: 'All Cylinders' },
  { value: '4', label: '4 Cylinder' },
  { value: '6', label: '6 Cylinder' },
  { value: '8', label: '8 Cylinder' },
  { value: '10', label: '10 Cylinder' },
  { value: '12', label: '12 Cylinder' },
];

export const CarsPage = () => {
  const [cars, setCars] = useState([]);
  const [originalCars, setOriginalCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Basic filters
  const [filters, setFilters] = useState({
    brand: 'All Brands',
    type: 'All Types',
    transmission: 'All',
    priceRange: [0, 1500],
    search: '',
    startDate: '',
    endDate: ''
  });

  // Advanced filters
  const [advancedFilters, setAdvancedFilters] = useState({
    yearMin: '',
    yearMax: '',
    cylinderNumber: 'all',
    color: 'all',
    mileageMax: '',
    fuelType: 'all',
    wheelsDrive: 'all',
    seatsMin: '',
    doorsMin: '',
    features: [],
    withDriver: false,
    isDelivered: false,
    requiresDeposit: false,
    holidayRateMax: '',
  });

  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Track if user interacted and debounce timer
  const userInteractedRef = useRef(false);
  const searchDebounceTimer = useRef(null);
  const lastSearchPayload = useRef(null);

  // Update filters with user interaction tracking
  const updateFilters = useCallback((patch) => {
    userInteractedRef.current = true;
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateAdvancedFilters = useCallback((patch) => {
    userInteractedRef.current = true;
    setAdvancedFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  // Fetch cars from API
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/cars');
        const data = res.data;

        const mappedCars = (data.cars ?? []).map((car) => {
          const feedbacks = car.feedbacks ?? [];
          const rating =
            feedbacks.length > 0
              ? (
                  feedbacks.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) /
                  feedbacks.length
                ).toFixed(1)
              : null;

          return {
            id: car.id,
            brand: car.make,
            make: car.make,
            model: car.model,
            year: car.year,
            type: car.car_category,
            category: car.car_category,
            transmission: car.transmission,
            price: Number(car.daily_rate),
            holidayRate: Number(car.holiday_rate || car.daily_rate),
            image: car.main_image_url,
            rating,
            reviews: feedbacks.length,
            popular: (car.views_count ?? 0) > 20,
            seats: car.seats,
            doors: car.doors,
            fuel_type: car.fuel_type,
            fuelType: car.fuel_type,
            wheelsDrive: car.wheels_drive,
            cylinderNumber: car.cylinder_number,
            color: car.color,
            mileage: car.mileage,
            features: car.features || [],
            withDriver: car.with_driver,
            isDelivered: car.is_delivered,
            feedbacks: feedbacks
          };
        });

        setOriginalCars(mappedCars);
        setCars(mappedCars);
      } catch (err) {
        console.error('Cars fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Apply all filters + sorting
  useEffect(() => {
    let filtered = [...originalCars];

    // Basic search
    if (filters.search) {
      filtered = filtered.filter((car) =>
        `${car.brand} ${car.model}`.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Basic filters
    if (filters.brand !== 'All Brands') {
      filtered = filtered.filter((car) => car.brand === filters.brand);
    }

    if (filters.type !== 'All Types') {
      filtered = filtered.filter((car) => car.type === filters.type);
    }

    if (filters.transmission !== 'All') {
      filtered = filtered.filter((car) => car.transmission === filters.transmission);
    }

    // Price range
    filtered = filtered.filter(
      (car) => car.price >= filters.priceRange[0] && car.price <= filters.priceRange[1]
    );

    // Advanced filters
    if (advancedFilters.yearMin) {
      filtered = filtered.filter((car) => car.year >= Number(advancedFilters.yearMin));
    }

    if (advancedFilters.yearMax) {
      filtered = filtered.filter((car) => car.year <= Number(advancedFilters.yearMax));
    }

    if (advancedFilters.cylinderNumber !== 'all') {
      filtered = filtered.filter((car) => car.cylinderNumber === advancedFilters.cylinderNumber);
    }

    if (advancedFilters.color !== 'all') {
      filtered = filtered.filter((car) => 
        car.color?.toLowerCase() === advancedFilters.color.toLowerCase()
      );
    }

    if (advancedFilters.mileageMax) {
      filtered = filtered.filter((car) => 
        (car.mileage || 0) <= Number(advancedFilters.mileageMax)
      );
    }

    if (advancedFilters.fuelType !== 'all') {
      filtered = filtered.filter((car) => car.fuelType === advancedFilters.fuelType);
    }

    if (advancedFilters.wheelsDrive !== 'all') {
      filtered = filtered.filter((car) => car.wheelsDrive === advancedFilters.wheelsDrive);
    }

    if (advancedFilters.seatsMin) {
      filtered = filtered.filter((car) => 
        (car.seats || 0) >= Number(advancedFilters.seatsMin)
      );
    }

    if (advancedFilters.doorsMin) {
      filtered = filtered.filter((car) => 
        (car.doors || 0) >= Number(advancedFilters.doorsMin)
      );
    }

    if (advancedFilters.holidayRateMax) {
      filtered = filtered.filter((car) => 
        (car.holidayRate || car.price) <= Number(advancedFilters.holidayRateMax)
      );
    }

    if (advancedFilters.withDriver) {
      filtered = filtered.filter((car) => car.withDriver);
    }

    if (advancedFilters.isDelivered) {
      filtered = filtered.filter((car) => car.isDelivered);
    }

    // Features filter
    if (advancedFilters.features.length > 0) {
      filtered = filtered.filter((car) => {
        const carFeatures = car.features || [];
        return advancedFilters.features.every(feature => 
          carFeatures.includes(feature)
        );
      });
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
        break;
      case 'year-new':
        filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      case 'year-old':
        filtered.sort((a, b) => (a.year || 0) - (b.year || 0));
        break;
      default:
        filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    setCars(filtered);
  }, [filters, advancedFilters, sortBy, originalCars]);

  // Map frontend car types to backend car_category values
  const mapTypeToCategory = (type) => {
    const typeMap = {
      'Sedan': 'normal',
      'SUV': 'normal',
      'Hatchback': 'normal',
      'Coupe': 'sport',
      'Convertible': 'sport',
      'Sports Car': 'sport',
      'Luxury': 'luxury',
      'Luxury Sedan': 'luxury',
      'Van': 'commercial',
      'Minivan': 'commercial',
      'Truck': 'commercial',
      'Pickup': 'commercial',
      'Bus': 'commercial',
      'Commercial': 'commercial',
      'Industrial': 'industrial',
      'Event': 'event',
      'Boat': 'sea',
      'Yacht': 'sea',
      'Jet Ski': 'sea',
    };
    
    return typeMap[type] || 'normal';
  };

  // Build payload for frequent searches API
  const buildFrequentSearchPayload = useCallback(() => {
    const payload = {};

    const brand = (filters.brand || '').trim();
    const type = (filters.type || '').trim();
    const transmission = (filters.transmission || '').trim();
    const search = (filters.search || '').trim();

    if (brand && brand !== 'All Brands') {
      payload.make = brand;
      if (search) {
        payload.model = search;
      }
    } else if (search) {
      const parts = search.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        payload.make = parts[0];
        payload.model = parts.slice(1).join(' ');
      } else if (parts.length === 1) {
        payload.model = search;
      }
    }

    if (type && type !== 'All Types') {
      payload.car_category = mapTypeToCategory(type);
    }

    if (transmission && transmission !== 'All') {
      payload.transmission = transmission.toLowerCase();
    }

    const [minPrice, maxPrice] = filters.priceRange;
    if (minPrice > 0) {
      payload.daily_rate_min = minPrice;
    }
    if (maxPrice < 1500) {
      payload.daily_rate_max = maxPrice;
    }

    if (advancedFilters.yearMin) {
      payload.year_min = Number(advancedFilters.yearMin);
    }

    if (advancedFilters.yearMax) {
      payload.year_max = Number(advancedFilters.yearMax);
    }

    if (advancedFilters.cylinderNumber && advancedFilters.cylinderNumber !== 'all') {
      payload.cylinder_number = advancedFilters.cylinderNumber;
    }

    if (advancedFilters.color && advancedFilters.color !== 'all') {
      payload.color = advancedFilters.color;
    }

    if (advancedFilters.mileageMax) {
      payload.mileage = Number(advancedFilters.mileageMax);
    }

    if (advancedFilters.fuelType && advancedFilters.fuelType !== 'all') {
      payload.fuel_type = advancedFilters.fuelType;
    }

    if (advancedFilters.wheelsDrive && advancedFilters.wheelsDrive !== 'all') {
      payload.wheels_drive = advancedFilters.wheelsDrive;
    }

    if (advancedFilters.seatsMin) {
      payload.seats = Number(advancedFilters.seatsMin);
    }

    if (advancedFilters.doorsMin) {
      payload.doors = Number(advancedFilters.doorsMin);
    }

    if (advancedFilters.features.length > 0) {
      payload.features = advancedFilters.features;
    }

    if (advancedFilters.withDriver) {
      payload.with_driver = 1;
    }

    if (advancedFilters.isDelivered) {
      payload.is_delivered = 1;
    }

    if (advancedFilters.requiresDeposit) {
      payload.is_deposit = 1;
    }

    if (advancedFilters.holidayRateMax) {
      payload.holiday_rate = Number(advancedFilters.holidayRateMax);
    }

    return payload;
  }, [filters, advancedFilters]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    const basicCount = [
      filters.brand !== 'All Brands',
      filters.type !== 'All Types',
      filters.transmission !== 'All',
      filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1500,
      filters.search.trim() !== '',
      filters.startDate !== '',
      filters.endDate !== ''
    ].filter(Boolean).length;

    const advancedCount = [
      advancedFilters.yearMin !== '',
      advancedFilters.yearMax !== '',
      advancedFilters.cylinderNumber !== 'all',
      advancedFilters.color !== 'all',
      advancedFilters.mileageMax !== '',
      advancedFilters.fuelType !== 'all',
      advancedFilters.wheelsDrive !== 'all',
      advancedFilters.seatsMin !== '',
      advancedFilters.doorsMin !== '',
      advancedFilters.features.length > 0,
      advancedFilters.withDriver,
      advancedFilters.isDelivered,
      advancedFilters.requiresDeposit,
      advancedFilters.holidayRateMax !== '',
    ].filter(Boolean).length;

    return basicCount + advancedCount;
  }, [filters, advancedFilters]);

  // Save frequent search with debouncing
  const saveFrequentSearch = useCallback(async (payload) => {
    if (Object.keys(payload).length === 0) {
      return;
    }

    const payloadString = JSON.stringify(payload);
    if (lastSearchPayload.current === payloadString) {
      return;
    }

    let startDateStr, endDateStr;
    
    if (filters.startDate && filters.endDate) {
      const formatDateTimeLocal = (dateTimeLocal) => {
        if (!dateTimeLocal) return '';
        return dateTimeLocal.replace('T', ' ') + ':00';
      };
      
      startDateStr = formatDateTimeLocal(filters.startDate);
      endDateStr = formatDateTimeLocal(filters.endDate);
    } else {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };
      
      startDateStr = formatDateTime(today);
      endDateStr = formatDateTime(nextWeek);
    }

    const searchPayload = {
      ...payload,
      start_datetime: startDateStr,
      end_datetime: endDateStr,
    };

    try {
      await api.get('/cars/search', { params: searchPayload });
      lastSearchPayload.current = payloadString;
      console.log('✅ Search saved to frequent searches');
    } catch (err) {
      if (err.response?.status === 422) {
        console.error('❌ Validation error details:', err.response?.data?.errors);
      }
      console.warn('Could not save frequent search:', err.response?.data?.message || err.message);
    }
  }, [filters]);

  // Debounced frequent-searches storage
  useEffect(() => {
    if (!userInteractedRef.current) {
      return;
    }

    if (activeFiltersCount === 0) {
      return;
    }

    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }

    searchDebounceTimer.current = setTimeout(() => {
      const payload = buildFrequentSearchPayload();
      saveFrequentSearch(payload);
    }, 1500);

    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, [filters, advancedFilters, activeFiltersCount, buildFrequentSearchPayload, saveFrequentSearch]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    userInteractedRef.current = true;
    setFilters({
      brand: 'All Brands',
      type: 'All Types',
      transmission: 'All',
      priceRange: [0, 1500],
      search: '',
      startDate: '',
      endDate: ''
    });
    setAdvancedFilters({
      yearMin: '',
      yearMax: '',
      cylinderNumber: 'all',
      color: 'all',
      mileageMax: '',
      fuelType: 'all',
      wheelsDrive: 'all',
      seatsMin: '',
      doorsMin: '',
      features: [],
      withDriver: false,
      isDelivered: false,
      requiresDeposit: false,
      holidayRateMax: '',
    });
    setSortBy('featured');
  }, []);

  // Toggle feature
  const toggleFeature = useCallback((feature) => {
    setAdvancedFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950/30">
      {/* Modern Hero Header */}
      <section className="relative bg-gradient-to-r from-cyan-700 via-teal-600 to-cyan-800 dark:from-cyan-900 dark:via-teal-800 dark:to-cyan-950 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-4xl">


            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Find Your Perfect Ride
            </h1>
            
            <p className="text-cyan-50 text-lg md:text-xl mb-6 max-w-2xl">
              Explore our premium collection of{' '}
              <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">
                {originalCars.length}
              </span>{' '}
              vehicles from top brands
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-300" />
                <span className="text-white text-sm font-semibold">Top Rated</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-300" />
                <span className="text-white text-sm font-semibold">Best Prices</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-300" />
                <span className="text-white text-sm font-semibold">Delivery Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="w-full h-12 border-2 border-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-all rounded-xl font-semibold text-cyan-700 shadow-sm"
          >
            <Filter className="w-5 h-5 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {activeFiltersCount > 0 && (
              <Badge className="ml-auto bg-cyan-700 text-white h-6 px-2">{activeFiltersCount}</Badge>
            )}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Redesigned */}
          <aside className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 space-y-4">
              {/* Main Filters Card */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
                {/* Header */}
                <CardHeader className="pb-4 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-700 to-teal-600 flex items-center justify-center">
                        <SlidersHorizontal className="w-4 h-4 text-white" />
                      </div>
                      <span>Search Filters</span>
                    </CardTitle>

                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 h-8 px-3 font-semibold"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 pt-5 pb-6">
                  {/* Search Input - Enhanced */}
                  <div>
                    <Label htmlFor="search" className="mb-2.5 text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Search className="w-4 h-4 text-cyan-700" />
                      Quick Search
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="e.g., BMW X5, Mercedes..."
                        value={filters.search}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                        className="h-11 text-sm pl-10 pr-10 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                      {filters.search && (
                        <button
                          onClick={() => updateFilters({ search: '' })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-full transition-colors"
                          aria-label="Clear search"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

                  {/* Rental Dates - Highlighted */}
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-800 rounded-xl p-4 shadow-sm">
                    <Label className="mb-3 text-sm font-bold flex items-center gap-2 text-yellow-900 dark:text-yellow-200">
                      <CalendarDays className="w-4 h-4" />
                      Rental Period
                    </Label>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="startDate" className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                          Pick-up
                        </Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={filters.startDate}
                          onChange={(e) => updateFilters({ startDate: e.target.value })}
                          className="h-10 text-sm bg-white dark:bg-gray-800 border-yellow-200 dark:border-yellow-800"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="endDate" className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                          Return
                        </Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={filters.endDate}
                          onChange={(e) => updateFilters({ endDate: e.target.value })}
                          className="h-10 text-sm bg-white dark:bg-gray-800 border-yellow-200 dark:border-yellow-800"
                          min={filters.startDate || new Date().toISOString().slice(0, 16)}
                        />
                      </div>

                      {filters.startDate && filters.endDate && (
                        <div className="flex items-center gap-2 text-xs text-yellow-900 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/40 p-2.5 rounded-lg font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Duration: {(() => {
                            const start = new Date(filters.startDate);
                            const end = new Date(filters.endDate);
                            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                            return `${days} day${days !== 1 ? 's' : ''}`;
                          })()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

                  {/* Compact Filter Row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Brand */}
                    <div>
                      <Label className="mb-2 text-xs font-semibold block text-gray-700 dark:text-gray-300">Brand</Label>
                      <Select value={filters.brand} onValueChange={(v) => updateFilters({ brand: v })}>
                        <SelectTrigger className="h-10 text-sm border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((b) => (
                            <SelectItem key={b} value={b} className="text-sm">
                              {b}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type */}
                    <div>
                      <Label className="mb-2 text-xs font-semibold block text-gray-700 dark:text-gray-300">Type</Label>
                      <Select value={filters.type} onValueChange={(v) => updateFilters({ type: v })}>
                        <SelectTrigger className="h-10 text-sm border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {carTypes.map((t) => (
                            <SelectItem key={t} value={t} className="text-sm">
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Transmission - Full Width */}
                  <div>
                    <Label className="mb-2 text-xs font-semibold block text-gray-700 dark:text-gray-300">Transmission</Label>
                    <Select value={filters.transmission} onValueChange={(v) => updateFilters({ transmission: v })}>
                      <SelectTrigger className="h-10 text-sm border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissionTypes.map((t) => (
                          <SelectItem key={t} value={t} className="text-sm">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

                  {/* Price Range - Enhanced */}
                  <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-cyan-200 dark:border-cyan-800">
                    <Label className="mb-4 text-sm font-bold flex items-center justify-between text-gray-900 dark:text-white">
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-cyan-700" />
                        Daily Rate
                      </span>
                      <span className="text-cyan-700 dark:text-cyan-300 font-bold text-lg">
                        ${filters.priceRange[0]} - ${filters.priceRange[1]}
                      </span>
                    </Label>

                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => updateFilters({ priceRange: value })}
                      min={0}
                      max={1500}
                      step={10}
                      className="mt-2"
                    />

                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2 font-semibold">
                      <span>$0</span>
                      <span>$1500+</span>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

                  {/* Advanced Search Button */}
                  <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full h-11 border-2 border-cyan-700 text-cyan-700 hover:bg-gradient-to-r hover:from-cyan-700 hover:to-teal-600 hover:text-white transition-all font-semibold shadow-sm"
                      >
                        <Settings2 className="w-4 h-4 mr-2" />
                        Advanced Filters
                        {(activeFiltersCount - [
                          filters.brand !== 'All Brands',
                          filters.type !== 'All Types',
                          filters.transmission !== 'All',
                          filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1500,
                          filters.search.trim() !== '',
                          filters.startDate !== '',
                          filters.endDate !== ''
                        ].filter(Boolean).length) > 0 && (
                          <Badge className="ml-auto bg-cyan-700 text-white h-5 px-2 text-xs">
                            +{activeFiltersCount - [
                              filters.brand !== 'All Brands',
                              filters.type !== 'All Types',
                              filters.transmission !== 'All',
                              filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1500,
                              filters.search.trim() !== '',
                              filters.startDate !== '',
                              filters.endDate !== ''
                            ].filter(Boolean).length}
                          </Badge>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-700 to-teal-600 flex items-center justify-center">
                            <Settings2 className="w-5 h-5 text-white" />
                          </div>
                          Advanced Search Filters
                        </DialogTitle>
                        <DialogDescription className="text-base">
                          Fine-tune your search with detailed criteria to find the perfect vehicle
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 py-6">
                        {/* Year Range */}
                        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <Label className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Calendar className="w-5 h-5 text-cyan-700" />
                            Year Range
                          </Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="yearMin" className="text-xs text-gray-600 dark:text-gray-400 font-semibold">From Year</Label>
                              <Input
                                id="yearMin"
                                type="number"
                                placeholder="2015"
                                value={advancedFilters.yearMin}
                                onChange={(e) => updateAdvancedFilters({ yearMin: e.target.value })}
                                className="h-10 text-sm mt-1.5"
                                min="1900"
                                max={new Date().getFullYear() + 1}
                              />
                            </div>
                            <div>
                              <Label htmlFor="yearMax" className="text-xs text-gray-600 dark:text-gray-400 font-semibold">To Year</Label>
                              <Input
                                id="yearMax"
                                type="number"
                                placeholder="2024"
                                value={advancedFilters.yearMax}
                                onChange={(e) => updateAdvancedFilters({ yearMax: e.target.value })}
                                className="h-10 text-sm mt-1.5"
                                min="1900"
                                max={new Date().getFullYear() + 1}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Engine & Performance */}
                        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <Label className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Gauge className="w-5 h-5 text-cyan-700" />
                            Engine & Performance
                          </Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="cylinder" className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Cylinders</Label>
                              <Select 
                                value={advancedFilters.cylinderNumber} 
                                onValueChange={(v) => updateAdvancedFilters({ cylinderNumber: v })}
                              >
                                <SelectTrigger id="cylinder" className="h-10 text-sm mt-1.5">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {cylinderOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-sm">
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="mileage" className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Max Mileage</Label>
                              <Input
                                id="mileage"
                                type="number"
                                placeholder="100000"
                                value={advancedFilters.mileageMax}
                                onChange={(e) => updateAdvancedFilters({ mileageMax: e.target.value })}
                                className="h-10 text-sm mt-1.5"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Fuel & Drive */}
                        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <Label className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Fuel className="w-5 h-5 text-cyan-700" />
                            Fuel & Drive Type
                          </Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="fuelType" className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Fuel Type</Label>
                              <Select 
                                value={advancedFilters.fuelType} 
                                onValueChange={(v) => updateAdvancedFilters({ fuelType: v })}
                              >
                                <SelectTrigger id="fuelType" className="h-10 text-sm mt-1.5">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {fuelTypes.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-sm">
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="wheelsDrive" className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Drive Type</Label>
                              <Select 
                                value={advancedFilters.wheelsDrive} 
                                onValueChange={(v) => updateAdvancedFilters({ wheelsDrive: v })}
                              >
                                <SelectTrigger id="wheelsDrive" className="h-10 text-sm mt-1.5">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {wheelDriveOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-sm">
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Color */}
                        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <Label className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Palette className="w-5 h-5 text-cyan-700" />
                            Color Preference
                          </Label>
                          <Select 
                            value={advancedFilters.color} 
                            onValueChange={(v) => updateAdvancedFilters({ color: v })}
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all" className="text-sm font-semibold">All Colors</SelectItem>
                              {colorOptions.map((color) => (
                                <SelectItem key={color} value={color} className="text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full border border-gray-300`} style={{ backgroundColor: color.toLowerCase() }} />
                                    {color}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Capacity */}
                        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <Label className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Users className="w-5 h-5 text-cyan-700" />
                            Capacity Requirements
                          </Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="seats" className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Min Seats</Label>
                              <Input
                                id="seats"
                                type="number"
                                placeholder="5"
                                value={advancedFilters.seatsMin}
                                onChange={(e) => updateAdvancedFilters({ seatsMin: e.target.value })}
                                className="h-10 text-sm mt-1.5"
                                min="1"
                                max="50"
                              />
                            </div>
                            <div>
                              <Label htmlFor="doors" className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Min Doors</Label>
                              <Input
                                id="doors"
                                type="number"
                                placeholder="4"
                                value={advancedFilters.doorsMin}
                                onChange={(e) => updateAdvancedFilters({ doorsMin: e.target.value })}
                                className="h-10 text-sm mt-1.5"
                                min="1"
                                max="10"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Holiday Rate */}
                        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <Label className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <DollarSign className="w-5 h-5 text-cyan-700" />
                            Holiday Pricing
                          </Label>
                          <div>
                            <Label htmlFor="holidayRate" className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Max Holiday Rate</Label>
                            <Input
                              id="holidayRate"
                              type="number"
                              placeholder="200"
                              value={advancedFilters.holidayRateMax}
                              onChange={(e) => updateAdvancedFilters({ holidayRateMax: e.target.value })}
                              className="h-10 text-sm mt-1.5"
                              min="0"
                            />
                          </div>
                        </div>

                        {/* Services */}
                        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <Label className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <MapPin className="w-5 h-5 text-cyan-700" />
                            Additional Services
                          </Label>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-colors">
                              <Checkbox 
                                id="withDriver"
                                checked={advancedFilters.withDriver}
                                onCheckedChange={(checked) => updateAdvancedFilters({ withDriver: checked })}
                                className="data-[state=checked]:bg-cyan-700 data-[state=checked]:border-cyan-700"
                              />
                              <Label htmlFor="withDriver" className="text-sm cursor-pointer font-medium flex-1">
                                Available with driver
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-colors">
                              <Checkbox 
                                id="isDelivered"
                                checked={advancedFilters.isDelivered}
                                onCheckedChange={(checked) => updateAdvancedFilters({ isDelivered: checked })}
                                className="data-[state=checked]:bg-cyan-700 data-[state=checked]:border-cyan-700"
                              />
                              <Label htmlFor="isDelivered" className="text-sm cursor-pointer font-medium flex-1">
                                Delivery available
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-colors">
                              <Checkbox 
                                id="requiresDeposit"
                                checked={advancedFilters.requiresDeposit}
                                onCheckedChange={(checked) => updateAdvancedFilters({ requiresDeposit: checked })}
                                className="data-[state=checked]:bg-cyan-700 data-[state=checked]:border-cyan-700"
                              />
                              <Label htmlFor="requiresDeposit" className="text-sm cursor-pointer font-medium flex-1">
                                Requires deposit
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <Label className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <DoorOpen className="w-5 h-5 text-cyan-700" />
                            Features & Amenities
                          </Label>
                          <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                            {carFeatures.map((feature) => (
                              <div key={feature} className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                                <Checkbox 
                                  id={`feature-${feature}`}
                                  checked={advancedFilters.features.includes(feature)}
                                  onCheckedChange={() => toggleFeature(feature)}
                                  className="data-[state=checked]:bg-cyan-700 data-[state=checked]:border-cyan-700"
                                />
                                <Label 
                                  htmlFor={`feature-${feature}`} 
                                  className="text-xs cursor-pointer font-medium"
                                >
                                  {feature}
                                </Label>
                              </div>
                            ))}
                          </div>
                          {advancedFilters.features.length > 0 && (
                            <p className="text-sm text-cyan-700 dark:text-cyan-300 font-semibold bg-cyan-50 dark:bg-cyan-900/30 p-2 rounded-lg text-center">
                              ✓ {advancedFilters.features.length} feature{advancedFilters.features.length !== 1 ? 's' : ''} selected
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between gap-3 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAdvancedFilters({
                              yearMin: '',
                              yearMax: '',
                              cylinderNumber: 'all',
                              color: 'all',
                              mileageMax: '',
                              fuelType: 'all',
                              wheelsDrive: 'all',
                              seatsMin: '',
                              doorsMin: '',
                              features: [],
                              withDriver: false,
                              isDelivered: false,
                              requiresDeposit: false,
                              holidayRateMax: '',
                            });
                          }}
                          className="h-11 px-6 border-2 font-semibold"
                        >
                          Clear Advanced
                        </Button>
                        <Button
                          onClick={() => setShowAdvanced(false)}
                          className="h-11 px-8 bg-gradient-to-r from-cyan-700 to-teal-600 hover:from-cyan-800 hover:to-teal-700 text-white font-semibold shadow-lg"
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Quick Info Card */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-700 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <CarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">Need Help Choosing?</h3>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        Use filters to narrow down your search and find the perfect vehicle for your needs.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Enhanced Sorting & Results Bar */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 mb-6 border-0 shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Results Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-700 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                    <CarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Available Now</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {cars.length} {cars.length === 1 ? 'Vehicle' : 'Vehicles'}
                    </p>
                  </div>
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Label htmlFor="sort" className="text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Sort by:
                  </Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort" className="w-full sm:w-[200px] h-10 text-sm border-gray-300 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured" className="text-sm font-medium">⭐ Featured</SelectItem>
                      <SelectItem value="price-low" className="text-sm font-medium">💰 Price: Low to High</SelectItem>
                      <SelectItem value="price-high" className="text-sm font-medium">💎 Price: High to Low</SelectItem>
                      <SelectItem value="rating" className="text-sm font-medium">⭐ Highest Rated</SelectItem>
                      <SelectItem value="popular" className="text-sm font-medium">🔥 Most Popular</SelectItem>
                      <SelectItem value="year-new" className="text-sm font-medium">🆕 Newest First</SelectItem>
                      <SelectItem value="year-old" className="text-sm font-medium">📅 Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Pills */}
              {activeFiltersCount > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Active Filters ({activeFiltersCount})
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 font-semibold"
                    >
                      Clear All ×
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.startDate && (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 px-3 py-1.5 font-medium">
                        📅 {new Date(filters.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        <button onClick={() => updateFilters({ startDate: '' })} className="ml-2 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.endDate && (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 px-3 py-1.5 font-medium">
                        🏁 {new Date(filters.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        <button onClick={() => updateFilters({ endDate: '' })} className="ml-2 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.brand !== 'All Brands' && (
                      <Badge variant="secondary" className="text-xs bg-cyan-100 dark:bg-cyan-900/30 border border-cyan-300 dark:border-cyan-700 px-3 py-1.5 font-medium">
                        🚗 {filters.brand}
                        <button onClick={() => updateFilters({ brand: 'All Brands' })} className="ml-2 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.type !== 'All Types' && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 px-3 py-1.5 font-medium">
                        🏎️ {filters.type}
                        <button onClick={() => updateFilters({ type: 'All Types' })} className="ml-2 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.transmission !== 'All' && (
                      <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 px-3 py-1.5 font-medium">
                        ⚙️ {filters.transmission}
                        <button onClick={() => updateFilters({ transmission: 'All' })} className="ml-2 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1500) && (
                      <Badge variant="secondary" className="text-xs bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 px-3 py-1.5 font-medium">
                        💵 ${filters.priceRange[0]} - ${filters.priceRange[1]}
                        <button onClick={() => updateFilters({ priceRange: [0, 1500] })} className="ml-2 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {advancedFilters.yearMin && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 px-3 py-1.5 font-medium">
                        📅 Year ≥ {advancedFilters.yearMin}
                        <button onClick={() => updateAdvancedFilters({ yearMin: '' })} className="ml-2 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {advancedFilters.yearMax && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 px-3 py-1.5 font-medium">
                        📅 Year ≤ {advancedFilters.yearMax}
                        <button onClick={() => updateAdvancedFilters({ yearMax: '' })} className="ml-2 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {advancedFilters.features.length > 0 && (
                      <Badge variant="secondary" className="text-xs bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700 px-3 py-1.5 font-medium">
                        ✨ {advancedFilters.features.length} Feature{advancedFilters.features.length !== 1 ? 's' : ''}
                        <button onClick={() => updateAdvancedFilters({ features: [] })} className="ml-2 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cars Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <div className="w-20 h-20 border-4 border-cyan-700 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Vehicles</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Please wait while we fetch the best options...</p>
                </div>
              </div>
            ) : cars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <Card className="p-16 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mx-auto mb-6 flex items-center justify-center shadow-inner">
                    <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    No Vehicles Found
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    We couldn't find any vehicles matching your criteria. Try adjusting your filters or broadening your search.
                  </p>
                  <Button
                    onClick={resetFilters}
                    className="bg-gradient-to-r from-cyan-700 to-teal-600 hover:from-cyan-800 hover:to-teal-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <X className="w-5 h-5 mr-2" />
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
