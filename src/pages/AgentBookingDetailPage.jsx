/**
 * Agency/Operator Booking Detail Page
 * Full-page view of booking(s) with client verification images.
 * Phone number is hidden until booking is accepted/confirmed.
 * Navigate here from booking card click or notification click.
 */
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/axios";
import { getFeedbackTemplates, submitClientRating } from "@/lib/api";
import { motion } from "framer-motion";
import {
  ArrowLeft, Calendar, MapPin, Phone, Mail, Star, DollarSign,
  Check, XCircle, User, Briefcase, FileText, CreditCard, MessageCircle,
  Image, IdCard, ZoomIn
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const COLORS = {
  darkBlue: "#0E4C81",
  teal: "#008C95",
  limeGreen: "#8AC640",
  tealDim: "rgba(0, 140, 149, 0.1)",
  limeGreenDim: "rgba(138, 198, 64, 0.1)",
};

const getStatusConfig = (status) => {
  const configs = {
    pending: { label: "Pending", color: COLORS.teal, bgColor: COLORS.tealDim, textColor: COLORS.teal, icon: "⏳" },
    confirmed: { label: "Confirmed", color: COLORS.limeGreen, bgColor: COLORS.limeGreenDim, textColor: COLORS.limeGreen, icon: "✓" },
    accepted: { label: "Accepted", color: COLORS.darkBlue, bgColor: "rgba(14, 76, 129, 0.1)", textColor: COLORS.darkBlue, icon: "✓" },
    rejected: { label: "Rejected", color: "#DC2626", bgColor: "rgba(220, 38, 38, 0.1)", textColor: "#DC2626", icon: "✕" },
    completed: { label: "Completed", color: COLORS.limeGreen, bgColor: COLORS.limeGreenDim, textColor: COLORS.limeGreen, icon: "✓" },
  };
  return configs[status] || configs.pending;
};

const resolveImageUrl = (urlOrPath) => {
  if (!urlOrPath) return null;
  if (typeof urlOrPath === "string" && urlOrPath.startsWith("http")) return urlOrPath;
  return `/api/storage/${urlOrPath.replace(/^\//, "")}`;
};

function VerifImageCard({ label, src, fallbackIcon: FallbackIcon, aspect = "square", onZoom }) {
  const url = resolveImageUrl(src);
  const handleZoom = () => url && onZoom?.(url, label);
  return (
    <div className={`rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-900/50 group grid ${aspect === "square" ? "aspect-square" : "aspect-[4/3]"} grid-rows-[auto_1fr]`}>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 border-b border-gray-200 dark:border-gray-600">
        {label}
      </p>
      <div className="min-h-0 flex items-center justify-center p-2 relative">
        {url ? (
          <>
            <img
              src={url}
              alt={label}
              className="max-w-full max-h-full object-contain cursor-zoom-in transition-transform group-hover:scale-[1.02]"
              onClick={handleZoom}
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleZoom(); }}
              className="absolute bottom-2 right-2 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg hover:bg-teal-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              aria-label="Zoom"
            >
              <ZoomIn className="w-5 h-5" style={{ color: COLORS.teal }} />
            </button>
          </>
        ) : (
          <FallbackIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
        )}
      </div>
    </div>
  );
}

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateShort = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getLocationLabel = (loc) => {
  if (!loc) return "N/A";
  if (typeof loc === "string") return loc;
  if (typeof loc === "object" && loc.address) return loc.address;
  return String(loc);
};

