// src/apps/tools/modules/BodyScanTool.jsx
// Progressive body awareness from head to toe

import React, { useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";

const BODY_REGIONS = [
  { id: "head", name: "Head", description: "Notice your scalp, forehead, temples" },
  { id: "face", name: "Face", description: "Jaw, cheeks, eyes, mouth" },
  { id: "neck", name: "Neck & Shoulders", description: "Throat, shoulders, upper back" },
  { id: "chest", name: "Chest & Heart", description: "Ribcage, heart area, upper torso" },
  { id: "belly", name: "Belly & Core", description: "Abdomen, lower back, sides" },
  { id: "arms", name: "Arms & Hands", description: "Shoulders to fingertips" },
  { id: "hips", name: "Hips & Pelvis", description: "Hip joints, lower back, pelvis" },
  { id: "legs", name: "Legs", description: "Thighs, knees, calves" },
  { id: "feet", name: "Feet & Ankles", description: "Ankles, arches, toes" },
];

const BodyScanTool = ({ onComplete, onCancel, _initialContext, isEmbedded = false }) => {
  const [currentRegionIndex, setCurrentRegionIndex] = useState(0);
  const [tensionLevels, setTensionLevels] = useState({}); // 0-10 scale
  const [notes, setNotes] = useState({});
  const [startTime] = useState(() => Date.now());

  const currentRegion = BODY_REGIONS[currentRegionIndex];
  const isFirst = currentRegionIndex === 0;
  const isLast = currentRegionIndex === BODY_REGIONS.length - 1;

  const handleTensionChange = (regionId, level) => {
    setTensionLevels((prev) => ({
      ...prev,
      [regionId]: level,
    }));
  };

  const handleNoteChange = (regionId, note) => {
    setNotes((prev) => ({
      ...prev,
      [regionId]: note,
    }));
  };

  const handleNext = () => {
    if (currentRegionIndex < BODY_REGIONS.length - 1) {
      setCurrentRegionIndex(currentRegionIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentRegionIndex > 0) {
      setCurrentRegionIndex(currentRegionIndex - 1);
    }
  };

  const handleComplete = useCallback(() => {
    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);
    
    // Find most tense area (highest tension level)
    const tenseEntries = Object.entries(tensionLevels);
    let tenseArea = null;
    if (tenseEntries.length > 0) {
      const [mostTenseId] = tenseEntries.reduce((max, [id, level]) => 
        level > max[1] ? [id, level] : max, tenseEntries[0]
      );
      tenseArea = mostTenseId;
    }

    const result = createToolResult(
      "body_scan",
      "Body Scan",
      `Completed body scan through ${BODY_REGIONS.length} regions.`,
      {
        regionsScanned: BODY_REGIONS.length,
        tensionLevels: { ...tensionLevels },
        notes: Object.keys(notes).reduce((acc, id) => {
          if (notes[id]?.trim()) acc[id] = notes[id].trim();
          return acc;
        }, {}),
        mostTenseArea: tenseArea,
      },
      durationSeconds
    );

    // Log telemetry (non-blocking)
    logToolUsage("body_scan", {
      startedAt: startTime,
      completedAt: endTime,
      durationMs: durationSeconds * 1000,
      context: {
        regionsScanned: BODY_REGIONS.length,
      },
    }).catch(err => console.warn("Tool telemetry failed:", err));

    safeComplete(onComplete, result);
  }, [startTime, tensionLevels, notes, onComplete]);

  const handleCancel = useCallback(() => {
    safeCancel(onCancel);
  }, [onCancel]);

  const currentTension = tensionLevels[currentRegion.id] ?? 0;

  return (
    <div className="space-y-6">
      {!isEmbedded && onCancel && (
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">Body Scan</h3>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
        <p className="text-base text-white/70">
          If it feels comfortable, notice this area. You can skip any region or stop at any time.
        </p>
        <p className="text-sm text-white/50">
          Region {currentRegionIndex + 1} of {BODY_REGIONS.length}
        </p>
      </div>

      {/* Current Region */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 space-y-6 animate-fade-in">
        <div>
          <h3 className="text-xl font-medium text-white mb-2">{currentRegion.name}</h3>
          <p className="text-base text-white/60">{currentRegion.description}</p>
        </div>

        {/* Tension Level */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor={`tension-${currentRegion.id}`} className="text-base text-white/80">
              Optional: how much tension do you notice here?
            </label>
            <span className="text-sm text-white/60" aria-live="polite">
              {tensionLevels[currentRegion.id] === undefined ? "Not rated" : currentTension}
            </span>
          </div>
          <input
            id={`tension-${currentRegion.id}`}
            type="range"
            min="0"
            max="10"
            value={currentTension}
            onChange={(e) => handleTensionChange(currentRegion.id, parseInt(e.target.value, 10))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white/50">
            <span>None (0)</span>
            <span>A lot (10)</span>
          </div>
        </div>

        {/* Optional Notes */}
        <div className="space-y-2">
          <label htmlFor={`body-note-${currentRegion.id}`} className="text-sm text-white/70">Any sensations or notes? (optional)</label>
          <textarea
            id={`body-note-${currentRegion.id}`}
            value={notes[currentRegion.id] || ""}
            onChange={(e) => handleNoteChange(currentRegion.id, e.target.value)}
            placeholder="What do you notice in this area?"
            rows={3}
            maxLength={1000}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none resize-none"
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleBack}
            disabled={isFirst}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-base text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-2.5 text-base font-medium text-white transition hover:bg-white/20"
          >
            {isLast ? "Complete" : "Next"}
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {onCancel && (
        <button type="button" onClick={handleCancel} className="min-h-11 rounded-lg px-3 text-sm text-white/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
          Stop and leave
        </button>
      )}

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {BODY_REGIONS.map((region, idx) => (
          <div
            key={region.id}
            className={`h-1.5 rounded-full transition-all ${
              tensionLevels[region.id] !== undefined
                ? "w-8 bg-white/40"
                : idx === currentRegionIndex
                ? "w-6 bg-white/20"
                : "w-4 bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BodyScanTool;
