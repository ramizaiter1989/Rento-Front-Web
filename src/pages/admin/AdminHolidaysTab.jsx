import React from 'react';
import { Plus, Edit, Trash2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminHolidaysTab() {
  const {
    holidays,
    setSelectedItem,
    setModalType,
    setModalOpen,
    fetchHolidays,
    showConfirmDialog,
    deleteHoliday
  } = useAdmin();

  const list = holidays?.data ?? (Array.isArray(holidays) ? holidays : []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => {
            setSelectedItem(null);
            setModalType('create-holiday');
            setModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Holiday
        </Button>
        <Button variant="outline" size="icon" onClick={fetchHolidays}>
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
                <TableHead>Holiday Name</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Increase %</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(list) ? list : []).map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell>{holiday.id}</TableCell>
                  <TableCell>
                    {holiday.car?.make} {holiday.car?.model}
                  </TableCell>
                  <TableCell>{holiday.holiday_name}</TableCell>
                  <TableCell>
                    {holiday.holiday_dates?.start} - {holiday.holiday_dates?.end}
                  </TableCell>
                  <TableCell>{holiday.percentage_increase}%</TableCell>
                  <TableCell>
                    {holiday.is_active ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedItem(holiday);
                          setModalType('edit-holiday');
                          setModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => showConfirmDialog(
                          'Delete Holiday',
                          'Are you sure you want to delete this holiday?',
                          () => deleteHoliday(holiday.id)
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
