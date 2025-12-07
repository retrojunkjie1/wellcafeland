// src/engines/learningPaths/tileIconMap.js
// Icon mapping for learning path tiles - ensures each tile has at least 2 unique icons

import {
  Shield,
  Heart,
  Brain,
  Lock,
  Eye,
  Waves,
  Target,
  Sparkles,
  Anchor,
  Compass,
  Lightbulb,
  BookOpen,
  Users,
  Clock,
  Activity,
  Zap,
  Moon,
  Sun,
  Droplet,
  Flame,
  Wind,
  TreePine,
  Mountain,
  Circle,
  Star,
  Gem,
  Key,
  Unlock,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  TrendingUp,
  Layers,
  GitBranch,
  BarChart,
} from "lucide-react";

// Icon mapping for each tile based on topic and tile ID
// Each tile has 3 unique, relevant icons for better visual density
export const TILE_ICON_MAP = {
  // Shame and Recovery
  "shame-and-recovery": {
    "what-shame-really-is": [Shield, Heart, Brain],
    "origin-story": [Eye, Compass, BookOpen],
    "shame-vs-guilt": [Target, AlertCircle, Info],
    "shame-and-nervous-system": [Brain, Activity, Zap],
    "shame-in-relationships": [Users, Heart, Shield],
    "shame-loop": [GitBranch, AlertCircle, Flame],
    "integrating-shame": [Sparkles, CheckCircle, Gem],
  },
  
  // Cravings and Urges
  "cravings-and-urges": {
    "what-cravings-really-are": [Waves, Brain, AlertCircle],
    "three-layers": [Layers, Activity, Target],
    "wave-pattern": [Waves, TrendingUp, Anchor],
    "what-it-protects": [Shield, Eye, Heart],
    "urge-surfing": [Waves, Anchor, Compass],
    "triggers": [Target, AlertCircle, Zap],
    "long-term-shift": [TrendingUp, Sparkles, CheckCircle],
  },
  
  // Nervous System Regulation
  "nervous-system-regulation": {
    "what-regulation-is": [Activity, Brain, Target],
    "window-of-tolerance": [Target, Layers, BarChart],
    "hyperarousal": [Zap, AlertCircle, Flame],
    "hypoarousal": [Moon, Droplet, Wind],
    "regulation-tools": [Sparkles, Key, Heart],
    "co-regulation": [Users, Heart, Activity],
    "long-term-regulation": [TrendingUp, Layers, Gem],
  },
  
  // Trauma and Recovery
  "trauma-and-recovery": {
    "what-trauma-is": [Shield, AlertCircle, Heart],
    "trauma-responses": [Activity, Brain, Zap],
    "trauma-and-addiction": [Shield, Waves, AlertCircle],
    "processing-trauma": [Heart, Sparkles, Key],
    "trauma-triggers": [Target, AlertCircle, Eye],
    "post-traumatic-growth": [TrendingUp, Gem, Star],
    "trauma-informed-recovery": [Shield, CheckCircle, Heart],
  },
  
  // Sleep and Recovery
  "sleep-and-recovery": {
    "why-sleep-matters": [Moon, Activity, Heart],
    "sleep-and-nervous-system": [Moon, Brain, Activity],
    "sleep-hygiene": [Moon, Sparkles, Key],
    "nighttime-anxiety": [Moon, AlertCircle, Zap],
    "sleep-and-cravings": [Moon, Waves, AlertCircle],
    "sleep-medications": [Moon, Key, Info],
    "rest-as-practice": [Moon, Heart, Sparkles],
  },
  
  // Boundaries in Recovery
  "boundaries-in-recovery": {
    "what-boundaries-are": [Shield, Lock, Key],
    "boundaries-and-guilt": [Heart, AlertCircle, Shield],
    "types-of-boundaries": [Layers, Shield, Target],
    "boundaries-with-family": [Users, Shield, Heart],
    "boundaries-with-self": [Shield, Heart, Key],
    "enforcing-boundaries": [Key, CheckCircle, Shield],
    "boundaries-as-love": [Heart, Shield, Sparkles],
  },
  
  // Grief and Loss
  "grief-and-loss": {
    "what-grief-is": [Heart, Droplet, Moon],
    "types-of-grief": [Layers, Heart, Compass],
    "grief-and-relapse": [Heart, AlertCircle, Waves],
    "grieving-in-recovery": [Heart, TrendingUp, Sparkles],
    "complicated-grief": [AlertCircle, Heart, Zap],
    "grief-and-future": [Heart, Compass, TrendingUp],
    "grief-as-healing": [Heart, Sparkles, Gem],
  },
  
  // Self-Compassion
  "self-compassion": {
    "what-self-compassion-is": [Heart, Sparkles, Gem],
    "self-compassion-research": [BookOpen, Heart, Lightbulb],
    "self-compassion-practice": [Heart, Key, Sparkles],
    "self-compassion-and-accountability": [Target, Heart, CheckCircle],
    "self-compassion-and-shame": [Heart, Shield, Sparkles],
    "self-compassion-challenges": [AlertCircle, Heart, Key],
    "self-compassion-as-foundation": [Heart, Gem, Star],
  },
};

// Fallback icons if tile not found
const DEFAULT_ICONS = [BookOpen, Lightbulb, Star];

/**
 * Get icons for a specific tile
 * @param {string} topicId - Topic ID
 * @param {string} tileId - Tile ID
 * @returns {Array} Array of icon components (3 icons)
 */
export function getTileIcons(topicId, tileId) {
  const topicMap = TILE_ICON_MAP[topicId];
  if (!topicMap) return DEFAULT_ICONS;
  
  const icons = topicMap[tileId];
  if (!icons || icons.length < 3) {
    // Pad with default icons if needed
    return [...(icons || []), ...DEFAULT_ICONS].slice(0, 3);
  }
  
  return icons;
}
