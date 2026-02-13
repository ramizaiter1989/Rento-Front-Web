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
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus, Trash } from "lucide-react";
import {
  getHolidays,
  deleteHoliday,
} from "@/lib/adminApi";
import { toast } from "@/hooks/use-toast";
import HolidayForm from "@/components/admin/HolidayForm";

const AdminHolidaysPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const response = await getHolidays();

      console.log("HOLIDAYS API RESPONSE:", response.data);

      setHolidays(response.data.holidays.data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to load holidays",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // 🗑 DELETE HOLIDAY
  const handleDelete = async (id) => {
    if (!confirm("Delete this holiday?")) return;

    try {
      await deleteHoliday(id);
      toast({ title: "Holiday deleted" });
      fetchHolidays();
    } catch {
      toast({
        title: "Failed to delete holiday",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Holidays</h1>

        <div className="flex gap-2">
          <Button
            size="sm"
            aria-label="Create new holiday"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Holiday
          </Button>

          <Button
            size="icon"
            aria-label="refresh data"
            variant="outline"
            onClick={fetchHolidays}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* CREATE HOLIDAY FORM */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Holiday</CardTitle>
          </CardHeader>
          <CardContent>
            <HolidayForm
              onSuccess={() => {
                setShowForm(false);
                fetchHolidays();
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* HOLIDAYS TABLE */}
      <Card>
        <CardContent>
          {loading ? (
            <p className="text-center py-6 text-muted-foreground">
              Loading holidays...
            </p>
          ) : holidays.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              No holidays found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Car</TableHead>
                    <TableHead>Holiday Name</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Increase %</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {holidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell>{holiday.id}</TableCell>

                      <TableCell>
                        {holiday.car?.make}{" "}
                        {holiday.car?.model}
                      </TableCell>

                      <TableCell>
                        {holiday.holiday_name}
                      </TableCell>

                      <TableCell className="text-xs">
                        {holiday.holiday_dates.start} →{" "}
                        {holiday.holiday_dates.end}
                      </TableCell>

                      <TableCell>
                        {holiday.percentage_increase}%
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            holiday.is_active
                              ? "success"
                              : "secondary"
                          }
                        >
                          {holiday.is_active
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          aria-label="Delete holiday"
                          variant="destructive"
                          onClick={() =>
                            handleDelete(holiday.id)
                          }
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHolidaysPage;
