import { describe, expect, it } from "vitest";
import { getAssistanceEntry } from "./assistanceRoute";

describe("assistance entry routing", () => {
  it("shows a needs chooser for an unqualified entry", () => {
    expect(getAssistanceEntry("?release=home-support-entry")).toBe("hub");
    expect(getAssistanceEntry("")).toBe("hub");
  });

  it("opens the results finder when a link carries a need or location", () => {
    expect(getAssistanceEntry("?priority=food")).toBe("finder");
    expect(getAssistanceEntry("?region=Denver%2C%20CO")).toBe("finder");
    expect(getAssistanceEntry("?query=bus%20pass")).toBe("finder");
  });

  it("routes A.A. and N.A. requests to the dedicated meeting finder", () => {
    expect(getAssistanceEntry("?query=online%20NA%20meetings")).toBe("meetings");
    expect(getAssistanceEntry("?priority=programs&query=Alcoholics%20Anonymous")).toBe("meetings");
  });
});
