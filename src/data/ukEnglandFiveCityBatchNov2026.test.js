import { describe, expect, it } from "vitest";
import { UK_CITY_BATCH_20261122_ENGLAND_FIVE as batch } from "./ukEnglandFiveCityBatchNov2026";
import { UK_SUPPORT_DIRECTORY } from "./ukInternationalSupportDirectory";

describe("UK England five-city directory cohort", () => {
  const records = Object.values(batch).flat();

  it("adds 52 distinct, source-linked local pathways across five cities and multiple categories", () => {
    expect(records).toHaveLength(52);
    expect(new Set(records.map(({ id }) => id)).size).toBe(52);
    expect(new Set(records.map(({ city }) => city))).toEqual(new Set([
      "Derby",
      "Hull",
      "Peterborough",
      "Ipswich",
      "Wolverhampton",
    ]));
    expect(new Set(records.map(({ category }) => category))).toEqual(new Set([
      "programs",
      "peer",
      "housing",
      "food.essentials",
      "grants",
      "hotlines",
    ]));
    expect(records.every((record) => record.country === "United Kingdom"
      && record.countryCode === "GB"
      && record.state === "England"
      && record.region === `${record.city}, England`
      && record.link.startsWith("https://")
      && record.source
      && record.checkedAt === "2026-11-22")).toBe(true);
  });

  it("keeps every prior UK listing and composes the new batch into the existing categories", () => {
    const composed = Object.values(UK_SUPPORT_DIRECTORY.categories).flat();
    const composedIds = new Set(composed.map(({ id }) => id));
    expect(composedIds.has("gb-aa-uk-helpline")).toBe(true);
    for (const record of records) expect(composedIds.has(record.id)).toBe(true);
    expect(composed.filter(({ id }) => records.some((record) => record.id === id))).toHaveLength(52);
  });
});
