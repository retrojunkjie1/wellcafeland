import { describe, expect, it } from "vitest";
import { EMOTION_SUPPORT_GUIDANCE, getEmotionSupportGuidance } from "./emotionSupportGuidance";

describe("emotion support next steps", () => {
  it("gives every support choice its own prompt and usable first steps", () => {
    const choices = Object.entries(EMOTION_SUPPORT_GUIDANCE);
    const titles = choices.map(([, guidance]) => guidance.title);

    expect(titles).toHaveLength(6);
    expect(new Set(titles).size).toBe(choices.length);
    for (const [choice, guidance] of choices) {
      expect(getEmotionSupportGuidance(choice)).toBe(guidance);
      expect(guidance.detail.trim()).not.toBe("");
      expect(guidance.placeholder.trim()).not.toBe("");
      expect(guidance.suggestions).toHaveLength(2);
    }
  });

  it("does not silently apply an unrelated plan to an unknown choice", () => {
    expect(getEmotionSupportGuidance("unknown support")).toBeNull();
  });
});
