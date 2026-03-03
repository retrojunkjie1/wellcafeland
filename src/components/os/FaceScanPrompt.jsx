// src/components/os/FaceScanPrompt.jsx
// Phase 31 — Face Signal Engine UI
// Modal prompt for face scanning with privacy assurances

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSheet } from "@/context/SheetContext";

/**
 * FaceScanPrompt - Modal for initiating face emotion scan
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {Function} props.onStartScan
 */
export default function FaceScanPrompt({ open, onClose, onStartScan }) {
  const [isScanning, setIsScanning] = useState(false);
  const { openSheet, closeSheet } = useSheet();

  useEffect(() => {
    if (open) openSheet();
    return () => closeSheet();
  }, [open, openSheet, closeSheet]);

  if (!open) return null;

  const handleClose = () => {
    closeSheet();
    onClose();
  };

  const handleStart = async () => {
    setIsScanning(true);
    try {
      await onStartScan();
    } finally {
      setIsScanning(false);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-lg">
      <div className="relative w-full max-w-[480px] rounded-2xl border border-white/20 bg-slate-900/95 backdrop-blur-xl p-6 shadow-xl">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Face Expression Scan</h3>
          <p className="text-sm text-white/70">
            We&apos;ll analyze your facial expression for 5 seconds to better understand your emotional state.
          </p>

          {/* Privacy — two lines */}
          <div className="flex items-start gap-2">
            <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
            <p className="text-xs text-white/60">
              Your scan stays on this device.<br />
              No video is stored.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isScanning}
              className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStart}
              disabled={isScanning}
              className="flex-1 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? "Scanning..." : "Start Scan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

