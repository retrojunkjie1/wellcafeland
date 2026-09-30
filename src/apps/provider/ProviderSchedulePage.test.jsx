import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import ProviderSchedulePage from "./ProviderSchedulePage";

const mocks = vi.hoisted(() => ({
  useSessionIdentity: vi.fn(),
  listAssignmentsForProvider: vi.fn(),
  listAppointmentsForProvider: vi.fn(),
  listProviderAppointmentRequests: vi.fn(),
  getMyProviderAvailability: vi.fn(),
  saveMyProviderAvailability: vi.fn(),
  respondToProviderAppointmentRequest: vi.fn(),
  createAppointment: vi.fn(),
  updateAppointment: vi.fn(),
  respondToAppointmentTimeChange: vi.fn(),
}));

vi.mock("@/hooks/useSessionIdentity", () => ({ useSessionIdentity: mocks.useSessionIdentity }));
vi.mock("@/services/assignmentService", () => ({ listAssignmentsForProvider: mocks.listAssignmentsForProvider }));
vi.mock("@/services/appointmentService", () => mocks);
vi.mock("@/components/navigation/PageHeader", () => ({ default: ({ title, subtitle }) => <header><h1>{title}</h1><p>{subtitle}</p></header> }));

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="current-route">{location.pathname}</output>;
}

