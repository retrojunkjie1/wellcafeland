// src/apps/tools/engine/OrbEngine.js
// Cinematic 3D Breathing Orb Animation Engine
// Phase 36: Hybrid Cinematic Aesthetic

/**
 * Orb animation states and configurations
 */
export const OrbStates = {
  IDLE: 'idle',
  INHALE: 'inhale',
  HOLD: 'hold',
  EXHALE: 'exhale',
  PAUSE: 'pause',
};

export const OrbThemes = {
  CALM: {
    primary: 'rgba(251, 191, 36, 0.8)', // Amber
    secondary: 'rgba(20, 184, 166, 0.6)', // Teal
    glow: 'rgba(251, 191, 36, 0.4)',
  },
  FOCUS: {
    primary: 'rgba(99, 102, 241, 0.8)', // Indigo
    secondary: 'rgba(147, 51, 234, 0.6)', // Purple
    glow: 'rgba(99, 102, 241, 0.4)',
  },
  RELEASE: {
    primary: 'rgba(239, 68, 68, 0.7)', // Red
    secondary: 'rgba(251, 146, 60, 0.6)', // Orange
    glow: 'rgba(239, 68, 68, 0.3)',
  },
  PEACE: {
    primary: 'rgba(34, 211, 238, 0.8)', // Cyan
    secondary: 'rgba(59, 130, 246, 0.6)', // Blue
    glow: 'rgba(34, 211, 238, 0.4)',
  },
};

/**
 * Generate orb animation keyframes based on breath pattern
 */
export function generateOrbKeyframes(pattern) {
  const { inhale = 4, hold = 4, exhale = 4, pause = 0 } = pattern;
  const total = inhale + hold + exhale + pause;

  // Calculate percentages for each phase
  const inhaleEnd = (inhale / total) * 100;
  const holdEnd = ((inhale + hold) / total) * 100;
  const exhaleEnd = ((inhale + hold + exhale) / total) * 100;

  return `
    @keyframes orbPulse {
      0% { transform: scale(0.85); opacity: 0.7; }
      ${inhaleEnd}% { transform: scale(1.15); opacity: 1; }
      ${holdEnd}% { transform: scale(1.15); opacity: 1; }
      ${exhaleEnd}% { transform: scale(0.85); opacity: 0.7; }
      100% { transform: scale(0.85); opacity: 0.7; }
    }

    @keyframes orbGlow {
      0% { box-shadow: 0 0 20px var(--orb-glow), 0 0 40px var(--orb-glow); }
      ${inhaleEnd}% { box-shadow: 0 0 60px var(--orb-glow), 0 0 120px var(--orb-glow); }
      ${holdEnd}% { box-shadow: 0 0 60px var(--orb-glow), 0 0 120px var(--orb-glow); }
      ${exhaleEnd}% { box-shadow: 0 0 20px var(--orb-glow), 0 0 40px var(--orb-glow); }
      100% { box-shadow: 0 0 20px var(--orb-glow), 0 0 40px var(--orb-glow); }
    }

    @keyframes orbRotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes sweepLight {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
  `;
}

/**
 * Calculate orb scale based on current phase and progress
 */
export function calculateOrbScale(phase, progress) {
  const easeInOutQuart = (t) => {
    return t < 0.5
      ? 8 * t * t * t * t
      : 1 - 8 * (--t) * t * t * t;
  };

  const easedProgress = easeInOutQuart(progress);

  switch (phase) {
    case OrbStates.INHALE:
      return 0.85 + (0.3 * easedProgress); // 0.85 to 1.15
    case OrbStates.HOLD:
      return 1.15;
    case OrbStates.EXHALE:
      return 1.15 - (0.3 * easedProgress); // 1.15 to 0.85
    case OrbStates.PAUSE:
      return 0.85;
    default:
      return 1;
  }
}

/**
 * Get orb instruction text for current phase
 */
export function getOrbInstruction(phase, pattern) {
  const { inhale = 4, hold = 4, exhale = 4 } = pattern;

  switch (phase) {
    case OrbStates.INHALE:
      return `Breathe In • ${inhale}s`;
    case OrbStates.HOLD:
      return `Hold • ${hold}s`;
    case OrbStates.EXHALE:
      return `Breathe Out • ${exhale}s`;
    case OrbStates.PAUSE:
      return 'Pause • Rest';
    default:
      return 'Begin';
  }
}

/**
 * Orb animation class for managing state and transitions
 */
export class OrbAnimationController {
  constructor(pattern, theme = OrbThemes.CALM) {
    this.pattern = pattern;
    this.theme = theme;
    this.currentPhase = OrbStates.IDLE;
    this.phaseProgress = 0;
    this.cycleCount = 0;
    this.isAnimating = false;
    this.animationFrame = null;
    this.startTime = null;
    this.callbacks = {
      onPhaseChange: null,
      onCycleComplete: null,
      onProgressUpdate: null,
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
      if (this.callbacks.onCycleComplete) {
        this.callbacks.onCycleComplete(this.cycleCount);
      }
    }

    this.currentPhase = phases[nextIndex];
    this.phaseProgress = 0;

    if (this.callbacks.onPhaseChange) {
      this.callbacks.onPhaseChange(this.currentPhase);
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

  setTheme(theme) {
    this.theme = theme;
  }

  getState() {
    return {
      phase: this.currentPhase,
      progress: this.phaseProgress,
      cycleCount: this.cycleCount,
      isAnimating: this.isAnimating,
      theme: this.theme,
      scale: calculateOrbScale(this.currentPhase, this.phaseProgress),
      instruction: getOrbInstruction(this.currentPhase, this.pattern),
    };
  }
}

