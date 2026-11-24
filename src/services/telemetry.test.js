import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  availability: vi.fn(),
  callAiSession: vi.fn(),
}));

vi.mock("../lib/userId", () => ({ getAnonymousUserId: () => "anonymous-test" }));
vi.mock("../firebase", () => ({ auth: { currentUser: null } }));
vi.mock("@/lib/logger", () => ({ logError: vi.fn() }));
vi.mock("@/services/aiSessionClient", () => ({ callAiSession: mocks.callAiSession }));
vi.mock("@/services/practiceAvailability", () => ({ getPublicPracticeAvailability: mocks.availability }));

describe("operational telemetry feature control", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.availability.mockReset();
    mocks.callAiSession.mockReset();
  });

  it("does not buffer or transmit events when collection is paused", async () => {
    mocks.availability.mockResolvedValue({ telemetry: false });
    const telemetry = await import("./telemetry");

    await telemetry.trackPageView("home");

    expect(mocks.callAiSession).not.toHaveBeenCalled();
    expect(telemetry.getTelemetrySnapshot().totalEvents).toBe(0);
  });

  it("sends allowlisted events when enabled and reuses availability briefly", async () => {
    mocks.availability.mockResolvedValue({ telemetry: true });
    const telemetry = await import("./telemetry");

    await telemetry.trackPageView("home");
    await telemetry.trackAction("tool_card_click");

    expect(mocks.availability).toHaveBeenCalledTimes(1);
    expect(mocks.callAiSession).toHaveBeenCalledTimes(2);
    expect(telemetry.getTelemetrySnapshot().totalEvents).toBe(2);
  });

  it("fails closed when collection availability cannot be read", async () => {
    mocks.availability.mockRejectedValue(new Error("availability unavailable"));
    const telemetry = await import("./telemetry");

    await telemetry.trackPageView("home");

    expect(mocks.callAiSession).not.toHaveBeenCalled();
    expect(telemetry.getTelemetrySnapshot().totalEvents).toBe(0);
  });
});
