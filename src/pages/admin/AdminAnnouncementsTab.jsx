import React from 'react';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminAnnouncementsTab() {
  const {
    announcements,
    setSelectedItem,
    setModalType,
    setModalOpen,
    fetchAnnouncements,
    showConfirmDialog,
    deleteAnnouncement
  } = useAdmin();

  const list = announcements?.data ?? (Array.isArray(announcements) ? announcements : []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => {
            setSelectedItem(null);
            setModalType('create-announcement');
            setModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Announcement
        </Button>
        <Button variant="outline" size="icon" onClick={fetchAnnouncements}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(list) ? list : []).map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell>{announcement.id}</TableCell>
                  <TableCell>{announcement.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{announcement.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{announcement.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    {announcement.target_audience?.join(', ') || 'All'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedItem(announcement);
                          setModalType('edit-announcement');
                          setModalOpen(true);
                        }}
                        aria-label="Edit announcement"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => showConfirmDialog(
                          'Delete Announcement',
                          'Are you sure you want to delete this announcement?',
                          () => deleteAnnouncement(announcement.id)
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
