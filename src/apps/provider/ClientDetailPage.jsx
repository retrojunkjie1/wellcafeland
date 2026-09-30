import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, ChevronRight, Clock3, HeartHandshake, LockKeyhole, MessageSquare, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { listAssignmentsForProvider } from "@/services/assignmentService";
import { getMyProviderAvailability, listAppointmentsForProviderClient } from "@/services/appointmentService";
import { getProviderClientOverview } from "@/services/practitionerRegistry";
import PageHeader from "@/components/navigation/PageHeader";
import ClientSharedSupportPanel from "./components/ClientSharedSupportPanel";

const SCOPE_LABELS = {
  recoveryProgress: "Recovery progress",
  wellnessPatterns: "Wellness patterns",
  writtenReflections: "Written reflections",
  assessments: "Assessment answers",
};

function formatDate(value, options = { weekday: "short", month: "short", day: "numeric" }) {
  if (!value) return "Date not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date not set" : date.toLocaleDateString(undefined, options);
}

export default function ClientDetailPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { isProvider, isAdmin, providerId, providerType, userId, isLoading: identityLoading } = useSessionIdentity();
  const [connection, setConnection] = useState(null);
  const [overview, setOverview] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [appointmentsUnavailable, setAppointmentsUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [loadedScope, setLoadedScope] = useState("");
  const requestSequence = useRef(0);
  const scopeKey = `${providerId || userId || ""}:${clientId || ""}`;

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (!clientId) return;
    const requestId = ++requestSequence.current;
    const requestScope = `${providerId || userId || ""}:${clientId}`;
    const isCurrentRequest = () => requestSequence.current === requestId;
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const assignments = await listAssignmentsForProvider(providerId || userId);
      if (!isCurrentRequest()) return;
      const activeConnection = assignments.find((item) => item.clientId === clientId && item.status === "active");
      if (!activeConnection) {
        setConnection(null);
        setOverview(null);
        setAppointments([]);
        setAppointmentsUnavailable(false);
        setLoadedScope(requestScope);
        setError("This person is not in your active connections. Their private information is unavailable.");
        return;
      }
      const [sharedOverview, appointmentResult, availability] = await Promise.all([
        getProviderClientOverview(clientId),
        listAppointmentsForProviderClient(clientId, { from: new Date() }).then((value) => ({ value })).catch(() => ({ value: [], unavailable: true })),
        getMyProviderAvailability().catch(() => null),
      ]);
      if (!isCurrentRequest()) return;
      setConnection(activeConnection);
      setOverview(sharedOverview);
      setAppointments(appointmentResult.value);
      setAppointmentsUnavailable(appointmentResult.unavailable === true);
      if (availability?.timezone) setTimezone(availability.timezone);
      setLoadedScope(requestScope);
    } catch (err) {
      if (!isCurrentRequest()) return;
      setConnection(null);
      setOverview(null);
      setAppointments([]);
      setAppointmentsUnavailable(false);
      setLoadedScope(requestScope);
      setError(err?.message || "This connection could not be loaded. Try again.");
    } finally {
      if (isCurrentRequest()) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [clientId, providerId, userId]);

  useEffect(() => {
    if (identityLoading) return;
    if (!isProvider && !isAdmin) {
      navigate("/", { replace: true });
      return;
    }
    load();
    return () => { requestSequence.current += 1; };
  }, [identityLoading, isProvider, isAdmin, navigate, load]);

  const currentScopeLoaded = loadedScope === scopeKey && (isProvider || isAdmin);
  if (identityLoading || loading || !currentScopeLoaded) return <main className="min-h-screen bg-slate-950 text-white"><PageHeader title="Connected person" /><div className="lux-shell py-16 text-center text-white/55">Loading this connection and its current sharing choices…</div></main>;

  return <main className="min-h-screen bg-slate-950 text-white">
    <PageHeader title="Connected person" subtitle="Support shaped by what this person chose to share" />
    <div className="lux-shell space-y-5 py-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/provider/clients" className="inline-flex min-h-10 items-center gap-2 text-sm text-white/65 hover:text-white"><Users className="h-4 w-4" />My people</Link>
        <button type="button" onClick={() => load({ quiet: true })} disabled={refreshing} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/75 hover:bg-white/[0.05] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Refresh sharing</button>
      </div>

      {error && <section role="alert" className="rounded-2xl border border-rose-200/20 bg-rose-300/[0.07] p-4 text-sm text-rose-100"><p>{error}</p><button type="button" onClick={() => load()} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-rose-100/20 px-3"><RefreshCw className="h-4 w-4" />Try again</button></section>}

      {connection && <>
        {overview?.sharingPaused && <section role="status" className="rounded-2xl border border-amber-100/20 bg-amber-100/[0.05] p-4 text-sm leading-relaxed text-amber-50/80"><strong className="block text-amber-50">{overview.sharingStatusUnknown ? "Sharing status couldn’t be confirmed" : "Client sharing is temporarily paused"}</strong><span className="mt-1 block">{overview.message || "Personal check-ins and assessment answers are hidden until client sharing is available again."}</span></section>}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-100/[0.075] via-white/[0.035] to-sky-100/[0.04] p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/65">Active connection</p><h1 className="mt-2 text-2xl font-semibold">Your connected person</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">Their check-ins, assessment answers, and reflections stay private unless they turn on the matching sharing choice. Refresh this page to load the latest choices.</p></div>
            <div className="rounded-2xl border border-emerald-100/15 bg-slate-950/35 p-3 text-emerald-100"><HeartHandshake className="h-6 w-6" /></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Current sharing choices">
            {Object.entries(SCOPE_LABELS).map(([key, label]) => <span key={key} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${overview?.sharingPaused ? "border-white/10 bg-white/[0.025] text-white/40" : overview?.scopes?.[key] ? "border-emerald-200/20 bg-emerald-200/[0.08] text-emerald-100" : "border-white/10 bg-white/[0.025] text-white/40"}`}><ShieldCheck className="h-3.5 w-3.5" />{label}: {overview?.sharingPaused ? "paused" : overview?.scopes?.[key] ? "shared" : "private"}</span>)}
          </div>
        </section>

        <ClientSharedSupportPanel key={`${clientId}-${overview?.latestCheckInAt || "private"}`} clientId={clientId} providerType={providerType} />

        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-amber-100" /><div><h2 className="font-semibold">Appointments</h2><p className="text-xs text-white/50">Only sessions attached to this connection · times in {timezone}</p></div></div><button type="button" onClick={() => navigate("/provider/schedule")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/75 hover:bg-white/[0.05]">Open schedule<ChevronRight className="h-4 w-4" /></button></div>
          {appointmentsUnavailable ? <div role="status" className="mt-4 rounded-xl border border-amber-100/15 bg-amber-100/[0.04] p-4 text-sm text-amber-50/75">Appointment information is temporarily unavailable. Shared check-ins remain available; try refreshing or open Schedule.</div> : appointments.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{appointments.map((appointment) => <article key={appointment.id} className="rounded-xl border border-white/10 bg-slate-950/45 p-4"><div className="flex items-center gap-2 text-sm font-medium"><CalendarDays className="h-4 w-4 text-amber-100" />{formatDate(appointment.startAt, { weekday: "short", month: "short", day: "numeric", timeZone: timezone })}</div><p className="mt-2 flex items-center gap-2 text-sm text-white/65"><Clock3 className="h-4 w-4 text-white/40" />{appointment.startAt ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZoneName: "short", timeZone: timezone }).format(new Date(appointment.startAt)) : "Time not set"} · {appointment.status || "scheduled"}</p>{appointment.note && <p className="mt-2 text-sm text-white/50">{appointment.note}</p>}</article>)}</div> : <div className="mt-4 rounded-xl border border-white/8 bg-slate-950/35 p-4"><p className="text-sm text-white/65">No upcoming appointment is scheduled.</p><p className="mt-1 text-xs text-white/45">Use Schedule to review requests or coordinate a session.</p></div>}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="flex items-start gap-2 text-xs leading-relaxed text-white/45"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />This workspace shows shared reflections and appointment details. It is not an emergency alert service, diagnosis, or live risk monitor. Follow up directly if you are concerned about someone's immediate safety.</p><Link to="/provider/messages" className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm text-amber-100 hover:text-amber-50"><MessageSquare className="h-4 w-4" />Open secure messages</Link></section>
      </>}
    </div>
  </main>;
}
