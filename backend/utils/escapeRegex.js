// Escapes regex metacharacters so user-supplied text can be safely interpolated into a
// RegExp/$regex query instead of being interpreted as a pattern (ReDoS / query-injection risk).
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = escapeRegex;
