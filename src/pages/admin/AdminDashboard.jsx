import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Car, CalendarCheck, DollarSign } from "lucide-react";

import BookingsOverviewChart from "@/components/admin/BookingsOverviewChart";
import CarsByModelBarChart from "@/components/admin/CarsByModelBarChart";

/* =====================================================
   HELPERS
===================================================== */
const formatDate = (date) => date.toISOString().split("T")[0];

/* =====================================================
   BUILD BOOKINGS CHART DATA
===================================================== */
const buildBookingsChartData = (bookings, period, dateRange) => {
  const map = {};
  const now = new Date();

  const safeInc = (obj, key) => {
    if (!obj[key]) obj[key] = 0;
    obj[key]++;
  };

  /* =========================
     DAILY (FROM → TO)
  ========================== */
  if (period === "day") {
    const current = new Date(dateRange.from);
    const end = new Date(dateRange.to);

    // Create empty days
    while (current <= end) {
      const key = formatDate(current);
      map[key] = {
        label: current.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
      };
      current.setDate(current.getDate() + 1);
    }

    bookings.forEach((b) => {
      if (!b.start_datetime) return;
      const key = formatDate(new Date(b.start_datetime));
      if (!map[key]) return;

      map[key].total++;
      safeInc(map[key], b.booking_request_status);
    });

    return Object.values(map);
  }

  /* =========================
     WEEK (LAST 7 DAYS)
  ========================== */
  if (period === "week") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = formatDate(d);

      map[key] = {
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
      };
    }

    bookings.forEach((b) => {
      if (!b.start_datetime) return;
      const key = formatDate(new Date(b.start_datetime));
      if (!map[key]) return;

      map[key].total++;
      safeInc(map[key], b.booking_request_status);
    });

    return Object.values(map);
  }

  /* =========================
     MONTH (CURRENT YEAR)
  ========================== */
  if (period === "month") {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    months.forEach((m) => {
      map[m] = {
        label: m,
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
      };
    });

    bookings.forEach((b) => {
      if (!b.start_datetime) return;
      const d = new Date(b.start_datetime);
      if (d.getFullYear() !== now.getFullYear()) return;

      const month = d.toLocaleString("en-US", { month: "short" });
      map[month].total++;
      safeInc(map[month], b.booking_request_status);
    });

    return months.map((m) => map[m]);
  }

  /* =========================
     YEAR
  ========================== */
  bookings.forEach((b) => {
    if (!b.start_datetime) return;
    const year = new Date(b.start_datetime).getFullYear();

    if (!map[year]) {
      map[year] = {
        label: String(year),
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
      };
    }

    map[year].total++;
    safeInc(map[year], b.booking_request_status);
  });

  return Object.values(map).sort(
    (a, b) => Number(a.label) - Number(b.label)
  );
};

/* =====================================================
   COMPONENT
===================================================== */
const AdminDashboard = () => {
  /* =========================
     STATS
  ========================== */
  const [stats, setStats] = useState({
    users: 0,
    cars: 0,
    bookings: 0,
    revenue: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  /* =========================
     CHART
  ========================== */
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 29);

  const [chartPeriod, setChartPeriod] = useState("day");
  const [dateRange, setDateRange] = useState({
    from: thirtyDaysAgo,
    to: today,
  });

  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);

  /* =========================
     FETCH STATS
  ========================== */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);

        const usersRes = await api.get("/admin/users");
        const carsRes = await api.get("/cars");
        const bookingsRes = await api.get("/admin/bookings");
        const paymentsRes = await api.get("/admin/payments");

        setStats({
          users: usersRes.data?.users?.total ?? 0,
          cars:
            carsRes.data?.cars?.total ??
            carsRes.data?.total ??
            0,
          bookings:
            bookingsRes.data?.bookings?.total ??
            bookingsRes.data?.total ??
            0,
          revenue:
            paymentsRes.data?.total_revenue ??
            paymentsRes.data?.revenue ??
            0,
        });
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  /* =========================
     FETCH CHART
  ========================== */
  useEffect(() => {
    const fetchChart = async () => {
      try {
        setLoadingChart(true);

        const res = await api.get("/admin/bookings");
        const bookings = res?.data?.bookings?.data || [];

        const data = buildBookingsChartData(
          bookings,
          chartPeriod,
          dateRange
        );

        setChartData(data);
      } catch (err) {
        console.error("Chart error:", err);
        setChartData([]);
      } finally {
        setLoadingChart(false);
      }
    };

    fetchChart();
  }, [chartPeriod, dateRange]);

  /* =========================
     STAT CARD
  ========================== */
  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h2 className="text-2xl font-bold">
            {loadingStats ? "—" : value}
          </h2>
        </div>
      </CardContent>
    </Card>
  );




  /* =====================================================
   BUILD CARS BAR CHART DATA (NEW – ISOLATED)
===================================================== */
const buildCarsBarChartData = (cars, type) => {
  const map = {};

  cars.forEach((car) => {
    const key =
      type === "make"
        ? car.make || "Unknown"
        : car.model || "Unknown";

    map[key] = (map[key] || 0) + 1;
  });

  return Object.entries(map)
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count);
};



