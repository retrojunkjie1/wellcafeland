import React from "react";

export default function NotReady({title="Preparing your experience...",subtitle="This space is being carefully prepared."}){
  return (
    <div className="min-h-[40vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-8 text-center shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}
