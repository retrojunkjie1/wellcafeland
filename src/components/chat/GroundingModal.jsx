import React from "react";
import { useNavigate } from "react-router-dom";

export default function GroundingModal({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;
  const openFull = () => {
    navigate("/tools/grounding/54321");
    onClose?.();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => onClose?.()} />
      <div role="dialog" aria-modal="true" aria-labelledby="grounding-modal-title" className="relative w-full md:max-w-xl rounded-t-3xl md:rounded-3xl border border-white/10 bg-black/90 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div id="grounding-modal-title" className="text-lg opacity-95">Choose an Anchor</div>
          <button type="button" aria-label="Close grounding choices" className="rounded-xl px-3 py-2 text-sm bg-white/10 hover:bg-white/15" onClick={() => onClose?.()}>
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed opacity-90">
          <p>Choose one small way to orient, or close this and choose something else.</p>
          <ul className="space-y-2 text-white/75">
            <li>Rest your eyes on one steady thing.</li>
            <li>Listen for one familiar sound—or choose quiet.</li>
            <li>Hold a familiar object if that feels useful.</li>
          </ul>
          <p className="text-white/60">No counting, ratings, or written answers.</p>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" className="rounded-xl px-3 py-2 text-sm bg-white/10 hover:bg-white/15" onClick={openFull}>
            Choose an anchor
          </button>
        </div>
      </div>
    </div>
  );
}