export function AgentBookingDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const { bookingId, car, bookings: stateBookings } = state;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [rateClientBooking, setRateClientBooking] = useState(null);
  const [rateForm, setRateForm] = useState({ rating: 0, template_selections: [], comment: "" });
  const [rateSubmitting, setRateSubmitting] = useState(false);
  const [agentTemplates, setAgentTemplates] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (bookingId) {
          const { data } = await api.get(`/bookings/${bookingId}`);
          setBookings([data.booking || data]);
        } else if (stateBookings && stateBookings.length > 0) {
          setBookings(stateBookings);
        } else {
          toast.error("No booking data");
          navigate("/Mycars-bookings");
          return;
        }
      } catch (err) {
        console.error("Error loading booking:", err);
        toast.error("Failed to load booking");
        navigate("/Mycars-bookings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId, stateBookings, navigate]);

  useEffect(() => {
    getFeedbackTemplates()
      .then(({ data }) => setAgentTemplates(data?.agent_rates_client || []))
      .catch(() => {});
  }, []);

  const handleAcceptBooking = async (id) => {
    setProcessingBookingId(id);
    try {
      await api.post(`/driver/bookings/${id}/accept`);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, booking_request_status: "confirmed" } : b
        )
      );
      toast.success("Booking accepted!");
    } catch (err) {
      toast.error("Failed to accept booking");
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleRejectBooking = async (id) => {
    if (!confirm("Reject this booking?")) return;
    setProcessingBookingId(id);
    try {
      await api.post(`/driver/bookings/${id}/decline`);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      if (bookings.length <= 1) navigate("/Mycars-bookings");
      toast.success("Booking rejected");
    } catch (err) {
      toast.error("Failed to reject booking");
    } finally {
      setProcessingBookingId(null);
    }
  };

  const canShowRateClient = (b) => {
    const status = b?.booking_request_status;
    const isConfirmed = status === "confirmed" || status === "accepted";
    const tripEnded = b?.end_datetime && new Date(b.end_datetime) < new Date();
    return Boolean(isConfirmed && tripEnded && !b?.client_rating);
  };

  const openRateClientForm = (b) => setRateClientBooking(b);
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
      toast.success("Rating submitted.");
      closeRateClientForm();
      setBookings((prev) =>
        prev.map((b) =>
          b.id === rateClientBooking.id ? { ...b, client_rating: true } : b
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit rating.");
    } finally {
      setRateSubmitting(false);
    }
  };

  const calculateDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
  };

  if (loading || bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-teal-500" />
      </div>
    );
  }

  const firstCar = bookings[0]?.car || car;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/Mycars-bookings")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Bookings
        </motion.button>

        {bookings.map((booking, idx) => {
          const client = booking.client || {};
          const profile = client.profile || {};
          const config = getStatusConfig(booking.booking_request_status);
          const isAccepted =
            booking.booking_request_status === "confirmed" ||
            booking.booking_request_status === "accepted";

          const idCardFront = client.id_card_front_url || client.id_card_front;
          const idCardBack = client.id_card_back_url || client.id_card_back;
          const driverLicense = profile.driver_license_url || profile.driver_license;
          const profilePic = client.profile_picture_url || client.profile_picture;

          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8"
            >
              {/* Header */}
              <div
                className="p-6 text-white"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})`,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {firstCar?.main_image_url && (
                      <img
                        src={resolveImageUrl(firstCar.main_image_url)}
                        alt=""
                        className="w-16 h-12 object-cover rounded-lg border-2 border-white/30"
                      />
                    )}
                    <div>
                      <h1 className="text-2xl font-bold">
                        {firstCar?.make} {firstCar?.model}
                      </h1>
                      <p className="text-sm opacity-90">
                        {firstCar?.year} • {formatDateShort(booking.start_datetime)} – {formatDateShort(booking.end_datetime)}
                      </p>
                    </div>
                  </div>
                  <span
                    className="px-4 py-2 rounded-xl font-bold text-sm shrink-0"
                    style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
                  >
                    {config.label}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Client verification images */}
                <section>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <IdCard className="w-5 h-5" style={{ color: COLORS.teal }} />
                    Client Verification
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <VerifImageCard
                      label="Profile Photo"
                      src={profilePic}
                      fallbackIcon={User}
                      aspect="square"
                      onZoom={(url, lbl) => setZoomedImage({ url, label: lbl })}
                    />
                    <VerifImageCard
                      label="ID Card (Front)"
                      src={idCardFront}
                      fallbackIcon={Image}
                      onZoom={(url, lbl) => setZoomedImage({ url, label: lbl })}
                    />
                    <VerifImageCard
                      label="ID Card (Back)"
                      src={idCardBack}
                      fallbackIcon={Image}
                      onZoom={(url, lbl) => setZoomedImage({ url, label: lbl })}
                    />
                    <VerifImageCard
                      label="Driver License"
                      src={driverLicense}
                      fallbackIcon={CreditCard}
                      onZoom={(url, lbl) => setZoomedImage({ url, label: lbl })}
                    />
                  </div>
                </section>

                {/* Client info - no phone until accepted */}
                <section>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" style={{ color: COLORS.teal }} />
                    Client Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InfoCard icon={User} label="Name" value={`${client.first_name || ""} ${client.last_name || ""}`.trim() || "N/A"} />
                    <InfoCard icon={Mail} label="Email" value={client.email || "N/A"} />
                    <InfoCard
                      icon={Phone}
                      label="Phone"
                      value={isAccepted ? (client.phone_number || "N/A") : "Hidden until booking accepted"}
                      muted={!isAccepted}
                    />
                    <InfoCard icon={MapPin} label="City" value={client.city || "N/A"} />
                    <InfoCard icon={Briefcase} label="Profession" value={profile.profession || "N/A"} />
                    <InfoCard icon={FileText} label="License #" value={profile.license_number || "N/A"} />
                  </div>
                </section>

                {/* Rental & payment */}
                <section>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: COLORS.teal }} />
                    Rental & Payment
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-600 p-4 bg-gray-50/50 dark:bg-gray-900/30">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Period</p>
                      <p className="font-semibold">
                        {formatDateTime(booking.start_datetime)} – {formatDateTime(booking.end_datetime)}
                      </p>
                      <p className="text-sm mt-2" style={{ color: COLORS.teal }}>
                        {calculateDuration(booking.start_datetime, booking.end_datetime)} days
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-600 p-4 bg-gray-50/50 dark:bg-gray-900/30">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total / Net</p>
                      <p className="font-bold text-lg" style={{ color: COLORS.limeGreen }}>
                        ${booking.total_booking_price ?? "0.00"}
                      </p>
                      {booking.app_fees_amount != null && (
                        <p className="text-sm" style={{ color: COLORS.teal }}>
                          Net: ${(parseFloat(booking.total_booking_price || 0) - (booking.app_fees_amount || 0)).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  {booking.needs_delivery && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Delivery requested</p>
                  )}
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Pickup: {getLocationLabel(booking.pickup_location)}
                  </p>
                </section>

                {/* Actions */}
                {booking.booking_request_status === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAcceptBooking(booking.id)}
                      disabled={processingBookingId === booking.id}
                      className="flex-1 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 text-white disabled:opacity-50"
                      style={{ background: `linear-gradient(135deg, ${COLORS.limeGreen}, ${COLORS.teal})` }}
                    >
                      <Check className="w-5 h-5" />
                      {processingBookingId === booking.id ? "Processing..." : "Accept Booking"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleRejectBooking(booking.id)}
                      disabled={processingBookingId === booking.id}
                      className="flex-1 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </motion.button>
                  </div>
                )}

                {isAccepted && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => navigate("/BookingChat", { state: { bookingId: booking.id } })}
                      className="w-full sm:w-auto py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Chat with client
                    </motion.button>
                  </div>
                )}

                {canShowRateClient(booking) && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => openRateClientForm(booking)}
                      className="py-2.5 px-4 rounded-xl font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
                    >
                      Rate client
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Image zoom dialog */}
      <Dialog open={!!zoomedImage} onOpenChange={(o) => !o && setZoomedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-fit h-fit p-2 bg-black/95 border-0">
          {zoomedImage && (
            <>
              <p className="text-white text-sm font-medium text-center mb-2">{zoomedImage.label}</p>
              <img
                src={zoomedImage.url}
                alt={zoomedImage.label}
                className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain"
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Rate client dialog */}
      <Dialog open={!!rateClientBooking} onOpenChange={(o) => !o && closeRateClientForm()}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>Rate client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-semibold mb-2">Rating *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRateForm((p) => ({ ...p, rating: star }))}
                    className={`p-2 rounded-lg border-2 ${
                      rateForm.rating >= star ? "border-amber-400 bg-amber-50" : "border-gray-200"
                    }`}
                  >
                    <Star className={`w-6 h-6 ${rateForm.rating >= star ? "fill-amber-400 text-amber-400" : "text-gray-400"}`} />
                  </button>
                ))}
              </div>
            </div>
            {agentTemplates.length > 0 && (
              <div>
                <label className="block text-sm font-semibold mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {agentTemplates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTemplateSelection(t.id)}
                      className={`px-3 py-1.5 rounded-full text-sm border-2 ${
                        rateForm.template_selections.includes(t.id) ? "border-teal-500 bg-teal-50" : "border-gray-200"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold mb-2">Comment</label>
              <textarea
                value={rateForm.comment}
                onChange={(e) => setRateForm((p) => ({ ...p, comment: e.target.value.slice(0, 1000) }))}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border dark:bg-gray-900 dark:border-gray-600"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeRateClientForm}
                className="flex-1 py-2.5 rounded-xl border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitClientRating}
                disabled={rateSubmitting || rateForm.rating < 1}
                className="flex-1 py-2.5 rounded-xl font-bold text-white disabled:opacity-50"
                style={{ background: COLORS.teal }}
              >
                {rateSubmitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, muted }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-600 p-3 bg-gray-50/50 dark:bg-gray-900/30">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-gray-500" />
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p className={`font-semibold text-sm truncate ${muted ? "text-gray-400 italic" : ""}`}>
        {value || "N/A"}
      </p>
    </div>
  );
}
