import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SessionPlayerPage from "./SessionPlayerPage";

const { startWithPrompt } = vi.hoisted(() => ({
  startWithPrompt: vi.fn(),
}));

vi.mock("./useAIStore", () => ({
  useAIStore: () => ({ startWithPrompt }),
}));

describe("SessionPlayerPage", () => {
  beforeEach(() => {
    startWithPrompt.mockClear();
  });

  it("shows choice and sends safety-centered guidance with the selected practice", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/sessions/templates/grounding",
            state: {
              template: {
                title: "Gentle grounding",
                steps: ["Notice one color nearby."],
              },
            },
          },
        ]}
      >
        <Routes>
          <Route path="/sessions/templates/:id" element={<SessionPlayerPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Your choice during this session")).toHaveTextContent(
      "You can skip any step, take a break, or stop at any time",
    );

    fireEvent.click(screen.getByRole("button", { name: "Start session" }));

    expect(startWithPrompt).toHaveBeenCalledOnce();
    const prompt = startWithPrompt.mock.calls[0][0];
    expect(prompt).toContain("1. Notice one color nearby.");
    expect(prompt).toContain("pause, skip a step, or stop whenever I want");
    expect(prompt).toContain("letting my breath stay natural");
    expect(prompt).toContain("Do not diagnose me");
  });
});
