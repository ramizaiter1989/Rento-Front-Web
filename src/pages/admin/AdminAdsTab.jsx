import React from 'react';
import { Plus, Edit, Trash2, RefreshCw, BarChart3, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminAdsTab() {
  const {
    ads,
    navigate,
    setSelectedItem,
    setModalType,
    setModalOpen,
    fetchAds,
    showConfirmDialog,
    deleteAd
  } = useAdmin();

  const list = ads?.data ?? (Array.isArray(ads) ? ads : []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setSelectedItem(null);
              setModalType('create-ad');
              setModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Ad
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/ads-analytics')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>
        <Button variant="outline" size="icon" onClick={fetchAds} aria-label="Refresh ads">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Company Type</TableHead>
                <TableHead>Online</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(list) ? list : []).map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>{ad.id}</TableCell>
                  <TableCell>{ad.website}</TableCell>
                  <TableCell>{ad.company_type}</TableCell>
                  <TableCell>
                    {ad.online ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell>{ad.nb_views}</TableCell>
                  <TableCell>{ad.nb_clicks}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedItem(ad);
                          setModalType('edit-ad');
                          setModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => showConfirmDialog(
                          'Delete Ad',
                          'Are you sure you want to delete this ad?',
                          () => deleteAd(ad.id)
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
