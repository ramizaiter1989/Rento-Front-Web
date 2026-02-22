/**
 * Admin Real User Data Page
 *
 * Same concept as /admin-panel-page: users list with modal.
 * Select user from list to create/edit real user data.
 * Displays user's ID card and license images in modal.
 * Users loaded with pagination.
 */

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Edit,
  X,
  Save,
  Loader2,
  Image as ImageIcon,
  UserCheck,
  RefreshCcw,
  Check,
  List,
  Link2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Shield,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  getUsers,
  getUser,
  getRealUserData,
  getRealUserDataByUser,
  createOrUpdateRealUserData,
  updateRealUserDataStatus,
  updateRealUserDataCheck,
  deleteRealUserData,
  linkRealUserDataToUser,
  downloadRealUserImage,
  replaceRealUserImage,
} from "@/lib/adminApi";
import { toast } from "sonner";
import { COLORS } from "@/contexts/AdminContext";

const ASSET_BASE = "https://rento-lb.com/api/storage/";
const API_BASE = "https://rento-lb.com/api/api";
const DEFAULT_AVATAR = "/avatar.png";
const FETCH_ALL_PER_PAGE = 500;
const IMAGE_TYPES = [
  { key: "id_card_front", label: "ID Card Front" },
  { key: "id_card_back", label: "ID Card Back" },
  { key: "driver_license", label: "Driver License" },
  { key: "profile_picture", label: "Profile Picture" },
];

function fileUrl(path, fallback = null) {
  if (!path) return fallback;
  if (path.startsWith("http")) return path;
  const cleaned = path.startsWith("/") ? path.slice(1) : path;
  return ASSET_BASE + cleaned;
}

function isPdf(pathOrUrl) {
  if (!pathOrUrl) return false;
  return String(pathOrUrl).toLowerCase().split("?")[0].endsWith(".pdf");
}

const IMG_W = 420;
const IMG_H = 300;
const LENS_SIZE = 120;
const ZOOM = 2.5;

function MagnifierImage({ src, alt, className = "" }) {
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const onMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPos({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    });
  };

  const width = ref.current?.getBoundingClientRect().width || IMG_W;
  const height = ref.current?.getBoundingClientRect().height || IMG_H;

  const cx = pos.x * width;
  const cy = pos.y * height;

  // Background should be centered exactly under cursor
  const bgX = -(cx * ZOOM - LENS_SIZE / 2);
  const bgY = -(cy * ZOOM - LENS_SIZE / 2);

  // Lens is centered on cursor, clamped inside image
  const lensLeft = Math.max(
    0,
    Math.min(width - LENS_SIZE, cx - LENS_SIZE / 2)
  );
  const lensTop = Math.max(
    0,
    Math.min(height - LENS_SIZE, cy - LENS_SIZE / 2)
  );

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-lg border-4 border-gray-300 dark:border-gray-600 shadow-md cursor-crosshair ${className}`}
      style={{ width: IMG_W, height: IMG_H }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={onMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        style={{ width: IMG_W, height: IMG_H }}
        draggable={false}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/avatar.png";
        }}
      />
      {hover && (
        <div
          className="absolute pointer-events-none rounded-full border-2 border-white shadow-xl bg-no-repeat"
          style={{
            width: LENS_SIZE,
            height: LENS_SIZE,
            left: lensLeft,
            top: lensTop,
            backgroundImage: `url(${src})`,
            backgroundSize: `${width * ZOOM}px ${height * ZOOM}px`,
            backgroundPosition: `${bgX}px ${bgY}px`,
          }}
        />
      )}
    </div>
  );
}

function DocCard({ title, path, fallback = null }) {
  const url = fileUrl(path, fallback);
  if (!url) return <div className="text-sm text-muted-foreground">N/A</div>;
  if (isPdf(url)) {
    const pdfUrl = `${url}#toolbar=0&navpanes=0&scrollbar=0`;
    return (
      <iframe
        title={title}
        src={pdfUrl}
        className="w-full rounded-lg border-4 border-gray-300 dark:border-gray-600 shadow-md bg-white"
        style={{ width: IMG_W, height: IMG_H }}
      />
    );
  }
  return <MagnifierImage src={url} alt={title} />;
}

