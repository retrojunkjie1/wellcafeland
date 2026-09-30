import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import FaceScanPrompt from "./FaceScanPrompt";

const { captureCameraStill } = vi.hoisted(() => ({ captureCameraStill: vi.fn() }));
vi.mock("@/core/system/faceSignal", () => ({ captureCameraStill: (...args) => captureCameraStill(...args) }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  captureCameraStill.mockReset();
  captureCameraStill.mockReturnValue("data:image/jpeg;base64,cGhvdG8=");
});

describe("FaceScanPrompt", () => {
  it("does not open the camera until the user asks, then hands off a still photo", async () => {
    const stop = vi.fn();
    const stream = { getTracks: () => [{ stop }] };
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia } });
    const onStartScan = vi.fn();
    const onClose = vi.fn();

    render(<FaceScanPrompt open onClose={onClose} onStartScan={onStartScan} />);
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(screen.getByText(/cannot tell how you feel or assess your health/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Open camera" }));
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledWith(expect.objectContaining({ audio: false })));
    const video = await screen.findByLabelText("Live camera preview");
    fireEvent.loadedMetadata(video);
    fireEvent.click(await screen.findByRole("button", { name: "Use this photo" }));

    await waitFor(() => expect(onStartScan).toHaveBeenCalledWith({ imageDataUrl: "data:image/jpeg;base64,cGhvdG8=" }));
    expect(stop).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("explains denied camera access without pretending a scan was completed", async () => {
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: vi.fn().mockRejectedValue({ name: "NotAllowedError" }) } });
    render(<FaceScanPrompt open onClose={vi.fn()} onStartScan={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Open camera" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/permission was not allowed/i);
    expect(screen.getByRole("button", { name: "Continue with words" })).toBeTruthy();
  });
});