/* =========================
   CARS BAR CHART (NEW)
========================= */
// Cars distribution
const [carsRaw, setCarsRaw] = useState([]);
const [selectedMake, setSelectedMake] = useState("");
const [selectedModel, setSelectedModel] = useState("");
const [carsChartData, setCarsChartData] = useState([]);


useEffect(() => {
  const fetchCars = async () => {
    try {
      const res = await api.get("admin/cars");
      setCarsRaw(res.data?.cars?.data || res.data?.cars || []);
    } catch (err) {
      console.error("Cars fetch error", err);
    }
  };

  fetchCars();
}, []);



const getAllModels = (cars) =>
  [...new Set(cars.map((c) => c.model).filter(Boolean))];

const getAllMakes = (cars) =>
  [...new Set(cars.map((c) => c.make).filter(Boolean))].sort();


const buildCarsChartData = (cars, make, model) => {
  let filtered = [...cars];

  if (model) filtered = filtered.filter((c) => c.model === model);
  if (make) filtered = filtered.filter((c) => c.make === make);

  const map = {};

  filtered.forEach((c) => {
    let key;

    if (model && make) key = `${c.make} ${c.model}`;
    else if (model) key = c.make;
    else if (make) key = c.model;
    else key = c.make;

    if (!key) return;
    map[key] = (map[key] || 0) + 1;
  });

  return Object.entries(map).map(([label, count]) => ({
    label,
    count,
  }));
};

const getModelsByMake = (cars, make) => {
  const filtered = make
    ? cars.filter((c) => c.make === make)
    : cars;

  return [...new Set(filtered.map((c) => c.model).filter(Boolean))].sort();
};

useEffect(() => {
  setSelectedModel("");
}, [selectedMake]);



useEffect(() => {
  const data = buildCarsChartData(
    carsRaw,
    selectedMake,
    selectedModel
  );
  setCarsChartData(data);
}, [carsRaw, selectedMake, selectedModel]);



  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.users} icon={Users} color="bg-blue-500" />
        <StatCard title="Total Cars" value={stats.cars} icon={Car} color="bg-[#00A19C]" />
        <StatCard title="Total Bookings" value={stats.bookings} icon={CalendarCheck} color="bg-purple-500" />
        <StatCard title="Total Revenue" value={`$${stats.revenue}`} icon={DollarSign} color="bg-green-500" />
      </div>

      {/* BOOKING OVERVIEW */}
<Card>
  <CardContent className="p-6 space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <h2 className="text-lg font-semibold">Booking Overview</h2>

      {/* Controls */}
      <div className="flex flex-col gap-3 min-w-[160px]">
        {/* Period selector */}
        <select
          value={chartPeriod}
          onChange={(e) => setChartPeriod(e.target.value)}
          className="border rounded-md px-3 py-1 text-sm bg-background"
        >
          <option value="day">Daily</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>

        {/* Date range (ONLY for Daily) */}
        {chartPeriod === "day" && (
          <div className="flex flex-col gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                From
              </label>
              <input
                type="date"
                value={formatDate(dateRange.from)}
                onChange={(e) =>
                  setDateRange((p) => ({
                    ...p,
                    from: new Date(e.target.value),
                  }))
                }
                className="border rounded-md px-2 py-1 text-sm w-full"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                To
              </label>
              <input
                type="date"
                value={formatDate(dateRange.to)}
                onChange={(e) =>
                  setDateRange((p) => ({
                    ...p,
                    to: new Date(e.target.value),
                  }))
                }
                className="border rounded-md px-2 py-1 text-sm w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Chart */}
    <div className="w-full h-[320px]">
      {loadingChart ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading chart data...
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No booking data
        </div>
      ) : (
        <BookingsOverviewChart data={chartData} />
      )}
    </div>
  </CardContent>
</Card>

{/* CARS Chart  */}
<Card>
  <CardContent className="p-6 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-lg font-semibold">Cars Distribution</h2>

      <div className="flex flex-wrap gap-2">
        {/* MAKE FIRST */}
        <select
          value={selectedMake}
          onChange={(e) => setSelectedMake(e.target.value)}
          className="border rounded-md px-3 py-1 text-sm bg-background"
        >
          <option value="">All Makes</option>
          {getAllMakes(carsRaw).map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>

        {/* MODEL DEPENDS ON MAKE */}
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="border rounded-md px-3 py-1 text-sm bg-background"
          disabled={!carsRaw.length}
        >
          <option value="">All Models</option>
          {getModelsByMake(carsRaw, selectedMake).map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* BAR CHART */}
    <div className="h-[300px] w-full">
      {carsChartData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No car data
        </div>
      ) : (
        <CarsByModelBarChart data={carsChartData} />
      )}
    </div>
  </CardContent>
</Card>




    </div>
  );
};

export default AdminDashboard;
