import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listResources: vi.fn(),
  getCuratedFallback: vi.fn(),
  getAuthHeaders: vi.fn(),
}));

vi.mock("@/lib/debug", () => ({ logDebug: vi.fn() }));
vi.mock("@/lib/directoryCuratedFallback", () => ({ getCuratedFallback: mocks.getCuratedFallback }));
vi.mock("@/services/apiBase", () => ({ buildApiUrl: (path) => `https://api.example.test${path}` }));
vi.mock("@/services/aiSessionClient", () => ({ getAuthHeaders: mocks.getAuthHeaders }));
vi.mock("@/data/resources", () => ({ listResources: mocks.listResources }));

import { searchDirectory } from "./directorySearch";

function response(status, payload) {
  return { ok: status >= 200 && status < 300, status, json: async () => payload };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAuthHeaders.mockResolvedValue({});
  mocks.listResources.mockResolvedValue({ items: [], error: null });
  mocks.getCuratedFallback.mockReturnValue([]);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("directory search availability", () => {
  it("keeps a genuine live no-match response distinct from a service failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(200, { ok: true, results: [] })));

    const result = await searchDirectory({ query: "rare support term", domain: "programs" });

    expect(result).toMatchObject({ ok: true, items: [], meta: { empty: true }, error: null });
  });

  it("returns a retryable service error when the live directory and fallbacks have no matches", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(503, { ok: false, error: "Provider unavailable" })));

    const result = await searchDirectory({ query: "unique support phrase", domain: "programs" });

    expect(result.ok).toBe(false);
    expect(result.items).toEqual([]);
    expect(result.meta).toMatchObject({ unavailable: true, fallback: "curated" });
    expect(result.error).toMatch(/could not be reached/i);
    expect(result.error).not.toContain("Provider unavailable");
  });

  it("keeps matching curated resources usable when the live directory is disabled", async () => {
    mocks.getCuratedFallback.mockReturnValue([{
      id: "community-care",
      name: "Community care support",
      description: "A guide to community care support services.",
      link: "https://support.example.test",
      source: "WellnessCafe resource guide",
    }]);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(403, { ok: false, code: "UPSTREAM_NOT_ENABLED" })));

    const result = await searchDirectory({ query: "community care support", domain: "programs" });

    expect(result).toMatchObject({ ok: true, meta: { fallback: "curated", subscriptionBlocked: true } });
    expect(result.items).toHaveLength(1);
    expect(result.error).toBeNull();
  });
});
