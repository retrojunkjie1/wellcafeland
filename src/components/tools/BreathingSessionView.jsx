// src/components/tools/BreathingSessionView.jsx
// Luxury cinematic orb-based breathing session with premium voice guide
// Multi-million dollar wellness experience

import React, { useEffect, useState, useRef } from "react";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useSmartNav } from "@/navigation/useSmartNav";
import { speakText, unlockAudio, stopSpeaking, getDiagnostics } from "@/utils/voiceGuide";
import { runBreathingScheduler, createBreathingScheduler } from "@/experience/audio/breathingProgram";
import { useAudio } from "@/experience/audio/AudioProvider";
import { useSpokenGuidance } from "@/experience/audio/useSpokenGuidance";

export const BreathingSessionView = ({
  isActive,
  onCycleComplete,
  pattern = [4, 4, 4, 4], // inhale, hold, exhale, hold
  voiceEnabled = false, // Voice guide option
}) => {
  const { back } = useSmartNav();
  const audio = useAudio();
  const { playGuidance } = useSpokenGuidance();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [audioPhase, setAudioPhase] = useState(null);
  const [cycleCount, setCycleCount] = useState(0);
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState(voiceEnabled);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const audioRef = useRef(null);
  const speechRef = useRef(null);
  const cycleCountRef = useRef(0);
  const schedulerRef = useRef(null);
  const ambienceRef = useRef(null);
  const hasStartedOnceRef = useRef(false);

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

  // Phase 56 Day 2: single guided breathing scheduler + ambience. No double-start; cleanup on stop/unmount.
  useEffect(() => {
    if (!isActive) {
      if (schedulerRef.current) {
        schedulerRef.current.stop();
        schedulerRef.current = null;
      }
      try {
        audio?.stopAll?.();
      } catch (e) {}
      if (ambienceRef.current) {
        try {
          ambienceRef.current.pause();
        } catch (e) {}
        ambienceRef.current = null;
      }
      setAudioPhase(null);
      setCycleCount(0);
      hasStartedOnceRef.current = false;
      return;
    }
    if (schedulerRef.current) return;
    try {
      playGuidance("breathing_intro");
    } catch (e) {}
    const onTick = (p) => {
      setAudioPhase(p);
      if (p === "inhale") {
        if (hasStartedOnceRef.current) setCycleCount((c) => c + 1);
        hasStartedOnceRef.current = true;
      }
    };
    if (audio) {
      const s = createBreathingScheduler({ audio, onTick });
      schedulerRef.current = s;
      s.start();
      try {
        audio.play("ambience_soft", { loop: true, volume: 0.15 });
      } catch (e) {}
    } else {
      const playCue = ({ phase: p, path: pathUrl }) => {
        onTick(p);
        try {
          const a = new Audio(pathUrl);
          a.volume = 0.4;
          a.play().catch(() => {});
        } catch (e) {}
      };
      const stopFn = runBreathingScheduler(undefined, playCue);
      schedulerRef.current = { start: () => {}, stop: () => { stopFn(); schedulerRef.current = null; } };
      try {
        const amb = new Audio("/audio/ambience_soft.mp3");
        amb.loop = true;
        amb.volume = 0.15;
        amb.play().catch(() => {});
        ambienceRef.current = amb;
      } catch (e) {}
    }
    return () => {
      if (schedulerRef.current) {
        schedulerRef.current.stop();
        schedulerRef.current = null;
      }
      try {
        audio?.stopAll?.();
      } catch (e) {}
      if (ambienceRef.current) {
        try {
          ambienceRef.current.pause();
        } catch (e) {}
        ambienceRef.current = null;
      }
    };
  }, [isActive, audio, playGuidance]);

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

  const displayPhase = audioPhase ?? phase;
  const getScale = () => {
    if (!isActive) return 1;
    if (displayPhase === "inhale" || displayPhase === "hold1") return 1.4;
    if (displayPhase === "exhale") return 0.75;
    if (displayPhase === "hold" || displayPhase === "hold2") return 1.0;
    return 1.0;
  };

  const getOpacity = () => {
    if (!isActive) return 0.6;
    if (displayPhase === "inhale" || displayPhase === "hold1") return 1.0;
    if (displayPhase === "exhale") return 0.85;
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

  return (
    <>
      {/* Floating back button - luxury glass design */}
      <button
        type="button"
        onClick={back}
        className="fixed top-[calc(12px+env(safe-area-inset-top))] left-3 z-50 inline-flex items-center justify-center rounded-full p-2.5 text-xs transition-all hover:scale-105 backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 text-amber-200/80 hover:text-amber-200 shadow-lg shadow-black/20"
        aria-label="Go back"
        style={{ top: 'calc(12px + env(safe-area-inset-top))' }}
      >
        <ArrowLeft size={14} />
      </button>

      {/* Luxury Orb zone - premium design with depth */}
      <div className="flex flex-col items-center justify-center gap-6 overflow-visible min-h-[60vh] py-12">
        {/* Premium breathing orb with luxury materials — wrapper relative z-10 so rails/decor sit behind */}
        <div
          className="relative z-10 flex aspect-square w-64 sm:w-80 items-center justify-center overflow-visible"
          style={{
            transform: `scale(${getScale()})`,
            opacity: getOpacity(),
            transition: "all 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            filter: isActive ? "blur(0px)" : "blur(1px)",
          }}
        >
          {/* Outer atmospheric glow - behind orb (z-0) */}
          <div 
            className="absolute inset-0 z-0 rounded-full blur-3xl opacity-60"
            style={{
              background: `radial-gradient(circle, 
                rgba(251, 191, 36, 0.4) 0%, 
                rgba(217, 119, 6, 0.25) 30%,
                rgba(251, 191, 36, 0.15) 50%,
                transparent 80%)`,
              transform: `scale(${getScale() * 1.8})`,
              transition: "transform 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          />
          
          {/* Secondary glow ring - behind orb (z-0) */}
          <div 
            className="absolute inset-[-20%] z-0 rounded-full blur-2xl opacity-40"
            style={{
              background: `radial-gradient(circle, 
                rgba(251, 191, 36, 0.3) 0%, 
                rgba(34, 211, 238, 0.2) 40%,
                transparent 70%)`,
              transform: `scale(${getScale() * 1.4})`,
              transition: "transform 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          />

          {/* Main luxury orb - premium glassmorphism with depth (sits above glow stack) */}
          <div 
            className="relative z-10 flex h-full w-full items-center justify-center rounded-full"
            style={{
              background: `radial-gradient(ellipse at 30% 30%,
                rgba(255, 255, 255, 0.25) 0%,
                rgba(251, 191, 36, 0.3) 15%,
                rgba(217, 119, 6, 0.4) 30%,
                rgba(34, 211, 238, 0.2) 50%,
                rgba(59, 130, 246, 0.15) 70%,
                rgba(15, 23, 42, 0.8) 100%)`,
              backdropFilter: "blur(20px) saturate(180%)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              boxShadow: `
                0 0 80px rgba(251, 191, 36, 0.6),
                0 0 160px rgba(251, 191, 36, 0.4),
                0 0 240px rgba(251, 191, 36, 0.2),
                inset 0 0 60px rgba(255, 255, 255, 0.1),
                inset 0 -20px 80px rgba(0, 0, 0, 0.3),
                0 20px 60px rgba(0, 0, 0, 0.4)
              `,
              transform: `scale(${getScale()})`,
              transition: "all 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {/* Inner depth layer - premium materials */}
            <div 
              className="absolute inset-4 rounded-full"
              style={{
                background: `radial-gradient(circle at 40% 40%,
                  rgba(255, 255, 255, 0.15) 0%,
                  rgba(251, 191, 36, 0.2) 30%,
                  transparent 70%)`,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            />

            {/* Central text content - premium typography */}
            <div className="relative z-10 flex flex-col items-center gap-2 text-center px-8">
              <span 
                className="text-lg font-light tracking-[0.3em]"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(251, 191, 36, 0.9) 50%, rgba(255, 255, 255, 0.8) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "0 0 30px rgba(251, 191, 36, 0.5)",
                  letterSpacing: "0.4em",
                }}
              >
                {patternLabel}
              </span>
              <span 
                className="text-xs font-extralight uppercase tracking-wider"
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  textShadow: "0 0 20px rgba(251, 191, 36, 0.4)",
                }}
              >
                {audioPhase !== null ? audioPhase : phase === "idle" ? "Ready" : phase.toUpperCase()}
              </span>
            </div>

            {/* Pulse ring - organic breathing animation */}
            {isActive && (
              <div 
                className="absolute inset-[-8px] rounded-full border border-amber-300/40"
                style={{
                  animation: "luxuryPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  boxShadow: "0 0 40px rgba(251, 191, 36, 0.3)",
                }}
              />
            )}

            {/* Particle effects - luxury detail */}
            {isActive && Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: "4px",
                  height: "4px",
                  background: "radial-gradient(circle, rgba(251, 191, 36, 0.8), transparent)",
                  boxShadow: "0 0 12px rgba(251, 191, 36, 0.6)",
                  left: `${30 + (i * 12)}%`,
                  top: `${20 + (i % 3) * 30}%`,
                  animation: `luxuryFloat ${3 + (i % 3)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Phase 56 Day 2: minimal phase indicator + optional cycle count */}
        {isActive && audioPhase !== null && (
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-[11px] uppercase tracking-widest text-amber-200/90">
              {audioPhase === "inhale" ? "Inhale" : audioPhase === "hold" ? "Hold" : "Exhale"}
            </span>
            {cycleCount > 0 && (
              <span className="text-[10px] text-white/50">{cycleCount}</span>
            )}
          </div>
        )}

        {/* Premium instruction text */}
        <p 
          className="max-w-sm text-center text-sm leading-relaxed font-light"
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            textShadow: "0 2px 20px rgba(0, 0, 0, 0.5)",
          }}
        >
          {phaseLabel}
        </p>
        
        {/* Voice Guide Toggle - iOS-safe user interaction */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              const newState = !voiceGuideEnabled;
              
              if (newState) {
                // Unlock audio on first enable (iOS requirement)
                const unlocked = unlockAudio();
                setAudioUnlocked(unlocked);
                
                if (unlocked && isActive && phase !== "idle") {
                  // Test voice immediately on user gesture
                  const currentCount = pattern[phase === "inhale" ? 0 : phase === "exhale" ? 2 : 0] || 4;
                  await speakPhase(phase, currentCount);
                }
              } else {
                stopSpeaking();
              }
              
              setVoiceGuideEnabled(newState);
            }}
            className="flex items-center gap-2.5 rounded-full border border-white/30 bg-gradient-to-r from-white/10 via-white/5 to-transparent backdrop-blur-xl px-5 py-2.5 text-sm font-light text-white/90 hover:from-white/15 hover:to-white/10 transition-all duration-300 shadow-lg shadow-black/20 hover:scale-105"
          >
            {voiceGuideEnabled ? (
              <>
                <Volume2 className="h-4 w-4 text-amber-300" />
                <span>Voice Guide On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-white/50" />
                <span>Voice Guide Off</span>
              </>
            )}
          </button>
          {voiceGuideEnabled && !getDiagnostics().voiceSupported && (
            <p className="text-xs text-amber-200/70">Voice guide unavailable on this device.</p>
          )}
          {voiceGuideEnabled && getDiagnostics().voiceSupported && getDiagnostics().lastError && (
            <p className="text-xs text-amber-200/70">Voice had a hiccup. Tap the button to retry.</p>
          )}
          
          {/* Diagnostics panel (collapsed by default) */}
          {showDiagnostics && (
            <div className="mt-2 text-xs text-white/50 space-y-1 p-2 bg-white/5 rounded border border-white/10">
              {Object.entries(getDiagnostics()).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> {String(value)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Luxury animations */}
      <style>{`
        @keyframes luxuryPulse {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.05);
          }
        }
        @keyframes luxuryFloat {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.6;
          }
          50% { 
            transform: translateY(-15px) translateX(5px);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};
