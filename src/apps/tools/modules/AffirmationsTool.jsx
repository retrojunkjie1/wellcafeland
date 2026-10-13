// src/apps/tools/modules/AffirmationsTool.jsx

import React, { useState } from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { callAgent } from "../../../agents/aiAgents";
import { logToolUsage } from "../../../services/toolTelemetry";
import { trackAction } from "../../../services/telemetry";
import ToolCharacterGuide from "@/components/tools/ToolCharacterGuide";
import { useNaturalVoice } from "@/hooks/useNaturalVoice";

const CONCERN_TYPES = [
  { id: "anxiety", label: "Anxiety" },
  { id: "cravings", label: "Cravings" },
  { id: "shame", label: "Shame" },
  { id: "sleep", label: "Sleep" },
  { id: "grief", label: "Grief" },
  { id: "self-worth", label: "Self-Worth" },
];

const STARTER_PHRASES = {
  anxiety: [
    "I can take this one moment at a time.",
    "I can notice what is here without solving everything right now.",
    "A slow pause is available to me, even if the feeling stays.",
    "I can choose one small next step and leave the rest for later.",
  ],
  cravings: [
    "An urge can be strong and still change with time.",
    "I can pause before deciding what to do next.",
    "I can reach out to someone who supports my recovery.",
    "For this moment, I only need to choose my next safe step.",
  ],
  shame: [
    "What I feel right now does not define all of who I am.",
    "I can take responsibility without using cruelty toward myself.",
    "I am allowed to ask for support while I work through this.",
    "One difficult moment does not erase the effort I have made.",
  ],
  sleep: [
    "I can let rest be an invitation, not a task to get perfect.",
    "I do not have to solve tomorrow while I am lying here.",
    "Even quiet rest gives me a moment to pause.",
    "I can return gently to the next breath or comfortable sensation.",
  ],
  grief: [
    "I can make room for this feeling one moment at a time.",
    "There is no single right way to move through grief.",
    "I can honor what matters to me and still care for myself today.",
    "I do not have to carry this alone; I can reach toward support.",
  ],
  "self-worth": [
    "My worth is not measured by how productive I am today.",
    "I can speak to myself with the patience I would offer someone I care about.",
    "I am still learning, and I do not need to be finished to deserve care.",
    "I can notice one thing I handled, however small.",
  ],
};

const friendlyGenerationError = (error) => {
  if (error?.code === "AUTH_REQUIRED") return "Your session needs to reconnect. Refresh the page and try again.";
  if (error?.code === "RATE_LIMITED") return `The phrase service is busy. Please wait${error.retryAfterSeconds ? ` about ${error.retryAfterSeconds} seconds` : " a moment"} and try again.`;
  if (error?.code === "AGENT_PAUSED") return "Personalized phrase generation is temporarily paused. You can use these starter phrases in the meantime.";
  if (error?.code === "AGENT_CONTROL_UNAVAILABLE") return "Personalized phrase generation is temporarily unavailable. You can use these starter phrases in the meantime.";
  if (error?.code === "AI_PROVIDER_UNAUTHORIZED" || error?.code === "AI_PROVIDER_ERROR" || error?.code === "AI_PROVIDER_NOT_CONFIGURED") {
    return "The personalized phrase service is temporarily unavailable. You can use these starter phrases and try again later.";
  }
  return "We couldn’t reach the phrase service. Check your connection, use these starter phrases, or try generating again.";
};

