import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import UrgeSurfingTool from "./UrgeSurfingTool";

vi.mock("@/services/toolTelemetry", () => ({ logToolUsage: vi.fn().mockResolvedValue(undefined) }));

describe("UrgeSurfingTool", () => {
  it("keeps naming optional and advances to the first intensity check-in", () => {
    render(<UrgeSurfingTool />);

    fireEvent.click(screen.getByRole("button", { name: "3 Minutes" }));
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));

    expect(screen.getByText(/Step 2: Rate the Intensity/i)).toBeInTheDocument();
    expect(screen.queryByText("Practice complete")).not.toBeInTheDocument();
  });
});
