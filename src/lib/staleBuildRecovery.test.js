import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleStaleChunkPreloadError, installStaleBuildRecovery } from "./staleBuildRecovery";

describe("stale build recovery", () => {
  let storage;
  let reload;

  beforeEach(() => {
    storage = { getItem: vi.fn(() => null), setItem: vi.fn() };
    reload = vi.fn();
  });

  it("reloads once when a lazy chunk belongs to an older deployed build", () => {
    const event = { payload: new TypeError("Failed to fetch dynamically imported module"), preventDefault: vi.fn() };

    expect(handleStaleChunkPreloadError(event, { storage, reload, now: 100_000 })).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(storage.setItem).toHaveBeenCalledWith("wellnesscafe:stale-chunk-reload", "100000");
    expect(reload).toHaveBeenCalledOnce();
  });

  it("does not reload repeatedly when the refreshed build still cannot load", () => {
    const event = { payload: new Error("Loading chunk 42 failed"), preventDefault: vi.fn() };
    storage.getItem.mockReturnValue("100000");

    expect(handleStaleChunkPreloadError(event, { storage, reload, now: 110_000 })).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it("leaves non-chunk errors and unavailable session storage to the route boundary", () => {
    const event = { payload: new Error("The support service is unavailable."), preventDefault: vi.fn() };

    expect(handleStaleChunkPreloadError(event, { storage, reload, now: 100_000 })).toBe(false);
    expect(handleStaleChunkPreloadError({ payload: new Error("Loading chunk 4 failed") }, { storage: null, reload, now: 100_000 })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it("installs and removes Vite's preload recovery listener", () => {
    const target = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      sessionStorage: storage,
      location: { reload },
    };

    const uninstall = installStaleBuildRecovery(target);
    expect(target.addEventListener).toHaveBeenCalledWith("vite:preloadError", expect.any(Function));
    uninstall();
    expect(target.removeEventListener).toHaveBeenCalledWith("vite:preloadError", expect.any(Function));
  });
});
