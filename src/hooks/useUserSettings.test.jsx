import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { useUserSettings } from "./useUserSettings";

const mocks = vi.hoisted(() => ({
  auth: { currentUser: null },
  identity: null,
  settings: { theme: "night", notificationsEnabled: false },
  hydrateSettings: vi.fn(),
  getUserSettings: vi.fn(),
  updateUserSettings: vi.fn(),
}));

vi.mock("@/firebase", () => ({ auth: mocks.auth }));
vi.mock("@/stores/useOSStore", () => ({
  useOSStore: (selector) => selector({ settings: mocks.settings, hydrateSettings: mocks.hydrateSettings }),
}));
vi.mock("@/hooks/useSessionIdentity", () => ({ useSessionIdentity: () => mocks.identity }));
vi.mock("@/services/userSettingsService", () => ({
  getUserSettings: mocks.getUserSettings,
  updateUserSettings: mocks.updateUserSettings,
}));

function HookHarness() {
  useUserSettings();
  return null;
}

afterEach(() => cleanup());

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.currentUser = null;
  mocks.identity = { mode: "guest", userId: "device-guest", isLoading: false };
  mocks.settings = { theme: "night", notificationsEnabled: false };
  mocks.getUserSettings.mockResolvedValue(null);
  mocks.updateUserSettings.mockResolvedValue(true);
});

describe("useUserSettings", () => {
  it("keeps Firebase anonymous-auth preferences on device", () => {
    mocks.auth.currentUser = { uid: "firebase-anonymous-guest", isAnonymous: true };
    mocks.identity = { mode: "account", userId: "firebase-anonymous-guest", isLoading: false };

    render(<HookHarness />);

    expect(mocks.getUserSettings).not.toHaveBeenCalled();
    expect(mocks.updateUserSettings).not.toHaveBeenCalled();
  });

  it("hydrates then persists preferences only for the matching signed-in account", async () => {
    mocks.auth.currentUser = { uid: "client-1", isAnonymous: false };
    mocks.identity = { mode: "account", userId: "client-1", isLoading: false };
    mocks.getUserSettings.mockResolvedValue({ theme: "day" });

    render(<HookHarness />);

    expect(mocks.getUserSettings).toHaveBeenCalledWith("client-1");
    await waitFor(() => expect(mocks.updateUserSettings).toHaveBeenCalledWith("client-1", mocks.settings));
    expect(mocks.hydrateSettings).toHaveBeenCalledWith({ theme: "day" });
  });

  it("does not write local settings if the account preference read fails", async () => {
    mocks.auth.currentUser = { uid: "client-1", isAnonymous: false };
    mocks.identity = { mode: "account", userId: "client-1", isLoading: false };
    mocks.getUserSettings.mockRejectedValue(new Error("offline"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<HookHarness />);

    await waitFor(() => expect(warn).toHaveBeenCalled());
    expect(mocks.updateUserSettings).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("does not write the previous account settings into a newly selected account", async () => {
    mocks.auth.currentUser = { uid: "client-a", isAnonymous: false };
    mocks.identity = { mode: "account", userId: "client-a", isLoading: false };
    const view = render(<HookHarness />);
    await waitFor(() => expect(mocks.updateUserSettings).toHaveBeenCalledWith("client-a", mocks.settings));
    mocks.updateUserSettings.mockClear();

    mocks.auth.currentUser = { uid: "client-b", isAnonymous: false };
    mocks.identity = { mode: "account", userId: "client-b", isLoading: false };
    view.rerender(<HookHarness />);

    expect(mocks.getUserSettings).toHaveBeenLastCalledWith("client-b");
    expect(mocks.updateUserSettings).not.toHaveBeenCalled();
  });
});
