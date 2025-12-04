// src/engines/narration/voiceProfiles.js
// Voice profile definitions for content narration
// Phase 39: Intelligent Audio Narration Engine

export const NarrationVoiceProfiles = {
  CALM: {
    id: 'calm',
    name: 'Calm & Grounded',
    description: 'Gentle, steady voice for general content',
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8,
    preferredVoices: ['Samantha', 'Karen', 'Google UK English Female'],
    pauseDuration: 800, // ms between sentences
  },
  COMPASSIONATE: {
    id: 'compassionate',
    name: 'Compassionate & Soft',
    description: 'Warm, gentle voice for emotional content',
    rate: 0.85,
    pitch: 0.98,
    volume: 0.75,
    preferredVoices: ['Samantha', 'Karen', 'Google US English Female'],
    pauseDuration: 1000,
  },
  CLINICAL: {
    id: 'clinical',
    name: 'Clinical & Clear',
    description: 'Clear, professional voice for educational content',
    rate: 0.95,
    pitch: 1.02,
    volume: 0.85,
    preferredVoices: ['Alex', 'Google UK English Male', 'Microsoft David'],
    pauseDuration: 700,
  },
  URGENT: {
    id: 'urgent',
    name: 'Urgent & Present',
    description: 'Immediate, grounding voice for crisis content',
    rate: 0.8,
    pitch: 0.95,
    volume: 0.9,
    preferredVoices: ['Samantha', 'Karen'],
    pauseDuration: 1200,
  },
};


/**
 * Get recommended voice profile for content
 */
export function getRecommendedVoiceProfile(contentMetadata = {}) {
  const { intensity, theme, tags = [] } = contentMetadata;

  // Panic/crisis content
  if (tags.includes('panic') || tags.includes('crisis')) {
    return NarrationVoiceProfiles.URGENT;
  }

  // Heavy emotional content
  if (intensity === 'high' || tags.includes('grief') || tags.includes('shame')) {
    return NarrationVoiceProfiles.COMPASSIONATE;
  }

  // Educational/informational
  if (tags.includes('education') || theme === 'focus') {
    return NarrationVoiceProfiles.CLINICAL;
  }

  // Default
  return NarrationVoiceProfiles.CALM;
}

