import { describe, expect, it } from "vitest";
import { dateToLocalInputInZone, localInputInZoneToDate } from "./providerTime";

describe("practitioner schedule time-zone conversion", () => {
  it("converts an entered practitioner time to the matching instant", () => {
    const instant = localInputInZoneToDate("2026-11-10T10:00", "America/New_York");
    expect(instant?.toISOString()).toBe("2026-11-10T15:00:00.000Z");
  });

  it("shows an existing appointment using the practitioner's time zone", () => {
    expect(dateToLocalInputInZone("2026-11-10T15:00:00.000Z", "America/New_York")).toBe("2026-11-10T10:00");
  });

  it("rejects a local time skipped by the spring clock change", () => {
    expect(localInputInZoneToDate("2026-03-08T02:30", "America/Denver")).toBeNull();
  });

  it("rejects a duplicated local time during the fall clock change", () => {
    expect(localInputInZoneToDate("2026-11-01T01:30", "America/Denver")).toBeNull();
  });

  it("rejects malformed dates and unknown time zones", () => {
    expect(localInputInZoneToDate("not-a-time", "America/Denver")).toBeNull();
    expect(localInputInZoneToDate("2026-11-10T10:00", "Not/AZone")).toBeNull();
  });
});
