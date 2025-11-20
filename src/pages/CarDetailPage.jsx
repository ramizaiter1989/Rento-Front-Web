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
import { carsData } from '@/data/carsData';
import { isFavorite, addToFavorites, removeFromFavorites } from '@/utils/localStorage';
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
  const car = carsData.find(c => c.id === parseInt(id));
  
  const [favorite, setFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupDate: '',
    returnDate: '',
    location: ''
  });

  useEffect(() => {
    if (car) {
      setFavorite(isFavorite(car.id));
    }
  }, [car]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!car) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Car Not Found</h2>
          <p className="text-muted-foreground mb-6">The vehicle you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/cars')} className="bg-primary hover:bg-primary-light text-primary-foreground">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Cars
          </Button>
        </Card>
      </div>
    );
  }

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

  const handleBooking = (e) => {
    e.preventDefault();
    // Mock booking success
    setShowBookingDialog(false);
    toast.success(
      `Booking confirmed for ${car.brand} ${car.model}! We'll contact you shortly.`,
      { duration: 5000 }
    );
    setBookingData({
      name: '',
      email: '',
      phone: '',
      pickupDate: '',
      returnDate: '',
      location: ''
    });
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
  const totalPrice = days * car.price;

  return (
    <div className="min-h-screen pt-20">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/cars')}
          className="mb-4 hover:bg-muted"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Cars
        </Button>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 group">
              <img
                src={car.images[selectedImage]}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={toggleFavorite}
                className="absolute top-4 right-4 w-12 h-12 rounded-full glass-strong backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 z-10"
              >
                <Heart
                  className={`w-6 h-6 transition-all ${
                    favorite ? 'fill-accent text-accent' : 'text-white'
                  }`}
                />
              </button>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-4">
              {car.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-[4/3] rounded-lg overflow-hidden transition-all ${
                    selectedImage === index
                      ? 'ring-2 ring-primary'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${car.brand} ${car.model} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Car Details */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge className="mb-2">{car.type}</Badge>
                <h1 className="text-4xl font-bold mb-2">
                  {car.brand} {car.model}
                </h1>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <span className="font-semibold">{car.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({car.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              {car.description}
            </p>

            {/* Price */}
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 mb-6">
              <CardContent className="p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Rental Price</p>
                    <p className="text-4xl font-bold gradient-text-accent">
                      ${car.price}
                      <span className="text-lg font-normal text-muted-foreground">/day</span>
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => setShowBookingDialog(true)}
                    className="bg-secondary hover:bg-secondary-light text-secondary-foreground font-semibold"
                  >
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Seats</p>
                      <p className="font-semibold">{car.seats} People</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Settings className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transmission</p>
                      <p className="font-semibold">{car.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Fuel className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel Type</p>
                      <p className="font-semibold">{car.fuelType}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Star className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="font-semibold">{car.rating}/5.0</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Features & Amenities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Book {car.brand} {car.model}
            </DialogTitle>
            <DialogDescription>
              Fill in your details to complete the booking. We'll contact you to confirm.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBooking} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={bookingData.name}
                  onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={bookingData.email}
                  onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="location">Pickup Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    required
                    value={bookingData.location}
                    onChange={(e) => setBookingData({ ...bookingData, location: e.target.value })}
                    placeholder="City or Airport"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pickupDate">Pickup Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="pickupDate"
                    type="date"
                    required
                    value={bookingData.pickupDate}
                    onChange={(e) => setBookingData({ ...bookingData, pickupDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="returnDate">Return Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="returnDate"
                    type="date"
                    required
                    value={bookingData.returnDate}
                    onChange={(e) => setBookingData({ ...bookingData, returnDate: e.target.value })}
                    min={bookingData.pickupDate || new Date().toISOString().split('T')[0]}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Price Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily Rate</span>
                <span className="font-semibold">${car.price}/day</span>
              </div>
              {days > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold">{days} day{days > 1 ? 's' : ''}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Price</span>
                    <span className="text-2xl font-bold gradient-text-accent">
                      ${totalPrice}
                    </span>
                  </div>
                </>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-secondary hover:bg-secondary-light text-secondary-foreground font-semibold"
            >
              Confirm Booking
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};