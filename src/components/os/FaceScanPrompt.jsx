import React, { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { captureCameraStill } from "@/core/system/faceSignal";

export default function FaceScanPrompt({ open, onClose, onStartScan }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraState, setCameraState] = useState("idle");
  const [previewReady, setPreviewReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const stopCamera = () => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState("idle");
  };

  useEffect(() => {
    if (!open || !streamRef.current || !videoRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    const playback = videoRef.current.play?.();
    playback?.catch?.(() => setErrorMessage("Camera preview could not start. Check your browser camera permission and try again."));
  }, [open, cameraState]);

  useEffect(() => () => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (!open) stopCamera();
  }, [open]);

  if (!open) return null;

  const close = () => {
    stopCamera();
    setErrorMessage("");
    onClose?.();
  };

  const openCamera = async () => {
    setErrorMessage("");
    setCameraState("opening");
    setPreviewReady(false);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("CAMERA_UNAVAILABLE");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      setCameraState("ready");
    } catch (error) {
      setCameraState("idle");
      setErrorMessage(error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError"
        ? "Camera permission was not allowed. You can continue with words instead."
        : "Camera is unavailable here. You can continue with words instead.");
    }
  };

  const takePhoto = async () => {
    try {
      const imageDataUrl = captureCameraStill(videoRef.current);
      stopCamera();
      await onStartScan?.({ imageDataUrl });
      close();
    } catch (error) {
      setErrorMessage(error?.message === "CAMERA_FRAME_NOT_READY"
        ? "The camera is still starting. Wait a moment and try again."
        : "The photo could not be prepared. Try again, or continue with words.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="face-scan-title" className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/15 bg-[#101522] p-5 text-white shadow-2xl sm:p-7">
        <button type="button" onClick={close} className="absolute right-4 top-4 rounded-full p-2 text-white/65 transition hover:bg-white/10 hover:text-white" aria-label="Close camera check-in">
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-200/10 text-amber-100">
          <Camera className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 id="face-scan-title" className="pr-10 text-xl font-semibold">Camera check-in</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-white/70">
          A photo can help the Guide describe visible details. It cannot tell how you feel or assess your health.
        </p>
        <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-white/65">
          Nothing is shared when you open the camera. The photo appears in your message box for review. It is sent to the configured AI service only if you choose Send, and you can remove it first.
        </p>

        {cameraState === "ready" && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/15 bg-black">
            <video ref={videoRef} autoPlay playsInline muted onLoadedMetadata={() => setPreviewReady(true)} className="aspect-[4/3] w-full object-cover" aria-label="Live camera preview" />
          </div>
        )}
        {cameraState === "opening" && <p role="status" className="mt-4 text-sm text-white/65">Opening camera…</p>}
        {errorMessage && <p role="alert" className="mt-4 rounded-xl border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">{errorMessage}</p>}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={close} className="min-h-11 rounded-full border border-white/15 px-5 text-sm font-medium text-white/75 transition hover:bg-white/5">Continue with words</button>
          {cameraState === "ready" ? (
            <button type="button" onClick={takePhoto} disabled={!previewReady} className="min-h-11 rounded-full bg-amber-200 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-100 disabled:cursor-wait disabled:opacity-60">{previewReady ? "Use this photo" : "Starting preview…"}</button>
          ) : (
            <button type="button" onClick={openCamera} disabled={cameraState === "opening"} className="min-h-11 rounded-full bg-amber-200 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-100 disabled:cursor-wait disabled:opacity-60">{cameraState === "opening" ? "Opening camera…" : "Open camera"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
