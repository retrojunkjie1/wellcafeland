// src/components/dashboard/DashboardDetailsSheet.jsx

import React from "react";
import { GentleSuggestionsStrip } from "./GentleSuggestionsStrip";



const basePanelClass =

  "fixed inset-x-0 bottom-0 z-30 mx-auto max-w-xl rounded-t-3xl border border-white/10 bg-slate-900/95 px-4 pb-6 pt-4 shadow-[0_-18px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-transform";



const DashboardDetailsSheet = ({

  detail,

  onClose,

  emotionMessage,

  riskMessage,

  humanModeMessage,

  faceMessage,

  trajectoryMessage,

  triggers,

  hasMoments,

}) => {

  if (!detail) return null;



  const { type } = detail;



  const renderTitle = () => {

    switch (type) {

      case "emotion":

        return "Emotional Snapshot";

      case "risk":

        return "Risk Signals";

      case "triggers":

        return "Trigger Domains";

      case "mode":

        return "Conversational Mode";

      case "face":

        return "Face Expression";

      case "trajectory":

        return "Emotional Trajectory";

      case "quick":

        return "Quick Tools";

      default:

        return "Details";

    }

  };



  const renderBody = () => {

    switch (type) {

      case "emotion": {

        const emo = emotionMessage?.emotion;

        if (!emo) {

          return (

            <p className="text-sm text-slate-300">

              I haven't picked up on your emotional tone yet. When you share how

              you're really doing, I'll start drawing a clearer picture here.

            </p>

          );

        }



        return (

          <div className="space-y-2 text-sm text-slate-200">

            <p>

              Right now you're reading as{" "}

              <span className="font-semibold text-amber-300">{emo.label}</span>

              .

            </p>

            <p className="text-xs text-slate-400">

              Intensity: <span className="font-semibold">{emo.intensity ?? 0}</span>

              /100 • Valence:{" "}

              <span className="font-semibold">{emo.valence ?? "balanced"}</span>

            </p>

            <p className="text-xs text-slate-400">

              This is just a reflection, not a diagnosis. If it doesn't feel

              accurate, your own description always comes first.

            </p>

          </div>

        );

      }



      case "risk": {

        const risk = riskMessage?.risk;

        if (!risk) {

          return (

            <p className="text-sm text-slate-300">

              I'm not seeing any clear risk language in what you've shared yet.

              If things ever feel heavy or unsafe, this space will highlight it

              and guide you toward support.

            </p>

          );

        }



        return (

          <div className="space-y-2 text-sm text-slate-200">

            <p>

              Current level:{" "}

              <span className="font-semibold text-amber-300">

                {risk.level ?? risk.riskLevel ?? "Unknown"}

              </span>

            </p>

            {Array.isArray(risk.reasons) && risk.reasons.length > 0 && (

              <div className="space-y-1">

                <p className="text-xs text-slate-400">Why I noticed this:</p>

                <ul className="list-disc space-y-1 pl-5 text-xs text-slate-300">

                  {risk.reasons.map((r, i) => (

                    <li key={i}>{r}</li>

                  ))}

                </ul>

              </div>

            )}

            {Array.isArray(risk.indicators) && risk.indicators.length > 0 && (

              <div className="space-y-1">

                <p className="text-xs text-slate-400">Why I noticed this:</p>

                <ul className="list-disc space-y-1 pl-5 text-xs text-slate-300">

                  {risk.indicators.map((r, i) => (

                    <li key={i}>{r}</li>

                  ))}

                </ul>

              </div>

            )}

            <p className="text-xs text-slate-400">

              This is a support signal, not a label. It exists to tilt you

              toward care, not judgment.

            </p>

          </div>

        );

      }



      case "triggers": {

        if (!triggers || triggers.length === 0) {

          return (

            <p className="text-sm text-slate-300">

              No clear trigger patterns yet. As you keep showing up, we'll start

              mapping the people, places, feelings, and situations that spike

              your distress.

            </p>

          );

        }



        return (

          <div className="space-y-2 text-sm text-slate-200">

            <p className="text-xs text-slate-400">

              These are the themes that have shown up most in recent

              conversations:

            </p>

            <div className="flex flex-wrap gap-2 pt-2">

              {triggers.map(t => (

                <span

                  key={t.label}

                  className="rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1 text-xs text-amber-100"

                >

                  {t.label} · {t.count}

                </span>

              ))}

            </div>

          </div>

        );

      }



      case "mode": {

        const mode = humanModeMessage?.humanMode || humanModeMessage || "neutral";

        const modeStr = typeof mode === "string" ? mode : mode?.mode || "neutral";

        return (

          <div className="space-y-2 text-sm text-slate-200">

            <p>

              Right now, our conversation is sitting in{" "}

              <span className="font-semibold text-amber-300">{modeStr}</span> mode.

            </p>

            <p className="text-xs text-slate-400">

              I adjust my tone based on how you're coming in — playful when

              you're joking, grounded when things are heavy, precise when you

              need clarity.

            </p>

          </div>

        );

      }



      case "face": {

        const emo = faceMessage?.emotion;

        if (!emo) {

          return (

            <p className="text-sm text-slate-300">

              Face detection is available but inactive. When you choose to use

              it, I'll reflect your expression back to you — never to judge,

              only to help you notice what your face is already saying.

            </p>

          );

        }



        return (

          <div className="space-y-2 text-sm text-slate-200">

            <p>

              Your expression looks{" "}

              <span className="font-semibold text-amber-300">{emo.label}</span>{" "}

              with an intensity around{" "}

              <span className="font-semibold">{emo.intensity ?? 0}</span>/100.

            </p>

            <p className="text-xs text-slate-400">

              This isn't a lie detector. It's a mirror to help you check in with

              yourself.

            </p>

          </div>

        );

      }



      case "trajectory": {

        if (!trajectoryMessage && !hasMoments) {

          return (

            <p className="text-sm text-slate-300">

              I need a few more check-ins before I can show you a real emotional

              trajectory. As you log moments, I'll start drawing a gentle line

              of where you've been emotionally.

            </p>

          );

        }



        return (

          <div className="space-y-2 text-sm text-slate-200">

            <p>

              This graph shows how your emotional intensity has been moving over

              time — not to grade you, but to help you see your own seasons.

            </p>

            <p className="text-xs text-slate-400">

              Spikes don't mean you're failing. They usually mean you've been

              carrying a lot alone.

            </p>

          </div>

        );

      }



      case "quick":

      default:

        return (

          <p className="text-sm text-slate-300">

            Use these tools anytime you need a quick reset — breathing, grounding,

            journaling, or exploring more support.

          </p>

        );

    }

  };



  return (

    <div className="fixed inset-0 z-30 flex items-end justify-center pointer-events-none">

      {/* Backdrop */}

      <button

        type="button"

        onClick={onClose}

        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"

      />



      {/* Sheet */}

      <div className={`${basePanelClass} pointer-events-auto`}>

        <div className="mb-3 flex items-center justify-between">

          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">

            {renderTitle()}

          </h2>

          <button

            type="button"

            onClick={onClose}

            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-slate-200 hover:bg-white/10"

          >

            ✕

          </button>

        </div>



        <div className="space-y-3">
          {renderBody()}
          
          {/* Phase 43: Gentle Suggestions */}
          {type === "quick" && <GentleSuggestionsStrip />}
        </div>

      </div>

    </div>

  );

};



export default DashboardDetailsSheet;

