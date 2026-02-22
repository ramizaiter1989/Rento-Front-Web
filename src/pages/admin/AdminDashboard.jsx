import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { getOnlineUsers, getMobileAppClicks, getMobileAppClicksChart } from "@/lib/adminApi";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Car, CalendarCheck, DollarSign, Circle, Clock, MousePointerClick } from "lucide-react";
import { formatLastSeen, getLatestLastSeen } from "@/lib/formatLastSeen";

import BookingsOverviewChart from "@/components/admin/BookingsOverviewChart";
import CarsByModelBarChart from "@/components/admin/CarsByModelBarChart";
import MobileAppClicksChart from "@/components/admin/MobileAppClicksChart";
import MobileAppClicksPieChart from "@/components/admin/MobileAppClicksPieChart";

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
  const [onlineCount, setOnlineCount] = useState(null);
  const [onlineUsersList, setOnlineUsersList] = useState([]);
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
        const carsRes = await api.get("/admin/cars", { params: { per_page: 1, page: 1 } });
        const bookingsRes = await api.get("/admin/bookings");
        const paymentsRes = await api.get("/admin/payments");

        const carsData = carsRes.data?.cars ?? carsRes.data;
        const carsTotal = carsData?.total ?? carsRes.data?.meta?.total ?? 0;

        setStats({
          users: usersRes.data?.users?.total ?? 0,
          cars: carsTotal,
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

  useEffect(() => {
    const fetchOnline = async () => {
      try {
        const res = await getOnlineUsers({ minutes: 30 });
        const data = res.data ?? res;
        const list = data?.online_users ?? data?.users ?? data?.data ?? [];
        setOnlineUsersList(Array.isArray(list) ? list : []);
        setOnlineCount(data?.online_users_count ?? (Array.isArray(list) ? list.length : 0));
      } catch {
        setOnlineCount(0);
        setOnlineUsersList([]);
      }
    };
    fetchOnline();
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
  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
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
          {subtitle != null && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Circle className="w-2 h-2 fill-green-500 text-green-500" />
              {subtitle}
            </p>
          )}
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

/* =========================
   MOBILE APP CLICKS
========================= */
const [clicksRaw, setClicksRaw] = useState([]);
const [clicksPeriod, setClicksPeriod] = useState("day");
const [clicksChartData, setClicksChartData] = useState([]);
const [clicksByStore, setClicksByStore] = useState({ playstore: 0, appstore: 0 });
const [clicksTotalCount, setClicksTotalCount] = useState(0);
const [clicksLoading, setClicksLoading] = useState(true);
const [clicksListLoading, setClicksListLoading] = useState(true);
const [clicksApiAvailable, setClicksApiAvailable] = useState(null);
const [clicksDateRange, setClicksDateRange] = useState({
  from: (() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d;
  })(),
  to: new Date(),
});

const getDaysBack = () => {
  if (clicksPeriod === "day") return 7;
  if (clicksPeriod === "week") return 28;
  return 30;
};

useEffect(() => {
  const fetchChart = async () => {
    try {
      setClicksLoading(true);
      setClicksApiAvailable(null);
      const res = await getMobileAppClicksChart({
        period: clicksPeriod,
        days_back: getDaysBack(),
      });
      setClicksApiAvailable(true);
      const data = res.data ?? res;
      const series = data.series ?? data.data?.series ?? [];
      const byStore = data.by_store ?? data.data?.by_store ?? { playstore: 0, appstore: 0 };
      const total = data.total_clicks ?? data.data?.total_clicks ?? 0;
      setClicksChartData(Array.isArray(series) ? series : []);
      setClicksByStore(typeof byStore === "object" ? byStore : { playstore: 0, appstore: 0 });
      setClicksTotalCount(typeof total === "number" ? total : 0);
    } catch (err) {
      setClicksApiAvailable(err.response?.status === 404 ? false : null);
      if (err.response?.status !== 404) {
        console.error("Clicks chart error", err);
      }
      setClicksChartData([]);
      setClicksByStore({ playstore: 0, appstore: 0 });
      setClicksTotalCount(0);
    } finally {
      setClicksLoading(false);
    }
  };
  fetchChart();
}, [clicksPeriod]);

useEffect(() => {
  const fetchList = async () => {
    try {
      setClicksListLoading(true);
      const res = await getMobileAppClicks({
        date_from: formatDate(clicksDateRange.from),
        date_to: formatDate(clicksDateRange.to),
        per_page: 100,
      });
      const root = res.data ?? res;
      const payload = root.clicks ?? root.data?.clicks ?? root.data ?? root;
      const raw = payload?.data ?? (Array.isArray(payload) ? payload : []);
      setClicksRaw(Array.isArray(raw) ? raw : []);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Clicks list error", err);
      }
      setClicksRaw([]);
    } finally {
      setClicksListLoading(false);
    }
  };
  fetchList();
}, [clicksDateRange.from, clicksDateRange.to]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users}
          icon={Users}
          color="bg-blue-500"
          subtitle={onlineCount !== null ? `Online now: ${onlineCount}` : undefined}
        />
        <StatCard title="Total Cars" value={stats.cars} icon={Car} color="bg-[#00A19C]" />
        <StatCard title="Total Bookings" value={stats.bookings} icon={CalendarCheck} color="bg-purple-500" />
        <StatCard title="Total Revenue" value={`$${stats.revenue}`} icon={DollarSign} color="bg-green-500" />
      </div>

      {/* ONLINE USERS (under Total Users) */}
      {onlineUsersList.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Circle className="w-4 h-4 fill-green-500 text-green-500" />
              Online Users ({onlineCount})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[240px] overflow-y-auto">
              {onlineUsersList.slice(0, 12).map((u) => {
                const lastSeen = getLatestLastSeen(u);
                const displayName = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || `User #${u.id}`;
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3 bg-muted/30"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">@{u.username} • {u.role}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      {formatLastSeen(lastSeen)}
                    </div>
                  </div>
                );
              })}
            </div>
            {onlineUsersList.length > 12 && (
              <p className="text-xs text-muted-foreground mt-2">+{onlineUsersList.length - 12} more</p>
            )}
          </CardContent>
        </Card>
      )}

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

