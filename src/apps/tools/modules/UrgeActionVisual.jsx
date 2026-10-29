import React from "react";

const SCENES = {
  "create-distance": {
    label: "A doorway opens into a little more space.",
    art: (p) => (
      <>
        <ellipse cx="346" cy="222" rx="205" ry="23" fill="url(#floor-glow)" opacity=".7" />
        <path d="M404 221V52q0-13 13-13h139q13 0 13 13v169" fill="#111a1c" stroke="#93aaa0" strokeOpacity=".42" strokeWidth="2" />
        <path d="M429 220V67q0-8 8-8h109q8 0 8 8v153" fill="url(#door-light)" opacity=".85" />
        <path d="M429 220V67q0-8 8-8h109q8 0 8 8v153" fill="#d9cfaa" opacity={.05 + p * .1} />
        <g transform={`rotate(${-38 * p} 430 70)`}>
          <path d="M430 70h116v150H430z" fill="url(#door-face)" stroke="#d8c89c" strokeOpacity=".58" strokeWidth="2" />
          <path d="M449 87h78v116h-78z" fill="#182223" fillOpacity=".48" stroke="#f0e4c2" strokeOpacity=".22" />
          <circle cx="516" cy="145" r="3" fill="#e7d49d" />
        </g>
        <path d={`M178 215 C ${230 + p * 45} 198, ${268 + p * 75} 198, ${320 + p * 95} 214`} fill="none" stroke="#e7d49d" strokeOpacity=".52" strokeWidth="2" strokeDasharray="3 8" strokeLinecap="round" />
        <circle cx={190 + p * 210} cy={211 - Math.sin(p * Math.PI) * 13} r="6" fill="#e7d49d" />
      </>
    ),
  },
  "reach-someone": {
    label: "A safe person is one tap away.",
    art: (p) => (
      <>
        <ellipse cx="360" cy="224" rx="180" ry="20" fill="url(#floor-glow)" opacity=".58" />
        <path d="M155 144c25-32 65-32 90 0M475 144c25-32 65-32 90 0" fill="none" stroke="#a7c4ae" strokeOpacity={.18 + p * .28} strokeWidth="2" strokeLinecap="round" />
        <circle cx="200" cy="112" r="35" fill="url(#soft-orb)" stroke="#a7c4ae" strokeOpacity=".48" />
        <circle cx="520" cy="112" r="35" fill="url(#soft-orb)" stroke="#a7c4ae" strokeOpacity=".48" />
        <path d="M184 164c5-15 15-22 29-22s24 7 29 22" fill="#839c91" fillOpacity=".24" stroke="#a7c4ae" strokeOpacity=".4" />
        <path d="M504 164c5-15 15-22 29-22s24 7 29 22" fill="#839c91" fillOpacity=".24" stroke="#a7c4ae" strokeOpacity=".4" />
        <rect x="308" y="38" width="104" height="178" rx="23" fill="url(#phone-shell)" stroke="#d8c89c" strokeOpacity=".66" strokeWidth="2" />
        <rect x="317" y="53" width="86" height="145" rx="15" fill="#0d1417" stroke="#fff" strokeOpacity=".1" />
        <circle cx="360" cy="105" r="20" fill="#a7c4ae" fillOpacity=".14" stroke="#a7c4ae" strokeOpacity=".5" />
        <path d="M351 104c0-8 10-11 15-5l-6 7 6 7c-5 6-15 3-15-5z" fill="#e7d49d" opacity={.35 + p * .55} />
        <path d="M341 149h38" stroke="#e8e0ca" strokeOpacity=".6" strokeWidth="3" strokeLinecap="round" />
        <path d="M348 160h24" stroke="#e8e0ca" strokeOpacity=".25" strokeWidth="2" strokeLinecap="round" />
        <path d="M239 128 C278 105 290 105 308 113M412 113c18-8 30-8 69 15" fill="none" stroke="#e7d49d" strokeOpacity={.16 + p * .58} strokeWidth="2" strokeDasharray="4 7" />
      </>
    ),
  },
  "hands-busy": {
    label: "A familiar task gives your hands one small focus.",
    art: (p) => (
      <>
        <ellipse cx="360" cy="223" rx="190" ry="20" fill="url(#floor-glow)" opacity=".55" />
        <path d="M170 192h378" stroke="#d8c89c" strokeOpacity=".38" strokeWidth="2" />
        <path d="M194 192v26m326-26v26" stroke="#d8c89c" strokeOpacity=".24" strokeWidth="3" />
        <rect x="258" y="77" width="164" height="103" rx="9" fill="url(#paper)" stroke="#e7d49d" strokeOpacity=".5" />
        <path d="M286 106h82M286 128h100M286 150h74" stroke="#53665d" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" />
        <path d="M298 101l5 5 9-11M298 123l5 5 9-11" fill="none" stroke="#8eaa98" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <g transform={`translate(${p * 62} ${-p * 20}) rotate(${-10 + p * 7} 440 91)`}>
          <path d="M435 46l14 5-39 94-14-5z" fill="url(#pen)" stroke="#d8c89c" strokeOpacity=".58" />
          <path d="M396 140l14 5-13 13-6-3z" fill="#d8c89c" />
        </g>
        <path d="M395 155c13 4 25 11 33 20" fill="none" stroke="#a7c4ae" strokeOpacity={.08 + p * .4} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  "basic-need": {
    label: "A few everyday needs are easy to see and choose from.",
    art: (p) => (
      <>
        <ellipse cx="360" cy="224" rx="194" ry="20" fill="url(#floor-glow)" opacity=".55" />
        <rect x="174" y="74" width="125" height="131" rx="17" fill="url(#need-card)" stroke="#a7c4ae" strokeOpacity=".38" />
        <rect x="310" y="74" width="125" height="131" rx="17" fill="url(#need-card)" stroke="#a7c4ae" strokeOpacity=".38" />
        <rect x="446" y="74" width="125" height="131" rx="17" fill="url(#need-card)" stroke="#a7c4ae" strokeOpacity=".38" />
        <path d="M217 110h38l-4 57q-1 10-10 10h-10q-9 0-10-10z" fill="#9bc2ba" fillOpacity=".08" stroke="#b4cdc4" strokeOpacity=".68" strokeWidth="2" />
        <path d={`M221 ${155 - p * 24}h30v12q-1 10-10 10h-10q-9 0-10-10z`} fill="url(#water)" opacity=".9" />
        <path d="M350 128c0-15 20-22 20-37 0 15 20 22 20 37a20 20 0 1 1-40 0z" fill="#e7d49d" fillOpacity={.14 + p * .22} stroke="#e7d49d" strokeOpacity=".62" />
        <path d="M482 118h51v48h-51z" fill="#d8c89c" fillOpacity=".12" stroke="#d8c89c" strokeOpacity=".62" />
        <path d="M482 133h51M482 148h38" stroke="#eee4ca" strokeOpacity=".58" strokeWidth="2" strokeLinecap="round" />
        <circle cx="236" cy="188" r={4 + p * 2} fill="#e7d49d" opacity={.35 + p * .6} />
        <circle cx="372" cy="188" r={4 + p * 2} fill="#e7d49d" opacity={.35 + p * .6} />
        <circle cx="508" cy="188" r={4 + p * 2} fill="#e7d49d" opacity={.35 + p * .6} />
      </>
    ),
  },
};

export default function UrgeActionVisual({ move, progress = 0, status = "idle" }) {
  const scene = SCENES[move?.id] || SCENES["create-distance"];
  const progressValue = Math.max(0, Math.min(1, progress));
  const cueShare = move ? move.cue.length / (move.cue.length + move.purpose.length) : 0.5;
  const actionProgress = status === "finished" ? 1 : Math.min(1, progressValue / Math.max(cueShare, 0.01));
  const phase = status === "playing"
    ? progressValue < cueShare ? "Follow the suggested action" : "Hear why this may help"
    : status === "paused" ? "Your place is held"
      : status === "finished" ? "Take the next step at your pace"
        : status === "preparing" ? "Getting the spoken guide ready" : "An illustration of the action you chose";

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d8c89c]/20 bg-[#0b1216] shadow-[0_18px_48px_rgba(0,0,0,.24)]">
      <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-4 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#c3d5ca]/65">The action, in view</p>
          <p className="mt-1 max-w-2xl text-sm font-medium leading-snug text-white/90 sm:text-base">{move.visualPrompt}</p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[.035] px-2.5 py-1 text-[10px] text-white/55">
          {status === "playing" ? `${Math.round(progressValue * 100)}%` : status === "paused" ? "Paused" : status === "finished" ? "Complete" : status === "preparing" ? "Starting" : "Ready"}
        </span>
      </div>
      <div className="px-3 pb-3 pt-2 sm:px-4">
        <svg
          viewBox="0 0 720 260"
          className="block h-auto max-h-[19rem] w-full rounded-xl"
          role="img"
          aria-label={`${scene.label} ${phase}.`}
        >
          <defs>
            <linearGradient id="scene-bg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#192523" /><stop offset=".55" stopColor="#111a1d" /><stop offset="1" stopColor="#0b1116" /></linearGradient>
            <radialGradient id="scene-glow"><stop stopColor="#b4c7b6" stopOpacity=".2" /><stop offset="1" stopColor="#b4c7b6" stopOpacity="0" /></radialGradient>
            <radialGradient id="floor-glow"><stop stopColor="#d7c89e" stopOpacity=".2" /><stop offset="1" stopColor="#d7c89e" stopOpacity="0" /></radialGradient>
            <linearGradient id="door-light" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b1c4ad" stopOpacity=".42" /><stop offset="1" stopColor="#4b6659" stopOpacity=".12" /></linearGradient>
            <linearGradient id="door-face" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#34463d" /><stop offset="1" stopColor="#17211f" /></linearGradient>
            <radialGradient id="soft-orb"><stop stopColor="#b4c7b6" stopOpacity=".34" /><stop offset="1" stopColor="#b4c7b6" stopOpacity=".06" /></radialGradient>
            <linearGradient id="phone-shell" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#47544b" /><stop offset="1" stopColor="#11191b" /></linearGradient>
            <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e5dcc3" stopOpacity=".95" /><stop offset="1" stopColor="#adbaa9" stopOpacity=".86" /></linearGradient>
            <linearGradient id="pen" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#dfd3af" /><stop offset="1" stopColor="#829b8e" /></linearGradient>
            <linearGradient id="need-card" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a7c4ae" stopOpacity=".16" /><stop offset="1" stopColor="#d8c89c" stopOpacity=".035" /></linearGradient>
            <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#b8d2c4" stopOpacity=".72" /><stop offset="1" stopColor="#719c8c" stopOpacity=".48" /></linearGradient>
          </defs>
          <rect width="720" height="260" rx="18" fill="url(#scene-bg)" />
          <ellipse cx="360" cy="105" rx="310" ry="180" fill="url(#scene-glow)" />
          <path d="M0 223c125-13 235-8 360 0s235 13 360 0v37H0z" fill="#0b1114" fillOpacity=".56" />
          <path d="M0 223c125-13 235-8 360 0s235 13 360 0" fill="none" stroke="#d8c89c" strokeOpacity=".12" />
          {scene.art(actionProgress)}
        </svg>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-white/[.07] px-4 py-2.5 sm:px-5">
        <span className="text-[10px] font-medium text-[#d7e4db]/70">{phase}</span>
        <div className="h-1 w-24 shrink-0 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div className="h-full rounded-full bg-[#d8c89c] transition-[width] duration-100 ease-linear" style={{ width: `${progressValue * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
