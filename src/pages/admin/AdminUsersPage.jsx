import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Eye, Pencil, Trash2, Search, Edit, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/hooks/use-toast";

// Start Tony Update
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

function truncate(text, max = 14) {
  if (!text) return "N/A";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}
// End Tony Update
const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  //Start tony update
  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  //End tony update

  /* filters */
  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState([]);
  const [sort, setSort] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  /* ============================
     Fetch users
  ============================ */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data?.users?.data || []);
        setTotal(res.data?.users?.total || 0);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  /* ============================
     Fetch user details tony 
  ============================ */
  const fetchUserDetails = async (id) => {
    try {
      const { data } = await api.get(`/admin/users/${id}`);
      return data.user;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
      return null;
    }
  };
  /* ============================
     Fetch user Profile picture tony 
  ============================ */
  const DEFAULT_AVATAR = "/avatar.png";
  const ASSET_BASE = "https://rento-lb.com/api/storage/";
  const getProfileImg = (u) => {
    const p = u?.profile_picture;
    if (!p) return DEFAULT_AVATAR;

    if (p.startsWith("http")) return p;
    const cleaned = p.startsWith("/") ? p.slice(1) : p;

    return ASSET_BASE + cleaned;
  };

  //End Tony Update
  /* ============================
     Filter + sort
  ============================ */
  const filteredUsers = useMemo(() => {
    let data = [...users];

    // search
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.phone_number?.includes(q) ||
          u.role?.toLowerCase().includes(q),
      );
    }

    // role filter (multi)
    if (roles.length > 0) {
      data = data.filter((u) => roles.includes(u.role));
    }

    // status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      data = data.filter((u) => !!u.update_access === isActive);
    }

    // sort
    if (sort === "az") {
      data.sort((a, b) => a.username.localeCompare(b.username));
    }
    if (sort === "za") {
      data.sort((a, b) => b.username.localeCompare(a.username));
    }
    if (sort === "newest") {
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return data;
  }, [users, search, roles, statusFilter, sort]);

  /* ============================
     Actions
  ============================ */

  const handleDeleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;

    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast({ title: "User deleted" });
    } catch {
      toast({
        title: "Error",
        description: "Delete failed",
        variant: "destructive",
      });
    }
  };

  /* ============================
     Render
  ============================ */
  return (
    <div className="space-y-6">
      {/* Start Tony Update  */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalType === "edit-user" ? "Edit User" : "User Details"}
            </DialogTitle>
          </DialogHeader>

          {modalType === "view-user" && selectedItem && (
            <UserDetailsView
              user={selectedItem}
              onEdit={() => {
                setEditingUser({ ...selectedItem });
                setModalType("edit-user");
              }}
              onClose={() => setModalOpen(false)}
            />
          )}
          {modalType === "edit-user" && editingUser && (
            <EditUserView
              user={editingUser}
              setUser={setEditingUser}
              onClose={() => {
                setModalOpen(false);
                setModalType("view-user");
              }}
              onSaved={(updated) => {
                setSelectedItem(updated);
                setEditingUser({ ...updated });
                setModalType("view-user");
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* End Tony Update */}
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      {/* FILTER BAR */}
      {/* TOP BAR */}
<div className="flex flex-wrap items-center justify-between gap-3">
  {/* Left: Search */}
  <div className="relative w-full sm:w-72">
    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Search user..."
      className="pl-9"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>
  

  {/* Right actions */}
  <div className="flex items-center gap-3">
    {/* Total users */}
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Users className="h-4 w-4" />
      <span>Total:</span>
      <span className="font-semibold text-foreground">
        {filteredUsers.length}
      </span>
    </div>

    {/* Toggle filters */}
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowFilters((p) => !p)}
    >
      Filters
    </Button>
  </div>
</div>

{showFilters && (
  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 rounded-lg border p-4 bg-background">
    {/* Sort */}
    <Select value={sort} onValueChange={setSort}>
      <SelectTrigger>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="az">A–Z</SelectItem>
        <SelectItem value="za">Z–A</SelectItem>
      </SelectContent>
    </Select>

    {/* Status */}
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="blocked">Blocked</SelectItem>
      </SelectContent>
    </Select>

    {/* Roles */}
    <div className="flex flex-wrap gap-3 text-sm">
      {["client", "agency", "admin"].map((r) => (
        <label key={r} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={roles.includes(r)}
            onChange={(e) => {
              const checked = e.target.checked;
              setRoles((prev) =>
                checked ? [...prev, r] : prev.filter((x) => x !== r)
              );
            }}
          />
          <span className="capitalize">{r}</span>
        </label>
      ))}
    </div>
  </div>
)}


      {/* USER CARDS */}
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <p className="p-6 text-muted-foreground text-center">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="p-6 text-muted-foreground text-center">No users found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="overflow-hidden border-2 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div
                      className="flex items-center gap-3 mb-3 cursor-pointer"
                      title={userTooltip(user)}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        openUserView(
                          user.id,
                          fetchUserDetails,
                          setSelectedItem,
                          setModalType,
                          setModalOpen,
                        )
                      }
                      onKeyDown={(e) => e.key === "Enter" && openUserView(user.id, fetchUserDetails, setSelectedItem, setModalType, setModalOpen)}
                    >
                      <img
                        src={getProfileImg(user)}
                        alt={user.username || "User"}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-muted"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/avatar.png";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.username || `User #${user.id}`}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{user.phone_number || "—"}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge variant="outline" className="capitalize">{user.role}</Badge>
                      {user.update_access ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Blocked</Badge>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          const fullDetails = await fetchUserDetails(user.id);
                          if (fullDetails) {
                            setSelectedItem(fullDetails);
                            setModalType("view-user");
                            setModalOpen(true);
                          }
                        }}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          const fullDetails = await fetchUserDetails(user.id);
                          if (fullDetails) {
                            setSelectedItem(fullDetails);
                            setEditingUser({ ...fullDetails });
                            setModalType("edit-user");
                            setModalOpen(true);
                          }
                        }}
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete user"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Remove User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
// Start Tony Update
function userTooltip(user) {
  if (!user) return "";

  const client = user.client || {};
  const qc = client.qualification_code || {};

  return [
    `User ID : ${user.id ?? "N/A"}`,
    `Age : ${qc.age ?? "N/A"}`,
    `Gender : ${user.gender ?? "N/A"}`,
    `City : ${user.city ?? "N/A"}`,
    `Bio : ${user.bio ?? "N/A"}`,
    `Profession : ${client.profession ?? "N/A"}`,
    `Email : ${user.email ?? "N/A"}`,
    `License number : ${client.license_number ?? "N/A"}`,
    `Average rating : ${client.average_rating ?? "N/A"}`,
    `OTP verification : ${user.otp_verification ?? "N/A"}`,
  ].join("\n");
}

