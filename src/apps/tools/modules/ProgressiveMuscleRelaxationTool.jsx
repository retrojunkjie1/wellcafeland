import React, { useCallback, useEffect, useRef, useState } from "react";
import { Eye, ExternalLink, Pause, Play, RotateCcw, SkipForward, Square, Volume2 } from "lucide-react";
import "./ProgressiveMuscleRelaxationTool.css";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";
import { speakText } from "@/services/multimodalClient";

const GROUPS = [
  { name: "Hands", function: "Help you grip, carry, and handle things.", tense: "Gently curl your fingers or make a loose fist. Keep it comfortable.", audioTense: "Gently curl your fingers into a loose fist, only if that feels comfortable. Your hands help you grip and carry; keep breathing normally.", audioRelease: "Let your hands go soft. Notice the change in your fingers and palms. This contrast can help you recognize and release held effort." },
  { name: "Arms", function: "Help you reach, lift, and bring things closer.", tense: "Gently tighten your forearms and upper arms. Keep your shoulders easy.", audioTense: "Gently tighten your forearms and upper arms, only if comfortable. They help you reach and lift; keep your shoulders easy.", audioRelease: "Let your arms rest. Notice the difference from the gentle effort. Practicing that contrast helps you spot tension and soften it." },
  { name: "Shoulders", function: "Help position and support your arms.", tense: "Lift your shoulders just a little, only if that feels comfortable.", audioTense: "Lift your shoulders just a little, only if that feels comfortable. They help position your arms; keep your jaw loose.", audioRelease: "Let your shoulders settle. Notice the weight of your arms now. The gentle release helps you practice recognizing held tension." },
  { name: "Face and jaw", function: "Help you speak, chew, and show expression.", tense: "Gently bring your face together or press your lips lightly. Do not clench your teeth.", audioTense: "Gently tighten your face or press your lips lightly, only if comfortable. Your face and jaw help you speak and chew; keep your teeth apart.", audioRelease: "Let your face soften. Unclench your jaw and leave a little space between your teeth. Notice any change without needing to feel a certain way." },
  { name: "Stomach", function: "Supports your trunk and moves naturally as you breathe.", tense: "Tighten your stomach very lightly. Keep breathing normally.", audioTense: "Gently tighten your abdomen just a little, only if comfortable. These muscles support your trunk; keep breathing naturally, with no breath holding.", audioRelease: "Let your abdomen soften and keep breathing naturally. Notice the movement of each breath. The goal is to notice effort and allow a gentler state." },
  { name: "Hips and thighs", function: "Help steady your hips and move your legs.", tense: "Gently tighten your seat and thighs without changing your position.", audioTense: "Gently tighten your seat and thighs, only if comfortable. They help you stand and move; keep your position steady.", audioRelease: "Let your hips and thighs rest. Notice the support beneath you and any change in effort. You can skip this area if it feels uncomfortable." },
  { name: "Lower legs", function: "Help steady you and move your ankles.", tense: "Point or flex your feet slightly, or gently tighten your lower legs.", audioTense: "Gently tighten your lower legs or make a small ankle movement, only if comfortable. They help steady you; keep the effort light.", audioRelease: "Let your lower legs soften. Notice the difference between effort and rest. There is no need to make the sensation stronger." },
  { name: "Feet", function: "Support your weight and help with balance.", tense: "Curl your toes lightly, only if it feels comfortable.", audioTense: "Gently curl your toes, only if that feels comfortable. Your feet support your weight and balance; keep the effort light.", audioRelease: "Let your toes uncurl. Notice how your feet meet the floor or support beneath you. This is a chance to notice and release unnecessary effort." },
];

const RELEASE_CUE = "Nothing to force or get right.";
const TENSE_PAUSE_MS = 4500;
const RELEASE_PAUSE_MS = 5000;
const AUTO_TENSE_MS = 8000;
const AUTO_RELEASE_MS = 12000;

function getAudioReleaseLine(group, index, total, mode) {
  return mode === "release-only"
    ? `Area ${index + 1} of ${total}. ${group.name}. ${group.audioRelease}`
    : `${group.audioRelease} ${RELEASE_CUE}`;
}

function createSilentUnlockUrl() {
  const sampleBytes = 4096;
  const wav = new Uint8Array(44 + sampleBytes);
  const view = new DataView(wav.buffer);
  const write = (offset, value) => [...value].forEach((char, index) => { wav[offset + index] = char.charCodeAt(0); });
  write(0, "RIFF");
  view.setUint32(4, 36 + sampleBytes, true);
  write(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 16000, true);
  view.setUint32(28, 32000, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, sampleBytes, true);
  return URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
}

