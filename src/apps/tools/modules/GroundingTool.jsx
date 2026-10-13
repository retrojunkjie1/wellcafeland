// A brief, choice-led orientation pause. The selected anchor stays in local UI state.

import React, { useCallback, useRef, useState } from "react";
import { ArrowLeft, Check, DoorOpen, Eye, Hand, Headphones, Leaf, Pause, Play, RotateCcw, Square, Volume2, X } from "lucide-react";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";
import ToolCharacterGuide from "@/components/tools/ToolCharacterGuide";
import { useNaturalVoice } from "@/hooks/useNaturalVoice";
import GroundingPanorama from "./GroundingPanorama";
import "./GroundingTool.css";

const ORIENTATION_CHOICES = [
  {
    id: "steady-view",
    title: "Look",
    short: "Find one steady detail",
    cue: "Let your eyes rest on one steady thing nearby. No need to name it.",
    guidance: "Notice one color, edge, or patch of light. Let your eyes rest there without trying to study it. If your attention wanders, that is okay; gently return to the detail in front of you. Stay for a few moments, or move on whenever you are ready.",
    Icon: Eye,
  },
  {
    id: "familiar-sound",
    title: "Listen",
    short: "A familiar sound—or quiet",
    cue: "Notice one familiar sound around you, or let the quiet be enough.",
    guidance: "You do not need to identify the sound or find its source. Let it come and go in its own way. If a thought pulls you away, gently return to the sound—or to the quiet. You can stop whenever you want.",
    Icon: Headphones,
  },
  {
    id: "texture",
    title: "Touch",
    short: "Hold a familiar object",
    cue: "If it feels comfortable, hold a familiar object and notice its weight or texture.",
    guidance: "Choose something that feels okay to touch, or simply look at it instead. Notice one simple detail, such as its shape or weight. There is nothing to report or get right. You can set it down at any time.",
    Icon: Hand,
  },
  {
    id: "orientation",
    title: "Adjust your space",
    short: "Make one small change—or none",
    cue: "You could soften the light, change the sound, or shift where you sit. Staying as you are is also okay.",
    guidance: "Choose just one small change if you want to. Notice whether the space feels more workable, or leave everything as it is. You are in charge of what happens next.",
    Icon: DoorOpen,
  },
];

