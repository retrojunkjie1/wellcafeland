// src/components/os/WelcomeScreen.jsx
// Welcome screen shown before conversation starts — clinically-guided luxury pathway layout

import React from "react";
import { useNavigate } from "react-router-dom";
import { useOSStore } from "@/stores/useOSStore";
import Logo from "@/components/Logo";
import PrimaryPathways from "@/apps/home/components/PrimaryPathways";

const WelcomeScreen = ({ onAction }) => {
  const navigate = useNavigate();
  const { messages } = useOSStore();
  const hasStarted = messages.length > 1; // More than welcome message

  if (hasStarted) return null;

  const handlePathwayClick = (pathwayId) => {
    if (pathwayId === "process") {
      onAction?.("I want to talk this through. Please start with one simple question and let me choose what kind of help I want.");
      return;
    }
    if (pathwayId === "real-help") {
      navigate("/assistance");
      return;
    }
    navigate(`/session/${pathwayId}`);
  };

  return (
    <div className="flex min-h-full items-center justify-center px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/30 bg-gradient-to-br from-[#fffaf1] via-[#f7f7f5] to-[#edf5f4] px-4 py-6 shadow-[0_24px_90px_rgba(0,0,0,0.22)] sm:px-8 sm:py-8">
        <div className="flex flex-col items-center text-center">
          <Logo size="md" showText={true} />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">A place to start</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            What would help most right now?
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Pick one. You can change direction whenever you want.</p>
        </div>

        <div className="mt-6 sm:mt-7">
          <PrimaryPathways onPathwayClick={handlePathwayClick} />
        </div>

        <div className="mt-5 flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3">
          <span className="text-sm text-slate-600">Not sure?</span>
          <button
            type="button"
            onClick={() => onAction?.("I'm not sure what I need. Help me choose by asking one short question at a time.")}
            className="min-h-11 rounded-full px-4 text-sm font-semibold text-slate-800 underline decoration-slate-400 underline-offset-4 hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-700"
          >
            Help me choose
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
