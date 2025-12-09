import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Users, Shield, DollarSign, Star, MapPin, Briefcase, Calendar, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/axios';

const CITIES = ['Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Other'];
const PROFESSIONS = ['Employee', 'Freelancer', 'Business Owner', 'Student', 'Other'];
const GENDERS = ['Male', 'Female', 'Other', 'Any'];

export const CarQualificationsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  
  const [qualifications, setQualifications] = useState({
    enableAge: false,
    minAge: 25,
    maxAge: 65,
    enableGender: false,
    selectedGenders: [],
    enableCities: false,
    selectedCities: [],
    enableProfessions: false,
    selectedProfessions: [],
    enableSalary: false,
    minSalary: 1000,
    enableRating: false,
    minRating: 4.0,
    verifiedByAdmin: false,
    trustedByApp: false,
    hasDeposit: false,
  });

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      const response = await api.get('/cars');
      const carsData = response.data.cars?.data || response.data.cars || [];
      setCars(carsData);
    } catch (error) {
      console.error('Error loading cars:', error);
      toast.error('Failed to load cars');
    }
  };

  const loadQualifications = async (carId) => {
    try {
      const response = await api.get(`/cars/${carId}/qualifications`);
      if (response.data.qualifications) {
        const qual = response.data.qualifications;
        setQualifications({
          enableAge: !!(qual.min_age || qual.max_age),
          minAge: qual.min_age || 25,
          maxAge: qual.max_age || 65,
          enableGender: !!(qual.gender && qual.gender.length),
          selectedGenders: qual.gender || [],
          enableCities: !!(qual.required_cities && qual.required_cities.length),
          selectedCities: qual.required_cities || [],
          enableProfessions: !!(qual.professions && qual.professions.length),
          selectedProfessions: qual.professions || [],
          enableSalary: !!qual.min_salary,
          minSalary: qual.min_salary || 1000,
          enableRating: !!qual.min_rating,
          minRating: qual.min_rating || 4.0,
          verifiedByAdmin: qual.verified_by_admin || false,
          trustedByApp: qual.trusted_by_app || false,
          hasDeposit: qual.has_deposit || false,
        });
        // Auto-preview after loading
        setTimeout(() => handlePreview(), 100);
      }
    } catch (error) {
      console.error('Error loading qualifications:', error);
    }
  };

  const handleCarSelect = (carId) => {
    const car = cars.find(c => c.id === parseInt(carId));
    setSelectedCar(car);
    setPreviewData(null);
    if (car) {
      loadQualifications(car.id);
    } else {
      // Reset qualifications if no car selected
      setQualifications({
        enableAge: false,
        minAge: 25,
        maxAge: 65,
        enableGender: false,
        selectedGenders: [],
        enableCities: false,
        selectedCities: [],
        enableProfessions: false,
        selectedProfessions: [],
        enableSalary: false,
        minSalary: 1000,
        enableRating: false,
        minRating: 4.0,
        verifiedByAdmin: false,
        trustedByApp: false,
        hasDeposit: false,
      });
    }
  };

  const toggleSelection = (item, field) => {
    setQualifications(prev => {
      const current = prev[field];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...current, item] };
      }
    });
  };

  const collectFormData = () => {
    const data = {};

    if (qualifications.enableAge) {
      if (qualifications.minAge) data.min_age = parseInt(qualifications.minAge);
      if (qualifications.maxAge) data.max_age = parseInt(qualifications.maxAge);
    }

    if (qualifications.enableGender && qualifications.selectedGenders.length) {
      data.gender = qualifications.selectedGenders.map(g => g.toLowerCase());
    }

    if (qualifications.enableCities && qualifications.selectedCities.length) {
      data.required_cities = qualifications.selectedCities.map(c => c.toLowerCase());
    }

    if (qualifications.enableProfessions && qualifications.selectedProfessions.length) {
      data.professions = qualifications.selectedProfessions.map(p => p.toLowerCase().replace(/ /g, '_'));
    }

    if (qualifications.enableSalary && qualifications.minSalary) {
      data.min_salary = parseInt(qualifications.minSalary);
    }

    if (qualifications.enableRating && qualifications.minRating) {
      data.min_rating = parseFloat(qualifications.minRating);
    }

    if (qualifications.verifiedByAdmin) data.verified_by_admin = true;
    if (qualifications.trustedByApp) data.trusted_by_app = true;
    if (qualifications.hasDeposit) data.has_deposit = true;

    return data;
  };

  const handlePreview = async () => {
    const data = collectFormData();
    setPreviewLoading(true);

    try {
      const response = await api.post('/cars/qualifications/preview', data);
      setPreviewData(response.data);
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to preview qualifications');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCar) {
      toast.error('Please select a car first');
      return;
    }

    const data = collectFormData();
    setLoading(true);

    try {
      await api.post(`/cars/${selectedCar.id}/qualifications`, data);
      toast.success('Qualifications saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      const message = error.response?.data?.message || 'Failed to save qualifications';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!selectedCar) {
      toast.error('Please select a car first');
      return;
    }

    if (!confirm('Clear all qualifications for this car? It will be visible to all clients.')) {
      return;
    }

    try {
      await api.delete(`/cars/${selectedCar.id}/qualifications`);
      toast.success('Qualifications cleared successfully!');
      
      // Reset form
      setQualifications({
        enableAge: false,
        minAge: 25,
        maxAge: 65,
        enableGender: false,
        selectedGenders: [],
        enableCities: false,
        selectedCities: [],
        enableProfessions: false,
        selectedProfessions: [],
        enableSalary: false,
        minSalary: 1000,
        enableRating: false,
        minRating: 4.0,
        verifiedByAdmin: false,
        trustedByApp: false,
        hasDeposit: false,
      });
      setPreviewData(null);
    } catch (error) {
      console.error('Clear error:', error);
      toast.error('Failed to clear qualifications');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30 dark:from-gray-950 dark:via-teal-950/20 dark:to-cyan-950/20 pt-20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <Button
              variant="secondary"
              className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              onClick={() => navigate('/agent/cars')}
            >
              <Car className="w-4 h-4 mr-2" />
              Go to Cars Page
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">Set Car Qualifications</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Control who can see and book your vehicles</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Selection */}
            <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Car</h2>
                </div>

                <select
                  value={selectedCar?.id || ''}
                  onChange={(e) => handleCarSelect(e.target.value)}
                  className="w-full h-14 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl px-4 bg-white dark:bg-gray-900 text-lg font-medium transition-colors"
                >
                  <option value="">-- Select a car --</option>
                  {cars.map(car => (
                    <option key={car.id} value={car.id}>
                      {car.make} {car.model} ({car.year}) - {car.license_plate}
                    </option>
                  ))}
                </select>

                {selectedCar && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Selected: {selectedCar.make} {selectedCar.model} - Daily Rate: ${selectedCar.daily_rate}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Age Requirements */}
              <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <input
                      type="checkbox"
                      id="enableAge"
                      checked={qualifications.enableAge}
                      onChange={(e) => setQualifications({ ...qualifications, enableAge: e.target.checked })}
                      className="w-6 h-6 rounded border-2 border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <Calendar className="w-6 h-6 text-teal-600" />
                    <label htmlFor="enableAge" className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer">
                      Age Requirement
                    </label>
                  </div>

                  {qualifications.enableAge && (
                    <div className="grid grid-cols-2 gap-6 ml-9">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Minimum Age
                        </label>
                        <Input
                          type="number"
                          min="18"
                          max="100"
                          placeholder="e.g., 25"
                          value={qualifications.minAge}
                          onChange={(e) => setQualifications({ ...qualifications, minAge: e.target.value })}
                          className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Maximum Age
                        </label>
                        <Input
                          type="number"
                          min="18"
                          max="100"
                          placeholder="e.g., 65"
                          value={qualifications.maxAge}
                          onChange={(e) => setQualifications({ ...qualifications, maxAge: e.target.value })}
                          className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gender Requirements */}
              <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <input
                      type="checkbox"
                      id="enableGender"
                      checked={qualifications.enableGender}
                      onChange={(e) => setQualifications({ ...qualifications, enableGender: e.target.checked })}
                      className="w-6 h-6 rounded border-2 border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <Users className="w-6 h-6 text-teal-600" />
                    <label htmlFor="enableGender" className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer">
                      Gender Restriction
                    </label>
                  </div>

                  {qualifications.enableGender && (
                    <div className="flex flex-wrap gap-3 ml-9">
                      {GENDERS.map((gender) => (
                        <Badge
                          key={gender}
                          onClick={() => toggleSelection(gender, 'selectedGenders')}
                          className={`cursor-pointer px-4 py-2 text-sm transition-all duration-300 ${
                            qualifications.selectedGenders.includes(gender)
                              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {qualifications.selectedGenders.includes(gender) && <CheckCircle className="w-3 h-3 mr-1" />}
                          {gender}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* City Requirements */}
              <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <input
                      type="checkbox"
                      id="enableCities"
                      checked={qualifications.enableCities}
                      onChange={(e) => setQualifications({ ...qualifications, enableCities: e.target.checked })}
                      className="w-6 h-6 rounded border-2 border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <MapPin className="w-6 h-6 text-teal-600" />
                    <label htmlFor="enableCities" className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer">
                      City Restriction
                    </label>
                  </div>

                  {qualifications.enableCities && (
                    <div className="flex flex-wrap gap-3 ml-9">
                      {CITIES.map((city) => (
                        <Badge
                          key={city}
                          onClick={() => toggleSelection(city, 'selectedCities')}
                          className={`cursor-pointer px-4 py-2 text-sm transition-all duration-300 ${
                            qualifications.selectedCities.includes(city)
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {qualifications.selectedCities.includes(city) && <CheckCircle className="w-3 h-3 mr-1" />}
                          {city}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Profession Requirements */}
              <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <input
                      type="checkbox"
                      id="enableProfessions"
                      checked={qualifications.enableProfessions}
                      onChange={(e) => setQualifications({ ...qualifications, enableProfessions: e.target.checked })}
                      className="w-6 h-6 rounded border-2 border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <Briefcase className="w-6 h-6 text-teal-600" />
                    <label htmlFor="enableProfessions" className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer">
                      Profession Restriction
                    </label>
                  </div>

                  {qualifications.enableProfessions && (
                    <div className="flex flex-wrap gap-3 ml-9">
                      {PROFESSIONS.map((profession) => (
                        <Badge
                          key={profession}
                          onClick={() => toggleSelection(profession, 'selectedProfessions')}
                          className={`cursor-pointer px-4 py-2 text-sm transition-all duration-300 ${
                            qualifications.selectedProfessions.includes(profession)
                              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {qualifications.selectedProfessions.includes(profession) && <CheckCircle className="w-3 h-3 mr-1" />}
                          {profession}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Salary Requirements */}
              <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <input
                      type="checkbox"
                      id="enableSalary"
                      checked={qualifications.enableSalary}
                      onChange={(e) => setQualifications({ ...qualifications, enableSalary: e.target.checked })}
                      className="w-6 h-6 rounded border-2 border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <DollarSign className="w-6 h-6 text-amber-600" />
                    <label htmlFor="enableSalary" className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer">
                      Minimum Salary
                    </label>
                  </div>

                  {qualifications.enableSalary && (
                    <div className="ml-9">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Monthly Salary (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="100"
                          placeholder="e.g., 1000"
                          value={qualifications.minSalary}
                          onChange={(e) => setQualifications({ ...qualifications, minSalary: e.target.value })}
                          className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl pl-8"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rating Requirements */}
              <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <input
                      type="checkbox"
                      id="enableRating"
                      checked={qualifications.enableRating}
                      onChange={(e) => setQualifications({ ...qualifications, enableRating: e.target.checked })}
                      className="w-6 h-6 rounded border-2 border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <Star className="w-6 h-6 text-yellow-500" />
                    <label htmlFor="enableRating" className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer">
                      Minimum Rating
                    </label>
                  </div>

                  {qualifications.enableRating && (
                    <div className="ml-9">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Rating (0 to 5 stars)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="e.g., 4.0"
                        value={qualifications.minRating}
                        onChange={(e) => setQualifications({ ...qualifications, minRating: e.target.value })}
                        className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Verification Requirements */}
              <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verification Requirements</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={qualifications.verifiedByAdmin}
                        onChange={(e) => setQualifications({ ...qualifications, verifiedByAdmin: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">Must be verified by admin</span>
                    </label>

                    <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={qualifications.trustedByApp}
                        onChange={(e) => setQualifications({ ...qualifications, trustedByApp: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">Must be trusted by app</span>
                    </label>

                    <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={qualifications.hasDeposit}
                        onChange={(e) => setQualifications({ ...qualifications, hasDeposit: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">Must have deposit on account</span>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handlePreview}
                  disabled={!selectedCar || previewLoading}
                  className="flex-1 px-8 py-6 rounded-xl border-2 border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  {previewLoading ? 'Loading...' : 'Preview Results'}
                </Button>

                <Button
                  type="submit"
                  size="lg"
                  disabled={!selectedCar || loading}
                  className="flex-1 px-8 py-6 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {loading ? 'Saving...' : 'Save Qualifications'}
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleClear}
                disabled={!selectedCar}
                className="w-full px-8 py-6 rounded-xl border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Clear All Requirements
              </Button>
            </form>
          </div>

          {/* Right: Preview Panel */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg sticky top-6">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Qualified Clients</h2>
                </div>

                {/* Loading State */}
                {previewLoading && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Calculating...</p>
                  </div>
                )}

                {/* Initial State */}
                {!previewLoading && !previewData && (
                  <div className="text-center py-12">
                    <Users className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Set requirements and click "Preview Results" to see how many clients qualify
                    </p>
                  </div>
                )}

                {/* Results */}
                {!previewLoading && previewData && (
                  <div>
                    {/* Main Stats */}
                    <div className="text-center mb-6 p-8 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-2xl border-2 border-teal-200 dark:border-teal-800">
                      <div className="text-6xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                        {previewData.percentage}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                        of clients qualify
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {previewData.qualified_clients} / {previewData.total_clients}
                      </div>
                    </div>

                    {/* Breakdown */}
                    {previewData.breakdown && Object.keys(previewData.breakdown).length > 0 && (
                      <div className="space-y-3 mb-6">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                          Breakdown by Requirement
                        </h3>
                        {Object.entries(previewData.breakdown).map(([key, value]) => {
                          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          return (
                            <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {label}:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  {value.qualified}
                                </span>
                                <Badge className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                                  {value.percentage}%
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Warning */}
                    {previewData.percentage < 10 && (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-1">
                              Warning: Very Restrictive
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                              Very few clients qualify. Consider relaxing some requirements to increase visibility.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {previewData.percentage >= 10 && previewData.percentage < 30 && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1">
                              Selective Requirements
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              Your requirements are quite selective. This can help ensure quality bookings.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {previewData.percentage >= 30 && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-green-800 dark:text-green-200 mb-1">
                              Good Balance
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300">
                              Your requirements allow good visibility while maintaining quality standards.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarQualificationsPage;