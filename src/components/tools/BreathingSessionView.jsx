// src/components/tools/BreathingSessionView.jsx
// Calm, phase-synced breathing field with optional spoken guidance.

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { speakText as generateNarration } from "@/services/multimodalClient";
import { CANONICAL_TOOL_GUIDE_FACE } from "./toolCharacterIdentity";

function getBreathingNarration(pattern) {
  const closingNote = "I’ll guide the first three cycles, then leave space for your own pace while the visual continues.";
  const inhale = [
    "Let the breath arrive easily; nothing to force.",
    "Notice the air coming in, just as it is.",
    "Feel the support beneath you as this breath arrives.",
  ];
  const exhale = [
    "Let it leave slowly; ease your shoulders if comfortable.",
    "Imagine setting down one small thing for now.",
    "Let the exhale end on its own; no pushing.",
  ];

  if (pattern[1] === 4 && pattern[2] === 4 && pattern[3] === 4) {
    return {
      opening: `Box breathing has four clear steps: breathe in, pause, breathe out, pause. The even rhythm can give your attention a simple place to return. Let the chair or floor support you. Keep each breath comfortable; both pauses are optional. If you feel strain, skip a pause or return to your natural breath. When your mind wanders, that is ordinary. Notice it kindly, then come back to the next easy step. ${closingNote}`,
      inhale,
      hold1: "Pause only if easy; breathe sooner if you need.",
      exhale,
      hold2: "This pause is optional. Continue when your body is ready.",
    };
  }

  if (pattern[1] === 7 && pattern[2] === 8) {
    return {
      opening: `This pattern has a four-count inhale, a seven-count pause, and an eight-count exhale. The long pause and exhale can feel demanding; this is an option, never a test. Keep the breath easy, and skip the pause or return to natural breathing if you prefer. Feel the support beneath you. If your attention wanders, that is okay. Notice, then gently meet the next breath. Stop whenever you need. ${closingNote}`,
      inhale,
      hold1: "Stay only if comfortable. Let the breath move whenever you need.",
      exhale,
    };
  }

  return {
    opening: `This is a gentle four-in, six-out rhythm: an easy inhale, then a little longer to breathe out. The steady count gives your attention one simple place to rest; there is no result you have to reach. Feel where the chair or floor supports you. If your mind wanders, that is normal. Notice it without judgment and return to the next breath. Keep the breath comfortable, or breathe naturally at any time. ${closingNote}`,
    inhale,
    exhale,
  };
}

function getPhaseCue(narration, phaseName, cycle) {
  const cue = narration[phaseName];
  return Array.isArray(cue) ? cue[cycle % cue.length] : cue;
}

const getNarrationErrorMessage = (error) => {
  if (error?.code === "APP_CHECK_REQUIRED" || error?.code === "APP_CHECK_INVALID" || /app verification/i.test(error?.message || "")) {
    return "Local voice needs a registered Firebase App Check debug token. After it is registered, sign in here to use the natural voice guide.";
  }
  if (error?.code === "AUTH_REQUIRED" || error?.code === "AUTH_INVALID" || /verify this session|sign in/i.test(error?.message || "")) {
    return "Sign in to use the natural voice guide. The visual breathing pace is still available.";
  }
  return "Natural narration could not be prepared. The visual breathing pace is still available.";
};

const SPOKEN_GUIDANCE_CYCLES = 3;

