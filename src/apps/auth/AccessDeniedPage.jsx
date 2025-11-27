// src/apps/auth/AccessDeniedPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tryUnlockAdmin, hasAdminSession } from "../../services/adminAccess";
import { Lock } from "lucide-react";

const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const [attempting, setAttempting] = useState(false);
  const [unlockKey, setUnlockKey] = useState("");
  const [error, setError] = useState("");

  const handleTryAccess = async (e) => {
    e?.preventDefault();
    setAttempting(true);
    setError("");
    
    const result = tryUnlockAdmin(unlockKey);
    setAttempting(false);
    
    if (result.ok && hasAdminSession()) {
      // Reload to show admin panel
      window.location.reload();
    } else {
      setError(result.message || "That key didn't work.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="lux-shell py-16 text-center max-w-md mx-auto space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full border-2 border-border bg-muted/40 p-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Access Restricted
          </h1>
          <p className="text-sm text-muted-foreground">
            This area is restricted. Please contact your system administrator.
          </p>
        </div>

        <form onSubmit={handleTryAccess} className="pt-4 space-y-3">
          <div className="space-y-1">
            <input
              type="password"
              value={unlockKey}
              onChange={(e) => setUnlockKey(e.target.value)}
              placeholder="Enter admin key"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {error && (
              <p className="text-xs text-destructive mt-1">{error}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={attempting || !unlockKey.trim()}
            className="w-full inline-flex items-center justify-center rounded-full border border-foreground px-5 py-2 text-sm font-medium hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
          >
            {attempting ? "Validating..." : "Enter Admin Key"}
          </button>
        </form>
          
        <button
          type="button"
          onClick={() => navigate("/")}
          className="block w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Return to Home
        </button>

        <p className="text-[11px] text-muted-foreground pt-4 border-t border-border">
          If you believe you should have access, please contact the system administrator.
        </p>
      </div>
    </div>
  );
};

export default AccessDeniedPage;

