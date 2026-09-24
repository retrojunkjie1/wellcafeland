// src/apps/tools/Grounding54321.jsx — 5-4-3-2-1 grounding guided screen (Phase 54L)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GroundingSessionView } from "@/components/tools/GroundingSessionView";

export default function Grounding54321() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-medium text-white mb-2">5-4-3-2-1 Grounding</h1>
        <p className="text-sm text-white/60 mb-6">
          Optional sensory prompts. Move at your own pace, skip any sense, or stop whenever you choose.
        </p>
        <GroundingSessionView activeIndex={activeIndex} />
        <div className="mt-6 flex gap-2">
          {activeIndex > 0 && (
            <button
              type="button"
              onClick={() => setActiveIndex((i) => i - 1)}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 text-sm"
            >
              Previous
            </button>
          )}
          {activeIndex < 4 ? (
            <button
              type="button"
              onClick={() => setActiveIndex((i) => i + 1)}
              className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 hover:bg-emerald-500/30 text-sm"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/tools")}
              className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 hover:bg-emerald-500/30 text-sm"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
