import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";

export default function useSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
  });

  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/suggestions", {
        params: {
          page: filters.page,
        },
      });

      const payload = res.data?.suggestions;

      setSuggestions(payload?.data || []);
      setMeta({
        current_page: payload?.current_page,
        last_page: payload?.last_page,
        from: payload?.from,
        to: payload?.to,
        total: payload?.total,
      });
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setSuggestions([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [filters.page]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return {
    suggestions,
    meta,
    loading,
    filters,
    setFilters,
    refresh: fetchSuggestions,
  };
}
