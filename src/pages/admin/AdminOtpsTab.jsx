import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminOtpsTab() {
  const {
    otps,
    loading,
    filters,
    setFilters,
    fetchOtps
  } = useAdmin();

  const list = otps?.data ?? (Array.isArray(otps) ? otps : []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by phone number..."
            className="w-64"
            value={filters.otps.phone_number}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              otps: { ...prev.otps, phone_number: e.target.value }
            }))}
          />
          <Select
            value={filters.otps.expired}
            onValueChange={(value) => setFilters(prev => ({
              ...prev,
              otps: { ...prev.otps, expired: value }
            }))}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Expired" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All OTPs</SelectItem>
              <SelectItem value="false">Active</SelectItem>
              <SelectItem value="true">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="icon" onClick={fetchOtps}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>OTP Code</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (Array.isArray(list) ? list : []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading OTPs...
                  </TableCell>
                </TableRow>
              ) : (Array.isArray(list) ? list : []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No OTPs found
                  </TableCell>
                </TableRow>
              ) : (
                (Array.isArray(list) ? list : []).map((otp) => {
                  const isExpired = new Date(otp.expired_at) < new Date();
                  return (
                    <TableRow key={otp.id}>
                      <TableCell>{otp.id}</TableCell>
                      <TableCell>{otp.phone_number}</TableCell>
                      <TableCell className="font-mono font-bold">{otp.code}</TableCell>
                      <TableCell>{new Date(otp.created_at).toLocaleString()}</TableCell>
                      <TableCell>{new Date(otp.expired_at).toLocaleString()}</TableCell>
                      <TableCell>
                        {isExpired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
