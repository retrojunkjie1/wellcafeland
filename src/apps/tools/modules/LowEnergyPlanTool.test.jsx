import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LowEnergyPlanTool from "./LowEnergyPlanTool";

const { callAgent, logToolUsage } = vi.hoisted(() => ({ callAgent: vi.fn(), logToolUsage: vi.fn() }));
vi.mock("@/ai/agents/agentClient", () => ({ callAgent }));
vi.mock("@/services/toolTelemetry", () => ({ logToolUsage }));
vi.mock("@/utils/toolContract", () => ({
  createToolResult: vi.fn((toolId, title, summary, data) => ({ toolId, title, summary, data })),
  safeComplete: vi.fn((callback, result) => callback?.(result)),
}));

describe("LowEnergyPlanTool Rhythm integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logToolUsage.mockResolvedValue(undefined);
  });

  it("asks Rhythm with only the selected area and capacity, then lets the person choose its option", async () => {
    callAgent.mockResolvedValue({ result: { invitation: "Place the one item you need beside your usual resting spot." } });
    render(<LowEnergyPlanTool />);

    fireEvent.click(screen.getByRole("button", { name: /Food, water, or something basic/i }));
    fireEvent.click(screen.getByRole("button", { name: /About 2 minutes/i }));
    fireEvent.click(screen.getByRole("button", { name: "Ask Rhythm" }));

    const suggestion = await screen.findByRole("button", { name: /Place the one item you need beside your usual resting spot/i });
    expect(callAgent).toHaveBeenCalledOnce();
    expect(callAgent).toHaveBeenCalledWith("rhythm", {
      question: expect.stringContaining('support area: "Food, water, or something basic"'),
    });
    expect(JSON.stringify(callAgent.mock.calls)).not.toContain("journal");
    fireEvent.click(suggestion);
    fireEvent.click(screen.getByRole("button", { name: "Make this my plan" }));
    expect(screen.getByText(/Place the one item you need beside your usual resting spot/i)).toBeInTheDocument();
  });

  it("does not call Rhythm when the person selects no capacity", () => {
    render(<LowEnergyPlanTool />);

    fireEvent.click(screen.getByRole("button", { name: /Food, water, or something basic/i }));
    fireEvent.click(screen.getByRole("button", { name: /Not able right now/i }));

    expect(screen.queryByRole("button", { name: /Ask Rhythm/i })).not.toBeInTheDocument();
    expect(callAgent).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Pause without deciding right now/i })).toBeInTheDocument();
  });
});
