// src/engines/narration/narrationEngine.js
// Intelligent Audio Narration Engine for Content
// Phase 39: Intelligent Audio Narration Engine

import { getRecommendedVoiceProfile } from './voiceProfiles';
import { logEvent } from '@/services/telemetry';

/**
 * Parse markdown to speech-friendly text
 */
function markdownToSpeech(markdown) {
  if (!markdown) return '';

  let text = markdown;

  // Remove frontmatter
  text = text.replace(/^---[\s\S]*?---\n/m, '');

  // Remove markdown syntax
  text = text.replace(/^#{1,6}\s+/gm, ''); // Headers
  text = text.replace(/\*\*(.+?)\*\*/g, '$1'); // Bold
  text = text.replace(/\*(.+?)\*/g, '$1'); // Italic
  text = text.replace(/`(.+?)`/g, '$1'); // Code
  text = text.replace(/\[(.+?)\]\(.+?\)/g, '$1'); // Links
  text = text.replace(/^[-*+]\s+/gm, ''); // Lists
  text = text.replace(/^\d+\.\s+/gm, ''); // Numbered lists

  // Add pauses
  text = text.replace(/\n\n/g, '. '); // Paragraphs
  text = text.replace(/\.\s+/g, '. '); // Sentences

  return text.trim();
}

/**
 * Split text into manageable chunks
 */
function splitIntoChunks(text, maxLength = 200) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = '';

  sentences.forEach(sentence => {
    if ((current + sentence).length > maxLength && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += (current ? ' ' : '') + sentence;
    }
  });

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

/**
 * NarrationEngine - Intelligent text-to-speech for content
 */
export class NarrationEngine {
  constructor(contentId, content, voiceProfile = null) {
    this.contentId = contentId;
    this.content = content;
    this.voiceProfile = voiceProfile || getRecommendedVoiceProfile(content);
    this.synthesis = null;
    this.voice = null;
    this.chunks = [];
    this.currentChunkIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.isInitialized = false;
    this.startTime = null;
    this.totalDuration = 0;
    this.callbacks = {
      onStart: null,
      onProgress: null,
      onComplete: null,
      onError: null,
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    if (!('speechSynthesis' in window)) {
      console.warn('[NarrationEngine] Speech synthesis not supported');
      if (this.callbacks.onError) {
        this.callbacks.onError('Speech synthesis not supported in this browser');
      }
      return;
    }

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

    // Select voice based on profile
    const voices = this.synthesis.getVoices();
    this.voice = voices.find(v => 
      this.voiceProfile.preferredVoices.some(pref => v.name.includes(pref))
    ) || voices[0];

    // Prepare content
    const speechText = markdownToSpeech(this.content.body || '');
    this.chunks = splitIntoChunks(speechText);

    this.isInitialized = true;
  }

  async start() {
    await this.initialize();

    if (!this.isInitialized || this.chunks.length === 0) {
      console.warn('[NarrationEngine] Not initialized or no content');
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.currentChunkIndex = 0;

    logEvent('narration_start', {
      contentId: this.contentId,
      voiceProfile: this.voiceProfile.id,
      chunkCount: this.chunks.length,
    });

    if (this.callbacks.onStart) {
      this.callbacks.onStart();
    }

    this.speakNextChunk();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else if (this.isPaused) {
      this.resume();
    } else {
      this.start();
    }
  }

  speakNextChunk() {
    if (!this.isPlaying || this.currentChunkIndex >= this.chunks.length) {
      this.complete();
      return;
    }

    const chunk = this.chunks[this.currentChunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunk);
    
    utterance.voice = this.voice;
    utterance.rate = this.voiceProfile.rate;
    utterance.pitch = this.voiceProfile.pitch;
    utterance.volume = this.voiceProfile.volume;

    utterance.onend = () => {
      this.currentChunkIndex++;
      
      const progress = (this.currentChunkIndex / this.chunks.length) * 100;
      if (this.callbacks.onProgress) {
        this.callbacks.onProgress(progress, this.currentChunkIndex, this.chunks.length);
      }

      // Pause between chunks
      setTimeout(() => {
        if (this.isPlaying && !this.isPaused) {
          this.speakNextChunk();
        }
      }, this.voiceProfile.pauseDuration);
    };

    utterance.onerror = (error) => {
      console.error('[NarrationEngine] Speech error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error.message || 'Speech error');
      }
    };

    this.synthesis.speak(utterance);
  }

  pause() {
    if (!this.isPlaying) return;
    
    this.isPaused = true;
    this.synthesis.pause();

    logEvent('narration_pause', {
      contentId: this.contentId,
      progress: (this.currentChunkIndex / this.chunks.length) * 100,
    });
  }

  resume() {
    if (!this.isPaused) return;
    
    this.isPaused = false;
    this.synthesis.resume();

    logEvent('narration_resume', {
      contentId: this.contentId,
      progress: (this.currentChunkIndex / this.chunks.length) * 100,
    });
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.synthesis.cancel();

    this.totalDuration = Date.now() - (this.startTime || Date.now());

    logEvent('narration_stop', {
      contentId: this.contentId,
      duration: this.totalDuration,
      progress: (this.currentChunkIndex / this.chunks.length) * 100,
      completed: false,
    });
  }

  complete() {
    this.isPlaying = false;
    this.isPaused = false;
    this.totalDuration = Date.now() - (this.startTime || Date.now());

    logEvent('narration_complete', {
      contentId: this.contentId,
      duration: this.totalDuration,
      chunkCount: this.chunks.length,
    });

    if (this.callbacks.onComplete) {
      this.callbacks.onComplete({
        duration: this.totalDuration,
        chunksPlayed: this.currentChunkIndex,
      });
    }

    // Save position
    this.savePosition();
  }

  skipForward() {
    this.currentChunkIndex = Math.min(this.currentChunkIndex + 1, this.chunks.length - 1);
    this.synthesis.cancel();
    if (this.isPlaying && !this.isPaused) {
      this.speakNextChunk();
    }
  }

  skipBackward() {
    this.currentChunkIndex = Math.max(this.currentChunkIndex - 1, 0);
    this.synthesis.cancel();
    if (this.isPlaying && !this.isPaused) {
      this.speakNextChunk();
    }
  }

  setSpeed(rate) {
    this.voiceProfile.rate = Math.max(0.5, Math.min(2.0, rate));
  }

  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  savePosition() {
    try {
      const storageKey = `wc-narration-position-${this.contentId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        chunkIndex: this.currentChunkIndex,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('[NarrationEngine] Failed to save position:', error);
    }
  }

  loadPosition() {
    try {
      const storageKey = `wc-narration-position-${this.contentId}`;
      const data = JSON.parse(localStorage.getItem(storageKey) || 'null');
      
      if (data && data.chunkIndex < this.chunks.length) {
        // Only restore if less than 24 hours old
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data.chunkIndex;
        }
      }
    } catch (error) {
      console.warn('[NarrationEngine] Failed to load position:', error);
    }
    return 0;
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentChunk: this.currentChunkIndex,
      totalChunks: this.chunks.length,
      progress: this.chunks.length > 0 ? (this.currentChunkIndex / this.chunks.length) * 100 : 0,
      duration: this.totalDuration,
      voiceProfile: this.voiceProfile.id,
    };
  }

  dispose() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.isInitialized = false;
  }
}