function playDecodedCue(audio, requestId) {
  const context = audio.context;
  if (!context || !audio.buffer) return;
  const source = context.createBufferSource();
  source.buffer = audio.buffer;
  source.connect(context.destination);
  audio.source = source;
  audio.startedAt = context.currentTime;
  source.onended = () => {
    if (audio.source !== source) return;
    audio.source = null;
    if (audio.cancelled || audio.paused || requestId !== audio.requestId) return;
    if (audio.objectUrl) URL.revokeObjectURL(audio.objectUrl);
    audio.objectUrl = null;
    audio.buffer = null;
    audio.offset = 0;
    const onEnd = audio.onEnd;
    audio.onEnd = null;
    onEnd?.();
  };
  source.start(0, Math.min(audio.offset || 0, Math.max(0, audio.buffer.duration - 0.01)));
  audio.onStart?.();
}

const BODY_GUIDES = [
  { id: "sage", label: "Deep tone · Sage", alt: "Adult Black woman wearing a sage practice top and forest-green trousers", portrait: "/assets/pmr-guides/sage-face-v2.webp" },
  { id: "slate", label: "Medium tone · Slate", alt: "Adult East Asian man wearing a slate-blue practice shirt and charcoal trousers", portrait: "/assets/pmr-guides/slate-face-v2.webp" },
  { id: "ivory", label: "Light tone · Ivory", alt: "Older white woman wearing an ivory tunic and plum practice trousers", portrait: "/assets/pmr-guides/ivory-face-v2.webp" },
];

const PMR_FRAME_RATE = 8;
const PMR_FRAME_DELAY = 1000 / PMR_FRAME_RATE;

function PmrFrameSequence({ guideId, regionId, kind, motion, paused, releaseOnly, fallbackSrc, alt }) {
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const lastMotionRef = useRef("rest");
  const canReleaseRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    framesRef.current = [];
    currentFrameRef.current = 0;
    const frames = Array.from({ length: 8 }, (_, frame) => {
      const image = new Image();
      image.decoding = "async";
      image.src = `/assets/pmr-motion/${kind}/${guideId}-${regionId}-${frame}.webp`;
      return image;
    });
    Promise.all(frames.map((image) => image.decode().catch(() => null))).then(() => {
      if (cancelled) return;
      const loadedFrames = frames.filter((image) => image.complete && image.naturalWidth > 0);
      framesRef.current = loadedFrames.length === frames.length ? frames : [];
      setReady(loadedFrames.length === frames.length);
    });
    return () => { cancelled = true; };
  }, [guideId, kind, regionId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !context) return undefined;

    const drawFrame = (index) => {
      const frame = frames[index];
      if (!frame) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(frame, 0, 0, canvas.width, canvas.height);
    };

    if (!ready || frames.length !== 8) return undefined;
    if (motion !== lastMotionRef.current) {
      if (motion === "tensing") {
        currentFrameRef.current = 0;
        canReleaseRef.current = true;
      } else if (motion === "releasing") {
        // Release-only starts from a gentle mid-effort pose, so the guide can
        // show softening without suggesting a strong contraction.
        currentFrameRef.current = releaseOnly ? 4 : 7;
        canReleaseRef.current = true;
      } else if (motion === "rest") {
        currentFrameRef.current = 0;
        canReleaseRef.current = false;
      }
      lastMotionRef.current = motion;
      drawFrame(currentFrameRef.current);
    }

    if (paused || !canReleaseRef.current || (motion !== "tensing" && motion !== "releasing")) {
      if (motion === "rest") drawFrame(0);
      return undefined;
    }

    const direction = motion === "tensing" ? 1 : -1;
    let timer = null;
    const advance = () => {
      const nextFrame = currentFrameRef.current + direction;
      if (nextFrame < 0 || nextFrame > 7) return;
      currentFrameRef.current = nextFrame;
      drawFrame(nextFrame);
      if ((direction > 0 && nextFrame < 7) || (direction < 0 && nextFrame > 0)) {
        timer = window.setTimeout(advance, PMR_FRAME_DELAY);
      }
    };
    timer = window.setTimeout(advance, PMR_FRAME_DELAY);
    return () => window.clearTimeout(timer);
  }, [motion, paused, ready]);

  return (
    <div className="absolute inset-0">
      {!ready && <img src={fallbackSrc} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-contain object-top" width="800" height="1200" decoding="async" />}
      <canvas ref={canvasRef} width="480" height="600" role="img" aria-label={alt} className="absolute inset-0 h-full w-full object-contain" style={{ opacity: ready ? 1 : 0 }} />
    </div>
  );
}

