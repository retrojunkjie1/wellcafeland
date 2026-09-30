import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import NotificationsSettingsPage from "./NotificationsSettingsPage";

const mocks = vi.hoisted(() => ({
  settings: {
    notifications: { dailyCheckIn: true, milestoneAlerts: true, providerMessages: true, circleActivity: true },
  },
  setNotificationSetting: vi.fn(),
}));
vi.mock("@/stores/useOSStore", () => ({ useOSStore: (selector) => selector({ settings: mocks.settings, setNotificationSetting: mocks.setNotificationSetting }) }));
afterEach(() => cleanup());

describe("NotificationsSettingsPage", () => {
  it("clearly says that outbound reminder delivery is not connected", () => {
    render(<NotificationsSettingsPage />);
    expect(screen.getByRole("heading", { name: "Reminder delivery is not connected yet" })).toBeTruthy();
    expect(screen.getByText(/not currently sending reminder emails or phone notifications/i)).toBeTruthy();
    expect(screen.queryByText(/PWA/i)).toBeNull();
  });

  it("saves the user’s topic preferences", () => {
    render(<NotificationsSettingsPage />);
    fireEvent.click(screen.getByRole("checkbox", { name: /Daily check-in/i }));
    expect(mocks.setNotificationSetting).toHaveBeenCalledWith("dailyCheckIn", false);
  });
});
