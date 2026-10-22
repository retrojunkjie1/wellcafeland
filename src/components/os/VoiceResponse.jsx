import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Headphones, LoaderCircle, Pause, Play, Square } from "lucide-react";
import { speakText } from "@/services/multimodalClient";

function formatForSpeech(value = "") {
  return String(value)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/[>*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function speechLength(text) {
  if (!text) return "";
  const minutes = Math.max(1, Math.ceil(text.split(/\s+/).length / 145));
  return `About ${minutes} min`;
}

function getSpeechErrorMessage(result) {
  switch (result?.code) {
    case "APP_CHECK_REQUIRED":
    case "APP_CHECK_INVALID":
      return "Audio couldn’t verify this app session. Refresh the page and try again; the reply is still here to read.";
    case "AUTH_REQUIRED":
    case "AUTH_INVALID":
      return "Audio couldn’t verify your session. Sign in again and retry; the reply is still here to read.";
    case "RATE_LIMITED":
    case "TTS_PROVIDER_RATE_LIMITED":
      return "Audio is busy right now. Wait a moment and try again; the reply is still here to read.";
    case "TTS_NOT_CONFIGURED":
    case "TTS_PROVIDER_AUTH_FAILED":
      return "Audio playback is unavailable right now. The app team needs to check its voice setup; the reply is still here to read.";
    case "TTS_PROVIDER_UNAVAILABLE":
    case "TTS_PROVIDER_FAILED":
    case "AI_RATE_LIMIT_UNAVAILABLE":
      return "Audio couldn’t be prepared right now. Try again shortly; the reply is still here to read.";
    default:
      return "Audio couldn’t be prepared. You can still read the response above.";
  }
}

const VoiceResponse = forwardRef(function VoiceResponse({ text = "", audioUrl: providedAudioUrl, compact = false, headless = false, onStateChange }, ref) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const generatedUrlRef = useRef(null);
  const playRequestRef = useRef(0);
  const speechText = formatForSpeech(text);
  const hasAudioOption = Boolean(providedAudioUrl || speechText);

  useEffect(() => {
    onStateChange?.({ status, error });
  }, [status, error, onStateChange]);

  const releaseGeneratedUrl = () => {
    if (generatedUrlRef.current) {
      URL.revokeObjectURL(generatedUrlRef.current);
      generatedUrlRef.current = null;
    }
  };

  const stop = () => {
    playRequestRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    utteranceRef.current = null;
    releaseGeneratedUrl();
    setStatus("idle");
    setProgress(0);
  };

  useEffect(() => () => {
    playRequestRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    if (generatedUrlRef.current) URL.revokeObjectURL(generatedUrlRef.current);
  }, []);

  const useDeviceVoice = () => new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function") {
      reject(new Error("Device speech is unavailable"));
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(speechText);
    utteranceRef.current = utterance;
    utterance.rate = 0.96;
    utterance.onstart = () => { setStatus("playing"); resolve(); };
    utterance.onend = () => { utteranceRef.current = null; setStatus("idle"); setProgress(0); };
    utterance.onerror = () => { utteranceRef.current = null; setStatus("idle"); reject(new Error("Device speech failed")); };
    setStatus("loading");
    window.speechSynthesis.speak(utterance);
  });

  const attachAudio = async (url, generated = false) => {
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      audioRef.current = null;
      if (generated) releaseGeneratedUrl();
      setStatus("idle");
      setProgress(0);
    };
    audio.ontimeupdate = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    audio.onerror = () => {
      audioRef.current = null;
      if (generated) releaseGeneratedUrl();
      setStatus("idle");
      setProgress(0);
      setError("Audio couldn't be played. You can still read the response above.");
    };
    await audio.play();
    setStatus("playing");
  };

  const start = async () => {
    setError("");
    setProgress(0);
    const requestId = ++playRequestRef.current;
    if (providedAudioUrl) {
      try {
        await attachAudio(providedAudioUrl);
      } catch {
        try {
          await useDeviceVoice();
        } catch {
          setStatus("idle");
          setError("Audio isn’t available on this device right now. The written reply is still here.");
        }
      }
      return;
    }

    // Chat read-aloud starts the device voice directly in the tap handler. This
    // avoids browser autoplay restrictions and keeps the conversation free of
    // a redundant audio player. The generated player remains available to the
    // dedicated voice workspace below.
    if (headless) {
      try {
        await useDeviceVoice();
        return;
      } catch {
        // Continue to the server voice only when the browser has no speech API.
      }
    }

    setStatus("loading");
    try {
      const result = await speakText(speechText.slice(0, 4096), { voice: "marin" });
      if (requestId !== playRequestRef.current) {
        if (result.audioUrl?.startsWith("blob:")) URL.revokeObjectURL(result.audioUrl);
        return;
      }
      if (!result.ok || !result.audioUrl) {
        try {
          await useDeviceVoice();
        } catch {
          setStatus("idle");
          setError(getSpeechErrorMessage(result));
        }
        return;
      }
      releaseGeneratedUrl();
      generatedUrlRef.current = result.audioUrl;
      try {
        await attachAudio(result.audioUrl, true);
      } catch {
        releaseGeneratedUrl();
        try {
          await useDeviceVoice();
        } catch {
          setStatus("idle");
          setError("Audio isn’t available on this device right now. The written reply is still here.");
        }
      }
    } catch {
      if (requestId === playRequestRef.current) {
        setStatus("idle");
        setError("Audio couldn't be prepared. You can still read the response above.");
      }
    }
  };

  const togglePlayback = async () => {
    if (status === "loading") return;
    if (status === "playing") {
      if (audioRef.current) audioRef.current.pause();
      else if (utteranceRef.current && window.speechSynthesis) window.speechSynthesis.pause();
      setStatus("paused");
    } else if (status === "paused" && audioRef.current) {
      try {
        await audioRef.current.play();
        setStatus("playing");
      } catch {
        setStatus("idle");
        setError("Audio couldn't resume. You can still read the response above.");
      }
    } else if (status === "paused" && utteranceRef.current && window.speechSynthesis) {
      window.speechSynthesis.resume();
      setStatus("playing");
    } else {
      await start();
    }
  };

  useImperativeHandle(ref, () => ({ togglePlayback, stop }), [status, speechText, providedAudioUrl]);

  if (!hasAudioOption) return null;

  if (headless) return null;

  const statusLabel = status === "loading" ? "Preparing audio" :
    status === "playing" ? "Now playing" : status === "paused" ? "Paused" : "Play this response";

  return (
    <div className={`${compact ? "mt-2 w-full max-w-sm" : "my-3 w-full max-w-sm"}`} aria-label="Voice response player">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.035] px-3 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={status === "loading"}
          aria-label={status === "playing" ? "Pause voice response" : status === "paused" ? "Resume voice response" : "Play voice response"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-emerald-200/20 bg-emerald-200/10 text-emerald-100 transition hover:bg-emerald-200/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/70 disabled:opacity-60"
        >
          {status === "loading" ? <LoaderCircle className="h-4 w-4 animate-spin" /> :
            status === "playing" ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-white/80">
              {status === "playing" ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> : <Headphones className="h-3 w-3 text-emerald-200/80" />}
              {statusLabel}
            </span>
            <span className="text-[10px] text-white/50">{speechLength(speechText)}</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Voice playback progress" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-200/70 to-teal-100 transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
        {(status === "playing" || status === "paused" || status === "loading") && (
          <button type="button" onClick={stop} aria-label="Stop voice response" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            <Square className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 pl-2 text-xs text-amber-200/90" role="status">{error}</p>}
    </div>
  );
});

VoiceResponse.displayName = "VoiceResponse";

export default VoiceResponse;
