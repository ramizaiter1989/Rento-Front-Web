import React from 'react';
import { Plus, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdmin } from '@/contexts/AdminContext';
import { exportToExcel, exportTableToPDF } from '@/utils/exportUtils';

export default function AdminPaymentsTab() {
  const {
    payments,
    setSelectedItem,
    setModalType,
    setModalOpen,
    fetchPayments,
    processRefund
  } = useAdmin();

  const paymentList = payments?.data ?? (Array.isArray(payments) ? payments : []);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user', label: 'User', transform: (p) => p.user?.name || 'N/A' },
    { key: 'amount', label: 'Amount', transform: (p) => `$${p.amount}` },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'source', label: 'Source' },
    { key: 'name', label: 'Name' },
    { key: 'created_at', label: 'Created At', transform: (p) => new Date(p.created_at).toLocaleString() }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => {
            setSelectedItem(null);
            setModalType('create-payment');
            setModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Issue Payment/Invoice
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const data = (Array.isArray(paymentList) ? paymentList : []).map(p => ({
                ...p,
                user: p.user?.name || 'N/A',
                amount: `$${p.amount}`,
                created_at: new Date(p.created_at).toLocaleString()
              }));
              exportToExcel(data, columns, 'invoices');
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const data = (Array.isArray(paymentList) ? paymentList : []).map(p => ({
                ...p,
                user: p.user?.name || 'N/A',
                amount: `$${p.amount}`,
                created_at: new Date(p.created_at).toLocaleString()
              }));
              exportTableToPDF(data, columns, 'Invoices Report', 'invoices');
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="icon" onClick={fetchPayments} aria-label="Refresh payments">
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
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(paymentList) ? paymentList : []).map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>{payment.user?.name || 'N/A'}</TableCell>
                  <TableCell>${payment.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.source}</TableCell>
                  <TableCell>
                    {payment.type === 'refund' && payment.status !== 'processed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const invoiceId = payment.reference_id || payment.id;
                          processRefund(invoiceId);
                        }}
                      >
                        Process Refund
                      </Button>
                    )}
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
