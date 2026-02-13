import React from 'react';
import { Plus, Edit, Trash2, RefreshCw, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminPromoCodesTab() {
  const {
    promoCodes,
    brokers,
    filters,
    setFilters,
    setBrokerForm,
    setSelectedItem,
    setModalType,
    setModalOpen,
    fetchPromoCodes,
    fetchPromoCodeUsers,
    fetchBrokerReferrals,
    showConfirmDialog,
    handleDeletePromoCode
  } = useAdmin();

  const list = promoCodes?.data ?? (Array.isArray(promoCodes) ? promoCodes : []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setSelectedItem(null);
              setModalType('create-promo-code');
              setModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Promo Code
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setBrokerForm({ username: '', phone_number: '', email: '', password: '', password_confirmation: '', first_name: '', last_name: '' });
              setModalType('create-broker');
              setModalOpen(true);
            }}
          >
            <Users className="w-4 h-4 mr-2" />
            Create Broker
          </Button>
          <div className="flex items-center gap-2">
            <Select
              value={filters.promoCodes.broker_id || 'all'}
              onValueChange={(val) =>
                setFilters((prev) => ({
                  ...prev,
                  promoCodes: { ...prev.promoCodes, broker_id: val }
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by broker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brokers</SelectItem>
                {(Array.isArray(brokers) ? brokers : []).map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.username || `${b.first_name || ''} ${b.last_name || ''}` || `Broker #${b.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.promoCodes.is_active}
              onValueChange={(val) =>
                setFilters((prev) => ({
                  ...prev,
                  promoCodes: { ...prev.promoCodes, is_active: val }
                }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={fetchPromoCodes} aria-label="Refresh promo codes">
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
                <TableHead>Expires At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(list) ? list : []).map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-mono font-semibold">{promo.code}</TableCell>
                  <TableCell>
                    {promo.broker
                      ? (promo.broker.username ||
                         `${promo.broker.first_name || ''} ${promo.broker.last_name || ''}`)
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {promo.description || '—'}
                  </TableCell>
                  <TableCell>
                    {promo.current_uses} / {promo.max_uses ?? '∞'}
                  </TableCell>
                  <TableCell>{promo.commission_percentage ?? 0}%</TableCell>
                  <TableCell>
                    <Badge variant={promo.is_active ? 'default' : 'secondary'}>
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString() : 'No expiry'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedItem(promo);
                          setModalType('edit-promo-code');
                          setModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedItem(promo);
                          fetchPromoCodeUsers(promo.id);
                          fetchBrokerReferrals(promo.broker_id);
                          setModalType('view-promo-users');
                          setModalOpen(true);
                        }}
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          showConfirmDialog(
                            'Delete Promo Code',
                            'Are you sure you want to delete this promo code?',
                            () => handleDeletePromoCode(promo.id)
                          )
                        }
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
