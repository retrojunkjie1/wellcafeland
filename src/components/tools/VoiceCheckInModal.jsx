// src/components/tools/VoiceCheckInModal.jsx
// Voice Check-In as in-app modal/sheet — never new tab
// Mic permission requested only on press-to-record; calm OS-grade error states

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Loader2, CheckCircle, X, Square, ArrowUp } from "lucide-react";
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

function createCompatibleMediaRecorder(stream) {
  const preferredTypes = [
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
    "audio/webm;codecs=opus",
    "audio/webm",
  ];
  const supportedType = typeof MediaRecorder.isTypeSupported === "function"
    ? preferredTypes.find((type) => MediaRecorder.isTypeSupported(type))
    : "";
  if (supportedType) {
    try {
      return new MediaRecorder(stream, { mimeType: supportedType });
    } catch {
      // Some browsers report support but reject the MIME option; use their default.
    }
  }
  return new MediaRecorder(stream);
}

function getMicErrorMessage(err) {
  const name = err?.name || "";
  const isLan = isLanHost() && !isSecureContextOk();
  if (name === "NotAllowedError") {
    if (isLan) {
      return "Your browser couldn’t use the microphone here. Open this app on a secure connection, or check microphone permission in your browser.";
    }
    return "Your browser couldn’t use the microphone. Check this site’s microphone permission, then try again.";
  }
  if (name === "NotFoundError") {
    return "No microphone detected.";
  }
  if (name === "SecurityError" || (isLan && name === "NotAllowedError")) {
    return "Your browser couldn’t use the microphone here. Open this app on a secure connection, or check microphone permission in your browser.";
  }
  if (isLan) {
    return "Your browser couldn’t use the microphone here. Open this app on a secure connection, or check microphone permission in your browser.";
  }
  return "Your browser couldn’t use the microphone. Check this site’s microphone permission, then try again.";
}

