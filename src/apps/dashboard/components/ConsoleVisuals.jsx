import React from "react";

const PALETTE = {
  mint: "#9dd9bd",
  blue: "#93c5fd",
  gold: "#f3d37a",
  amber: "#f5b86d",
  rose: "#fb9292",
  muted: "rgba(255,255,255,.14)",
};

export function RingMeter({ value, label, detail, note, color = PALETTE.mint, size = 132 }) {
  const safeValue = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : null;
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = safeValue === null ? 0 : circumference * safeValue / 100;

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size, "--meter-color": color }} role="img" aria-label={`${label}: ${safeValue === null ? "not measured" : `${Math.round(safeValue)} percent`}`}>
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r="57" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".7" strokeDasharray="1 7" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke={PALETTE.muted} strokeWidth="10" />
          {safeValue !== null && <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${progress} ${circumference}`} className="god-eye-ring-halo transition-[stroke-dasharray] duration-1000 ease-out" />}
          <circle cx="60" cy="60" r="37" fill="rgba(255,255,255,.018)" stroke="rgba(255,255,255,.06)" strokeWidth=".8" />
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <strong className="text-3xl font-semibold leading-none tabular-nums tracking-tight text-white">{safeValue === null ? "—" : `${Math.round(safeValue)}%`}</strong>
          <span className="mt-1.5 text-[9px] uppercase tracking-[.18em] text-white/48">{safeValue === null ? "unmeasured" : "observed"}</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white/65">{label}</p>
        <p className="mt-1 text-2xl font-semibold leading-tight tabular-nums text-white">{detail}</p>
        {safeValue === null && <p className="mt-1 text-xs text-white/45">{note || "Waiting for recorded activity"}</p>}
      </div>
    </div>
  );
}

export function MemberBaseVisual({ total, loading, error }) {
  const count = Number.isFinite(total) ? total : null;
  const unavailable = loading || error || count === null;
  return (
    <div className="flex min-h-40 items-center gap-5" role="img" aria-label={`Registered accounts: ${unavailable ? "unavailable" : count}; recent presence is not measured`}>
      <div className="god-eye-member-orbit relative grid h-36 w-36 shrink-0 place-items-center rounded-full">
        <span className="absolute inset-[9px] rounded-full border border-emerald-100/10" />
        <span className="absolute inset-[19px] rounded-full border border-amber-100/10" />
        <div className="relative grid h-[5.3rem] w-[5.3rem] place-content-center rounded-full border border-white/10 bg-[#081111]/70 text-center shadow-[0_0_36px_rgba(157,231,199,.12)]">
          <strong className="text-3xl font-semibold leading-none tabular-nums text-white">{unavailable ? "—" : count.toLocaleString()}</strong>
          <span className="mt-1 text-[9px] uppercase tracking-[.16em] text-white/45">accounts</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[.15em] text-emerald-50/50">Registered members</p>
        <p className="mt-2 text-xl font-medium leading-tight text-white">Platform community</p>
        <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-100/10 bg-amber-100/[.04] px-3 py-1.5 text-xs text-amber-50/65">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-200/70" />
          Presence not measured
        </span>
      </div>
    </div>
  );
}

export function RiskTrendChart({ days = [], loading = false, error = null }) {
  if (loading) return <div className="grid h-56 place-items-center text-sm text-white/50">Loading the seven-day signal history…</div>;
  if (error) return <div role="status" className="grid h-56 place-items-center text-sm text-rose-200">Trend unavailable</div>;

  const max = Math.max(...days.map((day) => Number(day.count) || 0), 0);
  if (!days.length) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium text-white/75">No dated signal history is available</p>
        <p className="text-xs text-white/45">The chart appears when dated operational signals are recorded.</p>
      </div>
    );
  }

  const baseline = 205;
  const chartTop = 38;
  const chartHeight = baseline - chartTop;
  const scaleMax = max || 1;
  const points = days.map((day, index) => ({
    x: 48 + (days.length < 2 ? 0 : index * (676 / (days.length - 1))),
    y: baseline - (Number(day.count) || 0) / scaleMax * chartHeight,
    day,
  }));
  const linePath = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const midpoint = (previous.x + point.x) / 2;
    return `${path} C ${midpoint} ${previous.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`;
  }, "");
  const areaPath = points.length ? `${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z` : "";
  return (
    <svg viewBox="0 0 760 255" className="h-64 w-full overflow-visible" role="img" aria-label="Daily operational risk signals for the last seven days">
      <defs>
        <linearGradient id="riskAreaGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#f6d889" stopOpacity=".34" /><stop offset="65%" stopColor="#96d5b9" stopOpacity=".10" /><stop offset="100%" stopColor="#96d5b9" stopOpacity="0" /></linearGradient>
        <linearGradient id="riskStrokeGradient" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stopColor="#a3e4c4" /><stop offset="58%" stopColor="#f6d889" /><stop offset="100%" stopColor="#f2a96e" /></linearGradient>
        <filter id="riskGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {[0, 1, 2, 3].map((line) => {
        const y = baseline - chartHeight * line / 3;
        return <g key={line}><line x1="38" x2="735" y1={y} y2={y} stroke="rgba(255,255,255,.085)" strokeDasharray={line === 0 ? "0" : "2 8"} /><text x="8" y={y + 4} fill="rgba(255,255,255,.38)" fontSize="10">{Math.round(max * line / 3)}</text></g>;
      })}
      {max > 0 && <path d={areaPath} fill="url(#riskAreaGradient)" />}
      {max > 0 && <path d={linePath} fill="none" stroke="url(#riskStrokeGradient)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#riskGlow)" />}
      {points.map(({ x, y, day }) => (
        <g key={day.date}>
          <title>{`${day.label} ${day.date}: ${Number(day.count) || 0} risk signals`}</title>
          {max > 0 && <circle cx={x} cy={y} r="9" fill="rgba(246,216,137,.12)" />}
          <circle cx={x} cy={y} r={max > 0 ? "3.5" : "2.5"} fill={max > 0 ? "#f6d889" : "rgba(190,220,207,.34)"} />
          <text x={x} y="236" textAnchor="middle" fill="rgba(255,255,255,.56)" fontSize="11">{day.label}</text>
        </g>
      ))}
      {max === 0 && <g className="god-eye-empty-state"><ellipse cx="390" cy="123" rx="195" ry="56" fill="rgba(246,216,137,.035)" /><text x="390" y="116" textAnchor="middle" fill="rgba(255,255,255,.78)" fontSize="14">A quiet signal field</text><text x="390" y="139" textAnchor="middle" fill="rgba(255,255,255,.45)" fontSize="11">No operational risk events recorded this week</text></g>}
    </svg>
  );
}

export function AgentReadinessMeter({ total, implemented, enabled, loading, error = null }) {
  if (loading) return <div className="grid h-56 place-items-center text-sm text-white/50">Loading handler status…</div>;
  if (error) return (
    <div className="grid h-56 place-items-center text-center">
      <div>
        <p className="text-4xl font-semibold tabular-nums text-white/65">—<span className="text-xl text-white/35"> / {Number(total) || 0}</span></p>
        <p className="mt-2 text-sm text-amber-50/60">Handler status unavailable</p>
        <p className="mt-1 text-xs text-white/40">No availability totals shown until verified.</p>
      </div>
    </div>
  );
  const registered = Math.max(0, Number(total) || 0);
  const available = Math.min(registered, Math.max(0, Number(implemented) || 0));
  const live = Math.min(available, Math.max(0, Number(enabled) || 0));
  const paused = available - live;
  const unconnected = registered - available;
  const segments = [
    { label: "Enabled for new requests", count: live, color: PALETTE.mint },
    { label: "Paused", count: paused, color: PALETTE.gold },
    { label: "No production handler", count: unconnected, color: "rgba(255,255,255,.18)" },
  ];
  return (
    <div className="flex h-56 flex-col justify-center">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div><p className="text-4xl font-semibold tabular-nums text-white">{live}<span className="text-xl text-white/40"> / {registered}</span></p><p className="mt-1 text-sm text-white/55">catalog agents enabled</p></div>
        <div className="text-right"><p className="text-xs uppercase tracking-[.14em] text-white/40">Handler coverage</p><p className="mt-1 text-lg font-medium tabular-nums text-white/75">{registered ? Math.round(available / registered * 100) : "—"}%</p></div>
      </div>
      <div className="god-eye-readiness-track flex h-4 overflow-hidden rounded-full bg-white/[.07] shadow-[0_0_28px_rgba(157,231,199,.08)]" role="img" aria-label={segments.map(({ label, count }) => `${label}: ${count}`).join(", ")}>
        {segments.map(({ label, count, color }) => count > 0 && <span key={label} title={`${label}: ${count}`} style={{ width: `${registered ? count / registered * 100 : 0}%`, backgroundColor: color }} />)}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {segments.map(({ label, count, color }) => <div key={label} className="flex min-w-0 items-center gap-2 text-xs text-white/60"><span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: color }} /><span className="truncate">{label}</span><strong className="ml-auto tabular-nums text-white">{count}</strong></div>)}
      </div>
    </div>
  );
}

export function QueueVolumeBar({ count, maxCount }) {
  if (count === null || count === undefined) return <div className="h-1.5 w-full rounded-full bg-white/[.06]" aria-label="Queue count unavailable" />;
  const width = maxCount > 0 ? Math.max(count > 0 ? 4 : 0, count / maxCount * 100) : 0;
  return <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[.07]" role="img" aria-label={`${count} waiting`}><span className="block h-full rounded-full bg-amber-200/80 transition-[width] duration-500" style={{ width: `${width}%` }} /></div>;
}

export function RiskSeverityMeter({ warningCount, criticalCount, totalEvents }) {
  const warning = Math.max(0, Number(warningCount) || 0);
  const critical = Math.max(0, Number(criticalCount) || 0);
  const other = Math.max(0, (Number(totalEvents) || 0) - warning - critical);
  const total = warning + critical + other;
  const parts = [
    { label: "Warning", count: warning, color: PALETTE.amber },
    { label: "Critical", count: critical, color: PALETTE.rose },
    { label: "Other", count: other, color: PALETTE.blue },
  ];
  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-4xl font-semibold tabular-nums text-white">{total}</p><p className="mt-1 text-sm text-white/50">signals · last 7 days</p></div><div className="text-right"><p className="text-xs text-white/40">Critical</p><p className="text-xl font-semibold tabular-nums text-rose-200">{critical}</p></div></div>
      <div className="flex h-3 overflow-hidden rounded-full bg-white/[.07]" role="img" aria-label={parts.map(({ label, count }) => `${label}: ${count}`).join(", ")}>
        {total > 0 && parts.map(({ label, count, color }) => count > 0 && <span key={label} title={`${label}: ${count}`} style={{ width: `${count / total * 100}%`, backgroundColor: color }} />)}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {parts.map(({ label, count, color }) => <span key={label} className="inline-flex items-center gap-2 text-xs text-white/55"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{label}<strong className="tabular-nums text-white/80">{count}</strong></span>)}
      </div>
    </div>
  );
}

export function AgentHealthBar({ summary, error = null }) {
  if (error) return <div className="rounded-3xl border border-amber-100/10 bg-slate-950/25 p-5 text-sm text-amber-50/65" role="status">Agent run health is unavailable until the operations service can be verified.</div>;
  const segments = [
    { label: "Healthy", count: summary.healthy, color: PALETTE.mint },
    { label: "Degraded", count: summary.degraded, color: PALETTE.amber },
    { label: "Down", count: summary.down, color: PALETTE.rose },
    { label: "Not measured", count: summary.unknown, color: "rgba(255,255,255,.18)" },
  ];
  const total = Math.max(0, Number(summary.total) || 0);
  return (
    <div className="rounded-3xl border border-white/[.08] bg-slate-950/25 p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-[.16em] text-white/45">Observed run health</p><h3 className="mt-1 text-lg font-semibold text-white">Agent health mix</h3></div><p className="text-sm tabular-nums text-white/60">{total} registered</p></div>
      <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-white/[.07]" role="img" aria-label={segments.map(({ label, count }) => `${label}: ${count}`).join(", ")}>
        {total > 0 && segments.map(({ label, count, color }) => count > 0 && <span key={label} title={`${label}: ${count}`} style={{ width: `${count / total * 100}%`, backgroundColor: color }} />)}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {segments.map(({ label, count, color }) => <div key={label} className="flex items-center gap-2 text-xs text-white/55"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} /><span>{label}</span><strong className="ml-auto tabular-nums text-white/85">{count}</strong></div>)}
      </div>
    </div>
  );
}