function DocCardWithActions({ title, path, userId, imageType, onReplaced }) {
  const url = fileUrl(path, null);
  const fileInputRef = useRef(null);
  const [replacing, setReplacing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!userId || !imageType) return;
    setDownloading(true);
    try {
      const blob = await downloadRealUserImage(userId, imageType);
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `user_${userId}_${imageType}.${isPdf(path) ? "pdf" : "jpg"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success(`${title} downloaded`);
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to download ${title}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleReplace = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId || !imageType) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }
    setReplacing(true);
    try {
      const res = await replaceRealUserImage(userId, imageType, file);
      toast.success(res.data?.message || `${title} replaced`);
      if (onReplaced) onReplaced(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to replace ${title}`);
    } finally {
      setReplacing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden border-4 border-dashed border-gray-400 dark:border-gray-500 min-h-[300px] p-1">
        {url ? (
          <DocCard title={title} path={path} />
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Not uploaded</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!url || downloading}
          onClick={handleDownload}
          className="flex-1 text-xs"
        >
          {downloading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
          Download
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={replacing}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 text-xs"
        >
          {replacing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
          Replace
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          className="hidden"
          onChange={handleReplace}
        />
      </div>
    </div>
  );
}

function getProfileImg(u) {
  const p = u?.profile_picture;
  if (!p) return DEFAULT_AVATAR;
  if (p.startsWith("http")) return p;
  const cleaned = p.startsWith("/") ? p.slice(1) : p;
  return ASSET_BASE + cleaned;
}

/** User status for Real User Data page — one of 4 clear states */
const USER_STATUS = {
  VERIFIED: "verified",
  WAITING_ADMIN: "waiting_admin",
  PROFILE_INCOMPLETE: "profile_incomplete",
  PENDING_USER: "pending_user",
};

function getUserStatusType(user, pendingUserIds) {
  if (!user) return USER_STATUS.PROFILE_INCOMPLETE;
  const isVerified = !!user.verified_by_admin;
  const isProfileComplete = !!user.profile_complete;
  const isPendingRealData = pendingUserIds.includes(user.id);

  if (isVerified) return USER_STATUS.VERIFIED;
  if (isPendingRealData) return USER_STATUS.PENDING_USER;
  if (isProfileComplete) return USER_STATUS.WAITING_ADMIN;
  return USER_STATUS.PROFILE_INCOMPLETE;
}

export default function AdminRealUserDataPage() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [lastUpdatedUserId, setLastUpdatedUserId] = useState(null);
  const [pendingUserIds, setPendingUserIds] = useState([]);
  const [realStatusFilter, setRealStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("realData"); // "users" | "realData"
  const [realDataList, setRealDataList] = useState([]);
  const [realDataMeta, setRealDataMeta] = useState({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
  const [realDataPage, setRealDataPage] = useState(1);
  const [realDataStatusFilter, setRealDataStatusFilter] = useState("all");
  const [realDataUserIdFilter, setRealDataUserIdFilter] = useState("");
  const realDataPerPage = FETCH_ALL_PER_PAGE;
  const [realDataLoading, setRealDataLoading] = useState(false);
  const [statusReason, setStatusReason] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusDialogTarget, setStatusDialogTarget] = useState(null); // { status: 'approved'|'not_approved'|'pending' }
  const [linkRealDataId, setLinkRealDataId] = useState("");
  const [linking, setLinking] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    id_number: "",
    passport_number: "",
    driver_license_number: "",
    gender: "",
    date_of_birth: "",
    mother_name: "",
    place_of_birth: "",
  });
  const [existingRealData, setExistingRealData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: perPage };
      if (roleFilter && roleFilter !== "all") params.role = roleFilter;
      if (searchQuery?.trim()) params.search = searchQuery.trim();
      const res = await getUsers(params);
      const payload = res.data?.users || res.data;
      let data = payload?.data || [];

      // Sort by newest users first (created_at desc when available)
      data = [...data].sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at) : 0;
        const db = b.created_at ? new Date(b.created_at) : 0;
        return db - da;
      });

      // Ensure the most recently updated/verified user card is pinned on top if we know its ID
      if (lastUpdatedUserId) {
        data = data.sort((a, b) => {
          if (a.id === lastUpdatedUserId) return -1;
          if (b.id === lastUpdatedUserId) return 1;
          return 0;
        });
      }

      setUsers(data);
      setMeta({
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        total: payload.total ?? 0,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  // Load users who have real user data in pending status
  const loadPendingRealUserData = async () => {
    try {
      const res = await getRealUserData({ status: "pending", per_page: 500 });
      const payload = res.data?.real_user_data || res.data;
      const data = payload?.data || [];
      const ids = data
        .map((item) => item.user_id)
        .filter((id) => id != null);
      setPendingUserIds(ids);
    } catch (err) {
      console.warn(
        "Failed to load pending real user data",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    loadPendingRealUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRealUserDataList = async () => {
    setRealDataLoading(true);
    try {
      const params = { page: realDataPage, per_page: FETCH_ALL_PER_PAGE };
      if (realDataStatusFilter && realDataStatusFilter !== "all") params.status = realDataStatusFilter;
      const uid = realDataUserIdFilter?.trim() ? parseInt(realDataUserIdFilter.trim(), 10) : null;
      if (uid != null && !Number.isNaN(uid)) params.user_id = uid;
      const res = await getRealUserData(params);
      const payload = res.data?.real_user_data || res.data;
      let data = payload?.data || [];
      // Sort: profile_completed=true on top, then by created_at desc
      data = [...data].sort((a, b) => {
        const aComplete = a.profile_completed ? 1 : 0;
        const bComplete = b.profile_completed ? 1 : 0;
        if (bComplete !== aComplete) return bComplete - aComplete;
        const da = a.created_at ? new Date(a.created_at) : 0;
        const db = b.created_at ? new Date(b.created_at) : 0;
        return db - da;
      });
      setRealDataList(data);
      setRealDataMeta({
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        per_page: payload.per_page ?? FETCH_ALL_PER_PAGE,
        total: payload.total ?? 0,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load real user data list");
      setRealDataList([]);
    } finally {
      setRealDataLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === "realData") loadRealUserDataList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, realDataPage, realDataStatusFilter]);

  const populateFormFromRealData = (real) => {
    if (!real) return;
    const dob = real.date_of_birth
      ? real.date_of_birth.includes("T")
        ? real.date_of_birth.split("T")[0]
        : real.date_of_birth
      : "";
    setExistingRealData(real);
    setFormData({
      first_name: real.first_name || "",
      middle_name: real.middle_name || "",
      last_name: real.last_name || "",
      id_number: real.id_number || "",
      passport_number: real.passport_number || "",
      driver_license_number: real.driver_license_number || "",
      gender: real.gender || "",
      date_of_birth: dob,
      mother_name: real.mother_name || "",
      place_of_birth: real.place_of_birth || "",
    });
  };

  const openModal = async (user) => {
    setSelectedUser(user);
    setModalOpen(true);
    setUserDetails(null);
    setExistingRealData(null);
    setFormData({
      first_name: "",
      middle_name: "",
      last_name: "",
      id_number: "",
      passport_number: "",
      driver_license_number: "",
      gender: "",
      date_of_birth: "",
      mother_name: "",
      place_of_birth: "",
    });

    try {
      const detailsRes = await getUser(user.id);
      const details = detailsRes.data?.user || detailsRes.data;
      setUserDetails(details);

      try {
        const realRes = await getRealUserDataByUser(user.id);
        const real = realRes.data?.data ?? realRes.data?.real_user_data;
        if (real) populateFormFromRealData(real);
      } catch (err) {
        if (err.response?.status !== 404) {
          console.warn("Real user data fetch:", err.response?.data?.message || err.message);
        }
      }
    } catch (err) {
      toast.error("Failed to load user details");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setUserDetails(null);
    setExistingRealData(null);
    setLinkRealDataId("");
    setStatusDialogOpen(false);
    setStatusDialogTarget(null);
    setStatusReason("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const payload = { ...formData };
    if (!payload.first_name || !payload.last_name || !payload.gender) {
      toast.error("First name, last name, and gender are required");
      return;
    }
    const hasId = !!(payload.id_number || payload.passport_number || payload.driver_license_number);
    if (!hasId) {
      toast.error(
        "At least one of ID number, passport number, or driver license number is required"
      );
      return;
    }

    setSubmitting(true);
    try {
      await createOrUpdateRealUserData(selectedUser.id, payload);
      toast.success("Real user data saved. User is now verified.");
      setLastUpdatedUserId(selectedUser.id);
      closeModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const openStatusDialog = (status) => {
    setStatusDialogTarget(status);
    setStatusReason("");
    setStatusDialogOpen(true);
  };

  const handleStatusChangeWithReason = async () => {
    if (!existingRealData?.id || !statusDialogTarget) return;
    const status = typeof statusDialogTarget === "object" ? statusDialogTarget.status : statusDialogTarget;
    try {
      await updateRealUserDataStatus(existingRealData.id, {
        status,
        reason_of_status: statusReason?.trim() || undefined,
      });
      toast.success(
        status === "approved" ? "User verified." : status === "pending" ? "Set to pending." : "Status updated."
      );
      setStatusDialogOpen(false);
      setStatusDialogTarget(null);
      setStatusReason("");
      const updated = { ...existingRealData, status, reason_of_status: statusReason?.trim() || null };
      setExistingRealData(updated);
      setLastUpdatedUserId(selectedUser?.id);
      if (viewMode === "realData") loadRealUserDataList();
      else {
        fetchUsers();
        await loadPendingRealUserData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleStatusChange = async (status) => {
    if (!existingRealData?.id) return;
    openStatusDialog(status);
  };

  const handleCheckToggle = async (checked) => {
    if (!existingRealData?.id) return;
    try {
      const res = await updateRealUserDataCheck(existingRealData.id, { is_checked: checked });
      const updated = res.data?.data ?? res.data;
      if (updated) setExistingRealData(updated);
      toast.success(checked ? "Marked as checked." : "Marked as unchecked.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update check status");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    if (!confirm("Delete real user data for this user?")) return;
    try {
      await deleteRealUserData(selectedUser.id);
      toast.success("Real user data deleted.");
      closeModal();
      fetchUsers();
      await loadPendingRealUserData();
      if (viewMode === "realData") loadRealUserDataList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleLinkRealUserData = async (e) => {
    e.preventDefault();
    const id = parseInt(linkRealDataId.trim(), 10);
    if (!selectedUser || !id || Number.isNaN(id)) {
      toast.error("Enter a valid real user data ID");
      return;
    }
    setLinking(true);
    try {
      await linkRealUserDataToUser(selectedUser.id, id);
      toast.success("Real user data linked to this user.");
      setLinkRealDataId("");
      const realRes = await getRealUserDataByUser(selectedUser.id);
      const real = realRes.data?.data ?? realRes.data?.real_user_data;
      if (real) populateFormFromRealData(real);
      if (viewMode === "realData") loadRealUserDataList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to link real user data");
    } finally {
      setLinking(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let list = users;
    if (realStatusFilter === "all") return list;

    const statusFilter = realStatusFilter;
    list = list.filter((u) => {
      const status = getUserStatusType(u, pendingUserIds);
      return status === statusFilter;
    });
    return list;
  }, [users, realStatusFilter, pendingUserIds]);
  const displayName = (u) =>
    u?.first_name && u?.last_name
      ? `${u.first_name} ${u.last_name}`
      : u?.username || u?.name || `User #${u?.id}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Real User Data</h1>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="agency">Agency</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={realStatusFilter}
          onValueChange={(v) => {
            setRealStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger
            className={[
              "w-56 font-medium",
              realStatusFilter === "all" && "bg-slate-100 border-slate-400",
              realStatusFilter === USER_STATUS.VERIFIED && "bg-emerald-100 border-emerald-500 text-emerald-800",
              realStatusFilter === USER_STATUS.WAITING_ADMIN && "bg-sky-100 border-sky-500 text-sky-800",
              realStatusFilter === USER_STATUS.PROFILE_INCOMPLETE && "bg-red-100 border-red-500 text-red-800",
              realStatusFilter === USER_STATUS.PENDING_USER && "bg-amber-100 border-amber-500 text-amber-800",
            ].join(" ")}
          >
            <SelectValue placeholder="Status filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            <SelectItem value={USER_STATUS.VERIFIED}>Verified by admin</SelectItem>
            <SelectItem value={USER_STATUS.WAITING_ADMIN}>Profile complete — waiting for admin</SelectItem>
            <SelectItem value={USER_STATUS.PROFILE_INCOMPLETE}>Profile not complete</SelectItem>
            <SelectItem value={USER_STATUS.PENDING_USER}>Pending — waiting for user</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={handleSearch}
          className="border-sky-500 text-sky-700 hover:bg-sky-50"
        >
          Search
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchUsers}
          className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* View mode: Users vs Real User Data list */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-3">
        <span className="text-sm font-medium text-muted-foreground">View:</span>
        <div className="flex rounded-lg border bg-muted/50 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("users")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "users" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            By Users
          </button>
          <button
            type="button"
            onClick={() => setViewMode("realData")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "realData" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-4 w-4" />
            By Real User Data
          </button>
        </div>
      </div>

      {/* Real User Data list view — filters and cards */}
      {viewMode === "realData" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="w-5 h-5" />
              Real User Data ({realDataMeta.total} records)
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Select
                value={realDataStatusFilter}
                onValueChange={(v) => { setRealDataStatusFilter(v); setRealDataPage(1); }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="not_approved">Not approved</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">User ID</Label>
                <Input
                  type="number"
                  placeholder="Filter by user ID"
                  className="w-32"
                  value={realDataUserIdFilter}
                  onChange={(e) => setRealDataUserIdFilter(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (setRealDataPage(1), loadRealUserDataList())}
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => { setRealDataPage(1); loadRealUserDataList(); }}>
                Apply filters
              </Button>
              <Button variant="outline" size="icon" onClick={loadRealUserDataList} disabled={realDataLoading}>
                <RefreshCcw className={`h-4 w-4 ${realDataLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {realDataLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : realDataList.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No real user data records</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {realDataList.map((row) => {
                  const u = row.user || {};
                  const client = u.client || {};
                  const isComplete = !!row.profile_completed;
                  const cStatus = row.completion_status || "unknown";

                  const cardBorder = isComplete
                    ? cStatus === "verified"
                      ? "border-emerald-400 bg-emerald-50/60"
                      : cStatus === "pending"
                      ? "border-amber-400 bg-amber-50/60"
                      : "border-sky-400 bg-sky-50/60"
                    : "border-red-300 bg-red-50/40";

                  const completionBadge = isComplete
                    ? cStatus === "verified"
                      ? { className: "bg-emerald-100 border-emerald-500 text-emerald-800", label: "Verified" }
                      : cStatus === "pending"
                      ? { className: "bg-amber-100 border-amber-500 text-amber-800", label: "Pending" }
                      : { className: "bg-sky-100 border-sky-500 text-sky-800", label: "Waiting for Admin" }
                    : { className: "bg-red-100 border-red-500 text-red-800", label: "Profile Incomplete" };

                  const hasIdFront = !!u.id_card_front;
                  const hasIdBack = !!u.id_card_back;
                  const hasLicense = !!client.driver_license;
                  const docCount = [hasIdFront, hasIdBack, hasLicense].filter(Boolean).length;

                  return (
                    <Card key={row.id} className={`border-2 transition-shadow ${cardBorder}`}>
                      <CardContent className="p-4 space-y-3">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={getProfileImg(u)}
                              alt=""
                              className="h-12 w-12 rounded-full object-cover ring-2 ring-muted shrink-0"
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_AVATAR; }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate">{u.username || `User #${row.user_id}`}</p>
                              <p className="text-xs text-muted-foreground font-mono">User ID: {row.user_id} · Record ID: {row.id}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={`shrink-0 text-xs px-2 py-0.5 ${completionBadge.className}`}>
                            {completionBadge.label}
                          </Badge>
                        </div>

                        {/* Real name (from verified data) */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground text-xs">Real Name</span>
                            <p className="font-medium">{row.first_name} {row.middle_name ? `${row.middle_name} ` : ""}{row.last_name}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Account Name</span>
                            <p>{u.first_name || "—"} {u.last_name || "—"}</p>
                          </div>
                        </div>

                        {/* User details */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{u.phone_number || "—"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{u.email || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{u.city || "—"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span>DOB: {row.date_of_birth ? new Date(row.date_of_birth).toLocaleDateString("en-GB") : "—"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Shield className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span>Gender: {row.gender || "—"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span>Role: {u.role || "—"}</span>
                          </div>
                        </div>

                        {/* ID numbers */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {row.id_number && (
                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-mono">
                              ID: {row.id_number}
                            </span>
                          )}
                          {row.passport_number && (
                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-mono">
                              Passport: {row.passport_number}
                            </span>
                          )}
                          {row.driver_license_number && (
                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-mono">
                              DL: {row.driver_license_number}
                            </span>
                          )}
                          {row.mother_name && (
                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                              Mother: {row.mother_name}
                            </span>
                          )}
                          {row.place_of_birth && (
                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                              POB: {row.place_of_birth}
                            </span>
                          )}
                        </div>

                        {/* Client-specific info */}
                        {client.id && (
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                              <Briefcase className="h-3 w-3 inline mr-1" />
                              {client.profession || "—"}
                            </span>
                            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                              Salary: {client.avg_salary || "—"}
                            </span>
                            {client.license_number && (
                              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-mono">
                                License#: {client.license_number}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Documents indicator */}
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className={docCount === 3 ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
                              {docCount}/3 docs uploaded
                            </span>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${hasIdFront ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                            ID Front {hasIdFront ? "✓" : "✗"}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${hasIdBack ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                            ID Back {hasIdBack ? "✓" : "✗"}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${hasLicense ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                            License {hasLicense ? "✓" : "✗"}
                          </span>
                        </div>

                        {/* Status & audit row */}
                        <div className="flex items-center justify-between pt-2 border-t gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge
                              className={
                                row.status === "approved"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : row.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {row.status}
                            </Badge>
                            {row.is_checked && (
                              <Badge variant="secondary" className="text-[10px]">
                                <Check className="h-3 w-3 mr-0.5" /> Checked
                              </Badge>
                            )}
                            {row.verified_by_admin_user_id != null && (
                              <span>Verified by admin #{row.verified_by_admin_user_id}</span>
                            )}
                            {row.reason_of_status && (
                              <span className="italic max-w-[200px] truncate" title={row.reason_of_status}>
                                Reason: {row.reason_of_status}
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => openModal({ ...(row.user || {}), id: (row.user && row.user.id) || row.user_id })}
                            style={{ background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal})` }}
                            className="text-white shrink-0"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            {realDataMeta.last_page > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm">
                <span className="text-muted-foreground">
                  Page {realDataMeta.current_page} of {realDataMeta.last_page} · Total {realDataMeta.total}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={realDataPage <= 1}
                    onClick={() => setRealDataPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={realDataPage >= realDataMeta.last_page}
                    onClick={() => setRealDataPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status legend — 4 clear states (when viewing by users) */}
      {viewMode === "users" && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" />
            Verified by admin (profile + real data done)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-300 text-sky-800 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-sm" />
            Profile complete — waiting for admin to fill data
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-300 text-red-800 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm" />
            Profile not complete
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-sm" />
            Pending — admin asked; waiting for user to send info
          </span>
        </div>
      )}

      {viewMode === "users" && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users — select one to fill real user data
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No users found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUsers.map((user) => {
                const status = getUserStatusType(user, pendingUserIds);
                const isVerified = status === USER_STATUS.VERIFIED;
                const isWaitingAdmin = status === USER_STATUS.WAITING_ADMIN;
                const isProfileIncomplete = status === USER_STATUS.PROFILE_INCOMPLETE;
                const isPendingUser = status === USER_STATUS.PENDING_USER;

                const cardClasses = [
                  "overflow-hidden border-2 transition-shadow rounded-xl",
                  isVerified && "border-emerald-400 bg-emerald-50/80 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
                  isWaitingAdmin && "border-sky-400 bg-sky-50/80 shadow-[0_0_10px_rgba(14,165,233,0.5)]",
                  isProfileIncomplete && "border-red-400 bg-red-50/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                  isPendingUser && "border-amber-400 bg-amber-50/80 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
                  lastUpdatedUserId === user.id && "ring-2 ring-emerald-400",
                ]
                  .filter(Boolean)
                  .join(" ");

                const statusLabel =
                  isVerified
                    ? "Verified by admin"
                    : isWaitingAdmin
                    ? "Waiting for admin"
                    : isProfileIncomplete
                    ? "Profile not complete"
                    : "Pending (waiting for user)";

                const statusBadgeClass =
                  isVerified
                    ? "bg-emerald-100 border-emerald-500 text-emerald-800"
                    : isWaitingAdmin
                    ? "bg-sky-100 border-sky-500 text-sky-800"
                    : isProfileIncomplete
                    ? "bg-red-100 border-red-500 text-red-800"
                    : "bg-amber-100 border-amber-500 text-amber-800";

                return (
                  <Card key={user.id} className={cardClasses}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={getProfileImg(user)}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-muted"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_AVATAR;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{displayName(user)}</p>
                        <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined:{" "}
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString("en-GB")
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm mb-3">
                      <p className="truncate">
                        <span className="text-muted-foreground">Name: </span>
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : "—"}
                      </p>
                      <p className="truncate">
                        <span className="text-muted-foreground">Phone: </span>
                        {user.phone_number || "—"}
                      </p>
                      <p className="truncate">
                        <span className="text-muted-foreground">Username: </span>
                        {user.username || "—"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="flex flex-col gap-1">
                        <Badge variant="outline" className={`w-fit px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass}`}>
                          {statusLabel}
                        </Badge>
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-xs">
                            <UserCheck className="h-3.5 w-3.5" /> Real data filled
                          </span>
                        )}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => openModal(user)}
                        style={{
                          background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal})`,
                        }}
                        className="text-white shadow-sm hover:shadow-md"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Fill Real Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {viewMode === "users" && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {meta.current_page} of {meta.last_page} · Total {meta.total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && selectedUser && (
          <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Real User Data — {displayName(selectedUser)} (ID: {selectedUser.id})
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User info summary card */}
                {userDetails && (
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-xs text-muted-foreground block">Username</span>
                          <span className="font-medium">{userDetails.username || "—"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Phone</span>
                          <span className="font-medium">{userDetails.phone_number || "—"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Email</span>
                          <span className="font-medium">{userDetails.email || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Role</span>
                          <Badge variant="outline" className="text-xs">{userDetails.role || "—"}</Badge>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">City</span>
                          <span>{userDetails.city || "—"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Gender</span>
                          <span>{userDetails.gender || "—"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Birth Date</span>
                          <span>{userDetails.birth_date ? new Date(userDetails.birth_date).toLocaleDateString("en-GB") : "—"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Verified</span>
                          <Badge className={userDetails.verified_by_admin ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
                            {userDetails.verified_by_admin ? "Yes" : "No"}
                          </Badge>
                        </div>
                        {userDetails.client && (
                          <>
                            <div>
                              <span className="text-xs text-muted-foreground block">Profession</span>
                              <span>{userDetails.client.profession || "—"}</span>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block">Avg Salary</span>
                              <span>{userDetails.client.avg_salary || "—"}</span>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block">License #</span>
                              <span className="font-mono">{userDetails.client.license_number || "—"}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ID Card & License Images with Download / Replace */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Hover over images to magnify. Use buttons below each image to download or replace.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        ID Card — Front
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DocCardWithActions
                        title="ID Card Front"
                        path={userDetails?.id_card_front}
                        userId={selectedUser?.id}
                        imageType="id_card_front"
                        onReplaced={(data) => {
                          if (data?.user) setUserDetails((prev) => ({ ...prev, id_card_front: data.user.id_card_front }));
                        }}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        ID Card — Back
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DocCardWithActions
                        title="ID Card Back"
                        path={userDetails?.id_card_back}
                        userId={selectedUser?.id}
                        imageType="id_card_back"
                        onReplaced={(data) => {
                          if (data?.user) setUserDetails((prev) => ({ ...prev, id_card_back: data.user.id_card_back }));
                        }}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Driver License
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DocCardWithActions
                        title="Driver License"
                        path={userDetails?.client?.driver_license}
                        userId={selectedUser?.id}
                        imageType="driver_license"
                        onReplaced={(data) => {
                          if (data?.user?.client) {
                            setUserDetails((prev) => ({
                              ...prev,
                              client: { ...prev.client, driver_license: data.user.client.driver_license },
                            }));
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Picture */}
                <div className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Profile Picture
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-w-[200px]">
                        <DocCardWithActions
                          title="Profile Picture"
                          path={userDetails?.profile_picture}
                          userId={selectedUser?.id}
                          imageType="profile_picture"
                          onReplaced={(data) => {
                            if (data?.user) setUserDetails((prev) => ({ ...prev, profile_picture: data.user.profile_picture }));
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                </div>

                {/* Real User Data Form Fields — user data above each */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Real First Name *</Label>
                    {userDetails?.first_name && (
                      <p className="text-xs text-muted-foreground">User: {userDetails.first_name}</p>
                    )}
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middle_name">Real Middle Name</Label>
                    {userDetails?.client?.middle_name && (
                      <p className="text-xs text-muted-foreground">User: {userDetails.client.middle_name}</p>
                    )}
                    <Input
                      id="middle_name"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Real Last Name *</Label>
                    {userDetails?.last_name && (
                      <p className="text-xs text-muted-foreground">User: {userDetails.last_name}</p>
                    )}
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id_number">Real ID Number</Label>
                    {userDetails?.client?.id_number && (
                      <p className="text-xs text-muted-foreground">User: {userDetails.client.id_number}</p>
                    )}
                    <Input
                      id="id_number"
                      name="id_number"
                      value={formData.id_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passport_number">Real Passport Number</Label>
                    {userDetails?.client?.passport_number && (
                      <p className="text-xs text-muted-foreground">User: {userDetails.client.passport_number}</p>
                    )}
                    <Input
                      id="passport_number"
                      name="passport_number"
                      value={formData.passport_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver_license_number">Real Driver License Number</Label>
                    {(userDetails?.client?.license_number || userDetails?.client?.driver_license_number || userDetails?.driver_license_number) && (
                      <p className="text-xs text-muted-foreground">User: {userDetails.client?.license_number || userDetails.client?.driver_license_number || userDetails.driver_license_number}</p>
                    )}
                    <Input
                      id="driver_license_number"
                      name="driver_license_number"
                      value={formData.driver_license_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Real Gender *</Label>
                    {(userDetails?.client?.gender || userDetails?.gender) && (
                      <p className="text-xs text-muted-foreground">User: {userDetails.client?.gender || userDetails.gender}</p>
                    )}
                    <Select
                      value={formData.gender}
                      onValueChange={(v) => handleSelectChange("gender", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Real Date of Birth</Label>
                    {(userDetails?.client?.birth_date || userDetails?.birth_date || userDetails?.client?.date_of_birth || userDetails?.date_of_birth) && (
                      <p className="text-xs text-muted-foreground">User: {userDetails.client?.birth_date || userDetails.birth_date || userDetails.client?.date_of_birth || userDetails.date_of_birth}</p>
                    )}
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mother_name">Real Mother's Name</Label>
                    {userDetails?.client?.mother_name && (
                      <p className="text-xs text-muted-foreground">User: {userDetails.client.mother_name}</p>
                    )}
                    <Input
                      id="mother_name"
                      name="mother_name"
                      value={formData.mother_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="place_of_birth">Real Place of Birth</Label>
                    {userDetails?.client?.place_of_birth && (
                      <p className="text-xs text-muted-foreground">User: {userDetails.client.place_of_birth}</p>
                    )}
                    <Input
                      id="place_of_birth"
                      name="place_of_birth"
                      value={formData.place_of_birth}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {existingRealData && (
                  <>
                    <Card className="bg-muted/40">
                      <CardHeader>
                        <CardTitle className="text-sm">Verification &amp; audit</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex flex-wrap gap-4">
                          <span className="text-muted-foreground">
                            Verified by admin user ID:{" "}
                            <span className="font-mono font-medium text-foreground">
                              {existingRealData.verified_by_admin_user_id ?? "—"}
                            </span>
                          </span>
                          {existingRealData.reason_of_status && (
                            <span className="text-muted-foreground">
                              Reason:{" "}
                              <span className="font-medium text-foreground">{existingRealData.reason_of_status}</span>
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/40">
                      <CardHeader>
                        <CardTitle className="text-sm">Follow-up / Check</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium">Mark as checked</Label>
                            <Switch
                              checked={!!existingRealData.is_checked}
                              onCheckedChange={handleCheckToggle}
                              aria-label="Toggle checked status"
                            />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Is checked:{" "}
                            <span className="font-medium text-foreground">
                              {existingRealData.is_checked ? "Yes" : "No"}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Checked by admin user ID:{" "}
                            <span className="font-mono font-medium">
                              {existingRealData.checked_by_admin_user_id ?? "—"}
                            </span>
                          </div>
                          {existingRealData.is_checked && (
                            <Badge variant="secondary" className="text-xs">
                              Checked
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Link existing real user data to this user */}
                <Card className="bg-muted/30 border-dashed">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      Link existing real user data to this user
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-end gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Real user data record ID</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 5"
                          className="w-28"
                          value={linkRealDataId}
                          onChange={(e) => setLinkRealDataId(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleLinkRealUserData(e))}
                        />
                      </div>
                      <Button type="button" size="sm" disabled={linking} onClick={handleLinkRealUserData}>
                        {linking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4 mr-1" />}
                        Link to this user
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <DialogFooter className="flex-wrap gap-2">
                  {existingRealData && (
                    <>
                      {existingRealData.status !== "approved" && (
                        <Button
                          type="button"
                          onClick={() => handleStatusChange("approved")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      )}
                      {existingRealData.status !== "pending" && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleStatusChange("pending")}
                          className="border-amber-500 text-amber-700 hover:bg-amber-50"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Set to Pending
                        </Button>
                      )}
                      {existingRealData.status !== "not_approved" && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => handleStatusChange("not_approved")}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDelete}
                        className="text-red-500"
                      >
                        Delete Real Data
                      </Button>
                    </>
                  )}
                  <Button type="button" variant="outline" onClick={closeModal} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal})`,
                    }}
                    className="text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Real Data
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Status reason dialog — optional reason when approving / rejecting / setting pending */}
      <Dialog open={statusDialogOpen} onOpenChange={(open) => !open && (setStatusDialogOpen(false), setStatusDialogTarget(null), setStatusReason(""))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {statusDialogTarget === "approved" && "Approve verification"}
              {statusDialogTarget === "not_approved" && "Reject verification"}
              {statusDialogTarget === "pending" && "Set to Pending (waiting for user)"}
              {statusDialogTarget && typeof statusDialogTarget === "object" && statusDialogTarget.status && `Status: ${statusDialogTarget.status}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="status_reason">Reason or note (optional)</Label>
            <textarea
              id="status_reason"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g. Please send new ID photo"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => (setStatusDialogOpen(false), setStatusDialogTarget(null), setStatusReason(""))}>
              Cancel
            </Button>
            <Button onClick={handleStatusChangeWithReason}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
