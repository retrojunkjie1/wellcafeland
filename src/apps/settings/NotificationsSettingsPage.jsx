// src/apps/settings/NotificationsSettingsPage.jsx

import React from "react";
import { useOSStore } from "@/stores/useOSStore";

const NotificationsSettingsPage = () => {
  const settings = useOSStore((state) => state.settings);
  const setNotificationSetting = useOSStore((state) => state.setNotificationSetting);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-white">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Choose how WellnessCafe reaches out to you.
        </p>
      </header>
      <div className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 space-y-3">
          <h2 className="text-sm font-semibold text-white">
            Channels
          </h2>
          <div className="space-y-2 text-xs text-white/70">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications?.emailEnabled ?? true}
                onChange={(e) => setNotificationSetting("emailEnabled", e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/30 bg-transparent accent-amber-400"
              />
              Email
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications?.pushEnabled ?? false}
                onChange={(e) => setNotificationSetting("pushEnabled", e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/30 bg-transparent accent-amber-400"
              />
              Mobile push (PWA)
            </label>
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 space-y-3">
          <h2 className="text-sm font-semibold text-white">
            Types of notifications
          </h2>
          <div className="space-y-2 text-xs text-white/70">
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <span>Daily check-in reminder</span>
              <input
                type="checkbox"
                checked={settings.notifications?.dailyCheckIn ?? true}
                onChange={(e) => setNotificationSetting("dailyCheckIn", e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/30 bg-transparent accent-amber-400"
              />
            </label>
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <span>Milestone & coin alerts</span>
              <input
                type="checkbox"
                checked={settings.notifications?.milestoneAlerts ?? true}
                onChange={(e) => setNotificationSetting("milestoneAlerts", e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/30 bg-transparent accent-amber-400"
              />
            </label>
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <span>Provider messages</span>
              <input
                type="checkbox"
                checked={settings.notifications?.providerMessages ?? true}
                onChange={(e) => setNotificationSetting("providerMessages", e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/30 bg-transparent accent-amber-400"
              />
            </label>
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <span>Circle & group activity</span>
              <input
                type="checkbox"
                checked={settings.notifications?.circleActivity ?? true}
                onChange={(e) => setNotificationSetting("circleActivity", e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/30 bg-transparent accent-amber-400"
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NotificationsSettingsPage;