export default function VoiceCheckInModal({ open, onClose, onComplete, mode = "reflection", presentation = "modal", autoStartOnOpen = false }) {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [emotionalState, setEmotionalState] = useState(null);
  const [response, setResponse] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [serviceConsent, setServiceConsent] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const recordingTimeRef = useRef(0);
  const discardRecordingRef = useRef(false);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const waveformLevelsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const cancelStartRef = useRef(false);
  const autoStartConsumedRef = useRef(false);

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
      // MediaRecorder dispatches its final dataavailable event after stop().
      // Keep the mic stream alive until onstop has collected that final chunk.
      mediaRecorderRef.current.stop();
    } else if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        const next = recordingTimeRef.current + 1;
        recordingTimeRef.current = next;
        setRecordingTime(next);
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
    if (mode !== "chat" && !serviceConsent) {
      setErrorMessage("Choose the consent option before sending your recording for transcription.");
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

      if (mode === "chat") {
        onComplete?.({
          transcript: transcriptText,
          type: "voice_message",
        });
        setCompleted(true);
        return;
      }

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
          durationSeconds: recordingTimeRef.current,
        });
      }
    } catch (err) {
      console.error("Check-in processing error:", err);
      setErrorMessage("Failed to process check-in. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [mode, onComplete, serviceConsent]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const width = Math.max(canvas.clientWidth || 0, 280);
    if (canvas.width !== width) {
      canvas.width = width;
      canvas.height = mode === "chat" ? 40 : 64;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    const w = canvas.width;
    const h = canvas.height;
    const mid = h / 2;
    ctx.clearRect(0, 0, w, h);
    if (mode === "chat") {
      ctx.fillStyle = "rgba(255,255,255,0.48)";
      const barCount = Math.max(32, Math.min(112, Math.floor(w / 5)));
      const samplesPerBar = Math.max(1, Math.floor(data.length / barCount));
      const slotWidth = w / barCount;
      const barWidth = Math.max(1.5, slotWidth * 0.55);
      const nextLevels = [];
      for (let bar = 0; bar < barCount; bar++) {
        const start = bar * samplesPerBar;
        const end = Math.min(data.length, start + samplesPerBar);
        let squareSum = 0;
        for (let sample = start; sample < end; sample++) {
          const amplitude = data[sample] - 128;
          squareSum += amplitude * amplitude;
        }
        const rms = end > start ? Math.sqrt(squareSum / (end - start)) : 0;
        const targetHeight = Math.max(2, Math.min(h * 0.88, (rms / 30) * h * 0.88));
        const previousHeight = waveformLevelsRef.current[bar] || 2;
        const smoothing = targetHeight > previousHeight ? 0.38 : 0.2;
        const barHeight = previousHeight + (targetHeight - previousHeight) * smoothing;
        nextLevels.push(barHeight);
        const x = bar * slotWidth + (slotWidth - barWidth) / 2;
        ctx.fillRect(x, mid - barHeight / 2, barWidth, barHeight);
      }
      waveformLevelsRef.current = nextLevels;
    } else {
      ctx.fillStyle = "rgba(15,23,42,0.6)";
      ctx.fillRect(0, 0, w, h);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(245,158,11,0.8)";
      ctx.beginPath();
      const step = w / data.length;
      for (let i = 0; i < data.length; i++) {
        const x = i * step;
        const y = (data[i] / 128) * mid * 0.8 + mid;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }
    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  }, [mode]);

  useEffect(() => {
    if (isRecording) drawWaveform();
    return () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isRecording, drawWaveform]);

  useEffect(() => () => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
  }, [audioPreviewUrl]);

  const attemptGetUserMedia = useCallback(async () => {
    setErrorMessage(null);
    cancelStartRef.current = false;
    setIsStarting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Voice recording is not available in this browser. You can still type your message.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (cancelStartRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const mediaRecorder = createCompatibleMediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error("Live microphone visualization is not supported in this browser.");
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      if (audioContext.state === "suspended") await audioContext.resume();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.82;
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioType = chunksRef.current.find((chunk) => chunk.type)?.type || mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: audioType });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
        if (!discardRecordingRef.current && blob.size > 0) {
          setRecordedAudio(blob);
          if (mode !== "chat") setAudioPreviewUrl(URL.createObjectURL(blob));
        } else if (!discardRecordingRef.current) {
          setErrorMessage("No audio was captured. Try again or type your message.");
        }
      };

      discardRecordingRef.current = false;
      recordingTimeRef.current = 0;
      mediaRecorder.start(1000);
      setIsStarting(false);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      setIsStarting(false);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;
      console.error("Failed to start recording:", err);
      setErrorMessage(err?.name === "Error" ? err.message : getMicErrorMessage(err));
    }
  }, [mode, serviceConsent]);

  const discardAndRetake = useCallback(() => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl("");
    setRecordedAudio(null);
    setTranscript("");
    setCompleted(false);
    setErrorMessage(null);
    recordingTimeRef.current = 0;
    setRecordingTime(0);
  }, [audioPreviewUrl]);

  const startRecording = useCallback(async () => {
    setErrorMessage(null);
    await attemptGetUserMedia();
  }, [attemptGetUserMedia]);

  useEffect(() => {
    if (!open) {
      autoStartConsumedRef.current = false;
      return;
    }
    if (autoStartOnOpen && mode === "chat" && !autoStartConsumedRef.current) {
      autoStartConsumedRef.current = true;
      void startRecording();
    }
  }, [autoStartOnOpen, mode, open, startRecording]);

  const cancelChatRecording = useCallback(() => {
    cancelStartRef.current = true;
    setIsStarting(false);
    discardRecordingRef.current = true;
    stopRecording();
    onClose?.();
  }, [onClose, stopRecording]);

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
  const compactChatState = mode === "chat" && (isStarting || isRecording || processing || Boolean(recordedAudio));

  if (!open) return null;

  const content = (
    <div className={`flex flex-col ${presentation === "inline" ? "bg-slate-950 text-white" : "h-full bg-slate-950 text-white rounded-t-2xl sm:rounded-2xl overflow-hidden"}`}>
      {!compactChatState && <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <h2 className="text-lg font-medium text-white">{mode === "chat" ? "Voice message" : "Voice Check-In"}</h2>
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
      </div>}

      <div className={`${presentation === "inline" ? (compactChatState ? "p-0" : "p-3 space-y-3") : "flex-1 overflow-y-auto p-6 space-y-6"}`}>
        {!compactChatState && <p className="text-sm text-white/70 text-center">
          {mode === "chat" ? "Say what’s on your mind. Send when you’re ready." : "Speak at your own pace. You can listen before continuing."}
        </p>}
        {!completed && mode !== "chat" && (
          <div className="mx-auto max-w-sm space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs leading-relaxed text-white/65">{mode === "chat" ? "Your recording stays with this chat on this device. If you send it, we turn your words into text so the guide can reply." : "Your recording is used to create a text check-in."} <a href="/privacy" className="text-amber-200 underline underline-offset-4">Privacy details</a>.</p>
            <label className="flex min-h-11 items-start gap-3 text-xs leading-relaxed text-white/75">
              <input type="checkbox" checked={serviceConsent} disabled={isRecording || processing} onChange={(event) => { setServiceConsent(event.target.checked); setErrorMessage(null); }} className="mt-0.5 h-4 w-4 accent-amber-300 disabled:opacity-50" />
              I choose to send my audio for transcription and my words to the AI guide.
            </label>
            <p className="text-xs leading-relaxed text-white/55">If you may be in immediate danger, contact local emergency services. In the U.S. or its territories, call or text <a href="tel:988" className="text-amber-200 underline">988</a> or <a href="https://988lifeline.org/get-help/" target="_blank" rel="noreferrer" className="text-amber-200 underline">chat with 988</a>.</p>
          </div>
        )}
        {!completed && mode === "chat" && !compactChatState && (
          <details className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/65">
            <summary className="cursor-pointer py-1 text-white/80">How voice messages are used</summary>
            <p className="pt-2 leading-relaxed">The recording stays with this chat on this device. If you send it, we create a transcript and use your words to prepare a reply. <a href="/privacy" className="text-amber-200 underline underline-offset-4">Privacy details</a>.</p>
            <p className="pt-2 leading-relaxed">If you may be in immediate danger in the U.S., call or text <a href="tel:988" className="text-amber-200 underline">988</a>.</p>
          </details>
        )}

        {showDevLanNote && mode !== "chat" && (
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
                onClick={() => (recordedAudio ? handleProcessCheckIn(recordedAudio) : attemptGetUserMedia())}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition text-sm"
              >
                {recordedAudio ? "Retry transcription" : "Try again"}
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

        <div className={`flex flex-col items-center justify-center ${mode === "chat" ? "min-h-[72px]" : "min-h-[180px]"}`}>
          {isStarting && mode === "chat" ? (
            <div className="flex w-full items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-3 py-2" aria-label="Starting voice recording" role="status">
              <button type="button" onClick={cancelChatRecording} aria-label="Cancel voice recording" title="Cancel recording" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black/15 text-white/70 hover:bg-black/25 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">
                <X className="h-5 w-5" />
              </button>
              <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5" aria-label="Connecting microphone">
                {[8, 14, 20, 12, 24, 15, 9, 18, 11, 22, 13, 8].map((height, index) => <span key={index} className="w-1 rounded-full bg-white/55 animate-pulse" style={{ height, animationDelay: `${index * 55}ms` }} />)}
              </div>
              <span className="sr-only">Connecting microphone</span>
            </div>
          ) : isRecording ? (
            mode === "chat" ? (
              <div className="flex w-full items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-3 py-2" aria-label="Recording voice message">
                <button type="button" onClick={cancelChatRecording} aria-label="Cancel voice recording" title="Cancel recording" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black/15 text-white/70 hover:bg-black/25 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">
                  <X className="h-5 w-5" />
                </button>
                <canvas ref={canvasRef} width={600} height={40} className="h-10 min-w-0 flex-1" aria-label="Live voice waveform" />
                <button type="button" onClick={stopRecording} aria-label="Stop voice recording" title="Stop recording" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">
                  <Square className="h-4 w-4 fill-current" />
                </button>
              </div>
            ) : (
              <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                <div className="text-center text-sm font-medium text-emerald-100">Listening · {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, "0")}</div>
                <canvas ref={canvasRef} width={280} height={64} className="block h-16 w-full rounded-xl border border-white/10 bg-slate-900/50" />
                <div className="flex justify-center">
                  <button type="button" onClick={stopRecording} aria-label="Stop voice check-in recording" className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-red-400 bg-red-400/20 hover:bg-red-400/30">
                    <MicOff className="h-8 w-8 text-red-400" />
                  </button>
                </div>
                <p className="text-center text-sm text-white/60">Tap stop when you’re ready.</p>
              </div>
            )
          ) : processing ? (
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-amber-400 mx-auto mb-4" />
              <div className="text-white/70">{mode === "chat" ? "Transcribing…" : "Processing your check-in..."}</div>
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

              {audioPreviewUrl && <audio controls preload="metadata" src={audioPreviewUrl} className="w-full" aria-label="Play your recorded voice message" />}

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
                  <h3 className="text-sm font-medium text-amber-200 mb-2">A reflection</h3>
                  <p className="text-white leading-relaxed text-sm">{response.text || response.grounding}</p>
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
          ) : recordedAudio && mode === "chat" ? (
            <div className="flex w-full items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-3 py-2" aria-label="Voice recording ready to send">
              <button type="button" onClick={cancelChatRecording} aria-label="Discard recording and close" title="Discard recording" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black/15 text-white/70 hover:bg-black/25 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">
                <X className="h-5 w-5" />
              </button>
            <p className="min-w-0 flex-1 text-sm text-white/70">Tap ↑ to transcribe and send</p>
            <button type="button" onClick={() => handleProcessCheckIn(recordedAudio)} disabled={processing} aria-label="Transcribe and send voice message" title="Transcribe and send voice message" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-slate-950 hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 disabled:opacity-50">
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          ) : recordedAudio && audioPreviewUrl ? (
            <div className="w-full space-y-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.04] p-4">
              <p className="text-center text-sm font-medium text-emerald-100">Your recording is ready</p>
              <audio controls preload="metadata" src={audioPreviewUrl} onError={() => setErrorMessage("This recording could not be played. Please record it again.")} className="w-full" aria-label="Play your recorded voice message" />
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={discardAndRetake} className="min-h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white hover:bg-white/10">Record again</button>
                <button type="button" onClick={() => handleProcessCheckIn(recordedAudio)} disabled={processing || (mode !== "chat" && !serviceConsent)} className="min-h-11 rounded-xl border border-amber-200/60 bg-amber-300 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50">{mode === "chat" ? "Send voice message" : "Transcribe check-in"}</button>
              </div>
              {errorMessage && <p role="alert" className="text-sm text-rose-200">{errorMessage}</p>}
            </div>
          ) : (
            <div className="text-center">
              <button
                type="button"
                onClick={startRecording}
                aria-label={mode === "chat" ? "Start voice message recording" : "Start voice check-in recording"}
                className="mx-auto mt-6 w-20 h-20 rounded-full border border-amber-400/70 bg-amber-400/10 shadow-[0_0_0_6px_rgba(245,158,11,0.10)] flex items-center justify-center active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Mic className="w-7 h-7 text-amber-400 opacity-90" />
              </button>
              <p className="text-sm text-white/60 mt-4">Tap to start. Your microphone is used only while recording.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (presentation === "inline") {
    return (
      <section className={`w-full text-white ${compactChatState ? "" : "rounded-2xl border border-emerald-200/20 bg-slate-950/85 p-3 shadow-xl"}`} aria-label="Voice message">
        <div className="max-h-[34vh] overflow-y-auto">{content}</div>
      </section>
    );
  }

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
