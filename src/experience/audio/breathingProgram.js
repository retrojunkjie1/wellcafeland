// src/experience/audio/breathingProgram.js
// Phase 56: breathing cadence definition + scheduler for soft cues.

export const DEFAULT_CADENCE = {
  inhaleSec: 4,
  holdSec: 2,
  exhaleSec: 6,
};

export const defaultBreathingProgram = DEFAULT_CADENCE;

/**
 * Run a breathing loop: optional audio cues at inhale/hold/exhale.
 * playCue({phase, path}) is called when a phase starts; path may be /audio/cue_inhale.mp3 etc.
 * Returns a stop function.
 */
export function runBreathingScheduler(cadence = DEFAULT_CADENCE, playCue) {
  const {inhaleSec, holdSec, exhaleSec} = cadence;
  let cancelled = false;
  let timeoutId;

  function runPhase(phase) {
    if (cancelled) return;
    const cuePath =
      phase === "inhale"
        ? "/audio/cue_inhale.mp3"
        : phase === "hold"
          ? "/audio/cue_hold.mp3"
          : "/audio/cue_exhale.mp3";
    playCue?.({phase, path: cuePath});
    const nextPhase =
      phase === "inhale"
        ? "hold"
        : phase === "hold"
          ? "exhale"
          : "inhale";
    const durationSec =
      phase === "inhale"
        ? inhaleSec
        : phase === "hold"
          ? holdSec
          : exhaleSec;
    timeoutId = setTimeout(() => runPhase(nextPhase), durationSec * 1000);
  }

  runPhase("inhale");

  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
  };
}

/**
 * Create scheduler that uses audio engine and optional onTick(phase).
 * Returns { start(), stop() }. Runs timing silently if audio cues missing.
 */
export function createBreathingScheduler({audio, onTick} = {}) {
  const cadence = defaultBreathingProgram;
  let stopFn = null;

  const playCue = ({phase}) => {
    onTick?.(phase);
    const id = phase === "inhale" ? "cue_inhale" : phase === "hold" ? "cue_hold" : "cue_exhale";
    try {
      audio?.play?.(id);
    } catch (e) {}
  };

  return {
    start() {
      if (stopFn) return;
      stopFn = runBreathingScheduler(cadence, playCue);
    },
    stop() {
      if (stopFn) {
        stopFn();
        stopFn = null;
      }
    },
  };
}
