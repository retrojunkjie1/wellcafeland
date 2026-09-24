// src/components/tools/BreathingSessionView.jsx
// Luxury cinematic orb-based breathing session with premium voice guide
// Multi-million dollar wellness experience

import React, { useEffect, useState, useRef } from "react";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useSmartNav } from "@/navigation/useSmartNav";
import { speakText, unlockAudio, stopSpeaking, getDiagnostics } from "@/utils/voiceGuide";
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
  const [phase, setPhase] = useState("idle");
  const [cycleCount, setCycleCount] = useState(0);
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState(voiceEnabled);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef(null);
  const ambienceRef = useRef(null);

  // Voice guide using voiceGuide module
  const speakPhase = React.useCallback(async (phaseName, count) => {
    if (!voiceGuideEnabled || !audioUnlocked) return;
    
    stopSpeaking();
    
    let instruction = "";
    if (phaseName === "inhale") {
      instruction = `Breathe in at a comfortable pace for a count of ${count}.`;
    } else if (phaseName === "exhale") {
      instruction = `Breathe out at a comfortable pace for a count of ${count}.`;
    } else if (phaseName === "hold1" || phaseName === "hold2") {
      instruction = "Pause only if that feels comfortable; otherwise breathe naturally.";
    }
    
    if (instruction) {
      await speakText(instruction, { rate: 0.85, pitch: 1.0, volume: 0.8 });
    }
  }, [voiceGuideEnabled, audioUnlocked]);

  // Start optional ambience with the practice. The visual cadence below is the single timing source.
  useEffect(() => {
    if (!isActive) {
      try {
        audio?.stopAll?.();
      } catch (e) {}
      if (ambienceRef.current) {
        try {
          ambienceRef.current.pause();
        } catch (e) {}
        ambienceRef.current = null;
      }
      setCycleCount(0);
      return;
    }
    try {
      playGuidance("breathing_intro");
    } catch (e) {}
    try {
      if (audio?.play) {
        audio.play("ambience_soft", { loop: true, volume: 0.15 });
      } else {
        const amb = new Audio("/audio/ambience_soft.mp3");
        amb.loop = true;
        amb.volume = 0.15;
        amb.play().catch(() => {});
        ambienceRef.current = amb;
      }
    } catch (e) {
      // Sound is optional; the visual guidance remains available.
    }
    return () => {
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
        if (nextIndex === 0) {
          setCycleCount((count) => count + 1);
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

  const displayPhase = phase;
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
      ? `Breathe in at a comfortable pace for ${pattern[0]}`
      : phase === "exhale"
      ? `Breathe out at a comfortable pace for ${pattern[2] || pattern[0]}`
      : phase === "hold1"
      ? "Pause only if comfortable; natural breathing is always okay"
      : phase === "hold2"
      ? "Rest or breathe naturally"
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
      <div className="flex flex-col items-center justify-center gap-4 overflow-visible min-h-[28vh] py-4 sm:min-h-[50vh] sm:gap-6 sm:py-10">
        {/* Premium breathing orb with luxury materials — wrapper relative z-10 so rails/decor sit behind */}
        <div
          className="relative z-10 flex aspect-square w-48 sm:w-80 items-center justify-center overflow-visible"
          style={{
            opacity: getOpacity(),
            transition: "opacity 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {/* Outer atmospheric glow - behind orb (z-0) */}
          <div 
            className="breath-aura absolute inset-[-18%] z-0 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(ellipse at 48% 48%, rgba(249, 199, 111, 0.42) 0%, rgba(210, 143, 65, 0.24) 28%, rgba(71, 153, 173, 0.13) 52%, transparent 74%)",
              transform: `scale(${1.18 + (getScale() - 1) * 0.46})`,
              transition: "transform 2.2s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
          
          {/* Secondary glow ring - behind orb (z-0) */}
          <div 
            className="breath-aura-secondary absolute inset-[-7%] z-0 rounded-full blur-2xl"
            style={{
              background: "radial-gradient(circle, rgba(255, 232, 184, 0.14) 0%, rgba(68, 180, 198, 0.16) 42%, rgba(57, 105, 156, 0.12) 58%, transparent 72%)",
              transform: `scale(${1.08 + (getScale() - 1) * 0.25})`,
              transition: "transform 2.2s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />

          {/* Main luxury orb - premium glassmorphism with depth (sits above glow stack) */}
          <div 
            className="breath-orb relative z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-full"
            style={{
              background: "radial-gradient(ellipse at 30% 18%, rgba(255,255,255,.88) 0%, rgba(255,246,222,.42) 5%, rgba(255,255,255,.09) 17%, transparent 30%), radial-gradient(ellipse at 68% 74%, rgba(60,175,195,.34) 0%, transparent 35%), radial-gradient(circle at 43% 42%, #e8c783 0%, #c4904d 25%, #8c6846 43%, #3c5159 68%, #101c2b 100%)",
              border: "1px solid rgba(255, 245, 222, 0.66)",
              boxShadow: `
                0 0 34px rgba(250, 203, 125, 0.34),
                0 0 92px rgba(229, 167, 91, 0.23),
                0 0 150px rgba(71, 158, 178, 0.13),
                inset 10px 14px 30px rgba(255, 255, 255, 0.25),
                inset -18px -24px 44px rgba(4, 15, 29, 0.62),
                0 24px 58px rgba(0, 0, 0, 0.38)
              `,
              transform: `scale(${getScale()})`,
              transition: "transform 2.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 2.2s ease",
            }}
          >
            {/* Inner depth layer - premium materials */}
            <div 
              className="absolute inset-[7%] rounded-full border border-white/15"
              style={{
                background: "radial-gradient(ellipse at 32% 23%, rgba(255,255,255,.3) 0%, rgba(255,255,255,.1) 18%, transparent 48%), radial-gradient(ellipse at 66% 76%, rgba(51,157,179,.18), transparent 50%)",
                boxShadow: "inset 0 1px 18px rgba(255,255,255,.19), inset 0 -18px 28px rgba(4,15,29,.2)",
              }}
            />
            <div className="breath-orb-sheen pointer-events-none absolute inset-y-[-25%] left-[-45%] w-[42%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-md" />

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
                {phase === "idle" ? "Ready" : phase.toUpperCase()}
              </span>
            </div>

            {/* Pulse ring - organic breathing animation */}
            {isActive && (
              <div 
                className="breath-orb-ring absolute inset-[-8px] rounded-full border border-amber-300/40"
                style={{
                  animation: "breathRing 5s ease-in-out infinite",
                  borderColor: "rgba(255, 226, 178, 0.48)",
                  boxShadow: "0 0 26px rgba(250, 203, 125, 0.22), inset 0 0 20px rgba(255,255,255,.05)",
                }}
              />
            )}

            {/* Particle effects - luxury detail */}
            {isActive && Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="breath-particle absolute rounded-full"
                style={{
                  width: "4px",
                  height: "4px",
                  background: "radial-gradient(circle, rgba(251, 191, 36, 0.8), transparent)",
                  boxShadow: "0 0 12px rgba(251, 191, 36, 0.6)",
                  left: `${30 + (i * 12)}%`,
                  top: `${20 + (i % 3) * 30}%`,
                  animation: `luxuryFloat ${5 + (i % 3)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.45}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Phase 56 Day 2: minimal phase indicator + optional cycle count */}
        {isActive && (
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-[11px] uppercase tracking-widest text-amber-200/90">
              {displayPhase === "inhale" ? "Inhale" : displayPhase.startsWith("hold") ? "Hold" : "Exhale"}
            </span>
            {cycleCount > 0 && (
              <span className="text-[10px] text-white/50">{cycleCount} cycles</span>
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
          
        </div>
      </div>

      {/* Luxury animations */}
      <style>{`
        .breath-aura {
          animation: breathAura 8s ease-in-out infinite;
          will-change: opacity, filter;
        }
        .breath-aura-secondary {
          animation: breathAuraSecondary 11s ease-in-out infinite;
        }
        .breath-orb {
          will-change: transform;
          isolation: isolate;
        }
        .breath-orb-sheen {
          animation: breathSheen 9s cubic-bezier(.4, 0, .2, 1) infinite;
        }
        @keyframes breathAura {
          0%, 100% { opacity: .62; filter: saturate(.88) blur(32px); }
          50% { opacity: .9; filter: saturate(1.16) blur(37px); }
        }
        @keyframes breathAuraSecondary {
          0%, 100% { opacity: .42; }
          50% { opacity: .72; }
        }
        @keyframes breathSheen {
          0%, 24% { transform: translateX(0) skewX(-18deg); opacity: 0; }
          38% { opacity: .75; }
          66%, 100% { transform: translateX(360%) skewX(-18deg); opacity: 0; }
        }
        @keyframes breathRing {
          0%, 100% { opacity: .24; transform: scale(.99); }
          50% { opacity: .58; transform: scale(1.025); }
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
        @media (prefers-reduced-motion: reduce) {
          .breath-aura, .breath-aura-secondary, .breath-orb-sheen,
          .breath-orb-ring, .breath-particle {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
          .breath-orb, .breath-aura, .breath-aura-secondary {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
};
