import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { logToolUsage } from "../../../services/toolTelemetry";
import { trackAction } from "../../../services/telemetry";
import { speakText } from "@/services/multimodalClient";
import { createToolResult, safeComplete } from "@/utils/toolContract";
import MeditationSceneVisual from "./MeditationSceneVisual";
import { startMeditationSceneAmbience } from "./meditationSceneAmbience";

const DURATIONS = [3, 5, 10, 15, 20];

const AMBIENCE_LABELS = {
  "wide-sky": "Live wind with distant water",
  "rain-window": "Live rain texture on glass",
  "familiar-place": "Quiet indoor room tone",
  "color-and-light": "Soft, slowly shifting resonant tones",
};

// These are finished, locally available practices. They do not call an AI
// provider, depend on audio, or ask the person to focus on their body.
const SCENES = [
  {
    id: "wide-sky",
    preview: "/assets/meditation-panorama/thumbnails/wide-sky.jpg",
    title: "A wide sky",
    detail: "Room to let your attention move",
    visualFocus: ["the open horizon", "one cloud edge", "the wider sky", "the path back"],
    cues: [
      { title: "Choose your view", text: "Imagine a wide sky, or look at one in a photo or through a window. You can keep your eyes open and use the real view instead." },
      { title: "Find one detail", text: "Notice one part of the scene: a cloud edge, a change in color, or the line where sky meets land. There is nothing to get right." },
      { title: "Let the view be wide", text: "Allow the scene to stay in the background while your attention rests on that one detail. If the image does not come easily, simply look at something blue or far away." },
      { title: "Come back when ready", text: "Let the picture fade or look around the room. Take the next moment at your own pace. You may finish here or stay a little longer." },
    ],
  },
  {
    id: "rain-window",
    preview: "/assets/meditation-panorama/thumbnails/rain-window.jpg",
    title: "Rain on a window",
    detail: "A wraparound room, rain-streaked glass, and a misty garden",
    visualFocus: ["the rain-softened glass", "one passing droplet", "the softened view", "the room around you"],
    cues: [
      { title: "Enter the rainy room", text: "Turn toward the wide windows. Rain traces the glass while the garden softens beyond it. You can keep your eyes open or imagine the scene." },
      { title: "Follow one raindrop", text: "Let your gaze travel with a single trail down the glass, or choose a reflection in the room. Nothing needs to be counted or solved." },
      { title: "Let the rain continue", text: "Look in another direction around the room whenever you like. If your attention wanders, you can return to the rain—or simply let it pass." },
      { title: "Leave the scene gently", text: "Notice the room you are in, or the screen in front of you. Nothing needs to change for this pause to count." },
    ],
  },
  {
    id: "familiar-place",
    preview: "/assets/meditation-panorama/thumbnails/familiar-place.jpg",
    title: "A familiar place",
    detail: "A full-circle room to adapt into a place you know",
    visualFocus: ["a place you know", "one familiar detail", "the space around it", "the room around you"],
    cues: [
      { title: "Pick a place—or skip it", text: "Choose an ordinary place you know, such as a library, kitchen, garden, or street. It does not have to feel safe or special. You can choose a neutral imagined landscape instead." },
      { title: "Choose one feature", text: "Bring to mind one color, object, or line in the place. Keep the picture simple; a partial image is enough." },
      { title: "Let the place stay yours", text: "You decide what belongs in the scene and how close or far away it feels. Change it, replace it, or return to the room whenever you want." },
      { title: "Close or continue", text: "Let the image settle in the background. You can finish now, keep the scene for a little longer, or choose another practice." },
    ],
  },
  {
    id: "color-and-light",
    preview: "/assets/meditation-panorama/thumbnails/color-light.jpg",
    title: "Color and light",
    detail: "A panoramic sky of flowing color and soft light",
    visualFocus: ["the full color field", "one ribbon of light", "the changing colors", "the space around you"],
    cues: [
      { title: "Take in the whole field", text: "Let the wide sky of teal, violet, rose, and amber open around you. You can take in the whole scene or choose just one color." },
      { title: "Follow one ribbon of light", text: "Let your eyes travel along a soft band of color as it crosses the sky. The light stays steady—there are no flashes or fast changes." },
      { title: "Notice what shifts", text: "Watch one shade meet another, then let your gaze move freely around the horizon. You do not need to name or remember the colors." },
      { title: "Let the colors recede", text: "When you are ready, look around the real room or let the image rest in the background. You can finish here or stay a little longer." },
    ],
  },
];

