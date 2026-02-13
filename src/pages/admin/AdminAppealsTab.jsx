import React from 'react';
import { Edit, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminAppealsTab() {
  const {
    appeals,
    filters,
    setFilters,
    setSelectedItem,
    setModalType,
    setModalOpen,
    fetchAppeals
  } = useAdmin();

  const list = appeals?.data ?? (Array.isArray(appeals) ? appeals : []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select
          value={filters.appeals.status}
          onValueChange={(value) => setFilters(prev => ({
            ...prev,
            appeals: { ...prev.appeals, status: value }
          }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchAppeals}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(list) ? list : []).map((appeal) => (
                <TableRow key={appeal.id}>
                  <TableCell>{appeal.id}</TableCell>
                  <TableCell>{appeal.user?.username || appeal.user?.email || 'N/A'}</TableCell>
                  <TableCell>{appeal.type || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{appeal.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{appeal.priority || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedItem(appeal);
                        setModalType('edit-appeal');
                        setModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
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
