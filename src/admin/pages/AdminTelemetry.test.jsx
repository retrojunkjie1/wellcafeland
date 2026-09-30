import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({ lookup: vi.fn(), list: vi.fn(), signals: vi.fn(), review: vi.fn() }));
vi.mock("@/firebase", () => ({ functions: {} }));
vi.mock("firebase/functions", () => ({
  httpsCallable: (_functions, name) => ({
    findAdminWorkspaceAccount: mocks.lookup,
    listSupportActivityForAdmin: mocks.list,
    listOpenAccountSecuritySignals: mocks.signals,
    reviewAccountSecuritySignal: mocks.review,
  })[name],
}));

import { AdminTelemetry } from "./AdminTelemetry";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminTelemetry", () => {
  it("loads only a selected account's safe support trail", async () => {
    mocks.lookup.mockResolvedValue({ data: { found: true, account: { uid: "client-7", email: "member@example.test" } } });
    mocks.list.mockResolvedValue({ data: { events: [
      { id: "e-1", feature: "providers", eventCode: "connection_request_accepted", errorCode: "", source: "server", createdAt: "2026-09-29T10:00:00.000Z" },
      { id: "e-2", feature: "assistance", eventCode: "action_failed", errorCode: "functions/unavailable", source: "reported", createdAt: "2026-09-29T09:00:00.000Z" },
    ] } });

    render(<AdminTelemetry />);
    fireEvent.change(screen.getByLabelText("Member account email"), { target: { value: "member@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Find activity" }));

    expect(await screen.findByText("member@example.test")).toBeInTheDocument();
    expect(await screen.findByText("Practitioner accepted a connection request")).toBeInTheDocument();
    expect(screen.getByText("Practitioner directory · System-recorded")).toBeInTheDocument();
    expect(screen.getByText("Find help · App-reported")).toBeInTheDocument();
    expect(screen.getByText("Action did not complete · unavailable")).toBeInTheDocument();
    expect(screen.getByText(/Completed connection, session, and message actions are system-recorded/)).toBeInTheDocument();
    expect(screen.getByText(/Introductions, message or check-in content, appointment details, exact searches, and location are excluded/)).toBeInTheDocument();
    await waitFor(() => expect(mocks.lookup).toHaveBeenCalledWith({ email: "member@example.test" }));
    expect(mocks.list).toHaveBeenCalledWith({ uid: "client-7" });
  });

  it("does not load account activity unless an account lookup succeeds", async () => {
    mocks.lookup.mockResolvedValue({ data: { found: false } });
    render(<AdminTelemetry />);
    fireEvent.change(screen.getByLabelText("Member account email"), { target: { value: "nobody@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Find activity" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No account was found");
    expect(mocks.list).not.toHaveBeenCalled();
  });

  it("shows meaningful workspace and support-step outcomes", async () => {
    mocks.lookup.mockResolvedValue({ data: { found: true, account: { uid: "user-1", email: "member@example.test" } } });
    mocks.list.mockResolvedValue({ data: { events: [
      { id: "switch-1", feature: "account", eventCode: "workspace_changed", workspace: "practitioner", errorCode: "", createdAt: "2026-09-29T12:00:00.000Z" },
      { id: "checkin-1", feature: "check_in", eventCode: "check_in_saved", workspace: "", errorCode: "", createdAt: "2026-09-29T12:01:00.000Z" },
      { id: "practice-1", feature: "practice", eventCode: "practice_added", workspace: "", errorCode: "", createdAt: "2026-09-29T12:02:00.000Z" },
    ] } });

    render(<AdminTelemetry />);
    fireEvent.change(screen.getByLabelText("Member account email"), { target: { value: "member@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Find activity" }));

    expect(await screen.findByText("Switched to Practitioner space")).toBeInTheDocument();
    expect(screen.getByText("Saved a recovery check-in")).toBeInTheDocument();
    expect(screen.getByText("Added a shared practice")).toBeInTheDocument();
  });

  it("shows rate-limit signals as human-review prompts and supports audited outcomes", async () => {
    mocks.signals.mockResolvedValue({ data: { signals: [{
      id: "signal-1", email: "member@example.test", emailVerified: true,
      signalCode: "message_quota_blocks", countInWindow: 5, lastSeenAt: "2026-09-29T12:00:00.000Z",
    }] } });
    mocks.review.mockResolvedValue({ data: { reviewed: true, status: "reviewed" } });
    render(<AdminTelemetry />);

    expect(screen.getByText(/do not prove a person’s identity or intent/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Review signals" }));
    expect(await screen.findByText("member@example.test")).toBeInTheDocument();
    expect(screen.getByText(/5 recorded windows in 24 hours/)).toBeInTheDocument();
    expect(screen.getByText(/Repeated message rate limits/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "False positive" }));
    await waitFor(() => expect(mocks.review).toHaveBeenCalledWith({ id: "signal-1", outcome: "false_positive" }));
    expect(await screen.findByText("No accounts currently meet the review threshold.")).toBeInTheDocument();
  });

  it("keeps a monitored signal in the queue", async () => {
    mocks.signals.mockResolvedValue({ data: { signals: [{
      id: "signal-monitor", email: "member@example.test", emailVerified: false,
      signalCode: "ai_quota_blocks", countInWindow: 5, lastSeenAt: "2026-09-29T12:00:00.000Z",
    }] } });
    mocks.review.mockResolvedValue({ data: { reviewed: true, status: "open" } });
    render(<AdminTelemetry />);

    fireEvent.click(screen.getByRole("button", { name: "Review signals" }));
    expect(await screen.findByText("member@example.test")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Keep under review" }));
    expect(await screen.findByRole("status")).toHaveTextContent("remains in the queue");
    expect(screen.getByText("member@example.test")).toBeInTheDocument();
    expect(mocks.review).toHaveBeenCalledWith({ id: "signal-monitor", outcome: "monitor" });
  });
});
