import React from "react";
import { Bell, Mail, MessageCircle, Smartphone } from "lucide-react";
import { useOSStore } from "@/stores/useOSStore";

function TopicChoice({ label, description, checked, onChange, icon: Icon }) {
  return (
    <label className="flex min-h-[68px] cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-3 py-3 transition hover:border-white/20 sm:px-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200"><Icon className="h-4 w-4" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-white">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-white/50">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 shrink-0 accent-amber-300" />
    </label>
  );
}

const NotificationsSettingsPage = () => {
  const settings = useOSStore((state) => state.settings);
  const setNotificationSetting = useOSStore((state) => state.setNotificationSetting);
  const notifications = settings.notifications || {};

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/70">Your space</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Reminders & updates</h1>
        <p className="mt-2 text-sm text-white/60">Choose what you would like to hear about.</p>
      </header>

      <section className="mb-4 rounded-3xl border border-amber-200/20 bg-amber-200/[0.06] p-4 sm:p-5" aria-label="Reminder delivery status">
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
          <div>
            <h2 className="text-sm font-semibold text-white">Reminder delivery is not connected yet</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/60">Your choices below are saved for your account, but this app is not currently sending reminder emails or phone notifications. We’ll show that clearly when delivery is ready.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-sm text-white/70"><Mail className="h-4 w-4 text-white/45" /> Email reminders <span className="ml-auto text-xs text-white/40">Not connected</span></div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-sm text-white/70"><Smartphone className="h-4 w-4 text-white/45" /> Phone alerts <span className="ml-auto text-xs text-white/40">Not connected</span></div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-6" aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="text-lg font-semibold text-white">Topics you care about</h2>
        <p className="mt-1 mb-4 text-sm text-white/55">These saved choices will guide reminders when delivery is available.</p>
        <div className="space-y-2">
          <TopicChoice label="Daily check-in" description="A gentle nudge to pause and check in with yourself." icon={Bell} checked={notifications.dailyCheckIn ?? true} onChange={(value) => setNotificationSetting("dailyCheckIn", value)} />
          <TopicChoice label="Progress moments" description="Celebrate milestones and personal wins." icon={Bell} checked={notifications.milestoneAlerts ?? true} onChange={(value) => setNotificationSetting("milestoneAlerts", value)} />
          <TopicChoice label="Messages from your practitioner" description="Know when a connected practitioner writes to you." icon={MessageCircle} checked={notifications.providerMessages ?? true} onChange={(value) => setNotificationSetting("providerMessages", value)} />
          <TopicChoice label="Community updates" description="Hear about activity in groups you joined." icon={MessageCircle} checked={notifications.circleActivity ?? true} onChange={(value) => setNotificationSetting("circleActivity", value)} />
        </div>
      </section>
    </main>
  );
};

export default NotificationsSettingsPage;