export async function openUserView(
  id,
  fetchUserDetails,
  SelectItem,
  setModalType,
  setModalOpen,
) {
  const fullDetails = await fetchUserDetails(id);
  if (fullDetails) {
    SelectItem(fullDetails);
    setModalType("view-user");
    setModalOpen(true);
  }
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
const ASSET_BASE = "https://rento-lb.com/api/storage/";
const DEFAULT_AVATAR = "/avatar.png";

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

function DocCard({ title, path, fallback = null }) {
  const url = fileUrl(path, fallback);

  if (!url) {
    return <div className="text-sm text-muted-foreground">N/A</div>;
  }

  // If PDF → show PDF inside the card
  if (isPdf(url)) {
    const pdfUrl = `${url}#toolbar=0&navpanes=0&scrollbar=0`;
    return (
      <iframe
        title={title}
        src={pdfUrl}
        className="w-full max-w-[260px] h-[180px] rounded-md border bg-white"
      />
    );
  }

  // If Image → show thumbnail
  return (
    <img
      src={url}
      alt={title}
      className="w-full max-w-[260px] h-[180px] object-cover rounded-md border"
      onError={(e) => {
        if (fallback) {
          e.currentTarget.onerror = null;
          e.currentTarget.src = fallback;
        }
      }}
    />
  );
}

function UserDetailsView({ user, onEdit, onClose }) {
  const client = user?.client || {};

  function FieldRow({ label, value }) {
    return (
      <div className="flex items-center gap-2 test-sm">
        <span className="text-muted-foreground">{label} :</span>
        <span className="text-foreground">{value ?? "N/A"}</span>
      </div>
    );
  }
  // End Update Tony

  const Chip = ({ label, value, tone = "neutral" }) => {
    const cls =
      tone === "teal"
        ? "bg-teal-600 text-white"
        : tone === "red"
          ? "bg-red-600 text-white"
          : "bg-muted text-foreground";

    return (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className=" text-muted-foreground">{label}</span>

        <span
          className={`inline-flex items-center justify-center px-2 h-5 rounded text-xs font-semibold leading-none ${cls}`}
        >
          {value}
        </span>
      </div>
    );
  };

  const statusText = user?.status ? "Active" : "Inactive";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        <FieldRow label="ID" value={user?.id} />
        <FieldRow label="Username" value={user?.username} />

        <FieldRow label="Email" value={user?.email} />
        <FieldRow label="Phone Number" value={user?.phone_number} />

        <FieldRow label="First Name" value={user?.first_name} />
        <FieldRow label="Last Name" value={user?.last_name} />

        <FieldRow label="Gender" value={user?.gender} />
        <FieldRow label="Birth Date" value={formatDateOnly(user?.birth_date)} />

        <FieldRow label="City" value={user?.city} />
        <FieldRow label="Role" value={user?.role} />

        <div className="flex flex-wrap items-center gap-8 pt-1">
          <Chip
            label="Status:"
            value={statusText}
            tone={user?.status ? "teal" : "red"}
          />
        </div>

        <div className="flex flex-wrap items-center gap-8 pt-1">
          <Chip
            label="Verified by Admin:"
            value={user?.verified_by_admin ? "Yes" : "No"}
            tone={user?.verified_by_admin ? "teal" : "red"}
          />
        </div>

        <div className="flex flex-wrap items-center gap-8 pt-1">
          <Chip
            label="Is Locked:"
            value={user?.is_locked ? "Locked" : "Unlocked"}
            tone={user?.is_locked ? "red" : "teal"}
          />
        </div>

        <FieldRow label="Created At" value={formatDateTime(user?.created_at)} />
        <FieldRow label="Updated At" value={formatDateTime(user?.updated_at)} />
      </div>

      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        <FieldRow label="Bio" value={user?.bio} />
      </div>

      <div className="border-t pt-3" />

      <div className="text-sm font-semibold">Client Details</div>

      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        <FieldRow label="License Number" value={client?.license_number} />
        <FieldRow label="Profession" value={client?.profession} />

        <FieldRow label="Average Salary" value={client?.avg_salary} />
        <FieldRow label="Promo Code" value={client?.promo_code} />
      </div>

      <div className="border-t pt-3" />

      <div className="space-y-3">
        <div className="text-sm font-semibold">Documents</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profile Picture */}
          <div>
            <div className="text-muted-foreground">Profile Picture</div>
            <DocCard
              title="Profile Picture"
              path={user?.profile_picture}
              fallback={DEFAULT_AVATAR}
            />
          </div>

          {/* Driver License */}
          <div>
            <div className="text-muted-foreground">Driver License</div>
            <DocCard title="Driver License" path={client?.driver_license} />
          </div>

          {/* ID Card Front */}
          <div>
            <div className="text-muted-foreground">ID Card Front</div>
            <DocCard title="ID Card Front" path={user?.id_card_front} />
          </div>

          {/* ID Card Back */}
          <div>
            <div className="text-muted-foreground">ID Card Back</div>
            <DocCard title="ID Card Back" path={user?.id_card_back} />
          </div>
        </div>
      </div>

      <div className="pt-3 flex gap-2">
        <Button className="flex-1" onClick={onEdit}>
          Edit User
        </Button>

        <Button variant="outline" className="w-28" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

function EditUserView({ user, setUser, onClose, onSaved }) {
  const { toast } = useToast();

  const setVal = (key, value) => setUser((p) => ({ ...p, [key]: value }));

  const client = user?.client || {};

  const save = async () => {
    try {
      const payload = {
        verified_by_admin: !!user?.verified_by_admin,
        status: !!user?.status,
        is_locked: !!user?.is_locked,
        update_access: !!user?.update_access,
      };

      const { data } = await api.put(`/admin/users/${user.id}`, payload);

      const updated = data.user ?? data.data ?? user;

      toast({ title: "Saved", description: "User updated successfully" });
      onSaved?.(updated);
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const ToggleRow = ({ label, value, onChange }) => (
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        <div>
          <Label>ID</Label>
          <Input value={user?.id ?? ""} disabled />
        </div>

        <div>
          <Label>Username</Label>
          <Input value={user?.username ?? ""} disabled />
        </div>

        <div>
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>

        <div>
          <Label>Phone Number</Label>
          <Input value={user?.phone_number ?? ""} disabled />
        </div>

        <div>
          <Label>First Name</Label>
          <Input value={user?.first_name ?? ""} disabled />
        </div>

        <div>
          <Label>Last Name</Label>
          <Input value={user?.last_name ?? ""} disabled />
        </div>

        <div>
          <Label>Gender</Label>
          <Input value={user?.gender ?? ""} disabled />
        </div>

        <div>
          <Label>Birth Date</Label>
          <Input value={formatDateOnly(user?.birth_date)} disabled />
        </div>

        <div>
          <Label>City</Label>
          <Input value={user?.city ?? ""} disabled />
        </div>

        <div>
          <Label>Role</Label>
          <Input value={user?.role ?? ""} disabled />
        </div>

        <div>
          <Label>Created At</Label>
          <Input value={formatDateTime(user?.created_at)} disabled />
        </div>

        <div>
          <Label>Updated At</Label>
          <Input value={formatDateTime(user?.updated_at)} disabled />
        </div>

        <div className="col-span-2">
          <Label>Bio</Label>
          <textarea
            className="w-full border rounded-md p-2 min-h-[90px]"
            value={user?.bio ?? ""}
            disabled
          />
        </div>
      </div>

      <div className="border-t pt-3" />

      <div className="text-sm font-semibold">Client Details (Read-only)</div>

      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        <div>
          <Label>License Number</Label>
          <Input value={client?.license_number ?? ""} disabled />
        </div>

        <div>
          <Label>Profession</Label>
          <Input value={client?.profession ?? ""} disabled />
        </div>

        <div>
          <Label>Average Salary</Label>
          <Input value={client?.avg_salary ?? ""} disabled />
        </div>

        <div>
          <Label>Promo Code</Label>
          <Input value={client?.promo_code ?? ""} disabled />
        </div>
      </div>

      <div className="border-t pt-3" />

      <div className="text-sm font-semibold">Editable Fields</div>

      <div className="rounded-md border p-3 space-y-1">
        <ToggleRow
          label="Verified by Admin"
          value={user?.verified_by_admin}
          onChange={(v) => setVal("verified_by_admin", v)}
        />

        <ToggleRow
          label="Status (Active)"
          value={user?.status}
          onChange={(v) => setVal("status", v)}
        />

        <ToggleRow
          label="Is Locked"
          value={user?.is_locked}
          onChange={(v) => setVal("is_locked", v)}
        />

        <ToggleRow
          label="Update Access Allow Profile Updates"
          value={user?.update_access}
          onChange={(v) => setVal("update_access", v)}
        />
      </div>

      <div className="pt-3 flex gap-2 justify-end">
        <Button className="w-36" onClick={save}>
          Update User
        </Button>

        <Button variant="outline" className="w-28" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// End Tony Update
