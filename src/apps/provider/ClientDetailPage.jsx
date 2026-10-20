import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, ChevronRight, Clock3, HandHeart, HeartHandshake, LockKeyhole, MessageSquare, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { callAgent } from "@/ai/agents/agentClient";
import { listAssignmentsForProvider } from "@/services/assignmentService";
import { getMyProviderAvailability, listAppointmentsForProviderClient } from "@/services/appointmentService";
import { acknowledgeVisitPreparation, getProviderClientOverview, listProviderVisitPreparations, listProviderCareHandoffs, updateProviderCareHandoff } from "@/services/practitionerRegistry";
import PageHeader from "@/components/navigation/PageHeader";
import ClientSharedSupportPanel from "./components/ClientSharedSupportPanel";
import { isCareCoordinationWorkspace, isLimitedPractitionerWorkspace } from "./practitionerWorkspaceContracts";

const SCOPE_LABELS = {
  recoveryProgress: "Recovery progress",
  wellnessPatterns: "Wellness patterns",
  writtenReflections: "Written reflections",
  assessments: "Assessment answers",
  visitPreparation: "Visit preparation",
  careCoordination: "Practical-help requests",
};
const CARE_COORDINATION_TYPES = new Set(["recovery-coach", "peer-support", "community-supporter", "case-manager", "resource-navigator"]);
const CARE_HANDOFF_STATUS = { requested: "New request", acknowledged: "Acknowledged", in_progress: "In progress", waiting_on_client: "Waiting for client", follow_up_complete: "Follow-up marked complete" };
const CARE_HANDOFF_ACTIONS = [["acknowledged", "Acknowledge"], ["in_progress", "In progress"], ["waiting_on_client", "Waiting on client"], ["follow_up_complete", "Mark follow-up complete"]];
const CARE_HANDOFF_TRANSITIONS = { requested: ["acknowledged", "in_progress", "waiting_on_client"], acknowledged: ["in_progress", "waiting_on_client", "follow_up_complete"], in_progress: ["in_progress", "waiting_on_client", "follow_up_complete"], waiting_on_client: ["in_progress", "follow_up_complete"] };

