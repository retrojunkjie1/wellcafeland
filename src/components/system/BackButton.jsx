// src/components/system/BackButton.jsx
// Phase 53C: Single reusable back — navigate(-1) by default, optional to

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ to, className = "" }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (to !== undefined && to !== "") {
      navigate(to);
    } else {
      navigate(-1);
    }
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/80 hover:bg-white/10 transition ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft size={12} className="mr-1" />
      Back
    </button>
  );
}
