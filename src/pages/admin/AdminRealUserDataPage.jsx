/**
 * Admin Real User Data Page
 *
 * Same concept as /admin-panel-page: users list with modal.
 * Select user from list to create/edit real user data.
 * Displays user's ID card and license images in modal.
 * Users loaded with pagination.
 */

import React, { useEffect, useState, useRef } from "react";
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
import {
  getUsers,
  getUser,
  getRealUserDataByUser,
  createOrUpdateRealUserData,
  updateRealUserDataStatus,
  deleteRealUserData,
} from "@/lib/adminApi";
import { toast } from "sonner";
import { COLORS } from "@/contexts/AdminContext";

const ASSET_BASE = "https://rento-lb.com/api/storage/";
const DEFAULT_AVATAR = "/avatar.png";
const perPage = 20;

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

const IMG_W = 360;
const IMG_H = 260;
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
    setPos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
  };

  const cx = pos.x * IMG_W;
  const cy = pos.y * IMG_H;
  const bgX = -(cx * ZOOM - LENS_SIZE / 2);
  const bgY = -(cy * ZOOM - LENS_SIZE / 2);
  const lensLeft = Math.max(0, Math.min(IMG_W - LENS_SIZE, pos.x * IMG_W - LENS_SIZE / 2));
  const lensTop = Math.max(0, Math.min(IMG_H - LENS_SIZE, pos.y * IMG_H - LENS_SIZE / 2));

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-md border cursor-crosshair ${className}`}
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
            backgroundSize: `${IMG_W * ZOOM}px ${IMG_H * ZOOM}px`,
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
        className="w-full rounded-md border bg-white"
        style={{ width: IMG_W, height: IMG_H }}
      />
    );
  }
  return <MagnifierImage src={url} alt={title} />;
}

function getProfileImg(u) {
  const p = u?.profile_picture;
  if (!p) return DEFAULT_AVATAR;
  if (p.startsWith("http")) return p;
  const cleaned = p.startsWith("/") ? p.slice(1) : p;
  return ASSET_BASE + cleaned;
}

export default function AdminRealUserDataPage() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

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
      const data = payload?.data || [];
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
        if (real) {
          setExistingRealData(real);
          setFormData({
            first_name: real.first_name || "",
            middle_name: real.middle_name || "",
            last_name: real.last_name || "",
            id_number: real.id_number || "",
            passport_number: real.passport_number || "",
            driver_license_number: real.driver_license_number || "",
            gender: real.gender || "",
            date_of_birth: real.date_of_birth || "",
            mother_name: real.mother_name || "",
            place_of_birth: real.place_of_birth || "",
          });
        }
      } catch {
        // No real user data yet
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
      closeModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (status) => {
    if (!existingRealData?.id) return;
    try {
      await updateRealUserDataStatus(existingRealData.id, { status });
      toast.success(status === "approved" ? "User verified." : "Status updated.");
      closeModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
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
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const filteredUsers = users;
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
        <Button variant="outline" onClick={handleSearch}>
          Search
        </Button>
        <Button variant="outline" size="icon" onClick={fetchUsers}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users — select one to fill real user data
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={getProfileImg(user)}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_AVATAR;
                          }}
                        />
                        <span>{displayName(user)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : "—"}
                    </TableCell>
                    <TableCell>{user.phone_number || "—"}</TableCell>
                    <TableCell>{user.username || "—"}</TableCell>
                    <TableCell>
                      {user.verified_by_admin ? (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => openModal(user)}
                        style={{
                          background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal})`,
                        }}
                        className="text-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Fill Real Data
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {meta.last_page > 1 && (
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
                {/* ID Card & License Images — larger scale, magnifier on hover */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Hover over images to magnify and see details</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        ID Card — Front
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed min-h-[260px]">
                        {userDetails?.id_card_front ? (
                          <DocCard title="ID Card Front" path={userDetails.id_card_front} />
                        ) : (
                          <div className="text-center text-muted-foreground py-12">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No Front ID</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        ID Card — Back
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed min-h-[260px]">
                        {userDetails?.id_card_back ? (
                          <DocCard title="ID Card Back" path={userDetails.id_card_back} />
                        ) : (
                          <div className="text-center text-muted-foreground py-12">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No Back ID</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Driver License
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed min-h-[260px]">
                        {userDetails?.client?.driver_license ? (
                          <DocCard
                            title="Driver License"
                            path={userDetails.client.driver_license}
                          />
                        ) : (
                          <div className="text-center text-muted-foreground py-12">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No License</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middle_name">Middle Name</Label>
                    <Input
                      id="middle_name"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id_number">ID Number</Label>
                    <Input
                      id="id_number"
                      name="id_number"
                      value={formData.id_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passport_number">Passport Number</Label>
                    <Input
                      id="passport_number"
                      name="passport_number"
                      value={formData.passport_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver_license_number">Driver License Number</Label>
                    <Input
                      id="driver_license_number"
                      name="driver_license_number"
                      value={formData.driver_license_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
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
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mother_name">Mother's Name</Label>
                    <Input
                      id="mother_name"
                      name="mother_name"
                      value={formData.mother_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="place_of_birth">Place of Birth</Label>
                    <Input
                      id="place_of_birth"
                      name="place_of_birth"
                      value={formData.place_of_birth}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

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
    </div>
  );
}
