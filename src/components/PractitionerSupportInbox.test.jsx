import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import PractitionerSupportInbox from "./PractitionerSupportInbox";

const mocks = vi.hoisted(() => ({
  listMyPractitionerSupport: vi.fn(),
  markPractitionerSupportSeen: vi.fn(),
  trackSupportAction: vi.fn(),
  user: { uid: "client-1", isAnonymous: false },
}));

vi.mock("@/services/practitionerRegistry", () => mocks);
vi.mock("@/apps/tools/toolsRegistry", () => ({ TOOLS: [{ id: "grounding", name: "Grounding practice" }] }));
vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: mocks.user, loading: false }) }));
vi.mock("@/telemetry/telemetry", () => ({ trackSupportAction: mocks.trackSupportAction }));

function CurrentPath() {
  const location = useLocation();
  return <><output data-testid="current-path">{location.pathname}</output><output data-testid="current-state">{JSON.stringify(location.state || null)}</output></>;
}

afterEach(() => { cleanup(); mocks.user = { uid: "client-1", isAnonymous: false }; vi.clearAllMocks(); });

describe("PractitionerSupportInbox", () => {
  it("opens a practitioner-shared tool and marks it opened", async () => {
    mocks.listMyPractitionerSupport.mockResolvedValue({ items: [{ id: "support-1", practitionerName: "Avery", toolId: "grounding", message: "Use this if it feels useful." }] });
    mocks.markPractitionerSupportSeen.mockResolvedValue({ ok: true });

    render(<MemoryRouter initialEntries={["/home"]}><Routes><Route path="*" element={<><PractitionerSupportInbox /><CurrentPath /></>} /></Routes></MemoryRouter>);

    fireEvent.click(await screen.findByRole("button", { name: "Open once" }));

    await waitFor(() => expect(mocks.markPractitionerSupportSeen).toHaveBeenCalledWith("support-1", "opened"));
    expect(mocks.trackSupportAction).toHaveBeenCalledWith("practice", "practice_opened");
    await waitFor(() => expect(screen.getByTestId("current-path")).toHaveTextContent("/tools/grounding"));
  });

  it("adds a shared practice to the client's persistent Daily Practice", async () => {
    mocks.listMyPractitionerSupport.mockResolvedValue({ items: [{ id: "support-save", practitionerName: "Avery", toolId: "grounding" }] });
    mocks.markPractitionerSupportSeen.mockResolvedValue({ ok: true });

    render(<MemoryRouter initialEntries={["/home"]}><Routes><Route path="*" element={<><PractitionerSupportInbox /><CurrentPath /></>} /></Routes></MemoryRouter>);

    fireEvent.click(await screen.findByRole("button", { name: "Add to Daily Practice" }));

    await waitFor(() => expect(mocks.markPractitionerSupportSeen).toHaveBeenCalledWith("support-save", "added"));
    expect(mocks.trackSupportAction).toHaveBeenCalledWith("practice", "practice_added");
    await waitFor(() => expect(screen.getByTestId("current-path")).toHaveTextContent("/tools"));
    expect(screen.getByTestId("current-state")).toHaveTextContent(JSON.stringify({ newlyAddedPracticeId: "support-save" }));
  });

  it("shows a new shared practice when the client returns to the app", async () => {
    mocks.listMyPractitionerSupport
      .mockResolvedValueOnce({ items: [] })
      .mockResolvedValueOnce({ items: [{ id: "support-return", practitionerName: "Avery", toolId: "grounding", message: "Try this when it feels useful." }] });

    render(<MemoryRouter><PractitionerSupportInbox /></MemoryRouter>);
    await waitFor(() => expect(mocks.listMyPractitionerSupport).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("region", { name: "Support from your practitioner" })).toBeNull();

    fireEvent.focus(window);
    fireEvent(document, new Event("visibilitychange"));

    expect(await screen.findByText("Try this when it feels useful.")).toBeInTheDocument();
    expect(mocks.listMyPractitionerSupport).toHaveBeenCalledTimes(2);
  });

  it("keeps the item visible and offers retry if marking it opened fails", async () => {
    mocks.listMyPractitionerSupport.mockResolvedValue({ items: [{ id: "support-2", practitionerName: "Avery", toolId: "grounding" }] });
    mocks.markPractitionerSupportSeen.mockRejectedValueOnce(new Error("Connection lost"));

    render(<MemoryRouter><PractitionerSupportInbox /></MemoryRouter>);

    fireEvent.click(await screen.findByRole("button", { name: "Open once" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Connection lost");
    expect(screen.getByRole("button", { name: "Open once" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(mocks.listMyPractitionerSupport).toHaveBeenCalledTimes(2));
  });

  it("removes a dismissed support item only after the server confirms", async () => {
    mocks.listMyPractitionerSupport.mockResolvedValue({ items: [{ id: "support-3", practitionerName: "Avery", toolId: "grounding" }] });
    mocks.markPractitionerSupportSeen.mockResolvedValue({ ok: true });

    render(<MemoryRouter><PractitionerSupportInbox /></MemoryRouter>);

    fireEvent.click(await screen.findByRole("button", { name: "Dismiss" }));

    await waitFor(() => expect(mocks.markPractitionerSupportSeen).toHaveBeenCalledWith("support-3", "dismissed"));
    await waitFor(() => expect(screen.queryByRole("region", { name: "Support from your practitioner" })).toBeNull());
  });

  it("hides the previous account's inbox immediately and ignores its late response", async () => {
    let finishFirstRequest;
    mocks.listMyPractitionerSupport
      .mockImplementationOnce(() => new Promise((resolve) => { finishFirstRequest = resolve; }))
      .mockResolvedValueOnce({ items: [{ id: "client-2-item", practitionerName: "Riley", toolId: "grounding", message: "For your week." }] });

    const { rerender } = render(<MemoryRouter><PractitionerSupportInbox /></MemoryRouter>);
    await waitFor(() => expect(mocks.listMyPractitionerSupport).toHaveBeenCalledTimes(1));

    mocks.user = { uid: "client-2", isAnonymous: false };
    rerender(<MemoryRouter><PractitionerSupportInbox /></MemoryRouter>);

    expect(await screen.findByText("For your week.")).toBeInTheDocument();
    expect(screen.queryByText("From Avery")).toBeNull();

    finishFirstRequest({ items: [{ id: "client-1-item", practitionerName: "Avery", toolId: "grounding", message: "Private note for client one." }] });

    await waitFor(() => expect(screen.queryByText("Private note for client one.")).toBeNull());
    expect(screen.getByText("For your week.")).toBeInTheDocument();
  });
});
