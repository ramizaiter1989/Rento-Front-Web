import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { Search, Users, ChevronLeft, ChevronRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import UserCard from "@/components/UserCard";
import UserProfileModal from "@/components/admin/UserProfileModal";
import UserEditModal from "@/components/admin/UserEditModal";

const ITEMS_PER_PAGE = 25;

const AdminUsersPage = () => {
  const { toast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [modalType, setModalType] = useState(null); // "view" | "edit" | null

  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState([]);
  const [sort, setSort] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  /* ================= Fetch Users ================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data?.users?.data || []);
      } catch {
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

  const fetchUserDetails = async (id) => {
    try {
      const { data } = await api.get(`/admin/users/${id}`);
      return data.user;
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
      return null;
    }
  };

  /* ================= Filtering ================= */
  const filteredUsers = useMemo(() => {
    let data = [...users];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.phone_number?.includes(q) ||
          u.role?.toLowerCase().includes(q)
      );
    }

    if (roles.length > 0)
      data = data.filter((u) => roles.includes(u.role));

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      data = data.filter((u) => !!u.update_access === isActive);
    }

    if (sort === "az")
      data.sort((a, b) => a.username.localeCompare(b.username));

    if (sort === "za")
      data.sort((a, b) => b.username.localeCompare(a.username));

    if (sort === "newest")
      data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

    return data;
  }, [users, search, roles, statusFilter, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  );

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [search, roles, statusFilter, sort]);

  /* ================= Actions ================= */

  const handleDelete = async (id) => {
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

  const handleView = async (id) => {
    const details = await fetchUserDetails(id);
    if (!details) return;

    setSelectedUser(details);
    setModalType("view");
  };

  const handleEdit = async (id) => {
    const details = await fetchUserDetails(id);
    if (!details) return;

    setEditingUser(details);
    setModalType("edit");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
    setEditingUser(null);
  };

  /* ================= Render ================= */

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">

      {/* ================= VIEW MODAL ================= */}
      <UserProfileModal
        open={modalType === "view"}
        onClose={closeModal}
        user={selectedUser}
        onEdit={() => {
          setEditingUser(selectedUser);
          setModalType("edit");
        }}
      />

      {/* ================= EDIT MODAL ================= */}
      <UserEditModal
        open={modalType === "edit"}
        onClose={() => setModalType("view")}
        user={editingUser}
        onSaved={(updated) => {
          setUsers((prev) =>
            prev.map((u) => (u.id === updated.id ? updated : u))
          );

          setSelectedUser(updated);
          setEditingUser(updated);
          setModalType("view");

          toast({
            title: "Success",
            description: "User updated successfully",
          });
        }}
      />

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Users</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          Total:{" "}
          <span className="font-semibold text-foreground">
            {filteredUsers.length}
          </span>
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search user..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          aria-label="Toggle filters"
          onClick={() => setShowFilters((p) => !p)}
        >
          Filters
        </Button>
      </div>

      {/* ================= FILTERS ================= */}
      {showFilters && (
        <div className="grid md:grid-cols-3 gap-4 border rounded-lg p-4 bg-card">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="az">A–Z</SelectItem>
              <SelectItem value="za">Z–A</SelectItem>
            </SelectContent>
          </Select>

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

          <div className="flex gap-3 items-center text-sm">
            {["client", "agency", "admin"].map((r) => (
              <label key={r} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={roles.includes(r)}
                  onChange={(e) =>
                    setRoles((prev) =>
                      e.target.checked
                        ? [...prev, r]
                        : prev.filter((x) => x !== r)
                    )
                  }
                />
                <span className="capitalize">{r}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ================= GRID ================= */}
      {loading ? (
        <p className="text-muted-foreground text-center py-20">
          Loading users...
        </p>
      ) : paginatedUsers.length === 0 ? (
        <p className="text-muted-foreground text-center py-20">
          No users found
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {paginatedUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onView={() => handleView(user.id)}
              onEdit={() => handleEdit(user.id)}
              onDelete={() => handleDelete(user.id)}
            />
          ))}
        </div>
      )}

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (p) => (
              <Button
                key={p}
                size="sm"
                aria-label={`Go to page ${p}`}
                variant={page === p ? "default" : "outline"}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
