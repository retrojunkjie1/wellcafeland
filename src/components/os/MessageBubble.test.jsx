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

  it("keeps assistant voice responses in the conversation and exposes read-aloud only on demand", () => {
    render(<MessageBubble message={{
      id: "assistant-audio-1",
      role: "assistant",
      type: "assistant_audio",
      content: "A short spoken response.",
      audioUrl: "blob:assistant-response",
    }} onSpeak />);

    expect(screen.getByText("A short spoken response.")).toBeInTheDocument();
    expect(screen.queryByLabelText("Voice response player")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Read response aloud" })).toBeInTheDocument();
  });

  it("sizes a portrait attachment to its own dimensions instead of stretching it across the message", () => {
    render(<MessageBubble message={{
      id: "user-image-1",
      role: "user",
      type: "user_text",
      content: "Look at this photo.",
      imageUrl: "data:image/jpeg;base64,test",
    }} />);

    const image = screen.getByAltText("Image shared in this conversation");
    expect(image).toHaveClass("w-auto", "max-w-full");
    expect(image).not.toHaveClass("w-full");
    expect(image.parentElement).toHaveClass("w-fit");
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
