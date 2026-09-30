import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import WellnessSettingsPage from "./WellnessSettingsPage";

const mocks = vi.hoisted(() => ({
  state: {
    settings: {
      themeMode: "deep-night",
      interfaceDensity: "cozy",
      notifications: { dailyCheckIn: true, milestoneAlerts: true, providerMessages: true, circleActivity: true },
      allowEmotionFromChat: false,
      allowFaceSignals: false,
      trajectoryTrackingEnabled: true,
      personalizationMemoryEnabled: false,
      recoveryStorySuggestionsEnabled: false,
    },
    setAllowEmotionFromChat: vi.fn(),
    setAllowFaceSignals: vi.fn(),
    setTrajectoryTrackingEnabled: vi.fn(),
    setPersonalizationMemoryEnabled: vi.fn(),
    setRecoveryStorySuggestionsEnabled: vi.fn(),
  },
  identity: { mode: "account", isProvider: false, isAdmin: false },
  hasMemory: true,
  clearMemory: vi.fn(),
  listMemory: vi.fn(),
}));

vi.mock("@/stores/useOSStore", () => ({ useOSStore: (selector) => selector(mocks.state) }));
vi.mock("@/hooks/useSessionIdentity", () => ({ useSessionIdentity: () => mocks.identity }));
vi.mock("@/services/conversationMemory", () => ({
  clearConversationMemory: mocks.clearMemory,
  hasAccountConversationMemory: () => mocks.hasMemory,
  listConversationMemory: mocks.listMemory,
}));

const renderPage = () => render(<MemoryRouter><WellnessSettingsPage /></MemoryRouter>);

beforeEach(() => {
  mocks.identity = { mode: "account", isProvider: false, isAdmin: false };
  mocks.hasMemory = true;
  mocks.clearMemory.mockReset().mockResolvedValue(true);
  mocks.listMemory.mockReset().mockResolvedValue({ ok: true, entries: [] });
  mocks.state.settings.personalizationMemoryEnabled = false;
});

afterEach(() => cleanup());

describe("WellnessSettingsPage", () => {
  it("organizes settings by destination and gives readable, expandable explanations", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "All your controls" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Look & feel/ }).getAttribute("href")).toBe("/settings/preferences");
    expect(screen.getByRole("link", { name: /Reminders/ }).getAttribute("href")).toBe("/settings/notifications");
    expect(screen.getByRole("link", { name: /Privacy & your data/ }).getAttribute("href")).toBe("/settings/privacy");
    const help = screen.getAllByText("What does this change?")[0];
    fireEvent.click(help);
    expect(screen.getByText(/may use clues in new messages/i)).toBeTruthy();
  });

  it("offers role-specific destinations only to the matching person", () => {
    mocks.identity = { mode: "account", isProvider: true, isAdmin: true };
    renderPage();
    expect(screen.getByRole("link", { name: /Practitioner workspace/ }).getAttribute("href")).toBe("/provider/dashboard");
    expect(screen.getByRole("link", { name: /God-Eye console/ }).getAttribute("href")).toBe("/admin/overseer");
  });

  it("keeps account memory unavailable to guests and exposes sign-in", () => {
    mocks.identity = { mode: "guest", isProvider: false, isAdmin: false };
    mocks.hasMemory = false;
    renderPage();
    expect(screen.getByRole("switch", { name: "Remember guide conversations" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
  });

  it("keeps camera image sharing separate from optional message-tone analysis", () => {
    renderPage();
    const camera = screen.getByRole("switch", { name: "Use a camera photo in chat" });
    expect(camera).not.toBeDisabled();
    fireEvent.click(camera);
    expect(mocks.state.setAllowFaceSignals).toHaveBeenCalledWith(true);
  });

  it("shows saved-exchange review empty state without transferring local data", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Review saved exchanges" }));
    expect(await screen.findByRole("status")).toHaveTextContent("No saved guide exchanges yet.");
    expect(mocks.listMemory).toHaveBeenCalledOnce();
  });

  it("turns memory off and clears account-saved exchanges", async () => {
    mocks.state.settings.personalizationMemoryEnabled = true;
    renderPage();
    fireEvent.click(screen.getByRole("switch", { name: "Remember guide conversations" }));
    await waitFor(() => expect(mocks.clearMemory).toHaveBeenCalledOnce());
    expect(await screen.findByRole("status")).toHaveTextContent("Memory is off and saved guide exchanges were cleared.");
    expect(mocks.state.setPersonalizationMemoryEnabled).toHaveBeenCalledWith(false);
  });

  it("keeps recovery story suggestions optional and explains when they appear", () => {
    renderPage();
    const toggle = screen.getByRole("switch", { name: "Offer optional recovery stories" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);
    expect(mocks.state.setRecoveryStorySuggestionsEnabled).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getAllByText("What does this change?")[4]);
    expect(screen.getByText(/not chosen from your private answers/i)).toBeTruthy();
  });
});
