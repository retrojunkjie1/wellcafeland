import React, { useCallback, useEffect, useMemo, useState } from "react";
import { KeyRound, MapPin, RefreshCw, ShieldCheck, UserRoundPlus, UserX } from "lucide-react";
import { ADMIN_SCOPE_GROUPS, listAdminAssignments, setAdminAssignment, US_REGION_OPTIONS } from "@/services/adminAuthorization";

const EMPTY_FORM = { email: "", scopes: [], regions: [], allRegions: false, expiresAt: "", reason: "" };
const tomorrow = () => { const date = new Date(); date.setDate(date.getDate() + 1); return date.toISOString().slice(0, 10); };

export default function AdminRolesPage() {
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingUid, setEditingUid] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listAdminAssignments();
      setAssignments(Array.isArray(result.assignments) ? result.assignments : []);
    } catch (reason) {
      setError(reason?.message || "Admin assignments could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectedScopes = new Set(form.scopes);
  const needsRegions = form.scopes.some((scope) => ADMIN_SCOPE_GROUPS.find((group) => group.regional)?.options.some(([id]) => id === scope));
  const canSave = form.email.trim() && form.scopes.length && form.reason.trim().length >= 12
    && (!needsRegions || form.regions.length > 0 || form.allRegions);

  const edit = (assignment) => {
    const regionsByScope = Object.values(assignment.regionalScopes || {}).flat();
    setEditingUid(assignment.uid);
    setForm({
      email: assignment.email,
      scopes: assignment.scopes || [],
      regions: [...new Set(regionsByScope.filter((region) => region !== "*"))],
      allRegions: regionsByScope.includes("*"),
      expiresAt: assignment.expiresAt ? new Date(assignment.expiresAt).toISOString().slice(0, 10) : "",
      reason: "Reviewing or renewing the administrator’s assigned responsibilities.",
    });
    setNotice("");
    setError("");
  };

  const toggleScope = (scope) => setForm((current) => ({
    ...current,
    scopes: current.scopes.includes(scope) ? current.scopes.filter((item) => item !== scope) : [...current.scopes, scope],
  }));

  const toggleRegion = (region) => setForm((current) => ({
    ...current,
    allRegions: false,
    regions: current.regions.includes(region) ? current.regions.filter((item) => item !== region) : [...current.regions, region],
  }));

  const save = async (event) => {
    event.preventDefault();
    if (!canSave || saving) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const result = await setAdminAssignment({
        email: form.email,
        scopes: form.scopes,
        regions: form.allRegions ? ["*"] : form.regions,
        expiresAt: form.expiresAt || null,
        reason: form.reason,
        active: true,
      });
      setNotice(`Admin access saved for ${result.email}. It applies to the responsibilities selected above.`);
      setForm(EMPTY_FORM); setEditingUid("");
      await load();
    } catch (reason) {
      setError(reason?.message || "The admin assignment could not be saved.");
    } finally { setSaving(false); }
  };

  const revoke = async (assignment) => {
    const reason = window.prompt(`Why are you revoking admin access for ${assignment.email}?`);
    if (!reason) return;
    if (reason.trim().length < 12) { setError("Add a clear reason of at least 12 characters."); return; }
    setSaving(true); setError(""); setNotice("");
    try {
      await setAdminAssignment({ email: assignment.email, active: false, reason: reason.trim() });
      setNotice(`Admin access revoked for ${assignment.email}. Server authorization now denies the revoked assignment.`);
      await load();
    } catch (failure) { setError(failure?.message || "Admin access could not be revoked."); }
    finally { setSaving(false); }
  };

  const activeCount = useMemo(() => assignments.filter((item) => item.active && !item.disabled).length, [assignments]);

  return <main className="space-y-5 text-white">
    <header className="rounded-2xl border border-amber-100/15 bg-gradient-to-br from-amber-100/[0.08] via-slate-900 to-slate-950 p-5 sm:p-7">
      <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-amber-100/20 bg-amber-100/[0.08] text-amber-100"><KeyRound className="h-5 w-5" /></span><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/60">God-Eye · Alpha Owner</p><h1 className="mt-1 text-2xl font-semibold">Administrator access</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/65">Assign each administrator only the responsibilities they need. System-wide controls and account-level troubleshooting stay separate from regional service and provider review.</p></div><button type="button" onClick={load} disabled={loading} className="ml-auto inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/70 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-white/10 bg-black/15 p-3"><span className="text-xs text-white/45">Active assignments</span><strong className="mt-1 block text-xl">{activeCount}</strong></div><div className="rounded-xl border border-white/10 bg-black/15 p-3"><span className="text-xs text-white/45">Authority source</span><strong className="mt-1 block text-sm">Server checked on each action</strong></div><div className="rounded-xl border border-white/10 bg-black/15 p-3"><span className="text-xs text-white/45">Alpha Owner</span><strong className="mt-1 block text-sm">Separate from assigned admins</strong></div></div>
    </header>

    {error && <p role="alert" className="rounded-xl border border-rose-200/20 bg-rose-950/30 p-3 text-sm text-rose-100">{error}</p>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200/20 bg-emerald-950/20 p-3 text-sm text-emerald-100">{notice}</p>}

    <div className="grid items-start gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <form onSubmit={save} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <div className="flex items-center gap-3"><UserRoundPlus className="h-5 w-5 text-amber-100" /><div><h2 className="text-lg font-semibold">{editingUid ? "Review assignment" : "Assign an administrator"}</h2><p className="mt-0.5 text-sm text-white/50">Verified account email · specific responsibilities · recorded reason</p></div></div>
        <label className="mt-4 block text-sm text-white/75">Exact account email<input type="email" required value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} disabled={Boolean(editingUid)} className="mt-1.5 min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-base text-white outline-none focus:border-amber-100/40 disabled:opacity-60" placeholder="name@example.com" /></label>

        <div className="mt-5 space-y-4">{ADMIN_SCOPE_GROUPS.map((group) => <fieldset key={group.title} className="rounded-xl border border-white/10 p-3"><legend className="px-1 text-sm font-medium text-white/85">{group.title}</legend><div className="mt-1 space-y-1">{group.options.map(([scope, label, detail]) => <label key={scope} className="flex cursor-pointer items-start gap-3 rounded-lg p-2.5 hover:bg-white/[0.035]"><input type="checkbox" checked={selectedScopes.has(scope)} onChange={() => toggleScope(scope)} className="mt-1 h-4 w-4 shrink-0 accent-amber-200" /><span><strong className="block text-sm font-medium">{label}</strong><span className="mt-0.5 block text-xs leading-relaxed text-white/50">{detail}</span></span></label>)}</div></fieldset>)}</div>

        {needsRegions && <fieldset className="mt-4 rounded-xl border border-sky-100/15 bg-sky-100/[0.025] p-3"><legend className="px-1 text-sm font-medium text-sky-100"><MapPin className="mr-1 inline h-4 w-4" />Service area</legend><p className="mb-2 text-xs leading-relaxed text-white/55">Choose where this administrator can review public services, giver applications, and practitioner applications. These areas do not grant access to private client reflections.</p><div className="flex flex-wrap gap-1.5">{US_REGION_OPTIONS.map(([code, name]) => <button type="button" key={code} onClick={() => toggleRegion(code)} aria-pressed={form.regions.includes(code) && !form.allRegions} className={`rounded-lg border px-2.5 py-1.5 text-xs ${form.regions.includes(code) && !form.allRegions ? "border-sky-100/50 bg-sky-100/10 text-sky-50" : "border-white/10 text-white/60 hover:bg-white/5"}`} title={name}>{code}</button>)}</div><label className="mt-3 flex items-center gap-2 text-sm text-white/75"><input type="checkbox" checked={form.allRegions === true} onChange={(event) => setForm((current) => ({ ...current, allRegions: event.target.checked, regions: event.target.checked ? [] : current.regions }))} className="h-4 w-4 accent-sky-200" />All service areas</label></fieldset>}

        <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="block text-sm text-white/75">Access expires <span className="text-white/40">(optional, up to 1 year)</span><input type="date" min={tomorrow()} value={form.expiresAt} onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))} className="mt-1.5 min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-amber-100/40" /></label><label className="block text-sm text-white/75">Why is this access needed?<textarea required minLength={12} maxLength={300} rows={2} value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-amber-100/40" placeholder="Brief operational reason" /></label></div>
        <p className="mt-3 rounded-lg border border-white/8 bg-black/10 p-3 text-xs leading-relaxed text-white/50"><ShieldCheck className="mr-1 inline h-4 w-4 text-emerald-200" />Only verified, existing accounts can be assigned. The Alpha Owner assignment cannot be edited here. Every assignment and revocation records the actor, responsibilities, service areas, date, and reason. Revocation is checked by server functions immediately; already-issued sign-in tokens do not preserve access.</p>
        <div className="mt-4 flex flex-wrap gap-2"><button type="submit" disabled={!canSave || saving} className="min-h-11 rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-45">{saving ? "Saving…" : editingUid ? "Save assignment changes" : "Assign admin access"}</button>{editingUid && <button type="button" onClick={() => { setForm(EMPTY_FORM); setEditingUid(""); }} className="min-h-11 rounded-xl border border-white/12 px-4 text-sm text-white/70">Cancel edit</button>}</div>
      </form>

      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Assigned administrators</h2><p className="mt-0.5 text-sm text-white/50">Only people with an assignment appear here.</p></div><span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/50">{assignments.length} total</span></div>
        {loading ? <p role="status" className="py-8 text-center text-sm text-white/50">Loading assignments…</p> : assignments.length ? <ul className="mt-4 space-y-3">{assignments.map((item) => <li key={item.uid} className="rounded-xl border border-white/10 bg-slate-950/35 p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="break-all text-sm font-medium">{item.email}</p><p className="mt-1 text-xs text-white/45">{item.displayName || "No display name"} · {item.emailVerified ? "Email verified" : "Email not verified"}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] ${item.active && !item.disabled ? "bg-emerald-100/10 text-emerald-100" : "bg-rose-100/10 text-rose-100"}`}>{item.disabled ? "Account disabled" : item.active ? "Active" : "Inactive"}</span></div><p className="mt-2 text-xs leading-relaxed text-white/60">{(item.scopes || []).map((scope) => ADMIN_SCOPE_GROUPS.flatMap((group) => group.options).find(([id]) => id === scope)?.[1] || scope).join(" · ")}</p>{Object.entries(item.regionalScopes || {}).map(([scope, regions]) => <p key={scope} className="mt-1 text-xs text-sky-100/70">{ADMIN_SCOPE_GROUPS.flatMap((group) => group.options).find(([id]) => id === scope)?.[1]} · {regions.includes("*") ? "All service areas" : regions.join(", ")}</p>)}{item.expiresAt && <p className="mt-1 text-xs text-white/40">Expires {new Date(item.expiresAt).toLocaleDateString()}</p>}<div className="mt-3 flex gap-2"><button type="button" onClick={() => edit(item)} disabled={saving || !item.emailVerified} className="min-h-9 rounded-lg border border-white/12 px-3 text-xs text-white/70 disabled:opacity-40">Review assignment</button><button type="button" onClick={() => revoke(item)} disabled={saving || !item.active} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-rose-200/15 px-3 text-xs text-rose-100/80 disabled:opacity-40"><UserX className="h-3.5 w-3.5" />Revoke</button></div></li>)}</ul> : <div className="mt-4 rounded-xl border border-dashed border-white/12 p-6 text-center"><KeyRound className="mx-auto h-5 w-5 text-white/35" /><p className="mt-2 text-sm text-white/70">No delegated admins yet</p><p className="mt-1 text-xs leading-relaxed text-white/45">You remain the Alpha Owner. Add a trusted, verified account and choose only the work that person needs to perform.</p></div>}
      </section>
    </div>
  </main>;
}
