// Optional, non-clinical self-touch guidance. This tool does not teach or locate
// therapeutic pressure points and makes no treatment or outcome claims.

import React, { useEffect, useRef, useState } from "react";
import { Eye, Hand, Pause, Play, RotateCcw, ShieldCheck, Square, Volume2 } from "lucide-react";
import { logToolUsage } from "../../../services/toolTelemetry";
import { trackAction } from "../../../services/telemetry";
import { createToolResult, safeComplete } from "@/utils/toolContract";
import { useNaturalVoice } from "@/hooks/useNaturalVoice";
import "./AcuwellnessTool.css";

const TOUCH_OPTIONS = [
  {
    id: "hands",
    regionId: "hands",
    label: "Hands",
    short: "A gentle squeeze, then release",
    cue: "When you are ready, gently make a soft fist. Hold that comfortable shape for a moment. Slowly open your hands and let your fingers rest. Take a breath, then follow one more easy squeeze and release if you like.",
    context: "Your hands help you grip and carry. Noticing effort and letting it go can create a brief pause; there is no special result to achieve.",
    visual: "Close gently  ·  pause  ·  open and rest",
    phaseCues: [
      { phase: "tighten", start: "gently make a soft fist", end: "Hold that comfortable shape" },
      { phase: "hold", start: "Hold that comfortable shape", end: "Slowly open your hands" },
      { phase: "release", start: "Slowly open your hands", end: "Take a breath" },
      { phase: "tighten", start: "follow one more easy squeeze", end: "and release if you like" },
      { phase: "release", start: "and release if you like", end: "Your hands help you grip" },
    ],
  },
  {
    id: "forearms",
    regionId: "arms",
    label: "Forearms",
    short: "A light tighten, then soften",
    cue: "If comfortable, make a loose fist and gently tighten your forearms. Keep your shoulders easy and breathe normally. Hold lightly for a moment. Slowly open your hands and let your arms rest. If you like, follow that once more, or simply watch.",
    context: "Your forearms help you reach, lift, and hold things. This is only a chance to notice effort and rest, not a treatment.",
    visual: "Loose fist  ·  light effort  ·  soften",
    phaseCues: [
      { phase: "tighten", start: "gently tighten your forearms", end: "Hold lightly" },
      { phase: "hold", start: "Hold lightly", end: "Slowly open your hands" },
      { phase: "release", start: "Slowly open your hands", end: "If you like" },
    ],
  },
  {
    id: "observe",
    regionId: "hands",
    label: "Observe only",
    short: "No movement or touch needed",
    cue: "You can leave your hands still and simply watch the guide move, or listen. No touch, pressure, movement, or sensation is required.",
    context: "Watching or listening can be the whole practice. Stop or leave whenever you like.",
    visual: "Watch or listen  ·  your hands can stay still",
  },
];

const BODY_GUIDES = [
  { id: "sage", name: "Sage", tone: "Deep tone", alt: "Adult Black woman in sage practice clothes", portrait: "/assets/pmr-guides/sage-face-v2.webp" },
  { id: "slate", name: "Slate", tone: "Medium tone", alt: "Adult East Asian man in slate practice clothes", portrait: "/assets/pmr-guides/slate-face-v2.webp" },
  { id: "ivory", name: "Ivory", tone: "Light tone", alt: "Older white woman in ivory practice clothes", portrait: "/assets/pmr-guides/ivory-face-v2.webp" },
];

const SAFETY_NOTES = [
  "Touch is optional. Keep any effort light and comfortable; no pressure point is required.",
  "Do not press an area that is injured, painful, swollen, numb, or irritated.",
  "Stop or switch to Observe only if anything feels uncomfortable.",
  "This is general self-care information, not medical care or a substitute for a clinician’s advice.",
];

const FRAME_COUNT = 8;
// The first Sage hand poses contain a thin generated white strip along the
// bottom edge. Crop that same edge from every pose so the sequence never flashes it.
const FRAME_BOTTOM_CROP = 10;
const MOTION_FPS = 25;
const MOTION_FRAME_MS = 1000 / MOTION_FPS;
const SQUEEZE_MS = 2600;
const HOLD_MS = 1100;
const RELEASE_MS = 2600;
const REST_MS = 400;
const MOTION_CYCLE_MS = SQUEEZE_MS + HOLD_MS + RELEASE_MS + REST_MS;
const RETURN_TO_REST_MS = 900;

