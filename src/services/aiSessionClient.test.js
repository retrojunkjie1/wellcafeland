import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { callAiSession } from "./aiSessionClient";

const mocks = vi.hoisted(() => ({
  user: null,
  signInAnonymously: vi.fn(),
  getAppCheckHeaders: vi.fn(),
}));

vi.mock("@/firebase", () => ({
  auth: {
    get currentUser() { return mocks.user; },
    onAuthStateChanged: (callback) => {
      queueMicrotask(() => callback(mocks.user));
      return vi.fn();
    },
  },
}));
vi.mock("firebase/auth", () => ({ signInAnonymously: mocks.signInAnonymously }));
vi.mock("@/services/apiBase", () => ({ buildApiUrl: (path) => `https://example.test/api${path}` }));
vi.mock("@/lib/userId", () => ({ getAnonymousUserId: () => "local-guest-id" }));
vi.mock("@/services/appCheckHeaders", () => ({ getAppCheckHeaders: mocks.getAppCheckHeaders }));

describe("callAiSession auth and app verification errors", () => {
  beforeEach(() => {
    mocks.user = { getIdToken: vi.fn().mockResolvedValue("account-token") };
    mocks.getAppCheckHeaders.mockResolvedValue({});
    mocks.signInAnonymously.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("does not mislabel an App Check rejection as a sign-in failure or retry it as auth", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
      json: async () => ({ ok: false, code: "APP_CHECK_REQUIRED", error: "App verification is required." }),
    });

    await expect(callAiSession({ prompt: "I feel overwhelmed" })).rejects.toMatchObject({
      status: 401,
      code: "APP_CHECK_REQUIRED",
      message: "App verification is required.",
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(mocks.user.getIdToken).toHaveBeenCalledTimes(1);
  });

  it("refreshes a rejected sign-in token once and accepts the refreshed session", async () => {
    mocks.user.getIdToken
      .mockResolvedValueOnce("stale-token")
      .mockResolvedValueOnce("fresh-token");
    fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
        json: async () => ({ ok: false, code: "AUTH_INVALID", message: "Invalid auth token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ ok: true, text: "I can stay with this with you." }),
      });

    await expect(callAiSession({ prompt: "I feel overwhelmed" })).resolves.toMatchObject({
      ok: true,
      text: "I can stay with this with you.",
    });
    expect(mocks.user.getIdToken).toHaveBeenNthCalledWith(1, false);
    expect(mocks.user.getIdToken).toHaveBeenNthCalledWith(2, true);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe("Bearer stale-token");
    expect(fetch.mock.calls[1][1].headers.Authorization).toBe("Bearer fresh-token");
  });
});