beforeEach(() => {
  mocks.useSessionIdentity.mockReturnValue({ providerId: "provider-1", userId: "provider-1", orgId: null, isLoading: false, isProvider: true, isAdmin: false });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("ProviderSchedulePage client requests", () => {
  it("opens a confirmed WellnessCafe room with a practitioner return destination", async () => {
    mocks.listAppointmentsForProvider.mockResolvedValue([{ id: "provider-private-video", clientId: "client-1", startAt: "2026-10-05T15:00:00.000Z", endAt: "2026-10-05T15:45:00.000Z", status: "confirmed", sessionFormat: "wellnesscafe-video" }]);
    mocks.listAssignmentsForProvider.mockResolvedValue([{ clientId: "client-1", alias: "Client 1" }]);
    mocks.listProviderAppointmentRequests.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver", weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })) });

    render(<MemoryRouter><ProviderSchedulePage /></MemoryRouter>);

    expect(await screen.findByRole("link", { name: "Join private session" })).toHaveAttribute("href", "/sessions/provider-private-video/video?returnTo=practitioner");
  });

  it("routes the no-client appointment action to connection requests", async () => {
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.listAssignmentsForProvider.mockResolvedValue([]);
    mocks.listProviderAppointmentRequests.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver", weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })) });

    render(<MemoryRouter><ProviderSchedulePage /><LocationProbe /></MemoryRouter>);
    const connectAction = await screen.findByRole("button", { name: "Review connection requests" });
    expect(connectAction.disabled).toBe(false);
    fireEvent.click(connectAction);

    expect(screen.getByTestId("current-route")).toHaveTextContent("/provider/dashboard");
  });

  it("routes the no-client empty-state action to connection requests", async () => {
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.listAssignmentsForProvider.mockResolvedValue([]);
    mocks.listProviderAppointmentRequests.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver", weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })) });

    render(<MemoryRouter><ProviderSchedulePage /><LocationProbe /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: "Open connection requests" }));

    expect(screen.getByTestId("current-route")).toHaveTextContent("/provider/dashboard");
  });

  it("shows provider availability and saves published hours", async () => {
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.listAssignmentsForProvider.mockResolvedValue([]);
    mocks.listProviderAppointmentRequests.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver", weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })) });
    mocks.saveMyProviderAvailability.mockResolvedValue({ ok: true });

    render(<MemoryRouter><ProviderSchedulePage /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Appointment hours" })).toBeTruthy();
    expect(screen.queryByLabelText("Monday")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Set hours/ }));
    expect(screen.getByLabelText("Monday")).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Appointment time zone" }).querySelector('option[value="America/New_York"]')).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Monday"));
    fireEvent.click(screen.getByRole("button", { name: "Save appointment hours" }));
    await waitFor(() => expect(mocks.saveMyProviderAvailability).toHaveBeenCalledWith(expect.objectContaining({ timezone: "America/Denver", weeklyHours: expect.arrayContaining([expect.objectContaining({ dayOfWeek: 1, enabled: true })]) })));
  }, 10000);

  it("refreshes the incoming request queue without reloading the full schedule", async () => {
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.listAssignmentsForProvider.mockResolvedValue([{ clientId: "client-1" }]);
    mocks.listProviderAppointmentRequests
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: "request-live", clientId: "client-1", requestedStartAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), requestedEndAt: new Date(Date.now() + 48 * 60 * 60 * 1000 + 45 * 60_000).toISOString() }]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver", weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })) });

    render(<MemoryRouter><ProviderSchedulePage /></MemoryRouter>);
    expect(await screen.findByText("No new session requests. Requests from connected clients will appear here.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Refresh requests" }));

    expect(await screen.findByText("Awaiting your response")).toBeTruthy();
    expect(mocks.listProviderAppointmentRequests).toHaveBeenCalledTimes(2);
    expect(mocks.listAppointmentsForProvider).toHaveBeenCalledTimes(1);
  });

  it("checks for new requests when the practitioner returns to the schedule", async () => {
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.listAssignmentsForProvider.mockResolvedValue([{ clientId: "client-1" }]);
    mocks.listProviderAppointmentRequests
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: "request-on-focus", clientId: "client-1", requestedStartAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), requestedEndAt: new Date(Date.now() + 48 * 60 * 60 * 1000 + 45 * 60_000).toISOString() }]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver", weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })) });

    render(<MemoryRouter><ProviderSchedulePage /></MemoryRouter>);
    expect(await screen.findByText("No new session requests. Requests from connected clients will appear here.")).toBeTruthy();
    fireEvent.focus(window);

    expect(await screen.findByText("Awaiting your response")).toBeTruthy();
    expect(mocks.listProviderAppointmentRequests).toHaveBeenCalledTimes(2);
    expect(mocks.listAppointmentsForProvider).toHaveBeenCalledTimes(1);
  });

  it("keeps the current queue visible after refresh fails and retries the request query", async () => {
    const request = { id: "request-preserved", clientId: "client-1", requestedStartAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), requestedEndAt: new Date(Date.now() + 48 * 60 * 60 * 1000 + 45 * 60_000).toISOString() };
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.listAssignmentsForProvider.mockResolvedValue([{ clientId: "client-1" }]);
    mocks.listProviderAppointmentRequests
      .mockResolvedValueOnce([request])
      .mockRejectedValueOnce(new Error("temporary connection issue"))
      .mockResolvedValueOnce([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver", weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })) });

    render(<MemoryRouter><ProviderSchedulePage /></MemoryRouter>);
    expect(await screen.findByText("Awaiting your response")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Refresh requests" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Session requests aren’t available right now.");
    expect(screen.getByText("Awaiting your response")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("No new session requests. Requests from connected clients will appear here.")).toBeTruthy();
    expect(mocks.listProviderAppointmentRequests).toHaveBeenCalledTimes(3);
  });

  it("lets the practitioner accept a requested time and reload the schedule", async () => {
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.listAssignmentsForProvider.mockResolvedValue([{ clientId: "client-1" }]);
    mocks.listProviderAppointmentRequests.mockResolvedValue([{
      id: "request-1",
      clientId: "client-1",
      requestedStartAt: "2026-09-26T15:00:00.000Z",
      requestedEndAt: "2026-09-26T15:45:00.000Z",
      note: "A first session, please.",
    }]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/New_York", weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })) });
    mocks.respondToProviderAppointmentRequest.mockResolvedValue({ ok: true, status: "accepted" });

    render(<MemoryRouter><ProviderSchedulePage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: "Accept requested time" }));

    expect(mocks.respondToProviderAppointmentRequest).toHaveBeenCalledWith("request-1", "accept", "", { sessionFormat: "in-person", meetingLink: "" });
    expect(screen.getByText(/Saturday, Sep 26 · 11:00 AM EDT–11:45 AM EDT/)).toBeTruthy();
    expect(screen.getByText(/Times are shown in America\/New_York/)).toBeTruthy();
    expect(await screen.findByRole("status")).toHaveTextContent("Session request accepted and added to your schedule");
    await waitFor(() => expect(mocks.listProviderAppointmentRequests).toHaveBeenCalledTimes(2));
  });

  it("restores a failed accept action and removes the request after retry", async () => {
    const requestedStartAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.listAssignmentsForProvider.mockResolvedValue([{ clientId: "client-1" }]);
    mocks.listProviderAppointmentRequests
      .mockResolvedValueOnce([{ id: "request-retry", clientId: "client-1", requestedStartAt: requestedStartAt.toISOString(), requestedEndAt: new Date(requestedStartAt.getTime() + 45 * 60_000).toISOString() }])
      .mockResolvedValueOnce([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver", weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })) });
    mocks.respondToProviderAppointmentRequest
      .mockResolvedValueOnce({ ok: false, error: "We couldn’t save your response. Check your connection and try again." })
      .mockResolvedValueOnce({ ok: true, status: "accepted", appointmentId: "appointment-retry" });

    render(<MemoryRouter><ProviderSchedulePage /></MemoryRouter>);
    const acceptButton = await screen.findByRole("button", { name: "Accept requested time" });
    fireEvent.click(acceptButton);
    expect(await screen.findByRole("alert")).toHaveTextContent("Check your connection and try again");
    await waitFor(() => expect(acceptButton.disabled).toBe(false));
    expect(screen.getByText("Awaiting your response")).toBeTruthy();

    fireEvent.click(acceptButton);
    expect(await screen.findByRole("status")).toHaveTextContent("Session request accepted and added to your schedule");
    await waitFor(() => expect(screen.queryByRole("button", { name: "Accept requested time" })).toBeNull());
    expect(mocks.respondToProviderAppointmentRequest).toHaveBeenCalledTimes(2);
  });

  it("creates a manual appointment using the practitioner's configured time zone", async () => {
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.listAssignmentsForProvider.mockResolvedValue([{ clientId: "client-1" }]);
    mocks.listProviderAppointmentRequests.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/New_York", weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })) });
    mocks.createAppointment.mockResolvedValue({ ok: true, appointmentId: "appointment-1" });

    render(<MemoryRouter><ProviderSchedulePage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: "New Appointment" }));
    fireEvent.change(screen.getByLabelText("Client"), { target: { value: "client-1" } });
    fireEvent.change(screen.getByLabelText("Starts · America/New_York"), { target: { value: "2026-11-10T10:00" } });
    fireEvent.change(screen.getByLabelText("Ends · America/New_York"), { target: { value: "2026-11-10T10:45" } });
    fireEvent.change(screen.getByLabelText("Session format"), { target: { value: "video" } });
    fireEvent.change(screen.getByLabelText("Video meeting link"), { target: { value: "https://meet.example.org/room-1" } });
    fireEvent.click(screen.getByRole("button", { name: "Add appointment" }));

    await waitFor(() => expect(mocks.createAppointment).toHaveBeenCalledWith(expect.objectContaining({
      startAt: new Date("2026-11-10T15:00:00.000Z"),
      endAt: new Date("2026-11-10T15:45:00.000Z"),
      sessionFormat: "video",
      meetingLink: "https://meet.example.org/room-1",
    })));
  });

  it("lets the practitioner attach a video link while accepting a client request", async () => {
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.listAssignmentsForProvider.mockResolvedValue([{ clientId: "client-1" }]);
    mocks.listProviderAppointmentRequests.mockResolvedValue([{ id: "request-video", clientId: "client-1", requestedStartAt: "2026-10-03T15:00:00.000Z", requestedEndAt: "2026-10-03T15:45:00.000Z" }]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver", weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })) });
    mocks.respondToProviderAppointmentRequest.mockResolvedValue({ ok: true, status: "accepted" });

    render(<MemoryRouter><ProviderSchedulePage /></MemoryRouter>);
    fireEvent.change(await screen.findByLabelText("Session format for Client 1"), { target: { value: "video" } });
    fireEvent.change(screen.getByLabelText("Video meeting link for Client 1"), { target: { value: "https://meet.example.org/client-room" } });
    fireEvent.click(screen.getByRole("button", { name: "Accept requested time" }));

    await waitFor(() => expect(mocks.respondToProviderAppointmentRequest).toHaveBeenCalledWith("request-video", "accept", "", { sessionFormat: "video", meetingLink: "https://meet.example.org/client-room" }));
  });

  it("does not show a previous account's schedule or hours after switching accounts during loading", async () => {
    let resolveOldAppointments;
    let resolveOldAssignments;
    let resolveOldAvailability;
    const oldAppointments = new Promise((resolve) => { resolveOldAppointments = resolve; });
    const oldAssignments = new Promise((resolve) => { resolveOldAssignments = resolve; });
    const oldAvailability = new Promise((resolve) => { resolveOldAvailability = resolve; });
    mocks.listAppointmentsForProvider.mockImplementation((id) => id === "provider-1" ? oldAppointments : Promise.resolve([]));
    mocks.listAssignmentsForProvider.mockImplementation((id) => id === "provider-1" ? oldAssignments : Promise.resolve([]));
    mocks.listProviderAppointmentRequests.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockImplementation(() => oldAvailability);

    const view = render(<MemoryRouter><ProviderSchedulePage /></MemoryRouter>);
    mocks.useSessionIdentity.mockReturnValue({ providerId: "provider-2", userId: "provider-2", orgId: null, isLoading: false, isProvider: true, isAdmin: false });
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Los_Angeles", weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })) });
    view.rerender(<MemoryRouter><ProviderSchedulePage /></MemoryRouter>);

    expect(await screen.findByRole("heading", { name: "No upcoming appointments" })).toBeTruthy();
    expect(screen.getByText(/No days set · America\/Los Angeles/)).toBeTruthy();
    resolveOldAppointments([{ id: "old-private-appointment", clientId: "old-client", startAt: "2026-10-02T15:00:00.000Z", endAt: "2026-10-02T15:45:00.000Z" }]);
    resolveOldAssignments([{ clientId: "old-client" }]);
    resolveOldAvailability({ timezone: "America/New_York", weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: dayOfWeek === 1, start: "09:00", end: "17:00" })) });
    await waitFor(() => {
      expect(screen.queryByText("Assigned client")).toBeNull();
      expect(screen.queryByText(/America\/New_York/)).toBeNull();
      expect(screen.getByText(/No days set · America\/Los Angeles/)).toBeTruthy();
      expect(screen.getByRole("heading", { name: "Connect with someone before scheduling" })).toBeTruthy();
    });
  });

  it("shows an unavailable state after a schedule failure and retries into a real empty state", async () => {
    mocks.listAppointmentsForProvider.mockRejectedValueOnce(new Error("Appointments are temporarily unavailable."));
    mocks.listAppointmentsForProvider.mockResolvedValueOnce([]);
    mocks.listAssignmentsForProvider.mockResolvedValue([]);
    mocks.listProviderAppointmentRequests.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver", weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })) });

    render(<MemoryRouter><ProviderSchedulePage /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Schedule unavailable" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "No upcoming appointments" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { name: "No upcoming appointments" })).toBeTruthy();
    expect(mocks.listAppointmentsForProvider).toHaveBeenCalledTimes(2);
  });

  it("does not present default hours as saved when appointment hours fail to load", async () => {
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.listAssignmentsForProvider.mockResolvedValue([]);
    mocks.listProviderAppointmentRequests.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockRejectedValueOnce(new Error("Availability is temporarily unavailable."));
    mocks.getMyProviderAvailability.mockResolvedValueOnce({ timezone: "America/Denver", weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })) });

    render(<MemoryRouter><ProviderSchedulePage /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "No upcoming appointments" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Set hours/ }));
    expect(await screen.findByText("Your appointment hours could not be loaded.")).toBeTruthy();
    expect(screen.queryByRole("combobox", { name: "Appointment time zone" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Save appointment hours" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("combobox", { name: "Appointment time zone" })).toBeTruthy();
    expect(mocks.getMyProviderAvailability).toHaveBeenCalledTimes(2);
  });
});
