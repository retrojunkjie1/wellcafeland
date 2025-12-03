// src/engines/adaptive/contentModulator.js
// Content tone and presentation modulation
// Phase 40: Emotion-Adaptive Content Engine

/**
 * Tone modulation rules
 */
export const ToneModulations = {
  GENTLE: {
    id: 'gentle',
    name: 'Gentle',
    voiceRate: 0.85,
    voicePitch: 0.95,
    pauseDuration: 1200,
    wordingAdjustments: {
      'must': 'might',
      'should': 'could',
      'need to': 'can',
    },
  },
  REASSURING: {
    id: 'reassuring',
    name: 'Reassuring',
    voiceRate: 0.9,
    voicePitch: 0.98,
    pauseDuration: 1000,
    wordingAdjustments: {},
  },
  COMPASSIONATE: {
    id: 'compassionate',
    name: 'Compassionate',
    voiceRate: 0.88,
    voicePitch: 0.96,
    pauseDuration: 1100,
    wordingAdjustments: {},
  },
  FIRM: {
    id: 'firm',
    name: 'Firm',
    voiceRate: 0.95,
    voicePitch: 1.02,
    pauseDuration: 800,
    wordingAdjustments: {},
  },
  NEUTRAL: {
    id: 'neutral',
    name: 'Neutral',
    voiceRate: 0.9,
    voicePitch: 1.0,
    pauseDuration: 900,
    wordingAdjustments: {},
  },
};

/**
 * Apply tone modulation to text
 */
export function modulateText(text, toneModulation) {
  if (!text || !toneModulation) return text;

  const modulation = ToneModulations[toneModulation.toUpperCase()];
  if (!modulation || !modulation.wordingAdjustments) return text;

  let modulated = text;

  Object.entries(modulation.wordingAdjustments).forEach(([from, to]) => {
    const regex = new RegExp(`\\b${from}\\b`, 'gi');
    modulated = modulated.replace(regex, to);
  });

  return modulated;
}

/**
 * Get voice parameters for tone
 */
export function getVoiceParametersForTone(toneModulation) {
  const modulation = ToneModulations[toneModulation.toUpperCase()] || ToneModulations.NEUTRAL;

  return {
    rate: modulation.voiceRate,
    pitch: modulation.voicePitch,
    pauseDuration: modulation.pauseDuration,
  };
}

/**
 * Apply adaptive styling based on emotional state
 */
export function getAdaptiveStyles(emotionalState) {
  const styles = {
    distressed: {
      backgroundColor: 'bg-slate-900/95',
      textColor: 'text-white/90',
      accentColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
    },
    anxious: {
      backgroundColor: 'bg-slate-900/95',
      textColor: 'text-white/90',
      accentColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
    },
    shame: {
      backgroundColor: 'bg-slate-900/95',
      textColor: 'text-white/90',
      accentColor: 'text-purple-400',
      borderColor: 'border-purple-500/30',
    },
    grief: {
      backgroundColor: 'bg-slate-900/95',
      textColor: 'text-white/90',
      accentColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
    },
    neutral: {
      backgroundColor: 'bg-slate-900/95',
      textColor: 'text-white/90',
      accentColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
    },
  };

  return styles[emotionalState] || styles.neutral;
}

