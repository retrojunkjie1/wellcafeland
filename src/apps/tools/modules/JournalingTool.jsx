// src/apps/tools/modules/JournalingTool.jsx
// Journal with mode selection and Firestore/localStorage fallback

import React, { useState, useCallback } from "react";
import { Pause, Play, Save, Square, Volume2, X, Sparkles } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";
import { useNaturalVoice } from "@/hooks/useNaturalVoice";
import { callAgent } from "@/ai/agents/agentClient";

const JOURNAL_MODES = [
  {
    id: "dump",
    name: "Clear the page",
    description: "Unload thoughts without organizing or fixing them. Stop when you have said enough.",
    placeholder: "Start anywhere, or leave this blank...",
    prompts: ["What keeps returning to my mind?", "What do I wish I could say without being interrupted?", "What can I set down for the next hour?"],
  },
  {
    id: "gratitude",
    name: "Small moments that mattered",
    description: "Notice something supportive, meaningful, or simply okay. This can include mixed feelings; gratitude is never required.",
    placeholder: "A small moment, comfort, person, or ordinary thing I noticed...",
    prompts: ["What made today 1% easier?", "What did I do for myself that I want to acknowledge?", "What ordinary thing felt steady or comforting?"],
  },
  {
    id: "check-in",
    name: "Name what is here",
    description: "Sort the moment into feeling, need, and one possible support. No diagnosis or solution is expected.",
    placeholder: "Right now I notice… I might need… One support I could choose is…",
    prompts: ["What feeling is easiest to name?", "What is taking the most energy?", "What would help me feel 5% more supported?"],
  },
  {
    id: "learning",
    name: "Look back with care",
    description: "Review one moment without grading yourself. Notice what you learned, what mattered, and what you want to try next.",
    placeholder: "The moment… What I needed… What I want to remember…",
    prompts: ["What went differently than I expected?", "What boundary or value mattered here?", "What would I tell someone I care about in this situation?"],
  },
];

