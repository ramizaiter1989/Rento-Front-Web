import React from 'react';
import { Users, DollarSign, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdmin, COLORS } from '@/contexts/AdminContext';
import { getBrokerCommissions } from '@/lib/adminApi';

export default function AdminBrokersTab() {
  const {
    brokers,
    selectedBroker,
    brokerDetailTab,
    setBrokerDetailTab,
    brokerBalance,
    brokerCommissions,
    brokerPayouts,
    brokerReferrals,
    brokerCommissionsList,
    commissionStatusFilter,
    setCommissionStatusFilter,
    setBrokerCommissions,
    setBrokerForm,
    setPayoutForm,
    setSelectedBroker,
    setModalType,
    setModalOpen,
    fetchBrokers,
    fetchBrokerCommissionsList,
    openBrokerDetail,
    closeBrokerDetail,
    showConfirmDialog,
    handleCancelCommission,
    handleDeleteBrokerReferral
  } = useAdmin();

  const refreshBrokerCommissionsByStatus = async (status) => {
    if (!selectedBroker?.id) return;
    setCommissionStatusFilter(status);
    try {
      const res = await getBrokerCommissions(selectedBroker.id, { status: status === 'all' ? undefined : status });
      const raw = res.data?.commissions?.data ?? res.data?.commissions;
      setBrokerCommissions({
        data: Array.isArray(raw) ? raw : [],
        statistics: res.data?.statistics || {}
      });
    } catch (e) {
      console.error('Failed to fetch broker commissions:', e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
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
          <Button
            onClick={() => {
              setPayoutForm({
                broker_id: selectedBroker?.id ? String(selectedBroker.id) : 'select',
                amount: selectedBroker?.id && brokerBalance?.balance != null ? String(brokerBalance.balance) : '',
                reference: '',
                notes: ''
              });
              setModalType('create-broker-payout');
              setModalOpen(true);
            }}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Create Payout
          </Button>
        </div>
        <Button variant="outline" size="icon" onClick={() => { fetchBrokers(); fetchBrokerCommissionsList(); }}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {selectedBroker ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {selectedBroker.username || `${selectedBroker.first_name || ''} ${selectedBroker.last_name || ''}`.trim() || `Broker #${selectedBroker.id}`}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPayoutForm({
                    broker_id: String(selectedBroker.id),
                    amount: brokerBalance?.balance ? String(brokerBalance.balance) : '',
                    reference: '',
                    notes: ''
                  });
                  setModalType('create-broker-payout');
                  setModalOpen(true);
                }}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Pay broker
              </Button>
              <Button variant="ghost" size="sm" onClick={closeBrokerDetail}>Close</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={brokerDetailTab} onValueChange={setBrokerDetailTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="commissions">Commissions</TabsTrigger>
                <TabsTrigger value="payouts">Payouts</TabsTrigger>
                <TabsTrigger value="referrals">Referrals</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="text-2xl font-bold" style={{ color: COLORS.limeGreen }}>${(brokerBalance?.balance ?? 0).toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Total commissions</p>
                      <p className="text-2xl font-bold">${(brokerBalance?.total_commissions ?? brokerCommissions.statistics?.total_commissions ?? 0).toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Total payouts</p>
                      <p className="text-2xl font-bold">${(brokerBalance?.total_payouts ?? brokerCommissions.statistics?.total_payouts ?? 0).toFixed(2)}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="commissions" className="mt-4">
                <div className="flex gap-2 mb-4">
                  {['all', 'pending', 'paid', 'cancelled'].map((s) => (
                    <Button
                      key={s}
                      variant={commissionStatusFilter === s ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => refreshBrokerCommissionsByStatus(s)}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Button>
                  ))}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Referred user</TableHead>
                      <TableHead>Promo code</TableHead>
                      <TableHead>Booking amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Completed at</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(brokerCommissions.data) ? brokerCommissions.data : []).map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.id}</TableCell>
                        <TableCell>{c.referredUser ? `${c.referredUser.first_name || ''} ${c.referredUser.last_name || ''}`.trim() || c.referredUser.username : c.referred_user_id}</TableCell>
                        <TableCell>{c.promoCode?.code || '—'}</TableCell>
                        <TableCell>${Number(c.booking_amount || 0).toFixed(2)}</TableCell>
                        <TableCell>${Number(c.commission_amount || 0).toFixed(2)} ({c.commission_percentage}%)</TableCell>
                        <TableCell><Badge variant={c.status === 'paid' ? 'default' : c.status === 'cancelled' ? 'secondary' : 'outline'}>{c.status}</Badge></TableCell>
                        <TableCell>{c.booking_completed_at ? new Date(c.booking_completed_at).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>
                          {c.status === 'pending' && (
                            <Button variant="ghost" size="sm" onClick={() => showConfirmDialog('Cancel commission', 'Are you sure? This cannot be undone.', () => handleCancelCommission(c.id))}>
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="payouts" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid at</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(brokerPayouts.data) ? brokerPayouts.data : []).map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.reference_id || p.id}</TableCell>
                        <TableCell>${((p.amount || 0) / 100).toFixed(2)}</TableCell>
                        <TableCell>{p.paid_at ? new Date(p.paid_at).toLocaleString() : '—'}</TableCell>
                        <TableCell>{p.description || p.metadata?.reference || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="referrals" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Referred user</TableHead>
                      <TableHead>Promo code</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(brokerReferrals) ? brokerReferrals : []).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.id}</TableCell>
                        <TableCell>{r.referredUser ? `${r.referredUser.first_name || ''} ${r.referredUser.last_name || ''}`.trim() || r.referredUser.username : r.referred_user_id}</TableCell>
                        <TableCell>{r.promoCode?.code || '—'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => showConfirmDialog('Delete referral', 'Remove this referral link? This cannot be undone.', () => handleDeleteBrokerReferral(r.id))}>
                            Delete
                          </Button>
                        </TableCell>
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
            <CardHeader>
              <CardTitle>Brokers</CardTitle>
              <p className="text-sm text-muted-foreground">Click Manage to view balance, commissions, payouts, and referrals.</p>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Array.isArray(brokers) ? brokers : []).map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.id}</TableCell>
                      <TableCell>{b.username}</TableCell>
                      <TableCell>{[b.first_name, b.last_name].filter(Boolean).join(' ') || '—'}</TableCell>
                      <TableCell>{b.phone_number || '—'}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openBrokerDetail(b)}>Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>All broker commissions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Broker</TableHead>
                    <TableHead>Referred user</TableHead>
                    <TableHead>Promo</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Array.isArray(brokerCommissionsList?.data) ? brokerCommissionsList.data : []).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.id}</TableCell>
                      <TableCell>{c.broker ? (c.broker.username || `${c.broker.first_name || ''} ${c.broker.last_name || ''}`) : c.broker_id}</TableCell>
                      <TableCell>{c.referredUser ? `${c.referredUser.first_name || ''} ${c.referredUser.last_name || ''}`.trim() || c.referredUser.username : '—'}</TableCell>
                      <TableCell>{c.promoCode?.code || '—'}</TableCell>
                      <TableCell>${Number(c.commission_amount || 0).toFixed(2)}</TableCell>
                      <TableCell><Badge variant={c.status === 'paid' ? 'default' : c.status === 'cancelled' ? 'secondary' : 'outline'}>{c.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
