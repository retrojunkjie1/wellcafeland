// src/services/shareableLinks.js

import { safeUUID } from "@/utils/uuid";

const SHAREABLE_LINKS_KEY = "wc-shareable-links-v1";

/**
 * Generate a unique token for a shareable link
 */
function generateToken() {
  return `share_${safeUUID()}`;
}

/**
 * Get all shareable links from storage
 */
function getAllLinks() {
  try {
    const raw = localStorage.getItem(SHAREABLE_LINKS_KEY);
    if (!raw) return Object.create(null);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return Object.create(null);

    const links = Object.create(null);
    for (const [token, value] of Object.entries(parsed)) {
      Object.defineProperty(links, token, { value, enumerable: true, configurable: true, writable: true });
    }
    return links;
  } catch {
    return Object.create(null);
  }
}

function isShareToken(token) {
  // Accept existing timestamp-based tokens while minting only UUID-backed tokens.
  return typeof token === "string" && /^share_[A-Za-z0-9_-]{1,160}$/.test(token);
}

function withoutToken(links, token) {
  const remaining = Object.create(null);
  for (const [storedToken, value] of Object.entries(links)) {
    if (storedToken !== token) {
      Object.defineProperty(remaining, storedToken, { value, enumerable: true, configurable: true, writable: true });
    }
  }
  return remaining;
}

/**
 * Save all shareable links to storage
 */
function saveAllLinks(links) {
  try {
    localStorage.setItem(SHAREABLE_LINKS_KEY, JSON.stringify(links));
  } catch {
    // Silent fail
  }
}

/**
 * Create a shareable link for a session
 * Returns the full URL and token
 */
export function createShareableLink(session) {
  try {
    if (!session) return null;

    const token = generateToken();
    const links = getAllLinks();

    // Store session data with token
    Object.defineProperty(links, token, { value: {
      session: session,
      createdAt: new Date().toISOString(),
      expiresAt: null, // Can add expiration later
    }, enumerable: true, configurable: true, writable: true });

    saveAllLinks(links);

    // Generate full URL
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/preview/${token}`;

    return {
      token,
      url: shareUrl,
    };
  } catch {
    return null;
  }
}

/**
 * Get session data from a shareable link token
 */
export function getSessionFromToken(token) {
  try {
    if (!isShareToken(token)) return null;
    const links = getAllLinks();
    const linkData = Object.hasOwn(links, token)
      ? Object.entries(links).find(([storedToken]) => storedToken === token)?.[1]
      : null;

    if (!linkData) return null;

    // Check expiration if set
    if (linkData.expiresAt) {
      const expires = new Date(linkData.expiresAt);
      if (expires < new Date()) {
        // Expired, remove it
        saveAllLinks(withoutToken(links, token));
        return null;
      }
    }

    return linkData.session;
  } catch {
    return null;
  }
}

/**
 * Delete a shareable link
 */
export function deleteShareableLink(token) {
  try {
    if (!isShareToken(token)) return;
    const links = getAllLinks();
    saveAllLinks(withoutToken(links, token));
  } catch {
    // Silent fail
  }
}

/**
 * Get all shareable links (for admin/managing)
 */
export function getAllShareableLinks() {
  return getAllLinks();
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

