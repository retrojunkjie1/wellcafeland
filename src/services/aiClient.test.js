import { afterEach, describe, expect, it, vi } from "vitest";
import { callAI } from "./aiClient";

const mocks = vi.hoisted(() => ({ callAiSession: vi.fn() }));

vi.mock("@/services/aiSessionClient", () => ({ callAiSession: mocks.callAiSession }));
vi.mock("@/utils/correlation", () => ({ getCorrelationId: () => "test-correlation" }));
vi.mock("@/lib/debug", () => ({ logDebug: vi.fn(), isDebugEnabled: () => false }));
vi.mock("@/lib/chatDiagnostics", () => ({ updateChatDiagnostics: vi.fn() }));
vi.mock("@/services/apiBase", () => ({ buildApiUrl: (path) => `https://example.test/api/${path}` }));

afterEach(() => vi.clearAllMocks());

describe("callAI authentication error copy", () => {
  it("explains App Check failures without telling signed-in users to sign in", async () => {
    const error = new Error("App verification is required.");
    error.status = 401;
    error.code = "APP_CHECK_REQUIRED";
    mocks.callAiSession.mockRejectedValue(error);

    const result = await callAI("aiSession", { prompt: "I need help" });

    expect(result).toMatchObject({
      ok: false,
      error: "We couldn't verify this app session. Refresh the page and try again. If it continues, open support.",
      errorCode: "APP_CHECK_REQUIRED",
      errorReason: "app_verification",
      status: 401,
    });
  });

  it("reserves sign-in copy for missing credentials", async () => {
    const error = new Error("Auth required");
    error.status = 401;
    error.code = "AUTH_REQUIRED";
    mocks.callAiSession.mockRejectedValue(error);

    const result = await callAI("aiSession", { prompt: "I need help" });

    expect(result).toMatchObject({ ok: false, error: "Please sign in to continue.", errorReason: "auth" });
  });
});
