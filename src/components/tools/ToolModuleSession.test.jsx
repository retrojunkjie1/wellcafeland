import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ToolModuleSession from "./ToolModuleSession";

afterEach(() => cleanup());

describe("ToolModuleSession completion handoff", () => {
  it("keeps alternate support choices tucked away until completion", () => {
    const onFindSupport = vi.fn();
    const onCheckIn = vi.fn();
    const { rerender } = render(<ToolModuleSession title="Grounding" onClose={vi.fn()} onFindSupport={onFindSupport} onCheckIn={onCheckIn} />);

    expect(screen.queryByText("Need another kind of support?")).not.toBeInTheDocument();
    rerender(<ToolModuleSession title="Grounding" onClose={vi.fn()} onFindSupport={onFindSupport} onCheckIn={onCheckIn} completed />);
    expect(screen.getByText("Need another kind of support?").closest("details")).not.toHaveAttribute("open");

    fireEvent.click(screen.getByText("Need another kind of support?"));
    fireEvent.click(screen.getByRole("button", { name: "Find real-world help" }));
    fireEvent.click(screen.getByRole("button", { name: "Check in with myself" }));

    expect(onFindSupport).toHaveBeenCalledOnce();
    expect(onCheckIn).toHaveBeenCalledOnce();
  });
});
