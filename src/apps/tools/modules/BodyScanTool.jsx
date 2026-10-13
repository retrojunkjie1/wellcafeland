// A choice-led grounding pause. The legacy body-scan route remains supported,
// but this experience does not assess, rate, or collect body sensations.

import React, { useCallback, useState } from "react";
import { Armchair, DoorOpen, Hand, Move, Pause, Play, Square, Volume2, X } from "lucide-react";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";
import ToolCharacterGuide from "@/components/tools/ToolCharacterGuide";
import { useNaturalVoice } from "@/hooks/useNaturalVoice";
import "./BodyScanTool.css";

const STEADYING_CHOICES = [
  {
    id: "support",
    title: "Let something support you",
    context: "A chair, bed, wall, or the floor",
    cue: "Let the chair, bed, wall, or floor support you for a moment. Nothing to change.",
    why: "Noticing a steady point of contact gives attention something concrete to rest on. You do not need to search inside your body or change what you feel.",
    Icon: Armchair,
  },
  {
    id: "movement",
    title: "Choose one easy movement",
    context: "A small shift, stretch, or stillness",
    cue: "Open your hands, shift position, or gently press your feet down. Staying still is okay.",
    why: "A small movement can help you notice that you have choices about how you sit or stand. Stillness is just as valid.",
    Icon: Move,
  },
  {
    id: "familiar-object",
    title: "Keep a familiar object close",
    context: "Something ordinary within reach",
    cue: "Hold something familiar or set it nearby. No need to describe it.",
    why: "A familiar object can offer a simple point of attention through touch or sight, without needing to explain anything about it.",
    Icon: Hand,
  },
  {
    id: "change-space",
    title: "Make one change to your space",
    context: "Light, sound, air, or where you are",
    cue: "If you can, adjust one thing: light, sound, air, or where you are.",
    why: "A small change in the surroundings may make the space feel more workable. You can also choose not to change anything.",
    Icon: DoorOpen,
  },
];

