import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MessageBubble from "./MessageBubble";

describe("MessageBubble", () => {
  it("keeps internal response diagnostics out of the client conversation", () => {
    render(<MessageBubble message={{
      id: "assistant-1",
      role: "assistant",
      type: "assistant_text",
      content: "What's on your mind?",
      reasoning: {
        role: "default",
        depth: "standard",
        safety: { risk: "low", disclaimers: [] },
        checks: ["intent understanding", "scope limits"],
        summary: ["Choose the smallest effective next step"],
      },
      meta: {
        thoughtMs: 1300,
        approach: "Clarify the ask and choose the next step.",
        plan: "Assess risk before responding.",
      },
    }} />);

    expect(screen.getByText("What's on your mind?")).toBeInTheDocument();
    expect(screen.queryByText(/Play this response/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Role: default|Depth: standard|Risk: Low|How I'm approaching|Thought for|intent understanding/i)).not.toBeInTheDocument();
  });
});
