// src/components/os/VoiceResponse.jsx
// ChatGPT-style audio player with waveform animation

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { speakText } from "@/services/multimodalClient";

const VoiceResponse = ({ text, audioUrl: providedAudioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      // Phase 14: Cleanup: stop audio and revoke URLs
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        try {
          URL.revokeObjectURL(audioUrlRef.current);
        } catch (err) {
          console.warn("Failed to revoke audio URL:", err);
        }
        audioUrlRef.current = null;
      }
      if (providedAudioUrl && providedAudioUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(providedAudioUrl);
        } catch (err) {
          console.warn("Failed to revoke provided audio URL:", err);
        }
      }
    };
  }, [providedAudioUrl]);

  const handlePlay = async () => {
    if (!text && !providedAudioUrl) return;

    if (isPlaying) {
      // Stop playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    // If audio URL is provided, use it directly
    if (providedAudioUrl) {
      try {
        const audio = new Audio(providedAudioUrl);
        audio.onended = () => {
          setIsPlaying(false);
        };
        audio.onerror = () => {
          setIsPlaying(false);
          console.error("Audio playback failed");
        };
        audioRef.current = audio;
        await audio.play();
        setIsPlaying(true);
        return;
      } catch (err) {
        console.error("Failed to play provided audio:", err);
      }
    }

    // Otherwise, generate TTS
    if (!text) return;

    setIsLoading(true);
    try {
      const result = await speakText(text);
      if (result.ok && result.audioUrl) {
        const audio = new Audio(result.audioUrl);
        
        audio.onended = () => {
          setIsPlaying(false);
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
          }
        };
        audio.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
          }
        };

        audioUrlRef.current = result.audioUrl;
        audioRef.current = audio;
        await audio.play();
        setIsPlaying(true);
      } else {
        // Fallback to browser SpeechSynthesis
        fallbackToBrowserTTS(text);
      }
    } catch (err) {
      console.error("TTS failed:", err);
      fallbackToBrowserTTS(text);
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackToBrowserTTS = (textToSpeak) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    utterance.lang = "en-US";

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Victoria")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Load voices on mount
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  if (!audioEnabled) {
    return (
      <button
        type="button"
        onClick={() => setAudioEnabled(true)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition text-xs"
        title="Enable audio"
      >
        <VolumeX className="h-3 w-3" />
        <span>Audio</span>
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 mt-2 w-full sm:w-auto">
      <button
        type="button"
        onClick={handlePlay}
        disabled={isLoading || (!text && !providedAudioUrl)}
        className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm transition ${
          isPlaying
            ? "bg-white/10 text-white"
            : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isPlaying ? "Stop playback" : isLoading ? "Loading..." : "Play response"}
      >
        {isLoading ? (
          <>
            <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Loading...</span>
          </>
        ) : isPlaying ? (
          <>
            <Pause className="h-3.5 w-3.5" />
            <WaveformAnimation />
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5" />
            <span>Listen</span>
          </>
        )}
      </button>
    </div>
  );
};

// Waveform animation component
const WaveformAnimation = () => {
  return (
    <div className="flex items-center gap-0.5 h-3">
      {[1, 2, 3, 2, 1, 2, 3, 2].map((height, i) => (
        <div
          key={i}
          className="w-0.5 bg-white/80 rounded-full animate-pulse"
          style={{
            height: `${height * 3}px`,
            animationDelay: `${i * 80}ms`,
            animationDuration: "500ms",
          }}
        />
      ))}
    </div>
  );
};

export default VoiceResponse;
