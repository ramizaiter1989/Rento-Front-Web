import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { getFeedbackTemplates, submitClientRating } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, X, Check, XCircle, Calendar, MapPin, Phone, Mail, Shield, Star, 
  Wallet, Award, ChevronLeft, ChevronRight, AlertCircle, Clock, Car,
  TrendingUp, Eye, Filter, Search, Download, RefreshCw, Zap, CheckCircle2,
  Timer, Activity, DollarSign, UserCheck, BadgeCheck, Briefcase, Hash,
  Navigation, MapPinned, CalendarDays, CreditCard, FileText, Table2,
  MessageCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Logo colors
const COLORS = {
  darkBlue: '#0E4C81',
  teal: '#008C95',
  limeGreen: '#8AC640',
  darkBlueDim: 'rgba(14, 76, 129, 0.1)',
  tealDim: 'rgba(0, 140, 149, 0.1)',
  limeGreenDim: 'rgba(138, 198, 64, 0.1)',
};

export function AgentBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  // Agency rate client (feedback)
  const [agentTemplates, setAgentTemplates] = useState([]);
  const [rateClientBooking, setRateClientBooking] = useState(null);
  const [rateForm, setRateForm] = useState({ rating: 0, template_selections: [], comment: "" });
  const [rateSubmitting, setRateSubmitting] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/driver/bookings");
      setBookings(data.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const { data } = await getFeedbackTemplates();
        setAgentTemplates(data?.agent_rates_client || []);
      } catch (err) {
        console.error("Failed to load feedback templates:", err);
      }
    };
    loadTemplates();
  }, []);

  // Auto-swipe banner every 5 seconds
  useEffect(() => {
    const todayBookings = getTodayBookings();
    if (todayBookings.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % todayBookings.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [bookings]);

  const groupedByCar = bookings.reduce((acc, booking) => {
    const carId = booking.car?.id;
    if (!carId) return acc;
    if (!acc[carId]) {
      acc[carId] = {
        car: booking.car,
        bookings: [],
      };
    }
    acc[carId].bookings.push(booking);
    return acc;
  }, {});

  const getLocationLabel = (loc) => {
    if (!loc) return "N/A";
    if (typeof loc === "string") return loc;
    if (typeof loc === "object") {
      if (loc.address) return loc.address;
      const lat = loc.lat ?? loc.latitude;
      const lng = loc.lng ?? loc.longitude;
      if (lat != null && lng != null) return `${lat}, ${lng}`;
      return JSON.stringify(loc);
    }
    return String(loc);
  };

  const handleAcceptBooking = async (bookingId) => {
    setProcessingBookingId(bookingId);
    try {
      await api.post(`/driver/bookings/${bookingId}/accept`);
      await fetchBookings();
      if (selectedCar) {
        const updatedBookings = bookings.filter((b) => b.car?.id === selectedCar.car?.id);
        setSelectedCar({
          ...selectedCar,
          bookings: updatedBookings,
        });
      }
      toast.success("🎉 Booking accepted successfully!");
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast.error("Failed to accept booking");
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to reject this booking?")) return;
    setProcessingBookingId(bookingId);
    try {
      await api.post(`/driver/bookings/${bookingId}/decline`);
      await fetchBookings();
      if (selectedCar) {
        const updatedBookings = bookings.filter((b) => b.car?.id === selectedCar.car?.id && b.id !== bookingId);
        if (updatedBookings.length === 0) {
          closeModal();
        } else {
          setSelectedCar({
            ...selectedCar,
            bookings: updatedBookings,
          });
        }
      }
      toast.success("Booking rejected successfully");
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast.error("Failed to reject booking");
    } finally {
      setProcessingBookingId(null);
    }
  };

  const openModal = (carData) => {
    setSelectedCar(carData);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCar(null);
    setModalOpen(false);
  };

  // Agency can rate client when: confirmed/accepted, trip ended (end_datetime in past), not already rated
  const canShowRateClient = (booking) => {
    const status = booking?.booking_request_status;
    const isConfirmed = status === "confirmed" || status === "accepted";
    const tripEnded = booking?.end_datetime && new Date(booking.end_datetime) < new Date();
    const notRated = !booking?.client_rating;
    return Boolean(isConfirmed && tripEnded && notRated);
  };

  const openRateClientForm = (booking) => {
    setRateClientBooking(booking);
    setRateForm({ rating: 0, template_selections: [], comment: "" });
  };

  const closeRateClientForm = () => {
    setRateClientBooking(null);
    setRateForm({ rating: 0, template_selections: [], comment: "" });
  };

  const toggleTemplateSelection = (id) => {
    setRateForm((prev) => ({
      ...prev,
      template_selections: prev.template_selections.includes(id)
        ? prev.template_selections.filter((t) => t !== id)
        : [...prev.template_selections, id],
    }));
  };

  const handleSubmitClientRating = async () => {
    if (!rateClientBooking || rateForm.rating < 1 || rateForm.rating > 5) {
      toast.error("Please select a rating (1–5 stars).");
      return;
    }
    setRateSubmitting(true);
    try {
      await submitClientRating(rateClientBooking.id, {
        rating: rateForm.rating,
        template_selections: rateForm.template_selections,
        comment: rateForm.comment.slice(0, 1000),
      });
      toast.success("Rating submitted successfully.");
      closeRateClientForm();
      await fetchBookings();
      if (selectedCar?.bookings?.length) {
        const updatedBookings = selectedCar.bookings.map((b) =>
          b.id === rateClientBooking.id ? { ...b, client_rating: true } : b
        );
        setSelectedCar({ ...selectedCar, bookings: updatedBookings });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.data?.errors && Object.values(err.response.data.errors).flat().join(" ")) ||
        "Failed to submit rating.";
      toast.error(msg);
    } finally {
      setRateSubmitting(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: "Pending",
        color: COLORS.teal,
        bgColor: COLORS.tealDim,
        textColor: COLORS.teal,
        icon: Timer,
      },
      confirmed: {
        label: "Confirmed",
        color: COLORS.limeGreen,
        bgColor: COLORS.limeGreenDim,
        textColor: COLORS.limeGreen,
        icon: CheckCircle2,
      },
      accepted: {
        label: "Accepted",
        color: COLORS.darkBlue,
        bgColor: COLORS.darkBlueDim,
        textColor: COLORS.darkBlue,
        icon: Check,
      },
      rejected: {
        label: "Rejected",
        color: "#DC2626",
        bgColor: "rgba(220, 38, 38, 0.1)",
        textColor: "#DC2626",
        icon: XCircle,
      },
      completed: {
        label: "Completed",
        color: COLORS.limeGreen,
        bgColor: COLORS.limeGreenDim,
        textColor: COLORS.limeGreen,
        icon: CheckCircle2,
      },
    };
    return configs[status] || configs.pending;
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getTodayBookings = () => {
    return bookings.filter(
      (booking) => isToday(booking.start_datetime) || isToday(booking.end_datetime)
    );
  };

  // Statistics
  const getStats = () => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.booking_request_status === "pending").length;
    const confirmed = bookings.filter(b => b.booking_request_status === "confirmed" || b.booking_request_status === "accepted").length;
    const rejected = bookings.filter(b => b.booking_request_status === "rejected").length;
    const totalRevenue = bookings
      .filter(b => b.booking_request_status === "confirmed" || b.booking_request_status === "accepted")
      .reduce((sum, b) => sum + parseFloat(b.total_booking_price || 0), 0);
    
    return { total, pending, confirmed, rejected, totalRevenue };
  };

  const stats = getStats();

  // Filter bookings
  const filteredGroupedByCar = Object.entries(groupedByCar).reduce((acc, [carId, carData]) => {
    let filteredBookings = carData.bookings;

    // Filter by status
    if (filterStatus !== "all") {
      filteredBookings = filteredBookings.filter(
        b => b.booking_request_status === filterStatus
      );
    }

    // Filter by search query
    if (searchQuery) {
      filteredBookings = filteredBookings.filter(b => {
        const searchLower = searchQuery.toLowerCase();
        const carMatch = `${b.car?.make} ${b.car?.model}`.toLowerCase().includes(searchLower);
        const clientMatch = `${b.client?.first_name} ${b.client?.last_name}`.toLowerCase().includes(searchLower);
        const emailMatch = b.client?.email?.toLowerCase().includes(searchLower);
        return carMatch || clientMatch || emailMatch;
      });
    }

    if (filteredBookings.length > 0) {
      acc[carId] = { ...carData, bookings: filteredBookings };
    }

    return acc;
  }, {});

  // Calendar View Functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getBookingsForDate = (date) => {
    return bookings.filter((booking) => {
      const start = new Date(booking.start_datetime);
      const end = new Date(booking.end_datetime);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === start.getTime() || date.getTime() === end.getTime();
    });
  };

  const CalendarView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const previousMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayBookings = getBookingsForDate(date);
      const isCurrentDay = isToday(date.toISOString());

      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.05 }}
          className={`aspect-square border rounded-xl p-2 transition-all cursor-pointer ${
            isCurrentDay 
              ? "border-2 shadow-lg" 
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md"
          }`}
          style={isCurrentDay ? {
            background: `linear-gradient(135deg, ${COLORS.tealDim}, ${COLORS.limeGreenDim})`,
            borderColor: COLORS.teal
          } : {}}
          onClick={() => {
            if (dayBookings.length > 0) {
              const carGroups = dayBookings.reduce((acc, booking) => {
                const carId = booking.car?.id;
                if (!acc[carId]) {
                  acc[carId] = { car: booking.car, bookings: [] };
                }
                acc[carId].bookings.push(booking);
                return acc;
              }, {});
              openModal(Object.values(carGroups)[0]);
            }
          }}
        >
          <div className={`text-sm font-bold mb-1 ${isCurrentDay ? "dark:text-gray-800" : "text-gray-700 dark:text-gray-300"}`} style={isCurrentDay ? { color: COLORS.teal } : {}}>
            {day}
          </div>
          {dayBookings.length > 0 && (
            <div className="space-y-1">
              {dayBookings.slice(0, 2).map((booking) => {
                const config = getStatusConfig(booking.booking_request_status);
                return (
                  <div
                    key={booking.id}
                    className="text-xs px-1.5 py-0.5 rounded-md truncate font-medium shadow-sm"
                    style={{ background: config.bgColor, color: config.textColor }}
                  >
                    {booking.car?.make}
                  </div>
                );
              })}
              {dayBookings.length > 2 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  +{dayBookings.length - 2} more
                </div>
              )}
            </div>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}>
            {monthNames[month]} {year}
          </h2>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={previousMonth}
              className="p-2 rounded-xl transition-colors"
              style={{ background: COLORS.tealDim, color: COLORS.teal }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextMonth}
              className="p-2 rounded-xl transition-colors"
              style={{ background: COLORS.tealDim, color: COLORS.teal }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center font-bold text-sm text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
          {days}
        </div>

        <div className="flex justify-center gap-6 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
          {["pending", "confirmed", "rejected"].map((status) => {
            const config = getStatusConfig(status);
            return (
              <div key={status} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md shadow-sm" style={{ background: config.color }}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{config.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  // Timeline View
  const calculateDateRange = (bookings) => {
    if (!bookings.length) return { start: new Date(), end: new Date() };
    const allDates = bookings.flatMap((booking) => [new Date(booking.start_datetime), new Date(booking.end_datetime)]);
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
    minDate.setDate(minDate.getDate() - 2);
    maxDate.setDate(maxDate.getDate() + 2);
    return { start: minDate, end: maxDate };
  };

  const TimelineHeader = ({ startDate, endDate }) => {
    const days = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const isCurrentDay = isToday(current.toISOString());
      days.push({
        date: current.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        day: current.toLocaleDateString("en-US", { weekday: "short" }),
        isToday: isCurrentDay,
      });
      current.setDate(current.getDate() + 1);
    }
    return (
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        {days.map((day, index) => (
          <div 
            key={index} 
            className={`px-4 py-3 text-sm font-semibold text-center ${
              day.isToday ? '' : ''
            }`}
            style={day.isToday ? { background: COLORS.tealDim, color: COLORS.teal } : {}}
          >
            <div className="font-bold">{day.day}</div>
            <div className="text-xs opacity-80">{day.date}</div>
          </div>
        ))}
      </div>
    );
  };

  const CarRow = ({ car, bookings, dateRange, onBookingClick }) => {
    const { start: rangeStart, end: rangeEnd } = dateRange;
    const totalDays = Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24));
    
    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center border-b border-gray-200 dark:border-gray-700 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="w-56 flex items-center gap-3 px-4">
          <img 
            src={car.main_image_url ? `/api/storage/${car.main_image_url}` : "/placeholder.png"}

            alt={car.model} 
            className="w-14 h-10 object-cover rounded-lg shadow-md" 
          />
          <div className="flex-1">
            <div className="font-bold text-gray-900 dark:text-white">
              {car.make} {car.model}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div className="relative flex-1 h-14 px-2">
          {bookings.map((booking) => {
            const start = new Date(booking.start_datetime);
            const end = new Date(booking.end_datetime);
            const left = Math.max(0, Math.floor((start - rangeStart) / (1000 * 60 * 60 * 24)));
            const width = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
            const config = getStatusConfig(booking.booking_request_status);
            
            return (
              <motion.div
                key={booking.id}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="absolute h-10 rounded-xl cursor-pointer shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white text-xs font-semibold"
                style={{
                  left: `${(left / totalDays) * 100}%`,
                  width: `${(width / totalDays) * 100}%`,
                  background: config.color
                }}
                title={`${booking.client?.first_name} ${booking.client?.last_name}\n${formatDateTime(
                  booking.start_datetime,
                )} - ${formatDateTime(booking.end_datetime)}\nTotal: $${booking.total_booking_price}`}
                onClick={() => onBookingClick({ car, bookings: [booking] })}
              >
                <span className="truncate px-2">{booking.client?.first_name}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const TimelineView = () => {
    const dateRange = calculateDateRange(bookings);
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <TimelineHeader startDate={dateRange.start} endDate={dateRange.end} />
        <div className="max-h-[600px] overflow-y-auto">
          {Object.values(groupedByCar).map(({ car, bookings }) => (
            <CarRow key={car.id} car={car} bookings={bookings} dateRange={dateRange} onBookingClick={openModal} />
          ))}
        </div>
        <div className="flex justify-center gap-6 p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          {["pending", "confirmed", "rejected"].map((status) => {
            const config = getStatusConfig(status);
            return (
              <div key={status} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md shadow-sm" style={{ background: config.color }}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{config.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  // Today's Bookings Banner
  const TodayBanner = () => {
    const todayBookings = getTodayBookings();
    
    if (todayBookings.length === 0) return null;

    const currentBooking = todayBookings[currentBannerIndex];
    const isStarting = isToday(currentBooking.start_datetime);
    const isEnding = isToday(currentBooking.end_datetime);

    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 rounded-2xl shadow-2xl p-5 text-white overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${COLORS.darkBlue}, ${COLORS.teal}, ${COLORS.limeGreen})` }}
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl"
            >
              <Zap className="w-7 h-7" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">Today's Action Required!</h3>
                {todayBookings.length > 1 && (
                  <span className="text-xs bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full font-semibold">
                    {currentBannerIndex + 1} of {todayBookings.length}
                  </span>
                )}
              </div>
              <p className="text-sm opacity-90 mb-4 flex items-center gap-2">
                {isStarting && isEnding ? (
                  <>
                    <Activity className="w-4 h-4" />
                    Booking starts AND ends today
                  </>
                ) : isStarting ? (
                  <>
                    <CalendarDays className="w-4 h-4" />
                    Booking starts today
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Booking ends today
                  </>
                )}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Car Info */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentBooking.car?.main_image_url
                          ? `/api/storage/${currentBooking.car.main_image_url}`
                          : "/placeholder.png"}

                      alt={currentBooking.car?.model}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-white/30 shadow-lg"
                    />
                    <div>
                      <div className="font-bold text-lg">
                        {currentBooking.car?.make} {currentBooking.car?.model}
                      </div>
                      <div className="text-xs opacity-80 flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        {currentBooking.car?.year} • {currentBooking.car?.car_category}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Client Info */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentBooking.client?.profile_picture
                          ? `/api/storage/${currentBooking.client.profile_picture}`
                          : "/default-avatar.png"}

                      alt={currentBooking.client?.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/30 shadow-lg"
                    />
                    <div>
                      <div className="font-bold text-lg flex items-center gap-1">
                        {currentBooking.client?.first_name} {currentBooking.client?.last_name}
                        {currentBooking.client?.verified_by_admin && (
                          <BadgeCheck className="w-4 h-4" />
                        )}
                      </div>
                      <div className="text-xs opacity-80">@{currentBooking.client?.username}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Details */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{formatDateTime(currentBooking.start_datetime)}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-bold">${currentBooking.total_booking_price}</span>
                </div>
                {currentBooking.app_fees_amount != null && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <span className="opacity-90">App fee:</span>
                    <span>${currentBooking.app_fees_amount}</span>
                  </div>
                )}
                <div className="px-3 py-1.5 rounded-lg font-semibold text-xs bg-white/20">
                  {currentBooking.booking_request_status.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Indicators */}
        {todayBookings.length > 1 && (
          <div className="absolute bottom-4 right-6 flex gap-2">
            {todayBookings.map((_, idx) => (
              <motion.div
                key={idx}
                animate={{ scale: idx === currentBannerIndex ? 1.2 : 1 }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentBannerIndex ? "bg-white w-8" : "bg-white/40 w-2"
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // Stats Cards
  const StatsCards = () => {
    const statsData = [
      {
        title: "Total Bookings",
        value: stats.total,
        icon: Calendar,
        gradient: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})`,
        change: "+12%",
      },
      {
        title: "Pending Review",
        value: stats.pending,
        icon: Timer,
        gradient: `linear-gradient(135deg, ${COLORS.darkBlue}, ${COLORS.teal})`,
        change: "Needs action",
        alert: stats.pending > 0,
      },
      {
        title: "Confirmed",
        value: stats.confirmed,
        icon: CheckCircle2,
        gradient: `linear-gradient(135deg, ${COLORS.limeGreen}, ${COLORS.teal})`,
        change: "+8%",
      },
      {
        title: "Total Revenue",
        value: `$${stats.totalRevenue.toFixed(2)}`,
        icon: DollarSign,
        gradient: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.limeGreen})`,
        change: "+15%",
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {statsData.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="relative"
          >
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl p-2.5 shadow-lg" style={{ background: stat.gradient }}>
                  <stat.icon className="w-full h-full text-white" />
                </div>
                {stat.alert && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-3 h-3 rounded-full"
                    style={{ background: COLORS.teal }}
                  />
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{stat.change}</p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="mb-5">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold bg-clip-text text-transparent mb-2" style={{ backgroundImage: `linear-gradient(135deg, ${COLORS.darkBlue}, ${COLORS.teal}, ${COLORS.limeGreen})` }}>
              Booking Management
            </h1>
          </motion.div>
        </div>

        {/* Today's Banner */}
        <TodayBanner />

        {/* Stats */}
        <StatsCards />

        {/* Filters & Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by car, client, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 dark:text-white"
                style={{ focusRing: COLORS.teal }}
              />
            </div>
            
            {/* Filter */}
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 dark:text-white"
                style={{ focusRing: COLORS.teal }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchBookings}
                className="p-2.5 rounded-xl transition-colors"
                style={{ background: COLORS.tealDim, color: COLORS.teal }}
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
          {[
            { id: "list", label: "List View", icon: FileText },
            { id: "table", label: "Table", icon: Table2 },
            { id: "timeline", label: "Timeline", icon: Activity },
            { id: "calendar", label: "Calendar", icon: Calendar },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
              style={activeTab === tab.id ? { background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` } : {}}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-t-4 rounded-full"
              style={{ borderColor: COLORS.tealDim, borderTopColor: COLORS.teal }}
            ></motion.div>
          </div>
        ) : Object.keys(filteredGroupedByCar).length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <Users className="w-20 h-20 mx-auto mb-4" style={{ color: COLORS.teal, opacity: 0.3 }} />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">No bookings found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">Try adjusting your filters or search query</p>
          </motion.div>
        ) : activeTab === "calendar" ? (
          <CalendarView />
        ) : activeTab === "timeline" ? (
          <TimelineView />
        ) : activeTab === "table" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-700 dark:text-gray-300">Car</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Client</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Dates</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 text-right">Amount</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 text-right">App Fee</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 text-right">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(filteredGroupedByCar)
                    .flatMap((g) => g.bookings)
                    .map((booking) => {
                      const config = getStatusConfig(booking.booking_request_status);
                      const amount = parseFloat(booking.total_booking_price || 0);
                      const appFee = Number(booking.app_fees_amount) || 0;
                      const net = amount - appFee;
                      return (
                        <TableRow
                          key={booking.id}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-700"
                          onClick={() => openModal({ car: booking.car, bookings: [booking] })}
                        >
                          <TableCell className="font-medium text-gray-900 dark:text-white">
                            {booking.car?.make} {booking.car?.model}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {booking.client?.first_name} {booking.client?.last_name}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                            {formatDateShort(booking.start_datetime)} – {formatDateShort(booking.end_datetime)}
                          </TableCell>
                          <TableCell>
                            <span
                              className="px-2 py-1 rounded-lg text-xs font-semibold"
                              style={{ background: config.bgColor, color: config.textColor }}
                            >
                              {config.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-semibold" style={{ color: COLORS.limeGreen }}>
                            ${amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-gray-600 dark:text-gray-400">
                            ${appFee.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-bold" style={{ color: COLORS.teal }}>
                            ${net.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
          >
            {Object.values(filteredGroupedByCar).map(({ car, bookings: carBookings }, index) => {
              const pendingCount = carBookings.filter((b) => b.booking_request_status === "pending").length;
              const confirmedCount = carBookings.filter((b) => b.booking_request_status === "confirmed" || b.booking_request_status === "accepted").length;
              
              return (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700 group"
                  onClick={() => openModal({ car, bookings: carBookings })}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={car?.main_image_url 
                        ? `/api/storage/${car.main_image_url}` 
                        : "/placeholder.png"}

                      alt={car?.model || "Car"}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                      <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {carBookings.length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                      {car?.make || "Unknown"} {car?.model || ""}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      {car?.year || "N/A"} • {car?.car_category || "N/A"}
                    </p>
                    
                    {car?.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{car.notes}</p>
                    )}
                    
                    <div className="flex gap-2 flex-wrap">
                      {pendingCount > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: COLORS.tealDim, borderColor: COLORS.teal }}>
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-2 h-2 rounded-full"
                            style={{ background: COLORS.teal }}
                          ></motion.div>
                          <span className="text-xs font-semibold" style={{ color: COLORS.teal }}>
                            {pendingCount} Pending
                          </span>
                        </div>
                      )}
                      {confirmedCount > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: COLORS.limeGreenDim, borderColor: COLORS.limeGreen }}>
                          <CheckCircle2 className="w-4 h-4" style={{ color: COLORS.limeGreen }} />
                          <span className="text-xs font-semibold" style={{ color: COLORS.limeGreen }}>
                            {confirmedCount} Confirmed
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {modalOpen && selectedCar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl mx-4 shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
                style={{ maxHeight: '90vh' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-5 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-2xl">
                        <Car className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          {selectedCar.car?.make} {selectedCar.car?.model}
                        </h2>
                        <p className="text-sm opacity-90 flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" />
                          {selectedCar.bookings?.length || 0} booking request{selectedCar.bookings?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={closeModal}
                      className="p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                  {selectedCar.bookings?.length === 0 ? (
                    <div className="p-12 text-center">
                      <Users className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.teal, opacity: 0.3 }} />
                      <p className="text-gray-500 dark:text-gray-400 text-lg">No bookings for this car yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {selectedCar.bookings?.map((booking, index) => {
                        const client = booking.client;
                        const profile = client?.profile || {};
                        const config = getStatusConfig(booking.booking_request_status);
                        const StatusIcon = config.icon;
                        const isAcceptedBooking =
                          booking.booking_request_status === "accepted" ||
                          booking.booking_request_status === "confirmed";

                        return (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700"
                          >
                            {/* Booking Header */}
                            <div className="flex justify-between items-start mb-5">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <img
                                    src={client?.profile_picture 
                                      ? `/api/storage/${client.profile_picture}` 
                                      : "/default-avatar.png"}

                                    alt={client?.username || "Client"}
                                    className="w-14 h-14 rounded-2xl object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                                  />
                                  {profile?.trusted_by_app && (
                                    <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white dark:border-gray-700 flex items-center justify-center shadow-lg" style={{ background: COLORS.darkBlue }}>
                                      <Shield className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                                      {client?.first_name || "N/A"} {client?.last_name || ""}
                                      {client?.verified_by_admin && (
                                        <BadgeCheck className="w-5 h-5" style={{ color: COLORS.teal }} />
                                      )}
                                    </h3>
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    @{client?.username || "Unknown"} • Booked {formatDateShort(booking.created_at)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2" style={{ background: config.bgColor, borderColor: config.color }}>
                                <StatusIcon className="w-5 h-5" style={{ color: config.textColor }} />
                                <span className="font-bold text-sm" style={{ color: config.textColor }}>{config.label}</span>
                              </div>
                            </div>

                            {/* Booking Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                              {/* Rental Period */}
                              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-2 rounded-lg" style={{ background: COLORS.tealDim }}>
                                    <CalendarDays className="w-4 h-4" style={{ color: COLORS.teal }} />
                                  </div>
                                  <span className="font-bold text-gray-900 dark:text-white">Rental Period</span>
                                </div>
                                <div className="space-y-1.5 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Start:</span>
                                    <span className="font-semibold">{formatDateTime(booking.start_datetime)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">End:</span>
                                    <span className="font-semibold">{formatDateTime(booking.end_datetime)}</span>
                                  </div>
                                  <div className="flex justify-between pt-1.5 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                                    <span className="font-bold" style={{ color: COLORS.teal }}>
                                      {calculateDuration(booking.start_datetime, booking.end_datetime)} days
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Price & Location */}
                              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-2 rounded-lg" style={{ background: COLORS.limeGreenDim }}>
                                    <DollarSign className="w-4 h-4" style={{ color: COLORS.limeGreen }} />
                                  </div>
                                  <span className="font-bold text-gray-900 dark:text-white">Payment Details</span>
                                </div>
                                <div className="space-y-1.5 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total (client paid):</span>
                                    <span className="font-bold text-lg" style={{ color: COLORS.limeGreen }}>${booking.total_booking_price ?? "0.00"}</span>
                                  </div>
                                  {booking.app_fees_amount != null && (
                                    <>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">App fee:</span>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">${booking.app_fees_amount}</span>
                                      </div>
                                      <div className="flex justify-between pt-1.5 border-t border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Your net:</span>
                                        <span className="font-bold" style={{ color: COLORS.teal }}>
                                          ${(parseFloat(booking.total_booking_price || 0) - (booking.app_fees_amount || 0)).toFixed(2)}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                  {booking.needs_delivery && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Delivery:</span>
                                      <span className="font-semibold text-right truncate max-w-[160px]">
                                        Requested
                                      </span>
                                    </div>
                                  )}
                                  {booking.needs_driver && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Driver:</span>
                                      <span className="font-semibold text-right truncate max-w-[160px]">
                                        With driver
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Pickup:</span>
                                    <span className="font-semibold text-right truncate max-w-[160px]">
                                      {getLocationLabel(booking.pickup_location)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Dropoff:</span>
                                    <span className="font-semibold text-right truncate max-w-[160px]">
                                      {getLocationLabel(booking.dropoff_location)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Client Information Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                              {[
                                { label: "Email", value: client?.email, icon: Mail },
                                {
                                  label: "Phone",
                                  value: isAcceptedBooking
                                    ? client?.phone_number
                                    : "Hidden until booking accepted",
                                  icon: Phone,
                                },
                                { label: "City", value: client?.city, icon: MapPin },
                                { label: "Profession", value: profile?.profession, icon: Briefcase },
                              ].map((item, i) => (
                                <div key={i} className="bg-white dark:bg-gray-700 p-2.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <item.icon className="w-3 h-3 text-gray-400" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                                  </div>
                                  <p className="font-semibold text-sm truncate text-gray-800 dark:text-gray-200">
                                    {item.value || "N/A"}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                              {[
                                { label: "Age", value: profile?.age },
                                { label: "Gender", value: client?.gender },
                                { label: "Salary", value: profile?.avg_salary },
                                { label: "License", value: profile?.license_number },
                              ].map((item, i) => (
                                <div key={i} className="bg-white dark:bg-gray-700 p-2.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                                  <p className="font-semibold text-sm truncate text-gray-800 dark:text-gray-200">
                                    {item.value || "N/A"}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Rating */}
                            {profile?.average_rating && (
                              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl mb-4 border" style={{ background: COLORS.limeGreenDim, borderColor: COLORS.limeGreen }}>
                                <Star className="w-5 h-5 fill-current" style={{ color: COLORS.limeGreen }} />
                                <span className="font-bold" style={{ color: COLORS.limeGreen }}>
                                  {profile.average_rating} Average Rating
                                </span>
                              </div>
                            )}

                            {/* Rate client (agency) – after trip ended, confirmed, not yet rated */}
                            {booking.client_rating && (
                              <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4 border" style={{ background: COLORS.limeGreenDim, borderColor: COLORS.limeGreen }}>
                                <CheckCircle2 className="w-5 h-5" style={{ color: COLORS.limeGreen }} />
                                <span className="font-semibold" style={{ color: COLORS.limeGreen }}>Rating submitted</span>
                              </div>
                            )}
                            {!booking.client_rating && canShowRateClient(booking) && (
                              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mb-4">
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openRateClientForm(booking);
                                  }}
                                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                                  style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
                                >
                                  <Star className="w-5 h-5" />
                                  Rate client
                                </motion.button>
                              </div>
                            )}

                            {/* Action Buttons */}
                            {booking.booking_request_status === "pending" && (
                              <div className="flex gap-2.5 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptBooking(booking.id);
                                  }}
                                  disabled={processingBookingId === booking.id}
                                  className="flex-1 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{ background: `linear-gradient(135deg, ${COLORS.limeGreen}, ${COLORS.teal})` }}
                                >
                                  <Check className="w-5 h-5" />
                                  {processingBookingId === booking.id ? "Processing..." : "Accept Booking"}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectBooking(booking.id);
                                  }}
                                  disabled={processingBookingId === booking.id}
                                  className="flex-1 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <XCircle className="w-5 h-5" />
                                  {processingBookingId === booking.id ? "Processing..." : "Reject Booking"}
                                </motion.button>
                              </div>
                            )}

                            {/* Chat button for accepted bookings */}
                            {isAcceptedBooking && (
                              <div className="flex gap-2.5 pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate("/BookingChat", { state: { bookingId: booking.id } });
                                  }}
                                  className="flex-1 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl"
                                >
                                  <MessageCircle className="w-5 h-5" />
                                  Chat with client
                                </motion.button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rate client dialog */}
        <Dialog open={!!rateClientBooking} onOpenChange={(open) => !open && closeRateClientForm()}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2" style={{ color: COLORS.darkBlue }}>
                <Star className="w-5 h-5" style={{ color: COLORS.teal }} />
                Rate client
                {rateClientBooking?.client && (
                  <span className="font-normal text-gray-600 dark:text-gray-400">
                    — {rateClientBooking.client.first_name} {rateClientBooking.client.last_name}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Star rating (required) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setRateForm((prev) => ({ ...prev, rating: star }))}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        rateForm.rating >= star
                          ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-amber-300"
                      }`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          rateForm.rating >= star ? "fill-amber-400 text-amber-400" : "text-gray-400"
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Template tags (optional) */}
              {agentTemplates.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tags (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {agentTemplates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTemplateSelection(t.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${
                          rateForm.template_selections.includes(t.id)
                            ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                        style={
                          rateForm.template_selections.includes(t.id)
                            ? { borderColor: COLORS.teal, background: COLORS.tealDim, color: COLORS.teal }
                            : {}
                        }
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Comment (optional, max 1000) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Comment (optional, max 1000 characters)
                </label>
                <textarea
                  value={rateForm.comment}
                  onChange={(e) => setRateForm((prev) => ({ ...prev, comment: e.target.value.slice(0, 1000) }))}
                  placeholder="e.g. Very good renter. Would rent to again."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {rateForm.comment.length}/1000
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeRateClientForm}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitClientRating}
                  disabled={rateSubmitting || rateForm.rating < 1}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
                >
                  {rateSubmitting ? "Submitting…" : "Submit rating"}
                </motion.button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}