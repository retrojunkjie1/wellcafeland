// src/engines/tools/ToolsRegistry.js
// Official WellnessCafe Tools Registry
// Phase 36B: OS Integration

import { Wind, Waves, Heart, Brain, FileText, Target, Shield, Moon, Sparkles } from "lucide-react";

export const ToolsRegistry = [
  {
    id: "breathing",
    name: "Breath Reset",
    description: "Calm your nervous system with guided breathing",
    icon: Wind,
    category: "Nervous System",
    intensity: "low",
    duration: "3-10 min",
    voiceScript: [
      "Breathe in slowly through your nose",
      "Hold the breath gently",
      "Exhale slowly through your mouth",
      "Pause and rest",
    ],
    animationMode: "pulse",
    soundscape: "wind",
    sessionType: "breathing",
    breathPattern: { inhale: 4, hold: 7, exhale: 8, pause: 0 },
    theme: "calm",
  },
  {
    id: "grounding",
    name: "5-4-3-2-1 Grounding",
    description: "Ground yourself in the present moment",
    icon: Target,
    category: "Grounding",
    intensity: "low",
    duration: "5 min",
    voiceScript: [
      "Name 5 things you can see",
      "Name 4 things you can touch",
      "Name 3 things you can hear",
      "Name 2 things you can smell",
      "Name 1 thing you can taste",
    ],
    animationMode: "steady",
    soundscape: "rain",
    sessionType: "grounding",
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
    name: "Urge Surfing",
    description: "Ride the wave of craving without acting",
    icon: Waves,
    category: "Urge Management",
    intensity: "medium",
    duration: "10-15 min",
    voiceScript: [
      "Notice the urge without judgment",
      "Observe where you feel it in your body",
      "Watch it rise like a wave",
      "Let it crest and fall naturally",
    ],
    animationMode: "wave",
    soundscape: "ocean",
    sessionType: "urge-surfing",
    breathPattern: { inhale: 5, hold: 2, exhale: 7, pause: 1 },
    theme: "calm",
  },
  {
    id: "body-scan",
    name: "Body Scan",
    description: "Release tension from head to toe",
    icon: Heart,
    category: "Somatic",
    intensity: "medium",
    duration: "10-20 min",
    voiceScript: [
      "Bring awareness to your head",
      "Notice any tension",
      "Breathe into that area",
      "Release and let go",
    ],
    animationMode: "scan",
    soundscape: "bowl",
    sessionType: "body-scan",
    theme: "peace",
  },
  {
    id: "cravings",
    name: "Craving Reset",
    description: "De-escalate substance cravings",
    icon: Shield,
    category: "Urge Management",
    intensity: "high",
    duration: "5-10 min",
    voiceScript: [
      "This craving is temporary",
      "You are safe right now",
      "You have the strength to wait",
      "This will pass",
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
    description: "Immediate relief for panic attacks",
    icon: Brain,
    category: "Emergency",
    intensity: "high",
    duration: "3-5 min",
    voiceScript: [
      "You are safe",
      "This will pass",
      "Focus on your breath",
      "You are in control",
    ],
    animationMode: "rapid",
    soundscape: "wind",
    sessionType: "panic",
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

