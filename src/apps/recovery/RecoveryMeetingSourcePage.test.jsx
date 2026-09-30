import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RecoveryMeetingSourcePage from "./RecoveryMeetingSourcePage";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  listMyRecoveryMeetingSources: vi.fn(),
  submitRecoveryMeetingSource: vi.fn(),
}));
vi.mock("@/context/AuthContext", () => ({ useAuth: mocks.useAuth }));
vi.mock("@/services/recoveryMeetingSources", () => ({
  listMyRecoveryMeetingSources: mocks.listMyRecoveryMeetingSources,
  submitRecoveryMeetingSource: mocks.submitRecoveryMeetingSource,
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("RecoveryMeetingSourcePage", () => {
  it("lets a signed-in service contact submit a permission request and shows its non-public status", async () => {
    mocks.useAuth.mockReturnValue({ user: { uid: "service-user", isAnonymous: false }, loading: false });
    mocks.listMyRecoveryMeetingSources.mockResolvedValue({ applications: [] });
    mocks.submitRecoveryMeetingSource.mockResolvedValue({ applicationId: "application-1" });
    render(<MemoryRouter><RecoveryMeetingSourcePage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/service entity or group/i), { target: { value: "North County Intergroup" } });
    fireEvent.change(screen.getByLabelText(/contact email/i), { target: { value: "service@example.org" } });
    fireEvent.change(screen.getByLabelText(/how does your group share its meeting list/i), { target: { value: "meeting-guide-json" } });
    fireEvent.change(screen.getByLabelText(/coverage area/i), { target: { value: "North County" } });
    fireEvent.change(screen.getByLabelText(/link to the group’s meeting list/i), { target: { value: "https://meetings.example.org/feed.json" } });
    fireEvent.change(screen.getByLabelText(/how has your service group authorized/i), { target: { value: "The intergroup board approved public meeting-list sharing." } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /send for review/i }));

    await waitFor(() => expect(mocks.submitRecoveryMeetingSource).toHaveBeenCalledWith(expect.objectContaining({
      organization: "North County Intergroup", feedUrl: "https://meetings.example.org/feed.json", authorizedToShare: true,
    })));
    expect(await screen.findByText(/request received. reference application-1/i)).toBeInTheDocument();
    expect(screen.getByText(/sending this request does not publish your meeting list/i)).toBeInTheDocument();
    expect(mocks.listMyRecoveryMeetingSources).toHaveBeenCalled();
  });

  it("does not show a submission form to guests and directs them to sign in", () => {
    mocks.useAuth.mockReturnValue({ user: null, loading: false });
    render(<MemoryRouter><RecoveryMeetingSourcePage /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: /sign in to send a source request/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/link to the group’s meeting list/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
  });

  it("allows a service group to ask for help when it does not know the technical feed type", async () => {
    mocks.useAuth.mockReturnValue({ user: { uid: "service-user", isAnonymous: false }, loading: false });
    mocks.listMyRecoveryMeetingSources.mockResolvedValue({ applications: [] });
    mocks.submitRecoveryMeetingSource.mockResolvedValue({ applicationId: "application-2" });
    render(<MemoryRouter><RecoveryMeetingSourcePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/service entity or group/i), { target: { value: "North County Intergroup" } });
    fireEvent.change(screen.getByLabelText(/contact email/i), { target: { value: "service@example.org" } });
    fireEvent.change(screen.getByLabelText(/coverage area/i), { target: { value: "North County" } });
    fireEvent.change(screen.getByLabelText(/how has your service group authorized/i), { target: { value: "The intergroup board approved sharing the public meeting list." } });
    fireEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByLabelText(/link to the group’s meeting list/i)).not.toBeRequired();
    fireEvent.click(screen.getByRole("button", { name: /send for review/i }));
    await waitFor(() => expect(mocks.submitRecoveryMeetingSource).toHaveBeenCalledWith(expect.objectContaining({ sourceType: "unknown", feedUrl: "" })));
  });
});
