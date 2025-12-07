// src/hooks/useLearningPath.js
// Phase 45: React hooks for Learning Paths

import { useState, useMemo, useCallback } from "react";
import {
  getTopic,
  getTopicList,
  pickTileVersion,
} from "@/engines/learningPaths/learningPathsEngine";

/**
 * Hook to get list of all learning topics
 * @returns {{topics: Array}}
 */
export function useLearningTopics() {
  const topics = useMemo(() => getTopicList(), []);
  return { topics };
}

/**
 * Hook for managing a single learning topic's state
 * @param {string} topicId
 * @returns {object} Topic state and actions
 */
export function useLearningTopic(topicId) {
  const [activeTileId, setActiveTileId] = useState(null);
  const [currentInsight, setCurrentInsight] = useState(null);

  const topic = useMemo(() => getTopic(topicId), [topicId]);
  const tiles = topic?.tiles || [];

  const openTile = useCallback(
    (tileId) => {
      if (!tileId) return;
      setActiveTileId(tileId);
      const insight = pickTileVersion(topicId, tileId);
      setCurrentInsight(insight);
    },
    [topicId]
  );

  const refreshInsight = useCallback(() => {
    if (!activeTileId || !topicId) return;
    // Force a different version when refreshing
    const insight = pickTileVersion(topicId, activeTileId, true);
    if (insight) {
      setCurrentInsight(insight);
    }
  }, [topicId, activeTileId]);

  const closeInsight = useCallback(() => {
    setActiveTileId(null);
    setCurrentInsight(null);
  }, []);

  return {
    topic,
    tiles,
    activeTileId,
    currentInsight,
    openTile,
    refreshInsight,
    closeInsight,
  };
}

