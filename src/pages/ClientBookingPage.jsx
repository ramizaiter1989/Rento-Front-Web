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
  ChevronLeft, ChevronRight, ShieldCheck, Car, ExternalLink,
  Users, Package
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
      pending: { 
        text: "Pending", 
        icon: <Clock4 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, 
        color: "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200 dark:from-yellow-900/30 dark:to-amber-900/30 dark:text-yellow-300 dark:border-yellow-700",
        badgeClass: "bg-yellow-500"
      },
      confirmed: { 
        text: "Confirmed", 
        icon: <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, 
        color: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-700",
        badgeClass: "bg-green-500"
      },
      cancelled: { 
        text: "Cancelled", 
        icon: <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, 
        color: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200 dark:from-gray-800/30 dark:to-slate-800/30 dark:text-gray-300 dark:border-gray-700",
        badgeClass: "bg-gray-500"
      },
      rejected: { 
        text: "Rejected", 
        icon: <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, 
        color: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-300 dark:border-red-700",
        badgeClass: "bg-red-500"
      },
      completed: { 
        text: "Completed", 
        icon: <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, 
        color: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300 dark:border-blue-700",
        badgeClass: "bg-blue-500"
      },
    };
    return config[status] || config.pending;
  };

  const openInGoogleMaps = (lat, lng, address) => {
    if (!lat || !lng || lat === 0 || lng === 0) return;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const formatDate = (dateString) => format(new Date(dateString), 'MMM dd, yyyy');
  const formatTime = (dateString) => format(new Date(dateString), 'h:mm a');

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
      return (
        <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed rounded-t-xl flex items-center justify-center">
          <Car className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
        </div>
      );
    }

    return (
      <div className="relative group aspect-[16/10] rounded-t-xl overflow-hidden bg-gray-900">
        <img src={`/api/storage/${images[idx]}`} alt="Car" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={prev} 
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-1.5 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={next} 
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-1.5 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === idx 
                      ? 'bg-white w-6 sm:w-8 h-1.5 sm:h-2' 
                      : 'bg-white/60 hover:bg-white/80 w-1.5 sm:w-2 h-1.5 sm:h-2'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-teal-200 dark:border-teal-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4">
        <div className="container mx-auto py-8 sm:py-12 max-w-2xl">
          <Card className="p-8 sm:p-12 text-center border-2 shadow-xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3">Oops! Something went wrong</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">{error}</p>
            <Button onClick={() => window.location.reload()} size="lg" className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-16 sm:pt-20">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors -ml-2 sm:ml-0 h-9 sm:h-10 px-2 sm:px-4"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> 
            <span className="text-sm sm:text-base">Back</span>
          </Button>
          <div className="text-left sm:text-center flex-1 w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1 sm:mb-2">
              My Bookings
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} total
            </p>
          </div>
          <div className="hidden sm:block w-[100px]" /> {/* Spacer for alignment on desktop */}
        </div>

        {/* Filter Tabs - Mobile Optimized */}
        <div className="mb-6 sm:mb-8 -mx-3 sm:mx-0 px-3 sm:px-0 overflow-x-auto scrollbar-hide">
          <Tabs value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList className="inline-flex sm:grid w-auto sm:w-full min-w-full sm:max-w-3xl sm:mx-auto grid-cols-6 h-11 sm:h-14 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border shadow-lg gap-0.5 sm:gap-1 p-1">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white font-medium text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="confirmed" 
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white font-medium text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap"
              >
                <span className="hidden sm:inline">Confirmed</span>
                <span className="sm:hidden">Confirm</span>
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white font-medium text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger 
                value="cancelled" 
                className="data-[state=active]:bg-gray-500 data-[state=active]:text-white font-medium text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap"
              >
                <span className="hidden sm:inline">Cancelled</span>
                <span className="sm:hidden">Cancel</span>
              </TabsTrigger>
              <TabsTrigger 
                value="rejected" 
                className="data-[state=active]:bg-red-500 data-[state=active]:text-white font-medium text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap"
              >
                Rejected
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white font-medium text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap"
              >
                <span className="hidden sm:inline">Completed</span>
                <span className="sm:hidden">Done</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 ? (
          <Card className="p-8 sm:p-16 text-center max-w-2xl mx-auto border-2 shadow-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Car className="w-10 h-10 sm:w-12 sm:h-12 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              {activeFilter === 'all' ? 'No Bookings Yet' : `No ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Bookings`}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8">
              {activeFilter === 'all' ? 'Ready to hit the road? Browse our amazing fleet!' : 'You have no bookings in this category.'}
            </p>
            {activeFilter === 'all' && (
              <Button 
                onClick={() => navigate('/cars')} 
                size="lg"
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg w-full sm:w-auto"
              >
                Browse Cars
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredBookings.map((booking) => {
              const status = getStatusConfig(booking.booking_request_status);
              const duration = differenceInDays(new Date(booking.end_datetime), new Date(booking.start_datetime)) + 1;

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
                <Card 
                  key={booking.id} 
                  className="overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full border-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:-translate-y-1 group"
                >
                  {/* Image with Status Badge */}
                  <div className="relative">
                    <ImageCarousel car={booking.car} />
                    
                    {/* Status Badge - Top Right */}
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
                      <Badge className={`${status.color} shadow-xl font-semibold px-2 py-1 sm:px-3 sm:py-1.5 border backdrop-blur-sm text-xs sm:text-sm`}>
                        {status.icon} <span className="ml-1">{status.text}</span>
                      </Badge>
                    </div>

                    {/* Payment Status - Top Left */}
                    {booking.payment_status === "pending" && (
                      <Badge className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-orange-500 text-white shadow-xl border-0 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 font-semibold text-xs sm:text-sm">
                        <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                        <span className="hidden xs:inline">Payment Due</span>
                        <span className="xs:hidden">Due</span>
                      </Badge>
                    )}

                    {/* Duration Badge - Bottom Left */}
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg flex items-center gap-1.5 sm:gap-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      {duration} day{duration > 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Card Header */}
                  <CardHeader className="pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold flex items-start sm:items-center justify-between gap-2 flex-col xs:flex-row">
                      <span className="truncate">
                        {booking.car.make} {booking.car.model}
                      </span>
                      <Badge variant="outline" className="font-mono text-xs shrink-0 self-start xs:self-auto">
                        {booking.car.year}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground pt-2">
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">{booking.car.car_category}</span>
                      </div>
                      <Separator orientation="vertical" className="h-3 sm:h-4" />
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        {booking.car.seats}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4 sm:space-y-6 pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                    {/* Date & Location Section */}
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {/* Pickup */}
                      <div className="relative pl-5 sm:pl-6 pb-4 sm:pb-6 border-l-2 border-teal-200 dark:border-teal-800">
                        <div className="absolute -left-1.5 sm:-left-2 top-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-teal-500 ring-2 sm:ring-4 ring-teal-100 dark:ring-teal-900" />
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm text-teal-700 dark:text-teal-400">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            Pickup
                          </div>
                          <p className="text-xs sm:text-sm font-medium">{formatDate(booking.start_datetime)}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(booking.start_datetime)}</p>
                          <button
                            onClick={() => openInGoogleMaps(pickupLat, pickupLng)}
                            disabled={!hasPickupCoords}
                            className={`flex items-start gap-1.5 sm:gap-2 text-xs transition-all mt-1.5 sm:mt-2 group/btn ${
                              !hasPickupCoords
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 active:text-teal-700'
                            }`}
                          >
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                            <span className="flex-1 text-left line-clamp-2">{pickupAddress}</span>
                            {hasPickupCoords && (
                              <ExternalLink className="w-3 h-3 opacity-60 group-hover/btn:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Return */}
                      <div className="relative pl-5 sm:pl-6">
                        <div className="absolute -left-1.5 sm:-left-2 top-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-cyan-500 ring-2 sm:ring-4 ring-cyan-100 dark:ring-cyan-900" />
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm text-cyan-700 dark:text-cyan-400">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            Return
                          </div>
                          <p className="text-xs sm:text-sm font-medium">{formatDate(booking.end_datetime)}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(booking.end_datetime)}</p>
                          <button
                            onClick={() => openInGoogleMaps(returnLat, returnLng)}
                            disabled={!hasReturnCoords}
                            className={`flex items-start gap-1.5 sm:gap-2 text-xs transition-all mt-1.5 sm:mt-2 group/btn ${
                              !hasReturnCoords
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 active:text-cyan-700'
                            }`}
                          >
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                            <span className="flex-1 text-left line-clamp-2">{returnAddress}</span>
                            {hasReturnCoords && (
                              <ExternalLink className="w-3 h-3 opacity-60 group-hover/btn:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Booking Reason */}
                    {booking.reason_of_booking && (
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                            "{booking.reason_of_booking}"
                          </p>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Security Deposit */}
                    <div className={`rounded-xl p-3 sm:p-4 border-2 transition-all ${
                      hasDeposit 
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700' 
                        : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700'
                    }`}>
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className={`p-1 sm:p-1.5 rounded-lg ${hasDeposit ? 'bg-amber-200 dark:bg-amber-800' : 'bg-green-200 dark:bg-green-800'}`}>
                            <ShieldCheck className={`w-4 h-4 sm:w-5 sm:h-5 ${hasDeposit ? 'text-amber-700 dark:text-amber-300' : 'text-green-700 dark:text-green-300'}`} />
                          </div>
                          <span className={`text-xs sm:text-sm font-semibold ${hasDeposit ? 'text-amber-900 dark:text-amber-200' : 'text-green-900 dark:text-green-200'}`}>
                            Deposit
                          </span>
                        </div>
                        <span className={`text-base sm:text-lg font-bold ${hasDeposit ? 'text-amber-900 dark:text-amber-200' : 'text-green-900 dark:text-green-200'}`}>
                          {hasDeposit ? `$${depositAmount.toFixed(2)}` : '$0.00'}
                        </span>
                      </div>
                      <p className={`text-xs ${hasDeposit ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>
                        {hasDeposit ? 'Refundable upon safe return' : 'No deposit required'}
                      </p>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-end justify-between pt-2 gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide mb-0.5 sm:mb-1 text-muted-foreground">Total</p>
                        <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                          ${parseFloat(booking.total_booking_price).toFixed(2)}
                        </p>
                      </div>
                      <Button 
                        size="default"
                        onClick={() => navigate(`/booking/${booking.id}`)}
                        className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all group h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base"
                      >
                        <span className="hidden xs:inline">View Details</span>
                        <span className="xs:hidden">Details</span>
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
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
