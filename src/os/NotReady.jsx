// src/os/NotReady.jsx
// Phase 52: Calm fallback when a route is not yet available

import React from "react";
import { useNavigate } from "react-router-dom";

const NotReady = ({ routeKey, onRetry }) => {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-6 py-12">
      <h1 className="text-lg font-medium text-white/90 mb-2">This space is being prepared.</h1>
      <p className="text-sm text-white/60 text-center max-w-sm mb-8">
        This page is not available yet. We are working to bring it to you soon.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={goBack}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
        >
          Go Back
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
        >
          Home
        </button>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
          >
            Try Again
          </button>
        )}
      </div>
      {routeKey && import.meta.env.DEV && (
        <p className="mt-6 text-[10px] text-white/30 font-mono">{routeKey}</p>
      )}
    </div>
  );
};

export default NotReady;
