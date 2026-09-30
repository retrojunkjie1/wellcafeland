import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, HandHeart, HeartHandshake, MessageSquare, Users } from "lucide-react";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { listAssignmentsForProvider } from "@/services/assignmentService";
import { getMyProviderAvailability, listAppointmentsForProvider } from "@/services/appointmentService";
import { getProviderClientOverview } from "@/services/practitionerRegistry";
import PageHeader from "@/components/navigation/PageHeader";
import ConnectionRequestsPanel from "./components/ConnectionRequestsPanel";
import { TOOLS } from "@/apps/tools/toolsRegistry";

const OUTCOME_LABELS = {
  tried: "Tried it",
  "not-yet": "Not yet",
  "not-a-fit": "Wasn’t a fit",
  "prefer-not-to-say": "Prefer not to say",
};

function formatAppointmentTime(value, timezone) {
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", timeZone: timezone }).format(date),
    time: new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZoneName: "short", timeZone: timezone }).format(date),
  };
}

export default function ProviderDashboardPage() {
  const navigate = useNavigate();
  const { isProvider, isAdmin, providerId, userId, isLoading: identityLoading } = useSessionIdentity();
  const identityScope = `${providerId || userId || ""}:${isProvider ? "provider" : isAdmin ? "admin" : "guest"}`;
  const identityScopeRef = useRef(identityScope);
  const clientRequestSequence = useRef(0);
  identityScopeRef.current = identityScope;
  const [clients, setClients] = useState([]);
  const [clientsScope, setClientsScope] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [appointmentsUnavailable, setAppointmentsUnavailable] = useState(false);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [timezoneFromAvailability, setTimezoneFromAvailability] = useState(false);
  const [scheduleRetry, setScheduleRetry] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadedScope, setLoadedScope] = useState("");

  const visibleClients = clientsScope === identityScope ? clients : [];
  const sharedUpdates = visibleClients.flatMap((client) => (client.overview?.practiceProgress || []).map((update) => ({
    ...update,
    clientId: client.clientId,
    alias: client.alias,
  }))).sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)).slice(0, 5);

  const refreshClients = useCallback(async () => {
    const id = providerId || userId;
    const requestScope = `${providerId || userId || ""}:${isProvider ? "provider" : isAdmin ? "admin" : "guest"}`;
    const requestId = ++clientRequestSequence.current;
    const isCurrentRequest = () => clientRequestSequence.current === requestId && identityScopeRef.current === requestScope;
    if (!id) {
      if (isCurrentRequest()) {
        setClients([]);
        setClientsScope(requestScope);
      }
      return;
    }
    const assignments = await listAssignmentsForProvider(id);
    if (!isCurrentRequest()) return;
    const overview = await Promise.all(assignments.map((assignment) =>
      getProviderClientOverview(assignment.clientId).catch(() => ({ unavailable: true, shared: false, checkins: [], practiceProgress: [] }))
    ));
    if (!isCurrentRequest()) return;
    setClients(assignments.map((assignment, index) => ({ ...assignment, alias: `Client ${index + 1}`, overview: overview[index] })));
    setClientsScope(requestScope);
  }, [isProvider, isAdmin, providerId, userId]);

  useEffect(() => {
    let active = true;
    if (identityLoading) return () => { active = false; };
    if (!isProvider && !isAdmin) { navigate("/"); return () => { active = false; }; }
    const load = async () => {
      const requestScope = identityScope;
      setLoading(true); setError("");
      try {
        const id = providerId || userId;
        if (!id) {
          setClients([]);
          setClientsScope(requestScope);
          setAppointments([]);
          setError("Your signed-in account could not be confirmed. Sign in again to load this workspace.");
          setLoadedScope(requestScope);
          return;
        }
        const [, upcomingResult, availabilityResult] = await Promise.all([
          refreshClients(),
          listAppointmentsForProvider(id, { from: new Date(), to: new Date(Date.now() + 14 * 86400000) })
            .then((value) => ({ value }))
            .catch(() => ({ unavailable: true })),
          getMyProviderAvailability()
            .then((value) => ({ value }))
            .catch(() => ({ unavailable: true })),
        ]);
        if (active && identityScopeRef.current === requestScope) {
          setAppointmentsUnavailable(upcomingResult.unavailable === true);
          if (!upcomingResult.unavailable) setAppointments((upcomingResult.value || []).slice(0, 6));
          const configuredTimezone = availabilityResult.value?.timezone;
          setTimezoneFromAvailability(Boolean(configuredTimezone));
          setTimezone(configuredTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
          setLoadedScope(requestScope);
        }
      } catch (err) {
        if (active && identityScopeRef.current === requestScope) {
          setClients([]);
          setClientsScope(requestScope);
          setAppointments([]);
          setAppointmentsUnavailable(false);
          setTimezoneFromAvailability(false);
          setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
          setError(err?.message || "Your practitioner workspace could not load.");
          setLoadedScope(requestScope);
        }
      }
      finally { if (active && identityScopeRef.current === requestScope) setLoading(false); }
    };
    load();
    return () => { active = false; clientRequestSequence.current += 1; };
  }, [identityLoading, isProvider, isAdmin, providerId, userId, navigate, refreshClients, scheduleRetry, identityScope]);

  if (identityLoading) return <div className="grid min-h-[45vh] place-items-center text-sm text-white/60" role="status">Checking your workspace…</div>;
  if (!isProvider && !isAdmin) return null;
  const currentScopeLoaded = loadedScope === identityScope;
  return <div className="min-h-screen bg-slate-950 text-white"><PageHeader title="Practitioner workspace" subtitle="Your people, schedule, and next steps" />
    <div className="lux-shell space-y-6 py-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-100/[0.09] via-white/[0.035] to-emerald-100/[0.04] p-5 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/65">A thoughtful space to offer support</p><h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Start with what each person has chosen to share.</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">Connection never opens private check-ins automatically. People can choose what you see and can change those choices at any time.</p><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => navigate("/provider/clients")} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950"><Users className="h-4 w-4" />My people</button><button onClick={() => navigate("/provider/schedule")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white/80"><CalendarDays className="h-4 w-4" />Schedule</button><button onClick={() => navigate("/provider/messages")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white/80"><MessageSquare className="h-4 w-4" />Messages</button><button onClick={() => navigate("/assistance/community")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white/80"><HandHeart className="h-4 w-4" />Community giving</button></div></section>
      {error && <p role="alert" className="rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>}
      {loading || !currentScopeLoaded ? <div className="py-10 text-center text-white/50">Loading your workspace…</div> : <>
        <div className="grid gap-6 lg:grid-cols-2"><ConnectionRequestsPanel onAccepted={refreshClients} /><section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><div className="mb-4 flex items-center gap-3"><CalendarDays className="h-5 w-5 text-amber-100" /><div><h2 className="font-medium">Coming up</h2><p className="text-xs text-white/50">Next two weeks · {timezoneFromAvailability ? `times in ${timezone}` : `your local time (${timezone})`}</p></div><button onClick={() => navigate("/provider/schedule")} className="ml-auto text-sm text-amber-100">Open schedule</button></div>{appointmentsUnavailable ? <div role="status" className="rounded-xl border border-amber-100/15 bg-amber-100/[0.04] p-4 text-sm text-amber-50/75"><p>Appointment information couldn’t be loaded. Your schedule may have changed.</p><button type="button" onClick={() => setScheduleRetry((value) => value + 1)} className="mt-3 min-h-10 rounded-lg border border-amber-100/25 px-3 text-sm text-amber-50 hover:bg-amber-100/10">Try again</button></div> : appointments.length ? <div className="space-y-2">{appointments.map((appointment) => { const time = formatAppointmentTime(appointment.startAt, timezone); return <div key={appointment.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-3"><div><p className="text-sm font-medium">{time.day}</p><p className="mt-1 text-xs text-white/55">{time.time} · {appointment.status}</p></div></div>; })}</div> : <p className="rounded-xl bg-slate-950/35 p-4 text-sm text-white/55">No appointments in the next two weeks. You can add one from Schedule.</p>}</section></div>
        <section className="rounded-2xl border border-sky-200/15 bg-sky-100/[0.025] p-5" aria-labelledby="shared-updates-title"><div className="flex items-center gap-3"><HeartHandshake className="h-5 w-5 text-sky-100" /><div><h2 id="shared-updates-title" className="font-semibold">Updates clients chose to share</h2><p className="text-xs text-white/50">Practice follow-ups sent directly to you</p></div><span className="ml-auto rounded-full bg-white/5 px-3 py-1 text-sm text-white/70">{sharedUpdates.length}</span></div>{sharedUpdates.length ? <ul className="mt-4 divide-y divide-white/8">{sharedUpdates.map((update) => { const tool = TOOLS.find((item) => item.id === update.toolId); const date = update.submittedAt ? new Date(update.submittedAt) : null; const dateLabel = date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date) : "Recently"; return <li key={update.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0 flex-1"><p className="text-sm font-medium text-white">{update.alias} <span className="font-normal text-white/45">· {tool?.name || "Shared practice"}</span></p><p className="mt-1 text-xs text-sky-100/70">{OUTCOME_LABELS[update.outcome] || "Update"} · {dateLabel}</p></div><button type="button" onClick={() => navigate(`/provider/clients/${encodeURIComponent(update.clientId)}`)} className="min-h-9 rounded-lg border border-white/15 px-3 text-xs text-white/75 hover:bg-white/[0.05]">Review client</button></li>; })}</ul> : <p className="mt-4 rounded-xl bg-slate-950/35 p-4 text-sm leading-relaxed text-white/55">No client-shared practice updates yet. When a client chooses to send an update, it will appear here.</p>}</section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6"><div className="flex items-center gap-3"><HeartHandshake className="h-5 w-5 text-emerald-200" /><div><h2 className="font-semibold">Your connected people</h2><p className="text-xs text-white/50">Progress appears only when someone shares it with you.</p></div><span className="ml-auto rounded-full bg-white/5 px-3 py-1 text-sm text-white/70">{visibleClients.length}</span></div>{visibleClients.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{visibleClients.map((client) => { const view = client.overview; const recent = view?.checkins?.[0]; return <button key={client.id} onClick={() => navigate(`/provider/clients/${client.clientId}`)} className="rounded-xl border border-white/10 bg-slate-950/45 p-4 text-left transition hover:border-amber-100/25"><h3 className="font-medium">{client.alias}</h3>{view?.unavailable ? <p className="mt-1 text-xs leading-relaxed text-amber-100/70">Sharing details couldn’t be confirmed. Open this client’s page or refresh before acting on their current sharing choices.</p> : view?.sharingPaused ? <p className="mt-1 text-xs leading-relaxed text-amber-100/70">{view.sharingStatusUnknown ? "Personal sharing is hidden because its status could not be confirmed." : "Personal sharing is temporarily paused. Existing client choices remain saved."}</p> : view?.shared ? <><p className="mt-1 text-xs text-white/55">{view.totalRecentCheckins} recent check-ins shared{view.latestCheckInAt ? ` · last ${new Date(view.latestCheckInAt).toLocaleDateString()}` : ""}</p><div className="mt-3 flex flex-wrap gap-2 text-xs">{recent?.mood && <span className="rounded-lg bg-white/5 px-2 py-1">Mood: {recent.mood}</span>}{recent?.cravingStatus && <span className="rounded-lg bg-white/5 px-2 py-1">Craving: {recent.cravingStatus}{recent.cravingIntensity != null ? ` ${recent.cravingIntensity}/10` : ""}</span>}{recent?.triggerStatus && <span className="rounded-lg bg-white/5 px-2 py-1">Trigger: {recent.triggerStatus}{recent.triggerIntensity != null ? ` ${recent.triggerIntensity}/10` : ""}</span>}</div></> : <p className="mt-1 text-xs text-white/45">No check-in details shared. Private by default.</p>}{view?.practiceProgress?.length > 0 && <p className="mt-3 text-xs text-sky-100/70">{view.practiceProgress.length} client-shared practice {view.practiceProgress.length === 1 ? "update" : "updates"}</p>}</button>; })}</div> : <p className="mt-4 rounded-xl bg-slate-950/35 p-4 text-sm text-white/55">People appear here after they request a connection and you accept.</p>}</section>
      </>}
    </div>
  </div>;
}
