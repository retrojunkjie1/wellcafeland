// src/components/dashboard/TrajectoryGraph.jsx
// Simple SVG line graph showing emotional intensity over last 20 messages

import React, { useMemo } from "react";

export default function TrajectoryGraph({ messages }) {
  const dataPoints = useMemo(() => {
    if (!Array.isArray(messages)) return [];
    
    // Get last 20 messages with trajectory data
    const messagesWithTrajectory = messages
      .filter((msg) => msg.trajectory && typeof msg.trajectory.drift?.rate === "number")
      .slice(-20);
    
    if (messagesWithTrajectory.length === 0) return [];
    
    // Extract intensity from trajectory or emotion
    return messagesWithTrajectory.map((msg, idx) => {
      const intensity = msg.emotion?.intensity || 
                        (msg.trajectory?.drift?.rate || 0) || 
                        0;
      return {
        x: idx,
        y: Math.max(0, Math.min(1, intensity)),
      };
    });
  }, [messages]);

  if (dataPoints.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Emotional Trajectory</p>
            <p className="text-sm text-white/60">No trajectory data yet</p>
          </div>
        </div>
      </div>
    );
  }

  const width = 400;
  const height = 120;
  const padding = 20;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Scale points to graph coordinates
  const points = dataPoints.map((point, idx) => {
    const x = padding + (point.x / (dataPoints.length - 1 || 1)) * graphWidth;
    const y = padding + graphHeight - point.y * graphHeight;
    return { x, y };
  });

  // Create SVG path
  const pathData = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + 
      points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ")
    : "";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/40 uppercase tracking-wider">Emotional Trajectory</p>
          <span className="text-xs text-white/50">Last {dataPoints.length} messages</span>
        </div>
        <div className="w-full overflow-x-auto">
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto"
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((val) => {
              const y = padding + graphHeight - val * graphHeight;
              return (
                <line
                  key={val}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                />
              );
            })}
            {/* Path */}
            {pathData && (
              <path
                d={pathData}
                fill="none"
                stroke="rgba(251, 191, 36, 0.6)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Points */}
            {points.map((point, idx) => (
              <circle
                key={idx}
                cx={point.x}
                cy={point.y}
                r="3"
                fill="rgba(251, 191, 36, 0.8)"
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

