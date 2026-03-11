// src/components/system/ToolRouteBoundary.jsx
// Global "never blank" contract for /tools/* routes: error + Suspense handling

import React from "react";
import NotReadyCard from "./NotReadyCard";

/**
 * Simple class-based ErrorBoundary (no new deps).
 * On error: show NotReadyCard with Try again / Use text instead.
 */
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
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
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
        body="This tool didn’t load. You can try again or open Chat for support."
        actions={[
          { label: "Try again", onClick: () => window.location.reload() },
          { label: "Use text instead", to: "/chat" },
        ]}
      />
    </div>
  );

  return (
    <ToolErrorBoundary fallback={notReadyFallback}>
      <React.Suspense fallback={notReadyFallback}>
        {children}
      </React.Suspense>
    </ToolErrorBoundary>
  );
}
