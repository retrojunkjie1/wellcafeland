// src/apps/settings/WellnessSettingsPage.jsx

import React from "react";
import { useOSStore } from "@/stores/useOSStore";

const ToggleRow = ({ label, description, checked, onChange }) => (
  <div className="flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-3 sm:px-4 sm:py-3.5">
    <div className="flex-1">
      <p className="text-sm text-white">{label}</p>
      <p className="mt-1 text-xs text-white/55">{description}</p>
    </div>
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full px-0.5 transition-colors ${
        checked ? "bg-amber-400/30" : "bg-white/10"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full shadow transition-transform ${
          checked
            ? "bg-amber-400 shadow-amber-500/40 translate-x-4"
            : "bg-white/40 translate-x-0"
        }`}
      />
    </button>
  </div>
);

const WellnessSettingsPage = () => {
  const settings = useOSStore((state) => state.settings);
  const setAllowEmotionFromChat = useOSStore((state) => state.setAllowEmotionFromChat);
  const setAllowFaceSignals = useOSStore((state) => state.setAllowFaceSignals);
  const setTrajectoryTrackingEnabled = useOSStore((state) => state.setTrajectoryTrackingEnabled);
  const setRecoveryMode = useOSStore((state) => state.setRecoveryMode);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-white">
          Wellness Settings
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Decide how deeply the system tracks your emotional and recovery signals.
        </p>
      </header>
      <div className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 space-y-3">
          <h2 className="text-sm font-semibold text-white">
            Emotional Intelligence
          </h2>
          <p className="text-xs text-white/60">
            These features stay on your device and are designed to feel respectful, not invasive.
          </p>
          <ToggleRow
            label="Emotion detection from chat"
            description="Let WellnessCafe track emotional tone from your messages to adjust support."
            checked={settings.allowEmotionFromChat}
            onChange={() => setAllowEmotionFromChat(!settings.allowEmotionFromChat)}
          />
          <ToggleRow
            label="Face expression signals"
            description="Optional: when you allow camera access, the system can read your visible state."
            checked={settings.allowFaceSignals}
            onChange={() => setAllowFaceSignals(!settings.allowFaceSignals)}
          />
          <ToggleRow
            label="Trajectory & drift analysis"
            description="Track how your emotional intensity is moving over time."
            checked={settings.trajectoryTrackingEnabled}
            onChange={() => setTrajectoryTrackingEnabled(!settings.trajectoryTrackingEnabled)}
          />
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 space-y-3">
          <h2 className="text-sm font-semibold text-white">
            Recovery Mode
          </h2>
          <p className="text-xs text-white/60">
            Choose how intense and direct you want the system to be.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <button
              onClick={() => setRecoveryMode("gentle")}
              className={`rounded-xl border px-3 py-2 text-xs transition ${
                settings.recoveryMode === "gentle"
                  ? "border-amber-400/60 bg-amber-400/10 text-amber-50 hover:bg-amber-400/20"
                  : "border-white/12 bg-white/[0.02] text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              Gentle / Early
            </button>
            <button
              onClick={() => setRecoveryMode("standard")}
              className={`rounded-xl border px-3 py-2 text-xs transition ${
                settings.recoveryMode === "standard"
                  ? "border-amber-400/60 bg-amber-400/10 text-amber-50 hover:bg-amber-400/20"
                  : "border-white/12 bg-white/[0.02] text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              Standard Recovery
            </button>
            <button
              onClick={() => setRecoveryMode("intensive")}
              className={`rounded-xl border px-3 py-2 text-xs transition ${
                settings.recoveryMode === "intensive"
                  ? "border-amber-400/60 bg-amber-400/10 text-amber-50 hover:bg-amber-400/20"
                  : "border-white/12 bg-white/[0.02] text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              Deep / Intensive
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WellnessSettingsPage;

