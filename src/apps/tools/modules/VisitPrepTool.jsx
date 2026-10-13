import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, ChevronDown, LockKeyhole, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { listAppointmentsForClient } from "@/services/appointmentService";
import {
  listMyPractitionerShares,
  listMyVisitPreparations,
  deleteMyVisitPreparation,
  saveMyVisitPreparation,
} from "@/services/practitionerRegistry";

const SHARED_FIELDS = [
  ["visitPurpose", "Visit purpose"],
  ["priorities", "My top priorities"],
  ["questions", "Questions I want to ask"],
  ["accessPreferences", "How I prefer to communicate"],
];
const ACCESS_OPTIONS = [
  ["interpreter", "Interpreter"],
  ["writtenInstructions", "Written instructions"],
  ["supportPerson", "Include my support person"],
  ["slowerPace", "A little more time"],
  ["accessibility", "Accessibility support"],
  ["other", "Other accommodation"],
];
const EMPTY = {
  id: "",
  appointmentId: "",
  visitPurpose: "",
  priorities: [""],
  questions: [""],
  accessPreferences: [],
  afterVisit: { remember: "", nextStep: "", openQuestion: "" },
};

function splitAppointmentTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time to be confirmed";
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function inputClass() {
  return "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20";
}

export default function VisitPrepTool() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [shares, setShares] = useState([]);
  const [saved, setSaved] = useState([]);
  const [draft, setDraft] = useState(EMPTY);
  const [shareEnabled, setShareEnabled] = useState(false);
  const [sharedFields, setSharedFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showAfterVisit, setShowAfterVisit] = useState(false);
  const [sharingPaused, setSharingPaused] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user || user.isAnonymous) { setLoading(false); return () => { active = false; }; }
    Promise.all([
      listAppointmentsForClient(user.uid),
      listMyPractitionerShares(),
      listMyVisitPreparations(),
    ]).then(([appointmentList, shareResult, preparationResult]) => {
      if (!active) return;
      setAppointments(appointmentList.filter((item) => item.status !== "cancelled"));
      setShares(shareResult.shares || []);
      setSharingPaused(shareResult.sharingPaused === true || shareResult.sharingStatusUnknown === true);
      setSaved(preparationResult.preparations || []);
    }).catch(() => {
      if (active) setError("Your appointments and saved preparations could not be loaded. Try again in a moment.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  const selectedAppointment = useMemo(() => appointments.find((item) => item.id === draft.appointmentId) || null, [appointments, draft.appointmentId]);
  const allowedRecipients = useMemo(() => shares.filter((share) =>
    (!selectedAppointment || share.practitionerId === selectedAppointment.providerId)
      && share.scopes?.visitPreparation === true
      && !sharingPaused), [shares, selectedAppointment, sharingPaused]);
  const [recipientId, setRecipientId] = useState("");
  useEffect(() => {
    if (!allowedRecipients.some((share) => share.practitionerId === recipientId)) {
      setRecipientId(allowedRecipients[0]?.practitionerId || "");
    }
  }, [allowedRecipients, recipientId]);

  const updateList = (key, index, value) => setDraft((current) => ({ ...current, [key]: current[key].map((item, itemIndex) => itemIndex === index ? value : item) }));
  const updateAfterVisit = (key, value) => setDraft((current) => ({ ...current, afterVisit: { ...current.afterVisit, [key]: value } }));
  const loadPreparation = (item) => {
    setDraft({
      ...EMPTY,
      ...item,
      priorities: item.priorities?.length ? item.priorities : [""],
      questions: item.questions?.length ? item.questions : [""],
      afterVisit: { ...EMPTY.afterVisit, ...item.afterVisit },
    });
    setShareEnabled(item.share?.enabled === true);
    setSharedFields(item.share?.fields || []);
    setRecipientId(item.share?.practitionerId || "");
    setShowAfterVisit(Boolean(item.afterVisit?.remember || item.afterVisit?.nextStep || item.afterVisit?.openQuestion));
    setNotice("");
  };
  const reset = () => {
    setDraft(EMPTY);
    setShareEnabled(false);
    setSharedFields([]);
    setShowAfterVisit(false);
    setNotice("");
    setError("");
  };
  const deletePreparation = async (item) => {
    if (!window.confirm("Delete this visit preparation? This cannot be undone.")) return;
    setError(""); setNotice("");
    try {
      await deleteMyVisitPreparation(item.id);
      setSaved((current) => current.filter((savedItem) => savedItem.id !== item.id));
      if (draft.id === item.id) reset();
      setNotice("This visit preparation was deleted.");
    } catch (deleteError) { setError(deleteError?.message || "This preparation could not be deleted."); }
  };
  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    try {
      const result = await saveMyVisitPreparation({
        ...draft,
        priorities: draft.priorities.filter((item) => item.trim()),
        questions: draft.questions.filter((item) => item.trim()),
        share: { enabled: shareEnabled, practitionerId: recipientId, fields: sharedFields },
      });
      const updated = await listMyVisitPreparations();
      setSaved(updated.preparations || []);
      setDraft((current) => ({ ...current, id: result.id }));
      setNotice(result.shareEnabled ? "Saved. Your selected fields are shared with the practitioner you chose." : "Saved privately to your account.");
    } catch (saveError) { setError(saveError?.message || "Your preparation could not be saved. Please try again."); }
    finally { setSaving(false); }
  };

  if (!user || user.isAnonymous) return <section className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 sm:p-7"><h2 className="text-xl font-semibold">Save a private visit preparation</h2><p className="mt-2 leading-relaxed text-slate-600">Sign in with a personal account to save your questions and choose what, if anything, to share.</p><Link to="/login" state={{ from: { pathname: "/tools/visit-prep" } }} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-emerald-900 px-4 font-medium text-white">Sign in to continue</Link></section>;

  if (loading) return <p role="status" className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Loading your private preparation…</p>;

  return <div className="space-y-5 text-slate-900">
    <section className="rounded-2xl border border-emerald-900/15 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-5 sm:p-7">
      <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-900 text-white"><CalendarDays className="h-5 w-5" aria-hidden="true" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900/65">Before an appointment</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Bring what matters to you</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Collect a few priorities and questions in your own words. You decide what stays private and what to share.</p></div></div>
    </section>

    {error && <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
    {notice && <p role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
    {saved.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><h2 className="font-semibold">Your saved preparations</h2><ul className="mt-3 space-y-2">{saved.slice(0, 5).map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div><p className="text-sm font-medium">{item.visitPurpose || "Appointment preparation"}</p><p className="mt-1 text-xs text-slate-500">{item.share?.enabled ? "Selected fields shared" : "Private"}</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => loadPreparation(item)} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm">Open</button><button type="button" onClick={() => deletePreparation(item)} className="min-h-10 rounded-lg border border-rose-200 px-3 text-sm text-rose-800">Delete</button></div></li>)}</ul></section>}

    <form onSubmit={save} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <label className="block"><span className="mb-2 block text-sm font-semibold">Which appointment is this for?</span><select className={inputClass()} value={draft.appointmentId} onChange={(event) => setDraft((current) => ({ ...current, appointmentId: event.target.value }))}><option value="">No appointment selected</option>{appointments.map((item) => <option key={item.id} value={item.id}>{item.practitionerName} · {splitAppointmentTime(item.startAt)}</option>)}</select></label>

      <label className="block"><span className="mb-2 block text-sm font-semibold">What would you like help with?</span><textarea className={inputClass()} rows={2} maxLength={240} placeholder="Use your own words, or leave this blank." value={draft.visitPurpose} onChange={(event) => setDraft((current) => ({ ...current, visitPurpose: event.target.value }))} /></label>

      <fieldset><legend className="text-sm font-semibold">Your top priorities <span className="font-normal text-slate-500">(up to 3)</span></legend><div className="mt-2 space-y-2">{draft.priorities.map((value, index) => <div key={`priority-${index}`} className="flex gap-2"><input className={inputClass()} maxLength={180} aria-label={`Priority ${index + 1}`} placeholder={`Priority ${index + 1}`} value={value} onChange={(event) => updateList("priorities", index, event.target.value)} />{draft.priorities.length > 1 && <button type="button" aria-label={`Remove priority ${index + 1}`} onClick={() => setDraft((current) => ({ ...current, priorities: current.priorities.filter((_, i) => i !== index) }))} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Trash2 className="h-4 w-4" /></button>}</div>)}</div>{draft.priorities.length < 3 && <button type="button" onClick={() => setDraft((current) => ({ ...current, priorities: [...current.priorities, ""] }))} className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-emerald-900"><Plus className="h-4 w-4" />Add a priority</button>}</fieldset>

      <fieldset><legend className="text-sm font-semibold">Questions you want to ask <span className="font-normal text-slate-500">(up to 5)</span></legend><div className="mt-2 space-y-2">{draft.questions.map((value, index) => <div key={`question-${index}`} className="flex gap-2"><input className={inputClass()} maxLength={240} aria-label={`Question ${index + 1}`} placeholder={`Question ${index + 1}`} value={value} onChange={(event) => updateList("questions", index, event.target.value)} />{draft.questions.length > 1 && <button type="button" aria-label={`Remove question ${index + 1}`} onClick={() => setDraft((current) => ({ ...current, questions: current.questions.filter((_, i) => i !== index) }))} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Trash2 className="h-4 w-4" /></button>}</div>)}</div>{draft.questions.length < 5 && <button type="button" onClick={() => setDraft((current) => ({ ...current, questions: [...current.questions, ""] }))} className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-emerald-900"><Plus className="h-4 w-4" />Add a question</button>}</fieldset>

      <fieldset><legend className="text-sm font-semibold">Anything that would make the conversation easier?</legend><p className="mt-1 text-xs text-slate-500">Choose only what you want your practitioner to know.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{ACCESS_OPTIONS.map(([id, label]) => <label key={id} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm"><input type="checkbox" checked={draft.accessPreferences.includes(id)} onChange={(event) => setDraft((current) => ({ ...current, accessPreferences: event.target.checked ? [...current.accessPreferences, id] : current.accessPreferences.filter((item) => item !== id) }))} className="h-4 w-4 accent-emerald-800" />{label}</label>)}</div></fieldset>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start gap-2"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" /><div><h2 className="text-sm font-semibold">Choose what to share</h2><p className="mt-1 text-xs leading-relaxed text-slate-600">Your preparation is private unless you turn on sharing and choose specific fields. After-visit notes below always stay private.</p></div></div>
        <label className="mt-4 flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={shareEnabled} disabled={!selectedAppointment} onChange={(event) => setShareEnabled(event.target.checked)} className="h-4 w-4 accent-emerald-800 disabled:opacity-50" />Share selected fields with a connected practitioner</label>
        {!selectedAppointment && <p className="mt-1 text-xs text-slate-500">Choose an upcoming appointment above to enable sharing. You can still save this preparation privately.</p>}
        {shareEnabled && <div className="mt-3 space-y-3"><label className="block"><span className="mb-1 block text-sm font-medium">Practitioner</span><select className={inputClass()} value={recipientId} onChange={(event) => setRecipientId(event.target.value)}><option value="">Choose a connected practitioner</option>{allowedRecipients.map((share) => <option key={share.practitionerId} value={share.practitionerId}>{share.name} · {share.type}</option>)}</select></label>{sharingPaused && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Sharing is temporarily paused. Your saved choices remain yours, and this preparation can be saved privately.</p>}{!allowedRecipients.length && !sharingPaused && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Enable “Visit-preparation sheets” for this practitioner in <Link className="font-semibold underline" target="_blank" rel="noreferrer" to="/settings/practitioner-sharing">your sharing settings</Link>, then return here.</p>}
          <div className="grid gap-2 sm:grid-cols-2">{SHARED_FIELDS.map(([id, label]) => <label key={id} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm"><input type="checkbox" checked={sharedFields.includes(id)} onChange={(event) => setSharedFields((current) => event.target.checked ? [...current, id] : current.filter((field) => field !== id))} className="h-4 w-4 accent-emerald-800" />{label}</label>)}</div>
        </div>}
      </section>

      <section className="rounded-xl border border-slate-200 p-4"><button type="button" aria-expanded={showAfterVisit} onClick={() => setShowAfterVisit((value) => !value)} className="flex w-full items-center justify-between text-left"><span><span className="block text-sm font-semibold">After the visit</span><span className="mt-1 block text-xs text-slate-500">Optional notes for you. These are never shared.</span></span><ChevronDown className={`h-5 w-5 transition-transform ${showAfterVisit ? "rotate-180" : ""}`} /></button>{showAfterVisit && <div className="mt-4 space-y-3"><label className="block text-sm">What would you like to remember?<textarea className={`${inputClass()} mt-1`} rows={2} maxLength={500} value={draft.afterVisit.remember} onChange={(event) => updateAfterVisit("remember", event.target.value)} /></label><label className="block text-sm">A next step you want to take<textarea className={`${inputClass()} mt-1`} rows={2} maxLength={300} value={draft.afterVisit.nextStep} onChange={(event) => updateAfterVisit("nextStep", event.target.value)} /></label><label className="block text-sm">A question you want to revisit<textarea className={`${inputClass()} mt-1`} rows={2} maxLength={300} value={draft.afterVisit.openQuestion} onChange={(event) => updateAfterVisit("openQuestion", event.target.value)} /></label></div>}</section>

      <div className="flex flex-wrap items-center gap-3"><button type="submit" disabled={saving || (shareEnabled && (!selectedAppointment || !recipientId || !sharedFields.length))} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-900 px-5 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : <><Check className="h-4 w-4" />Save preparation</>}</button><button type="button" onClick={reset} className="min-h-12 rounded-xl border border-slate-300 px-4 text-sm text-slate-700">Start a new preparation</button><span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><ShieldCheck className="h-4 w-4" />You control each share</span></div>
    </form>
  </div>;
}
