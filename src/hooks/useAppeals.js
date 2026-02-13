import { useEffect, useState, useCallback } from "react";
import { getAppeals, updateAppeal } from "@/lib/adminApi";
import { toast } from "@/hooks/use-toast";

export default function useAppeals() {
  const [appeals, setAppeals] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
  });

  const fetchAppeals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAppeals({
        search: filters.search || undefined,
        status: filters.status || undefined,
        page: filters.page,
      });

      console.log("APPEALS API RESPONSE:", response.data);

      setAppeals(response.data.appeals.data);
      setMeta(response.data.appeals);
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to load appeals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAppeals();
  }, [fetchAppeals]);

  const refresh = () => fetchAppeals();

  const updateStatus = async (id, data) => {
    try {
      await updateAppeal(id, data);
      toast({ title: "Appeal updated" });
      fetchAppeals();
    } catch {
      toast({
        title: "Failed to update appeal",
        variant: "destructive",
      });
    }
  };

  return {
    appeals,
    meta,
    loading,
    filters,
    setFilters,
    refresh,
    updateStatus,
  };
}
