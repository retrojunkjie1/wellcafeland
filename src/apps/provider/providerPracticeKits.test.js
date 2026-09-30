import { describe, expect, it } from "vitest";
import { getPractitionerPracticeKit } from "./providerPracticeKits";

describe("practitioner practice kits", () => {
  it("gives adjacent services distinct first suggestions and explanations", () => {
    const massage = getPractitionerPracticeKit("massage");
    const bodywork = getPractitionerPracticeKit("bodywork");
    const yoga = getPractitionerPracticeKit("yoga");

    expect(massage.suggestions.map(({ id }) => id)).not.toEqual(bodywork.suggestions.map(({ id }) => id));
    expect(massage.suggestions[0]).toMatchObject({ id: "meditation" });
    expect(bodywork.suggestions[0]).toMatchObject({ id: "body-scan" });
    expect(yoga.suggestions[0]).toMatchObject({ id: "breathing" });
    expect(massage.suggestions[0].reason).not.toBe(bodywork.suggestions[0].reason);
  });

  it("explains the fit for every suggested practice and avoids duplicate entries", () => {
    const types = ["therapist", "counselor", "recovery-coach", "peer-support", "yoga", "massage", "bodywork", "acupuncture", "spiritual-counselor", "community-supporter"];

    for (const type of types) {
      const kit = getPractitionerPracticeKit(type);
      expect(kit.label).toBeTruthy();
      expect(kit.description).toBeTruthy();
      expect(kit.suggestions.length).toBeGreaterThanOrEqual(3);
      expect(new Set(kit.suggestions.map(({ id }) => id)).size).toBe(kit.suggestions.length);
      expect(kit.suggestions.every(({ id, reason }) => id && reason.trim().length > 20)).toBe(true);
    }
  });

  it("uses an honest, choice-led default for unknown service types", () => {
    expect(getPractitionerPracticeKit("unknown service")).toMatchObject({
      label: "Practitioner",
      description: "Choose a practice that fits the support the client asked for.",
    });
  });
});
