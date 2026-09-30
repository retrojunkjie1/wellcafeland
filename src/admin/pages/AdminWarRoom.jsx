import React, { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Clock3, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { getAdminOperationalSnapshot, invalidateAdminOperationalSnapshot } from "@/services/adminObservability";

function metricValue(value, suffix = "") {
  return Number.isFinite(value) ? `${value.toLocaleString()}${suffix}` : "—";
}

function eventLabel(event) {
  const agent = typeof event.agentId === "string" && /^[a-z0-9_-]{1,48}$/i.test(event.agentId)
    ? event.agentId
    : "System agent";
  if (event.eventType === "agent_execution_error" || event.success === false) return `${agent} · needs attention`;
  if (event.eventType === "agent_execution") return `${agent} · completed`;
  return `${agent} · ${event.eventType.replaceAll("_", " ")}`;
}

export function AdminWarRoom() {
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
      setError(loadError?.message || "System operations could not be loaded.");
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
  const metrics = snapshot?.metrics || {};
  const events = (snapshot?.events || []).filter((event) =>
    ["agent_execution", "agent_execution_error"].includes(event.eventType)
  ).slice(0, 8);

  return <main className="space-y-5 text-white">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/65">System operations</p>
        <h2 className="mt-1 text-2xl font-semibold">War Room</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">Service health and agent activity, summarized for support. This view does not show member content or individual member activity.</p>
      </div>
      <button type="button" onClick={refresh} disabled={refreshing || loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/75 hover:bg-white/5 disabled:opacity-50">
        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? "Refreshing…" : "Refresh"}
      </button>
    </header>

    {error && <div role="alert" className="rounded-xl border border-rose-200/20 bg-rose-200/[0.06] p-4 text-sm text-rose-100">{error}</div>}
    {loading && !snapshot && <p role="status" className="py-8 text-center text-sm text-white/55">Loading system operations…</p>}

    {snapshot && <>
      <section aria-label="System metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Users} label="Active accounts · 24 hours" value={metricValue(metrics.activeUsers)} />
        <Metric icon={Activity} label="Agent executions" value={metricValue(metrics.agentExecutions)} />
        <Metric icon={ShieldCheck} label="Execution error rate" value={metricValue(metrics.errorRate, "%")} detail={metrics.systemHealth === "not_measured" ? "Not measured yet" : metrics.systemHealth} />
        <Metric icon={Clock3} label="Average response" value={metricValue(metrics.avgResponseTime, metrics.avgResponseTime == null ? "" : " ms")} />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="font-medium">Recent agent activity</h3><p className="mt-1 text-xs text-white/45">System events only · up to 8 recent outcomes</p></div>
          <span className={`rounded-full border px-3 py-1 text-xs ${metrics.systemHealth === "degraded" ? "border-rose-200/20 bg-rose-200/[0.06] text-rose-100" : metrics.systemHealth === "watch" ? "border-amber-200/20 bg-amber-200/[0.06] text-amber-100" : metrics.systemHealth === "not_measured" ? "border-white/10 bg-white/[0.04] text-white/55" : "border-emerald-200/20 bg-emerald-100/[0.05] text-emerald-100"}`}>
            {metrics.systemHealth === "not_measured" ? "No execution sample" : metrics.systemHealth || "Status unavailable"}
          </span>
        </div>
        {events.length === 0 ? <p className="mt-5 rounded-xl border border-white/[0.07] bg-slate-950/30 p-4 text-sm text-white/55">No agent execution events were recorded in the current snapshot.</p> : <ul className="mt-4 divide-y divide-white/[0.07]">{events.map((event) => <li key={event.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <span className="text-sm text-white/80">{eventLabel(event)}</span>
          <span className="text-xs text-white/45">{event.errorCode ? `Code: ${event.errorCode} · ` : ""}{event.timestamp ? new Date(event.timestamp).toLocaleString() : "Time unavailable"}</span>
        </li>)}</ul>}
      </section>
      <p className="text-xs text-white/40">Snapshot updated {snapshot.generatedAt ? new Date(snapshot.generatedAt).toLocaleTimeString() : "time unavailable"}. Automatically refreshes every 30 seconds.</p>
    </>}
  </main>;
}

function Metric({ icon: Icon, label, value, detail }) {
  return <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
    <div className="flex items-center gap-2 text-xs text-white/50"><Icon className="h-4 w-4 text-amber-200/80" />{label}</div>
    <div className="mt-3 text-2xl font-semibold tabular-nums text-white">{value}</div>
    {detail && <p className="mt-1 text-xs capitalize text-white/45">{detail.replaceAll("_", " ")}</p>}
  </article>;
}
