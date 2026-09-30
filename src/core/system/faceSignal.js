// Camera check-in image capture. This module deliberately does not infer
// emotion, health, identity, or any other private state from facial appearance.

export function captureCameraStill(video, createCanvas = () => document.createElement("canvas")) {
  if (!video || !Number.isFinite(video.videoWidth) || !Number.isFinite(video.videoHeight) || !video.videoWidth || !video.videoHeight) {
    throw new Error("CAMERA_FRAME_NOT_READY");
  }

  const canvas = createCanvas();
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("CAMERA_CANVAS_UNAVAILABLE");

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageDataUrl = canvas.toDataURL("image/jpeg", 0.82);
  if (!/^data:image\/jpeg;base64,/i.test(imageDataUrl)) throw new Error("CAMERA_IMAGE_UNAVAILABLE");
  return imageDataUrl;
}
