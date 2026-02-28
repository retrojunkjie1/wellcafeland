// src/os/NotFound.jsx
// Phase 52: Calm 404 fallback

import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
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
      <h1 className="text-lg font-medium text-white/90 mb-2">Page not found.</h1>
      <p className="text-sm text-white/60 text-center max-w-sm mb-8">
        The page you are looking for does not exist or has been moved.
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
      </div>
    </div>
  );
};

export default NotFound;
