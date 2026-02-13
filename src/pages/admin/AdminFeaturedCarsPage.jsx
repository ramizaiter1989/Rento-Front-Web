import { useEffect, useState } from "react";
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
import { RefreshCw, Plus, Trash } from "lucide-react";
import {
  getFeaturedCars,
  deleteFeaturedCar,
} from "@/lib/adminApi";
import { toast } from "@/hooks/use-toast";
import FeaturedCarForm from "@/components/admin/FeaturedCarForm";


const AdminFeaturedCarsPage = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchFeaturedCars = async () => {
    setLoading(true);
    try {
      const { data } = await getFeaturedCars();
      setFeaturedCars(data.featured_cars.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedCars();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this featured car?")) return;

    try {
      await deleteFeaturedCar(id);
      toast({ title: "Featured car removed" });
      fetchFeaturedCars();
    } catch {
      toast({
        title: "Failed to delete featured car",
        variant: "destructive",
      });
    }
  };

  const calculateDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff =
      Math.ceil((e - s) / (1000 * 60 * 60 * 24)) || 0;
    return `${diff} days`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Featured Cars</h1>

        <div className="flex gap-2">
          <Button
            size="sm"
            aria-label="Create new featured car"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Featured Car
          </Button>

          <Button
            size="icon"
            aria-label="refresh data"
            variant="outline"
            onClick={fetchFeaturedCars}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create Featured Car */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Featured Car</CardTitle>
          </CardHeader>
          <CardContent>
            <FeaturedCarForm
              onSuccess={() => {
                setShowForm(false);
                fetchFeaturedCars();
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Car</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Expire Date</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {featuredCars.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>

                    <TableCell>
                      {item.car?.make} {item.car?.model}
                    </TableCell>

                    <TableCell>
                      {calculateDuration(
                        item.start_at,
                        item.expire_at
                      )}
                    </TableCell>

                    <TableCell>
                      {new Date(
                        item.start_at
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      {new Date(
                        item.expire_at
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        aria-label="Delete featured car"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {!loading && featuredCars.length === 0 && (
            <p className="text-center text-muted-foreground py-6">
              No featured cars found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeaturedCarsPage;
