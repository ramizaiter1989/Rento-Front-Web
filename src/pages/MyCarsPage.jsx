import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit2,
  Trash2,
  Eye,
  TrendingUp,
  MousePointerClick,
  Calendar,
  DollarSign,
  MapPin,
  Gauge,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { motion } from 'framer-motion';

// Logo colors
const COLORS = {
  darkBlue: '#0E4C81',
  teal: '#008C95',
  limeGreen: '#8AC640',
  darkBlueDim: 'rgba(14, 76, 129, 0.1)',
  tealDim: 'rgba(0, 140, 149, 0.1)',
  limeGreenDim: 'rgba(138, 198, 64, 0.1)',
};

const CAR_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'sport', label: 'Sport' },
  { value: 'normal', label: 'Normal' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'event', label: 'Event' },
  { value: 'sea', label: 'Sea' },
];

const CAR_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'rejected':
    default:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }
};

const getCategoryBadgeClass = (category) => {
  switch (category) {
    case 'luxury':
      return 'text-white';
    case 'sport':
      return 'text-white';
    default:
      return 'text-white';
  }
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'luxury':
      return COLORS.darkBlue;
    case 'sport':
      return COLORS.limeGreen;
    default:
      return COLORS.teal;
  }
};

const CarDetailModal = ({ car, onClose }) => {
  if (!car) return null;
  const safeArray = (arr) => Array.isArray(arr) ? arr : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh]"
      >
        <button
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: COLORS.tealDim }}
          onClick={onClose}
        >
          <X className="w-5 h-5" style={{ color: COLORS.teal }} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
            >
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {car.make} {car.model}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{car.year} • {car.license_plate}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            <div className="bg-gradient-to-br p-3 rounded-xl" style={{ background: COLORS.tealDim }}>
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4" style={{ color: COLORS.teal }} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Views</span>
              </div>
              <p className="text-xl font-bold" style={{ color: COLORS.teal }}>{car.views_count || 0}</p>
            </div>

            <div className="bg-gradient-to-br p-3 rounded-xl" style={{ background: COLORS.darkBlueDim }}>
              <div className="flex items-center gap-2 mb-1">
                <MousePointerClick className="w-4 h-4" style={{ color: COLORS.darkBlue }} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Clicks</span>
              </div>
              <p className="text-xl font-bold" style={{ color: COLORS.darkBlue }}>{car.clicks_count ?? 0}</p>
            </div>

            <div className="bg-gradient-to-br p-3 rounded-xl" style={{ background: COLORS.limeGreenDim }}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4" style={{ color: COLORS.limeGreen }} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Daily Rate</span>
              </div>
              <p className="text-xl font-bold" style={{ color: COLORS.limeGreen }}>${car.daily_rate}</p>
            </div>

            <div className="bg-gradient-to-br p-3 rounded-xl" style={{ background: COLORS.tealDim }}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" style={{ color: COLORS.teal }} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</span>
              </div>
              <Badge className={`text-xs ${getStatusBadgeClass(car.status)}`}>
                {car.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden shadow-lg" style={{ height: '240px' }}>
              {car.main_image_url ? (
                <img
                  src={`/api/storage/${car.main_image_url}`}
                  alt="Main"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: COLORS.tealDim }}>
                  <Car className="w-16 h-16" style={{ color: COLORS.teal, opacity: 0.3 }} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['front', 'back', 'left', 'right'].map((dir) => (
                car[`${dir}_image_url`] ? (
                  <div key={dir} className="relative rounded-lg overflow-hidden shadow" style={{ height: '70px' }}>
                    <img
                      src={`/api/storage/${car[`${dir}_image_url`]}`}
                      alt={dir}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div key={dir} className="rounded-lg flex items-center justify-center" style={{ height: '70px', background: COLORS.tealDim }}>
                    <Car className="w-6 h-6" style={{ color: COLORS.teal, opacity: 0.3 }} />
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            <DetailRow icon={Car} label="Category" value={car.car_category} />
            <DetailRow icon={DollarSign} label="Holiday Rate" value={`$${car.holiday_rate}/day`} />
            <DetailRow icon={Gauge} label="Mileage" value={`${car.mileage?.toLocaleString()} km`} />
            <DetailRow label="Color" value={car.color} />
            <DetailRow label="Fuel Type" value={car.fuel_type} />
            <DetailRow label="Transmission" value={car.transmission} />
            <DetailRow label="Wheel Drive" value={car.wheels_drive} />
            <DetailRow label="Seats" value={car.seats} />
            <DetailRow label="Doors" value={car.doors} />
            <DetailRow label="Max Driving Mileage" value={`${car.max_driving_mileage} km`} />
            <DetailRow label="Min Rental Days" value={car.min_rental_days} />
            <DetailRow label="Add-Ons" value={safeArray(car.car_add_on).join(', ') || 'N/A'} />
            <DetailRow label="Features" value={safeArray(car.features).join(', ') || 'N/A'} />
            <DetailRow label="Reason for Rent" value={safeArray(car.reason_of_rent).join(', ') || 'N/A'} />
            {car.notes && <DetailRow label="Notes" value={car.notes} />}
            <DetailRow icon={MapPin} label="Delivery Location" value={car.delivery_location?.address || 'N/A'} />
            <DetailRow icon={MapPin} label="Return Location" value={car.return_location?.address || 'N/A'} />
            {car.live_location && <DetailRow icon={MapPin} label="Current Location" value={car.live_location.address} badge />}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value, badge }) => (
  <div className="flex items-start gap-2 py-2 border-b border-gray-100 dark:border-gray-800">
    {Icon && <Icon className="w-4 h-4 mt-0.5" style={{ color: COLORS.teal }} />}
    <div className="flex-1">
      <span className="font-semibold text-gray-700 dark:text-gray-300">{label}:</span>
      {badge ? (
        <Badge className="ml-2 text-xs" style={{ background: COLORS.teal, color: 'white' }}>{value}</Badge>
      ) : (
        <span className="ml-2 text-gray-600 dark:text-gray-400">{value}</span>
      )}
    </div>
  </div>
);

export const MyCarsPage = () => {
  const navigate = useNavigate();
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: 'all', status: 'all' });
  const [pagination, setPagination] = useState({ currentPage: 1, perPage: 10 });
  const [selectedCar, setSelectedCar] = useState(null);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  const fetchCars = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/cars/agent/Mycars');
      setAllCars(data.cars.data || []);
    } catch {
      toast.error('Failed to fetch cars.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCars(); }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => setFilters({ search: '', category: 'all', status: 'all' });

  const handleDelete = (id) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this car?',
      buttons: [
        { 
          label: 'Yes, Delete', 
          onClick: async () => {
            try {
              await api.delete(`/cars/${id}`);
              toast.success('Car deleted successfully.');
              setAllCars((prev) => prev.filter((car) => car.id !== id));
            } catch (err) {
              toast.error(err.response?.data?.error || 'Failed to delete car.');
            }
          } 
        },
        { label: 'Cancel' }
      ],
    });
  };

  const openEditModal = (car) => {
    setSelectedCar(car);
    setEditForm({
      delivery_location: car.delivery_location?.address || '',
      return_location: car.return_location?.address || '',
      mileage: car.mileage || 0,
      daily_rate: car.daily_rate || 0,
      holiday_rate: car.holiday_rate || 0,
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (key, value) => {
    setEditForm(prev => ({ ...prev, [key]: value }));
  };

  const submitEdit = async () => {
    try {
      const { data } = await api.put(`/cars/${selectedCar.id}`, {
        mileage: editForm.mileage,
        daily_rate: editForm.daily_rate,
        holiday_rate: editForm.holiday_rate,
      });
      toast.success('Car updated successfully');
      setAllCars(prev => prev.map(c => c.id === selectedCar.id ? { ...c, ...data.car } : c));
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update car');
    }
  };

  const filteredCars = useMemo(() => {
    return allCars.filter((car) => {
      const categoryMatch = filters.category === 'all' || car.car_category === filters.category;
      const statusMatch = filters.status === 'all' || car.status === filters.status;
      const searchMatch = [car.make, car.model, car.license_plate].some(field =>
        field?.toLowerCase().includes(filters.search.toLowerCase())
      );
      return categoryMatch && statusMatch && searchMatch;
    });
  }, [allCars, filters]);

  const totalPages = Math.ceil(filteredCars.length / pagination.perPage);
  const paginatedCars = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.perPage;
    return filteredCars.slice(start, start + pagination.perPage);
  }, [filteredCars, pagination]);

  const goToPage = (page) => setPagination(prev => ({ ...prev, currentPage: Math.max(1, Math.min(page, totalPages)) }));

  // Calculate total stats (views = impressions in list; clicks = detail page opens)
  const totalViews = allCars.reduce((sum, car) => sum + (car.views_count || 0), 0);
  const totalClicks = allCars.reduce((sum, car) => sum + (car.clicks_count || 0), 0);
  const approvedCars = allCars.filter(c => c.status === 'approved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-900 dark:to-gray-950 pt-20">
      <div className="container mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
            >
              <Car className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Cars</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your listed vehicles</p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/add-car')}
            className="h-11 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Car
          </Button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Car}
            label="Total Cars"
            value={allCars.length}
            gradient={`linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})`}
          />
          <StatCard
            icon={Eye}
            label="Total Views"
            value={totalViews}
            gradient={`linear-gradient(135deg, ${COLORS.darkBlue}, ${COLORS.teal})`}
          />
          <StatCard
            icon={MousePointerClick}
            label="Total Clicks"
            value={totalClicks}
            gradient={`linear-gradient(135deg, ${COLORS.teal}, ${COLORS.limeGreen})`}
          />
          <StatCard
            icon={TrendingUp}
            label="Approved"
            value={approvedCars}
            gradient={`linear-gradient(135deg, ${COLORS.limeGreen}, ${COLORS.teal})`}
          />
        </div>

        {/* FILTERS */}
        <Card className="mb-6 border-2 border-transparent shadow-lg rounded-xl">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              {/* SEARCH */}
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search cars..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-9 h-10 border-2 rounded-xl transition-all duration-200"
                    style={{ borderColor: filters.search ? COLORS.teal : undefined }}
                  />
                </div>
              </div>

              {/* CATEGORY */}
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger className="h-10 border-2 rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* STATUS */}
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="h-10 border-2 rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CLEAR FILTER BUTTON */}
              <div className="md:col-span-1 flex justify-end">
                {(filters.search || filters.category !== 'all' || filters.status !== 'all') && (
                  <Button
                    variant="outline"
                    className="h-10 rounded-xl border-2"
                    style={{ borderColor: COLORS.teal, color: COLORS.teal }}
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card className="border-2 border-transparent shadow-lg rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Your Listed Cars ({filteredCars.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent" style={{ borderColor: COLORS.teal, borderTopColor: 'transparent' }}></div>
              </div>
            ) : paginatedCars.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: COLORS.tealDim }}
                >
                  <Car className="w-8 h-8" style={{ color: COLORS.teal }} />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  No cars found.{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto" 
                    style={{ color: COLORS.teal }}
                    onClick={() => navigate('/Add/car')}
                  >
                    Add your first car
                  </Button>
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Vehicle</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">License</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Performance</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedCars.map((car, index) => (
                      <motion.tr
                        key={car.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex gap-3 items-center">
                            <div className="w-14 h-10 rounded-lg overflow-hidden shadow-sm">
                              {car.main_image_url ? (
                                <img src={`/api/storage/${car.main_image_url}`} alt={car.make} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center" style={{ background: COLORS.tealDim }}>
                                  <Car className="w-5 h-5" style={{ color: COLORS.teal, opacity: 0.5 }} />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">{car.make}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{car.model} ({car.year})</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">{car.license_plate}</td>
                        <td className="px-4 py-3">
                          <Badge 
                            className="px-2 py-1 text-xs text-white font-semibold"
                            style={{ background: getCategoryColor(car.car_category) }}
                          >
                            {car.car_category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold" style={{ color: COLORS.teal }}>${car.daily_rate}</div>
                          <div className="text-xs text-gray-500">per day</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`px-2 py-1 text-xs ${getStatusBadgeClass(car.status)}`}>
                            {car.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3">
                            <div className="flex items-center gap-1" title="Impressions in list/search">
                              <Eye className="w-4 h-4" style={{ color: COLORS.darkBlue }} />
                              <span className="text-sm font-semibold" style={{ color: COLORS.darkBlue }}>
                                {car.views_count ?? 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1" title="Detail page opens">
                              <MousePointerClick className="w-4 h-4" style={{ color: COLORS.teal }} />
                              <span className="text-sm font-semibold" style={{ color: COLORS.teal }}>
                                {car.clicks_count ?? 0}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:scale-110 transition-transform"
                              style={{ color: COLORS.teal }}
                              onClick={() => setSelectedCar(car)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:scale-110 transition-transform"
                              style={{ color: COLORS.darkBlue }}
                              onClick={() => openEditModal(car)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:scale-110 transition-transform"
                              onClick={() => handleDelete(car.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => goToPage(1)} 
                disabled={pagination.currentPage === 1}
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg"
              >
                <ChevronsLeft className="w-4 h-4"/>
              </Button>
              <Button 
                onClick={() => goToPage(pagination.currentPage - 1)} 
                disabled={pagination.currentPage === 1}
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4"/>
              </Button>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-semibold">
                Page {pagination.currentPage} of {totalPages}
              </div>
              <Button 
                onClick={() => goToPage(pagination.currentPage + 1)} 
                disabled={pagination.currentPage === totalPages}
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg"
              >
                <ChevronRight className="w-4 h-4"/>
              </Button>
              <Button 
                onClick={() => goToPage(totalPages)} 
                disabled={pagination.currentPage === totalPages}
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg"
              >
                <ChevronsRight className="w-4 h-4"/>
              </Button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} - {Math.min(pagination.currentPage * pagination.perPage, filteredCars.length)} of {filteredCars.length}
            </div>
          </div>
        )}

        {/* MODALS */}
        {selectedCar && <CarDetailModal car={selectedCar} onClose={() => setSelectedCar(null)} />}

        {isEditModalOpen && selectedCar && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative"
            >
              <button
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: COLORS.tealDim }}
                onClick={() => setIsEditModalOpen(false)}
              >
                <X className="w-5 h-5" style={{ color: COLORS.teal }} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${COLORS.darkBlue}, ${COLORS.teal})` }}
                >
                  <Edit2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Edit Car
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCar.make} {selectedCar.model}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" style={{ color: COLORS.teal }} />
                    Delivery Location
                  </label>
                  <Input
                    value={editForm.delivery_location}
                    onChange={e => handleEditChange('delivery_location', e.target.value)}
                    placeholder="Enter delivery location"
                    className="h-10 border-2 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" style={{ color: COLORS.teal }} />
                    Return Location
                  </label>
                  <Input
                    value={editForm.return_location}
                    onChange={e => handleEditChange('return_location', e.target.value)}
                    placeholder="Enter return location"
                    className="h-10 border-2 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Gauge className="w-4 h-4 inline mr-1" style={{ color: COLORS.teal }} />
                    Mileage (km)
                  </label>
                  <Input
                    type="number"
                    value={editForm.mileage}
                    onChange={e => handleEditChange('mileage', Number(e.target.value))}
                    placeholder="Enter mileage"
                    className="h-10 border-2 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" style={{ color: COLORS.teal }} />
                      Daily Rate
                    </label>
                    <Input
                      type="number"
                      value={editForm.daily_rate}
                      onChange={e => handleEditChange('daily_rate', Number(e.target.value))}
                      placeholder="Daily rate"
                      className="h-10 border-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" style={{ color: COLORS.darkBlue }} />
                      Holiday Rate
                    </label>
                    <Input
                      type="number"
                      value={editForm.holiday_rate}
                      onChange={e => handleEditChange('holiday_rate', Number(e.target.value))}
                      placeholder="Holiday rate"
                      className="h-10 border-2 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-10 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitEdit}
                  className="h-10 rounded-xl text-white font-semibold"
                  style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
                >
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <Card className="border-2 border-transparent hover:shadow-lg transition-all duration-300 rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: gradient }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);