// src/hooks/useContentTopic.js
// React hook for loading and managing content topics
// Phase 38: Full Intelligent Cinematic Content Engine

import { useState, useEffect } from "react";
import { loadTopicContent, trackContentRead, updateContentEngagementStats } from "@/engines/content/contentEngine";

/**
 * Hook for loading and managing content topic
 * @param {string} topicId - Topic ID to load
 * @returns {Object} Topic data and control functions
 */
export function useContentTopic(topicId) {
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [readStartTime, setReadStartTime] = useState(null);

  useEffect(() => {
    if (!topicId) {
      setTopic(null);
      return;
    }

    let cancelled = false;

    const loadTopic = async () => {
      setLoading(true);
      setError(null);

      try {
        const topicData = await loadTopicContent(topicId);
        
        if (!cancelled) {
          setTopic(topicData);
          setReadStartTime(Date.now());
          
          // Update engagement stats
          updateContentEngagementStats('anonymous', {
            topicId: topicData?.id,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load topic');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTopic();

    return () => {
      cancelled = true;
      
      // Track reading time on unmount
      if (readStartTime) {
        const duration = Math.floor((Date.now() - readStartTime) / 1000);
        trackContentRead(topicId, duration, 100);
        
        updateContentEngagementStats('anonymous', {
          readTime: duration,
        });
      }
    };
  }, [topicId]);

  const markReflectionComplete = (_promptIndex) => {
    updateContentEngagementStats('anonymous', {
      reflectionCompleted: true,
    });
  };

  return {
    topic,
    loading,
    error,
    content: topic?.content || [],
    relatedTools: topic?.relatedTools || [],
    reflectionPrompts: topic?.reflectionPrompts || [],
    markReflectionComplete,
  };
}

/**
 * Hook for tracking content reading progress
 * @param {string} contentId - Content ID being read
 * @returns {Object} Progress tracking functions
 */
export function useContentProgress(contentId) {
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(() => Date.now());

  const updateProgress = (percentComplete) => {
    setProgress(percentComplete);
    
    if (percentComplete >= 90) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      trackContentRead(contentId, duration, percentComplete);
    }
  };

  return {
    progress,
    updateProgress,
  };
}

