import React, { useState, useEffect, useCallback } from "react";
import {
  getAdminServices,
  getAdminThirdParties,
  getAdminServiceItems,
  getAdminFeedbacks,
  deleteAdminService,
  deleteAdminThirdParty,
  deleteAdminServiceItem,
  deleteAdminFeedback,
} from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Briefcase, Building2, Package, MessageCircle, RefreshCw, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [thirdParties, setThirdParties] = useState([]);
  const [serviceItems, setServiceItems] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [filters, setFilters] = useState({ services: { search: "", category: "all" }, thirdParties: { search: "" } });
  const [confirm, setConfirm] = useState({ open: false, title: "", message: "", onConfirm: null });

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.services.search) params.search = filters.services.search;
      if (filters.services.category !== "all") params.category = filters.services.category;
      const res = await getAdminServices({ ...params, per_page: 100 });
      const raw = res.data?.data ?? res.data?.services ?? res.data;
      setServices(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load services");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [filters.services.search, filters.services.category]);

  const fetchThirdParties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminThirdParties({ per_page: 100 });
      const raw = res.data?.data ?? res.data?.third_parties ?? res.data;
      setThirdParties(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load third parties");
      setThirdParties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchServiceItems = useCallback(async (serviceId) => {
    if (!serviceId) {
      setServiceItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getAdminServiceItems(parseInt(serviceId, 10));
      const raw = res.data?.data ?? res.data?.items ?? res.data;
      setServiceItems(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error(e);
      setServiceItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminFeedbacks({ per_page: 100 });
      const raw = res.data?.data ?? res.data?.feedbacks ?? res.data;
      setFeedbacks(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load feedbacks");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (selectedServiceId) fetchServiceItems(selectedServiceId);
    else setServiceItems([]);
  }, [selectedServiceId, fetchServiceItems]);

  const showConfirm = (title, message, onConfirm) => {
    setConfirm({ open: true, title, message, onConfirm });
  };

  const handleDeleteService = (s) => {
    showConfirm("Delete Service", `Delete "${s.name}"?`, async () => {
      try {
        await deleteAdminService(s.id);
        toast.success("Service deleted");
        fetchServices();
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed");
      }
    });
  };

  const handleDeleteThirdParty = (tp) => {
    showConfirm("Delete Third Party", "Are you sure?", async () => {
      try {
        await deleteAdminThirdParty(tp.id);
        toast.success("Third party deleted");
        fetchThirdParties();
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed");
      }
    });
  };

  const handleDeleteServiceItem = (item) => {
    showConfirm("Delete Item", `Delete "${item.name}"?`, async () => {
      try {
        await deleteAdminServiceItem(item.id);
        toast.success("Item deleted");
        if (selectedServiceId) fetchServiceItems(selectedServiceId);
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed");
      }
    });
  };

  const handleDeleteFeedback = (fb) => {
    showConfirm("Delete Feedback", "Are you sure?", async () => {
      try {
        await deleteAdminFeedback(fb.id);
        toast.success("Feedback deleted");
        fetchFeedbacks();
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed");
      }
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Services</h1>

      <Tabs defaultValue="services-list" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="services-list"><Briefcase className="w-4 h-4 mr-1" /> Services</TabsTrigger>
          <TabsTrigger value="third-parties" onClick={() => fetchThirdParties()}><Building2 className="w-4 h-4 mr-1" /> Third Parties</TabsTrigger>
          <TabsTrigger value="service-items"><Package className="w-4 h-4 mr-1" /> Service Items</TabsTrigger>
          <TabsTrigger value="service-feedbacks" onClick={() => fetchFeedbacks()}><MessageCircle className="w-4 h-4 mr-1" /> Feedbacks</TabsTrigger>
        </TabsList>

        <TabsContent value="services-list" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input placeholder="Search services..." value={filters.services.search} onChange={(e) => setFilters((p) => ({ ...p, services: { ...p.services, search: e.target.value } }))} className="w-48" />
            <Select value={filters.services.category} onValueChange={(v) => setFilters((p) => ({ ...p, services: { ...p.services, category: v } }))}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchServices} aria-label="Refresh"><RefreshCw className="w-4 h-4" /></Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Owner</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Rating</TableHead><TableHead>Featured</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow> : services.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No services found</TableCell></TableRow> : services.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.id}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.third_party ? (s.third_party.name || s.third_party.email) : s.third_party_id || "—"}</TableCell>
                      <TableCell><Badge variant="outline">{s.category || "—"}</Badge></TableCell>
                      <TableCell>${(parseFloat(s.price) || 0).toFixed(2)}</TableCell>
                      <TableCell><div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />{s.rating ? Number(s.rating).toFixed(1) : "N/A"}</div></TableCell>
                      <TableCell><Badge variant={s.featured ? "default" : "secondary"}>{s.featured ? "Yes" : "No"}</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteService(s)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="third-parties" className="space-y-4">
          <div className="flex items-center gap-2">
            <Input placeholder="Search third parties..." value={filters.thirdParties.search} onChange={(e) => setFilters((p) => ({ ...p, thirdParties: { ...p.thirdParties, search: e.target.value } }))} className="w-64" />
            <Button variant="outline" size="icon" onClick={fetchThirdParties} aria-label="Refresh"><RefreshCw className="w-4 h-4" /></Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead>Category</TableHead><TableHead>City</TableHead><TableHead>Subscription</TableHead><TableHead>Created</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow> : thirdParties.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No third parties found</TableCell></TableRow> : thirdParties.map((tp) => (
                    <TableRow key={tp.id}>
                      <TableCell>{tp.id}</TableCell>
                      <TableCell className="font-medium">{tp.name}</TableCell>
                      <TableCell>{tp.email || tp.phone || "—"}</TableCell>
                      <TableCell><Badge variant="outline">{tp.category || "—"}</Badge></TableCell>
                      <TableCell>{tp.city || "—"}</TableCell>
                      <TableCell>{tp.subscription_status || "—"}</TableCell>
                      <TableCell>{tp.created_at ? new Date(tp.created_at).toLocaleDateString() : "—"}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteThirdParty(tp)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service-items" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedServiceId} onValueChange={(v) => setSelectedServiceId(v)}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Select a service to view items" /></SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedServiceId && <Button variant="outline" size="icon" onClick={() => fetchServiceItems(selectedServiceId)} aria-label="Refresh"><RefreshCw className="w-4 h-4" /></Button>}
          </div>
          {!selectedServiceId ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><Package className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Select a service from the dropdown above</p></CardContent></Card>
          ) : (
            <Card>
              <CardHeader><CardTitle>Items for Service #{selectedServiceId}</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead>Price</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow> : serviceItems.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No items found</TableCell></TableRow> : serviceItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.description || "N/A"}</TableCell>
                        <TableCell>${(parseFloat(item.price) || 0).toFixed(2)}</TableCell>
                        <TableCell><Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteServiceItem(item)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="service-feedbacks" className="space-y-4">
          <Button variant="outline" size="icon" onClick={fetchFeedbacks} aria-label="Refresh"><RefreshCw className="w-4 h-4" /></Button>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Service</TableHead><TableHead>User</TableHead><TableHead>Rating</TableHead><TableHead>Comment</TableHead><TableHead>Created</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow> : feedbacks.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No feedbacks found</TableCell></TableRow> : feedbacks.map((fb) => (
                    <TableRow key={fb.id}>
                      <TableCell>{fb.id}</TableCell>
                      <TableCell>{fb.service?.name || fb.service_id}</TableCell>
                      <TableCell>{fb.user?.name || fb.user_id}</TableCell>
                      <TableCell><div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < (fb.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />)}</div></TableCell>
                      <TableCell className="max-w-xs truncate">{fb.comment || "N/A"}</TableCell>
                      <TableCell>{fb.created_at ? new Date(fb.created_at).toLocaleDateString() : "—"}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteFeedback(fb)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={confirm.open} onOpenChange={(open) => setConfirm((p) => ({ ...p, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{confirm.title}</AlertDialogTitle><AlertDialogDescription>{confirm.message}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirm.onConfirm}>Confirm</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
