const SUPPORT_MAP_PREFIX = "wc-support-map-v1";

function storageKey(userId) {
  return typeof userId === "string" && userId.trim()
    ? `${SUPPORT_MAP_PREFIX}:${userId.trim()}`
    : null;
}

function normalizeSupportMap(value) {
  if (!value || typeof value !== "object" || !value.selection || !value.map) return null;
  const shortText = (input, limit) => typeof input === "string" ? input.trim().slice(0, limit) : "";
  const list = (input, limit) => Array.isArray(input)
    ? input.filter((item) => typeof item === "string" && item.trim()).slice(0, limit).map((item) => item.trim().slice(0, 100))
    : [];
  const normalized = {
    savedAt: Number.isFinite(value.savedAt) ? value.savedAt : Date.now(),
    selection: {
      situations: list(value.selection.situations, 4),
      helps: list(value.selection.helps, 4),
      avoid: list(value.selection.avoid, 4),
    },
    map: {
      overview: shortText(value.map.overview, 300),
      helpfulSupports: list(value.map.helpfulSupports, 4),
      avoid: list(value.map.avoid, 4),
      firstStep: shortText(value.map.firstStep, 220),
    },
  };
  if (!normalized.map.overview || !normalized.map.firstStep || !normalized.selection.situations.length || !normalized.selection.helps.length) return null;
  return normalized;
}

export function getMySupportMap(userId) {
  const key = storageKey(userId);
  if (!key || typeof localStorage === "undefined") return null;
  try {
    const stored = localStorage.getItem(key);
    return stored ? normalizeSupportMap(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

export function saveMySupportMap(userId, snapshot) {
  const key = storageKey(userId);
  const normalized = normalizeSupportMap(snapshot);
  if (!key || !normalized || typeof localStorage === "undefined") return false;
  try {
    localStorage.setItem(key, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

export function clearMySupportMap(userId) {
  const key = storageKey(userId);
  if (!key || typeof localStorage === "undefined") return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export default { getMySupportMap, saveMySupportMap, clearMySupportMap };
