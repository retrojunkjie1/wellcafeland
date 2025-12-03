// src/apps/tools/modules/BreathingToolCinematic.jsx
// Cinematic Breathing Tool with Orb Animation
// Phase 36B: Fully Integrated Experience

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Wind, Heart, Timer, ArrowLeft, X } from "lucide-react";
import { OrbAnimationController, OrbThemes } from "@/engines/tools/OrbEngine";
import { getSoundscapeEngine } from "@/engines/tools/SoundscapeEngine";
import { getVoiceEngine } from "@/apps/tools/engine/VoiceEngine";
import { MetricsEngine } from "@/engines/tools/SessionEngine";
import CinematicContainer from "@/components/tools/CinematicContainer";
import ToolOrb from "@/components/tools/ToolOrb";
import ToolPanel from "@/components/tools/ToolPanel";
import MetricCard from "@/components/tools/MetricCard";

const BreathingToolCinematic = ({ tool, onComplete, onCancel }) => {
  const navigate = useNavigate();
  
  // State
  const [isActive, setIsActive] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [coherenceScore, setCoherenceScore] = useState(0);
  const [soundscapeVolume, setSoundscapeVolume] = useState(0.5);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Refs for engines
  const orbControllerRef = useRef(null);
  const soundscapeRef = useRef(null);
  const voiceRef = useRef(null);
  const metricsRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize engines
  useEffect(() => {
    // Initialize breath pattern (4-7-8 breathing)
    const pattern = tool?.breathPattern || { inhale: 4, hold: 7, exhale: 8, pause: 0 };
    const themeKey = tool?.theme?.toUpperCase() || 'CALM';
    const theme = OrbThemes[themeKey] || OrbThemes.CALM;

    // Create orb controller
    const orb = new OrbAnimationController(pattern, theme);
    orbControllerRef.current = orb;
    orb.setCallbacks({
      onPhaseChange: (phase) => {
        // Speak guidance
        if (voiceEnabled && voiceRef.current) {
          voiceRef.current.speakPhaseGuidance(phase, pattern);
        }
        
        // Record breath
        if (phase === 'exhale' && metricsRef.current) {
          metricsRef.current.recordBreath(phase);
          setBreathCount(prev => prev + 1);
          setCoherenceScore(metricsRef.current.getMetrics().coherenceScore);
        }
      },
      onCycleComplete: () => {
        if (metricsRef.current) {
          metricsRef.current.recordCycle();
          setCoherenceScore(metricsRef.current.getMetrics().coherenceScore);
        }
      },
    });

    // Get audio engines
    soundscapeRef.current = getSoundscapeEngine();
    voiceRef.current = getVoiceEngine();

    // Initialize metrics
    metricsRef.current = new MetricsEngine('breathing');

    return () => {
      if (orbControllerRef.current) {
        orbControllerRef.current.stop();
      }
      if (soundscapeRef.current) {
        soundscapeRef.current.stop();
      }
      if (voiceRef.current) {
        voiceRef.current.cancel();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [tool, voiceEnabled]);

  // Session timer
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  // Begin session
  const handleBegin = async () => {
    setIsActive(true);
    setBreathCount(0);
    setSessionTime(0);

    // Initialize audio
    if (soundscapeRef.current) {
      await soundscapeRef.current.initialize();
      await soundscapeRef.current.play(tool?.soundscape || 'wind', 2000);
      soundscapeRef.current.setVolume(soundscapeVolume);
    }

    // Initialize voice
    if (voiceRef.current && voiceEnabled) {
      await voiceRef.current.initialize();
      voiceRef.current.speakBegin();
    }

    // Start metrics
    if (metricsRef.current) {
      metricsRef.current.startSession(5);
    }

    // Start orb animation
    if (orbControllerRef.current) {
      orbControllerRef.current.start();
    }
  };

  // Pause session
  const handlePause = () => {
    setIsActive(false);

    if (orbControllerRef.current) {
      orbControllerRef.current.pause();
    }

    if (soundscapeRef.current) {
      soundscapeRef.current.pause(1000);
    }

    if (metricsRef.current) {
      metricsRef.current.pauseSession();
    }
  };

  // Stop session
  const handleStop = async () => {
    setIsActive(false);

    if (orbControllerRef.current) {
      orbControllerRef.current.stop();
    }

    if (soundscapeRef.current) {
      await soundscapeRef.current.stop(1000);
    }

    if (voiceRef.current) {
      voiceRef.current.speakComplete();
    }

    // Get final metrics
    if (metricsRef.current) {
      const summary = metricsRef.current.endSession();
      await metricsRef.current.saveSession();

      // Call completion callback if provided
      if (onComplete) {
        onComplete({
          type: 'session_complete',
          toolId: tool?.id || 'breathing',
          summary,
        });
      }
    }
  };

  // Update soundscape volume
  const handleSoundscapeVolumeChange = (volume) => {
    setSoundscapeVolume(volume);
    if (soundscapeRef.current) {
      soundscapeRef.current.setVolume(volume);
    }
  };

  // Toggle voice guidance
  const handleVoiceToggle = () => {
    const newValue = !voiceEnabled;
    setVoiceEnabled(newValue);
    if (voiceRef.current) {
      voiceRef.current.setEnabled(newValue);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle back navigation
  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/tools');
    }
  };

  return (
    <CinematicContainer theme={tool?.theme || "calm"}>
      <div className="min-h-screen flex flex-col">
        {/* Header - Fixed */}
        <div className="px-4 py-4 border-b border-white/10 backdrop-blur-sm bg-slate-950/80">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* Back button + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="
                  flex items-center gap-2
                  text-white/60 hover:text-amber-400
                  transition-colors duration-200
                  group
                "
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium hidden sm:inline">Back to Tools</span>
              </button>
              
              <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />
              
              <div className="flex items-center gap-3">
                {tool?.icon && <tool.icon className="h-5 w-5 text-amber-400" />}
                <div>
                  <h1 className="text-white font-light text-base sm:text-lg">
                    {tool?.name || "Breathing Tool"}
                  </h1>
                  <p className="text-white/50 text-xs hidden sm:block">
                    {tool?.category}
                  </p>
                </div>
              </div>
            </div>

            {/* Close button (mobile) */}
            <button
              onClick={handleBack}
              className="
                sm:hidden
                p-2 rounded-lg
                text-white/60 hover:text-white
                hover:bg-white/10
                transition-all duration-200
              "
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            {/* Breathing Orb */}
            <ToolOrb 
              controller={orbControllerRef.current} 
              theme={tool?.theme || "calm"} 
            />

            {/* Metrics */}
            {isActive && (
              <div className="grid grid-cols-3 gap-3">
                <MetricCard
                  label="Breaths"
                  value={breathCount}
                  icon={Wind}
                  theme={tool?.theme || "calm"}
                />
                <MetricCard
                  label="Duration"
                  value={formatTime(sessionTime)}
                  icon={Timer}
                  theme={tool?.theme || "calm"}
                />
                <MetricCard
                  label="Coherence"
                  value={coherenceScore}
                  unit="%"
                  icon={Heart}
                  theme={tool?.theme || "calm"}
                />
              </div>
            )}

            {/* Instructions */}
            {!isActive && (
              <div className="
                bg-white/[0.05] backdrop-blur-sm
                border border-white/10
                rounded-2xl p-6
                text-center
              ">
                <p className="text-white/80 leading-relaxed">
                  {tool?.description || "Calm your nervous system with guided breathing"}
                </p>
                {tool?.breathPattern && (
                  <div className="mt-4 flex items-center justify-center gap-4 text-sm text-white/60">
                    <span>Inhale {tool.breathPattern.inhale}s</span>
                    <span>•</span>
                    <span>Hold {tool.breathPattern.hold}s</span>
                    <span>•</span>
                    <span>Exhale {tool.breathPattern.exhale}s</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Control Panel - Fixed Bottom */}
        <ToolPanel
          tool={tool}
          isActive={isActive}
          onBegin={handleBegin}
          onPause={handlePause}
          onStop={handleStop}
          soundscapeVolume={soundscapeVolume}
          voiceEnabled={voiceEnabled}
          onSoundscapeVolumeChange={handleSoundscapeVolumeChange}
          onVoiceToggle={handleVoiceToggle}
        />
      </div>
    </CinematicContainer>
  );
};

export default BreathingToolCinematic;

