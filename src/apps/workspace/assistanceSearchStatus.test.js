import { describe, expect, it } from "vitest";
import { getAssistanceSearchStatus, getCuratedSearchStatus } from "./assistanceSearchStatus";

describe("assistance search status", () => {
  it("reports curated city contacts without describing them as live results", () => {
    expect(getAssistanceSearchStatus({ category: "funding", region: "Dallas, TX", localCount: 2 }))
      .toBe("2 contacts listed for Dallas, TX. Contact them to confirm eligibility, current applications, and available assistance.");
  });

  it("does not claim broader contacts are local to the searched area", () => {
    const status = getAssistanceSearchStatus({ category: "circles", region: "Denver, CO", localCount: 0 });
    expect(status).toContain("No peer support listing with a confirmed location in Denver, CO is available yet.");
    expect(status).toContain("The options below are broader support pathways; contact them to ask about local help.");
    expect(status).not.toContain("Dallas");
  });

  it("gives urgent-support-specific next guidance", () => {
    expect(getAssistanceSearchStatus({ category: "emergency", region: "Iowa", localCount: 1 }))
      .toContain("For immediate danger, call 911.");
  });

  it("labels curated-only results as listed pathways, not real-time availability", () => {
    expect(getCuratedSearchStatus({ category: "funding", region: "Denver, CO", localCount: 0 }))
      .toBe("No listing with a confirmed location in Denver, CO is available for financial assistance and benefits. Broader options are shown below.");
  });
});