function HumanGuide({ groupIndex, guideId, onSelectGuide, motion, paused, releaseOnly, active }) {
  const selectedGuide = BODY_GUIDES.find((guide) => guide.id === guideId) || BODY_GUIDES[0];
  const group = GROUPS[groupIndex];
  const regionId = ["hands", "arms", "shoulders", "face-jaw", "stomach", "hips-thighs", "lower-legs", "feet"][groupIndex];
  const focusImage = `/assets/pmr-focus/${selectedGuide.id}-${regionId}.webp`;
  return (
    <div className="pmr-guides min-w-0 rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.06] to-slate-950/65 p-3 sm:p-4" data-motion={motion} data-area={groupIndex} data-active={active} data-paused={paused} aria-label={`Body focus: ${group.name}`}>
      <div className="flex items-center justify-between gap-2 pb-3">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Body guide</span>
        <span className="rounded-full border border-amber-100/20 bg-amber-100/[0.06] px-3 py-1 text-sm font-medium text-amber-100">{group.name}</span>
      </div>
      <div className="grid grid-cols-2 items-stretch gap-2">
        <figure className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#17211d]">
          <div className="relative aspect-[4/5]">
          <PmrFrameSequence key={`full-${selectedGuide.id}-${regionId}`} kind="full" guideId={selectedGuide.id} regionId={regionId} motion={motion} paused={paused} releaseOnly={releaseOnly} fallbackSrc={selectedGuide.portrait} alt={`${selectedGuide.alt}; ${group.name} visibly tightens and releases with the spoken cue`} />
          </div>
          <figcaption className="border-t border-white/10 bg-slate-950/40 px-2 py-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-white/65">Full view</figcaption>
        </figure>
        <figure className="min-w-0 overflow-hidden rounded-2xl border border-amber-100/20 bg-[#17211d]">
          <div className="relative aspect-[4/5]">
            {selectedGuide.id === "ivory" ? <img key={`${selectedGuide.id}-${regionId}`} src={focusImage} alt={`Close-up of ${group.name.toLowerCase()} matching the selected guide`} className="absolute inset-0 h-full w-full object-cover" width="480" height="600" decoding="async" fetchPriority="low" /> : <PmrFrameSequence key={`detail-${selectedGuide.id}-${regionId}`} kind="detail" guideId={selectedGuide.id} regionId={regionId} motion={motion} paused={paused} releaseOnly={releaseOnly} fallbackSrc={focusImage} alt={`Close-up of ${group.name.toLowerCase()} moving with the spoken cue`} />}
          </div>
          <figcaption className="border-t border-amber-100/15 bg-slate-950/40 px-2 py-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-amber-100/85">Muscle focus · {group.name}</figcaption>
        </figure>
      </div>
      <p className="mt-2 text-center text-xs leading-relaxed text-white/65">{group.function}</p>
      <div className="mt-3 grid grid-cols-3 gap-1.5" role="group" aria-label="Choose a guide appearance">
        {BODY_GUIDES.map((guide) => <button key={guide.id} type="button" aria-pressed={guide.id === selectedGuide.id} aria-label={guide.label} onClick={() => onSelectGuide(guide.id)} className={`min-h-10 rounded-xl border px-1.5 text-[11px] font-medium leading-tight transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${guide.id === selectedGuide.id ? "border-amber-200/60 bg-amber-100/[0.09] text-amber-100" : "border-white/10 text-white/70 hover:bg-white/[0.06]"}`}>
          <span className="block">{guide.label.split(" · ")[0]}</span><span className="block opacity-70">{guide.label.split(" · ")[1]}</span>
        </button>)}
      </div>
    </div>
  );
}

