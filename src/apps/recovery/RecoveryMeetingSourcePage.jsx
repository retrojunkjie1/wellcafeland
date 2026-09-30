import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, LoaderCircle, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { listMyRecoveryMeetingSources, submitRecoveryMeetingSource } from "@/services/recoveryMeetingSources";

const STATUS = {
  pending: { label: "Waiting for review", style: "border-amber-200/20 bg-amber-200/[0.06] text-amber-100" },
  "permission-approved": { label: "Permission confirmed · setup check next", style: "border-sky-200/20 bg-sky-200/[0.06] text-sky-100" },
  declined: { label: "Not approved", style: "border-white/10 bg-white/[0.04] text-white/60" },
};

const INITIAL = { organization: "", fellowship: "aa", sourceType: "unknown", coverage: "", feedUrl: "", organizationUrl: "", sourceContactName: "", contactEmail: "", permissionBasis: "", authorizedToShare: false };

export default function RecoveryMeetingSourcePage() {
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState(INITIAL);
  const [applications, setApplications] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const canSubmit = user && !user.isAnonymous;

  const refresh = useCallback(async () => {
    if (!canSubmit) return;
    setLoadingList(true);
    try {
      const result = await listMyRecoveryMeetingSources();
      setApplications(result.applications || []);
    } catch (err) { setError(err?.message || "Your source requests could not be loaded."); }
    finally { setLoadingList(false); }
  }, [canSubmit]);

  useEffect(() => { refresh(); }, [refresh]);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const result = await submitRecoveryMeetingSource(form);
      setSuccess(`Request received. Reference ${result.applicationId}. We’ll review the source and permission details.`);
      setForm(INITIAL);
      await refresh();
    } catch (err) { setError(err?.message || "The request could not be submitted."); }
    finally { setSaving(false); }
  };

  return <main className="min-h-full bg-slate-950 px-4 py-5 text-white sm:px-6 sm:py-8">
    <div className="mx-auto max-w-3xl">
      <Link to="/recovery/meetings" className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm text-white/65 hover:bg-white/5 hover:text-white"><ArrowLeft className="h-4 w-4" />Back to meeting finder</Link>
      <header className="mt-4 rounded-3xl border border-amber-200/15 bg-gradient-to-br from-amber-200/[0.09] to-slate-900/75 p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/70">For local service entities</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Share your group’s meeting list</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">Tell us about your local A.A. or N.A. meeting list. We’ll check that your service group has authorized sharing before considering it for the directory.</p>
      </header>

      <section className="mt-4 flex gap-3 rounded-2xl border border-sky-200/15 bg-sky-100/[0.035] p-4 text-sm">
        <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-sky-100" />
        <p className="leading-relaxed text-white/70"><span className="font-medium text-white">Sending this request does not publish your meeting list.</span> We first review permission, then check that listings can be updated safely and reliably. We do not copy meeting details from websites without authorization, and we never show your contact email to meeting seekers.</p>
      </section>

      {authLoading ? <p role="status" className="mt-4 rounded-xl border border-white/10 p-4 text-sm text-white/60">Checking your sign-in…</p> : !canSubmit ? <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5"><h2 className="font-medium">Sign in to send a source request</h2><p className="mt-1 text-sm text-white/55">This keeps requests connected to a contact who can answer source and permission questions.</p><Link to="/login" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950">Sign in</Link></section> : <form onSubmit={submit} className="mt-4 space-y-4 rounded-3xl border border-white/10 bg-slate-900/65 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Service entity or group" value={form.organization} onChange={update("organization")} required placeholder="Example: North County Intergroup" />
          <Field label="Contact email" type="email" value={form.contactEmail} onChange={update("contactEmail")} required placeholder="A service email we can reply to" />
          <label className="block text-sm font-medium text-white/80">Fellowship<select value={form.fellowship} onChange={update("fellowship")} className={inputClass}><option value="aa">A.A.</option><option value="na">N.A.</option></select></label>
          <label className="block text-sm font-medium text-white/80">How does your group share its meeting list?<select value={form.sourceType} onChange={update("sourceType")} className={inputClass}><option value="unknown">I’m not sure yet</option><option value="meeting-guide-json">A Meeting Guide data link</option><option value="bmlt-root-server">A BMLT meeting-list server</option></select></label>
          <p className="-mt-2 text-xs leading-relaxed text-white/55 sm:col-span-2">These are ways a service group can share its existing meeting list with another system. You don’t need to create or convert anything. If you’re unsure, choose “I’m not sure yet” and we can follow up.</p>
          <Field label="Coverage area" value={form.coverage} onChange={update("coverage")} required placeholder="Cities, counties, or regions" />
          <Field label="Public organization website" value={form.organizationUrl} onChange={update("organizationUrl")} type="url" placeholder="https://…" />
          <Field label="Link to the group’s meeting list (if you have it)" value={form.feedUrl} onChange={update("feedUrl")} type="url" required={form.sourceType !== "unknown"} placeholder="Paste the link your group already uses; leave blank if unsure" />
          <Field label="Your name or service role" value={form.sourceContactName} onChange={update("sourceContactName")} placeholder="Optional" />
        </div>
        <label className="block text-sm font-medium text-white/80">How has your service group authorized sharing its meeting list?
          <textarea value={form.permissionBasis} onChange={update("permissionBasis")} required minLength={20} maxLength={800} rows={3} placeholder="For example: our service committee approved sharing the public meeting list." className={`${inputClass} resize-y py-3`} />
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-slate-950/45 p-3 text-sm leading-relaxed text-white/70"><input type="checkbox" checked={form.authorizedToShare} onChange={update("authorizedToShare")} required className="mt-0.5 h-4 w-4 shrink-0 accent-amber-200" /><span>I am authorized by this service group to submit its public meeting list for review. I understand this request does not publish it.</span></label>
        {error && <p role="alert" className="rounded-xl border border-rose-200/20 bg-rose-950/30 p-3 text-sm text-rose-100">{error}</p>}
        {success && <p role="status" className="flex gap-2 rounded-xl border border-emerald-200/20 bg-emerald-950/25 p-3 text-sm text-emerald-100"><CheckCircle2 className="h-4 w-4 shrink-0" />{success}</p>}
        <button type="submit" disabled={saving} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-amber-200 px-5 text-sm font-semibold text-slate-950 disabled:opacity-50">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{saving ? "Sending request…" : "Send for review"}</button>
      </form>}

      {canSubmit && <section className="mt-6" aria-labelledby="my-source-requests"><div className="flex items-center justify-between gap-3"><div><h2 id="my-source-requests" className="text-lg font-semibold">Your source requests</h2><p className="text-sm text-white/50">Only you and authorized admins can see these details.</p></div><button type="button" onClick={refresh} disabled={loadingList} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-white/70 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loadingList ? "animate-spin" : ""}`} />Refresh</button></div>
        {loadingList ? <p role="status" className="mt-3 text-sm text-white/50">Loading requests…</p> : applications.length ? <div className="mt-3 space-y-2">{applications.map((application) => <article key={application.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3"><div><h3 className="text-sm font-medium">{application.organization} · {application.fellowship.toUpperCase()}</h3><p className="mt-1 text-xs text-white/45">{application.coverage}</p></div><span className={`rounded-full border px-2.5 py-1 text-xs ${STATUS[application.status]?.style || STATUS.pending.style}`}>{STATUS[application.status]?.label || application.status}</span></article>)}</div> : <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.025] p-4 text-sm text-white/50">No source requests yet.</p>}
      </section>}
    </div>
  </main>;
}

const inputClass = "mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-slate-950/70 px-3 text-sm text-white placeholder:text-white/35 focus:border-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-200/20";
function Field({ label, ...props }) { return <label className="block text-sm font-medium text-white/80">{label}<input {...props} className={inputClass} /></label>; }
