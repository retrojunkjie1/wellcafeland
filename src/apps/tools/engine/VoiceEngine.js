// src/apps/tools/engine/VoiceEngine.js
// Voice Guidance Engine for Breath Coaching
// Phase 36: Hybrid Cinematic Aesthetic

export const VoiceGuidance = {
  INHALE: [
    'Breathe in slowly',
    'Draw breath in deeply',
    'Inhale through your nose',
    'Fill your lungs gently',
  ],
  HOLD: [
    'Hold your breath',
    'Pause here',
    'Stay with this breath',
    'Rest in stillness',
  ],
  EXHALE: [
    'Breathe out slowly',
    'Release the breath',
    'Exhale completely',
    'Let go gently',
  ],
  PAUSE: [
    'Pause',
    'Rest',
    'Be still',
  ],
  BEGIN: [
    'Begin when ready',
    'Let us begin',
    'Start your practice',
  ],
  COMPLETE: [
    'Session complete',
    'Well done',
    'Beautiful practice',
    'You did wonderful work',
  ],
};

export const BreathPatterns = {
  CALM_478: {
    id: '478',
    name: '4-7-8 Breath',
    description: 'Calming breath for anxiety',
    inhale: 4,
    hold: 7,
    exhale: 8,
    pause: 0,
  },
  BOX: {
    id: 'box',
    name: 'Box Breathing',
    description: 'Balanced breath for focus',
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 4,
  },
  CALM: {
    id: 'calm',
    name: 'Calm Breath',
    description: 'Gentle breath for relaxation',
    inhale: 4,
    hold: 0,
    exhale: 6,
    pause: 0,
  },
  IKUKU_WIND: {
    id: 'ikuku',
    name: 'Ikuku Wind Mode',
    description: 'Flowing breath like wind',
    inhale: 5,
    hold: 2,
    exhale: 7,
    pause: 1,
  },
  COHERENCE: {
    id: 'coherence',
    name: 'Heart Coherence',
    description: 'Heart-mind alignment',
    inhale: 5,
    hold: 0,
    exhale: 5,
    pause: 0,
  },
};

/**
 * Voice Guidance Engine
 */
export class VoiceEngine {
  constructor() {
    this.synthesis = null;
    this.voice = null;
    this.isEnabled = true;
    this.volume = 0.7;
    this.rate = 0.9; // Slightly slower for calming effect
    this.pitch = 1.0;
    this.lastPhrase = null;
    this.isInitialized = false;
  }

  /**
   * Initialize speech synthesis
   */
  async initialize() {
    if (this.isInitialized) return;

    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      
      // Wait for voices to load
      await new Promise((resolve) => {
        const voices = this.synthesis.getVoices();
        if (voices.length > 0) {
          resolve();
        } else {
          this.synthesis.addEventListener('voiceschanged', resolve, { once: true });
        }
      });

      // Select a calm, natural voice
      const voices = this.synthesis.getVoices();
      
      // Prefer female voices for calming guidance
      this.voice = voices.find(v => 
        v.name.includes('Samantha') || // macOS
        v.name.includes('Karen') || // macOS
        v.name.includes('Google UK English Female') ||
        v.name.includes('Microsoft Zira') // Windows
      ) || voices[0];

      this.isInitialized = true;
    } else {
      console.warn('Speech synthesis not supported');
    }
  }

  /**
   * Speak a phrase
   */
  speak(text, options = {}) {
    if (!this.isEnabled || !this.synthesis || !text) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.volume = options.volume ?? this.volume;
    utterance.rate = options.rate ?? this.rate;
    utterance.pitch = options.pitch ?? this.pitch;

    this.lastPhrase = text;
    this.synthesis.speak(utterance);
  }

  /**
   * Speak guidance for breath phase
   */
  speakPhaseGuidance(phase, pattern) {
    const phrases = VoiceGuidance[phase.toUpperCase()] || [];
    if (phrases.length === 0) return;

    // Rotate through phrases for variety
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    // Add duration hint
    const duration = pattern[phase.toLowerCase()];
    const fullPhrase = duration ? `${phrase}` : phrase;
    
    this.speak(fullPhrase);
  }

  /**
   * Speak begin message
   */
  speakBegin() {
    const phrases = VoiceGuidance.BEGIN;
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    this.speak(phrase);
  }

  /**
   * Speak completion message
   */
  speakComplete() {
    const phrases = VoiceGuidance.COMPLETE;
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    this.speak(phrase, { rate: 0.85 }); // Slower for emphasis
  }

  /**
   * Enable/disable voice guidance
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled && this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Set volume (0 to 1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set speech rate (0.1 to 10)
   */
  setRate(rate) {
    this.rate = Math.max(0.1, Math.min(10, rate));
  }

  /**
   * Cancel any ongoing speech
   */
  cancel() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isEnabled: this.isEnabled,
      isInitialized: this.isInitialized,
      isSpeaking: this.synthesis?.speaking || false,
      volume: this.volume,
      rate: this.rate,
      lastPhrase: this.lastPhrase,
    };
  }

  /**
   * Cleanup
   */
  dispose() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.isInitialized = false;
  }
}

// Singleton instance
let voiceEngineInstance = null;

export function getVoiceEngine() {
  if (!voiceEngineInstance) {
    voiceEngineInstance = new VoiceEngine();
  }
  return voiceEngineInstance;
}

