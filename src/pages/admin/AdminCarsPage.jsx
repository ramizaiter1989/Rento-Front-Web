import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/axios";
<<<<<<< HEAD
import { getCars, getCar, updateCar, updateCarPhoto, updateCarAcceptReject, downloadCarImage, deleteCar as deleteCarApi } from "@/lib/adminApi";
=======
import { getCars, getCar, updateCar, updateCarPhoto, updateCarAcceptReject, downloadCarImage, deleteCar as deleteCarApi, getAgencies } from "@/lib/adminApi";
>>>>>>> d7f0598ba238695ac2bb6c17afb46754360d3df2
import {
  Search,
  Car,
  Download,
  Check,
  X,
  Eye,
  Trash2,
  Edit,
  ChevronLeft,
<<<<<<< HEAD
  ChevronRight
=======
  ChevronRight,
  MapPin,
  Navigation,
  Building2,
>>>>>>> d7f0598ba238695ac2bb6c17afb46754360d3df2
} from "lucide-react";


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
// Start Tony Update
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// End Tony Update
const PER_PAGE = 20;

// Lebanese governorates / regions for address dropdown (same as Add Car)
const ADDRESS_OPTIONS = [
  { label: "Select region...", value: "" },
  { label: "Beirut", value: "Beirut" },
  { label: "Mount Lebanon", value: "Mount Lebanon" },
  { label: "North", value: "North" },
  { label: "South", value: "South" },
  { label: "Bekaa", value: "Bekaa" },
  { label: "Baalbek", value: "Baalbek" },
  { label: "Keserwan", value: "Keserwan" },
  { label: "Nabatieh", value: "Nabatieh" },
  { label: "Akkar", value: "Akkar" },
];

function parseGoogleMapsLink(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const atMatch = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  const qMatch = trimmed.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  const llMatch = trimmed.match(/(?:!3d|!4d|!1d)(-?\d+\.?\d*)/g);
  if (llMatch && llMatch.length >= 2) {
    const lat = parseFloat(llMatch[0].replace(/\D/g, ""));
    const lng = parseFloat(llMatch[1].replace(/\D/g, ""));
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
}
const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "available", label: "Available" },
  { value: "not_available", label: "Not Available" },
  { value: "rented", label: "Rented" },
  { value: "maintenance", label: "Maintenance" },
];
const CAR_ACCEPTED_OPTIONS = [
  { value: "all", label: "All" },
  { value: "true", label: "Accepted" },
  { value: "false", label: "Not Accepted" },
];
const IS_PRIVATE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "true", label: "Private" },
  { value: "false", label: "Public" },
];

const AdminCarsPage = () => {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: PER_PAGE, total: 0 });
  const [loading, setLoading] = useState(true);


  // server-side filters (API params)
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [carAcceptedFilter, setCarAcceptedFilter] = useState("all");
  const [isPrivateFilter, setIsPrivateFilter] = useState("all");
  const [agentIdFilter, setAgentIdFilter] = useState("");
  const [agents, setAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync agent_id from URL (e.g. from Agencies page click)
  useEffect(() => {
    const agentId = searchParams.get("agent_id");
    if (agentId != null && agentId !== "") {
      setAgentIdFilter(agentId);
    }
  }, [searchParams]);

  // Load agencies list once for agent-name dropdown filter
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await getAgencies({
          per_page: 500,
          sort_by: "username",
          sort_order: "asc",
        });
        const payload = res.data?.agencies ?? res.data;
        const data = payload?.data ?? [];
        setAgents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load agencies for cars filter", err);
      }
    };
    fetchAgents();
  }, []);

  // client-side filters (in-memory on current page)
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState([]);
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Start Tony Update
  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");

  const { toast } = useToast();
  const [editingCar, setEditingCar] = useState(null);
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

  const [rateFrom, setRateFrom] = useState("");
  const [rateTo, setRateTo] = useState("");



//agent logo helper
  const DEFAULT_AGENT_LOGO = "/avatar.png";

