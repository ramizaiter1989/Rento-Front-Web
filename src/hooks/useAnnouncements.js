import { useEffect, useState, useCallback } from "react";
import { getAnnouncements, deleteAnnouncement } from "@/lib/adminApi";
import { toast } from "@/hooks/use-toast";

export default function useAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
  });

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAnnouncements({
        search: filters.search || undefined,
        status: filters.status || undefined,
        page: filters.page,
      });

      console.log("ANNOUNCEMENTS API RESPONSE:", response.data);

      setAnnouncements(response.data.announcements.data);
      setMeta(response.data.announcements);
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const refresh = () => {
    fetchAnnouncements();
  };

  const removeAnnouncement = async (id) => {
    if (!confirm("Delete this announcement?")) return;

    try {
      await deleteAnnouncement(id);
      toast({ title: "Announcement deleted" });
      fetchAnnouncements();
    } catch {
      toast({
        title: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  return {
    announcements, 
    meta,          
    loading,
    filters,
    setFilters,
    refresh,
    removeAnnouncement,
  };
}
