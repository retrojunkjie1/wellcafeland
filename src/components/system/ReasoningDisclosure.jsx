import React, { useMemo, useState } from "react";
import { ChevronDown, Shield, Sparkles } from "lucide-react";

const Badge = ({children}) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
    {children}
  </span>
);

export default function ReasoningDisclosure({reasoning,defaultOpen=false,open: controlledOpen,onOpenChange}) {
  const [internalOpen,setInternalOpen]=useState(defaultOpen);
  const isControlled = typeof controlledOpen === "boolean";
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (v) => (isControlled ? onOpenChange?.(typeof v === "function" ? v(open) : v) : setInternalOpen(v));

  const riskLabel=useMemo(() => {
    const r=reasoning?.safety?.risk || "low";
    return r==="high" ? "High" : (r==="medium" ? "Medium" : "Low");
  }, [reasoning]);

  if(!reasoning) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v)=>(!v))}
        aria-expanded={open}
        className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] text-white/70 hover:text-white"
      >
        <Sparkles size={14} className="text-white/60" />
        <span>How I'm approaching this</span>
        <ChevronDown size={14} className={"transition-transform " + (open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Role: {reasoning.role}</Badge>
            <Badge>Depth: {reasoning.depth}</Badge>
            <Badge><Shield size={12} /> Risk: {riskLabel}</Badge>
          </div>

          {Array.isArray(reasoning.checks) && reasoning.checks.length>0 && (
            <div className="mt-3">
              <div className="text-[11px] uppercase tracking-wide text-white/50">What I checked</div>
              <ul className="mt-1 list-disc pl-5 text-[12px] text-white/70">
                {reasoning.checks.map((c)=>(<li key={c}>{c}</li>))}
              </ul>
            </div>
          )}

          {Array.isArray(reasoning.summary) && reasoning.summary.length>0 && (
            <div className="mt-3">
              <div className="text-[11px] uppercase tracking-wide text-white/50">Approach</div>
              <ul className="mt-1 list-disc pl-5 text-[12px] text-white/70">
                {reasoning.summary.map((s,i)=>(<li key={i}>{s}</li>))}
              </ul>
            </div>
          )}

          {Array.isArray(reasoning.safety?.disclaimers) && reasoning.safety.disclaimers.length>0 && (
            <div className="mt-3">
              <div className="text-[11px] uppercase tracking-wide text-white/50">Safety</div>
              <div className="mt-1 space-y-2 text-[12px] text-white/70">
                {reasoning.safety.disclaimers.map((d,i)=>(<div key={i} className="rounded-xl border border-white/10 bg-black/20 p-2">{d}</div>))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
