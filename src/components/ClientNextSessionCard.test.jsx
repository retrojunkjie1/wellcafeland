import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ClientNextSessionCard from "./ClientNextSessionCard";

const mocks = vi.hoisted(() => ({
  user: { uid: "client-a", isAnonymous: false },
  listAppointmentsForClient: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock("@/services/appointmentService", () => ({ listAppointmentsForClient: mocks.listAppointmentsForClient }));

afterEach(() => {
  cleanup();
  mocks.user = { uid: "client-a", isAnonymous: false };
  vi.clearAllMocks();
});

describe("ClientNextSessionCard", () => {
  it("shows the next scheduled session and routes into the full session workspace", async () => {
    const startAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    mocks.listAppointmentsForClient.mockResolvedValue([
      { id: "past", status: "confirmed", startAt: new Date(Date.now() - 1000).toISOString() },
      { id: "future", status: "scheduled", startAt, practitionerName: "Jordan Lee", sessionFormat: "in-person" },
    ]);

    render(<MemoryRouter><ClientNextSessionCard /></MemoryRouter>);

    expect(await screen.findByText(/With Jordan Lee · In person/)).toBeTruthy();
    expect(screen.getByText(/Next session · Please confirm/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "View session" }).getAttribute("href")).toBe("/my-sessions");
    expect(mocks.listAppointmentsForClient).toHaveBeenCalledWith("client-a");
  });

  it("stays quiet when there is no upcoming session or the user is a guest", async () => {
    mocks.listAppointmentsForClient.mockResolvedValue([]);
    const view = render(<MemoryRouter><ClientNextSessionCard /></MemoryRouter>);
    await waitFor(() => expect(mocks.listAppointmentsForClient).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("region", { name: "Next session" })).toBeNull();

    mocks.user = { uid: "guest", isAnonymous: true };
    view.rerender(<MemoryRouter><ClientNextSessionCard /></MemoryRouter>);
    expect(screen.queryByRole("region", { name: "Next session" })).toBeNull();
    expect(mocks.listAppointmentsForClient).toHaveBeenCalledTimes(1);
  });

  it("does not show a previous account's session after an identity change", async () => {
    let resolveOld;
    mocks.listAppointmentsForClient
      .mockReturnValueOnce(new Promise((resolve) => { resolveOld = resolve; }))
      .mockResolvedValueOnce([{ id: "new", status: "confirmed", startAt: new Date(Date.now() + 2 * 86400000).toISOString(), practitionerName: "Account B practitioner" }]);
    const view = render(<MemoryRouter><ClientNextSessionCard /></MemoryRouter>);

    mocks.user = { uid: "client-b", isAnonymous: false };
    view.rerender(<MemoryRouter><ClientNextSessionCard /></MemoryRouter>);
    expect(screen.queryByText(/Account A practitioner/)).toBeNull();
    expect(await screen.findByText(/Account B practitioner/)).toBeTruthy();

    resolveOld([{ id: "old", status: "confirmed", startAt: new Date(Date.now() + 86400000).toISOString(), practitionerName: "Late Account A practitioner" }]);
    await waitFor(() => expect(screen.queryByText(/Late Account A practitioner/)).toBeNull());
  });

  it("offers a truthful route when the appointment service is unavailable", async () => {
    mocks.listAppointmentsForClient.mockRejectedValue(new Error("offline"));
    render(<MemoryRouter><ClientNextSessionCard /></MemoryRouter>);

    expect(await screen.findByText("Your next session couldn’t load.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Check My sessions" }).getAttribute("href")).toBe("/my-sessions");
  });
});
