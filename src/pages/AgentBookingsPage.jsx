import React, { useEffect, useState } from "react";
import { Users, X, Check, XCircle, Calendar, MapPin, Phone, Mail, Shield, Star, Wallet, Award } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export function AgentBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [activeTab, setActiveTab] = useState("list");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/driver/bookings");
      setBookings(data.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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
      toast.success("Booking accepted successfully!");
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
      toast.success("Booking rejected successfully!");
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

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {status?.toUpperCase()}
      </span>
    );
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

  // Timeline View Helpers
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
      days.push({
        date: current.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        day: current.toLocaleDateString("en-US", { weekday: "short" }),
      });
      current.setDate(current.getDate() + 1);
    }
    return (
      <div className="flex border-b">
        {days.map((day, index) => (
          <div key={index} className="px-4 py-2 text-sm font-medium text-center" style={{ minWidth: 100 }}>
            <div>{day.day}</div>
            <div>{day.date}</div>
          </div>
        ))}
      </div>
    );
  };

  const CarRow = ({ car, bookings, dateRange, onBookingClick }) => {
    const { start: rangeStart, end: rangeEnd } = dateRange;
    const totalDays = Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24));
    const statusColors = {
      pending: "bg-yellow-300 hover:bg-yellow-400",
      confirmed: "bg-green-300 hover:bg-green-400",
      rejected: "bg-red-300 hover:bg-red-400",
    };
    return (
      <div className="flex items-center border-b py-4">
        <div className="w-48 flex items-center gap-2 px-4">
          <img src={car.main_image_url || "/placeholder.png"} alt={car.model} className="w-12 h-8 object-cover rounded" />
          <div>
            <div className="font-medium">
              {car.make} {car.model}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{bookings.length} bookings</div>
          </div>
        </div>
        <div className="relative flex-1 h-12">
          {bookings.map((booking) => {
            const start = new Date(booking.start_datetime);
            const end = new Date(booking.end_datetime);
            const left = Math.max(0, Math.floor((start - rangeStart) / (1000 * 60 * 60 * 24)));
            const width = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
            return (
              <div
                key={booking.id}
                className={`absolute h-full rounded ${statusColors[booking.booking_request_status]} cursor-pointer transition-all`}
                style={{
                  left: `${(left / totalDays) * 100}%`,
                  width: `${(width / totalDays) * 100}%`,
                }}
                title={`${booking.client?.profile?.first_name} ${booking.client?.profile?.last_name}\n${formatDateTime(
                  booking.start_datetime,
                )} - ${formatDateTime(booking.end_datetime)}\nTotal: $${booking.total_price}`}
                onClick={() => onBookingClick({ car, bookings: [booking] })}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const TimelineView = () => {
    const dateRange = calculateDateRange(bookings);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <TimelineHeader startDate={dateRange.start} endDate={dateRange.end} />
        {Object.values(groupedByCar).map(({ car, bookings }) => (
          <CarRow key={car.id} car={car} bookings={bookings} dateRange={dateRange} onBookingClick={openModal} />
        ))}
        <div className="flex justify-center gap-4 my-4 p-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-300 rounded"></div>
            <span className="text-sm">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-300 rounded"></div>
            <span className="text-sm">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-300 rounded"></div>
            <span className="text-sm">Rejected</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Booking Requests</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your car booking requests</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "list" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("list")}
          >
            List View
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "timeline" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("timeline")}
          >
            Timeline View
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : Object.keys(groupedByCar).length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">No booking requests yet.</p>
          </div>
        ) : activeTab === "list" ? (
          // List View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(groupedByCar).map(({ car, bookings: carBookings }) => {
              const pendingCount = carBookings.filter((b) => b.booking_request_status === "pending").length;
              const confirmedCount = carBookings.filter((b) => b.booking_request_status === "confirmed").length;
              return (
                <div
                  key={car.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
                  onClick={() => openModal({ car, bookings: carBookings })}
                >
                  <div className="relative">
                    <img
                      src={car?.main_image_url || "/placeholder.png"}
                      alt={car?.model || "Car"}
                      className="w-full h-52 object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-lg">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {carBookings.length} {carBookings.length === 1 ? "booking" : "bookings"}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                      {car?.make || "Unknown"} {car?.model || ""}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {car?.year || "N/A"} • {car?.car_category || "N/A"}
                    </p>
                    {car?.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{car.notes}</p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {pendingCount > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-yellow-800 dark:text-yellow-300">
                            {pendingCount} Pending
                          </span>
                        </div>
                      )}
                      {confirmedCount > 0 && (
                        <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-medium text-green-800 dark:text-green-300">
                            {confirmedCount} Confirmed
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Timeline View
          <TimelineView />
        )}

        {/* Modal */}
        {modalOpen && selectedCar && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-700 dark:to-blue-800 p-6 text-white relative">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedCar.car?.make} {selectedCar.car?.model}
                    </h2>
                    <p className="text-blue-100">
                      {selectedCar.bookings?.length || 0} booking request{selectedCar.bookings?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
                {selectedCar.bookings?.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No bookings for this car yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedCar.bookings?.map((booking) => {
                      const client = booking.client;
                      const profile = client?.profile || {};
                      const qualCode = profile?.qualification_code || {};
                      return (
                        <div
                          key={booking.id}
                          className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={client?.profile_picture || "/default-avatar.png"}
                                alt={client?.username || "Client"}
                                className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-600 shadow-lg"
                              />
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                  {client?.first_name || "N/A"} {client?.last_name || ""}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">@{client?.username || "Unknown"}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {profile?.average_rating && (
                                    <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded">
                                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                      <span className="text-xs font-medium text-yellow-800 dark:text-yellow-300">
                                        {profile.average_rating}
                                      </span>
                                    </div>
                                  )}
                                  {profile?.trusted_by_app && (
                                    <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                      <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                      <span className="text-xs font-medium text-blue-800 dark:text-blue-300">Trusted</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">{getStatusBadge(booking.booking_request_status)}</div>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-sm text-blue-900 dark:text-blue-300">
                                <Calendar className="w-4 h-4" />
                                <span className="font-semibold">Rental Period</span>
                              </div>
                              <span className="text-xs font-medium bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                                {calculateDuration(booking.start_datetime, booking.end_datetime)} days
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                              <div className="flex items-center justify-between">
                                <span className="text-blue-600 dark:text-blue-400">Start:</span>
                                <span className="font-medium">{formatDateTime(booking.start_datetime)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-blue-600 dark:text-blue-400">End:</span>
                                <span className="font-medium">{formatDateTime(booking.end_datetime)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                <Phone className="w-4 h-4" />
                                Contact Information
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p className="text-gray-700 dark:text-gray-300">
                                  <span className="text-gray-500">Email:</span> {client?.email || "N/A"}
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                  <span className="text-gray-500">Phone:</span> {client?.phone || "N/A"}
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="text-gray-500">City:</span> {profile?.city || qualCode?.city || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                <Award className="w-4 h-4" />
                                Personal Details
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p className="text-gray-700 dark:text-gray-300">
                                  <span className="text-gray-500">Age:</span> {qualCode?.age || "N/A"}
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                  <span className="text-gray-500">Gender:</span> {profile?.gender || qualCode?.gender || "N/A"}
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                  <span className="text-gray-500">Profession:</span> {profile?.profession || qualCode?.profession || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                <Wallet className="w-4 h-4" />
                                Financial Details
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p className="text-gray-700 dark:text-gray-300">
                                  <span className="text-gray-500">Salary Range:</span> {profile?.avg_salary || qualCode?.salary_range || "N/A"}
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                  <span className="text-gray-500">Has Deposit:</span> {qualCode?.has_deposit ? "✓ Yes" : "✗ No"}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4" />
                                Verification Status
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p className="text-gray-700 dark:text-gray-300">
                                  <span className="text-gray-500">Verified by Admin:</span> {qualCode?.verified_by_admin ? "✓ Yes" : "✗ No"}
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                  <span className="text-gray-500">Driver License:</span> {profile?.license_number || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                          {booking.booking_request_status === "pending" && (
                            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcceptBooking(booking.id);
                                }}
                                disabled={processingBookingId === booking.id}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Check className="w-5 h-5" />
                                {processingBookingId === booking.id ? "Processing..." : "Accept Booking"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectBooking(booking.id);
                                }}
                                disabled={processingBookingId === booking.id}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <XCircle className="w-5 h-5" />
                                {processingBookingId === booking.id ? "Processing..." : "Reject Booking"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
