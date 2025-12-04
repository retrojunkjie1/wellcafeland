// src/hooks/useAdaptiveContent.js
// React hook for emotion-adaptive content
// Phase 40: Emotion-Adaptive Content Engine

import { useState, useEffect } from 'react';
import { 
  detectEmotionalState, 
  getAdaptiveRecommendations,
  filterContentByEmotionalState,
  sortContentByRelevance,
  getSafetyRecommendation,
  modulateContentTone
} from '@/engines/adaptive/emotionAdaptiveEngine';

/**
 * Hook for emotion-adaptive content recommendations
 * @param {Object} userState - Current user state
 * @returns {Object} Adaptive recommendations and controls
 */
export function useAdaptiveContent(userState = {}) {
  const [emotionalState, setEmotionalState] = useState('neutral');
  const [recommendations, setRecommendations] = useState(null);
  const [safetyRec, setSafetyRec] = useState(null);

  useEffect(() => {
    const analyzeState = () => {
      const detected = detectEmotionalState(userState);
      setEmotionalState(detected);

      const recs = getAdaptiveRecommendations(userState);
      setRecommendations(recs);

      const safety = getSafetyRecommendation(detected);
      setSafetyRec(safety);
    };

    analyzeState();
  }, [userState]);

  const filterTopics = (topics) => {
    const filtered = filterContentByEmotionalState(topics, emotionalState);
    return sortContentByRelevance(filtered, emotionalState);
  };

  const modulateContent = (content) => {
    return modulateContentTone(content, emotionalState);
  };

  return {
    emotionalState,
    recommendations,
    safetyRecommendation: safetyRec,
    filterTopics,
    modulateContent,
  };
}

