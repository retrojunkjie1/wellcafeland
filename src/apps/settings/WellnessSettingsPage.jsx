import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, Bell, Brain, ChevronDown, Eye, Palette,
  Shield, Sparkles, UserRound, Users, WandSparkles,
} from "lucide-react";
import { useOSStore } from "@/stores/useOSStore";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import {
  clearConversationMemory,
  hasAccountConversationMemory,
  listConversationMemory,
} from "@/services/conversationMemory";

function HelpDetails({ label, children }) {
  return (
    <details className="wc-help-details mt-2">
      <summary className="min-h-9 cursor-pointer list-none text-sm font-medium text-amber-200/85 underline decoration-amber-200/35 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">
        {label}
      </summary>
      <div className="mt-2 rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-sm leading-relaxed text-white/75 sm:px-4">
        {children}
      </div>
    </details>
  );
}

function SettingSwitch({ label, checked, disabled = false, onChange, help, summary }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-3 py-3 sm:px-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-0.5 text-xs text-white/50">{summary}</p>
        <HelpDetails label="What does this change?">{help}</HelpDetails>
      </div>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
        className={`relative h-7 w-12 flex-shrink-0 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 ${checked ? "bg-amber-300/80" : "bg-white/15"} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}

function SettingsCard({ to, icon: Icon, tint, title, value, detail }) {
  return (
    <Link to={to} className="group flex min-h-[112px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">
      <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${tint}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="mt-1 block text-xs text-white/55">{value}</span>
        <span className="mt-2 block text-xs text-white/35">{detail}</span>
      </span>
      <ArrowRight className="h-4 w-4 flex-shrink-0 text-white/35 transition group-hover:translate-x-1 group-hover:text-amber-200" />
    </Link>
  );
}

const WellnessSettingsPage = () => {
  const navigate = useNavigate();
  const identity = useSessionIdentity();
  const [memoryStatus, setMemoryStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviewingMemory, setReviewingMemory] = useState(false);
  const [memoryEntries, setMemoryEntries] = useState(null);
  const settings = useOSStore((state) => state.settings);
  const setAllowEmotionFromChat = useOSStore((state) => state.setAllowEmotionFromChat);
  const setAllowFaceSignals = useOSStore((state) => state.setAllowFaceSignals);
  const setTrajectoryTrackingEnabled = useOSStore((state) => state.setTrajectoryTrackingEnabled);
  const setPersonalizationMemoryEnabled = useOSStore((state) => state.setPersonalizationMemoryEnabled);
  const setRecoveryStorySuggestionsEnabled = useOSStore((state) => state.setRecoveryStorySuggestionsEnabled);
  const canUseAccountMemory = hasAccountConversationMemory();
  const memoryEnabled = canUseAccountMemory && settings.personalizationMemoryEnabled === true;
  const themeLabel = settings.themeMode === "dawn" ? "Dawn appearance" : settings.themeMode === "system" ? "Follows your device" : "Deep Night appearance";

  const handleMemoryToggle = async () => {
    if (!canUseAccountMemory) return;
    setMemoryStatus("");
    setMemoryEntries(null);
    const enabling = !memoryEnabled;
    setPersonalizationMemoryEnabled(enabling);
    if (enabling) {
      setMemoryStatus("Memory is on for this account.");
      return;
    }
    setBusy(true);
    const cleared = await clearConversationMemory();
    setMemoryStatus(cleared
      ? "Memory is off and saved guide exchanges were cleared."
      : "Memory is off. Saved exchanges are not being used; clearing them didn’t finish. You can retry below.");
    setBusy(false);
  };

  const handleReviewMemory = async () => {
    setBusy(true);
    setMemoryStatus("");
    const result = await listConversationMemory();
    setMemoryEntries(result.ok ? result.entries : null);
    setReviewingMemory(true);
    setMemoryStatus(result.ok
      ? result.entries.length ? `Showing ${Math.min(result.entries.length, 50)} recent saved exchanges.` : "No saved guide exchanges yet."
      : "Couldn’t load saved memory. Check your connection and try again.");
    setBusy(false);
  };

  const handleClearMemory = async () => {
    setBusy(true);
    setMemoryStatus("");
    const cleared = await clearConversationMemory();
    if (cleared) setMemoryEntries([]);
    setMemoryStatus(cleared ? "Saved guide memory cleared." : "Couldn’t clear saved memory. Try again.");
    setBusy(false);
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 text-white sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/75">
            <Sparkles className="h-4 w-4" /> Your space
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Wellness settings</h1>
          <p className="mt-1 text-sm text-white/55">Shape how the OS supports you.</p>
        </div>
        <Link to="/profile" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-white/70 transition hover:border-white/20 hover:text-white">
          <UserRound className="h-4 w-4" /> Account <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      <section aria-labelledby="settings-map-heading" className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="settings-map-heading" className="text-sm font-semibold text-white/90">All your controls</h2>
          <span className="text-xs text-white/35">Choose a space</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SettingsCard to="/settings/preferences" icon={Palette} tint="bg-violet-400/10 text-violet-200" title="Look & feel" value={themeLabel} detail="Theme & page spacing" />
          <SettingsCard to="/settings/notifications" icon={Bell} tint="bg-sky-400/10 text-sky-200" title="Reminders & updates" value="Choose topics you care about" detail="Delivery setup is shown clearly" />
          <SettingsCard to="/settings/privacy" icon={Shield} tint="bg-emerald-400/10 text-emerald-200" title="Privacy & your data" value="Your data, your choices" detail="Review, export & privacy controls" />
          <SettingsCard to="/settings/practitioner-sharing" icon={Users} tint="bg-amber-300/10 text-amber-200" title="Practitioner sharing" value="You decide what is shared" detail="Manage each care connection" />
          {identity.isProvider && <SettingsCard to="/provider/dashboard" icon={WandSparkles} tint="bg-cyan-300/10 text-cyan-100" title="Practitioner workspace" value="Your service space" detail="Clients, schedule & shared practices" />}
          {identity.isAdmin && <SettingsCard to="/admin/overseer" icon={Eye} tint="bg-rose-300/10 text-rose-100" title="God-Eye console" value="Admin operations" detail="Agents, system status & review" />}
        </div>
      </section>

      <section aria-labelledby="support-preferences-heading" className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#111827] via-[#101624] to-[#0d1420] p-4 shadow-xl shadow-black/20 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/70"><Brain className="h-4 w-4" /> Personal support</p>
            <h2 id="support-preferences-heading" className="text-lg font-semibold">Guide preferences</h2>
            <p className="mt-1 text-xs text-white/45">Optional choices. Change them any time.</p>
          </div>
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Let the guide notice message tone"
            summary={settings.allowEmotionFromChat ? "On · optional tone clues are considered" : "Off · the guide uses your words only"}
            checked={settings.allowEmotionFromChat}
            onChange={() => setAllowEmotionFromChat(!settings.allowEmotionFromChat)}
            help="When this is on, the guide may use clues in new messages to shape its reply. It can be wrong and is not a diagnosis. Turn it off to remove saved tone analysis from this device."
          />
          <SettingSwitch
            label="Use a camera photo in chat"
            summary={settings.allowFaceSignals ? "On · only when you choose to use it" : "Off · the camera is not used"}
            checked={settings.allowFaceSignals}
            onChange={() => setAllowFaceSignals(!settings.allowFaceSignals)}
            help="The camera opens only when you choose it. A photo can help the Guide describe visible details; it cannot reveal feelings or assess health. The photo stays in your message box until you choose Send, and you can remove it first. This setting is separate from message-tone preferences."
          />
          <SettingSwitch
            label="Keep personal progress patterns"
            summary={settings.trajectoryTrackingEnabled ? "On · saved on this device" : "Off · no new patterns are kept"}
            checked={settings.trajectoryTrackingEnabled}
            onChange={() => setTrajectoryTrackingEnabled(!settings.trajectoryTrackingEnabled)}
            help="The app can keep simple patterns from your check-ins so you can notice change over time. This is for reflection, not diagnosis. Turning it off clears the saved pattern snapshots on this device."
          />
          <SettingSwitch
            label="Remember guide conversations"
            summary={memoryEnabled ? "On · saved to your account" : "Off · nothing new is saved"}
            checked={memoryEnabled}
            disabled={!canUseAccountMemory}
            onChange={handleMemoryToggle}
            help="When enabled, successful text exchanges are saved to your account and recent exchanges can help the guide continue a conversation. This personalizes replies; it does not train the AI model. Turn it off to clear saved guide exchanges."
          />
          <SettingSwitch
            label="Offer optional recovery stories"
            summary={settings.recoveryStorySuggestionsEnabled ? "On · shown after a saved check-in" : "Off · you can still browse stories yourself"}
            checked={settings.recoveryStorySuggestionsEnabled === true}
            onChange={() => setRecoveryStorySuggestionsEnabled(!settings.recoveryStorySuggestionsEnabled)}
            help="When on, a small invitation to explore a sourced public recovery story may appear after you save a check-in. It is not chosen from your private answers. Stories are inspiration, not treatment plans."
          />
        </div>

        {!canUseAccountMemory && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/15 px-3 py-3">
            <p className="text-xs text-white/55">Sign in to use memory across your account.</p>
            <button type="button" onClick={() => navigate("/login")} className="min-h-9 rounded-full border border-amber-200/30 px-4 text-xs font-semibold text-amber-100 hover:bg-amber-200/10">Sign in</button>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={!canUseAccountMemory || busy} onClick={handleReviewMemory} className="min-h-10 rounded-full border border-white/15 px-4 text-xs font-medium text-white/75 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40">
            {busy && reviewingMemory ? "Loading…" : reviewingMemory ? "Refresh saved exchanges" : "Review saved exchanges"}
          </button>
          <button type="button" disabled={!canUseAccountMemory || busy} onClick={handleClearMemory} className="min-h-10 rounded-full border border-white/10 px-4 text-xs text-white/50 transition hover:border-rose-200/30 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-40">
            {busy && !reviewingMemory ? "Clearing…" : "Clear saved memory"}
          </button>
        </div>
        {memoryStatus && <p role="status" className="mt-3 text-xs text-white/60">{memoryStatus}</p>}
        {reviewingMemory && memoryEntries?.length > 0 && (
          <div className="mt-4 max-h-80 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-3" aria-label="Saved guide exchanges">
            {memoryEntries.map((entry) => (
              <article key={entry.id} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-xs">
                <p className="mb-2 text-[10px] text-white/35">{Number.isFinite(entry.savedAt) ? new Date(entry.savedAt).toLocaleString() : "Saved exchange"}</p>
                <p className="font-semibold text-amber-100">You</p><p className="mb-3 whitespace-pre-wrap text-white/75">{entry.user}</p>
                <p className="font-semibold text-emerald-100">Guide</p><p className="whitespace-pre-wrap text-white/75">{entry.assistant}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-4 flex items-center justify-between gap-3 px-1 text-xs text-white/35">
        <span>More choices live in each settings space.</span>
        <Link to="/privacy" className="inline-flex items-center gap-1 hover:text-white/70">Privacy notice <ChevronDown className="h-3 w-3 -rotate-90" /></Link>
      </footer>
    </main>
  );
};

export default WellnessSettingsPage;