function smoothProgress(value) {
  return (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, value)))) / 2;
}

function cycleProgress(elapsed) {
  const phase = elapsed % MOTION_CYCLE_MS;
  if (phase < SQUEEZE_MS) return smoothProgress(phase / SQUEEZE_MS);
  if (phase < SQUEEZE_MS + HOLD_MS) return 1;
  if (phase < SQUEEZE_MS + HOLD_MS + RELEASE_MS) {
    return 1 - smoothProgress((phase - SQUEEZE_MS - HOLD_MS) / RELEASE_MS);
  }
  return 0;
}

function MotionFrame({ guideId, regionId, kind, motion, label, fallbackSrc, fit = "cover" }) {
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const progressRef = useRef(0);
  const cycleElapsedRef = useRef(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const frames = Array.from({ length: FRAME_COUNT }, (_, index) => {
      const image = new Image();
      image.decoding = "async";
      image.src = `/assets/pmr-motion/${kind}/${guideId}-${regionId}-${index}.webp`;
      return image;
    });

    Promise.all(frames.map((image) => image.decode().catch(() => null))).then(() => {
      if (cancelled) return;
      const loaded = frames.every((image) => image.complete && image.naturalWidth > 0);
      framesRef.current = loaded ? frames : [];
      setReady(loaded);
    });

    return () => { cancelled = true; };
  }, [guideId, kind, regionId]);

  useEffect(() => {
    progressRef.current = 0;
    cycleElapsedRef.current = 0;
  }, [guideId, kind, regionId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !ready || frames.length !== FRAME_COUNT) return undefined;

    const frameWidth = frames[0].naturalWidth;
    const frameBottomCrop = guideId === "sage" && regionId === "hands" && kind === "detail"
      ? FRAME_BOTTOM_CROP
      : 0;
    const frameHeight = Math.max(1, frames[0].naturalHeight - frameBottomCrop);
    if (canvas.width !== frameWidth || canvas.height !== frames[0].naturalHeight) {
      canvas.width = frameWidth;
      canvas.height = frames[0].naturalHeight;
    }

    const draw = (progress) => {
      const framePosition = Math.max(0, Math.min(FRAME_COUNT - 1, progress * (FRAME_COUNT - 1)));
      // These are photographic key poses, not registered video frames. Blending
      // adjacent poses overlays moving fingers and creates a doubled, soft edge.
      // Keep each pose crisp and let the eased cycle control when it advances.
      const frameIndex = Math.round(framePosition);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        frames[frameIndex],
        0, 0, frameWidth, frameHeight,
        0, 0, canvas.width, canvas.height,
      );
    };

    if (motion === "rest") {
      progressRef.current = 0;
      cycleElapsedRef.current = 0;
      draw(0);
      return undefined;
    }
    if (motion === "paused") {
      draw(progressRef.current);
      return undefined;
    }

    let frameId = 0;
    let lastFrameAt = 0;
    let lastTickAt = 0;
    const releaseStart = progressRef.current;
    const releaseStartedAt = performance.now();
    const tick = (now) => {
      if (motion === "engage") {
        if (lastTickAt) cycleElapsedRef.current += now - lastTickAt;
        progressRef.current = cycleProgress(cycleElapsedRef.current);
        lastTickAt = now;
      } else {
        progressRef.current = releaseStart * (1 - Math.min(1, (now - releaseStartedAt) / RETURN_TO_REST_MS));
      }

      if (!lastFrameAt || now - lastFrameAt >= MOTION_FRAME_MS) {
        draw(progressRef.current);
        lastFrameAt = now;
      }

      if (motion === "engage" || progressRef.current > 0.001) frameId = window.requestAnimationFrame(tick);
      else {
        progressRef.current = 0;
        draw(0);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [motion, ready]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#18211d]">
      {!ready && <img src={fallbackSrc} alt="" aria-hidden="true" className={`absolute inset-0 h-full w-full ${fitClass}`} decoding="async" />}
      <canvas ref={canvasRef} role="img" aria-label={label} className={`absolute inset-0 h-full w-full ${fitClass}`} style={{ opacity: ready ? 1 : 0 }} />
    </div>
  );
}

