import React, { useEffect, useMemo, useState } from "react";

const fmt = (ms) => {
  const s=Math.max(0,ms)/1000;
  return s.toFixed(s<10 ? 1 : 0);
};

export default function ThinkingTimer({startMs,doneMs}) {
  const [now,setNow]=useState(() => Date.now());
  const start=startMs || Date.now();

  useEffect(() => {
    if(doneMs) return;
    const id=setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [doneMs]);

  const elapsed=useMemo(() => {
    const end=doneMs || now;
    return end-start;
  }, [doneMs, now, start]);

  return (
    <span className="text-[11px] text-white/50">
      {doneMs ? `Thought for ${fmt(elapsed)}s` : `Thinking… ${fmt(elapsed)}s`}
    </span>
  );
}
