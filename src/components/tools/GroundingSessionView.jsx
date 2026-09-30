// src/components/tools/GroundingSessionView.jsx
// Legacy session route: optional orientation anchors, without sensory counting.

import React, { useState } from "react";
import { DoorOpen, Eye, Hand, Headphones } from "lucide-react";

const anchors = [
  { label: "One steady object", detail: "Rest your eyes on one shape or color; nothing to count or name.", Icon: Eye },
  { label: "One familiar sound—or quiet", detail: "Listen if it suits you, or choose a quieter space.", Icon: Headphones },
  { label: "A familiar texture", detail: "Hold a familiar object if that feels useful.", Icon: Hand },
  { label: "A more comfortable place", detail: "Stay, turn, or move somewhere that suits you.", Icon: DoorOpen },
];

export const GroundingSessionView = ({ activeIndex = 0 }) => {
  const [selected, setSelected] = useState(null);
  return (
    <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2" aria-label="Optional orientation choices">
      {anchors.map(({ label, detail, Icon }, idx) => (
        <button
          key={label}
          type="button"
          aria-pressed={selected === idx}
          onClick={() => setSelected(idx)}
          className={`flex min-h-20 items-start gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${selected === idx ? "border-cyan-200/50 bg-cyan-100/10" : "border-white/10 bg-slate-900/60 hover:bg-white/5"}`}
        >
          <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
          <span>
            <span className="block text-sm font-medium text-white">{label}</span>
            <span className="mt-1 block text-xs leading-relaxed text-white/65">{detail}</span>
          </span>
        </button>
      ))}
    </div>
  );
};
