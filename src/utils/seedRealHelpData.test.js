import { describe, expect, it } from "vitest";
import {
  seedAllRealHelpData,
  seedCircles,
  seedGrants,
  seedHousing,
  seedPrograms,
} from "./seedRealHelpData";

describe("retired sample help data seeder", () => {
  it("refuses to create public-facing demo records in every collection", async () => {
    const results = await seedAllRealHelpData();

    expect(Object.keys(results)).toEqual(["housing", "grants", "programs", "circles"]);
    for (const result of Object.values(results)) {
      expect(result).toMatchObject({ ok: false, disabled: true, count: 0 });
      expect(result.error).toMatch(/source-reviewed organizations/i);
    }
  });

  it("keeps legacy individual seed actions disabled", async () => {
    const results = await Promise.all([seedHousing(), seedGrants(), seedPrograms(), seedCircles()]);

    expect(results).toHaveLength(4);
    expect(results.every((result) => result.disabled && result.count === 0)).toBe(true);
  });
});
