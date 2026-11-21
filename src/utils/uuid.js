// src/utils/uuid.js
// RFC4122 v4 UUID generator. IDs used for users, sessions, and links must never
// fall back to predictable or cryptographically weak randomness.

export function uuid() {
  const cryptoProvider = globalThis.crypto;
  if (typeof cryptoProvider?.randomUUID === "function") {
    try {
      return cryptoProvider.randomUUID();
    } catch {
      // Some runtimes expose randomUUID but disable it; getRandomValues remains
      // a secure alternative where the Web Crypto API is available.
    }
  }

  if (typeof cryptoProvider?.getRandomValues !== "function") {
    throw new Error("Secure randomness is unavailable in this environment");
  }

  const bytes = new Uint8Array(16);
  cryptoProvider.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

// Legacy export for backwards compatibility
export function safeUUID() {
  return uuid();
}

