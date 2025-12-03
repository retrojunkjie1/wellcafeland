// src/hooks/useTopicSession.js
// Central hook combining intelligent content + narration + emotional context
// Phase 43: Full Intelligent UI Activation Layer

import { useMemo } from "react";
import { generateContentForTopic } from "@/engines/content/contentEngine";
import { useNarrationSimple } from "@/hooks/useNarrationSimple";
import { useDailyReflection } from "@/hooks/useDailyReflection";
import { useTraumaPatterns } from "@/hooks/useTraumaPatterns";

export function useTopicSession(topicKey) {
  // Defensive guard – avoid crashes if topic is missing
  const safeTopicKey = topicKey || "nervous-system-regulation";

  // Intelligent content for this topic
  const content = useMemo(() => {
    try {
      return generateContentForTopic(safeTopicKey);
    } catch (err) {
      console.warn("[useTopicSession] content error", err);
      return {
        topic: safeTopicKey,
        understanding: { text: "Content loading..." },
        reflection: { question: "What brought you here today?" },
      };
    }
  }, [safeTopicKey]);

  // Daily reflection
  const dailyReflection = useDailyReflection();

  // Trauma patterns (with empty data for now, can be wired later)
  const trauma = useTraumaPatterns({ recentEvents: [], streakGaps: [] });

  // Narration for "Read to me"
  const fullText = useMemo(() => {
    const understanding = content?.understanding?.text || "";
    const reflection = content?.reflection?.question || "";
    return `${understanding} Reflection: ${reflection}`;
  }, [content]);

  const narration = useNarrationSimple();

  // Unified narration controls
  const narrationControls = useMemo(() => ({
    toggle: () => {
      if (narration.isSpeaking) {
        narration.stop();
      } else {
        narration.start(fullText);
      }
    },
    isPlaying: narration.isSpeaking,
    stop: narration.stop,
  }), [narration, fullText]);

  return {
    content,
    emotion: null, // Can be wired later with useEmotionSnapshot
    traumaSummary: trauma?.summary || null,
    dailyReflection,
    narration: narrationControls,
  };
}

