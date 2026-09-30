import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ invoke: vi.fn(), track: vi.fn() }));
vi.mock("@/firebase", () => ({ functions: {} }));
vi.mock("firebase/functions", () => ({ httpsCallable: (_functions, name) => (data) => mocks.invoke(name, data) }));
vi.mock("@/telemetry/telemetry", () => ({ trackSupportAction: mocks.track }));

import { requestProviderAppointment, respondToProviderAppointmentRequest } from "./appointmentService";

afterEach(() => vi.clearAllMocks());

describe("session request support footprints", () => {
  it("does not ask the client to self-report server-confirmed session outcomes", async () => {
    mocks.invoke
      .mockResolvedValueOnce({ data: { requestId: "request-1", status: "pending" } })
      .mockResolvedValueOnce({ data: { status: "accepted", appointmentId: "appointment-1" } });

    await requestProviderAppointment({
      providerId: "provider-1",
      requestedStartAt: new Date("2026-10-01T15:00:00Z"),
      requestedEndAt: new Date("2026-10-01T15:45:00Z"),
      note: "Private care detail.",
    });
    await respondToProviderAppointmentRequest("request-1", "accept", "Private reply.", { meetingLink: "https://private.example.test" });

    expect(mocks.track).not.toHaveBeenCalled();
    expect(JSON.stringify(mocks.track.mock.calls)).not.toContain("Private care detail");
    expect(JSON.stringify(mocks.track.mock.calls)).not.toContain("private.example.test");
  });

  it("records safe failure outcomes and returns the existing user-facing result", async () => {
    mocks.invoke.mockRejectedValue(Object.assign(new Error("Could not deliver request"), { code: "functions/unavailable" }));

    const result = await requestProviderAppointment({ providerId: "provider-1", requestedStartAt: new Date(), requestedEndAt: new Date(Date.now() + 45_000), note: "Private note" });

    expect(result.ok).toBe(false);
    expect(mocks.track).toHaveBeenCalledWith("sessions", "session_request_failed", "functions/unavailable");
    expect(JSON.stringify(mocks.track.mock.calls)).not.toContain("Private note");
  });
});