const drawBreathingFrame = (context, sourcePixels, outputPixels, phaseName, progress, motionScale = 1) => {
  const { width, height, data: source } = sourcePixels;
  const output = outputPixels.data;
  const eased = 0.5 - Math.cos(Math.PI * Math.max(0, Math.min(1, progress))) / 2;
  const inhaleAmount = (phaseName === "inhale" ? eased : phaseName === "hold1" ? 1 : phaseName === "exhale" ? 1 - eased : 0) * motionScale;

  if (inhaleAmount < 0.002) {
    output.set(source);
    context.putImageData(outputPixels, 0, 0);
    return;
  }

  // Inverse-map a low-resolution image mesh into its breathing pose. This keeps
  // the photo continuous (no tile seams) and pins the face, hands, room, and camera.
  const gaussian = (value, center, spread) => Math.exp(-((value - center) ** 2) / (2 * spread ** 2));
  for (let y = 0; y < height; y += 1) {
    const ny = y / (height - 1);
    const chestY = gaussian(ny, 0.425, 0.105);
    const abdomenY = gaussian(ny, 0.545, 0.09);
    for (let x = 0; x < width; x += 1) {
      const nx = x / (width - 1);
      const chest = gaussian(nx, 0.5, 0.16) * chestY;
      const abdomen = gaussian(nx, 0.5, 0.145) * abdomenY;
      // Expand the ribcage and lift the sternum enough to read at phone size,
      // while keeping the face, arms, clothing edges, and camera still.
      const sourceX = Math.max(0, Math.min(width - 1, x - (nx - 0.5) * inhaleAmount * (118 * chest + 62 * abdomen)));
      const sourceY = Math.max(0, Math.min(height - 1, y - inhaleAmount * (-32 * chest + 18 * abdomen)));
      const x0 = Math.floor(sourceX);
      const y0 = Math.floor(sourceY);
      const x1 = Math.min(width - 1, x0 + 1);
      const y1 = Math.min(height - 1, y0 + 1);
      const xWeight = sourceX - x0;
      const yWeight = sourceY - y0;
      const topLeft = (y0 * width + x0) * 4;
      const topRight = (y0 * width + x1) * 4;
      const bottomLeft = (y1 * width + x0) * 4;
      const bottomRight = (y1 * width + x1) * 4;
      const outputIndex = (y * width + x) * 4;
      for (let channel = 0; channel < 4; channel += 1) {
        const top = source[topLeft + channel] * (1 - xWeight) + source[topRight + channel] * xWeight;
        const bottom = source[bottomLeft + channel] * (1 - xWeight) + source[bottomRight + channel] * xWeight;
        output[outputIndex + channel] = top * (1 - yWeight) + bottom * yWeight;
      }
    }
  }
  context.putImageData(outputPixels, 0, 0);
};

