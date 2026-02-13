import React from 'react';
import {
  Plus, Edit, Trash2, RefreshCw, Search, Eye, Package, Star,
  Briefcase, Building2, MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminServicesTab() {
  const ctx = useAdmin();
  const {
    services,
    thirdParties,
    serviceItems,
    serviceFeedbacks,
    loading,
    filters,
    setFilters,
    selectedServiceId,
    setSelectedItem,
    setModalType,
    setModalOpen,
    setConfirmDialog,
    fetchServices,
    fetchThirdParties,
    fetchServiceItems,
    fetchServiceFeedbacks,
    handleDeleteService,
    handleDeleteFeedback,
    handleDeleteServiceItem
  } = ctx;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="services-list" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="services-list" className="text-xs">
            <Briefcase className="w-4 h-4 mr-1" />
            Services
          </TabsTrigger>
          <TabsTrigger value="third-parties" className="text-xs">
            <Building2 className="w-4 h-4 mr-1" />
            Third Parties
          </TabsTrigger>
          <TabsTrigger value="service-items" className="text-xs">
            <Package className="w-4 h-4 mr-1" />
            Service Items
          </TabsTrigger>
          <TabsTrigger value="service-feedbacks" className="text-xs">
            <MessageCircle className="w-4 h-4 mr-1" />
            Feedbacks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services-list" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={() => { setSelectedItem(null); setModalType('create-service'); setModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-1" />
                Create Service
              </Button>
              <Button variant="outline" size="icon" onClick={fetchServices} aria-label="Refresh services">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search services..."
                value={filters.services.search}
                onChange={(e) => setFilters({ ...filters, services: { ...filters.services, search: e.target.value } })}
                className="w-48"
              />
              <Select value={filters.services.category} onValueChange={(v) => setFilters({ ...filters, services: { ...filters.services, category: v } })}>
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
              <Button onClick={fetchServices}><Search className="w-4 h-4" /></Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
                  ) : (Array.isArray(services) ? services : []).length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8">No services found</TableCell></TableRow>
                  ) : (
                    (Array.isArray(services) ? services : []).map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.id}</TableCell>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>
                          {service.third_party ? (
                            <div className="text-sm">
                              <p className="font-medium">{service.third_party.name}</p>
                              <p className="text-xs text-muted-foreground">{service.third_party.email}</p>
                            </div>
                          ) : service.third_party_id ? (
                            <span className="text-muted-foreground">ID: {service.third_party_id}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell><Badge variant="outline">{service.category}</Badge></TableCell>
                        <TableCell>${(parseFloat(service.price) || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {service.rating ? (parseFloat(service.rating) || 0).toFixed(1) : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell><Badge variant={service.featured ? "default" : "secondary"}>{service.featured ? 'Yes' : 'No'}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedItem(service); setModalType('view-service'); setModalOpen(true); }}><Eye className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedItem(service); setModalType('edit-service'); setModalOpen(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => ctx.fetchServiceItems(service.id)}><Package className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirmDialog({ open: true, title: 'Delete Service', message: `Are you sure you want to delete "${service.name}"?`, onConfirm: () => handleDeleteService(service.id) })}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="third-parties" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={() => { setSelectedItem(null); setModalType('create-third-party'); setModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-1" />
                Create Third Party
              </Button>
              <Button variant="outline" size="icon" onClick={fetchThirdParties}><RefreshCw className="w-4 h-4" /></Button>
            </div>
            <Input placeholder="Search third parties..." value={filters.thirdParties.search} onChange={(e) => setFilters({ ...filters, thirdParties: { ...filters.thirdParties, search: e.target.value } })} className="w-64" />
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
                  ) : (Array.isArray(thirdParties) ? thirdParties : []).length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8">No third parties found</TableCell></TableRow>
                  ) : (
                    (Array.isArray(thirdParties) ? thirdParties : []).map((tp) => (
                      <TableRow key={tp.id}>
                        <TableCell>{tp.id}</TableCell>
                        <TableCell><p className="font-medium">{tp.name}</p></TableCell>
                        <TableCell>{tp.email || tp.phone || '-'}</TableCell>
                        <TableCell><Badge variant="outline">{tp.category || '-'}</Badge></TableCell>
                        <TableCell>{tp.city || '-'}</TableCell>
                        <TableCell>{tp.subscription_status || '-'}</TableCell>
                        <TableCell>{tp.created_at ? new Date(tp.created_at).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedItem(tp); setModalType('view-third-party'); setModalOpen(true); }}><Eye className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedItem(tp); setModalType('edit-third-party'); setModalOpen(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedItem(tp); setModalType('create-service-for-tp'); setModalOpen(true); }}><Plus className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirmDialog({ open: true, title: 'Delete Third Party', message: 'Are you sure?', onConfirm: () => ctx.handleDeleteThirdParty(tp.id) })}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service-items" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedServiceId && (
                <>
                  <Button onClick={() => { setSelectedItem(null); setModalType('create-service-item'); setModalOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Item</Button>
                  <Button variant="outline" size="icon" onClick={() => fetchServiceItems(selectedServiceId)}><RefreshCw className="w-4 h-4" /></Button>
                </>
              )}
            </div>
            <Select value={selectedServiceId?.toString() || ''} onValueChange={(v) => v && ctx.fetchServiceItems(parseInt(v))}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Select a service to view items" /></SelectTrigger>
              <SelectContent>
                {(Array.isArray(services) ? services : []).map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!selectedServiceId ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><Package className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Select a service from the dropdown above</p></CardContent></Card>
          ) : (
            <Card>
              <CardHeader><CardTitle>Items for Service #{selectedServiceId}</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow> :
                      (Array.isArray(serviceItems) ? serviceItems : []).length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8">No items found</TableCell></TableRow> :
                        (Array.isArray(serviceItems) ? serviceItems : []).map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="max-w-xs truncate">{item.description || 'N/A'}</TableCell>
                            <TableCell>${(parseFloat(item.price) || 0).toFixed(2)}</TableCell>
                            <TableCell>{item.image ? <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" /> : <span className="text-muted-foreground">No image</span>}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" onClick={() => { setSelectedItem(item); setModalType('edit-service-item'); setModalOpen(true); }}><Edit className="w-4 h-4" /></Button>
                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirmDialog({ open: true, title: 'Delete Item', message: `Delete "${item.name}"?`, onConfirm: () => handleDeleteServiceItem(item.id) })}><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    }
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="service-feedbacks" className="space-y-4">
          <Button variant="outline" size="icon" onClick={fetchServiceFeedbacks}><RefreshCw className="w-4 h-4" /></Button>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Helpful</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow> :
                    (Array.isArray(serviceFeedbacks) ? serviceFeedbacks : []).length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8">No feedbacks found</TableCell></TableRow> :
                      (Array.isArray(serviceFeedbacks) ? serviceFeedbacks : []).map((feedback) => (
                        <TableRow key={feedback.id}>
                          <TableCell>{feedback.id}</TableCell>
                          <TableCell>{feedback.service?.name || feedback.service_id}</TableCell>
                          <TableCell>{feedback.user?.name || feedback.user_id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{feedback.comment || 'N/A'}</TableCell>
                          <TableCell>{feedback.helpful_count || 0}</TableCell>
                          <TableCell>{new Date(feedback.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirmDialog({ open: true, title: 'Delete Feedback', message: 'Are you sure?', onConfirm: () => handleDeleteFeedback(feedback.id) })}><Trash2 className="w-4 h-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))
                  }
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
