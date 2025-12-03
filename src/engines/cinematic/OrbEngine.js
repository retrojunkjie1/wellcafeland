// src/engines/cinematic/OrbEngine.js
// OrbEngine v2 - 3D Breathing Orb with Depth Shaders & Pulse Rings
// Phase 38: Full Intelligent Cinematic Tool Engine

/**
 * Orb v2 Animation States
 */
export const OrbStates = {
  IDLE: 'idle',
  INHALE: 'inhale',
  HOLD: 'hold',
  EXHALE: 'exhale',
  PAUSE: 'pause',
};

/**
 * Enhanced color palettes with mood-based gradients
 */
export const OrbPalettes = {
  CALM: {
    primary: 'rgba(251, 191, 36, 0.9)',      // Amber
    secondary: 'rgba(20, 184, 166, 0.7)',    // Teal
    glow: 'rgba(251, 191, 36, 0.6)',
    ring: 'rgba(251, 191, 36, 0.4)',
    depth: 'rgba(255, 255, 255, 0.3)',
  },
  ANXIETY: {
    primary: 'rgba(34, 211, 238, 0.9)',      // Cyan
    secondary: 'rgba(99, 102, 241, 0.7)',    // Indigo
    glow: 'rgba(34, 211, 238, 0.6)',
    ring: 'rgba(34, 211, 238, 0.4)',
    depth: 'rgba(255, 255, 255, 0.3)',
  },
  PANIC: {
    primary: 'rgba(239, 68, 68, 0.8)',       // Red
    secondary: 'rgba(59, 130, 246, 0.6)',    // Blue (transition to calm)
    glow: 'rgba(239, 68, 68, 0.5)',
    ring: 'rgba(239, 68, 68, 0.3)',
    depth: 'rgba(255, 255, 255, 0.2)',
  },
  GROUNDING: {
    primary: 'rgba(16, 185, 129, 0.9)',      // Emerald
    secondary: 'rgba(34, 197, 94, 0.7)',     // Green
    glow: 'rgba(16, 185, 129, 0.6)',
    ring: 'rgba(16, 185, 129, 0.4)',
    depth: 'rgba(255, 255, 255, 0.3)',
  },
  REFLECTION: {
    primary: 'rgba(147, 51, 234, 0.9)',      // Purple
    secondary: 'rgba(168, 85, 247, 0.7)',    // Violet
    glow: 'rgba(147, 51, 234, 0.6)',
    ring: 'rgba(147, 51, 234, 0.4)',
    depth: 'rgba(255, 255, 255, 0.3)',
  },
};

/**
 * Calculate orb scale with advanced easing
 */
export function calculateOrbScale(phase, progress, coherence = 50) {
  // Ease in-out quart with coherence smoothing
  const easeInOutQuart = (t) => {
    return t < 0.5
      ? 8 * t * t * t * t
      : 1 - 8 * (--t) * t * t * t;
  };

  const easedProgress = easeInOutQuart(progress);
  const coherenceMultiplier = 1 + (coherence / 1000); // Subtle growth with mastery

  switch (phase) {
    case OrbStates.INHALE:
      return (0.85 + (0.35 * easedProgress)) * coherenceMultiplier;
    case OrbStates.HOLD:
      return 1.2 * coherenceMultiplier;
    case OrbStates.EXHALE:
      return (1.2 - (0.35 * easedProgress)) * coherenceMultiplier;
    case OrbStates.PAUSE:
      return 0.85 * coherenceMultiplier;
    default:
      return 1;
  }
}

/**
 * Get phase instruction with emotional intelligence
 */
export function getOrbInstruction(phase, pattern, moodType = 'calm') {
  const { inhale = 4, hold = 4, exhale = 4, pause = 0 } = pattern || {};

  const instructions = {
    calm: {
      inhale: `Breathe In • ${inhale}s`,
      hold: `Hold Gently • ${hold}s`,
      exhale: `Breathe Out • ${exhale}s`,
      pause: `Pause • Rest`,
      idle: 'Begin when ready',
    },
    anxiety: {
      inhale: `Breathe In Slowly • ${inhale}s`,
      hold: `Stay Here • ${hold}s`,
      exhale: `Release Tension • ${exhale}s`,
      pause: `Rest`,
      idle: 'Take your time',
    },
    panic: {
      inhale: `Breathe With Me • ${inhale}s`,
      hold: `You Are Safe • ${hold}s`,
      exhale: `Let It Go • ${exhale}s`,
      pause: `You Are Safe`,
      idle: 'I am here with you',
    },
  };

  const moodInstructions = instructions[moodType] || instructions.calm;
  const phaseKey = phase.toLowerCase();

  return moodInstructions[phaseKey] || moodInstructions.idle;
}

/**
 * OrbEngine v2 Controller with Intelligent Adaptations
 */
