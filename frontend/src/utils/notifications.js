// Notifications are generated client-side (no backend notification model), so category and
// priority are inferred here from the title/message text rather than stored explicitly.
const RULES = [
  { match: /reject/i, category: 'Alerts', priority: 'high' },
  { match: /approv/i, category: 'Approvals', priority: 'normal' },
  { match: /drawing/i, category: 'Drawing Updates', priority: 'normal' },
  { match: /estimate/i, category: 'Estimates', priority: 'normal' },
];

export const inferNotificationMeta = (notif) => {
  const haystack = `${notif.title || ''} ${notif.message || ''}`;
  for (const rule of RULES) {
    if (rule.match.test(haystack)) return { category: rule.category, priority: rule.priority };
  }
  return { category: 'General', priority: 'low' };
};

// Reuses the existing status-badge palette already themed per-dashboard, so no new colors
// need to be introduced — high/normal/low just map onto danger/warning/success semantics.
export const PRIORITY_META = {
  high: { label: 'High', badgeClass: 'status-rejected' },
  normal: { label: 'Normal', badgeClass: 'status-pending' },
  low: { label: 'Low', badgeClass: 'status-success' },
};

// Notification ids are created as `Date.now()` or `Date.now() + Math.random()` at push time —
// there's no dedicated timestamp field, so this recovers an approximate creation time from it.
export const notificationTimestamp = (notif) => Math.floor(Number(notif.id)) || Date.now();
