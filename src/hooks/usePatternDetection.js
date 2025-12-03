// src/hooks/usePatternDetection.js
// React hook for trauma pattern detection
// Phase 42: Trauma Pattern Detection Layer

import { useState, useEffect } from 'react';
import { 
  detectPatterns, 
  getPatternBasedRecommendations,
  detectCrisisRisk,
  getCrisisSupportMessage
} from '@/engines/patterns/traumaPatternEngine';

/**
 * Hook for detecting behavioral patterns and providing supportive suggestions
 * @param {Object} activityData - User activity data
 * @param {boolean} enabled - Enable pattern detection
 * @returns {Object} Detected patterns and recommendations
 */
export function usePatternDetection(activityData = {}, enabled = true) {
  const [patterns, setPatterns] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [crisisRisk, setCrisisRisk] = useState(false);
  const [crisisSupport, setCrisisSupport] = useState(null);

  useEffect(() => {
    const analyzePatterns = () => {
      if (!enabled) {
        setPatterns([]);
        setRecommendations([]);
        setCrisisRisk(false);
        return;
      }

      // Detect patterns
      const detected = detectPatterns(activityData);
      setPatterns(detected);

      // Get recommendations
      const recs = getPatternBasedRecommendations(detected);
      setRecommendations(recs);

      // Check crisis risk
      const crisis = detectCrisisRisk(detected);
      setCrisisRisk(crisis);

      if (crisis) {
        setCrisisSupport(getCrisisSupportMessage());
      } else {
        setCrisisSupport(null);
      }
    };

    analyzePatterns();
  }, [activityData, enabled]);

  return {
    patterns,
    recommendations,
    crisisRisk,
    crisisSupport,
    hasPatterns: patterns.length > 0,
  };
}

