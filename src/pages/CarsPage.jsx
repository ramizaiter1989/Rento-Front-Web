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
  CalendarDays
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
    
    return typeMap[type] || 'normal'; // Default to 'normal' if not found
  };

  // Build payload for frequent searches API
  const buildFrequentSearchPayload = useCallback(() => {
    const payload = {};

    // Parse brand and search for make/model
    const brand = (filters.brand || '').trim();
    const type = (filters.type || '').trim();
    const transmission = (filters.transmission || '').trim();
    const search = (filters.search || '').trim();

    // Make & Model parsing
    if (brand && brand !== 'All Brands') {
      payload.make = brand;
      if (search) {
        payload.model = search;
      }
    } else if (search) {
      // Try to split search into make and model
      const parts = search.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        payload.make = parts[0];
        payload.model = parts.slice(1).join(' ');
      } else if (parts.length === 1) {
        // Could be just make or just model - store as model
        payload.model = search;
      }
    }

    // Category - map frontend type to backend category
    if (type && type !== 'All Types') {
      payload.car_category = mapTypeToCategory(type);
    }

    // Transmission
    if (transmission && transmission !== 'All') {
      payload.transmission = transmission.toLowerCase(); // Backend expects lowercase
    }

    // Price range - only if changed from default
    const [minPrice, maxPrice] = filters.priceRange;
    if (minPrice > 0) {
      payload.daily_rate_min = minPrice;
    }
    if (maxPrice < 1500) {
      payload.daily_rate_max = maxPrice;
    }

    // Advanced filters
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
      payload.with_driver = 1; // Backend expects 1/0 for boolean
    }

    if (advancedFilters.isDelivered) {
      payload.is_delivered = 1; // Backend expects 1/0 for boolean
    }

    if (advancedFilters.requiresDeposit) {
      payload.is_deposit = 1; // Backend expects 1/0 for boolean
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
    // Don't save if no meaningful filters
    if (Object.keys(payload).length === 0) {
      return;
    }

    // Don't save if same as last search
    const payloadString = JSON.stringify(payload);
    if (lastSearchPayload.current === payloadString) {
      return;
    }

    // Important: Backend requires start_datetime and end_datetime for search endpoint
    // Use user-selected dates if available, otherwise use default 7-day window
    let startDateStr, endDateStr;
    
    if (filters.startDate && filters.endDate) {
      // User has selected dates
      // datetime-local format: "2024-12-15T10:30"
      // Backend needs: "2024-12-15 10:30:00"
      const formatDateTimeLocal = (dateTimeLocal) => {
        if (!dateTimeLocal) return '';
        // Replace T with space and add :00 for seconds
        return dateTimeLocal.replace('T', ' ') + ':00';
      };
      
      startDateStr = formatDateTimeLocal(filters.startDate);
      endDateStr = formatDateTimeLocal(filters.endDate);
    } else {
      // No dates selected - use default 7-day window with CURRENT system date
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

    // Debug: Log the dates being sent
    console.log('🔍 Sending dates:', { 
      start: startDateStr, 
      end: endDateStr,
      source: (filters.startDate && filters.endDate) ? 'user-selected' : 'default-7-days'
    });

    // Add required datetime fields for the /cars/search endpoint
    const searchPayload = {
      ...payload,
      start_datetime: startDateStr,
      end_datetime: endDateStr,
    };

    try {
      // Use the /cars/search endpoint which handles both search AND frequent search storage
      await api.get('/cars/search', { params: searchPayload });
      lastSearchPayload.current = payloadString;
      console.log('✅ Search saved to frequent searches');
    } catch (err) {
      // Silently fail - don't disrupt user experience
      if (err.response?.status === 422) {
        console.error('❌ Validation error details:', err.response?.data?.errors);
      }
      console.warn('Could not save frequent search:', err.response?.data?.message || err.message);
    }
  }, []);

  // Debounced frequent-searches storage
  useEffect(() => {
    // Don't save on initial load
    if (!userInteractedRef.current) {
      return;
    }

    // Don't save if no filters applied
    if (activeFiltersCount === 0) {
      return;
    }

    // Clear existing timer
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }

    // Set new timer
    searchDebounceTimer.current = setTimeout(() => {
      const payload = buildFrequentSearchPayload();
      saveFrequentSearch(payload);
    }, 1500); // 1.5 second debounce

    // Cleanup
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      {/* Header */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Browse Cars
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Explore{' '}
                <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                  {originalCars.length}
                </span>{' '}
                premium vehicles
              </p>
            </div>
            <Badge className="hidden sm:flex bg-gradient-to-r from-cyan-700 to-teal-600 text-white border-0 px-4 py-2">
              {cars.length} Results
            </Badge>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            {/* Mobile Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="w-full h-11 border-2 hover:border-cyan-700 transition-colors rounded-lg font-semibold"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-auto bg-cyan-700 text-white">{activeFiltersCount}</Badge>
                )}
              </Button>
            </div>

            {/* Panel */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-4`}>
              {/* Basic Filters Card */}
              <Card className="sticky top-24 border border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <SlidersHorizontal className="w-5 h-5 text-cyan-700 dark:text-cyan-300" />
                      Filters
                    </CardTitle>

                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-xs text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 h-7"
                      >
                        Reset All
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  {/* Search */}
                  <div>
                    <Label
                      htmlFor="search"
                      className="mb-2 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5 text-cyan-700" />
                      Search
                    </Label>
                    <div className="relative">
                      <Input
                        id="search"
                        placeholder="Brand or model..."
                        value={filters.search}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                        className="h-9 text-sm pr-8"
                      />
                      {filters.search && (
                        <button
                          onClick={() => updateFilters({ search: '' })}
                          className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
                          aria-label="Clear search"
                        >
                          <X className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 dark:bg-gray-700" />

                  {/* Rental Dates - REQUIRED */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <Label className="mb-2 text-xs font-semibold flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-yellow-700 dark:text-yellow-300" />
                      Rental Period (Required)
                    </Label>
                    
                    <div className="space-y-3 mt-3">
                      {/* Start Date */}
                      <div>
                        <Label htmlFor="startDate" className="text-xs text-gray-700 dark:text-gray-300 mb-1.5 block">
                          Pick-up Date & Time
                        </Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={filters.startDate}
                          onChange={(e) => updateFilters({ startDate: e.target.value })}
                          className="h-9 text-sm dark:bg-gray-900"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>

                      {/* End Date */}
                      <div>
                        <Label htmlFor="endDate" className="text-xs text-gray-700 dark:text-gray-300 mb-1.5 block">
                          Return Date & Time
                        </Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={filters.endDate}
                          onChange={(e) => updateFilters({ endDate: e.target.value })}
                          className="h-9 text-sm dark:bg-gray-900"
                          min={filters.startDate || new Date().toISOString().slice(0, 16)}
                        />
                      </div>

                      {filters.startDate && filters.endDate && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded">
                          <strong>Duration:</strong> {(() => {
                            const start = new Date(filters.startDate);
                            const end = new Date(filters.endDate);
                            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                            return `${days} day${days !== 1 ? 's' : ''}`;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 dark:bg-gray-700" />

                  {/* Brand */}
                  <div>
                    <Label className="mb-2 text-xs font-semibold block">Brand</Label>
                    <Select value={filters.brand} onValueChange={(v) => updateFilters({ brand: v })}>
                      <SelectTrigger className="h-9 text-sm">
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
                    <Label className="mb-2 text-xs font-semibold block">Type</Label>
                    <Select value={filters.type} onValueChange={(v) => updateFilters({ type: v })}>
                      <SelectTrigger className="h-9 text-sm">
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

                  {/* Transmission */}
                  <div>
                    <Label className="mb-2 text-xs font-semibold block">Transmission</Label>
                    <Select
                      value={filters.transmission}
                      onValueChange={(v) => updateFilters({ transmission: v })}
                    >
                      <SelectTrigger className="h-9 text-sm">
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

                  <div className="h-px bg-gray-200 dark:bg-gray-700" />

                  {/* Price Range */}
                  <div>
                    <Label className="mb-3 text-xs font-semibold flex items-center justify-between">
                      <span>Daily Rate</span>
                      <span className="text-cyan-700 dark:text-cyan-300 font-bold">
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

                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      <span>$0</span>
                      <span>$1500+</span>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 dark:bg-gray-700" />

                  {/* Advanced Search Dialog */}
                  <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full border-cyan-700 text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/30"
                      >
                        <Settings2 className="w-4 h-4 mr-2" />
                        Advanced Search
                        {(activeFiltersCount - [
                          filters.brand !== 'All Brands',
                          filters.type !== 'All Types',
                          filters.transmission !== 'All',
                          filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1500,
                          filters.search.trim() !== ''
                        ].filter(Boolean).length) > 0 && (
                          <Badge className="ml-auto bg-cyan-700 text-white">
                            {activeFiltersCount - [
                              filters.brand !== 'All Brands',
                              filters.type !== 'All Types',
                              filters.transmission !== 'All',
                              filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1500,
                              filters.search.trim() !== ''
                            ].filter(Boolean).length}
                          </Badge>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Settings2 className="w-5 h-5 text-cyan-700" />
                          Advanced Search Filters
                        </DialogTitle>
                        <DialogDescription>
                          Fine-tune your search with detailed criteria
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 py-4">
                        {/* Year Range */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-cyan-700" />
                            Year Range
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="yearMin" className="text-xs text-gray-600">From</Label>
                              <Input
                                id="yearMin"
                                type="number"
                                placeholder="2015"
                                value={advancedFilters.yearMin}
                                onChange={(e) => updateAdvancedFilters({ yearMin: e.target.value })}
                                className="h-9 text-sm"
                                min="1900"
                                max={new Date().getFullYear() + 1}
                              />
                            </div>
                            <div>
                              <Label htmlFor="yearMax" className="text-xs text-gray-600">To</Label>
                              <Input
                                id="yearMax"
                                type="number"
                                placeholder="2024"
                                value={advancedFilters.yearMax}
                                onChange={(e) => updateAdvancedFilters({ yearMax: e.target.value })}
                                className="h-9 text-sm"
                                min="1900"
                                max={new Date().getFullYear() + 1}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Engine & Performance */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-cyan-700" />
                            Engine & Performance
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="cylinder" className="text-xs text-gray-600">Cylinders</Label>
                              <Select 
                                value={advancedFilters.cylinderNumber} 
                                onValueChange={(v) => updateAdvancedFilters({ cylinderNumber: v })}
                              >
                                <SelectTrigger id="cylinder" className="h-9 text-sm">
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
                              <Label htmlFor="mileage" className="text-xs text-gray-600">Max Mileage</Label>
                              <Input
                                id="mileage"
                                type="number"
                                placeholder="100000"
                                value={advancedFilters.mileageMax}
                                onChange={(e) => updateAdvancedFilters({ mileageMax: e.target.value })}
                                className="h-9 text-sm"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Fuel & Drive */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Fuel className="w-4 h-4 text-cyan-700" />
                            Fuel & Drive Type
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="fuelType" className="text-xs text-gray-600">Fuel Type</Label>
                              <Select 
                                value={advancedFilters.fuelType} 
                                onValueChange={(v) => updateAdvancedFilters({ fuelType: v })}
                              >
                                <SelectTrigger id="fuelType" className="h-9 text-sm">
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
                              <Label htmlFor="wheelsDrive" className="text-xs text-gray-600">Drive Type</Label>
                              <Select 
                                value={advancedFilters.wheelsDrive} 
                                onValueChange={(v) => updateAdvancedFilters({ wheelsDrive: v })}
                              >
                                <SelectTrigger id="wheelsDrive" className="h-9 text-sm">
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
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Palette className="w-4 h-4 text-cyan-700" />
                            Color
                          </Label>
                          <Select 
                            value={advancedFilters.color} 
                            onValueChange={(v) => updateAdvancedFilters({ color: v })}
                          >
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all" className="text-sm">All Colors</SelectItem>
                              {colorOptions.map((color) => (
                                <SelectItem key={color} value={color} className="text-sm">
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Capacity */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Users className="w-4 h-4 text-cyan-700" />
                            Capacity
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="seats" className="text-xs text-gray-600">Min Seats</Label>
                              <Input
                                id="seats"
                                type="number"
                                placeholder="5"
                                value={advancedFilters.seatsMin}
                                onChange={(e) => updateAdvancedFilters({ seatsMin: e.target.value })}
                                className="h-9 text-sm"
                                min="1"
                                max="50"
                              />
                            </div>
                            <div>
                              <Label htmlFor="doors" className="text-xs text-gray-600">Min Doors</Label>
                              <Input
                                id="doors"
                                type="number"
                                placeholder="4"
                                value={advancedFilters.doorsMin}
                                onChange={(e) => updateAdvancedFilters({ doorsMin: e.target.value })}
                                className="h-9 text-sm"
                                min="1"
                                max="10"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Holiday Rate */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-cyan-700" />
                            Holiday Rate
                          </Label>
                          <div>
                            <Label htmlFor="holidayRate" className="text-xs text-gray-600">Max Holiday Rate</Label>
                            <Input
                              id="holidayRate"
                              type="number"
                              placeholder="200"
                              value={advancedFilters.holidayRateMax}
                              onChange={(e) => updateAdvancedFilters({ holidayRateMax: e.target.value })}
                              className="h-9 text-sm"
                              min="0"
                            />
                          </div>
                        </div>

                        {/* Services */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-cyan-700" />
                            Services
                          </Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="withDriver"
                                checked={advancedFilters.withDriver}
                                onCheckedChange={(checked) => updateAdvancedFilters({ withDriver: checked })}
                              />
                              <Label htmlFor="withDriver" className="text-sm cursor-pointer">
                                Available with driver
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="isDelivered"
                                checked={advancedFilters.isDelivered}
                                onCheckedChange={(checked) => updateAdvancedFilters({ isDelivered: checked })}
                              />
                              <Label htmlFor="isDelivered" className="text-sm cursor-pointer">
                                Delivery available
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="requiresDeposit"
                                checked={advancedFilters.requiresDeposit}
                                onCheckedChange={(checked) => updateAdvancedFilters({ requiresDeposit: checked })}
                              />
                              <Label htmlFor="requiresDeposit" className="text-sm cursor-pointer">
                                Requires deposit
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <DoorOpen className="w-4 h-4 text-cyan-700" />
                            Features
                          </Label>
                          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                            {carFeatures.map((feature) => (
                              <div key={feature} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`feature-${feature}`}
                                  checked={advancedFilters.features.includes(feature)}
                                  onCheckedChange={() => toggleFeature(feature)}
                                />
                                <Label 
                                  htmlFor={`feature-${feature}`} 
                                  className="text-xs cursor-pointer"
                                >
                                  {feature}
                                </Label>
                              </div>
                            ))}
                          </div>
                          {advancedFilters.features.length > 0 && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {advancedFilters.features.length} feature{advancedFilters.features.length !== 1 ? 's' : ''} selected
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t">
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
                        >
                          Clear Advanced
                        </Button>
                        <Button
                          onClick={() => setShowAdvanced(false)}
                          className="bg-gradient-to-r from-cyan-700 to-teal-600 hover:from-cyan-800 hover:to-teal-700 text-white"
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Cars Grid */}
          <div className="flex-1">
            {/* Sorting Bar */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-700 to-teal-600 rounded-lg flex items-center justify-center">
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
                  <Label
                    htmlFor="sort"
                    className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                  >
                    Sort:
                  </Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort" className="w-full sm:w-[180px] h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured" className="text-sm">
                        Featured
                      </SelectItem>
                      <SelectItem value="price-low" className="text-sm">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-high" className="text-sm">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="rating" className="text-sm">
                        Highest Rated
                      </SelectItem>
                      <SelectItem value="popular" className="text-sm">
                        Most Popular
                      </SelectItem>
                      <SelectItem value="year-new" className="text-sm">
                        Newest First
                      </SelectItem>
                      <SelectItem value="year-old" className="text-sm">
                        Oldest First
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Active Filters ({activeFiltersCount})
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.startDate && (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300">
                        Pick-up: {new Date(filters.startDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        <button
                          onClick={() => updateFilters({ startDate: '' })}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.endDate && (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300">
                        Return: {new Date(filters.endDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        <button
                          onClick={() => updateFilters({ endDate: '' })}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.brand !== 'All Brands' && (
                      <Badge variant="secondary" className="text-xs">
                        Brand: {filters.brand}
                        <button
                          onClick={() => updateFilters({ brand: 'All Brands' })}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.type !== 'All Types' && (
                      <Badge variant="secondary" className="text-xs">
                        Type: {filters.type}
                        <button
                          onClick={() => updateFilters({ type: 'All Types' })}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.transmission !== 'All' && (
                      <Badge variant="secondary" className="text-xs">
                        Trans: {filters.transmission}
                        <button
                          onClick={() => updateFilters({ transmission: 'All' })}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {advancedFilters.yearMin && (
                      <Badge variant="secondary" className="text-xs">
                        Year ≥ {advancedFilters.yearMin}
                        <button
                          onClick={() => updateAdvancedFilters({ yearMin: '' })}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {advancedFilters.yearMax && (
                      <Badge variant="secondary" className="text-xs">
                        Year ≤ {advancedFilters.yearMax}
                        <button
                          onClick={() => updateAdvancedFilters({ yearMax: '' })}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {advancedFilters.features.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {advancedFilters.features.length} Feature{advancedFilters.features.length !== 1 ? 's' : ''}
                        <button
                          onClick={() => updateAdvancedFilters({ features: [] })}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-cyan-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading cars...</p>
                </div>
              </div>
            ) : cars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cars.map((car) => (
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
                    Try adjusting your filters or search criteria
                  </p>
                  <Button
                    onClick={resetFilters}
                    className="bg-gradient-to-r from-cyan-700 to-teal-600 hover:from-cyan-800 hover:to-teal-700 text-white font-semibold px-6 rounded-lg"
                    size="sm"
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