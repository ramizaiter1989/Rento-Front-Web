import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, RefreshCw } from "lucide-react";
import { getAds, deleteAd } from "@/lib/adminApi";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function AdminAdsPage() {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Advertisements</CardTitle>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => navigate("/admin/ads/create")}
          >
            + Create Ad
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={fetchAds}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Period</TableHead>
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

                  <TableCell className="max-w-[180px] truncate">
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

                  <TableCell className="text-xs">
                    {new Date(ad.start_at).toLocaleDateString()} →{" "}
                    {new Date(ad.expire_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={ad.online ? "success" : "secondary"}
                    >
                      {ad.online ? "Online" : "Offline"}
                    </Badge>
                  </TableCell>

                  <TableCell>{ad.nb_views}</TableCell>
                  <TableCell>{ad.nb_clicks}</TableCell>

                  <TableCell>
                    ${Number(ad.amount_cost).toFixed(2)}
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        navigate(`/admin/ads/${ad.id}/edit`)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(ad.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
  );
}
