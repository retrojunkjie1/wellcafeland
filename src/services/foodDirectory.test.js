import { afterEach, describe, expect, it, vi } from "vitest";
import { getFoodStateCode, normalizeFoodResource, searchFoodDirectory, searchFoodDirectoryByState, suggestFoodLocations } from "./foodDirectory";

const mocks = vi.hoisted(() => ({ call: vi.fn() }));
vi.mock("firebase/functions", () => ({ httpsCallable: (_functions, name, options) => (data) => mocks.call(name, options, data) }));
vi.mock("@/firebase", () => ({ functions: {} }));

describe("food directory results", () => {
  afterEach(() => { vi.restoreAllMocks(); mocks.call.mockReset(); });

  it("normalizes a source-checked record and preserves its attribution and provenance", () => {
    const item = normalizeFoodResource({
      id: 42,
      name: "Community Pantry",
      address: "10 Main St",
      city: "Denver",
      state: "CO",
      zip: "80202",
      data_source: "plentiful_org",
      verification_status: "verified",
      last_verified_date: "2026-09-01",
      distance_miles: 3,
      hours_status: "unknown",
      services_offered_json: '["food_pantry", "free"]',
    });

    expect(item).toMatchObject({
      id: "feedam:42",
      address: "10 Main St, Denver, CO, 80202",
      city: "Denver",
      state: "CO",
      distance: 3,
      source: "Feed America",
      sourceDetail: "Plentiful",
      directoryProvider: "Feed America (feedam.org)",
      directoryAttribution: "Feed America (feedam.org, EIN 92-1761881)",
      directoryLicense: "CC BY-SA 4.0",
      verification: { status: "verified", label: "Information checked", checkedAt: "2026-09-01" },
      hoursStatus: "unknown",
      description: "free",
    });
  });

  it("never surfaces unverified records from the public directory response", async () => {
    mocks.call.mockResolvedValue({ data: { ok: true, totalAvailable: 2, area: "Dallas, TX", items: [
      { id: 1, name: "Source-checked Pantry", state: "TX", verification_status: "verified" },
      { id: 2, name: "Unverified Pantry", state: "TX", verification_status: "unverified" },
    ] } });

    const result = await searchFoodDirectory({ area: "77065", limit: 2 });

    expect(mocks.call).toHaveBeenCalledWith("foodDirectoryLookup", { timeout: 15000 }, { action: "nearby", area: "77065", limit: 2 });
    expect(result.items.map((item) => item.name)).toEqual(["Source-checked Pantry"]);
  });

  it("does not call the public API without an area", async () => {
    const result = await searchFoodDirectory({ area: " " });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/city or ZIP code/i);
    expect(mocks.call).not.toHaveBeenCalled();
  });

  it("suggests city and state options after three letters, only on explicit place lookup", async () => {
    mocks.call.mockResolvedValue({ data: { ok: true, items: ["Denver, CO", { city: "Denver", state: "Colorado" }, "Denver County, CO"] } });

    const tooShort = await suggestFoodLocations({ query: "De" });
    expect(tooShort.ok).toBe(false);
    expect(mocks.call).not.toHaveBeenCalled();

    const result = await suggestFoodLocations({ query: "Denver" });
    expect(mocks.call).toHaveBeenCalledWith("foodDirectoryLookup", { timeout: 15000 }, { action: "suggest", query: "Denver" });
    expect(result).toEqual({ ok: true, items: ["Denver, CO", "Denver, Colorado", "Denver County, CO"], error: null });
  });

  it("maps typed state names to unambiguous statewide browse options", () => {
    expect(getFoodStateCode("Mississippi")).toBe("MS");
    expect(getFoodStateCode("Iowa")).toBe("IA");
    expect(getFoodStateCode("Kentucky")).toBe("KY");
    expect(getFoodStateCode("Denver")).toBeNull();
  });

  it("browses statewide records without presenting them as nearby or assigning a distance", async () => {
    mocks.call.mockResolvedValue({ data: { ok: true, totalAvailable: 1, area: "IA", items: [{
        id: 19,
        name: "Iowa Community Pantry",
        resource_type: "food_pantry",
        address: "10 Main St",
        city: "Ames",
        state: "IA",
      }] } });

    const result = await searchFoodDirectoryByState({ state: "IA" });

    expect(result).toMatchObject({ ok: true, mode: "statewide", area: "IA", totalAvailable: 1 });
    expect(result.items[0]).toMatchObject({ name: "Iowa Community Pantry", address: "10 Main St, Ames, IA", state: "IA" });
    expect(result.items[0]).not.toHaveProperty("distance");
    expect(result.items[0]).not.toHaveProperty("verification");
  });

  it("keeps statewide search bounded and reports that more records remain", async () => {
    mocks.call.mockResolvedValue({ data: { ok: true, totalAvailable: 1002, hasMore: true, area: "IA", items: [
      { id: 1, name: "Pantry One", resource_type: "food_pantry", state: "IA" },
      { id: 2, name: "Pantry Two", resource_type: "food_pantry", state: "IA" },
    ] } });
    const result = await searchFoodDirectoryByState({ state: "IA", limit: 2 });

    expect(mocks.call).toHaveBeenCalledWith("foodDirectoryLookup", { timeout: 15000 }, { action: "statewide", state: "IA", page: 1, limit: 2 });
    expect(result.hasMore).toBe(true);
    expect(result.items.map(({ name }) => name)).toEqual(["Pantry One", "Pantry Two"]);
  });

  it("rejects a state-only area so a state name cannot be geocoded as a distant city", async () => {
    const result = await searchFoodDirectory({ area: "California" });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/city and state|5-digit ZIP/i);
    expect(mocks.call).not.toHaveBeenCalled();
  });

  it("accepts a city and state as the search area", async () => {
    mocks.call.mockResolvedValue({ data: { ok: true, items: [], area: "Houston, TX" } });

    const result = await searchFoodDirectory({ area: "Houston, TX" });

    expect(result.ok).toBe(true);
    expect(mocks.call).toHaveBeenCalledWith("foodDirectoryLookup", { timeout: 15000 }, { action: "nearby", area: "Houston, TX", limit: 20 });
  });

  it("withholds results when the directory resolves a city to a different state", async () => {
    mocks.call.mockResolvedValue({ data: { ok: true, area: "California, KY", items: [{ id: 9, name: "Wrong-state pantry", state: "KY", verification_status: "verified", distance: 8.1 }] } });

    const result = await searchFoodDirectory({ area: "Sacramento, CA" });

    expect(result).toMatchObject({
      ok: false,
      items: [],
      error: expect.stringMatching(/different state/i),
    });
  });

  it("uses the documented distance_miles field and never turns an unknown distance into zero", () => {
    expect(normalizeFoodResource({
      id: 1,
      name: "Known distance",
      verification_status: "verified",
      distance_miles: "8.1 mi",
    }).distance).toBe(8.1);
    expect(normalizeFoodResource({
      id: 2,
      name: "Unknown distance",
      verification_status: "verified",
      distance_miles: null,
    }).distance).toBeNull();
  });

  it("does not show a different-state listing as nearby to the requested area", async () => {
    mocks.call.mockResolvedValue({ data: { ok: true, area: "Houston, TX", items: [
      { id: 1, name: "Houston pantry", city: "Houston", state: "TX", verification_status: "verified", distance: 8.1 },
      { id: 2, name: "Colorado pantry", city: "Denver", state: "CO", verification_status: "verified", distance: 8.1 },
    ] } });

    const result = await searchFoodDirectory({ area: "Houston, TX" });

    expect(result.items.map(({ name }) => name)).toEqual(["Houston pantry"]);
    expect(result.items[0]).toMatchObject({ distance: 8.1, distanceOrigin: "Houston, TX" });
  });
});
