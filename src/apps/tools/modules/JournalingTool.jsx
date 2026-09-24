// src/apps/tools/modules/JournalingTool.jsx
// Journal with mode selection and Firestore/localStorage fallback

import React, { useState, useCallback } from "react";
import { X, Save } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";

const JOURNAL_MODES = [
  {
    id: "dump",
    name: "Open reflection",
    description: "Write as much or as little as feels useful. You can skip anything.",
    placeholder: "Start anywhere, or leave this blank...",
  },
  {
    id: "gratitude",
    name: "Gratitude for today",
    description: "What are you grateful for right now?",
    placeholder: "What are you grateful for today?",
  },
  {
    id: "fear",
    name: "What feels present",
    description: "Notice what is here, at your own pace. You do not need to solve it now.",
    placeholder: "What feels present for you?",
  },
  {
    id: "reflection",
    name: "Reflection",
    description: "Process what's happening in your life right now.",
    placeholder: "What's present for you right now?",
  },
];

const JournalingTool = ({ onComplete, onCancel, _initialContext, isEmbedded = false }) => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [startTime] = useState(() => Date.now());
  const identity = useSessionIdentity();

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

  const handleCancel = useCallback(() => {
    safeCancel(onCancel);
  }, [onCancel]);

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
        onClick={() => { setSelectedMode(null); setSaveError(""); }}
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
              setSelectedMode(null);
              setText("");
            }}
            className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
        <label htmlFor="journal-entry" className="sr-only">Journal entry</label>
        <textarea
          id="journal-entry"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 10000))}
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
