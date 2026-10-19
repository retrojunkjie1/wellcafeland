import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VoiceJournal from "./VoiceJournal";

const { callAgent, transcribeAudio } = vi.hoisted(() => ({ callAgent: vi.fn(), transcribeAudio: vi.fn() }));

vi.mock("@/services/multimodalClient", () => ({ transcribeAudio }));
vi.mock("@/agents/aiAgents", () => ({ callAgent }));
vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/firebase", () => ({ db: null }));
vi.mock("firebase/firestore", () => ({ collection: vi.fn(), addDoc: vi.fn(), serverTimestamp: vi.fn() }));
vi.mock("react-router-dom", () => ({ useLocation: () => ({ state: null }), useNavigate: () => vi.fn() }));

class FakeMediaRecorder {
  state = "inactive";
  start() { this.state = "recording"; }
  stop() {
    this.state = "inactive";
    this.onstop?.();
  }
}

describe("VoiceJournal privacy handoff", () => {
  beforeEach(() => {
    callAgent.mockReset();
    transcribeAudio.mockReset();
    transcribeAudio.mockResolvedValue({ ok: true, text: "A private voice entry." });
    callAgent.mockResolvedValue({ reply: "A concise summary." });
    vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }) },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("transcribes with consent but sends no transcript to Oracle until the separate summary choice", async () => {
    render(<VoiceJournal />);

    fireEvent.click(screen.getByRole("checkbox", { name: /send this recording for transcription/i }));
    fireEvent.click(screen.getByRole("button", { name: "Start voice journal recording" }));
    fireEvent.click(await screen.findByRole("button", { name: "Stop voice journal recording" }));

    expect(await screen.findByRole("textbox", { name: "Review and edit your transcript" })).toHaveValue("A private voice entry.");
    expect(transcribeAudio).toHaveBeenCalledOnce();
    expect(callAgent).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Generate optional summary" })).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox", { name: /send this transcript to Oracle AI for a summary/i }));
    fireEvent.change(screen.getByRole("textbox", { name: "Review and edit your transcript" }), {
      target: { value: "Edited private voice entry." },
    });
    expect(screen.getByRole("checkbox", { name: /send this transcript to Oracle AI for a summary/i })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Generate optional summary" })).toBeDisabled();
    expect(callAgent).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("checkbox", { name: /send this transcript to Oracle AI for a summary/i }));
    fireEvent.click(screen.getByRole("button", { name: "Generate optional summary" }));

    expect(await screen.findByText("A concise summary.")).toBeInTheDocument();
    expect(callAgent).toHaveBeenCalledOnce();
    expect(callAgent).toHaveBeenCalledWith("oracle", expect.objectContaining({
      mode: "voice_journal_summary",
      transcript: "Edited private voice entry.",
    }));
  });
});
