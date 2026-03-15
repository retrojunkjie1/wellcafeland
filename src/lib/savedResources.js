// src/lib/savedResources.js
// Local-only saved resources (Phase 54H). Max 50, dedupe by id or url+title.

const STORAGE_KEY = "wc_saved_resources_v1";
const MAX_ITEMS = 50;

function loadRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRaw(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {}
}

function dedupeKey(item) {
  const id = item?.id;
  if (id) return `id:${id}`;
  const url = item?.url || item?.link || "";
  const title = (item?.title || item?.name || "").slice(0, 80);
  return `url:${url}|title:${title}`;
}

export function loadSavedResources() {
  return loadRaw();
}

export function saveResource(item) {
  if (!item || typeof item !== "object") return;
  const list = loadRaw();
  const key = dedupeKey(item);
  const existing = list.findIndex((r) => dedupeKey(r) === key);
  const toAdd = {
    id: item.id || item.url || `saved-${Date.now()}`,
    title: item.title || item.name || "Untitled",
    summary: item.summary || item.description || "",
    domain: item.domain || "other",
    phone: item.phone || null,
    url: item.url || item.link || null,
    locationLine: item.locationLine || "",
    tags: Array.isArray(item.tags) ? item.tags : [],
    source: item.source || null,
    savedAt: Date.now(),
  };
  if (existing >= 0) list[existing] = toAdd;
  else list.unshift(toAdd);
  saveRaw(list);
}

export function removeResource(id) {
  const list = loadRaw().filter((r) => r.id !== id);
  saveRaw(list);
}