const BodyScanTool = ({ onComplete, onCancel, isEmbedded = false }) => {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [startTime] = useState(() => Date.now());
  const { status: voiceStatus, error: voiceError, playbackProgress, play, pause, resume, stop } = useNaturalVoice("marin");
  const isSpeaking = voiceStatus === "playing";
  const isPreparing = voiceStatus === "preparing";
  const isVoicePaused = voiceStatus === "paused";
  const isVoiceUnavailable = voiceStatus === "unavailable";
  const cueProgress = Math.max(0, Math.min(1, playbackProgress || 0));

  const playCue = (choice = STEADYING_CHOICES.find((item) => item.id === selectedChoice)) => {
    if (!choice) return;
    void play(`${choice.cue} ${choice.why}`);
  };

  const finishPractice = useCallback(() => {
    stop();
    const completedAt = Date.now();
    const result = createToolResult(
      "body_scan",
      "Steady Ground",
      "Completed an optional grounding pause.",
      { practiceType: "choice-led-grounding" },
      Math.floor((completedAt - startTime) / 1000),
    );

    // Track completion only; do not send body observations or the selected choice.
    logToolUsage("body_scan", {
      startedAt: startTime,
      completedAt,
      durationMs: completedAt - startTime,
      context: { completed: true },
    }).catch((err) => console.warn("Tool telemetry failed:", err));

    safeComplete(onComplete, result);
  }, [onComplete, startTime, stop]);

  const handleCancel = useCallback(() => {
    stop();
    safeCancel(onCancel);
  }, [onCancel, stop]);
  const selected = STEADYING_CHOICES.find((choice) => choice.id === selectedChoice);

  return (
    <div className="wc-steady-ground space-y-5">
      {!isEmbedded && onCancel && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-white">Steady Ground</h2>
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

      {(isSpeaking || isVoicePaused || isPreparing) && <ToolCharacterGuide
        mood={isSpeaking ? "encouraging" : selected ? "listening" : "present"}
        speaking={isSpeaking}
        speakingProgress={playbackProgress}
        message={isSpeaking ? "I’m here with you while you listen." : selected ? `You chose: ${selected.title.toLowerCase()}.` : "We can start with what is already around you."}
        context={isSpeaking ? "The spoken cue and visual guide are together. Nothing to get right." : selected ? selected.context : "Choose one small thing—or leave the choices alone. Nothing is rated."}
      />}
      <p className="text-sm text-white/65">Choose a small external anchor, hear an optional explanation, or skip anything that does not fit.</p>

      <div className="flex items-center gap-2" aria-label="Grounding pause progress">
        {[0, 1].map((step) => <span key={step} className={`h-1.5 flex-1 rounded-full transition-colors ${step === 0 || selected ? "bg-emerald-200/75" : "bg-white/10"}`} />)}
        <span className="ml-1 text-[10px] uppercase tracking-[.16em] text-white/50">{selected ? "Cue ready" : "Choose"}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2" aria-label="Ways to find steady ground">
        {STEADYING_CHOICES.map(({ id, title, context, cue, Icon }) => {
          const isSelected = selectedChoice === id;
          const titleId = `steady-ground-${id}-title`;
          const cueId = `steady-ground-${id}-cue`;

          return (
            <div
              key={id}
              className={`overflow-hidden rounded-2xl border transition ${
                isSelected
                  ? "border-amber-200/50 bg-amber-100/[0.06]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
              }`}
            >
              <button
                type="button"
                aria-expanded={isSelected}
                aria-controls={isSelected ? cueId : undefined}
                onClick={() => { stop(); setSelectedChoice(id); }}
                className="flex min-h-24 w-full items-start gap-3 p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-amber-300"
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
                  <div className="wc-steady-ground__cue relative mt-1 overflow-hidden rounded-2xl border p-4 sm:p-5">
                    <div className="relative flex items-start gap-4">
                      <span className={`wc-steady-ground__cue-icon grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-amber-100/20 bg-slate-950/60 text-amber-100 ${isSpeaking ? "shadow-[0_0_1.25rem_rgba(229,211,164,.16)]" : ""}`} aria-hidden="true">
                        {React.createElement(selected.Icon, { className: "h-5 w-5 stroke-[1.6]" })}
                      </span>
                      <div className="min-w-0">
                        <p className="wc-steady-ground__eyebrow text-[10px] font-semibold uppercase tracking-[.16em]">One small cue</p>
                        <p className="mt-1 text-base font-medium leading-relaxed text-white sm:text-lg">{cue}</p>
                        {isSpeaking && <div className="mt-3 h-1 max-w-48 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Spoken cue progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(cueProgress * 100)}><span className="block h-full rounded-full bg-gradient-to-r from-emerald-200 to-amber-100 transition-[width] duration-100 ease-linear" style={{ width: `${cueProgress * 100}%` }} /></div>}
                      </div>
                    </div>
                  </div>
                  <div className="wc-steady-ground__why mt-3 rounded-xl border px-4 py-3">
                    <p className="wc-steady-ground__why-label text-[10px] font-semibold uppercase tracking-[.14em]">Why you might try it</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/75">{selected.why}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => isVoicePaused ? void resume() : isSpeaking ? void pause() : playCue(selected)} disabled={isPreparing} className="wc-steady-ground__voice-button inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
                      {isPreparing ? <Volume2 aria-hidden="true" className="h-4 w-4 animate-pulse" /> : isSpeaking ? <Pause aria-hidden="true" className="h-4 w-4" /> : isVoicePaused ? <Play aria-hidden="true" className="h-4 w-4" /> : <Volume2 aria-hidden="true" className="h-4 w-4" />}
                      {isPreparing ? "Preparing voice…" : isSpeaking ? "Pause cue" : isVoicePaused ? "Resume cue" : voiceStatus === "finished" ? "Hear cue again" : "Hear this cue"}
                    </button>
                    {(isSpeaking || isVoicePaused || isPreparing) && <button type="button" onClick={stop} className="wc-steady-ground__stop-button inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"><Square aria-hidden="true" className="h-3.5 w-3.5" /> Stop voice</button>}
                  </div>
                  <p role={isVoiceUnavailable ? "alert" : "status"} aria-live="polite" className={`mt-2 min-h-5 text-xs ${isVoiceUnavailable ? "text-amber-100/80" : "text-white/50"}`}>
                    {isVoiceUnavailable ? voiceError || "Voice is unavailable right now. The written cue is still here." : isPreparing ? "Preparing the natural voice…" : isSpeaking ? "Spoken cue is playing." : isVoicePaused ? "Spoken cue paused." : "Audio starts only when you tap. You can use the written cue instead."}
                  </p>
                  <button
                    type="button"
                    onClick={finishPractice}
                    className="mt-3 min-h-11 rounded-full bg-amber-200 px-5 text-sm font-medium text-slate-950 transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Done for now
                  </button>
                </section>
              )}
            </div>
          );
        })}
      </div>

      {onCancel && (
        <button
          type="button"
          onClick={handleCancel}
          className="min-h-11 rounded-lg px-3 text-sm text-white/60 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
        >
          Leave practice
        </button>
      )}
    </div>
  );
};

export default BodyScanTool;
