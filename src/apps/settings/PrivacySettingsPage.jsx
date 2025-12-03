// src/apps/settings/PrivacySettingsPage.jsx

import React from "react";
import { useOSStore } from "@/stores/useOSStore";

const PrivacySettingsPage = () => {
  const settings = useOSStore((state) => state.settings);
  const setPrivacySetting = useOSStore((state) => state.setPrivacySetting);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-white">
          Privacy & Security
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Control how your data is stored, viewed, and erased.
        </p>
      </header>
      <div className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 space-y-3">
          <h2 className="text-sm font-semibold text-white">
            Data & Sessions
          </h2>
          <p className="text-xs text-white/60">
            WellnessCafe does not sell your data. These controls are here to keep you in charge.
          </p>
          <div className="space-y-3 mt-3">
            <label className="flex items-center justify-between gap-2 text-xs text-white/70 cursor-pointer">
              <span>Hide sensitive text in history</span>
              <input
                type="checkbox"
                checked={settings.privacy?.hideSensitiveText ?? false}
                onChange={(e) => setPrivacySetting("hideSensitiveText", e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/30 bg-transparent accent-amber-400"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-xs text-white/70 cursor-pointer">
              <span>Redact names in history</span>
              <input
                type="checkbox"
                checked={settings.privacy?.redactNamesInHistory ?? true}
                onChange={(e) => setPrivacySetting("redactNamesInHistory", e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/30 bg-transparent accent-amber-400"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-xs text-white/70 cursor-pointer">
              <span>Require PIN for provider view</span>
              <input
                type="checkbox"
                checked={settings.privacy?.requirePinForProviderView ?? false}
                onChange={(e) => setPrivacySetting("requirePinForProviderView", e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/30 bg-transparent accent-amber-400"
              />
            </label>
            <div className="flex items-center justify-between gap-2 text-xs text-white/70">
              <span>Data retention</span>
              <select
                value={settings.privacy?.dataRetention ?? "90d"}
                onChange={(e) => setPrivacySetting("dataRetention", e.target.value)}
                className="rounded-lg border border-white/12 bg-white/[0.02] px-2 py-1 text-white/70 hover:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-amber-400/50"
              >
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
                <option value="90d">90 days</option>
                <option value="forever">Keep until I delete</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button className="rounded-lg border border-white/12 bg-white/[0.02] px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.06] transition">
              Download my data
            </button>
            <button className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-100 hover:bg-red-500/20 transition">
              Delete my account
            </button>
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 space-y-3">
          <h2 className="text-sm font-semibold text-white">
            Devices & Security
          </h2>
          <div className="space-y-2 text-xs text-white/70">
            <p>• Log out from other devices</p>
            <p>• Enable two-step verification (future)</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacySettingsPage;

