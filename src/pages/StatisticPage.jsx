import React, { useEffect, useState, useRef } from 'react';
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
  Users,
  Calendar,
  Star,
  Car
} from 'lucide-react';
import { toast } from 'sonner';

Chart.register(...registerables);

// Logo Color Palette
const LOGO_COLORS = {
  darkBlue: '#0E4C81',
  teal: '#008C95',
  limeGreen: '#8AC640',
  black: '#000000'
};

export const StatisticPage = () => {
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState(null);
  const chartsRef = useRef({});

  // Mock data based on user's exact data
  const mockData = {
    success: true,
    data: {
      total_searches: 50,
      unique_users: 4,
      by_category: [
        { category: 'normal', total: 15 },
        { category: 'luxury', total: 8 },
        { category: 'sport', total: 1 }
      ],
      by_make: [
        { make: 'Toyota', total: 13 },
        { make: 'BMW', total: 9 },
        { make: 'Porsche', total: 5 },
        { make: 'Range Rover', total: 2 },
        { make: 'Tesla', total: 2 },
        { make: 'Audi', total: 1 }
      ],
      by_transmission: [
        { transmission: 'automatic', total: 10 },
        { transmission: 'manual', total: 2 }
      ],
      by_fuel_type: [
        { fuel_type: 'benz', total: 10 },
        { fuel_type: 'diesel', total: 9 }
      ],
      recent_searches: [
        {
          id: 1,
          make: null,
          model: null,
          year_min: null,
          year_max: null,
          transmission: null,
          fuel_type: null,
          search_count: 4,
          last_searched_at: '2025-12-17T10:30:26.000Z'
        },
        {
          id: 6,
          make: 'Porsche',
          model: null,
          year_min: 2018,
          year_max: 2025,
          transmission: 'automatic',
          fuel_type: null,
          search_count: 2,
          last_searched_at: '2025-12-15T15:12:19.000Z'
        },
        {
          id: 3,
          make: 'BMW',
          model: 'serie 3',
          year_min: 2023,
          year_max: 2025,
          transmission: 'automatic',
          fuel_type: 'diesel',
          search_count: 2,
          last_searched_at: '2025-12-15T14:44:36.000Z'
        }
      ],
      search_trends: [
        { search_date: '2025-12-15', search_count: 21 },
        { search_date: '2025-12-16', search_count: 11 },
        { search_date: '2025-12-17', search_count: 18 }
      ]
    }
  };

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
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) setUser(storedUser);
    }, []);

  // Chart colors using logo palette
  const chartColors = {
    darkBlue: `${LOGO_COLORS.darkBlue}CC`,
    teal: `${LOGO_COLORS.teal}CC`,
    limeGreen: `${LOGO_COLORS.limeGreen}CC`,
    darkBlueSolid: LOGO_COLORS.darkBlue,
    tealSolid: LOGO_COLORS.teal,
    limeGreenSolid: LOGO_COLORS.limeGreen,
    // Lighter versions for gradient
    darkBlueLight: `${LOGO_COLORS.darkBlue}44`,
    tealLight: `${LOGO_COLORS.teal}44`,
    limeGreenLight: `${LOGO_COLORS.limeGreen}44`
  };

  // Chart Creation with Logo Colors
  useEffect(() => {
    const destroyCharts = () => {
      Object.values(chartsRef.current).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
      chartsRef.current = {};
    };

    const createChart = (id, type, labels, values, colors, options = {}) => {
      const ctx = document.getElementById(id);
      if (!ctx) return;

      const colorArray = Array.isArray(colors) ? colors : [colors];

      const chart = new Chart(ctx, {
        type,
        data: {
          labels,
          datasets: [{
            label: options.label || 'Count',
            data: values,
            backgroundColor: colorArray,
            borderColor: colorArray.map(c => c.replace(/CC$/, 'FF').replace(/44$/, 'FF')),
            borderWidth: 3,
            borderRadius: type === 'bar' ? 12 : 0,
            hoverOffset: type === 'doughnut' || type === 'pie' ? 20 : 0,
            fill: options.fill !== undefined ? options.fill : false,
            tension: options.tension || 0,
            pointRadius: options.pointRadius || 3,
            pointBackgroundColor: options.pointColor || chartColors.limeGreenSolid,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: options.pointHoverRadius || 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: type === 'bar' || type === 'line' ? 'top' : 'bottom',
              labels: {
                color: isDark ? '#9ca3af' : '#4b5563',
                padding: 15,
                font: { size: 12, weight: '600' },
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
              titleColor: isDark ? '#fff' : '#000',
              bodyColor: isDark ? '#e5e7eb' : '#374151',
              borderColor: chartColors.tealSolid,
              borderWidth: 1,
              padding: 12,
              titleFont: { size: 13, weight: 'bold' },
              bodyFont: { size: 12 },
              cornerRadius: 8
            }
          },
          animation: {
            duration: 1200,
            easing: 'easeOutQuart'
          },
          scales: type === 'bar' || type === 'line' ? {
            y: {
              beginAtZero: true,
              grid: {
                color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
              },
              ticks: {
                color: isDark ? '#9ca3af' : '#6b7280',
                font: { size: 11, weight: '600' }
              }
            },
            x: {
              grid: { display: false },
              ticks: {
                color: isDark ? '#9ca3af' : '#6b7280',
                font: { size: 11, weight: '600' }
              }
            }
          } : {}
        }
      });

      chartsRef.current[id] = chart;
    };

    destroyCharts();

    const data = mockData.data;

    // Category Chart - Doughnut
    if (data.by_category?.length > 0) {
      createChart(
        'catChart',
        'doughnut',
        data.by_category.map(i => i.category),
        data.by_category.map(i => i.total),
        [chartColors.darkBlue, chartColors.teal, chartColors.limeGreen]
      );
    }

    // Make Chart - Bar (Top 6)
    if (data.by_make?.length > 0) {
      const topMakes = data.by_make.slice(0, 6);
      createChart(
        'makeChart',
        'bar',
        topMakes.map(i => i.make),
        topMakes.map(i => i.total),
        chartColors.teal
      );
    }

    // Transmission Chart - Pie
    if (data.by_transmission?.length > 0) {
      createChart(
        'transChart',
        'pie',
        data.by_transmission.map(i => i.transmission),
        data.by_transmission.map(i => i.total),
        [chartColors.darkBlue, chartColors.limeGreen]
      );
    }

    // Fuel Type Chart - Doughnut
    if (data.by_fuel_type?.length > 0) {
      createChart(
        'fuelChart',
        'doughnut',
        data.by_fuel_type.map(i => i.fuel_type),
        data.by_fuel_type.map(i => i.total),
        [chartColors.teal, chartColors.limeGreen]
      );
    }

    // Search Trends - Line Chart with Teal Gradient (NOT BLACK)
    if (data.search_trends?.length > 0) {
      const ctx = document.getElementById('trendsChart');
      if (ctx) {
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, chartColors.tealLight);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.search_trends.map(i => new Date(i.search_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [{
              label: 'Daily Searches',
              data: data.search_trends.map(i => i.search_count),
              backgroundColor: gradient,
              borderColor: chartColors.tealSolid,
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 6,
              pointBackgroundColor: chartColors.limeGreenSolid,
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointHoverRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
                titleColor: isDark ? '#fff' : '#000',
                bodyColor: isDark ? '#e5e7eb' : '#374151',
                borderColor: chartColors.tealSolid,
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8
              }
            },
            animation: { duration: 1200, easing: 'easeOutQuart' },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                ticks: {
                  color: isDark ? '#9ca3af' : '#6b7280',
                  font: { size: 11, weight: '600' }
                }
              },
              x: {
                grid: { display: false },
                ticks: {
                  color: isDark ? '#9ca3af' : '#6b7280',
                  font: { size: 11, weight: '600' }
                }
              }
            }
          }
        });
        chartsRef.current['trendsChart'] = chart;
      }
    }

    return () => destroyCharts();
  }, [isDark]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth';
  };

  const data = mockData.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      
      {/* Animated Background Orbs - SMALLER */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/4 -left-1/4 w-1/3 h-1/3 rounded-full blur-3xl"
          style={{ backgroundColor: `${LOGO_COLORS.darkBlue}30` }}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.06, 0.1, 0.06],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/2 -right-1/4 w-1/3 h-1/3 rounded-full blur-3xl"
          style={{ backgroundColor: `${LOGO_COLORS.teal}30` }}
        />
      </div>

      {/* Header - COMPACT */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 md:w-7 md:h-7" style={{ color: LOGO_COLORS.teal }} />
              <div>
                <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-[#0E4C81] via-[#008C95] to-[#8AC640] bg-clip-text text-transparent">
                  Search Analytics
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <Badge variant="outline" className="hidden md:flex items-center gap-2 px-3 py-1" style={{ borderColor: LOGO_COLORS.teal }}>
                  <Users className="w-3 h-3" style={{ color: LOGO_COLORS.teal }} />
                  <span className="text-sm font-semibold">{user?.username ? `, ${user.username}` : ""}!</span>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 h-9 w-9"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 h-9 w-9"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl relative z-10">
        
        {/* KPI Cards - COMPACT */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <StatCard
            icon={Activity}
            title="Total Searches"
            value={data.total_searches?.toLocaleString() || '0'}
            gradient={`linear-gradient(135deg, ${LOGO_COLORS.darkBlue}, ${LOGO_COLORS.teal})`}
            delay={0}
          />
          <StatCard
            icon={Users}
            title="Active Users"
            value={data.unique_users?.toString() || '0'}
            gradient={`linear-gradient(135deg, ${LOGO_COLORS.teal}, ${LOGO_COLORS.limeGreen})`}
            delay={0.1}
          />
          <StatCard
            icon={TrendingUp}
            title="Top Make"
            value={data.by_make?.[0]?.make || '—'}
            subtitle={`${data.by_make?.[0]?.total || 0} searches`}
            gradient={`linear-gradient(135deg, ${LOGO_COLORS.limeGreen}, ${LOGO_COLORS.teal})`}
            delay={0.2}
          />
          <StatCard
            icon={Gauge}
            title="Popular Category"
            value={data.by_category?.[0]?.category || '—'}
            subtitle={`${data.by_category?.[0]?.total || 0} searches`}
            gradient={`linear-gradient(135deg, ${LOGO_COLORS.darkBlue}, ${LOGO_COLORS.limeGreen})`}
            delay={0.3}
          />
        </div>

        {/* Search Trends Line Chart - COMPACT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6 md:mb-8"
        >
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-xl rounded-xl border hover:shadow-2xl transition-all duration-300" style={{ borderColor: `${LOGO_COLORS.teal}40` }}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${LOGO_COLORS.darkBlue}, ${LOGO_COLORS.teal})` }}>
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold dark:text-white">Search Trends</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Daily activity</p>
                  </div>
                </div>
                <Badge className="text-xs px-2 py-1" style={{ backgroundColor: `${LOGO_COLORS.limeGreen}30`, color: LOGO_COLORS.limeGreen }}>
                  Last 3 days
                </Badge>
              </div>
              <div className="h-48 md:h-56">
                <canvas id="trendsChart"></canvas>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Grid - COMPACT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <ChartCard
            title="By Category"
            subtitle="Distribution"
            icon={Car}
            id="catChart"
            delay={0.5}
          />
          <ChartCard
            title="Top Makes"
            subtitle="Most searched"
            icon={Star}
            id="makeChart"
            delay={0.6}
          />
          <ChartCard
            title="Transmission"
            subtitle="Preferences"
            icon={Gauge}
            id="transChart"
            delay={0.7}
          />
          <ChartCard
            title="Fuel Type"
            subtitle="Distribution"
            icon={Zap}
            id="fuelChart"
            delay={0.8}
          />
        </div>

        {/* Recent Searches - COMPACT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-xl rounded-xl border" style={{ borderColor: `${LOGO_COLORS.darkBlue}40` }}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${LOGO_COLORS.darkBlue}, ${LOGO_COLORS.teal})` }}>
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold dark:text-white">Recent Searches</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Latest queries</p>
                </div>
              </div>

              {data.recent_searches?.length > 0 ? (
                <div className="space-y-2">
                  {data.recent_searches.map((search, index) => (
                    <motion.div
                      key={search.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:shadow-md transition-all duration-300 gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-sm md:text-base dark:text-white truncate">
                            {search.make || 'Any Make'} {search.model || ''}
                          </p>
                          {search.year_min && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              {search.year_min}–{search.year_max}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                          {search.transmission && (
                            <span className="flex items-center gap-1">
                              <Gauge className="w-3 h-3" style={{ color: LOGO_COLORS.teal }} />
                              {search.transmission}
                            </span>
                          )}
                          {search.fuel_type && (
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" style={{ color: LOGO_COLORS.limeGreen }} />
                              {search.fuel_type}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(search.last_searched_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <Badge className="self-start md:self-center text-xs md:text-sm px-3 py-1 font-bold" style={{ backgroundColor: `${LOGO_COLORS.teal}30`, color: LOGO_COLORS.teal }}>
                        {search.search_count}×
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 italic py-8 text-sm">No recent searches</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

// Reusable Components - COMPACT
const StatCard = ({ icon: Icon, title, value, subtitle, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ scale: 1.02, y: -3 }}
  >
    <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-lg rounded-xl border-0 hover:shadow-xl transition-all duration-300 h-full">
      <CardContent className="p-3 md:p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-md" style={{ background: gradient }}>
            <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <Badge variant="secondary" className="text-[9px] md:text-[10px] px-1.5 py-0.5">Live</Badge>
        </div>
        <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">{title}</p>
        <p className="text-xl md:text-3xl font-black dark:text-white mb-0.5">{value}</p>
        {subtitle && <p className="text-[9px] md:text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>}
      </CardContent>
    </Card>
  </motion.div>
);

const ChartCard = ({ title, subtitle, icon: Icon, id, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.01 }}
  >
    <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-xl rounded-xl border hover:shadow-2xl transition-all duration-300" style={{ borderColor: `${LOGO_COLORS.teal}40` }}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${LOGO_COLORS.darkBlue}, ${LOGO_COLORS.teal})` }}>
            <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold dark:text-white">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          </div>
        </div>
        <div className="h-48 md:h-56">
          <canvas id={id}></canvas>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);
export default StatisticPage;