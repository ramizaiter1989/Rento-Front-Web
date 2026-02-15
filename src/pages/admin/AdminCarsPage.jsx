import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { getCars, getCar, updateCar, updateCarPhoto, updateCarAcceptReject, downloadCarImage, deleteCar as deleteCarApi } from "@/lib/adminApi";
import { Search, Car, Download, Check, X } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Edit } from "lucide-react";
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
  const [cars, setCars] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: PER_PAGE, total: 0 });
  const [loading, setLoading] = useState(true);

  // server-side filters (API params)
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [carAcceptedFilter, setCarAcceptedFilter] = useState("all");
  const [isPrivateFilter, setIsPrivateFilter] = useState("all");
  const [agentIdFilter, setAgentIdFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
        ...(searchQuery && searchQuery.trim() && { search: searchQuery.trim() }),
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

  // Open edit modal: show list car immediately, then try to load full details in background
  const openEditCar = (listCar) => {
    setSelectedItem(listCar);
    setEditingCar({ ...listCar });
    setModalType("edit-car");
    setModalOpen(true);
    fetchCarDetails(listCar.id).then((full) => {
      if (full) {
        setSelectedItem(full);
        setEditingCar({ ...full });
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

    // categories (multi)
    if (categories.length > 0) {
      data = data.filter((c) => categories.includes(c.car_category));
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

        // if car has invalid rate, ignore it (or return false if you prefer)
        if (Number.isNaN(rate)) return false;

        if (rFrom !== null && !Number.isNaN(rFrom) && rate < rFrom)
          return false;
        if (rTo !== null && !Number.isNaN(rTo) && rate > rTo) return false;

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
          <Input
            type="number"
            placeholder="Agent ID"
            className="h-9 w-[100px]"
            value={agentIdFilter}
            onChange={(e) => {
              setAgentIdFilter(e.target.value);
              setPage(1);
            }}
            min={1}
          />
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
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="sport">Sport</SelectItem>
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
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {/*  Start tony Update */}
                  <TableHead>Car</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Daily Rate</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Accepted</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Actions</TableHead>
                  {/*  End tony Update */}
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell className="font-medium">
                      <span
                        className="item-name-hover inline-flex items-center gap-2 cursor-pointer"
                        title={carTooltip(car)}
                        role="button"
                        tabIndex={0}
                        onClick={() => openViewCar(car)}
                      >
                        {car.make} {car.model}
                      </span>
                    </TableCell>
                    <TableCell>{car.year}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{car.car_category}</Badge>
                    </TableCell>

                    <TableCell>${car.daily_rate}</TableCell>

                    <TableCell>
                      <span
                        className="car-make-model-hover inline-flex items-center gap-2 cursor-pointer"
                        title={agentTooltip(car)}
                      >
                        {car.agent?.username || "—"}
                      </span>
                    </TableCell>

                    <TableCell>
                      {car.status === "available" && <Badge className="bg-green-500">Available</Badge>}
                      {car.status === "not_available" && <Badge variant="secondary">Not Available</Badge>}
                      {car.status === "rented" && <Badge variant="default">Rented</Badge>}
                      {car.status === "maintenance" && <Badge variant="outline">Maintenance</Badge>}
                      {!["available", "not_available", "rented", "maintenance"].includes(car.status) && <Badge variant="outline">{car.status || "—"}</Badge>}
                    </TableCell>

                    <TableCell>
                      {car.car_accepted ? (
                        <Badge className="bg-green-600">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                      <div className="flex gap-1 mt-1">
                        {!car.car_accepted ? (
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => acceptCar(car)} title="Accept car">
                            <Check className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => rejectCar(car)} title="Reject car">
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{car.views_count}</TableCell>
                    {/* Start tony Update */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="View Details"
                          onClick={() => openViewCar(car)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit Details"
                          onClick={() => openEditCar(car)}
                          title="Edit Details"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete Car"
                          onClick={() =>
                            showConfirmDialog(
                              "Delete Car",
                              "Are you sure you want to delete this car?",
                              () => deleteCar(car.id),
                            )
                          }
                          title="Remove Car"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                    {/* End tony Update */}
                  </TableRow>
                ))}

                {filteredCars.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground py-6"
                    >
                      No cars found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-2">
              <p className="text-sm text-muted-foreground">
                Page {meta.current_page} of {meta.last_page} ({meta.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.current_page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
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
              onCarUpdated={(updated) => setSelectedItem(updated)}
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

function CarDetailsView({ car, imgUrl, getStorageUrl, onEdit, onClose, onAccept, onReject, onCarUpdated }) {
  const agent = car?.agent || null;
  const [downloading, setDownloading] = useState(null);
  const [replacing, setReplacing] = useState(null);
  const [dragOverImageType, setDragOverImageType] = useState(null);
  const { toast } = useToast();
  const fileInputRefs = React.useRef({});

  // Display: /api/storage/{database-url}
  const displayUrl = (fullUrlKey, pathKey) => {
    const path = car?.[pathKey];
    return getStorageUrl?.(path) || imgUrl(path);
  };

  const isImageFile = (file) => file && file.type && ["image/jpeg", "image/jpg", "image/png"].includes(file.type);

  const handleReplaceImage = async (imageType, file) => {
    if (!file || !car?.id) return;
    if (!isImageFile(file)) {
      toast({ title: "Invalid file", description: "Please use a JPG or PNG image.", variant: "destructive" });
      return;
    }
    setReplacing(imageType);
    try {
      const res = await updateCarPhoto(car.id, file, imageType);
      const data = res.data || res;
      const updated = data?.car ?? data ?? car;
      onCarUpdated?.(updated);
      toast({ title: "Saved", description: `${imageType} image updated`, variant: "default" });
    } catch (e) {
      const msg = e.response?.data?.errors?.image?.[0] || e.response?.data?.message || "Failed to replace image";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setReplacing(null);
      if (fileInputRefs.current[imageType]) fileInputRefs.current[imageType].value = "";
    }
  };

  // Download image: use API endpoint GET .../images/{type}/download (saves to local computer)
  const handleDownloadImage = async (type) => {
    if (!car?.id) return;
    setDownloading(type);
    try {
      const blob = await downloadCarImage(car.id, type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `car_${car.id}_${type}.jpg`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(null);
    }
  };

  function FieldRow({ label, value }) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{label} :</span>
        <span className="text-foreground">{value ?? "N/A"}</span>
      </div>
    );
  }

  const YesNoChip = ({ label, ok }) => (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className="text-muted-foreground">{label}</span>
      <Badge
        className={ok ? "bg-green-600" : ""}
        variant={ok ? "default" : "destructive"}
      >
        {ok ? "Yes" : "No"}
      </Badge>
    </div>
  );

  const StatusChip = ({ status }) => {
    const isAvailable = String(status).toLowerCase() === "available";
    return (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="text-muted-foreground">Status</span>
        <Badge
          className={isAvailable ? "bg-green-600" : ""}
          variant={isAvailable ? "default" : "destructive"}
        >
          {status ?? "N/A"}
        </Badge>
      </div>
    );
  };

  const money = (v) => {
    if (v === null || v === undefined || v === "") return "N/A";
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return `$${n.toFixed(2)}`;
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
        <FieldRow label="ID" value={car?.id} />
        <FieldRow label="Make" value={car?.make} />
        <FieldRow label="Model" value={car?.model} />
        <FieldRow label="Year" value={car?.year} />

        <FieldRow label="License Plate" value={car?.license_plate} />
        <FieldRow label="Color" value={car?.color} />

        <FieldRow label="Mileage" value={car?.mileage} />
        <FieldRow label="Fuel Type" value={car?.fuel_type} />

        <FieldRow label="Transmission" value={car?.transmission} />
        <FieldRow label="Wheels Drive" value={car?.wheels_drive} />

        <FieldRow label="Category" value={car?.car_category} />
        <FieldRow label="Seats" value={car?.seats} />

        <FieldRow label="Doors" value={car?.doors} />
        <FieldRow label="Daily Rate" value={money(car?.daily_rate)} />

        <FieldRow label="Holiday Rate" value={money(car?.holiday_rate)} />

        <div className="pt-1">
          <StatusChip status={car?.status} />
        </div>

        <div className="flex flex-wrap gap-6 pt-1">
          <YesNoChip label="Car Accepted" ok={!!car?.car_accepted} />
          <YesNoChip label="With Driver" ok={!!car?.with_driver} />
          <YesNoChip label="Is Delivered" ok={!!car?.is_delivered} />
        </div>

        <FieldRow label="Min Rental Days" value={car?.min_rental_days} />
        <FieldRow label="Views Count" value={car?.views_count} />
        <FieldRow label="Clicks Count" value={car?.clicks_count} />
        <FieldRow label="Search Count" value={car?.search_count} />
        <FieldRow label="Cylinder" value={car?.cylinder_number} />
        <div className="pt-1">
          <YesNoChip label="Is Private" ok={!!car?.is_private} />
        </div>
      </div>

      <div className="border-t pt-3" />

      <div className="space-y-2">
        <div className="text-sm font-semibold">Features</div>
        {listToBadges(car?.features)}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Add-ons</div>
        {listToBadges(car?.add_ons)}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Notes</div>
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
          {car?.notes ?? "N/A"}
        </div>
      </div>

      <div className="border-t pt-3" />

      <div className="space-y-3">
        <div className="text-sm font-semibold">Agent</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
          <FieldRow label="ID" value={agent?.id ?? car?.agent_id} />
          <FieldRow label="Username" value={agent?.username ?? "N/A"} />
          <FieldRow label="Phone Number" value={agent?.phone_number ?? "N/A"} />
          <FieldRow label="Email" value={agent?.email ?? "N/A"} />
          <FieldRow label="Gender" value={agent?.gender ?? "N/A"} />
          <FieldRow label="City" value={agent?.city ?? "N/A"} />
        </div>
      </div>

      {/* Related data: bookings, check_photos, holidays, feedbacks, deposits, balances, favorites */}
      <RelatedSection title="Bookings" items={car?.bookings} renderItem={(b) => `#${b?.id} ${b?.status ?? ""} ${b?.start_date ?? ""}`} />
      <RelatedSection title="Check photos" items={car?.check_photos} renderItem={(p) => `#${p?.id}`} />
      <RelatedSection title="Holidays" items={car?.holidays} renderItem={(h) => `${h?.date ?? h?.id}`} />
      <RelatedSection title="Feedbacks" items={car?.feedbacks} renderItem={(f) => `#${f?.id} ${f?.rating ?? ""}`} />
      <RelatedSection title="Deposits" items={car?.deposits} renderItem={(d) => `#${d?.id} ${d?.amount ?? ""}`} />
      <RelatedSection title="Balances" items={car?.balances} renderItem={(b) => `#${b?.id}`} />
      <RelatedSection title="Favorites" items={car?.favorites} renderItem={(f) => `User ${f?.user_id ?? f?.id}`} />

      <div className="border-t pt-3" />

      <div className="space-y-3">
        <div className="text-sm font-semibold">Car Images — drag & drop or click Replace</div>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Main</span>
            <div className="flex gap-1">
              <input
                ref={(el) => (fileInputRefs.current.main = el)}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReplaceImage("main", f); }}
              />
              <Button variant="outline" size="sm" className="h-7" disabled={replacing === "main"} onClick={() => fileInputRefs.current.main?.click()}>
                {replacing === "main" ? "Uploading…" : "Replace"}
              </Button>
              <Button variant="outline" size="sm" disabled={downloading === "main"} onClick={() => handleDownloadImage("main")}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
          <div
            className={`relative rounded-md border transition-colors ${dragOverImageType === "main" ? "ring-2 ring-[#00A19C] bg-[#00A19C]/10" : ""}`}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverImageType("main"); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOverImageType((t) => (t === "main" ? null : t)); }}
            onDrop={(e) => { e.preventDefault(); setDragOverImageType(null); const file = e.dataTransfer?.files?.[0]; if (file) handleReplaceImage("main", file); }}
          >
            <img src={displayUrl("main_image_full_url", "main_image_url")} alt="Main Car" className="w-full max-h-[260px] object-cover rounded-md border-0" />
            {dragOverImageType === "main" && (
              <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/30 text-white text-sm font-medium">Drop image here</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Front", type: "front", fullKey: "front_image_full_url", pathKey: "front_image_url" },
            { label: "Back", type: "back", fullKey: "back_image_full_url", pathKey: "back_image_url" },
            { label: "Left", type: "left", fullKey: "left_image_full_url", pathKey: "left_image_url" },
            { label: "Right", type: "right", fullKey: "right_image_full_url", pathKey: "right_image_url" },
          ].map(({ label, type, fullKey, pathKey }) => (
            <div key={type} className="space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-muted-foreground">{label}</span>
                <div className="flex gap-0.5">
                  <input
                    ref={(el) => (fileInputRefs.current[type] = el)}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReplaceImage(type, f); }}
                  />
                  <Button variant="ghost" size="sm" className="h-6 px-1 text-xs" disabled={replacing === type} onClick={() => fileInputRefs.current[type]?.click()} title="Replace">
                    {replacing === type ? "…" : "Replace"}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-1" disabled={downloading === type} onClick={() => handleDownloadImage(type)} title="Download">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div
                className={`relative rounded-md border transition-colors ${dragOverImageType === type ? "ring-2 ring-[#00A19C] bg-[#00A19C]/10" : ""}`}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverImageType(type); }}
                onDragLeave={(e) => { e.preventDefault(); setDragOverImageType((t) => (t === type ? null : t)); }}
                onDrop={(e) => { e.preventDefault(); setDragOverImageType(null); const file = e.dataTransfer?.files?.[0]; if (file) handleReplaceImage(type, file); }}
              >
                <img src={displayUrl(fullKey, pathKey)} alt={label} className="h-[120px] w-full object-cover rounded-md border-0" />
                {dragOverImageType === type && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/30 text-white text-xs font-medium">Drop</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 flex flex-wrap gap-2">
        {!car?.car_accepted && onAccept && (
          <Button className="bg-green-600 hover:bg-green-700" onClick={onAccept}>
            <Check className="h-4 w-4 mr-2" />
            Accept Car
          </Button>
        )}
        {car?.car_accepted && onReject && (
          <Button variant="destructive" onClick={onReject}>
            <X className="h-4 w-4 mr-2" />
            Reject Car
          </Button>
        )}
        <Button className="flex-1" onClick={onEdit}>
          Edit Car
        </Button>
        <Button variant="outline" className="w-28" onClick={onClose}>
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

// Stable components outside EditCarView so inputs keep focus on re-render
function AdminCarInputRow({ label, value, onChange, type = "text", disabled = false }) {
  const displayValue = value === null || value === undefined ? "" : String(value);
  const handleChange = (e) => {
    if (type === "number") {
      const v = e.target.value === "" ? "" : Number(e.target.value);
      onChange(Number.isNaN(v) ? e.target.value : v);
    } else {
      onChange(e.target.value);
    }
  };
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <Input type={type} value={displayValue} onChange={handleChange} disabled={disabled} className="h-8" />
    </div>
  );
}

function AdminCarSelectRow({ label, value, onChange, options, emptySentinel }) {
  const displayValue = emptySentinel ? (value ?? "") || emptySentinel : String(value ?? "");
  const onSelect = (v) => onChange(emptySentinel && v === emptySentinel ? "" : v);
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <Select value={displayValue} onValueChange={onSelect}>
        <SelectTrigger className="h-8">
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

const ACCEPT_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

function EditCarView({ car, setCar, imgUrl, onClose, onSaved }) {
  const { toast } = useToast();
  const [replacing, setReplacing] = useState(null);
  const [dragOverImageType, setDragOverImageType] = useState(null);
  const fileInputRefs = React.useRef({});

  const setVal = (key, value) => setCar((p) => ({ ...p, [key]: value }));

  const displayUrl = (fullUrlKey, pathKey) => {
    const full = car?.[fullUrlKey];
    if (full) return full;
    return imgUrl(car?.[pathKey]);
  };

  const isImageFile = (file) => file && file.type && ACCEPT_IMAGE_TYPES.includes(file.type);

  const handleReplaceImage = async (imageType, file) => {
    if (!file || !car?.id) return;
    if (!isImageFile(file)) {
      toast({ title: "Invalid file", description: "Please use a JPG or PNG image.", variant: "destructive" });
      return;
    }
    setReplacing(imageType);
    try {
      const res = await updateCarPhoto(car.id, file, imageType);
      const data = res.data || res;
      const updated = data?.car ?? data ?? car;
      setCar(updated);
      toast({ title: "Saved", description: `${imageType} image updated`, variant: "default" });
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
      <div className="flex flex-wrap gap-1.5">
        {arr.map((x, idx) => (
          <Badge key={idx} variant="outline">
            {typeof x === "string" ? x : (x?.name ?? JSON.stringify(x))}
          </Badge>
        ))}
      </div>
    );
  };

  const ToggleRow = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between gap-2 py-1">
      <div className="text-sm">{label}</div>
      <button
        type="button"
        role="switch"
        aria-checked={!!value}
        onClick={() => onChange(!value)}
        className={[
          "relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors",
          value ? "bg-teal-600" : "bg-muted",
          "focus:outline-none focus:ring-2 focus:ring-teal-500/40",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
            value ? "translate-x-5" : "translate-x-1",
          ].join(" ")}
        />
      </button>
    </div>
  );

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

  const cylinderOptions = [{ label: "—", value: "" }, { label: "4", value: "4" }, { label: "6", value: "6" }, { label: "8", value: "8" }, { label: "10", value: "10" }, { label: "12", value: "12" }];
  const statusOptions = [
    { label: "Available", value: "available" },
    { label: "Not Available", value: "not_available" },
    { label: "Rented", value: "rented" },
    { label: "Maintenance", value: "maintenance" },
  ];

  return (
    <div className="space-y-3">
      {/* Basic info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-2">
        <AdminCarInputRow label="ID" value={car?.id} onChange={() => {}} disabled />
        <AdminCarInputRow label="Make" value={car?.make ?? ""} onChange={(v) => setVal("make", v)} />
        <AdminCarInputRow label="Model" value={car?.model ?? ""} onChange={(v) => setVal("model", v)} />
        <AdminCarInputRow label="Year" value={car?.year ?? ""} onChange={(v) => setVal("year", v)} type="number" />
        <AdminCarSelectRow label="Cylinder" value={car?.cylinder_number} onChange={(v) => setVal("cylinder_number", v)} options={cylinderOptions} emptySentinel="__none__" />
        <AdminCarInputRow label="License Plate" value={car?.license_plate ?? ""} onChange={(v) => setVal("license_plate", v)} />
        <AdminCarInputRow label="Color" value={car?.color ?? ""} onChange={(v) => setVal("color", v)} />
        <AdminCarInputRow label="Mileage" value={car?.mileage ?? ""} onChange={(v) => setVal("mileage", v)} type="number" />
        <AdminCarInputRow label="Fuel Type" value={car?.fuel_type ?? ""} onChange={(v) => setVal("fuel_type", v)} />
        <AdminCarInputRow label="Transmission" value={car?.transmission ?? ""} onChange={(v) => setVal("transmission", v)} />
        <AdminCarInputRow label="Wheels Drive" value={car?.wheels_drive ?? ""} onChange={(v) => setVal("wheels_drive", v)} />
        <AdminCarInputRow label="Category" value={car?.car_category ?? ""} onChange={(v) => setVal("car_category", v)} />
        <AdminCarInputRow label="Seats" value={car?.seats ?? ""} onChange={(v) => setVal("seats", v)} type="number" />
        <AdminCarInputRow label="Doors" value={car?.doors ?? ""} onChange={(v) => setVal("doors", v)} type="number" />
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-2">
        <AdminCarInputRow label="Daily Rate" value={car?.daily_rate ?? ""} onChange={(v) => setVal("daily_rate", v)} type="number" />
        <AdminCarInputRow label="Holiday Rate" value={car?.holiday_rate ?? ""} onChange={(v) => setVal("holiday_rate", v)} type="number" />
        <AdminCarInputRow label="Deposit" value={car?.deposit ?? ""} onChange={(v) => setVal("deposit", v)} type="number" />
        <AdminCarInputRow label="Delivery Fees" value={car?.delivery_fees ?? ""} onChange={(v) => setVal("delivery_fees", v)} type="number" />
        <AdminCarInputRow label="Driver Fees" value={car?.driver_fees ?? ""} onChange={(v) => setVal("driver_fees", v)} type="number" />
      </div>

      {/* Limits & owner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-2">
        <AdminCarInputRow label="Min Rental Days" value={car?.min_rental_days ?? ""} onChange={(v) => setVal("min_rental_days", v)} type="number" />
        <AdminCarInputRow label="Max Driving Mileage" value={car?.max_driving_mileage ?? ""} onChange={(v) => setVal("max_driving_mileage", v)} type="number" />
        <AdminCarInputRow label="Agent ID" value={car?.agent_id ?? ""} onChange={(v) => setVal("agent_id", v)} type="number" />
        <AdminCarInputRow label="Insurance Expiry" value={car?.insurance_expiry ?? ""} onChange={(v) => setVal("insurance_expiry", v)} type="date" />
        <AdminCarInputRow label="Registration Expiry" value={car?.registration_expiry ?? ""} onChange={(v) => setVal("registration_expiry", v)} type="date" />
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-2">
        <AdminCarInputRow label="Views" value={car?.views_count ?? ""} onChange={(v) => setVal("views_count", v)} type="number" />
        <AdminCarInputRow label="Clicks" value={car?.clicks_count ?? ""} onChange={(v) => setVal("clicks_count", v)} type="number" />
        <AdminCarInputRow label="Search" value={car?.search_count ?? ""} onChange={(v) => setVal("search_count", v)} type="number" />
      </div>

      <div className="border-t border-border pt-2 mt-2" />

      <div className="flex flex-wrap gap-2 text-sm">
        <div className="w-full sm:w-auto min-w-[120px]">
          <div className="text-xs text-muted-foreground mb-0.5">Features</div>
          {listToBadges(car?.features)}
        </div>
        <div className="w-full sm:w-auto min-w-[120px]">
          <div className="text-xs text-muted-foreground mb-0.5">Add-ons</div>
          {listToBadges(car?.add_ons)}
        </div>
      </div>

      <div className="border-t border-border pt-2 mt-2" />

      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Car Images — drag & drop or click Replace</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-sm">Main</span>
            <input
              ref={(el) => (fileInputRefs.current.main = el)}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReplaceImage("main", f); }}
            />
            <Button type="button" variant="outline" size="sm" className="h-7" disabled={replacing === "main"} onClick={() => fileInputRefs.current.main?.click()}>
              {replacing === "main" ? "Uploading…" : "Replace"}
            </Button>
          </div>
          <div
            className={`relative rounded border transition-colors ${dragOverImageType === "main" ? "ring-2 ring-[#00A19C] bg-[#00A19C]/10" : ""}`}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverImageType("main"); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOverImageType((t) => (t === "main" ? null : t)); }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverImageType(null);
              const file = e.dataTransfer?.files?.[0];
              if (file) handleReplaceImage("main", file);
            }}
          >
            <a href={displayUrl("main_image_full_url", "main_image_url")} target="_blank" rel="noreferrer" className="block">
              <img src={displayUrl("main_image_full_url", "main_image_url")} alt="Main" className="w-full max-h-[200px] object-cover rounded border-0" />
            </a>
            {dragOverImageType === "main" && (
              <div className="absolute inset-0 flex items-center justify-center rounded bg-black/30 text-white text-sm font-medium">
                Drop image here
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {IMAGE_TYPES.filter((t) => t.type !== "main").map(({ type, label, fullKey, pathKey }) => (
            <div key={type} className="space-y-0.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-muted-foreground text-xs">{label}</span>
                <input
                  ref={(el) => (fileInputRefs.current[type] = el)}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReplaceImage(type, f); }}
                />
                <Button type="button" variant="outline" size="sm" className="h-6 px-1 text-xs" disabled={replacing === type} onClick={() => fileInputRefs.current[type]?.click()}>
                  {replacing === type ? "…" : "Replace"}
                </Button>
              </div>
              <div
                className={`relative rounded border transition-colors ${dragOverImageType === type ? "ring-2 ring-[#00A19C] bg-[#00A19C]/10" : ""}`}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverImageType(type); }}
                onDragLeave={(e) => { e.preventDefault(); setDragOverImageType((t) => (t === type ? null : t)); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverImageType(null);
                  const file = e.dataTransfer?.files?.[0];
                  if (file) handleReplaceImage(type, file);
                }}
              >
                <a href={displayUrl(fullKey, pathKey)} target="_blank" rel="noreferrer" className="block">
                  <img src={displayUrl(fullKey, pathKey)} alt={label} className="h-[80px] w-full object-cover rounded border-0" />
                </a>
                {dragOverImageType === type && (
                  <div className="absolute inset-0 flex items-center justify-center rounded bg-black/30 text-white text-xs font-medium">
                    Drop
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-2 mt-2" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
        <AdminCarSelectRow label="Status" value={car?.status} onChange={(v) => setVal("status", v)} options={statusOptions} />
        <div className="space-y-0.5">
          <div className="text-xs text-muted-foreground">Notes</div>
          <textarea
            className="w-full border rounded-md p-2 min-h-[72px] text-sm resize-y"
            value={car?.notes ?? ""}
            onChange={(e) => setVal("notes", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-y-1">
        <ToggleRow label="Car Accepted" value={car?.car_accepted} onChange={(v) => setVal("car_accepted", v ? 1 : 0)} />
        <ToggleRow label="Is Private" value={car?.is_private} onChange={(v) => setVal("is_private", v ? 1 : 0)} />
        <ToggleRow label="Is Deposit" value={car?.is_deposit} onChange={(v) => setVal("is_deposit", v ? 1 : 0)} />
        <ToggleRow label="With Driver" value={car?.with_driver} onChange={(v) => setVal("with_driver", v ? 1 : 0)} />
        <ToggleRow label="Is Delivered" value={car?.is_delivered} onChange={(v) => setVal("is_delivered", v ? 1 : 0)} />
      </div>

      <div className="pt-2 flex gap-2">
        <Button className="flex-1 h-8" onClick={save}>
          Update Car
        </Button>
        <Button variant="outline" className="w-24 h-8" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// End Tony Update