{/* MOBILE APP CLICKS */}
<Card>
  <CardContent className="p-6 space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <MousePointerClick className="w-5 h-5" />
        Mobile App Store Clicks
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={clicksPeriod}
          onChange={(e) => setClicksPeriod(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm bg-background"
        >
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={formatDate(clicksDateRange.from)}
            onChange={(e) =>
              setClicksDateRange((p) => ({ ...p, from: new Date(e.target.value) }))
            }
            className="border rounded-md px-2 py-1 text-sm"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="date"
            value={formatDate(clicksDateRange.to)}
            onChange={(e) =>
              setClicksDateRange((p) => ({ ...p, to: new Date(e.target.value) }))
            }
            className="border rounded-md px-2 py-1 text-sm"
          />
        </div>
      </div>
    </div>

    {clicksApiAvailable === false && (
      <p className="text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
        API not found (404). Ensure the backend exposes <code className="text-xs bg-amber-100 dark:bg-amber-900/50 px-1 rounded">GET /api/admin/mobile-app-clicks</code> and <code className="text-xs bg-amber-100 dark:bg-amber-900/50 px-1 rounded">GET /api/admin/mobile-app-clicks/chart</code>.
      </p>
    )}

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 h-[300px]">
        {clicksLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading chart...
          </div>
        ) : clicksChartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <span>No click data</span>
            {clicksApiAvailable === true && (
              <span className="text-xs">Clicks are recorded when users tap Play Store / App Store links.</span>
            )}
          </div>
        ) : (
          <div className="h-full">
            <p className="text-xs text-muted-foreground mb-1">Timeline</p>
            <MobileAppClicksChart data={clicksChartData} />
          </div>
        )}
      </div>
      <div className="h-[260px] lg:h-[300px]">
        {clicksLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Loading...
          </div>
        ) : (clicksByStore?.playstore || clicksByStore?.appstore) > 0 ? (
          <>
            <p className="text-xs text-muted-foreground mb-1">By store</p>
            <MobileAppClicksPieChart byStore={clicksByStore} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
            <span>No store breakdown yet</span>
          </div>
        )}
      </div>
    </div>

    {(clicksByStore?.playstore || clicksByStore?.appstore || clicksTotalCount) > 0 && (
      <p className="text-sm text-muted-foreground">
        Total: {clicksTotalCount} — Play Store: {clicksByStore?.playstore ?? 0} · App Store: {clicksByStore?.appstore ?? 0}
      </p>
    )}

    <div>
      <h3 className="text-sm font-semibold mb-3">Clickers list (date range below)</h3>
      <div className="overflow-x-auto rounded-md border max-h-[320px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Store</th>
              <th className="text-left p-3">IP</th>
              <th className="text-left p-3">City</th>
              <th className="text-left p-3">Country</th>
            </tr>
          </thead>
          <tbody>
            {clicksListLoading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : clicksRaw.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No clicks recorded
                </td>
              </tr>
            ) : (
              [...clicksRaw]
                .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                .map((c) => (
                  <tr key={c.id || `${c.created_at}-${c.ip}`} className="border-t hover:bg-muted/30">
                    <td className="p-3">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          (c.store || "").includes("ios")
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {(c.store || "").toLowerCase().includes("app") ? "App Store" : "Play Store"}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">{c.ip || "—"}</td>
                    <td className="p-3">{c.city || "—"}</td>
                    <td className="p-3">
                      {c.country_name || c.country || c.country_code || "—"}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </CardContent>
</Card>

    </div>
  );
};

export default AdminDashboard;
