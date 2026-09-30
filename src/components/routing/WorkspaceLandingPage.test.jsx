import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import WorkspaceLandingPage from "./WorkspaceLandingPage";

const mocks = vi.hoisted(() => ({ useAuth: vi.fn(), useSessionIdentity: vi.fn(), useAdminClaim: vi.fn() }));
vi.mock("@/context/AuthContext", () => ({ useAuth: mocks.useAuth }));
vi.mock("@/hooks/useSessionIdentity", () => ({ useSessionIdentity: mocks.useSessionIdentity }));
vi.mock("@/hooks/useAdminClaim", () => ({ useAdminClaim: mocks.useAdminClaim }));

function RouteProbe() {
  const location = useLocation();
  return <output>{location.pathname}</output>;
}

function renderLanding(claims) {
  mocks.useAuth.mockReturnValue({ user: { uid: "scoped-account", isAnonymous: false }, loading: false });
  mocks.useSessionIdentity.mockReturnValue({ mode: "account", userId: "scoped-account", isLoading: false, role: "client", roles: ["client"] });
  mocks.useAdminClaim.mockReturnValue({ adminReady: true, isAdmin: true, claims });
  render(<MemoryRouter initialEntries={["/"]}><WorkspaceLandingPage guestFallback={<p>Guest</p>} /><RouteProbe /></MemoryRouter>);
}

afterEach(() => { cleanup(); localStorage.clear(); vi.clearAllMocks(); });

describe("workspace landing by server-assigned admin role", () => {
  it("opens the delegated admin's assigned practitioner review workspace", async () => {
    renderLanding({ adminRegionalScopes: { "practitioner.review": ["CO"] } });
    expect(await screen.findByText("/admin/practitioners")).toBeTruthy();
  });

  it("opens the full console only for the Alpha Owner", async () => {
    renderLanding({ godAdmin: true });
    expect(await screen.findByText("/admin/console")).toBeTruthy();
  });
});