function phaseForPlayback(option, progress) {
  if (!option?.phaseCues?.length) return null;
  const spokenText = `${option.cue} ${option.context}`;
  const characterPosition = Math.floor(Math.max(0, Math.min(1, progress)) * spokenText.length);
  for (const cue of option.phaseCues) {
    const start = spokenText.indexOf(cue.start);
    const end = start >= 0 ? spokenText.indexOf(cue.end, start + cue.start.length) : -1;
    if (start >= 0 && end > start && characterPosition >= start && characterPosition < end) {
      return cue.phase;
    }
  }
  return null;
}

function MotionPhaseRail({ activePhase, observeOnly }) {
  const labels = observeOnly ? ["Watch", "Listen", "Rest"] : ["Gently tighten", "Pause", "Release"];
  const phases = observeOnly ? ["watch", "listen", "rest"] : ["tighten", "hold", "release"];
  return (
    <ol className="acu-motion-rail" aria-label={observeOnly ? "A no-movement option: watch, listen, and rest" : "Movement phases follow the spoken cue"}>
      {labels.map((label, index) => (
        <li key={label} className="acu-phase-step" data-active={activePhase === phases[index] ? "true" : "false"} aria-current={activePhase === phases[index] ? "step" : undefined}>
          <span className="acu-phase-dot" aria-hidden="true" />
          <span>{label}</span>
        </li>
      ))}
    </ol>
  );
}

