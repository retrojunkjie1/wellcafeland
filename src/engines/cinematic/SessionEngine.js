// src/engines/cinematic/SessionEngine.js
// SessionEngine v3 - Real-time Metrics with Intelligent Scoring
// Phase 38: Full Intelligent Cinematic Tool Engine

import { logEvent } from '@/services/telemetry';

/**
 * Calculate coherence score based on breath timing consistency
 */
function calculateCoherence(breathTimings) {
  if (breathTimings.length < 3) return 50;

  const durations = [];
  for (let i = 1; i < breathTimings.length; i++) {
    durations.push(breathTimings[i].timestamp - breathTimings[i - 1].timestamp);
  }

  if (durations.length === 0) return 50;

  const mean = durations.reduce((a, b) => a + b, 0) / durations.length;
  const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
  const stdDev = Math.sqrt(variance);

  const maxStdDev = 2000;
  const coherence = Math.max(0, 100 - (stdDev / maxStdDev * 100));

  return Math.round(coherence);
}

/**
 * Calculate calm score based on multiple factors
 */
function calculateCalmScore(sessionData) {
  const {
    duration = 0,
    targetDuration = 300000,
    completionRate = 0,
    coherence = 50,
    driftScore = 0,
  } = sessionData;

  const durationScore = Math.min(100, (duration / targetDuration) * 100);
  const driftPenalty = driftScore * 10; // Drift reduces calm

  const calmScore = (
    durationScore * 0.3 +
    completionRate * 0.3 +
    coherence * 0.3 -
    driftPenalty * 0.1
  );

  return Math.max(0, Math.min(100, Math.round(calmScore)));
}

/**
 * Calculate drift score (behavioral inconsistency)
 */
function calculateDriftScore(events) {
  if (events.length === 0) return 0;

  const pauses = events.filter(e => e.type === 'pause').length;
  const cancels = events.filter(e => e.type === 'cancel').length;

  return Math.min(10, pauses + (cancels * 2));
}

/**
 * SessionEngine v3 - Intelligent Session Tracking
 */
export class SessionEngineV3 {
  constructor(toolId, toolType = 'breathing') {
    this.toolId = toolId;
    this.toolType = toolType;
    this.sessionId = this.generateSessionId();
    this.metrics = this.initializeMetrics();
    this.breathTimings = [];
    this.events = [];
    this.sessionStart = null;
    this.sessionEnd = null;
    this.isPaused = false;
    this.pauseTime = 0;
    this.totalPauseDuration = 0;
  }

  initializeMetrics() {
    return {
      sessionTime: 0,
      cycles: 0,
      coherenceScore: 50,
      calmScore: 0,
      driftScore: 0,
      breathCount: 0,
      completionRate: 0,
      targetCycles: 0,
    };
  }

