import { describe, expect, it } from "vitest";
import { offlineRespond } from "./offlineGuide";

describe("offline guide fallback", () => {
  it("does not assume the person needs shelter or local resources", () => {
    const reply = offlineRespond("Can you help me understand this recording?", { intent: "support" }).toLowerCase();

    expect(reply).toContain("answer this message yet");
    expect(reply).not.toContain("shelter");
    expect(reply).not.toContain("city and state");
  });

  it("asks for location only when local resources were requested", () => {
    const reply = offlineRespond("I need food assistance", { intent: "directory" }).toLowerCase();

    expect(reply).toContain("food support");
    expect(reply).toContain("city and state");
    expect(reply).not.toContain("shelter");
  });

  it("asks about tonight only when urgent housing is named", () => {
    const reply = offlineRespond("I need shelter tonight", { intent: "directory" }).toLowerCase();

    expect(reply).toContain("housing support");
    expect(reply).toContain("if this is for tonight");
  });
});
