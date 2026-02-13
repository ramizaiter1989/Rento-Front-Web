import React, { useState, useEffect, useCallback } from "react";
import {
  getPromoCodes,
  getUsers,
  deletePromoCode,
  updatePromoCode,
  createPromoCode,
  createBroker,
} from "@/lib/adminApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, RefreshCw, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ broker_id: "all", is_active: "all" });
  const [confirm, setConfirm] = useState({ open: false, title: "", message: "", onConfirm: null });
  const [modal, setModal] = useState({ open: false, type: null, item: null });
  const [form, setForm] = useState({
    code: "",
    broker_id: "",
    description: "",
    max_uses: "",
    commission_percentage: "",
    is_active: true,
    expires_at: "",
    username: "",
    phone_number: "",
    email: "",
    password: "",
    password_confirmation: "",
    first_name: "",
    last_name: "",
  });

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const params = { per_page: 100 };
      if (filters.broker_id !== "all") params.broker_id = filters.broker_id;
      if (filters.is_active !== "all") params.is_active = filters.is_active;
      const res = await getPromoCodes(params);
      const raw = res.data?.data ?? res.data?.promo_codes ?? res.data;
      setPromoCodes(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load promo codes");
      setPromoCodes([]);
    } finally {
      setLoading(false);
    }
  }, [filters.broker_id, filters.is_active]);

  const fetchBrokers = useCallback(async () => {
    try {
      const res = await getUsers({ role: "broker", per_page: 200 });
      const raw = res.data?.users?.data ?? res.data?.users ?? res.data?.data;
      setBrokers(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error(e);
      setBrokers([]);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  const handleDelete = (promo) => {
    setConfirm({
      open: true,
      title: "Delete Promo Code",
      message: `Are you sure you want to delete "${promo.code}"?`,
      onConfirm: async () => {
        try {
          await deletePromoCode(promo.id);
          toast.success("Promo code deleted");
          fetchPromos();
        } catch (e) {
          toast.error(e.response?.data?.message || "Delete failed");
        }
      },
    });
  };

  const openEdit = (item) => {
    setForm({
      code: item.code ?? "",
      broker_id: item.broker_id ? String(item.broker_id) : "",
      description: item.description ?? "",
      max_uses: item.max_uses ?? "",
      commission_percentage: item.commission_percentage ?? "",
      is_active: item.is_active !== false,
      expires_at: item.expires_at ? item.expires_at.slice(0, 10) : "",
    });
    setModal({ open: true, type: "edit", item });
  };

  const openCreate = () => {
    setForm({
      code: "",
      broker_id: "",
      description: "",
      max_uses: "",
      commission_percentage: "",
      is_active: true,
      expires_at: "",
    });
    setModal({ open: true, type: "create", item: null });
  };

  const openCreateBroker = () => {
    setForm({
      username: "",
      phone_number: "",
      email: "",
      password: "",
      password_confirmation: "",
      first_name: "",
      last_name: "",
    });
    setModal({ open: true, type: "create-broker", item: null });
  };

  const submitPromo = async () => {
    try {
      const payload = {
        code: form.code.trim(),
        broker_id: form.broker_id ? parseInt(form.broker_id, 10) : null,
        description: form.description.trim() || null,
        max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
        commission_percentage: form.commission_percentage ? parseFloat(form.commission_percentage) : 0,
        is_active: form.is_active,
        expires_at: form.expires_at || null,
      };
      if (modal.type === "edit") {
        await updatePromoCode(modal.item.id, payload);
        toast.success("Promo code updated");
      } else {
        await createPromoCode(payload);
        toast.success("Promo code created");
      }
      setModal({ open: false, type: null, item: null });
      fetchPromos();
    } catch (e) {
      const msg = e.response?.data?.message || (e.response?.data?.errors && Object.values(e.response.data.errors).flat().join(" ")) || "Failed";
      toast.error(msg);
    }
  };

  const submitBroker = async () => {
    try {
      await createBroker({
        username: form.username.trim(),
        phone_number: form.phone_number.trim(),
        email: form.email.trim() || undefined,
        password: form.password,
        password_confirmation: form.password_confirmation,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      });
      toast.success("Broker created");
      setModal({ open: false, type: null, item: null });
      fetchBrokers();
      fetchPromos();
    } catch (e) {
      const msg = e.response?.data?.message || (e.response?.data?.errors && Object.values(e.response.data.errors).flat().join(" ")) || "Failed";
      toast.error(msg);
    }
  };

  const list = Array.isArray(promoCodes) ? promoCodes : [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Promo Codes</h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Promo Code
          </Button>
          <Button variant="outline" onClick={openCreateBroker}>
            <Users className="w-4 h-4 mr-2" />
            Create Broker
          </Button>
          <Select
            value={filters.broker_id}
            onValueChange={(v) => setFilters((p) => ({ ...p, broker_id: v }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Broker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brokers</SelectItem>
              {brokers.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.username || [b.first_name, b.last_name].filter(Boolean).join(" ") || `#${b.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.is_active}
            onValueChange={(v) => setFilters((p) => ({ ...p, is_active: v }))}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="icon" onClick={fetchPromos} aria-label="Refresh">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Broker</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Commission %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No promo codes found
                  </TableCell>
                </TableRow>
              ) : (
                list.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-mono font-semibold">{promo.code}</TableCell>
                    <TableCell>
                      {promo.broker
                        ? promo.broker.username || [promo.broker.first_name, promo.broker.last_name].filter(Boolean).join(" ") || "—"
                        : "N/A"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{promo.description || "—"}</TableCell>
                    <TableCell>
                      {promo.current_uses ?? 0} / {promo.max_uses ?? "∞"}
                    </TableCell>
                    <TableCell>{promo.commission_percentage ?? 0}%</TableCell>
                    <TableCell>
                      <Badge variant={promo.is_active ? "default" : "secondary"}>
                        {promo.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString() : "No expiry"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(promo)} aria-label="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(promo)} aria-label="Delete" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Promo Modal */}
      <Dialog open={modal.open && (modal.type === "create" || modal.type === "edit")} onOpenChange={(open) => !open && setModal({ open: false, type: null, item: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{modal.type === "edit" ? "Edit Promo Code" : "Create Promo Code"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Code</Label>
              <Input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="PROMO20" disabled={modal.type === "edit"} />
            </div>
            <div>
              <Label>Broker</Label>
              <Select value={form.broker_id} onValueChange={(v) => setForm((p) => ({ ...p, broker_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select broker" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {brokers.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.username || `#${b.id}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max uses (optional)</Label>
                <Input type="number" min={0} value={form.max_uses} onChange={(e) => setForm((p) => ({ ...p, max_uses: e.target.value }))} placeholder="∞" />
              </div>
              <div>
                <Label>Commission %</Label>
                <Input type="number" min={0} step={0.01} value={form.commission_percentage} onChange={(e) => setForm((p) => ({ ...p, commission_percentage: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Expires at (optional)</Label>
              <Input type="date" value={form.expires_at} onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value }))} />
            </div>
            {modal.type === "edit" && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} />
                <Label htmlFor="active">Active</Label>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal({ open: false, type: null, item: null })}>Cancel</Button>
              <Button onClick={submitPromo}>{modal.type === "edit" ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Broker Modal */}
      <Dialog open={modal.open && modal.type === "create-broker"} onOpenChange={(open) => !open && setModal({ open: false, type: null, item: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Broker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {["username", "first_name", "last_name", "phone_number", "email", "password", "password_confirmation"].map((key) => (
              <div key={key}>
                <Label>{key.replace(/_/g, " ")}</Label>
                <Input
                  type={key.includes("password") ? "password" : "text"}
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={key}
                  required={["username", "first_name", "last_name", "phone_number", "password", "password_confirmation"].includes(key)}
                />
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal({ open: false, type: null, item: null })}>Cancel</Button>
              <Button onClick={submitBroker}>Create Broker</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirm.open} onOpenChange={(open) => setConfirm((p) => ({ ...p, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirm.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirm.onConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
