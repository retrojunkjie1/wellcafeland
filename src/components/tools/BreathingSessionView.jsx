// src/components/tools/BreathingSessionView.jsx
// Phase 53: Luxury breathing — LuxuryBreathingShell, no scrollbars, OS-native controls

import React, { useEffect, useState, useRef } from "react";
import { useSmartNav } from "@/navigation/useSmartNav";
import { speakText, unlockAudio, stopSpeaking, getDiagnostics } from "@/utils/voiceGuide";
import LuxuryBreathingShell from "@/features/breathing/LuxuryBreathingShell";

export const BreathingSessionView = ({
  isActive,
  onCycleComplete,
  pattern = [4, 4, 4, 4], // inhale, hold, exhale, hold
  voiceEnabled = false, // Voice guide option
}) => {
  const { back } = useSmartNav();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState(voiceEnabled);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const audioRef = useRef(null);
  const speechRef = useRef(null);
  const cycleCountRef = useRef(0);

  // Voice guide using voiceGuide module
  const speakPhase = React.useCallback(async (phaseName, count) => {
    if (!voiceGuideEnabled || !audioUnlocked) return;
    
    stopSpeaking();
    
    let instruction = "";
    if (phaseName === "inhale") {
      instruction = `Breathe in gently through your nose for a count of ${count}.`;
    } else if (phaseName === "exhale") {
      instruction = `Exhale slowly through your mouth for a count of ${count}.`;
    } else if (phaseName === "hold1" || phaseName === "hold2") {
      instruction = "Hold gently. Nothing to do.";
    }
    
    if (instruction) {
      await speakText(instruction, { rate: 0.85, pitch: 1.0, volume: 0.8 });
    }
  }, [voiceGuideEnabled, audioUnlocked]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      setPhase("idle");
      cycleCountRef.current = 0;
      // Stop audio when session ends
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    // Determine phases based on pattern (4-6 breathing has no holds)
    const hasHolds = pattern[1] > 0 || pattern[3] > 0;
    const phases = hasHolds ? ["inhale", "hold1", "exhale", "hold2"] : ["inhale", "exhale"];
    setPhase(phases[0]);
    setPhaseIndex(0);
    cycleCountRef.current = 0;

    let cancelled = false;

    const runCycle = (currentIndex) => {
      if (cancelled) return;

      const phaseName = phases[currentIndex];
      const count = pattern[currentIndex] || pattern[0] || 4;
      const ms = count * 1000;
      
      setPhase(phaseName);
      
      // Speak phase instruction if voice guide enabled
      // Note: iOS requires user interaction - ensure voice toggle was user-initiated
      if (voiceGuideEnabled && speakPhase) {
        speakPhase(phaseName, count);
      }

      const timeoutId = setTimeout(() => {
        if (cancelled) return;

        const nextIndex = (currentIndex + 1) % phases.length;
        setPhaseIndex(nextIndex);

        if (nextIndex === 0) {
          cycleCountRef.current += 1;
          if (onCycleComplete) {
            onCycleComplete();
          }
        }
        runCycle(nextIndex);
      }, ms);

      return () => clearTimeout(timeoutId);
    };

    const cleanup = runCycle(0);

    return () => {
      cancelled = true;
      if (typeof cleanup === "function") cleanup();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isActive, pattern, onCycleComplete, voiceGuideEnabled]);

  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getScale = () => {
    if (!isActive || reducedMotion) return 1;
    if (phase === "inhale") return 1.4;
    if (phase === "exhale") return 0.75;
    return 1.0;
  };

  const getOpacity = () => {
    if (!isActive) return 0.6;
    if (phase === "inhale") return 1.0;
    if (phase === "exhale") return 0.85;
    return 0.9;
  };

  // Determine pattern type (4-6 vs 4-7-8)
  const is46Breathing = pattern[0] === 4 && pattern[2] === 6 && pattern[1] === 0 && pattern[3] === 0;
  const patternLabel = is46Breathing ? "4 – 6" : `${pattern[0]} – ${pattern[1] || 0} – ${pattern[2] || pattern[0]}`;
  
  const phaseLabel =
    phase === "inhale"
      ? `Inhale gently through your nose for ${pattern[0]}`
      : phase === "exhale"
      ? `Exhale slowly through your mouth for ${pattern[2] || pattern[0]}`
      : phase === "hold1"
      ? "Hold gently – nothing to do"
      : phase === "hold2"
      ? "Rest for a moment"
      : "Press Begin to start";

  const handleToggleVoice = async () => {
    const newState = !voiceGuideEnabled;
    if (newState) {
      const unlocked = unlockAudio();
      setAudioUnlocked(unlocked);
      if (unlocked && isActive && phase !== "idle") {
        const currentCount = pattern[phase === "inhale" ? 0 : phase === "exhale" ? 2 : 0] || 4;
        await speakPhase(phase, currentCount);
      }
    } else {
      stopSpeaking();
    }
    setVoiceGuideEnabled(newState);
  };

  return (
    <>
      <LuxuryBreathingShell
        onBack={back}
        voiceEnabled={voiceGuideEnabled}
        onToggleVoice={handleToggleVoice}
      >
        <div className="flex flex-col items-center justify-center gap-6 overflow-hidden flex-1 min-h-0 w-full">
          {/* Orb: 420–520px responsive, premium centerpiece — aspect container clips overflow */}
          <div
            className="relative flex aspect-square w-[min(90vw,420px)] sm:w-[min(85vw,520px)] max-w-[520px] items-center justify-center overflow-hidden shrink-0"
            style={{
              transform: `scale(${getScale()})`,
              opacity: getOpacity(),
              transition: reducedMotion ? "none" : "all 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              filter: isActive ? "blur(0px)" : "blur(1px)",
            }}
          >
            {/* Outer glow */}
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-60"
              style={{
                background: `radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(217,119,6,0.25) 30%, transparent 80%)`,
                transform: `scale(${getScale() * 1.8})`,
                transition: "transform 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            />
            {/* Main orb — gradient + blur, subtle ring */}
            <div
              className="relative flex h-full w-full items-center justify-center rounded-full border border-white/10"
              style={{
                background: `radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.2) 0%, rgba(251,191,36,0.25) 20%, rgba(59,130,246,0.15) 60%, rgba(15,23,42,0.85) 100%)`,
                backdropFilter: "blur(20px)",
                boxShadow: `0 0 60px rgba(251,191,36,0.4), inset 0 0 40px rgba(255,255,255,0.08)`,
                transform: `scale(${getScale()})`,
                transition: "all 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            >
              {/* Inner depth */}
              <div
                className="absolute inset-4 rounded-full"
                style={{
                  background: "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.1) 0%, transparent 70%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              {/* Shimmer */}
              <div
                className="absolute inset-0 rounded-full opacity-30"
                style={{
                  background: "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 45%, transparent 90%)",
                  backgroundSize: "200% 200%",
                  animation: isActive && !reducedMotion ? "luxuryShimmer 4s ease-in-out infinite" : "none",
                }}
              />
              {/* Typography: count (4–6) muted gold/white */}
              <div className="relative z-10 flex flex-col items-center gap-2 text-center px-6">
                <span className="text-xl sm:text-2xl font-light text-amber-200/90 tracking-[0.2em]">
                  {patternLabel}
                </span>
                <span className="text-xs font-extralight uppercase tracking-[0.25em] text-slate-300/70">
                  {phase === "idle" ? "Ready" : phase}
                </span>
              </div>
              {/* Pulse ring */}
              {isActive && !reducedMotion && (
                <div
                  className="absolute inset-[-8px] rounded-full border border-amber-300/40"
                  style={{ animation: "luxuryPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
                />
              )}
            </div>
          </div>
          {/* Instruction: text-slate-300/70, small */}
          <p className="mb-2 max-w-sm text-center text-sm text-slate-300/70 leading-relaxed">
            {phaseLabel}
          </p>
          {voiceGuideEnabled && !getDiagnostics().voiceSupported && (
            <p className="text-xs text-amber-200/70">Voice guide unavailable on this device.</p>
          )}
          {voiceGuideEnabled && getDiagnostics().voiceSupported && getDiagnostics().lastError && (
            <p className="text-xs text-amber-200/70">Voice had a hiccup. Tap the button to retry.</p>
          )}
        </div>
      </LuxuryBreathingShell>
      <style>{`
        @keyframes luxuryShimmer {
          0%, 100% { background-position: -200% center; }
          50% { background-position: 200% center; }
        }
        @keyframes luxuryPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </>
  );
};
