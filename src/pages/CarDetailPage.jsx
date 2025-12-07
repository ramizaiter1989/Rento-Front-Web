import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { isFavorite, addToFavorites, removeFromFavorites } from '@/utils/localStorage';
import api from '@/lib/axios';
import {
  Heart,
  Star,
  Users,
  Fuel,
  Settings,
  ArrowLeft,
  CheckCircle,
  Calendar,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

export const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupDate: '',
    returnDate: '',
    location: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await api.get(`/cars/${id}`);
        const carData = res.data.car;
        const mappedCar = {
          id: carData.id,
          brand: carData.make,
          model: carData.model,
          type: carData.car_category,
          year: carData.year,
          seats: carData.seats,
          transmission: carData.transmission,
          fuelType: carData.fuel_type,
          price: Number(carData.daily_rate),
          rating: carData.feedbacks?.length ? 4.5 : 4.5,
          reviews: carData.feedbacks?.length ?? 0,
          features: carData.features ?? [],
          description: carData.notes ?? "",
          images: [
            carData.main_image_url,
            carData.front_image_url,
            carData.back_image_url,
            carData.left_image_url,
            carData.right_image_url
          ].filter(Boolean)
        };
        setCar(mappedCar);
        setFavorite(isFavorite(mappedCar.id));
      } catch (err) {
        console.error("Car fetch error:", err);
        toast.error("Failed to load car details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFavorite = () => {
    if (favorite) {
      removeFromFavorites(car.id);
      setFavorite(false);
      toast.success('Removed from favorites');
    } else {
      addToFavorites(car.id);
      setFavorite(true);
      toast.success('Added to favorites');
    }
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const calculateDays = () => {
    if (bookingData.pickupDate && bookingData.returnDate) {
      const pickup = new Date(bookingData.pickupDate);
      const returnDate = new Date(bookingData.returnDate);
      const days = Math.ceil((returnDate - pickup) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    }
    return 0;
  };

  const days = calculateDays();
  const totalPrice = car ? days * car.price : 0;

  const handleBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/bookings', {
        car_id: car.id,
        start_datetime: bookingData.pickupDate,
        end_datetime: bookingData.returnDate,
        reason_of_booking: bookingData.reason
      });

      if (response.status === 201) {
        toast.success(
          `Booking request submitted successfully! We'll contact you shortly.`,
          { duration: 5000 }
        );
        setShowBookingDialog(false);
        setBookingData({
          name: '',
          email: '',
          phone: '',
          pickupDate: '',
          returnDate: '',
          location: '',
          reason: ''
        });
      }
    } catch (error) {
      console.error("Booking error:", error);
      let errorMessage = "Failed to submit booking request. Please try again.";

      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.response.status === 422) {
          const errors = error.response.data.errors;
          errorMessage = Object.values(errors).flat().join('\n');
        }
      }

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-3">Car Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The vehicle you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/cars')} className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cars
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-950">
      {/* Compact Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/cars')}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">${car.price}<span className="text-sm text-gray-600 dark:text-gray-400">/day</span></p>
              </div>
              <Button
                onClick={() => setShowBookingDialog(true)}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 font-semibold"
                size="sm"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images (2/3 width) */}
          <div className="lg:col-span-2">
            {/* Main Image - Compact */}
            <div className="relative aspect-video rounded-xl overflow-hidden mb-3 group bg-gray-200 dark:bg-gray-800">
              <img
                src={car.images[selectedImage]}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={toggleFavorite}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
              >
                <Heart
                  className={`w-5 h-5 transition-all ${
                    favorite ? 'fill-teal-500 text-teal-500' : 'text-gray-700 dark:text-gray-300'
                  }`}
                />
              </button>
            </div>

            {/* Thumbnail Grid - Compact */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {car.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-video rounded-lg overflow-hidden transition-all ${
                    selectedImage === index
                      ? 'ring-2 ring-teal-500'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Description Card - Compact */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-bold text-base mb-2">About This Car</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {car.description || "Experience luxury and performance with this premium vehicle."}
                </p>
              </CardContent>
            </Card>

            {/* Features - Compact Grid */}
            {car.features.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-base mb-3">Features & Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {car.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Details (1/3 width) */}
          <div className="lg:col-span-1">
            {/* Title & Rating */}
            <Card className="mb-4 sticky top-28">
              <CardContent className="p-4">
                <Badge className="mb-2 text-xs">{car.type}</Badge>
                <h1 className="text-2xl font-bold mb-2">
                  {car.brand} {car.model}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{car.year}</p>
                
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold text-sm">{car.rating}</span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">({car.reviews} reviews)</span>
                </div>

                {/* Specs - 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Seats</p>
                      <p className="font-semibold text-sm">{car.seats}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Trans.</p>
                      <p className="font-semibold text-sm">{car.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Fuel className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Fuel</p>
                      <p className="font-semibold text-sm">{car.fuelType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                      <p className="font-semibold text-sm">{car.rating}/5</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Price CTA */}
                <div className="sm:hidden pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Starting from</p>
                      <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        ${car.price}<span className="text-sm">/day</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Dialog - Compact */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Book {car.brand} {car.model}</DialogTitle>
            <DialogDescription className="text-sm">
              Fill in your details to complete the booking.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBooking} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="name" className="text-xs">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={bookingData.name}
                  onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                  placeholder="John Doe"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={bookingData.email}
                  onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-xs">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="h-9 text-sm"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="location" className="text-xs">Pickup Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    id="location"
                    required
                    value={bookingData.location}
                    onChange={(e) => setBookingData({ ...bookingData, location: e.target.value })}
                    placeholder="City or Airport"
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pickupDate" className="text-xs">Pickup Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    id="pickupDate"
                    type="datetime-local"
                    required
                    value={bookingData.pickupDate}
                    onChange={(e) => setBookingData({ ...bookingData, pickupDate: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="returnDate" className="text-xs">Return Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    id="returnDate"
                    type="datetime-local"
                    required
                    value={bookingData.returnDate}
                    onChange={(e) => setBookingData({ ...bookingData, returnDate: e.target.value })}
                    min={bookingData.pickupDate || new Date().toISOString().slice(0, 16)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <Label htmlFor="reason" className="text-xs">Reason for Booking</Label>
                <Input
                  id="reason"
                  value={bookingData.reason}
                  onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                  placeholder="Business trip, vacation, etc."
                  className="h-9 text-sm"
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Price Summary - Compact */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Daily Rate</span>
                <span className="font-semibold">${car.price}/day</span>
              </div>
              {days > 0 && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Duration</span>
                    <span className="font-semibold">{days} day{days > 1 ? 's' : ''}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">Total</span>
                    <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                      ${totalPrice}
                    </span>
                  </div>
                </>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 font-semibold h-10 text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Booking'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};