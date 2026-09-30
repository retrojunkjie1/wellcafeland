import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PreferencesPage from "./PreferencesPage";

const mocks = vi.hoisted(() => ({
  state: { settings: { themeMode: "deep-night", interfaceDensity: "cozy" }, setThemeMode: vi.fn(), setInterfaceDensity: vi.fn() },
}));
vi.mock("@/stores/useOSStore", () => ({ useOSStore: (selector) => selector(mocks.state) }));
afterEach(() => cleanup());

describe("PreferencesPage", () => {
  it("offers clear theme choices and applies the selected mode", () => {
    render(<MemoryRouter><PreferencesPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: /Dawn.*bright page/i }));
    expect(mocks.state.setThemeMode).toHaveBeenCalledWith("dawn");
    fireEvent.click(screen.getByRole("button", { name: /Follow my device/i }));
    expect(mocks.state.setThemeMode).toHaveBeenCalledWith("system");
  });

  it("lets people choose visibly different page spacing", () => {
    render(<MemoryRouter><PreferencesPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: /Compact.*less scrolling/i }));
    expect(mocks.state.setInterfaceDensity).toHaveBeenCalledWith("compact");
  });
});
