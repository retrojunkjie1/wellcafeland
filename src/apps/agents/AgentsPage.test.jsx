import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AgentsPage from "./AgentsPage";

const { callAgent } = vi.hoisted(() => ({ callAgent: vi.fn() }));

vi.mock("@/ai/agents/agentClient", () => ({ callAgent }));
vi.mock("@/services/telemetry", () => ({ trackPageView: vi.fn() }));

describe("AgentsPage canonical agent client", () => {
  it("invokes the selected catalog agent with the existing prompt payload", async () => {
    callAgent.mockResolvedValue({ success: true, result: { summary: "A gentle response." } });
    render(<AgentsPage />);

    fireEvent.change(screen.getByPlaceholderText("Ask about patterns in your recovery journey..."), {
      target: { value: "What pattern do you notice?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ask The Seer" }));

    expect(await screen.findByText("A gentle response.")).toBeInTheDocument();
    expect(callAgent).toHaveBeenCalledWith("seer", {
      question: "What pattern do you notice?",
      prompt: "What pattern do you notice?",
    });
  });
});
