// src/hooks/useDailyReflection.js
// React hook for daily reflection
// Phase 41: Daily Reflection Engine

import { useMemo } from 'react';
import { getDailyReflection } from '@/engines/reflection/dailyReflectionEngine';

/**
 * Simple hook for daily reflection
 * @param {Date} date - Date for reflection
 * @returns {Object} Reflection data
 */
export function useDailyReflection(date = new Date()) {
  return useMemo(() => getDailyReflection(date), [date]);
}

