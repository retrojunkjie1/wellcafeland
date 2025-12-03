// src/components/tools/PanicResetSessionView.jsx
// Emergency calm protocol session
// Phase 37: Tool Sessions Activation Layer

import React from "react";

export const PanicResetSessionView = () => {
  return (
    <div className="flex w-full max-w-md flex-col gap-4 text-xs sm:text-sm text-amber-50/90">
      <div className="rounded-2xl bg-red-500/10 px-4 py-3 border border-red-500/40">
        <p className="font-medium text-red-100">You are safe right now.</p>
        <p className="mt-1 text-red-50/80">
          This wave will pass. Stay with me for the next few breaths – I won&apos;t rush you.
        </p>
      </div>
      <ul className="space-y-2 text-[0.8rem] leading-relaxed text-slate-100/90">
        <li>• Place one hand on your chest and one on your belly.</li>
        <li>• Breathe in gently through the nose for 4 seconds.</li>
        <li>• Hold for 2 seconds.</li>
        <li>• Exhale slowly through pursed lips for 6 seconds.</li>
        <li>• Notice the floor, the chair, and one thing that feels safe.</li>
      </ul>
    </div>
  );
};

