// God-Eye diagnostics drawer - visible only when wc_debug=1
// No UI redesign; hidden by default

import React, { useState, useEffect } from "react";
import { isDebugEnabled } from "@/lib/debug";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { getResolvedFunctionsBaseUrl } from "@/services/aiClient";
import {
  getChatDiagnostics,
  subscribeChatDiagnostics,
} from "@/lib/chatDiagnostics";

export default function GodEyeDrawer() {
  const { isOnline } = useOnlineStatus();
  const [diag, setDiag] = useState(getChatDiagnostics());

  useEffect(() => {
    if (!isDebugEnabled()) return;
    const unsub = subscribeChatDiagnostics(() => {
      setDiag(getChatDiagnostics());
    });
    return unsub;
  }, []);

  if (!isDebugEnabled()) return null;

  const { url, reason, mode } = getResolvedFunctionsBaseUrl();

  return (
    <div
      className="fixed left-0 top-1/2 -translate-y-1/2 z-[9996] w-48 rounded-r border border-amber-500/30 bg-black/90 px-2 py-2 text-[10px] font-mono text-amber-300/90 pointer-events-none"
      aria-hidden="true"
    >
      <div className="font-semibold text-amber-400 mb-1">God-Eye</div>
      <div className="space-y-0.5">
        <div>isOnline: {String(isOnline)}</div>
        <div className="truncate" title={url}>BASE: {url.slice(0, 24)}…</div>
        <div>mode: {mode}</div>
        <div>lastStatus: {diag.lastStatus ?? "—"}</div>
        <div className="truncate">corrId: {diag.lastCorrelationId?.slice(0, 8) ?? "—"}</div>
        <div>toolRoute: {diag.lastToolRoute ?? "—"}</div>
        <div className="truncate" title={diag.lastError ?? ""}>
          lastErr: {(diag.lastError ?? "—").slice(0, 20)}
        </div>
      </div>
    </div>
  );
}
