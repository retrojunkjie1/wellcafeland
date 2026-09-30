import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PrivacySettingsPage from "./PrivacySettingsPage";

const mocks = vi.hoisted(() => ({ exportMyWellnessData: vi.fn() }));
vi.mock("@/services/practitionerRegistry", () => mocks);
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe("PrivacySettingsPage", () => {
  it("shows the working data, sharing, and memory controls without inactive privacy toggles", () => {
    render(<MemoryRouter><PrivacySettingsPage /></MemoryRouter>);
    expect(screen.getByRole("button", { name: /Download my data/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Review sharing/ }).getAttribute("href")).toBe("/settings/practitioner-sharing");
    expect(screen.getByRole("link", { name: /Open Personal support/ }).getAttribute("href")).toBe("/settings/wellness");
    expect(screen.getByText(/timed delete option is not available yet/i)).toBeTruthy();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByText(/Require PIN for provider view/i)).toBeNull();
  });

  it("prepares a visible, user-clicked download link after the account export returns", async () => {
    const createObjectURL = vi.fn(() => "blob:wellness-export");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    mocks.exportMyWellnessData.mockResolvedValue({ checkins: [{ mood: "good" }] });
    const view = render(<MemoryRouter><PrivacySettingsPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Download my data" }));

    const download = await screen.findByRole("link", { name: /Download ready file/i });
    expect(download).toHaveAttribute("href", "blob:wellness-export");
    expect(download).toHaveAttribute("download", expect.stringMatching(/^wellnesscafe-data-.*\.json$/));
    expect(await screen.findByRole("status")).toHaveTextContent(/select Download ready file/i);
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(mocks.exportMyWellnessData).toHaveBeenCalledOnce();
    view.unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:wellness-export");
  });
});
