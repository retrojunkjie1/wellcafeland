import React, { useEffect, useMemo, useState } from "react";
import { Check, HandHeart, LockKeyhole, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { listMyPractitionerShares, listMyCareHandoffs, createMyCareHandoff, setMyCareHandoffStatus } from "@/services/practitionerRegistry";

const NEEDS = [
  ["find-a-service", "Find a service or resource"],
  ["coordinate-care", "Coordinate a practical next step"],
  ["practical-barrier", "Work through a barrier"],
  ["follow-up", "Follow up on something we discussed"],
];
const TIMING = [["as-soon-as-practical", "As soon as practical"], ["this-week", "This week"], ["flexible", "Flexible"]];
const CONTACT = [["request-tracker", "In this request tracker"], ["next-appointment", "At my next appointment"], ["either", "Either is okay"]];
const FIELD_LABELS = { needType: "Support area", goal: "What I’m asking for", context: "Extra context", preferredTiming: "Preferred timing", contactPreference: "How to follow up" };
const STATUS_LABELS = { requested: "Sent", acknowledged: "Seen by practitioner", in_progress: "In progress", waiting_on_client: "Waiting for you", follow_up_complete: "Follow-up marked complete", client_confirmed: "You confirmed follow-up", withdrawn: "Withdrawn" };
const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20";

export default function CareHandoffTool() {
  const { user } = useAuth();
  const [shares, setShares] = useState([]);
  const [handoffs, setHandoffs] = useState([]);
  const [sharingPaused, setSharingPaused] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [needType, setNeedType] = useState(NEEDS[0][0]);
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [preferredTiming, setPreferredTiming] = useState("flexible");
  const [contactPreference, setContactPreference] = useState("either");
  const [fields, setFields] = useState(["needType", "goal", "preferredTiming", "contactPreference"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [shareResult, handoffResult] = await Promise.all([listMyPractitionerShares(), listMyCareHandoffs()]);
      setShares(shareResult.shares || []);
      setSharingPaused(shareResult.sharingPaused === true || shareResult.sharingStatusUnknown === true);
      setHandoffs(handoffResult.handoffs || []);
    } catch { setError("Your connections and requests could not be loaded. Refresh to try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (user && !user.isAnonymous) load(); else setLoading(false); }, [user]);

  const recipients = useMemo(() => shares.filter((share) => share.scopes?.careCoordination === true), [shares]);
  useEffect(() => {
    if (!recipients.some((share) => share.practitionerId === recipientId)) setRecipientId(recipients[0]?.practitionerId || "");
  }, [recipients, recipientId]);

  const toggleField = (field) => setFields((current) => current.includes(field) ? current.filter((item) => item !== field) : [...current, field]);
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      await createMyCareHandoff({ practitionerId: recipientId, needType, goal, context, preferredTiming, contactPreference, fields });
      setGoal(""); setContext("");
      await load();
      setNotice("Your request was sent to the practitioner you chose, with only the selected details.");
    } catch (err) { setError(err?.message || "Your request could not be sent. Please try again."); }
    finally { setSaving(false); }
  };
  const updateStatus = async (item, action) => {
    if (action === "withdraw" && !window.confirm("Withdraw this request? The practitioner will no longer be able to see it.")) return;
    setWorkingId(item.id); setError(""); setNotice("");
    try {
      await setMyCareHandoffStatus(item.id, action);
      await load();
      setNotice(action === "withdraw" ? "This request is withdrawn and no longer visible to the practitioner." : action === "confirm" ? "Thanks for confirming the follow-up." : "Your request has been reopened and shared again.");
    } catch (err) { setError(err?.message || "That update could not be saved."); }
    finally { setWorkingId(""); }
  };

  if (!user || user.isAnonymous) return <section className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 sm:p-7"><h2 className="text-xl font-semibold">Ask for practical support</h2><p className="mt-2 leading-relaxed text-slate-600">Sign in to choose a connected practitioner and send a request with only the details you select.</p><Link to="/login" state={{ from: { pathname: "/tools/care-coordination" } }} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-emerald-900 px-4 font-medium text-white">Sign in to continue</Link></section>;

  return <div className="space-y-5 text-slate-900">
    <section className="rounded-2xl border border-emerald-900/15 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-5 sm:p-7"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-900 text-white"><HandHeart className="h-5 w-5" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900/65">Practical support</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Ask for a next step</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Send one clear request to a practitioner you’re connected with. This is not an emergency or clinical-record service.</p></div></div></section>
    {error && <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
    {notice && <p role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
    {loading ? <p role="status" className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Loading your connections…</p> : <>
      {sharingPaused && <p role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">Practitioner sharing is temporarily paused, so requests cannot be shared right now. Your existing requests remain saved to your account.</p>}
      {recipients.length ? <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <label className="block"><span className="mb-2 block text-sm font-semibold">Who should receive this?</span><select className={inputClass} value={recipientId} onChange={(event) => setRecipientId(event.target.value)} required><option value="">Choose a connected practitioner</option>{recipients.map((share) => <option key={share.practitionerId} value={share.practitionerId}>{share.name} · {share.type}</option>)}</select><span className="mt-1 block text-xs text-slate-500">Only practitioners where you enabled “Practical-help requests” are listed. <Link to="/settings/practitioner-sharing" className="underline">Change sharing settings</Link>.</span></label>
        <label className="block"><span className="mb-2 block text-sm font-semibold">What kind of support would help?</span><select className={inputClass} value={needType} onChange={(event) => setNeedType(event.target.value)}>{NEEDS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="block"><span className="mb-2 block text-sm font-semibold">What would you like help with?</span><textarea className={inputClass} rows={3} maxLength={320} value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="For example: help me find a nearby evening support group." required /></label>
        <label className="block"><span className="mb-2 block text-sm font-semibold">Anything else they should know? <span className="font-normal text-slate-500">Optional</span></span><textarea className={inputClass} rows={2} maxLength={500} value={context} onChange={(event) => setContext(event.target.value)} placeholder="Share only what feels useful for this request." /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-semibold">Preferred timing</span><select className={inputClass} value={preferredTiming} onChange={(event) => setPreferredTiming(event.target.value)}>{TIMING.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="block"><span className="mb-2 block text-sm font-semibold">How would you prefer to follow up?</span><select className={inputClass} value={contactPreference} onChange={(event) => setContactPreference(event.target.value)}>{CONTACT.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><span className="mt-1 block text-xs text-slate-500">Practitioner updates appear here; this request does not send a separate message or notification.</span></label></div>
        <fieldset className="rounded-xl border border-slate-200 bg-slate-50 p-4"><legend className="px-1 text-sm font-semibold">Choose exactly what to share</legend><p className="mb-3 text-xs leading-relaxed text-slate-600">Unselected details are not sent. You can withdraw the request later.</p><div className="grid gap-2 sm:grid-cols-2">{Object.entries(FIELD_LABELS).map(([field, label]) => <label key={field} className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm"><input type="checkbox" checked={fields.includes(field)} disabled={field === "needType" || field === "goal"} onChange={() => toggleField(field)} className="h-4 w-4 accent-emerald-800" />{label}</label>)}</div></fieldset>
        <div className="rounded-xl border border-emerald-900/10 bg-emerald-50/70 p-4"><p className="flex items-start gap-2 text-sm leading-relaxed text-emerald-950"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />The selected practitioner will see this request and its selected fields. Your check-ins, journal, and other records are not attached.</p><p className="mt-2 text-xs text-emerald-900/70">Recipient: {recipients.find((share) => share.practitionerId === recipientId)?.name || "Choose a practitioner"}. Shared: {fields.map((field) => FIELD_LABELS[field]).join(", ") || "none"}.</p></div>
        <button type="submit" disabled={saving || sharingPaused || !recipientId || !goal.trim() || !fields.includes("needType") || !fields.includes("goal")} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-900 px-5 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" />{saving ? "Sending request…" : "Send practical-help request"}</button>
      </form> : <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="font-semibold">No eligible connected practitioner yet</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">Connect with a practitioner and enable “Practical-help requests” in <Link to="/settings/practitioner-sharing" className="font-semibold underline">sharing settings</Link>. You can still use <Link to="/tools/low-energy-plan" className="font-semibold underline">One Small Step</Link> to plan a next move for yourself.</p><button type="button" onClick={load} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm"><RefreshCw className="h-4 w-4" />Refresh connections</button></section>}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-800" /><h2 className="font-semibold">Your requests</h2></div>{handoffs.length ? <div className="mt-4 space-y-3">{handoffs.map((item) => {
        const share = shares.find((candidate) => candidate.practitionerId === item.share?.practitionerId);
        const requestVersion = Number.isSafeInteger(item.share?.careCoordinationVersion) ? item.share.careCoordinationVersion : 0;
        const currentVersion = Number.isSafeInteger(share?.careCoordinationVersion) ? share.careCoordinationVersion : 0;
        const consentRevoked = Boolean(share) && requestVersion !== currentVersion;
        const scopeEnabled = share?.scopes?.careCoordination === true;
        const canReshare = Boolean(share) && scopeEnabled && !sharingPaused && consentRevoked && item.status !== "withdrawn";
        const canReopen = Boolean(share) && scopeEnabled && !sharingPaused && !consentRevoked && ["follow_up_complete", "client_confirmed", "withdrawn"].includes(item.status);
        const accessMessage = !share ? "Connection no longer available · request is private" : sharingPaused ? "Sharing temporarily paused" : !scopeEnabled ? "Sharing is off · request is private" : consentRevoked ? "Sharing stopped · reshare needed" : item.status === "withdrawn" ? "Withdrawn · request is private" : "Shared with this practitioner";
        return <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-medium">{NEEDS.find(([value]) => value === item.needType)?.[1] || "Practical-help request"}</p><p className="mt-1 text-xs text-slate-500">{share?.name || "Connected practitioner"}</p></div><span className="rounded-full border border-emerald-900/15 bg-white px-3 py-1 text-xs text-emerald-950">{STATUS_LABELS[item.status] || "In progress"}</span></div><p className="mt-3 text-sm leading-relaxed text-slate-700">{item.goal}</p><p className="mt-2 text-xs leading-relaxed text-slate-600">{accessMessage}</p>{!scopeEnabled && share && <Link to="/settings/practitioner-sharing" className="mt-1 inline-flex min-h-9 items-center text-xs font-medium text-emerald-900 underline">Review sharing settings</Link>}{item.practitionerReply && !consentRevoked && scopeEnabled && <div className="mt-3 rounded-lg border border-sky-900/10 bg-sky-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-sky-900/70">Practitioner update</p><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{item.practitionerReply}</p></div>}<div className="mt-3 flex flex-wrap gap-2">{item.status === "follow_up_complete" && !consentRevoked && scopeEnabled && <button type="button" onClick={() => updateStatus(item, "confirm")} disabled={workingId === item.id} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-900 px-3 text-sm font-medium text-white"><Check className="h-4 w-4" />Confirm follow-up</button>}{canReshare && <button type="button" onClick={() => updateStatus(item, "reopen")} disabled={workingId === item.id} className="min-h-10 rounded-lg bg-emerald-900 px-3 text-sm font-medium text-white">{workingId === item.id ? "Sharing again…" : "Share this request again"}</button>}{canReopen && <button type="button" onClick={() => updateStatus(item, "reopen")} disabled={workingId === item.id} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm">{workingId === item.id ? "Reopening…" : "Reopen request"}</button>}{!["withdrawn", "follow_up_complete", "client_confirmed"].includes(item.status) && <button type="button" onClick={() => updateStatus(item, "withdraw")} disabled={workingId === item.id} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-600">Withdraw</button>}</div></article>;
      })}</div> : <p className="mt-3 text-sm text-slate-600">Requests you send will appear here with their current status.</p>}</section>
    </>}
  </div>;
}
