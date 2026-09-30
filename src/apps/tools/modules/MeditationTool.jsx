import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { logToolUsage } from "../../../services/toolTelemetry";
import { trackAction } from "../../../services/telemetry";
import { createToolResult, safeComplete } from "@/utils/toolContract";

const DURATIONS = [3, 5, 10, 15, 20];

// These are finished, locally available practices. They do not call an AI
// provider, depend on audio, or ask the person to focus on their body.
const SCENES = [
  {
    id: "wide-sky",
    title: "A wide sky",
    detail: "Room to let your attention move",
    cues: [
      { title: "Choose your view", text: "Imagine a wide sky, or look at one in a photo or through a window. You can keep your eyes open and use the real view instead." },
      { title: "Find one detail", text: "Notice one part of the scene: a cloud edge, a change in color, or the line where sky meets land. There is nothing to get right." },
      { title: "Let the view be wide", text: "Allow the scene to stay in the background while your attention rests on that one detail. If the image does not come easily, simply look at something blue or far away." },
      { title: "Come back when ready", text: "Let the picture fade or look around the room. Take the next moment at your own pace. You may finish here or stay a little longer." },
    ],
  },
  {
    id: "rain-window",
    title: "Rain on a window",
    detail: "A quiet scene with small details",
    cues: [
      { title: "Set the scene", text: "Picture rain on a window, or watch a real window or image. You can change the scene or stop whenever you like." },
      { title: "Choose one small detail", text: "Perhaps there is a droplet, a reflection, or a soft blur beyond the glass. Choose only what feels comfortable to imagine." },
      { title: "Stay with the ordinary", text: "Let the scene continue without needing to interpret it. If your mind moves elsewhere, that is okay; return only if you want to." },
      { title: "Leave the scene gently", text: "Notice the room you are in, or the screen in front of you. Nothing needs to change for this pause to count." },
    ],
  },
  {
    id: "familiar-place",
    title: "A familiar place",
    detail: "An ordinary place you choose",
    cues: [
      { title: "Pick a place—or skip it", text: "Choose an ordinary place you know, such as a library, kitchen, garden, or street. It does not have to feel safe or special. You can choose a neutral imagined landscape instead." },
      { title: "Choose one feature", text: "Bring to mind one color, object, or line in the place. Keep the picture simple; a partial image is enough." },
      { title: "Let the place stay yours", text: "You decide what belongs in the scene and how close or far away it feels. Change it, replace it, or return to the room whenever you want." },
      { title: "Close or continue", text: "Let the image settle in the background. You can finish now, keep the scene for a little longer, or choose another practice." },
    ],
  },
  {
    id: "color-and-light",
    title: "Color and light",
    detail: "A visual focus without a whole scene",
    cues: [
      { title: "Choose a color", text: "Look for one color nearby or imagine a color you like. If choosing feels like too much, let any color be enough." },
      { title: "Notice its edges", text: "Follow where that color begins and ends. You can look at a real object; no visualization is required." },
      { title: "Let your eyes wander", text: "Move your gaze to another detail when you want. There is no target to reach and no need to stay focused." },
      { title: "Return to your next moment", text: "When you are ready, let your eyes rest wherever they choose. Keep going with your day or end the practice here." },
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
  const startedAtRef = useRef(null);
  const activeStartedAtRef = useRef(null);
  const activeElapsedMsRef = useRef(0);
  const intervalRef = useRef(null);
  const completionHandledRef = useRef(false);
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
    if (isActive && timeRemaining === 0) finishPractice();
    // The timer reaching zero is the only automatic completion trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeRemaining]);

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  const startPractice = () => {
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
      <section className="lux-card space-y-3 p-4 sm:p-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Choose a visual pause</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Use an imagined scene, a real view, or just read. No special focus or experience is needed. Change direction or stop at any time.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Choose a visual practice">
          {SCENES.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={sceneId === option.id}
              disabled={Boolean(startedAtRef.current && !finished)}
              onClick={() => { setSceneId(option.id); setCueIndex(0); }}
              className="min-h-16 rounded-2xl border border-border bg-background/50 px-4 py-3 text-left transition hover:border-amber-400/60 aria-pressed:border-amber-400 aria-pressed:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="block text-sm font-semibold text-foreground">{option.title}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{option.detail}</span>
            </button>
          ))}
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

      <section className="lux-card space-y-4 p-5 sm:p-7" aria-label="Guided visual pause">
        {startedAtRef.current && !finished ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{isActive ? "In progress" : "Paused"} · {scene.title} · Step {cueIndex + 1} of {scene.cues.length}</p>
                <h3 className="mt-1 text-xl font-semibold text-foreground" aria-live="polite">{cue.title}</h3>
              </div>
              <time className="shrink-0 rounded-full border border-border bg-background/60 px-3 py-2 font-mono text-sm text-foreground" aria-label={`${formatTime(timeRemaining)} remaining`}>{formatTime(timeRemaining)}</time>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-foreground sm:text-lg" aria-live="polite">{cue.text}</p>
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
