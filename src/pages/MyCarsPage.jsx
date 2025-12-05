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
      return 'bg-amber-500 text-white';
    case 'sport':
      return 'bg-red-500 text-white';
    default:
      return 'bg-teal-500 text-white';
  }
};

const CarDetailModal = ({ car, onClose }) => {
  if (!car) return null;
  const safeArray = (arr) => Array.isArray(arr) ? arr : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-full">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl font-bold"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {car.make} {car.model} ({car.year})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Images */}
          <div className="space-y-2">
            <img
              src={car.main_image_url || '/placeholder.png'}
              alt="Main"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="grid grid-cols-2 gap-2">
              {['front', 'back', 'left', 'right'].map((dir) => (
                car[`${dir}_image_url`] && (
                  <img
                    key={dir}
                    src={car[`${dir}_image_url`]}
                    alt={dir}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                )
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-gray-800 dark:text-gray-300">
            <div><span className="font-semibold">License Plate:</span> {car.license_plate}</div>
            <div><span className="font-semibold">Category:</span> {car.car_category}</div>
            <div><span className="font-semibold">Daily Rate:</span> ${car.daily_rate}/day</div>
            <div><span className="font-semibold">Holiday Rate:</span> ${car.holiday_rate}/day</div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Status:</span>
              <Badge className={`px-2 py-1 text-xs ${getStatusBadgeClass(car.status)}`}>
                {car.status}
              </Badge>
            </div>
            <div><span className="font-semibold">Color:</span> {car.color}</div>
            <div><span className="font-semibold">Fuel Type:</span> {car.fuel_type}</div>
            <div><span className="font-semibold">Transmission:</span> {car.transmission}</div>
            <div><span className="font-semibold">Wheels Drive:</span> {car.wheels_drive}</div>
            <div><span className="font-semibold">Seats:</span> {car.seats}</div>
            <div><span className="font-semibold">Doors:</span> {car.doors}</div>
            <div><span className="font-semibold">Mileage:</span> {car.mileage?.toLocaleString()} km</div>
            <div><span className="font-semibold">Add-Ons:</span> {safeArray(car.car_add_on).join(', ') || 'N/A'}</div>
            <div><span className="font-semibold">Features:</span> {safeArray(car.features).join(', ') || 'N/A'}</div>
            <div><span className="font-semibold">Reason for Rent:</span> {safeArray(car.reason_of_rent).join(', ') || 'N/A'}</div>
            <div><span className="font-semibold">Max Driving Mileage:</span> {car.max_driving_mileage} km</div>
            <div><span className="font-semibold">Min Rental Days:</span> {car.min_rental_days}</div>
            <div><span className="font-semibold">Notes:</span> {car.notes || 'N/A'}</div>
            <div><span className="font-semibold">Delivery Location:</span> {car.delivery_location?.address || 'N/A'}</div>
            <div><span className="font-semibold">Return Location:</span> {car.return_location?.address || 'N/A'}</div>
            {car.live_location && <div><span className="font-semibold">Current Location:</span> {car.live_location.address}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

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
        { label: 'Yes, Delete', onClick: async () => {
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

  // Open edit modal
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30 dark:from-gray-950 dark:via-teal-950/20 dark:to-cyan-950/20 pt-20">
  <div className="container mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Car className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white">My Cars</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your listed cars</p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/Add/car')}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Car
          </Button>
        </div>

        {/* FILTERS */}
        <Card className="mb-6 border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* SEARCH */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by make, model, or license plate..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl transition-all duration-200"
                  />
                </div>
              </div>

              {/* CATEGORY */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl">
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl">
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
                    className="h-12 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Listed Cars ({filteredCars.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Loading cars...</p>
              </div>
            ) : paginatedCars.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Car className="w-12 h-12 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  No cars found.{' '}
                  <Button variant="link" className="text-teal-600 dark:text-teal-400 p-0 h-auto" onClick={() => navigate('/Add/car')}>Add your first car</Button>
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th>Make & Model</th>
                      <th>License Plate</th>
                      <th>Category</th>
                      <th>Daily Rate</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedCars.map((car) => (
                      <tr key={car.id}>
                        <td className="px-6 py-4 whitespace-nowrap flex gap-3 items-center">
                          <div className="w-12 h-8 rounded-lg overflow-hidden">
                            {car.main_image_url ? (
                              <img src={car.main_image_url} alt={car.make} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <Car className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{car.make}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{car.model} ({car.year})</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{car.license_plate}</td>
                        <td className="px-6 py-4">
                          <Badge className={`px-3 py-1 text-xs ${getCategoryBadgeClass(car.car_category)}`}>{car.car_category}</Badge>
                        </td>
                        <td className="px-6 py-4">${car.daily_rate}/day</td>
                        <td className="px-6 py-4">
                          <Badge className={`px-3 py-1 text-xs ${getStatusBadgeClass(car.status)}`}>{car.status}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-teal-600 dark:text-teal-400" onClick={() => setSelectedCar(car)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400" onClick={() => openEditModal(car)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400" onClick={() => handleDelete(car.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <Button onClick={() => goToPage(1)} disabled={pagination.currentPage === 1}><ChevronsLeft className="w-4 h-4"/></Button>
              <Button onClick={() => goToPage(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}><ChevronLeft className="w-4 h-4"/></Button>
              <div>Page {pagination.currentPage} of {totalPages}</div>
              <Button onClick={() => goToPage(pagination.currentPage + 1)} disabled={pagination.currentPage === totalPages}><ChevronRight className="w-4 h-4"/></Button>
              <Button onClick={() => goToPage(totalPages)} disabled={pagination.currentPage === totalPages}><ChevronsRight className="w-4 h-4"/></Button>
            </div>
          </div>
        )}

        {/* Modals */}
        <CarDetailModal car={selectedCar} onClose={() => setSelectedCar(null)} />

        {isEditModalOpen && selectedCar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-lg p-6 relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold text-xl"
                onClick={() => setIsEditModalOpen(false)}
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Edit {selectedCar.make} {selectedCar.model}
              </h2>

              <div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Delivery Location
    </label>
    <Input
      value={editForm.delivery_location}
      onChange={e => handleEditChange('delivery_location', e.target.value)}
      placeholder="Enter delivery location"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Return Location
    </label>
    <Input
      value={editForm.return_location}
      onChange={e => handleEditChange('return_location', e.target.value)}
      placeholder="Enter return location"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Mileage (km)
    </label>
    <Input
      type="number"
      value={editForm.mileage}
      onChange={e => handleEditChange('mileage', Number(e.target.value))}
      placeholder="Enter mileage"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Daily Rate ($)
    </label>
    <Input
      type="number"
      value={editForm.daily_rate}
      onChange={e => handleEditChange('daily_rate', Number(e.target.value))}
      placeholder="Enter daily rate"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Holiday Rate ($)
    </label>
    <Input
      type="number"
      value={editForm.holiday_rate}
      onChange={e => handleEditChange('holiday_rate', Number(e.target.value))}
      placeholder="Enter holiday rate"
    />
  </div>
</div>


              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button onClick={submitEdit}>Save Changes</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