const MeditationTool = ({ tool, onComplete }) => {
  const [sceneId, setSceneId] = useState(SCENES[0].id);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5 * 60);
  const [cueIndex, setCueIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [ambientStatus, setAmbientStatus] = useState("idle");
  const startedAtRef = useRef(null);
  const activeStartedAtRef = useRef(null);
  const activeElapsedMsRef = useRef(0);
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  const ambienceStopRef = useRef(null);
  const narrationCacheRef = useRef(new Map());
  const completionHandledRef = useRef(false);
  const activeGuideRef = useRef(null);
  const scene = SCENES.find((item) => item.id === sceneId) || SCENES[0];
  const cue = scene.cues[cueIndex];

  useEffect(() => {
    if (!isActive) return undefined;
    intervalRef.current = setInterval(() => {
      setTimeRemaining((remaining) => Math.max(remaining - 1, 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return undefined;
    const frame = window.requestAnimationFrame(() => {
      if (typeof activeGuideRef.current?.scrollIntoView !== "function") return;
      activeGuideRef.current.scrollIntoView({
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isActive]);

  // Move through the visual story at a calm, duration-scaled pace. Manual
  // Next/Previous remains available and resets this cue's quiet interval.
  useEffect(() => {
    if (!isActive || cueIndex >= scene.cues.length - 1) return undefined;
    const cueDurationMs = (selectedDuration * 60_000) / scene.cues.length;
    const timeout = window.setTimeout(() => {
      setCueIndex((index) => Math.min(index + 1, scene.cues.length - 1));
    }, cueDurationMs);
    return () => window.clearTimeout(timeout);
  }, [isActive, cueIndex, selectedDuration, scene]);

  useEffect(() => {
    if (!isActive) {
      ambienceStopRef.current?.();
      ambienceStopRef.current = null;
      setAmbientStatus("idle");
      audioSourceRef.current?.stop?.();
      audioSourceRef.current = null;
      return undefined;
    }
    if (!voiceEnabled) {
      audioSourceRef.current?.stop?.();
      audioSourceRef.current = null;
      setVoiceStatus("off");
      return undefined;
    }

    const context = audioContextRef.current;
    if (!context || context.state === "closed") {
      setVoiceStatus("unavailable");
      return undefined;
    }

    let cancelled = false;
    const cacheKey = `${scene.id}:${cueIndex}`;
    const existing = narrationCacheRef.current.get(cacheKey);
    const narration = existing || speakText(cue.text, { voice: "marin" }).then(async (result) => {
      if (!result.ok || !result.audioBlob) throw new Error(result.error || "Narration is unavailable.");
      const bytes = await result.audioBlob.arrayBuffer();
      if (result.audioUrl) URL.revokeObjectURL(result.audioUrl);
      return context.decodeAudioData(bytes);
    });
    narrationCacheRef.current.set(cacheKey, narration);
    setVoiceStatus("preparing");

    void narration.then((buffer) => {
      if (cancelled || !voiceEnabled || !isActive) return;
      audioSourceRef.current?.stop?.();
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.onended = () => {
        if (audioSourceRef.current === source) {
          audioSourceRef.current = null;
          setVoiceStatus("ready");
        }
      };
      audioSourceRef.current = source;
      setVoiceStatus("playing");
      source.start();
    }).catch(() => {
      narrationCacheRef.current.delete(cacheKey);
      if (!cancelled) setVoiceStatus("unavailable");
    });

    return () => {
      cancelled = true;
      audioSourceRef.current?.stop?.();
      audioSourceRef.current = null;
    };
  }, [isActive, voiceEnabled, cueIndex, cue.text, scene.id]);

  useEffect(() => {
    if (!isActive) return undefined;
    let cancelled = false;
    let stopAmbience = null;
    setAmbientStatus("preparing");
    void startMeditationSceneAmbience(audioContextRef.current, scene.id).then((stop) => {
      if (cancelled) {
        stop();
        return;
      }
      stopAmbience = stop;
      ambienceStopRef.current = stop;
      setAmbientStatus("playing");
    }).catch(() => {
      if (!cancelled) setAmbientStatus("unavailable");
    });
    return () => {
      cancelled = true;
      stopAmbience?.();
      if (ambienceStopRef.current === stopAmbience) ambienceStopRef.current = null;
      setAmbientStatus("idle");
    };
  }, [isActive, scene.id]);

  useEffect(() => () => {
    audioSourceRef.current?.stop?.();
    ambienceStopRef.current?.();
    audioContextRef.current?.close?.();
    audioSourceRef.current = null;
    audioContextRef.current = null;
  }, []);

  useEffect(() => {
    if (isActive && timeRemaining === 0) finishPractice();
    // The timer reaching zero is the only automatic completion trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeRemaining]);

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  const startPractice = () => {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (AudioContextConstructor) {
      try {
        if (!audioContextRef.current || audioContextRef.current.state === "closed") {
          audioContextRef.current = new AudioContextConstructor();
        }
        void audioContextRef.current.resume().catch(() => {
          setVoiceStatus("unavailable");
          setAmbientStatus("unavailable");
        });
      } catch {
        setVoiceStatus("unavailable");
        setAmbientStatus("unavailable");
      }
    } else {
      setVoiceStatus("unavailable");
      setAmbientStatus("unavailable");
    }
    completionHandledRef.current = false;
    const now = Date.now();
    startedAtRef.current = now;
    activeStartedAtRef.current = now;
    activeElapsedMsRef.current = 0;
    setCueIndex(0);
    setTimeRemaining(selectedDuration * 60);
    setFinished(false);
    setIsActive(true);
    trackAction("tool_visualization_start", { toolId: tool?.id || "meditation", sceneId, duration: selectedDuration });
  };

  function finishPractice() {
    setIsActive(false);
    setFinished(true);
    setVoiceStatus("idle");
    if (!startedAtRef.current || completionHandledRef.current) return;
    completionHandledRef.current = true;
    const completedAt = Date.now();
    const activeNowMs = activeStartedAtRef.current
      ? Math.max(0, completedAt - activeStartedAtRef.current)
      : 0;
    const durationMs = Math.max(0, activeElapsedMsRef.current + activeNowMs);
    const actualMinutes = Math.max(1, Math.round(durationMs / 60_000));
    logToolUsage(tool?.id || "meditation", {
      startedAt: startedAtRef.current,
      completedAt,
      durationMs,
      duration: actualMinutes,
      context: { sceneId },
    }).catch((error) => console.warn("Imagery practice telemetry failed:", error));
    safeComplete(onComplete, createToolResult(
      tool?.id || "meditation",
      tool?.name || "Visualization & Imagery",
      `Finished a ${actualMinutes}-minute visual pause.`,
      { durationMinutes: actualMinutes, sceneId },
      Math.floor(durationMs / 1000),
    ));
    startedAtRef.current = null;
    activeStartedAtRef.current = null;
    activeElapsedMsRef.current = 0;
  }

  const pausePractice = () => {
    if (activeStartedAtRef.current) {
      activeElapsedMsRef.current += Math.max(0, Date.now() - activeStartedAtRef.current);
      activeStartedAtRef.current = null;
    }
    setIsActive(false);
    setVoiceStatus("paused");
  };

  const resumePractice = () => {
    activeStartedAtRef.current = Date.now();
    setIsActive(true);
  };

  const resetPractice = () => {
    setIsActive(false);
    setFinished(false);
    setCueIndex(0);
    setTimeRemaining(selectedDuration * 60);
    startedAtRef.current = null;
    activeStartedAtRef.current = null;
    activeElapsedMsRef.current = 0;
    completionHandledRef.current = false;
  };

  return (
    <div className="space-y-5" aria-label="Visualization and imagery practice">
      <section className="lux-card meditation-visual-stage p-3 sm:p-4" aria-label="Selected visualization and scene options">
        <MeditationSceneVisual sceneId={scene.id} focusLabel={scene.visualFocus[cueIndex]} isActive={isActive} />
        <div className="meditation-scene-picker">
          <div className="meditation-scene-picker__heading">
            <h3>Choose a scene</h3>
            <p>Tap to change the view above.</p>
          </div>
          <div className="meditation-scene-picker__options" role="group" aria-label="Choose a visual practice">
            {SCENES.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={sceneId === option.id}
                disabled={Boolean(startedAtRef.current && !finished)}
                onClick={() => { setSceneId(option.id); setCueIndex(0); }}
                className="meditation-scene-picker__option"
              >
                <img className="meditation-scene-picker__thumbnail" src={option.preview} alt="" loading="lazy" decoding="async" />
                <span className="meditation-scene-picker__copy">
                  <span className="meditation-scene-picker__title">{option.title}</span>
                  <span className="meditation-scene-picker__detail">{option.detail}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="lux-card space-y-3 p-4 sm:p-5" aria-label="Practice length">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">How long would feel useful?</h3>
            <p className="mt-1 text-xs text-muted-foreground">You can finish early whenever you want.</p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choose practice length">
            {DURATIONS.map((duration) => (
              <button
                key={duration}
                type="button"
                aria-pressed={selectedDuration === duration}
                disabled={Boolean(startedAtRef.current && !finished)}
                onClick={() => { setSelectedDuration(duration); setTimeRemaining(duration * 60); }}
                className="min-h-10 rounded-full border border-border px-3 text-sm text-foreground transition hover:bg-muted aria-pressed:border-amber-400 aria-pressed:bg-amber-400/10 disabled:opacity-50"
              >{duration} min</button>
            ))}
          </div>
        </div>
      </section>

      <section ref={activeGuideRef} className="lux-card scroll-mt-20 space-y-4 p-5 sm:p-7" aria-label="Guided visual pause">
        {startedAtRef.current && !finished ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{isActive ? "In progress" : "Paused"} · {scene.title} · Step {cueIndex + 1} of {scene.cues.length}</p>
                <h3 className="mt-1 text-xl font-semibold text-foreground" aria-live="polite">{cue.title}</h3>
              </div>
              <time className="shrink-0 rounded-full border border-border bg-background/60 px-3 py-2 font-mono text-sm text-foreground" aria-label={`${formatTime(timeRemaining)} remaining`}>{formatTime(timeRemaining)}</time>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-foreground sm:text-base" aria-live="polite">{cue.text}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <button type="button" onClick={() => setVoiceEnabled((enabled) => !enabled)} aria-pressed={voiceEnabled} className="min-h-10 rounded-full border border-border px-3 text-foreground hover:bg-muted">
                {voiceEnabled ? "Natural voice on" : "Voice off"}
              </button>
              <span role="status" aria-live="polite">
                {voiceStatus === "preparing" ? "Preparing spoken guide…" : voiceStatus === "playing" ? "Spoken cue playing" : voiceStatus === "ready" ? "Spoken cue complete" : voiceStatus === "unavailable" ? "Voice is unavailable; the visual guide continues." : voiceStatus === "paused" ? "Voice paused" : ""}
              </span>
              {ambientStatus === "preparing" && <span role="status" aria-live="polite">Preparing scene sound…</span>}
              {ambientStatus === "playing" && <span role="status" aria-live="polite">{AMBIENCE_LABELS[scene.id]} · matched automatically</span>}
              {ambientStatus === "unavailable" && <span role="status" aria-live="polite">Scene sound is unavailable on this device; the visual guide continues.</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
              {isActive
                ? <button type="button" onClick={pausePractice} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"><Pause size={16} />Pause</button>
                : <button type="button" onClick={resumePractice} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"><Play size={16} />Resume</button>}
              <button type="button" onClick={() => setCueIndex((index) => Math.min(index + 1, scene.cues.length - 1))} disabled={cueIndex === scene.cues.length - 1} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45">Next step<ChevronRight size={16} /></button>
              {cueIndex > 0 && <button type="button" onClick={() => setCueIndex((index) => Math.max(index - 1, 0))} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm text-foreground hover:bg-muted"><ChevronLeft size={16} />Previous</button>}
              <button type="button" onClick={finishPractice} className="ml-auto min-h-11 rounded-full px-4 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Finish now</button>
            </div>
          </>
        ) : finished ? (
          <div className="py-2 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"><Check size={22} /></span>
            <h3 className="mt-3 text-lg font-semibold text-foreground">Your pause is complete</h3>
            <p className="mt-1 text-sm text-muted-foreground">Take the next moment in whatever way works for you.</p>
            <button type="button" onClick={resetPractice} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm text-foreground hover:bg-muted"><RotateCcw size={15} />Choose another pause</button>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ready when you are</p>
              <h3 className="mt-1 text-xl font-semibold text-foreground">{scene.title}</h3>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted-foreground">A short, guided sequence. Keep your eyes open and use something real around you if that feels easier.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={startPractice} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background hover:opacity-90"><Play size={16} />Begin</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default MeditationTool;
