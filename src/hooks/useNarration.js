// src/hooks/useNarration.js
// React hook for content narration
// Phase 39: Intelligent Audio Narration Engine

import { useState, useEffect, useRef } from 'react';
import { NarrationEngine } from '@/engines/narration/narrationEngine';
import { getRecommendedVoiceProfile } from '@/engines/narration/voiceProfiles';

/**
 * Hook for managing content narration
 * @param {string} contentId - Content ID
 * @param {Object} content - Content object with body and metadata
 * @returns {Object} Narration controls and state
 */
export function useNarration(contentId, content) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const engineRef = useRef(null);

  useEffect(() => {
    if (!content || !content.body) return;

    // Initialize narration engine
    const voiceProfile = getRecommendedVoiceProfile({
      intensity: content.intensity,
      theme: content.theme,
      tags: content.tags || [],
    });

    const engine = new NarrationEngine(contentId, content, voiceProfile);
    
    engine.setCallbacks({
      onStart: () => setIsPlaying(true),
      onProgress: (prog) => setProgress(prog),
      onComplete: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(100);
      },
      onError: (err) => setError(err),
    });

    engineRef.current = engine;

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, [contentId, content]);

  const start = async () => {
    if (engineRef.current) {
      setError(null);
      await engineRef.current.start();
    }
  };

  const pause = () => {
    if (engineRef.current) {
      engineRef.current.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (engineRef.current) {
      engineRef.current.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (engineRef.current) {
      engineRef.current.stop();
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
    }
  };

  const skipForward = () => {
    if (engineRef.current) {
      engineRef.current.skipForward();
    }
  };

  const skipBackward = () => {
    if (engineRef.current) {
      engineRef.current.skipBackward();
    }
  };

  const setSpeed = (rate) => {
    if (engineRef.current) {
      engineRef.current.setSpeed(rate);
    }
  };

  return {
    isPlaying,
    isPaused,
    progress,
    error,
    start,
    pause,
    resume,
    stop,
    skipForward,
    skipBackward,
    setSpeed,
  };
}

