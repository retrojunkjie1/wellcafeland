import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VoiceSessionWorkspace from "./VoiceSessionWorkspace";

const { sendVoiceSession } = vi.hoisted(() => ({ sendVoiceSession: vi.fn() }));

vi.mock("@/services/multimodalClient", () => ({ sendVoiceSession }));
vi.mock("@/stores/useOSStore", () => ({ useOSStore: () => ({
  settings: { personalizationMemoryEnabled: false },
  addMessage: vi.fn(),
  closeWorkspace: vi.fn(),
}) }));
vi.mock("@/components/navigation/PageHeader", () => ({ default: () => <header>Voice Session</header> }));
vi.mock("@/components/os/VoiceResponse", () => ({ default: () => null }));
vi.mock("@/components/os/VideoGuidance", () => ({ default: () => null }));
vi.mock("react-router-dom", () => ({ Link: ({ children, ...props }) => <a {...props}>{children}</a>, useNavigate: () => vi.fn() }));

describe("VoiceSessionWorkspace consent gate", () => {
  beforeEach(() => {
    sendVoiceSession.mockReset();
    sendVoiceSession.mockResolvedValue({
      ok: true,
      text: "A supportive reply.",
      transcript: "A voice entry.",
      emotionalState: "steady",
      intensity: 1,
      tags: [],
      crisis: false,
    });
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:voice-session-test");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  it("keeps a supplied recording local until consent and a send action", async () => {
    const recording = new Blob(["local recording"], { type: "audio/webm" });
    render(<VoiceSessionWorkspace initialAudioBlob={recording} />);

    const sendButton = await screen.findByRole("button", { name: "Send recording for a reply" });
    expect(sendVoiceSession).not.toHaveBeenCalled();
    expect(sendButton).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox", { name: /send this recording for transcription/i }));
    fireEvent.click(sendButton);

    expect(await screen.findByText("Session complete")).toBeInTheDocument();
    expect(sendVoiceSession).toHaveBeenCalledOnce();
    expect(sendVoiceSession).toHaveBeenCalledWith(recording, { memoryEnabled: false });
  });
});
