import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, HandHeart, HeartHandshake, MessageSquare, Users } from "lucide-react";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { listAssignmentsForProvider } from "@/services/assignmentService";
import { getMyProviderAvailability, listAppointmentsForProvider } from "@/services/appointmentService";
import { getProviderClientOverview, listProviderCareHandoffs, listProviderVisitPreparations } from "@/services/practitionerRegistry";
import PageHeader from "@/components/navigation/PageHeader";
import ConnectionRequestsPanel from "./components/ConnectionRequestsPanel";
import { TOOLS } from "@/apps/tools/toolsRegistry";
import { getPractitionerWorkspaceContract } from "./practitionerWorkspaceContracts";
import { callAgent } from "@/ai/agents/agentClient";
import { getAppCheckToken } from "@/firebase/appCheck";

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

function formatWorkspaceUpdate(update, primaryCare, dateLabel) {
  if (!primaryCare) return `${OUTCOME_LABELS[update.outcome] || "Update"} · ${dateLabel}`;
  const details = [];
  if (update.visitPurpose) details.push(`Purpose: ${update.visitPurpose}`);
  if (update.priorities?.length) details.push(`Focus: ${update.priorities.slice(0, 2).join("; ")}`);
  if (update.questions?.length) details.push(`Question: ${update.questions[0]}`);
  if (update.accessPreferences?.length) details.push(`Support requested: ${update.accessPreferences.slice(0, 2).join(", ")}`);
  return details.join(" · ") || "Patient-shared topics";
}

function getConversationFallback(workspace) {
  if (workspace.primaryCare) return {
    openingQuestion: "What is the one thing you most want to make sure we discuss today?",
    nextStep: "Start with the patient’s priority, then agree together what belongs in today’s visit.",
    preferenceCheck: "Would you like to begin with that concern, or is something else more important right now?",
  };
  if (workspace.careCoordination) return {
    openingQuestion: "Which practical step would make the biggest difference to you right now?",
    nextStep: "Choose one action together, agree who will take it, and decide when to check back.",
    preferenceCheck: "Would you like help making the call, comparing options, or keeping the next step with you?",
  };
  return {
    openingQuestion: "What would make our time together feel useful to you today?",
    nextStep: "Agree on one small step the client chooses and how they would like to follow up.",
    preferenceCheck: "Would you like to try that now, hear a few options, or choose a different direction?",
  };
}

