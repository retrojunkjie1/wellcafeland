// src/apps/settings/WellnessSettingsPage.jsx

import React from "react";
import { useOSStore } from "@/stores/useOSStore";

const ToggleRow = ({ label, description, checked, onChange, disabled = false }) => (
  <div className="flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-3 sm:px-4 sm:py-3.5">
    <div className="flex-1">
      <p className="text-sm text-white">{label}</p>
      <p className="mt-1 text-xs text-white/55">{description}</p>
    </div>
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-11 w-11 flex-shrink-0 items-center rounded-full px-0.5 transition-colors ${
        checked ? "bg-amber-400/30" : "bg-white/10"
      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full shadow transition-transform ${
          checked
            ? "bg-amber-400 shadow-amber-500/40 translate-x-5"
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
            Optional signals can personalize support. Direct safety keyword checks remain active when emotional analysis is off.
          </p>
          <ToggleRow
            label="Optional chat interpretation"
            description="Allow the guide to infer emotional tone and related personal or relationship signals from new chat messages. Turning this off stops those inferences and clears their stored local snapshots. Explicit safety phrase checks remain active; high-risk safety events may still be shared with your care team."
            checked={settings.allowEmotionFromChat}
            onChange={() => setAllowEmotionFromChat(!settings.allowEmotionFromChat)}
          />
          <ToggleRow
            label="Face expression signals"
            description="Allow a one-time camera scan. Frames stay in this browser; a derived signal can be attached to your next chat message. Requires emotion analysis."
            checked={settings.allowFaceSignals}
            onChange={() => setAllowFaceSignals(!settings.allowFaceSignals)}
            disabled={!settings.allowEmotionFromChat}
          />
          <ToggleRow
            label="Trajectory & drift analysis"
            description="Keep local emotional trend snapshots in app state. Turning this off clears saved trend snapshots; direct safety checks continue."
            checked={settings.trajectoryTrackingEnabled}
            onChange={() => setTrajectoryTrackingEnabled(!settings.trajectoryTrackingEnabled)}
          />
        </section>
      </div>
    </div>
  );
};

export default WellnessSettingsPage;
