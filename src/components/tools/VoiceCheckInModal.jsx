// src/components/tools/VoiceCheckInModal.jsx
// Voice Check-In as in-app modal/sheet — never new tab
// Mic permission requested only on press-to-record; calm OS-grade error states

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Loader2, CheckCircle, X } from "lucide-react";
import { detectEmotionFromText, transcribeAudio, guideEngine } from "@/services/multimodalClient";

const isSecureContextOk = () => {
  if (typeof window === "undefined") return false;
  if (window.isSecureContext) return true;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
};

const isLanHost = () => {
  if (typeof window === "undefined") return false;
  return /^192\.168\./.test(window.location.hostname);
};

const isDevLanBaseUrl = () => {
  const base = import.meta.env?.VITE_PHASE53_BASE_URL || import.meta.env?.PHASE53_BASE_URL || "";
  return /^https?:\/\/192\.168\./.test(base) || /^192\.168\./.test(base);
};

const TEXT_FALLBACK_PREFILL = "You don't have to explain—just tell me what's happening right now, in one breath.";

function getMicErrorMessage(err) {
  const name = err?.name || "";
  const isLan = isLanHost() && !isSecureContextOk();
  if (name === "NotAllowedError") {
    if (isLan) {
      return "Voice recording requires HTTPS or localhost. On this network URL, audio capture may be blocked. Use http://127.0.0.1:5173 on this machine or set up HTTPS for LAN.";
    }
    return "Microphone access denied. Enable in browser settings.";
  }
  if (name === "NotFoundError") {
    return "No microphone detected.";
  }
  if (name === "SecurityError" || (isLan && name === "NotAllowedError")) {
    return "Voice recording requires HTTPS or localhost. On this network URL, audio capture may be blocked. Use http://127.0.0.1:5173 on this machine or set up HTTPS for LAN.";
  }
  if (isLan) {
    return "Voice recording requires HTTPS or localhost. On this network URL, audio capture may be blocked. Use http://127.0.0.1:5173 on this machine or set up HTTPS for LAN.";
  }
  return "Microphone access denied. Enable in browser settings.";
}

