// src/apps/tools/engine/MetricsEngine.js
// Tool Metrics and Analytics Engine
// Phase 36: Hybrid Cinematic Aesthetic

/**
 * Metric types for wellness tools
 */
export const MetricTypes = {
  BREATH_COUNT: 'breathCount',
  COHERENCE_SCORE: 'coherenceScore',
  SESSION_DURATION: 'sessionDuration',
  CALM_EFFECT: 'calmEffectScore',
  CONSISTENCY: 'consistency',
  COMPLETION_RATE: 'completionRate',
};

/**
 * Calculate coherence score based on breath consistency
 */
function calculateCoherence(breathTimings) {
  if (breathTimings.length < 2) return 0;

  // Calculate standard deviation of breath durations
  const durations = breathTimings.map((timing, i) => {
    if (i === 0) return null;
    return timing.timestamp - breathTimings[i - 1].timestamp;
  }).filter(d => d !== null);

  if (durations.length === 0) return 0;

  const mean = durations.reduce((a, b) => a + b, 0) / durations.length;
  const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
  const stdDev = Math.sqrt(variance);

  // Convert to 0-100 score (lower variance = higher coherence)
  const maxStdDev = 2000; // 2 seconds
  const coherence = Math.max(0, 100 - (stdDev / maxStdDev * 100));

  return Math.round(coherence);
}

/**
 * Calculate calm effect score based on session completion and consistency
 */
function calculateCalmEffect(sessionData) {
  const {
    completionRate = 0,
    consistency = 0,
    duration = 0,
    targetDuration = 300000, // 5 minutes
  } = sessionData;

  // Weighted formula
  const completionWeight = 0.4;
  const consistencyWeight = 0.4;
  const durationWeight = 0.2;

  const durationScore = Math.min(100, (duration / targetDuration) * 100);

  const calmEffect = (
    completionRate * completionWeight +
    consistency * consistencyWeight +
    durationScore * durationWeight
  );

  return Math.round(calmEffect);
}

/**
 * Metrics Engine for tracking tool sessions
 */
export class MetricsEngine {
  constructor(toolId) {
    this.toolId = toolId;
    this.sessionId = this.generateSessionId();
    this.metrics = this.initializeMetrics();
    this.breathTimings = [];
    this.sessionStart = null;
    this.sessionEnd = null;
    this.isPaused = false;
    this.pauseTime = 0;
  }

  /**
   * Initialize metrics
   */
  initializeMetrics() {
    return {
      breathCount: 0,
      coherenceScore: 0,
      sessionDuration: 0,
      calmEffectScore: 0,
      consistency: 100,
      completionRate: 0,
      cyclesCompleted: 0,
      targetCycles: 0,
    };
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `${this.toolId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start session
   */
  startSession(targetCycles = 5) {
    this.sessionStart = Date.now();
    this.metrics.targetCycles = targetCycles;
    this.breathTimings = [];
  }

  /**
   * End session
   */
  endSession() {
    this.sessionEnd = Date.now();
    this.updateSessionDuration();
    this.updateCoherence();
    this.updateCalmEffect();
    return this.getSessionSummary();
  }

  /**
   * Pause session
   */
  pauseSession() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.pauseTime = Date.now();
    }
  }

  /**
   * Resume session
   */
  resumeSession() {
    if (this.isPaused) {
      const pauseDuration = Date.now() - this.pauseTime;
      this.sessionStart += pauseDuration; // Adjust start time
      this.isPaused = false;
      this.pauseTime = 0;
    }
  }

  /**
   * Record a breath cycle
   */
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

  /**
   * Record cycle completion
   */
  recordCycle() {
    this.metrics.cyclesCompleted++;
    this.updateCompletionRate();
  }

  /**
   * Update session duration
   */
  updateSessionDuration() {
    if (!this.sessionStart) return;
    const end = this.sessionEnd || Date.now();
    this.metrics.sessionDuration = end - this.sessionStart;
  }

  /**
   * Update coherence score
   */
  updateCoherence() {
    this.metrics.coherenceScore = calculateCoherence(this.breathTimings);
  }

  /**
   * Update completion rate
   */
  updateCompletionRate() {
    if (this.metrics.targetCycles === 0) {
      this.metrics.completionRate = 0;
      return;
    }
    this.metrics.completionRate = Math.round(
      (this.metrics.cyclesCompleted / this.metrics.targetCycles) * 100
    );
  }

  /**
   * Update calm effect score
   */
  updateCalmEffect() {
    this.metrics.calmEffectScore = calculateCalmEffect({
      completionRate: this.metrics.completionRate,
      consistency: this.metrics.coherenceScore,
      duration: this.metrics.sessionDuration,
    });
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    this.updateSessionDuration();
    return { ...this.metrics };
  }

  /**
   * Get session summary
   */
  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      toolId: this.toolId,
      startTime: this.sessionStart,
      endTime: this.sessionEnd,
      duration: this.metrics.sessionDuration,
      durationFormatted: this.formatDuration(this.metrics.sessionDuration),
      metrics: { ...this.metrics },
      breathTimings: this.breathTimings.length,
    };
  }

  /**
   * Format duration (ms to readable string)
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Save session to storage
   */
  async saveSession(userId = 'anonymous') {
    const summary = this.getSessionSummary();
    const sessionData = {
      ...summary,
      userId,
      savedAt: Date.now(),
    };

    try {
      // Save to localStorage
      const storageKey = `wc-tool-sessions-${this.toolId}`;
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      existing.push(sessionData);
      
      // Keep last 100 sessions
      const trimmed = existing.slice(-100);
      localStorage.setItem(storageKey, JSON.stringify(trimmed));

      return { success: true, sessionId: this.sessionId };
    } catch (error) {
      console.error('Failed to save session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load past sessions
   */
  static loadSessions(toolId, limit = 10) {
    try {
      const storageKey = `wc-tool-sessions-${toolId}`;
      const sessions = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return sessions.slice(-limit).reverse();
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  }

  /**
   * Get aggregate stats
   */
  static getAggregateStats(toolId) {
    const sessions = MetricsEngine.loadSessions(toolId, 100);
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        totalBreaths: 0,
        avgCoherence: 0,
        avgCalmEffect: 0,
      };
    }

    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalBreaths = sessions.reduce((sum, s) => sum + (s.metrics?.breathCount || 0), 0);
    const avgCoherence = sessions.reduce((sum, s) => sum + (s.metrics?.coherenceScore || 0), 0) / sessions.length;
    const avgCalmEffect = sessions.reduce((sum, s) => sum + (s.metrics?.calmEffectScore || 0), 0) / sessions.length;

    return {
      totalSessions: sessions.length,
      totalDuration,
      totalDurationFormatted: new MetricsEngine(toolId).formatDuration(totalDuration),
      totalBreaths,
      avgCoherence: Math.round(avgCoherence),
      avgCalmEffect: Math.round(avgCalmEffect),
    };
  }
}

