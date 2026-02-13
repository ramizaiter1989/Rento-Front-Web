import React, { useState, useEffect, useCallback } from "react";
import {
  getUsers,
  createBroker,
  getBrokerBalance,
  getBrokerCommissions,
  getBrokerPayouts,
  getBrokerReferrals,
  getBrokerCommissionsList,
  createBrokerPayout,
  cancelBrokerCommission,
  deleteBrokerReferral,
} from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Users, DollarSign, RefreshCw, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

function brokerName(b) {
  return b?.username || [b?.first_name, b?.last_name].filter(Boolean).join(" ") || `Broker #${b?.id}`;
}

export default function AdminBrokersPage() {
  const [brokers, setBrokers] = useState([]);
  const [commissionsList, setCommissionsList] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [brokerDetailTab, setBrokerDetailTab] = useState("overview");
  const [balance, setBalance] = useState(null);
  const [commissions, setCommissions] = useState({ data: [], statistics: {} });
  const [payouts, setPayouts] = useState({ data: [] });
  const [referrals, setReferrals] = useState([]);
  const [commissionStatusFilter, setCommissionStatusFilter] = useState("all");
  const [confirm, setConfirm] = useState({ open: false, title: "", message: "", onConfirm: null });
  const [modal, setModal] = useState({ open: false, type: null });
  const [form, setForm] = useState({
    username: "", phone_number: "", email: "", password: "", password_confirmation: "",
    first_name: "", last_name: "", broker_id: "", amount: "", reference: "", notes: "",
  });

  const fetchBrokers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({ role: "broker", per_page: 200 });
      const raw = res.data?.users?.data ?? res.data?.users ?? res.data?.data;
      setBrokers(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load brokers");
      setBrokers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCommissionsList = useCallback(async () => {
    try {
      const res = await getBrokerCommissionsList({ per_page: 100 });
      const raw = res.data?.data ?? res.data?.commissions ?? res.data;
      setCommissionsList({ data: Array.isArray(raw) ? raw : [] });
    } catch (e) {
      setCommissionsList({ data: [] });
    }
  }, []);

  const openBrokerDetail = useCallback(async (broker) => {
    setSelectedBroker(broker);
    setBrokerDetailTab("overview");
    if (!broker?.id) return;
    try {
      const [balanceRes, commRes, payRes, refRes] = await Promise.all([
        getBrokerBalance(broker.id).catch(() => ({ data: null })),
        getBrokerCommissions(broker.id).catch(() => ({ data: { data: [], statistics: {} } })),
        getBrokerPayouts(broker.id).catch(() => ({ data: { payouts: { data: [] } } })),
        getBrokerReferrals(broker.id).catch(() => ({ data: { referrals: [] } })),
      ]);
      setBalance(balanceRes.data);
      const commRaw = commRes.data?.commissions?.data ?? commRes.data?.commissions;
      setCommissions({ data: Array.isArray(commRaw) ? commRaw : [], statistics: commRes.data?.statistics || {} });
      const payRaw = payRes.data?.payouts?.data ?? payRes.data?.data ?? payRes.data;
      setPayouts({ data: Array.isArray(payRaw) ? payRaw : [] });
      const refRaw = refRes.data?.referrals ?? refRes.data?.data ?? refRes.data;
      setReferrals(Array.isArray(refRaw) ? refRaw : []);
    } catch (e) {
      toast.error("Failed to load broker detail");
    }
  }, []);

  const closeBrokerDetail = () => {
    setSelectedBroker(null);
    setBalance(null);
    setCommissions({ data: [], statistics: {} });
    setPayouts({ data: [] });
    setReferrals([]);
  };

  const refreshCommissionsByStatus = async (status) => {
    if (!selectedBroker?.id) return;
    setCommissionStatusFilter(status);
    try {
      const res = await getBrokerCommissions(selectedBroker.id, { status: status === "all" ? undefined : status });
      const raw = res.data?.commissions?.data ?? res.data?.commissions;
      setCommissions({ data: Array.isArray(raw) ? raw : [], statistics: res.data?.statistics || {} });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBrokers();
    fetchCommissionsList();
  }, [fetchBrokers, fetchCommissionsList]);

  const handleCreateBroker = async () => {
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
      setModal({ open: false, type: null });
      fetchBrokers();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const handleCreatePayout = async () => {
    try {
      await createBrokerPayout({
        broker_id: parseInt(form.broker_id, 10),
        amount: parseFloat(form.amount) * 100,
        reference: form.reference.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      toast.success("Payout created");
      setModal({ open: false, type: null });
      if (selectedBroker?.id) openBrokerDetail(selectedBroker);
      fetchCommissionsList();
    } catch (e) {
      toast.error(e.response?.data?.message || "Payout failed");
    }
  };

  const handleCancelCommission = (c) => {
    setConfirm({ open: true, title: "Cancel commission", message: "Are you sure?", onConfirm: async () => {
      try {
        await cancelBrokerCommission(c.id);
        toast.success("Commission cancelled");
        if (selectedBroker?.id) refreshCommissionsByStatus(commissionStatusFilter);
        fetchCommissionsList();
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed");
      }
    } });
  };

  const handleDeleteReferral = (r) => {
    setConfirm({ open: true, title: "Delete referral", message: "Remove this referral?", onConfirm: async () => {
      try {
        await deleteBrokerReferral(r.id);
        toast.success("Referral deleted");
        if (selectedBroker?.id) openBrokerDetail(selectedBroker);
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed");
      }
    } });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Brokers</h1>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setForm({ username: "", phone_number: "", email: "", password: "", password_confirmation: "", first_name: "", last_name: "" }); setModal({ open: true, type: "create-broker" }); }}>
            <Users className="w-4 h-4 mr-2" /> Create Broker
          </Button>
          <Button onClick={() => { setForm({ broker_id: selectedBroker?.id ? String(selectedBroker.id) : "", amount: balance?.balance != null ? String(balance.balance) : "", reference: "", notes: "" }); setModal({ open: true, type: "create-payout" }); }}>
            <DollarSign className="w-4 h-4 mr-2" /> Create Payout
          </Button>
        </div>
        <Button variant="outline" size="icon" onClick={() => { fetchBrokers(); fetchCommissionsList(); }} aria-label="Refresh"><RefreshCw className="w-4 h-4" /></Button>
      </div>

      {selectedBroker ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />{brokerName(selectedBroker)}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setForm({ broker_id: String(selectedBroker.id), amount: balance?.balance ? String(balance.balance) : "", reference: "", notes: "" }); setModal({ open: true, type: "create-payout" }); }}>
                <DollarSign className="w-4 h-4 mr-1" /> Pay broker
              </Button>
              <Button variant="ghost" size="sm" onClick={closeBrokerDetail}><ChevronLeft className="w-4 h-4 mr-1" /> Close</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={brokerDetailTab} onValueChange={setBrokerDetailTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="commissions">Commissions</TabsTrigger>
                <TabsTrigger value="payouts">Payouts</TabsTrigger>
                <TabsTrigger value="referrals">Referrals</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Balance</p><p className="text-2xl font-bold text-primary">${(balance?.balance ?? 0).toFixed(2)}</p></CardContent></Card>
                  <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Total commissions</p><p className="text-2xl font-bold">${(balance?.total_commissions ?? commissions.statistics?.total_commissions ?? 0).toFixed(2)}</p></CardContent></Card>
                  <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Total payouts</p><p className="text-2xl font-bold">${(balance?.total_payouts ?? commissions.statistics?.total_payouts ?? 0).toFixed(2)}</p></CardContent></Card>
                </div>
              </TabsContent>
              <TabsContent value="commissions" className="mt-4">
                <div className="flex gap-2 mb-4">
                  {["all", "pending", "paid", "cancelled"].map((s) => (
                    <Button key={s} variant={commissionStatusFilter === s ? "default" : "outline"} size="sm" onClick={() => refreshCommissionsByStatus(s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</Button>
                  ))}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead><TableHead>Referred user</TableHead><TableHead>Promo</TableHead><TableHead>Amount</TableHead><TableHead>Commission</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(commissions.data || []).map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.id}</TableCell>
                        <TableCell>{c.referredUser ? brokerName(c.referredUser) : c.referred_user_id}</TableCell>
                        <TableCell>{c.promoCode?.code || "—"}</TableCell>
                        <TableCell>${Number(c.booking_amount || 0).toFixed(2)}</TableCell>
                        <TableCell>${Number(c.commission_amount || 0).toFixed(2)} ({c.commission_percentage}%)</TableCell>
                        <TableCell><Badge variant={c.status === "paid" ? "default" : c.status === "cancelled" ? "secondary" : "outline"}>{c.status}</Badge></TableCell>
                        <TableCell>{c.status === "pending" && <Button variant="ghost" size="sm" onClick={() => handleCancelCommission(c)}>Cancel</Button>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="payouts" className="mt-4">
                <Table>
                  <TableHeader><TableRow><TableHead>Reference</TableHead><TableHead>Amount</TableHead><TableHead>Paid at</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(payouts.data || []).map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.reference_id || p.id}</TableCell>
                        <TableCell>${((p.amount || 0) / 100).toFixed(2)}</TableCell>
                        <TableCell>{p.paid_at ? new Date(p.paid_at).toLocaleString() : "—"}</TableCell>
                        <TableCell>{p.description || p.metadata?.reference || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="referrals" className="mt-4">
                <Table>
                  <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Referred user</TableHead><TableHead>Promo</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(referrals || []).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.id}</TableCell>
                        <TableCell>{r.referredUser ? brokerName(r.referredUser) : r.referred_user_id}</TableCell>
                        <TableCell>{r.promoCode?.code || "—"}</TableCell>
                        <TableCell><Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteReferral(r)}>Delete</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle>Brokers</CardTitle><p className="text-sm text-muted-foreground">Click Manage to view balance, commissions, payouts, and referrals.</p></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Username</TableHead><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow> : brokers.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No brokers found</TableCell></TableRow> : brokers.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.id}</TableCell><TableCell>{b.username}</TableCell><TableCell>{[b.first_name, b.last_name].filter(Boolean).join(" ") || "—"}</TableCell><TableCell>{b.phone_number || "—"}</TableCell>
                      <TableCell><Button variant="outline" size="sm" onClick={() => openBrokerDetail(b)}>Manage</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>All broker commissions</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Broker</TableHead><TableHead>Referred user</TableHead><TableHead>Promo</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(commissionsList.data || []).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.id}</TableCell><TableCell>{c.broker ? brokerName(c.broker) : c.broker_id}</TableCell><TableCell>{c.referredUser ? brokerName(c.referredUser) : "—"}</TableCell><TableCell>{c.promoCode?.code || "—"}</TableCell><TableCell>${Number(c.commission_amount || 0).toFixed(2)}</TableCell><TableCell><Badge variant={c.status === "paid" ? "default" : c.status === "cancelled" ? "secondary" : "outline"}>{c.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={modal.open && modal.type === "create-broker"} onOpenChange={(open) => !open && setModal({ open: false, type: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Broker</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {["username", "first_name", "last_name", "phone_number", "email", "password", "password_confirmation"].map((key) => (
              <div key={key}><Label>{key.replace(/_/g, " ")}</Label><Input type={key.includes("password") ? "password" : "text"} value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} /></div>
            ))}
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setModal({ open: false, type: null })}>Cancel</Button><Button onClick={handleCreateBroker}>Create</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal.open && modal.type === "create-payout"} onOpenChange={(open) => !open && setModal({ open: false, type: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Payout</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Broker</Label><select className="w-full border rounded-md px-3 py-2" value={form.broker_id} onChange={(e) => setForm((p) => ({ ...p, broker_id: e.target.value }))}><option value="">Select broker</option>{brokers.map((b) => <option key={b.id} value={b.id}>{brokerName(b)}</option>)}</select></div>
            <div><Label>Amount ($)</Label><Input type="number" step={0.01} value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} /></div>
            <div><Label>Reference (optional)</Label><Input value={form.reference} onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))} /></div>
            <div><Label>Notes (optional)</Label><Input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setModal({ open: false, type: null })}>Cancel</Button><Button onClick={handleCreatePayout}>Create Payout</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirm.open} onOpenChange={(open) => setConfirm((p) => ({ ...p, open }))}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{confirm.title}</AlertDialogTitle><AlertDialogDescription>{confirm.message}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirm.onConfirm}>Confirm</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
