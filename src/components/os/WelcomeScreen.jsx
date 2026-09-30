// src/components/os/WelcomeScreen.jsx
// Welcome screen shown before conversation starts — clinically-guided luxury pathway layout

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOSStore } from "@/stores/useOSStore";
import Logo from "@/components/Logo";
import PrimaryPathways from "@/apps/home/components/PrimaryPathways";

const WelcomeScreen = ({ onAction, onContinueChat }) => {
  const navigate = useNavigate();
  const { messages } = useOSStore();
  const [showChooser, setShowChooser] = useState(false);
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
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#141C22] via-[#11171D] to-[#101A1A] px-4 py-6 shadow-[0_24px_90px_rgba(0,0,0,0.36)] sm:px-8 sm:py-8">
        <div className="flex flex-col items-center text-center">
          <Logo size="md" showText={true} />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/75">A place to start</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            What would help most right now?
          </h1>
          <p className="mt-2 text-sm text-white/70 sm:text-base">Pick one. You can change direction whenever you want.</p>
        </div>

        {showChooser ? (
          <section className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4 sm:mt-7 sm:p-5" aria-labelledby="quick-choice-heading">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/70">One small choice</p>
            <h2 id="quick-choice-heading" className="mt-2 text-xl font-semibold text-white sm:text-2xl">What feels most urgent?</h2>
            <p className="mt-1 text-sm text-white/70">Choose one. You can change direction at any time.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => navigate("/assistance")} className="min-h-14 rounded-xl border border-emerald-200/20 bg-emerald-300/10 px-4 py-3 text-left text-base font-semibold text-emerald-50 hover:bg-emerald-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-200">Food, housing, or other practical help</button>
              <button type="button" onClick={() => navigate("/session/stabilize")} className="min-h-14 rounded-xl border border-amber-200/20 bg-amber-300/10 px-4 py-3 text-left text-base font-semibold text-amber-50 hover:bg-amber-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">I need a steadier moment</button>
              <button type="button" onClick={() => navigate("/session/cravings")} className="min-h-14 rounded-xl border border-sky-200/20 bg-sky-300/10 px-4 py-3 text-left text-base font-semibold text-sky-50 hover:bg-sky-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-200">I’m dealing with an urge</button>
              <button type="button" onClick={() => { setShowChooser(false); onContinueChat?.(); }} className="min-h-14 rounded-xl border border-violet-200/20 bg-violet-300/10 px-4 py-3 text-left text-base font-semibold text-violet-50 hover:bg-violet-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-200">I want to talk or be heard</button>
            </div>
            <button type="button" onClick={() => setShowChooser(false)} className="mt-3 min-h-11 rounded-full px-3 text-sm text-white/70 underline underline-offset-4 hover:text-white">Back to the choices</button>
          </section>
        ) : (
          <>
            <div className="mt-6 sm:mt-7">
              <PrimaryPathways onPathwayClick={handlePathwayClick} />
            </div>

            <div className="mt-5 flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3">
              <span className="text-sm text-white/70">Not sure?</span>
              <button
                type="button"
                onClick={() => setShowChooser(true)}
                className="min-h-11 rounded-full px-4 text-sm font-semibold text-emerald-100 underline decoration-emerald-200/50 underline-offset-4 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-200"
              >
                Help me choose
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
