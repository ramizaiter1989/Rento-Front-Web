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

  const fetchEarnings = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await getOwnerEarnings();
      setEarnings(data);
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
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">${formatMoney(earnings.total_amount)}</p>
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
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">${formatMoney(earnings.app_fees_amount)}</p>
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
                    <p className="text-3xl font-bold" style={{ color: COLORS.limeGreen }}>${formatMoney(earnings.net_earnings)}</p>
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
                  From <strong>{earnings.bookings_count ?? 0}</strong> bookings
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
