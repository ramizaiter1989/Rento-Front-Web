import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { sendNotificationToAll } from "@/lib/adminApi";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
  });

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/notifications", {
        params: { page: filters.page },
      });

      const payload = res.data?.notifications;

      setNotifications(payload?.data || []);
      setMeta({
        current_page: payload?.current_page,
        last_page: payload?.last_page,
        from: payload?.from,
        to: payload?.to,
        total: payload?.total,
      });
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotifications([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [filters.page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* =========================
     DELETE NOTIFICATION
  ========================= */
  const deleteNotification = async (id) => {
    if (!confirm("Delete this notification?")) return;

    try {
      await api.delete(`/admin/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  /* =========================
     SEND TO ALL
  ========================= */
  const sendToAll = async () => {
    const title = prompt("Notification title:");
    if (!title) return;

    const message = prompt("Notification message:");
    if (!message) return;

    try {
      await sendNotificationToAll({
        title,
        message,
        type: "general",
      });

      alert("Notification sent to all users");
      fetchNotifications();
    } catch (err) {
      console.error("Send failed:", err);
      alert("Failed to send notification");
    }
  };

  return {
    notifications,
    meta,
    loading,
    filters,
    setFilters,
    refresh: fetchNotifications,
    deleteNotification,
    sendToAll,
  };
}
