import React from 'react';
import { Edit, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminSuggestionsTab() {
  const {
    suggestions,
    setSelectedItem,
    setModalType,
    setModalOpen,
    fetchSuggestions,
    showConfirmDialog,
    deleteSuggestion
  } = useAdmin();

  const list = suggestions?.data ?? (Array.isArray(suggestions) ? suggestions : []);

  return (
    <div className="space-y-4">
      <Button variant="outline" size="icon" onClick={fetchSuggestions} aria-label="Refresh suggestions">
        <RefreshCw className="w-4 h-4" />
      </Button>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(list) ? list : []).map((suggestion) => (
                <TableRow key={suggestion.id}>
                  <TableCell>{suggestion.id}</TableCell>
                  <TableCell>{suggestion.user?.name || 'N/A'}</TableCell>
                  <TableCell>{suggestion.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{suggestion.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedItem(suggestion);
                          setModalType('edit-suggestion');
                          setModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => showConfirmDialog(
                          'Delete Suggestion',
                          'Are you sure you want to delete this suggestion?',
                          () => deleteSuggestion(suggestion.id)
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
