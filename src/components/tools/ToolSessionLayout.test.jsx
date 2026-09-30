import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolSessionLayout } from "./ToolSessionLayout";

describe("ToolSessionLayout", () => {
  it("provides a clear return path and starts a practice", () => {
    const onClose = vi.fn();
    const onStart = vi.fn();
    render(
      <ToolSessionLayout
        tool={{ name: "Breathing Reset", sessionType: "breathing" }}
        isActive={false}
        onClose={onClose}
        onStart={onStart}
        onEnd={vi.fn()}
      >
        <p>Practice content</p>
      </ToolSessionLayout>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Return to practice library" }));
    fireEvent.click(screen.getByRole("button", { name: "Begin breathing" }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onStart).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent("Ready when you are");
  });

  it("labels the active practice state and offers an end action", () => {
    const onEnd = vi.fn();
    render(
      <ToolSessionLayout
        tool={{ name: "Grounding" }}
        isActive
        onClose={vi.fn()}
        onStart={vi.fn()}
        onEnd={onEnd}
      >
        <p>Practice content</p>
      </ToolSessionLayout>,
    );

    fireEvent.click(screen.getByRole("button", { name: "End practice" }));

    expect(onEnd).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent("Practice in progress");
  });
});
