import { describe, expect, it } from "vitest";
import { UK_CITY_BATCH_20261122_ENGLAND_MAJOR_DEPTH as batch } from "./ukEnglandMajorCityDepthNov2026";
import { UK_SUPPORT_DIRECTORY } from "./ukInternationalSupportDirectory";

describe("UK England five-city major locality depth cohort", () => {
  const records = Object.values(batch).flat();
  const cities = ["Manchester", "Birmingham", "Liverpool", "Leeds", "Bristol"];

  it("adds 52 source-reviewed local records across five cities and all six categories", () => {
    expect(records).toHaveLength(52);
    expect(new Set(records.map(({ id }) => id)).size).toBe(52);
    expect(new Set(records.map(({ city }) => city))).toEqual(new Set(cities));
    expect(new Set(records.map(({ category }) => category))).toEqual(new Set([
      "programs", "peer", "housing", "food.essentials", "grants", "hotlines",
    ]));
    expect(records.every((record) => record.country === "United Kingdom"
      && record.countryCode === "GB"
      && record.state === "England"
      && record.region === `${record.city}, England`
      && record.link.startsWith("https://")
      && record.source
      && record.description.length > 100
      && record.checkedAt === "2026-11-22")).toBe(true);
  });

  it("adds a substantive depth cohort and retains the existing city catalogue", () => {
    const existing = Object.values(UK_SUPPORT_DIRECTORY.categories).flat();
    const existingIds = new Set(existing.map(({ id }) => id));
    expect(records.every(({ id }) => existingIds.has(id))).toBe(true);
    expect(existing.filter(({ id }) => records.some((record) => record.id === id))).toHaveLength(52);
    expect(new Set(existing.map(({ id }) => id)).size).toBe(existing.length);

    const counts = Object.fromEntries(cities.map((city) => [
      city,
      existing.filter((record) => record.city === city).length,
    ]));
    expect(counts).toEqual({ Manchester: 19, Birmingham: 38, Liverpool: 45, Leeds: 51, Bristol: 65 });
    expect(Object.values(counts).reduce((sum, value) => sum + value, 0)).toBe(218);
  });
});