function AcupressureVisual({ guideId, onSelectGuide, regionId, fullRegionId, motion, selectedOption }) {
  const guide = BODY_GUIDES.find((item) => item.id === guideId) || BODY_GUIDES[0];
  const regionLabel = selectedOption?.label || "Hands";
  const hasDetailMotion = guide.id !== "ivory";
  return (
    <section className="acu-visual-shell overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b1018] p-3 shadow-[0_24px_70px_rgba(0,0,0,.28)] sm:p-4" aria-label="Animated body guide">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/55">Your visual guide</p>
          <p className="mt-1 text-xs text-white/45">{selectedOption?.id === "observe" ? "Watch or listen; no movement is needed from you." : "The guide follows the spoken cue."}</p>
        </div>
        <p className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] ${motion === "engage" || motion === "release" ? "border-emerald-200/25 bg-emerald-200/[0.08] text-emerald-100" : "border-white/10 bg-white/[0.035] text-white/55"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${motion === "engage" || motion === "release" ? "bg-emerald-200 motion-safe:animate-pulse" : "bg-white/35"}`} />
          {motion === "engage" ? "Moving with voice" : motion === "release" ? "Returning to rest" : motion === "paused" ? "Paused" : "At rest"}
        </p>
      </div>

      <figure className="acu-guide-stage relative mx-auto overflow-hidden rounded-[1.35rem] border border-white/10 bg-[radial-gradient(ellipse_at_48%_35%,rgba(186,204,180,.15),transparent_42%),linear-gradient(160deg,#202a25,#101712_72%)]">
        <div className="absolute inset-0 opacity-40" aria-hidden="true" style={{ backgroundImage: "linear-gradient(90deg,transparent 49.8%,rgba(255,255,255,.035) 50%,transparent 50.2%),linear-gradient(0deg,transparent 49.8%,rgba(255,255,255,.025) 50%,transparent 50.2%)" }} />
        <div className="acu-guide-portrait absolute inset-0">
          <div className="acu-guide-photo">
            <MotionFrame guideId={guide.id} regionId={fullRegionId} kind="full" motion={motion} label={`${guide.alt}; demonstrating a gentle ${regionLabel.toLowerCase()} cue`} fallbackSrc={guide.portrait} fit="contain" />
            {!hasDetailMotion && selectedOption && selectedOption.id !== "observe" && (
              <div className="acu-focus-map" data-region={regionId} data-moving={motion === "engage" ? "true" : "false"} aria-hidden="true">
                <span className="acu-focus-point acu-focus-point-left" />
                <span className="acu-focus-point acu-focus-point-right" />
                <span className="acu-focus-label">{regionLabel} focus</span>
              </div>
            )}
          </div>
        </div>
        <div className="acu-guide-vignette pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="absolute left-3 top-3 z-10 rounded-full border border-white/15 bg-slate-950/60 px-3 py-1.5 text-[10px] font-medium tracking-wide text-white/75 backdrop-blur-sm sm:left-4 sm:top-4">
          {guide.name} <span className="mx-1 text-white/35">/</span> {regionLabel}
        </div>
        {hasDetailMotion && (
          <figure className="acu-guide-detail absolute bottom-3 right-3 z-10 overflow-hidden rounded-2xl border border-amber-100/30 bg-[#18211d] shadow-[0_12px_34px_rgba(0,0,0,.45)] sm:bottom-4 sm:right-4">
            <div className="relative h-full w-full">
              <MotionFrame guideId={guide.id} regionId={regionId} kind="detail" motion={motion} label={`Close-up motion of the ${regionLabel.toLowerCase()} cue`} fallbackSrc={`/assets/pmr-focus/${guide.id}-${regionId}.webp`} />
            </div>
          </figure>
        )}
        <figcaption className="sr-only">{guide.alt}. A full-body guide follows the spoken cue; the inset shows the {regionLabel.toLowerCase()} position.</figcaption>
      </figure>

      <div className="mt-3 grid grid-cols-3 gap-1.5" role="group" aria-label="Choose guide appearance">
        {BODY_GUIDES.map((item) => (
          <button key={item.id} type="button" aria-pressed={item.id === guide.id} onClick={() => onSelectGuide(item.id)} className={`min-h-11 rounded-xl border px-1 text-center text-[10px] font-medium leading-tight transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${item.id === guide.id ? "border-amber-200/60 bg-amber-100/[0.09] text-amber-100" : "border-white/10 bg-white/[0.02] text-white/65 hover:bg-white/[0.06]"}`}>
            <span className="block">{item.tone}</span><span className="block opacity-70">{item.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

const AcuwellnessTool = ({ tool, onComplete }) => {
  const [startTime] = useState(() => Date.now());
  const [selectedId, setSelectedId] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [guideId, setGuideId] = useState("sage");
  const { status: voiceStatus, error: voiceError, playbackProgress, play, pause, resume, stop } = useNaturalVoice("marin");
  const selectedOption = TOUCH_OPTIONS.find((option) => option.id === selectedId);
  const regionId = selectedOption?.regionId || "hands";
  // Forearm tension is demonstrated with a loose fist in the full-body guide;
  // the close view stays on the forearms so both views visibly match the cue.
  const fullRegionId = selectedOption?.id === "forearms" ? "hands" : regionId;
  const isSpeaking = voiceStatus === "playing";
  const isPreparing = voiceStatus === "preparing";
  const motion = isSpeaking ? "engage" : voiceStatus === "finished" || voiceStatus === "unavailable" ? "release" : voiceStatus === "paused" ? "paused" : "rest";

  const selectOption = (option) => {
    stop();
    setSelectedId(option.id);
    setHasReviewed(true);
    // Start speech from the user's gesture. The portrait engages only while the
    // natural voice is playing, then reverses the same frames when it ends.
    void play(`${option.cue} ${option.context}`);
  };

  const handleComplete = () => {
    stop();
    const now = Date.now();
    const durationMs = now - startTime;
    logToolUsage(tool.id, {
      startedAt: startTime,
      completedAt: now,
      durationMs,
    }).catch((error) => console.warn("Acupressure telemetry failed:", error));

    trackAction("tool_acuwellness_complete", { toolId: tool.id });
    safeComplete(onComplete, createToolResult(
      tool.id,
      tool.name || "Acupressure-inspired self-care",
      "Reviewed optional self-care information.",
      {},
      Math.floor(durationMs / 1000),
    ));
  };

  const handleVoice = () => {
    if (!selectedOption) return;
    if (voiceStatus === "playing") void pause();
    else if (voiceStatus === "paused") void resume();
    else void play(`${selectedOption.cue} ${selectedOption.context}`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4 text-foreground sm:space-y-5">
      <section className="px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-amber-100/65">Optional self-care</p>
        <h2 className="mt-1.5 text-xl font-medium tracking-tight text-white sm:text-2xl">A gentle moment of touch</h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/60">Choose a light movement, or watch and listen. No pressure points or special sensations are needed.</p>
      </section>

      <AcupressureVisual guideId={guideId} onSelectGuide={setGuideId} regionId={regionId} fullRegionId={fullRegionId} motion={motion} selectedOption={selectedOption} />

      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-3 px-1">
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/50">Choose your cue</p>
          <p className="text-[10px] text-white/40">Any option can be skipped</p>
        </div>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Choose an optional self-care cue">
          {TOUCH_OPTIONS.map((option) => {
            const active = option.id === selectedId;
            const Icon = option.id === "observe" ? Eye : option.id === "hands" ? Hand : ShieldCheck;
            return (
              <button key={option.id} type="button" aria-pressed={active} onClick={() => selectOption(option)} className={`group min-h-[5.5rem] rounded-2xl border p-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 sm:min-h-24 sm:p-3 ${active ? "border-amber-100/45 bg-amber-100/[0.09]" : "border-white/10 bg-slate-950/25 hover:border-white/20 hover:bg-white/[0.045]"}`}>
                <Icon aria-hidden="true" className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${active ? "text-amber-100" : "text-white/60"}`} />
                <span className="mt-2 block text-[11px] font-medium leading-tight text-white sm:text-sm">{option.label}</span>
                <span className="mt-1 hidden text-[10px] leading-snug text-white/45 sm:block">{option.short}</span>
              </button>
            );
          })}
        </div>
      </section>

      {selectedOption && (
        <section key={selectedOption.id} className="rounded-3xl border border-emerald-100/15 bg-[radial-gradient(ellipse_at_14%_48%,rgba(167,196,174,.12),transparent_48%),linear-gradient(125deg,rgba(255,255,255,.045),rgba(7,12,19,.48))] p-4 sm:p-6" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-100/65">Follow the movement</p>
              <h3 className="mt-1 text-lg font-medium text-white sm:text-xl">{selectedOption.label}</h3>
              <p className="mt-2 text-base font-medium leading-relaxed text-white/90 sm:text-lg">{selectedOption.visual}</p>
              <MotionPhaseRail activePhase={voiceStatus === "playing" || voiceStatus === "paused" ? phaseForPlayback(selectedOption, playbackProgress) : null} observeOnly={selectedOption.id === "observe"} />
              <p className="mt-3 text-xs leading-relaxed text-white/55"><span className="font-medium text-white/70">Why this cue:</span> {selectedOption.context}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleVoice} disabled={isPreparing} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-100/20 bg-emerald-100/[0.06] px-3 text-xs text-emerald-50/90 transition hover:bg-emerald-100/[0.1] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
                {isPreparing ? <Volume2 className="h-4 w-4 motion-safe:animate-pulse" /> : isSpeaking ? <Pause className="h-4 w-4" /> : voiceStatus === "paused" ? <Play className="h-4 w-4" /> : voiceStatus === "finished" ? <RotateCcw className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {isPreparing ? "Preparing…" : isSpeaking ? "Pause" : voiceStatus === "paused" ? "Resume" : voiceStatus === "finished" ? "Replay" : "Hear cue"}
              </button>
              {(isSpeaking || voiceStatus === "paused" || isPreparing) && <button type="button" onClick={stop} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-xs text-white/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"><Square className="h-3.5 w-3.5" /> Stop</button>}
            </div>
          </div>
          <p role={voiceStatus === "unavailable" ? "alert" : "status"} aria-live="polite" className={`mt-3 min-h-4 text-xs ${voiceStatus === "unavailable" ? "text-amber-100/85" : "text-white/45"}`}>
            {voiceStatus === "unavailable" ? voiceError || "Voice is unavailable. Replay the cue to try again." : isPreparing ? "Preparing the natural voice; movement starts with the first spoken word…" : isSpeaking ? "The guide moves with the natural voice, then returns to rest." : voiceStatus === "paused" ? "Cue paused; the guide is holding still." : voiceStatus === "finished" ? "The guide has returned to rest." : "Choose a cue to begin the voice and movement."}
          </p>
        </section>
      )}

      <details className="group rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
        <summary className="min-h-10 cursor-pointer list-none text-sm font-medium text-white/80 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">Safety and what to expect <span className="ml-1 text-white/45 group-open:hidden">＋</span><span className="ml-1 hidden text-white/45 group-open:inline">−</span></summary>
        <ul className="mt-2 space-y-2 border-t border-white/10 pt-3 text-sm leading-relaxed text-white/65">
          {SAFETY_NOTES.map((note) => <li key={note} className="flex gap-2"><span className="text-amber-100/60" aria-hidden="true">•</span><span>{note}</span></li>)}
        </ul>
      </details>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <p className="text-xs text-white/45">No touch or particular result is needed for this to count.</p>
        <button type="button" onClick={handleComplete} className="inline-flex min-h-11 items-center justify-center rounded-full border border-foreground bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-background hover:text-foreground">
          {selectedOption || hasReviewed ? "Finish for now" : "Skip this optional practice"}
        </button>
      </div>
    </div>
  );
};

export default AcuwellnessTool;
