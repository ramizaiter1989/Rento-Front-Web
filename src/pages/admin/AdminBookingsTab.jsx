import React from 'react';
import { Eye, Edit, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminBookingsTab() {
  const {
    bookings,
    filters,
    setFilters,
    fetchBookings,
    fetchBookingDetails,
    setSelectedItem,
    setModalType,
    setModalOpen,
    forceCompleteBooking
  } = useAdmin();

  const bookingList = bookings?.data ?? (Array.isArray(bookings) ? bookings : []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={filters.bookings.status}
            onValueChange={(value) => setFilters(prev => ({
              ...prev,
              bookings: { ...prev.bookings, status: value }
            }))}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchBookings}>
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
                <TableHead>Client</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(bookingList) ? bookingList : []).map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>
                    {booking.client?.first_name && booking.client?.last_name
                      ? `${booking.client.first_name} ${booking.client.last_name}`
                      : booking.client?.username || 'N/A'}
                  </TableCell>
                  <TableCell>{booking.car?.make} {booking.car?.model}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{booking.booking_request_status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={booking.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {booking.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>${booking.total_booking_price}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          const fullDetails = await fetchBookingDetails(booking.id);
                          if (fullDetails) {
                            setSelectedItem(fullDetails);
                            setModalType('view-booking');
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
                          const fullDetails = await fetchBookingDetails(booking.id);
                          if (fullDetails) {
                            setSelectedItem(fullDetails);
                            setModalType('edit-booking');
                            setModalOpen(true);
                          }
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {booking.booking_request_status === 'confirmed' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => forceCompleteBooking(booking.id)}
                          title="Force Complete"
                          aria-label="Force complete booking"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </Button>
                      )}
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
