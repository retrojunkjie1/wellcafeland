// src/engines/content/contentTopicsRegistry.js
// Content Topics Registry - Intelligent Topic Categorization
// Phase 38: Full Intelligent Cinematic Content Engine

import { Brain, Heart, Moon, Shield, Users, Sparkles, Wind, Target, FileHeart } from "lucide-react";

/**
 * Content topic categories for educational and recovery content
 */
export const CONTENT_TOPICS = {
  NERVOUS_SYSTEM: "Nervous System Regulation",
  TRAUMA_RECOVERY: "Trauma and Recovery",
  SLEEP_RECOVERY: "Sleep and Recovery",
  BOUNDARIES: "Boundaries in Recovery",
  GRIEF_LOSS: "Grief and Loss",
  SELF_COMPASSION: "Self-Compassion",
  CRAVINGS_URGES: "Cravings and Urges",
  SHAME_GUILT: "Shame and Guilt",
  ANXIETY_PANIC: "Anxiety and Panic",
  EMOTIONAL_REGULATION: "Emotional Regulation",
};

/**
 * Topic metadata registry
 * Links topics to: theme, icon, content IDs, tools, and reflection prompts
 */
export const contentTopicsRegistry = {
  [CONTENT_TOPICS.NERVOUS_SYSTEM]: {
    id: "nervous-system",
    name: CONTENT_TOPICS.NERVOUS_SYSTEM,
    theme: "calm",
    icon: Wind,
    palette: "calm",
    description: "Understanding your nervous system and how to regulate it",
    contentIds: [
      "education.nervous-system.intro",
      "tool.breathing.basic1",
      "tool.grounding.54321",
    ],
    relatedTools: ["breathing", "grounding", "body-scan"],
    reflectionPrompts: [
      "What does your nervous system feel like right now?",
      "When do you notice dysregulation most often?",
      "What helps you feel calm and grounded?",
    ],
    readingTimeMinutes: 8,
    intensity: "low",
  },

  [CONTENT_TOPICS.TRAUMA_RECOVERY]: {
    id: "trauma-recovery",
    name: CONTENT_TOPICS.TRAUMA_RECOVERY,
    theme: "peace",
    icon: Shield,
    palette: "grounding",
    description: "Trauma-informed approaches to healing and recovery",
    contentIds: [
      "education.trauma.basics",
      "recovery.trauma.gentle",
    ],
    relatedTools: ["grounding", "body-scan", "emotion-regulator"],
    reflectionPrompts: [
      "What does safety feel like in your body?",
      "What small step toward healing feels possible today?",
      "Who or what helps you feel safe?",
    ],
    readingTimeMinutes: 12,
    intensity: "high",
  },

  [CONTENT_TOPICS.SLEEP_RECOVERY]: {
    id: "sleep-recovery",
    name: CONTENT_TOPICS.SLEEP_RECOVERY,
    theme: "peace",
    icon: Moon,
    palette: "peace",
    description: "Sleep hygiene and rest practices for recovery",
    contentIds: [
      "education.sleep.basics",
      "recovery.sleep.reset",
    ],
    relatedTools: ["sleep-reset", "breathing", "body-scan"],
    reflectionPrompts: [
      "How is your sleep affecting your recovery?",
      "What makes it hard to sleep?",
      "What helps you feel rested?",
    ],
    readingTimeMinutes: 10,
    intensity: "low",
  },

  [CONTENT_TOPICS.BOUNDARIES]: {
    id: "boundaries",
    name: CONTENT_TOPICS.BOUNDARIES,
    theme: "focus",
    icon: Target,
    palette: "focus",
    description: "Setting and maintaining healthy boundaries",
    contentIds: [
      "education.boundaries.basics",
      "recovery.boundaries.practice",
    ],
    relatedTools: ["journaling", "emotion-regulator"],
    reflectionPrompts: [
      "Where do you need boundaries right now?",
      "What boundary would protect your recovery?",
      "What makes saying 'no' difficult?",
    ],
    readingTimeMinutes: 10,
    intensity: "medium",
  },

  [CONTENT_TOPICS.GRIEF_LOSS]: {
    id: "grief-loss",
    name: CONTENT_TOPICS.GRIEF_LOSS,
    theme: "peace",
    icon: Heart,
    palette: "peace",
    description: "Navigating grief and loss in recovery",
    contentIds: [
      "education.grief.basics",
      "recovery.grief.gentle",
    ],
    relatedTools: ["journaling", "body-scan", "emotion-regulator"],
    reflectionPrompts: [
      "What are you grieving right now?",
      "How does grief show up in your body?",
      "What does this grief need from you?",
    ],
    readingTimeMinutes: 12,
    intensity: "high",
  },

  [CONTENT_TOPICS.SELF_COMPASSION]: {
    id: "self-compassion",
    name: CONTENT_TOPICS.SELF_COMPASSION,
    theme: "calm",
    icon: Sparkles,
    palette: "reflection",
    description: "Practicing kindness and compassion toward yourself",
    contentIds: [
      "education.self-compassion.basics",
      "recovery.self-compassion.practice",
    ],
    relatedTools: ["journaling", "shame-release", "emotion-regulator"],
    reflectionPrompts: [
      "What would you say to a friend in your situation?",
      "Where can you offer yourself compassion today?",
      "What part of you needs kindness right now?",
    ],
    readingTimeMinutes: 10,
    intensity: "medium",
  },

  [CONTENT_TOPICS.CRAVINGS_URGES]: {
    id: "cravings-urges",
    name: CONTENT_TOPICS.CRAVINGS_URGES,
    theme: "calm",
    icon: Shield,
    palette: "release",
    description: "Understanding and managing cravings and urges",
    contentIds: [
      "recovery.cravings.intro",
      "tool.urge-surfing",
    ],
    relatedTools: ["urge-surfing", "breathing", "cravings"],
    reflectionPrompts: [
      "What triggers your cravings most often?",
      "What helps you ride the wave without acting?",
      "What do you need when a craving hits?",
    ],
    readingTimeMinutes: 10,
    intensity: "high",
  },

  [CONTENT_TOPICS.SHAME_GUILT]: {
    id: "shame-guilt",
    name: CONTENT_TOPICS.SHAME_GUILT,
    theme: "peace",
    icon: FileHeart,
    palette: "reflection",
    description: "Understanding and processing shame and guilt",
    contentIds: [
      "education.shame.basics",
      "recovery.shame.gentle",
    ],
    relatedTools: ["shame-release", "journaling", "self-surgeon"],
    reflectionPrompts: [
      "What are you carrying shame about?",
      "Can you separate what you did from who you are?",
      "What would self-forgiveness look like?",
    ],
    readingTimeMinutes: 12,
    intensity: "high",
  },

  [CONTENT_TOPICS.ANXIETY_PANIC]: {
    id: "anxiety-panic",
    name: CONTENT_TOPICS.ANXIETY_PANIC,
    theme: "calm",
    icon: Brain,
    palette: "anxiety",
    description: "Managing anxiety and panic with compassion",
    contentIds: [
      "education.anxiety.basics",
      "tool.breathing.basic1",
      "tool.grounding.54321",
    ],
    relatedTools: ["panic-reset", "breathing", "grounding"],
    reflectionPrompts: [
      "What does anxiety feel like in your body?",
      "When did you first notice this anxiety?",
      "What helps calm your nervous system?",
    ],
    readingTimeMinutes: 10,
    intensity: "medium",
  },

  [CONTENT_TOPICS.EMOTIONAL_REGULATION]: {
    id: "emotional-regulation",
    name: CONTENT_TOPICS.EMOTIONAL_REGULATION,
    theme: "calm",
    icon: Heart,
    palette: "calm",
    description: "Skills for navigating difficult emotions safely",
    contentIds: [
      "education.emotions.basics",
      "recovery.emotions.practice",
    ],
    relatedTools: ["emotion-regulator", "journaling", "body-scan"],
    reflectionPrompts: [
      "What emotion are you feeling right now?",
      "Where do you feel this emotion in your body?",
      "What does this emotion need from you?",
    ],
    readingTimeMinutes: 10,
    intensity: "medium",
  },
};

