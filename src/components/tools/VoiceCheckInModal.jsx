// src/components/tools/VoiceCheckInModal.jsx
// Voice Check-In as in-app modal/sheet — never new tab
// Mic permission requested only on press-to-record; calm OS-grade error states

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Loader2, CheckCircle, X } from "lucide-react";
import { detectEmotionFromText, transcribeAudio } from "@/services/multimodalClient";
import { callAgent } from "@/agents/aiAgents";

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

const TEXT_FALLBACK_PREFILL = "You don't have to explain everything—share only what feels comfortable.";

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
  const [serviceConsent, setServiceConsent] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const recordingTimeRef = useRef(0);
  const discardRecordingRef = useRef(false);
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
        const next = Math.min(recordingTimeRef.current + 1, 20);
        recordingTimeRef.current = next;
        setRecordingTime(next);
        if (next >= 20) stopRecording();
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

  useEffect(() => {
    if (!open) {
      discardRecordingRef.current = true;
      stopRecording();
    }
    return () => {
      discardRecordingRef.current = true;
      stopRecording();
    };
  }, [open, stopRecording]);

  const handleProcessCheckIn = useCallback(async (blob) => {
    const duration = recordingTimeRef.current;
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
        groundingSuggestion = "If it feels useful, notice a neutral object nearby or let your breath stay natural. You can skip either.";
      } else if (emotion.emotionalState === "craving") {
        groundingSuggestion = "You can pause, choose any support that feels right, or contact someone you trust. This practice cannot predict what happens next.";
      } else if (emotion.emotionalState === "overwhelmed") {
        groundingSuggestion = "Take this at your own pace. A small next step—or stopping here—is okay.";
      } else if (emotion.emotionalState === "grounded") {
        groundingSuggestion = "Notice what feels supportive, if anything, and choose whether you want to continue.";
      } else {
        groundingSuggestion = "Thank you for checking in. You're here, and that matters.";
      }

      const aiResponse = await callAgent("oracle", {
        mode: "voice_check_in_reflection",
        transcript: transcriptText,
        instruction: "Offer one brief, non-diagnostic, optional reflection. Do not infer immediate safety or prescribe breathing.",
      });

      setResponse({
        text: aiResponse?.reply || groundingSuggestion,
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
    if (!serviceConsent) {
      setErrorMessage("Choose whether to send your audio for transcription and response before recording.");
      return;
    }
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
        if (!discardRecordingRef.current) handleProcessCheckIn(blob);
      };

      discardRecordingRef.current = false;
      recordingTimeRef.current = 0;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      drawWaveform();
    } catch (err) {
      console.error("Failed to start recording:", err);
      setErrorMessage(getMicErrorMessage(err));
    }
  }, [handleProcessCheckIn, drawWaveform, serviceConsent]);

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
          Speak at any pace for up to 20 seconds. You can stop at any time.
        </p>
        {!completed && (
          <div className="mx-auto max-w-sm space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs leading-relaxed text-white/65">Your audio is sent for transcription, and the transcript is sent for an AI response. Automated emotional labels may be wrong and are not a diagnosis. Review our <a href="/privacy" className="text-amber-200 underline underline-offset-4">Privacy Notice</a>.</p>
            <label className="flex min-h-11 items-start gap-3 text-xs leading-relaxed text-white/75">
              <input type="checkbox" checked={serviceConsent} onChange={(event) => setServiceConsent(event.target.checked)} className="mt-0.5 h-4 w-4 accent-amber-300" />
              I choose to send my audio and transcript to these services for this check-in.
            </label>
            <p className="text-xs leading-relaxed text-white/55">If you may be in immediate danger, contact local emergency services. In the U.S. or its territories, call or text <a href="tel:988" className="text-amber-200 underline">988</a> or <a href="https://988lifeline.org/get-help/" target="_blank" rel="noreferrer" className="text-amber-200 underline">chat with 988</a>.</p>
          </div>
        )}

        {showDevLanNote && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-2 text-xs text-amber-200/90 max-w-sm mx-auto mb-6">
            Dev: Mic may be blocked on LAN (HTTP). Use http://127.0.0.1:5173 for local testing.
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 max-w-sm mx-auto mb-6">
            <p role="alert" className="text-sm text-amber-200 mb-3">{errorMessage}</p>
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
                    onClick={stopRecording}
                    aria-label="Stop voice check-in recording"
                    className="h-20 w-20 rounded-full bg-red-400/20 border-4 border-red-400 flex items-center justify-center hover:bg-red-400/30 transition"
                  >
                    <MicOff className="h-8 w-8 text-red-400" />
                  </button>
                </div>
                  <p className="text-center text-sm text-white/50">Select Stop recording when you are ready.</p>
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
                  <h3 className="text-sm font-medium text-white/70 mb-2">Automatic reflection · may not fit</h3>
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
                onClick={startRecording}
                disabled={!serviceConsent}
                aria-label="Start voice check-in recording"
                className="mx-auto mt-6 w-20 h-20 rounded-full border border-amber-400/70 bg-amber-400/10 shadow-[0_0_0_6px_rgba(245,158,11,0.10)] flex items-center justify-center active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Mic className="w-7 h-7 text-amber-400 opacity-90" />
              </button>
              <p className="text-sm text-white/50 mt-4">{serviceConsent ? "Select to begin recording" : "Choose whether to share audio before recording"}</p>
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
