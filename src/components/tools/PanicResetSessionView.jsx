// src/components/tools/PanicResetSessionView.jsx
// Optional grounding support for an intense moment
// Phase 37: Tool Sessions Activation Layer
// Never blank: root has min-h so tool pages always show visible UI

import React from "react";

export const PanicResetSessionView = ({ onComplete, onCancel }) => {
  if (import.meta.env.DEV) {
    console.debug("[PanicReset] render", { ready: true, loading: false, error: null });
  }
  return (
    <div className="flex min-h-[60vh] w-full max-w-md flex-col justify-center gap-4 text-xs sm:text-sm text-amber-50/90">
      <div className="rounded-2xl border border-amber-200/15 bg-amber-100/[0.04] px-4 py-4">
        <p className="font-medium text-amber-50">Take this one moment at a time</p>
        <p className="mt-1 leading-relaxed text-amber-50/75">
          If it feels useful, choose one gentle point of attention. You can skip anything or stop whenever you want.
        </p>
      </div>
      <ul className="space-y-2 text-[0.8rem] leading-relaxed text-slate-100/90">
        <li>• Let your breath be natural, or leave your breath out of the practice.</li>
        <li>• If looking around feels okay, notice one color or shape in the room.</li>
        <li>• You might notice the surface supporting you, without changing your position.</li>
        <li>• If focusing inward feels uncomfortable, shift attention to a neutral sound or object.</li>
      </ul>
      <p className="text-[0.75rem] leading-relaxed text-slate-300/70">
        This practice cannot assess your surroundings. If you may be in immediate danger, contact local emergency services or someone nearby who can help.
      </p>
      <section aria-label="Immediate support" className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs font-medium text-white/80">If you are in the U.S. or its territories and need crisis support</p>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <a className="min-h-11 content-center text-amber-200 underline underline-offset-4" href="tel:988">Call 988</a>
          <a className="min-h-11 content-center text-amber-200 underline underline-offset-4" href="sms:988">Text 988</a>
          <a className="min-h-11 content-center text-amber-200 underline underline-offset-4" href="https://988lifeline.org/get-help/" target="_blank" rel="noreferrer">Chat with 988</a>
        </div>
      </section>
      <div className="flex flex-wrap gap-3 pt-2">
        {onComplete && <button type="button" onClick={onComplete} className="min-h-11 rounded-full bg-amber-200/15 px-5 text-sm text-amber-50 hover:bg-amber-200/25">Finish practice</button>}
        {onCancel && <button type="button" onClick={onCancel} className="min-h-11 rounded-full border border-white/15 px-5 text-sm text-white/70 hover:bg-white/5">Stop and leave</button>}
      </div>
    </div>
  );
};
