import React, { useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  Zap,
  Gauge,
  Clock,
  LogOut,
  Moon,
  Sun,
  BarChart3,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

Chart.register(...registerables);

export const StatisticPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [charts, setCharts] = useState({});

  // Theme Handler
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

  // Load user
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (stored) setUser(stored);
  }, []);

  // Fetch data
  const fetchStatistics = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/frequent-searches/statistics');
      if (!res.data.success) throw new Error(res.data.message || 'Failed');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Chart Creation – FIXED: No flickering, runs only when data changes
  useEffect(() => {
    if (!data) return;

    const createChart = (id, type, labels, values, colors) => {
      const ctx = document.getElementById(id);
      if (!ctx) return;

      // Destroy old chart
      if (charts[id]) {
        charts[id].destroy();
      }

      const colorArray = Array.isArray(colors) ? colors : [colors];

      const chart = new Chart(ctx, {
        type,
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: colorArray,
            borderColor: colorArray.map(c => c.replace(/0\.\d+/, '1')),
            borderWidth: 2,
            borderRadius: type === 'bar' ? 8 : 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#9ca3af', padding: 20, font: { size: 13 } }
            },
            tooltip: { backgroundColor: 'rgba(0,0,0,0.9)' }
          },
          animation: {
            duration: 1200,
            easing: 'easeOutQuart'
          }
        }
      });

      setCharts(prev => ({ ...prev, [id]: chart }));
    };

    // Colors
    const teal = 'rgba(20, 184, 166, 0.6)';
    const cyan = 'rgba(6, 182, 212, 0.6)';
    const purple = 'rgba(139, 92, 246, 0.6)';
    const orange = 'rgba(249, 115, 22, 0.6)';
    const gray = 'rgba(75, 85, 99, 0.6)';

    // Create all charts
    if (data.by_category)
      createChart('catChart', 'doughnut', data.by_category.map(i => i.category), data.by_category.map(i => i.total), [teal, cyan, purple, orange]);

    if (data.by_make)
      createChart('makeChart', 'bar', data.by_make.map(i => i.make), data.by_make.map(i => i.total), teal);

    if (data.by_drive_type)
      createChart('driveChart', 'pie', data.by_drive_type.map(i => i.drive_type), data.by_drive_type.map(i => i.total), [cyan, purple]);

    if (data.by_transmission)
      createChart('transChart', 'doughnut', data.by_transmission.map(i => i.transmission), data.by_transmission.map(i => i.total), [teal, gray]);

    if (data.top_features)
      createChart('featChart', 'bar', data.top_features.map(i => i.feature), data.top_features.map(i => i.count), purple);

    // Cleanup on unmount
    return () => {
      Object.values(charts).forEach(chart => chart?.destroy?.());
      setCharts({});
    };
  }, [data]); // ← Only run when data changes!

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-900 dark:to-gray-950">

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BarChart3 className="w-8 h-8 text-teal-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Search Analytics
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

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

      <main className="container mx-auto px-6 py-12 max-w-7xl">

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-white/60 dark:bg-gray-900/60">
                <CardContent className="p-6">
                  <div className="h-14 w-14 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-6" />
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Failed to load analytics data
            </p>
            <Button onClick={fetchStatistics} variant="default" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && data && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard icon={Activity} title="Total Searches" value={data.total_searches?.toLocaleString() || 0} gradient="from-teal-500 to-cyan-500" />
              <StatCard icon={TrendingUp} title="Unique Makes" value={data.by_make?.length || 0} gradient="from-purple-500 to-pink-500" />
              <StatCard icon={Zap} title="Top Category" value={data.by_category?.[0]?.category || '—'} gradient="from-emerald-500 to-teal-500" />
              <StatCard icon={Gauge} title="Preferred Transmission" value={data.by_transmission?.[0]?.transmission || '—'} gradient="from-orange-500 to-red-500" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <ChartCard title="Searches by Category" id="catChart" />
              <ChartCard title="Most Popular Makes" id="makeChart" />
              <ChartCard title="Drive Type Distribution" id="driveChart" />
              <ChartCard title="Transmission Preference" id="transChart" />
            </div>

            <ChartCard title="Top Requested Features" id="featChart" fullWidth />

            {/* Recent Searches */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-6 dark:text-white">Recent Search History</h3>
              <Card className="bg-white/80 dark:bg-gray-900/80 shadow-xl rounded-2xl">
                <CardContent className="p-8">
                  {data.recent_searches?.length > 0 ? (
                    data.recent_searches.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex justify-between items-center py-5 border-b border-gray-200 dark:border-gray-700 last:border-0"
                      >
                        <div>
                          <p className="font-semibold text-lg dark:text-white">
                            {s.make || 'Any Make'} {s.model || ''}
                            {s.year_min && ` (${s.year_min}–${s.year_max})`}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(s.last_searched_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-lg px-4 py-2">
                          {s.search_count}×
                        </Badge>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-12 italic">
                      No recent searches yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

// Reusable Components
const StatCard = ({ icon: Icon, title, value, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur shadow-xl rounded-2xl">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} p-3 shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <Badge variant="secondary" className="text-xs">Live</Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-4xl font-bold mt-2 dark:text-white">{value}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const ChartCard = ({ title, id, fullWidth = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
    className={fullWidth ? "lg:col-span-2" : ""}
  >
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur shadow-xl h-96 rounded-2xl overflow-hidden">
      <CardContent className="p-8 h-full flex flex-col">
        <h3 className="text-xl font-bold mb-6 dark:text-white">{title}</h3>
        <div className="flex-1 min-h-0">
          <canvas id={id}></canvas>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);