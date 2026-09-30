import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import ClientWeekProgress from "./ClientWeekProgress";

const mocks = vi.hoisted(() => ({
  user: { uid: "client-1", isAnonymous: false },
  loading: false,
  getMyCheckInWeekSummary: vi.fn(),
  importGuestCheckIns: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: mocks.user, loading: mocks.loading }) }));
vi.mock("@/services/checkInHistory", () => ({ getMyCheckInWeekSummary: mocks.getMyCheckInWeekSummary }));
vi.mock("@/services/guestCheckInMigration", () => ({
  importGuestCheckIns: mocks.importGuestCheckIns,
  prepareGuestCheckInsForImport: (entries) => entries.map((entry, index) => ({ ...entry, migrationId: entry.migrationId || `guest-id-${index}` })),
}));

function CurrentPath() {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}</output>;
}

const summary = {
  weekCheckInCount: 2,
  daysCheckedIn: 2,
  skillEntries: 1,
  gratitudeEntries: 1,
  plannedSupportEntries: 1,
  latestSupportChoice: "Peer recovery support",
  weekDays: [
    { date: "2026-09-28", label: "Mon", count: 1, isToday: false },
    { date: "2026-09-29", label: "Tue", count: 0, isToday: false },
    { date: "2026-09-30", label: "Wed", count: 1, isToday: true },
    { date: "2026-10-01", label: "Thu", count: 0, isToday: false },
    { date: "2026-10-02", label: "Fri", count: 0, isToday: false },
    { date: "2026-10-03", label: "Sat", count: 0, isToday: false },
    { date: "2026-10-04", label: "Sun", count: 0, isToday: false },
  ],
};

function renderCard() {
  return render(
    <MemoryRouter initialEntries={["/home"]}>
      <Routes>
        <Route path="/home" element={<ClientWeekProgress />} />
        <Route path="/dashboard" element={<><h1>History route</h1><CurrentPath /></>} />
        <Route path="/milestones" element={<><h1>Milestones route</h1><CurrentPath /></>} />
        <Route path="/check-in" element={<><h1>Check-in route</h1><CurrentPath /></>} />
        <Route path="/recovery/meetings" element={<><h1>Meeting finder route</h1><CurrentPath /></>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => cleanup());
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mocks.user = { uid: "client-1", isAnonymous: false };
  mocks.loading = false;
  mocks.getMyCheckInWeekSummary.mockResolvedValue(summary);
  mocks.importGuestCheckIns.mockResolvedValue({ imported: 1 });
});

describe("ClientWeekProgress", () => {
  it("connects saved check-ins to a private weekly summary, history, and milestones", async () => {
    const { unmount } = renderCard();

    expect(await screen.findByText("2 check-ins this week")).toBeInTheDocument();
    expect(screen.getByText("skills you named")).toBeInTheDocument();
    expect(screen.getByText("gratitude notes")).toBeInTheDocument();
    expect(screen.getByText("A choice from your recent check-in")).toBeInTheDocument();
    expect(screen.getByText("You chose: Peer recovery support")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: /check-ins by day this week/i })).toBeInTheDocument();
    expect(mocks.getMyCheckInWeekSummary).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: /Find a meeting/i }));
    expect(await screen.findByRole("heading", { name: "Meeting finder route" })).toBeInTheDocument();
    expect(screen.getByTestId("current-path")).toHaveTextContent("/recovery/meetings");

    unmount();
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: /milestones/i }));
    expect(await screen.findByRole("heading", { name: "Milestones route" })).toBeInTheDocument();
    expect(screen.getByTestId("current-path")).toHaveTextContent("/milestones");
  });

  it("keeps guest progress on-device and offers a gentle first check-in", async () => {
    mocks.user = { uid: "guest-1", isAnonymous: true };
    const savedAt = new Date();
    localStorage.setItem("wellnesscafe:guest-checkins", JSON.stringify([
      { date: savedAt.toISOString().slice(0, 10), timestamp: savedAt.toISOString(), gratitude: "private words stay local" },
    ]));

    renderCard();

    expect(await screen.findByText(/Guest check-ins stay on this device/i)).toBeInTheDocument();
    expect(screen.getByText("gratitude notes")).toBeInTheDocument();
    expect(mocks.getMyCheckInWeekSummary).not.toHaveBeenCalled();
  });

  it("shows an empty week without implying a broken streak and links back to check-in", async () => {
    mocks.getMyCheckInWeekSummary.mockResolvedValue({
      weekCheckInCount: 0, daysCheckedIn: 0, skillEntries: 0, gratitudeEntries: 0, plannedSupportEntries: 0,
      weekDays: summary.weekDays.map((day) => ({ ...day, count: 0 })),
    });
    renderCard();

    expect(await screen.findByText(/No check-ins saved this week/i)).toBeInTheDocument();
    expect(screen.queryByText(/streak/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /check in when ready/i }));
    expect(await screen.findByRole("heading", { name: "Check-in route" })).toBeInTheDocument();
  });

  it("can retry a failed summary without hiding the failure", async () => {
    mocks.getMyCheckInWeekSummary.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(summary);
    renderCard();

    expect(await screen.findByRole("alert")).toHaveTextContent("This week's progress could not load.");
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    await waitFor(() => expect(screen.getByText("2 check-ins this week")).toBeInTheDocument());
    expect(mocks.getMyCheckInWeekSummary).toHaveBeenCalledTimes(2);
  });

  it("does not turn an unsure support answer into a suggested route", async () => {
    mocks.getMyCheckInWeekSummary.mockResolvedValue({ ...summary, latestSupportChoice: "I am not sure yet" });
    renderCard();
    expect(await screen.findByText("2 check-ins this week")).toBeInTheDocument();
    expect(screen.queryByText("A choice from your recent check-in")).not.toBeInTheDocument();
  });

  it("copies device check-ins only after review and keeps the device copy until the user clears it", async () => {
    const entry = { date: "2026-09-27", timestamp: "2026-09-27T12:00:00.000Z", journal: "private note" };
    localStorage.setItem("wellnesscafe:guest-checkins", JSON.stringify([entry]));
    renderCard();

    expect(await screen.findByText(/Check-ins saved on this device · 1/)).toBeInTheDocument();
    expect(mocks.importGuestCheckIns).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /Copy to my account/i }));
    expect(await screen.findByText(/1 check-in was copied to your account/i)).toBeInTheDocument();
    expect(mocks.importGuestCheckIns).toHaveBeenCalledWith([expect.objectContaining({ migrationId: "guest-id-0", journal: "private note" })]);
    expect(JSON.parse(localStorage.getItem("wellnesscafe:guest-checkins"))).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: /Clear device copy/i }));
    expect(localStorage.getItem("wellnesscafe:guest-checkins")).toBeNull();
    expect(await screen.findByText(/The device copy was cleared/i)).toBeInTheDocument();
  });

  it("keeps the local copy and offers retry when account import fails", async () => {
    const entry = { date: "2026-09-27", timestamp: "2026-09-27T12:00:00.000Z", gratitude: "private" };
    localStorage.setItem("wellnesscafe:guest-checkins", JSON.stringify([entry]));
    mocks.importGuestCheckIns.mockRejectedValueOnce(new Error("offline"));
    renderCard();

    fireEvent.click(await screen.findByRole("button", { name: /Copy to my account/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/device copy is still here/i);
    expect(JSON.parse(localStorage.getItem("wellnesscafe:guest-checkins"))).toHaveLength(1);
    expect(screen.getByRole("button", { name: /Copy to my account/i })).toBeEnabled();
  });
});
