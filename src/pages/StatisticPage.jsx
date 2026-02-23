import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Car,
  MapPin,
  DollarSign,
  Tag,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { getSearchStatistics } from '@/lib/api';

Chart.register(...registerables);

// Human-readable labels for API values (per Frequent Search Statistics API docs)
const CATEGORY_LABELS = { normal: 'Normal', sport: 'Sport', luxury: 'Luxury', hatchback: 'Hatchback', commercial: 'Commercial', industrial: 'Industrial', event: 'Event', sea: 'Sea' };
const DRIVE_TYPE_LABELS = { '4x4': '4x4 / AWD', '2_front': 'Front Wheel', '2_back': 'Rear Wheel', autoblock: 'Autoblock' };
const TRANSMISSION_LABELS = { automatic: 'Automatic', manual: 'Manual' };
const FUEL_TYPE_LABELS = { benz: 'Gasoline', diesel: 'Diesel', electric: 'Electric', hybrid: 'Hybrid' };

// Logo Color Palette
const LOGO_COLORS = {
  darkBlue: '#0E4C81',
  teal: '#008C95',
  limeGreen: '#8AC640',
  black: '#000000'
};

// Date filter presets: { key, label, period, period_value } or { key, label, custom: true }
const DATE_PRESETS = [
  { key: '7d', label: 'Last 7 days', period: 'days', period_value: 7 },
  { key: '30d', label: 'Last 30 days', period: 'days', period_value: 30 },
  { key: '3m', label: 'Last 3 months', period: 'months', period_value: 3 },
  { key: '12m', label: 'Last 12 months', period: 'months', period_value: 12 },
  { key: 'all', label: 'All time', period: null, period_value: null }
];

function buildStatisticsParams(presetKey, customFrom, customTo) {
  if (presetKey === 'custom' && customFrom && customTo) {
    return { date_from: customFrom, date_to: customTo };
  }
  const preset = DATE_PRESETS.find(p => p.key === presetKey);
  if (!preset || preset.key === 'all' || !preset.period) return {};
  return { period: preset.period, period_value: preset.period_value };
}

