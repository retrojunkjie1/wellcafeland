import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ invoke: vi.fn(), track: vi.fn(), log: vi.fn() }));
vi.mock("@/firebase", () => ({
  auth: { currentUser: { uid: "member-1", isAnonymous: false } },
  functions: {},
}));
vi.mock("firebase/functions", () => ({ httpsCallable: (_functions, name) => (data) => mocks.invoke(name, data) }));
vi.mock("@/telemetry/telemetry", () => ({ trackSupportAction: mocks.track, logTelemetry: mocks.log }));

import { requestPractitionerConnection, respondToPractitionerConnection } from "./practitionerRegistry";

afterEach(() => vi.clearAllMocks());

describe("practitioner connection support footprints", () => {
  it("does not allow clients to self-report server-confirmed connection outcomes", async () => {
    mocks.invoke
      .mockResolvedValueOnce({ data: { requestId: "request-1", status: "pending" } })
      .mockResolvedValueOnce({ data: { status: "accepted" } });

    await requestPractitionerConnection("provider-1", "Private client history stays private.");
    await respondToPractitionerConnection("request-1", "accept");

    expect(mocks.track).not.toHaveBeenCalled();
    expect(JSON.stringify(mocks.track.mock.calls)).not.toContain("Private client history");
  });

  it("records safe failure codes while preserving the original callable error", async () => {
    const failure = Object.assign(new Error("Private introduction text"), { code: "functions/unavailable" });
    mocks.invoke.mockRejectedValueOnce(failure);

    await expect(requestPractitionerConnection("provider-1", "Private introduction text")).rejects.toBe(failure);

    expect(mocks.track).toHaveBeenCalledWith("providers", "connection_request_failed", "functions/unavailable");
    expect(JSON.stringify(mocks.track.mock.calls)).not.toContain("Private introduction text");
  });
});
