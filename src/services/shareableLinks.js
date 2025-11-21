// src/services/shareableLinks.js

const SHAREABLE_LINKS_KEY = "wc-shareable-links-v1";

/**
 * Generate a unique token for a shareable link
 */
function generateToken() {
  return `share_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get all shareable links from storage
 */
function getAllLinks() {
  try {
    const raw = localStorage.getItem(SHAREABLE_LINKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
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
    links[token] = {
      session: session,
      createdAt: new Date().toISOString(),
      expiresAt: null, // Can add expiration later
    };

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
    const links = getAllLinks();
    const linkData = links[token];

    if (!linkData) return null;

    // Check expiration if set
    if (linkData.expiresAt) {
      const expires = new Date(linkData.expiresAt);
      if (expires < new Date()) {
        // Expired, remove it
        delete links[token];
        saveAllLinks(links);
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
    const links = getAllLinks();
    delete links[token];
    saveAllLinks(links);
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

