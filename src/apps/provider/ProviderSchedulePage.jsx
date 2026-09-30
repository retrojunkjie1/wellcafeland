// src/apps/provider/ProviderSchedulePage.jsx
// Provider schedule/appointments page

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { listAssignmentsForProvider } from "@/services/assignmentService";
import {
  createAppointment,
  listAppointmentsForProvider,
  listProviderAppointmentRequests,
  getMyProviderAvailability,
  saveMyProviderAvailability,
  respondToAppointmentTimeChange,
  respondToProviderAppointmentRequest,
  updateAppointment,
} from "@/services/appointmentService";
import PageHeader from "@/components/navigation/PageHeader";
import { Calendar, Plus, Clock, User, RefreshCw, Users, ArrowLeft, Save, Video, ExternalLink, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { dateToLocalInputInZone, localInputInZoneToDate } from "./providerTime";
import { WELLNESSCAFE_VIDEO_ENABLED } from "@/config/videoSessionConfig";

const TIME_ZONES = (() => {
  let zones = [];
  try { zones = Intl.supportedValuesOf("timeZone"); } catch { zones = []; }
  const common = ["America/Anchorage", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/New_York", "America/Phoenix", "America/Toronto", "America/Vancouver", "Asia/Dubai", "Asia/Hong_Kong", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo", "Australia/Brisbane", "Australia/Melbourne", "Australia/Sydney", "Europe/Amsterdam", "Europe/Berlin", "Europe/London", "Europe/Paris", "Pacific/Auckland", "UTC"];
  return [...new Set(["UTC", ...zones, ...common])].sort((a, b) => a === "UTC" ? -1 : b === "UTC" ? 1 : a.localeCompare(b));
})();

function timeZoneLabel(zone) {
  const offset = new Intl.DateTimeFormat(undefined, { timeZone: zone, timeZoneName: "shortOffset" })
    .formatToParts(new Date()).find((part) => part.type === "timeZoneName")?.value || "GMT";
  return `${offset} · ${zone.replaceAll("_", " ")}`;
}

function formatTimeInZone(value, timezone) {
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: timezone }).format(date),
    time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short", timeZone: timezone }).format(date),
  };
}

