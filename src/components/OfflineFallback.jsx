// src/components/OfflineFallback.jsx

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

/**
 * Offline Fallback Component
 * Detects offline state and shows a friendly message
 */
const OfflineFallback = ({ children, showWhenOnline = false }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check initial state (use setTimeout to avoid setState in effect)
    if (!navigator.onLine) {
      setTimeout(() => {
        setShowOfflineMessage(true);
      }, 0);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline && showOfflineMessage) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full lux-card p-6 space-y-4 text-center">
          <WifiOff className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">
            You're offline
          </h2>
          <p className="text-sm text-muted-foreground">
            We'll reconnect automatically when your connection is restored.
          </p>
          <p className="text-xs text-muted-foreground">
            Some features may be limited while offline.
          </p>
        </div>
      </div>
    );
  }

  if (showWhenOnline && isOnline) {
    return (
      <div className="fixed bottom-4 right-4 z-50 lux-card p-3 flex items-center gap-2 text-xs text-muted-foreground animate-fade-in">
        <Wifi className="h-4 w-4 text-emerald-400" />
        <span>Back online</span>
      </div>
    );
  }

  return <>{children}</>;
};

export default OfflineFallback;

