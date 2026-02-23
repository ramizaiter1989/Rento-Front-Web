/**
 * Polls super admin notifications and shows a toast for each new one.
 * Types: new_otp, profile_completed, user_registered (or similar).
 * Use inside AdminLayout so toasts appear while admin is in the dashboard.
 */

import { useEffect, useRef } from "react";
import { getNotifications } from "@/lib/api";
import { toast } from "sonner";

const POLL_INTERVAL_MS = 45 * 1000;

function getToastForNotification(notification) {
  const type = notification.type || "";
  const title = notification.title || "Notification";
  const message = notification.notification_text || notification.message || "";

  switch (type) {
    case "new_otp":
      return {
        title: "New OTP sent",
        description: message || "An OTP was sent to a phone number.",
        type: "info",
      };
    case "profile_completed":
      return {
        title: "Profile completed (Real user data)",
        description: message || "A user has completed their profile. Review in Real User Data.",
        type: "success",
      };
    case "user_registered":
    case "new_user_registered":
      return {
        title: "New user registered",
        description: message || "A new user has registered.",
        type: "success",
      };
    default:
      return {
        title: title || "Notification",
        description: message,
        type: "info",
      };
  }
}

export function useAdminNotificationToasts() {
  const seenIdsRef = useRef(new Set());
  const initialLoadRef = useRef(true);

  useEffect(() => {
    let intervalId;

    const poll = async () => {
      try {
        const res = await getNotifications({ unread_only: true, per_page: 20 });
        const payload = res.data?.notifications ?? res.data;
        const list = payload?.data ?? (Array.isArray(payload) ? payload : []);
        const notifications = Array.isArray(list) ? list : [];

        if (initialLoadRef.current) {
          notifications.forEach((n) => n.id != null && seenIdsRef.current.add(n.id));
          initialLoadRef.current = false;
          return;
        }

        for (const n of notifications) {
          if (n.id == null) continue;
          if (seenIdsRef.current.has(n.id)) continue;
          seenIdsRef.current.add(n.id);
          const { title, description, type } = getToastForNotification(n);
          if (type === "success") {
            toast.success(title, { description });
          } else if (type === "error") {
            toast.error(title, { description });
          } else {
            toast.info(title, { description });
          }
        }
      } catch {
        // ignore poll errors (e.g. 403 if not super_admin)
      }
    };

    poll();
    intervalId = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);
}