export const BreathingSessionView = ({
  isActive,
  onCycleComplete,
  pattern = [4, 4, 4, 4], // inhale, hold, exhale, hold
  voiceEnabled = true,
  audioContext = null,
  darkMode = true,
}) => {
  const isLocalHost = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
  // Local narration is allowed only when the developer has opted into Firebase's
  // registered App Check debug-token flow. Never weaken the server verification.
  const localAppCheckDebugConfigured = Boolean(
    import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN
      && (import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.VITE_RECAPTCHA_KEY)
  );
  const localVoiceBlocked = isLocalHost && !localAppCheckDebugConfigured;
  const [phase, setPhase] = useState("idle");
  const [cycleCueIndex, setCycleCueIndex] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(0);
  const [motionPhase, setMotionPhase] = useState("idle");
  const [guideImageReady, setGuideImageReady] = useState(false);
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState(voiceEnabled && !localVoiceBlocked);
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [voiceError, setVoiceError] = useState("");
  const narration = useMemo(() => getBreathingNarration(pattern), [pattern]);
  const cueCacheRef = useRef(new Map());
  const currentSourceRef = useRef(null);
  const breathFieldRef = useRef(null);
  const breathCanvasRef = useRef(null);
  const guideImageRef = useRef(null);
  const motionStartedAtRef = useRef(0);
  const motionPhaseDurationRef = useRef(0);
  const onCycleCompleteRef = useRef(onCycleComplete);

  useEffect(() => {
    onCycleCompleteRef.current = onCycleComplete;
  }, [onCycleComplete]);

  useEffect(() => {
    if (!isActive) return undefined;
    const frame = window.requestAnimationFrame(() => {
      breathFieldRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      setPhaseSecondsLeft(0);
      return undefined;
    }
    let timeoutId = null;
    const updateCountdown = () => {
      const deadline = motionStartedAtRef.current + motionPhaseDurationRef.current;
      const remaining = Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
      setPhaseSecondsLeft(remaining);
      if (remaining > 0) {
        const elapsed = performance.now() - motionStartedAtRef.current;
        const untilNextSecond = 1000 - (elapsed % 1000);
        timeoutId = window.setTimeout(updateCountdown, Math.max(40, untilNextSecond));
      }
    };
    updateCountdown();
    return () => window.clearTimeout(timeoutId);
  }, [isActive, phase]);

  const getCueBuffer = useCallback((text) => {
    if (!audioContext) return Promise.reject(new Error("Audio playback is unavailable."));
    if (cueCacheRef.current.has(text)) return cueCacheRef.current.get(text);
    const request = generateNarration(text, { voice: "marin" }).then(async (result) => {
      if (!result.ok || !result.audioBlob) {
        const error = new Error(result.error || "Natural narration is unavailable.");
        error.status = result.status;
        error.code = result.code;
        throw error;
      }
      const bytes = await result.audioBlob.arrayBuffer();
      if (result.audioUrl) URL.revokeObjectURL(result.audioUrl);
      return audioContext.decodeAudioData(bytes);
    }).catch((error) => {
      cueCacheRef.current.delete(text);
      throw error;
    });
    cueCacheRef.current.set(text, request);
    return request;
  }, [audioContext]);

  useEffect(() => {
    if (!isActive) {
      setPhase("idle");
      setMotionPhase("idle");
      setVoiceStatus("idle");
      setVoiceError("");
      currentSourceRef.current?.stop?.();
      currentSourceRef.current = null;
      cueCacheRef.current.clear();
      return;
    }

    // Include only holds that the selected rhythm actually contains. In 4–7–8,
    // the inhale, first hold, and exhale total 19 seconds; there is no fourth
    // post-exhale hold. Box breathing explicitly includes both holds.
    const phases = ["inhale"];
    if (pattern[1] > 0) phases.push("hold1");
    phases.push("exhale");
    if (pattern[3] > 0) phases.push("hold2");
    let cancelled = false;
    let narrationReady = false;
    let narrationFailed = false;
    let timeoutId = null;
    let cycleNumber = 0;
    let phaseToken = 0;
    const unavailableCues = new Set();

    const playPhaseNarration = (phaseName, currentCycle = cycleNumber) => {
      if (!voiceGuideEnabled || !narrationReady || !audioContext || currentCycle >= SPOKEN_GUIDANCE_CYCLES) return;
      // Say the hold guidance once at the beginning, then leave later holds
      // quiet so the repeated rhythm does not become a loop of filler phrases.
      if ((phaseName === "hold1" || phaseName === "hold2") && currentCycle > 0) return;
      // Rotate through short phase-specific prompts. Keep the measured count
      // clear while bringing attention back to support, breath, and an optional
      // image of setting something down on the exhale.
      const text = getPhaseCue(narration, phaseName, currentCycle);
      if (!text || unavailableCues.has(text)) return;
      const thisPhaseToken = phaseToken;
      void getCueBuffer(text).then(async (buffer) => {
        if (cancelled || !voiceGuideEnabled || thisPhaseToken !== phaseToken) return;
        if (audioContext.state === "suspended") await audioContext.resume();
        if (cancelled || !voiceGuideEnabled || thisPhaseToken !== phaseToken) return;
        const phaseDeadline = motionStartedAtRef.current + motionPhaseDurationRef.current;
        const remainingMs = phaseDeadline - performance.now();
        // Never cut a spoken sentence at the next breath transition. If
        // generation or decoding ran late, skip this cue and catch the next
        // phase on time.
        if (remainingMs <= 0 || buffer.duration * 1000 + 250 > remainingMs) return;
        currentSourceRef.current?.stop?.();
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.onended = () => {
          if (currentSourceRef.current === source) {
            currentSourceRef.current = null;
            if (!cancelled && thisPhaseToken === phaseToken) setVoiceStatus("ready");
          }
        };
        currentSourceRef.current = source;
        source.start(0);
        setVoiceStatus("playing");
      }).catch((error) => {
        if (!cancelled && thisPhaseToken === phaseToken) {
          unavailableCues.add(text);
          setVoiceStatus("ready");
          setVoiceError("One spoken phase cue could not be prepared. The next available cue will continue.");
        }
      });
    };

    const runCycle = (currentIndex) => {
      if (cancelled) return;

      const phaseName = phases[currentIndex];
      const patternIndex = { inhale: 0, hold1: 1, exhale: 2, hold2: 3 }[phaseName];
      const durationSeconds = pattern[patternIndex] || pattern[0] || 4;
      const ms = durationSeconds * 1000;
      setCycleCueIndex(cycleNumber);
      phaseToken += 1;
      currentSourceRef.current?.stop?.();
      currentSourceRef.current = null;
      motionStartedAtRef.current = performance.now();
      motionPhaseDurationRef.current = ms;
      setPhaseSecondsLeft(durationSeconds);
      setPhase(phaseName);
      setMotionPhase(phaseName);
      if (narrationFailed) setVoiceStatus("unavailable");
      else if (voiceGuideEnabled && !narrationReady) setVoiceStatus("preparing");
      else if (voiceGuideEnabled && narrationReady && cycleNumber >= SPOKEN_GUIDANCE_CYCLES) setVoiceStatus("complete");
      else if (voiceGuideEnabled) setVoiceStatus("ready");
      playPhaseNarration(phaseName, cycleNumber);
      timeoutId = setTimeout(() => {
        if (cancelled) return;

        const nextIndex = (currentIndex + 1) % phases.length;
        if (nextIndex === 0) {
          cycleNumber += 1;
          onCycleCompleteRef.current?.();
        }
        runCycle(nextIndex);
      }, ms);

    };

    const prepareNarration = async () => {
      if (voiceGuideEnabled) {
        setVoiceStatus("preparing");
        setVoiceError("");
        try {
          if (!audioContext) throw new Error("Audio playback is unavailable.");
          await audioContext.resume();
          const uniqueCues = [...new Set([
            narration.opening,
            ...phases.flatMap((name) => Array.isArray(narration[name]) ? narration[name] : narration[name]),
          ].filter(Boolean))];
          const cueResults = await Promise.allSettled(uniqueCues.map((text) => getCueBuffer(text)));
          if (cancelled) return;
          cueResults.forEach((result, index) => {
            if (result.status === "rejected") unavailableCues.add(uniqueCues[index]);
          });
          const openingIndex = uniqueCues.indexOf(narration.opening);
          const openingResult = cueResults[openingIndex];
          if (openingResult?.status !== "fulfilled") {
            const hasPhaseCue = phases.some((name) => {
              const phaseCues = Array.isArray(narration[name]) ? narration[name] : [narration[name]];
              return phaseCues.some((text) => {
                const index = uniqueCues.indexOf(text);
                return index >= 0 && cueResults[index]?.status === "fulfilled";
              });
            });
            if (!hasPhaseCue) throw openingResult?.reason || new Error("The spoken overview could not be prepared.");
            unavailableCues.add(narration.opening);
            narrationReady = true;
            setVoiceError("The spoken overview could not be prepared. Available phase cues will still guide the pace.");
            setVoiceStatus("ready");
            runCycle(0);
            return;
          }
          if (unavailableCues.size) setVoiceError("Some spoken phase cues could not be prepared. The visual pace will continue.");
          narrationReady = true;
          setPhase("orientation");
          setMotionPhase("idle");
          const source = audioContext.createBufferSource();
          source.buffer = openingResult.value;
          source.connect(audioContext.destination);
          source.onended = () => {
            if (cancelled || currentSourceRef.current !== source) return;
            currentSourceRef.current = null;
            setVoiceStatus("ready");
            runCycle(0);
          };
          currentSourceRef.current = source;
          setVoiceStatus("playing");
          source.start();
        } catch (error) {
          if (cancelled) return;
          narrationFailed = true;
          setVoiceStatus("unavailable");
          setVoiceError(getNarrationErrorMessage(error));
          runCycle(0);
        }
      } else {
        setVoiceStatus("off");
      }
    };

    if (voiceGuideEnabled && audioContext) {
      setPhase("orientation");
      setMotionPhase("idle");
      void prepareNarration();
    } else {
      setVoiceStatus("off");
      runCycle(0);
    }

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      currentSourceRef.current?.stop?.();
      currentSourceRef.current = null;
    };
  }, [isActive, pattern, voiceGuideEnabled, audioContext, getCueBuffer, narration]);

  const phaseLabel = phase === "orientation"
    ? "Listen to a short explanation. The measured breathing cycle starts when it finishes."
    : phase === "inhale" || phase === "exhale" || phase === "hold1" || phase === "hold2"
      ? cycleCueIndex < SPOKEN_GUIDANCE_CYCLES
        ? getPhaseCue(narration, phase, cycleCueIndex)
        : "The guided cues are complete. Stay with the visual pace or return to your natural breath."
      : "Press Begin to start";

  const phaseName = phase === "inhale"
      ? "Breathe in"
    : phase === "exhale"
      ? "Breathe out"
      : phase === "hold1"
      ? "Optional pause · after inhale"
      : phase === "hold2"
      ? "Optional pause · before next inhale"
      : phase === "orientation"
      ? "A note about this rhythm"
      : "Find an easy rhythm";
  const cycleDurationSeconds = pattern.reduce((total, duration) => total + (Number(duration) || 0), 0);
  const voiceAvailable = typeof window !== "undefined" && Boolean(window.AudioContext || window.webkitAudioContext) && !localVoiceBlocked;
  const phaseDurationSeconds = phase === "inhale"
    ? pattern[0] || 4
    : phase === "hold1"
      ? pattern[1] || 4
      : phase === "exhale"
        ? pattern[2] || pattern[0] || 4
        : phase === "hold2"
          ? pattern[3] || 4
          : 0.6;
  // These clipped image layers follow the breathing cadence, so only the chest
  // and abdomen move. Anchor each layer at its own anatomical center; scaling the
  // full portrait made the old movement almost impossible to notice.

  useEffect(() => {
    const canvas = breathCanvasRef.current;
    const image = guideImageRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !image || !context || !guideImageReady || !image.complete || !image.naturalWidth) return undefined;

    canvas.width = 512;
    canvas.height = 768;
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = canvas.width;
    sourceCanvas.height = canvas.height;
    const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
    if (!sourceContext) return undefined;
    sourceContext.drawImage(image, 0, 0, canvas.width, canvas.height);
    const sourcePixels = sourceContext.getImageData(0, 0, canvas.width, canvas.height);
    const outputPixels = context.createImageData(canvas.width, canvas.height);
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let frameId = 0;
    let lastDrawAt = 0;
    const draw = (now) => {
      if (!isActive) {
        drawBreathingFrame(context, sourcePixels, outputPixels, "idle", 0);
        return;
      }
      if (now - lastDrawAt >= 40) {
        lastDrawAt = now;
        const progress = Math.max(0, Math.min(1, (now - motionStartedAtRef.current) / (phaseDurationSeconds * 1000)));
        // Keep the user-initiated breathing movement visible for reduced-motion
        // users, with a gentler chest displacement and no extra decorative loops.
        drawBreathingFrame(context, sourcePixels, outputPixels, motionPhase, progress, reducedMotion ? 0.42 : 1);
      }
      frameId = window.requestAnimationFrame(draw);
    };
    frameId = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(frameId);
  }, [guideImageReady, isActive, motionPhase, phaseDurationSeconds]);

  return (
    <div className="w-full min-w-0 space-y-4">
      <section
        ref={breathFieldRef}
        className={`breath-field scroll-mt-20 relative h-[clamp(22rem,48svh,30rem)] w-full overflow-hidden rounded-[1.6rem] border ${darkMode ? "border-white/10" : "border-slate-300"}`}
        aria-label={`Breathing guide: ${motionPhase === "inhale" ? "breathing in, ribs and abdomen gently expanding" : motionPhase === "exhale" ? "breathing out, ribs and abdomen gently settling" : "resting"}`}
        role="group"
        style={{
          background: darkMode
            ? "radial-gradient(ellipse at 50% 53%, #314138 0%, #202b29 35%, #101923 78%)"
            : "radial-gradient(ellipse at 50% 53%, #f4eee1 0%, #e6ece7 45%, #dce5e2 100%)",
        }}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(220,195,137,.11), transparent 42%), linear-gradient(180deg, rgba(5,10,14,.12), transparent 24%, transparent 75%, rgba(5,10,14,.24))" }} />
        <img
          src={CANONICAL_TOOL_GUIDE_FACE}
          alt=""
          ref={guideImageRef}
          onLoad={() => setGuideImageReady(true)}
          className="absolute h-px w-px opacity-0"
          aria-hidden="true"
          draggable="false"
        />
        <canvas
          ref={breathCanvasRef}
          className="absolute bottom-0 left-1/2 z-20 h-full w-auto max-w-[96%] -translate-x-1/2 object-contain object-bottom"
          aria-hidden="true"
        />
        <div className={`absolute bottom-3 left-3 z-40 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs backdrop-blur-md sm:bottom-4 sm:left-4 ${darkMode ? "border-white/15 bg-slate-950/75 text-white/85" : "border-slate-300 bg-white/90 text-slate-800"}`} aria-live="polite" aria-atomic="true">
          <span className={`h-2 w-2 rounded-full ${darkMode ? "bg-amber-200/80" : "bg-amber-700/80"}`} aria-hidden="true" />
          <span className="leading-tight">
            <span className="block">{isActive ? `Breath · ${phaseName}` : "Guided breath ready"}</span>
            <span className={`block text-[10px] ${darkMode ? "text-white/60" : "text-slate-600"}`}>{cycleDurationSeconds}-second measured cycle</span>
          </span>
        </div>
      </section>

      <section className={`min-h-[7.5rem] rounded-2xl border px-5 py-4 sm:px-6 ${darkMode ? "border-white/10 bg-white/[0.035]" : "border-slate-200 bg-white/65"}`} aria-live="polite" aria-atomic="true">
        <div className="flex min-h-[4rem] items-center gap-4">
          <span className={`h-10 w-1 shrink-0 rounded-full ${darkMode ? "bg-amber-200/70" : "bg-amber-700/55"}`} aria-hidden="true" />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className={`text-lg font-medium tracking-tight sm:text-xl ${darkMode ? "text-amber-50" : "text-slate-900"}`}>{isActive ? phaseName : "A quiet place to begin"}</h2>
            <p className={`mt-1 text-sm leading-relaxed sm:text-base ${darkMode ? "text-slate-300" : "text-slate-600"}`} role="status">{phaseLabel}</p>
            </div>
            {isActive && phase !== "orientation" && <span role="timer" aria-label={`${phaseSecondsLeft} seconds remaining in this phase`} className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium tabular-nums ${darkMode ? "border-amber-100/20 bg-amber-100/[0.06] text-amber-100" : "border-amber-700/20 bg-amber-50 text-amber-900"}`}>{phaseSecondsLeft}s</span>}
          </div>
        </div>
      </section>

      <div className="flex justify-center pt-1">
        {/* Use the existing protected neural-voice endpoint; no device TTS fallback. */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            disabled={!voiceAvailable || isActive}
            aria-pressed={voiceAvailable && voiceGuideEnabled}
            onClick={() => setVoiceGuideEnabled((enabled) => !enabled)}
            className={`flex min-h-11 items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${darkMode ? "border-white/15 bg-white/[0.04] text-white/85 hover:bg-white/[0.08]" : "border-slate-300 bg-white/70 text-slate-700 hover:bg-white"}`}
          >
            {localVoiceBlocked ? (
              <>
                <VolumeX className={`h-4 w-4 ${darkMode ? "text-white/50" : "text-slate-500"}`} />
                <span>Voice unavailable in local preview</span>
              </>
            ) : !voiceAvailable ? (
              <>
                <VolumeX className={`h-4 w-4 ${darkMode ? "text-white/50" : "text-slate-500"}`} />
                <span>Voice audio unavailable here</span>
              </>
            ) : voiceGuideEnabled ? (
              <>
                <Volume2 className={`h-4 w-4 ${darkMode ? "text-amber-200" : "text-amber-700"}`} />
                <span>Natural voice on</span>
              </>
            ) : (
              <>
                <VolumeX className={`h-4 w-4 ${darkMode ? "text-white/50" : "text-slate-500"}`} />
                <span>Natural voice off</span>
              </>
            )}
          </button>
          {localVoiceBlocked && <p className={`max-w-sm text-center text-xs ${darkMode ? "text-white/65" : "text-slate-600"}`}>Natural voice is protected by Firebase App Check. To use it locally, configure a registered App Check debug token; otherwise use the signed-in deployed app.</p>}
          {voiceStatus === "preparing" && <p className={`text-sm ${darkMode ? "text-amber-100/80" : "text-amber-800"}`}>Preparing the natural voice guide…</p>}
          {voiceStatus === "playing" && <p className={`text-sm ${darkMode ? "text-emerald-100/80" : "text-emerald-800"}`}>{phase === "orientation" ? "Explaining the selected rhythm" : "Speaking with this breath phase"}</p>}
          {voiceStatus === "ready" && voiceGuideEnabled && <p className={`text-xs ${darkMode ? "text-emerald-100/75" : "text-emerald-800"}`}>Voice guide ready</p>}
          {voiceStatus === "complete" && voiceGuideEnabled && <p className={`text-sm ${darkMode ? "text-emerald-100/80" : "text-emerald-800"}`}>Voice guidance complete · the visual pace continues</p>}
          {voiceStatus === "unavailable" && <p className={`max-w-sm text-center text-xs ${darkMode ? "text-amber-100/80" : "text-amber-800"}`}>{voiceError}</p>}
          {voiceError && voiceStatus !== "unavailable" && <p role="status" className={`max-w-sm text-center text-xs ${darkMode ? "text-amber-100/80" : "text-amber-800"}`}>{voiceError}</p>}
          
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          canvas { animation: none !important; }
        }
      `}</style>
    </div>
  );
};