function signedInRequestWasRejected(error, userId) {
  if (!userId) return false;
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return code.includes("unauthenticated")
    || code.includes("app-check")
    || code.includes("app_check")
    || code.includes("permission-denied")
    || code.includes("unauthorized")
    || message.includes("app check")
    || message.includes("app verification");
}

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
  const [visitPreparations, setVisitPreparations] = useState([]);
  const [visitPreparationsUnavailable, setVisitPreparationsUnavailable] = useState(false);
  const [careHandoffs, setCareHandoffs] = useState([]);
  const [careHandoffsUnavailable, setCareHandoffsUnavailable] = useState(false);
  const [careReplies, setCareReplies] = useState({});
  const [updatingHandoff, setUpdatingHandoff] = useState("");
  const [acknowledgingPreparation, setAcknowledgingPreparation] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [appointmentsUnavailable, setAppointmentsUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [retryAllowed, setRetryAllowed] = useState(true);
  const [witnessLoading, setWitnessLoading] = useState(false);
  const [witnessResult, setWitnessResult] = useState(null);
  const [witnessError, setWitnessError] = useState("");
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
    setRetryAllowed(true);
    try {
      const assignments = await listAssignmentsForProvider(providerId || userId);
      if (!isCurrentRequest()) return;
      const activeConnection = assignments.find((item) => item.clientId === clientId && item.status === "active");
      if (!activeConnection) {
        setConnection(null);
        setOverview(null);
        setAppointments([]);
        setVisitPreparations([]);
        setVisitPreparationsUnavailable(false);
        setAppointmentsUnavailable(false);
        setLoadedScope(requestScope);
        setError("This person is not in your active connections. Their private information is unavailable.");
        return;
      }
      const careHandoffRequest = CARE_COORDINATION_TYPES.has(providerType)
        ? listProviderCareHandoffs(clientId).then((value) => ({ value })).catch(() => ({ value: { handoffs: [] }, unavailable: true }))
        : Promise.resolve({ value: { handoffs: [] } });
      const [sharedOverview, appointmentResult, availability, preparationResult, careHandoffResult] = await Promise.all([
        getProviderClientOverview(clientId),
        listAppointmentsForProviderClient(clientId, { from: new Date() }).then((value) => ({ value })).catch(() => ({ value: [], unavailable: true })),
        getMyProviderAvailability().catch(() => null),
        isCareCoordinationWorkspace(providerType)
          ? Promise.resolve({ value: { preparations: [] } })
          : listProviderVisitPreparations(clientId).then((value) => ({ value })).catch(() => ({ value: { preparations: [] }, unavailable: true })),
        careHandoffRequest,
      ]);
      if (!isCurrentRequest()) return;
      setConnection(activeConnection);
      setOverview(sharedOverview);
      setAppointments(appointmentResult.value);
      setAppointmentsUnavailable(appointmentResult.unavailable === true);
      setVisitPreparations(preparationResult.value.preparations || []);
      setVisitPreparationsUnavailable(preparationResult.unavailable === true);
      setCareHandoffs(careHandoffResult.value.handoffs || []);
      setCareHandoffsUnavailable(careHandoffResult.unavailable === true);
      if (availability?.timezone) setTimezone(availability.timezone);
      setLoadedScope(requestScope);
    } catch (err) {
      if (!isCurrentRequest()) return;
      const rejected = signedInRequestWasRejected(err, userId);
      setConnection(null);
      setOverview(null);
      setAppointments([]);
      setVisitPreparations([]);
      setVisitPreparationsUnavailable(false);
      setCareHandoffs([]);
      setCareHandoffsUnavailable(false);
      setAppointmentsUnavailable(false);
      setLoadedScope(requestScope);
      setRetryAllowed(!rejected);
      setError(rejected
        ? "This connection isn’t available right now. Please try again later."
        : "This connection could not be loaded. Try again in a moment.");
    } finally {
      if (isCurrentRequest()) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [clientId, providerId, providerType, userId]);

  const acknowledgePreparation = async (preparationId) => {
    setAcknowledgingPreparation(preparationId);
    setError("");
    try {
      await acknowledgeVisitPreparation(preparationId);
      setVisitPreparations((current) => current.map((item) => item.id === preparationId ? { ...item, acknowledgedAt: new Date().toISOString() } : item));
    } catch (err) { setError(err?.message || "The preparation could not be acknowledged."); }
    finally { setAcknowledgingPreparation(""); }
  };

  const updateCareHandoff = async (item, status) => {
    setUpdatingHandoff(item.id); setError("");
    try {
      await updateProviderCareHandoff(item.id, status, careReplies[item.id] || "");
      setCareHandoffs((current) => current.map((handoff) => handoff.id === item.id ? { ...handoff, status, practitionerReply: careReplies[item.id] || "", updatedAt: new Date().toISOString() } : handoff));
      setCareReplies((current) => ({ ...current, [item.id]: "" }));
    } catch (err) { setError(err?.message || "The practical-support request could not be updated."); }
    finally { setUpdatingHandoff(""); }
  };

  const buildSharedTimeline = async () => {
    if (!clientId || witnessLoading) return;
    setWitnessLoading(true);
    setWitnessResult(null);
    setWitnessError("");
    try {
      const response = await callAgent("witness", { clientId });
      const result = response.result || {};
      if (result.available !== true && result.available !== false) throw new Error("The shared timeline response was incomplete.");
      setWitnessResult(result);
    } catch (err) {
      setWitnessError(err?.message || "The shared timeline is temporarily unavailable. Refresh the client's sharing choices and try again.");
    } finally {
      setWitnessLoading(false);
    }
  };

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
        {retryAllowed && <button type="button" onClick={() => load({ quiet: true })} disabled={refreshing} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/75 hover:bg-white/[0.05] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Refresh sharing</button>}
      </div>

      {error && <section role="alert" className="rounded-2xl border border-rose-200/20 bg-rose-300/[0.07] p-4 text-sm text-rose-100"><p>{error}</p>{retryAllowed && <button type="button" onClick={() => load()} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-rose-100/20 px-3"><RefreshCw className="h-4 w-4" />Try again</button>}</section>}

      {connection && <>
        {overview?.sharingPaused && <section role="status" className="rounded-2xl border border-amber-100/20 bg-amber-100/[0.05] p-4 text-sm leading-relaxed text-amber-50/80"><strong className="block text-amber-50">{overview.sharingStatusUnknown ? "Sharing status couldn’t be confirmed" : "Client sharing is temporarily paused"}</strong><span className="mt-1 block">{overview.message || "Personal check-ins and assessment answers are hidden until client sharing is available again."}</span></section>}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-100/[0.075] via-white/[0.035] to-sky-100/[0.04] p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/65">Active connection</p><h1 className="mt-2 text-2xl font-semibold">Your connected person</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">Their check-ins, assessment answers, and reflections stay private unless they turn on the matching sharing choice. Refresh this page to load the latest choices.</p></div>
            <div className="rounded-2xl border border-emerald-100/15 bg-slate-950/35 p-3 text-emerald-100"><HeartHandshake className="h-6 w-6" /></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Current sharing choices">
            {Object.entries(SCOPE_LABELS).map(([key, label]) => {
              const unavailableToWorkspace = overview?.scopeAccess?.[key] === false;
              const shared = overview?.scopes?.[key] === true;
              return <span key={key} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${overview?.sharingPaused || unavailableToWorkspace ? "border-white/10 bg-white/[0.025] text-white/40" : shared ? "border-emerald-200/20 bg-emerald-200/[0.08] text-emerald-100" : "border-white/10 bg-white/[0.025] text-white/40"}`}><ShieldCheck className="h-3.5 w-3.5" />{label}: {overview?.sharingPaused ? "paused" : unavailableToWorkspace ? "not in this workspace" : shared ? "shared" : "private"}</span>;
            })}
          </div>
        </section>

        {!isLimitedPractitionerWorkspace(providerType) && !overview?.sharingPaused && (overview?.scopes?.recoveryProgress === true || overview?.scopes?.wellnessPatterns === true || overview?.practiceProgress?.length > 0) && <section className="rounded-2xl border border-violet-100/15 bg-violet-100/[0.035] p-5 sm:p-6" aria-labelledby="shared-timeline-title">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 id="shared-timeline-title" className="font-semibold">Client-shared timeline</h2><p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/55">A factual snapshot of numeric check-ins and practice choices the client shared with this workspace. It does not interpret risk, diagnosis, causes, or treatment progress.</p></div><button type="button" onClick={buildSharedTimeline} disabled={witnessLoading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-violet-100/20 px-3 text-sm text-violet-50 hover:bg-violet-100/[0.06] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${witnessLoading ? "animate-spin" : ""}`} />{witnessLoading ? "Building…" : witnessResult ? "Refresh timeline" : "Build timeline"}</button></div>
          {witnessError && <p role="alert" className="mt-3 rounded-xl border border-rose-200/15 bg-rose-200/[0.05] p-3 text-sm text-rose-100">{witnessError}</p>}
          {witnessResult && !witnessResult.available && <p role="status" className="mt-3 rounded-xl border border-white/10 bg-slate-950/35 p-3 text-sm text-white/60">{witnessResult.message || "There is not enough shared information to build this timeline yet."}</p>}
          {witnessResult?.available && <div className="mt-4 space-y-4"><p className="text-xs text-white/45">{witnessResult.note || "Client-shared values and practice choices; no interpretation."}</p>{witnessResult.metrics?.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{witnessResult.metrics.map((metric) => <article key={metric.label} className="rounded-xl border border-white/10 bg-slate-950/45 p-4"><h3 className="text-sm font-medium text-white/85">{metric.label}</h3><p className="mt-2 text-sm text-white/65">{metric.first} → {metric.latest} <span className="text-white/40">({metric.change > 0 ? "+" : ""}{metric.change})</span></p><p className="mt-1 text-xs text-white/40">{metric.firstDate || "First recorded"} to {metric.latestDate || "Most recent"} · {metric.entries} shared entries</p></article>)}</div>}{witnessResult.practiceOutcomes?.length > 0 && <div><h3 className="text-sm font-medium text-white/75">Reported practice choices</h3><div className="mt-2 flex flex-wrap gap-2">{witnessResult.practiceOutcomes.map((item) => <span key={item.toolId} className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1.5 text-xs text-white/65">{item.toolId.replaceAll("-", " ")} · {item.tried} tried · {item.notYet} not yet · {item.notFit} not a fit</span>)}</div></div>}</div>}
        </section>}

        {!isLimitedPractitionerWorkspace(providerType) && <ClientSharedSupportPanel key={`${clientId}-${overview?.latestCheckInAt || "private"}`} clientId={clientId} providerType={providerType} />}

        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-amber-100" /><div><h2 className="font-semibold">Appointments</h2><p className="text-xs text-white/50">Only sessions attached to this connection · times in {timezone}</p></div></div><button type="button" onClick={() => navigate("/provider/schedule")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/75 hover:bg-white/[0.05]">Open schedule<ChevronRight className="h-4 w-4" /></button></div>
          {appointmentsUnavailable ? <div role="status" className="mt-4 rounded-xl border border-amber-100/15 bg-amber-100/[0.04] p-4 text-sm text-amber-50/75">Appointment information is temporarily unavailable. Shared check-ins remain available; try refreshing or open Schedule.</div> : appointments.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{appointments.map((appointment) => <article key={appointment.id} className="rounded-xl border border-white/10 bg-slate-950/45 p-4"><div className="flex items-center gap-2 text-sm font-medium"><CalendarDays className="h-4 w-4 text-amber-100" />{formatDate(appointment.startAt, { weekday: "short", month: "short", day: "numeric", timeZone: timezone })}</div><p className="mt-2 flex items-center gap-2 text-sm text-white/65"><Clock3 className="h-4 w-4 text-white/40" />{appointment.startAt ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZoneName: "short", timeZone: timezone }).format(new Date(appointment.startAt)) : "Time not set"} · {appointment.status || "scheduled"}</p>{appointment.note && <p className="mt-2 text-sm text-white/50">{appointment.note}</p>}</article>)}</div> : <div className="mt-4 rounded-xl border border-white/8 bg-slate-950/35 p-4"><p className="text-sm text-white/65">No upcoming appointment is scheduled.</p><p className="mt-1 text-xs text-white/45">Use Schedule to review requests or coordinate a session.</p></div>}
        </section>

        {!isCareCoordinationWorkspace(providerType) && <section className="rounded-2xl border border-sky-100/15 bg-sky-100/[0.035] p-5 sm:p-6" aria-labelledby="visit-preparation-title">
          <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-5 w-5 text-sky-100" /><div><h2 id="visit-preparation-title" className="font-semibold">Visit preparation shared with you</h2><p className="mt-1 text-xs leading-relaxed text-white/55">Only the fields this person selected are shown. Their after-visit notes and other private writing are not included.</p></div></div>
          {visitPreparationsUnavailable ? <p role="status" className="mt-4 rounded-xl bg-slate-950/45 p-4 text-sm text-white/60">Visit preparation could not be checked. Refresh before acting on whether anything has been shared.</p> : visitPreparations.length ? <div className="mt-4 space-y-3">{visitPreparations.map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-slate-950/45 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-sky-100/65">Client-selected visit notes</p><p className="mt-1 text-xs text-white/45">Updated {item.updatedAt ? formatDate(item.updatedAt, { month: "short", day: "numeric", year: "numeric" }) : "recently"}</p></div>{item.acknowledgedAt ? <span className="rounded-full border border-emerald-100/20 bg-emerald-100/[0.06] px-3 py-1 text-xs text-emerald-100">Acknowledged</span> : <button type="button" disabled={acknowledgingPreparation === item.id} onClick={() => acknowledgePreparation(item.id)} className="min-h-9 rounded-lg border border-sky-100/20 px-3 text-xs text-sky-50 hover:bg-sky-100/[0.06] disabled:opacity-50">{acknowledgingPreparation === item.id ? "Saving…" : "Mark received"}</button>}</div>
            {item.visitPurpose && <p className="mt-3 text-sm text-white/85"><strong>Purpose:</strong> {item.visitPurpose}</p>}
            {item.priorities?.length > 0 && <div className="mt-3"><h3 className="text-xs font-semibold uppercase tracking-wide text-white/45">Priorities</h3><ul className="mt-1 list-inside list-disc space-y-1 text-sm text-white/80">{item.priorities.map((value, index) => <li key={`${index}-${value}`}>{value}</li>)}</ul></div>}
            {item.questions?.length > 0 && <div className="mt-3"><h3 className="text-xs font-semibold uppercase tracking-wide text-white/45">Questions</h3><ul className="mt-1 list-inside list-decimal space-y-1 text-sm text-white/80">{item.questions.map((value, index) => <li key={`${index}-${value}`}>{value}</li>)}</ul></div>}
            {item.accessPreferences?.length > 0 && <p className="mt-3 text-sm text-white/75"><strong>Communication preferences:</strong> {item.accessPreferences.map((value) => value.replace(/([A-Z])/g, " $1").toLowerCase()).join(", ")}</p>}
          </article>)}</div> : <p className="mt-4 rounded-xl bg-slate-950/35 p-4 text-sm text-white/55">Nothing has been shared for visit preparation. Their private preparations remain private.</p>}
        </section>}

        {CARE_COORDINATION_TYPES.has(providerType) && <section className="rounded-2xl border border-emerald-100/15 bg-emerald-100/[0.035] p-5 sm:p-6" aria-labelledby="care-handoffs-title">
          <div className="flex items-start gap-3"><HandHeart className="mt-0.5 h-5 w-5 text-emerald-100" /><div><h2 id="care-handoffs-title" className="font-semibold">Practical-help requests</h2><p className="mt-1 text-xs leading-relaxed text-white/55">Client-selected requests for resource finding and coordination. These are not clinical notes, risk alerts, or supervision reports.</p></div></div>
          {careHandoffsUnavailable ? <p role="status" className="mt-4 rounded-xl bg-slate-950/45 p-4 text-sm text-white/60">Requests could not be checked. Refresh before relying on whether anything was shared.</p> : careHandoffs.length ? <div className="mt-4 space-y-3">{careHandoffs.map((item) => { const sharedFields = new Set(Array.isArray(item.sharedFields) ? item.sharedFields : []); return <article key={item.id} className="rounded-xl border border-white/10 bg-slate-950/45 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-emerald-100/65">{CARE_HANDOFF_STATUS[item.status] || "Practical-support request"}</p><p className="mt-1 text-xs text-white/45">Updated {item.updatedAt ? formatDate(item.updatedAt, { month: "short", day: "numeric", year: "numeric" }) : "recently"}</p></div><span className="rounded-full border border-emerald-100/15 px-3 py-1 text-xs text-emerald-100">Client shared {sharedFields.size} fields</span></div>
            {sharedFields.has("needType") && item.needType && <p className="mt-3 text-sm text-white/85"><strong>Support area:</strong> {item.needType.replaceAll("-", " ")}</p>}{sharedFields.has("goal") && item.goal && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/85"><strong>Request:</strong> {item.goal}</p>}{sharedFields.has("context") && item.context && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/70"><strong>Context:</strong> {item.context}</p>}{sharedFields.has("preferredTiming") && item.preferredTiming && <p className="mt-2 text-xs text-white/55"><strong>Timing:</strong> {item.preferredTiming.replaceAll("-", " ")}</p>}{sharedFields.has("contactPreference") && item.contactPreference && <p className="mt-1 text-xs text-white/55"><strong>Follow up:</strong> {item.contactPreference.replaceAll("-", " ")}</p>}
            {item.practitionerReply && <div className="mt-3 rounded-lg border border-emerald-100/10 bg-emerald-100/[0.04] p-3"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-100/65">Your last update</p><p className="mt-1 whitespace-pre-wrap text-sm text-white/80">{item.practitionerReply}</p></div>}
            {(CARE_HANDOFF_TRANSITIONS[item.status] || []).length > 0 && <div className="mt-4 space-y-3"><label className="block"><span className="mb-1 block text-xs font-medium text-white/65">Update for the client <span className="font-normal">(optional)</span></span><textarea value={careReplies[item.id] || ""} onChange={(event) => setCareReplies((current) => ({ ...current, [item.id]: event.target.value.slice(0, 500) }))} rows={2} maxLength={500} placeholder="Share the next step, resource, or question." className="w-full rounded-xl border border-white/15 bg-slate-950/70 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-emerald-100/40 focus:outline-none" /></label><div className="flex flex-wrap gap-2">{CARE_HANDOFF_ACTIONS.filter(([status]) => CARE_HANDOFF_TRANSITIONS[item.status].includes(status)).map(([status, label]) => <button key={status} type="button" onClick={() => updateCareHandoff(item, status)} disabled={updatingHandoff === item.id} className="min-h-10 rounded-lg border border-emerald-100/20 px-3 text-xs text-emerald-50 hover:bg-emerald-100/[0.06] disabled:opacity-50">{updatingHandoff === item.id ? "Saving…" : label}</button>)}</div></div>}
          </article>; })}</div> : <p className="mt-4 rounded-xl bg-slate-950/35 p-4 text-sm text-white/55">No practical-help requests have been shared with you.</p>}
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-white/45"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />Only the request fields chosen by the client are shown here. Updates are visible back to them in their request tracker.</p>
        </section>}

        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="flex items-start gap-2 text-xs leading-relaxed text-white/45"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />{isCareCoordinationWorkspace(providerType) ? "This workspace is for client-authorized practical support and appointment coordination. It does not provide clinical records, check-ins, assessments, reflections, diagnosis, or risk monitoring." : providerType === "primary-care" ? "This workspace shows appointments and visit topics the patient chose to share. Clinical records, recovery check-ins, assessments, and reflections are outside this workspace." : "This workspace shows shared reflections and appointment details. It is not an emergency alert service, diagnosis, or live risk monitor. Follow up directly if you are concerned about someone's immediate safety."}</p>{!isLimitedPractitionerWorkspace(providerType) && <Link to="/provider/messages" className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm text-amber-100 hover:text-amber-50"><MessageSquare className="h-4 w-4" />Open secure messages</Link>}</section>
      </>}
    </div>
  </main>;
}
