// src/components/tools/VoiceCheckInSheet.jsx
// Bottom sheet for voice check-in (no page jump, no alert)

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import VoiceCheckIn from "@/apps/tools/VoiceCheckIn";
import { useSheet } from "@/context/SheetContext";

const TEXT_FALLBACK_PREFILL = "You don't have to explain—just tell me what's happening right now, in one breath.";

export default function VoiceCheckInSheet({ open, onClose }) {
  const navigate = useNavigate();
  const { openSheet, closeSheet } = useSheet();

  useEffect(() => {
    if (open) openSheet();
    return () => closeSheet();
  }, [open, openSheet, closeSheet]);

  const handleClose = () => {
    closeSheet();
    onClose();
  };

  const handleUseTextInstead = () => {
    closeSheet();
    onClose();
    navigate(`/chat?prefill=${encodeURIComponent(TEXT_FALLBACK_PREFILL)}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className="relative z-10 flex flex-col max-h-[85vh] rounded-t-2xl border-t border-white/10 bg-slate-950 shadow-2xl overflow-hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div>
            <h2 className="text-base font-medium text-white">Voice check-in</h2>
            <p className="text-xs text-white/60 mt-0.5">Name what&apos;s present in one breath</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-[280px]">
          <VoiceCheckIn onComplete={handleClose} onCancel={handleClose} onUseTextInstead={handleUseTextInstead} />
        </div>
      </div>
    </div>
  );
}
