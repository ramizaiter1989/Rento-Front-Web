import { useEffect, useState } from "react";
import AdForm from "@/components/admin/AdForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus, Trash } from "lucide-react";
import { getAds, deleteAd } from "@/lib/adminApi";
import { toast } from "@/hooks/use-toast";

const AdminAdsPage = () => {
  const [ads, setAds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const { data } = await getAds();
      setAds(data.ads.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this ad?")) return;

    try {
      await deleteAd(id);
      toast({ title: "Ad deleted" });
      fetchAds();
    } catch {
      toast({
        title: "Failed to delete ad",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ads</h1>

        <div className="flex gap-2">
          <Button
            size="sm"
            aria-label="Create new ad"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Ad
          </Button>

          <Button
            size="icon"
            aria-label="refresh data"
            variant="outline"
            onClick={fetchAds}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Advertisement</CardTitle>
          </CardHeader>
          <CardContent>
            <AdForm
              onSuccess={() => {
                setShowForm(false);
                fetchAds();
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Ads Table */}
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Online</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {ads.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell>{ad.id}</TableCell>

                    <TableCell className="max-w-[160px] truncate">
                      <a
                        href={ad.website}
                        target="_blank"
                        className="text-blue-400 hover:underline"
                      >
                        {ad.website}
                      </a>
                    </TableCell>

                    <TableCell>{ad.company_type}</TableCell>

                    <TableCell>
                      {ad.user?.username ?? "—"}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          ad.online ? "success" : "secondary"
                        }
                      >
                        {ad.online ? "Online" : "Offline"}
                      </Badge>
                    </TableCell>

                    <TableCell>{ad.nb_views}</TableCell>
                    <TableCell>{ad.nb_clicks}</TableCell>

                    <TableCell>
                      ${Number(ad.amount_cost).toFixed(2)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        aria-label="Delete ad"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {!loading && ads.length === 0 && (
            <p className="text-center text-muted-foreground py-6">
              No ads found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAdsPage;
