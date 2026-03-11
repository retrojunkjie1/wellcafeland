// src/experience/audio/AudioEngine.js
// Phase 56: minimal wrapper around HTMLAudioElement (no heavy deps). Works offline.

const DEFAULT_MASTER = 1;
const DUCK_FACTOR = 0.35;

export class AudioEngine {
  constructor() {
    this._elements = new Map();
    this._registered = new Map();
    this._masterVolume = DEFAULT_MASTER;
    this._duck = false;
  }

  _effectiveVolume(volume = 1) {
    const v = Number(volume);
    const m = this._duck ? this._masterVolume * DUCK_FACTOR : this._masterVolume;
    return Math.max(0, Math.min(1, (isNaN(v) ? 1 : v) * m));
  }

  register(id, src, opts = {}) {
    this._registered.set(id, {src, loop: !!opts.loop, volume: opts.volume ?? 1});
  }

  play(id, opts = {}) {
    const reg = this._registered.get(id);
    const {loop = reg?.loop ?? false, volume = reg?.volume ?? 1} = opts;
    let el = this._elements.get(id);
    if (!el) {
      el = new Audio();
      this._elements.set(id, el);
    }
    if (reg?.src && el.src !== reg.src) el.src = reg.src;
    el.loop = !!loop;
    el.volume = this._effectiveVolume(volume);
    el.play().catch(() => {});
    return el;
  }

  stop(id) {
    const el = this._elements.get(id);
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }

  stopAll() {
    this._elements.forEach((el) => {
      el.pause();
      el.currentTime = 0;
    });
  }

  setMasterVolume(v) {
    this._masterVolume = Math.max(0, Math.min(1, Number(v) || 0));
    this._elements.forEach((el) => {
      el.volume = this._effectiveVolume(1);
    });
  }

  duck(on) {
    this._duck = !!on;
    this._elements.forEach((el) => {
      el.volume = this._effectiveVolume(1);
    });
  }

  /** Play a local asset by path (e.g. /audio/cue_inhale.mp3). Id is derived or passed. */
  playAsset(path, opts = {}) {
    const id = opts.id || path;
    let el = this._elements.get(id);
    if (!el) {
      el = new Audio(path);
      this._elements.set(id, el);
    }
    el.src = path;
    el.loop = !!opts.loop;
    el.volume = this._effectiveVolume(opts.volume ?? 1);
    el.play().catch(() => {});
    return el;
  }
}
