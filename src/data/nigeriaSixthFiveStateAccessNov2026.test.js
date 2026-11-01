import { describe, expect, it } from "vitest";
import {
  NIGERIA_SIXTH_FIVE_STATE_HEALTH_ACCESS_NOV2026,
  NIGERIA_SIXTH_FIVE_STATE_SUPPORT_NOV2026,
} from "./nigeriaSixthFiveStateAccessNov2026.js";

describe("Nigeria sixth five-state directory batch", () => {
  it("adds the planned audited mapped-health access points across all five cohort states", () => {
    const expected = { Zamfara: 23, Ondo: 13, Taraba: 3, Abia: 23, Anambra: 23 };
    expect(NIGERIA_SIXTH_FIVE_STATE_HEALTH_ACCESS_NOV2026).toHaveLength(85);
    for (const [state, count] of Object.entries(expected)) {
      expect(NIGERIA_SIXTH_FIVE_STATE_HEALTH_ACCESS_NOV2026.filter((row) => row.state === state)).toHaveLength(count);
    }
  });

  it("keeps every mapped facility traceable and clearly unconfirmed for current public access", () => {
    const rows = NIGERIA_SIXTH_FIVE_STATE_HEALTH_ACCESS_NOV2026;
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
    for (const row of rows) {
      expect(row.sourceRecordId).toBeTruthy();
      expect(row.sourceEvidenceUrl).toContain("9df52e12d0b5422f8f73c44d0dc91f8b");
      expect(row.sourceVersion).toBe("v4.0");
      expect(row.sourceReviewStatus).toBe("source-record-reviewed-current-access-unconfirmed");
      expect(row.phoneConfirmed).toBe(false);
      expect(row.exhaustiveCoverage).toBe(false);
      expect(row.verified).toBe(false);
      expect(row.latitude).toBeGreaterThanOrEqual(4);
      expect(row.latitude).toBeLessThanOrEqual(14);
      expect(row.longitude).toBeGreaterThanOrEqual(2);
      expect(row.longitude).toBeLessThanOrEqual(15);
    }
  });

  it("adds actionable state-specific support contacts without claiming a guaranteed placement", () => {
    const ids = NIGERIA_SIXTH_FIVE_STATE_SUPPORT_NOV2026.map((row) => row.id);
    expect(ids).toEqual([
      "zamfara-care-best-initiative-gusau-humanitarian-enquiries",
      "taraba-mobile-hospital-public-health-facility-access",
      "anambra-mgbakwu-survivor-care-2026",
    ]);
    const survivorCare = NIGERIA_SIXTH_FIVE_STATE_SUPPORT_NOV2026.find((row) => row.state === "Anambra");
    expect(survivorCare.phone).toBe("0814-389-4844");
    expect(survivorCare.phoneConfirmed).toBe(false);
    expect(survivorCare.description).toContain("weekend emergency on-call");
    expect(survivorCare.description).toContain("does not imply shelter placement");
    const taraba = NIGERIA_SIXTH_FIVE_STATE_SUPPORT_NOV2026.find((row) => row.state === "Taraba");
    expect(taraba.phone).toBe("0800-TARABA-HEALTH");
    expect(taraba.primaryCategory).toBe("health");
    const zamfara = NIGERIA_SIXTH_FIVE_STATE_SUPPORT_NOV2026.find((row) => row.state === "Zamfara");
    expect(zamfara.phone).toBe("+234 915 349 3300");
    expect(zamfara.description).toContain("does not promise food, cash, shelter");
  });
});
