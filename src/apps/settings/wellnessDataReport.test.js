import { describe, expect, it } from "vitest";
import { formatWellnessDataReport } from "./wellnessDataReport";

describe("formatWellnessDataReport", () => {
  it("turns owner export records into plain language sections and hides internal identifiers", () => {
    const report = formatWellnessDataReport({
      exportedAt: "2026-10-12T15:00:00.000Z",
      checkins: [{ id: "internal-id", userId: "private-user-id", mood: "steady", cravingIntensity: 2 }],
      assessments: [{ title: "Wellness reflection", answers: [{ question: "What helped?", answer: "Calling my sister" }] }],
      carePlans: [{ title: "This week", planItems: [{ name: "Take a short walk", complete: false }] }],
      visitPreparations: [],
    });

    expect(report).toContain("WELLNESSCAFE — YOUR DATA");
    expect(report).toContain("DAILY CHECK-INS (1)");
    expect(report).toContain("Mood:\n      steady");
    expect(report).toContain("Craving intensity:\n      2");
    expect(report).toContain("Question:\n          What helped?");
    expect(report).toContain("Answer:\n          Calling my sister");
    expect(report).toContain("PLANS AND NEXT STEPS (1)");
    expect(report).toContain("Take a short walk");
    expect(report).not.toContain("internal-id");
    expect(report).not.toContain("private-user-id");
    expect(report).not.toMatch(/[{}\[\]]/);
  });

  it("provides readable empty sections when the account has no saved records", () => {
    const report = formatWellnessDataReport({});
    expect(report).toContain("DAILY CHECK-INS (0)");
    expect(report).toContain("No records available in this category.");
    expect(report).toContain("END OF REPORT");
  });
});