const AffirmationsTool = ({ tool }) => {
  const [selectedConcern, setSelectedConcern] = useState("anxiety");
  const [affirmations, setAffirmations] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const { status: voiceStatus, error: voiceError, playbackProgress, play, pause, resume, stop } = useNaturalVoice("marin");
  const activeAffirmation = affirmations[activeIndex] || "";

  const showVoiceGuide = voiceStatus === "playing" || voiceStatus === "paused" || voiceStatus === "preparing";

  const handleGenerate = async () => {
    stop();
    setIsGenerating(true);
    setError(null);
    setNotice(null);
    setAffirmations([]);
      trackAction("tool_affirmations_generate", {
        toolId: tool.id,
      });

    try {
      const response = await callAgent("healer_spiritual", {
        question: `Write 4 to 6 short, optional supportive phrases for someone who selected ${CONCERN_TYPES.find((concern) => concern.id === selectedConcern)?.label || selectedConcern}. Make them compassionate, grounded, and specific to that topic. Do not make promises, diagnose, assume beliefs, or pressure the person. Each phrase should stand alone and be easy to adapt or ignore. Return a JSON object with a short summary and a phrases array.`,
      });

      if (response && response.reply) {
        // Parse response - could be a list or text
        const text = response.reply;
        // Try to extract list items (numbered, bulleted, or line-separated)
        const lines = text
          .split(/\n+/)
          .map((line) => line.replace(/^[\d\-\u2022*]\s*/, "").trim())
          .filter((line) => line.length > 10); // Filter out very short lines

        if (lines.length > 0) {
          setAffirmations(lines.slice(0, 10)); // Max 10 affirmations
          setActiveIndex(0);
        } else {
          // Fallback: split by sentences
          const sentences = text
            .split(/[.!?]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 10);
          setAffirmations(sentences.slice(0, 10));
          setActiveIndex(0);
        }

        const generatedCount = lines.length > 0 ? Math.min(lines.length, 10) : text.split(/[.!?]+/).filter((line) => line.trim().length > 10).length;

        // Log usage without including the selected health concern.
        const now = new Date().getTime();
        logToolUsage(tool.id, {
          startedAt: now,
          completedAt: now,
          durationMs: 0,
          context: {
            count: generatedCount,
          },
        }).catch((err) => console.warn("Affirmations telemetry failed:", err));
      } else {
        setAffirmations(STARTER_PHRASES[selectedConcern] || STARTER_PHRASES.anxiety);
        setActiveIndex(0);
        setNotice("Personalized phrases are unavailable right now. These optional starter phrases are ready to use; you can retry at any time.");
      }
    } catch (err) {
      // Log the failure code only. Do not log the user's selected concern or generated content.
      console.warn("Affirmation generation unavailable:", err?.code || "UNKNOWN");
      setAffirmations(STARTER_PHRASES[selectedConcern] || STARTER_PHRASES.anxiety);
      setActiveIndex(0);
      setNotice(friendlyGenerationError(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVoice = () => {
    if (voiceStatus === "playing") {
      void pause();
    } else if (voiceStatus === "paused") {
      void resume();
    } else if (activeAffirmation) {
      void play(activeAffirmation);
    }
  };

  return (
    <div className="space-y-6">
      {showVoiceGuide && <ToolCharacterGuide mood={voiceStatus === "playing" ? "encouraging" : "listening"} speaking={voiceStatus === "playing"} speakingProgress={playbackProgress} message={activeAffirmation} context="You may edit or ignore any phrase. Nothing is a command or promise." />}
      {/* Concern Selection */}
      <div className="lux-card p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          What do you need support with?
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">Your selected category is sent to generate phrases. Keep only what feels right; you can ignore or change any phrase.</p>
        <div className="flex flex-wrap gap-2">
          {CONCERN_TYPES.map((concern) => (
            <button
              key={concern.id}
                type="button"
              onClick={() => setSelectedConcern(concern.id)}
              disabled={isGenerating}
                aria-pressed={selectedConcern === concern.id}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                selectedConcern === concern.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {concern.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center justify-center rounded-full border border-foreground bg-foreground text-background px-6 py-2 text-sm font-medium hover:bg-background hover:text-foreground disabled:opacity-60 transition-colors"
        >
          {isGenerating ? "Generating..." : "Generate Affirmations"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
          <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {notice && (
        <div role="status" aria-live="polite" className="rounded-2xl border border-amber-200/20 bg-amber-100/[0.06] px-4 py-3 text-sm leading-relaxed text-amber-50/85">
          {notice}
        </div>
      )}

      {/* Affirmations List */}
      {affirmations.length > 0 && (
        <div className="space-y-4" aria-live="polite">
          <section className="relative overflow-hidden rounded-3xl border border-amber-200/20 bg-[radial-gradient(ellipse_at_14%_12%,rgba(226,205,153,.14),transparent_40%),linear-gradient(135deg,rgba(255,255,255,.06),rgba(8,13,19,.72))] p-5 shadow-[0_20px_60px_rgba(0,0,0,.22)] sm:p-7" aria-label="Selected affirmation">
            <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full border border-amber-100/10" />
            <div className="pointer-events-none absolute -right-5 -top-7 h-36 w-36 rounded-full border border-emerald-100/10" />
            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/70">A phrase to keep, change, or leave</p>
              <p className="mt-4 max-w-3xl text-2xl font-light leading-relaxed text-white sm:text-3xl">{activeAffirmation}</p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleVoice} disabled={voiceStatus === "preparing"} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-100/30 bg-amber-100/[0.08] px-4 text-sm text-amber-50 transition hover:bg-amber-100/[0.14] disabled:opacity-60">
                  {voiceStatus === "playing" ? <Pause className="h-4 w-4" /> : voiceStatus === "paused" ? <Play className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {voiceStatus === "preparing" ? "Preparing voice…" : voiceStatus === "playing" ? "Pause phrase" : voiceStatus === "paused" ? "Resume phrase" : voiceStatus === "finished" ? "Hear it again" : "Listen to phrase"}
                </button>
                {(voiceStatus === "playing" || voiceStatus === "paused" || voiceStatus === "preparing") && <button type="button" onClick={stop} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/80 transition hover:bg-white/[0.06]"><Square className="h-3.5 w-3.5" /> Stop</button>}
                <span className="ml-auto text-xs tabular-nums text-white/55">{activeIndex + 1} / {affirmations.length}</span>
              </div>
              <p role={voiceError ? "alert" : "status"} aria-live="polite" className={`mt-3 min-h-5 text-xs ${voiceError ? "text-rose-200" : "text-white/55"}`}>
                {voiceError || (voiceStatus === "preparing" ? "Preparing the natural voice…" : voiceStatus === "playing" ? "The phrase is being read aloud." : voiceStatus === "paused" ? "Audio paused." : "Listen when you’re ready; audio starts only when you tap.")}
              </p>
            </div>
          </section>

          <div className="grid gap-2 sm:grid-cols-2" aria-label="Choose a phrase">
            {affirmations.map((affirmation, idx) => (
              <button
                key={`${idx}-${affirmation}`}
                type="button"
                aria-pressed={idx === activeIndex}
                onClick={() => { stop(); setActiveIndex(idx); }}
                className={`min-h-16 rounded-2xl border px-4 py-3 text-left text-sm leading-relaxed transition ${idx === activeIndex ? "border-amber-200/40 bg-amber-100/[0.07] text-white" : "border-white/10 bg-white/[0.025] text-white/70 hover:border-white/20 hover:bg-white/[0.05]"}`}
              >
                <span className="mr-2 text-[10px] font-semibold uppercase tracking-wider text-amber-100/55">{String(idx + 1).padStart(2, "0")}</span>
                {affirmation}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">These are suggestions, not facts or instructions. Keep only what fits.</p>
        </div>
      )}
    </div>
  );
};

export default AffirmationsTool;
