import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { navigateToTool } from "@/navigation/toolReturn";

export default function GroundingModal({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  if (!open) return null;
  const openFull = () => {
    navigateToTool(navigate, "/tools/grounding/54321", location);
    onClose?.();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => onClose?.()} />
      <div role="dialog" aria-modal="true" aria-labelledby="grounding-modal-title" className="relative w-full md:max-w-xl rounded-t-3xl md:rounded-3xl border border-white/10 bg-black/90 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div id="grounding-modal-title" className="text-lg opacity-95">Reconnect with the room</div>
          <button type="button" aria-label="Close grounding choices" className="rounded-xl px-3 py-2 text-sm bg-white/10 hover:bg-white/15" onClick={() => onClose?.()}>
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed opacity-90">
          <p>Noticing one thing around you may help bring attention back to the present. Choose one comfortable cue; stop if it feels worse.</p>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" className="rounded-xl px-3 py-2 text-sm bg-white/10 hover:bg-white/15" onClick={openFull}>
            Start a brief pause
          </button>
        </div>
      </div>
    </div>
  );
}