  generateSessionId() {
    return `${this.toolId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  startSession(targetCycles = 5) {
    this.sessionStart = Date.now();
    this.metrics.targetCycles = targetCycles;
    this.breathTimings = [];
    this.events = [];
    this.totalPauseDuration = 0;

    this.logEvent('session_start', {
      toolId: this.toolId,
      toolType: this.toolType,
      targetCycles,
    });
  }

  pauseSession() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.pauseTime = Date.now();
      this.logEvent('pause');
    }
  }

  resumeSession() {
    if (this.isPaused) {
      const pauseDuration = Date.now() - this.pauseTime;
      this.totalPauseDuration += pauseDuration;
      this.isPaused = false;
      this.pauseTime = 0;
      this.logEvent('resume');
    }
  }

  endSession() {
    this.sessionEnd = Date.now();
    this.updateAllMetrics();
    
    const summary = this.getSessionSummary();

    this.logEvent('session_end', {
      duration: this.metrics.sessionTime,
      cycles: this.metrics.cycles,
      coherence: this.metrics.coherenceScore,
      calmScore: this.metrics.calmScore,
    });

    return summary;
  }

  recordBreath(phaseType = 'exhale') {
    const timing = {
      timestamp: Date.now(),
      phase: phaseType,
    };

    this.breathTimings.push(timing);

    if (phaseType === 'exhale') {
      this.metrics.breathCount++;
    }

    this.updateCoherence();
  }

  recordCycle() {
    this.metrics.cycles++;
    this.updateCompletionRate();
    this.updateCalmScore();

    this.logEvent('cycle_complete', {
      cycleNumber: this.metrics.cycles,
      coherence: this.metrics.coherenceScore,
    });
  }

  recordEvent(eventType, data = {}) {
    this.events.push({
      type: eventType,
      timestamp: Date.now(),
      data,
    });

    if (eventType === 'cancel') {
      this.updateDriftScore();
    }
  }

  logEvent(eventType, data = {}) {
    this.events.push({ type: eventType, timestamp: Date.now(), data });
    
    // Send to telemetry
    logEvent('tool_session_event', {
      sessionId: this.sessionId,
      toolId: this.toolId,
      toolType: this.toolType,
      eventType,
      ...data,
    });
  }

  updateSessionTime() {
    if (!this.sessionStart) return;
    const end = this.sessionEnd || Date.now();
    this.metrics.sessionTime = end - this.sessionStart - this.totalPauseDuration;
  }

  updateCoherence() {
    this.metrics.coherenceScore = calculateCoherence(this.breathTimings);
  }

  updateCompletionRate() {
    if (this.metrics.targetCycles === 0) {
      this.metrics.completionRate = 0;
      return;
    }
    this.metrics.completionRate = Math.min(100, Math.round(
      (this.metrics.cycles / this.metrics.targetCycles) * 100
    ));
  }

  updateDriftScore() {
    this.metrics.driftScore = calculateDriftScore(this.events);
  }

  updateCalmScore() {
    this.metrics.calmScore = calculateCalmScore({
      duration: this.metrics.sessionTime,
      completionRate: this.metrics.completionRate,
      coherence: this.metrics.coherenceScore,
      driftScore: this.metrics.driftScore,
    });
  }

  updateAllMetrics() {
    this.updateSessionTime();
    this.updateCoherence();
    this.updateCompletionRate();
    this.updateDriftScore();
    this.updateCalmScore();
  }

  getMetrics() {
    this.updateSessionTime();
    this.updateAllMetrics();
    return { ...this.metrics };
  }

  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      toolId: this.toolId,
      toolType: this.toolType,
      startTime: this.sessionStart,
      endTime: this.sessionEnd,
      duration: this.metrics.sessionTime,
      durationFormatted: this.formatDuration(this.metrics.sessionTime),
      metrics: { ...this.metrics },
      breathTimings: this.breathTimings.length,
      events: this.events.length,
    };
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  async saveSession(userId = 'anonymous') {
    const summary = this.getSessionSummary();
    const sessionData = {
      ...summary,
      userId,
      savedAt: Date.now(),
    };

    try {
      const storageKey = `wc-sessions-${this.toolId}`;
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      existing.push(sessionData);
      
      const trimmed = existing.slice(-100);
      localStorage.setItem(storageKey, JSON.stringify(trimmed));

      // Emit to signals fusion
      this.emitToSignalsFusion(summary);

      return { success: true, sessionId: this.sessionId };
    } catch (error) {
      console.error('[SessionEngine] Save failed:', error);
      return { success: false, error: error.message };
    }
  }

  emitToSignalsFusion(summary) {
    try {
      // Emit events for OS-level signal processing
      window.dispatchEvent(new CustomEvent('tool_session_complete', {
        detail: {
          toolId: this.toolId,
          toolType: this.toolType,
          emotionalShift: this.calculateEmotionalShift(),
          calmTrajectory: this.metrics.calmScore,
          breathingCoherence: this.metrics.coherenceScore,
          panicDissolveRate: this.calculatePanicDissolve(),
          groundingCompletionRate: this.metrics.completionRate,
        }
      }));
    } catch (error) {
      console.warn('[SessionEngine] SignalsFusion emit failed:', error);
    }
  }

  calculateEmotionalShift() {
    // Positive shift based on completion and calm scores
    return Math.round((this.metrics.calmScore + this.metrics.completionRate) / 2);
  }

  calculatePanicDissolve() {
    if (this.toolType !== 'panic') return 0;
    return Math.min(100, this.metrics.coherenceScore + this.metrics.completionRate);
  }

  static loadSessions(toolId, limit = 10) {
    try {
      const storageKey = `wc-sessions-${toolId}`;
      const sessions = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return sessions.slice(-limit).reverse();
    } catch (error) {
      return [];
    }
  }

  static getAggregateStats(toolId) {
    const sessions = SessionEngineV3.loadSessions(toolId, 100);
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        avgCoherence: 0,
        avgCalmScore: 0,
        totalCycles: 0,
      };
    }

    return {
      totalSessions: sessions.length,
      totalDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      avgCoherence: Math.round(
        sessions.reduce((sum, s) => sum + (s.metrics?.coherenceScore || 0), 0) / sessions.length
      ),
      avgCalmScore: Math.round(
        sessions.reduce((sum, s) => sum + (s.metrics?.calmScore || 0), 0) / sessions.length
      ),
      totalCycles: sessions.reduce((sum, s) => sum + (s.metrics?.cycles || 0), 0),
    };
  }
}

