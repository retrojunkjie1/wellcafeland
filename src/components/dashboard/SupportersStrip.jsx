// src/components/dashboard/SupportersStrip.jsx
// Supporters/donors strip (scaffold only)

import React, { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { listSupporters } from "@/services/supportersService";

const SupportersStrip = () => {
  const [supporters, setSupporters] = useState([]);

  const loadSupporters = useCallback(async () => {
    try {
      const data = await listSupporters();
      setSupporters(data);
    } catch (err) {
      console.error("Failed to load supporters:", err);
    }
  }, []);

  useEffect(() => {
    loadSupporters();
  }, [loadSupporters]);

  if (supporters.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Heart className="h-4 w-4 text-white/40" />
        <p className="text-xs text-white/60">This space is made possible by</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {supporters.slice(0, 5).map((supporter) => (
          <div
            key={supporter.id}
            className="text-xs text-white/70"
          >
            {supporter.website ? (
              <a
                href={supporter.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                {supporter.name}
              </a>
            ) : (
              <span>{supporter.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportersStrip;

