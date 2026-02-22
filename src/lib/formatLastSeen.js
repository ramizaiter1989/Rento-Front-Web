/**
 * Format last_used_at or last_seen_at for display.
 * @param {string|null} lastUsedAt - ISO 8601 datetime
 * @returns {string}
 */
export function formatLastSeen(lastUsedAt) {
  if (!lastUsedAt) return "Never";
  const d = new Date(lastUsedAt);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString();
}

/**
 * Get the latest last_used_at from user's sessions.
 * @param {Object} user - User with sessions array
 * @returns {string|null}
 */
export function getLatestLastSeen(user) {
  const sessions = user?.sessions ?? [];
  if (sessions.length === 0) return null;
  const dates = sessions.map((s) => s.last_used_at).filter(Boolean);
  if (dates.length === 0) return null;
  return dates.sort((a, b) => new Date(b) - new Date(a))[0];
}
