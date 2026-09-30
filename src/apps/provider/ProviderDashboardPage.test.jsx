import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import ProviderDashboardPage from "./ProviderDashboardPage";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  useSessionIdentity: vi.fn(),
  listAssignmentsForProvider: vi.fn(),
  listAppointmentsForProvider: vi.fn(),
  getMyProviderAvailability: vi.fn(),
  getProviderClientOverview: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => ({ ...(await importOriginal()), useNavigate: () => mocks.navigate }));
vi.mock("@/hooks/useSessionIdentity", () => ({ useSessionIdentity: mocks.useSessionIdentity }));
vi.mock("@/services/assignmentService", () => ({ listAssignmentsForProvider: mocks.listAssignmentsForProvider }));
vi.mock("@/services/appointmentService", () => ({ listAppointmentsForProvider: mocks.listAppointmentsForProvider, getMyProviderAvailability: mocks.getMyProviderAvailability }));
vi.mock("@/services/practitionerRegistry", () => ({ getProviderClientOverview: mocks.getProviderClientOverview }));
vi.mock("@/components/navigation/PageHeader", () => ({ default: ({ title }) => <header>{title}</header> }));
vi.mock("./components/ConnectionRequestsPanel", () => ({ default: () => <section>Connection requests</section> }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("ProviderDashboardPage", () => {
  it("waits for account identity before deciding whether an admin can open the practitioner workspace", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isLoading: true, isProvider: false, isAdmin: false, providerId: null, userId: "admin-1" });
    const view = render(<ProviderDashboardPage />);

    expect(screen.getByRole("status").textContent).toMatch(/Checking your workspace/);
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(mocks.listAssignmentsForProvider).not.toHaveBeenCalled();

    mocks.useSessionIdentity.mockReturnValue({ isLoading: false, isProvider: false, isAdmin: true, providerId: null, userId: "admin-1" });
    mocks.listAssignmentsForProvider.mockResolvedValue([]);
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver" });
    view.rerender(<ProviderDashboardPage />);

    expect(await screen.findByRole("heading", { name: "Your connected people" })).toBeTruthy();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("shows upcoming appointments in the practitioner's configured time zone", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1" });
    mocks.listAssignmentsForProvider.mockResolvedValue([]);
    mocks.listAppointmentsForProvider.mockResolvedValue([{ id: "appointment-1", startAt: "2026-09-30T16:00:00.000Z", status: "confirmed" }]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver" });

    render(<ProviderDashboardPage />);

    expect(await screen.findByText(/Next two weeks · times in America\/Denver/)).toBeTruthy();
    expect(screen.getByText(/10:00 AM MDT · confirmed/)).toBeTruthy();
  });

  it("surfaces voluntary practice updates without exposing their private note on the dashboard", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1" });
    mocks.listAssignmentsForProvider.mockResolvedValue([
      { id: "assignment-1", clientId: "client-a", status: "active" },
    ]);
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver" });
    mocks.getProviderClientOverview.mockResolvedValue({
      shared: false,
      checkins: [],
      practiceProgress: [{
        id: "update-1",
        toolId: "grounding",
        outcome: "tried",
        note: "A private detail the client chose to share only on their detail page.",
        submittedAt: "2026-09-26T12:00:00.000Z",
      }],
    });

    render(<ProviderDashboardPage />);

    const updates = await screen.findByRole("region", { name: "Updates clients chose to share" });
    expect(within(updates).getByText("Client 1")).toBeTruthy();
    expect(within(updates).getByText(/Choose an Anchor/)).toBeTruthy();
    expect(within(updates).getByText(/Tried it/)).toBeTruthy();
    expect(screen.queryByText(/A private detail the client chose to share/)).toBeNull();

    fireEvent.click(within(updates).getByRole("button", { name: "Review client" }));
    expect(mocks.navigate).toHaveBeenCalledWith("/provider/clients/client-a");
  });

  it("does not present a sharing-service failure as the client’s privacy choice", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1" });
    mocks.listAssignmentsForProvider.mockResolvedValue([{ id: "assignment-1", clientId: "client-a", status: "active" }]);
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver" });
    mocks.getProviderClientOverview.mockRejectedValue(new Error("service unavailable"));

    render(<ProviderDashboardPage />);

    expect(await screen.findByText(/Sharing details couldn’t be confirmed/i)).toBeTruthy();
    expect(screen.queryByText(/No check-in details shared\. Private by default\./i)).toBeNull();
  });

  it("does not show a failed appointment lookup as an empty schedule and offers a working retry", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1" });
    mocks.listAssignmentsForProvider.mockResolvedValue([]);
    mocks.listAppointmentsForProvider
      .mockRejectedValueOnce(new Error("temporary outage"))
      .mockResolvedValueOnce([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver" });

    render(<ProviderDashboardPage />);

    const retry = await screen.findByRole("button", { name: "Try again" });
    expect(screen.queryByText(/No appointments in the next two weeks/i)).toBeNull();
    fireEvent.click(retry);

    expect(await screen.findByText(/No appointments in the next two weeks/i)).toBeTruthy();
    expect(mocks.listAppointmentsForProvider).toHaveBeenCalledTimes(2);
  });

  it("labels appointment times as device-local when saved provider time-zone settings cannot load", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1" });
    mocks.listAssignmentsForProvider.mockResolvedValue([]);
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockRejectedValue(new Error("temporary outage"));

    render(<ProviderDashboardPage />);

    expect(await screen.findByText(/your local time \(/)).toBeTruthy();
  });

  it("ignores a late client-sharing response from the previous practitioner account", async () => {
    let resolveOldOverview;
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1" });
    mocks.listAssignmentsForProvider.mockImplementation((id) => Promise.resolve([{ id: `assignment-${id}`, clientId: id === "provider-1" ? "client-old" : "client-current", status: "active" }]));
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver" });
    mocks.getProviderClientOverview.mockImplementation((clientId) => {
      if (clientId === "client-old") return new Promise((resolve) => { resolveOldOverview = resolve; });
      return Promise.resolve({ shared: true, totalRecentCheckins: 1, checkins: [{ mood: "hopeful" }], practiceProgress: [] });
    });

    const view = render(<ProviderDashboardPage />);
    await waitFor(() => expect(mocks.getProviderClientOverview).toHaveBeenCalledWith("client-old"));
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-2", userId: "provider-2" });
    view.rerender(<ProviderDashboardPage />);

    expect(await screen.findByText("Mood: hopeful")).toBeInTheDocument();
    resolveOldOverview({ shared: true, totalRecentCheckins: 1, checkins: [{ mood: "from previous account" }], practiceProgress: [] });
    await Promise.resolve();
    await Promise.resolve();

    expect(screen.getByText("Mood: hopeful")).toBeInTheDocument();
    expect(screen.queryByText("Mood: from previous account")).not.toBeInTheDocument();
  });
});
