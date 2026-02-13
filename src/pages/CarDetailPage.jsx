import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Heart,
  Star,
  Users,
  Fuel,
  Settings,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  MapPin,
  DoorClosed,
  Gauge,
  Car
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { CarCard } from '@/components/CarCard';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  const [favorite, setFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingData, setBookingData] = useState({
    pickupDate: '',
    returnDate: '',
    location: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFavLoading, setIsFavLoading] = useState(false);
  const [relatedCars, setRelatedCars] = useState([]);

  const minNowLocal = useMemo(() => new Date().toISOString().slice(0, 16), []);

  const heroImage = useMemo(() => {
    if (!car?.images?.length) return '';
    return car.images[Math.min(selectedImage, car.images.length - 1)];
  }, [car, selectedImage]);

  const extractFavorites = (data) => {
    // supports common shapes:
    // { cars: [...] } OR { favorites: [...] } OR { data: [...] } OR [...]
    const raw =
      Array.isArray(data) ? data
      : Array.isArray(data?.cars) ? data.cars
      : Array.isArray(data?.favorites) ? data.favorites
      : Array.isArray(data?.data) ? data.data
      : [];

    return raw;
  };

  const isCarInFavorites = (favoritesArr, carId) => {
    const target = String(carId);
    return favoritesArr.some((item) => {
      // item could be car object or id
      if (item == null) return false;
      if (typeof item === 'string' || typeof item === 'number') return String(item) === target;
      return String(item.id ?? item.car_id ?? item.car?.id) === target;
    });
  };

  // Fetch car + favorite status
  useEffect(() => {
    let alive = true;

    const fetchCar = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/cars/${id}`);
        const carData = res.data.car;

        const feedbacks = carData.feedbacks ?? [];
        const rating =
          feedbacks.length > 0
            ? (
                feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
              ).toFixed(1)
            : null;

        const mappedCar = {
          id: carData.id,
          brand: carData.make,
          model: carData.model,
          year: carData.year,
          type: carData.car_category,
          seats: carData.seats,
          doors: carData.doors,
          transmission: carData.transmission,
          fuelType: carData.fuel_type,
          mileage: carData.mileage,
          drive: carData.wheels_drive,
          location: carData.live_location?.address ?? 'N/A',
          price: Number(carData.daily_rate),
          holidayRate: Number(carData.holiday_rate),
          rating,
          reviews: feedbacks.length,
          features: carData.features ?? [],
          description: carData.notes ?? '',
          images: [
            carData.main_image_url,
            carData.front_image_url,
            carData.back_image_url,
            carData.left_image_url,
            carData.right_image_url
          ].filter(Boolean),

          /**
           * IMPORTANT:
           * Replace `carData.delivery_available` with your real backend field.
           * TRUE => user can choose pickup location (delivery)
           * FALSE => pickup at car location only
           */
          deliveryAvailable: !!carData.delivery_available
        };

        if (!alive) return;
        setCar(mappedCar);
        setSelectedImage(0);

        // Get favorites list and check if this car is favorited (only when authorized)
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (token) {
          setIsFavLoading(true);
          try {
            const favRes = await api.get('/cars/favorites/list');
            const favArr = extractFavorites(favRes.data);
            if (!alive) return;
            setFavorite(isCarInFavorites(favArr, mappedCar.id));
          } catch (e) {
          // If favorites endpoint fails (auth, etc.), don’t block page
            if (!alive) return;
            setFavorite(false);
          } finally {
            if (alive) setIsFavLoading(false);
          }
        } else {
          setIsFavLoading(false);
        }

        // Fetch related cars (others from the same type or general list)
        try {
          const carsRes = await api.get('/cars');
          const raw = carsRes.data?.cars ?? carsRes.data?.data ?? [];
          const mapped = (Array.isArray(raw) ? raw : [])
            .filter((c) => String(c.id) !== String(carData.id))
            .slice(0, 3)
            .map((c) => {
              const fbs = c.feedbacks ?? [];
              const r =
                fbs.length > 0
                  ? (fbs.reduce((s, f) => s + (Number(f.rating) || 0), 0) / fbs.length).toFixed(1)
                  : null;
              return {
                id: c.id,
                brand: c.make,
                make: c.make,
                model: c.model,
                year: c.year,
                type: c.car_category,
                category: c.car_category,
                price: Number(c.daily_rate),
                image: c.main_image_url,
                rating: r,
                reviews: fbs.length,
                seats: c.seats,
                doors: c.doors,
                fuel_type: c.fuel_type,
                fuelType: c.fuel_type,
              };
            });
          if (alive) setRelatedCars(mapped);
        } catch (e) {
          if (alive) setRelatedCars([]);
        }
      } catch (err) {
        console.error('Car fetch error:', err);
        toast.error('Failed to load car details.');
        if (alive) setCar(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchCar();
    window.scrollTo(0, 0);

    return () => {
      alive = false;
    };
  }, [id]);

  // When opening booking dialog: if delivery NOT available, auto-set location to car location
  useEffect(() => {
    if (!showBookingDialog || !car) return;
    if (!car.deliveryAvailable) {
      setBookingData((prev) => ({
        ...prev,
        location: car.location || 'N/A'
      }));
    }
  }, [showBookingDialog, car]);

  const calculateDays = () => {
    if (!bookingData.pickupDate || !bookingData.returnDate) return 0;
    const pickup = new Date(bookingData.pickupDate);
    const ret = new Date(bookingData.returnDate);
    const days = Math.ceil((ret - pickup) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const days = calculateDays();
  const totalPrice = car ? days * car.price : 0;

  // FAVORITE (API) - only when authorized
  const toggleFavorite = async () => {
    if (!car || isFavLoading) return;
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to save favorites.');
      return;
    }
    const next = !favorite;
    setFavorite(next); // optimistic
    window.dispatchEvent(new Event('favoritesUpdated'));

    try {
      await api.post(`/cars/${car.id}/favorite`);
      toast.success(next ? 'Added to favorites' : 'Removed from favorites');
    } catch (err) {
      console.error('Favorite toggle error:', err);
      setFavorite(!next); // revert
      window.dispatchEvent(new Event('favoritesUpdated'));
      toast.error('Failed to update favorite. Please try again.');
    }
  };

  // BOOKING
  const validateBooking = () => {
    if (!car) return false;

    if (car.deliveryAvailable && !bookingData.location.trim()) {
      toast.error('Please enter pickup location.');
      return false;
    }

    if (!bookingData.pickupDate) {
      toast.error('Please select pickup date/time.');
      return false;
    }

    if (!bookingData.returnDate) {
      toast.error('Please select return date/time.');
      return false;
    }

    const pickup = new Date(bookingData.pickupDate);
    const ret = new Date(bookingData.returnDate);
    if (ret <= pickup) {
      toast.error('Return date must be after pickup date.');
      return false;
    }

    return true;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!validateBooking()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        car_id: car.id,
        start_datetime: bookingData.pickupDate,
        end_datetime: bookingData.returnDate,
        pickup_location: car.deliveryAvailable ? bookingData.location : car.location,
        reason_of_booking: bookingData.reason
      };

      const response = await api.post('/bookings', payload);

      if (response.status === 201) {
        toast.success(`Booking request submitted successfully! We'll contact you shortly.`, {
          duration: 5000
        });

        setShowBookingDialog(false);
        setBookingData({
          pickupDate: '',
          returnDate: '',
          location: '',
          reason: ''
        });
      } else {
        toast.error('Unexpected response from server. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      let errorMessage = 'Failed to submit booking request. Please try again.';

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
      <div className="min-h-screen pt-20 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <h2 className="text-xl font-semibold">Car not found</h2>
            <p className="text-sm text-muted-foreground">
              The vehicle you're looking for doesn't exist or was removed.
            </p>
            <Button onClick={() => navigate('/cars')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cars
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-background">
      {/* Top bar */}
      <div className="sticky top-16 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => navigate('/cars')} aria-label="Back to cars">
            <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant={favorite ? 'secondary' : 'outline'}
              onClick={toggleFavorite}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              disabled={isFavLoading}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${favorite ? 'fill-primary text-primary' : ''}`}
                aria-hidden="true"
              />
              {favorite ? 'Saved' : 'Save'}
            </Button>

            <Button
              onClick={() => setShowBookingDialog(true)}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 grid lg:grid-cols-12 gap-6">
        {/* Left */}
        <div className="lg:col-span-8 space-y-6">
          {/* Gallery */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <div className="aspect-[16/9] bg-muted">
                  {heroImage ? (
                    <img
                      src={`/api/storage/${heroImage}`}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                      No images available
                    </div>
                  )}
                </div>

                {car.type && (
                  <div className="absolute left-4 top-4">
                    <Badge className="rounded-full">{car.type}</Badge>
                  </div>
                )}

                {car.rating && (
                  <div className="absolute right-4 top-4 rounded-full bg-background/80 backdrop-blur px-3 py-1 flex items-center gap-2 border">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" aria-hidden="true" />
                    <span className="text-sm font-semibold">{car.rating}</span>
                    <span className="text-xs text-muted-foreground">({car.reviews})</span>
                  </div>
                )}
              </div>

              {car.images?.length > 1 && (
                <div className="p-4 border-t">
                  <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
                    {car.images.map((img, i) => (
                      <button
                        key={`${img}-${i}`}
                        onClick={() => setSelectedImage(i)}
                        className={`relative rounded-lg overflow-hidden border transition ${
                          selectedImage === i
                            ? 'ring-2 ring-primary border-transparent'
                            : 'hover:border-primary/40'
                        }`}
                        aria-label={`View image ${i + 1}`}
                      >
                        <img
                          src={`/api/storage/${img}`}
                          alt={`Thumbnail ${i + 1}`}
                          className="h-14 w-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Title + Price */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {car.brand} {car.model}{' '}
                    <span className="text-muted-foreground font-semibold">({car.year})</span>
                  </h1>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <InfoPill icon={<MapPin className="w-4 h-4" />} label={car.location} />
                    <Badge variant="secondary" className="rounded-full">
                      {car.deliveryAvailable ? 'Delivery available' : 'Pickup only'}
                    </Badge>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground">Starting from</p>
                  <p className="text-3xl font-bold">
                    ${car.price}
                    <span className="text-sm font-semibold text-muted-foreground">/day</span>
                  </p>
                  {Number.isFinite(car.holidayRate) && car.holidayRate > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Holiday: <span className="font-semibold">${car.holidayRate}</span>
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <SpecCard icon={Users} label="Seats" value={car.seats ?? 'N/A'} />
                <SpecCard icon={DoorClosed} label="Doors" value={car.doors ?? 'N/A'} />
                <SpecCard icon={Fuel} label="Fuel" value={car.fuelType ?? 'N/A'} />
                <SpecCard icon={Settings} label="Transmission" value={car.transmission ?? 'N/A'} />
                <SpecCard icon={Gauge} label="Mileage" value={car.mileage ? `${car.mileage} km` : 'N/A'} />
                <SpecCard icon={Car} label="Drive" value={car.drive ?? 'N/A'} />
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-base font-semibold">Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {car.description?.trim() ? car.description : 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          {car.features?.length > 0 && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Features</h3>
                  <Badge variant="secondary" className="rounded-full">
                    {car.features.length} included
                  </Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {car.features.map((f, i) => (
                    <div key={`${f}-${i}`} className="flex items-start gap-2 rounded-lg border p-3">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" aria-hidden="true" />
                      <span className="text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sticky booking summary */}
        <div className="lg:col-span-4">
          <Card className="sticky top-28">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <Badge className="rounded-full w-fit">{car.type || 'Car'}</Badge>
                  <h2 className="text-lg font-semibold leading-tight">
                    {car.brand} {car.model}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Price: <span className="font-semibold">${car.price}/day</span>
                  </p>
                </div>

                {car.rating && (
                  <div className="rounded-xl border px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" aria-hidden="true" />
                      <span className="font-semibold">{car.rating}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{car.reviews} reviews</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <MetaRow label="Pickup type" value={car.deliveryAvailable ? 'Delivery' : 'Pickup only'} />
                <MetaRow label="Car location" value={car.location} />
                <MetaRow label="Fuel" value={car.fuelType ?? 'N/A'} />
                <MetaRow label="Transmission" value={car.transmission ?? 'N/A'} />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
                  onClick={() => setShowBookingDialog(true)}
                >
                  Book Now
                </Button>
                <Button
                  variant="outline"
                  onClick={toggleFavorite}
                  aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                  disabled={isFavLoading}
                >
                  <Heart
                    className={`w-4 h-4 ${favorite ? 'fill-primary text-primary' : ''}`}
                    aria-hidden="true"
                  />
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Submit a booking request and our team will confirm availability with you.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Cars */}
      {relatedCars.length > 0 && (
        <div className="container mx-auto px-4 py-6 border-t">
          <h2 className="text-lg font-semibold mb-4">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {relatedCars.map((r) => (
              <CarCard key={r.id} car={r} />
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" asChild>
              <Link to="/cars">View all cars</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Book {car.brand} {car.model}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {car.deliveryAvailable
                ? 'Choose pickup location and rental dates.'
                : 'Delivery is not available for this car. Pickup is at the car location.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBooking} className="space-y-4 mt-2">
            {/* Location */}
            {car.deliveryAvailable ? (
              <div>
                <Label htmlFor="location" className="text-xs">Pickup Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="location"
                    required
                    value={bookingData.location}
                    onChange={(e) => setBookingData({ ...bookingData, location: e.target.value })}
                    placeholder="City, Airport, or Address"
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-1">Pickup location</p>
                <p className="text-sm font-semibold">{car.location || 'N/A'}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Pickup is at the car location.
                </p>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pickupDate" className="text-xs">Start Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="pickupDate"
                    type="datetime-local"
                    required
                    value={bookingData.pickupDate}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        pickupDate: e.target.value,
                        returnDate:
                          prev.returnDate && new Date(prev.returnDate) <= new Date(e.target.value)
                            ? ''
                            : prev.returnDate
                      }))
                    }
                    min={minNowLocal}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="returnDate" className="text-xs">End Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="returnDate"
                    type="datetime-local"
                    required
                    value={bookingData.returnDate}
                    onChange={(e) => setBookingData({ ...bookingData, returnDate: e.target.value })}
                    min={bookingData.pickupDate || minNowLocal}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Optional reason */}
            <div>
              <Label htmlFor="reason" className="text-xs">Reason (optional)</Label>
              <Input
                id="reason"
                value={bookingData.reason}
                onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                placeholder="Vacation, business trip, wedding..."
                className="h-9 text-sm"
              />
            </div>

            <Separator />

            {/* Price Summary */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily rate</span>
                <span className="font-medium">${car.price}/day</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Days</span>
                <span className="font-medium">{days > 0 ? days : '--'}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Estimated total</span>
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {days > 0 ? `$${totalPrice}` : '--'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Final confirmation depends on availability and terms.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 font-semibold h-10 text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Booking Request'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------- small UI helpers ---------- */

const InfoPill = ({ icon, label }) => (
  <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
    <span aria-hidden="true">{icon}</span>
    <span className="truncate max-w-[260px]">{label}</span>
  </div>
);

const SpecCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border p-4 bg-background hover:bg-muted/30 transition">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  </div>
);

const MetaRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-xs font-medium text-right">{value}</span>
  </div>
);
