/**
 * Normalize URL for external links. Ensures http/https so iOS Safari opens reliably.
 * @param {string} [url] - Raw URL (may be missing protocol)
 * @returns {string} Normalized URL or empty string if invalid
 */
export function normalizeExternalUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}
