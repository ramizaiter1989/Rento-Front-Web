import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Wallet,
  DollarSign,
  Percent,
  Receipt,
  TrendingUp,
  RefreshCw,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { getOwnerEarnings } from "@/lib/api";
import api from "@/lib/axios";
import { toast } from "sonner";

const COLORS = {
  darkBlue: "#0E4C81",
  teal: "#008C95",
  limeGreen: "#8AC640",
  darkBlueDim: "rgba(14, 76, 129, 0.1)",
  tealDim: "rgba(0, 140, 149, 0.1)",
  limeGreenDim: "rgba(138, 198, 64, 0.1)",
};

const formatMoney = (value) => {
  if (value == null || value === "") return "0.00";
  const n = parseFloat(value);
  return Number.isNaN(n) ? "0.00" : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function BalancePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [earnings, setEarnings] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [filterRange, setFilterRange] = useState("all"); // all, day, week, month, custom
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [stats, setStats] = useState(null);

  const parseDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const isWithinRange = (dateStr, range) => {
    const d = parseDate(dateStr);
    if (!d) return false;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range.type) {
      case "day": {
        return d >= startOfToday;
      }
      case "week": {
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        return d >= startOfWeek;
      }
      case "month": {
        const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);
        return d >= startOfMonth;
      }
      case "custom": {
        const from = parseDate(range.from);
        const to = parseDate(range.to);
        if (!from && !to) return true;
        if (from && d < from) return false;
        if (to) {
          const end = new Date(to);
          end.setHours(23, 59, 59, 999);
          if (d > end) return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  const computeStatsFromBookings = (bookings, range) => {
    if (!Array.isArray(bookings) || bookings.length === 0) {
      return {
        total_amount: 0,
        app_fees_amount: 0,
        net_earnings: 0,
        bookings_count: 0,
        cancelled_count: 0,
        rejected_count: 0,
      };
    }

    const filtered = bookings.filter((b) =>
      range.type === "all"
        ? true
        : isWithinRange(b.start_datetime || b.created_at || b.updated_at, range)
    );

    const earningsBookings = filtered.filter((b) =>
      ["confirmed", "accepted", "completed"].includes(b.booking_request_status)
    );

    const total_amount = earningsBookings.reduce(
      (sum, b) => sum + parseFloat(b.total_booking_price || 0),
      0
    );
    const app_fees_amount = earningsBookings.reduce(
      (sum, b) => sum + (Number(b.app_fees_amount) || 0),
      0
    );

    const cancelled_count = filtered.filter(
      (b) => b.booking_request_status === "cancelled"
    ).length;
    const rejected_count = filtered.filter(
      (b) => b.booking_request_status === "rejected"
    ).length;

    return {
      total_amount,
      app_fees_amount,
      net_earnings: total_amount - app_fees_amount,
      bookings_count: earningsBookings.length,
      cancelled_count,
      rejected_count,
    };
  };

  const fetchEarnings = async () => {
    setLoading(true);
    setError(false);
    try {
      const [{ data }, bookingsRes] = await Promise.all([
        getOwnerEarnings().catch(() => ({ data: {} })),
        api.get("/driver/bookings"),
      ]);
      setEarnings(data);
      const bookings = bookingsRes.data?.data || [];
      setAllBookings(bookings);
      const baseStats = computeStatsFromBookings(bookings, { type: "all" });
      setStats(baseStats);
    } catch (err) {
      console.error("Failed to load earnings:", err);
      setError(true);
      toast.error("Failed to load earnings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  useEffect(() => {
    if (!allBookings.length) return;
    const range = {
      type: filterRange,
      from: customFrom,
      to: customTo,
    };
    setStats(computeStatsFromBookings(allBookings, range));
  }, [allBookings, filterRange, customFrom, customTo]);

  if (loading && !earnings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 pt-20 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 rounded-full border-4 border-t-transparent"
          style={{ borderColor: COLORS.tealDim, borderTopColor: COLORS.teal }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
              >
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${COLORS.darkBlue}, ${COLORS.teal})` }}>
                  Balance & Earnings
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total amount, app fees, and your net earnings
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchEarnings}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium border-2 transition-colors"
              style={{ borderColor: COLORS.teal, color: COLORS.teal }}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {error && !earnings ? (
          <Card className="border-2 rounded-2xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Could not load earnings.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchEarnings}
              className="px-5 py-2.5 rounded-xl text-white font-semibold"
              style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
            >
              Try again
            </motion.button>
          </Card>
        ) : earnings ? (
          <>
            {/* Date filter */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Balance range:
              </span>
              {[
                { id: "all", label: "All time" },
                { id: "day", label: "Today" },
                { id: "week", label: "Last 7 days" },
                { id: "month", label: "This month" },
                { id: "custom", label: "Custom" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFilterRange(opt.id)}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition-colors ${
                    filterRange === opt.id
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              {filterRange === "custom" && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <input
                    type="date"
                    className="border rounded-lg px-2 py-1 text-xs sm:text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                  <span className="text-gray-500 dark:text-gray-400">to</span>
                  <input
                    type="date"
                    className="border rounded-lg px-2 py-1 text-xs sm:text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-2 rounded-2xl overflow-hidden shadow-lg h-full" style={{ borderColor: COLORS.tealDim }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl" style={{ background: COLORS.tealDim }}>
                        <DollarSign className="w-6 h-6" style={{ color: COLORS.teal }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total booking amount</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${formatMoney(stats?.total_amount ?? earnings.total_amount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">What clients paid (confirmed + completed)</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-2 rounded-2xl overflow-hidden shadow-lg h-full" style={{ borderColor: COLORS.darkBlueDim }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl" style={{ background: COLORS.darkBlueDim }}>
                        <Percent className="w-6 h-6" style={{ color: COLORS.darkBlue }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">App fees (platform)</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${formatMoney(stats?.app_fees_amount ?? earnings.app_fees_amount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Deducted from you • Fee: {earnings.app_fees_percentage != null ? `${earnings.app_fees_percentage}%` : "—"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-2 rounded-2xl overflow-hidden shadow-lg h-full" style={{ borderColor: COLORS.limeGreenDim }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl" style={{ background: COLORS.limeGreenDim }}>
                        <TrendingUp className="w-6 h-6" style={{ color: COLORS.limeGreen }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Your net earnings</span>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: COLORS.limeGreen }}>
                      ${formatMoney(stats?.net_earnings ?? earnings.net_earnings)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total amount − app fees</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Meta row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 p-4 rounded-2xl border-2 bg-white dark:bg-gray-800/50"
              style={{ borderColor: COLORS.tealDim }}
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5" style={{ color: COLORS.teal }} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  From <strong>{stats?.bookings_count ?? earnings.bookings_count ?? 0}</strong> bookings
                </span>
              </div>
              {earnings.app_fees_percentage != null && (
                <div className="flex items-center gap-2">
                  <Percent className="w-5 h-5" style={{ color: COLORS.darkBlue }} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your app fee: <strong>{earnings.app_fees_percentage}%</strong>
                  </span>
                </div>
              )}
              {stats && (
                <>
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cancelled bookings: <strong>{stats.cancelled_count}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rejected bookings: <strong>{stats.rejected_count}</strong>
                    </span>
                  </div>
                </>
              )}
            </motion.div>

            {/* Link to bookings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <Card
                className="border-2 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all"
                style={{ borderColor: COLORS.tealDim }}
                onClick={() => navigate("/Mycars-bookings")}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ background: COLORS.tealDim }}>
                      <Calendar className="w-5 h-5" style={{ color: COLORS.teal }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">View bookings</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">See amount and app fee per booking</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : null}
      </div>
    </div>
  );
}