const GroundingTool = ({ onComplete, onCancel, isEmbedded = false }) => {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [phase, setPhase] = useState("choose");
  const startedAtRef = useRef(null);
  const completedRef = useRef(false);
  const voice = useNaturalVoice("marin");
  const isSpeaking = voice.status === "playing";
  const isPreparing = voice.status === "preparing";
  const isVoicePaused = voice.status === "paused";
  const isVoiceUnavailable = voice.status === "unavailable";
  const cueProgress = Math.max(0, Math.min(1, voice.playbackProgress || 0));

  const finishPractice = useCallback(() => {
    if (completedRef.current) return;
    voice.stop();
    completedRef.current = true;

    const completedAt = Date.now();
    const startedAt = startedAtRef.current || completedAt;
    const durationSeconds = Math.max(0, Math.floor((completedAt - startedAt) / 1000));
    const result = createToolResult(
      "grounding_54321",
      "Reconnect with the room",
      "Completed an optional present-moment orientation pause.",
      { practiceType: "choice-led-orientation" },
      durationSeconds,
    );

    // Record completion and duration only; never send the chosen anchor or reflections.
    logToolUsage("grounding_54321", {
      startedAt,
      completedAt,
      durationMs: completedAt - startedAt,
      context: { completed: true },
    }).catch((err) => console.warn("Tool telemetry failed:", err));

    setPhase("complete");
    safeComplete(onComplete, result);
  }, [onComplete, voice.stop]);

  const beginPause = () => {
    if (!activeChoice) return;
    completedRef.current = false;
    startedAtRef.current = Date.now();
    setPhase("active");
    void voice.play(`${activeChoice.cue} ${activeChoice.guidance}`);
  };

  const tryAnotherAnchor = () => {
    voice.stop();
    completedRef.current = false;
    startedAtRef.current = null;
    setSelectedChoice(null);
    setPhase("choose");
  };

  const changeChoice = () => {
    voice.stop();
    setPhase("choose");
  };
  const handleCancel = useCallback(() => {
    voice.stop();
    safeCancel(onCancel);
  }, [onCancel, voice.stop]);
  const playActiveCue = () => {
    if (activeChoice) void voice.play(`${activeChoice.cue} ${activeChoice.guidance}`);
  };
  const activeChoice = ORIENTATION_CHOICES.find(({ id }) => id === selectedChoice);
  const isActive = phase === "active";
  const isComplete = phase === "complete";

  return (
    <div className="grounding-practice">
      {!isEmbedded && onCancel && (
        <div className="grounding-practice__topline">
          <span className="grounding-practice__eyebrow"><Leaf aria-hidden="true" /> ORIENT</span>
          <button type="button" onClick={handleCancel} aria-label="Close practice" className="grounding-practice__icon-button">
            <X aria-hidden="true" />
          </button>
        </div>
      )}

      <header className="grounding-practice__heading">
        <div>
          <p className="grounding-practice__kicker">A MOMENT TO RECONNECT</p>
          <h2>Come back to the room</h2>
        </div>
        <p className="grounding-practice__subhead">Choose what feels easiest. You can stop at any time.</p>
      </header>

      <div className={`grounding-practice__layout ${isActive ? "is-active" : ""}`}>
        <section className="grounding-practice__scene-column" aria-label="Optional visual reference">
          <GroundingPanorama />
          <p className="grounding-practice__scene-footnote">You can use this scene, or follow the same cue in your own space.</p>
        </section>

        <section className="grounding-practice__guide" aria-live="polite">
          {(isSpeaking || isPreparing || isVoicePaused) && <ToolCharacterGuide compact mood={isSpeaking ? "encouraging" : "listening"} speaking={isSpeaking} speakingProgress={voice.playbackProgress} message="I’m here while you listen." context="The spoken cue follows the visual guide. Nothing to get right." />}
          {phase === "choose" && (
            <>
              <div className="grounding-practice__guide-head">
                <span className="grounding-practice__step">01 <i /> CHOOSE AN ANCHOR</span>
                <h3>What feels easiest?</h3>
              </div>
              <div className="grounding-practice__choices" role="group" aria-label="Choose a grounding cue">
                {ORIENTATION_CHOICES.map((choice) => {
                  const { id, title, short } = choice;
                  const ChoiceIcon = choice.Icon;
                  const isSelected = selectedChoice === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => { voice.stop(); setSelectedChoice(id); }}
                      className={`grounding-practice__choice ${isSelected ? "is-selected" : ""}`}
                    >
                      <span className="grounding-practice__choice-icon"><ChoiceIcon aria-hidden="true" /></span>
                      <span className="grounding-practice__choice-copy">
                        <span className="grounding-practice__choice-title">{title}</span>
                        <span className="grounding-practice__choice-hint">{short}</span>
                      </span>
                      <span className="grounding-practice__choice-check" aria-hidden="true">{isSelected && <Check />}</span>
                    </button>
                  );
                })}
              </div>
              {activeChoice ? (
                <div className="grounding-practice__selected-cue">
                  <span className="grounding-practice__step">YOUR CUE</span>
                  <p>{activeChoice.cue}</p>
                  <button type="button" onClick={beginPause} className="grounding-practice__primary">
                    Begin this pause <span aria-hidden="true">→</span>
                  </button>
                </div>
              ) : (
                <p className="grounding-practice__gentle-note">Nothing to get right. Choose one, or leave the practice.</p>
              )}
            </>
          )}

          {isActive && activeChoice && (
            <>
              <div className="grounding-practice__guide-head">
                <span className="grounding-practice__step">02 <i /> YOUR MOMENT</span>
                <span className="grounding-practice__active-dot" aria-label="Practice active" />
              </div>
              <div className="grounding-practice__active-cue">
                <span className="grounding-practice__choice-icon is-large"><activeChoice.Icon aria-hidden="true" /></span>
                <h3>{activeChoice.title}</h3>
                <p>{activeChoice.cue}</p>
                <p className="grounding-practice__active-guidance">{activeChoice.guidance}</p>
                {isSpeaking && <div className="grounding-practice__voice-progress" role="progressbar" aria-label="Spoken grounding guidance progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(cueProgress * 100)}><span style={{ width: `${cueProgress * 100}%` }} /></div>}
                <div className="grounding-practice__voice-status" role={isVoiceUnavailable ? "alert" : "status"} aria-live="polite">
                  {isVoiceUnavailable ? voice.error || "The spoken guide could not play. You can read the cue or try again." : isPreparing ? "Preparing spoken guidance…" : isSpeaking ? "Spoken guidance is playing." : isVoicePaused ? "Spoken guidance is paused." : voice.status === "finished" ? "Guidance complete. Stay with the scene or replay the cue." : "Spoken guidance starts with this pause."}
                </div>
              </div>
              <div className="grounding-practice__active-actions">
                <div className="grounding-practice__voice-actions">
                  <button type="button" onClick={() => isSpeaking ? void voice.pause() : isVoicePaused ? void voice.resume() : playActiveCue()} disabled={isPreparing} className="grounding-practice__voice-control">
                    {isPreparing ? <Volume2 aria-hidden="true" /> : isSpeaking ? <Pause aria-hidden="true" /> : isVoicePaused ? <Play aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
                    {isPreparing ? "Preparing…" : isSpeaking ? "Pause voice" : isVoicePaused ? "Resume voice" : voice.status === "finished" ? "Replay cue" : "Play cue"}
                  </button>
                  {(isSpeaking || isVoicePaused || isPreparing) && <button type="button" onClick={voice.stop} className="grounding-practice__voice-control grounding-practice__voice-control--quiet"><Square aria-hidden="true" /> Stop voice</button>}
                </div>
                <button type="button" onClick={finishPractice} className="grounding-practice__primary">Finish pause <span aria-hidden="true">→</span></button>
                <button type="button" onClick={changeChoice} className="grounding-practice__text-button"><ArrowLeft aria-hidden="true" /> Choose another</button>
              </div>
            </>
          )}

          {isComplete && (
            <div className="grounding-practice__complete">
              <span className="grounding-practice__complete-mark"><Check aria-hidden="true" /></span>
              <span className="grounding-practice__step">PAUSE COMPLETE</span>
              <h3>You made a moment for yourself.</h3>
              <p>No score or particular feeling is expected.</p>
              <button type="button" onClick={tryAnotherAnchor} className="grounding-practice__text-button"><RotateCcw aria-hidden="true" /> Try another cue</button>
            </div>
          )}
        </section>
      </div>

      {onCancel && !isComplete && (
        <button type="button" onClick={handleCancel} className="grounding-practice__leave">Leave practice</button>
      )}
    </div>
  );
};

export default GroundingTool;
