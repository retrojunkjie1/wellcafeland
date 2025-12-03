// src/engines/reflection/reflectionEngine.js
// Daily Reflection Engine with Insight Generation
// Phase 41: Daily Reflection Engine

import { logEvent } from '@/services/telemetry';
import { getReflectionPrompts } from '@/engines/content/contentTopicsRegistry';

/**
 * Reflection types
 */
export const ReflectionTypes = {
  MORNING: 'morning',
  TOPIC: 'topic',
  EVENING: 'evening',
  CRISIS: 'crisis',
  GRATITUDE: 'gratitude',
};

/**
 * Reflection prompt templates
 */
export const ReflectionPrompts = {
  [ReflectionTypes.MORNING]: [
    "How are you feeling as you start this day?",
    "What do you need today?",
    "What intention do you want to set?",
    "What would make today feel successful?",
  ],
  [ReflectionTypes.EVENING]: [
    "What went well today?",
    "What challenged you today?",
    "What did you learn about yourself?",
    "What are you grateful for?",
  ],
  [ReflectionTypes.CRISIS]: [
    "What do you need right now?",
    "Who can you reach out to?",
    "What small thing might help?",
    "What has helped in the past?",
  ],
  [ReflectionTypes.GRATITUDE]: [
    "What are three things you're grateful for today?",
    "Who made your day better?",
    "What small moment brought you joy?",
  ],
};

/**
 * Generate reflection prompt for topic
 */
export function generateReflectionPrompt(topicId, type = ReflectionTypes.TOPIC) {
  if (type === ReflectionTypes.TOPIC) {
    const prompts = getReflectionPrompts(topicId);
    if (prompts.length > 0) {
      return prompts[Math.floor(Math.random() * prompts.length)];
    }
  }

  const templatePrompts = ReflectionPrompts[type] || ReflectionPrompts[ReflectionTypes.MORNING];
  return templatePrompts[Math.floor(Math.random() * templatePrompts.length)];
}

/**
 * ReflectionEngine - Manages daily reflections and insights
 */
export class ReflectionEngine {
  constructor(userId = 'anonymous') {
    this.userId = userId;
    this.storageKey = `wc-reflections-${userId}`;
  }

  /**
   * Save reflection entry
   */
  async saveReflection(reflection) {
    const entry = {
      id: `reflection-${Date.now()}`,
      userId: this.userId,
      type: reflection.type || ReflectionTypes.TOPIC,
      topicId: reflection.topicId,
      prompt: reflection.prompt,
      response: reflection.response,
      sentiment: reflection.sentiment || 'neutral',
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
    };

    try {
      const reflections = this.loadReflections();
      reflections.push(entry);

      // Keep last 365 days
      const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
      const filtered = reflections.filter(r => r.timestamp > oneYearAgo);

      localStorage.setItem(this.storageKey, JSON.stringify(filtered));

      logEvent('reflection_saved', {
        type: entry.type,
        topicId: entry.topicId,
        hasResponse: !!entry.response,
      });

      return entry;
    } catch (error) {
      console.error('[ReflectionEngine] Save failed:', error);
      return null;
    }
  }

  /**
   * Load all reflections
   */
  loadReflections() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch (error) {
      return [];
    }
  }

  /**
   * Get reflection for today
   */
  getTodayReflection(type = ReflectionTypes.MORNING) {
    const today = new Date().toISOString().split('T')[0];
    const reflections = this.loadReflections();
    
    return reflections.find(r => r.date === today && r.type === type);
  }

  /**
   * Check if user has reflected today
   */
  hasReflectedToday(type = ReflectionTypes.MORNING) {
    return !!this.getTodayReflection(type);
  }

  /**
   * Get reflection streak
   */
  getStreak() {
    const reflections = this.loadReflections();
    const dates = [...new Set(reflections.map(r => r.date))].sort().reverse();

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const expectedDate = new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
        .toISOString().split('T')[0];

      if (date === expectedDate) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Generate insights from reflections
   */
  generateInsights() {
    const reflections = this.loadReflections();
    
    if (reflections.length < 7) {
      return {
        insights: [],
        message: 'Keep reflecting to unlock insights',
      };
    }

    const insights = [];

    // Reflection frequency
    const daysReflected = new Set(reflections.map(r => r.date)).size;
    insights.push({
      type: 'frequency',
      message: `You've reflected on ${daysReflected} different days`,
      positive: daysReflected >= 7,
    });

    // Topic patterns
    const topicCounts = {};
    reflections.forEach(r => {
      if (r.topicId) {
        topicCounts[r.topicId] = (topicCounts[r.topicId] || 0) + 1;
      }
    });

    const mostReflectedTopic = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostReflectedTopic) {
      insights.push({
        type: 'pattern',
        message: `You've been focusing on ${mostReflectedTopic[0]} (${mostReflectedTopic[1]} times)`,
        topicId: mostReflectedTopic[0],
      });
    }

    // Streak recognition
    const streak = this.getStreak();
    if (streak >= 3) {
      insights.push({
        type: 'streak',
        message: `${streak}-day reflection streak! 🌟`,
        positive: true,
      });
    }

    return {
      insights,
      totalReflections: reflections.length,
      streak,
    };
  }

  /**
   * Get reflection statistics
   */
  getStats() {
    const reflections = this.loadReflections();

    return {
      total: reflections.length,
      thisWeek: reflections.filter(r => {
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return r.timestamp > weekAgo;
      }).length,
      thisMonth: reflections.filter(r => {
        const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        return r.timestamp > monthAgo;
      }).length,
      streak: this.getStreak(),
      daysReflected: new Set(reflections.map(r => r.date)).size,
    };
  }
}

