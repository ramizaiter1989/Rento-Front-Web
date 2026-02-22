/**
 * Super Admin Alerts
 * Lists notifications received by the super admin (GET /api/notifications):
 * - profile_completed: user completed profile -> link to user / real-user-data
 * - new_otp: OTP sent -> link to OTPs page
 * Unread count, mark as read (single or all).
 */

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, getUnreadNotificationsCount, markNotificationsAsRead } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Loader2, UserCheck, KeyRound, CheckCheck, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const TYPE_CONFIG = {
  profile_completed: {
    label: "Profile completed",
    icon: UserCheck,
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  new_otp: {
    label: "New OTP sent",
    icon: KeyRound,
    color: "bg-amber-100 text-amber-800 border-amber-300",
  },
};

export default function AdminAlertsPage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { per_page: perPage, page };
      if (unreadOnly) params.unread_only = true;
      const res = await getNotifications(params);
      const payload = res.data?.notifications ?? res.data;
      const data = payload?.data ?? (Array.isArray(payload) ? payload : []);
      setList(data);
      setMeta({
        current_page: payload?.current_page ?? 1,
        last_page: payload?.last_page ?? 1,
        per_page: payload?.per_page ?? perPage,
        total: payload?.total ?? 0,
      });
      if (res.data?.unread_count != null) setUnreadCount(res.data.unread_count);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load notifications");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, unreadOnly]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadNotificationsCount();
      const count = res.data?.unread_count ?? res.data?.count ?? 0;
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const handleMarkRead = async (notificationIds) => {
    try {
      await markNotificationsAsRead(notificationIds ? { notification_ids: notificationIds } : { mark_all: true });
      toast.success(notificationIds ? "Marked as read." : "All marked as read.");
      fetchList();
      fetchUnreadCount();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark as read");
    }
  };

  const handleNavigate = (notification) => {
    const type = notification.type;
    const data = notification.data || {};
    if (type === "profile_completed" && data.user_id) {
      navigate("/admin/real-user-data", { state: { highlightUserId: data.user_id } });
    } else if (type === "new_otp") {
      navigate("/admin/otps");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Bell className="w-6 h-6" />
        My Alerts
      </h1>
      <p className="text-sm text-muted-foreground">
        Profile completed and new OTP notifications. Mark as read and open user or OTPs from here.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Notifications</CardTitle>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Select value={unreadOnly ? "unread" : "all"} onValueChange={(v) => { setUnreadOnly(v === "unread"); setPage(1); }}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => handleMarkRead()}>
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
            {unreadCount > 0 && (
              <Badge variant="secondary">Unread: {unreadCount}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : list.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No notifications</p>
          ) : (
            <ul className="space-y-2">
              {list.map((n) => {
                const config = TYPE_CONFIG[n.type] || { label: n.type, icon: Bell, color: "bg-muted" };
                const Icon = config.icon;
                return (
                  <li
                    key={n.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${!n.is_read ? "bg-primary/5 border-primary/20" : "bg-card"}`}
                  >
                    <div className={`rounded-full p-2 ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{n.title || config.label}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {n.notification_text ?? n.message ?? ""}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!n.is_read && (
                        <Button variant="ghost" size="sm" onClick={() => handleMarkRead([n.id])}>
                          Mark read
                        </Button>
                      )}
                      {(n.type === "profile_completed" || n.type === "new_otp") && (
                        <Button variant="outline" size="sm" onClick={() => handleNavigate(n)}>
                          Open
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {meta.last_page > 1 && (
            <div className="flex justify-between items-center mt-4 text-sm">
              <span className="text-muted-foreground">
                Page {meta.current_page} of {meta.last_page} · Total {meta.total}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
