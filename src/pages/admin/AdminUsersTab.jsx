import React from 'react';
import { Eye, Edit, Trash2, RefreshCw, UserCheck, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin, COLORS } from '@/contexts/AdminContext';

export default function AdminUsersTab() {
  const {
    users,
    filters,
    setFilters,
    navigate,
    fetchUsers,
    fetchUserDetails,
    setSelectedItem,
    setModalType,
    setModalOpen,
    showConfirmDialog,
    deleteUser
  } = useAdmin();

  const userList = users?.data ?? (Array.isArray(users) ? users : []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input placeholder="Search users..." className="w-64" />
          <Select
            value={filters.users.role}
            onValueChange={(value) => setFilters(prev => ({
              ...prev,
              users: { ...prev.users, role: value }
            }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="agency">Agency</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchUsers}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <Button
          onClick={() => navigate('/admin/real-user-data')}
          style={{
            background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal})`
          }}
          className="text-white flex items-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          Manage Real User Data
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(userList) ? userList : []).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.username || 'N/A'}
                  </TableCell>
                  <TableCell>{user.email || user.phone_number || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status ? "default" : "secondary"}>
                      {user.status ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.verified_by_admin ? (
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
                        onClick={async () => {
                          const fullDetails = await fetchUserDetails(user.id);
                          if (fullDetails) {
                            setSelectedItem(fullDetails);
                            setModalType('view-user');
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
                          const fullDetails = await fetchUserDetails(user.id);
                          if (fullDetails) {
                            setSelectedItem(fullDetails);
                            setModalType('edit-user');
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
                          'Delete User',
                          'Are you sure you want to delete this user?',
                          () => deleteUser(user.id)
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
