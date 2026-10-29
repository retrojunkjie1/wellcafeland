const RECOVERY_KEY = "wellnesscafe:stale-chunk-reload";
const RECOVERY_WINDOW_MS = 30_000;

export function isStaleChunkError(error) {
  const message = String(error?.message || error || "");
  return /failed to fetch dynamically imported module|importing a module script failed|loading chunk\s+\S+\s+failed|chunkloaderror/i.test(message);
}

export function handleStaleChunkPreloadError(event, {
  storage = typeof window !== "undefined" ? window.sessionStorage : null,
  reload = () => window.location.reload(),
  now = Date.now(),
} = {}) {
  if (!isStaleChunkError(event?.payload) || !storage) return false;

  try {
    const previousReloadAt = Number(storage.getItem(RECOVERY_KEY));
    if (Number.isFinite(previousReloadAt) && previousReloadAt > 0 && now - previousReloadAt < RECOVERY_WINDOW_MS) {
      return false;
    }

    storage.setItem(RECOVERY_KEY, String(now));
  } catch {
    // If browser storage is unavailable, let the route boundary show its
    // recovery screen instead of risking an unguarded reload loop.
    return false;
  }

  event.preventDefault?.();
  reload();
  return true;
}

export function installStaleBuildRecovery(target = typeof window !== "undefined" ? window : null) {
  if (!target?.addEventListener) return () => {};
  const handle = (event) => {
    let storage;
    try {
      storage = target.sessionStorage;
    } catch {
      return;
    }
    handleStaleChunkPreloadError(event, { storage, reload: () => target.location.reload() });
  };
  target.addEventListener("vite:preloadError", handle);
  return () => target.removeEventListener("vite:preloadError", handle);
}
