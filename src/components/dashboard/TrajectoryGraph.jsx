// src/components/dashboard/TrajectoryGraph.jsx
// Phase 33: Emotional trajectory SVG polyline graph

import React, { useMemo } from "react";

export default function TrajectoryGraph({ messages = [] }) {
  // Extract emotional history from messages
  const emotionalHistory = useMemo(() => {
    if (!Array.isArray(messages)) return [];
    const history = [];
    messages.forEach((msg) => {
      if (msg && msg.emotion && typeof msg.emotion.intensity === "number") {
        const intensity = Math.max(0, Math.min(1, Number(msg.emotion.intensity)));
        history.push({
          intensity,
          timestamp: msg.timestamp || msg.createdAt || Date.now(),
        });
      }
    });
    // Take last 20 points
    return history.slice(-20);
  }, [messages]);

  if (emotionalHistory.length < 2) {
    return (
      <div className="rounded-2xl bg-white/3 border border-white/10 backdrop-blur-md p-4 sm:p-5">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Emotional Trajectory</p>
        <p className="text-sm text-white/60">Insufficient data to show trajectory</p>
      </div>
    );
  }

  // Graph dimensions
  const width = 100;
  const height = 60;
  const padding = 4;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Normalize data: Y-axis is inverted (1 - intensity) so higher = calmer
  const points = emotionalHistory.map((point, idx) => {
    const x = padding + (idx / (emotionalHistory.length - 1)) * graphWidth;
    const y = padding + (1 - point.intensity) * graphHeight; // Inverted: higher intensity = lower on graph
    return { x, y, intensity: point.intensity };
  });

  // Create polyline path
  const pathData = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="rounded-2xl bg-white/3 border border-white/10 backdrop-blur-md p-4 sm:p-5">
      <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Emotional Trajectory</p>
      <div className="relative" style={{ width: "100%", height: height }}>
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="amberGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(245,213,128,0.9)" />
              <stop offset="100%" stopColor="rgba(245,213,128,0.4)" />
            </linearGradient>
          </defs>

          {/* Grid lines (optional, subtle) */}
          <line
            x1={padding}
            y1={padding + graphHeight / 2}
            x2={width - padding}
            y2={padding + graphHeight / 2}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.5"
          />

          {/* Polyline */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#amberGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots on points */}
          {points.map((point, idx) => (
            <circle
              key={idx}
              cx={point.x}
              cy={point.y}
              r="2"
              fill="rgba(245,213,128,0.9)"
              className="transition-all"
            />
          ))}
        </svg>
      </div>
      <div className="flex items-center justify-between mt-2 text-[10px] text-white/50">
        <span>Earlier</span>
        <span>{emotionalHistory.length} points</span>
        <span>Recent</span>
      </div>
    </div>
  );
}
