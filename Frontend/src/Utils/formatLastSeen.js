/**
 * Returns true if the given last_seen timestamp is within the
 * specified number of minutes (default 5).
 */
export const isOnline = (lastSeen, thresholdMinutes = 5) => {
  if (!lastSeen) return false;

  const lastSeenDate = new Date(lastSeen);
  if (Number.isNaN(lastSeenDate.getTime())) return false;

  const now = Date.now();
  const diffMs = now - lastSeenDate.getTime();

  return diffMs >= 0 && diffMs < thresholdMinutes * 60 * 1000;
};

/**
 * Format a last_seen timestamp into a human-friendly string:
 *   - "Online" if within the last 5 minutes
 *   - "last seen X minutes ago"
 *   - "last seen X hours ago"
 *   - "last seen today at HH:MM AM/PM"
 *   - "last seen yesterday at HH:MM AM/PM"
 *   - "last seen MMM D at HH:MM AM/PM"
 */
export const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return null;

  const lastSeenDate = new Date(lastSeen);
  if (Number.isNaN(lastSeenDate.getTime())) return null;

  const now = new Date();
  const diffMs = now.getTime() - lastSeenDate.getTime();

  if (diffMs < 0) return "last seen just now";

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Within 5 minutes – consider "online"
  if (diffMinutes < 5) {
    return "online";
  }

  // Less than 60 minutes
  if (diffMinutes < 60) {
    return `last seen ${diffMinutes}m ago`;
  }

  // Less than 24 hours
  if (diffHours < 24) {
    return `last seen ${diffHours}h ago`;
  }

  const timeStr = lastSeenDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (lastSeenDate.toDateString() === yesterday.toDateString()) {
    return `last seen yesterday at ${timeStr}`;
  }

  // Within this year
  if (diffDays < 365) {
    const dateStr = lastSeenDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `last seen ${dateStr} at ${timeStr}`;
  }

  // Older
  const fullDateStr = lastSeenDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `last seen ${fullDateStr} at ${timeStr}`;
};