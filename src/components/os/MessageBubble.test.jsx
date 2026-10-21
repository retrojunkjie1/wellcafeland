import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MessageBubble from "./MessageBubble";

describe("MessageBubble", () => {
  it("shows a sent voice transcript without a stale recording player", () => {
    render(<MessageBubble message={{
      id: "user-voice-1",
      role: "user",
      type: "voice_message",
      content: "The words I chose to send",
      audioUrl: "data:audio/webm;base64,old-recording",
      audioDurationSeconds: 9,
    }} />);

    expect(screen.getByText("The words I chose to send")).toBeInTheDocument();
    expect(screen.queryByText(/Recording unavailable|Voice message|could not be played/i)).not.toBeInTheDocument();
    expect(document.querySelector("audio")).not.toBeInTheDocument();
  });

  it("renders one playback control for an assistant voice response", () => {
    render(<MessageBubble message={{
      id: "assistant-audio-1",
      role: "assistant",
      type: "assistant_audio",
      content: "A short spoken response.",
      audioUrl: "blob:assistant-response",
    }} />);

    expect(screen.getByText("A short spoken response.")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Voice response player")).toHaveLength(1);
  });

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
