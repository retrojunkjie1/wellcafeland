// src/components/system/ErrorBoundary.jsx
// React error boundary for graceful error handling

import React from "react";
import { logError } from "@/services/logService";
import { Home, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * User-friendly error fallback UI
 */
function ErrorFallback({ onReset }) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-medium text-white">Something went wrong</h1>
          <p className="text-base text-white/70 leading-relaxed">
            We encountered an unexpected error on this screen. Your data is safe, and you can continue using WellnessCafe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <button
            type="button"
            onClick={() => {
              navigate("/");
              onReset();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-wcGold px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-amber-300 transition"
          >
            <Home className="h-4 w-4" />
            Go Home
          </button>
        </div>

        <p className="text-xs text-white/40">
          If this keeps happening, please contact support.
        </p>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to our logging service
    logError("ErrorBoundary", error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || "Unknown",
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