export default function VoiceCheckInModal({ open, onClose, onComplete }) {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [emotionalState, setEmotionalState] = useState(null);
  const [response, setResponse] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const recordingTimeRef = useRef(0);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const stopRecording = useCallback(() => {
    if (animationFrameRef.current != null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    try {
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
    } catch (_) {}
    audioContextRef.current = null;
    analyserRef.current = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
          recordingTimeRef.current = next;
          if (next >= 19) stopRecording();
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, stopRecording]);

  const handleProcessCheckIn = useCallback(async (blob) => {
    const duration = recordingTimeRef.current;
    if (duration < 3) {
      setErrorMessage("Please record at least 3 seconds for a meaningful check-in.");
      return;
    }

    setProcessing(true);
    setErrorMessage(null);
    try {
      const transcriptionResult = await transcribeAudio(blob);
      if (!transcriptionResult.ok || !transcriptionResult.text) {
        setErrorMessage("Failed to transcribe. Please try again.");
        setProcessing(false);
        return;
      }

      const transcriptText = transcriptionResult.text;
      setTranscript(transcriptText);

      const emotion = detectEmotionFromText(transcriptText);
      setEmotionalState({
        state: emotion.emotionalState,
        intensity: emotion.intensity,
        tags: emotion.tags,
      });

      let groundingSuggestion = "";
      if (emotion.emotionalState === "anxious" && emotion.intensity >= 3) {
        groundingSuggestion = "Take 3 deep breaths. Name 5 things you can see around you.";
      } else if (emotion.emotionalState === "craving") {
        groundingSuggestion = "This urge will pass. You're safe right now. What's one thing you can do to stay grounded?";
      } else if (emotion.emotionalState === "overwhelmed") {
        groundingSuggestion = "You're doing your best. Can you name one small thing that's okay right now?";
      } else if (emotion.emotionalState === "grounded") {
        groundingSuggestion = "You're in a good space. What's one thing you're grateful for in this moment?";
      } else {
        groundingSuggestion = "Thank you for checking in. You're here, and that matters.";
      }

      const aiResponse = await guideEngine(transcriptText, { mode: "default" });

      setResponse({
        text: aiResponse.ok ? aiResponse.content : groundingSuggestion,
        grounding: groundingSuggestion,
      });

      setCompleted(true);

      if (onComplete) {
        onComplete({
          type: "tool_result",
          toolId: "voice-checkin",
          title: "Voice Check-In",
          summary: `Emotional state: ${emotion.emotionalState} (${emotion.intensity}/5)`,
          data: {
            transcript: transcriptText,
            emotionalState: emotion.emotionalState,
            intensity: emotion.intensity,
            tags: emotion.tags,
            grounding: groundingSuggestion,
          },
          durationSeconds: duration,
        });
      }
    } catch (err) {
      console.error("Check-in processing error:", err);
      setErrorMessage("Failed to process check-in. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [onComplete]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const parent = canvas.parentElement;
    if (parent && canvas.width !== parent.offsetWidth) {
      canvas.width = parent.offsetWidth || 280;
      canvas.height = 64;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "rgba(15,23,42,0.6)";
    ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(245,158,11,0.8)";
    ctx.beginPath();
    const step = w / data.length;
    const mid = h / 2;
    for (let i = 0; i < data.length; i++) {
      const x = i * step;
      const y = (data[i] / 128) * mid * 0.8 + mid;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  const attemptGetUserMedia = useCallback(async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        handleProcessCheckIn(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      drawWaveform();
    } catch (err) {
      console.error("Failed to start recording:", err);
      setErrorMessage(getMicErrorMessage(err));
    }
  }, [handleProcessCheckIn, drawWaveform]);

  const startRecording = useCallback(async () => {
    setErrorMessage(null);
    await attemptGetUserMedia();
  }, [attemptGetUserMedia]);

  const goToTextChat = useCallback(() => {
    setErrorMessage(null);
    onClose?.();
    navigate("/chat?prefill=" + encodeURIComponent(TEXT_FALLBACK_PREFILL));
  }, [navigate, onClose]);

  const copyLocalhostUrl = useCallback(() => {
    const url = "http://127.0.0.1:5173" + (window.location.pathname || "/") + (window.location.search || "");
    navigator.clipboard?.writeText(url).then(() => {}).catch(() => {});
  }, []);

  const showDevLanNote = isDevLanBaseUrl() && isLanHost() && !isSecureContextOk();

  if (!open) return null;

  const content = (
    <div className="flex flex-col h-full bg-slate-950 text-white rounded-t-2xl sm:rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <h2 className="text-lg font-medium text-white">Voice Check-In</h2>
        {!completed && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <p className="text-sm text-white/70 text-center">
          Name what's present in one breath (10–20 seconds)
        </p>

        {showDevLanNote && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-2 text-xs text-amber-200/90 max-w-sm mx-auto mb-6">
            Dev: Mic may be blocked on LAN (HTTP). Use http://127.0.0.1:5173 for local testing.
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 max-w-sm mx-auto mb-6">
            <p className="text-sm text-amber-200 mb-3">{errorMessage}</p>
            <div className="flex flex-wrap gap-2">
              {!isSecureContextOk() && isLanHost() && (
                <button
                  type="button"
                  onClick={copyLocalhostUrl}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30 transition text-sm"
                >
                  Copy localhost URL
                </button>
              )}
              <button
                type="button"
                onClick={attemptGetUserMedia}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition text-sm"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={goToTextChat}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition text-sm"
              >
                Use text instead
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center min-h-[180px]">
          {isRecording ? (
            <>
              <div className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-medium text-white mb-1">{recordingTime}s</div>
                  <div className="text-sm text-white/50">Recording...</div>
                  {recordingTime < 3 && (
                    <div className="text-xs text-yellow-400 mt-1">Keep going...</div>
                  )}
                </div>
                <div className="w-full">
                  <canvas
                    ref={canvasRef}
                    width={280}
                    height={64}
                    className="w-full h-16 rounded-xl bg-slate-900/50 border border-white/10 block"
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onMouseUp={stopRecording}
                    onTouchEnd={stopRecording}
                    className="h-20 w-20 rounded-full bg-red-400/20 border-4 border-red-400 flex items-center justify-center hover:bg-red-400/30 transition"
                  >
                    <MicOff className="h-8 w-8 text-red-400" />
                  </button>
                </div>
                <p className="text-center text-sm text-white/50">Release to stop</p>
              </div>
            </>
          ) : processing ? (
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-amber-400 mx-auto mb-4" />
              <div className="text-white/70">Processing your check-in...</div>
            </div>
          ) : completed ? (
            <div className="w-full space-y-4">
              <div className="text-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                <div className="text-white/70">Check-in complete</div>
              </div>

              {transcript && (
                <div className="rounded-xl p-4 border border-white/10 bg-white/5">
                  <h3 className="text-sm font-medium text-white/70 mb-2">What You Said</h3>
                  <p className="text-white leading-relaxed text-sm">{transcript}</p>
                </div>
              )}

              {emotionalState && (
                <div className="rounded-xl p-4 border border-white/10 bg-white/5">
                  <h3 className="text-sm font-medium text-white/70 mb-2">Emotional State</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white capitalize">{emotionalState.state}</span>
                    <span className="text-xs text-white/50">({emotionalState.intensity}/5)</span>
                  </div>
                </div>
              )}

              {response && (
                <div className="rounded-xl p-4 border border-amber-400/30 bg-amber-400/10">
                  <h3 className="text-sm font-medium text-amber-200 mb-2">Grounding Suggestion</h3>
                  <p className="text-white leading-relaxed text-sm">{response.grounding}</p>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/15 transition"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                type="button"
                onMouseDown={startRecording}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startRecording();
                }}
                className="mx-auto mt-6 w-20 h-20 rounded-full border border-amber-400/70 bg-amber-400/10 shadow-[0_0_0_6px_rgba(245,158,11,0.10)] flex items-center justify-center active:scale-[0.99]"
              >
                <Mic className="w-7 h-7 text-amber-400 opacity-90" />
              </button>
              <p className="text-sm text-white/50 mt-4">Press and hold to record</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md max-h-[90vh] sm:max-h-[85vh] flex flex-col"
        style={{
          height: isMobile ? "auto" : "auto",
          maxHeight: isMobile ? "85vh" : "85vh",
        }}
      >
        {content}
      </div>
    </div>
  );
}
