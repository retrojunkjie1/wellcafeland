import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ invoke: vi.fn(), track: vi.fn() }));
vi.mock("@/firebase", () => ({ auth: { currentUser: { uid: "client-1", isAnonymous: false } }, functions: {} }));
vi.mock("firebase/functions", () => ({ httpsCallable: (_functions, name) => (data) => mocks.invoke(name, data) }));
vi.mock("@/telemetry/telemetry", () => ({ trackSupportAction: mocks.track }));

import { sendClientMessage, sendProviderMessage } from "./practitionerMessaging";

afterEach(() => vi.clearAllMocks());

describe("practitioner message support footprints", () => {
  it("does not create a client-reported success event for a server action", async () => {
    mocks.invoke.mockResolvedValue({ data: { ok: true, messageId: "message-1" } });
    const body = "A private recovery message.";

    await sendClientMessage("provider-1", body);

    expect(mocks.invoke).toHaveBeenCalledWith("sendClientMessage", { practitionerId: "provider-1", content: body });
    expect(mocks.track).not.toHaveBeenCalled();
    expect(JSON.stringify(mocks.track.mock.calls)).not.toContain(body);
  });

  it("records a safe quota failure code and preserves the caller error", async () => {
    const error = Object.assign(new Error("Private message content"), { code: "functions/resource-exhausted" });
    mocks.invoke.mockRejectedValue(error);

    await expect(sendProviderMessage("client-1", "Another private message.")).rejects.toBe(error);

    expect(mocks.track).toHaveBeenCalledWith("sessions", "message_send_failed", "functions/resource-exhausted");
    expect(JSON.stringify(mocks.track.mock.calls)).not.toContain("private message");
  });
});
