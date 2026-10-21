import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import WelcomeScreen from "./WelcomeScreen";

vi.mock("@/stores/useOSStore", () => ({ useOSStore: () => ({ messages: [] }) }));

describe("WelcomeScreen conversation entry", () => {
  it("opens the composer without sending a canned message", () => {
    const onAction = vi.fn();
    const onContinueChat = vi.fn();
    render(
      <MemoryRouter>
        <WelcomeScreen onAction={onAction} onContinueChat={onContinueChat} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Talk it through/i }));

    expect(onContinueChat).toHaveBeenCalledOnce();
    expect(onAction).not.toHaveBeenCalled();
    expect(screen.queryByText(/I want to talk this through/i)).not.toBeInTheDocument();
  });
});
