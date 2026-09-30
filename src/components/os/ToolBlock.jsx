import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { getToolById } from "@/apps/tools/toolsRegistry";
import { getToolRoute } from "@/utils/toolRouter";

export default function ToolBlock({ tool, onSelect }) {
  const toolId = tool?.type;
  const definition = toolId ? getToolById(toolId) : null;
  const route = toolId ? getToolRoute(toolId) : null;
  if (!definition || !route) return null;

  return (
    <div className="ml-0 sm:ml-11 max-w-xl rounded-2xl border border-amber-200/20 bg-amber-100/[0.04] p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-200/10 text-amber-100">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-amber-100/65">Practice selected</p>
          <h3 className="mt-1 text-base font-semibold text-white">{definition.title || definition.name || "Guided practice"}</h3>
          {definition.description && <p className="mt-1 text-sm leading-relaxed text-white/70">{definition.description}</p>}
        </div>
      </div>
      {onSelect ? (
        <button type="button" onClick={onSelect} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-200 px-4 text-sm font-medium text-slate-950 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100">
          Open practice <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : (
        <Link to={route} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-200 px-4 text-sm font-medium text-slate-950 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100">
          Open practice <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
