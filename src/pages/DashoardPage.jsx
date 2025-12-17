import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, CalendarCheck, Settings, Wallet, Bell, LogOut, Car, AlertCircle, 
  TrendingUp, Clock, Menu, Moon, Sun, ChevronRight, Activity, 
  DollarSign, Eye, BarChart3, Zap, ArrowUpRight, ArrowDownRight,
  CheckCircle2, XCircle, Timer, MapPin
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function DashboardPage() {
  const navigate = useNavigate();

  // =============================
  // USER STATE
  // =============================
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  // =============================
  // DASHBOARD STATS
  // =============================
  const [stats, setStats] = useState({
    totalCars: 0,
    activeBookings: 0,
    pendingBookings: 0,
    completedToday: 0,
    revenue: 0,
    viewsToday: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // =============================
  // THEME HANDLER
  // =============================
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);

    if (shouldBeDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
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

      const today = new Date().toISOString().split('T')[0];

      const activeBookings = bookingsData.filter(b =>
        ['pending', 'accepted', 'arrived', 'started'].includes(b.booking_request_status)
      );

      const pendingBookings = bookingsData.filter(b => b.booking_request_status === 'pending');

      const completedToday = bookingsData.filter(b => {
        const bookingDate = new Date(b.updated_at).toISOString().split('T')[0];
        return b.booking_request_status === 'completed' && bookingDate === today;
      });

      // Mock data for revenue and views (replace with real API data)
      const revenue = completedToday.length * 150; // Example calculation
      const viewsToday = Math.floor(Math.random() * 500) + 100;

      setStats({
        totalCars: carsRes.data.cars?.total || carsData.length,
        activeBookings: activeBookings.length,
        pendingBookings: pendingBookings.length,
        completedToday: completedToday.length,
        revenue: revenue,
        viewsToday: viewsToday
      });

      const activity = bookingsData
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8)
        .map(b => {
          const statusMessages = {
            'pending': 'New booking request received',
            'accepted': 'Booking confirmed',
            'declined': 'Booking declined',
            'cancelled': 'Booking cancelled by user',
            'completed': 'Trip completed successfully',
            'arrived': 'Driver arrived at pickup location',
            'started': 'Ride in progress'
          };

          const carName = b.car ? `${b.car.make} ${b.car.model}` : 'Unknown Car';
          const status = statusMessages[b.booking_request_status] || 'Status updated';

          return {
            message: status,
            car: carName,
            time: new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(b.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            status: b.booking_request_status,
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
  // QUICK ACTIONS & STATS CARDS
  // =============================
  const quickActions = [
    { 
      title: "Add New Car", 
      icon: Plus, 
      href: "/add-car", 
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      description: "List a new vehicle"
    },
    { 
      title: "My Fleet", 
      icon: Car, 
      href: "/Mycars", 
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      description: "Manage your cars"
    },
    { 
      title: "Bookings", 
      icon: CalendarCheck, 
      href: "/Mycars-bookings", 
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      description: "View all bookings"
    },
    { 
      title: "Wallet", 
      icon: Wallet, 
      href: "/wallet", 
      gradient: "from-amber-500 via-orange-500 to-red-500",
      description: "Manage earnings"
    },
  ];

  const statsCards = [
    { 
      title: "Total Fleet", 
      value: stats.totalCars, 
      icon: Car, 
      gradient: "from-violet-500 to-purple-600",
      change: "+2",
      changeType: "up",
      description: "Active vehicles"
    },
    { 
      title: "Active Rides", 
      value: stats.activeBookings, 
      icon: Activity, 
      gradient: "from-blue-500 to-cyan-600",
      change: `${stats.activeBookings}`,
      changeType: "neutral",
      description: "Ongoing bookings"
    },
    { 
      title: "Pending", 
      value: stats.pendingBookings, 
      icon: Timer, 
      gradient: "from-amber-500 to-orange-600",
      change: "Needs action",
      changeType: stats.pendingBookings > 0 ? "alert" : "neutral",
      description: "Awaiting approval"
    },
    { 
      title: "Today's Revenue", 
      value: `$${stats.revenue}`, 
      icon: DollarSign, 
      gradient: "from-emerald-500 to-teal-600",
      change: "+12%",
      changeType: "up",
      description: `${stats.completedToday} completed`
    },
  ];

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        color: 'bg-amber-500', 
        icon: Timer, 
        label: 'Pending',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-600 dark:text-amber-400'
      },
      accepted: { 
        color: 'bg-blue-500', 
        icon: CheckCircle2, 
        label: 'Accepted',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-600 dark:text-blue-400'
      },
      declined: { 
        color: 'bg-red-500', 
        icon: XCircle, 
        label: 'Declined',
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-600 dark:text-red-400'
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
  // ANIMATION VARIANTS
  // =============================
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  // =============================
  // JSX
  // =============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">

            {/* Left: Logo & Welcome */}
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </motion.div>
              
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 dark:from-violet-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Welcome back{user?.username ? `, ${user.username}` : ""}!
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                  Here's what's happening with your fleet today
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              
              {/* Notifications */}
              <div className="relative">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative hover:bg-violet-50 dark:hover:bg-violet-950/30" 
                    onClick={() => setShowNotifications(!showNotifications)}
                    aria-label="Open notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {stats.pendingBookings > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                      >
                        {stats.pendingBookings}
                      </motion.span>
                    )}
                  </Button>
                </motion.div>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                    >
                      <div className="p-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                        <h3 className="font-bold text-lg">Notifications</h3>
                        <p className="text-sm opacity-90">{stats.pendingBookings} pending actions</p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {recentActivity.slice(0, 5).map((item, i) => {
                          const config = getStatusConfig(item.status);
                          return (
                            <div key={i} className="p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}>
                                  <config.icon className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.message}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.car}</p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{item.date} at {item.time}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50">
                        <Button 
                          variant="ghost" 
                          className="w-full text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                          onClick={() => navigate('/Mycars-bookings')}
                        >
                          View All Bookings
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dark Mode */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="hover:bg-violet-50 dark:hover:bg-violet-950/30"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
              </motion.div>

              {/* Settings */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-violet-50 dark:hover:bg-violet-950/30 hidden sm:flex"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </motion.div>

              {/* Logout */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400"
                  aria-label="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Actions Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-8">
                    <div className="animate-pulse space-y-4">
                      <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto"></div>
                      <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">We couldn't fetch your data. Please try again.</p>
            <Button 
              onClick={fetchDashboardData}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
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
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-0 bg-white dark:bg-gray-900">
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
                    <CardContent className="p-6 relative">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} p-2.5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <stat.icon className="w-full h-full text-white" />
                        </div>
                        
                        {/* Change Indicator */}
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
                          ${stat.changeType === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                          ${stat.changeType === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                          ${stat.changeType === 'alert' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                          ${stat.changeType === 'neutral' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        `}>
                          {stat.changeType === 'up' && <ArrowUpRight className="w-3 h-3" />}
                          {stat.changeType === 'down' && <ArrowDownRight className="w-3 h-3" />}
                          {stat.change}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{stat.description}</p>
                      </div>

                      {/* Decorative Element */}
                      <div className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-300`}></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your fleet efficiently</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <a href={action.href} className="block group">
                      <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 h-full">
                        {/* Animated Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-5 group-hover:opacity-15 transition-opacity duration-300`}></div>
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </div>

                        <CardContent className="p-8 text-center relative">
                          {/* Icon */}
                          <div className="relative mb-5 inline-block">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.gradient} p-4 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                              <action.icon className="w-full h-full text-white" />
                            </div>
                            {/* Glow Effect */}
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${action.gradient} blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                          </div>

                          {/* Text */}
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-violet-600 group-hover:to-purple-600 transition-all duration-300">
                            {action.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>

                          {/* Arrow Icon */}
                          <div className="mt-4 flex items-center justify-center gap-2 text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <span className="text-sm font-semibold">Go</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Latest updates from your fleet</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/Mycars-bookings')}
                  className="hover:bg-violet-50 dark:hover:bg-violet-950/30 border-violet-200 dark:border-violet-800 hidden sm:flex"
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-gray-900">
                <CardContent className="p-0">
                  {recentActivity.map((item, i) => {
                    const config = getStatusConfig(item.status);
                    const StatusIcon = config.icon;

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                      >
                        <div className="p-5 flex items-center gap-4">
                          {/* Status Indicator */}
                          <div className={`relative flex-shrink-0 w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                            <StatusIcon className={`w-6 h-6 ${config.textColor}`} />
                            <div className={`absolute inset-0 rounded-xl ${config.color} opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300`}></div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-1">
                              <p className={`text-sm font-semibold ${item.isEmpty ? 'italic text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                                {item.message}
                              </p>
                              <Badge className={`${config.bgColor} ${config.textColor} border-0 flex-shrink-0`}>
                                {config.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              {!item.isEmpty && (
                                <>
                                  <span className="flex items-center gap-1">
                                    <Car className="w-3 h-3" />
                                    {item.car}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {item.date} at {item.time}
                                  </span>
                                  {item.location && item.location !== 'N/A' && (
                                    <span className="flex items-center gap-1 truncate">
                                      <MapPin className="w-3 h-3" />
                                      {item.location}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          {!item.isEmpty && (
                            <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance Insights (Optional Section) */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Earnings Overview */}
                <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <p className="text-emerald-100 text-sm font-medium mb-2">Today's Earnings</p>
                        <h3 className="text-4xl font-bold">${stats.revenue}</h3>
                      </div>
                      <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm p-3">
                        <DollarSign className="w-full h-full" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold">
                        <TrendingUp className="w-3 h-3" />
                        +12% from yesterday
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-emerald-100">Completed rides</span>
                        <span className="font-bold">{stats.completedToday}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fleet Status */}
                <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 text-white">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <p className="text-violet-100 text-sm font-medium mb-2">Fleet Status</p>
                        <h3 className="text-4xl font-bold">{stats.totalCars}</h3>
                      </div>
                      <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm p-3">
                        <Car className="w-full h-full" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-violet-100">Active rides</span>
                        <span className="font-bold">{stats.activeBookings} vehicles</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-violet-100">Available</span>
                        <span className="font-bold">{stats.totalCars - stats.activeBookings} vehicles</span>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/20">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold">
                          <Eye className="w-3 h-3" />
                          {stats.viewsToday} views today
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

          </motion.div>
        )}
      </main>
    </div>
  );
}