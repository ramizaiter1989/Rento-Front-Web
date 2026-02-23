import React from 'react';
import { Eye, Edit, Trash2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminCarsTab() {
  const {
    cars,
    filters,
    setFilters,
    fetchCars,
    fetchCarDetails,
    setSelectedItem,
    setModalType,
    setModalOpen,
    showConfirmDialog,
    deleteCar
  } = useAdmin();

  const carList = cars?.data ?? (Array.isArray(cars) ? cars : []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={filters.cars.status}
            onValueChange={(value) => setFilters(prev => ({
              ...prev,
              cars: { ...prev.cars, status: value }
            }))}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="not_available">Not Available</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchCars}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Make/Model</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(carList) ? carList : []).map((car) => (
                <TableRow key={car.id}>
                  <TableCell>{car.id}</TableCell>
                  <TableCell>{car.make} {car.model}</TableCell>
                  <TableCell>{car.year}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{car.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {car.car_accepted ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell>${car.daily_rate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          const fullDetails = await fetchCarDetails(car.id);
                          if (fullDetails) {
                            setSelectedItem(fullDetails);
                            setModalType('view-car');
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
                          const fullDetails = await fetchCarDetails(car.id);
                          if (fullDetails) {
                            setSelectedItem(fullDetails);
                            setModalType('edit-car');
                            setModalOpen(true);
                          }
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => showConfirmDialog(
                          'Delete Car',
                          'Are you sure you want to delete this car?',
                          () => deleteCar(car.id)
                        )}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
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
