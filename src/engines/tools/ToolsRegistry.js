// src/engines/tools/ToolsRegistry.js
// Official WellnessCafe Tools Registry
// Phase 36B: OS Integration

import { Wind, Waves, Heart, Brain, FileText, Target, Shield, Moon, Sparkles } from "lucide-react";

export const ToolsRegistry = [
  {
    id: "breathing",
    name: "Breathing Practice",
    description: "Choose a gentle pace, include optional holds, or follow your natural breath.",
    icon: Wind,
    category: "Breathing",
    intensity: "low",
    duration: "3-10 min",
    durationMinutes: 5,
    sessionType: "breathing",
    instruction: "Follow the orb only if its pace feels comfortable. You can breathe naturally or stop.",
    voiceScript: [
      "Breathe in at a comfortable pace",
      "Pause only if comfortable",
      "Breathe out at a comfortable pace",
      "Rest or breathe naturally",
    ],
    animationMode: "pulse",
    soundscape: "wind",
    breathPattern: { inhale: 4, hold: 7, exhale: 8, pause: 0 },
    theme: "calm",
  },
  {
    id: "grounding",
    name: "Choose an Anchor",
    description: "Choose one comfortable point of orientation in your surroundings; no counting or written answers",
    icon: Target,
    category: "Grounding",
    intensity: "low",
    duration: "3-5 min",
    durationMinutes: 3,
    sessionType: "grounding",
    instruction: "Choose one option that suits the moment, or stop whenever you like.",
    voiceScript: [
      "Rest your eyes on one steady thing",
      "Listen for a familiar sound, or choose quiet",
      "Hold a familiar texture if that feels useful",
      "Move toward a more comfortable part of the space",
    ],
    animationMode: "steady",
    soundscape: "rain",
    theme: "peace",
  },
  {
    id: "journaling",
    name: "Quick Journal",
    description: "Process your thoughts in writing",
    icon: FileText,
    category: "Reflection",
    intensity: "medium",
    duration: "5-15 min",
    voiceScript: [
      "What are you feeling right now?",
      "What triggered this feeling?",
      "What do you need in this moment?",
    ],
    animationMode: "subtle",
    soundscape: "silence",
    sessionType: "journaling",
    theme: "calm",
  },
  {
    id: "urge-surfing",
    name: "Urge Support",
    description: "Choose a practical next move, reach out to someone, or take a short optional pause.",
    icon: Waves,
    category: "Urge Management",
    intensity: "medium",
    duration: "Optional 3 min",
    voiceScript: [
      "Choose one practical next move",
      "Contact someone you trust if that would help",
      "Take a short pause, or finish whenever you want",
    ],
    animationMode: "steady",
    soundscape: "silence",
    sessionType: "urge-surfing",
    theme: "calm",
  },
  {
    id: "body-scan",
    name: "Steady Ground",
    description: "Choose a supportive surface, easy movement, familiar object, or change to your space",
    icon: Heart,
    category: "Somatic",
    intensity: "low",
    duration: "1-3 min",
    voiceScript: [
      "Choose one small support that suits you",
      "You do not need to scan, rate, or write anything",
      "Stay, switch, or leave whenever you choose",
    ],
    animationMode: "steady",
    soundscape: "silence",
    sessionType: "body-scan",
    theme: "peace",
  },
  {
    id: "cravings",
    name: "Craving Reset",
    description: "Optional pause and support for cravings",
    icon: Shield,
    category: "Urge Management",
    intensity: "high",
    duration: "5-10 min",
    voiceScript: [
      "You can pause or stop whenever you choose",
      "Notice what support might feel useful",
      "A trusted person may be one option",
      "Choose the next step that works for you",
    ],
    animationMode: "protective",
    soundscape: "hum",
    sessionType: "cravings",
    breathPattern: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
    theme: "release",
  },
  {
    id: "panic-reset",
    name: "Panic Reset",
    description: "Optional grounding prompts for intense moments",
    icon: Brain,
    category: "Emergency",
    intensity: "high",
    duration: "3-5 min",
    durationMinutes: 4,
    sessionType: "panic",
    instruction: "Choose any prompt that feels useful. You can skip or stop at any time.",
    voiceScript: [
      "Let your breath be natural, or leave it out",
      "Notice something around you if comfortable",
      "Choose a neutral point of attention",
      "Stop whenever you choose",
    ],
    animationMode: "rapid",
    soundscape: "wind",
    breathPattern: { inhale: 4, hold: 0, exhale: 6, pause: 0 },
    theme: "calm",
  },
  {
    id: "emotion-regulator",
    name: "Emotion Regulator",
    description: "Navigate difficult emotions safely",
    icon: Heart,
    category: "Emotional",
    intensity: "medium",
    duration: "10 min",
    voiceScript: [
      "Name the emotion you're feeling",
      "Where do you feel it in your body?",
      "What does this emotion need?",
      "Can you give yourself what you need?",
    ],
    animationMode: "gentle",
    soundscape: "rain",
    sessionType: "emotion",
    theme: "calm",
  },
  {
    id: "shame-release",
    name: "Shame Release",
    description: "Compassionate shame processing",
    icon: Sparkles,
    category: "Emotional",
    intensity: "high",
    duration: "10-15 min",
    voiceScript: [
      "Shame is a feeling, not a truth",
      "You are worthy of compassion",
      "This feeling will pass",
      "You are not alone",
    ],
    animationMode: "healing",
    soundscape: "bowl",
    sessionType: "shame",
    theme: "peace",
  },
  {
    id: "sleep-reset",
    name: "Sleep Reset",
    description: "Prepare your body for rest",
    icon: Moon,
    category: "Sleep",
    intensity: "low",
    duration: "15-20 min",
    voiceScript: [
      "Let your body become heavy",
      "Release the day's tension",
      "Your only job is to rest",
      "Sleep will come naturally",
    ],
    animationMode: "slow",
    soundscape: "rain",
    sessionType: "sleep",
    breathPattern: { inhale: 5, hold: 0, exhale: 5, pause: 0 },
    theme: "peace",
  },
];

/**
 * Get tool by ID
 */
export function getToolById(id) {
  return ToolsRegistry.find(tool => tool.id === id);
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category) {
  if (category === "all" || !category) return ToolsRegistry;
  return ToolsRegistry.filter(tool => tool.category === category);
}

/**
 * Get all categories
 */
export function getAllCategories() {
  const categories = new Set(ToolsRegistry.map(tool => tool.category));
  return [{ id: "all", label: "All Tools" }, ...Array.from(categories).map(cat => ({
    id: cat.toLowerCase().replace(/\s+/g, '-'),
    label: cat
  }))];
}

/**
 * Get tools by intensity
 */
export function getToolsByIntensity(intensity) {
  return ToolsRegistry.filter(tool => tool.intensity === intensity);
}

/**
 * Search tools
 */
export function searchTools(query) {
  const q = query.toLowerCase();
  return ToolsRegistry.filter(tool => 
    tool.name.toLowerCase().includes(q) ||
    tool.description.toLowerCase().includes(q) ||
    tool.category.toLowerCase().includes(q)
  );
}
