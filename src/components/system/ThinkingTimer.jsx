import React, { useState } from "react";

const formatElapsed = (ms) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${seconds}s`;
};

export default function ThinkingTimer({startMs,doneMs}) {
  const [renderedAt] = useState(() => Date.now());
  const start = Number(startMs);
  const end = Number(doneMs);
  const elapsed = Number.isFinite(start) && start > 0
    ? (Number.isFinite(end) && end > 0 ? end : renderedAt) - start
    : 0;

  return (
    <span className="text-[11px] text-white/50">
      {`Thought for ${formatElapsed(elapsed)}`}
    </span>
  );
}
