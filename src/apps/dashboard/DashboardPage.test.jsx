import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import DashboardPage from "./DashboardPage";

const mocks = vi.hoisted(() => ({
  user: { uid: "client-1", isAnonymous: false },
  listMyCheckInHistoryPage: vi.fn(),
}));

vi.mock("@/stores/useOSStore", () => ({ useOSStore: () => ({ messages: [] }) }));
vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: mocks.user, loading: false }) }));
vi.mock("@/services/checkInHistory", () => ({ listMyCheckInHistoryPage: mocks.listMyCheckInHistoryPage }));
vi.mock("@/components/dashboard/SignalHeader", () => ({ default: () => <div>Progress heading</div> }));
vi.mock("@/components/dashboard/EmotionStrip", () => ({ default: () => null }));
vi.mock("@/components/dashboard/RiskStrip", () => ({ default: () => null }));
vi.mock("@/components/dashboard/TriggerStrip", () => ({ default: () => null }));
vi.mock("@/components/dashboard/HumanModeStrip", () => ({ default: () => null }));
vi.mock("@/components/dashboard/TrajectoryGraph", () => ({ default: () => null }));
vi.mock("@/components/dashboard/QuickActions", () => ({ default: () => null }));
vi.mock("@/components/dashboard/DashboardDetailsSheet", () => ({ default: () => null }));

function CurrentPath() {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}{location.search}{location.hash}</output>;
}

function renderPage(initialEntries = ["/dashboard"]) {
  return render(<MemoryRouter initialEntries={initialEntries}><Routes><Route path="/dashboard" element={<><DashboardPage /><CurrentPath /></>} /><Route path="/check-in" element={<CurrentPath />} /><Route path="/settings/practitioner-sharing" element={<CurrentPath />} /><Route path="/tools/:toolId" element={<CurrentPath />} /></Routes></MemoryRouter>);
}

afterEach(() => cleanup());
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mocks.user = { uid: "client-1", isAnonymous: false };
  mocks.listMyCheckInHistoryPage.mockResolvedValue({ items: [], nextCursor: null, hasMore: false });
});

describe("client check-in history", () => {
  it("shows account-owned entries and keeps written reflections collapsed until chosen", async () => {
    mocks.listMyCheckInHistoryPage.mockResolvedValue({ items: [{
      id: "checkin-1",
      displayDate: new Date("2026-09-25T12:00:00Z"),
      mood: "good",
      daysSinceLastUse: 12,
      cravingStatus: "yes",
      cravingIntensity: 4,
      gratitude: "My sister called.",
    }], nextCursor: null, hasMore: false });
    renderPage();

    expect(await screen.findByText("Mood: Good")).toBeInTheDocument();
    expect(screen.getByText("Days sober / clean: 12")).toBeInTheDocument();
    const details = screen.getByText("View what I chose to record").closest("details");
    expect(details).not.toHaveAttribute("open");
    fireEvent.click(screen.getByText("View what I chose to record"));
    expect(screen.getByText("My sister called.")).toBeInTheDocument();
    expect(screen.getByText(/A connection alone does not grant access/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Manage sharing" }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/settings/practitioner-sharing");
    expect(mocks.listMyCheckInHistoryPage).toHaveBeenCalledOnce();
  });

  it("loads older account check-ins only when requested and appends them", async () => {
    const cursor = { id: "page-one-last-document" };
    mocks.listMyCheckInHistoryPage
      .mockResolvedValueOnce({ items: [{ id: "new", displayDate: new Date("2026-09-25T12:00:00Z"), mood: "good" }], nextCursor: cursor, hasMore: true })
      .mockResolvedValueOnce({ items: [{ id: "old", displayDate: new Date("2026-09-18T12:00:00Z"), mood: "okay" }], nextCursor: null, hasMore: false });
    renderPage();

    expect(await screen.findByText("Mood: Good")).toBeInTheDocument();
    expect(screen.queryByText("Mood: Okay")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Load older check-ins" }));
    expect(await screen.findByText("Mood: Okay")).toBeInTheDocument();
    expect(mocks.listMyCheckInHistoryPage).toHaveBeenNthCalledWith(2, { cursor });
    expect(screen.queryByRole("button", { name: "Load older check-ins" })).toBeNull();
  });

  it("shows guest check-ins from this device without querying account data", async () => {
    mocks.user = { uid: "guest-1", isAnonymous: true };
    localStorage.setItem("wellnesscafe:guest-checkins", JSON.stringify([
      { mood: "okay", date: "2026-09-24", completed: true },
    ]));
    renderPage();

    expect(await screen.findByText("Mood: Okay")).toBeInTheDocument();
    expect(screen.getByText("Saved on this device")).toBeInTheDocument();
    expect(mocks.listMyCheckInHistoryPage).not.toHaveBeenCalled();
  });

  it("provides a useful action when the user has no saved entries", async () => {
    renderPage();
    expect(screen.queryByRole("button", { name: /back to your practice/i })).toBeNull();
    fireEvent.click(await screen.findByRole("button", { name: "Start a check-in" }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/check-in");
  });

  it("returns to the exact safe practice location when history was opened from a check-in", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const returnTo = {
      pathname: "/tools/breathing",
      search: "?focus=shoulders",
      hash: "#next-step",
      state: null,
      scrollY: 84,
    };
    renderPage([{ pathname: "/dashboard", state: { from: "daily-check-in", returnTo } }]);

    expect(await screen.findByText("Your check-ins")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /back to your practice/i }));

    expect(screen.getByTestId("current-path")).toHaveTextContent("/tools/breathing?focus=shoulders#next-step");
  });

  it("does not render a practice return action for an untrusted external route", async () => {
    renderPage([{ pathname: "/dashboard", state: { returnTo: { pathname: "https://example.com" } } }]);

    expect(await screen.findByText("Your check-ins")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /back to your practice/i })).toBeNull();
  });

  it("clears the previous account history and ignores its late response after an account switch", async () => {
    let finishFirstRequest;
    mocks.listMyCheckInHistoryPage
      .mockImplementationOnce(() => new Promise((resolve) => { finishFirstRequest = resolve; }))
      .mockResolvedValueOnce({ items: [{ id: "client-2-checkin", displayDate: new Date("2026-09-26T12:00:00Z"), mood: "difficult" }], nextCursor: null, hasMore: false });
    const view = renderPage();
    await waitFor(() => expect(mocks.listMyCheckInHistoryPage).toHaveBeenCalledTimes(1));

    mocks.user = { uid: "client-2", isAnonymous: false };
    view.rerender(<MemoryRouter initialEntries={["/dashboard"]}><Routes><Route path="/dashboard" element={<><DashboardPage /><CurrentPath /></>} /><Route path="/check-in" element={<CurrentPath />} /><Route path="/settings/practitioner-sharing" element={<CurrentPath />} /></Routes></MemoryRouter>);

    expect(await screen.findByText("Mood: Difficult")).toBeInTheDocument();
    finishFirstRequest({ items: [{ id: "client-1-checkin", displayDate: new Date("2026-09-25T12:00:00Z"), mood: "good" }], nextCursor: null, hasMore: false });

    await waitFor(() => expect(screen.queryByText("Mood: Good")).toBeNull());
    expect(screen.getByText("Mood: Difficult")).toBeInTheDocument();
  });
});
