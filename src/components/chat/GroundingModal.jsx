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
      <div className="relative w-full md:max-w-xl rounded-t-3xl md:rounded-3xl border border-white/10 bg-black/90 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="text-lg opacity-95">Grounding (5-4-3-2-1)</div>
          <button className="rounded-xl px-3 py-2 text-sm bg-white/10 hover:bg-white/15" onClick={() => onClose?.()}>
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed opacity-90">
          <div><b>5</b> things you can see</div>
          <div><b>4</b> things you can feel</div>
          <div><b>3</b> things you can hear</div>
          <div><b>2</b> things you can smell</div>
          <div><b>1</b> thing you can taste</div>
          <div className="pt-2 opacity-80">
            If panic is high: place one hand on chest, one on belly, exhale longer than inhale.
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="rounded-xl px-3 py-2 text-sm bg-white/10 hover:bg-white/15" onClick={openFull}>
            Open full tool
          </button>
        </div>
      </div>
    </div>
  );
}
