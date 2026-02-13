import React from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminFeaturedCarsTab() {
  const {
    featuredCars,
    setSelectedItem,
    setModalType,
    setModalOpen,
    fetchFeaturedCars,
    showConfirmDialog,
    deleteFeaturedCar
  } = useAdmin();

  const list = featuredCars?.data ?? (Array.isArray(featuredCars) ? featuredCars : []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={() => { setSelectedItem(null); setModalType('create-featured-car'); setModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Featured Car
        </Button>
        <Button variant="outline" size="icon" onClick={fetchFeaturedCars}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Expire Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(list) ? list : []).map((featured) => (
                <TableRow key={featured.id}>
                  <TableCell>{featured.id}</TableCell>
                  <TableCell>{featured.car?.make} {featured.car?.model}</TableCell>
                  <TableCell>{featured.duration} days</TableCell>
                  <TableCell>{new Date(featured.start_at).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(featured.expire_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => showConfirmDialog('Remove Featured Car', 'Are you sure?', () => deleteFeaturedCar(featured.id))}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
