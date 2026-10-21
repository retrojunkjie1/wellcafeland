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
  listProviderCareHandoffs: vi.fn(),
  listProviderVisitPreparations: vi.fn(),
  callAgent: vi.fn(),
  getAppCheckToken: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => ({ ...(await importOriginal()), useNavigate: () => mocks.navigate, useLocation: () => ({ hash: "" }) }));
vi.mock("@/hooks/useSessionIdentity", () => ({ useSessionIdentity: mocks.useSessionIdentity }));
vi.mock("@/services/assignmentService", () => ({ listAssignmentsForProvider: mocks.listAssignmentsForProvider }));
vi.mock("@/services/appointmentService", () => ({ listAppointmentsForProvider: mocks.listAppointmentsForProvider, getMyProviderAvailability: mocks.getMyProviderAvailability }));
vi.mock("@/services/practitionerRegistry", () => ({ getProviderClientOverview: mocks.getProviderClientOverview, listProviderCareHandoffs: mocks.listProviderCareHandoffs, listProviderVisitPreparations: mocks.listProviderVisitPreparations }));
vi.mock("@/ai/agents/agentClient", () => ({ callAgent: mocks.callAgent }));
vi.mock("@/firebase/appCheck", () => ({ getAppCheckToken: mocks.getAppCheckToken }));
vi.mock("@/components/navigation/PageHeader", () => ({ default: ({ title }) => <header>{title}</header> }));
vi.mock("./components/ConnectionRequestsPanel", () => ({ default: () => <section>Connection requests</section> }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("ProviderDashboardPage", () => {
  it("prepares a generic consent-first pathway aid without sending client details", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1", providerType: "therapist" });
    mocks.listAssignmentsForProvider.mockResolvedValue([]);
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver" });
    mocks.callAgent.mockResolvedValue({ result: { openingQuestion: "Would you like to talk about care options?", nextStep: "Offer a few options and coordinate only with consent.", preferenceCheck: "Would you prefer to explore this now or later?" } });

    render(<ProviderDashboardPage />);
    const prepareButton = await screen.findByRole("button", { name: "Prepare conversation" });
    expect(prepareButton).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Peer recovery" }));
    fireEvent.click(prepareButton);

    await waitFor(() => expect(mocks.callAgent).toHaveBeenCalledWith("gatekeeper", { pathway: "peer-recovery-support" }));
    expect(await screen.findByText("Would you like to talk about care options?")).toBeTruthy();
  });

  it("waits for account identity before deciding whether an admin can open the practitioner workspace", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isLoading: true, isProvider: false, isAdmin: false, providerId: null, userId: "admin-1" });
    const view = render(<ProviderDashboardPage />);

    expect(screen.getByRole("status").textContent).toMatch(/Checking your workspace/);
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(mocks.listAssignmentsForProvider).not.toHaveBeenCalled();

    mocks.useSessionIdentity.mockReturnValue({ isLoading: false, isProvider: false, isAdmin: true, providerId: null, userId: "admin-1" });
    mocks.listAssignmentsForProvider.mockResolvedValue([]);
    mocks.listAppointmentsForProvider.mockResolvedValue([{ id: "appointment-1", startAt: "2026-09-30T16:00:00.000Z", status: "confirmed" }]);
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

    expect(await screen.findByText(/times in America\/Denver/)).toBeTruthy();
    expect(screen.getByText(/10:00 AM MDT · confirmed/)).toBeTruthy();
  });

  it("shows only consented practical-help requests in the case-manager queue", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "case-manager-1", userId: "case-manager-1", providerType: "case-manager" });
    mocks.listAssignmentsForProvider.mockResolvedValue([{ id: "assignment-1", clientId: "client-a", status: "active" }]);
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver" });
    mocks.getProviderClientOverview.mockResolvedValue({ shared: false, checkins: [], practiceProgress: [] });
    mocks.listProviderCareHandoffs.mockResolvedValue({ handoffs: [{
      id: "request-1", status: "requested", needType: "housing", goal: "Help me find a place to call.",
      context: "This field was not shared and must not be shown.", sharedFields: ["needType", "goal"], updatedAt: "2026-10-12T12:00:00.000Z",
    }] });

    render(<ProviderDashboardPage />);

    const queue = await screen.findByRole("region", { name: "Client-authorized support requests" });
    expect(within(queue).getByText("Help me find a place to call.")).toBeTruthy();
    expect(within(queue).getByText(/Needs response/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Requests to respond to: 1/ })).toHaveAttribute("href", "#shared-updates-title");
    expect(screen.queryByText("This field was not shared and must not be shown.")).toBeNull();
    expect(screen.queryByRole("button", { name: "Messages" })).toBeNull();
    fireEvent.click(within(queue).getByRole("button", { name: "Review next step" }));
    expect(mocks.navigate).toHaveBeenCalledWith("/provider/clients/client-a");
  });

  it("shows patient-selected visit preparation in the primary-care dashboard", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "pcp-1", userId: "pcp-1", providerType: "primary-care" });
    mocks.listAssignmentsForProvider.mockResolvedValue([{ id: "assignment-1", clientId: "client-a", status: "active" }]);
    mocks.listAppointmentsForProvider.mockResolvedValue([{ id: "visit-1", startAt: "2026-10-14T16:00:00.000Z", status: "confirmed" }]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver" });
    mocks.getProviderClientOverview.mockResolvedValue({ shared: false, checkins: [], practiceProgress: [] });
    mocks.listProviderVisitPreparations.mockResolvedValue({ preparations: [{
      id: "prep-1", appointmentId: "visit-1", visitPurpose: "Discuss sleep changes", priorities: ["Ask about fatigue"], questions: ["What should I track?"], accessPreferences: ["writtenInstructions"],
      sharedFields: ["visitPurpose", "priorities", "questions"], updatedAt: "2026-10-12T12:00:00.000Z",
    }] });

    render(<ProviderDashboardPage />);

    const queue = await screen.findByRole("region", { name: "Patient-selected visit preparation" });
    expect(within(queue).getByText(/Visit preparation/)).toBeTruthy();
    expect(within(queue).getByText(/Purpose: Discuss sleep changes/)).toBeTruthy();
    expect(within(queue).getByText(/Focus: Ask about fatigue/)).toBeTruthy();
    expect(within(queue).getByText(/Question: What should I track/)).toBeTruthy();
    expect(within(queue).getByText(/Awaiting your acknowledgement/)).toBeTruthy();
    expect(within(queue).getByText(/For the upcoming visit on Oct 14/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Prep to review: 1/ })).toHaveAttribute("href", "#shared-updates-title");
    expect(within(queue).getByRole("button", { name: "Review visit preparation" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Messages" })).toBeNull();
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
    expect(within(updates).getByText(/Reconnect with the room/)).toBeTruthy();
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

  it("keeps appointments visible when the connected-client lookup fails", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1" });
    mocks.listAssignmentsForProvider.mockRejectedValue(new Error("temporary client-list outage"));
    mocks.listAppointmentsForProvider.mockResolvedValue([{ id: "appointment-1", startAt: "2026-09-30T16:00:00.000Z", status: "confirmed" }]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver" });

    render(<ProviderDashboardPage />);

    expect(await screen.findByText(/10:00 AM MDT · confirmed/)).toBeInTheDocument();
    expect(screen.getByText(/connected people couldn’t be checked/i)).toBeInTheDocument();
    expect(screen.queryByText(/No appointments in the next two weeks/i)).toBeNull();
  });

  it("does not tell a signed-in practitioner to sign in again when protected data calls fail authentication", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1" });
    mocks.listAssignmentsForProvider.mockRejectedValueOnce(
      Object.assign(new Error("Unauthenticated"), { code: "functions/unauthenticated" }),
    );
    mocks.listAppointmentsForProvider.mockRejectedValue(new Error("request denied"));
    mocks.getMyProviderAvailability.mockRejectedValue(new Error("request denied"));

    render(<ProviderDashboardPage />);

    expect(await screen.findByText(/Your account is signed in, but we couldn’t load some practice information/i)).toBeInTheDocument();
    expect(screen.queryByText(/App Check|secure app verification|verification setup/i)).toBeNull();
    expect(screen.queryByRole("button", { name: "Reload WellnessCafe" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Sign in again" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
    expect(screen.getByText("Appointments aren’t available right now.")).toBeInTheDocument();
    expect(screen.getByText("Shared updates aren’t available right now.")).toBeInTheDocument();
    expect(screen.getByText("Your connected clients aren’t available right now.")).toBeInTheDocument();
  });

  it("checks for a browser token once, then retries dashboard reads without exposing the token", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1" });
    mocks.listAssignmentsForProvider
      .mockRejectedValueOnce(Object.assign(new Error("Unauthenticated"), { code: "functions/unauthenticated" }))
      .mockResolvedValueOnce([]);
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver" });
    mocks.getAppCheckToken.mockResolvedValue("private-app-check-token");

    render(<ProviderDashboardPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Check connection" }));

    await waitFor(() => expect(mocks.getAppCheckToken).toHaveBeenCalledWith({ forceRefresh: true }));
    await waitFor(() => expect(mocks.listAssignmentsForProvider).toHaveBeenCalledTimes(2));
    expect(await screen.findByText(/No appointments in the next two weeks/i)).toBeInTheDocument();
    expect(screen.queryByText("private-app-check-token")).toBeNull();
  });

  it("stops after one browser token check when token acquisition fails", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1" });
    mocks.listAssignmentsForProvider.mockRejectedValue(Object.assign(new Error("Unauthenticated"), { code: "functions/unauthenticated" }));
    mocks.listAppointmentsForProvider.mockResolvedValue([]);
    mocks.getMyProviderAvailability.mockResolvedValue({ timezone: "America/Denver" });
    mocks.getAppCheckToken.mockRejectedValue(new Error("token unavailable"));

    render(<ProviderDashboardPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Check connection" }));

    expect(await screen.findByText(/couldn’t check this browser connection/i)).toBeInTheDocument();
    expect(mocks.getAppCheckToken).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Check connection" })).toBeNull();
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
