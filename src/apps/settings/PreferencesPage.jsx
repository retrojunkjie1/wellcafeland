// src/apps/settings/PreferencesPage.jsx

import React from "react";
import { useOSStore } from "@/stores/useOSStore";

const PreferencesPage = () => {
  const settings = useOSStore((state) => state.settings);
  const setThemeMode = useOSStore((state) => state.setThemeMode);
  const setInterfaceDensity = useOSStore((state) => state.setInterfaceDensity);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-white">
          Preferences
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Tune how WellnessCafe OS feels on your screen.
        </p>
      </header>
      <div className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-white mb-2">
            Appearance
          </h2>
          <p className="text-xs text-white/60 mb-3">
            Choose a light, dark, or system theme.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              aria-pressed={settings.themeMode === "deep-night"}
              onClick={() => setThemeMode("deep-night")}
              className={`min-h-11 rounded-xl border px-3 py-2 text-xs transition ${
                settings.themeMode === "deep-night"
                  ? "border-amber-400/60 bg-amber-400/10 text-amber-50 hover:bg-amber-400/20"
                  : "border-white/12 bg-white/[0.02] text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              Deep Night
            </button>
            <button
              type="button"
              aria-pressed={settings.themeMode === "dawn"}
              onClick={() => setThemeMode("dawn")}
              className={`min-h-11 rounded-xl border px-3 py-2 text-xs transition ${
                settings.themeMode === "dawn"
                  ? "border-amber-400/60 bg-amber-400/10 text-amber-50 hover:bg-amber-400/20"
                  : "border-white/12 bg-white/[0.02] text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              Dawn
            </button>
            <button
              type="button"
              aria-pressed={settings.themeMode === "system"}
              onClick={() => setThemeMode("system")}
              className={`min-h-11 rounded-xl border px-3 py-2 text-xs transition ${
                settings.themeMode === "system"
                  ? "border-amber-400/60 bg-amber-400/10 text-amber-50 hover:bg-amber-400/20"
                  : "border-white/12 bg-white/[0.02] text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              System
            </button>
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-white mb-2">
            Text & Layout
          </h2>
          <p className="text-xs text-white/60 mb-3">
            Control the spacing around client pages.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={settings.interfaceDensity === "compact"}
              onClick={() => setInterfaceDensity("compact")}
              className={`min-h-11 rounded-full border px-4 py-1.5 text-xs transition ${
                settings.interfaceDensity === "compact"
                  ? "border-amber-400/60 bg-amber-400/10 text-amber-50 hover:bg-amber-400/20"
                  : "border-white/12 bg-white/[0.02] text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              Compact
            </button>
            <button
              type="button"
              aria-pressed={settings.interfaceDensity === "cozy"}
              onClick={() => setInterfaceDensity("cozy")}
              className={`min-h-11 rounded-full border px-4 py-1.5 text-xs transition ${
                settings.interfaceDensity === "cozy"
                  ? "border-amber-400/60 bg-amber-400/10 text-amber-50 hover:bg-amber-400/20"
                  : "border-white/12 bg-white/[0.02] text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              Cozy
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PreferencesPage;
