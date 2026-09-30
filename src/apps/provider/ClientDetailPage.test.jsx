import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import ClientDetailPage from "./ClientDetailPage";

const mocks = vi.hoisted(() => ({
  useSessionIdentity: vi.fn(),
  listAssignmentsForProvider: vi.fn(),
  listAppointmentsForProviderClient: vi.fn(),
  getMyProviderAvailability: vi.fn(),
  getProviderClientOverview: vi.fn(),
  navigate: vi.fn(),
  params: { clientId: "client-1" },
}));

vi.mock("@/hooks/useSessionIdentity", () => ({ useSessionIdentity: mocks.useSessionIdentity }));
vi.mock("@/services/assignmentService", () => ({ listAssignmentsForProvider: mocks.listAssignmentsForProvider }));
vi.mock("@/services/appointmentService", () => ({ listAppointmentsForProviderClient: mocks.listAppointmentsForProviderClient, getMyProviderAvailability: mocks.getMyProviderAvailability }));
vi.mock("@/services/practitionerRegistry", () => ({
  getProviderClientOverview: mocks.getProviderClientOverview,
  sendPractitionerSupportTool: vi.fn(),
}));
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>, useNavigate: () => mocks.navigate, useParams: () => mocks.params };
});
vi.mock("@/components/navigation/PageHeader", () => ({ default: ({ title, subtitle }) => <header><h1>{title}</h1><p>{subtitle}</p></header> }));
vi.mock("./components/ClientSharedSupportPanel", () => ({ default: ({ clientId }) => <section>Shared check-in details and support tools · {clientId}</section> }));

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => { resolve = resolvePromise; reject = rejectPromise; });
  return { promise, resolve, reject };
}

afterEach(() => { cleanup(); vi.clearAllMocks(); mocks.params.clientId = "client-1"; });

describe("ClientDetailPage", () => {
  it("loads an active connection through the authorized service and shows consent plus appointments", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1", isLoading: false });
    mocks.listAssignmentsForProvider.mockResolvedValue([{ id: "assignment-1", clientId: "client-1", status: "active" }]);
    mocks.getProviderClientOverview.mockResolvedValue({ shared: true, scopes: { recoveryProgress: true, wellnessPatterns: false, writtenReflections: false, assessments: false }, checkins: [], totalRecentCheckins: 1 });
    mocks.listAppointmentsForProviderClient.mockResolvedValue([{ id: "appointment-1", startAt: "2026-09-30T16:00:00.000Z", status: "confirmed" }]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver" });

    render(<ClientDetailPage />);

    expect(await screen.findByText("Your connected person")).toBeTruthy();
    expect(screen.getByText("Recovery progress: shared")).toBeTruthy();
    expect(screen.getByText("Wellness patterns: private")).toBeTruthy();
    expect(screen.getByText(/Shared check-in details and support tools · client-1/)).toBeTruthy();
    expect(screen.getByText(/confirmed/)).toBeTruthy();
    expect(screen.getByText(/Only sessions attached to this connection · times in America\/Denver/)).toBeTruthy();
    expect(screen.getByText(/10:00 AM MDT/)).toBeTruthy();
    expect(mocks.listAssignmentsForProvider).toHaveBeenCalledWith("provider-1");
  });

  it("does not fetch private records for a person outside the practitioner's active connections", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1", isLoading: false });
    mocks.listAssignmentsForProvider.mockResolvedValue([{ id: "assignment-2", clientId: "someone-else", status: "active" }]);

    render(<ClientDetailPage />);

    expect(await screen.findByText("This person is not in your active connections. Their private information is unavailable.")).toBeTruthy();
    expect(mocks.getProviderClientOverview).not.toHaveBeenCalled();
    expect(mocks.listAppointmentsForProviderClient).not.toHaveBeenCalled();
    expect(screen.queryByText("Risk Assessment")).toBeNull();
  });

  it("makes the administrator sharing pause visible while keeping connection support available", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1", isLoading: false });
    mocks.listAssignmentsForProvider.mockResolvedValue([{ id: "assignment-1", clientId: "client-1", status: "active" }]);
    mocks.getProviderClientOverview.mockResolvedValue({
      shared: false, sharingPaused: true, sharingStatusUnknown: false, scopes: {}, checkins: [], assessments: [], practiceProgress: [],
      message: "Practitioner access to client-shared information is temporarily paused.",
    });
    mocks.listAppointmentsForProviderClient.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver" });

    render(<ClientDetailPage />);

    expect(await screen.findByText("Client sharing is temporarily paused")).toBeInTheDocument();
    expect(screen.getByText("Recovery progress: paused")).toBeInTheDocument();
    expect(screen.getByText(/Shared check-in details and support tools · client-1/)).toBeInTheDocument();
  });

  it("hides the previous account's client while switching identities and ignores its late consent response", async () => {
    const firstAssignments = deferred();
    const firstOverview = deferred();
    mocks.params.clientId = "client-a";
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-a", userId: "provider-a", isLoading: false });
    mocks.listAssignmentsForProvider.mockImplementation((providerId) => providerId === "provider-a"
      ? firstAssignments.promise
      : Promise.resolve([{ id: "assignment-b", clientId: "client-b", status: "active" }]));
    mocks.getProviderClientOverview.mockImplementation((clientId) => clientId === "client-a"
      ? firstOverview.promise
      : Promise.resolve({ shared: false, scopes: { recoveryProgress: false }, checkins: [], totalRecentCheckins: 0 }));
    mocks.listAppointmentsForProviderClient.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver" });

    const { rerender } = render(<ClientDetailPage />);
    await waitFor(() => expect(mocks.listAssignmentsForProvider).toHaveBeenCalledWith("provider-a"));
    firstAssignments.resolve([{ id: "assignment-a", clientId: "client-a", status: "active" }]);
    await waitFor(() => expect(mocks.getProviderClientOverview).toHaveBeenCalledWith("client-a"));

    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-b", userId: "provider-b", isLoading: false });
    mocks.params.clientId = "client-b";
    rerender(<ClientDetailPage />);

    expect(await screen.findByText("Recovery progress: private")).toBeTruthy();
    expect(screen.getByText(/Shared check-in details and support tools · client-b/)).toBeTruthy();

    firstOverview.resolve({ shared: true, scopes: { recoveryProgress: true }, checkins: [{ supportNeeded: "private detail from account A" }], totalRecentCheckins: 1 });
    await waitFor(() => expect(mocks.getProviderClientOverview).toHaveBeenCalledWith("client-b"));
    expect(screen.getByText("Recovery progress: private")).toBeTruthy();
    expect(screen.queryByText(/private detail from account A/)).toBeNull();
  });
});
