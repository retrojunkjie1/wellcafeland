// src/engines/audio/narrationEngine.js
// Simple browser-based narration using SpeechSynthesis
// Phase 39: Intelligent Audio Narration Engine

let currentUtterance = null;

export function isNarrationSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Speak text with soft, therapeutic defaults
 * @param {string} text - Text to speak
 * @param {Object} options - Voice options
 */
export function speakText(text, { rate = 0.9, pitch = 1, volume = 1 } = {}) {
  if (!isNarrationSupported() || !text) return;

  stopNarration();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  // Optional: choose a voice that sounds soft, if available
  // Leave as default for now, but keep hook for later
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => 
    v.name.includes('Samantha') || 
    v.name.includes('Karen') ||
    v.name.includes('Google UK English Female')
  );
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopNarration() {
  if (!isNarrationSupported()) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function toggleNarration(text, options) {
  if (!isNarrationSupported()) return;
  if (window.speechSynthesis.speaking) {
    stopNarration();
  } else {
    speakText(text, options);
  }
}

