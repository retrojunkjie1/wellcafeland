// Choice-led, practical support for moments when an urge or craving feels strong.
// The selected action is kept in component state only; completion logs no reflection or ratings.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Hand, HeartHandshake, MapPin, Pause, Play, RotateCcw, Volume2, X } from "lucide-react";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";
import ToolCharacterGuide from "@/components/tools/ToolCharacterGuide";
import { useNaturalVoice } from "@/hooks/useNaturalVoice";
import { runWellnessExperience } from "@/ai/experience/experienceEngine";
import UrgeActionVisual from "./UrgeActionVisual";

const PAUSE_LENGTH_SECONDS = 180;
const REFLECTION_PROMPTS = [
  { id: "short-term", label: "When I do it · benefits", hint: "What it gives me, now or later", options: ["Relief", "Comfort", "Escape", "Connection", "Numbness", "Energy"], tone: "amber" },
  { id: "later-cost", label: "When I do it · costs", hint: "What it may take from me, now or later", options: ["Sleep", "Time", "Trust", "Health", "Money", "Confidence"], tone: "rose" },
  { id: "change-benefit", label: "When I don’t · benefits", hint: "What a different choice could make possible", options: ["More choice", "Clarity", "Connection", "Self-trust", "Rest", "A fresh start"], tone: "emerald" },
  { id: "change-hard", label: "When I don’t · costs", hint: "What could feel difficult about changing", options: ["Discomfort", "Being alone", "Uncertainty", "A familiar routine", "Access", "Nothing fits yet"], tone: "sky" },
];

const PERSONAL_VALUES = [
  { label: "Health", icon: "✳", detail: "energy and care" },
  { label: "Connection", icon: "◌", detail: "people and belonging" },
  { label: "Family", icon: "⌂", detail: "the relationships I choose" },
  { label: "Stability", icon: "▤", detail: "a steadier day" },
  { label: "Freedom", icon: "↗", detail: "more room to choose" },
  { label: "Creativity", icon: "✧", detail: "making and exploring" },
  { label: "Rest", icon: "☾", detail: "space to recover" },
  { label: "Growth", icon: "↑", detail: "learning as I go" },
];

const REFLECTION_STEPS = [
  { title: "See the whole choice", prompt: "Choose any words that fit. This is a look at the moment, not a test.", voice: "Only if it feels useful, take a moment to look at the whole choice. What might it give you right now? What might it cost later? What could another choice make possible, and what might feel hard? Choose any words that fit. There is no score and no right answer." },
  { title: "Name what matters", prompt: "Pick something you want more room for. Your values can be different from anyone else’s.", voice: "Now, what would you like more room for in your life? Choose something that feels like yours. It can be connection, health, rest, freedom, or something else. You can also leave this step blank." },
  { title: "Choose one small move", prompt: "Choose a next step that feels possible. You can change it or stop at any time.", voice: "Choose one small move that feels possible in the next few minutes. It does not need to fix the whole situation. You can change your mind, ask someone for support, or stop here." },
];

