import { describe, expect, it } from "vitest";
import { UK_CITY_BATCH_20261123_SCOTLAND_RURAL as batch } from "./ukScottishRuralFiveLocalitiesNov2026";
import { UK_SUPPORT_DIRECTORY } from "./ukInternationalSupportDirectory";

describe("UK five-locality Scotland directory batch", () => {
  const records = Object.values(batch).flat();
  const cities = ["Dumfries", "Stranraer", "Elgin", "Oban", "Fort William"];

  it("adds 75 source-reviewed pathways across five localities with all six access categories", () => {
    expect(records).toHaveLength(75);
    expect(new Set(records.map(({ id }) => id)).size).toBe(75);
    expect(Object.fromEntries(cities.map((city) => [city, records.filter((item) => item.city === city).length])))
      .toEqual({ Dumfries: 18, Stranraer: 15, Elgin: 14, Oban: 13, "Fort William": 15 });
    expect(new Set(records.map(({ category }) => category))).toEqual(new Set([
      "programs", "peer", "housing", "food.essentials", "grants", "hotlines",
    ]));
    for (const city of cities) {
      expect(new Set(records.filter((item) => item.city === city).map(({ category }) => category))).toEqual(new Set([
        "programs", "peer", "housing", "food.essentials", "grants", "hotlines",
      ]));
    }
  });

  it("uses unique GB locality records with dated sources and preserves every existing listing", () => {
    const existing = Object.values(UK_SUPPORT_DIRECTORY.categories).flat();
    const existingIds = new Set(existing.map(({ id }) => id));
    expect(records.every((record) => record.country === "United Kingdom"
      && record.countryCode === "GB"
      && record.state === "Scotland"
      && record.region === `${record.city}, Scotland`
      && record.link.startsWith("https://")
      && record.source
      && record.description.length > 100
      && record.checkedAt === "2026-11-23"
      && cities.includes(record.city))).toBe(true);
    expect(records.every(({ id }) => existingIds.has(id))).toBe(true);
    expect(existingIds.size).toBe(existing.length);
    expect(existing.length).toBe(1340);
  });
});