const ProviderSchedulePage = () => {
  const navigate = useNavigate();
  const { providerId, userId, orgId, isLoading: identityLoading, isProvider, isAdmin } = useSessionIdentity();
  const identityScope = `${providerId || userId || ""}:${isProvider ? "provider" : isAdmin ? "admin" : "guest"}:${orgId || ""}`;
  const identityScopeRef = useRef(identityScope);
  const scheduleRequestSequence = useRef(0);
  const availabilityRequestSequence = useRef(0);
  const requestRefreshSequence = useRef(0);
  const requestRefreshScopes = useRef(new Set());
  identityScopeRef.current = identityScope;
  const [appointments, setAppointments] = useState([]);
  const [loadedScope, setLoadedScope] = useState("");
  const [scheduleUnavailable, setScheduleUnavailable] = useState(false);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    startAt: "",
    endAt: "",
    note: "",
    sessionFormat: "in-person",
    meetingLink: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [sessionRequests, setSessionRequests] = useState([]);
  const [requestServiceError, setRequestServiceError] = useState("");
  const [requestRefreshing, setRequestRefreshing] = useState(false);
  const [requestBusyId, setRequestBusyId] = useState("");
  const [requestSessionDetails, setRequestSessionDetails] = useState({});
  const [availability, setAvailability] = useState({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Denver",
    weeklyHours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })),
  });
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityScope, setAvailabilityScope] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const requestsCanRefresh = !identityLoading && !loading && loadedScope === identityScope;

  const loadData = useCallback(async () => {
    if (identityLoading) return;
    const requestScope = identityScope;
    const requestId = ++scheduleRequestSequence.current;
    const isCurrent = () => scheduleRequestSequence.current === requestId && identityScopeRef.current === requestScope;
    const providerIdToUse = providerId || userId;
    setLoading(true);
    setScheduleUnavailable(false);
    setError("");
    setRequestServiceError("");
    if (!providerIdToUse) {
      if (isCurrent()) {
        setAppointments([]);
        setClients([]);
        setSessionRequests([]);
        setLoadedScope(requestScope);
        setScheduleUnavailable(true);
        setError("Your signed-in account could not be confirmed. Sign in again to load this workspace.");
        setLoading(false);
      }
      return;
    }
    try {
      const [appointmentsData, assignments] = await Promise.all([
        listAppointmentsForProvider(providerIdToUse, { from: new Date() }),
        listAssignmentsForProvider(providerIdToUse),
      ]);
      if (!isCurrent()) return;
      const clientsData = assignments.map((assignment, index) => ({ id: assignment.clientId, alias: `Client ${index + 1}` }));
      let requestsData = [];
      let requestsError = "";
      try {
        requestsData = await listProviderAppointmentRequests();
      } catch (requestError) {
        requestsError = requestError?.message || "New session requests could not be loaded.";
      }
      if (!isCurrent()) return;
      setAppointments(appointmentsData);
      setClients(clientsData);
      setSessionRequests(requestsData);
      setRequestServiceError(requestsError);
      setLoadedScope(requestScope);
    } catch (err) {
      if (isCurrent()) {
        setAppointments([]);
        setClients([]);
        setSessionRequests([]);
        setLoadedScope(requestScope);
        setScheduleUnavailable(true);
        setError(err?.message || "The schedule could not be loaded. Please try again.");
      }
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [identityLoading, identityScope, providerId, userId]);

  const loadAvailability = useCallback(async () => {
    if (identityLoading) return;
    const requestScope = identityScope;
    const requestId = ++availabilityRequestSequence.current;
    const isCurrent = () => availabilityRequestSequence.current === requestId && identityScopeRef.current === requestScope;
    if (!providerId && !userId) {
      if (isCurrent()) {
        setAvailabilityScope("");
        setAvailabilityError("Your account could not be confirmed. Sign in again to load appointment hours.");
        setAvailabilityLoading(false);
      }
      return;
    }
    setAvailabilityLoading(true);
    setAvailabilityError("");
    try {
      const data = await getMyProviderAvailability();
      if (!isCurrent()) return;
      setAvailability({
        timezone: data?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Denver",
        weeklyHours: Array.isArray(data?.weeklyHours) && data.weeklyHours.length === 7
          ? data.weeklyHours
          : Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "09:00", end: "17:00" })),
      });
      setAvailabilityScope(requestScope);
    } catch (err) {
      if (isCurrent()) {
        setAvailabilityScope("");
        setAvailabilityError(err?.message || "Your appointment hours could not be loaded.");
      }
    } finally {
      if (isCurrent()) setAvailabilityLoading(false);
    }
  }, [identityLoading, identityScope, providerId, userId]);

  const refreshSessionRequests = useCallback(async ({ silent = false } = {}) => {
    if (identityLoading || (!providerId && !userId)) return;
    const requestScope = identityScope;
    if (requestRefreshScopes.current.has(requestScope)) return;
    requestRefreshScopes.current.add(requestScope);
    const requestId = ++requestRefreshSequence.current;
    const isCurrent = () => requestRefreshSequence.current === requestId && identityScopeRef.current === requestScope;
    setRequestRefreshing(true);
    if (!silent) setRequestServiceError("");
    try {
      const requests = await listProviderAppointmentRequests();
      if (isCurrent()) {
        setSessionRequests(requests);
        setRequestServiceError("");
      }
    } catch (requestError) {
      if (isCurrent()) setRequestServiceError(requestError?.message || "Session requests could not be refreshed. Please try again.");
    } finally {
      requestRefreshScopes.current.delete(requestScope);
      if (isCurrent()) setRequestRefreshing(false);
    }
  }, [identityLoading, identityScope, providerId, userId]);

  useEffect(() => {
    loadData();
    return () => { scheduleRequestSequence.current += 1; };
  }, [loadData]);

  useEffect(() => {
    loadAvailability();
    return () => { availabilityRequestSequence.current += 1; };
  }, [loadAvailability]);

  useEffect(() => {
    if (!requestsCanRefresh || !isProvider) return undefined;
    const refreshIfVisible = () => {
      if (!document.hidden) void refreshSessionRequests({ silent: true });
    };
    const interval = window.setInterval(refreshIfVisible, 60_000);
    document.addEventListener("visibilitychange", refreshIfVisible);
    window.addEventListener("focus", refreshIfVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshIfVisible);
      window.removeEventListener("focus", refreshIfVisible);
      requestRefreshSequence.current += 1;
    };
  }, [requestsCanRefresh, identityScope, isProvider, refreshSessionRequests]);

  useEffect(() => {
    setShowForm(false);
    setEditingId("");
    setFormData({ clientId: "", startAt: "", endAt: "", note: "", sessionFormat: "in-person", meetingLink: "" });
    setRequestSessionDetails({});
    setRequestRefreshing(false);
    setUpdatingId("");
    setRequestBusyId("");
    setNotice("");
    setError("");
    setScheduleUnavailable(false);
    setAvailabilitySaving(false);
    setSaving(false);
  }, [identityScope]);

  const saveAvailability = async () => {
    const requestScope = identityScope;
    if (availabilityLoading || availabilityScope !== requestScope || availabilityError) return;
    setAvailabilitySaving(true);
    setError("");
    setNotice("");
    try {
      const result = await saveMyProviderAvailability(availability);
      if (identityScopeRef.current !== requestScope) return;
      if (!result.ok) setError(result.error || "Your appointment hours could not be saved. Please try again.");
      else setNotice("Your appointment hours are saved. Connected clients can now request times within these hours.");
    } catch (err) {
      if (identityScopeRef.current === requestScope) setError(err?.message || "Your appointment hours could not be saved. Please try again.");
    } finally {
      if (identityScopeRef.current === requestScope) setAvailabilitySaving(false);
    }
  };

  const updateAvailabilityDay = (dayOfWeek, changes) => setAvailability((current) => ({
    ...current,
    weeklyHours: current.weeklyHours.map((day) => day.dayOfWeek === dayOfWeek ? { ...day, ...changes } : day),
  }));

  const enabledDays = availability.weeklyHours.filter((day) => day.enabled).map((day) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day.dayOfWeek]);
  const availabilityReady = !identityLoading && !availabilityLoading && availabilityScope === identityScope && !availabilityError;
  const scheduleReady = !identityLoading && !loading && loadedScope === identityScope;
  const displayTimezone = availabilityReady
    ? availability.timezone
    : Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const hoursSummary = availabilityError
    ? "Hours unavailable · retry to load"
    : identityLoading || availabilityLoading || availabilityScope !== identityScope
      ? "Loading hours…"
    : enabledDays.length
      ? `${enabledDays.join(", ")} · ${availability.timezone.replaceAll("_", " ")}`
      : `No days set · ${availability.timezone.replaceAll("_", " ")}`;

  const handleCreateAppointment = async () => {
    const requestScope = identityScope;
    if (!availabilityReady || loadedScope !== requestScope) return;
    setError("");
    setNotice("");
    if (!formData.clientId || !formData.startAt || !formData.endAt) {
      setError("Choose a client, a start time, and an end time.");
      return;
    }
    const startAt = localInputInZoneToDate(formData.startAt, availability.timezone);
    const endAt = localInputInZoneToDate(formData.endAt, availability.timezone);
    if (!startAt || !endAt) {
      setError(`That time is skipped or repeated in ${availability.timezone} during a clock change. Choose another time.`);
      return;
    }
    if (formData.sessionFormat === "video") {
      try {
        const url = new URL(formData.meetingLink.trim());
        if (url.protocol !== "https:" || url.username || url.password) throw new Error("invalid link");
      } catch {
        setError("Add a valid HTTPS video meeting link before saving this session.");
        return;
      }
    }
    if (startAt <= new Date() || endAt <= startAt) {
      setError("Choose a future start time and an end time after it.");
      return;
    }

    setSaving(true);
    try {
      const providerIdToUse = providerId || userId;
      const result = editingId
        ? await updateAppointment(editingId, {
          startAt,
          endAt,
          note: formData.note || "",
          sessionFormat: formData.sessionFormat,
          meetingLink: formData.sessionFormat === "video" ? formData.meetingLink : "",
        })
        : await createAppointment({
          clientId: formData.clientId,
          providerId: providerIdToUse,
          orgId,
          startAt,
          endAt,
          note: formData.note || null,
          sessionFormat: formData.sessionFormat,
          meetingLink: formData.sessionFormat === "video" ? formData.meetingLink : "",
        });

      if (identityScopeRef.current !== requestScope) return;
      if (result.ok) {
        setShowForm(false);
        setEditingId("");
        setFormData({ clientId: "", startAt: "", endAt: "", note: "", sessionFormat: "in-person", meetingLink: "" });
        setNotice(editingId ? "Appointment updated." : "Appointment added to your schedule.");
        await loadData();
      } else {
        setError(result.error || "The appointment could not be saved. Please try again.");
      }
    } catch (err) {
      if (identityScopeRef.current === requestScope) setError(err?.message || "The appointment could not be saved. Please try again.");
    } finally {
      if (identityScopeRef.current === requestScope) setSaving(false);
    }
  };

  const toLocalInput = (value) => dateToLocalInputInZone(value, availability.timezone);

  const beginEdit = (appointment) => {
    if (!availabilityReady || loadedScope !== identityScope) return;
    setEditingId(appointment.id);
    setFormData({
      clientId: appointment.clientId,
      startAt: toLocalInput(appointment.startAt),
      endAt: toLocalInput(appointment.endAt),
      note: appointment.note || "",
      sessionFormat: appointment.sessionFormat || "in-person",
      meetingLink: appointment.meetingLink || "",
    });
    setShowForm(true);
    setError("");
    setNotice("");
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId("");
    setFormData({ clientId: "", startAt: "", endAt: "", note: "", sessionFormat: "in-person", meetingLink: "" });
  };

  const cancelAppointment = async (appointment) => {
    if (!window.confirm("Cancel this appointment? It will be removed from your upcoming schedule.")) return;
    const requestScope = identityScope;
    setUpdatingId(appointment.id);
    setError("");
    setNotice("");
    try {
      const result = await updateAppointment(appointment.id, { status: "cancelled" });
      if (identityScopeRef.current !== requestScope) return;
      if (!result.ok) setError(result.error || "The appointment could not be cancelled.");
      else {
        setAppointments((current) => current.filter((item) => item.id !== appointment.id));
        setNotice("Appointment cancelled.");
      }
    } catch (err) {
      if (identityScopeRef.current === requestScope) setError(err?.message || "The appointment could not be cancelled.");
    } finally {
      if (identityScopeRef.current === requestScope) setUpdatingId("");
    }
  };

  const keepCurrentTime = async (appointment) => {
    const requestScope = identityScope;
    setUpdatingId(appointment.id);
    setError("");
    setNotice("");
    try {
      const result = await respondToAppointmentTimeChange(appointment.id);
      if (identityScopeRef.current !== requestScope) return;
      if (!result.ok) setError(result.error || "Your reply could not be saved.");
      else {
        setNotice("You replied that the scheduled time remains in place.");
        await loadData();
      }
    } catch (err) {
      if (identityScopeRef.current === requestScope) setError(err?.message || "Your reply could not be saved.");
    } finally {
      if (identityScopeRef.current === requestScope) setUpdatingId("");
    }
  };

  const respondToSessionRequest = async (request, decision) => {
    const requestScope = identityScope;
    setRequestBusyId(request.id);
    setError("");
    setNotice("");
    const sessionDetails = decision === "accept"
      ? requestSessionDetails[request.id] || { sessionFormat: "in-person", meetingLink: "" }
      : undefined;
    try {
      const result = await respondToProviderAppointmentRequest(request.id, decision, "", sessionDetails);
      if (identityScopeRef.current !== requestScope) return;
      if (!result.ok) setError(result.error || "Your response could not be saved.");
      else {
        setNotice(decision === "accept" ? "Session request accepted and added to your schedule. The client can now confirm it." : "Session request declined. The client will see your response.");
        await loadData();
      }
    } catch (err) {
      if (identityScopeRef.current === requestScope) setError(err?.message || "Your response could not be saved.");
    } finally {
      if (identityScopeRef.current === requestScope) setRequestBusyId("");
    }
  };

  if (identityLoading || !scheduleReady) {
    return <div className="min-h-screen bg-slate-950 text-white"><PageHeader title="Schedule" subtitle="Manage appointments with clients" /><div className="lux-shell py-10"><div role="status" className="flex min-h-48 items-center justify-center text-white/60">{identityLoading ? "Checking your workspace…" : "Loading your schedule…"}</div></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader
        title="Schedule"
        subtitle="Manage appointments with clients"
      />
      <div className="lux-shell py-10">
        <section className="mb-8 overflow-hidden rounded-2xl border border-emerald-200/15 bg-emerald-100/[0.035]" aria-labelledby="availability-title">
          <button type="button" aria-expanded={hoursExpanded} aria-controls="appointment-hours-panel" onClick={() => setHoursExpanded((expanded) => !expanded)} className="flex min-h-16 w-full items-center justify-between gap-4 px-4 py-3 text-left sm:px-5">
            <span className="flex min-w-0 items-center gap-3"><Calendar className="h-5 w-5 shrink-0 text-emerald-200" /><span className="min-w-0"><span id="availability-title" role="heading" aria-level="2" className="block text-base font-medium text-white">Appointment hours</span><span className="mt-0.5 block truncate text-sm text-white/55">{hoursSummary}</span></span></span>
            <span className="flex shrink-0 items-center gap-2 text-sm text-emerald-100">{hoursExpanded ? "Close" : "Set hours"}<ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${hoursExpanded ? "rotate-180" : ""}`} /></span>
          </button>
          {hoursExpanded && <div id="appointment-hours-panel" className="border-t border-white/[0.08] px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <p className="max-w-2xl text-sm leading-relaxed text-white/55">Choose the days and times clients may request. You can update these whenever your schedule changes.</p>
            {availabilityReady && <label className="min-w-56 text-sm text-white/70">Time zone<select aria-label="Appointment time zone" value={availability.timezone} onChange={(event) => setAvailability((current) => ({ ...current, timezone: event.target.value }))} className="mt-1.5 min-h-10 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white">{!TIME_ZONES.includes(availability.timezone) && <option value={availability.timezone}>{timeZoneLabel(availability.timezone)}</option>}{TIME_ZONES.map((zone) => <option key={zone} value={zone}>{timeZoneLabel(zone)}</option>)}</select><span className="mt-1 block text-xs text-white/40">Clients see appointment times in this zone.</span></label>}
          </div>
          {availabilityError ? <div className="mt-4 rounded-xl border border-amber-100/15 bg-amber-100/[0.04] p-4 text-sm text-amber-50/80" role="alert"><p>Your appointment hours could not be loaded.</p><button type="button" onClick={() => void loadAvailability()} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/15 px-3 text-xs text-white/80"><RefreshCw className="h-3.5 w-3.5" />Try again</button></div> : availabilityLoading || availabilityScope !== identityScope ? <p className="mt-4 text-sm text-white/50" role="status">Loading your hours…</p> : <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{availability.weeklyHours.map((day) => <div key={day.dayOfWeek} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-slate-950/35 p-3">
            <input id={`availability-day-${day.dayOfWeek}`} type="checkbox" checked={day.enabled} onChange={(event) => updateAvailabilityDay(day.dayOfWeek, { enabled: event.target.checked })} className="h-4 w-4 accent-emerald-300" />
            <label htmlFor={`availability-day-${day.dayOfWeek}`} className="w-20 shrink-0 text-sm text-white/80">{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day.dayOfWeek]}</label>
            {day.enabled ? <><input aria-label={`${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day.dayOfWeek]} start`} type="time" value={day.start} onChange={(event) => updateAvailabilityDay(day.dayOfWeek, { start: event.target.value })} className="min-h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950 px-2 text-xs text-white" /><span className="text-white/40">to</span><input aria-label={`${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day.dayOfWeek]} end`} type="time" value={day.end} onChange={(event) => updateAvailabilityDay(day.dayOfWeek, { end: event.target.value })} className="min-h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950 px-2 text-xs text-white" /></> : <span className="text-xs text-white/40">Unavailable</span>}
          </div>)}</div>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-white/40">A requested time is not confirmed until you accept it.</p>{availabilityReady && <button type="button" onClick={saveAvailability} disabled={availabilitySaving} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-200 px-4 text-sm font-semibold text-slate-950 disabled:opacity-50"><Save className="h-4 w-4" />{availabilitySaving ? "Saving hours…" : "Save appointment hours"}</button>}</div>
          </div>}
        </section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-white">Upcoming Appointments</h2>
          <button
            type="button"
            onClick={() => {
              if (clients.length === 0) {
                navigate("/provider/dashboard");
                return;
              }
              if (showForm) resetForm();
              else { setEditingId(""); setShowForm(true); }
            }}
            disabled={clients.length > 0 && (!availabilityReady || scheduleUnavailable)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-wcGold text-slate-950 hover:bg-amber-300 transition"
          >
            <Plus className="h-4 w-4" />
            {clients.length === 0 ? "Review connection requests" : scheduleUnavailable ? "Schedule unavailable" : "New Appointment"}
          </button>
        </div>

        {!scheduleUnavailable && !error && clients.length === 0 && (
          <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-100/15 bg-amber-100/[0.045] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-amber-100" />
              <div>
                <h3 className="font-medium text-white">Connect with someone before scheduling</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/60">Appointments are only for people who have an active, accepted connection with you. Their private check-ins remain private unless they choose to share them.</p>
              </div>
            </div>
            <button type="button" onClick={() => navigate("/provider/dashboard")} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-sm text-white/85 transition hover:bg-white/[0.06]">
              <Users className="h-4 w-4" />Open connection requests
            </button>
          </section>
        )}

        {!scheduleUnavailable && <section className="mb-6 rounded-2xl border border-sky-200/15 bg-sky-200/[0.035] p-5" aria-labelledby="session-requests-title">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 id="session-requests-title" className="font-medium text-white">Client session requests</h3><p className="mt-1 text-sm text-white/55">Review a requested time, then accept it or let the client know it won’t work.</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/75">{sessionRequests.length} waiting</span><button type="button" onClick={() => refreshSessionRequests()} disabled={requestRefreshing} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/15 px-3 text-xs text-white/75 transition hover:bg-white/[0.06] disabled:cursor-wait disabled:opacity-50"><RefreshCw aria-hidden="true" className={`h-3.5 w-3.5 ${requestRefreshing ? "animate-spin" : ""}`} />{requestRefreshing ? "Checking…" : "Refresh requests"}</button></div></div>
          {requestServiceError && <div className="mt-3 rounded-xl border border-amber-100/15 bg-amber-100/[0.04] p-3 text-sm text-amber-50/75" role="status"><p>Session requests aren’t available right now.</p><button type="button" onClick={() => refreshSessionRequests()} disabled={requestRefreshing} className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/15 px-3 text-xs text-white/75 disabled:opacity-50"><RefreshCw className="h-3.5 w-3.5" />Try again</button></div>}
          {!requestServiceError && sessionRequests.length === 0 && <p className="mt-3 rounded-xl bg-slate-950/35 p-3 text-sm text-white/50">No new session requests. Requests from connected clients will appear here.</p>}
          {sessionRequests.length > 0 && <ul className="mt-4 grid gap-3 md:grid-cols-2">{sessionRequests.map((request) => {
            const client = clients.find((item) => item.id === request.clientId);
            const start = formatTimeInZone(request.requestedStartAt, displayTimezone);
            const end = formatTimeInZone(request.requestedEndAt, displayTimezone);
            const details = requestSessionDetails[request.id] || { sessionFormat: "in-person", meetingLink: "" };
            return <li key={request.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-medium text-white">{client?.alias || "Connected client"}</p><p className="mt-1 text-sm text-sky-100">{start.day} · {start.time}–{end.time}</p></div><span className="rounded-full bg-amber-100/10 px-2 py-1 text-xs text-amber-100">Awaiting your response</span></div>
              {request.note && <p className="mt-3 text-sm leading-relaxed text-white/65">{request.note}</p>}
              <p className="mt-3 text-xs text-white/40">Times are shown in {displayTimezone}. Choose how you’ll meet before accepting.</p>
              <label className="mt-3 block text-sm text-white/75">Session format<select aria-label={`Session format for ${client?.alias || "connected client"}`} value={details.sessionFormat} onChange={(event) => setRequestSessionDetails((current) => ({ ...current, [request.id]: { ...details, sessionFormat: event.target.value, meetingLink: event.target.value === "video" ? details.meetingLink : "" } }))} className="mt-1.5 min-h-10 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-white"><option value="in-person">In person</option><option value="video">External video link</option>{(WELLNESSCAFE_VIDEO_ENABLED || details.sessionFormat === "wellnesscafe-video") && <option value="wellnesscafe-video">WellnessCafe private room</option>}</select></label>
              {details.sessionFormat === "video" && <label className="mt-3 block text-sm text-white/75">Video meeting link<input aria-label={`Video meeting link for ${client?.alias || "connected client"}`} type="url" inputMode="url" autoComplete="url" placeholder="https://…" value={details.meetingLink} onChange={(event) => setRequestSessionDetails((current) => ({ ...current, [request.id]: { ...details, meetingLink: event.target.value } }))} className="mt-1.5 min-h-10 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-white placeholder:text-white/35"/><span className="mt-1 block text-xs text-white/45">Use your private invitation link. Only appointment participants can see it in WellnessCafe; it opens the video service in a new tab.</span></label>}
              {details.sessionFormat === "wellnesscafe-video" && <p className="mt-2 text-xs leading-relaxed text-emerald-100/70">A private in-app room opens from this appointment after both people confirm and when the session time is near.</p>}
              <div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={!!requestBusyId || (details.sessionFormat === "video" && !details.meetingLink.trim())} onClick={() => respondToSessionRequest(request, "accept")} className="min-h-10 rounded-lg bg-emerald-200 px-3 text-sm font-semibold text-slate-950 disabled:opacity-50">{requestBusyId === request.id ? "Saving…" : "Accept requested time"}</button><button type="button" disabled={!!requestBusyId} onClick={() => respondToSessionRequest(request, "decline")} className="min-h-10 rounded-lg border border-white/15 px-3 text-sm text-white/75 disabled:opacity-50">Decline</button></div>
            </li>;
          })}</ul>}
        </section>}

        {showForm && (
          <div className="lux-card p-6 border border-white/10 bg-white/5 mb-6">
            <h3 className="text-lg font-medium text-white mb-4">{editingId ? "Reschedule appointment" : "Create appointment"}</h3>
            <div className="space-y-4">
            <div>
                <label htmlFor="appointment-client" className="block text-sm font-medium text-white mb-2">Client</label>
                <select
                  id="appointment-client"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-white/20"
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.alias}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="appointment-start-at" className="block text-sm font-medium text-white mb-2">Starts · {availability.timezone}</label>
                  <input
                    id="appointment-start-at"
                    type="datetime-local"
                    value={formData.startAt}
                    min={dateToLocalInputInZone(new Date(), availability.timezone)}
                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label htmlFor="appointment-end-at" className="block text-sm font-medium text-white mb-2">Ends · {availability.timezone}</label>
                  <input
                    id="appointment-end-at"
                    type="datetime-local"
                    value={formData.endAt}
                    min={formData.startAt || dateToLocalInputInZone(new Date(), availability.timezone)}
                    onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="appointment-session-format" className="block text-sm font-medium text-white mb-2">Session format</label>
                <select id="appointment-session-format" value={formData.sessionFormat} onChange={(event) => setFormData((current) => ({ ...current, sessionFormat: event.target.value, meetingLink: event.target.value === "video" ? current.meetingLink : "" }))} className="w-full min-h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-white"><option value="in-person">In person</option><option value="video">External video link</option>{(WELLNESSCAFE_VIDEO_ENABLED || formData.sessionFormat === "wellnesscafe-video") && <option value="wellnesscafe-video">WellnessCafe private room</option>}</select>
              </div>
              {formData.sessionFormat === "video" && <div><label htmlFor="appointment-video-link" className="block text-sm font-medium text-white mb-2">Video meeting link</label><input id="appointment-video-link" type="url" inputMode="url" autoComplete="url" placeholder="https://…" value={formData.meetingLink} onChange={(event) => setFormData((current) => ({ ...current, meetingLink: event.target.value }))} className="w-full min-h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-white placeholder:text-white/35"/><p className="mt-1 text-xs text-white/45">Paste the private invitation link from your video service. The client can join from My sessions, which stays open in its own tab.</p></div>}
              {formData.sessionFormat === "wellnesscafe-video" && <p className="rounded-lg border border-emerald-200/15 bg-emerald-200/[0.045] p-3 text-sm leading-relaxed text-emerald-100/75">This creates a private WellnessCafe room for the two appointment participants. No external meeting link is needed.</p>}
              <div>
                  <label className="block text-sm font-medium text-white mb-2">Visit note (optional)</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-white/20 resize-none"
                  placeholder="Add a brief scheduling note. Avoid sensitive health details."
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateAppointment}
                disabled={saving || !availabilityReady || scheduleUnavailable}
                  className="px-6 py-2 rounded-lg bg-wcGold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50"
                >
                  {saving ? "Saving…" : editingId ? "Save new time" : "Add appointment"}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {error && !scheduleUnavailable && <div role="alert" className="mb-4 rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>}
        {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{notice}</div>}
        {scheduleUnavailable ? (
          <div className="lux-card p-12 text-center border border-rose-200/15 bg-rose-100/[0.035]" role="status">
            <Calendar className="h-12 w-12 text-rose-100/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Schedule unavailable</h3>
            <p className="text-sm text-white/60">{error || "We couldn’t confirm your appointments."}</p>
            <button type="button" onClick={loadData} disabled={loading} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-rose-100/20 px-4 text-sm text-rose-50 transition hover:bg-rose-100/10 disabled:opacity-50"><RefreshCw className="h-4 w-4" />{loading ? "Refreshing…" : "Try again"}</button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="lux-card p-12 text-center border border-white/10 bg-white/5">
            <Calendar className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No upcoming appointments</h3>
            <p className="text-sm text-white/50">Appointments with connected clients will appear here. Use New Appointment when you’re ready to schedule a session.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="lux-card p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <Clock className="h-4 w-4 text-white/50" />
                      <span className="text-base font-medium text-white">
                        {formatTimeInZone(apt.startAt, displayTimezone).day}
                      </span>
                      <span className="text-sm text-white/70">
                        {formatTimeInZone(apt.startAt, displayTimezone).time}
                        {apt.endAt ? `–${formatTimeInZone(apt.endAt, displayTimezone).time}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <User className="h-3 w-3" />
                      <span>{clients.find((client) => client.id === apt.clientId)?.alias || "Assigned client"}</span>
                    </div>
                    {apt.note && (
                      <div className="text-sm text-white/50 mt-2">{apt.note}</div>
                    )}
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/55">{apt.sessionFormat !== "in-person" ? <Video className="h-3.5 w-3.5" aria-hidden="true" /> : <User className="h-3.5 w-3.5" aria-hidden="true" />}{apt.sessionFormat === "wellnesscafe-video" ? "WellnessCafe private room" : apt.sessionFormat === "video" ? "External video session" : "In-person session"}</p>
                    {apt.sessionFormat === "wellnesscafe-video" && <div className="mt-3 rounded-xl border border-emerald-200/15 bg-emerald-200/[0.045] p-3"><p className="text-sm text-emerald-100">WellnessCafe private room</p>{apt.status === "confirmed" ? <Link to={`/sessions/${encodeURIComponent(apt.id)}/video?returnTo=practitioner`} state={{ from: "/provider/schedule" }} className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-100 px-3 text-sm font-semibold text-slate-950"><Video className="h-4 w-4" aria-hidden="true" />Join private session</Link> : <p className="mt-1 text-xs text-white/55">Join becomes available once both people confirm.</p>}</div>}
                    {apt.sessionFormat === "video" && apt.meetingLink && <a href={apt.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg bg-sky-100 px-3 text-sm font-semibold text-slate-950"><Video className="h-4 w-4" aria-hidden="true" />Join video session<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>}
                    <p className="mt-1 text-[11px] text-white/40">Times shown in {displayTimezone}.</p>
                    {apt.changeRequest?.status === "pending" && (
                      <div className="mt-3 rounded-xl border border-amber-100/15 bg-amber-100/[0.045] p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-100">Client asked about changing this time</p>
                        {apt.changeRequest.message && <p className="mt-1 text-sm leading-relaxed text-white/75">{apt.changeRequest.message}</p>}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button type="button" disabled={!availabilityReady} onClick={() => beginEdit(apt)} className="min-h-9 rounded-lg bg-amber-100 px-3 text-xs font-semibold text-slate-950 disabled:opacity-50">Offer a new time</button>
                          <button type="button" disabled={updatingId === apt.id} onClick={() => keepCurrentTime(apt)} className="min-h-9 rounded-lg border border-white/15 px-3 text-xs text-white/75 disabled:opacity-50">{updatingId === apt.id ? "Saving…" : "Keep current time"}</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      apt.status === "scheduled"
                        ? "bg-green-500/20 text-green-400"
                        : apt.status === "cancelled"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
                {apt.status === "scheduled" && <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                  <button type="button" disabled={!availabilityReady} onClick={() => beginEdit(apt)} className="min-h-9 rounded-lg border border-white/15 px-3 text-xs text-white/75 hover:bg-white/[0.06] disabled:opacity-50">Reschedule</button>
                  <button type="button" disabled={updatingId === apt.id} onClick={() => cancelAppointment(apt)} className="min-h-9 rounded-lg border border-rose-200/15 px-3 text-xs text-rose-100/80 hover:bg-rose-200/[0.06] disabled:opacity-50">{updatingId === apt.id ? "Saving…" : "Cancel appointment"}</button>
                </div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderSchedulePage;
