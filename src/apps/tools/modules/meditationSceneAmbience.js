const NOISE_PROCESSOR_NAME = "wellnesscafe-scene-noise";
const workletModules = new WeakMap();

const NOISE_PROCESSOR_SOURCE = `
  class WellnessCafeSceneNoise extends AudioWorkletProcessor {
    constructor(options) {
      super();
      this.mode = options.processorOptions.mode;
      this.seed = options.processorOptions.seed || 1;
      this.brown = 0;
      this.previous = 0;
      this.slow = 0;
    }
    nextNoise() {
      let value = this.seed;
      value ^= value << 13;
      value ^= value >>> 17;
      value ^= value << 5;
      this.seed = value >>> 0 || 1;
      return (this.seed / 2147483648) - 1;
    }
    process(inputs, outputs) {
      const channel = outputs[0]?.[0];
      if (!channel) return true;
      for (let index = 0; index < channel.length; index += 1) {
        const white = this.nextNoise();
        this.brown = this.brown * 0.992 + white * 0.008;
        this.previous = this.previous * 0.965 + white * 0.035;
        this.slow = (this.slow + (white * 0.00004)) * 0.9995;
        if (this.mode === "wind") channel[index] = this.brown * 3.2 + this.previous * 0.22;
        else if (this.mode === "rain") channel[index] = white * 0.33 + this.previous * 1.8 + this.slow;
        else channel[index] = this.brown * 2.2 + this.previous * 0.1;
      }
      return true;
    }
  }
  registerProcessor("${NOISE_PROCESSOR_NAME}", WellnessCafeSceneNoise);
`;

function loadNoiseProcessor(context) {
  if (!context.audioWorklet || typeof AudioWorkletNode === "undefined") {
    return Promise.reject(new Error("AudioWorklet is unavailable"));
  }
  const loaded = workletModules.get(context);
  if (loaded) return loaded;

  const moduleUrl = URL.createObjectURL(new Blob([NOISE_PROCESSOR_SOURCE], { type: "text/javascript" }));
  const promise = context.audioWorklet.addModule(moduleUrl)
    .finally(() => URL.revokeObjectURL(moduleUrl))
    .catch((error) => {
      workletModules.delete(context);
      throw error;
    });
  workletModules.set(context, promise);
  return promise;
}

export async function startMeditationSceneAmbience(context, sceneId) {
  if (!context || context.state === "closed") throw new Error("Audio is unavailable");
  const master = context.createGain();
  const now = context.currentTime;
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.16, now + 2.2);
  master.connect(context.destination);
  const nodes = [];

  const addTone = (frequency, volume) => {
    const oscillator = context.createOscillator();
    const tone = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    tone.gain.value = volume;
    oscillator.connect(tone);
    tone.connect(master);
    oscillator.start();
    nodes.push(oscillator, tone);
  };

  const addNoiseLayer = ({ mode, filterType, frequency, q, gain, seed }) => {
    const noise = new AudioWorkletNode(context, NOISE_PROCESSOR_NAME, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [1],
      processorOptions: { mode, seed },
    });
    const filter = context.createBiquadFilter();
    const layerGain = context.createGain();
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    layerGain.gain.value = gain;
    noise.connect(filter);
    filter.connect(layerGain);
    layerGain.connect(master);
    nodes.push(noise, filter, layerGain);
    return layerGain;
  };

  try {
    if (sceneId === "color-and-light") {
      [174.61, 220, 261.63].forEach((frequency, index) => addTone(frequency, index === 1 ? 0.025 : 0.018));
    } else {
      await loadNoiseProcessor(context);
      if (sceneId === "rain-window") {
        addNoiseLayer({ mode: "rain", filterType: "bandpass", frequency: 1500, q: 0.25, gain: 0.34, seed: 7123 });
        addNoiseLayer({ mode: "rain", filterType: "highpass", frequency: 2800, q: 0.2, gain: 0.12, seed: 1949 });
      } else if (sceneId === "wide-sky") {
        const wind = addNoiseLayer({ mode: "wind", filterType: "lowpass", frequency: 440, q: 0.35, gain: 0.4, seed: 4099 });
        addNoiseLayer({ mode: "wind", filterType: "lowpass", frequency: 900, q: 0.5, gain: 0.08, seed: 8243 });
        const lfo = context.createOscillator();
        const swell = context.createGain();
        lfo.frequency.value = 0.045;
        swell.gain.value = 0.035;
        lfo.connect(swell);
        swell.connect(wind.gain);
        lfo.start();
        nodes.push(lfo, swell);
      } else {
        addNoiseLayer({ mode: "room", filterType: "lowpass", frequency: 520, q: 0.5, gain: 0.16, seed: 5987 });
      }
    }
  } catch (error) {
    nodes.forEach((node) => { try { node.disconnect(); } catch { /* already disconnected */ } });
    try { master.disconnect(); } catch { /* already disconnected */ }
    throw error;
  }

  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    try {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(0, context.currentTime, 0.8);
      nodes.forEach((node) => {
        if (typeof node.stop === "function") {
          try { node.stop(context.currentTime + 3); } catch { /* already stopped */ }
        }
      });
      window.setTimeout(() => {
        nodes.forEach((node) => { try { node.disconnect(); } catch { /* already disconnected */ } });
        try { master.disconnect(); } catch { /* already disconnected */ }
      }, 3200);
    } catch { /* The browser may already have closed its audio context. */ }
  };
}
