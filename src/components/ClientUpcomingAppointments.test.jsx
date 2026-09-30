import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ClientUpcomingAppointments from "./ClientUpcomingAppointments";

const mocks = vi.hoisted(() => ({
  user: { uid: "client-1", isAnonymous: false },
  confirmMyAppointment: vi.fn(),
  listAppointmentsForClient: vi.fn(),
  listMyAppointmentRequests: vi.fn(),
  listMyConnectedPractitioners: vi.fn(),
  getConnectedPractitionerAvailability: vi.fn(),
  requestAppointmentTimeChange: vi.fn(),
  requestProviderAppointment: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: mocks.user }),
}));

vi.mock("@/services/appointmentService", () => ({
  confirmMyAppointment: mocks.confirmMyAppointment,
  listAppointmentsForClient: mocks.listAppointmentsForClient,
  listMyAppointmentRequests: mocks.listMyAppointmentRequests,
  listMyConnectedPractitioners: mocks.listMyConnectedPractitioners,
  getConnectedPractitionerAvailability: mocks.getConnectedPractitionerAvailability,
  requestAppointmentTimeChange: mocks.requestAppointmentTimeChange,
  requestProviderAppointment: mocks.requestProviderAppointment,
}));

const futureStart = () => new Date(Date.now() + 86_400_000).toISOString();

function renderAppointments() {
  return render(<MemoryRouter><ClientUpcomingAppointments /></MemoryRouter>);
}

function setReadyDefaults({ appointments = [], practitioners = [], requests = [] } = {}) {
  mocks.listAppointmentsForClient.mockResolvedValue(appointments);
  mocks.listMyConnectedPractitioners.mockResolvedValue(practitioners);
  mocks.listMyAppointmentRequests.mockResolvedValue(requests);
  mocks.getConnectedPractitionerAvailability.mockResolvedValue({
    timezone: "America/Denver",
    weeklyHours: [{ dayOfWeek: 1, enabled: true, start: "09:00", end: "13:00" }],
    upcomingSlots: [{ startAt: futureStart(), label: "Tomorrow · 10:00 AM" }],
  });
}

beforeEach(() => {
  mocks.user = { uid: "client-1", isAnonymous: false };
  mocks.confirmMyAppointment.mockResolvedValue({ ok: true });
  mocks.listAppointmentsForClient.mockResolvedValue([]);
  mocks.listMyAppointmentRequests.mockResolvedValue([]);
  mocks.listMyConnectedPractitioners.mockResolvedValue([]);
  mocks.getConnectedPractitionerAvailability.mockResolvedValue({ timezone: "America/Denver", weeklyHours: [], upcomingSlots: [] });
  mocks.requestAppointmentTimeChange.mockResolvedValue({ ok: true });
  mocks.requestProviderAppointment.mockResolvedValue({ ok: true, requestId: "request-1" });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("client session workspace lifecycle", () => {
  it("gives a signed-out visitor a sign-in route without querying private appointments", async () => {
    mocks.user = null;
    renderAppointments();

    expect(await screen.findByRole("link", { name: "Sign in to manage sessions" })).toHaveAttribute("href", "/login");
    expect(mocks.listAppointmentsForClient).not.toHaveBeenCalled();
  });

  it("explains that a connection is needed before a session can be requested", async () => {
    setReadyDefaults();
    renderAppointments();

    expect(await screen.findByText("No upcoming sessions have been scheduled yet.")).toBeInTheDocument();
    expect(screen.getByText(/Session requests are available after you and a practitioner accept a connection/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore practitioners" })).toHaveAttribute("href", "/providers");
    expect(screen.queryByRole("button", { name: "Choose a time" })).not.toBeInTheDocument();
  });

  it("requests one of the connected practitioner's actual openings and shows its pending state", async () => {
    const slot = futureStart();
    setReadyDefaults({ practitioners: [{ id: "provider-1", name: "Sam Practitioner" }] });
    mocks.getConnectedPractitionerAvailability.mockResolvedValue({
      timezone: "America/Denver",
      weeklyHours: [{ dayOfWeek: 1, enabled: true, start: "09:00", end: "13:00" }],
      upcomingSlots: [{ startAt: slot, label: "Tomorrow · 10:00 AM" }],
    });
    renderAppointments();

    await screen.findByText("No upcoming sessions have been scheduled yet.");
    fireEvent.click(screen.getByRole("button", { name: "Choose a time" }));
    await screen.findByRole("option", { name: /practitioner time · your local time/ });
    fireEvent.change(screen.getByLabelText("Available appointment time"), { target: { value: slot } });
    fireEvent.change(screen.getByLabelText("Note for your practitioner (optional)"), { target: { value: "Could we meet after lunch?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send session request" }));

    await screen.findByText("Waiting for reply");
    expect(mocks.requestProviderAppointment).toHaveBeenCalledWith(expect.objectContaining({
      providerId: "provider-1",
      requestedStartAt: expect.any(Date),
      requestedEndAt: expect.any(Date),
      note: "Could we meet after lunch?",
    }));
  });

  it("keeps the private video room unavailable until the client confirms", async () => {
    setReadyDefaults({
      appointments: [{ id: "appointment-1", startAt: futureStart(), status: "scheduled", sessionFormat: "wellnesscafe-video", practitionerName: "Sam Practitioner" }],
    });
    renderAppointments();

    expect(await screen.findByText("Join becomes available once both people confirm.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Join private session" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirm session" }));

    expect(await screen.findByRole("link", { name: "Join private session" })).toHaveAttribute("href", "/sessions/appointment-1/video?returnTo=client");
    expect(mocks.confirmMyAppointment).toHaveBeenCalledWith("appointment-1");
  });

  it("offers a real retry when the schedule service fails", async () => {
    mocks.listAppointmentsForClient
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([]);
    setReadyDefaults();
    mocks.listAppointmentsForClient
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([]);
    renderAppointments();

    expect(await screen.findByText("Your schedule could not load just now. Try again when you’re ready.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("No upcoming sessions have been scheduled yet.")).toBeInTheDocument();
    expect(mocks.listAppointmentsForClient).toHaveBeenCalledTimes(2);
  });
});
