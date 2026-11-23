import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthHeaders: vi.fn(),
  getCuratedFallback: vi.fn(),
  searchProviders: vi.fn(),
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

vi.mock("@/services/logService", () => ({ logError: mocks.logError, logWarn: mocks.logWarn }));
vi.mock("@/services/apiBase", () => ({ buildApiUrl: (path) => `https://api.example.test${path}` }));
vi.mock("@/services/aiSessionClient", () => ({ getAuthHeaders: mocks.getAuthHeaders }));
vi.mock("@/lib/directoryCuratedFallback", () => ({
  getCuratedFallback: mocks.getCuratedFallback,
  isNigeriaLocation: (value = "") => /\b(?:nigeria|ng|lagos|abuja)\b/i.test(value),
}));
vi.mock("./providerService", () => ({ searchProviders: mocks.searchProviders }));

import { searchResources } from "./resourceSearch";

function response(status, payload) {
  return { ok: status >= 200 && status < 300, status, json: async () => payload };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAuthHeaders.mockResolvedValue({});
  mocks.getCuratedFallback.mockReturnValue([]);
  mocks.searchProviders.mockResolvedValue([]);
});

afterEach(() => vi.unstubAllGlobals());

describe("resource search country scope", () => {
  it("filters international live results and reports the filtered count", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(200, {
      ok: true,
      results: [
        { id: "uk-food", title: "London food support", city: "London", country: "United Kingdom" },
        { id: "ng-food", title: "Lagos food support", city: "London", countryCode: "NG", phone: "+2348000000000" },
      ],
      nextPageToken: "page-two",
      meta: { sourceCount: 2 },
    })));

    const result = await searchResources({ query: "food assistance", domain: "food.essentials", region: "London" });

    expect(result.results.map(({ id }) => id)).toEqual(["uk-food"]);
    expect(result.nextPageToken).toBe("page-two");
    expect(result.meta.sourceCount).toBe(1);
  });

  it("keeps the next-page token when the first live page has only foreign listings", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(200, {
      ok: true,
      results: [{ id: "ng-food", title: "Lagos food support", city: "Lagos", country: "Nigeria" }],
      nextPageToken: "page-two",
    })));

    const result = await searchResources({ query: "food assistance", domain: "food.essentials", region: "London" });

    expect(result.ok).toBe(true);
    expect(result.results).toEqual([]);
    expect(result.nextPageToken).toBe("page-two");
    expect(result.meta.liveAvailable).toBe(true);
  });

  it("preserves pagination when a live page contains only foreign listings", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(200, {
      ok: true,
      results: [{ id: "ng-food", title: "Lagos food support", city: "Lagos", country: "Nigeria" }],
      nextPageToken: "page-three",
    })));

    const result = await searchResources({
      query: "food assistance",
      domain: "food.essentials",
      region: "London",
      pageToken: "page-two",
    });

    expect(result.ok).toBe(true);
    expect(result.results).toEqual([]);
    expect(result.nextPageToken).toBe("page-three");
  });

  it("does not return a foreign curated pathway for a recognized country", async () => {
    mocks.getCuratedFallback.mockReturnValue([{
      id: "lagos-food",
      name: "Lagos food support",
      description: "Food support in Lagos.",
      country: "Nigeria",
      link: "https://example.test/lagos-food",
    }]);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(503, { ok: false, error: "Unavailable" })));

    const result = await searchResources({ query: "food assistance", domain: "food.essentials", region: "London" });

    expect(result.ok).toBe(false);
    expect(result.results).toEqual([]);
    expect(mocks.getCuratedFallback).toHaveBeenCalledWith("food.essentials", "food assistance", "London");
  });
});
