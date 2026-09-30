// src/components/ErrorBoundary.jsx

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { trackError } from "@/telemetry/telemetry";

export function needsPageReload(error) {
  const message = String(error?.message || error || "");
  return /failed to fetch dynamically imported module|importing a module script failed|loading chunk\s+\S+\s+failed|chunkloaderror/i.test(message);
}

/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (non-blocking)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
    
    // GOD-EYE V2: Track error boundary errors
    try {
      trackError(error, {
        errorBoundary: true,
        componentStack: errorInfo.componentStack?.substring(0, 500) || null,
      });
    } catch {
      // Telemetry not critical
    }
  }

  handleReset = () => {
    if (this.props.resetOnError || needsPageReload(this.state.error)) {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const reloadRequired = this.props.resetOnError || needsPageReload(this.state.error);
      // Fallback UI
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
          <div className="max-w-md w-full lux-card p-6 space-y-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground">
              {this.props.message ||
                "We're having trouble loading this. Try refreshing the page."}
            </p>
            {this.props.showDetails && this.state.error && (
              <details className="text-left mt-4">
                <summary className="text-xs text-muted-foreground cursor-pointer mb-2">
                  Error details
                </summary>
                <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-full border border-foreground px-4 py-2 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              {reloadRequired ? "Reload page" : "Try again"}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
