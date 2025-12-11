import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Plus, CalendarCheck, Settings, Bell, LogOut, Car, AlertCircle, TrendingUp, Clock, Menu, Moon, Sun
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
    completedToday: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

      setStats({
        totalCars: carsRes.data.cars?.total || carsData.length,
        activeBookings: activeBookings.length,
        pendingBookings: pendingBookings.length,
        completedToday: completedToday.length
      });

      const activity = bookingsData
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(b => {
          const statusMessages = {
            'pending': 'New booking request',
            'accepted': 'Booking accepted',
            'declined': 'Booking declined',
            'cancelled': 'Booking cancelled',
            'completed': 'Booking completed',
            'arrived': 'Driver arrived at pickup',
            'started': 'Ride started'
          };

          const carName = b.car ? `${b.car.make} ${b.car.model}` : 'Unknown Car';
          const status = statusMessages[b.booking_request_status] || 'Status updated';

          return {
            message: `${status}: ${carName}`,
            time: new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: b.booking_request_status
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
    { title: "Add New Car", icon: Plus, href: "/add-car", gradient: "from-teal-500 to-cyan-500" },
    { title: "My Cars", icon: Car, href: "/Mycars", gradient: "from-indigo-500 to-purple-500" },
    { title: "View Bookings", icon: CalendarCheck, href: "/Mycars-bookings", gradient: "from-blue-500 to-cyan-500" },
    { title: "Settings", icon: Settings, href: "/settings", gradient: "from-gray-600 to-gray-800" },
  ];

  const statsCards = [
    { title: "Total Cars Listed", value: stats.totalCars, icon: Car, color: "from-teal-500 to-cyan-500" },
    { title: "Active Bookings", value: stats.activeBookings, icon: CalendarCheck, color: "from-blue-500 to-cyan-500" },
    { title: "Pending Approvals", value: stats.pendingBookings, icon: AlertCircle, color: "from-orange-500 to-red-500" },
    { title: "Completed Today", value: stats.completedToday, icon: TrendingUp, color: "from-green-500 to-emerald-500" },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      accepted: 'bg-blue-500',
      declined: 'bg-red-500',
      cancelled: 'bg-gray-500',
      completed: 'bg-green-500',
      arrived: 'bg-cyan-500',
      started: 'bg-purple-500'
    };
    return colors[status] || 'bg-gray-300';
  };

  // =============================
  // JSX
  // =============================
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-900 dark:to-gray-950">

      {/* HEADER */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              {user?.username ? `${user.username}'s Dashboard` : "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative" aria-label="Open notifications">
              <Bell className="w-5 h-5" />
              {stats.pendingBookings > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {stats.pendingBookings}
                </span>
              )}
            </Button>

            {/* Dark Mode */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Log out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-6 py-12 max-w-7xl">

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1,2,3,4].map(i => (
              <Card key={i} className="animate-pulse bg-white/60 dark:bg-gray-900/60">
                <CardContent className="p-6">
                  <div className="h-14 w-14 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
                  <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-8 w-1/3 bg-gray-400 dark:bg-gray-600 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">Could not load data.</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              Retry
            </Button>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {statsCards.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="shadow-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} p-3`}>
                          <stat.icon className="w-8 h-8 text-white" />
                        </div>
                        <Badge>Live</Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-4xl font-bold dark:text-white">{stat.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <h3 className="text-2xl font-bold mb-6 dark:text-white">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {quickActions.map((action, i) => (
                <motion.a
                  href={action.href}
                  key={i}
                  whileHover={{ scale: 1.05, y: -6 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="block"
                >
                  <Card className="relative overflow-hidden rounded-3xl shadow-lg">
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-20`}></div>
                    <CardContent className="p-10 text-center relative z-10">
                      <div className={`w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${action.gradient} p-5`}>
                        <action.icon className="w-10 h-10 text-white" />
                      </div>
                      <h4 className="text-xl font-bold dark:text-white">{action.title}</h4>
                    </CardContent>
                  </Card>
                </motion.a>
              ))}
            </div>

            {/* Recent Activity */}
            <h3 className="text-2xl font-bold mb-6 dark:text-white">Recent Activity</h3>
            <Card className="bg-white/80 dark:bg-gray-900/80 shadow-xl rounded-2xl">
              <CardContent className="p-8 space-y-6">
                {recentActivity.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 border-b pb-4 last:border-none"
                  >
                    <div className={`w-3 h-3 rounded-full ${item.isEmpty ? 'bg-gray-400' : getStatusColor(item.status)}`}></div>
                    <p className={`flex-1 ${item.isEmpty ? 'italic text-gray-500' : 'text-gray-800 dark:text-gray-300'}`}>
                      {item.message}
                    </p>
                    <p className="flex items-center gap-2 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {item.time}
                    </p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
