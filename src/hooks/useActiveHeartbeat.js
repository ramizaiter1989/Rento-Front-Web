import { useEffect, useRef } from 'react';
import { postMeActive } from '@/lib/api';

const HEARTBEAT_INTERVAL_MS = 90_000; // 90 seconds

/**
 * Sends a periodic heartbeat (POST /api/me/active) while the user is authenticated.
 * Super Admin can see the user as online / last seen.
 * Call when user is logged in; clears interval on logout/unmount.
 *
 * @param {boolean} isAuthenticated - Whether the user is logged in
 */
export function useActiveHeartbeat(isAuthenticated) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const tick = () => {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) return;
      postMeActive().catch(() => {});
    };

    tick(); // fire once immediately
    intervalRef.current = setInterval(tick, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated]);
}
