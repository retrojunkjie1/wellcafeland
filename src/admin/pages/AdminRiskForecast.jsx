import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { getAdminOperationalSnapshot, invalidateAdminOperationalSnapshot } from "@/services/adminObservability";

export function AdminRiskForecast() {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const hasSnapshot = useRef(false);

  const load = useCallback(async ({ force = false } = {}) => {
    setError("");
    if (force) setRefreshing(true);
    else if (!hasSnapshot.current) setLoading(true);
    try {
      const data = await getAdminOperationalSnapshot({ force });
      setSnapshot(data);
      hasSnapshot.current = true;
    } catch (loadError) {
      setError(loadError?.message || "Risk signals could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load({ force: true }), 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const refresh = () => {
    invalidateAdminOperationalSnapshot();
    load({ force: true });
  };
  const paused = snapshot?.riskRadarEnabled === false;
  const radar = snapshot?.riskRadar;
  const dailyCounts = radar?.dailyCounts || [];
  const maxDailyCount = Math.max(1, ...dailyCounts.map((day) => Number(day.count) || 0));

  return <main className="space-y-5 text-white">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/65">Operational signals</p>
        <h2 className="mt-1 text-2xl font-semibold">Risk Radar</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">A seven-day count of explicit system risk signals for administrator review. It does not rank members or infer a person’s recovery risk.</p>
      </div>
      <button type="button" onClick={refresh} disabled={refreshing || loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/75 hover:bg-white/5 disabled:opacity-50">
        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? "Refreshing…" : "Refresh"}
      </button>
    </header>

    {error && <div role="alert" className="rounded-xl border border-rose-200/20 bg-rose-200/[0.06] p-4 text-sm text-rose-100">{error}</div>}
    {loading && !snapshot && <p role="status" className="py-8 text-center text-sm text-white/55">Loading operational signals…</p>}
    {snapshot && (paused ? <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
      <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-white/50" /><div><h3 className="font-medium">Risk Radar is paused</h3><p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">Signal collection is off, so this page is not presenting old counts as current. Turn the feature back on in system controls to resume this seven-day view.</p><Link to="/admin/control" className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-white/10 px-3 text-sm text-amber-100 hover:bg-white/5">Open system controls</Link></div></div>
    </section> : <>
      <section aria-label="Risk signal totals" className="grid gap-3 sm:grid-cols-3">
        <SignalMetric label="Signals · 7 days" value={radar?.totalEvents} tone="neutral" />
        <SignalMetric label="Needs review" value={radar?.warningCount} tone="warning" />
        <SignalMetric label="Critical" value={radar?.criticalCount} tone="critical" />
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-200/80" /><div><h3 className="font-medium">Signal volume by day</h3><p className="mt-1 text-xs text-white/45">Counts of server-recorded risk alerts. Each is a prompt for human review, not a diagnosis or identity claim.</p></div></div>
        {dailyCounts.length === 0 ? <p className="mt-5 text-sm text-white/50">Daily signal history is not available in this snapshot.</p> : <div className="mt-5 grid grid-cols-7 gap-2" aria-label="Daily risk signal counts">{dailyCounts.map((day) => <div key={day.date} className="min-w-0 text-center"><div className="flex h-28 items-end justify-center rounded-xl bg-slate-950/40 px-1 pb-2"><div className="w-full max-w-8 rounded-md bg-amber-200/75" style={{ height: `${Math.max(4, ((Number(day.count) || 0) / maxDailyCount) * 100)}%` }} title={`${day.count} signals`} /></div><div className="mt-2 text-[11px] text-white/55">{day.label}</div><div className="text-xs tabular-nums text-white/75">{day.count}</div></div>)}</div>}
        {radar?.sampled && <p className="mt-4 text-xs text-white/45">The event sample reached its display limit; counts may be incomplete. Check the audit trail for reviewed items.</p>}
      </section>
    </>)}
    <p className="text-xs text-white/40">Only server-recorded, allowlisted operational signals are summarized. Private check-ins, messages, search history, and member identities are not used in this view.</p>
  </main>;
}

function SignalMetric({ label, value, tone }) {
  const colors = tone === "critical" ? "border-rose-200/20 bg-rose-200/[0.05] text-rose-100" : tone === "warning" ? "border-amber-200/20 bg-amber-200/[0.05] text-amber-100" : "border-white/10 bg-white/[0.025] text-white";
  return <article className={`rounded-2xl border p-4 ${colors}`}><p className="text-xs opacity-70">{label}</p><p className="mt-3 text-3xl font-semibold tabular-nums">{Number.isFinite(value) ? value.toLocaleString() : "—"}</p></article>;
}
