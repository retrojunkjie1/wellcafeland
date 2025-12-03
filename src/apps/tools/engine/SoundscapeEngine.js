// src/apps/tools/engine/SoundscapeEngine.js
// Ambient Audio Engine for Cinematic Tools
// Phase 36: Hybrid Cinematic Aesthetic

export const Soundscapes = {
  WIND: {
    id: 'wind',
    name: 'Ikuku Wind',
    description: 'Gentle breeze through trees',
    url: '/audio/soundscapes/wind.mp3',
    icon: '🌬️',
  },
  OCEAN: {
    id: 'ocean',
    name: 'Ocean Waves',
    description: 'Rhythmic waves on shore',
    url: '/audio/soundscapes/ocean.mp3',
    icon: '🌊',
  },
  BOWL: {
    id: 'bowl',
    name: 'Singing Bowl',
    description: 'Tibetan bowl resonance',
    url: '/audio/soundscapes/bowl.mp3',
    icon: '🎵',
  },
  HUM: {
    id: 'hum',
    name: 'Deep Hum',
    description: 'Grounding frequency',
    url: '/audio/soundscapes/hum.mp3',
    icon: '🕉️',
  },
  RAIN: {
    id: 'rain',
    name: 'Soft Rain',
    description: 'Gentle rainfall',
    url: '/audio/soundscapes/rain.mp3',
    icon: '🌧️',
  },
  SILENCE: {
    id: 'silence',
    name: 'Silence',
    description: 'Pure quiet',
    url: null,
    icon: '🤫',
  },
};

/**
 * Soundscape Audio Manager
 */
export class SoundscapeEngine {
  constructor() {
    this.audioContext = null;
    this.currentAudio = null;
    this.currentSoundscape = null;
    this.volume = 0.5;
    this.isFading = false;
    this.preloadedAudio = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize audio context (required for autoplay policies)
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize audio context:', error);
    }
  }

  /**
   * Preload soundscape audio files
   */
  async preload(soundscapes = Object.values(Soundscapes)) {
    await this.initialize();

    const preloadPromises = soundscapes
      .filter(s => s.url)
      .map(async (soundscape) => {
        if (this.preloadedAudio.has(soundscape.id)) return;

        try {
          const audio = new Audio(soundscape.url);
          audio.loop = true;
          audio.volume = 0;
          
          // Wait for audio to be ready
          await new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', resolve, { once: true });
            audio.addEventListener('error', reject, { once: true });
            audio.load();
          });

          this.preloadedAudio.set(soundscape.id, audio);
        } catch (error) {
          console.warn(`Failed to preload soundscape ${soundscape.id}:`, error);
        }
      });

    await Promise.all(preloadPromises);
  }

  /**
   * Play soundscape with smooth fade in
   */
  async play(soundscapeId, fadeDuration = 2000) {
    await this.initialize();

    if (this.currentSoundscape?.id === soundscapeId && this.currentAudio) {
      return; // Already playing
    }

    // Stop current soundscape if any
    if (this.currentAudio) {
      await this.stop(fadeDuration / 2);
    }

    const soundscape = Object.values(Soundscapes).find(s => s.id === soundscapeId);
    if (!soundscape || !soundscape.url) return;

    // Get preloaded audio or create new
    let audio = this.preloadedAudio.get(soundscapeId);
    if (!audio) {
      audio = new Audio(soundscape.url);
      audio.loop = true;
      this.preloadedAudio.set(soundscapeId, audio);
    }

    this.currentAudio = audio;
    this.currentSoundscape = soundscape;

    // Start playback with fade in
    audio.volume = 0;
    
    try {
      await audio.play();
      await this.fadeVolume(0, this.volume, fadeDuration);
    } catch (error) {
      console.warn('Failed to play soundscape:', error);
    }
  }

  /**
   * Stop soundscape with smooth fade out
   */
  async stop(fadeDuration = 2000) {
    if (!this.currentAudio) return;

    await this.fadeVolume(this.currentAudio.volume, 0, fadeDuration);
    
    this.currentAudio.pause();
    this.currentAudio.currentTime = 0;
    this.currentAudio = null;
    this.currentSoundscape = null;
  }

  /**
   * Pause soundscape with fade out
   */
  async pause(fadeDuration = 1000) {
    if (!this.currentAudio) return;

    await this.fadeVolume(this.currentAudio.volume, 0, fadeDuration);
    this.currentAudio.pause();
  }

  /**
   * Resume soundscape with fade in
   */
  async resume(fadeDuration = 1000) {
    if (!this.currentAudio) return;

    try {
      await this.currentAudio.play();
      await this.fadeVolume(0, this.volume, fadeDuration);
    } catch (error) {
      console.warn('Failed to resume soundscape:', error);
    }
  }

  /**
   * Set volume (0 to 1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio && !this.isFading) {
      this.currentAudio.volume = this.volume;
    }
  }

  /**
   * Smooth volume fade
   */
  async fadeVolume(fromVolume, toVolume, duration) {
    if (!this.currentAudio || this.isFading) return;

    this.isFading = true;
    const startTime = Date.now();
    const volumeDelta = toVolume - fromVolume;

    return new Promise((resolve) => {
      const fade = () => {
        if (!this.currentAudio) {
          this.isFading = false;
          resolve();
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in-out cubic
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        this.currentAudio.volume = fromVolume + (volumeDelta * eased);

        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          this.isFading = false;
          resolve();
        }
      };

      requestAnimationFrame(fade);
    });
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isPlaying: !!(this.currentAudio && !this.currentAudio.paused),
      currentSoundscape: this.currentSoundscape,
      volume: this.volume,
      preloadedCount: this.preloadedAudio.size,
    };
  }

  /**
   * Cleanup
   */
  dispose() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
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

// Singleton instance
let soundscapeEngineInstance = null;

export function getSoundscapeEngine() {
  if (!soundscapeEngineInstance) {
    soundscapeEngineInstance = new SoundscapeEngine();
  }
  return soundscapeEngineInstance;
}