export class OrbEngineV2 {
  constructor(pattern, palette = OrbPalettes.CALM, moodType = 'calm') {
    this.pattern = pattern;
    this.palette = palette;
    this.moodType = moodType;
    this.currentPhase = OrbStates.IDLE;
    this.phaseProgress = 0;
    this.cycleCount = 0;
    this.coherenceScore = 50;
    this.isAnimating = false;
    this.animationFrame = null;
    this.startTime = null;
    this.callbacks = {
      onPhaseChange: null,
      onCycleComplete: null,
      onProgressUpdate: null,
      onCoherenceUpdate: null,
    };
  }

  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.startTime = Date.now();
    this.currentPhase = OrbStates.INHALE;
    this.animate();
  }

  stop() {
    this.isAnimating = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.currentPhase = OrbStates.IDLE;
    this.phaseProgress = 0;
  }

  pause() {
    this.isAnimating = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  resume() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.startTime = Date.now() - this.getElapsedInPhase();
    this.animate();
  }

  animate() {
    if (!this.isAnimating) return;

    const now = Date.now();
    const elapsed = now - this.startTime;
    const currentPhaseDuration = this.getPhaseDuration(this.currentPhase) * 1000;

    if (elapsed >= currentPhaseDuration) {
      this.advancePhase();
      this.startTime = now;
    } else {
      this.phaseProgress = elapsed / currentPhaseDuration;
      if (this.callbacks.onProgressUpdate) {
        this.callbacks.onProgressUpdate(this.currentPhase, this.phaseProgress);
      }
    }

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  advancePhase() {
    const phases = [
      OrbStates.INHALE,
      OrbStates.HOLD,
      OrbStates.EXHALE,
      ...(this.pattern.pause > 0 ? [OrbStates.PAUSE] : []),
    ];

    const currentIndex = phases.indexOf(this.currentPhase);
    const nextIndex = (currentIndex + 1) % phases.length;

    if (nextIndex === 0) {
      this.cycleCount++;
      this.updateCoherence();
      if (this.callbacks.onCycleComplete) {
        this.callbacks.onCycleComplete(this.cycleCount, this.coherenceScore);
      }
    }

    this.currentPhase = phases[nextIndex];
    this.phaseProgress = 0;

    if (this.callbacks.onPhaseChange) {
      this.callbacks.onPhaseChange(this.currentPhase);
    }
  }

  updateCoherence() {
    // Simulate coherence improvement with practice
    this.coherenceScore = Math.min(100, this.coherenceScore + Math.random() * 5);
    if (this.callbacks.onCoherenceUpdate) {
      this.callbacks.onCoherenceUpdate(this.coherenceScore);
    }
  }

  getPhaseDuration(phase) {
    switch (phase) {
      case OrbStates.INHALE:
        return this.pattern.inhale;
      case OrbStates.HOLD:
        return this.pattern.hold;
      case OrbStates.EXHALE:
        return this.pattern.exhale;
      case OrbStates.PAUSE:
        return this.pattern.pause || 0;
      default:
        return 0;
    }
  }

  getElapsedInPhase() {
    return this.phaseProgress * this.getPhaseDuration(this.currentPhase) * 1000;
  }

  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  setPalette(palette) {
    this.palette = palette;
  }

  setMoodType(moodType) {
    this.moodType = moodType;
  }

  getState() {
    return {
      phase: this.currentPhase || OrbStates.IDLE,
      progress: this.phaseProgress || 0,
      cycleCount: this.cycleCount || 0,
      coherenceScore: this.coherenceScore || 50,
      isAnimating: this.isAnimating || false,
      palette: this.palette || OrbPalettes.CALM,
      moodType: this.moodType || 'calm',
      scale: calculateOrbScale(
        this.currentPhase || OrbStates.IDLE, 
        this.phaseProgress || 0,
        this.coherenceScore
      ),
      instruction: getOrbInstruction(
        this.currentPhase || OrbStates.IDLE, 
        this.pattern || { inhale: 4, hold: 7, exhale: 8, pause: 0 },
        this.moodType
      ),
    };
  }
}

/**
 * Generate 3D depth shader CSS
 */
export function generateDepthShader(palette) {
  return `
    radial-gradient(
      circle at 35% 35%,
      ${palette.depth} 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 50% 50%,
      ${palette.primary} 0%,
      ${palette.secondary} 100%
    )
  `;
}

/**
 * Generate pulse ring keyframes
 */
export function generatePulseRings(duration) {
  return `
    @keyframes pulseRing {
      0% {
        transform: scale(1);
        opacity: 0.6;
      }
      50% {
        transform: scale(1.15);
        opacity: 0.3;
      }
      100% {
        transform: scale(1.3);
        opacity: 0;
      }
    }
  `;
}

