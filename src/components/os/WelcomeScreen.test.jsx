import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import WelcomeScreen from "./WelcomeScreen";

vi.mock("@/stores/useOSStore", () => ({ useOSStore: () => ({ messages: [] }) }));

describe("WelcomeScreen conversation entry", () => {
  it("leaves the choice screen and opens chat without sending a canned message", () => {
    const onAction = vi.fn();
    const onContinueChat = vi.fn();
    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <Routes>
          <Route path="/chat" element={<WelcomeScreen onAction={onAction} onContinueChat={onContinueChat} />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Talk it through/i }));

    expect(onContinueChat).toHaveBeenCalledOnce();
    expect(onAction).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: /What would help most right now/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/I want to talk this through/i)).not.toBeInTheDocument();
  });

  it("opens the real Urge Support practice from the urge pathway", () => {
    function CurrentPath() {
      const location = useLocation();
      return <output data-testid="location">{location.pathname}</output>;
    }

    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <WelcomeScreen />
        <CurrentPath />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Get through an urge/i }));

    expect(screen.getByTestId("location")).toHaveTextContent("/tools/urge-surfing");
  });
});
