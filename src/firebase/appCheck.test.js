import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  initializeAppCheck: vi.fn(() => ({ appCheck: true })),
  ReCaptchaV3Provider: class {
    constructor(siteKey) { this.siteKey = siteKey; }
  },
}));

vi.mock("firebase/app-check", () => mocks);

describe("App Check initialization", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("VITE_RECAPTCHA_SITE_KEY", "public-test-site-key");
    vi.stubEnv("VITE_RECAPTCHA_KEY", "");
    vi.stubEnv("VITE_FIREBASE_APPCHECK_DEBUG_TOKEN", "");
    vi.stubGlobal("window", { location: { hostname: "wellnesscafe.app" } });
  });

  it("initializes on a hosted site even when the current build mode is not production", async () => {
    const { initAppCheck } = await import("./appCheck");

    initAppCheck({ name: "wellnesscafe" });

    expect(mocks.initializeAppCheck).toHaveBeenCalledWith(
      { name: "wellnesscafe" },
      expect.objectContaining({
        provider: { siteKey: "public-test-site-key" },
        isTokenAutoRefreshEnabled: true,
      }),
    );
  });

  it("does not initialize on localhost unless a registered debug token is configured", async () => {
    vi.stubGlobal("window", { location: { hostname: "localhost" } });
    const { initAppCheck } = await import("./appCheck");

    initAppCheck({ name: "wellnesscafe" });

    expect(mocks.initializeAppCheck).not.toHaveBeenCalled();
  });
});
