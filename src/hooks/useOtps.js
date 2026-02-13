import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";

export default function useOtps() {
  const [otps, setOtps] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
  });

  const fetchOtps = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/otps", {
        params: {
          page: filters.page,
        },
      });

      const payload = res.data?.otps;

      setOtps(payload?.data || []);
      setMeta({
        current_page: payload?.current_page,
        last_page: payload?.last_page,
        from: payload?.from,
        to: payload?.to,
        total: payload?.total,
      });
    } catch (err) {
      console.error("Failed to fetch OTPs:", err);
      setOtps([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [filters.page]);

  useEffect(() => {
    fetchOtps();
  }, [fetchOtps]);

  return {
    otps,
    meta,
    loading,
    filters,
    setFilters,
    refresh: fetchOtps,
  };
}
