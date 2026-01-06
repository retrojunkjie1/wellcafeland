// src/utils/voiceGuide.js
// Voice guide module for breathing tool - iOS Safari compatible

const DEBUG = import.meta.env.DEV;

let voiceSupported = false;
let voicesCount = 0;
let audioUnlocked = false;
let lastError = null;
let voicesLoaded = false;

// Initialize voice support detection
if (typeof window !== "undefined" && window.speechSynthesis) {
  voiceSupported = true;
  
  const loadVoices = () => {
    try {
      const voices = window.speechSynthesis.getVoices();
      voicesCount = voices.length;
      voicesLoaded = true;
      if (DEBUG) {
        console.log(`[VoiceGuide] Loaded ${voicesCount} voices`);
      }
    } catch (err) {
      lastError = err.message;
      if (DEBUG) {
        console.warn("[VoiceGuide] Failed to load voices:", err);
      }
    }
  };
  
  // Load voices on mount
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Unlock audio with user gesture (required for iOS Safari)
 * Must be called from a user interaction handler
 */
export function unlockAudio() {
  if (!voiceSupported) return false;
  
  try {
    // Create a silent audio context to unlock audio
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    gainNode.gain.value = 0.001; // Silent
    oscillator.frequency.value = 1;
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.001);
    
    audioUnlocked = true;
    if (DEBUG) {
      console.log("[VoiceGuide] Audio unlocked");
    }
    return true;
  } catch (err) {
    lastError = err.message;
    if (DEBUG) {
      console.warn("[VoiceGuide] Failed to unlock audio:", err);
    }
    return false;
  }
}

/**
 * Speak text using Web Speech API
 * @param {string} text - Text to speak
 * @param {Object} options - { rate, pitch, volume, voice }
 * @returns {Promise<boolean>} Success
 */
export async function speakText(text, options = {}) {
  if (!voiceSupported || !text?.trim()) {
    return false;
  }

  // Require audio unlock for iOS
  if (!audioUnlocked) {
    unlockAudio();
  }

  try {
    window.speechSynthesis.cancel();

    // Wait for voices if not loaded
    if (!voicesLoaded) {
      await new Promise(resolve => {
        const checkVoices = () => {
          if (window.speechSynthesis.getVoices().length > 0) {
            voicesLoaded = true;
            resolve();
          } else {
            setTimeout(checkVoices, 100);
          }
        };
        checkVoices();
      });
    }

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = options.rate || 0.85;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.8;

    // Select calming voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = ["Samantha", "Karen", "Victoria"];
    const selectedVoice = voices.find(v => 
      preferredVoices.includes(v.name) && v.lang.startsWith("en")
    ) || voices.find(v => v.lang.startsWith("en") && v.localService) || null;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    return new Promise((resolve) => {
      utterance.onend = () => resolve(true);
      utterance.onerror = (err) => {
        lastError = err.error || "Speech synthesis error";
        if (DEBUG) {
          console.warn("[VoiceGuide] Speak error:", err);
        }
        resolve(false);
      };
      
      window.speechSynthesis.speak(utterance);
    });
  } catch (err) {
    lastError = err.message;
    if (DEBUG) {
      console.warn("[VoiceGuide] Speak failed:", err);
    }
    return false;
  }
}

/**
 * Stop speaking
 */
export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Get diagnostic info
 */
export function getDiagnostics() {
  return {
    voiceSupported,
    voicesCount,
    audioUnlocked,
    lastError,
    voicesLoaded,
  };
}

