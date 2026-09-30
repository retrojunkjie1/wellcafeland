import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CalendarClock, Check, ExternalLink, RefreshCw, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  confirmMyAppointment,
  listAppointmentsForClient,
  listMyAppointmentRequests,
  listMyConnectedPractitioners,
  getConnectedPractitionerAvailability,
  requestAppointmentTimeChange,
  requestProviderAppointment,
} from "@/services/appointmentService";

function formatAppointment(value) {
  const date = new Date(value);
  return {
    day: date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    time: date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
  };
}

function formatSlotLabel(slot, providerTimezone) {
  if (!slot?.startAt || !providerTimezone) return slot?.label || "Available time";
  const date = new Date(slot.startAt);
  const day = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric", timeZone: providerTimezone }).format(date);
  const providerTime = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZone: providerTimezone }).format(date);
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localTime = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZone: localTimezone }).format(date);
  const localDay = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric", timeZone: localTimezone }).format(date);
  const providerPart = `${providerTime} practitioner time`;
  const localPart = providerTimezone === localTimezone ? "your local time" : `${localTime}${localDay === day ? "" : ` (${localDay})`} your time`;
  return `${day} · ${providerPart} · ${localPart}`;
}

function getSecureMeetingHost(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.host : "";
  } catch {
    return "";
  }
}