const JournalingTool = ({ onComplete, onCancel, _initialContext, isEmbedded = false }) => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [lastSpokenText, setLastSpokenText] = useState("");
  const [scribeLoading, setScribeLoading] = useState(false);
  const [scribeSuggestion, setScribeSuggestion] = useState(null);
  const [scribeError, setScribeError] = useState("");
  const [mirrorLoading, setMirrorLoading] = useState(false);
  const [mirrorResult, setMirrorResult] = useState(null);
  const [mirrorError, setMirrorError] = useState("");
  const [startTime] = useState(() => Date.now());
  const identity = useSessionIdentity();
  const voice = useNaturalVoice("marin");
  const isSpeaking = voice.status === "playing";
  const isPreparing = voice.status === "preparing";
  const isVoicePaused = voice.status === "paused";
  const isVoiceUnavailable = voice.status === "unavailable";
  const voiceProgress = Math.max(0, Math.min(1, voice.playbackProgress || 0));

  const speakFixedPrompt = (textToSpeak) => {
    setLastSpokenText(textToSpeak);
    void voice.play(textToSpeak);
  };

  const speakModePrompts = () => {
    if (!selectedMode) return;
    speakFixedPrompt(`${selectedMode.name}. ${selectedMode.description} The prompts are optional. ${selectedMode.prompts.join(". ")}`);
  };

  const requestScribePrompt = async () => {
    if (!selectedMode || scribeLoading) return;
    setScribeLoading(true);
    setScribeError("");
    setScribeSuggestion(null);
    try {
      const response = await callAgent("scribe", {
        question: `The person selected the journaling mode "${selectedMode.name}". Its purpose is: "${selectedMode.description}". Offer one fresh, optional journal question that fits this mode. Do not assume personal circumstances.`,
      });
      const result = response.result || response;
      if (typeof result.prompt !== "string" || !result.prompt.trim()) {
        throw new Error("Scribe did not return a usable prompt.");
      }
      setScribeSuggestion({
        summary: typeof result.summary === "string" ? result.summary.trim() : "A prompt you can use or skip.",
        prompt: result.prompt.trim().slice(0, 360),
        followUp: typeof result.followUp === "string" ? result.followUp.trim().slice(0, 240) : "",
      });
    } catch (error) {
      setScribeError(error?.message || "A fresh prompt could not be created. Your entry is unchanged.");
    } finally {
      setScribeLoading(false);
    }
  };

  const useScribePrompt = () => {
    if (!scribeSuggestion?.prompt) return;
    setText((current) => `${current.trim() ? `${current.trim()}\n\n` : ""}${scribeSuggestion.prompt}\n`);
    setMirrorResult(null);
    setScribeSuggestion(null);
  };

  const requestMirrorReflection = async () => {
    const content = text.trim();
    if (!content || mirrorLoading) return;
    setMirrorLoading(true);
    setMirrorError("");
    setMirrorResult(null);
    try {
      const response = await callAgent("mirror", { content });
      const result = response.result || response;
      if (![result.summary, result.reflection, result.question].every((value) => typeof value === "string" && value.trim())) {
        throw new Error("Mirror did not return a complete reflection.");
      }
      setMirrorResult({
        summary: result.summary.trim().slice(0, 180),
        reflection: result.reflection.trim().slice(0, 500),
        question: result.question.trim().slice(0, 240),
      });
    } catch (error) {
      setMirrorError(error?.message || "The reflection could not be created. Your writing is unchanged.");
    } finally {
      setMirrorLoading(false);
    }
  };

  const getUserId = () => {
    if (identity.userId) return identity.userId;
    // Fallback to session storage for anonymous users
    let anonId = sessionStorage.getItem("wc-anonymous-id");
    if (!anonId) {
      anonId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("wc-anonymous-id", anonId);
    }
    return anonId;
  };

  const saveToFirestore = async (entry) => {
    if (!db) return false;
    try {
      await addDoc(collection(db, "journalEntries"), {
        ...entry,
        createdAt: new Date(),
      });
      return true;
    } catch (err) {
      console.warn("Failed to save to Firestore:", err);
      return false;
    }
  };

  const saveToLocalStorage = (entry) => {
    try {
      const key = `wc-journal-${getUserId()}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push({
        ...entry,
        createdAt: Date.now(),
      });
      localStorage.setItem(key, JSON.stringify(existing.slice(-50))); // Keep last 50 entries
      return true;
    } catch (err) {
      console.warn("Failed to save to localStorage:", err);
      return false;
    }
  };

  const handleSave = async () => {
    if (!text.trim() || !selectedMode || isSaving) return;

    voice.stop();
    setIsSaving(true);
    setSaveError("");
    const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
    const entry = {
      userId: getUserId(),
      mode: selectedMode.id,
      modeName: selectedMode.name,
      text: text.trim(),
      wordCount,
      isAnonymous: identity.mode === "guest",
    };

    // Try Firestore first, fallback to localStorage
    let savedTo = "";
    if (db && identity.mode === "account") {
      if (await saveToFirestore(entry)) savedTo = "account";
    }
    
    if (!savedTo && saveToLocalStorage(entry)) {
      savedTo = "this browser";
    }

    setIsSaving(false);

    if (savedTo) {
      const endTime = Date.now();
      const durationSeconds = Math.floor((endTime - startTime) / 1000);

      const result = createToolResult(
        "journaling",
        "Journal Entry",
        `Saved ${wordCount} words in ${selectedMode.name} mode`,
        {
          mode: selectedMode.id,
          modeName: selectedMode.name,
          wordCount,
          timestamp: Date.now(),
          savedTo,
        },
        durationSeconds
      );

      // Log telemetry (non-blocking)
      logToolUsage("journaling", {
        startedAt: startTime,
        completedAt: endTime,
        durationMs: durationSeconds * 1000,
        context: {
          mode: selectedMode.id,
          wordCount,
        },
      }).catch(err => console.warn("Tool telemetry failed:", err));

      safeComplete(onComplete, result);
    } else {
      setSaveError("This entry could not be saved. Your writing is still here; try again or copy it before leaving.");
    }
  };

  const addPrompt = (prompt) => {
    setText((current) => `${current.trim() ? `${current.trim()}\n\n` : ""}${prompt}\n`);
    setMirrorResult(null);
  };

  const handleCancel = useCallback(() => {
    voice.stop();
    safeCancel(onCancel);
  }, [onCancel, voice.stop]);

  // Mode selection
  if (!selectedMode) {
    return (
      <div className="space-y-6">
        {!isEmbedded && onCancel && (
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-white">Journaling</h3>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/5 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-base text-white/70">Choose a journaling mode:</p>
          
          <div className="space-y-3">
            {JOURNAL_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
              onClick={() => { setSelectedMode(mode); setSaveError(""); }}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10 transition"
              >
                <h4 className="text-base font-medium text-white mb-1">{mode.name}</h4>
                <p className="text-sm text-white/60">{mode.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Writing interface
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200/15 bg-amber-100/[0.04] p-4 text-sm leading-relaxed text-white/65" role="note">
        {identity.mode === "account" && db
          ? "Entries are saved to your account when available. If that save is unavailable, this browser is used instead. Only write details you are comfortable storing here."
          : "Entries are saved in this browser on this device. They are not synced to an account. Avoid writing details you would not want stored on a shared device."}
      </div>
      <button
        type="button"
        onClick={() => { voice.stop(); setSelectedMode(null); setSaveError(""); }}
        className="min-h-11 rounded-lg px-3 text-sm text-white/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
      >
        Change prompt
      </button>
      {!isEmbedded && onCancel && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-medium text-white">{selectedMode.name}</h3>
            <p className="text-sm text-white/50">{selectedMode.description}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              voice.stop();
              setSelectedMode(null);
              setText("");
            }}
            className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/5 transition"
            aria-label="Close journaling"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-emerald-100/15 bg-emerald-100/[0.035] p-4" aria-label="Spoken journaling prompts">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">Listen before you write</p>
            <p className="mt-1 text-xs leading-relaxed text-white/60">Hear the mode description and optional prompts. Your journal entry is never read aloud.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => isSpeaking ? void voice.pause() : isVoicePaused ? void voice.resume() : speakModePrompts()} disabled={isPreparing} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-100/25 bg-emerald-100/[0.08] px-4 text-sm text-emerald-50 transition hover:bg-emerald-100/[0.14] disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
              {isPreparing ? <Volume2 aria-hidden="true" className="h-4 w-4 animate-pulse" /> : isSpeaking ? <Pause aria-hidden="true" className="h-4 w-4" /> : isVoicePaused ? <Play aria-hidden="true" className="h-4 w-4" /> : <Volume2 aria-hidden="true" className="h-4 w-4" />}
              {isPreparing ? "Preparing voice…" : isSpeaking ? "Pause voice" : isVoicePaused ? "Resume voice" : voice.status === "finished" ? "Replay prompts" : "Hear prompts"}
            </button>
            {(isSpeaking || isVoicePaused || isPreparing) && <button type="button" onClick={voice.stop} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"><Square aria-hidden="true" className="h-3.5 w-3.5" /> Stop</button>}
          </div>
        </div>
        {isSpeaking && <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Spoken prompt progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(voiceProgress * 100)}><span className="block h-full rounded-full bg-gradient-to-r from-emerald-200 to-amber-100 transition-[width] duration-100 ease-linear" style={{ width: `${voiceProgress * 100}%` }} /></div>}
        <p role={isVoiceUnavailable ? "alert" : "status"} aria-live="polite" className={`mt-2 min-h-5 text-xs ${isVoiceUnavailable ? "text-amber-200" : "text-white/55"}`}>
          {isVoiceUnavailable ? voice.error || "The spoken prompts could not play. You can still use the written prompts." : isPreparing ? "Preparing the natural voice…" : isSpeaking ? "Spoken prompts are playing." : isVoicePaused ? "Spoken prompts are paused." : voice.status === "finished" ? "Prompts complete. Your writing was not spoken." : lastSpokenText ? "You can replay the spoken prompts at any time." : "Audio starts only when you tap. Your entry is never included."}
        </p>
      </section>

      <section className="rounded-2xl border border-sky-100/15 bg-sky-100/[0.035] p-4" aria-label="Optional Scribe prompt">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">Need a different starting question?</p>
            <p className="mt-1 text-xs leading-relaxed text-white/60">Scribe uses only the journaling mode you chose. Your entry text is never sent.</p>
          </div>
          <button
            type="button"
            onClick={requestScribePrompt}
            disabled={scribeLoading}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sky-100/25 bg-sky-100/[0.08] px-4 text-sm text-sky-50 transition hover:bg-sky-100/[0.14] disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
          >
            {scribeLoading ? "Creating a prompt…" : scribeSuggestion ? "Try another question" : "Suggest a fresh prompt"}
          </button>
        </div>
        {scribeSuggestion && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-sky-100/70">Optional question</p>
            <p className="mt-2 text-base leading-relaxed text-white">{scribeSuggestion.prompt}</p>
            {scribeSuggestion.followUp && <p className="mt-2 text-sm leading-relaxed text-white/65">If useful: {scribeSuggestion.followUp}</p>}
            <button type="button" onClick={useScribePrompt} className="mt-3 min-h-10 rounded-full border border-white/15 px-4 text-sm text-white/85 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">Use this question</button>
          </div>
        )}
        {scribeError && <p role="alert" className="mt-3 text-sm text-amber-100">{scribeError}</p>}
      </section>

      <section className="rounded-2xl border border-violet-100/15 bg-violet-100/[0.035] p-4" aria-label="Optional Mirror reflection">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">Want a gentle reflection?</p>
            <p className="mt-1 text-xs leading-relaxed text-white/60">Only when you tap: Mirror sends up to 2,000 characters of this entry for one optional reflection. It is not added to your saved entry.</p>
          </div>
          <button
            type="button"
            onClick={requestMirrorReflection}
            disabled={!text.trim() || text.trim().length > 2000 || mirrorLoading}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-violet-100/25 bg-violet-100/[0.08] px-4 text-sm text-violet-50 transition hover:bg-violet-100/[0.14] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
          >
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            {mirrorLoading ? "Preparing reflection…" : mirrorResult ? "Reflect again" : "Reflect this back"}
          </button>
        </div>
        {text.trim().length > 2000 && <p className="mt-2 text-xs text-amber-100">Shorten the entry to 2,000 characters to request a reflection.</p>}
        {mirrorResult && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4" aria-live="polite">
            <p className="text-xs font-medium uppercase tracking-wide text-violet-100/70">Optional reflection · you can correct or ignore this</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{mirrorResult.summary}</p>
            <p className="mt-2 text-base leading-relaxed text-white">{mirrorResult.reflection}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/75">If useful: {mirrorResult.question}</p>
          </div>
        )}
        {mirrorError && <p role="alert" className="mt-3 text-sm text-amber-100">{mirrorError}</p>}
      </section>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
        <div className="space-y-2" aria-label="Optional writing prompts">
          <p className="text-xs font-medium uppercase tracking-wide text-white/50">Optional prompt cards · choose one or ignore them</p>
          <div className="flex flex-wrap gap-2">
            {selectedMode.prompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => addPrompt(prompt)} className="min-h-10 rounded-full border border-white/10 px-3 py-2 text-left text-xs leading-relaxed text-white/70 transition hover:border-amber-200/30 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
                {prompt}
              </button>
            ))}
          </div>
        </div>
        <label htmlFor="journal-entry" className="sr-only">Journal entry</label>
        <textarea
          id="journal-entry"
          value={text}
          onChange={(e) => {
            setText(e.target.value.slice(0, 10000));
            setMirrorResult(null);
            setMirrorError("");
          }}
          placeholder={selectedMode.placeholder}
          rows={12}
          maxLength={10000}
          aria-describedby="journal-count"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none resize-none"
        />
        
        <div className="flex items-center justify-between">
          <span id="journal-count" className="text-sm text-white/50">{wordCount} words · {text.length}/10,000 characters</span>
          <button
            type="button"
            onClick={handleSave}
            disabled={!text.trim() || isSaving}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 sm:px-5 py-3 sm:py-2.5 text-sm sm:text-base font-medium text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </div>
      {saveError && <p role="alert" className="text-sm text-rose-200">{saveError}</p>}
    </div>
  );
};

export default JournalingTool;
