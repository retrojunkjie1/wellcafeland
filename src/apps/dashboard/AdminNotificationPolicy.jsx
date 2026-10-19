import React, { useState } from "react";
import { Bell } from "lucide-react";
import callAgent from "../../ai/agents/agentClient";

function PolicySwitch({ label, checked, onChange, disabled = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "bg-emerald-500" : "bg-muted"}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-background shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

export default function AdminNotificationPolicy({ notifications, onChange, disabled = false, hidden = false }) {
  const updateQuietHours = (patch) => onChange("quietHours", { ...notifications.quietHours, ...patch });
  const [updateType, setUpdateType] = useState("feature");
  const [audience, setAudience] = useState("everyone");
  const [draft, setDraft] = useState(null);
  const [draftState, setDraftState] = useState({ loading: false, error: "", copied: false });

  const createDraft = async () => {
    setDraftState({ loading: true, error: "", copied: false });
    setDraft(null);
    try {
      const response = await callAgent("towncrier", { updateType, audience });
      setDraft(response.result || response);
      setDraftState({ loading: false, error: "", copied: false });
    } catch (error) {
      setDraftState({ loading: false, error: error?.message || "Towncrier could not prepare a draft. Try again later.", copied: false });
    }
  };

  const copyDraft = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(`${draft.title}\n\n${draft.message}`);
      setDraftState((current) => ({ ...current, copied: true }));
    } catch {
      setDraftState((current) => ({ ...current, error: "Copy is unavailable here. Select the draft text and copy it manually." }));
    }
  };

  return (
    <section id="god-eye-settings-panel-notifications" role="tabpanel" aria-labelledby="god-eye-settings-tab-notifications" hidden={hidden} className="lux-card space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Bell aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
        <h2 id="notification-policy-title" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notification policy</h2>
        <span className="ml-auto rounded-full border border-amber-200/20 bg-amber-100/[0.06] px-2.5 py-1 text-xs font-medium text-amber-100">Delivery not connected</span>
      </div>

      <p className="rounded-xl border border-amber-200/15 bg-amber-100/[0.035] p-3 text-sm leading-relaxed text-foreground/75">
        These preferences can be saved for policy planning. They do not send push, email, or in-app alerts yet.
      </p>

      <section aria-labelledby="towncrier-draft-title" className="rounded-2xl border border-border/70 bg-background/40 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 id="towncrier-draft-title" className="text-sm font-semibold text-foreground">Draft a service update</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Towncrier prepares editable wording from the selected category. Review every detail before publication.</p>
          </div>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">Draft only · not sent</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-foreground/80">
            Update type
            <select aria-label="Update type" disabled={disabled || draftState.loading} value={updateType} onChange={(event) => setUpdateType(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground">
              <option value="feature">New feature or practice</option>
              <option value="maintenance">Planned maintenance</option>
              <option value="privacy">Privacy or account settings</option>
              <option value="resource">General support resource</option>
            </select>
          </label>
          <label className="text-sm text-foreground/80">
            Audience
            <select aria-label="Audience" disabled={disabled || draftState.loading} value={audience} onChange={(event) => setAudience(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground">
              <option value="everyone">Clients and practitioners</option>
              <option value="clients">Clients</option>
              <option value="practitioners">Practitioners</option>
            </select>
          </label>
        </div>
        <button type="button" disabled={disabled || draftState.loading} onClick={createDraft} className="mt-3 min-h-11 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">
          {draftState.loading ? "Preparing draft…" : "Prepare announcement draft"}
        </button>
        {draftState.error && <p role="alert" className="mt-3 text-sm text-rose-300">{draftState.error}</p>}
        {draft && (
          <div aria-live="polite" className="mt-4 space-y-3 rounded-xl border border-border bg-card p-4">
            <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Draft title</h4><p className="mt-1 text-base font-semibold text-foreground">{draft.title}</p></div>
            <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Message</h4><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{draft.message}</p></div>
            <p className="text-xs leading-relaxed text-muted-foreground">Review before use: {draft.reviewNote}</p>
            <button type="button" onClick={copyDraft} className="min-h-10 rounded-lg border border-border px-3 text-sm font-medium text-foreground">{draftState.copied ? "Copied draft" : "Copy title and message"}</button>
          </div>
        )}
      </section>

      <div className="space-y-4">
        <PolicySwitch label="Enable notification policy" checked={notifications.enabled} onChange={(value) => onChange("enabled", value)} disabled={disabled} />
        <PolicySwitch label="Risk alert policy" checked={notifications.riskAlerts} onChange={(value) => onChange("riskAlerts", value)} disabled={disabled} />
        <PolicySwitch label="Session reminder policy" checked={notifications.sessionReminders} onChange={(value) => onChange("sessionReminders", value)} disabled={disabled} />
        <PolicySwitch label="Recovery milestone policy" checked={notifications.streakMilestones} onChange={(value) => onChange("streakMilestones", value)} disabled={disabled} />

        <div className="border-t border-border/50 pt-3">
          <label htmlFor="notification-policy-frequency" className="mb-2 block text-sm text-foreground">Planned frequency</label>
          <select id="notification-policy-frequency" disabled={disabled} value={notifications.frequency} onChange={(event) => onChange("frequency", event.target.value)} className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="low">Low · fewer notices</option>
            <option value="moderate">Moderate · balanced</option>
            <option value="high">High · more notices</option>
          </select>
        </div>

        <div className="border-t border-border/50 pt-3">
          <PolicySwitch label="Planned quiet hours" checked={notifications.quietHours.enabled} onChange={(value) => updateQuietHours({ enabled: value })} disabled={disabled} />
          {notifications.quietHours.enabled && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-sm text-foreground/75">
                Start
                <input aria-label="Quiet hours start" disabled={disabled} type="number" min="0" max="23" value={notifications.quietHours.start} onChange={(event) => updateQuietHours({ start: Number.parseInt(event.target.value, 10) })} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm" />
              </label>
              <label className="text-sm text-foreground/75">
                End
                <input aria-label="Quiet hours end" disabled={disabled} type="number" min="0" max="23" value={notifications.quietHours.end} onChange={(event) => updateQuietHours({ end: Number.parseInt(event.target.value, 10) })} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm" />
              </label>
            </div>
          )}
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Hours are shown in the server policy only; delivery will need a time-zone-aware notification service.</p>
        </div>
      </div>
    </section>
  );
}
