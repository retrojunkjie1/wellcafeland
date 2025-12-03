// src/hooks/useDailyReflection.js
// React hook for daily reflection
// Phase 41: Daily Reflection Engine

import { useState, useEffect, useMemo } from 'react';
import { ReflectionEngine, generateReflectionPrompt, ReflectionTypes } from '@/engines/reflection/reflectionEngine';

/**
 * Hook for managing daily reflections
 * @param {string} userId - User ID
 * @returns {Object} Reflection state and controls
 */
export function useDailyReflection(userId = 'anonymous') {
  const engine = useMemo(() => new ReflectionEngine(userId), [userId]);
  
  const [hasReflectedToday, setHasReflectedToday] = useState(false);
  const [todayPrompt, setTodayPrompt] = useState('');
  const [streak, setStreak] = useState(0);
  const [insights, setInsights] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadData = () => {
      const reflected = engine.hasReflectedToday(ReflectionTypes.MORNING);
      setHasReflectedToday(reflected);

      if (!reflected) {
        const prompt = generateReflectionPrompt(null, ReflectionTypes.MORNING);
        setTodayPrompt(prompt);
      }

      setStreak(engine.getStreak());
      setInsights(engine.generateInsights());
      setStats(engine.getStats());
    };

    loadData();
  }, [engine]);

  const saveReflection = async (response, type = ReflectionTypes.MORNING, topicId = null) => {
    const prompt = todayPrompt || generateReflectionPrompt(topicId, type);
    
    const entry = await engine.saveReflection({
      type,
      topicId,
      prompt,
      response,
    });

    if (entry) {
      setHasReflectedToday(true);
      setStreak(engine.getStreak());
      setInsights(engine.generateInsights());
      setStats(engine.getStats());
    }

    return entry;
  };

  return {
    hasReflectedToday,
    todayPrompt,
    streak,
    insights,
    stats,
    saveReflection,
    loadReflections: () => engine.loadReflections(),
  };
}

