import { beforeEach, describe, expect, it, vi } from "vitest";

const { callAgent, logError, logWarn } = vi.hoisted(() => ({
  callAgent: vi.fn(),
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

vi.mock("@/ai/agents/agentClient", () => ({ callAgent }));
vi.mock("./logService", () => ({ logError, logWarn }));

import { moderateText } from "./aiModeration";

describe("Cherubim peer-content moderation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends only the proposed message to Cherubim and accepts support-seeking content", async () => {
    callAgent.mockResolvedValue({ result: { safe: true, category: "allowed" } });

    await expect(moderateText("  I am having a hard day and need support.  ")).resolves.toEqual({ ok: true, blocked: false });
    expect(callAgent).toHaveBeenCalledWith("cherubim", { content: "I am having a hard day and need support." });
  });

  it("returns a revision prompt when Cherubim flags content", async () => {
    callAgent.mockResolvedValue({ result: { safe: false, category: "targeted_harassment", reason: "Targeted insult", suggestion: "Please revise this message." } });

    await expect(moderateText("message text")).resolves.toMatchObject({
      ok: true,
      blocked: true,
      reason: "Targeted insult",
      suggestion: "Please revise this message.",
    });
  });

  it("does not allow a post when the agent is unavailable or returns no decision", async () => {
    callAgent.mockRejectedValueOnce(Object.assign(new Error("paused"), { code: "AGENT_DISABLED" }));
    const unavailable = await moderateText("private message content");
    expect(unavailable).toMatchObject({ ok: false, blocked: false, reason: "AGENT_DISABLED" });
    expect(unavailable.suggestion).toMatch(/Nothing was posted/);

    callAgent.mockResolvedValueOnce({ result: { safe: "yes" } });
    const invalid = await moderateText("another private message");
    expect(invalid).toMatchObject({ ok: false, blocked: false, reason: "INVALID_MODERATION_OUTPUT" });
    expect(logWarn).toHaveBeenCalledWith("aiModeration", expect.any(String), { code: "INVALID_MODERATION_OUTPUT" });
  });

  it("never includes message text in moderation error logs", async () => {
    const privateText = "private identifying recovery disclosure";
    callAgent.mockRejectedValue(Object.assign(new Error(privateText), { code: "NETWORK_ERROR" }));

    await moderateText(privateText);

    expect(logError).toHaveBeenCalledWith("aiModeration", expect.any(Error), { code: "NETWORK_ERROR" });
    expect(JSON.stringify(logError.mock.calls)).not.toContain(privateText);
  });
});
