import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, MapPin, RefreshCw, Search, ShieldCheck, UserRound } from "lucide-react";
import { listAdminPractitionerNetwork } from "@/services/practitionerRegistry";

const TYPE_LABELS = {
  "primary-care": "Primary care",
  "case-manager": "Case manager",
  "probation-officer": "Probation officer",
  "recovery-coach": "Recovery coach",
  "peer-support": "Peer support",
  "spiritual-counselor": "Spiritual counselor",
};

export default function PractitionerNetworkPage() {
  const [practitioners, setPractitioners] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [capped, setCapped] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listAdminPractitionerNetwork();
      setPractitioners(result.practitioners || []);
      setCapped(result.capped === true);
    } catch (loadError) {
      setError(loadError?.code === "functions/permission-denied"
        ? "Your administrator assignment does not include practitioner directory access."
        : "The practitioner network could not be loaded. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const visible = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return practitioners;
    return practitioners.filter((item) => [item.name, item.organization, item.type, item.city, item.region, ...(item.services || [])]
      .some((value) => String(value || "").toLocaleLowerCase().includes(search)));
  }, [practitioners, query]);

  return (
    <main className="space-y-5" aria-labelledby="practitioner-network-title">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/65">God-Eye · Directory operations</p>
          <h2 id="practitioner-network-title" className="mt-1 text-2xl font-semibold text-white">Practitioner network</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">A live roster of reviewed practitioners who are published in the WellnessCafe directory. Applicant review remains in its separate queue.</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/75 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh roster
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Practitioner network summary">
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs uppercase tracking-wide text-white/45">Published practitioners</p><p className="mt-1 text-2xl font-semibold text-white">{loading ? "—" : practitioners.length}</p></div>
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs uppercase tracking-wide text-white/45">Workspace access active</p><p className="mt-1 text-2xl font-semibold text-white">{loading ? "—" : practitioners.filter((item) => item.workspaceAccess === "active").length}</p></div>
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs uppercase tracking-wide text-white/45">Access revoked</p><p className="mt-1 text-2xl font-semibold text-white">{loading ? "—" : practitioners.filter((item) => item.workspaceAccess === "revoked").length}</p></div>
      </section>

      <label className="flex min-h-12 items-center gap-2 rounded-xl border border-white/12 bg-slate-950/35 px-3">
        <Search className="h-4 w-4 text-white/45" aria-hidden="true" />
        <span className="sr-only">Search practitioners</span>
        <input aria-label="Search practitioners" value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40" placeholder="Search name, service, or location" />
        <span className="text-xs text-white/45">{loading ? "Loading" : `${visible.length} of ${practitioners.length}`}</span>
      </label>

      {error && <div className="rounded-xl border border-rose-200/20 bg-rose-200/[0.04] p-4 text-sm text-rose-100" role="alert">{error}</div>}
      {loading && <p className="py-8 text-center text-sm text-white/55" role="status">Loading the reviewed practitioner roster…</p>}
      {!loading && !error && practitioners.length === 0 && <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-center"><UserRound className="mx-auto h-7 w-7 text-white/40" aria-hidden="true" /><h3 className="mt-3 font-semibold text-white">No practitioners are published yet</h3><p className="mx-auto mt-1 max-w-xl text-sm text-white/55">Applications and access grants do not automatically create a public listing. Review submitted profiles in Practitioner Review; only approved profiles appear in this roster.</p><Link to="/admin/practitioners" className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-amber-100/25 px-3 text-sm text-amber-100">Open Practitioner Review</Link></section>}
      {!loading && !error && practitioners.length > 0 && visible.length === 0 && <p className="rounded-xl border border-white/10 p-5 text-sm text-white/55">No practitioners match that search.</p>}
      {!loading && !error && visible.length > 0 && <section className="grid gap-3 lg:grid-cols-2" aria-label="Published practitioners">
        {visible.map((item) => <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-100/15 bg-amber-100/[0.04] text-amber-100"><UserRound className="h-5 w-5" aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-white">{item.name}</h3><span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/20 bg-emerald-200/[0.05] px-2 py-1 text-[11px] text-emerald-100"><ShieldCheck className="h-3 w-3" aria-hidden="true" /> Reviewed</span></div><p className="mt-1 text-sm capitalize text-white/65">{TYPE_LABELS[item.type] || item.type?.replaceAll("-", " ")}</p></div></div>
          {(item.organization || item.city || item.region) && <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/55">{item.organization && <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" aria-hidden="true" />{item.organization}</span>}{(item.city || item.region) && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{[item.city, item.region].filter(Boolean).join(", ")}</span>}</div>}
          {item.services.length > 0 && <p className="mt-3 text-sm leading-relaxed text-white/70">{item.services.join(" · ")}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3 text-xs"><span className="text-white/45">Directory: {item.directoryStatus} · {item.delivery}</span><span className={item.workspaceAccess === "active" ? "text-emerald-100" : "text-amber-100"}>Workspace: {item.workspaceAccess}</span></div>
        </article>)}
      </section>}
      {capped && <p className="text-xs text-amber-100/65" role="status">Showing the first 200 published profiles. Contact platform operations to review a larger roster.</p>}
      <p className="text-xs leading-relaxed text-white/40">This view contains directory-approved profile details only. It does not expose applicant credentials, private contact information, client relationships, or clinical records.</p>
    </main>
  );
}