const SUPPORT_MOVES = [
  {
    id: "create-distance",
    title: "Create a little distance",
    context: "Change rooms or move a trigger farther away",
    visualPrompt: "Step into another room, if that feels safe.",
    cue: "If it is safe, change what is within reach: step into another room, move near other people, or ask someone to hold onto the item for now.",
    purpose: "Changing the setting can interrupt a familiar routine and create room for another choice.",
    Icon: MapPin,
  },
  {
    id: "reach-someone",
    title: "Reach someone safe",
    context: "A trusted person, peer, sponsor, or group",
    visualPrompt: "Ask someone to stay with you for a few minutes.",
    cue: "You can keep it simple: “Could you stay with me or talk for a few minutes? I could use company.” Choose someone who feels safe to contact.",
    purpose: "Company can offer connection and practical support while you decide what would help next.",
    Icon: HeartHandshake,
  },
  {
    id: "hands-busy",
    title: "Start a familiar task",
    context: "Something simple that is nearby",
    visualPrompt: "Choose one ordinary thing you can start now.",
    cue: "Choose something ordinary you can start now: make a drink, take a shower, put on a familiar song, or sort a few things nearby. It does not have to fix the feeling.",
    purpose: "A small task gives attention somewhere concrete to go without asking you to solve everything.",
    Icon: Hand,
  },
  {
    id: "basic-need",
    title: "Meet one basic need",
    context: "Food, water, rest, or prescribed medication",
    visualPrompt: "Pick one small need to take care of first.",
    cue: "If you have not eaten or had water, start there. If a medication is part of your care, use it as prescribed. One small need is enough for now.",
    purpose: "Responding to one unmet basic need may make it easier to care for yourself in this moment.",
    Icon: HeartHandshake,
  },
];

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const UrgeSurfingTool = ({ onComplete, onCancel, isEmbedded = false }) => {
  const [selectedMove, setSelectedMove] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(PAUSE_LENGTH_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasStartedPause, setHasStartedPause] = useState(false);
  const [reflection, setReflection] = useState({ open: false, step: 0, behavior: "", selections: {}, values: [], nextMove: "" });
  const [compassState, setCompassState] = useState({ loading: false, error: "", result: null });
  const [guideMessage, setGuideMessage] = useState("");
  const { status: voiceStatus, error: voiceError, playbackProgress, play, pause, resume, stop } = useNaturalVoice("marin");
  const [startTime] = useState(() => Date.now());
  const secondsLeftRef = useRef(PAUSE_LENGTH_SECONDS);
  const currentMove = SUPPORT_MOVES.find((move) => move.id === selectedMove);
  const voiceProgress = Math.max(0, Math.min(1, playbackProgress || 0));
  const showVoiceGuide = voiceStatus === "playing" || voiceStatus === "paused" || voiceStatus === "preparing";

  useEffect(() => {
    if (!isTimerRunning) return undefined;

    const timer = window.setInterval(() => {
      const remaining = Math.max(0, secondsLeftRef.current - 1);
      secondsLeftRef.current = remaining;
      setSecondsLeft(remaining);
      if (remaining === 0) setIsTimerRunning(false);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isTimerRunning]);

  const playGuideText = useCallback(async (message) => {
    setGuideMessage(message);
    return play(message);
  }, [play]);

  const playGuidance = useCallback(async (move = currentMove) => {
    if (!move) return;
    // Lead with one concrete, usable invitation; add its context after it.
    await playGuideText(`${move.cue} ${move.purpose}`);
  }, [currentMove, playGuideText]);

  const askCompass = useCallback(async () => {
    if (!reflection.values.length || !reflection.nextMove || compassState.loading) return;
    setCompassState({ loading: true, error: "", result: null });
    try {
      const { result: response } = await runWellnessExperience("recovery.values-choice", {
        values: reflection.values.slice(0, 3),
        selectedMove: reflection.nextMove,
      });
      setCompassState({ loading: false, error: "", result: {
        summary: response.summary,
        value: response.value,
        choice: response.choice,
        nextStep: response.nextStep,
      } });
    } catch (error) {
      setCompassState({
        loading: false,
        result: null,
        error: error?.code === "AGENT_PAUSED"
          ? "Compass is paused right now. Your selected move is still here whenever you want it."
          : "Compass couldn’t prepare a suggestion right now. Your selections stay on this screen; you can still use the move you chose.",
      });
    }
  }, [compassState.loading, reflection.nextMove, reflection.values]);

  const finishPractice = useCallback(() => {
    const completedAt = Date.now();
    const durationSeconds = Math.floor((completedAt - startTime) / 1000);
    const result = createToolResult(
      "urge_surfing",
      "Urge Support",
      "Completed an optional practical support pause.",
      { practiceType: "choice-led-urge-support" },
      durationSeconds,
    );

    // Record completion only; never record the user's chosen move or personal details.
    logToolUsage("urge_surfing", {
      startedAt: startTime,
      completedAt,
      durationMs: completedAt - startTime,
      context: { completed: true },
    }).catch((error) => console.warn("Tool telemetry failed:", error));

    setIsTimerRunning(false);
    stop();
    safeComplete(onComplete, result);
  }, [onComplete, startTime, stop]);

  const handleCancel = useCallback(() => {
    setIsTimerRunning(false);
    stop();
    safeCancel(onCancel);
  }, [onCancel, stop]);

  const startPause = () => {
    secondsLeftRef.current = PAUSE_LENGTH_SECONDS;
    setSecondsLeft(PAUSE_LENGTH_SECONDS);
    setHasStartedPause(true);
    setIsTimerRunning(true);
    void playGuidance();
  };

  const togglePause = () => {
    const nextRunning = !isTimerRunning;
    setIsTimerRunning(nextRunning);
    if (!nextRunning && voiceStatus === "playing") void pause();
    if (!nextRunning && voiceStatus === "preparing") stop();
    if (nextRunning && voiceStatus === "paused") void resume();
  };

  return (
    <div className="space-y-5">
      {!isEmbedded && onCancel && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-white">Urge Support</h2>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Close practice"
            className="min-h-11 min-w-11 rounded-full p-2 text-white/70 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
          >
            <X aria-hidden="true" className="mx-auto h-4 w-4" />
          </button>
        </div>
      )}

      {showVoiceGuide && <ToolCharacterGuide
        mood={voiceStatus === "playing" ? "encouraging" : "listening"}
        speaking={voiceStatus === "playing"}
        speakingProgress={playbackProgress}
        message={guideMessage}
        context="The spoken cue follows the selected action. Stop whenever you want."
      />}
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-950/30 via-slate-900/70 to-slate-950/70 p-4 sm:p-5" aria-labelledby="urge-support-intro">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100/70">A pause with choices</p>
        <h3 id="urge-support-intro" className="mt-1 text-base font-semibold text-white">You don’t have to solve everything right now.</h3>
        <p className="mt-1 text-sm leading-relaxed text-white/65">Choose one small, safe next step. This guide offers options; it does not measure or predict how an urge will change.</p>
      </section>

      <div className="grid grid-cols-3 gap-2" aria-label="Urge support steps">
        {["Choose a move", "Make a little space", "Check what helps"].map((step, index) => (
          <div key={step} className={`rounded-xl border p-2.5 ${index === (hasStartedPause ? 1 : 0) ? "border-amber-100/25 bg-amber-100/[0.07]" : "border-white/10 bg-white/[0.025]"}`}>
            <span className={`grid h-6 w-6 place-items-center rounded-full border text-[10px] ${index === (hasStartedPause ? 1 : 0) ? "border-amber-100/35 text-amber-100" : "border-white/15 text-white/45"}`}>{String(index + 1).padStart(2, "0")}</span>
            <span className="mt-2 block text-[10px] leading-tight text-white/70 sm:text-xs">{step}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2" aria-label="Ways to support yourself through an urge">
        {SUPPORT_MOVES.map(({ id, title, context, cue, Icon }) => {
          const isSelected = selectedMove === id;
          const titleId = `urge-support-${id}-title`;
          const cueId = `urge-support-${id}-cue`;

          return (
            <div
              key={id}
              className={`overflow-hidden rounded-2xl border transition ${
                isSelected
                  ? "sm:col-span-2 border-amber-200/50 bg-amber-100/[0.06]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
              }`}
            >
              <button
                type="button"
                aria-expanded={isSelected}
                aria-controls={isSelected ? cueId : undefined}
                onClick={() => {
                  setSelectedMove(id);
                  setIsTimerRunning(false);
                  stop();
                  setHasStartedPause(false);
                  secondsLeftRef.current = PAUSE_LENGTH_SECONDS;
                  setSecondsLeft(PAUSE_LENGTH_SECONDS);
                }}
                className="flex min-h-24 w-full items-start gap-3 p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-amber-200" aria-hidden="true">
                  {React.createElement(Icon, { className: "h-5 w-5" })}
                </span>
                <span className="min-w-0">
                  <span id={titleId} className="block text-sm font-medium text-white">{title}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-white/60">{context}</span>
                </span>
              </button>

              {isSelected && (
                <section
                  id={cueId}
                  role="region"
                  aria-labelledby={titleId}
                  aria-live="polite"
                  aria-atomic="true"
                  className="border-t border-amber-200/15 px-4 pb-4 pt-3 sm:px-5"
                >
                  <UrgeActionVisual move={currentMove} progress={voiceProgress} status={voiceStatus} />

                  <details className="group rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5">
                    <summary className="min-h-8 cursor-pointer text-xs font-medium text-emerald-50/85 marker:text-emerald-100/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">More guidance and why it may help</summary>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">{cue}</p>
                    <p className="mt-2 border-t border-white/10 pt-2 text-xs leading-relaxed text-white/60">{currentMove?.purpose}</p>
                  </details>

                  {hasStartedPause ? (
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/15 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs leading-relaxed text-white/60">This timer marks time for a pause; it does not predict how an urge will change.</p>
                        <span className="flex h-6 items-center gap-1 opacity-35" aria-hidden="true">
                          {[0, 1, 2, 3].map((bar) => <i key={bar} className={`block w-1 rounded-full bg-emerald-200 ${voiceStatus === "playing" ? "animate-pulse opacity-100" : "opacity-50"}`} style={{ height: `${8 + (bar % 2) * 7}px`, animationDelay: `${bar * 120}ms` }} />)}
                        </span>
                      </div>
                      <p className="sr-only" role="status" aria-live="polite">{voiceStatus === "preparing" ? "Preparing spoken guidance" : voiceStatus === "playing" ? "Spoken guidance is playing" : voiceStatus === "paused" ? "Spoken guidance is paused" : voiceStatus === "unavailable" ? "Spoken guidance is unavailable. The written cue remains available." : ""}</p>
                      {voiceStatus === "unavailable" && <p role="alert" className="mt-2 text-xs text-amber-100/80">{voiceError || "Voice is unavailable right now. The visual guide and written cue are still here."}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => void playGuidance()} disabled={voiceStatus === "preparing" || voiceStatus === "playing"} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-100/20 px-3.5 text-xs text-emerald-50/90 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
                          <Volume2 aria-hidden="true" className="h-4 w-4" /> {voiceStatus === "preparing" ? "Preparing voice…" : voiceStatus === "playing" ? "Speaking…" : voiceStatus === "paused" ? "Voice paused" : "Replay spoken guide"}
                        </button>
                        {voiceStatus === "playing" && <button type="button" onClick={() => void pause()} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-3.5 text-xs text-white/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"><Pause aria-hidden="true" className="h-4 w-4" /> Pause voice</button>}
                        {voiceStatus === "paused" && <button type="button" onClick={() => void resume()} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-3.5 text-xs text-white/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"><Play aria-hidden="true" className="h-4 w-4" /> Resume voice</button>}
                        {(voiceStatus === "playing" || voiceStatus === "paused" || voiceStatus === "preparing") && <button type="button" onClick={stop} className="min-h-10 rounded-full border border-white/15 px-3.5 text-xs text-white/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">Stop voice</button>}
                      </div>
                      <div className="mx-auto mt-3 grid h-36 w-36 place-items-center rounded-full p-2" style={{ background: `conic-gradient(#e7d49d ${((PAUSE_LENGTH_SECONDS - secondsLeft) / PAUSE_LENGTH_SECONDS) * 100}%, rgba(255,255,255,.12) 0)` }}>
                        <div className="grid h-full w-full place-items-center rounded-full border border-white/10 bg-[#111923]">
                          <p className="text-4xl font-light tabular-nums text-white" role="timer" aria-label={`${formatTime(secondsLeft)} remaining`}>{formatTime(secondsLeft)}</p>
                        </div>
                      </div>
                      {secondsLeft === 0 && <p className="mt-2 text-center text-sm text-emerald-100">Your pause is finished. You can stop here or take another step.</p>}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {secondsLeft > 0 && (
                          <button
                            type="button"
                            onClick={togglePause}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
                          >
                            {isTimerRunning ? <><Pause aria-hidden="true" className="h-4 w-4" /> Pause</> : <><Play aria-hidden="true" className="h-4 w-4" /> Resume</>}
                          </button>
                        )}
                        {secondsLeft === 0 && (
                          <button
                            type="button"
                            onClick={startPause}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
                          >
                            <RotateCcw aria-hidden="true" className="h-4 w-4" /> Start another pause
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={finishPractice}
                          className="min-h-11 rounded-full bg-amber-200 px-5 text-sm font-medium text-slate-950 transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                          Done for now
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={startPause}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-200 px-5 text-sm font-medium text-slate-950 transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        <Play aria-hidden="true" className="h-4 w-4" /> Take a 3-minute pause
                      </button>
                      <button
                        type="button"
                        onClick={finishPractice}
                        className="min-h-11 rounded-full border border-white/15 px-4 text-sm text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
                      >
                        Done for now
                      </button>
                    </div>
                  )}
                </section>
              )}
            </div>
          );
        })}
      </div>

      <a
        href="/assistance"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-white/65 underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
      >
        Find real-world support <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
      </a>

      <details
        className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/75 via-[#111923] to-emerald-950/20"
        open={reflection.open}
        onToggle={(event) => {
          const open = event.currentTarget.open;
          setReflection((current) => current.open === open ? current : { ...current, open });
        }}
      >
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 sm:px-5 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-[.17em] text-emerald-100/65">When you have a little more space</span>
            <span className="mt-1 block text-sm font-medium text-white/90">Explore the pattern and choose what matters next</span>
          </span>
          <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-lg text-amber-100/80">{reflection.open ? "−" : "+"}</span>
        </summary>

        <div className="border-t border-white/[.08] p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-amber-100/65">A guided reflection · {reflection.step + 1} of {REFLECTION_STEPS.length}</p>
              <h3 className="mt-1 text-base font-semibold text-white">{REFLECTION_STEPS[reflection.step].title}</h3>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/60">{REFLECTION_STEPS[reflection.step].prompt}</p>
            </div>
            <button
              type="button"
              onClick={() => void playGuideText(REFLECTION_STEPS[reflection.step].voice)}
              disabled={voiceStatus === "preparing" || voiceStatus === "playing"}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-100/20 px-3.5 text-xs text-emerald-50/90 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
            >
              <Volume2 aria-hidden="true" className="h-4 w-4" /> Hear the reflection prompt
            </button>
          </div>

          <div className="mt-4 flex items-center gap-1.5" aria-label="Reflection progress">
            {REFLECTION_STEPS.map((item, index) => <span key={item.title} className={`h-1.5 flex-1 rounded-full transition-colors ${index <= reflection.step ? "bg-amber-200/80" : "bg-white/10"}`} />)}
          </div>

          {reflection.step === 0 && (
            <div className="mt-4">
              <section className="mb-3 rounded-xl border border-amber-100/15 bg-amber-100/[.035] p-3.5" aria-labelledby="urge-cba-heading">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 id="urge-cba-heading" className="text-xs font-semibold text-amber-50/90">A SMART-inspired cost-benefit reflection</h4>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] text-white/50">Private · not saved</span>
                </div>
                <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-white/60">Look at both sides of the choice: what happens when you do it, and what happens when you don’t. You do not need to decide anything today.</p>
                <label htmlFor="urge-cba-behavior" className="mt-3 block text-[10px] font-medium text-white/70">What behavior are you weighing? <span className="font-normal text-white/45">(optional)</span></label>
                <input
                  id="urge-cba-behavior"
                  type="text"
                  maxLength={100}
                  value={reflection.behavior}
                  onChange={(event) => setReflection((current) => ({ ...current, behavior: event.target.value }))}
                  placeholder="Name it in a few words"
                  className="mt-1.5 min-h-10 w-full rounded-lg border border-white/10 bg-slate-950/50 px-3 text-xs text-white placeholder:text-white/35 focus:border-amber-100/40 focus:outline-none focus:ring-2 focus:ring-amber-100/15"
                />
              </section>
              <div className="grid gap-2 sm:grid-cols-2" aria-label="A balanced look at this choice">
              {REFLECTION_PROMPTS.map((prompt, index) => {
                const selectedItems = reflection.selections[prompt.id] || [];
                const palette = {
                  amber: "border-amber-200/25 bg-gradient-to-br from-amber-100/[.08] to-amber-100/[.02]",
                  rose: "border-rose-200/20 bg-gradient-to-br from-rose-100/[.065] to-rose-100/[.015]",
                  emerald: "border-emerald-200/25 bg-gradient-to-br from-emerald-100/[.08] to-emerald-100/[.02]",
                  sky: "border-sky-200/20 bg-gradient-to-br from-sky-100/[.065] to-sky-100/[.015]",
                }[prompt.tone];
                return (
                  <section key={prompt.id} className={`relative overflow-hidden rounded-xl border p-3.5 ${palette}`}>
                    <span className="flex items-center gap-2 text-xs font-medium text-white/90">
                      <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-black/10 text-[10px] tabular-nums text-white/65">0{index + 1}</span>
                      {prompt.label}
                    </span>
                    <span className="mt-1.5 block text-[10px] text-white/45">{prompt.hint}</span>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {prompt.options.map((option) => {
                        const selected = selectedItems.includes(option);
                        return <button key={option} type="button" aria-pressed={selected} onClick={() => setReflection((current) => {
                          const previous = current.selections[prompt.id] || [];
                          return { ...current, selections: { ...current.selections, [prompt.id]: selected ? previous.filter((item) => item !== option) : [...previous, option] } };
                        })} className={`min-h-8 rounded-full border px-2.5 text-[10px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${selected ? "border-white/55 bg-white/15 text-white" : "border-white/10 bg-black/[.12] text-white/65 hover:border-white/25 hover:text-white"}`}>
                          {selected && <span aria-hidden="true" className="mr-1 text-emerald-100">✓</span>}{option}
                        </button>;
                      })}
                    </div>
                  </section>
                );
              })}
              </div>
            </div>
          )}

          {reflection.step === 1 && (
            <section className="mt-4 rounded-2xl border border-[#d8c89c]/20 bg-[radial-gradient(ellipse_at_top,rgba(216,200,156,.11),transparent_65%),linear-gradient(145deg,rgba(17,25,35,.96),rgba(7,14,18,.94))] p-4 sm:p-5" aria-labelledby="urge-values-heading">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div>
                  <p className="text-[10px] uppercase tracking-[.17em] text-amber-100/65">Your compass</p>
                  <h4 id="urge-values-heading" className="mt-1 text-sm font-medium text-white">What would you like more room for?</h4>
                  <p className="mt-1 text-[11px] text-white/50">Pick what feels like yours. You can leave everything unselected.</p>
                </div>
                <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full border border-amber-100/20 bg-[radial-gradient(circle,rgba(216,200,156,.15),transparent_68%)] sm:mx-0" aria-hidden="true">
                  <span className="absolute inset-2 rounded-full border border-dashed border-white/10" />
                  <span className="absolute h-px w-16 rotate-45 bg-amber-100/35" />
                  <span className="absolute h-px w-16 -rotate-45 bg-amber-100/35" />
                  <span className="relative grid h-9 w-9 place-items-center rounded-full border border-amber-100/25 bg-[#121a20] text-base text-amber-100">✦</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PERSONAL_VALUES.map(({ label, icon, detail }) => {
                  const selected = reflection.values.includes(label);
                  return <button key={label} type="button" aria-pressed={selected} disabled={!selected && reflection.values.length >= 3} onClick={() => {
                    setCompassState({ loading: false, error: "", result: null });
                    setReflection((current) => ({ ...current, values: selected ? current.values.filter((item) => item !== label) : current.values.length < 3 ? [...current.values, label] : current.values }));
                  }} className={`min-h-[4.5rem] rounded-xl border p-2.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 disabled:cursor-not-allowed disabled:opacity-45 ${selected ? "border-amber-100/55 bg-amber-100/[.1]" : "border-white/10 bg-white/[.025] hover:border-white/25"}`}>
                    <span className={`grid h-6 w-6 place-items-center rounded-lg text-sm ${selected ? "bg-amber-100/15 text-amber-100" : "bg-white/[.06] text-white/60"}`} aria-hidden="true">{icon}</span>
                    <span className="mt-2 block text-[11px] font-medium text-white/90">{label}</span>
                    <span className="mt-0.5 block text-[9px] text-white/45">{detail}</span>
                  </button>;
                })}
              </div>
              {reflection.values.length > 0 && <p className="mt-3 text-[11px] text-emerald-100/80">Your compass: {reflection.values.join(" · ")}</p>}
            </section>
          )}

          {reflection.step === 2 && (
            <section className="mt-4 rounded-2xl border border-emerald-100/20 bg-[radial-gradient(ellipse_at_top_left,rgba(167,196,174,.1),transparent_52%),linear-gradient(145deg,rgba(17,25,35,.97),rgba(7,14,18,.94))] p-4 sm:p-5" aria-labelledby="urge-next-step-heading">
              <p className="text-[10px] uppercase tracking-[.17em] text-emerald-100/65">One move, chosen by you</p>
              <h4 id="urge-next-step-heading" className="mt-1 text-sm font-medium text-white">What feels possible in the next few minutes?</h4>
              <p className="mt-1 text-[11px] text-white/50">{reflection.values.length ? `You said ${reflection.values.join(" and ")} matter. Choose a move that feels supportive.` : "Choose a move that feels supportive, or skip this step."}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {SUPPORT_MOVES.map(({ id, title, context, Icon: _Icon }) => {
                  const selected = reflection.nextMove === id;
                  return <button key={id} type="button" aria-pressed={selected} onClick={() => {
                    setCompassState({ loading: false, error: "", result: null });
                    setReflection((current) => ({ ...current, nextMove: selected ? "" : id }));
                  }} className={`flex min-h-[4.5rem] items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${selected ? "border-amber-100/50 bg-amber-100/[.08]" : "border-white/10 bg-white/[.025] hover:border-white/25"}`}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[.06] text-amber-100"><_Icon aria-hidden="true" className="h-4 w-4" /></span>
                    <span><span className="block text-xs font-medium text-white/90">{title}</span><span className="mt-1 block text-[10px] text-white/50">{context}</span></span>
                    {selected && <span className="ml-auto text-emerald-100" aria-hidden="true">✓</span>}
                  </button>;
                })}
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-white/40">Nothing here is saved. You can change your mind, choose another move, or leave.</p>
              {reflection.nextMove && reflection.values.length > 0 && (
                <div className="mt-4 rounded-xl border border-amber-100/15 bg-black/15 p-3.5" aria-live="polite">
                  <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-amber-100/65">Optional · Compass</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/55">Get one suggestion connecting the value and move you selected. Only those selections are sent; your written reflection stays here.</p>
                  <button type="button" onClick={() => void askCompass()} disabled={compassState.loading} className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-amber-100/30 bg-amber-100/[.08] px-4 text-xs font-medium text-amber-50 transition hover:bg-amber-100/[.13] disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
                    {compassState.loading ? "Preparing your suggestion…" : compassState.result ? "Refresh suggestion" : "Ask Compass for a suggestion"}
                  </button>
                  {compassState.error && <p role="status" className="mt-3 text-xs leading-relaxed text-rose-100/80">{compassState.error}</p>}
                  {compassState.result && <div className="mt-3 rounded-lg border border-emerald-100/15 bg-emerald-100/[.045] p-3">
                    <p className="text-xs leading-relaxed text-white/75">{compassState.result.summary}</p>
                    <p className="mt-2 text-xs font-medium text-emerald-50">{compassState.result.choice}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-white/60">{compassState.result.nextStep}</p>
                    <p className="mt-2 text-[10px] text-white/40">A suggestion, not a rule. Keep it, change it, or leave it.</p>
                  </div>}
                </div>
              )}
              {reflection.nextMove && <button type="button" onClick={() => {
                const move = SUPPORT_MOVES.find((item) => item.id === reflection.nextMove);
                if (!move) return;
                setSelectedMove(move.id);
                setHasStartedPause(false);
                setIsTimerRunning(false);
                setSecondsLeft(PAUSE_LENGTH_SECONDS);
                secondsLeftRef.current = PAUSE_LENGTH_SECONDS;
                setReflection((current) => ({ ...current, open: false }));
                void playGuidance(move);
              }} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-200 px-5 text-xs font-medium text-slate-950 transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                Use this move <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </button>}
            </section>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <button type="button" disabled={reflection.step === 0} onClick={() => setReflection((current) => ({ ...current, step: Math.max(0, current.step - 1) }))} className="min-h-10 rounded-full border border-white/10 px-4 text-xs text-white/65 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">Previous</button>
            {reflection.step < REFLECTION_STEPS.length - 1 ? <button type="button" onClick={() => setReflection((current) => ({ ...current, step: Math.min(REFLECTION_STEPS.length - 1, current.step + 1) }))} className="min-h-10 rounded-full border border-amber-100/35 bg-amber-100/[.07] px-4 text-xs text-amber-50 transition hover:bg-amber-100/[.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">Continue</button> : <button type="button" onClick={() => setReflection((current) => ({ ...current, open: false }))} className="min-h-10 rounded-full border border-white/10 px-4 text-xs text-white/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">Close reflection</button>}
          </div>
        </div>
      </details>

      {onCancel && (
        <button
          type="button"
          onClick={handleCancel}
          className="block min-h-11 rounded-lg px-3 text-sm text-white/60 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
        >
          Leave practice
        </button>
      )}
    </div>
  );
};

export default UrgeSurfingTool;
