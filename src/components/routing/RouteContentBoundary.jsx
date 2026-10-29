import React from "react";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { needsPageReload } from "@/components/ErrorBoundary";

/**
 * Keeps a single route failure inside the shared WellnessCafe shell so the
 * person can recover or move to another screen without losing navigation.
 */
export default class RouteContentBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, retryKey: 0 };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(previousProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null, retryKey: this.state.retryKey + 1 });
    }
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error("[RouteContentBoundary] Screen could not open:", error, errorInfo);
    }
  }

  retry = () => {
    if (needsPageReload(this.state.error)) {
      window.location.reload();
      return;
    }
    this.setState((state) => ({ error: null, retryKey: state.retryKey + 1 }));
  };

  render() {
    if (!this.state.error) {
      return <React.Fragment key={this.state.retryKey}>{this.props.children}</React.Fragment>;
    }

    const reloadRequired = needsPageReload(this.state.error);
    return (
      <section
        className="mx-auto flex min-h-[45vh] max-w-3xl items-center justify-center px-4 py-10"
        role="alert"
        aria-labelledby="screen-recovery-title"
      >
        <div className="lux-card w-full space-y-5 p-6 text-center sm:p-8">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-300" aria-hidden="true" />
          <div className="space-y-2">
            <h1 id="screen-recovery-title" className="text-xl font-semibold text-foreground">
              This screen couldn’t open
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your WellnessCafe space is still here. You can try this screen again or continue to another page.
            </p>
          </div>
          {import.meta.env.DEV && (
            <details className="rounded-xl border border-white/10 p-3 text-left text-xs text-muted-foreground">
              <summary className="cursor-pointer">Developer details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words">{String(this.state.error?.message || this.state.error)}</pre>
            </details>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.retry}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/30 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-foreground/10"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {reloadRequired ? "Reload this screen" : "Try this screen again"}
            </button>
            <a
              href="/home"
              className="inline-flex items-center gap-2 rounded-full bg-wcGold px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Go to Home
            </a>
            <a href="/support" className="rounded-full px-4 py-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Get support
            </a>
          </div>
        </div>
      </section>
    );
  }
}
