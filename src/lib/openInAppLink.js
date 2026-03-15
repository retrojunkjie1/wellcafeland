/**
 * Unified in-app link handler. Prefer InAppWebView; fallback to LinkPreviewCard + explicit external open.
 * Never ejects user by default.
 */

import { fetchLinkPreview } from "@/lib/linkPreview";

/**
 * Open a link in-app. Uses existing InAppWebView modal when setWebViewUrl is provided.
 * If iframe may be blocked, caller can use fetchLinkPreview + LinkPreviewCard with onOpenExternally.
 * @param {Object} opts
 * @param {string} opts.url - URL to open
 * @param {string} [opts.title] - Display title
 * @param {Function} [opts.setWebViewUrl] - Setter for InAppWebView url (opens modal)
 * @param {Function} [opts.setWebViewTitle] - Setter for modal title
 * @param {Function} [opts.setWebViewOpen] - Setter for modal open state
 */
export function openInAppLink({ url, title, setWebViewUrl, setWebViewTitle, setWebViewOpen }) {
  if (!url || typeof url !== "string") return;
  const trimmed = url.trim();
  if (!trimmed) return;
  if (setWebViewTitle) setWebViewTitle(title || trimmed);
  if (setWebViewOpen) setWebViewOpen(true);
  if (setWebViewUrl) setWebViewUrl(trimmed);
}

/**
 * Fetch link preview metadata for fallback UI when iframe is blocked.
 * @param {string} url
 * @returns {Promise<{title?: string, description?: string, image?: string, domain?: string, url: string}>}
 */
export async function getLinkPreviewFallback(url) {
  return fetchLinkPreview(url);
}
