// src/components/navigation/BackButton.jsx

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NAV_ROOTS, navPopToPrev } from "@/navigation/navHistory";

export default function BackButton({ fallback = "/home", className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname;

  if (NAV_ROOTS.includes(pathname)) return null;

  const onBack = () => {
    try {
      if (window.history.length > 1) {
        navigate(-1);
        return;
      }
    } catch {
      // ignore
    }

    const prev = navPopToPrev(pathname);
    navigate(prev || fallback);
  };

  return (
    <button
      type="button"
      onClick={onBack}
      className={
        "inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition select-none " +
        className
      }
      aria-label="Go back"
    >
      <span aria-hidden="true">←</span>
      <span>Back</span>
    </button>
  );
}

