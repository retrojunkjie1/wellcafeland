import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import AppTopBar from "./AppTopBar";

const mocks = vi.hoisted(() => ({ useSessionIdentity: vi.fn(), useAdminClaim: vi.fn(), trackSupportAction: vi.fn() }));

vi.mock("@/hooks/useSessionIdentity", () => ({ useSessionIdentity: mocks.useSessionIdentity }));
vi.mock("@/hooks/useAdminClaim", () => ({ useAdminClaim: mocks.useAdminClaim }));
vi.mock("@/telemetry/telemetry", () => ({ trackSupportAction: mocks.trackSupportAction }));
vi.mock("@/stores/useOSStore", () => ({ useOSStore: (selector) => selector({ settings: { themeMode: "deep-night" }, setThemeMode: vi.fn() }) }));

afterEach(() => { cleanup(); localStorage.clear(); vi.clearAllMocks(); });

function openMenu(identity, admin = false, path = "/", user = null, claims = {}) {
  mocks.useSessionIdentity.mockReturnValue({ isLoading: false, isProvider: false, isAdmin: false, providerType: null, ...identity });
  mocks.useAdminClaim.mockReturnValue({ adminReady: true, isAdmin: admin, claims });
  const onLogout = vi.fn().mockResolvedValue(undefined);
  render(<MemoryRouter initialEntries={[path]}><AppTopBar isAuthenticated={Boolean(user)} user={user} onLogout={onLogout} /><LocationProbe /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
  return { onLogout };
}

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="Current route">{location.pathname}</output>;
}

describe("AppTopBar role-separated navigation", () => {
  it("keeps the practitioner dashboard out of the client menu", () => {
    openMenu({});
    expect(screen.queryByText("Practitioner workspace")).toBeNull();
    expect(screen.getByText("Apply to offer support")).toBeTruthy();
    expect(screen.getByText("Daily Practice")).toBeTruthy();
    fireEvent.click(screen.getByText("More in client space"));
    expect(screen.getByRole("link", { name: "My sessions" }).getAttribute("href")).toBe("/my-sessions");
  });

  it("shows separate dashboards and a switch for a dual-workspace account", () => {
    localStorage.setItem("wc_active_workspace:dual-user", "practitioner");
    openMenu({ isProvider: true, providerType: "massage", mode: "account", userId: "dual-user", roles: ["client", "provider"] });
    expect(screen.getByText("Workspace overview")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Client space/ })).toBeTruthy();
    expect(screen.getByText("massage")).toBeTruthy();
    expect(screen.queryByText("Daily Practice")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Client space/ }));
    expect(screen.getByLabelText("Current route")).toHaveTextContent("/home");
    expect(mocks.trackSupportAction).toHaveBeenCalledWith("account", "workspace_changed", "", "client");
  });

  it("keeps single-role practitioners in their own navigation without a client switch", () => {
    openMenu({ isProvider: true, providerType: "massage", roles: ["provider"] });
    expect(screen.getByText("Workspace overview")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Client space" })).toBeNull();
    expect(screen.queryByText("Daily Practice")).toBeNull();
  });

  it("follows a direct practitioner URL even when the remembered space was client", () => {
    localStorage.setItem("wc_active_workspace:dual-user", "client");
    openMenu({ isProvider: true, mode: "account", userId: "dual-user", roles: ["client", "provider"] }, false, "/provider/schedule");
    expect(screen.getByText("Practitioner space")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Schedule" }).getAttribute("href")).toBe("/provider/schedule");
    expect(localStorage.getItem("wc_active_workspace:dual-user")).toBe("practitioner");
  });

  it("keeps the God-Eye link available to administrators", () => {
    openMenu({}, true, "/", null, { godAdmin: true });
    expect(screen.getByText("God-Eye admin console")).toBeTruthy();
  });

  it("makes guest status and sign-in path visible from the account control", () => {
    openMenu({ mode: "guest" });
    fireEvent.click(screen.getByRole("button", { name: "Account: Guest session" }));
    expect(screen.getByText("Browsing without an account")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Sign in to an account/ })).toBeTruthy();
  });

  it("ends an anonymous guest session before opening sign-in", async () => {
    const { onLogout } = openMenu({ mode: "guest" }, false, "/", { uid: "guest", isAnonymous: true });
    fireEvent.click(screen.getByRole("button", { name: "Account: Guest session" }));
    fireEvent.click(screen.getByRole("button", { name: /Sign in to an account/ }));
    expect(onLogout).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.getByLabelText("Current route")).toHaveTextContent("/login"));
  });

  it("shows the signed-in email, assigned roles, workspace switch and sign-out", () => {
    openMenu({ mode: "account", role: "provider", isProvider: true, roles: ["client", "provider"] }, false, "/", { email: "practitioner@example.com", isAnonymous: false });
    fireEvent.click(screen.getByRole("button", { name: "Close navigation menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Account: practitioner@example.com" }));
    expect(screen.getAllByText("practitioner@example.com")).toHaveLength(2);
    expect(screen.getByText("Practitioner · Client")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Client space/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Practitioner space/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Sign out/ })).toBeTruthy();
  });

  it("lets an administrator with practitioner access switch workspaces on the same account", () => {
    openMenu({ mode: "account", role: "provider", isProvider: true, isAdmin: true, roles: ["admin", "provider"] }, true, "/admin/console", { email: "admin@example.com", isAnonymous: false });
    fireEvent.click(screen.getByRole("button", { name: "Close navigation menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Account: admin@example.com" }));
    expect(screen.getByText("Administrator · Practitioner")).toBeTruthy();
    expect(screen.getByRole("button", { name: /God-Eye admin · Current/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Practitioner space/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Practitioner space/ }));
    expect(screen.getByLabelText("Current route")).toHaveTextContent("/provider/dashboard");
  });

  it("offers the admin workspace from a server-scoped assignment when profile claims are client-only", () => {
    openMenu({ mode: "account", userId: "scoped-reviewer", role: "client", roles: ["client"] }, true, "/home", { email: "reviewer@example.com", isAnonymous: false }, { adminRegionalScopes: { "practitioner.review": ["CO"] } });
    fireEvent.click(screen.getByRole("button", { name: "Close navigation menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Account: reviewer@example.com" }));
    expect(screen.getByText("Administrator · Client")).toBeTruthy();
    expect(screen.getByRole("button", { name: /God-Eye admin/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /God-Eye admin/ }));
    expect(screen.getByLabelText("Current route")).toHaveTextContent("/admin/practitioners");
  });

  it("keeps client navigation available while an admin reviews a client-facing route", () => {
    openMenu({ isAdmin: true, roles: ["admin"] }, true, "/tools/meditation", null, { godAdmin: true });
    expect(screen.getByText("Client experience")).toBeTruthy();
    expect(screen.getByRole("link", { name: "My home" }).getAttribute("href")).toBe("/home");
    expect(screen.getByRole("link", { name: "Daily Practice" }).getAttribute("href")).toBe("/tools");
    expect(screen.getByRole("link", { name: "God-Eye admin console" }).getAttribute("href")).toBe("/admin/console");
    expect(screen.queryByRole("button", { name: "Client space" })).toBeNull();
    expect(screen.queryByText("Workspace overview")).toBeNull();
  });
});
