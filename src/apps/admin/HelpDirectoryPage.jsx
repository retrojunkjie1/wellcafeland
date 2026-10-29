import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Archive, Check, ChevronDown, MapPin, Pause, RefreshCw, Save, ShieldCheck, Flag, Search, Plus, Globe2, Layers3 } from "lucide-react";
import { useAdminClaim } from "@/hooks/useAdminClaim";
import { listHelpDirectoryForAdmin, reviewHelpDirectoryCorrection, saveHelpDirectoryDraft, setHelpDirectoryStatus } from "@/services/helpDirectory";
import NigeriaCoverageAudit from "./NigeriaCoverageAudit";
import USCoverageAudit from "./USCoverageAudit";

const FILTERS = ["draft", "published", "paused", "archived", "all"];
const EMPTY = { name: "", category: "housing", description: "", address: "", city: "", state: "", subdivision: "", postalCode: "", phone: "", alternatePhone: "", email: "", country: "United States", countryCode: "US", sourceName: "", sourceUrl: "", permissionBasis: "", checkedAt: new Date().toISOString().slice(0, 10) };
const CATEGORY_LABELS = { housing: "Housing", food: "Food", funding: "Financial support", programs: "Programs", circles: "Peer and community support", emergency: "Urgent support", transport: "Transportation", other: "Other support" };
const ISSUE_LABELS = { wrong_address: "Address may be wrong", wrong_phone: "Phone may be wrong", hours_or_availability: "Hours or availability changed", services_changed: "Services or eligibility changed", closed: "May be closed", other: "Other issue" };
const dateLabel = (value) => value ? new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Not recorded";

