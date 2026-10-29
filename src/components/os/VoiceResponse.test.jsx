import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import VoiceResponse from "./VoiceResponse";
import { speakText } from "@/services/multimodalClient";

vi.mock("@/services/multimodalClient", () => ({ speakText: vi.fn() }));

afterEach(() => vi.clearAllMocks());

describe("VoiceResponse", () => {
  it("explains when secure app verification is blocking audio", async () => {
    speakText.mockResolvedValue({ ok: false, status: 401, code: "APP_CHECK_REQUIRED" });
    render(<VoiceResponse text="The written reply remains available." />);

    fireEvent.click(screen.getByRole("button", { name: "Play voice response" }));

    expect(await screen.findByRole("status")).toHaveTextContent(/verify this app session/i);
  });

  it("starts only after a user asks to play the response", async () => {
    speakText.mockResolvedValue({ ok: false, code: "TTS_PROVIDER_UNAVAILABLE" });
    render(<VoiceResponse text="Read this reply." />);

    expect(speakText).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Play voice response" }));
    await waitFor(() => expect(speakText).toHaveBeenCalledWith("Read this reply.", { voice: "marin" }));
    expect(await screen.findByRole("status")).toHaveTextContent(/try again shortly/i);
  });
});
