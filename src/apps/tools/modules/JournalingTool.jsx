// src/apps/tools/modules/JournalingTool.jsx
// Journal with mode selection and Firestore/localStorage fallback

import React, { useState, useEffect, useCallback } from "react";
import { X, Save } from "lucide-react";
import { collection, addDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";

const JOURNAL_MODES = [
  {
    id: "dump",
    name: "Dump what's in your head",
    description: "Get it all out. No filter, no judgment.",
    placeholder: "Write whatever comes to mind...",
  },
  {
    id: "gratitude",
    name: "Gratitude for today",
    description: "What are you grateful for right now?",
    placeholder: "What are you grateful for today?",
  },
  {
    id: "fear",
    name: "Fear and honesty",
    description: "What are you afraid of? What's the truth you're avoiding?",
    placeholder: "What fears or truths are you holding?",
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
    if (!text.trim() || !selectedMode) return;

    setIsSaving(true);
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
    let saved = false;
    if (db && identity.mode === "account") {
      saved = await saveToFirestore(entry);
    }
    
    if (!saved) {
      saved = saveToLocalStorage(entry);
    }

    setIsSaving(false);

    if (saved) {
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
          savedTo: saved ? (db && identity.mode === "account" ? "firestore" : "localStorage") : "none",
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
                onClick={() => setSelectedMode(mode)}
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
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={selectedMode.placeholder}
          rows={12}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none resize-none"
        />
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/50">{wordCount} words</span>
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
    </div>
  );
};

export default JournalingTool;