export default function ClientUpcomingAppointments() {
  const { user } = useAuth();
  const identityScope = user?.uid || (user?.isAnonymous ? "guest" : "signed-out");
  const identityScopeRef = useRef(identityScope);
  const scheduleRequestRef = useRef(0);
  const autoRefreshAtRef = useRef(0);
  const availabilityRequestRef = useRef(0);
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState("loading");
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");
  const [requestId, setRequestId] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [practitioners, setPractitioners] = useState([]);
  const [sessionRequests, setSessionRequests] = useState([]);
  const [requestFormOpen, setRequestFormOpen] = useState(false);
  const [sessionProviderId, setSessionProviderId] = useState("");
  const [sessionStart, setSessionStart] = useState("");
  const [sessionLength, setSessionLength] = useState("45");
  const [sessionNote, setSessionNote] = useState("");
  const [requestServiceError, setRequestServiceError] = useState("");
  const [providerAvailability, setProviderAvailability] = useState(null);
  const [providerAvailabilityKey, setProviderAvailabilityKey] = useState("");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityLoadError, setAvailabilityLoadError] = useState("");
  const [availabilityRetry, setAvailabilityRetry] = useState(0);
  const availabilityKey = `${identityScope}:${sessionProviderId}:${sessionLength}`;

  useLayoutEffect(() => {
    if (identityScopeRef.current === identityScope) return;
    identityScopeRef.current = identityScope;
    scheduleRequestRef.current += 1;
    availabilityRequestRef.current += 1;
    setAppointments([]);
    setPractitioners([]);
    setSessionRequests([]);
    setProviderAvailability(null);
    setStatus(user && !user.isAnonymous ? "loading" : "signed-out");
    setRefreshing(false);
    setBusyId("");
    setActionError("");
    setRequestServiceError("");
    setRequestId("");
    setRequestMessage("");
    setRequestFormOpen(false);
    setSessionProviderId("");
    setSessionStart("");
    setSessionNote("");
    setAvailabilityLoading(false);
    setAvailabilityLoadError("");
    setProviderAvailabilityKey("");
  }, [identityScope, user?.isAnonymous]);

  const refreshSchedule = useCallback(async (isActive = () => true, showLoading = false) => {
    const scope = identityScope;
    const requestId = ++scheduleRequestRef.current;
    const isCurrent = () => isActive() && identityScopeRef.current === scope && scheduleRequestRef.current === requestId;
    if (!user || user.isAnonymous) {
      if (!isCurrent()) return;
      setAppointments([]);
      setStatus("signed-out");
      return;
    }
    if (showLoading) setStatus("loading");
    else setRefreshing(true);
    setRequestServiceError("");
    const [appointmentsResult, practitionersResult, requestsResult] = await Promise.allSettled([
      listAppointmentsForClient(user.uid),
      listMyConnectedPractitioners(),
      listMyAppointmentRequests(),
    ]);
    if (!isCurrent()) return;
    if (appointmentsResult.status === "fulfilled") setAppointments(appointmentsResult.value);
    if (practitionersResult.status === "fulfilled") {
      setPractitioners(practitionersResult.value);
      if (practitionersResult.value[0]) setSessionProviderId((current) => current || practitionersResult.value[0].id);
    } else setRequestServiceError("Connected practitioners aren’t available right now. Please try again.");
    if (requestsResult.status === "fulfilled") setSessionRequests(requestsResult.value);
    else setRequestServiceError("We couldn’t check your session requests just now.");
    setStatus(appointmentsResult.status === "fulfilled" ? "ready" : "error");
    setRefreshing(false);
  }, [identityScope, user?.isAnonymous]);

  useEffect(() => {
    let active = true;
    refreshSchedule(() => active, true);
    return () => { active = false; };
  }, [refreshSchedule]);

  useEffect(() => {
    if (status !== "ready" || !user || user.isAnonymous) return undefined;
    const refreshWhenVisible = () => {
      if (document.visibilityState === "hidden") return;
      const now = Date.now();
      if (now - autoRefreshAtRef.current < 30_000) return;
      autoRefreshAtRef.current = now;
      void refreshSchedule();
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refreshSchedule, status, user?.uid, user?.isAnonymous]);

  useEffect(() => {
    let active = true;
    const scope = identityScope;
    const requestId = ++availabilityRequestRef.current;
    const isCurrent = () => active && identityScopeRef.current === scope && availabilityRequestRef.current === requestId;
    const requestKey = `${scope}:${sessionProviderId}:${sessionLength}`;
    if (!sessionProviderId || !user || user.isAnonymous) {
      setProviderAvailability(null);
      setProviderAvailabilityKey("");
      setAvailabilityLoadError("");
      setAvailabilityLoading(false);
      return () => { active = false; };
    }
    setAvailabilityLoading(true);
    setProviderAvailability(null);
    setProviderAvailabilityKey("");
    setAvailabilityLoadError("");
    getConnectedPractitionerAvailability(sessionProviderId, Number(sessionLength)).then((data) => {
      if (isCurrent()) {
        setProviderAvailability(data);
        setProviderAvailabilityKey(requestKey);
      }
    }).catch(() => {
      if (isCurrent()) {
        setProviderAvailability(null);
        setProviderAvailabilityKey("");
        setAvailabilityLoadError(requestKey);
      }
    }).finally(() => { if (isCurrent()) setAvailabilityLoading(false); });
    return () => { active = false; };
  }, [availabilityRetry, identityScope, sessionProviderId, sessionLength, user?.isAnonymous]);

  if (status === "signed-out") return <section aria-label="Session requests" className="rounded-2xl border border-sky-200/15 bg-sky-200/[0.035] p-4 text-white sm:p-5"><h2 className="text-base font-semibold">Request a session</h2><p className="mt-1 text-sm leading-relaxed text-white/60">Sign in with your personal account to manage sessions with practitioners you’re connected to.</p><Link to="/login" state={{ from: { pathname: "/home" } }} className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-sky-100 px-3 text-sm font-semibold text-slate-950">Sign in to manage sessions</Link></section>;

  const confirm = async (appointmentId) => {
    const scope = identityScope;
    setBusyId(appointmentId);
    setActionError("");
    try {
      const result = await confirmMyAppointment(appointmentId);
      if (identityScopeRef.current !== scope) return;
      if (result?.ok) {
        setAppointments((current) => current.map((item) => item.id === appointmentId ? { ...item, status: "confirmed" } : item));
      } else {
        setActionError(result?.error || "We couldn’t confirm this session right now. Please try again.");
      }
    } catch {
      if (identityScopeRef.current === scope) setActionError("We couldn’t confirm this session right now. Check your connection and try again.");
    } finally {
      if (identityScopeRef.current === scope) setBusyId("");
    }
  };

  const sendTimeChangeRequest = async (appointmentId) => {
    const scope = identityScope;
    setBusyId(appointmentId);
    setActionError("");
    try {
      const result = await requestAppointmentTimeChange(appointmentId, requestMessage);
      if (identityScopeRef.current !== scope) return;
      if (result?.ok) {
        setAppointments((current) => current.map((item) => item.id === appointmentId
          ? { ...item, changeRequest: { status: "pending", message: requestMessage.trim(), responseMessage: "" } }
          : item));
        setRequestId("");
        setRequestMessage("");
      } else {
        setActionError(result?.error || "We couldn’t send your time change request. Please try again.");
      }
    } catch {
      if (identityScopeRef.current === scope) setActionError("We couldn’t send your time change request. Check your connection and try again.");
    } finally {
      if (identityScopeRef.current === scope) setBusyId("");
    }
  };

  const sendSessionRequest = async (event) => {
    event.preventDefault();
    const scope = identityScope;
    if (!sessionProviderId || !sessionStart) {
      setActionError("Choose a connected practitioner and a time you’d like to meet.");
      return;
    }
    if (availabilityLoading || providerAvailabilityKey !== availabilityKey || availabilityLoadError === availabilityKey) {
      setActionError("Wait until this practitioner’s available times have finished loading, then choose an opening.");
      return;
    }
    if (!(providerAvailability?.upcomingSlots || []).some((slot) => slot.startAt === sessionStart)) {
      setActionError("Choose one of the current openings before sending your request.");
      return;
    }
    const startAt = new Date(sessionStart);
    if (!Number.isFinite(startAt.getTime()) || startAt.getTime() <= Date.now()) {
      setActionError("Choose a time in the future.");
      return;
    }
    const endAt = new Date(startAt.getTime() + Number(sessionLength) * 60_000);
    setBusyId("new-session");
    setActionError("");
    try {
      const result = await requestProviderAppointment({
        providerId: sessionProviderId,
        requestedStartAt: startAt,
        requestedEndAt: endAt,
        note: sessionNote.trim(),
      });
      if (identityScopeRef.current !== scope) return;
      if (result?.ok) {
        const practitioner = practitioners.find((item) => item.id === sessionProviderId);
        setSessionRequests((current) => [{
          id: result.requestId,
          providerId: sessionProviderId,
          practitionerName: practitioner?.name || "Your practitioner",
          requestedStartAt: startAt.toISOString(),
          requestedEndAt: endAt.toISOString(),
          status: "pending",
        }, ...current]);
        setSessionStart("");
        setSessionNote("");
        setRequestFormOpen(false);
      } else setActionError(result?.error || "We couldn’t send your session request. Please try again.");
    } catch {
      if (identityScopeRef.current === scope) setActionError("We couldn’t send your session request. Check your connection and try again.");
    } finally {
      if (identityScopeRef.current === scope) setBusyId("");
    }
  };

  const availabilityReady = !availabilityLoading && providerAvailabilityKey === availabilityKey && availabilityLoadError !== availabilityKey;
  const availabilityFailed = !availabilityLoading && availabilityLoadError === availabilityKey;
  const publishedHours = (availabilityReady ? providerAvailability?.weeklyHours || [] : []).filter((day) => day.enabled);
  const availableSlots = availabilityReady ? providerAvailability?.upcomingSlots || [] : [];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const formatClock = (value) => {
    if (!value) return "";
    const [hours, minutes] = value.split(":").map(Number);
    return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(undefined, { hour: "numeric", minute: minutes ? "2-digit" : undefined });
  };

  return (
    <section id="client-sessions" aria-label="Your upcoming sessions" className="scroll-mt-24 rounded-2xl border border-sky-200/15 bg-sky-200/[0.035] p-4 text-white sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex min-w-0 items-start gap-3">
          <div className="shrink-0 rounded-xl bg-sky-200/10 p-2.5 text-sky-100"><CalendarClock className="h-5 w-5" aria-hidden="true" /></div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold">Your upcoming sessions</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/55">Appointments your connected practitioner has scheduled for you.</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 sm:ml-auto">
          {status === "ready" && <button type="button" onClick={() => refreshSchedule()} disabled={refreshing} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-white/15 px-3 text-xs text-white/75 transition hover:bg-white/[0.05] disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? "Refreshing…" : "Refresh sessions"}</button>}
          <Link to="/providers" aria-label="Browse practitioners" title="Browse practitioners" className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg p-2 text-white/60 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-200">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {status === "loading" && <p className="mt-4 text-sm text-white/55" role="status">Checking your schedule…</p>}
      {status === "error" && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-100/15 bg-amber-100/[0.04] p-3">
        <p className="text-sm text-amber-50/80" role="status">Your schedule could not load just now. Try again when you’re ready.</p>
        <button type="button" onClick={() => refreshSchedule(() => true, true)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-amber-100/20 px-3 text-sm font-medium text-amber-50 transition hover:bg-amber-100/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-100">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />Try again
        </button>
      </div>}
      {status === "ready" && appointments.length === 0 && <p className="mt-4 rounded-xl border border-white/8 bg-slate-950/30 p-3 text-sm text-white/55">No upcoming sessions have been scheduled yet.</p>}
      {actionError && <p className="mt-3 rounded-lg border border-amber-100/15 bg-amber-100/[0.04] p-3 text-sm text-amber-50/80" role="alert">{actionError}</p>}
      {status === "ready" && <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/35 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-medium text-white">Request a session</h3><p className="mt-1 text-xs leading-relaxed text-white/50">Choose a time to ask about. It isn’t booked until your practitioner accepts.</p></div>
          {practitioners.length > 0 && <button type="button" onClick={() => { setRequestFormOpen((open) => !open); setActionError(""); }} className="min-h-10 rounded-lg bg-sky-100 px-3 text-sm font-semibold text-slate-950">{requestFormOpen ? "Close" : "Choose a time"}</button>}
        </div>
        {requestServiceError && <p role="status" className="mt-3 text-sm text-amber-50/70">{requestServiceError}</p>}
        {practitioners.length === 0 && <p className="mt-3 text-sm text-white/55">Session requests are available after you and a practitioner accept a connection. <Link to="/providers" className="text-sky-100 underline underline-offset-4">Explore practitioners</Link></p>}
        {requestFormOpen && practitioners.length > 0 && <form onSubmit={sendSessionRequest} className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
            <label className="text-sm text-white/75">Practitioner<select value={sessionProviderId} onChange={(event) => { setSessionProviderId(event.target.value); setSessionStart(""); }} className="mt-1.5 min-h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-white">{practitioners.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <div className="rounded-xl border border-white/10 bg-slate-950/55 p-3 sm:col-span-2">
            <h4 className="text-sm font-medium text-white/85">When this practitioner is usually available</h4>
            {availabilityLoading || (!availabilityReady && !availabilityFailed) ? <p className="mt-2 text-sm text-white/50" role="status">Checking their shared hours…</p> : availabilityFailed ? <div className="mt-2 flex flex-wrap items-center gap-3"><p className="text-sm leading-relaxed text-amber-50/75" role="status">We couldn’t load these times.</p><button type="button" onClick={() => setAvailabilityRetry((retry) => retry + 1)} className="min-h-10 rounded-lg border border-white/15 px-3 text-sm font-medium text-white/85 transition hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-200">Try again</button></div> : publishedHours.length > 0 ? <><ul className="mt-2 flex flex-wrap gap-2">{publishedHours.map((day) => <li key={day.dayOfWeek} className="rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-xs text-white/75">{dayNames[day.dayOfWeek]} · {formatClock(day.start)}–{formatClock(day.end)}</li>)}</ul><p className="mt-2 text-xs text-white/40">Times are in {providerAvailability?.timezone}. Choose an open session time from the list below.</p>{!availableSlots.length && <p className="mt-2 text-sm text-white/55">No openings match this session length in the next 3 weeks. Try another length or ask your practitioner about a time.</p>}</> : availabilityReady ? <p className="mt-2 text-sm leading-relaxed text-white/55">This practitioner hasn’t shared appointment hours yet, so online requests are paused. You can contact them through your connection to arrange a time.</p> : null}
          </div>
          <label className="text-sm text-white/75">Session length<select value={sessionLength} onChange={(event) => { setSessionLength(event.target.value); setSessionStart(""); }} className="mt-1.5 min-h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-white"><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">1 hour</option><option value="90">1 hour 30 minutes</option></select></label>
          <label className="text-sm text-white/75">Available times<select aria-label="Available appointment time" value={sessionStart} onChange={(event) => setSessionStart(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-white" required disabled={!availabilityReady || availabilityFailed || availableSlots.length === 0}><option value="">{availabilityLoading || !availabilityReady && !availabilityFailed ? "Finding open times…" : availabilityFailed ? "Times unavailable — try again" : availableSlots.length ? "Choose an opening" : "No open times in the next 3 weeks"}</option>{availableSlots.map((slot) => <option key={slot.startAt} value={slot.startAt}>{formatSlotLabel(slot, providerAvailability?.timezone)}</option>)}</select></label>
          <label className="text-sm text-white/75 sm:col-span-2">Note for your practitioner (optional)<textarea value={sessionNote} onChange={(event) => setSessionNote(event.target.value)} maxLength={240} rows={2} placeholder="Share a brief scheduling note. Please leave health details out." className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white placeholder:text-white/35" /></label>
          <button type="submit" disabled={busyId === "new-session" || !availabilityReady || availabilityFailed || !sessionStart || availableSlots.length === 0} className="min-h-11 rounded-lg bg-sky-100 px-4 text-sm font-semibold text-slate-950 disabled:opacity-50 sm:col-span-2">{busyId === "new-session" ? "Sending request…" : "Send session request"}</button>
        </form>}
        {sessionRequests.length > 0 && <ul className="mt-4 grid gap-2 sm:grid-cols-2">{sessionRequests.map((request) => <li key={request.id} className="rounded-lg border border-white/[0.08] bg-white/[0.025] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium text-white">{request.practitionerName}</p><span className={`rounded-full px-2 py-1 text-xs ${request.status === "accepted" ? "bg-emerald-200/10 text-emerald-100" : request.status === "declined" ? "bg-white/10 text-white/60" : "bg-amber-100/10 text-amber-100"}`}>{request.status === "pending" ? "Waiting for reply" : request.status === "accepted" ? "Accepted" : "Could not meet at that time"}</span></div><p className="mt-1 text-xs text-white/50">{request.requestedStartAt ? `${formatAppointment(request.requestedStartAt).day} · ${formatAppointment(request.requestedStartAt).time} your local time` : "Time requested"}</p>{request.responseMessage && <p className="mt-2 text-xs leading-relaxed text-white/60">{request.responseMessage}</p>}</li>)}</ul>}
      </div>}
      {appointments.length > 0 && <ul className="mt-4 grid gap-2 sm:grid-cols-2">{appointments.map((appointment) => {
        const time = formatAppointment(appointment.startAt);
        const startsSoon = new Date(appointment.startAt).getTime() - Date.now() <= 24 * 60 * 60 * 1000;
        return <li key={appointment.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium text-white">{time.day}</p><span className={`rounded-full px-2.5 py-1 text-xs ${appointment.status === "confirmed" ? "bg-emerald-200/10 text-emerald-100" : "bg-amber-100/10 text-amber-100"}`}>{appointment.status === "confirmed" ? "Confirmed" : "Please confirm"}</span></div>
          <p className="mt-1 text-sm text-sky-100">{time.time} · your local time</p>
          <p className="mt-2 text-xs text-white/55">With {appointment.practitionerName}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/55">{appointment.sessionFormat !== "in-person" ? <Video className="h-3.5 w-3.5" aria-hidden="true" /> : null}{appointment.sessionFormat === "wellnesscafe-video" ? "WellnessCafe private room" : appointment.sessionFormat === "video" ? "External video session" : "In-person session"}</p>
          {appointment.sessionFormat === "wellnesscafe-video" && <div className="mt-3 rounded-xl border border-emerald-200/15 bg-emerald-200/[0.045] p-3"><p className="text-sm text-emerald-100">WellnessCafe private room</p>{appointment.status === "confirmed" ? <Link to={`/sessions/${encodeURIComponent(appointment.id)}/video?returnTo=client`} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-100 px-4 text-sm font-semibold text-slate-950"><Video className="h-4 w-4" aria-hidden="true" />Join private session</Link> : <p className="mt-1 text-xs text-white/55">Join becomes available once both people confirm.</p>}</div>}
          {appointment.sessionFormat === "video" && getSecureMeetingHost(appointment.meetingLink) && <div className="mt-3 rounded-xl border border-sky-200/15 bg-sky-200/[0.045] p-3"><p className="text-xs text-white/65">Your practitioner shared a video meeting link.</p><p className="mt-1 text-xs text-white/45">Opens {getSecureMeetingHost(appointment.meetingLink)} in a new tab; this page stays open.</p><a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-100 px-4 text-sm font-semibold text-slate-950"><Video className="h-4 w-4" aria-hidden="true" />Join video session<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a></div>}
          {startsSoon && <p className="mt-3 rounded-lg bg-sky-100/[0.07] px-3 py-2 text-xs font-medium text-sky-100">Coming up within 24 hours</p>}
          {appointment.status === "scheduled" && <button type="button" disabled={busyId === appointment.id} onClick={() => confirm(appointment.id)} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-200 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-60"><Check className="h-4 w-4" aria-hidden="true" />{busyId === appointment.id ? "Saving…" : "Confirm session"}</button>}
          {appointment.changeRequest?.status === "pending" && <p className="mt-3 rounded-lg border border-amber-100/15 bg-amber-100/[0.045] px-3 py-2 text-sm text-amber-50/85" role="status">Your request for a different time has been sent. Your practitioner will follow up.{appointment.changeRequest.message && <span className="mt-1 block text-xs text-white/55">Your note: {appointment.changeRequest.message}</span>}</p>}
          {["accepted", "declined"].includes(appointment.changeRequest?.status) && <p className="mt-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-white/70" role="status">{appointment.changeRequest.responseMessage || (appointment.changeRequest.status === "accepted" ? "Your practitioner updated the session time." : "The current session time remains scheduled.")}</p>}
          {["scheduled", "confirmed"].includes(appointment.status) && appointment.changeRequest?.status !== "pending" && <div className="mt-3">
            {requestId === appointment.id ? <div className="rounded-xl border border-white/10 bg-slate-950/45 p-3">
              <label htmlFor={`change-request-${appointment.id}`} className="block text-sm font-medium text-white/85">Tell your practitioner what would help</label>
              <textarea id={`change-request-${appointment.id}`} value={requestMessage} maxLength={240} onChange={(event) => setRequestMessage(event.target.value)} rows={2} placeholder="For example: Could we find another time this week?" className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-sky-200/40 focus:outline-none" />
              <div className="mt-2 flex flex-wrap gap-2"><button type="button" disabled={busyId === appointment.id} onClick={() => sendTimeChangeRequest(appointment.id)} className="min-h-10 rounded-lg bg-sky-100 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60">{busyId === appointment.id ? "Sending…" : "Send request"}</button><button type="button" onClick={() => { setRequestId(""); setRequestMessage(""); }} className="min-h-10 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/70">Keep appointment</button></div>
            </div> : <button type="button" onClick={() => { setRequestId(appointment.id); setRequestMessage(""); }} className="min-h-10 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/75 transition hover:bg-white/[0.05]">Ask to change the time</button>}
          </div>}
        </li>;
      })}</ul>}
    </section>
  );
}
