// src/utils/formatMessage.js
// Utility to format message content with heading support (H2, H3, H4)

/**
 * Format message content to support markdown-style headings
 * Converts # Heading to H2, ## Heading to H3, ### Heading to H4
 * @param {string} text - Raw message text
 * @returns {string} HTML string with formatted headings
 */
export function formatMessageWithHeadings(text) {
  if (!text) return "";
  
  // Escape HTML first to prevent XSS
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // Convert markdown-style headings to HTML with proper styling
  // H4 (### Heading)
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-lg font-medium text-white mt-4 mb-2">$1</h4>');
  
  // H3 (## Heading)
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-xl font-medium text-white mt-5 mb-3">$1</h3>');
  
  // H2 (# Heading)
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-2xl font-semibold text-white mt-6 mb-4">$1</h2>');
  
  // Convert line breaks to <br />
  html = html.replace(/\n/g, '<br />');
  
  return html;
}

