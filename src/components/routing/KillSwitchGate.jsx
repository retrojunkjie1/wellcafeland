// src/components/routing/KillSwitchGate.jsx
// Route gate for kill switches

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { isRouteKilled } from "@/config/overrideEngine";

export function KillSwitchGate({ children }) {
  const location = useLocation();
  const [killed, setKilled] = useState(false);

  useEffect(() => {
    setKilled(isRouteKilled(location.pathname));
  }, [location.pathname]);

  if (killed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-lg font-semibold text-white">Temporarily Unavailable</div>
          <div className="text-sm text-white/70">
            This section is temporarily disabled for maintenance.
          </div>
        </div>
      </div>
    );
  }

  return children || null;
}

