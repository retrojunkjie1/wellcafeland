import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import GroundingTool from "./GroundingTool";

vi.mock("@/services/toolTelemetry", () => ({ logToolUsage: vi.fn(() => Promise.resolve()) }));

describe("GroundingTool", () => {
  it("lets the client move through and finish without answering prompts", () => {
    const onComplete = vi.fn();
    render(<GroundingTool onComplete={onComplete} />);

    expect(screen.getByText(/leave the response blank, skip any step, or stop/i)).toBeInTheDocument();

    for (let step = 0; step < 4; step += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Finish for now" }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0][0].data.stepsCompleted).toBe(0);
    expect(onComplete.mock.calls[0][0].data.stepsVisited).toBe(5);
  });

  it("offers an explicit way to stop when a cancel action is available", () => {
    const onCancel = vi.fn();
    render(<GroundingTool onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Stop practice" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
