// src/utils/uuid.js
// RFC4122 v4 UUID generator - works everywhere, no crypto.randomUUID() failures

export function uuid() {
  // Try crypto.randomUUID() first (modern browsers)
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    try {
      return globalThis.crypto.randomUUID();
    } catch (err) {
      // Fall through to fallback
    }
  }
  if (typeof crypto !== "undefined" && crypto?.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (err) {
      // Fall through to fallback
    }
  }
  
  // Fallback: Use crypto.getRandomValues for RFC4122 v4 UUID
  if (typeof crypto !== "undefined" && crypto?.getRandomValues) {
    try {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
      
      const hex = Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32)
      ].join('-');
    } catch (err) {
      // Fall through to simple fallback
    }
  }
  
  // Final fallback: timestamp + random (not RFC4122, but unique)
  return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 11) + "_" + Math.random().toString(36).slice(2, 11);
}

// Legacy export for backwards compatibility
export function safeUUID() {
  return uuid();
}

