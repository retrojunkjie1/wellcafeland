// src/engines/cinematic/AmbientEngine.js
// Spatial Ambient Sound Engine with Intelligent Crossfades
// Phase 38: Full Intelligent Cinematic Tool Engine

export const AmbientProfiles = {
  MOUNTAIN: {
    id: 'mountain',
    name: 'Mountain Wind',
    description: 'High altitude breeze',
    url: '/audio/ambient/mountain.mp3',
    icon: '⛰️',
    mood: 'calm',
    frequency: 'mid',
  },
  OCEAN: {
    id: 'ocean',
    name: 'Ocean Waves',
    description: 'Rhythmic tide',
    url: '/audio/ambient/ocean.mp3',
    icon: '🌊',
    mood: 'calm',
    frequency: 'low',
  },
  BOWL: {
    id: 'bowl',
    name: 'Singing Bowl',
    description: 'Tibetan resonance',
    url: '/audio/ambient/bowl.mp3',
    icon: '🎵',
    mood: 'grounding',
    frequency: 'low',
  },
  HUM: {
    id: 'hum',
    name: 'Deep Hum',
    description: 'Grounding frequency',
    url: '/audio/ambient/hum.mp3',
    icon: '🕉️',
    mood: 'panic',
    frequency: 'ultra-low',
  },
  RAIN: {
    id: 'rain',
    name: 'Soft Rain',
    description: 'Gentle rainfall',
    url: '/audio/ambient/rain.mp3',
    icon: '🌧️',
    mood: 'reflection',
    frequency: 'mid',
  },
  FOREST: {
    id: 'forest',
    name: 'Forest',
    description: 'Birds and breeze',
    url: '/audio/ambient/forest.mp3',
    icon: '🌲',
    mood: 'grounding',
    frequency: 'mid',
  },
  SILENCE: {
    id: 'silence',
    name: 'Silence',
    description: 'Pure quiet',
    url: null,
    icon: '🤫',
    mood: 'any',
    frequency: 'none',
  },
};

/**
 * AmbientEngine v2 - Spatial Audio with Intelligent Crossfades
 */
