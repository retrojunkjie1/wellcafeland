import { describe, expect, it } from "vitest";
import { formatHousingAddress, isRetiredDemoHelpRecord } from "./helpDirectoryRecordQuality";

describe("help directory record quality", () => {
  it("recognizes known retired seed records and reserved example contacts", () => {
    expect(isRetiredDemoHelpRecord({ name: "Serenity House Recovery", website: "https://example.com/serenity" })).toBe(true);
    expect(isRetiredDemoHelpRecord({ name: "SAMHSA Treatment Grant Program", website: "https://www.samhsa.gov" })).toBe(true);
    expect(isRetiredDemoHelpRecord({ name: "Sample service", website: "https://service.example.org" })).toBe(true);
    expect(isRetiredDemoHelpRecord({ name: "Real Pantry", contact: { email: "help@pantry.example" } })).toBe(true);
    expect(isRetiredDemoHelpRecord({ name: "Real Pantry", phone: "(212) 555-0112" })).toBe(true);
  });

  it("keeps ordinary organization listings and formats a structured address", () => {
    expect(isRetiredDemoHelpRecord({
      name: "Harbor House",
      website: "https://harborhouse.org",
      contact: { phone: "303-555-2222" },
    })).toBe(false);
    expect(formatHousingAddress({ address: { line1: "12 Elm St", line2: "Unit 4", city: "Denver", state: "CO", zip: "80202" } }))
      .toBe("12 Elm St, Unit 4, Denver, CO, 80202");
  });
});
