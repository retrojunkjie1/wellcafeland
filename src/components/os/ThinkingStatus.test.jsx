import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ThinkingStatus from "./ThinkingStatus";

describe("ThinkingStatus", () => {
  it("keeps the response-process summary optional while a reply is pending", () => {
    render(<ThinkingStatus />);

    const disclosure = screen.getByRole("button", { name: /Reviewing your request/ });
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/using your message and the context/i)).not.toBeInTheDocument();

    fireEvent.click(disclosure);
    expect(disclosure).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/using your message and the context/i)).toBeInTheDocument();
  });

  it("uses resource-specific progress copy for directory searches", () => {
    render(<ThinkingStatus intent="directory" />);
    fireEvent.click(screen.getByRole("button", { name: /Searching public resources/ }));
    expect(screen.getByText(/checking public resources for this request/i)).toBeInTheDocument();
  });
});
