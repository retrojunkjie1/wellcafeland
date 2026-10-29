import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PrivacySettingsPage from "./PrivacySettingsPage";

const mocks = vi.hoisted(() => ({ exportMyWellnessData: vi.fn(), deleteMyCheckIns: vi.fn(), callAgent: vi.fn() }));
vi.mock("@/services/practitionerRegistry", () => mocks);
vi.mock("@/ai/agents/agentClient", () => ({ callAgent: mocks.callAgent, default: mocks.callAgent }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe("PrivacySettingsPage", () => {
  it("shows the working data, sharing, and memory controls without inactive privacy toggles", () => {
    render(<MemoryRouter><PrivacySettingsPage /></MemoryRouter>);
    expect(screen.getByRole("button", { name: /Download my data/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Review sharing/ }).getAttribute("href")).toBe("/settings/practitioner-sharing");
    expect(screen.getByRole("link", { name: /Open Personal support/ }).getAttribute("href")).toBe("/settings/wellness");
    expect(screen.getByText(/automatic timed deletion is not available yet/i)).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Choose a privacy question" })).toHaveValue("sharing");
    expect(screen.queryByText(/Require PIN for provider view/i)).toBeNull();
    expect(screen.getByRole("button", { name: /Delete my check-ins/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Explain this" })).toBeInTheDocument();
    expect(screen.getByText(/Only your selected topic is sent; no account records are included/i)).toBeInTheDocument();
  });

  it("sends Steward only the selected privacy topic and renders its explanation", async () => {
    mocks.callAgent.mockResolvedValue({ result: { answer: "Your check-ins are not shared just because you have an account." } });
    render(<MemoryRouter><PrivacySettingsPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Choose a privacy question"), { target: { value: "sharing" } });
    fireEvent.click(screen.getByRole("button", { name: "Explain this" }));

    expect(await screen.findByText(/Your check-ins are not shared just because you have an account/)).toBeInTheDocument();
    expect(mocks.callAgent).toHaveBeenCalledWith("steward", { topicId: "sharing" });
  });

  it("keeps the page usable if Steward is unavailable", async () => {
    mocks.callAgent.mockRejectedValue(new Error("Agent is paused"));
    render(<MemoryRouter><PrivacySettingsPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Explain this" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Agent is paused");
    expect(screen.getByRole("button", { name: /Download my data/ })).toBeEnabled();
  });

  it("prepares a visible, user-clicked download link after the account export returns", async () => {
    const createObjectURL = vi.fn(() => "blob:wellness-export");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    mocks.exportMyWellnessData.mockResolvedValue({ checkins: [{ mood: "good" }] });
    const view = render(<MemoryRouter><PrivacySettingsPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Download my data" }));

    const download = await screen.findByRole("link", { name: /Download readable report/i });
    expect(download).toHaveAttribute("href", "blob:wellness-export");
    expect(download).toHaveAttribute("download", expect.stringMatching(/^wellnesscafe-my-data-.*\.txt$/));
    expect(await screen.findByRole("status")).toHaveTextContent(/select Download readable report/i);
    expect(createObjectURL.mock.calls[0][0].type).toBe("text/plain;charset=utf-8");
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(mocks.exportMyWellnessData).toHaveBeenCalledOnce();
    view.unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:wellness-export");
  });

  it("requires explicit typed confirmation before deleting only saved check-ins", async () => {
    mocks.deleteMyCheckIns.mockResolvedValue({ deletedCount: 3, complete: true });
    render(<MemoryRouter><PrivacySettingsPage /></MemoryRouter>);
    const confirmation = screen.getByLabelText(/type DELETE to confirm/i);
    const button = screen.getByRole("button", { name: "Delete my check-ins" });

    fireEvent.click(button);
    expect(mocks.deleteMyCheckIns).not.toHaveBeenCalled();
    fireEvent.change(confirmation, { target: { value: "delete" } });
    fireEvent.click(button);

    expect(await screen.findByRole("status")).toHaveTextContent(/deletion is complete.*3 saved check-ins were removed/i);
    expect(mocks.deleteMyCheckIns).toHaveBeenCalledOnce();
    expect(screen.getByText(/does not delete your account, plans, messages, appointments, or practitioner connections/i)).toBeInTheDocument();
  });

  it("explains that a failed deletion can be safely retried", async () => {
    mocks.deleteMyCheckIns.mockRejectedValue(new Error("network details"));
    render(<MemoryRouter><PrivacySettingsPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/type DELETE to confirm/i), { target: { value: "DELETE" } });
    fireEvent.click(screen.getByRole("button", { name: "Delete my check-ins" }));

    expect(await screen.findByRole("status")).toHaveTextContent(/deletion did not finish.*run it again/i);
    expect(screen.getByRole("status")).not.toHaveTextContent(/network details/i);
  });

  it("continues bounded server batches until the account history is fully removed", async () => {
    mocks.deleteMyCheckIns
      .mockResolvedValueOnce({ deletedCount: 4000, complete: false })
      .mockResolvedValueOnce({ deletedCount: 12, complete: true });
    render(<MemoryRouter><PrivacySettingsPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/type DELETE to confirm/i), { target: { value: "DELETE" } });
    fireEvent.click(screen.getByRole("button", { name: "Delete my check-ins" }));

    expect(await screen.findByRole("status")).toHaveTextContent(/4012 saved check-ins were removed/i);
    expect(mocks.deleteMyCheckIns).toHaveBeenCalledTimes(2);
  });
});