export class AmbientEngine {
  constructor() {
    this.audioContext = null;
    this.currentAudio = null;
    this.currentProfile = null;
    this.nextAudio = null;
    this.volume = 0.5;
    this.isCrossfading = false;
    this.preloadedAudio = new Map();
    this.isInitialized = false;
    this.panicSafeMode = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isInitialized = true;
    } catch (error) {
      console.warn('[AmbientEngine] Failed to initialize:', error);
    }
  }

  async preload(profiles = Object.values(AmbientProfiles)) {
    await this.initialize();

    const tasks = profiles
      .filter(p => p.url)
      .map(async (profile) => {
        if (this.preloadedAudio.has(profile.id)) return;

        try {
          const audio = new Audio(profile.url);
          audio.loop = true;
          audio.volume = 0;

          await new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', resolve, { once: true });
            audio.addEventListener('error', reject, { once: true });
            audio.load();
          });

          this.preloadedAudio.set(profile.id, audio);
        } catch (error) {
          console.warn(`[AmbientEngine] Failed to preload ${profile.id}:`, error);
        }
      });

    await Promise.all(tasks);
  }

  async play(profileId, fadeDuration = 2000) {
    await this.initialize();

    if (this.currentProfile?.id === profileId && this.currentAudio) {
      return;
    }

    const profile = Object.values(AmbientProfiles).find(p => p.id === profileId);
    if (!profile || !profile.url) {
      await this.stop(fadeDuration / 2);
      return;
    }

    // Auto-quiet on panic tools
    const targetVolume = this.panicSafeMode ? this.volume * 0.5 : this.volume;

    // Crossfade if audio is playing
    if (this.currentAudio) {
      await this.crossfade(profileId, fadeDuration, targetVolume);
      return;
    }

    // Start fresh
    let audio = this.preloadedAudio.get(profileId);
    if (!audio) {
      audio = new Audio(profile.url);
      audio.loop = true;
      this.preloadedAudio.set(profileId, audio);
    }

    this.currentAudio = audio;
    this.currentProfile = profile;

    audio.volume = 0;
    
    try {
      await audio.play();
      await this.fadeVolume(0, targetVolume, fadeDuration);
    } catch (error) {
      console.warn('[AmbientEngine] Playback failed:', error);
    }
  }

  async crossfade(nextProfileId, duration = 3000, targetVolume = 0.5) {
    if (this.isCrossfading) return;
    this.isCrossfading = true;

    const profile = Object.values(AmbientProfiles).find(p => p.id === nextProfileId);
    if (!profile || !profile.url) {
      this.isCrossfading = false;
      return;
    }

    let nextAudio = this.preloadedAudio.get(nextProfileId);
    if (!nextAudio) {
      nextAudio = new Audio(profile.url);
      nextAudio.loop = true;
      this.preloadedAudio.set(nextProfileId, nextAudio);
    }

    nextAudio.volume = 0;
    this.nextAudio = nextAudio;

    try {
      await nextAudio.play();

      // Crossfade both simultaneously
      await Promise.all([
        this.fadeVolume(this.currentAudio.volume, 0, duration, this.currentAudio),
        this.fadeVolume(0, targetVolume, duration, nextAudio),
      ]);

      // Stop old audio
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }

      this.currentAudio = nextAudio;
      this.currentProfile = profile;
      this.nextAudio = null;
    } catch (error) {
      console.warn('[AmbientEngine] Crossfade failed:', error);
    } finally {
      this.isCrossfading = false;
    }
  }

  async stop(fadeDuration = 2000) {
    if (!this.currentAudio) return;

    await this.fadeVolume(this.currentAudio.volume, 0, fadeDuration, this.currentAudio);
    
    this.currentAudio.pause();
    this.currentAudio.currentTime = 0;
    this.currentAudio = null;
    this.currentProfile = null;
  }

  async pause(fadeDuration = 1000) {
    if (!this.currentAudio) return;
    await this.fadeVolume(this.currentAudio.volume, 0, fadeDuration, this.currentAudio);
    this.currentAudio.pause();
  }

  async resume(fadeDuration = 1000) {
    if (!this.currentAudio) return;

    try {
      await this.currentAudio.play();
      const targetVolume = this.panicSafeMode ? this.volume * 0.5 : this.volume;
      await this.fadeVolume(0, targetVolume, fadeDuration, this.currentAudio);
    } catch (error) {
      console.warn('[AmbientEngine] Resume failed:', error);
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio && !this.isCrossfading) {
      this.currentAudio.volume = this.panicSafeMode ? this.volume * 0.5 : this.volume;
    }
  }

  setPanicSafeMode(enabled) {
    this.panicSafeMode = enabled;
    if (this.currentAudio) {
      const targetVolume = enabled ? this.volume * 0.5 : this.volume;
      this.fadeVolume(this.currentAudio.volume, targetVolume, 1000, this.currentAudio);
    }
  }

  async fadeVolume(fromVolume, toVolume, duration, audioElement = null) {
    const audio = audioElement || this.currentAudio;
    if (!audio) return;

    const startTime = Date.now();
    const volumeDelta = toVolume - fromVolume;

    return new Promise((resolve) => {
      const fade = () => {
        if (!audio) {
          resolve();
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in-out cubic
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        audio.volume = fromVolume + (volumeDelta * eased);

        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(fade);
    });
  }

  getState() {
    return {
      isPlaying: !!(this.currentAudio && !this.currentAudio.paused),
      currentProfile: this.currentProfile,
      volume: this.volume,
      panicSafeMode: this.panicSafeMode,
      preloadedCount: this.preloadedAudio.size,
    };
  }

  dispose() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    if (this.nextAudio) {
      this.nextAudio.pause();
      this.nextAudio = null;
    }

    this.preloadedAudio.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.preloadedAudio.clear();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isInitialized = false;
  }
}

// Singleton
let ambientEngineInstance = null;

export function getAmbientEngine() {
  if (!ambientEngineInstance) {
    ambientEngineInstance = new AmbientEngine();
  }
  return ambientEngineInstance;
}

