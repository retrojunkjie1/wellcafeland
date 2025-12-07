// src/hooks/useTopicMemory.js
// PHASE 44 — Topic Memory Hook

import { useEffect } from "react";
import { useMemoryStore } from "@/store/memoryStore";
import { rememberTopic } from "@/engines/memory/contentMemoryEngine";

/**
 * Hook for topic pages (e.g. Shame, Grief, Self-Compassion).
 */
export function useTopicMemory(topicId, topicType) {
  const lastTopicId = useMemoryStore((s) => s.lastTopicId);
  const lastTopicType = useMemoryStore((s) => s.lastTopicType);
  const lastTopicVisitedAt = useMemoryStore((s) => s.lastTopicVisitedAt);

  // Record on mount or topic change
  useEffect(() => {
    if (topicId) {
      rememberTopic(topicId, topicType);
    }
  }, [topicId, topicType]);

  return {
    lastTopic: lastTopicId
      ? {
          id: lastTopicId,
          type: lastTopicType,
          visitedAt: lastTopicVisitedAt,
        }
      : null,
  };
}

