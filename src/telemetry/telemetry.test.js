import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ callable: vi.fn() }));
vi.mock("@/firebase", () => ({
  auth: { currentUser: { uid: "member-123", isAnonymous: false } },
  functions: {},
}));
vi.mock("firebase/functions", () => ({
  httpsCallable: () => mocks.callable,
}));

import { logTelemetry, trackSupportAction } from "./telemetry";

afterEach(() => vi.clearAllMocks());

describe("support activity telemetry", () => {
  it("sends only allowlisted fields and never forwards raw caller metadata", () => {
    mocks.callable.mockResolvedValue({ data: { recorded: true } });
    logTelemetry("function_call", {
      level: "error",
      success: false,
      functionName: "searchPublicPractitionerDirectory",
      error: "The user searched a private location",
      errorCode: "functions/unavailable",
      email: "private@example.test",
      stack: "private stack trace",
      query: "private search text",
    });

    expect(mocks.callable).toHaveBeenCalledWith({
      feature: "home",
      eventCode: "action_failed",
      errorCode: "functions/unavailable",
    });
  });

  it("records a workspace change with only its fixed workspace code", () => {
    mocks.callable.mockResolvedValue({ data: { recorded: true } });
    trackSupportAction("account", "workspace_changed", "", "practitioner");

    expect(mocks.callable).toHaveBeenCalledWith({
      feature: "account",
      eventCode: "workspace_changed",
      errorCode: "",
      workspace: "practitioner",
    });
  });

  it("records client journey outcomes without accepting caller text", () => {
    mocks.callable.mockResolvedValue({ data: { recorded: true } });
    trackSupportAction("check_in", "check_in_save_failed", "firestore/unavailable");
    trackSupportAction("check_in", "check_in_save_failed", "", "private reflection text");

    expect(mocks.callable).toHaveBeenCalledWith({
      feature: "check_in",
      eventCode: "check_in_save_failed",
      errorCode: "firestore/unavailable",
    });
  });

  it("rejects server-confirmed outcomes from the client-reported activity callable", () => {
    mocks.callable.mockResolvedValue({ data: { recorded: true } });
    trackSupportAction("sessions", "session_request_sent");
    trackSupportAction("sessions", "session_request_accepted");
    trackSupportAction("sessions", "message_sent");
    trackSupportAction("sessions", "message_send_failed", "functions/resource-exhausted");
    trackSupportAction("sessions", "message_received");
    trackSupportAction("sessions", "message_sent", "", "private message content");
    trackSupportAction("guide", "session_request_sent");

    expect(mocks.callable).toHaveBeenCalledTimes(1);
    expect(mocks.callable.mock.calls[0][0].eventCode).toBe("message_send_failed");
    expect(JSON.stringify(mocks.callable.mock.calls)).not.toContain("private message content");
  });

  it("rejects connection outcomes from the client-reported activity callable", () => {
    mocks.callable.mockResolvedValue({ data: { recorded: true } });
    trackSupportAction("providers", "connection_request_sent");
    trackSupportAction("providers", "connection_request_accepted");
    trackSupportAction("providers", "connection_response_failed", "functions/unavailable");
    trackSupportAction("sessions", "connection_request_sent");

    expect(mocks.callable).toHaveBeenCalledTimes(1);
    expect(mocks.callable.mock.calls[0][0]).toEqual({
      feature: "providers",
      eventCode: "connection_response_failed",
      errorCode: "functions/unavailable",
    });
  });

  it("does not send unsupported feature, event, or workspace codes", () => {
    trackSupportAction("private-checkins", "page_opened");
    trackSupportAction("account", "page_opened", "", "private role description");
    trackSupportAction("account", "workspace_changed", "", "private role description");
    trackSupportAction("guide", "check_in_saved");

    expect(mocks.callable).not.toHaveBeenCalled();
  });
});
