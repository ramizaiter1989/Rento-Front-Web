// ... (all imports same)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Calendar, MapPin, Clock, DollarSign, Star,
  CheckCircle, XCircle, AlertCircle, Clock4,
  ChevronLeft, ChevronRight, ShieldCheck, Car, ExternalLink
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

export const ClientBookingPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/driver/bookings/client');
        const data = response.data.bookings.data;
        setBookings(data);
        setFilteredBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
        toast.error('Could not load your bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.booking_request_status === activeFilter));
    }
  }, [activeFilter, bookings]);

  const getStatusConfig = (status) => {
    const config = {
      pending: { text: "Pending", icon: <Clock4 className="w-3.5 h-3.5" />, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
      confirmed: { text: "Confirmed", icon: <CheckCircle className="w-3.5 h-3.5" />, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
      cancelled: { text: "Cancelled", icon: <XCircle className="w-3.5 h-3.5" />, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
      rejected: { text: "Rejected", icon: <AlertCircle className="w-3.5 h-3.5" />, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
      completed: { text: "Completed", icon: <CheckCircle className="w-3.5 h-3.5" />, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    };
    return config[status] || config.pending;
  };

  // NEW: Open exact location using latitude & longitude
  const openInGoogleMaps = (lat, lng, address) => {
    if (!lat || !lng || lat === 0 || lng === 0) return;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const formatDate = (dateString) => format(new Date(dateString), 'MMM dd, yyyy • h:mm a');

  const ImageCarousel = ({ car }) => {
    const [idx, setIdx] = useState(0);
    const images = [
      car.main_image_url,
      car.front_image_url,
      car.back_image_url,
      car.left_image_url,
      car.right_image_url
    ].filter(Boolean);

    const next = () => setIdx((i) => (i + 1) % images.length);
    const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);

    if (!images.length) {
      return <div className="aspect-video bg-gray-200 border-2 border-dashed rounded-xl" />;
    }

    return (
      <div className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100">
        <img src={images[idx]} alt="Car" className="w-full h-full object-cover" />
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-6' : 'bg-white/60'}`} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // Loading & Error states (same as before)
  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Error Loading Bookings</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
          <div />
        </div>

        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-6 h-12">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredBookings.length === 0 ? (
          <Card className="p-16 text-center max-w-2xl mx-auto">
            <Car className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">
              {activeFilter === 'all' ? 'No Bookings Yet' : `No ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Bookings`}
            </h2>
            <p className="text-muted-foreground mb-8">
              {activeFilter === 'all' ? 'Start your journey by booking a car!' : 'You have no bookings in this category.'}
            </p>
            {activeFilter === 'all' && <Button onClick={() => navigate('/cars')}>Browse Cars</Button>}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => {
              const status = getStatusConfig(booking.booking_request_status);
              const duration = differenceInDays(new Date(booking.end_datetime), new Date(booking.start_datetime)) + 1;

              // Extract pickup & return location with lat/lng
              const pickupLoc = booking.pickup_location || booking.car.delivery_location || {};
              const returnLoc = booking.dropoff_location || booking.car.return_location || {};

              const pickupAddress = pickupLoc.address || "To be confirmed";
              const pickupLat = pickupLoc.latitude;
              const pickupLng = pickupLoc.longitude;

              const returnAddress = returnLoc.address || "To be confirmed";
              const returnLat = returnLoc.latitude;
              const returnLng = returnLoc.longitude;

              const depositAmount = parseFloat(booking.car.deposit || 0);
              const hasDeposit = depositAmount > 0;

              const hasPickupCoords = pickupLat && pickupLng && pickupLat !== 0 && pickupLng !== 0;
              const hasReturnCoords = returnLat && returnLng && returnLat !== 0 && returnLng !== 0;

              return (
                <Card key={booking.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <ImageCarousel car={booking.car} />
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className={`${status.color} shadow-lg font-medium`}>
                        {status.icon} <span className="ml-1">{status.text}</span>
                      </Badge>
                    </div>
                    {booking.payment_status === "pending" && (
                      <Badge className="absolute top-3 left-3 bg-orange-100 text-orange-800 dark:bg-orange-900/30">
                        Payment Pending
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold">
                      {booking.car.make} {booking.car.model}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {booking.car.year} • {booking.car.car_category} • {booking.car.seats} seats
                    </p>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Pickup */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-teal-600" />
                          <span className="text-sm font-semibold">Pickup</span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">{formatDate(booking.start_datetime)}</p>
                        <button
                          onClick={() => openInGoogleMaps(pickupLat, pickupLng)}
                          disabled={!hasPickupCoords}
                          className={`flex items-center gap-2 pl-6 text-xs transition-colors ${
                            !hasPickupCoords
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 underline-offset-2 hover:underline'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[120px]">{pickupAddress}</span>
                          {hasPickupCoords && <ExternalLink className="w-3 h-3 opacity-60" />}
                        </button>
                      </div>

                      {/* Return */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-teal-600" />
                          <span className="text-sm font-semibold">Return</span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">{formatDate(booking.end_datetime)}</p>
                        <button
                          onClick={() => openInGoogleMaps(returnLat, returnLng)}
                          disabled={!hasReturnCoords}
                          className={`flex items-center gap-2 pl-6 text-xs transition-colors ${
                            !hasReturnCoords
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 underline-offset-2 hover:underline'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[120px]">{returnAddress}</span>
                          {hasReturnCoords && <ExternalLink className="w-3 h-3 opacity-60" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{duration} day{duration > 1 ? 's' : ''}</span>
                    </div>

                    {booking.reason_of_booking && (
                      <p className="text-xs text-muted-foreground flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Star className="w-3.5 h-3.5" />
                        <span className="italic">"{booking.reason_of_booking}"</span>
                      </p>
                    )}

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                            ${parseFloat(booking.total_booking_price).toFixed(2)}
                          </p>
                        </div>
                        <Button size="sm" onClick={() => navigate(`/booking/${booking.id}`)}>
                          View Details
                        </Button>
                      </div>

                      <div className={`rounded-lg p-3 border ${hasDeposit ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className={`w-4 h-4 ${hasDeposit ? 'text-amber-700 dark:text-amber-300' : 'text-green-700 dark:text-green-300'}`} />
                            <span className={`text-sm font-medium ${hasDeposit ? 'text-amber-800 dark:text-amber-300' : 'text-green-800 dark:text-green-300'}`}>
                              Security Deposit
                            </span>
                          </div>
                          <span className={`font-bold ${hasDeposit ? 'text-amber-900 dark:text-amber-200' : 'text-green-900 dark:text-green-200'}`}>
                            {hasDeposit ? `$${depositAmount.toFixed(2)}` : 'None Required'}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${hasDeposit ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>
                          {hasDeposit ? 'Refundable upon safe return' : 'No deposit needed'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};