// src/components/os/VoiceInput.jsx
// ChatGPT-style press-and-hold voice input with waveform animation

import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { transcribeAudio } from "@/services/multimodalClient";

const VoiceInput = ({ onTranscript, onSend, disabled, onComplete, onRecording, mode = "chat" }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const buttonRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      audioChunksRef.current = [];
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Phase 14: If onComplete is provided or mode is voice-session, call it with audioBlob (opens workspace)
        if (onComplete || mode === "voice-session") {
          if (onComplete) {
            onComplete(audioBlob);
          }
          setIsProcessing(false);
          setRecordingTime(0);
          return;
        }

        // Otherwise, transcribe using OpenAI Whisper
        setIsProcessing(true);
        try {
          const result = await transcribeAudio(audioBlob, "audio/webm");
          if (result.ok && result.text) {
            onTranscript?.(result.text);
            // Auto-send if onSend is provided
            if (onSend && result.text.trim()) {
              onSend(result.text);
            }
          } else {
            console.warn("Transcription failed:", result.error);
          }
        } catch (err) {
          console.error("Transcription error:", err);
        } finally {
          setIsProcessing(false);
          setRecordingTime(0);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      onRecording?.(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Haptic feedback (if available)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (err) {
      console.error("Failed to start recording:", err);
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecording?.(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
    }
  };

  // Mouse/touch handlers for press-and-hold
  const handleMouseDown = (e) => {
    e.preventDefault();
    if (!disabled && !isRecording && !isProcessing) {
      startRecording();
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    }
  };

  const handleMouseLeave = (e) => {
    if (isRecording) {
      stopRecording();
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    e.preventDefault();
    if (!disabled && !isRecording && !isProcessing) {
      startRecording();
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled || isProcessing}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`relative rounded-full p-2.5 transition-all ${
          isRecording
            ? "bg-red-500/20 text-red-400 border-2 border-red-500/50 scale-110"
            : isProcessing
            ? "bg-white/10 text-white/50"
            : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={
          isRecording
            ? `Recording... ${formatTime(recordingTime)}`
            : isProcessing
            ? "Processing..."
            : "Hold to record"
        }
      >
        {isProcessing ? (
          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : isRecording ? (
          <>
            <MicOff className="h-4 w-4" />
            {recordingTime > 0 && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-red-400 whitespace-nowrap">
                {formatTime(recordingTime)}
              </span>
            )}
          </>
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </button>

      {/* Waveform animation when recording */}
      {isRecording && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1">
          <span className="text-[10px] text-red-400/80">Listening…</span>
          <div className="flex items-center gap-0.5 h-3">
            {[1, 2, 3, 2, 1, 2, 3].map((height, i) => (
              <div
                key={i}
                className="w-0.5 bg-red-400/60 rounded-full animate-pulse"
                style={{
                  height: `${height * 3}px`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: "600ms",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