/**
 * List all content topics
 * @returns {Array} Array of topic objects
 */
export function listContentTopics() {
  return Object.values(contentTopicsRegistry);
}

/**
 * Get content topic by ID, name, or enum
 * @param {string} idOrName - Topic ID, full name, or enum key
 * @returns {Object|null} Topic object or null
 */
export function getContentTopicById(idOrName) {
  if (!idOrName) return null;

  // Try direct lookup by name (enum value)
  if (contentTopicsRegistry[idOrName]) {
    return contentTopicsRegistry[idOrName];
  }

  // Try lookup by ID
  const byId = Object.values(contentTopicsRegistry).find(
    topic => topic.id === idOrName
  );
  if (byId) return byId;

  // Try fuzzy match on name
  const normalized = idOrName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const byNormalizedId = Object.values(contentTopicsRegistry).find(
    topic => topic.id === normalized
  );
  if (byNormalizedId) return byNormalizedId;

  return null;
}

/**
 * Get topics by theme
 * @param {string} theme - Theme name (calm, peace, focus, etc.)
 * @returns {Array} Array of topic objects
 */
export function getTopicsByTheme(theme) {
  return Object.values(contentTopicsRegistry).filter(
    topic => topic.theme === theme
  );
}

/**
 * Get topics by intensity
 * @param {string} intensity - Intensity level (low, medium, high)
 * @returns {Array} Array of topic objects
 */
export function getTopicsByIntensity(intensity) {
  return Object.values(contentTopicsRegistry).filter(
    topic => topic.intensity === intensity
  );
}

/**
 * Search topics by query
 * @param {string} query - Search query
 * @returns {Array} Array of matching topic objects
 */
export function searchTopics(query) {
  if (!query) return [];
  
  const q = query.toLowerCase();
  return Object.values(contentTopicsRegistry).filter(topic =>
    topic.name.toLowerCase().includes(q) ||
    topic.description.toLowerCase().includes(q) ||
    topic.id.includes(q)
  );
}

/**
 * Get related tools for a topic
 * @param {string} topicId - Topic ID
 * @returns {Array} Array of related tool IDs
 */
export function getRelatedTools(topicId) {
  const topic = getContentTopicById(topicId);
  return topic?.relatedTools || [];
}

/**
 * Get reflection prompts for a topic
 * @param {string} topicId - Topic ID
 * @returns {Array} Array of reflection prompt strings
 */
export function getReflectionPrompts(topicId) {
  const topic = getContentTopicById(topicId);
  return topic?.reflectionPrompts || [];
}