/** Format search_trends date for display (Y-m-d = day, Y-m = month, YYYY-Www = week) */
function formatTrendDate(dateStr) {
  if (!dateStr) return '';
  if (dateStr.length === 10) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (dateStr.length === 7) {
    const [y, m] = dateStr.split('-');
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  if (dateStr.match(/^\d{4}-\d{1,2}$/)) {
    const [y, w] = dateStr.split('-');
    return `Week ${w}, ${y}`;
  }
  return dateStr;
}

export const StatisticPage = () => {
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [filterApplied, setFilterApplied] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [datePreset, setDatePreset] = useState('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const chartsRef = useRef({});

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

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = buildStatisticsParams(datePreset, customFrom, customTo);
      const response = await getSearchStatistics(params);

      if (response.data?.success) {
        setData(response.data.data ?? null);
        setFilterApplied(response.data.filter_applied ?? null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Statistics fetch error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load statistics';
      setError(msg);
      toast.error(msg);
      if (err.response?.status === 401) {
        toast.error('Please log in to view statistics');
      }
    } finally {
      setLoading(false);
    }
  }, [datePreset, customFrom, customTo]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Chart colors using logo palette
  const chartColors = {
    darkBlue: `${LOGO_COLORS.darkBlue}CC`,
    teal: `${LOGO_COLORS.teal}CC`,
    limeGreen: `${LOGO_COLORS.limeGreen}CC`,
    darkBlueSolid: LOGO_COLORS.darkBlue,
    tealSolid: LOGO_COLORS.teal,
    limeGreenSolid: LOGO_COLORS.limeGreen,
    darkBlueLight: `${LOGO_COLORS.darkBlue}44`,
    tealLight: `${LOGO_COLORS.teal}44`,
    limeGreenLight: `${LOGO_COLORS.limeGreen}44`
  };

  // Chart Creation with Logo Colors
  useEffect(() => {
    if (!data) return;

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
          indexAxis: options.indexAxis || 'x',
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

    // Category Chart - Doughnut
    if (data.by_category?.length > 0) {
      createChart(
        'catChart',
        'doughnut',
        data.by_category.map(i => CATEGORY_LABELS[i.category] || i.category),
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
        data.by_transmission.map(i => TRANSMISSION_LABELS[i.transmission] || i.transmission),
        data.by_transmission.map(i => i.total),
        [chartColors.darkBlue, chartColors.limeGreen]
      );
    }

    // Fuel Type Chart - Doughnut
    if (data.by_fuel_type?.length > 0) {
      createChart(
        'fuelChart',
        'doughnut',
        data.by_fuel_type.map(i => FUEL_TYPE_LABELS[i.fuel_type] || i.fuel_type),
        data.by_fuel_type.map(i => i.total),
        [chartColors.teal, chartColors.limeGreen]
      );
    }

    // Drive Type Chart - Doughnut
    if (data.by_drive_type?.length > 0) {
      createChart(
        'driveChart',
        'doughnut',
        data.by_drive_type.map(i => DRIVE_TYPE_LABELS[i.drive_type] || i.drive_type),
        data.by_drive_type.map(i => i.total),
        [chartColors.darkBlue, chartColors.teal, chartColors.limeGreen]
      );
    }

    // City Chart - Bar (top cities)
    if (data.by_city?.length > 0) {
      const topCities = data.by_city.slice(0, 10);
      createChart(
        'cityChart',
        'bar',
        topCities.map(i => i.city),
        topCities.map(i => i.total),
        chartColors.teal
      );
    }

    // Price Range Chart - Horizontal bar (better for long labels)
    if (data.by_price_range?.length > 0) {
      const priceData = data.by_price_range.slice(0, 8);
      const labels = priceData.map(r =>
        r.daily_rate_max != null
          ? (r.daily_rate_min != null ? `$${r.daily_rate_min}-$${r.daily_rate_max}` : `Up to $${r.daily_rate_max}`)
          : 'Any'
      );
      createChart(
        'priceChart',
        'bar',
        labels,
        priceData.map(r => r.total),
        chartColors.limeGreen,
        { indexAxis: 'y' }
      );
    }

    // Search Trends - Line Chart with Teal Gradient
    if (data.search_trends?.length > 0) {
      const ctx = document.getElementById('trendsChart');
      if (ctx) {
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, chartColors.tealLight);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.search_trends.map(i => formatTrendDate(i.date)),
            datasets: [{
              label: 'Daily Searches',
              data: data.search_trends.map(i => i.total),
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
  }, [isDark, data]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: LOGO_COLORS.teal, borderTopColor: 'transparent' }}></div>
          <p className="text-gray-600 dark:text-gray-400">Loading statistics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} style={{ backgroundColor: LOGO_COLORS.teal }}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      
      {/* Animated Background Orbs */}
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

      {/* Header */}
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
                  <span className="text-sm font-semibold">{user?.username || 'User'}</span>
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
        
        {/* Date filter: presets + custom range + active label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            {DATE_PRESETS.filter(p => !p.custom).map((p) => (
              <Button
                key={p.key}
                variant={datePreset === p.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDatePreset(p.key)}
                style={datePreset === p.key ? { backgroundColor: LOGO_COLORS.teal } : {}}
              >
                {p.label}
              </Button>
            ))}
            <Button
              variant={datePreset === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDatePreset('custom')}
              style={datePreset === 'custom' ? { backgroundColor: LOGO_COLORS.teal } : {}}
            >
              Custom
            </Button>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 dark:text-gray-400">Range:</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1.5"
              />
              <span className="text-gray-500">–</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1.5"
              />
              <Button
                size="sm"
                onClick={() => setDatePreset('custom')}
                disabled={!customFrom || !customTo}
                style={{ backgroundColor: LOGO_COLORS.darkBlue }}
              >
                Apply
              </Button>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {filterApplied?.label ?? 'All time'}
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <StatCard
            icon={Activity}
            title="Total Searches"
            value={data.total_searches?.toLocaleString() ?? '0'}
            gradient={`linear-gradient(135deg, ${LOGO_COLORS.darkBlue}, ${LOGO_COLORS.teal})`}
            delay={0}
          />
          <StatCard
            icon={Users}
            title="Active Users"
            value={data.total_users?.toString() ?? '0'}
            subtitle={Number(data.total_users) > 0 ? `~${Math.round(Number(data.total_searches) / Number(data.total_users))} avg searches` : undefined}
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
            value={CATEGORY_LABELS[data.by_category?.[0]?.category] || data.by_category?.[0]?.category || '—'}
            subtitle={`${data.by_category?.[0]?.total || 0} searches`}
            gradient={`linear-gradient(135deg, ${LOGO_COLORS.darkBlue}, ${LOGO_COLORS.limeGreen})`}
            delay={0.3}
          />
        </div>

        {/* Search Trends Line Chart */}
        {data.search_trends?.length > 0 && (
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
                    {filterApplied?.label ?? (data.search_trends.length ? `${data.search_trends.length} points` : '')}
                  </Badge>
                </div>
                <div className="h-48 md:h-56">
                  <canvas id="trendsChart"></canvas>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {data.by_category?.length > 0 && (
            <ChartCard
              title="By Category"
              subtitle="Distribution"
              icon={Car}
              id="catChart"
              delay={0.5}
            />
          )}
          {data.by_make?.length > 0 && (
            <ChartCard
              title="Top Makes"
              subtitle="Most searched"
              icon={Star}
              id="makeChart"
              delay={0.6}
            />
          )}
          {data.by_transmission?.length > 0 && (
            <ChartCard
              title="Transmission"
              subtitle="Preferences"
              icon={Gauge}
              id="transChart"
              delay={0.7}
            />
          )}
          {data.by_fuel_type?.length > 0 && (
            <ChartCard
              title="Fuel Type"
              subtitle="Distribution"
              icon={Zap}
              id="fuelChart"
              delay={0.8}
            />
          )}
          {data.by_drive_type?.length > 0 && (
            <ChartCard
              title="Drive Type"
              subtitle="Distribution"
              icon={Gauge}
              id="driveChart"
              delay={0.85}
            />
          )}
          {data.by_city?.length > 0 && (
            <ChartCard
              title="Top Cities"
              subtitle="Most searched"
              icon={MapPin}
              id="cityChart"
              delay={0.9}
            />
          )}
          {data.by_price_range?.length > 0 && (
            <ChartCard
              title="Price Range"
              subtitle="Searches by daily rate"
              icon={DollarSign}
              id="priceChart"
              delay={0.92}
            />
          )}
        </div>

        {/* Price range & Top features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {data.by_price_range?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.95 }}
            >
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-xl rounded-xl border" style={{ borderColor: `${LOGO_COLORS.teal}40` }}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${LOGO_COLORS.darkBlue}, ${LOGO_COLORS.teal})` }}>
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold dark:text-white">By Price Range</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Daily rate ranges</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 font-semibold dark:text-white">Range</th>
                          <th className="text-right py-2 font-semibold dark:text-white">Searches</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.by_price_range.map((row, i) => {
                          const maxTotal = Math.max(...(data.by_price_range?.map(r => r.total) || [1]));
                          const pct = maxTotal > 0 ? (row.total / maxTotal) * 100 : 0;
                          const label = row.daily_rate_min != null && row.daily_rate_max != null
                            ? `$${row.daily_rate_min} – $${row.daily_rate_max}`
                            : row.daily_rate_max != null
                              ? `Up to $${row.daily_rate_max}`
                              : 'Any';
                          return (
                            <tr key={i} className="border-b border-gray-100 dark:border-gray-800 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="py-2.5 text-gray-700 dark:text-gray-300 font-medium">{label}</td>
                              <td className="py-2.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-20 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${pct}%` }}
                                      transition={{ duration: 0.6, delay: 0.1 * i }}
                                      className="h-full rounded-full"
                                      style={{ backgroundColor: LOGO_COLORS.teal }}
                                    />
                                  </div>
                                  <span className="font-semibold dark:text-white w-8 text-right">{row.total}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {data.top_features?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-xl rounded-xl border" style={{ borderColor: `${LOGO_COLORS.darkBlue}40` }}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${LOGO_COLORS.teal}, ${LOGO_COLORS.limeGreen})` }}>
                      <Tag className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold dark:text-white">Top Features</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Popular options</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.top_features.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * i }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Badge
                          variant="secondary"
                          className="text-xs px-3 py-1 cursor-default"
                          style={{ backgroundColor: `${LOGO_COLORS.teal}20`, color: LOGO_COLORS.darkBlue }}
                        >
                          {item.feature ?? item.name ?? 'Feature'} ({item.count ?? item.total ?? 0})
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Most active users */}
        {data.most_active_users?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.05 }}
            className="mb-6 md:mb-8"
          >
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-xl rounded-xl border" style={{ borderColor: `${LOGO_COLORS.limeGreen}40` }}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${LOGO_COLORS.limeGreen}, ${LOGO_COLORS.teal})` }}>
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold dark:text-white">Most Active Users</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Top searchers</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 font-semibold dark:text-white">User</th>
                        <th className="text-right py-2 font-semibold dark:text-white">Searches</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.most_active_users.map((row, idx) => {
                        const maxSearches = data.most_active_users?.[0]?.total_searches || 1;
                        const pct = (row.total_searches / maxSearches) * 100;
                        return (
                          <motion.tr
                            key={row.user_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * idx }}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="py-2.5 text-gray-700 dark:text-gray-300 font-medium">{row.user_name ?? `User #${row.user_id}`}</td>
                            <td className="py-2.5">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.5, delay: 0.1 * idx }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: idx === 0 ? LOGO_COLORS.limeGreen : LOGO_COLORS.teal }}
                                  />
                                </div>
                                <span className="font-bold dark:text-white w-10 text-right">{row.total_searches}</span>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Searches */}
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
                            {[search.make, search.model].filter(Boolean).join(' ') || 'Any criteria'}
                          </p>
                          {search.year_min != null && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              {search.year_min}–{search.year_max ?? '—'}
                            </Badge>
                          )}
                          {search.user_name && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">by {search.user_name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                          {search.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" style={{ color: LOGO_COLORS.teal }} />
                              {search.city}
                            </span>
                          )}
                          {(search.daily_rate_min != null || search.daily_rate_max != null) && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {search.daily_rate_min ?? '—'} – {search.daily_rate_max ?? '—'}
                            </span>
                          )}
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
                            {search.last_searched_at ? new Date(search.last_searched_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '—'}
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

// Reusable Components
const StatCard = ({ icon: Icon, title, value, subtitle, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ scale: 1.03, y: -4 }}
    whileTap={{ scale: 0.98 }}
  >
    <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-lg rounded-xl border-0 hover:shadow-2xl hover:border-teal-500/30 transition-all duration-300 h-full cursor-default">
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