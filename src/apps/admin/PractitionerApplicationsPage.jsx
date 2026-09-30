import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BadgeCheck, Loader2, RefreshCw, Search, ShieldCheck, XCircle } from "lucide-react";
import { listPractitionersForReview, reviewPractitionerApplication } from "@/services/practitionerRegistry";

const FILTERS = [["pending", "Needs review"], ["approved", "Published"], ["declined", "Changes requested"], ["all", "Everyone"]];
const STATUS_STYLE = { pending: "border-amber-200/20 bg-amber-200/[0.06] text-amber-100", approved: "border-emerald-200/20 bg-emerald-200/[0.06] text-emerald-100", declined: "border-white/10 bg-white/[0.04] text-white/55" };

export default function PractitionerApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingUid, setWorkingUid] = useState("");
  const [reviewNotes, setReviewNotes] = useState({});
  const [claimChecks, setClaimChecks] = useState({});
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const result = await listPractitionersForReview(); setApplications(result.applications || []); }
    catch (err) { setError(err?.message || "Applications could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => applications.filter((item) => {
    const statusMatches = filter === "all" || item.status === filter;
    const text = `${item.name || ""} ${item.organization || ""} ${item.email || ""} ${item.type || ""} ${item.city || ""} ${item.region || ""} ${(item.services || []).join(" ")}`.toLowerCase();
    return statusMatches && (!search.trim() || text.includes(search.trim().toLowerCase()));
  }), [applications, filter, search]);

  const decide = async (application, decision) => {
    setWorkingUid(application.uid); setError("");
    try {
      await reviewPractitionerApplication(application.uid, decision, reviewNotes[application.uid] || "", claimChecks[application.uid] === true);
      setApplications((current) => current.map((item) => item.uid === application.uid ? { ...item, status: decision === "approve" ? "approved" : "declined", reviewNote: reviewNotes[application.uid] || "" } : item));
    } catch (err) { setError(err?.message || "The review could not be saved."); }
    finally { setWorkingUid(""); }
  };

  const counts = Object.fromEntries(["pending", "approved", "declined"].map((status) => [status, applications.filter((item) => item.status === status).length]));
  return <section className="text-white">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/60">Practitioner network</p><h1 className="mt-1 text-2xl font-semibold">Applications and listings</h1><p className="mt-1 text-sm text-white/50">Review, search, and revisit every profile application.</p></div><button onClick={load} disabled={loading} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-white/70 hover:bg-white/5 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Refresh</button></header>
    <div className="mt-5 grid grid-cols-3 gap-2">{[["pending", "Waiting"], ["approved", "Published"], ["declined", "Changes requested"]].map(([status, label]) => <button type="button" onClick={() => setFilter(status)} key={status} className={`rounded-xl border p-3 text-left transition ${filter === status ? "border-amber-100/25 bg-amber-100/[0.06]" : "border-white/8 bg-white/[0.025] hover:bg-white/[0.05]"}`}><span className="block text-xl font-semibold">{counts[status]}</span><span className="mt-1 block text-[11px] text-white/45">{label}</span></button>)}</div>
    <div className="mt-4 flex flex-wrap gap-2 border-b border-white/10 pb-3">{FILTERS.map(([value, label]) => <button key={value} onClick={() => setFilter(value)} aria-pressed={filter === value} className={`rounded-lg px-3 py-2 text-xs ${filter === value ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/[0.04]"}`}>{label}</button>)}</div>
    <label className="mt-4 flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 px-3"><Search className="h-4 w-4 text-white/40" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35" placeholder="Search name, role, email, or place" /></label>
    <p className="mt-3 text-xs text-white/40">A listed profile is human-reviewed. Professional licenses are not verified through this screen.</p>
    {error && <p role="alert" className="mt-4 rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>}
    {loading ? <div className="grid place-items-center py-12"><Loader2 className="h-5 w-5 animate-spin text-amber-200" /></div> : filtered.length ? <div className="mt-4 grid gap-3 lg:grid-cols-2">{filtered.map((application) => <article key={application.uid} className="rounded-xl border border-white/10 bg-slate-950/35 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-base font-semibold">{application.name}</h2><p className="mt-0.5 text-xs text-white/45">{application.organization || application.email || "Individual profile"} · {[application.city, application.region].filter(Boolean).join(", ") || "No location"}</p></div><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] capitalize ${STATUS_STYLE[application.status] || STATUS_STYLE.declined}`}>{application.status || "unknown"}</span></div>
      <p className="mt-3 text-sm text-white/70">{application.bio}</p><div className="mt-3 flex flex-wrap gap-1.5">{(application.services || []).map((service) => <span key={service} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/60">{service}</span>)}</div>
      <dl className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 text-xs"><div><dt className="text-white/40">Formats</dt><dd className="mt-1 text-white/70">{(application.serviceFormats || []).length ? application.serviceFormats.join(", ") : "Not specified"}</dd></div><div><dt className="text-white/40">Access options</dt><dd className="mt-1 text-white/70">{(application.accessibilityOptions || []).length ? application.accessibilityOptions.join(", ") : "Not specified"}</dd></div><div><dt className="text-white/40">Cost and duration</dt><dd className="mt-1 text-white/70">{application.priceDetails || (application.serviceStyle === "free" ? "Free" : application.serviceStyle === "paid" ? "Paid" : "Free and paid")} · {application.sessionLength === "not-applicable" ? "Not applicable" : application.sessionLength === "variable" || !application.sessionLength ? "Varies" : `${application.sessionLength} minutes`}</dd></div><div><dt className="text-white/40">Meeting option</dt><dd className="mt-1 text-white/70">{application.delivery === "online" ? "Online" : application.delivery === "in-person" ? "In person" : "Online or in person"}</dd></div></dl>
      {application.publicDirectoryClaim?.source === "nppes" && <section className="mt-3 rounded-lg border border-sky-200/15 bg-sky-200/[0.035] p-3"><p className="text-xs font-medium text-sky-100">Public directory match · NPI {application.publicDirectoryClaim.npi}</p><a className="mt-1 inline-flex min-h-8 items-center text-xs text-sky-100/75 underline underline-offset-2 hover:text-sky-50" href={`https://npiregistry.cms.hhs.gov/provider-view/${encodeURIComponent(application.publicDirectoryClaim.npi)}`} target="_blank" rel="noreferrer">Open the CMS NPI record</a><p className="mt-1 text-[11px] leading-relaxed text-white/50">An NPI record is a public identity reference. It does not confirm a current license, qualifications, or safety.</p>{application.status === "pending" && <label className="mt-2 flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-white/75"><input type="checkbox" checked={claimChecks[application.uid] === true} onChange={(event) => setClaimChecks((current) => ({ ...current, [application.uid]: event.target.checked }))} className="mt-0.5 h-4 w-4 shrink-0 accent-sky-300" />I checked the CMS record and confirm it matches this applicant’s public listing.</label>}</section>}
      {application.type !== "community-supporter" && <details className="mt-3 rounded-lg border border-white/8 bg-white/[0.02] p-3"><summary className="cursor-pointer text-xs text-white/55">Credential details provided</summary><p className="mt-2 text-xs text-white/70">{application.credentialType || "No credential type supplied"}</p><p className="mt-1 text-xs leading-relaxed text-white/50">{application.credentialSummary || "No credential summary supplied."}</p></details>}
      {application.status === "pending" ? <><label className="mt-3 block text-xs text-white/50">Review note (optional)<textarea rows={2} value={reviewNotes[application.uid] || ""} onChange={(event) => setReviewNotes((current) => ({ ...current, [application.uid]: event.target.value }))} className="mt-1.5 w-full resize-y rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-amber-200/40" placeholder="If you request changes, explain what is needed." /></label><div className="mt-3 flex gap-2"><button disabled={!!workingUid || (!!application.publicDirectoryClaim && claimChecks[application.uid] !== true)} onClick={() => decide(application, "approve")} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-emerald-200 px-3 text-xs font-semibold text-slate-950 disabled:opacity-50">{workingUid === application.uid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BadgeCheck className="h-3.5 w-3.5" />}Approve and publish</button><button disabled={!!workingUid} onClick={() => decide(application, "decline")} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/12 px-3 text-xs text-white/65 disabled:opacity-50"><XCircle className="h-3.5 w-3.5" />Request changes</button></div></> : application.reviewNote && <p className="mt-3 border-t border-white/8 pt-3 text-xs text-white/50">Review note: {application.reviewNote}</p>}
      </article>)}</div> : <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-8 text-center"><ShieldCheck className="mx-auto h-6 w-6 text-white/30" /><h2 className="mt-2 text-sm font-medium">No applications in this view</h2><p className="mt-1 text-xs text-white/45">Try another status filter or clear the search.</p></div>}
  </section>;
}
