import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminWorkspaceAccessPage from "./AdminWorkspaceAccessPage";

const mocks = vi.hoisted(() => ({
  findAdminWorkspaceAccount: vi.fn(),
  grantPractitionerWorkspace: vi.fn(),
  listAdminWorkspaceAccessEvents: vi.fn(),
}));

vi.mock("@/services/adminUserAccess", () => mocks);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminWorkspaceAccessPage", () => {
  it("looks up an exact account and only grants workspace access after an explicit service choice", async () => {
    mocks.findAdminWorkspaceAccount.mockResolvedValue({ found: true, account: {
      uid: "client-1", email: "person@example.com", displayName: "Taylor", emailVerified: true,
      roles: ["client"], applicationStatus: "none", providerType: "", alreadyHasPractitionerAccess: false,
      disabled: false, isAdmin: false,
    } });
    mocks.grantPractitionerWorkspace.mockResolvedValue({ ok: true, account: {
      uid: "client-1", email: "person@example.com", displayName: "Taylor", roles: ["client", "provider"],
    } });
    render(<MemoryRouter><AdminWorkspaceAccessPage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText("Account email"), { target: { value: "person@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Find account" }));
    expect(await screen.findByText("person@example.com")).toBeTruthy();
    expect(mocks.findAdminWorkspaceAccount).toHaveBeenCalledWith("person@example.com");
    expect(mocks.grantPractitionerWorkspace).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Practitioner service"), { target: { value: "counselor" } });
    fireEvent.click(screen.getByRole("button", { name: "Grant Counselor workspace" }));
    await waitFor(() => expect(mocks.grantPractitionerWorkspace).toHaveBeenCalledWith("person@example.com", "counselor"));
    expect(await screen.findByText("Practitioner workspace access granted")).toBeTruthy();
    expect(screen.getByText(/does not send invitation emails automatically/)).toBeTruthy();
    const emailDraft = screen.getByRole("link", { name: "Open onboarding email draft" });
    const href = decodeURIComponent(emailDraft.getAttribute("href"));
    expect(href).toContain("mailto:person@example.com");
    expect(href).toContain("provider/apply?onboarding=1&type=counselor");
    expect(href).toContain("profile stays private");
  });

  it("adds practitioner workspace to an admin account without removing admin access", async () => {
    mocks.findAdminWorkspaceAccount.mockResolvedValue({ found: true, account: {
      uid: "admin-1", email: "admin@example.com", emailVerified: true, roles: ["admin"], isAdmin: true,
      disabled: false, applicationStatus: "none", alreadyHasPractitionerAccess: false,
    } });
    mocks.grantPractitionerWorkspace.mockResolvedValue({ ok: true, account: {
      uid: "admin-1", email: "admin@example.com", roles: ["admin", "client", "provider"], isAdmin: true,
      alreadyHasPractitionerAccess: true,
    } });
    render(<MemoryRouter><AdminWorkspaceAccessPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Account email"), { target: { value: "admin@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Find account" }));
    expect(await screen.findByLabelText("Practitioner service")).toBeTruthy();
    expect(screen.getByText(/preserving administrator access/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Practitioner service"), { target: { value: "therapist" } });
    fireEvent.click(screen.getByRole("button", { name: "Grant Therapist workspace" }));
    await waitFor(() => expect(mocks.grantPractitionerWorkspace).toHaveBeenCalledWith("admin@example.com", "therapist"));
    expect(await screen.findByText("Practitioner workspace access granted")).toBeTruthy();
  });

  it("loads a collapsed, privacy-limited onboarding status list on demand", async () => {
    mocks.listAdminWorkspaceAccessEvents.mockResolvedValue({ events: [{
      eventId: "grant-1", email: "candidate@example.com", providerType: "bodywork",
      applicationStatus: "pending", assignedAt: "2026-09-26T12:00:00.000Z",
    }] });
    render(<MemoryRouter><AdminWorkspaceAccessPage /></MemoryRouter>);
    expect(mocks.listAdminWorkspaceAccessEvents).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /Recent workspace grants/ }));
    expect(await screen.findByText("candidate@example.com")).toBeTruthy();
    expect(screen.getByText(/Bodywork practitioner · Submitted · awaiting review/)).toBeTruthy();
    expect(mocks.listAdminWorkspaceAccessEvents).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("link", { name: "Prepare email" })).toBeTruthy();
  });
});
