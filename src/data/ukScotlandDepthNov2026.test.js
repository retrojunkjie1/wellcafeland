import { describe, expect, it } from "vitest";
import { UK_CITY_BATCH_20261122_SCOTLAND_DEPTH as batch } from "./ukScotlandDepthNov2026";
import { UK_SUPPORT_DIRECTORY } from "./ukInternationalSupportDirectory";

describe("UK Scotland five-city directory depth cohort", () => {
  const records = Object.values(batch).flat();
  const cities = ["Edinburgh", "Perth", "Inverness", "Aberdeen", "Stirling"];

  it("adds 29 source-reviewed local records across five existing city clusters", () => {
    expect(records).toHaveLength(29);
    expect(new Set(records.map(({ id }) => id)).size).toBe(29);
    expect(new Set(records.map(({ city }) => city))).toEqual(new Set(cities));
    expect(records.every((record) => record.country === "United Kingdom"
      && record.countryCode === "GB"
      && record.state === "Scotland"
      && record.region === `${record.city}, Scotland`
      && record.link.startsWith("https://")
      && record.source
      && record.description.length > 100
      && record.checkedAt === "2026-11-22")).toBe(true);
  });

  it("preserves existing records and has no duplicate IDs in the live catalogue", () => {
    const existing = Object.values(UK_SUPPORT_DIRECTORY.categories).flat();
    const existingIds = new Set(existing.map(({ id }) => id));
    expect(records.every(({ id }) => existingIds.has(id))).toBe(true);
    expect(new Set(existing.map(({ id }) => id)).size).toBe(existing.length);
    expect(existing.filter(({ id }) => records.some((record) => record.id === id))).toHaveLength(29);

    const counts = Object.fromEntries(cities.map((city) => [
      city,
      existing.filter((record) => record.city === city).length,
    ]));
    expect(counts).toEqual({ Edinburgh: 46, Perth: 13, Inverness: 9, Aberdeen: 15, Stirling: 10 });
  });
});
