import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GroundingTool from "./GroundingTool";

vi.mock("@/services/toolTelemetry", () => ({ logToolUsage: vi.fn().mockResolvedValue(undefined) }));

describe("GroundingTool", () => {
  it("offers optional orientation choices without a counting or writing task", () => {
    render(<GroundingTool />);

    expect(screen.getByText(/No counting, naming, or written answers/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rest your eyes on one steady thing/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Listen for a familiar sound/ })).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows one chosen cue and completes without saving personal reflections", () => {
    const onComplete = vi.fn();
    render(<GroundingTool onComplete={onComplete} />);

    const textureCard = screen.getByRole("button", { name: /Use a familiar texture/ }).parentElement;
    fireEvent.click(screen.getByRole("button", { name: /Use a familiar texture/ }));
    expect(within(textureCard).getByRole("region", { name: "Use a familiar texture" })).toHaveTextContent(/hold a familiar object if it helps/i);
    fireEvent.click(within(textureCard).getByRole("button", { name: "Done for now" }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0][0].title).toBe("Choose an Anchor");
    expect(onComplete.mock.calls[0][0].data).toEqual({ practiceType: "choice-led-orientation" });
  });

  it("offers a clear way to leave without completing", () => {
    const onCancel = vi.fn();
    render(<GroundingTool onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Leave practice" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
