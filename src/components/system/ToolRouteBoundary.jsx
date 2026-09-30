// src/components/system/ToolRouteBoundary.jsx
// Global "never blank" contract for /tools/* routes: error + Suspense handling

import React from "react";
import NotReadyCard from "./NotReadyCard";

/**
 * Simple class-based ErrorBoundary (no new deps).
 * On error: show NotReadyCard with Try again / Use text instead.
 */
const CHUNK_RECOVERY_KEY = "wc_tool_chunk_recovery_at";
const CHUNK_RECOVERY_WINDOW_MS = 60_000;

function isModuleLoadError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return /failed to fetch dynamically imported module|importing a module script failed|loading chunk\s+\d+\s+failed|failed to load module script/.test(message);
}

function reloadOnceForModuleError() {
  try {
    const previousAttempt = Number(window.sessionStorage.getItem(CHUNK_RECOVERY_KEY) || 0);
    if (previousAttempt && Date.now() - previousAttempt < CHUNK_RECOVERY_WINDOW_MS) return;
    window.sessionStorage.setItem(CHUNK_RECOVERY_KEY, String(Date.now()));
    window.location.reload();
  } catch {
    // Storage may be unavailable in a restricted browser; keep the manual retry card.
  }
}

class ToolErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error("[ToolRouteBoundary] caught error:", error, errorInfo);
    }
    // A deployment can replace a lazy-loaded chunk while an older app shell is
    // still open. Recover once automatically; the session guard prevents loops.
    if (isModuleLoadError(error) && typeof window !== "undefined") {
      reloadOnceForModuleError();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          {this.props.fallback}
          {import.meta.env.DEV && this.state.error && (
            <details className="mx-auto mt-3 max-w-2xl rounded-lg border border-amber-300/20 bg-amber-200/[0.03] p-3 text-xs text-amber-100/70">
              <summary className="cursor-pointer">Developer error detail</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words">{this.state.error.message || String(this.state.error)}</pre>
            </details>
          )}
        </>
      );
    }
    return this.props.children;
  }
}

/**
 * Wraps tool route content: catches render errors and provides Suspense fallback.
 * Never leaves the user with a blank screen.
 */
export default function ToolRouteBoundary({ children }) {

  const notReadyFallback = (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <NotReadyCard
        title="Something went wrong"
        body="This page could not open. Try reloading, or open Chat for support."
        actions={[
          { label: "Try again", onClick: () => window.location.reload() },
          { label: "Use text instead", to: "/chat" },
        ]}
      />
    </div>
  );

  const loadingFallback = (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex min-h-[40vh] max-w-xl items-center justify-center px-4 text-center text-sm text-white/60"
    >
      <span className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
        Opening your wellness space…
      </span>
    </div>
  );

  return (
    <ToolErrorBoundary fallback={notReadyFallback}>
      <React.Suspense fallback={loadingFallback}>
        {children}
      </React.Suspense>
    </ToolErrorBoundary>
  );
}