const getAgentLogo = (agent) => {
  if (!agent?.profile_picture) return DEFAULT_AGENT_LOGO;

  if (agent.profile_picture.startsWith("http")) {
    return agent.profile_picture;
  }

  const cleaned = agent.profile_picture.startsWith("/")
    ? agent.profile_picture.slice(1)
    : agent.profile_picture;

  return `${storageBase}${cleaned}`;
};


  // End Tony Update
  /* ============================
     Fetch cars (server-side filters + pagination)
  ============================ */
  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        per_page: PER_PAGE,
        page,
        ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
        ...(carAcceptedFilter && carAcceptedFilter !== "all" && { car_accepted: carAcceptedFilter }),
        ...(isPrivateFilter && isPrivateFilter !== "all" && { is_private: isPrivateFilter }),
        ...(agentIdFilter && { agent_id: Number(agentIdFilter) }),
        // ...(searchQuery && searchQuery.trim() && { search: searchQuery.trim() }),
      };
      const res = await getCars(params);
      const data = res.data || res;
      const list = Array.isArray(data.cars) ? data.cars : data.cars?.data ?? [];
      const pagination = data.meta || (data.cars && { total: data.cars.total, current_page: data.cars.current_page ?? page, last_page: data.cars.last_page ?? 1, per_page: data.cars.per_page ?? PER_PAGE }) || meta;
      setCars(list);
      setMeta((m) => ({ ...m, ...pagination, total: pagination.total ?? m.total, current_page: pagination.current_page ?? page, last_page: pagination.last_page ?? m.last_page, per_page: pagination.per_page ?? PER_PAGE }));
    } catch (err) {
      if (err.response?.status === 403) {
        toast({ title: "Access denied", description: "Super admin access required", variant: "destructive" });
      } else if (err.response?.status === 401) {
        toast({ title: "Unauthorized", description: "Please log in again", variant: "destructive" });
      } else {
        console.error("Failed to load cars", err);
        toast({ title: "Error", description: "Failed to load cars", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, carAcceptedFilter, isPrivateFilter, agentIdFilter, searchQuery]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Fetch car details (single car). Returns full car or null on error.
  const fetchCarDetails = async (id) => {
    try {
      const res = await getCar(id);
      const data = res.data || res;
      return data?.car ?? data ?? null;
    } catch (error) {
      if (error.response?.status === 403) {
        toast({ title: "Access denied", description: "Super admin access required", variant: "destructive" });
      } else if (error.response?.status === 404) {
        toast({ title: "Full details unavailable", description: "Showing list data (GET /admin/cars/{id} returned 404).", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to fetch car details", variant: "destructive" });
      }
      return null;
    }
  };

  // Open view modal: show list car immediately, then try to load full details in background
  const openViewCar = (listCar) => {
    setSelectedItem(listCar);
    setModalType("view-car");
    setModalOpen(true);
    fetchCarDetails(listCar.id).then((full) => {
      if (full) setSelectedItem(full);
    });
  };

  // Open edit modal: show list car immediately, then try to load full details in background.
  // When full details arrive, merge into current state so we don't overwrite user's in-progress edits (focus loss).
  const openEditCar = (listCar) => {
    setSelectedItem(listCar);
    setEditingCar({ ...listCar });
    setModalType("edit-car");
    setModalOpen(true);
    fetchCarDetails(listCar.id).then((full) => {
      if (full) {
        setSelectedItem(full);
        setEditingCar((prev) => (prev && prev.id === full.id ? { ...full, ...prev } : { ...full }));
      }
    });
  };

  const FALLBACK_IMG = "/car-avatar.png";

  // Car images: /api/storage/{database-url} — display and download from this URI
  const storageBase = useMemo(() => {
    const base = import.meta.env.VITE_API_URL || "";
    if (!base) return "/api/storage/";
    const b = base.trim().replace(/\/+$/, "").replace(/\/api\/api\/?$/, "");
    return `${b}/api/storage/`;
  }, []);
  const getStorageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const clean = path.startsWith("/") ? path.slice(1) : path;
    return `${storageBase}${clean}`;
  };
  const imgUrl = (path) => getStorageUrl(path) || FALLBACK_IMG;

  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm,
    });
  };
  const acceptCar = async (car) => {
    try {
      const res = await updateCarAcceptReject(car.id, true);
      const data = res.data || res;
      const updated = data?.car ?? data ?? { ...car, car_accepted: true };
      setCars((prev) => prev.map((c) => (c.id === car.id ? { ...c, car_accepted: true } : c)));
      if (selectedItem?.id === car.id) setSelectedItem(updated);
      if (editingCar?.id === car.id) setEditingCar(updated);
      toast({ title: "Success", description: "Car accepted successfully" });
    } catch (e) {
      if (e.response?.status === 403) {
        toast({ title: "Access denied", description: "Super admin access required", variant: "destructive" });
      } else {
        toast({ title: "Error", description: e.response?.data?.message || "Failed to accept car", variant: "destructive" });
      }
    }
  };

  const rejectCar = async (car) => {
    try {
      const res = await updateCarAcceptReject(car.id, false);
      const data = res.data || res;
      const updated = data?.car ?? data ?? { ...car, car_accepted: false };
      setCars((prev) => prev.map((c) => (c.id === car.id ? { ...c, car_accepted: false } : c)));
      if (selectedItem?.id === car.id) setSelectedItem(updated);
      if (editingCar?.id === car.id) setEditingCar(updated);
      toast({ title: "Success", description: "Car rejected successfully" });
    } catch (e) {
      if (e.response?.status === 403) {
        toast({ title: "Access denied", description: "Super admin access required", variant: "destructive" });
      } else {
        toast({ title: "Error", description: e.response?.data?.message || "Failed to reject car", variant: "destructive" });
      }
    }
  };

  const deleteCar = async (id) => {
    try {
      await deleteCarApi(id);
      toast({ title: "Success", description: "Car deleted successfully" });
      fetchCars();
      setModalOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete car", variant: "destructive" });
    }
  };

  const toNumber = (v) => {
    if (v === null || v === undefined || v === "") return NaN;

    if (typeof v === "number") return v;

    const cleaned = String(v).replace(/[^0-9.]/g, "");
    const n = Number(cleaned);

    return Number.isNaN(n) ? NaN : n;
  };

  // End tony Update
  /* ============================
     Filter + sort
  ============================ */
  const filteredCars = useMemo(() => {
  let data = [...cars];

  // 🔎 GLOBAL SEARCH (car + agent)
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();

    data = data.filter((car) =>
      JSON.stringify(car)
        .toLowerCase()
        .includes(q)
    );
  }

  // categories (multi)
  if (categories.length > 0) {
<<<<<<< HEAD
    data = data.filter((c) => categories.includes(c.car_category));
=======
    const catLower = categories.map((x) => String(x).toLowerCase());
    data = data.filter((c) => catLower.includes((c.car_category || "").toLowerCase()));
>>>>>>> d7f0598ba238695ac2bb6c17afb46754360d3df2
  }

  // status (reserved / available)
  if (status.length > 0) {
    data = data.filter((c) => status.includes(c.status));
  }

  // year range
  const from = yearFrom ? Number(yearFrom) : null;
  const to = yearTo ? Number(yearTo) : null;

  if (from !== null || to !== null) {
    data = data.filter((c) => {
      const y = Number(c.year);
      if (Number.isNaN(y)) return false;

      if (from !== null && y < from) return false;
      if (to !== null && y > to) return false;

      return true;
    });
  }

  // daily rate range
  const rFrom = rateFrom !== "" ? toNumber(rateFrom) : null;
  const rTo = rateTo !== "" ? toNumber(rateTo) : null;

  if (rFrom !== null || rTo !== null) {
    data = data.filter((c) => {
      const rate = toNumber(c.daily_rate);
      if (Number.isNaN(rate)) return false;

      if (rFrom !== null && !Number.isNaN(rFrom) && rate < rFrom)
        return false;
      if (rTo !== null && !Number.isNaN(rTo) && rate > rTo)
        return false;

      return true;
    });
  }

  // sort
  if (sort === "newest") {
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  if (sort === "price") {
    data.sort((a, b) => {
      const ar = toNumber(a.daily_rate);
      const br = toNumber(b.daily_rate);
      if (Number.isNaN(ar) && Number.isNaN(br)) return 0;
      if (Number.isNaN(ar)) return 1;
      if (Number.isNaN(br)) return -1;
      return ar - br;
    });
  }

  if (sort === "year_asc" || sort === "year_desc") {
    data.sort((a, b) => {
      const ay = Number(a.year);
      const by = Number(b.year);
      if (Number.isNaN(ay) && Number.isNaN(by)) return 0;
      if (Number.isNaN(ay)) return 1;
      if (Number.isNaN(by)) return -1;
      return sort === "year_asc" ? ay - by : by - ay;
    });
  }

  if (sort === "views_asc" || sort === "views_desc") {
    data.sort((a, b) => {
      const av = Number(a.views_count);
      const bv = Number(b.views_count);
      if (Number.isNaN(av) && Number.isNaN(bv)) return 0;
      if (Number.isNaN(av)) return 1;
      if (Number.isNaN(bv)) return -1;
      return sort === "views_asc" ? av - bv : bv - av;
    });
  }

  return data;
}, [
  cars,
  searchQuery,   // ✅ IMPORTANT
  categories,
  status,
  sort,
  yearFrom,
  yearTo,
  rateFrom,
  rateTo,
]);




  /* ============================
     Render
  ============================ */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cars</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search make, model, plate, color..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={agentIdFilter || "all"}
            onValueChange={(v) => {
              const next = v === "all" ? "" : v;
              setAgentIdFilter(next);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[200px]">
              <SelectValue placeholder="Filter by agency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All agencies</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={String(agent.id)}>
                  {agent.username
                    || (agent.first_name && agent.last_name
                      ? `${agent.first_name} ${agent.last_name}`
                      : `Agency #${agent.id}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((op) => (
                <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={carAcceptedFilter}
            onValueChange={(v) => {
              setCarAcceptedFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Accepted" />
            </SelectTrigger>
            <SelectContent>
              {CAR_ACCEPTED_OPTIONS.map((op) => (
                <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={isPrivateFilter}
            onValueChange={(v) => {
              setIsPrivateFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[110px]">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              {IS_PRIVATE_OPTIONS.map((op) => (
                <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Car className="h-4 w-4" />
            <span className="font-semibold text-foreground">{meta.total}</span>
            <span>cars</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters((p) => !p)}>
            More filters
          </Button>
        </div>
      </div>

      {/* ADVANCED FILTERS */}
      {showFilters && (
        <div className="mt-3 rounded-lg border bg-background p-3">
          <div className="flex flex-wrap gap-3 items-end">

            {/* Sort */}
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price">Price ↑</SelectItem>
                <SelectItem value="year_asc">Year ↑</SelectItem>
                <SelectItem value="year_desc">Year ↓</SelectItem>
                <SelectItem value="views_asc">Views ↑</SelectItem>
                <SelectItem value="views_desc">Views ↓</SelectItem>
              </SelectContent>
            </Select>

            {/* Category */}
            <Select
              value={categories[0] ?? "all"}
              onValueChange={(v) =>
                v === "all" ? setCategories([]) : setCategories([v])
              }
            >
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="sedan">Sedan</SelectItem>
                <SelectItem value="hatchback">Hatchback</SelectItem>
                <SelectItem value="coupe">Coupe</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="crossover">Crossover</SelectItem>
                <SelectItem value="wagon">Wagon</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="minivan">Minivan</SelectItem>
                <SelectItem value="convertible">Convertible</SelectItem>
              </SelectContent>
            </Select>

            {/* Status */}
            <Select
              value={status[0] ?? "all"}
              onValueChange={(v) =>
                v === "all" ? setStatus([]) : setStatus([v])
              }
            >
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>

            {/* Year */}
            <Input
              type="number"
              placeholder="Year from"
              className="h-9 w-[120px]"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Year to"
              className="h-9 w-[120px]"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
            />

            {/* Rate */}
            <Input
              type="number"
              placeholder="Rate from"
              className="h-9 w-[120px]"
              value={rateFrom}
              onChange={(e) => setRateFrom(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Rate to"
              className="h-9 w-[120px]"
              value={rateTo}
              onChange={(e) => setRateTo(e.target.value)}
            />
          </div>
        </div>
      )}



      {/* Table */}
      {loading ? (
  <p className="text-muted-foreground">Loading cars...</p>
) : (
  <>
    {/* GRID */}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {filteredCars.map((car) => (
        <div
          key={car.id}
          className={`
  border rounded-lg p-3 transition-all duration-300
  ${
    car.car_accepted
<<<<<<< HEAD
      ? "bg-green-500/10 border-green-500/40 hover:bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
      : "bg-red-500/10 border-red-500/40 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
=======
      ? "bg-green-500/10 border-green-500/40 hover:bg-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
      : "bg-red-500/10 border-red-500/40 hover:bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
>>>>>>> d7f0598ba238695ac2bb6c17afb46754360d3df2
  }
`}

  
        >
          {/* IMAGE */}
<div className="relative h-36 mb-2 overflow-hidden rounded-md">
  <img
    src={imgUrl(car.main_image_url)}
    alt={car.make}
    className="w-full h-full object-cover"
  />

<<<<<<< HEAD
 {/* Agent Logo */}
{car.agent?.profile_picture && (
  <img
    src={
      car.agent.profile_picture.startsWith("http")
        ? car.agent.profile_picture
        : `https://rento-lb.com/api/storage/${car.agent.profile_picture.replace(/^\/?storage\//, "")}`
    }
    alt={car.agent?.username}
    className="absolute bottom-2 right-2 w-8 h-8 rounded-full border-2 border-white shadow-md bg-white object-cover z-20"
    onError={(e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = "/avatar.png";
    }}
  />
)}
=======
 {/* Agent Logo + Username */}
          <div className="absolute bottom-2 right-2 z-20 flex flex-col items-end gap-0.5">
            {car.agent?.profile_picture ? (
              <img
                src={
                  car.agent.profile_picture.startsWith("http")
                    ? car.agent.profile_picture
                    : `https://rento-lb.com/api/storage/${car.agent.profile_picture.replace(/^\/?storage\//, "")}`
                }
                alt={car.agent?.username}
                className="w-8 h-8 rounded-full border-2 border-white shadow-md bg-white object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/avatar.png";
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-white shadow-md bg-muted flex items-center justify-center">
                <Car className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            {(car.agent?.username != null && car.agent.username !== "") && (
              <span className="text-[10px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] bg-black/50 px-1.5 py-0.5 rounded max-w-[80px] truncate" title={car.agent.username}>
                @{car.agent.username}
              </span>
            )}
          </div>
>>>>>>> d7f0598ba238695ac2bb6c17afb46754360d3df2


</div>

          {/* TITLE */}
          <h3 className="font-semibold text-sm">
            {car.make} {car.model}
          </h3>

          {/* BASIC INFO */}
          <div className="text-xs text-muted-foreground mt-1 space-y-1">
            <div>Year: {car.year}</div>
            <div>Rate: ${car.daily_rate}</div>
            <div>Agent: {car.agent?.username || "—"}</div>
            <div>Views: {car.views_count}</div>
          </div>

          {/* STATUS */}
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="outline">{car.car_category}</Badge>

            {car.status === "available" && (
              <Badge className="bg-green-600">Available</Badge>
            )}

            {car.car_accepted ? (
  <Badge className="bg-green-500/20 text-green-700 border-green-500/40">
    Accepted
  </Badge>
) : (
  <Badge className="bg-red-500/20 text-red-700 border-red-500/40">
    Rejected
  </Badge>
)}

          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => openViewCar(car)}
              >
                <Eye className="w-4 h-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => openEditCar(car)}
              >
                <Edit className="w-4 h-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  showConfirmDialog(
                    "Delete Car",
                    "Are you sure you want to delete this car?",
                    () => deleteCar(car.id)
                  )
                }
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>

            {!car.car_accepted ? (
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => acceptCar(car)}
              >
                Accept
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => rejectCar(car)}
              >
                Reject
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>

    {/* EMPTY */}
    {filteredCars.length === 0 && (
      <div className="text-center text-muted-foreground mt-10">
        No cars found
      </div>
    )}

    {/* PAGINATION */}
    {/* SERVER PAGINATION */}
{meta.last_page > 1 && (
  <div className="flex flex-col items-center gap-3 mt-10">

    <div className="text-sm text-muted-foreground">
      Showing page <span className="font-semibold text-foreground">
        {meta.current_page}
      </span>{" "}
      of <span className="font-semibold text-foreground">
        {meta.last_page}
      </span>{" "}
      ({meta.total} cars)
    </div>

    <div className="flex items-center gap-2 flex-wrap justify-center">

      {/* PREVIOUS */}
      <Button
        variant="outline"
        size="sm"
        disabled={meta.current_page <= 1}
        onClick={() => setPage((p) => p - 1)}
      >
        <ChevronLeft size={16} />
      </Button>

      {/* PAGE NUMBERS */}
      {Array.from(
        { length: meta.last_page },
        (_, i) => i + 1
      )
        .filter(
          (p) =>
            p === 1 ||
            p === meta.last_page ||
            Math.abs(p - meta.current_page) <= 2
        )
        .map((p, index, arr) => (
          <Button
            key={p}
            size="sm"
            variant={p === meta.current_page ? "default" : "outline"}
            onClick={() => setPage(p)}
          >
            {p}
          </Button>
        ))}

      {/* NEXT */}
      <Button
        variant="outline"
        size="sm"
        disabled={meta.current_page >= meta.last_page}
        onClick={() => setPage((p) => p + 1)}
      >
        <ChevronRight size={16} />
      </Button>

    </div>
  </div>
)}

  </>
)}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalType === "view-car" ? "Car Details" : "Edit Car"}
            </DialogTitle>
          </DialogHeader>

          {!selectedItem ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : modalType === "view-car" ? (
            <CarDetailsView
              car={selectedItem}
              imgUrl={imgUrl}
              getStorageUrl={getStorageUrl}
              onEdit={() => {
                setEditingCar({ ...selectedItem });
                setModalType("edit-car");
              }}
              onClose={() => setModalOpen(false)}
              onAccept={() => acceptCar(selectedItem)}
              onReject={() => rejectCar(selectedItem)}
            />
          ) : (
            editingCar && (
              <EditCarView
                car={editingCar}
                setCar={setEditingCar}
                imgUrl={imgUrl}
                onClose={() => setModalType("view-car")}
                onSaved={(updated) => {
                  setSelectedItem(updated);
                  setEditingCar({ ...updated });
                  setModalType("view-car");
                }}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCarsPage;

// Start Tony Update
function carTooltip(car) {
  return [
    `Car ID: ${car.id ?? "N/A"}`,
    `Agent ID : ${car.agent_id ?? "N/A"}`,
    `Status: ${car.status ?? "N/A"}`,
    `year: ${car.year ?? "N/A"}`,
    `Car_category: ${car.car_category ?? "N/A"}`,
    `Color: ${car.color ?? "N/A"}`,
    `Seats: ${car.seats ?? "N/A"}`,
    `Doors: ${car.doors ?? "N/A"}`,
    `Cylinder number: ${car.cylinder_number ?? "N/A"}`,
    `Transmission: ${car.transmission ?? "N/A"}`,
    `wheels drive: ${car.wheels_drive ?? "N/A"}`,
    `Daily rate: ${car.daily_rate ?? "N/A"}`,
    `License plate: ${car.license_plate ?? "N/A"}`,
  ].join("\n");
}
export async function openCarView(
  id,
  fetchCarDetails,
  setSelectedItem,
  setModalType,
  setModalOpen,
) {
  const fullDetails = await fetchCarDetails(id);
  if (fullDetails) {
    setSelectedItem(fullDetails);
    setModalType("view-car");
    setModalOpen(true);
  }
}

function agentTooltip(car) {
  const agent = car?.agent;
  if (!agent) return "No agent";
  return [
    `ID : ${agent.id ?? "N/A"}`,
    `Phone number : ${agent.phone_number ?? "N/A"}`,
    `Email : ${agent.email ?? "N/A"}`,
    `Verified by admin : ${agent.verified_by_admin ?? "N/A"}`,
    `Gender : ${agent.gender ?? "N/A"}`,
    `Birth date : ${formatDateOnly(agent.birth_date ?? "N/A")}`,
    `City : ${agent.city ?? "N/A"}`,
    `Bio : ${agent.bio ?? "N/A"}`,
    `Created at : ${formatDateTime(agent.created_at ?? "N/A")}`,
    `Updated at : ${formatDateTime(agent.updated_at ?? "N/A")}`,
  ].join("\n");
}

function formatDateOnly(value) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  return d.toLocaleString("en-US", {
    timeZone: "Asia/Beirut",
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function RelatedSection({ title, items, renderItem }) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return null;
  return (
    <div className="space-y-1">
      <div className="text-sm font-semibold">{title} ({list.length})</div>
      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto">
        {list.slice(0, 10).map((item, idx) => (
          <li key={item?.id ?? idx}>{renderItem(item)}</li>
        ))}
        {list.length > 10 && <li>… and {list.length - 10} more</li>}
      </ul>
    </div>
  );
}

function CarDetailsView({
  car,
  imgUrl,
  getStorageUrl,
  onEdit,
  onClose,
  onAccept,
  onReject,
}) {
  const agent = car?.agent || null;

  const money = (v) => {
    if (!v) return "N/A";
    const n = Number(v);
    if (Number.isNaN(n)) return v;
    return `$${n.toFixed(2)}`;
  };

  const InfoItem = ({ label, value }) => (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">
        {value ?? "N/A"}
      </span>
    </div>
  );

  const YesNoBadge = ({ value }) =>
    value ? (
      <Badge className="bg-green-500/20 text-green-700 border-green-500/40">
        Yes
      </Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-700 border-red-500/40">
        No
      </Badge>
    );

  return (
    <div className="space-y-6">

      {/* HERO SECTION */}
      <div className="relative rounded-xl overflow-hidden border">
        <img
          src={imgUrl(car.main_image_url)}
          alt={car.make}
          className="w-full h-[260px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-4 left-6 text-white">
          <h2 className="text-2xl font-bold">
            {car.make} {car.model}
          </h2>
          <div className="flex gap-2 mt-2">
            <Badge className="bg-white/20 backdrop-blur text-white">
              {car.car_category}
            </Badge>
            {car.car_accepted ? (
              <Badge className="bg-green-600">Accepted</Badge>
            ) : (
              <Badge className="bg-red-600">Rejected</Badge>
            )}
          </div>
        </div>
      </div>

      {/* MAIN DETAILS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 rounded-xl border bg-background shadow-sm">
        <InfoItem label="Year" value={car.year} />
        <InfoItem label="Color" value={car.color} />
        <InfoItem label="Transmission" value={car.transmission} />
        <InfoItem label="Fuel Type" value={car.fuel_type} />
        <InfoItem label="Seats" value={car.seats} />
        <InfoItem label="Doors" value={car.doors} />
        <InfoItem label="Daily Rate" value={money(car.daily_rate)} />
        <InfoItem label="Status" value={car.status} />
      </div>

      {/* EXTRA INFO */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Car Info Card */}
        <div className="rounded-xl border p-4 space-y-3 bg-background shadow-sm">
          <h3 className="font-semibold text-lg">Car Information</h3>
          <InfoItem label="License Plate" value={car.license_plate} />
          <InfoItem label="Mileage" value={car.mileage} />
          <InfoItem label="Cylinder" value={car.cylinder_number} />
          <InfoItem label="Min Rental Days" value={car.min_rental_days} />
          <div className="flex gap-4 pt-2">
            <div>
              <span className="text-xs text-muted-foreground">Accepted</span>
              <YesNoBadge value={car.car_accepted} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Private</span>
              <YesNoBadge value={car.is_private} />
            </div>
          </div>
        </div>

        {/* Agent Card */}
        <div className="rounded-xl border p-4 space-y-3 bg-background shadow-sm">
          <h3 className="font-semibold text-lg">Agent</h3>
          <InfoItem label="Username" value={agent?.username} />
          <InfoItem label="Phone" value={agent?.phone_number} />
          <InfoItem label="Email" value={agent?.email} />
          <InfoItem label="City" value={agent?.city} />
        </div>
      </div>

      {/* FEATURES */}
      {car.features?.length > 0 && (
        <div className="rounded-xl border p-4 bg-background shadow-sm">
          <h3 className="font-semibold mb-3">Features</h3>
          <div className="flex flex-wrap gap-2">
            {car.features.map((f, i) => (
              <Badge key={i} variant="outline">
                {typeof f === "string" ? f : f.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* NOTES */}
      {car.notes && (
        <div className="rounded-xl border p-4 bg-background shadow-sm">
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {car.notes}
          </p>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex gap-3 pt-4">
        {!car.car_accepted && (
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={onAccept}
          >
            Accept Car
          </Button>
        )}

        {car.car_accepted && (
          <Button
            variant="destructive"
            onClick={onReject}
          >
            Reject Car
          </Button>
        )}

        <Button className="flex-1" onClick={onEdit}>
          Edit Car
        </Button>

        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

const IMAGE_TYPES = [
  { type: "main", label: "Main", fullKey: "main_image_full_url", pathKey: "main_image_url" },
  { type: "front", label: "Front", fullKey: "front_image_full_url", pathKey: "front_image_url" },
  { type: "back", label: "Back", fullKey: "back_image_full_url", pathKey: "back_image_url" },
  { type: "left", label: "Left", fullKey: "left_image_full_url", pathKey: "left_image_url" },
  { type: "right", label: "Right", fullKey: "right_image_full_url", pathKey: "right_image_url" },
];

// Stable row components (defined outside EditCarView so they don't remount on every render and steal focus)
function EditInputRow({ label, type = "text", disabled = false, value = "", onChange }) {
  const handleChange = (e) => {
    const v = e.target.value;
    onChange(type === "number" ? (v === "" ? "" : Number(v)) : v);
  };
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <Input type={type} value={value} onChange={handleChange} disabled={disabled} />
    </div>
  );
}

function EditSelectRow({ label, options, emptySentinel, value = "", onValueChange }) {
  const displayValue = emptySentinel ? (value ?? "") || emptySentinel : String(value ?? "");
  const handleSelect = (v) => onValueChange(emptySentinel && v === emptySentinel ? "" : v);
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <Select value={displayValue} onValueChange={handleSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((op) => {
            const val = op.value === "" || op.value == null ? (emptySentinel || "__none__") : String(op.value);
            return (
              <SelectItem key={val} value={val}>
                {op.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function EditToggleRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="text-sm">{label}</div>
      <button
        type="button"
        role="switch"
        aria-checked={!!value}
        onClick={() => onChange(!value)}
        className={[
          "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
          value ? "bg-teal-600" : "bg-muted",
          "focus:outline-none focus:ring-2 focus:ring-teal-500/40",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            value ? "translate-x-5" : "translate-x-1",
            "shadow",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function AdminEditLocationSection({ car, setVal }) {
  const { toast } = useToast();
  const [googleLink, setGoogleLink] = useState("");
  const [showMapModal, setShowMapModal] = useState(false);
  const [tempMapLocation, setTempMapLocation] = useState(null);

  const loc = car?.live_location || { address: "", latitude: 0, longitude: 0 };
  const hasLocation = loc.latitude && loc.longitude && (Number(loc.latitude) !== 0 || Number(loc.longitude) !== 0);

  const updateLoc = (updates) => setVal("live_location", { ...loc, ...updates });

  const applyGoogleLink = () => {
    const coords = parseGoogleMapsLink(googleLink);
    if (coords) {
      updateLoc({ latitude: coords.lat, longitude: coords.lng });
      toast({ title: "Coordinates applied" });
    } else {
      toast({ title: "Could not parse link", description: "Paste a valid Google Maps URL with coordinates", variant: "destructive" });
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLoc({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        toast({ title: "Current location set" });
      },
      () => toast({ title: "Could not get location", variant: "destructive" })
    );
  };

  const useOfficeLocation = () => {
    const agentLoc = car?.agent?.location;
    if (agentLoc && (agentLoc.lat != null || agentLoc.latitude != null)) {
      const lat = agentLoc.latitude ?? agentLoc.lat ?? 33.8547;
      const lng = agentLoc.longitude ?? agentLoc.lng ?? 35.8623;
      updateLoc({ latitude: lat, longitude: lng });
      toast({ title: "Office location set" });
    } else {
      toast({ title: "No office location", description: "Car agent has no location set", variant: "destructive" });
    }
  };

  const openMapPicker = () => {
    setTempMapLocation({ latitude: loc.latitude || 33.8547, longitude: loc.longitude || 35.8623 });
    setShowMapModal(true);
  };

  const confirmMapLocation = () => {
    if (tempMapLocation) {
      updateLoc({ latitude: tempMapLocation.latitude, longitude: tempMapLocation.longitude });
      toast({ title: "Location set from map" });
    }
    setShowMapModal(false);
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Location &amp; Address (same as Add Car)
      </div>
      <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Address (region)</div>
          <Select
            value={loc.address || "__empty__"}
            onValueChange={(v) => updateLoc({ address: v === "__empty__" ? "" : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select region..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__empty__">Select region...</SelectItem>
              {ADDRESS_OPTIONS.filter((o) => o.value).map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Paste Google Maps link (to set coordinates)</div>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. https://www.google.com/maps/@33.89,35.50 or maps.app.goo.gl/..."
              value={googleLink}
              onChange={(e) => setGoogleLink(e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="sm" onClick={applyGoogleLink}>
              Apply
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={useCurrentLocation}>
            <Navigation className="w-4 h-4 mr-2" />
            Use Current Location
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={openMapPicker}>
            <MapPin className="w-4 h-4 mr-2" />
            Select on Map
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={useOfficeLocation}>
            <Building2 className="w-4 h-4 mr-2" />
            Office location
          </Button>
        </div>
        {hasLocation ? (
          <div className="text-sm text-muted-foreground">
            Location set: Lat {loc.latitude} • Lng {loc.longitude}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">No coordinates set yet.</div>
        )}
      </div>

      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select location on map</DialogTitle>
          </DialogHeader>
          {tempMapLocation && (
            <AdminLocationMap
              center={tempMapLocation}
              selectedLocation={tempMapLocation}
              onLocationSelect={(lat, lng) => setTempMapLocation({ latitude: lat, longitude: lng })}
            />
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowMapModal(false)}>Cancel</Button>
            <Button onClick={confirmMapLocation}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminLocationMap({ center, selectedLocation, onLocationSelect }) {
  const mapRef = React.useRef(null);
  const markerRef = React.useRef(null);
  const mapId = "admin-edit-car-location-map";
  React.useEffect(() => {
    if (!window.L || mapRef.current) return;
    const lat = parseFloat(center?.latitude) || 33.8547;
    const lng = parseFloat(center?.longitude) || 35.8623;
    const map = window.L.map(mapId).setView([lat, lng], 13);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map);
    const marker = window.L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.on("dragend", (e) => {
      const pos = e.target.getLatLng();
      onLocationSelect(pos.lat, pos.lng);
    });
    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    });
    mapRef.current = map;
    markerRef.current = marker;
  }, []);
  return <div id={mapId} className="w-full h-[300px] rounded-md" />;
}

function EditCarView({ car, setCar, imgUrl, onClose, onSaved }) {
  const { toast } = useToast();
  const [replacing, setReplacing] = useState(null);
  const fileInputRefs = React.useRef({});

  const setVal = (key, value) => setCar((p) => ({ ...p, [key]: value }));

  const displayUrl = (fullUrlKey, pathKey) => {
    const full = car?.[fullUrlKey];
    if (full) return full;
    return imgUrl(car?.[pathKey]);
  };

  const handleReplaceImage = async (imageType, file) => {
    if (!file || !car?.id) return;
    setReplacing(imageType);
    try {
      const res = await updateCarPhoto(car.id, file, imageType);
      const data = res.data || res;
      const updated = data?.car ?? data ?? car;
      setCar(updated);
      toast({ title: "Image updated", description: `${imageType} image replaced successfully` });
    } catch (e) {
      const msg = e.response?.data?.errors?.image?.[0] || e.response?.data?.message || "Failed to replace image";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setReplacing(null);
      if (fileInputRefs.current[imageType]) fileInputRefs.current[imageType].value = "";
    }
  };

  const money = (v) => {
    if (v === null || v === undefined || v === "") return "";
    const n = Number(v);
    if (Number.isNaN(n)) return v;
    return n;
  };

  const listToBadges = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0)
      return <div className="text-sm text-muted-foreground">N/A</div>;

    return (
      <div className="flex flex-wrap gap-2">
        {arr.map((x, idx) => (
          <Badge key={idx} variant="outline">
            {typeof x === "string" ? x : (x?.name ?? JSON.stringify(x))}
          </Badge>
        ))}
      </div>
    );
  };

  const save = async () => {
    try {
      const payload = {
        make: car.make,
        model: car.model,
        year: car.year,
        cylinder_number: car.cylinder_number === "__none__" || car.cylinder_number === "" ? undefined : car.cylinder_number,
        license_plate: car.license_plate,
        color: car.color,
        mileage: car.mileage,
        fuel_type: car.fuel_type,
        transmission: car.transmission,
        wheels_drive: car.wheels_drive,
        car_category: car.car_category,
        seats: car.seats,
        doors: car.doors,
        daily_rate: money(car.daily_rate),
        holiday_rate: money(car.holiday_rate),
        is_deposit: !!car.is_deposit,
        deposit: money(car.deposit),
        status: car.status,
        car_accepted: !!car.car_accepted,
        is_private: !!car.is_private,
        is_delivered: !!car.is_delivered,
        delivery_fees: money(car.delivery_fees),
        with_driver: !!car.with_driver,
        driver_fees: money(car.driver_fees),
        max_driving_mileage: car.max_driving_mileage != null && car.max_driving_mileage !== "" ? Number(car.max_driving_mileage) : undefined,
        min_rental_days: car.min_rental_days,
        notes: car.notes,
        agent_id: car.agent_id != null && car.agent_id !== "" ? Number(car.agent_id) : undefined,
        insurance_expiry: car.insurance_expiry || undefined,
        registration_expiry: car.registration_expiry || undefined,
        views_count: car.views_count != null && car.views_count !== "" ? Number(car.views_count) : undefined,
        clicks_count: car.clicks_count != null && car.clicks_count !== "" ? Number(car.clicks_count) : undefined,
        search_count: car.search_count != null && car.search_count !== "" ? Number(car.search_count) : undefined,
      };
      const loc = car?.live_location;
      const locAddr = loc?.address ?? "";
      const locLat = loc?.latitude ?? loc?.lat ?? "";
      const locLng = loc?.longitude ?? loc?.lng ?? "";
      if (locAddr || (locLat !== "" && locLng !== "")) {
        payload.live_location = {
          address: String(locAddr || ""),
          latitude: locLat !== "" ? Number(locLat) : 0,
          longitude: locLng !== "" ? Number(locLng) : 0,
        };
      }
      const res = await updateCar(car.id, payload);
      const data = res.data || res;
      const updated = data?.car ?? data ?? car;
      toast({ title: "Saved", description: "Car updated successfully" });
      onSaved?.(updated);
    } catch (e) {
      if (e.response?.status === 422 && e.response?.data?.errors) {
        const msg = Object.entries(e.response.data.errors).map(([k, v]) => `${k}: ${(v || []).join(", ")}`).join("; ");
        toast({ title: "Validation Error", description: msg || "Invalid data", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to update car", variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
        <EditInputRow label="ID" value={car?.id ?? ""} onChange={() => {}} disabled />
        <EditInputRow label="Make" value={car?.make ?? ""} onChange={(v) => setVal("make", v)} />
        <EditInputRow label="Model" value={car?.model ?? ""} onChange={(v) => setVal("model", v)} />
        <EditInputRow label="Year" value={car?.year ?? ""} onChange={(v) => setVal("year", v)} type="number" />
        <EditSelectRow label="Cylinder" value={car?.cylinder_number ?? ""} onValueChange={(v) => setVal("cylinder_number", v)} emptySentinel="__none__" options={[{ label: "—", value: "" }, { label: "4", value: "4" }, { label: "6", value: "6" }, { label: "8", value: "8" }, { label: "10", value: "10" }, { label: "12", value: "12" }]} />

        <EditInputRow label="License Plate" value={car?.license_plate ?? ""} onChange={(v) => setVal("license_plate", v)} />
        <EditInputRow label="Color" value={car?.color ?? ""} onChange={(v) => setVal("color", v)} />

        <EditInputRow label="Mileage" value={car?.mileage ?? ""} onChange={(v) => setVal("mileage", v)} type="number" />
        <EditInputRow label="Fuel Type" value={car?.fuel_type ?? ""} onChange={(v) => setVal("fuel_type", v)} />

        <EditInputRow label="Transmission" value={car?.transmission ?? ""} onChange={(v) => setVal("transmission", v)} />
        <EditInputRow label="Wheels Drive" value={car?.wheels_drive ?? ""} onChange={(v) => setVal("wheels_drive", v)} />

        <EditSelectRow label="Category" value={car?.car_category ?? ""} onValueChange={(v) => setVal("car_category", v)} emptySentinel="__none__" options={[{ label: "—", value: "" }, { label: "Sedan", value: "Sedan" }, { label: "Hatchback", value: "Hatchback" }, { label: "Coupe", value: "Coupe" }, { label: "SUV", value: "SUV" }, { label: "Crossover", value: "Crossover" }, { label: "Wagon", value: "Wagon" }, { label: "Pickup", value: "Pickup" }, { label: "Minivan", value: "Minivan" }, { label: "Convertible", value: "Convertible" }]} />

        <EditInputRow label="Seats" value={car?.seats ?? ""} onChange={(v) => setVal("seats", v)} type="number" />
        <EditInputRow label="Doors" value={car?.doors ?? ""} onChange={(v) => setVal("doors", v)} type="number" />

        <EditInputRow label="Daily Rate" value={car?.daily_rate ?? ""} onChange={(v) => setVal("daily_rate", v)} type="number" />
        <EditInputRow label="Holiday Rate" value={car?.holiday_rate ?? ""} onChange={(v) => setVal("holiday_rate", v)} type="number" />
        <EditInputRow label="Deposit" value={car?.deposit ?? ""} onChange={(v) => setVal("deposit", v)} type="number" />
        <EditInputRow label="Delivery Fees" value={car?.delivery_fees ?? ""} onChange={(v) => setVal("delivery_fees", v)} type="number" />
        <EditInputRow label="Driver Fees" value={car?.driver_fees ?? ""} onChange={(v) => setVal("driver_fees", v)} type="number" />

        <EditInputRow label="Min Rental Days" value={car?.min_rental_days ?? ""} onChange={(v) => setVal("min_rental_days", v)} type="number" />
        <EditInputRow label="Max Driving Mileage" value={car?.max_driving_mileage ?? ""} onChange={(v) => setVal("max_driving_mileage", v)} type="number" />

        <EditInputRow label="Agent ID (reassign owner)" value={car?.agent_id ?? ""} onChange={(v) => setVal("agent_id", v)} type="number" />
        <EditInputRow label="Insurance Expiry" value={car?.insurance_expiry ?? ""} onChange={(v) => setVal("insurance_expiry", v)} type="date" />
        <EditInputRow label="Registration Expiry" value={car?.registration_expiry ?? ""} onChange={(v) => setVal("registration_expiry", v)} type="date" />

        <EditInputRow label="Views Count" value={car?.views_count ?? ""} onChange={(v) => setVal("views_count", v)} type="number" />
        <EditInputRow label="Clicks Count" value={car?.clicks_count ?? ""} onChange={(v) => setVal("clicks_count", v)} type="number" />
        <EditInputRow label="Search Count" value={car?.search_count ?? ""} onChange={(v) => setVal("search_count", v)} type="number" />
      </div>

      <div className="border-t pt-3" />
      <AdminEditLocationSection car={car} setVal={setVal} />

      <div className="border-t pt-3" />

      <div className="space-y-2">
        <div className="text-sm font-semibold">Features</div>
        {listToBadges(car?.features)}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Add-ons</div>
        {listToBadges(car?.add_ons)}
      </div>

      <div className="border-t pt-3" />

      <div className="space-y-3">
        <div className="text-sm font-semibold">Car Images</div>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Main</span>
            <div className="flex items-center gap-1">
              <input
                ref={(el) => (fileInputRefs.current.main = el)}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReplaceImage("main", f); }}
              />
              <Button type="button" variant="outline" size="sm" disabled={replacing === "main"} onClick={() => fileInputRefs.current.main?.click()}>
                {replacing === "main" ? "Uploading…" : "Replace"}
              </Button>
            </div>
          </div>
          <a href={displayUrl("main_image_full_url", "main_image_url")} target="_blank" rel="noreferrer">
            <img src={displayUrl("main_image_full_url", "main_image_url")} alt="Main" className="w-full max-h-[260px] object-cover rounded-md border" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {IMAGE_TYPES.filter((t) => t.type !== "main").map(({ type, label, fullKey, pathKey }) => (
            <div key={type} className="space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-muted-foreground">{label}</span>
                <input
                  ref={(el) => (fileInputRefs.current[type] = el)}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReplaceImage(type, f); }}
                />
                <Button type="button" variant="outline" size="sm" className="h-7 px-1" disabled={replacing === type} onClick={() => fileInputRefs.current[type]?.click()}>
                  {replacing === type ? "…" : "Replace"}
                </Button>
              </div>
              <a href={displayUrl(fullKey, pathKey)} target="_blank" rel="noreferrer">
                <img src={displayUrl(fullKey, pathKey)} alt={label} className="h-[120px] w-full object-cover rounded-md border" />
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <EditSelectRow
          label="Status"
          value={car?.status ?? ""}
          onValueChange={(v) => setVal("status", v)}
          options={[
            { label: "Available", value: "available" },
            { label: "Not Available", value: "not_available" },
            { label: "Rented", value: "rented" },
            { label: "Maintenance", value: "maintenance" },
          ]}
        />

        <div className="text-sm font-semibold">Notes</div>
        <textarea
          className="w-full border rounded-md p-2 min-h-[90px]"
          value={car?.notes ?? ""}
          onChange={(e) => setVal("notes", e.target.value)}
        />
      </div>

      <EditToggleRow label="Car Accepted" value={car?.car_accepted} onChange={(v) => setVal("car_accepted", v ? 1 : 0)} />
      <EditToggleRow label="Is Private" value={car?.is_private} onChange={(v) => setVal("is_private", v ? 1 : 0)} />
      <EditToggleRow label="Is Deposit" value={car?.is_deposit} onChange={(v) => setVal("is_deposit", v ? 1 : 0)} />
      <EditToggleRow label="With Driver" value={car?.with_driver} onChange={(v) => setVal("with_driver", v ? 1 : 0)} />
      <EditToggleRow label="Is Delivered" value={car?.is_delivered} onChange={(v) => setVal("is_delivered", v ? 1 : 0)} />

      <div className="pt-3 flex gap-2">
        <Button className="flex-1" onClick={save}>
          Update Car
        </Button>
        <Button variant="outline" className="w-28" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// End Tony Update