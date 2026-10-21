import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ChatActionsRow from "./ChatActionsRow";

describe("ChatActionsRow", () => {
  it("keeps recovery actions off successful replies even when handlers are available", () => {
    render(<ChatActionsRow
      message={{ role: "assistant", type: "assistant_text", content: "A successful reply" }}
      onRetry={vi.fn()}
      onContinueOffline={vi.fn()}
      onCopy={vi.fn()}
    />);

    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue offline" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy response" })).toBeInTheDocument();
  });

  it("shows recovery controls only on service errors and does not duplicate message actions", () => {
    const retry = vi.fn();
    const continueOffline = vi.fn();
    const { rerender } = render(<ChatActionsRow
      message={{ role: "assistant", type: "assistant_error", content: "Connection issue" }}
      onRetry={retry}
      onContinueOffline={continueOffline}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue offline" }));
    expect(retry).toHaveBeenCalledOnce();
    expect(continueOffline).toHaveBeenCalledOnce();

    rerender(<ChatActionsRow
      message={{
        role: "assistant",
        type: "assistant_error",
        content: "Connection issue",
        actions: [{ label: "Retry", action: "retry" }, { label: "Continue offline", action: "offline" }],
      }}
      onRetry={retry}
      onContinueOffline={continueOffline}
    />);

    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue offline" })).not.toBeInTheDocument();
  });

  it("shows compact response actions and lets a person choose feedback", () => {
    render(<ChatActionsRow
      message={{ role: "assistant", content: "A short reply" }}
      onCopy={vi.fn().mockResolvedValue(true)}
      onSpeak={vi.fn()}
      onShare={vi.fn().mockResolvedValue("shared")}
    />);

    expect(screen.getByRole("button", { name: "Copy response" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Read response aloud" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Helpful response" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Not helpful response" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share response" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Helpful response" }));
    expect(screen.getByRole("button", { name: "Helpful response" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Thanks for the feedback");
  });

  it("copies and shares only the selected assistant response when asked", async () => {
    const copy = vi.fn().mockResolvedValue(true);
    const share = vi.fn().mockResolvedValue("shared");
    const message = { role: "assistant", content: "A short reply" };
    render(<ChatActionsRow message={message} onCopy={copy} onSpeak={vi.fn()} onShare={share} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy response" }));
    expect(copy).toHaveBeenCalledWith("A short reply");
    expect(await screen.findByText("Copied")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Share response" }));
    expect(share).toHaveBeenCalledWith(message);
    expect(await screen.findByText("Share options opened")).toBeInTheDocument();
  });
});
