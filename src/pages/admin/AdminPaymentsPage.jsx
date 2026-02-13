import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { Eye, Edit, RefreshCw, ArrowUpDown, Plus } from "lucide-react";

/* ================= STYLES ================= */

const statusColor = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

const typeColor = {
  income: "bg-blue-100 text-blue-700",
  expense: "bg-purple-100 text-purple-700",
};
// Start Update Tony
function truncate(text, max = 14) {
  if (!text) return "N/A";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}
// End Update Tony
/* ================= PAGE ================= */

export default function AdminPaymentsPage() {
  /* ---------- DATA ---------- */
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- FILTER ---------- */
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);

  /* ---------- VIEW ---------- */
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  /* ---------- EDIT ---------- */
  const [editOpen, setEditOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  /* ---------- CREATE ---------- */
  const [createOpen, setCreateOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    user_id: "",
    amount: "",
    source: "cash",
    type: "income",
    status: "pending",
    due_date: "",
    description: "",
  });

  /* ================= FETCH ================= */

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/payments", {
        params: { per_page: 50 },
      });
      setPayments(data.payments?.data || []);
    } catch (err) {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  /* ================= FILTER & SORT ================= */

  const filteredPayments = useMemo(() => {
    let data = [...payments];

    if (search) {
      data = data.filter((p) =>
        `${p.id} ${p.reference_id} ${p.user?.first_name ?? ""} ${p.user?.last_name ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }

    data.sort((a, b) => (sortAsc ? a.amount - b.amount : b.amount - a.amount));

    return data;
  }, [payments, search, sortAsc]);

  /* ================= ACTIONS ================= */

  const viewPayment = (payment) => {
    setSelectedPayment(payment);
    setViewOpen(true);
  };

  const openEditPayment = (payment) => {
    setEditingPayment({ ...payment });
    setEditOpen(true);
  };

  const updatePayment = async () => {
    try {
      const payload = {
        status: editingPayment.status,
        source: editingPayment.source,
        due_date: editingPayment.due_date,
        description: editingPayment.description,
      };

      await api.put(`/admin/payments/${editingPayment.id}`, payload);
      toast.success("Payment updated");
      setEditOpen(false);
      fetchPayments();
    } catch {
      toast.error("Failed to update payment");
    }
  };

  const createPayment = async () => {
    try {
      const payload = {
        user_id: Number(newPayment.user_id),
        amount: Number(newPayment.amount),
        source: newPayment.source,
        type: newPayment.type,
        status: newPayment.status,
        due_date: newPayment.due_date,
        description: newPayment.description,
      };

      await api.post("/admin/payments", payload);
      toast.success("Payment created");

      setCreateOpen(false);
      setNewPayment({
        user_id: "",
        amount: "",
        source: "cash",
        type: "income",
        status: "pending",
        due_date: "",
        description: "",
      });

      fetchPayments();
    } catch {
      toast.error("Failed to create payment");
    }
  };
  /* ============================
     Fetch user Profile picture tony 
  ============================ */
  const DEFAULT_AVATAR = "/avatar.png";
  const ASSET_BASE = "https://rento-lb.com/api/storage/";
  const getProfileImg = (u) => {
    const p = u?.user.profile_picture;
    if (!p) return DEFAULT_AVATAR;

    if (p.startsWith("http")) return p;
    const cleaned = p.startsWith("/") ? p.slice(1) : p;

    return ASSET_BASE + cleaned;
  };

  //End Tony Update
  /* ================= RENDER ================= */

  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Payments</h1>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={16} className="mr-1" />
            Add Payment
          </Button>

          <Input
            placeholder="Search…"
            className="h-8 w-48 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button
            size="icon"
            variant="ghost"
            aria-label="Sort amount"
            onClick={() => setSortAsc(!sortAsc)}
          >
            <ArrowUpDown size={16} />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            aria-label="Refresh payments"
            onClick={fetchPayments}
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredPayments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <span
                    className="item-name-hover inline-flex items-center gap-2 cursor-pointer"
                    title={paymentTooltip(p)}
                    role="button"
                    tabIndex={0}
                    onClick={() => viewPayment(p)}
                  >
                    {p.id}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="item-name-hover inline-flex items-center gap-2 cursor-pointer"
                    title={userTooltip(p)}
                  >
                    <img
                      src={getProfileImg(p)}
                      alt={p.user.username || "User"}
                      className="h-7 w-7 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/avatar.png";
                      }}
                    />
                    {truncate(
                      p.user ? `${p.user.first_name} ${p.user.last_name}` : "—",
                      14,
                    )}
                  </span>
                </TableCell>

                <TableCell>
                  <Badge className={typeColor[p.type]}>{p.type}</Badge>
                </TableCell>

                <TableCell>
                  <Badge className={statusColor[p.status]}>{p.status}</Badge>
                </TableCell>

                <TableCell>{p.source}</TableCell>
                <TableCell>${p.amount}</TableCell>

                <TableCell className="flex justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="View payment"
                    onClick={() => viewPayment(p)}
                  >
                    <Eye size={16} />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Edit payment"
                    onClick={() => openEditPayment(p)}
                  >
                    <Edit size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {!loading && filteredPayments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground"
                >
                  No payments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* VIEW MODAL */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Read-only</DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <b>ID:</b> {selectedPayment.id}
              </div>
              <div>
                <b>Reference:</b> {selectedPayment.reference_id}
              </div>
              <div>
                <b>User:</b> {selectedPayment.user?.first_name}{" "}
                {selectedPayment.user?.last_name}
              </div>
              <div>
                <b>Type:</b> {selectedPayment.type}
              </div>
              <div>
                <b>Status:</b> {selectedPayment.status}
              </div>
              <div>
                <b>Source:</b> {selectedPayment.source}
              </div>
              <div>
                <b>Amount:</b> ${selectedPayment.amount}
              </div>
              <div>
                <b>Due:</b>{" "}
                {new Date(selectedPayment.due_date).toLocaleString()}
              </div>
              <div className="col-span-2">
                <b>Description:</b> {selectedPayment.description || "—"}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>Editable fields only</DialogDescription>
          </DialogHeader>

          {editingPayment && (
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={editingPayment.status}
                  onValueChange={(v) =>
                    setEditingPayment({ ...editingPayment, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Source</Label>
                <Input
                  value={editingPayment.source}
                  onChange={(e) =>
                    setEditingPayment({
                      ...editingPayment,
                      source: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Due Date</Label>
                <Input
                  type="datetime-local"
                  value={editingPayment.due_date?.slice(0, 16)}
                  onChange={(e) =>
                    setEditingPayment({
                      ...editingPayment,
                      due_date: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={editingPayment.description || ""}
                  onChange={(e) =>
                    setEditingPayment({
                      ...editingPayment,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <Button className="w-full" onClick={updatePayment}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CREATE MODAL */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogDescription>Create a new payment</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              type="number"
              placeholder="User ID"
              value={newPayment.user_id}
              onChange={(e) =>
                setNewPayment({ ...newPayment, user_id: e.target.value })
              }
            />

            <Input
              type="number"
              placeholder="Amount"
              value={newPayment.amount}
              onChange={(e) =>
                setNewPayment({ ...newPayment, amount: e.target.value })
              }
            />

            <Select
              value={newPayment.type}
              onValueChange={(v) => setNewPayment({ ...newPayment, type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={newPayment.status}
              onValueChange={(v) => setNewPayment({ ...newPayment, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={newPayment.source}
              onValueChange={(v) => setNewPayment({ ...newPayment, source: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="datetime-local"
              value={newPayment.due_date}
              onChange={(e) =>
                setNewPayment({ ...newPayment, due_date: e.target.value })
              }
            />

            <Input
              placeholder="Description"
              value={newPayment.description}
              onChange={(e) =>
                setNewPayment({ ...newPayment, description: e.target.value })
              }
            />

            <Button className="w-full" onClick={createPayment}>
              Create Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Start Update Tony
function userTooltip(p) {
  if (!p) return "";

  const user = p.user || {};

  return [
    `User ID : ${user.id ?? "N/A"}`,
    `Real User ID : ${user.real_user_id ?? "N/A"}`,
    `Username : ${user.username ?? "N/A"}`,
    `Phone Number : ${user.phone_number ?? "N/A"}`,
    `Email : ${user.email ?? "N/A"}`,
    `Verified ByAadmin : ${user.verified_by_admin ?? "N/A"}`,
    `Gender : ${user.gender ?? "N/A"}`,
    `Birth Date : ${formatDateOnly(user.birth_date ?? "N/A")}`,
    `City : ${user.city ?? "N/A"}`,
    `Bio : ${user.bio ?? "N/A"}`,
    `Role : ${user.role ?? "N/A"}`,
  ].join("\n");
}

function paymentTooltip(p) {
  if (!p) return "";

  return [
    `User ID : ${p.user_id ?? "N/A"}`,
    `Name : ${p.name ?? "N/A"}`,
    `Issue Date : ${formatDateTime(p.issue_date ?? "N/A")}`,
    `Due Date : ${formatDateTime(p.due_date ?? "N/A")}`,
    `Reference ID : ${p.reference_id ?? "N/A"}`,
    `Description : ${p.description ?? "N/A"}`,
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

// End Update Tony
