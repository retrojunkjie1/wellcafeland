import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Archive, Check, ChevronDown, MapPin, Pause, RefreshCw, Save, ShieldCheck, Flag } from "lucide-react";
import { listHelpDirectoryForAdmin, reviewHelpDirectoryCorrection, saveHelpDirectoryDraft, setHelpDirectoryStatus } from "@/services/helpDirectory";

const FILTERS = ["draft", "published", "paused", "archived", "all"];
const EMPTY = { name: "", category: "housing", description: "", address: "", city: "", state: "", postalCode: "", phone: "", sourceName: "", sourceUrl: "", permissionBasis: "", checkedAt: new Date().toISOString().slice(0, 10) };
const CATEGORY_LABELS = { housing: "Housing", food: "Food", funding: "Financial support", programs: "Programs", circles: "Peer and community support", emergency: "Urgent support", transport: "Transportation", other: "Other support" };
const ISSUE_LABELS = { wrong_address: "Address may be wrong", wrong_phone: "Phone may be wrong", hours_or_availability: "Hours or availability changed", services_changed: "Services or eligibility changed", closed: "May be closed", other: "Other issue" };
const dateLabel = (value) => value ? new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Not recorded";

export default function HelpDirectoryPage() {
  const [filter, setFilter] = useState("draft");
  const [listings, setListings] = useState([]);
  const [events, setEvents] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [selectedId, setSelectedId] = useState("");
  const [reviewNotes, setReviewNotes] = useState({});
  const [correctionNotes, setCorrectionNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError("");
    try {
      const result = await listHelpDirectoryForAdmin(filter);
      setListings(Array.isArray(result.listings) ? result.listings : []);
      setEvents(Array.isArray(result.events) ? result.events : []);
      setCorrections(Array.isArray(result.corrections) ? result.corrections : []);
    } catch (reason) { setError(reason?.message || "The help directory could not be loaded."); }
    finally { setLoading(false); }
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    try {
      const result = await saveHelpDirectoryDraft({ ...form, id: selectedId || undefined, checkedAt: new Date(`${form.checkedAt}T12:00:00`).toISOString() });
      setSelectedId(""); setForm(EMPTY); setNotice("Saved as a private draft. It will not appear in help search until a reviewer publishes it.");
      setFilter("draft");
      await load(true);
      if (result.id) setFilter("draft");
    } catch (reason) { setError(reason?.message || "The draft could not be saved."); }
    finally { setSaving(false); }
  };
  const edit = (listing) => {
    setSelectedId(listing.id);
    setForm({ ...EMPTY, ...listing, checkedAt: listing.checkedAt ? new Date(listing.checkedAt).toISOString().slice(0, 10) : EMPTY.checkedAt });
    document.getElementById("help-directory-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const act = async (listing, action) => {
    const reviewNote = (reviewNotes[listing.id] || "").trim();
    if (reviewNote.length < 30) { setError("Add a review note (at least 30 characters) before changing publication."); return; }
    setBusyId(listing.id); setError(""); setNotice("");
    try {
      await setHelpDirectoryStatus(listing.id, action, reviewNote);
      setReviewNotes((current) => ({ ...current, [listing.id]: "" }));
      setNotice(`${listing.name}: ${action === "publish" || action === "restore" ? "published in help search" : action === "pause" ? "hidden from help search" : "archived"}.`);
      await load(true);
    } catch (reason) { setError(reason?.message || "The listing status could not be updated."); }
    finally { setBusyId(""); }
  };
  const reviewCorrection = async (report, action) => {
    const reviewNote = (correctionNotes[report.id] || "").trim();
    if (reviewNote.length < 30) { setError("Add a review note (at least 30 characters) before closing this report."); return; }
    setBusyId(report.id); setError(""); setNotice("");
    try {
      await reviewHelpDirectoryCorrection(report.id, action, reviewNote);
      setCorrectionNotes((current) => ({ ...current, [report.id]: "" }));
      setNotice(action === "pause_listing" ? `${report.listingName}: hidden from public search while the listing is rechecked.` : action === "dismiss" ? "Report dismissed with an audit note." : "Report marked reviewed.");
      await load(true);
    } catch (reason) { setError(reason?.message || "The correction report could not be updated."); }
    finally { setBusyId(""); }
  };
  const openCorrectionListing = async (report) => {
    setBusyId(report.id); setError(""); setNotice("");
    try {
      const result = await listHelpDirectoryForAdmin("all");
      const listing = (result.listings || []).find((item) => item.id === report.listingId);
      if (!listing) throw new Error("This service is outside the latest 100 records. Use the listing filters to locate it before editing.");
      setFilter("all");
      setListings(result.listings || []);
      edit(listing);
    } catch (reason) { setError(reason?.message || "The service record could not be opened."); }
    finally { setBusyId(""); }
  };

  return <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6">
    <div className="mx-auto max-w-5xl">
      <Link to="/admin/console" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm text-white/65 hover:text-white"><ArrowLeft className="h-4 w-4" />Back to God-Eye</Link>
      <header className="mt-4 rounded-3xl border border-emerald-100/15 bg-gradient-to-br from-emerald-100/[0.08] via-slate-900/80 to-slate-950 p-5 sm:p-7">
        <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-emerald-100/20 bg-emerald-100/[0.08] text-emerald-100"><MapPin className="h-5 w-5" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/65">God-Eye · public support records</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Help directory</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">Review source-backed local services before they appear to people looking for help. Drafts and paused records stay private.</p></div><button type="button" onClick={() => load(true)} className="ml-auto inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/70"><RefreshCw className="h-4 w-4" />Refresh</button></div>
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-100/15 bg-amber-100/[0.04] p-3 text-sm text-white/70"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-100" /><p>Publishing requires a public source link, permission evidence, and a source check from the last 90 days. Public search receives only the service name, location, contact number, and description.</p></div>
      </header>

      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200/20 bg-rose-950/30 p-3 text-sm text-rose-100">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200/20 bg-emerald-950/20 p-3 text-sm text-emerald-100">{notice}</p>}

      <section id="help-directory-editor" className="mt-5 rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Source review intake</p><h2 className="mt-1 text-xl font-semibold">{selectedId ? "Edit listing draft" : "Add a service"}</h2></div>{selectedId && <button type="button" onClick={() => { setSelectedId(""); setForm(EMPTY); }} className="min-h-10 rounded-lg px-3 text-sm text-white/65 hover:bg-white/5">Cancel edit</button>}</div>
        <form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Service name" value={form.name} onChange={(v) => change("name", v)} required maxLength={140} />
          <label className="text-sm text-white/75">Category<select value={form.category} onChange={(e) => change("category", e.target.value)} className="mt-1.5 min-h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-base text-white">{Object.entries(CATEGORY_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
          <Field label="Street address" value={form.address} onChange={(v) => change("address", v)} maxLength={240} />
          <Field label="City" value={form.city} onChange={(v) => change("city", v)} required maxLength={100} />
          <Field label="State code" value={form.state} onChange={(v) => change("state", v.toUpperCase())} required maxLength={2} placeholder="CO" />
          <Field label="ZIP code" value={form.postalCode} onChange={(v) => change("postalCode", v)} maxLength={12} />
          <Field label="Phone number" value={form.phone} onChange={(v) => change("phone", v)} maxLength={40} type="tel" />
          <Field label="Last checked" value={form.checkedAt} onChange={(v) => change("checkedAt", v)} required type="date" />
          <label className="text-sm text-white/75 sm:col-span-2">Short description<textarea value={form.description} onChange={(e) => change("description", e.target.value)} maxLength={500} rows={2} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-base text-white outline-none focus:border-emerald-100/40" /></label>
          <Field label="Source organization" value={form.sourceName} onChange={(v) => change("sourceName", v)} required maxLength={140} />
          <Field label="Source page" value={form.sourceUrl} onChange={(v) => change("sourceUrl", v)} required type="url" placeholder="https://…" />
          <label className="text-sm text-white/75 sm:col-span-2">Evidence this listing may be shared<textarea value={form.permissionBasis} onChange={(e) => change("permissionBasis", e.target.value)} required minLength={30} maxLength={1000} rows={3} placeholder="Describe the source terms or the permission granted to publish these details." className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-base text-white outline-none focus:border-emerald-100/40" /></label>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2"><p className="max-w-xl text-xs leading-relaxed text-white/45">Saving changes a published listing back to draft so it disappears until reviewed again.</p><button type="submit" disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-200 px-5 text-sm font-semibold text-slate-950 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save private draft"}</button></div>
        </form>
      </section>

      <section className="mt-5 rounded-3xl border border-amber-100/15 bg-amber-100/[0.025] p-4 sm:p-6" aria-labelledby="correction-reports-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100/55">Public feedback</p><h2 id="correction-reports-title" className="mt-1 flex items-center gap-2 text-xl font-semibold"><Flag className="h-5 w-5 text-amber-100" />Listing reports</h2></div><span className="rounded-full border border-amber-100/15 px-2.5 py-1 text-xs text-amber-50/70">{corrections.filter((report) => report.status === "open").length} open</span></div>
        {corrections.filter((report) => report.status === "open").length === 0 ? <p className="mt-3 rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/50">No open listing reports. Reports from the public will appear here for review.</p> : <div className="mt-3 space-y-3">{corrections.filter((report) => report.status === "open").map((report) => <article key={report.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-white">{report.listingName}</h3><p className="mt-1 text-sm text-white/60">{[report.city, report.state].filter(Boolean).join(", ")} · {ISSUE_LABELS[report.issue] || "Listing issue"}</p></div><time className="text-xs text-white/40">{dateLabel(report.createdAt)}</time></div>
          {report.details && <p className="mt-3 rounded-xl bg-white/[0.035] p-3 text-sm leading-relaxed text-white/75">{report.details}</p>}
          <label className="mt-3 block text-xs text-white/55">Review note<textarea aria-label={`Review note for report about ${report.listingName}`} value={correctionNotes[report.id] || ""} onChange={(event) => setCorrectionNotes((current) => ({ ...current, [report.id]: event.target.value }))} minLength={30} maxLength={1000} rows={2} placeholder="What did you verify or change? At least 30 characters." className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-100/40" /></label>
          <div className="mt-3 flex flex-wrap gap-2"><Action onClick={() => openCorrectionListing(report)} disabled={busyId === report.id} label="Edit service details" icon={MapPin} /><Action onClick={() => reviewCorrection(report, "resolve")} disabled={busyId === report.id} label="Mark reviewed" icon={Check} /><Action onClick={() => reviewCorrection(report, "pause_listing")} disabled={busyId === report.id} label="Pause listing while checking" icon={Pause} /><Action onClick={() => reviewCorrection(report, "dismiss")} disabled={busyId === report.id} label="Dismiss report" icon={Archive} /></div>
        </article>)}</div>}
      </section>

      <section className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Review queue</h2><div className="flex flex-wrap gap-1.5" aria-label="Listing status filter">{FILTERS.map((status) => <button key={status} type="button" aria-pressed={filter === status} onClick={() => setFilter(status)} className={`min-h-9 rounded-full border px-3 text-xs capitalize ${filter === status ? "border-emerald-100/40 bg-emerald-100/10 text-emerald-50" : "border-white/10 text-white/55 hover:bg-white/5"}`}>{status}</button>)}</div></div>
        {loading && <p role="status" className="py-8 text-center text-sm text-white/50">Loading directory records…</p>}
        {!loading && listings.length === 0 && <div className="mt-3 rounded-2xl border border-dashed border-white/15 p-6 text-center"><p className="font-medium text-white/80">No {filter === "all" ? "directory" : filter} listings</p><p className="mt-1 text-sm text-white/50">Add a real, source-backed service above. No demonstration listings are preloaded.</p></div>}
        <div className="mt-3 space-y-3">{listings.map((listing) => <article key={listing.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-semibold">{listing.name}</h3><span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] capitalize text-white/55">{listing.status}</span><span className="text-xs text-white/45">{CATEGORY_LABELS[listing.category] || listing.category}</span></div><p className="mt-1 text-sm text-white/65">{[listing.address, listing.city, listing.state, listing.postalCode].filter(Boolean).join(", ")}</p><p className="mt-1 text-xs text-white/45">Source checked {dateLabel(listing.checkedAt)} · {listing.sourceName}</p></div><button type="button" onClick={() => edit(listing)} className="min-h-9 rounded-lg border border-white/10 px-3 text-xs text-white/70 hover:bg-white/5">Edit</button></div>
          <details className="mt-3 rounded-xl border border-white/[0.08] bg-black/10 p-3"><summary className="flex cursor-pointer list-none items-center gap-2 text-xs text-white/65"><ChevronDown className="h-4 w-4" />Source and review evidence</summary><div className="mt-3 grid gap-2 text-xs text-white/55 sm:grid-cols-2"><p>Source: <a href={listing.sourceUrl} target="_blank" rel="noreferrer" className="text-emerald-100 underline underline-offset-2">{listing.sourceName}</a></p><p>Permission evidence: {listing.permissionBasis}</p>{listing.reviewNote && <p className="sm:col-span-2">Last decision: {listing.reviewNote}</p>}</div></details>
          <label className="mt-3 block text-xs text-white/55">Review note<textarea aria-label={`Review note for ${listing.name}`} value={reviewNotes[listing.id] || ""} onChange={(e) => setReviewNotes((current) => ({ ...current, [listing.id]: e.target.value }))} minLength={30} maxLength={1000} rows={2} placeholder="What did you verify? At least 30 characters." className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-100/40" /></label>
          <div className="mt-3 flex flex-wrap gap-2">{listing.status === "draft" && <Action onClick={() => act(listing, "publish")} disabled={busyId === listing.id} label="Publish listing" icon={Check} primary />}{listing.status === "published" && <Action onClick={() => act(listing, "pause")} disabled={busyId === listing.id} label="Pause public listing" icon={Pause} />}{listing.status === "paused" && <Action onClick={() => act(listing, "restore")} disabled={busyId === listing.id} label="Restore after recheck" icon={Check} primary />}{listing.status !== "archived" && <Action onClick={() => act(listing, "archive")} disabled={busyId === listing.id} label="Archive" icon={Archive} />}</div>
        </article>)}</div>
      </section>

      <details className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025]">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-medium text-white/80"><span>Recent review activity <span className="ml-1 text-xs font-normal text-white/45">{events.length}</span></span><ChevronDown className="h-4 w-4 text-white/45" /></summary>
        <div className="border-t border-white/[0.07] px-4 py-2">{events.length === 0 ? <p className="py-4 text-sm text-white/45">No admin activity recorded yet.</p> : <ol className="divide-y divide-white/[0.07]">{events.map((event) => {
          const listing = listings.find((item) => item.id === event.listingId);
          const actionLabels = { draft_created: "Draft added", draft_updated: "Draft updated", publish: "Published", pause: "Paused", restore: "Restored after review", archive: "Archived", correction_reported: "Public report received", correction_resolve: "Report reviewed", correction_dismiss: "Report dismissed", pause_after_correction: "Paused after report", correction_pause_listing: "Report closed after pause" };
          return <li key={event.id} className="py-3"><div className="flex flex-wrap items-baseline justify-between gap-2"><p className="text-sm text-white/75">{actionLabels[event.action] || "Listing reviewed"} · {listing?.name || event.listingName || "Listing record"}</p><time className="text-xs text-white/40">{dateLabel(event.createdAt)}</time></div>{event.note && <p className="mt-1 text-xs leading-relaxed text-white/50">{event.note}</p>}</li>;
        })}</ol>}</div>
      </details>
    </div>
  </main>;
}

function Field({ label, value, onChange, type = "text", ...props }) {
  return <label className="text-sm text-white/75">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 min-h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-base text-white outline-none focus:border-emerald-100/40" {...props} /></label>;
}
function Action({ onClick, disabled, label, icon: _Icon, primary = false }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-xs font-medium disabled:opacity-45 ${primary ? "border-amber-100/30 bg-amber-100 text-slate-950" : "border-white/12 text-white/75 hover:bg-white/5"}`}><_Icon className="h-3.5 w-3.5" />{busyLabel(disabled, label)}</button>;
}
function busyLabel(disabled, label) { return disabled ? "Saving…" : label; }
