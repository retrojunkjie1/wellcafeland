import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import ProviderClientsPage from "./ProviderClientsPage";

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), useSessionIdentity: vi.fn(), listAssignmentsForProvider: vi.fn(), getProviderClientOverview: vi.fn() }));
vi.mock("react-router-dom", async (importOriginal) => ({ ...(await importOriginal()), useNavigate: () => mocks.navigate }));
vi.mock("@/hooks/useSessionIdentity", () => ({ useSessionIdentity: mocks.useSessionIdentity }));
vi.mock("@/services/assignmentService", () => ({ listAssignmentsForProvider: mocks.listAssignmentsForProvider }));
vi.mock("@/services/practitionerRegistry", () => ({ getProviderClientOverview: mocks.getProviderClientOverview }));
vi.mock("@/components/navigation/PageHeader", () => ({ default: ({ title, subtitle }) => <header><h1>{title}</h1><p>{subtitle}</p></header> }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("ProviderClientsPage", () => {
  it("waits for account identity before deciding whether an admin can open client connections", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isLoading: true, isProvider: false, isAdmin: false, providerId: null, userId: "admin-1" });
    const view = render(<ProviderClientsPage />);

    expect(screen.getByRole("status").textContent).toMatch(/Checking your workspace/);
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(mocks.listAssignmentsForProvider).not.toHaveBeenCalled();

    mocks.useSessionIdentity.mockReturnValue({ isLoading: false, isProvider: false, isAdmin: true, providerId: null, userId: "admin-1" });
    mocks.listAssignmentsForProvider.mockResolvedValue([]);
    view.rerender(<ProviderClientsPage />);

    expect(await screen.findByRole("heading", { name: "Your connections will appear here" })).toBeTruthy();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("distinguishes an unavailable sharing check from an intentional private-by-default choice", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1" });
    mocks.listAssignmentsForProvider.mockResolvedValue([{ id: "assignment-1", clientId: "client-a", status: "active" }]);
    mocks.getProviderClientOverview.mockRejectedValue(new Error("service unavailable"));

    render(<ProviderClientsPage />);

    expect(await screen.findByRole("heading", { name: "Client 1" })).toBeInTheDocument();
    expect(screen.getByText(/Sharing details couldn’t be confirmed/i)).toBeInTheDocument();
    expect(screen.queryByText(/No check-in information shared\. Private by default\./i)).not.toBeInTheDocument();
  });

  it("hides the previous practitioner's client list while another account is loading", async () => {
    let resolveNextAssignments;
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1" });
    mocks.listAssignmentsForProvider.mockImplementation((id) => {
      if (id === "provider-1") return Promise.resolve([{ id: "assignment-old", clientId: "client-old", relationshipType: "Prior connection", status: "active" }]);
      return new Promise((resolve) => { resolveNextAssignments = resolve; });
    });
    mocks.getProviderClientOverview.mockResolvedValue({ shared: false, checkins: [], practiceProgress: [] });

    const view = render(<ProviderClientsPage />);
    expect(await screen.findByText("Prior connection")).toBeInTheDocument();

    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-2", userId: "provider-2" });
    view.rerender(<ProviderClientsPage />);
    expect(screen.queryByText("Prior connection")).not.toBeInTheDocument();
    expect(screen.getByText("Loading your connections…")).toBeInTheDocument();

    resolveNextAssignments([]);
    expect(await screen.findByRole("heading", { name: "Your connections will appear here" })).toBeInTheDocument();
  });
});
