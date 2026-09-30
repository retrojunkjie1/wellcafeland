import React from "react";
import { Bell } from "lucide-react";

function PolicySwitch({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${checked ? "bg-emerald-500" : "bg-muted"}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-background shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

export default function AdminNotificationPolicy({ notifications, onChange }) {
  const updateQuietHours = (patch) => onChange("quietHours", { ...notifications.quietHours, ...patch });

  return (
    <section className="lux-card space-y-4 p-4" aria-labelledby="notification-policy-title">
      <div className="flex flex-wrap items-center gap-2">
        <Bell aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
        <h2 id="notification-policy-title" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notification policy</h2>
        <span className="ml-auto rounded-full border border-amber-200/20 bg-amber-100/[0.06] px-2.5 py-1 text-xs font-medium text-amber-100">Delivery not connected</span>
      </div>

      <p className="rounded-xl border border-amber-200/15 bg-amber-100/[0.035] p-3 text-sm leading-relaxed text-foreground/75">
        These preferences can be saved for policy planning. They do not send push, email, or in-app alerts yet.
      </p>

      <div className="space-y-4">
        <PolicySwitch label="Enable notification policy" checked={notifications.enabled} onChange={(value) => onChange("enabled", value)} />
        <PolicySwitch label="Risk alert policy" checked={notifications.riskAlerts} onChange={(value) => onChange("riskAlerts", value)} />
        <PolicySwitch label="Session reminder policy" checked={notifications.sessionReminders} onChange={(value) => onChange("sessionReminders", value)} />
        <PolicySwitch label="Recovery milestone policy" checked={notifications.streakMilestones} onChange={(value) => onChange("streakMilestones", value)} />

        <div className="border-t border-border/50 pt-3">
          <label htmlFor="notification-policy-frequency" className="mb-2 block text-sm text-foreground">Planned frequency</label>
          <select id="notification-policy-frequency" value={notifications.frequency} onChange={(event) => onChange("frequency", event.target.value)} className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="low">Low · fewer notices</option>
            <option value="moderate">Moderate · balanced</option>
            <option value="high">High · more notices</option>
          </select>
        </div>

        <div className="border-t border-border/50 pt-3">
          <PolicySwitch label="Planned quiet hours" checked={notifications.quietHours.enabled} onChange={(value) => updateQuietHours({ enabled: value })} />
          {notifications.quietHours.enabled && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-sm text-foreground/75">
                Start
                <input aria-label="Quiet hours start" type="number" min="0" max="23" value={notifications.quietHours.start} onChange={(event) => updateQuietHours({ start: Number.parseInt(event.target.value, 10) })} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm" />
              </label>
              <label className="text-sm text-foreground/75">
                End
                <input aria-label="Quiet hours end" type="number" min="0" max="23" value={notifications.quietHours.end} onChange={(event) => updateQuietHours({ end: Number.parseInt(event.target.value, 10) })} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm" />
              </label>
            </div>
          )}
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Hours are shown in the server policy only; delivery will need a time-zone-aware notification service.</p>
        </div>
      </div>
    </section>
  );
}