/** A brief, optional PMR practice. No body ratings or reflections are collected. */
export default function ProgressiveMuscleRelaxationTool({ onComplete, onCancel }) {
  const [phase, setPhase] = useState("intro");
  const [mode, setMode] = useState("tense-release");
  const [guide, setGuide] = useState("visual");
  const [groupIndex, setGroupIndex] = useState(0);
  const [guideId, setGuideId] = useState("sage");
  const [paused, setPaused] = useState(false);
  const voiceAvailable = true;
  const [spokenGuidance, setSpokenGuidance] = useState(true);
  const [speechFailed, setSpeechFailed] = useState(false);
  const [speechIssue, setSpeechIssue] = useState("");
  const [bodyMotion, setBodyMotion] = useState("rest");
  const startedAtRef = useRef(null);
  const completedRef = useRef(false);
  const audioRef = useRef({ timer: null, dueAt: 0, remaining: 0, nextCallback: null, player: null, context: null, source: null, buffer: null, offset: 0, startedAt: 0, onEnd: null, onStart: null, objectUrl: null, unlockUrl: null, primed: false, requestId: 0, cancelled: false, paused: false });
  const cuePrefetchRef = useRef(new Map());
  const visualTimerRef = useRef(null);
  const visualDueAtRef = useRef(0);
  const visualRemainingRef = useRef(null);

  const releasePrefetchedCues = useCallback((keepText = null) => {
    cuePrefetchRef.current.forEach((request, text) => {
      if (text === keepText) return;
      cuePrefetchRef.current.delete(text);
      request.then((result) => {
        if (result?.audioUrl) URL.revokeObjectURL(result.audioUrl);
      }).catch(() => {});
    });
  }, []);

  const prefetchCue = useCallback((text) => {
    if (!text || cuePrefetchRef.current.has(text)) return;
    // Keep at most one next cue warm. This removes network/TTS setup delay
    // between steps without generating the whole practice ahead of time.
    releasePrefetchedCues(text);
    const request = speakText(text, { voice: "marin" }).catch((error) => ({
      ok: false,
      error: error?.message || "The next spoken cue could not be prepared.",
    }));
    cuePrefetchRef.current.set(text, request);
  }, [releasePrefetchedCues]);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      audio.cancelled = true;
      audio.requestId += 1;
      window.clearTimeout(audio.timer);
      window.clearTimeout(visualTimerRef.current);
      audio.player?.pause();
      audio.source?.stop();
      audio.context?.close().catch(() => {});
      if (audio.objectUrl) URL.revokeObjectURL(audio.objectUrl);
      if (audio.unlockUrl) URL.revokeObjectURL(audio.unlockUrl);
      releasePrefetchedCues();
    };
  }, [releasePrefetchedCues]);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    audio.cancelled = true;
    audio.paused = false;
    audio.requestId += 1;
    audio.remaining = 0;
    audio.nextCallback = null;
    window.clearTimeout(audio.timer);
    window.clearTimeout(visualTimerRef.current);
    visualTimerRef.current = null;
    visualDueAtRef.current = 0;
    visualRemainingRef.current = null;
    audio.player?.pause();
    audio.player = null;
    audio.source?.stop();
    audio.source = null;
    audio.buffer = null;
    audio.offset = 0;
    audio.onEnd = null;
    audio.onStart = null;
    setBodyMotion("rest");
    audio.context?.close().catch(() => {});
    audio.context = null;
    if (audio.objectUrl) URL.revokeObjectURL(audio.objectUrl);
    audio.objectUrl = null;
    if (audio.unlockUrl) URL.revokeObjectURL(audio.unlockUrl);
    audio.unlockUrl = null;
    audio.primed = false;
    releasePrefetchedCues();
  }, [releasePrefetchedCues]);

  const finishPractice = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    stopAudio();
    const completedAt = Date.now();
    const startedAt = startedAtRef.current || completedAt;
    const durationMs = Math.max(0, completedAt - startedAt);
    const result = createToolResult(
      "progressive_muscle_relaxation",
      "Progressive Muscle Relaxation",
      "Completed an optional progressive muscle relaxation practice.",
      { practiceType: "progressive-muscle-relaxation" },
      Math.floor(durationMs / 1000),
    );
    logToolUsage("pmr", { startedAt, completedAt, durationMs, context: { completed: true } })
      .catch((err) => console.warn("Tool telemetry failed:", err));
    setPhase("complete");
    safeComplete(onComplete, result);
  }, [onComplete, stopAudio]);

  const speak = useCallback(async (text, onEnd, stage) => {
    const audio = audioRef.current;
    if (audio.cancelled) return;
    const requestId = ++audio.requestId;
    setSpeechFailed(false);
    if (audio.source) {
      const previousSource = audio.source;
      audio.source = null;
      previousSource.stop();
    }
    audio.buffer = null;
    audio.offset = 0;
    audio.onEnd = null;
    audio.onStart = () => {
      if (!audio.cancelled && !audio.paused && requestId === audio.requestId) setBodyMotion(stage);
    };
    if (!audio.primed) {
      audio.player?.pause();
      audio.player = null;
    }
    if (audio.objectUrl && !audio.primed) URL.revokeObjectURL(audio.objectUrl);
    if (!audio.primed) audio.objectUrl = null;
    setSpeechIssue("Preparing the spoken cue…");
    try {
      const queuedCue = cuePrefetchRef.current.get(text);
      if (queuedCue) cuePrefetchRef.current.delete(text);
      const result = await (queuedCue || speakText(text, { voice: "marin" }));
      if (audio.cancelled || requestId !== audio.requestId) {
        if (result.audioUrl) URL.revokeObjectURL(result.audioUrl);
        return;
      }
      if (!result.ok || !result.audioUrl) {
        audio.player?.pause();
        audio.player = null;
        audio.primed = false;
        if (audio.unlockUrl) URL.revokeObjectURL(audio.unlockUrl);
        audio.unlockUrl = null;
        audio.objectUrl = null;
        setSpeechFailed(true);
        audio.paused = true;
        setPaused(true);
        setBodyMotion("rest");
        setSpeechIssue(result.error || "The spoken guide could not connect. Check your connection, then replay this cue.");
        return;
      }
      if (audio.context) {
        const encodedAudio = await result.audioBlob.arrayBuffer();
        const buffer = await audio.context.decodeAudioData(encodedAudio);
        if (audio.cancelled || requestId !== audio.requestId) {
          URL.revokeObjectURL(result.audioUrl);
          return;
        }
        audio.player?.pause();
        audio.player = null;
        audio.buffer = buffer;
        audio.offset = 0;
        audio.objectUrl = result.audioUrl;
        audio.onEnd = onEnd;
        audio.primed = false;
        if (audio.unlockUrl) URL.revokeObjectURL(audio.unlockUrl);
        audio.unlockUrl = null;
        if (!audio.paused) {
          playDecodedCue(audio, requestId);
          setSpeechIssue("");
        }
        return;
      }
      const wasPrimed = audio.primed && audio.player;
      const player = wasPrimed ? audio.player : new Audio();
      if (!wasPrimed) player.pause();
      player.loop = false;
      player.src = result.audioUrl;
      player.preload = "auto";
      player.volume = 1;
      player.load();
      audio.player = player;
      audio.primed = false;
      audio.objectUrl = result.audioUrl;
      if (audio.unlockUrl) URL.revokeObjectURL(audio.unlockUrl);
      audio.unlockUrl = null;
      player.onplaying = () => {
        if (requestId === audio.requestId) setBodyMotion(stage);
        setSpeechIssue("");
      };
      player.onended = () => {
        if (audio.objectUrl === result.audioUrl) URL.revokeObjectURL(result.audioUrl);
        audio.objectUrl = null;
        audio.player = null;
        if (stage === "releasing") setBodyMotion("rest");
        if (!audio.cancelled && !audio.paused && requestId === audio.requestId) onEnd?.();
      };
      player.onerror = () => {
        if (audio.cancelled || requestId !== audio.requestId) return;
        setSpeechFailed(true);
        audio.paused = true;
        setPaused(true);
        setSpeechIssue("The spoken audio could not play. Check your device volume and audio output, then replay this cue.");
      };
      if (!audio.paused) await player.play();
    } catch (error) {
      if (audio.cancelled || requestId !== audio.requestId) return;
      audio.paused = true;
      setPaused(true);
      const audioReadyToResume = Boolean((audio.context && audio.buffer) || (audio.player && audio.objectUrl));
      if (audioReadyToResume && error?.name !== "NotSupportedError") {
        audio.player?.pause();
        setSpeechFailed(false);
        setSpeechIssue("The voice is ready, but your browser did not start it automatically. Tap Resume to play this cue.");
        return;
      }
      setSpeechFailed(true);
      setBodyMotion("rest");
      audio.player?.pause();
      audio.player = null;
      audio.source?.stop();
      audio.source = null;
      audio.buffer = null;
      audio.onEnd = null;
      audio.primed = false;
      if (audio.objectUrl) URL.revokeObjectURL(audio.objectUrl);
      audio.objectUrl = null;
      if (audio.unlockUrl) URL.revokeObjectURL(audio.unlockUrl);
      audio.unlockUrl = null;
      setSpeechIssue(error?.name === "NotAllowedError"
        ? "Your browser blocked audio playback. Tap Resume once, and the spoken guide will continue."
        : error?.name === "NotSupportedError"
          ? "This browser could not decode the spoken cue. Try another browser or use the visual guide."
          : "The spoken guide could not play this cue. Replay it to try again.");
    }
  }, []);

  const scheduleAudio = useCallback((callback, delay) => {
    const audio = audioRef.current;
    if (audio.cancelled) return;
    audio.nextCallback = callback;
    audio.remaining = delay;
    audio.dueAt = Date.now() + delay;
    audio.timer = window.setTimeout(() => {
      audio.timer = null;
      audio.remaining = 0;
      audio.nextCallback = null;
      if (!audio.cancelled && !audio.paused) callback();
    }, delay);
  }, []);

  const speakGroup = useCallback((index, stage) => {
    if (index >= GROUPS.length) {
      finishPractice();
      return;
    }
    setGroupIndex(index);
    setPhase(stage);
    const group = GROUPS[index];
    const releaseLine = getAudioReleaseLine(group, index, GROUPS.length, mode);
    const nextCue = stage === "tensing"
      ? releaseLine
      : index < GROUPS.length - 1
        ? mode === "release-only"
          ? getAudioReleaseLine(GROUPS[index + 1], index + 1, GROUPS.length, mode)
          : GROUPS[index + 1].audioTense
        : null;
    if (nextCue) prefetchCue(nextCue);
    if (stage === "tensing") {
      speak(group.audioTense, () => scheduleAudio(() => speakGroup(index, "releasing"), TENSE_PAUSE_MS), stage);
    } else {
      speak(releaseLine, () => {
        setBodyMotion("rest");
        scheduleAudio(() => speakGroup(index + 1, mode === "release-only" ? "releasing" : "tensing"), RELEASE_PAUSE_MS);
      }, stage);
    }
  }, [finishPractice, mode, prefetchCue, scheduleAudio, speak]);

  const beginPractice = () => {
    completedRef.current = false;
    startedAtRef.current = Date.now();
    window.clearTimeout(visualTimerRef.current);
    visualRemainingRef.current = null;
    setGroupIndex(0);
    setPaused(false);
    setBodyMotion("rest");
    setSpeechFailed(false);
    setSpeechIssue("");
    setPhase(mode === "tense-release" ? "tensing" : "releasing");
    if (guide === "audio" || (guide === "visual" && spokenGuidance && voiceAvailable)) {
      const audio = audioRef.current;
      audio.cancelled = false;
      audio.paused = false;
      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
      if (AudioContextConstructor) {
        try {
          audio.context = new AudioContextConstructor();
          // Resume inside the Begin gesture so fetched speech can play through
          // the same unlocked audio session on mobile Safari and Chrome.
          audio.context.resume().catch(() => {});
        } catch {
          audio.context = null;
        }
      }
      if (!audio.context) {
        const player = new Audio();
        const unlockUrl = createSilentUnlockUrl();
        audio.player = player;
        audio.objectUrl = unlockUrl;
        audio.unlockUrl = unlockUrl;
        audio.primed = true;
        player.loop = true;
        player.volume = 0;
        player.src = unlockUrl;
        player.play().catch(() => {
          if (audio.unlockUrl === unlockUrl) audio.primed = false;
        });
      }
      speakGroup(0, mode === "tense-release" ? "tensing" : "releasing");
    } else if (guide === "visual" && spokenGuidance && !voiceAvailable) {
      setSpeechIssue("Spoken guidance is unavailable in this browser. The visual cues will continue automatically.");
    }
  };

  const advanceGroup = useCallback(() => {
    stopAudio();
    if (groupIndex >= GROUPS.length - 1) {
      finishPractice();
      return;
    }
    const nextIndex = groupIndex + 1;
    setGroupIndex(nextIndex);
    setPaused(false);
    setPhase(mode === "tense-release" ? "tensing" : "releasing");
  }, [finishPractice, groupIndex, mode, stopAudio]);

  const pauseAudio = () => {
    const audio = audioRef.current;
    if (!isNarrated) {
      if (!paused) {
        visualRemainingRef.current = Math.max(0, visualDueAtRef.current - Date.now());
        window.clearTimeout(visualTimerRef.current);
        visualTimerRef.current = null;
        setPaused(true);
      } else {
        setPaused(false);
      }
      return;
    }
    if (!paused) {
      audio.paused = true;
      if (audio.timer) {
        audio.remaining = Math.max(0, audio.dueAt - Date.now());
        window.clearTimeout(audio.timer);
        audio.timer = null;
      }
      audio.player?.pause();
      if (audio.source && audio.context && audio.buffer) {
        audio.offset = Math.min(audio.buffer.duration, audio.offset + Math.max(0, audio.context.currentTime - audio.startedAt));
        const source = audio.source;
        audio.source = null;
        source.stop();
      }
      setPaused(true);
      return;
    }
    audio.paused = false;
    setPaused(false);
    if (audio.buffer && audio.context) {
      audio.context.resume().then(() => {
        playDecodedCue(audio, audio.requestId);
      }).catch(() => {
        audio.paused = true;
        setPaused(true);
        setSpeechIssue("Audio is still blocked. Tap Resume again to continue the spoken cue.");
      });
      return;
    }
    if (audio.player) {
      audio.player.play().then(() => {
        setSpeechIssue("");
      }).catch(() => {
        audio.paused = true;
        setPaused(true);
        setSpeechIssue("Audio is still blocked. Replay this cue to try again.");
      });
      return;
    }
    if (speechFailed) {
      setSpeechFailed(false);
      speakGroup(groupIndex, phase);
      return;
    }
    if (audio.remaining > 0 && audio.timer === null) {
      const delay = audio.remaining;
      const callback = audio.nextCallback;
      if (callback) scheduleAudio(callback, delay);
    }
  };

  const resetPractice = () => {
    stopAudio();
    setPaused(false);
    setPhase("intro");
    setGroupIndex(0);
    setBodyMotion("rest");
    startedAtRef.current = null;
    completedRef.current = false;
  };

  const leavePractice = () => {
    stopAudio();
    safeCancel(onCancel);
  };

  const skipArea = () => {
    if (!isNarrated) {
      advanceGroup();
      return;
    }
    if (groupIndex >= GROUPS.length - 1) {
      finishPractice();
      return;
    }
    const audio = audioRef.current;
    setBodyMotion("rest");
    audio.cancelled = false;
    audio.paused = false;
    window.clearTimeout(audio.timer);
    audio.timer = null;
    audio.remaining = 0;
    audio.nextCallback = null;
    setPaused(false);
    speakGroup(groupIndex + 1, mode === "tense-release" ? "tensing" : "releasing");
  };

  const replayCue = () => {
    const audio = audioRef.current;
    audio.cancelled = false;
    audio.paused = false;
    window.clearTimeout(audio.timer);
    audio.timer = null;
    audio.remaining = 0;
    audio.nextCallback = null;
    setPaused(false);
    if (phase === "tensing") setBodyMotion("rest");
    speakGroup(groupIndex, phase);
  };

  const activeGroup = GROUPS[groupIndex];
  const progress = phase === "intro" ? 0 : Math.round(((groupIndex + (phase === "releasing" ? 0.5 : 0)) / GROUPS.length) * 100);
  const isReleaseOnly = mode === "release-only";
  const isAudio = guide === "audio";
  const isNarrated = isAudio || (guide === "visual" && spokenGuidance && voiceAvailable);
  const activeInstruction = isNarrated
    ? phase === "tensing" && !isReleaseOnly
      ? activeGroup.audioTense
      : isReleaseOnly ? activeGroup.audioRelease : `${activeGroup.audioRelease} ${RELEASE_CUE}`
    : phase === "tensing" && !isReleaseOnly ? activeGroup.tense : RELEASE_CUE;

  useEffect(() => {
    if (isNarrated) return;
    if (phase === "tensing") setBodyMotion("tensing");
    else if (phase === "releasing") setBodyMotion("releasing");
    else setBodyMotion("rest");
  }, [isNarrated, phase]);

  useEffect(() => {
    if (guide !== "visual" || isNarrated || paused || (phase !== "tensing" && phase !== "releasing")) return undefined;
    const delay = visualRemainingRef.current ?? (phase === "tensing" && !isReleaseOnly ? AUTO_TENSE_MS : AUTO_RELEASE_MS);
    visualRemainingRef.current = null;
    visualDueAtRef.current = Date.now() + delay;
    visualTimerRef.current = window.setTimeout(() => {
      visualTimerRef.current = null;
      visualDueAtRef.current = 0;
      if (phase === "tensing" && !isReleaseOnly) {
        setPhase("releasing");
      } else if (groupIndex < GROUPS.length - 1) {
        setGroupIndex((index) => index + 1);
        setPhase(isReleaseOnly ? "releasing" : "tensing");
      } else {
        finishPractice();
      }
    }, delay);
    return () => window.clearTimeout(visualTimerRef.current);
  }, [finishPractice, groupIndex, guide, isNarrated, isReleaseOnly, paused, phase]);

  return (
    <div className="space-y-6">
      {phase === "intro" && (
        <>
          <div className="max-w-2xl rounded-3xl border border-emerald-100/15 bg-gradient-to-br from-emerald-100/[0.08] to-white/[0.025] p-5 sm:p-7">
            <p className="text-xl font-medium leading-snug text-white sm:text-2xl">A slow, guided way to soften muscle tension.</p>
            <p className="mt-2 text-base leading-relaxed text-white/80">Tap Begin once. A spoken cue and a clear body guide then move together at an unhurried pace.</p>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-base font-semibold text-white">How would you like to follow?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" aria-pressed={guide === "visual"} onClick={() => setGuide("visual")} className={`min-h-28 rounded-3xl border p-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${guide === "visual" ? "border-amber-200/60 bg-amber-100/[0.09]" : "border-white/15 bg-white/[0.025] hover:bg-white/[0.05]"}`}>
                <Eye aria-hidden="true" className="h-7 w-7 text-amber-100" />
                <span className="mt-3 block text-lg font-semibold text-white">Visual + spoken guide</span>
                <span className="mt-1 block text-sm text-white/75">A natural spoken cue leads each step while the body guide follows along.</span>
              </button>
              <button type="button" aria-pressed={guide === "audio"} onClick={() => setGuide("audio")} disabled={!voiceAvailable} className={`min-h-28 rounded-3xl border p-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 disabled:cursor-not-allowed disabled:opacity-60 ${guide === "audio" ? "border-amber-200/60 bg-amber-100/[0.09]" : "border-white/15 bg-white/[0.025] hover:bg-white/[0.05]"}`}>
                <Volume2 aria-hidden="true" className="h-7 w-7 text-amber-100" />
                <span className="mt-3 block text-lg font-semibold text-white">Listen with eyes closed</span>
                <span className="mt-1 block text-sm text-white/75">Natural spoken prompts only. The sequence starts when you tap Begin.</span>
              </button>
            </div>
            {guide === "visual" && <label className="flex min-h-11 max-w-xl items-center gap-3 text-sm text-white/80"><input type="checkbox" checked={spokenGuidance} onChange={(event) => setSpokenGuidance(event.target.checked)} disabled={!voiceAvailable} className="h-5 w-5 accent-amber-200" /> Spoken cues <span className="text-white/55">On by default · starts after Begin</span></label>}
            <p className="max-w-xl text-sm leading-relaxed text-white/60">Uses WellnessCafe’s online natural-voice service. An internet connection is needed for spoken guidance.</p>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-base font-semibold text-white">Choose what feels comfortable</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" aria-pressed={mode === "tense-release"} onClick={() => setMode("tense-release")} className={`rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${mode === "tense-release" ? "border-amber-200/50 bg-amber-100/[0.07]" : "border-white/15 bg-white/[0.025]"}`}>
                <span className="block text-base font-medium text-white">Tense gently, then release</span><span className="mt-1 block text-sm text-white/70">Use only a little effort.</span>
              </button>
              <button type="button" aria-pressed={mode === "release-only"} onClick={() => setMode("release-only")} className={`rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${mode === "release-only" ? "border-amber-200/50 bg-amber-100/[0.07]" : "border-white/15 bg-white/[0.025]"}`}>
                <span className="block text-base font-medium text-white">Release only</span><span className="mt-1 block text-sm text-white/70">No tightening; let each area soften.</span>
              </button>
            </div>
          </fieldset>

          <p className="max-w-2xl text-sm leading-relaxed text-white/75">Sit or lie somewhere supported. Keep breathing normally. Skip any area that hurts or feels uncomfortable; stop whenever you want.</p>
          <details className="max-w-2xl rounded-xl border border-white/10 bg-white/[0.025] px-4">
            <summary className="flex min-h-12 cursor-pointer items-center text-sm font-medium text-amber-100/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">Why this practice?</summary>
            <div className="space-y-3 pb-4 text-sm leading-relaxed text-white/75">
              <p>Progressive muscle relaxation appears in a SAMHSA workbook for substance-use and mental-health programs. A 2024 systematic review found mostly positive results across varied adult programs, alongside studies with no clear benefit. This short version is an introduction; the review did not test this exact sequence. Results vary, and this is a supportive skill—not treatment or a promised outcome.</p>
              <div className="flex flex-col gap-2 border-t border-white/10 pt-3 sm:flex-row sm:flex-wrap">
                <a href="https://store.samhsa.gov/sites/default/files/anger_management_workbook_508_compliant.pdf" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm text-amber-100 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">SAMHSA participant workbook <ExternalLink aria-hidden="true" className="h-4 w-4" /></a>
                <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10844009/" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm text-amber-100 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">2024 systematic review <ExternalLink aria-hidden="true" className="h-4 w-4" /></a>
                <a href="https://www.mirecc.va.gov/MIRECC/visn5/EBT/CBT-CP/Session-5-Progressive-Muscle-Relaxation.asp" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm text-amber-100 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">VA practice sequence <ExternalLink aria-hidden="true" className="h-4 w-4" /></a>
              </div>
            </div>
          </details>
          <button type="button" onClick={beginPractice} className="min-h-12 rounded-full bg-amber-200 px-6 text-base font-semibold text-slate-950 transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Begin {isAudio ? "listening" : "guided practice"} <Play aria-hidden="true" className="ml-2 inline h-4 w-4" /></button>
        </>
      )}

      {phase === "complete" && (
        <section aria-live="polite" className="rounded-3xl border border-emerald-100/20 bg-emerald-100/[0.06] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-100/80">Practice complete</p>
          <h2 className="mt-3 text-2xl font-medium text-white">You made space to pause.</h2>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-white/80">Notice any difference—or none. There is no score, and you do not need to feel a particular way.</p>
          <button type="button" onClick={resetPractice} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-base font-medium text-white transition hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"><RotateCcw aria-hidden="true" className="h-4 w-4" /> Try another round</button>
        </section>
      )}

      {(phase === "tensing" || phase === "releasing") && (
        <section aria-label="Guided muscle relaxation" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold tabular-nums text-white">{String(groupIndex + 1).padStart(2, "0")} <span className="text-white/45">/ {String(GROUPS.length).padStart(2, "0")}</span></p>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100/15 bg-emerald-100/[0.04] px-3 py-1 text-xs font-medium text-emerald-100/85">{isNarrated ? <><Volume2 aria-hidden="true" className="h-3.5 w-3.5" /> Voice-led auto play</> : "Visual auto play"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={paused} onClick={pauseAudio} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-sm font-medium text-white/90 transition hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">{paused ? <Play aria-hidden="true" className="h-4 w-4" /> : <Pause aria-hidden="true" className="h-4 w-4" />}{paused ? "Resume" : "Pause"}</button>
              {isNarrated && <button type="button" onClick={replayCue} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-sm font-medium text-white/90 transition hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"><Volume2 aria-hidden="true" className="h-4 w-4" /> Replay cue</button>}
              <button type="button" onClick={skipArea} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-sm font-medium text-white/90 transition hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"><SkipForward aria-hidden="true" className="h-4 w-4" /> Skip area</button>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Practice progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="h-full rounded-full bg-gradient-to-r from-emerald-200 to-amber-200 transition-[width] duration-700" style={{ width: `${progress}%` }} /></div>

          <div className="grid items-stretch gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <HumanGuide groupIndex={groupIndex} guideId={guideId} onSelectGuide={setGuideId} motion={bodyMotion} paused={paused} releaseOnly={isReleaseOnly} active={phase === "tensing" || phase === "releasing"} />
            <div aria-live="polite" aria-atomic="true" className="flex min-h-64 flex-col justify-center rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.055] to-slate-950/35 p-5 sm:min-h-72 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100/85">{paused ? "Paused" : phase === "tensing" ? "Gently tighten" : "Release"}</p>
              <h2 className="mt-2 text-2xl font-semibold leading-tight text-white sm:text-3xl">{activeGroup.name}</h2>
              <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl">
                {paused ? "Take your time. Resume whenever you are ready." : activeInstruction}
              </p>
            </div>
          </div>

          {speechIssue && <p role="status" className="rounded-xl border border-amber-100/20 bg-amber-100/[0.06] px-4 py-3 text-sm text-amber-50/90">{speechIssue}</p>}
          <p className="text-base leading-relaxed text-white/75">{isNarrated ? "Spoken cues and the visual guide move together. Use a comfortable effort, keep breathing naturally, or skip any area." : "Each area advances on its own. Pause, skip an area, or stop whenever you want."}</p>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
            <button type="button" onClick={resetPractice} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-base text-white/75 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"><RotateCcw aria-hidden="true" className="h-4 w-4" /> Start over</button>
            <button type="button" onClick={leavePractice} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-base text-white/75 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"><Square aria-hidden="true" className="h-4 w-4" /> Stop practice</button>
          </div>
        </section>
      )}
    </div>
  );
}
