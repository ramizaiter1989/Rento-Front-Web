import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, CalendarCheck, Settings, Wallet, Bell, LogOut, Car, AlertCircle, 
  TrendingUp, Clock, Menu, Moon, Sun, ChevronRight, Activity, 
  DollarSign, Eye, Zap, ArrowUpRight, ArrowDownRight,
  CheckCircle2, XCircle, Timer, MapPin, MousePointerClick, Users
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

// Logo Color Palette
const COLORS = {
  darkBlue: '#0E4C81',
  teal: '#008C95',
  limeGreen: '#8AC640'
};

export default function EnhancedDashboard() {
  const navigate = useNavigate();

  // =============================
  // STATE
  // =============================
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalCars: 0,
    activeBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    totalViews: 0,
    totalSearches: 0,
    avgViewsPerCar: 0,
    topViewedCar: null,
    topSearchedCar: null
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [topPerformingCars, setTopPerformingCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // =============================
  // THEME HANDLER
  // =============================
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  // =============================
  // FETCH DASHBOARD DATA
  // =============================
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(false);

    try {
      const [carsRes, bookingsRes] = await Promise.all([
        api.get('/cars/agent/Mycars'),
        api.get('/driver/bookings')
      ]);

      const carsData = carsRes.data.cars?.data || [];
      const bookingsData = bookingsRes.data.data || [];

      // Calculate total views and searches
      const totalViews = carsData.reduce((sum, car) => sum + (car.views_count || 0), 0);
      const totalSearches = carsData.reduce((sum, car) => sum + (car.search_count || 0), 0);
      const avgViewsPerCar = carsData.length > 0 ? Math.round(totalViews / carsData.length) : 0;

      // Find top viewed and searched cars
      const topViewedCar = carsData.reduce((max, car) => 
        (car.views_count || 0) > (max?.views_count || 0) ? car : max
      , carsData[0]);

      const topSearchedCar = carsData.reduce((max, car) => 
        (car.search_count || 0) > (max?.search_count || 0) ? car : max
      , carsData[0]);

      // Calculate bookings stats
      const activeBookings = bookingsData.filter(b =>
        ['pending', 'confirmed', 'arrived', 'started'].includes(b.booking_request_status)
      );

      const pendingBookings = bookingsData.filter(b => b.booking_request_status === 'pending');
      const confirmedBookings = bookingsData.filter(b => b.booking_request_status === 'confirmed');

      // Calculate revenue from confirmed bookings
      const totalRevenue = bookingsData
        .filter(b => b.booking_request_status === 'confirmed')
        .reduce((sum, b) => sum + parseFloat(b.total_booking_price || 0), 0);

      setStats({
        totalCars: carsRes.data.cars?.total || carsData.length,
        activeBookings: activeBookings.length,
        pendingBookings: pendingBookings.length,
        confirmedBookings: confirmedBookings.length,
        totalRevenue: totalRevenue,
        totalViews: totalViews,
        totalSearches: totalSearches,
        avgViewsPerCar: avgViewsPerCar,
        topViewedCar: topViewedCar,
        topSearchedCar: topSearchedCar
      });

      // Top performing cars (by views and searches)
      const topCars = [...carsData]
        .sort((a, b) => (b.views_count + b.search_count * 2) - (a.views_count + a.search_count * 2))
        .slice(0, 3)
        .map(car => ({
          id: car.id,
          name: `${car.make} ${car.model}`,
          image: car.main_image_url,
          views: car.views_count || 0,
          searches: car.search_count || 0,
          dailyRate: car.daily_rate,
          category: car.car_category
        }));

      setTopPerformingCars(topCars);

      // Recent activity from bookings
      const activity = bookingsData
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8)
        .map(b => {
          const statusMessages = {
            'pending': 'New booking request received',
            'confirmed': 'Booking confirmed',
            'cancelled': 'Booking cancelled',
            'completed': 'Trip completed successfully',
            'arrived': 'Driver arrived',
            'started': 'Ride in progress'
          };

          const carName = b.car ? `${b.car.make} ${b.car.model}` : 'Unknown Car';
          const clientName = b.client ? `${b.client.first_name} ${b.client.last_name}` : 'Unknown Client';
          const status = statusMessages[b.booking_request_status] || 'Status updated';

          return {
            message: status,
            car: carName,
            client: clientName,
            time: new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(b.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            status: b.booking_request_status,
            amount: b.total_booking_price,
            location: b.pickup_location || 'N/A'
          };
        });

      setRecentActivity(activity.length ? activity : [
        { message: "No recent activity", time: "—", isEmpty: true }
      ]);

    } catch (err) {
      console.error("Dashboard error:", err);
      setError(true);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
    fetchDashboardData();
  }, []);

  // =============================
  // LOGOUT
  // =============================
  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch {}
    localStorage.clear();
    navigate('/auth');
  };

  // =============================
  // QUICK ACTIONS
  // =============================
  const quickActions = [
    { 
      title: "Add New Car", 
      icon: Plus, 
      href: "/add-car", 
      color: COLORS.teal,
      description: "List a new vehicle"
    },
    { 
      title: "My Fleet", 
      icon: Car, 
      href: "/Mycars", 
      color: COLORS.darkBlue,
      description: "Manage your cars"
    },
    { 
      title: "Bookings", 
      icon: CalendarCheck, 
      href: "/Mycars-bookings", 
      color: COLORS.limeGreen,
      description: "View all bookings"
    },
    { 
      title: "Analytics", 
      icon: TrendingUp, 
      href: "/statistic", 
      color: COLORS.teal,
      description: "View statistics"
    },
  ];

  // =============================
  // STATUS CONFIG
  // =============================
  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        color: 'bg-amber-500', 
        icon: Timer, 
        label: 'Pending',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-600 dark:text-amber-400'
      },
      confirmed: { 
        color: 'bg-blue-500', 
        icon: CheckCircle2, 
        label: 'Confirmed',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-600 dark:text-blue-400'
      },
      cancelled: { 
        color: 'bg-gray-500', 
        icon: XCircle, 
        label: 'Cancelled',
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-600 dark:text-gray-400'
      },
      completed: { 
        color: 'bg-emerald-500', 
        icon: CheckCircle2, 
        label: 'Completed',
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-600 dark:text-emerald-400'
      },
      arrived: { 
        color: 'bg-cyan-500', 
        icon: MapPin, 
        label: 'Arrived',
        bgColor: 'bg-cyan-500/10',
        textColor: 'text-cyan-600 dark:text-cyan-400'
      },
      started: { 
        color: 'bg-purple-500', 
        icon: Zap, 
        label: 'In Progress',
        bgColor: 'bg-purple-500/10',
        textColor: 'text-purple-600 dark:text-purple-400'
      }
    };
    return configs[status] || configs.pending;
  };

  // =============================
  // ANIMATIONS
  // =============================
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } }
  };

  // =============================
  // STATS CARDS DATA
  // =============================
  const statsCards = [
    { 
      title: "Total Fleet", 
      value: stats.totalCars, 
      icon: Car, 
      color: COLORS.darkBlue,
      change: `${stats.totalCars} vehicles`,
      changeType: "neutral",
      description: "Active listings"
    },
    { 
      title: "Total Views", 
      value: stats.totalViews.toLocaleString(), 
      icon: Eye, 
      color: COLORS.teal,
      change: `${stats.avgViewsPerCar} avg/car`,
      changeType: "neutral",
      description: "All time views"
    },
    { 
      title: "Searches", 
      value: stats.totalSearches, 
      icon: MousePointerClick, 
      color: COLORS.limeGreen,
      change: "Search interest",
      changeType: "neutral",
      description: "Search appearances"
    },
    { 
      title: "Active Bookings", 
      value: stats.activeBookings, 
      icon: Activity, 
      color: COLORS.teal,
      change: `${stats.confirmedBookings} confirmed`,
      changeType: "neutral",
      description: "Ongoing rentals"
    },
  ];

  // =============================
  // JSX
  // =============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">

      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.1, 0.06] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -left-1/4 w-1/3 h-1/3 rounded-full blur-3xl"
          style={{ backgroundColor: `${COLORS.darkBlue}30` }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.08, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 -right-1/4 w-1/3 h-1/3 rounded-full blur-3xl"
          style={{ backgroundColor: `${COLORS.teal}30` }}
        />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8">
                  <Menu className="w-4 h-4" />
                </Button>
              </motion.div>
              
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent" style={{
                  backgroundImage: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal}, ${COLORS.limeGreen})`
                }}>
                  Welcome back{user?.username ? `, ${user.username}` : ""}!
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                  Your fleet performance dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              
              {/* Notifications */}
              <div className="relative">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative h-8 w-8" 
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="w-4 h-4" />
                    {stats.pendingBookings > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: COLORS.teal }}
                      >
                        {stats.pendingBookings}
                      </motion.span>
                    )}
                  </Button>
                </motion.div>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                    >
                      <div className="p-3 text-white" style={{
                        background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal})`
                      }}>
                        <h3 className="font-bold text-base">Notifications</h3>
                        <p className="text-xs opacity-90">{stats.pendingBookings} pending actions</p>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {recentActivity.slice(0, 5).map((item, i) => {
                          const config = getStatusConfig(item.status);
                          return (
                            <div key={i} className="p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <div className="flex items-start gap-2">
                                <div className={`w-7 h-7 rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}>
                                  <config.icon className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{item.message}</p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{item.car}</p>
                                  {item.amount && <p className="text-[10px] font-semibold" style={{ color: COLORS.teal }}>${item.amount}</p>}
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{item.date} at {item.time}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-gray-800/50">
                        <Button 
                          variant="ghost" 
                          className="w-full text-xs h-8"
                          style={{ color: COLORS.teal }}
                          onClick={() => navigate('/Mycars-bookings')}
                        >
                          View All Bookings
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex">
                  <Settings className="w-4 h-4" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl relative z-10">

        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[1,2,3,4].map(i => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-3 md:p-4">
                    <div className="animate-pulse space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-6 w-14 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Error */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Dashboard</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Please try again.</p>
            <Button 
              onClick={fetchDashboardData}
              className="text-white"
              style={{ background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal})` }}
            >
              <Activity className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </motion.div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {statsCards.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-900">
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                      style={{ backgroundColor: stat.color }}
                    />
                    
                    <CardContent className="p-3 md:p-4 relative">
                      <div className="flex justify-between items-start mb-2">
                        <div 
                          className="w-9 h-9 md:w-10 md:h-10 rounded-lg p-2 shadow-md group-hover:scale-110 transition-transform duration-300"
                          style={{ backgroundColor: stat.color }}
                        >
                          <stat.icon className="w-full h-full text-white" />
                        </div>
                        
                        <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold
                          ${stat.changeType === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                          ${stat.changeType === 'neutral' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        `}>
                          {stat.change}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-[10px] md:text-xs font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                          {stat.value}
                        </p>
                        <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-500">{stat.description}</p>
                      </div>

                      <div 
                        className="absolute -bottom-2 -right-2 w-20 h-20 rounded-full blur-2xl opacity-5 group-hover:opacity-20 transition-opacity duration-300"
                        style={{ backgroundColor: stat.color }}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Manage your fleet</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {quickActions.map((action, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <a href={action.href} className="block group">
                      <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 h-full">
                        <div 
                          className="absolute inset-0 opacity-5 group-hover:opacity-15 transition-opacity duration-300"
                          style={{ backgroundColor: action.color }}
                        />
                        
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </div>

                        <CardContent className="p-4 md:p-6 text-center relative">
                          <div className="relative mb-3 inline-block">
                            <div 
                              className="w-12 h-12 md:w-14 md:h-14 rounded-xl p-3 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300"
                              style={{ backgroundColor: action.color }}
                            >
                              <action.icon className="w-full h-full text-white" />
                            </div>
                            <div 
                              className="absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                              style={{ backgroundColor: action.color }}
                            />
                          </div>

                          <h4 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-1">
                            {action.title}
                          </h4>
                          <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">{action.description}</p>

                          <div 
                            className="mt-2 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0"
                            style={{ color: action.color }}
                          >
                            <span className="text-xs font-semibold">Go</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            {/* Top Performing Cars */}
            {topPerformingCars.length > 0 && (
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Top Performing Cars</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Most viewed and searched</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  {topPerformingCars.map((car, i) => (
                    <motion.div
                      key={car.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      whileHover={{ y: -4 }}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0">
                        <CardContent className="p-0">
                          <div className="relative h-32 bg-gray-100 dark:bg-gray-800">
                            <img 
                              src={`/api/storage/${car.image}`}
                              alt={car.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <Badge 
                              className="absolute top-2 right-2 text-white border-0"
                              style={{ backgroundColor: COLORS.teal }}
                            >
                              {car.category}
                            </Badge>
                          </div>
                          <div className="p-3">
                            <h4 className="font-bold text-sm mb-2 text-gray-900 dark:text-white truncate">{car.name}</h4>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1" style={{ color: COLORS.teal }}>
                                <Eye className="w-3 h-3" />
                                <span className="font-semibold">{car.views}</span>
                              </div>
                              <div className="flex items-center gap-1" style={{ color: COLORS.limeGreen }}>
                                <MousePointerClick className="w-3 h-3" />
                                <span className="font-semibold">{car.searches}</span>
                              </div>
                              <div className="font-bold" style={{ color: COLORS.darkBlue }}>
                                ${car.dailyRate}/day
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            {/* Performance Summary */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Revenue Card */}
                <Card 
                  className="overflow-hidden border-0 shadow-lg text-white"
                  style={{ background: `linear-gradient(to bottom right, ${COLORS.teal}, ${COLORS.limeGreen})` }}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs font-medium mb-1 opacity-90">Total Revenue</p>
                        <h3 className="text-3xl md:text-4xl font-bold">${stats.totalRevenue.toFixed(2)}</h3>
                      </div>
                      <div className="w-11 h-11 md:w-12 md:h-12 rounded-lg bg-white/20 backdrop-blur-sm p-2.5">
                        <DollarSign className="w-full h-full" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-semibold">
                        <TrendingUp className="w-2.5 h-2.5" />
                        {stats.confirmedBookings} confirmed bookings
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex items-center justify-between text-xs">
                        <span className="opacity-90">Pending bookings</span>
                        <span className="font-bold">{stats.pendingBookings}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Visibility Card */}
                <Card 
                  className="overflow-hidden border-0 shadow-lg text-white"
                  style={{ background: `linear-gradient(to bottom right, ${COLORS.darkBlue}, ${COLORS.teal})` }}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs font-medium mb-1 opacity-90">Fleet Visibility</p>
                        <h3 className="text-3xl md:text-4xl font-bold">{stats.totalViews}</h3>
                      </div>
                      <div className="w-11 h-11 md:w-12 md:h-12 rounded-lg bg-white/20 backdrop-blur-sm p-2.5">
                        <Eye className="w-full h-full" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="opacity-90">Total searches</span>
                        <span className="font-bold">{stats.totalSearches}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="opacity-90">Avg per vehicle</span>
                        <span className="font-bold">{stats.avgViewsPerCar} views</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-semibold">
                          <MousePointerClick className="w-2.5 h-2.5" />
                          Top: {stats.topViewedCar?.make} {stats.topViewedCar?.model}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

          </motion.div>
        )}

                    {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Latest bookings</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/Mycars-bookings')}
                  className="hidden sm:flex text-xs h-8"
                >
                  View All
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>

              <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900">
                <CardContent className="p-0">
                  {recentActivity.map((item, i) => {
                    const config = getStatusConfig(item.status);
                    const StatusIcon = config.icon;

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                      >
                        <div className="p-3 md:p-4 flex items-center gap-3">
                          <div className={`flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-lg ${config.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                            <StatusIcon className={`w-4 h-4 md:w-5 md:h-5 ${config.textColor}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                              <p className={`text-xs md:text-sm font-semibold ${item.isEmpty ? 'italic text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                                {item.message}
                              </p>
                              <Badge className={`${config.bgColor} ${config.textColor} border-0 flex-shrink-0 text-[10px] px-2 py-0.5`}>
                                {config.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                              {!item.isEmpty && (
                                <>
                                  <span className="flex items-center gap-1">
                                    <Car className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                    <span className="truncate max-w-[100px]">{item.car}</span>
                                  </span>
                                  {item.amount && (
                                    <span className="font-bold" style={{ color: COLORS.teal }}>
                                      ${item.amount}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                    {item.date} {item.time}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {!item.isEmpty && (
                            <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 hidden md:block" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
      </main>
    </div>
  );
}