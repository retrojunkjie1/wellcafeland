// src/os/RouteGuard.jsx
// Phase 52: Eliminate blank pages — wrap children in try/catch and guard falsy renders

import React, { Component } from "react";
import NotReady from "./NotReady";

export const RouteGuard = ({ children, routeKey, required }) => {
  const [error, setError] = React.useState(null);

  if (error) {
    return <NotReady routeKey={routeKey} onRetry={() => setError(null)} />;
  }

  try {
    const rendered = typeof children === "function" ? children() : children;
    if (rendered == null || rendered === false) {
      return <NotReady routeKey={routeKey} />;
    }
    return <ErrorBoundary routeKey={routeKey} onError={setError}>{rendered}</ErrorBoundary>;
  } catch (e) {
    return <NotReady routeKey={routeKey} />;
  }
};

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    this.props.onError?.(err);
  }

  render() {
    if (this.state.hasError) {
      return <NotReady routeKey={this.props.routeKey} onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

export default RouteGuard;
