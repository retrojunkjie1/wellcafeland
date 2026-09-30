import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ExternalLink, FileCheck2, LoaderCircle, RefreshCw, ShieldCheck, UploadCloud, XCircle } from "lucide-react";
import { listRecoveryMeetingSourcesForAdmin, publishRecoveryMeetingSourceFeed, reviewRecoveryMeetingSource, setRecoveryMeetingSourcePublication, stageRecoveryMeetingSourceFeed, validateRecoveryMeetingSourceFeed } from "@/services/recoveryMeetingSources";

const FILTERS = [
  { id: "pending", label: "Needs review" },
  { id: "permission-approved", label: "Permission approved" },
  { id: "declined", label: "Declined" },
  { id: "all", label: "All requests" },
];

const dateLabel = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString(undefined, { dateStyle: "medium" });
};

const sourceTypeLabel = (type) => ({
  "meeting-guide-json": "Meeting Guide data link",
  "bmlt-root-server": "BMLT meeting-list server",
  unknown: "Submitter is not sure yet",
}[type] || "Unrecognized sharing method");

export default function RecoveryMeetingSourcesPage() {
  const [filter, setFilter] = useState("pending");
  const [applications, setApplications] = useState([]);
  const [notes, setNotes] = useState({});
  const [feedFiles, setFeedFiles] = useState({});
  const [stageNotes, setStageNotes] = useState({});
  const [publishNotes, setPublishNotes] = useState({});
  const [publicationNotes, setPublicationNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [checkingFeedId, setCheckingFeedId] = useState("");

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const result = await listRecoveryMeetingSourcesForAdmin(filter);
      setApplications(Array.isArray(result.applications) ? result.applications : []);
    } catch (reason) {
      setError(reason?.message || "The source review queue could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const decide = async (application, decision) => {
    const reviewerNote = (notes[application.id] || "").trim();
    if (reviewerNote.length < 20) {
      setError("Add at least 20 characters explaining what permission evidence you checked.");
      return;
    }
    setActiveId(application.id);
    setError("");
    setNotice("");
    try {
      await reviewRecoveryMeetingSource(application.id, decision, reviewerNote);
      setNotice(decision === "approve-permission"
        ? `${application.organization}: permission review recorded. Technical feed validation is still required.`
        : `${application.organization}: request declined and decision recorded.`);
      setNotes((current) => ({ ...current, [application.id]: "" }));
      await load({ quiet: true });
    } catch (reason) {
      setError(reason?.message || "The review decision could not be saved.");
    } finally {
      setActiveId("");
    }
  };

  const checkFeed = async (application) => {
    const file = feedFiles[application.id];
    if (!file) { setError("Choose a Meeting Guide JSON file first."); return; }
    if (file.size > 1024 * 1024) { setError("Choose a feed file that is 1 MB or smaller."); return; }
    setCheckingFeedId(application.id);
    setError("");
    setNotice("");
    try {
      const result = await validateRecoveryMeetingSourceFeed(application.id, await file.text());
      const outcome = result.status === "passed" ? "format check passed" : result.status === "needs-review" ? "format check passed with a privacy review needed" : "format check found issues";
      setNotice(`${application.organization}: ${outcome}. No meeting records were imported or published.`);
      await load({ quiet: true });
    } catch (reason) {
      setError(reason?.message || "The feed file could not be checked.");
    } finally {
      setCheckingFeedId("");
    }
  };

  const stageFeed = async (application) => {
    const file = feedFiles[application.id];
    const reviewerNote = (stageNotes[application.id] || "").trim();
    if (!file) { setError("Choose the approved feed file again to create a private review copy."); return; }
    if (reviewerNote.length < 20) { setError("Add a note about the privacy and listing-quality checks you completed."); return; }
    setCheckingFeedId(application.id);
    setError("");
    setNotice("");
    try {
      await stageRecoveryMeetingSourceFeed(application.id, await file.text(), reviewerNote);
      setNotice(`${application.organization}: saved as a private admin preview. It is not visible in meeting search.`);
      setFeedFiles((current) => ({ ...current, [application.id]: null }));
      setStageNotes((current) => ({ ...current, [application.id]: "" }));
      await load({ quiet: true });
    } catch (reason) {
      setError(reason?.message || "The private feed preview could not be saved.");
    } finally {
      setCheckingFeedId("");
    }
  };

  const publishFeed = async (application) => {
    const reviewerNote = (publishNotes[application.id] || "").trim();
    if (reviewerNote.length < 30) { setError("Add at least 30 characters about the final listing and privacy review."); return; }
    setCheckingFeedId(application.id);
    setError("");
    setNotice("");
    try {
      const result = await publishRecoveryMeetingSourceFeed(application.id, reviewerNote);
      setNotice(`${application.organization}: ${result.recordCount} approved listings are now available in meeting search.`);
      setPublishNotes((current) => ({ ...current, [application.id]: "" }));
      await load({ quiet: true });
    } catch (reason) {
      setError(reason?.message || "The reviewed feed could not be published.");
    } finally {
      setCheckingFeedId("");
    }
  };

  const changePublicationState = async (application, action) => {
    const reviewerNote = (publicationNotes[application.id] || "").trim();
    if (reviewerNote.length < 30) {
      setError("Add at least 30 characters explaining the pause or fresh restore review.");
      return;
    }
    setCheckingFeedId(application.id);
    setError("");
    setNotice("");
    try {
      const result = await setRecoveryMeetingSourcePublication(application.id, action, reviewerNote);
      setNotice(action === "pause"
        ? `${application.organization}: ${result.recordCount} listings are hidden from meeting search while the source is paused.`
        : `${application.organization}: ${result.recordCount} reviewed listings are available in meeting search again.`);
      setPublicationNotes((current) => ({ ...current, [application.id]: "" }));
      await load({ quiet: true });
    } catch (reason) {
      setError(reason?.message || "The published source status could not be changed.");
    } finally {
      setCheckingFeedId("");
    }
  };

  return <main className="min-h-full bg-slate-950 px-4 py-5 text-white sm:px-6 sm:py-8">
    <div className="mx-auto max-w-5xl">
      <Link to="/admin/console" className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm text-white/65 hover:bg-white/5 hover:text-white"><ArrowLeft className="h-4 w-4" />God-Eye console</Link>
      <header className="mt-4 rounded-3xl border border-sky-200/15 bg-gradient-to-br from-sky-200/[0.08] to-slate-900/75 p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-100/70">Directory governance</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Meeting feed permissions</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">Review who controls each service-group feed and what reuse they authorized. A permission decision never imports or publishes meeting records.</p></div>
          <button type="button" onClick={() => load({ quiet: true })} disabled={refreshing} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/75 hover:bg-white/5 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Refresh</button>
        </div>
      </header>

      <section className="mt-4 flex gap-3 rounded-2xl border border-amber-200/15 bg-amber-100/[0.035] p-4 text-sm" aria-label="Review boundary">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-100" aria-hidden="true" />
        <p className="leading-relaxed text-white/70"><span className="font-medium text-white">Four review gates:</span> confirm permission, check the feed, save a private preview, then record the final checks before publishing. Only the selected approved revision appears in meeting search.</p>
      </section>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter meeting feed requests">
        {FILTERS.map((item) => <button key={item.id} type="button" role="tab" aria-selected={filter === item.id} onClick={() => setFilter(item.id)} className={`min-h-10 rounded-full border px-4 text-sm transition ${filter === item.id ? "border-sky-100/50 bg-sky-100/10 text-sky-50" : "border-white/10 text-white/60 hover:bg-white/5"}`}>{item.label}</button>)}
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200/20 bg-rose-950/30 p-3 text-sm text-rose-100">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200/20 bg-emerald-950/25 p-3 text-sm text-emerald-100">{notice}</p>}
      {loading ? <p role="status" className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 p-5 text-sm text-white/60"><LoaderCircle className="h-4 w-4 animate-spin" />Loading permission requests…</p> : applications.length === 0 ? <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-6"><h2 className="font-medium">No requests in this view</h2><p className="mt-1 text-sm text-white/55">New service-group submissions will appear here after they are sent.</p></section> : <div className="mt-5 space-y-4">
        {applications.map((application) => {
          const pending = application.status === "pending";
          const busy = activeId === application.id;
          return <article key={application.id} className="rounded-2xl border border-white/10 bg-slate-900/65 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-xs uppercase tracking-wide text-sky-100/60">{application.fellowship === "aa" ? "A.A." : "N.A."} · {application.sourceType === "meeting-guide-json" ? "Meeting Guide JSON" : "BMLT"}</p><h2 className="mt-1 text-lg font-semibold">{application.organization}</h2><p className="mt-1 text-sm text-white/55">Coverage: {application.coverage} · Submitted {dateLabel(application.submittedAt)}</p></div>
              <span className={`rounded-full border px-3 py-1 text-xs ${pending ? "border-amber-200/20 bg-amber-200/[0.06] text-amber-100" : application.directoryStatus === "paused" ? "border-rose-200/20 bg-rose-200/[0.06] text-rose-100" : application.status === "permission-approved" ? "border-sky-200/20 bg-sky-200/[0.06] text-sky-100" : "border-white/10 bg-white/[0.04] text-white/60"}`}>{pending ? "Needs review" : application.status === "permission-approved" ? `Permission approved · ${application.directoryStatus === "active" ? "published" : application.directoryStatus === "paused" ? "public listings paused" : application.feedValidationStatus === "staged-for-review" ? "private preview saved · not published" : application.feedValidationStatus === "passed" ? "format checked" : application.feedValidationStatus === "needs-review" ? "privacy review needed" : application.feedValidationStatus === "failed" ? "check found issues" : "not checked"}` : "Declined"}</span>
            </div>
            <div className="mt-4 grid gap-3 rounded-xl border border-white/8 bg-slate-950/45 p-3 text-sm sm:grid-cols-2">
              <div><p className="text-xs text-white/45">Meeting-list sharing method</p><p className="mt-1 text-white/80">{sourceTypeLabel(application.sourceType)}</p>{application.feedUrl ? <a href={application.feedUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 break-all text-sky-100 underline underline-offset-2">Open submitted link<ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /></a> : <p className="mt-1 text-xs text-white/50">No link provided; follow-up will be needed before technical validation.</p>}</div>
              <div><p className="text-xs text-white/45">Organization website</p>{application.organizationUrl ? <a href={application.organizationUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 break-all text-sky-100 underline underline-offset-2">{application.organizationUrl}<ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /></a> : <p className="mt-1 text-white/65">Not provided</p>}</div>
              <div><p className="text-xs text-white/45">Service contact</p><p className="mt-1 text-white/80">{application.sourceContactName || "Name not provided"} · <a className="text-sky-100 underline underline-offset-2" href={`mailto:${application.contactEmail}`}>{application.contactEmail}</a></p></div>
              <div><p className="text-xs text-white/45">Submitted by account</p><p className="mt-1 break-all text-white/70">{application.submittedBy || "Unavailable"}</p></div>
              <div className="sm:col-span-2"><p className="text-xs text-white/45">Permission statement</p><p className="mt-1 leading-relaxed text-white/80">{application.permissionBasis}</p></div>
              {application.reviewerNote && <div className="sm:col-span-2"><p className="text-xs text-white/45">Prior review note</p><p className="mt-1 leading-relaxed text-white/70">{application.reviewerNote}</p></div>}
            </div>
            {application.feedValidation && <section className="mt-4 rounded-xl border border-sky-100/10 bg-sky-100/[0.035] p-3" aria-label={`Feed check for ${application.organization}`}>
              <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-medium">Feed file check</h3><span className="text-xs text-white/50">{application.feedValidation.recordCount} records · {application.feedValidation.checkedAt ? dateLabel(application.feedValidation.checkedAt) : "date unavailable"}</span></div>
              <p className="mt-1 text-sm text-white/65">Online: {application.feedValidation.onlineCount} · In person: {application.feedValidation.inPersonCount} · Records with notes: {application.feedValidation.recordsWithNotes}</p>
              {!!application.feedValidation.errors?.length && <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-100">{application.feedValidation.errors.map((item, index) => <li key={`error-${index}`}>{item}</li>)}</ul>}
              {!!application.feedValidation.warnings?.length && <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-100">{application.feedValidation.warnings.map((item, index) => <li key={`warning-${index}`}>{item}</li>)}</ul>}
            </section>}
            {application.stagedFeed?.status === "awaiting-publication-review" && <section className="mt-4 rounded-xl border border-emerald-200/15 bg-emerald-200/[0.035] p-4" aria-label={`Private meeting preview for ${application.organization}`}>
              <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-emerald-50">{["active", "paused"].includes(application.directoryStatus) ? "Published feed" : "Private feed preview"}</h3><p className="mt-1 text-sm text-white/60">{application.directoryStatus === "active" ? `${application.publishedRecordCount} listings are available in meeting search. Publishing a revised feed replaces this source’s earlier listings.` : application.directoryStatus === "paused" ? `${application.publishedRecordCount} published listings are hidden from meeting search until a fresh review is recorded.` : "Review these sample entries before a separate publication step. This feed is not visible to meeting seekers."}</p></div><span className="rounded-full border border-emerald-200/20 px-3 py-1 text-xs text-emerald-100">{application.stagedFeed.summary?.recordCount || 0} entries staged</span></div>
              <p className="mt-2 text-sm text-white/65">Admin review note: {application.stagedFeed.reviewerNote}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {(application.stagedFeed.summary?.preview || []).map((meeting) => <article key={meeting.slug} className="rounded-xl border border-white/10 bg-slate-950/45 p-3">
                  <h4 className="font-medium">{meeting.name}</h4>
                  <p className="mt-1 text-sm text-amber-100">{meeting.weekdays?.length ? meeting.weekdays.map((day) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]).join(", ") : "By appointment"}{meeting.startTime ? ` · ${meeting.startTime}` : ""}{meeting.timeZone ? ` · ${meeting.timeZone}` : ""}</p>
                  <p className="mt-1 text-sm text-white/60">{meeting.location || meeting.address || "Place details not provided"}{meeting.city ? ` · ${meeting.city}` : ""}{meeting.region ? `, ${meeting.region}` : ""}</p>
                  <p className="mt-1 text-xs text-white/40">{meeting.venueType === 3 ? "Online + in person" : meeting.venueType === 2 ? "Online" : "In person"}</p>
                </article>)}
              </div>
              {application.stagedFeed.revisionId !== application.feedPublicationRevision && <div className="mt-4 border-t border-white/10 pt-3">
                <label htmlFor={`publish-note-${application.id}`} className="block text-sm font-medium text-white/80">Final publication review <span className="font-normal text-white/45">(required)</span></label>
                <p className="mt-1 text-sm text-white/55">Confirm the listings are current, authorized for public display, and free of member or attendance details. The source will appear in the public meeting finder after this step.</p>
                <textarea id={`publish-note-${application.id}`} value={publishNotes[application.id] || ""} onChange={(event) => setPublishNotes((current) => ({ ...current, [application.id]: event.target.value }))} minLength={30} maxLength={1000} rows={2} placeholder="Describe the final checks and any corrections made." className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-emerald-100/60 focus:outline-none focus:ring-2 focus:ring-emerald-100/15" />
                <button type="button" onClick={() => publishFeed(application)} disabled={checkingFeedId === application.id || (publishNotes[application.id] || "").trim().length < 30} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-200 px-4 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-45">{checkingFeedId === application.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}Publish reviewed listings</button>
              </div>}
            </section>}
            {["active", "paused"].includes(application.directoryStatus) && <section className={`mt-4 rounded-xl border p-4 ${application.directoryStatus === "paused" ? "border-rose-200/15 bg-rose-200/[0.035]" : "border-white/10 bg-slate-950/35"}`} aria-label={`Published source status for ${application.organization}`}>
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{application.directoryStatus === "paused" ? "Listings paused" : "Public listings are live"}</h3><p className="mt-1 text-sm text-white/60">{application.directoryStatus === "paused" ? `Paused ${dateLabel(application.pausedAt)}. ${application.publishedRecordCount} listings remain safely stored but are excluded from search.` : `${application.publishedRecordCount} listings are currently searchable. Pause them immediately if authorization or listing freshness is uncertain.`}</p>{application.pauseReason && <p className="mt-2 text-sm text-rose-100/80">Pause record: {application.pauseReason}</p>}</div><span className={`rounded-full border px-3 py-1 text-xs ${application.directoryStatus === "paused" ? "border-rose-200/20 text-rose-100" : "border-emerald-200/20 text-emerald-100"}`}>{application.directoryStatus === "paused" ? "Not in search" : "In search"}</span></div>
              <label htmlFor={`publication-note-${application.id}`} className="mt-4 block text-sm font-medium text-white/80">{application.directoryStatus === "paused" ? "Fresh review before restoring" : "Reason for pausing"} <span className="font-normal text-white/45">(required)</span></label>
              <p className="mt-1 text-sm text-white/55">{application.directoryStatus === "paused" ? "Confirm permission is still valid and the currently published listings are current, accurate, and safe to show." : "Record what changed or what needs checking. Pausing hides these listings from search right away."}</p>
              <textarea id={`publication-note-${application.id}`} value={publicationNotes[application.id] || ""} onChange={(event) => setPublicationNotes((current) => ({ ...current, [application.id]: event.target.value }))} minLength={30} maxLength={1000} rows={2} placeholder={application.directoryStatus === "paused" ? "Describe the fresh permission and listing review." : "Describe the reason for pausing these listings."} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-sky-100/60 focus:outline-none focus:ring-2 focus:ring-sky-100/15" />
              <button type="button" onClick={() => changePublicationState(application, application.directoryStatus === "paused" ? "restore" : "pause")} disabled={checkingFeedId === application.id || (publicationNotes[application.id] || "").trim().length < 30} className={`mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45 ${application.directoryStatus === "paused" ? "bg-emerald-200 text-slate-950" : "border border-rose-200/25 bg-rose-200/[0.07] text-rose-100"}`}>{checkingFeedId === application.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : application.directoryStatus === "paused" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{application.directoryStatus === "paused" ? "Restore after review" : "Pause public listings"}</button>
            </section>}
            {application.status === "permission-approved" && application.sourceType === "meeting-guide-json" && <section className="mt-4 rounded-xl border border-white/10 bg-slate-950/35 p-3">
              <label htmlFor={`feed-file-${application.id}`} className="block text-sm font-medium text-white/85">Check a copy of the approved feed</label>
              <p className="mt-1 text-sm leading-relaxed text-white/55">Choose a copy of the approved feed file (up to 1 MB). The format check does not prove ownership or accuracy. You can then save a private preview after recording your privacy and quality review; nothing appears in public meeting search until a separate approval step.</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <input key={feedFiles[application.id]?.name || "empty"} id={`feed-file-${application.id}`} type="file" accept=".json,application/json" onChange={(event) => { setError(""); setFeedFiles((current) => ({ ...current, [application.id]: event.target.files?.[0] || null })); }} className="block max-w-full text-sm text-white/70 file:mr-3 file:min-h-10 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:text-white" />
                <button type="button" onClick={() => checkFeed(application)} disabled={!feedFiles[application.id] || checkingFeedId === application.id} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-sky-100 px-4 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-45">{checkingFeedId === application.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}Check feed file</button>
              </div>
              {feedFiles[application.id] && ["passed", "needs-review"].includes(application.feedValidationStatus) && <div className="mt-4 border-t border-white/10 pt-3">
                <label htmlFor={`stage-note-${application.id}`} className="block text-sm font-medium text-white/80">What did you review in the file? <span className="font-normal text-white/45">(required)</span></label>
                <textarea id={`stage-note-${application.id}`} value={stageNotes[application.id] || ""} onChange={(event) => setStageNotes((current) => ({ ...current, [application.id]: event.target.value }))} minLength={20} maxLength={1000} rows={2} placeholder="For example: reviewed the sample listings and removed any member-identifying details." className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-sky-100/60 focus:outline-none focus:ring-2 focus:ring-sky-100/15" />
                <button type="button" onClick={() => stageFeed(application)} disabled={checkingFeedId === application.id || stageNotes[application.id]?.trim().length < 20} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald-200/25 bg-emerald-200/[0.07] px-4 text-sm font-semibold text-emerald-50 disabled:cursor-not-allowed disabled:opacity-45">{checkingFeedId === application.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}Save private preview</button>
              </div>}
            </section>}
            {pending && <div className="mt-4">
              <label className="block text-sm font-medium text-white/80" htmlFor={`review-note-${application.id}`}>Review note <span className="font-normal text-white/45">(required, at least 20 characters)</span></label>
              <textarea id={`review-note-${application.id}`} value={notes[application.id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [application.id]: event.target.value }))} minLength={20} maxLength={1000} rows={2} placeholder="Record the service authority and permission evidence you checked." className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-sky-100/60 focus:outline-none focus:ring-2 focus:ring-sky-100/15" />
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" disabled={busy} onClick={() => decide(application, "approve-permission")} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-sky-100 px-4 text-sm font-semibold text-slate-950 disabled:opacity-50">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Approve permission for feed validation</button>
                <button type="button" disabled={busy} onClick={() => decide(application, "decline")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-200/20 px-4 text-sm font-medium text-rose-100 hover:bg-rose-200/[0.06] disabled:opacity-50"><XCircle className="h-4 w-4" />Decline request</button>
              </div>
            </div>}
          </article>;
        })}
      </div>}
    </div>
  </main>;
}
