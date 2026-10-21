import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import VoiceCheckInModal from "./VoiceCheckInModal";
import { transcribeAudio } from "@/services/multimodalClient";

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

    const send = await screen.findByRole("button", { name: "Send recording for transcription and reply" });
    expect(transcribeAudio).not.toHaveBeenCalled();
    fireEvent.click(send);
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ transcript: "I feel overwhelmed", type: "voice_message" })));
    expect(transcribeAudio).toHaveBeenCalledTimes(1);
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
    fireEvent.click(await screen.findByRole("button", { name: "Send recording for transcription and reply" }));
    fireEvent.click(await screen.findByRole("button", { name: "Retry transcription" }));
    expect(mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(transcribeAudio).toHaveBeenCalledTimes(2);
  });
});
