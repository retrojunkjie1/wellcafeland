import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Compass } from "lucide-react";

export default function ToolAvailabilityFallback({ toolType }) {
  const navigate = useNavigate();
  const label = String(toolType || "This activity").replace(/[-_]+/g, " ");

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 text-white" role="status">
      <div className="flex items-start gap-3">
        <span className="rounded-xl border border-wcGold/20 bg-wcGold/10 p-2 text-wcGold">
          <Compass aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold capitalize">{label}</h2>
          <p className="mt-1 text-sm leading-relaxed text-white/70">
            This activity can’t open in this view yet. You can browse the available support tools instead.
          </p>
          <button
            type="button"
            onClick={() => navigate("/tools")}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-wcGold px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold"
          >
            Browse support tools <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
