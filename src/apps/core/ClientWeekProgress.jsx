import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, Heart, RefreshCw, Sparkles, Upload, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getMyCheckInWeekSummary } from "@/services/checkInHistory";
import { GUEST_CHECKINS_STORAGE_KEY } from "./checkInConstants";
import { summarizeCheckInWeek } from "../milestones/milestoneProgress";
import { getCheckInNextStep } from "./checkInNextStep";
import { importGuestCheckIns, prepareGuestCheckInsForImport } from "@/services/guestCheckInMigration";

function guestSummary() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_CHECKINS_STORAGE_KEY) || "[]");
    return summarizeCheckInWeek(Array.isArray(parsed) ? parsed : []);
  } catch {
    return summarizeCheckInWeek([]);
  }
}

function readGuestCheckIns() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_CHECKINS_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.slice(-30) : [];
  } catch {
    return [];
  }
}

function writeGuestCheckIns(entries) {
  localStorage.setItem(GUEST_CHECKINS_STORAGE_KEY, JSON.stringify(entries));
}

function guestDateRange(entries) {
  const dates = entries.map((entry) => {
    const date = new Date(entry?.timestamp || `${entry?.date || ""}T12:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }).filter(Boolean).sort((a, b) => a - b);
  if (!dates.length) return "Dates unavailable";
  const format = (date) => date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return dates[0].toDateString() === dates.at(-1).toDateString()
    ? format(dates[0])
    : `${format(dates[0])} – ${format(dates.at(-1))}`;
}

function WeekChart({ days }) {
  const peak = Math.max(1, ...days.map(({ count }) => count));
  return (
    <div className="grid grid-cols-7 gap-2" role="list" aria-label="Check-ins by day this week">
      {days.map((day) => (
        <div key={day.date} role="listitem" aria-label={`${day.label}: ${day.count} check-ins`} className="min-w-0 text-center">
          <div className="flex h-14 items-end overflow-hidden rounded-xl border border-white/[0.06] bg-slate-950/45 p-1">
            <span
              aria-hidden="true"
              className={`block w-full rounded-lg transition-all ${day.count ? "bg-gradient-to-t from-amber-300/80 to-emerald-200/75" : "bg-white/[0.045]"}`}
              style={{ height: day.count ? `${Math.max(24, (day.count / peak) * 100)}%` : "10%" }}
            />
          </div>
          <span className={`mt-1.5 block text-xs ${day.isToday ? "font-semibold text-amber-100" : "text-white/45"}`}>{day.label}</span>
        </div>
      ))}
    </div>
  );
}

function WeekMetric({ icon: Icon, count, label, tone }) {
  return (
    <div className="flex min-h-[5.25rem] items-center gap-3 rounded-2xl border border-white/[0.08] bg-slate-950/30 px-3 py-3 sm:px-4">
      <span className={`rounded-xl p-2 ${tone}`}><Icon aria-hidden="true" className="h-4 w-4" /></span>
      <div className="min-w-0"><p className="text-xl font-semibold leading-none text-white">{count}</p><p className="mt-1.5 text-xs leading-snug text-white/55">{label}</p></div>
    </div>
  );
}

export default function ClientWeekProgress() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const signedIn = Boolean(user?.uid && !user.isAnonymous);
  const scope = signedIn ? `account:${user.uid}` : "guest";
  const [state, setState] = useState({ scope: "", summary: null, loading: true, error: "" });
  const [deviceEntries, setDeviceEntries] = useState([]);
  const [importState, setImportState] = useState({ status: "idle", message: "" });
  const sequence = useRef(0);
  const scopeRef = useRef(scope);

  useEffect(() => { scopeRef.current = scope; }, [scope]);

  const load = useCallback(async () => {
    const requestId = ++sequence.current;
    const requestScope = scope;
    setState({ scope: requestScope, summary: null, loading: true, error: "" });
    try {
      const summary = signedIn ? await getMyCheckInWeekSummary() : guestSummary();
      if (requestId === sequence.current && requestScope === scopeRef.current) {
        setState({ scope: requestScope, summary, loading: false, error: "" });
      }
    } catch {
      if (requestId === sequence.current && requestScope === scopeRef.current) {
        setState({ scope: requestScope, summary: null, loading: false, error: "This week's progress could not load." });
      }
    }
  }, [scope, signedIn]);

  useEffect(() => {
    if (authLoading) return undefined;
    setDeviceEntries(signedIn ? readGuestCheckIns() : []);
    setImportState({ status: "idle", message: "" });
    load();
    return () => { sequence.current += 1; };
  }, [authLoading, load, signedIn]);

  const handleImportDeviceEntries = async () => {
    if (!signedIn || !deviceEntries.length || importState.status === "saving") return;
    setImportState({ status: "saving", message: "Preparing your device copy…" });
    try {
      const prepared = prepareGuestCheckInsForImport(deviceEntries);
      // Persist stable import IDs before sending. If the connection drops and
      // the user retries, the same account documents are safely overwritten.
      writeGuestCheckIns(prepared);
      setDeviceEntries(prepared);
      await importGuestCheckIns(prepared);
      setImportState({ status: "complete", message: `${prepared.length} ${prepared.length === 1 ? "check-in was" : "check-ins were"} copied to your account. The device copy is still here until you clear it.` });
      await load();
    } catch {
      setImportState({ status: "error", message: "We couldn’t copy these check-ins. The device copy is still here; try again when you are ready." });
    }
  };

  const handleClearDeviceCopy = () => {
    try {
      localStorage.removeItem(GUEST_CHECKINS_STORAGE_KEY);
      setDeviceEntries([]);
      setImportState({ status: "idle", message: "The device copy was cleared. Your account copy remains saved." });
    } catch {
      setImportState({ status: "error", message: "The device copy could not be cleared from this browser." });
    }
  };

  const summary = state.scope === scope ? state.summary : null;
  const loading = authLoading || state.scope !== scope || state.loading;
  const resumeStep = summary?.latestSupportChoice && summary.latestSupportChoice !== "I am not sure yet"
    ? getCheckInNextStep(summary.latestSupportChoice)
    : null;

  return (
    <section aria-labelledby="client-week-progress-title" className="overflow-hidden rounded-[1.75rem] border border-amber-100/15 bg-gradient-to-br from-[#17222a] via-[#111922] to-[#0d1420] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.2)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="rounded-2xl border border-amber-100/15 bg-amber-100/[0.07] p-2.5 text-amber-100"><CalendarDays aria-hidden="true" className="h-5 w-5" /></span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-100/65">Your check-in journey</p>
            <h2 id="client-week-progress-title" className="mt-1 text-lg font-semibold text-white">This week, at your pace</h2>
            <p className="mt-1 text-sm text-white/55">A small picture of what you chose to record.</p>
          </div>
        </div>
        {!loading && !state.error && summary && (
          <span className="rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-xs text-white/65">
            {summary.daysCheckedIn} {summary.daysCheckedIn === 1 ? "day" : "days"} checked in
          </span>
        )}
      </div>

      {signedIn && deviceEntries.length > 0 && (
        <details className="mt-4 rounded-2xl border border-amber-100/15 bg-slate-950/30 p-4">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-amber-100/90">
            Check-ins saved on this device · {deviceEntries.length}
          </summary>
          <div className="border-t border-white/[0.08] pt-3">
            <p className="text-sm text-white/75">{guestDateRange(deviceEntries)}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">Review before copying: this includes the answers you saved, including any longer private reflections. Copying places them in your account history. It does not share them with a practitioner; your sharing choices stay separate.</p>
            {importState.message && <p role={importState.status === "error" ? "alert" : "status"} className={`mt-3 text-sm ${importState.status === "error" ? "text-rose-100/85" : "text-emerald-100/85"}`}>{importState.message}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {importState.status !== "complete" && <button type="button" onClick={handleImportDeviceEntries} disabled={importState.status === "saving"} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-200 px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-100 disabled:cursor-wait disabled:opacity-60"><Upload aria-hidden="true" className="h-4 w-4" />{importState.status === "saving" ? "Copying check-ins…" : "Copy to my account"}</button>}
              {importState.status === "complete" && <button type="button" onClick={handleClearDeviceCopy} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/80 transition hover:bg-white/[0.06]"><Trash2 aria-hidden="true" className="h-4 w-4" />Clear device copy</button>}
            </div>
          </div>
        </details>
      )}
      {signedIn && deviceEntries.length === 0 && importState.message && (
        <p role={importState.status === "error" ? "alert" : "status"} className={`mt-3 rounded-xl border px-4 py-3 text-sm ${importState.status === "error" ? "border-rose-200/20 bg-rose-100/[0.05] text-rose-100/85" : "border-emerald-200/15 bg-emerald-100/[0.04] text-emerald-100/85"}`}>
          {importState.message}
        </p>
      )}

      {loading ? (
        <p role="status" className="mt-4 rounded-2xl border border-white/[0.07] bg-black/10 px-4 py-3 text-sm text-white/55">Gathering this week’s check-ins…</p>
      ) : state.error ? (
        <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200/20 bg-rose-100/[0.05] px-4 py-3">
          <p className="text-sm text-rose-100/85">{state.error}</p>
          <button type="button" onClick={load} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/80"><RefreshCw aria-hidden="true" className="h-4 w-4" />Try again</button>
        </div>
      ) : summary.weekCheckInCount === 0 ? (
        <div className="mt-4 rounded-2xl border border-white/[0.08] bg-slate-950/30 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <p className="text-sm leading-relaxed text-white/70">No check-ins saved this week. Anything you recorded before still counts, and there is nothing to catch up on.</p>
          <button type="button" onClick={() => navigate("/check-in")} className="mt-3 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-amber-200 px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-100 sm:mt-0">Check in when ready<ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">{summary.weekCheckInCount} {summary.weekCheckInCount === 1 ? "check-in" : "check-ins"} this week</p>
              <WeekChart days={summary.weekDays} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <WeekMetric icon={Sparkles} count={summary.skillEntries} label="skills you named" tone="bg-amber-100/[0.08] text-amber-100" />
              <WeekMetric icon={Heart} count={summary.gratitudeEntries} label="gratitude notes" tone="bg-rose-100/[0.08] text-rose-100" />
            </div>
          </div>
          {summary.plannedSupportEntries > 0 && <p className="mt-3 text-sm text-emerald-100/75">You also noted a plan or support in {summary.plannedSupportEntries} {summary.plannedSupportEntries === 1 ? "check-in" : "check-ins"}.</p>}
          {resumeStep && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100/15 bg-emerald-100/[0.045] p-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100/70">A choice from your recent check-in</p>
                <p className="mt-1 text-sm text-white/85">You chose: {summary.latestSupportChoice}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/50">Your saved choice—not an assessment. You can change direction at any time.</p>
              </div>
              <button type="button" onClick={() => navigate(resumeStep.path, { state: { from: "home-check-in-progress" } })} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-emerald-100/20 px-4 text-sm font-medium text-emerald-50 transition hover:bg-emerald-100/[0.07]">
                {resumeStep.action}<ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-3">
        <button type="button" onClick={() => navigate("/dashboard")} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]">Check-in history<ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
        <button type="button" onClick={() => navigate("/milestones")} className="inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-amber-100/85 transition hover:bg-amber-100/[0.06]">Milestones<ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
        {!signedIn && <span className="ml-auto text-xs text-white/40">Guest check-ins stay on this device.</span>}
      </div>
    </section>
  );
}
