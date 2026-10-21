import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import VoiceCheckInModal from "./VoiceCheckInModal";
import { detectEmotionFromText, transcribeAudio } from "@/services/multimodalClient";
import { callAgent } from "@/agents/aiAgents";

vi.mock("@/services/multimodalClient", () => ({
  detectEmotionFromText: vi.fn(),
  transcribeAudio: vi.fn(),
}));
vi.mock("@/agents/aiAgents", () => ({ callAgent: vi.fn() }));

class MockMediaRecorder {
  state = "inactive";
  mimeType = "audio/webm";
  start() { this.state = "recording"; }
  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["voice"], { type: this.mimeType }) });
    this.onstop?.();
  }
}

describe("VoiceCheckInModal chat recording", () => {
  beforeEach(() => {
    vi.stubGlobal("MediaRecorder", MockMediaRecorder);
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn() })));
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }) },
    });
    window.AudioContext = class {
      state = "running";
      createMediaStreamSource() { return { connect: vi.fn() }; }
      createAnalyser() { return { fftSize: 2048, getByteTimeDomainData: (data) => data.fill(128) }; }
      close() { this.state = "closed"; }
    };
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      clearRect: vi.fn(), fillRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(),
    }));
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:voice-preview");
    transcribeAudio.mockResolvedValue({ ok: true, text: "I feel overwhelmed" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows a compact waveform while recording, then sends only on the explicit send action", async () => {
    const onComplete = vi.fn();
    render(<MemoryRouter><VoiceCheckInModal open mode="chat" presentation="inline" onComplete={onComplete} onClose={vi.fn()} /></MemoryRouter>);

    expect(screen.getByText("Say what’s on your mind. Send when you’re ready.")).toBeInTheDocument();
    expect(screen.queryByText("Listening · 0:00")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start voice message recording" }));

    expect(await screen.findByLabelText("Recording voice message")).toBeInTheDocument();
    expect(screen.getByLabelText("Live voice waveform")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel voice recording" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Stop voice recording" }));

    const send = await screen.findByRole("button", { name: "Transcribe and send voice message" });
    expect(screen.getByText("Tap ↑ to transcribe and send")).toBeInTheDocument();
    expect(transcribeAudio).not.toHaveBeenCalled();
    fireEvent.click(send);
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ transcript: "I feel overwhelmed", type: "voice_message" })));
    expect(transcribeAudio).toHaveBeenCalledTimes(1);
  });

  it("starts directly in the inline waveform when the composer mic opens it", async () => {
    render(<MemoryRouter><VoiceCheckInModal open mode="chat" presentation="inline" autoStartOnOpen onComplete={vi.fn()} onClose={vi.fn()} /></MemoryRouter>);

    expect(await screen.findByLabelText("Recording voice message")).toBeInTheDocument();
    expect(screen.getByLabelText("Live voice waveform")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Voice message" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start voice message recording" })).not.toBeInTheDocument();
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
  });

  it("closes the voice surface when the person discards a stopped recording", async () => {
    const onClose = vi.fn();
    render(<MemoryRouter><VoiceCheckInModal open mode="chat" presentation="inline" onComplete={vi.fn()} onClose={onClose} /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Start voice message recording" }));
    fireEvent.click(await screen.findByRole("button", { name: "Stop voice recording" }));
    fireEvent.click(await screen.findByRole("button", { name: "Discard recording and close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("retries a failed transcription without requesting the microphone again", async () => {
    transcribeAudio.mockResolvedValueOnce({ ok: false, error: "Try again" });
    const mediaDevices = navigator.mediaDevices;
    render(<MemoryRouter><VoiceCheckInModal open mode="chat" presentation="inline" onComplete={vi.fn()} onClose={vi.fn()} /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Start voice message recording" }));
    fireEvent.click(await screen.findByRole("button", { name: "Stop voice recording" }));
    fireEvent.click(await screen.findByRole("button", { name: "Transcribe and send voice message" }));
    fireEvent.click(await screen.findByRole("button", { name: "Retry transcription" }));
    expect(mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(transcribeAudio).toHaveBeenCalledTimes(2);
  });

  it("requires explicit send consent and shows the reflection actually returned", async () => {
    detectEmotionFromText.mockReturnValue({ emotionalState: "grounded", intensity: 1, tags: [] });
    callAgent.mockResolvedValue({ reply: "You can take this one step at a time." });
    const onComplete = vi.fn();
    render(<MemoryRouter><VoiceCheckInModal open onComplete={onComplete} onClose={vi.fn()} /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Start voice check-in recording" }));
    fireEvent.click(await screen.findByRole("button", { name: "Stop voice check-in recording" }));

    const transcribe = await screen.findByRole("button", { name: "Transcribe check-in" });
    expect(transcribe).toBeDisabled();
    fireEvent.click(transcribe);
    expect(transcribeAudio).not.toHaveBeenCalled();
    expect(callAgent).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(transcribe);

    expect(await screen.findByText("You can take this one step at a time.")).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      type: "tool_result",
      toolId: "voice-checkin",
      durationSeconds: 0,
    }));
  });
});
