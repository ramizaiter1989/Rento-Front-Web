import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createHoliday } from "@/lib/adminApi";
import { toast } from "@/hooks/use-toast";

const HolidayForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    car_id: "",
    holiday_name: "",
    start: "",
    end: "",
    percentage_increase: "",
    is_active: true,
  });

  const update = (k, v) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createHoliday({
        car_id: Number(form.car_id),
        holiday_name: form.holiday_name,
        holiday_dates: {
          start: form.start,
          end: form.end,
        },
        percentage_increase: Number(
          form.percentage_increase
        ),
        is_active: form.is_active,
      });

      toast({ title: "Holiday created" });
      onSuccess?.();
    } catch {
      toast({
        title: "Failed to create holiday",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div>
        <Label>Car ID</Label>
        <Input
          value={form.car_id}
          onChange={(e) =>
            update("car_id", e.target.value)
          }
          required
        />
      </div>

      <div>
        <Label>Holiday Name</Label>
        <Input
          value={form.holiday_name}
          onChange={(e) =>
            update("holiday_name", e.target.value)
          }
          required
        />
      </div>

      <div>
        <Label>Start Date</Label>
        <Input
          type="date"
          value={form.start}
          onChange={(e) =>
            update("start", e.target.value)
          }
          required
        />
      </div>

      <div>
        <Label>End Date</Label>
        <Input
          type="date"
          value={form.end}
          onChange={(e) =>
            update("end", e.target.value)
          }
          required
        />
      </div>

      <div>
        <Label>Increase %</Label>
        <Input
          type="number"
          step="0.01"
          value={form.percentage_increase}
          onChange={(e) =>
            update("percentage_increase", e.target.value)
          }
          required
        />
      </div>

      <div className="flex items-center gap-3 mt-6">
        <Switch
          checked={form.is_active}
          onCheckedChange={(v) =>
            update("is_active", v)
          }
        />
        <Label>Active</Label>
      </div>

      <div className="md:col-span-2 flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create Holiday"}
        </Button>
      </div>
    </form>
  );
};

export default HolidayForm;
