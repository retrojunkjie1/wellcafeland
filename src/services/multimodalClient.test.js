import { afterEach, describe, expect, it, vi } from "vitest";
import { guideEngine } from "./multimodalClient";

const mocks = vi.hoisted(() => ({ callAI: vi.fn() }));

vi.mock("@/services/aiClient", () => ({ callAI: mocks.callAI }));
vi.mock("@/services/aiSessionClient", () => ({ getAuthHeaders: vi.fn().mockResolvedValue({ Authorization: "Bearer test-token" }) }));
vi.mock("@/lib/debug", () => ({ isDebugEnabled: () => false, logDebug: vi.fn() }));
vi.mock("@/lib/functionsUrl", () => ({ resolveFunctionsBaseUrl: () => "https://example.test" }));
vi.mock("@/core/system/intelligenceEngine", () => ({ observe: vi.fn(), interpret: vi.fn(), adapt: vi.fn(), optimize: vi.fn() }));
vi.mock("@/telemetry/telemetry", () => ({ trackLatency: vi.fn(), trackNetworkEvent: vi.fn() }));
vi.mock("@/services/conversationMemory", () => ({ getConversationMemoryContext: vi.fn(), rememberConversationTurn: vi.fn() }));

afterEach(() => vi.clearAllMocks());

describe("guideEngine", () => {
  it("uses the authenticated AI client and forwards the recent conversation", async () => {
    mocks.callAI.mockResolvedValue({ ok: true, text: "A response grounded in this conversation." });
    const messages = [
      { role: "user", content: "I am worried about tomorrow." },
      { role: "assistant", content: "What part feels uncertain?" },
      { role: "user", content: "The appointment." },
    ];

    const result = await guideEngine("The appointment.", { messages });

    expect(result).toMatchObject({ ok: true, content: "A response grounded in this conversation." });
    expect(mocks.callAI).toHaveBeenCalledTimes(1);
    expect(mocks.callAI).toHaveBeenCalledWith("aiSession", expect.objectContaining({ messages, mode: "default" }));
  });

  it("forwards only supplied user-enabled memory context to the AI endpoint", async () => {
    mocks.callAI.mockResolvedValue({ ok: true, text: "A continuing answer." });
    const messages = [{ role: "user", content: "What next?" }];

    await guideEngine("What next?", { messages, memoryContext: "Earlier exchange: Person asked for a small plan." });

    expect(mocks.callAI).toHaveBeenCalledWith("aiSession", expect.objectContaining({
      messages,
      memoryContext: "Earlier exchange: Person asked for a small plan.",
    }));
  });

  it("returns provider errors as errors instead of response text", async () => {
    mocks.callAI.mockResolvedValue({
      ok: false,
      error: "The AI guide is not configured right now.",
      errorCode: "AI_PROVIDER_NOT_CONFIGURED",
      errorReason: "AI_PROVIDER_NOT_CONFIGURED",
      retryable: false,
      status: 503,
    });

    const result = await guideEngine("Can you explain this?", {});

    expect(result).toMatchObject({
      ok: false,
      error: "The AI guide is not configured right now.",
      errorCode: "AI_PROVIDER_NOT_CONFIGURED",
      retryable: false,
      status: 503,
    });
    expect(result.content).toBeUndefined();
  });
});
