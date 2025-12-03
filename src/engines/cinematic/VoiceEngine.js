// src/engines/cinematic/VoiceEngine.js
// Intelligent Voice Guidance Engine with Mood-Based Prompts
// Phase 38: Full Intelligent Cinematic Tool Engine

export const VoiceProfiles = {
  CALM: {
    startCues: ['Begin when ready', 'Let us begin', 'Start your practice'],
    inhaleCues: ['Breathe in slowly', 'Draw breath in gently', 'Inhale through your nose'],
    holdCues: ['Hold your breath', 'Pause here', 'Stay with this breath'],
    exhaleCues: ['Breathe out slowly', 'Release the breath', 'Exhale completely'],
    affirmations: ['You are doing wonderful work', 'Beautiful practice', 'Stay with this rhythm'],
    completeCues: ['Session complete', 'Well done', 'Beautiful work today'],
  },
  ANXIETY: {
    startCues: ['Take your time', 'There is no rush', 'Begin whenever you are ready'],
    inhaleCues: ['Breathe in slowly with me', 'Draw in calm', 'Fill your lungs gently'],
    holdCues: ['Stay here with me', 'You are safe', 'Hold gently'],
    exhaleCues: ['Release the tension', 'Let it go slowly', 'Breathe out the worry'],
    affirmations: ['You are safe right now', 'This feeling will pass', 'You are doing great'],
    completeCues: ['You did wonderful work', 'I am proud of you', 'You stayed with yourself'],
  },
  PANIC: {
    startCues: ['I am here with you', 'You are safe', 'Stay with me'],
    inhaleCues: ['Breathe with me', 'Breathe in gently', 'Just this one breath'],
    holdCues: ['You are safe', 'I am right here', 'You are okay'],
    exhaleCues: ['Let it go', 'Release slowly', 'You are safe'],
    affirmations: ['You are safe right now', 'This will pass', 'You are not alone', 'Just this one breath'],
    completeCues: ['You did it', 'You are safe', 'Beautiful work staying with yourself'],
  },
  GROUNDING: {
    startCues: ['Let us ground together', 'Begin when ready', 'Take your time'],
    stepCues: [
      'Name 5 things you can see',
      'Name 4 things you can touch',
      'Name 3 things you can hear',
      'Name 2 things you can smell',
      'Name 1 thing you can taste',
    ],
    affirmations: ['You are present', 'You are here', 'You are grounded'],
    completeCues: ['You are fully present', 'Well done', 'You are grounded now'],
  },
  REFLECTION: {
    startCues: ['There is space for whatever comes', 'Begin whenever you are ready', 'No judgment here'],
    affirmations: ['You can write anything', 'No judgment', 'This is your space', 'Take your time'],
    completeCues: ['Thank you for showing up', 'Your words matter', 'Beautiful reflection'],
  },
};

/**
 * VoiceEngine v2 - Intelligent Guidance with Web Speech API
 */
export class VoiceEngine {
  constructor(profile = VoiceProfiles.CALM) {
    this.profile = profile;
    this.synthesis = null;
    this.voice = null;
    this.isEnabled = true;
    this.volume = 0.7;
    this.rate = 0.85; // Slower, more calming
    this.pitch = 0.95; // Slightly lower, more grounding
    this.lastPhrase = null;
    this.isInitialized = false;
    this.queue = [];
    this.isSpeaking = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      
      await new Promise((resolve) => {
        const voices = this.synthesis.getVoices();
        if (voices.length > 0) {
          resolve();
        } else {
          this.synthesis.addEventListener('voiceschanged', resolve, { once: true });
        }
      });

      const voices = this.synthesis.getVoices();
      
      // Prefer calm, natural voices
      this.voice = voices.find(v => 
        v.name.includes('Samantha') ||
        v.name.includes('Karen') ||
        v.name.includes('Google UK English Female') ||
        v.name.includes('Microsoft Zira')
      ) || voices[0];

      this.isInitialized = true;
    }
  }

  speak(text, options = {}) {
    if (!this.isEnabled || !this.synthesis || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.volume = options.volume ?? this.volume;
    utterance.rate = options.rate ?? this.rate;
    utterance.pitch = options.pitch ?? this.pitch;

    utterance.onend = () => {
      this.isSpeaking = false;
      this.processQueue();
    };

    this.lastPhrase = text;
    this.isSpeaking = true;
    this.synthesis.speak(utterance);
  }

  queueSpeak(text, options = {}) {
    this.queue.push({ text, options });
    if (!this.isSpeaking) {
      this.processQueue();
    }
  }

  processQueue() {
    if (this.queue.length === 0 || this.isSpeaking) return;
    const { text, options } = this.queue.shift();
    this.speak(text, options);
  }

  speakStartCue() {
    const cues = this.profile.startCues || VoiceProfiles.CALM.startCues;
    const cue = cues[Math.floor(Math.random() * cues.length)];
    this.speak(cue, { rate: 0.8 });
  }

  speakPhaseGuidance(phase) {
    let cues = [];
    
    switch (phase.toLowerCase()) {
      case 'inhale':
        cues = this.profile.inhaleCues || [];
        break;
      case 'hold':
      case 'hold1':
      case 'hold2':
        cues = this.profile.holdCues || [];
        break;
      case 'exhale':
        cues = this.profile.exhaleCues || [];
        break;
      default:
        return;
    }

    if (cues.length === 0) return;
    const cue = cues[Math.floor(Math.random() * cues.length)];
    this.speak(cue);
  }

  speakAffirmation() {
    const affirmations = this.profile.affirmations || VoiceProfiles.CALM.affirmations;
    const affirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    this.speak(affirmation, { rate: 0.85 });
  }

  speakCompleteCue() {
    const cues = this.profile.completeCues || VoiceProfiles.CALM.completeCues;
    const cue = cues[Math.floor(Math.random() * cues.length)];
    this.speak(cue, { rate: 0.8 });
  }

  speakGroundingStep(stepIndex) {
    if (!this.profile.stepCues) return;
    const cue = this.profile.stepCues[stepIndex];
    if (cue) this.speak(cue);
  }

  setProfile(profile) {
    this.profile = profile;
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled && this.synthesis) {
      this.synthesis.cancel();
      this.queue = [];
      this.isSpeaking = false;
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setRate(rate) {
    this.rate = Math.max(0.1, Math.min(10, rate));
  }

  cancel() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.queue = [];
    this.isSpeaking = false;
  }

  getState() {
    return {
      isEnabled: this.isEnabled,
      isInitialized: this.isInitialized,
      isSpeaking: this.synthesis?.speaking || false,
      volume: this.volume,
      rate: this.rate,
      lastPhrase: this.lastPhrase,
      queueLength: this.queue.length,
    };
  }

  dispose() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.queue = [];
    this.isInitialized = false;
    this.isSpeaking = false;
  }
}

// Singleton
let voiceEngineInstance = null;

export function getVoiceEngine(profile) {
  if (!voiceEngineInstance) {
    voiceEngineInstance = new VoiceEngine(profile);
  } else if (profile) {
    voiceEngineInstance.setProfile(profile);
  }
  return voiceEngineInstance;
}