export default function ProviderDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isProvider, isAdmin, providerId, providerType, userId, isLoading: identityLoading } = useSessionIdentity();
  const workspace = getPractitionerWorkspaceContract(providerType);
  const identityScope = `${providerId || userId || ""}:${isProvider ? "provider" : isAdmin ? "admin" : "guest"}:${providerType || ""}`;
  const identityScopeRef = useRef(identityScope);
  const clientRequestSequence = useRef(0);
  identityScopeRef.current = identityScope;
  const [clients, setClients] = useState([]);
  const [clientsScope, setClientsScope] = useState("");
  const [clientsUnavailable, setClientsUnavailable] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsUnavailable, setAppointmentsUnavailable] = useState(false);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [timezoneFromAvailability, setTimezoneFromAvailability] = useState(false);
  const [scheduleRetry, setScheduleRetry] = useState(0);
  const [dashboardRetry, setDashboardRetry] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorKind, setErrorKind] = useState("");
  const [secureCheckStatus, setSecureCheckStatus] = useState("idle");
  const [loadedScope, setLoadedScope] = useState("");
  const [gatekeeperPathway, setGatekeeperPathway] = useState("");
  const [gatekeeperLoading, setGatekeeperLoading] = useState(false);
  const [gatekeeperResult, setGatekeeperResult] = useState(null);
  const [gatekeeperError, setGatekeeperError] = useState("");
  const [gatekeeperFallback, setGatekeeperFallback] = useState(false);

  useEffect(() => {
    setSecureCheckStatus("idle");
  }, [identityScope]);

  const prepareGatekeeperPathway = async () => {
    if (!gatekeeperPathway || gatekeeperLoading) return;
    setGatekeeperLoading(true);
    setGatekeeperResult(null);
    setGatekeeperError("");
    setGatekeeperFallback(false);
    try {
      const response = await callAgent("gatekeeper", { pathway: gatekeeperPathway });
      const result = response.result || response;
      if (![result.openingQuestion, result.nextStep, result.preferenceCheck].every((value) => typeof value === "string" && value.trim())) {
        throw new Error("This pathway aid is unavailable.");
      }
      setGatekeeperResult({
        openingQuestion: result.openingQuestion.trim().slice(0, 280),
        nextStep: result.nextStep.trim().slice(0, 320),
        preferenceCheck: result.preferenceCheck.trim().slice(0, 240),
      });
    } catch {
      setGatekeeperResult(getConversationFallback(workspace));
      setGatekeeperFallback(true);
    } finally {
      setGatekeeperLoading(false);
    }
  };

  const checkSecureConnection = async () => {
    if (secureCheckStatus !== "idle") return;
    setSecureCheckStatus("checking");
    try {
      const token = await getAppCheckToken({ forceRefresh: true });
      if (!token) {
        setSecureCheckStatus("unavailable");
        return;
      }
      setSecureCheckStatus("refreshing");
      setDashboardRetry((value) => value + 1);
    } catch {
      setSecureCheckStatus("unavailable");
    }
  };

  const visibleClients = clientsScope === identityScope ? clients : [];
  const careHandoffItems = visibleClients.flatMap((client) => (client.careHandoffs || []).map((handoff) => ({
    ...handoff,
    clientId: client.clientId,
    alias: client.alias,
  }))).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  const careHandoffsUnavailable = clientsUnavailable || visibleClients.some((client) => client.careHandoffsUnavailable);
  const visitPreparationItems = visibleClients.flatMap((client) => (client.visitPreparations || []).map((preparation) => ({
    ...preparation,
    clientId: client.clientId,
    alias: client.alias,
  }))).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  const visitPreparationsUnavailable = clientsUnavailable || visibleClients.some((client) => client.visitPreparationsUnavailable);
  const sharedUpdates = workspace.primaryCare
    ? visitPreparationItems
    : visibleClients.flatMap((client) => (client.overview?.practiceProgress || []).map((update) => ({
      ...update,
      clientId: client.clientId,
      alias: client.alias,
    }))).sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)).slice(0, 5);
  const prepToAcknowledge = visitPreparationItems.filter((item) => !item.acknowledgedAt).length;
  const prepAcknowledged = visitPreparationItems.length - prepToAcknowledge;
  const requestsToRespond = careHandoffItems.filter((item) => item.status === "requested").length;
  const followUpsInProgress = careHandoffItems.filter((item) => ["acknowledged", "in_progress"].includes(item.status)).length;
  const waitingOnClient = careHandoffItems.filter((item) => item.status === "waiting_on_client").length;
  const sharedUpdatesUnavailable = clientsUnavailable || visibleClients.some((client) => client.overview?.unavailable);
  const sharedPracticeUpdateCount = visibleClients.reduce((total, client) => total + (client.overview?.practiceProgress?.length || 0), 0);
  const clientCount = clientsUnavailable ? "—" : visibleClients.length;
  const sharedUpdateCount = sharedUpdatesUnavailable ? "—" : sharedPracticeUpdateCount;
  const workAtAGlance = workspace.primaryCare
    ? [
      { label: "Upcoming visits", value: appointmentsUnavailable ? "—" : appointments.length, detail: "In your next two-week view", href: "#schedule-panel" },
      { label: "Prep to review", value: visitPreparationsUnavailable ? "—" : prepToAcknowledge, detail: "Patient-shared; awaiting your receipt", href: "#shared-updates-title" },
      { label: "Prep received", value: visitPreparationsUnavailable ? "—" : prepAcknowledged, detail: "Acknowledged for an upcoming visit", href: "#shared-updates-title" },
    ]
    : workspace.careCoordination
      ? [
        { label: "Requests to respond to", value: careHandoffsUnavailable ? "—" : requestsToRespond, detail: "Client asked for practical support", href: "#shared-updates-title" },
        { label: "Follow-ups underway", value: careHandoffsUnavailable ? "—" : followUpsInProgress, detail: "Acknowledged or in progress", href: "#shared-updates-title" },
        { label: "Waiting on client", value: careHandoffsUnavailable ? "—" : waitingOnClient, detail: "Next step needs their input", href: "#shared-updates-title" },
      ]
      : [
        { label: "People connected", value: clientCount, detail: clientsUnavailable ? "Could not confirm your active connections" : "Your active client relationships", href: "#people-panel" },
        { label: "Upcoming sessions", value: appointmentsUnavailable ? "—" : appointments.length, detail: "In your next two-week view", href: "#schedule-panel" },
        { label: "Recent shared updates", value: sharedUpdateCount, detail: sharedUpdatesUnavailable ? "Could not check client-shared updates" : "Client-sent updates visible in your workspace", href: "#shared-updates-title" },
      ];

  const refreshClients = useCallback(async () => {
    const id = providerId || userId;
    const requestScope = `${providerId || userId || ""}:${isProvider ? "provider" : isAdmin ? "admin" : "guest"}:${providerType || ""}`;
    const requestId = ++clientRequestSequence.current;
    const isCurrentRequest = () => clientRequestSequence.current === requestId && identityScopeRef.current === requestScope;
    if (!id) {
      if (isCurrentRequest()) {
        setClients([]);
        setClientsScope(requestScope);
        setClientsUnavailable(true);
      }
      return;
    }
    const assignments = await listAssignmentsForProvider(id);
    if (!isCurrentRequest()) return;
    const clientData = await Promise.all(assignments.map(async (assignment) => {
      const [overview, handoffs] = await Promise.all([
        getProviderClientOverview(assignment.clientId).catch(() => ({ unavailable: true, shared: false, checkins: [], practiceProgress: [] })),
        workspace.careCoordination
          ? listProviderCareHandoffs(assignment.clientId).then((result) => ({ items: result.handoffs || [], key: "careHandoffs" })).catch(() => ({ items: [], unavailable: true, key: "careHandoffs" }))
          : workspace.primaryCare
            ? listProviderVisitPreparations(assignment.clientId).then((result) => ({ items: result.preparations || [], key: "visitPreparations" })).catch(() => ({ items: [], unavailable: true, key: "visitPreparations" }))
            : Promise.resolve({ items: [], key: "careHandoffs" }),
      ]);
      return {
        overview,
        careHandoffs: handoffs.key === "careHandoffs" ? handoffs.items : [],
        careHandoffsUnavailable: handoffs.key === "careHandoffs" && handoffs.unavailable === true,
        visitPreparations: handoffs.key === "visitPreparations" ? handoffs.items : [],
        visitPreparationsUnavailable: handoffs.key === "visitPreparations" && handoffs.unavailable === true,
      };
    }));
    if (!isCurrentRequest()) return;
    setClients(assignments.map((assignment, index) => ({ ...assignment, alias: `Client ${index + 1}`, ...clientData[index] })));
    setClientsScope(requestScope);
    setClientsUnavailable(false);
      }, [isProvider, isAdmin, providerId, providerType, userId, workspace.careCoordination, workspace.primaryCare]);

  useEffect(() => {
    let active = true;
    if (identityLoading) return () => { active = false; };
    if (!isProvider && !isAdmin) { navigate("/"); return () => { active = false; }; }
    const load = async () => {
      const requestScope = identityScope;
      setLoading(true); setError(""); setErrorKind("");
      try {
        const id = providerId || userId;
        if (!id) {
          setClients([]);
          setClientsScope(requestScope);
          setAppointments([]);
          setClientsUnavailable(true);
          setAppointmentsUnavailable(true);
          setError("Your signed-in account could not be confirmed. Sign in again to load this workspace.");
          setLoadedScope(requestScope);
          return;
        }
        const [clientsResult, upcomingResult, availabilityResult] = await Promise.all([
          refreshClients()
            .then(() => ({ value: true }))
            .catch((error) => ({ unavailable: true, error })),
          listAppointmentsForProvider(id, { from: new Date(), to: new Date(Date.now() + 14 * 86400000) })
            .then((value) => ({ value }))
            .catch(() => ({ unavailable: true })),
          getMyProviderAvailability()
            .then((value) => ({ value }))
            .catch(() => ({ unavailable: true })),
        ]);
        if (active && identityScopeRef.current === requestScope) {
          setAppointmentsUnavailable(upcomingResult.unavailable === true);
          if (!upcomingResult.unavailable) setAppointments(upcomingResult.value || []);
          setClientsUnavailable(clientsResult.unavailable === true);
          setSecureCheckStatus((status) => status === "refreshing"
            ? clientsResult.unavailable ? "request-rejected" : "complete"
            : status);
          if (clientsResult.unavailable) {
            setClients([]);
            setClientsScope(requestScope);
            const errorCode = String(clientsResult.error?.code || "").toLowerCase();
            const authFailure = errorCode.includes("unauthenticated") || errorCode.includes("unauthorized");
            if (authFailure && userId) {
              setErrorKind("app-check");
              setError("Your account is still signed in, but some practice information isn’t available right now. Please come back later.");
            } else {
              setErrorKind("load");
              setError("Some practitioner information couldn’t be loaded. You can retry the unavailable section.");
            }
          }
          const configuredTimezone = availabilityResult.value?.timezone;
          setTimezoneFromAvailability(Boolean(configuredTimezone));
          setTimezone(configuredTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
          setLoadedScope(requestScope);
        }
      } catch (err) {
        if (active && identityScopeRef.current === requestScope) {
          setSecureCheckStatus((status) => status === "refreshing" ? "request-rejected" : status);
          setClients([]);
          setClientsScope(requestScope);
          setAppointments([]);
          setClientsUnavailable(true);
          setAppointmentsUnavailable(true);
          setTimezoneFromAvailability(false);
          setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
          const errorCode = String(err?.code || "").toLowerCase();
          const authFailure = errorCode.includes("unauthenticated") || errorCode.includes("unauthorized");
          const permissionFailure = errorCode.includes("permission-denied");
          if (permissionFailure) {
            setErrorKind("access");
            setError("Your signed-in account does not have permission to load this practitioner workspace. Ask your workspace administrator to check your access.");
          } else if (authFailure && userId) {
            setErrorKind("app-check");
            setError("Your account is still signed in, but some practice information isn’t available right now. Please come back later.");
          } else if (authFailure) {
            setErrorKind("auth");
            setError("Your session has ended. Sign in to reload your practitioner workspace.");
          } else {
            setErrorKind("load");
            setError("We couldn’t load your practitioner workspace. Your connection and shared-work queues are unknown until you retry.");
          }
          setLoadedScope(requestScope);
        }
      }
      finally { if (active && identityScopeRef.current === requestScope) setLoading(false); }
    };
    load();
    return () => { active = false; clientRequestSequence.current += 1; };
  }, [identityLoading, isProvider, isAdmin, providerId, userId, navigate, refreshClients, scheduleRetry, dashboardRetry, identityScope]);

  useEffect(() => {
    if (location.hash !== "#connection-requests-panel" || identityLoading || loadedScope !== identityScope) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const panel = document.getElementById("connection-requests-panel");
      if (!panel) return;
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      panel.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [identityScope, identityLoading, loadedScope, location.hash]);

  if (identityLoading) return <div className="grid min-h-[45vh] place-items-center text-sm text-white/60" role="status">Checking your workspace…</div>;
  if (!isProvider && !isAdmin) return null;
  const currentScopeLoaded = loadedScope === identityScope;
  return <div className="min-h-screen bg-slate-950 text-white"><PageHeader title={workspace.label} subtitle={workspace.focus} />
    <div className="lux-shell space-y-6 py-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-100/[0.09] via-white/[0.035] to-emerald-100/[0.04] p-5 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/65">{workspace.label}</p><h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{workspace.headline}</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">{workspace.summary} {workspace.careCoordination ? "Only a client’s active connection and specifically shared practical-help request fields are available here." : workspace.primaryCare ? "Only upcoming appointments and preparation a patient specifically chose to share are available here." : "Connection never opens private check-ins automatically. People can choose what you see and can change those choices at any time."}</p><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => navigate(workspace.primaryAction.path, workspace.primaryAction.path === "/provider/schedule" ? { state: { from: { pathname: "/provider/dashboard" } } } : undefined)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950">{workspace.primaryAction.path === "/provider/schedule" ? <CalendarDays className="h-4 w-4" /> : <Users className="h-4 w-4" />}{workspace.primaryAction.label}</button><button onClick={() => navigate("/provider/schedule", { state: { from: { pathname: "/provider/dashboard" } } })} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white/80"><CalendarDays className="h-4 w-4" />Schedule</button>{!workspace.limitedAccess && <><button onClick={() => navigate("/provider/messages")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white/80"><MessageSquare className="h-4 w-4" />Messages</button><button onClick={() => navigate("/assistance/community")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white/80"><HandHeart className="h-4 w-4" />Community giving</button></>}</div></section>
      {error && <section role="alert" className="rounded-2xl border border-rose-200/20 bg-rose-300/[0.06] p-4 sm:p-5"><p className="text-sm leading-relaxed text-rose-50/90">{errorKind === "app-check" && secureCheckStatus === "refreshing" ? "The browser check passed. We’re checking your practice information again now." : errorKind === "app-check" && secureCheckStatus === "request-rejected" ? "The browser connection checked out, but some practice information is still unavailable. Nothing was changed." : errorKind === "app-check" && secureCheckStatus === "unavailable" ? "We couldn’t check this browser connection. Your information wasn’t changed." : errorKind === "app-check" ? "Your account is signed in, but we couldn’t load some practice information." : error}</p>{errorKind === "app-check" ? secureCheckStatus === "idle" ? <button type="button" onClick={checkSecureConnection} className="mt-3 min-h-10 rounded-lg border border-rose-100/25 px-4 text-sm font-medium text-rose-50 hover:bg-rose-100/10">Check connection</button> : secureCheckStatus === "checking" ? <p className="mt-3 text-sm text-rose-50/75" role="status">Checking this browser…</p> : secureCheckStatus === "refreshing" ? <p className="mt-3 text-sm text-rose-50/75" role="status">Refreshing your practice information…</p> : null : <div className="mt-3 flex flex-wrap gap-2">{errorKind === "auth" ? <button type="button" onClick={() => navigate("/login", { state: { from: { pathname: "/provider/dashboard" } } })} className="min-h-10 rounded-lg bg-amber-200 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-100">Sign in</button> : <button type="button" onClick={() => setDashboardRetry((value) => value + 1)} className="min-h-10 rounded-lg border border-rose-100/25 px-4 text-sm font-medium text-rose-50 hover:bg-rose-100/10">Try again</button>}</div>}</section>}
      {loading || !currentScopeLoaded ? <div className="py-10 text-center text-white/50">Loading your workspace…</div> : <>
        <section aria-label="Your work at a glance" className="grid gap-3 sm:grid-cols-3">{workAtAGlance.map((item) => <a key={item.label} href={item.href} aria-label={`${item.label}: ${item.value}. ${item.detail}`} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-4 transition hover:border-amber-100/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100/70"><span className="block text-sm text-white/60">{item.label}</span><span className="mt-1 block text-3xl font-semibold tabular-nums text-white">{item.value}</span><span className="mt-1 block text-xs leading-relaxed text-white/45">{item.detail}</span></a>)}</section>
        <section className="rounded-2xl border border-violet-200/15 bg-violet-100/[0.025] p-5" aria-labelledby="gatekeeper-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-100/60">Optional pathway conversation aid</p>
          <h2 id="gatekeeper-heading" className="mt-2 font-semibold">Prepare a consent-first next step</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-white/55">Choose a general support pathway to prepare a respectful opening question and one coordination idea. No client details are sent. This does not assess need, select treatment, check provider availability, or make a referral.</p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Choose a general support pathway">
            {[["primary-care", "Primary care"], ["licensed-mental-health", "Licensed mental health"], ["substance-use-support", "Substance-use support"], ["peer-recovery-support", "Peer recovery"], ["care-coordination", "Care coordination"], ["not-sure", "Not sure yet"]].map(([value, label]) => <button key={value} type="button" aria-pressed={gatekeeperPathway === value} onClick={() => { setGatekeeperPathway(value); setGatekeeperResult(null); setGatekeeperError(""); setGatekeeperFallback(false); }} className={`min-h-10 rounded-full border px-3 text-sm ${gatekeeperPathway === value ? "border-violet-100/40 bg-violet-100/[0.14] text-white" : "border-white/10 bg-white/[0.035] text-white/65 hover:bg-white/[0.07]"}`}>{label}</button>)}
            <button type="button" onClick={() => { setGatekeeperPathway(""); setGatekeeperResult(null); setGatekeeperError(""); setGatekeeperFallback(false); }} className="min-h-10 rounded-full px-3 text-sm text-white/55 underline-offset-4 hover:underline">Clear</button>
          </div>
          <button type="button" disabled={!gatekeeperPathway || gatekeeperLoading} onClick={prepareGatekeeperPathway} className="mt-4 min-h-10 rounded-xl bg-violet-100/[0.12] px-4 text-sm font-medium text-white hover:bg-violet-100/[0.18] disabled:cursor-not-allowed disabled:opacity-40">{gatekeeperLoading ? "Preparing conversation…" : "Prepare conversation"}</button>
          {gatekeeperFallback && <p className="mt-3 text-xs text-amber-100/75" role="status">The guided suggestion did not load, so this workspace is showing a role-appropriate conversation prompt instead.</p>}
          {gatekeeperResult && <div className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-slate-950/45 p-4 text-sm sm:grid-cols-3" aria-live="polite"><div><p className="text-xs font-semibold uppercase tracking-wide text-white/45">Ask</p><p className="mt-1 leading-relaxed text-white/80">{gatekeeperResult.openingQuestion}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-white/45">Possible next step</p><p className="mt-1 leading-relaxed text-white/80">{gatekeeperResult.nextStep}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-white/45">Check preference</p><p className="mt-1 leading-relaxed text-white/80">{gatekeeperResult.preferenceCheck}</p></div></div>}
          {gatekeeperError && <p role="alert" className="mt-3 text-sm text-amber-100/85">{gatekeeperError}</p>}
        </section>
        <div className="grid gap-6 lg:grid-cols-2"><ConnectionRequestsPanel id="connection-requests-panel" style={{ order: workspace.panelOrder.connections }} onAccepted={refreshClients} isSignedIn={Boolean(userId)} appVerificationFailed={errorKind === "app-check"} onSignIn={() => navigate("/login", { state: { from: { pathname: "/provider/dashboard" } } })} title={workspace.requestHeading} description={workspace.requestSummary} /><section id="schedule-panel" style={{ order: workspace.panelOrder.schedule }} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><div className="mb-4 flex items-center gap-3"><CalendarDays className="h-5 w-5 text-amber-100" /><div><h2 className="font-medium">{workspace.scheduleHeading}</h2><p className="text-xs text-white/50">{workspace.scheduleSummary} · {timezoneFromAvailability ? `times in ${timezone}` : `your local time (${timezone})`}</p></div><button onClick={() => navigate("/provider/schedule", { state: { from: { pathname: "/provider/dashboard" } } })} className="ml-auto text-sm text-amber-100">Open schedule</button></div>{appointmentsUnavailable ? <div role="alert" className="rounded-xl border border-amber-100/15 bg-amber-100/[0.04] p-4 text-sm text-amber-50/75"><p>{errorKind === "app-check" ? "Appointments aren’t available right now." : "We couldn’t load your appointments. Your schedule is unknown until you try again."}</p>{errorKind !== "app-check" && <button type="button" onClick={() => setScheduleRetry((value) => value + 1)} className="mt-3 min-h-10 rounded-lg border border-amber-100/25 px-3 text-sm text-amber-50 hover:bg-amber-100/10">Try again</button>}</div> : appointments.length ? <div className="space-y-2">{appointments.slice(0, 6).map((appointment) => { const time = formatAppointmentTime(appointment.startAt, timezone); return <div key={appointment.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-3"><div><p className="text-sm font-medium">{time.day}</p><p className="mt-1 text-xs text-white/55">{time.time} · {appointment.status}</p></div></div>; })}</div> : <p className="rounded-xl bg-slate-950/35 p-4 text-sm text-white/55">No appointments in the next two weeks. You can add one from Schedule.</p>}</section></div>
        {workspace.careCoordination ? <section style={{ order: workspace.panelOrder.updates }} className="rounded-2xl border border-emerald-200/15 bg-emerald-100/[0.025] p-5" aria-labelledby="shared-updates-title"><div className="flex items-center gap-3"><HeartHandshake className="h-5 w-5 text-emerald-100" /><div><h2 id="shared-updates-title" className="font-semibold">{workspace.updatesHeading}</h2><p className="text-xs text-white/50">{workspace.updatesSummary}</p></div><span className="ml-auto rounded-full bg-white/5 px-3 py-1 text-sm text-white/70">{careHandoffsUnavailable ? "—" : careHandoffItems.length}</span></div>{careHandoffsUnavailable && <div role="alert" className="mt-3 rounded-xl border border-amber-100/15 bg-amber-100/[0.04] p-3 text-sm text-amber-50/75"><p>Some requests couldn’t be checked. This queue may be incomplete.</p>{errorKind !== "app-check" && <button type="button" onClick={() => setDashboardRetry((value) => value + 1)} className="mt-2 min-h-9 rounded-lg border border-amber-100/25 px-3 text-sm text-amber-50 hover:bg-amber-100/10">Try again</button>}</div>}{careHandoffItems.length ? <ul className="mt-3 divide-y divide-white/8">{careHandoffItems.slice(0, 6).map((item) => { const fields = new Set(item.sharedFields || []); const when = item.updatedAt ? new Date(item.updatedAt) : null; const dateLabel = when && !Number.isNaN(when.getTime()) ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(when) : "Recently"; return <li key={item.id} className="flex flex-wrap items-start gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.alias} <span className="font-normal text-white/45">· {(item.needType || "Practical support").replaceAll("-", " ")}</span></p>{fields.has("goal") && item.goal && <p className="mt-1 text-sm leading-relaxed text-white/75">{item.goal}</p>}{fields.has("timing") && item.timing && <p className="mt-1 text-xs text-white/55">Timing: {item.timing}</p>}{fields.has("contactPreference") && item.contactPreference && <p className="mt-1 text-xs text-white/55">Contact: {item.contactPreference}</p>}<p className="mt-1 text-xs text-emerald-100/65">{({ requested: "Needs response", acknowledged: "Acknowledged", in_progress: "Follow-up in progress", waiting_on_client: "Waiting on client", follow_up_complete: "Follow-up complete" })[item.status] || "Shared request"} · {dateLabel}</p></div><button type="button" onClick={() => navigate(`/provider/clients/${encodeURIComponent(item.clientId)}`)} className="min-h-9 rounded-lg border border-white/15 px-3 text-xs text-white/75 hover:bg-white/[0.05]">Review next step</button></li>; })}</ul> : <p className="mt-4 rounded-xl bg-slate-950/35 p-4 text-sm leading-relaxed text-white/55">{careHandoffsUnavailable ? "The request queue is unavailable right now." : "No client-shared practical-help requests are waiting. New requests appear here after a client chooses what to share."}</p>}<p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-white/45"><span aria-hidden="true">🔒</span>Only client-selected request fields appear here. No clinical notes, private check-ins, or supervision records are included.</p></section> : <section style={{ order: workspace.panelOrder.updates }} className="rounded-2xl border border-sky-200/15 bg-sky-100/[0.025] p-5" aria-labelledby="shared-updates-title"><div className="flex items-center gap-3"><HeartHandshake className="h-5 w-5 text-sky-100" /><div><h2 id="shared-updates-title" className="font-semibold">{workspace.updatesHeading}</h2><p className="text-xs text-white/50">{workspace.updatesSummary}</p></div><span className="ml-auto rounded-full bg-white/5 px-3 py-1 text-sm text-white/70">{workspace.primaryCare && visitPreparationsUnavailable || sharedUpdatesUnavailable ? "—" : sharedUpdates.length}</span></div>{sharedUpdates.length ? <ul className="mt-4 divide-y divide-white/8">{sharedUpdates.slice(0, 5).map((update) => { const tool = TOOLS.find((item) => item.id === update.toolId); const date = update.submittedAt ? new Date(update.submittedAt) : null; const dateLabel = date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date) : "Recently"; const linkedAppointment = workspace.primaryCare ? appointments.find((appointment) => appointment.id === update.appointmentId) : null; const visitDate = linkedAppointment ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", timeZone: timezone }).format(new Date(linkedAppointment.startAt)) : ""; return <li key={update.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0 flex-1"><p className="text-sm font-medium text-white">{update.alias} <span className="font-normal text-white/45">· {workspace.primaryCare ? "Visit preparation" : tool?.name || "Shared practice"}</span></p>{workspace.primaryCare && visitDate && <p className="mt-1 text-xs text-white/55">For the upcoming visit on {visitDate}</p>}<p className="mt-1 text-xs text-sky-100/70">{formatWorkspaceUpdate(update, workspace.primaryCare, dateLabel)}</p>{workspace.primaryCare && <p className="mt-1 text-xs text-white/55">{update.acknowledgedAt ? "Receipt acknowledged" : "Awaiting your acknowledgement"}</p>}</div><button type="button" onClick={() => navigate(`/provider/clients/${encodeURIComponent(update.clientId)}`)} className="min-h-9 rounded-lg border border-white/15 px-3 text-xs text-white/75 hover:bg-white/[0.05]">{workspace.primaryCare ? "Review visit preparation" : "Review client"}</button></li>; })}</ul> : <>{(workspace.primaryCare && visitPreparationsUnavailable || sharedUpdatesUnavailable) ? <div role="alert" className="mt-4 rounded-xl border border-amber-100/15 bg-amber-100/[0.04] p-4 text-sm text-amber-50/75"><p>{errorKind === "app-check" ? "Shared updates aren’t available right now." : workspace.primaryCare ? "Visit preparation couldn’t be checked. This queue may be incomplete." : "Client-shared updates couldn’t be checked. This queue may be incomplete."}</p>{errorKind !== "app-check" && <button type="button" onClick={() => setDashboardRetry((value) => value + 1)} className="mt-2 min-h-9 rounded-lg border border-amber-100/25 px-3 text-sm text-amber-50 hover:bg-amber-100/10">Try again</button>}</div> : <p className="mt-4 rounded-xl bg-slate-950/35 p-4 text-sm leading-relaxed text-white/55">{workspace.primaryCare ? "No patient-shared visit preparation is waiting for an upcoming appointment." : "No client-shared practice updates yet. When a client chooses to send an update, it will appear here."}</p>}</>}</section>}
        <section id="people-panel" style={{ order: workspace.panelOrder.people }} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6"><div className="flex items-center gap-3"><HeartHandshake className="h-5 w-5 text-emerald-200" /><div><h2 className="font-semibold">{workspace.peopleHeading}</h2><p className="text-xs text-white/50">{workspace.peopleSummary}</p></div><span className="ml-auto rounded-full bg-white/5 px-3 py-1 text-sm text-white/70">{clientsUnavailable ? "—" : visibleClients.length}</span></div>{clientsUnavailable ? <div role="alert" className="mt-4 rounded-xl border border-amber-100/15 bg-amber-100/[0.04] p-4 text-sm text-amber-50/75"><p>{errorKind === "app-check" ? "Your connected clients aren’t available right now." : "Your connected people couldn’t be checked. The list may be incomplete."}</p>{errorKind !== "app-check" && <button type="button" onClick={() => setDashboardRetry((value) => value + 1)} className="mt-2 min-h-9 rounded-lg border border-amber-100/25 px-3 text-sm text-amber-50 hover:bg-amber-100/10">Try again</button>}</div> : visibleClients.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{visibleClients.map((client) => { const view = client.overview; const recent = view?.checkins?.[0]; return <button key={client.id} onClick={() => navigate(`/provider/clients/${client.clientId}`)} className="rounded-xl border border-white/10 bg-slate-950/45 p-4 text-left transition hover:border-amber-100/25"><h3 className="font-medium">{client.alias}</h3>{workspace.careCoordination ? <p className="mt-1 text-xs text-white/55">Open the person’s page to review currently shared requests and update follow-up.</p> : view?.unavailable ? <p className="mt-1 text-xs leading-relaxed text-amber-100/70">Sharing details couldn’t be confirmed. Open this client’s page or refresh before acting on their current sharing choices.</p> : view?.sharingPaused ? <p className="mt-1 text-xs leading-relaxed text-amber-100/70">{view.sharingStatusUnknown ? "Personal sharing is hidden because its status could not be confirmed." : "Personal sharing is temporarily paused. Existing client choices remain saved."}</p> : view?.shared ? <><p className="mt-1 text-xs text-white/55">{view.totalRecentCheckins} recent check-ins shared{view.latestCheckInAt ? ` · last ${new Date(view.latestCheckInAt).toLocaleDateString()}` : ""}</p><div className="mt-3 flex flex-wrap gap-2 text-xs">{recent?.mood && <span className="rounded-lg bg-white/5 px-2 py-1">Mood: {recent.mood}</span>}{recent?.cravingStatus && <span className="rounded-lg bg-white/5 px-2 py-1">Craving: {recent.cravingStatus}{recent.cravingIntensity != null ? ` ${recent.cravingIntensity}/10` : ""}</span>}{recent?.triggerStatus && <span className="rounded-lg bg-white/5 px-2 py-1">Trigger: {recent.triggerStatus}{recent.triggerIntensity != null ? ` ${recent.triggerIntensity}/10` : ""}</span>}</div></> : <p className="mt-1 text-xs text-white/45">No check-in details shared. Private by default.</p>}{!workspace.careCoordination && view?.practiceProgress?.length > 0 && <p className="mt-3 text-xs text-sky-100/70">{view.practiceProgress.length} client-shared practice {view.practiceProgress.length === 1 ? "update" : "updates"}</p>}</button>; })}</div> : <p className="mt-4 rounded-xl bg-slate-950/35 p-4 text-sm text-white/55">People appear here after they request a connection and you accept.</p>}</section>
      </>}
    </div>
  </div>;
}