export default function HelpDirectoryPage() {
  const { refreshClaims } = useAdminClaim();
  const [filter, setFilter] = useState("draft");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [listingSearch, setListingSearch] = useState("");
  const [listings, setListings] = useState([]);
  const [events, setEvents] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [selectedId, setSelectedId] = useState("");
  const [reviewNotes, setReviewNotes] = useState({});
  const [correctionNotes, setCorrectionNotes] = useState({});
  const [reportsOpen, setReportsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshingAccess, setRefreshingAccess] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const normalizedListingSearch = listingSearch.trim().toLocaleLowerCase();
  const visibleListings = listings.filter((listing) => {
    if (categoryFilter !== "all" && listing.category !== categoryFilter) return false;
    if (!normalizedListingSearch) return true;
    return [listing.name, listing.description, listing.category, listing.address, listing.city, listing.subdivision, listing.state, listing.country, listing.countryCode, listing.phone, listing.email, listing.sourceName]
      .filter(Boolean).join(" ").toLocaleLowerCase().includes(normalizedListingSearch);
  });
  const countryCount = new Set(listings.map((listing) => listing.countryCode || listing.country).filter(Boolean)).size;
  const categoryCount = new Set(listings.map((listing) => listing.category).filter(Boolean)).size;

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setLoadFailed(false);
    setError("");
    try {
      const result = await listHelpDirectoryForAdmin(filter);
      setListings(Array.isArray(result.listings) ? result.listings : []);
      setEvents(Array.isArray(result.events) ? result.events : []);
      const nextCorrections = Array.isArray(result.corrections) ? result.corrections : [];
      setCorrections(nextCorrections);
      setReportsOpen(nextCorrections.some((report) => report.status === "open"));
    } catch (reason) {
      setListings([]); setEvents([]); setCorrections([]); setReportsOpen(false);
      setLoadFailed(true); setError(friendlyDirectoryError(reason, "load"));
    }
    finally { setLoading(false); }
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const refreshAccessAndDirectory = async () => {
    setRefreshingAccess(true);
    try {
      await refreshClaims();
      await load(true);
    } finally {
      setRefreshingAccess(false);
    }
  };

  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const isUSListing = String(form.countryCode || "").trim().toUpperCase() === "US";
  const changeCountryCode = (value) => setForm((current) => {
    const countryCode = value.toUpperCase();
    return { ...current, countryCode, ...(countryCode === "US" ? { subdivision: "" } : { state: "" }) };
  });
  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    try {
      const result = await saveHelpDirectoryDraft({ ...form, id: selectedId || undefined, checkedAt: new Date(`${form.checkedAt}T12:00:00`).toISOString() });
      setSelectedId(""); setForm(EMPTY); setNotice("Saved as a private draft. It will not appear in help search until a reviewer publishes it.");
      setFilter("draft");
      await load(true);
      if (result.id) setFilter("draft");
    } catch (reason) { setError(friendlyDirectoryError(reason, "save")); }
    finally { setSaving(false); }
  };
  const edit = (listing) => {
    setSelectedId(listing.id);
    setForm({ ...EMPTY, ...listing, checkedAt: listing.checkedAt ? new Date(listing.checkedAt).toISOString().slice(0, 10) : EMPTY.checkedAt });
    openEditor();
  };
  const openEditor = () => {
    const editor = document.getElementById("help-directory-editor");
    if (editor) editor.open = true;
    editor?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    } catch (reason) { setError(friendlyDirectoryError(reason, "review")); }
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
    } catch (reason) { setError(friendlyDirectoryError(reason, "review")); }
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
    } catch (reason) { setError(friendlyDirectoryError(reason, "load")); }
    finally { setBusyId(""); }
  };

  return <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6">
    <div className="mx-auto max-w-6xl">
      <Link to="/admin/console" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm text-white/65 hover:text-white"><ArrowLeft className="h-4 w-4" />Back to God-Eye</Link>
      <header className="mt-4 rounded-3xl border border-emerald-100/15 bg-gradient-to-br from-emerald-100/[0.08] via-slate-900/80 to-slate-950 p-5 sm:p-7">
        <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-emerald-100/20 bg-emerald-100/[0.08] text-emerald-100"><MapPin className="h-5 w-5" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/65">God-Eye · global support records</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Help directory</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">Add a source-backed service in any country and any support category. A private draft becomes searchable across WellnessCafe only after a reviewer checks and publishes it.</p></div><button type="button" onClick={refreshAccessAndDirectory} disabled={refreshingAccess} className="ml-auto inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/70 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshingAccess ? "animate-spin" : ""}`} />{refreshingAccess ? "Refreshing access…" : "Refresh access and services"}</button></div>
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-100/15 bg-amber-100/[0.04] p-3 text-sm text-white/70"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-100" /><p>Publish with an official or provider source, documented permission to display its public details, and a check from the last 90 days. Client searches can then show its address, phone, email, website, and source.</p></div>
      </header>

      {!loading && !loadFailed && <section className="mt-4 grid gap-3 sm:grid-cols-3" aria-label="Directory snapshot">
        <Snapshot icon={Layers3} label={`${filter === "all" ? "Records in view" : `${titleCase(filter)} records`} · current results`} value={listings.length} detail="The directory service returns up to 100 records for this view." />
        <Snapshot icon={Globe2} label="Countries represented" value={countryCount} detail="Counted from records in this view; not a global coverage claim." />
        <Snapshot icon={Flag} label="Support categories represented" value={categoryCount} detail={`${corrections.filter((report) => report.status === "open").length} listing reports need review.`} />
      </section>}

      <USCoverageAudit />
      <NigeriaCoverageAudit />

      {error && !loadFailed && <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200/20 bg-rose-950/25 p-4 text-sm text-rose-50"><p className="max-w-2xl leading-relaxed">{error}</p><button type="button" onClick={refreshAccessAndDirectory} disabled={refreshingAccess} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-100/20 px-3 text-sm text-rose-50 hover:bg-rose-100/5 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshingAccess ? "animate-spin" : ""}`} />{refreshingAccess ? "Refreshing access…" : "Refresh access and services"}</button></div>}
      {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200/20 bg-emerald-950/20 p-3 text-sm text-emerald-100">{notice}</p>}

      <details id="help-directory-editor" open={selectedId ? true : undefined} className="mt-5 rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-6">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl text-left"><span><span className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Source review intake</span><span className="mt-1 block text-xl font-semibold">{selectedId ? "Edit listing draft" : "Add a service"}</span></span><span className="flex items-center gap-3 text-sm text-white/50"><span className="hidden sm:inline">{selectedId ? "Editing" : "Open form"}</span><ChevronDown className="h-5 w-5" /></span></summary>
        <div className="pt-2">
        <div className="flex flex-wrap items-center justify-end gap-3">{selectedId && <button type="button" onClick={() => { setSelectedId(""); setForm(EMPTY); }} className="min-h-10 rounded-lg px-3 text-sm text-white/65 hover:bg-white/5">Cancel edit</button>}</div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/55">This intake supports treatment, housing, food, urgent support, peer groups, funding, and other local services. Add information confirmed by the organization or a reliable public source; don’t enter a client’s private details.</p>
        <form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Service name" value={form.name} onChange={(v) => change("name", v)} required maxLength={140} />
          <label className="text-sm text-white/75">Category<select value={form.category} onChange={(e) => change("category", e.target.value)} className="mt-1.5 min-h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-base text-white">{Object.entries(CATEGORY_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
          <Field label="Street address" value={form.address} onChange={(v) => change("address", v)} maxLength={240} />
          <Field label="City" value={form.city} onChange={(v) => change("city", v)} required maxLength={100} />
          <Field label="Country" value={form.country} onChange={(v) => change("country", v)} required maxLength={100} placeholder="Nigeria" />
          <Field label="Country code (ISO 2 letters)" value={form.countryCode} onChange={changeCountryCode} required maxLength={2} placeholder="NG" />
          {isUSListing ? <Field label="State code" value={form.state} onChange={(v) => change("state", v.toUpperCase())} required maxLength={2} placeholder="CO" /> : <Field label="State, province, or region" value={form.subdivision} onChange={(v) => change("subdivision", v)} maxLength={100} placeholder="Oyo State" />}
          <Field label="Postal or ZIP code" value={form.postalCode} onChange={(v) => change("postalCode", v)} maxLength={12} />
          <Field label="Phone number" value={form.phone} onChange={(v) => change("phone", v)} maxLength={40} type="tel" />
          <Field label="Additional phone number" value={form.alternatePhone} onChange={(v) => change("alternatePhone", v)} maxLength={40} type="tel" />
          <Field label="Public service email" value={form.email} onChange={(v) => change("email", v)} maxLength={254} type="email" />
          <Field label="Last checked" value={form.checkedAt} onChange={(v) => change("checkedAt", v)} required type="date" />
          <label className="text-sm text-white/75 sm:col-span-2">Short description<textarea value={form.description} onChange={(e) => change("description", e.target.value)} maxLength={500} rows={2} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-base text-white outline-none focus:border-emerald-100/40" /></label>
          <Field label="Source organization" value={form.sourceName} onChange={(v) => change("sourceName", v)} required maxLength={140} />
          <Field label="Source page" value={form.sourceUrl} onChange={(v) => change("sourceUrl", v)} required type="url" placeholder="https://…" />
          <label className="text-sm text-white/75 sm:col-span-2">Evidence this listing may be shared<textarea value={form.permissionBasis} onChange={(e) => change("permissionBasis", e.target.value)} required minLength={30} maxLength={1000} rows={3} placeholder="Describe the source terms or the permission granted to publish these details." className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-base text-white outline-none focus:border-emerald-100/40" /></label>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2"><p className="max-w-xl text-xs leading-relaxed text-white/45">Saving changes a published listing back to draft so it disappears until reviewed again.</p><button type="submit" disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-200 px-5 text-sm font-semibold text-slate-950 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save private draft"}</button></div>
        </form>
        </div>
      </details>

      <details open={reportsOpen} onToggle={(event) => setReportsOpen(event.currentTarget.open)} className="mt-5 rounded-3xl border border-amber-100/15 bg-amber-100/[0.025] p-4 sm:p-6">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl"><span><span className="block text-xs font-semibold uppercase tracking-[0.16em] text-amber-100/55">Public feedback</span><span id="correction-reports-title" className="mt-1 flex items-center gap-2 text-xl font-semibold"><Flag className="h-5 w-5 text-amber-100" />Listing reports <span className="rounded-full border border-amber-100/15 px-2.5 py-1 text-xs font-normal text-amber-50/70">{corrections.filter((report) => report.status === "open").length} open</span></span></span><ChevronDown className="h-5 w-5 text-white/45" /></summary>
        <div className="pt-2">
        {corrections.filter((report) => report.status === "open").length === 0 ? <p className="mt-2 text-sm text-white/50">No open reports.</p> : <div className="mt-3 space-y-3">{corrections.filter((report) => report.status === "open").map((report) => <article key={report.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-white">{report.listingName}</h3><p className="mt-1 text-sm text-white/60">{[report.city, report.subdivision || report.state, report.country].filter(Boolean).join(", ")} · {ISSUE_LABELS[report.issue] || "Listing issue"}</p></div><time className="text-xs text-white/40">{dateLabel(report.createdAt)}</time></div>
          {report.details && <p className="mt-3 rounded-xl bg-white/[0.035] p-3 text-sm leading-relaxed text-white/75">{report.details}</p>}
          <label className="mt-3 block text-xs text-white/55">Review note<textarea aria-label={`Review note for report about ${report.listingName}`} value={correctionNotes[report.id] || ""} onChange={(event) => setCorrectionNotes((current) => ({ ...current, [report.id]: event.target.value }))} minLength={30} maxLength={1000} rows={2} placeholder="What did you verify or change? At least 30 characters." className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-100/40" /></label>
          <div className="mt-3 flex flex-wrap gap-2"><Action onClick={() => openCorrectionListing(report)} disabled={busyId === report.id} label="Edit service details" icon={MapPin} /><Action onClick={() => reviewCorrection(report, "resolve")} disabled={busyId === report.id} label="Mark reviewed" icon={Check} /><Action onClick={() => reviewCorrection(report, "pause_listing")} disabled={busyId === report.id} label="Pause listing while checking" icon={Pause} /><Action onClick={() => reviewCorrection(report, "dismiss")} disabled={busyId === report.id} label="Dismiss report" icon={Archive} /></div>
        </article>)}</div>}
        </div>
      </details>

      <section className="mt-5">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Operations</p><h2 className="mt-1 text-xl font-semibold">Review queue <span className="ml-1 text-sm font-normal text-white/45">{visibleListings.length}{visibleListings.length !== listings.length ? ` of ${listings.length}` : ""}</span></h2></div><div className="flex flex-wrap gap-1.5" aria-label="Listing status filter">{FILTERS.map((status) => <button key={status} type="button" aria-pressed={filter === status} onClick={() => setFilter(status)} className={`min-h-9 rounded-full border px-3 text-xs capitalize ${filter === status ? "border-emerald-100/40 bg-emerald-100/10 text-emerald-50" : "border-white/10 text-white/55 hover:bg-white/5"}`}>{status}</button>)}</div></div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_15rem]">
          <label className="relative block"><span className="sr-only">Search resource records</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" /><input value={listingSearch} onChange={(event) => setListingSearch(event.target.value)} placeholder="Search service, city, country, contact, or source" className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-900/80 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-emerald-100/40" /></label>
          <label className="sr-only" htmlFor="help-directory-category">Filter by support category</label><select id="help-directory-category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-slate-900/80 px-3 text-sm text-white"><option value="all">All categories</option>{Object.entries(CATEGORY_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
        </div>
        {loading && <p role="status" className="py-8 text-center text-sm text-white/50">Loading directory records…</p>}
        {!loading && loadFailed && <div role="alert" className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200/15 bg-rose-950/10 p-4"><div><h3 className="font-medium text-white/85">Directory records weren’t loaded</h3><p className="mt-1 text-sm leading-relaxed text-white/55">{error} No records were removed or changed.</p></div><button type="button" onClick={refreshAccessAndDirectory} disabled={refreshingAccess} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-rose-100/20 px-3 text-sm text-rose-50 hover:bg-rose-100/5 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshingAccess ? "animate-spin" : ""}`} />{refreshingAccess ? "Refreshing access…" : "Refresh access and services"}</button></div>}
        {!loading && !loadFailed && listings.length === 0 && <div className="mt-3 overflow-hidden rounded-3xl border border-emerald-100/15 bg-gradient-to-br from-emerald-100/[0.06] via-slate-900/75 to-slate-950 p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/60">Directory status · {titleCase(filter)}</p><h3 className="mt-2 text-xl font-semibold">{filter === "all" ? "No resource records have been added yet" : `No ${filter} resources in this view`}</h3><p className="mt-2 text-sm leading-relaxed text-white/60">This view is empty because there are no matching saved records yet. Add a real service with its location, public contact details, and source evidence; a reviewer can then publish it for clients to find.</p></div><button type="button" onClick={openEditor} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950"><Plus className="h-4 w-4" />Add first resource</button></div><div className="mt-5 grid gap-2 border-t border-white/10 pt-4 text-xs text-white/55 sm:grid-cols-3"><p>01 · Confirm the organization and service location</p><p>02 · Add published contact details and source</p><p>03 · Review evidence before public listing</p></div></div>}
        {!loading && listings.length > 0 && visibleListings.length === 0 && <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm text-white/55">No records match these search and category filters. Clear the search or choose another category.</p>}
        <div className="mt-3 space-y-3">{visibleListings.map((listing) => <article key={listing.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-semibold">{listing.name}</h3><span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] capitalize text-white/55">{listing.status}</span><span className="text-xs text-white/45">{CATEGORY_LABELS[listing.category] || listing.category}</span></div><p className="mt-1 text-sm text-white/65">{[listing.address, listing.city, listing.subdivision || listing.state, listing.postalCode, listing.country || (listing.countryCode === "US" ? "United States" : "")].filter(Boolean).join(", ")}</p><p className="mt-1 text-sm text-white/65">{[listing.phone, listing.alternatePhone, listing.email].filter(Boolean).join(" · ")}</p><p className="mt-1 text-xs text-white/45">Source checked {dateLabel(listing.checkedAt)} · {listing.sourceName}</p></div><button type="button" onClick={() => edit({ ...listing, country: listing.country || "United States", countryCode: listing.countryCode || "US" })} className="min-h-9 rounded-lg border border-white/10 px-3 text-xs text-white/70 hover:bg-white/5">Edit</button></div>
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
function Snapshot({ icon: Icon, label, value, detail }) {
  return <article className="rounded-2xl border border-white/10 bg-slate-900/65 p-4"><div className="flex items-center gap-2 text-xs font-medium text-white/50"><Icon className="h-4 w-4 text-emerald-100/65" />{label}</div><p className="mt-2 text-2xl font-semibold text-white">{value}</p><p className="mt-1 text-xs leading-relaxed text-white/40">{detail}</p></article>;
}
function titleCase(value) { return String(value || "").replace(/^./, (letter) => letter.toUpperCase()); }
function friendlyDirectoryError(error, action) {
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  if (code.includes("unauthenticated") || message.includes("unauthenticated") || message.includes("not authenticated")) {
    return "We couldn’t verify your admin access. Sign in with an authorized admin account, then try again. No changes were made.";
  }
  if (code.includes("permission-denied") || message.includes("permission denied")) {
    return "This account doesn’t have permission to manage these directory records. Ask a platform admin to grant Help Directory access.";
  }
  if (code.includes("invalid-argument") && error?.message) return error.message;
  if (code.includes("unavailable") || code.includes("deadline-exceeded")) {
    return "The directory service is temporarily unavailable. Try again shortly.";
  }
  return action === "load"
    ? "We couldn’t load the directory records. Check your connection and access, then try again."
    : action === "review"
      ? "We couldn’t complete that review action. Refresh the directory and try again."
      : "We couldn’t save this draft. Check the required fields and try again.";
}
function Action({ onClick, disabled, label, icon: _Icon, primary = false }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-xs font-medium disabled:opacity-45 ${primary ? "border-amber-100/30 bg-amber-100 text-slate-950" : "border-white/12 text-white/75 hover:bg-white/5"}`}><_Icon className="h-3.5 w-3.5" />{busyLabel(disabled, label)}</button>;
}
function busyLabel(disabled, label) { return disabled ? "Saving…" : label; }
