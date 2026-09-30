import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BodyScanTool from "./BodyScanTool";

vi.mock("@/services/toolTelemetry", () => ({ logToolUsage: vi.fn().mockResolvedValue(undefined) }));

describe("BodyScanTool legacy route", () => {
  it("offers practical grounding choices without body ratings or written check-ins", () => {
    render(<BodyScanTool />);

    expect(screen.getByText("No ratings or written answers. Skip anything that does not fit.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Let something support you/ })).toBeInTheDocument();
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    const supportCard = screen.getByRole("button", { name: /Let something support you/ }).parentElement;
    fireEvent.click(screen.getByRole("button", { name: /Let something support you/ }));

    expect(within(supportCard).getByRole("region", { name: "Let something support you" })).toHaveTextContent(/let the chair, bed, wall, or floor support you/i);
    expect(within(supportCard).getByRole("button", { name: "Done for now" })).toBeInTheDocument();
    expect(screen.queryByText(/there is nothing to find or fix/i)).not.toBeInTheDocument();
  });

  it("completes without storing body observations or the selected grounding choice", () => {
    const onComplete = vi.fn();
    render(<BodyScanTool onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: /Choose one easy movement/ }));
    fireEvent.click(screen.getByRole("button", { name: "Done for now" }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0][0].title).toBe("Steady Ground");
    expect(onComplete.mock.calls[0][0].data).toEqual({ practiceType: "choice-led-grounding" });
  });
});
