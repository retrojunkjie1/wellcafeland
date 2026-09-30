import { describe, expect, it, vi } from "vitest";
import { captureCameraStill } from "./faceSignal";

describe("captureCameraStill", () => {
  it("captures a still image without deriving an emotion label", () => {
    const drawImage = vi.fn();
    const canvas = {
      getContext: () => ({ drawImage }),
      toDataURL: vi.fn(() => "data:image/jpeg;base64,cGhvdG8="),
    };
    const video = { videoWidth: 640, videoHeight: 480 };
    expect(captureCameraStill(video, () => canvas)).toBe("data:image/jpeg;base64,cGhvdG8=");
    expect(drawImage).toHaveBeenCalledWith(video, 0, 0, 640, 480);
  });

  it("rejects an unready preview and unavailable canvas", () => {
    expect(() => captureCameraStill({ videoWidth: 0, videoHeight: 0 }, () => ({}))).toThrow("CAMERA_FRAME_NOT_READY");
    expect(() => captureCameraStill({ videoWidth: 640, videoHeight: 480 }, () => ({ getContext: () => null }))).toThrow("CAMERA_CANVAS_UNAVAILABLE");
  });
});
