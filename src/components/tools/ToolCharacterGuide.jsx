import React from "react";
import { Heart } from "lucide-react";
import "./ToolCharacterGuide.css";
import { CANONICAL_TOOL_GUIDE_FACE } from "./toolCharacterIdentity";

const MOOD_LABELS = {
  present: "Here with you",
  listening: "Listening",
  considering: "Thinking it through",
  encouraging: "One step at a time",
  resting: "A quiet moment",
};
// One canonical portrait prevents the guide's identity from shifting between
// moods. The copy, halo, and voice state communicate the moment around her.
const GUIDE_EXPRESSIONS = Object.fromEntries(
  Object.keys(MOOD_LABELS).map((mood) => [mood, CANONICAL_TOOL_GUIDE_FACE]),
);

/** Shared living guide for tools. Its visual motion is decorative and never
 * indicates a clinical measurement or an inferred user emotion. */
export default function ToolCharacterGuide({
  mood = "present",
  message = "We can take this one moment at a time.",
  context = "You can pause or change direction whenever you want.",
  compact = false,
  speaking = false,
  speakingProgress,
  actionLabel,
  onAction,
  portraitActionLabel,
  onPortraitAction,
  messageActionLabel,
  onMessageAction,
  flipContent,
  flipped = false,
  onFlip,
}) {
  const safeMood = MOOD_LABELS[mood] ? mood : "present";
  const hasProgress = speaking && Number.isFinite(speakingProgress);
  const progress = hasProgress ? Math.max(0, Math.min(1, speakingProgress)) : 0;

  return (
    <section className={`wc-guide wc-guide--${safeMood}${compact ? " wc-guide--compact" : ""}${speaking ? " wc-guide--speaking" : ""}${flipContent ? " wc-guide--flip-card" : ""}`} aria-label="Your visual guide">
      <div className={`wc-guide__portrait${onPortraitAction || onFlip ? " wc-guide__portrait--interactive" : ""}`}>
        <div className="wc-guide__halo" />
        {onFlip || onPortraitAction ? (
          <button type="button" className="wc-guide__portrait-button" onClick={onFlip || onPortraitAction} aria-label={onFlip ? (flipped ? "Show journaling guide" : "Show guide information") : portraitActionLabel} aria-expanded={onFlip ? flipped : undefined}>
            <img className="wc-guide__person" src={GUIDE_EXPRESSIONS[safeMood]} alt="" width="800" height="1200" loading="lazy" decoding="async" />
            <span className="wc-guide__portrait-action-label">{onFlip ? (flipped ? "Back to guide" : "About this guide") : portraitActionLabel}</span>
          </button>
        ) : <img className="wc-guide__person" src={GUIDE_EXPRESSIONS[safeMood]} alt="" width="800" height="1200" loading="lazy" decoding="async" />}
        {hasProgress && (
          <svg className="wc-guide__audio-progress" viewBox="0 0 44 44" role="progressbar" aria-label="Spoken guide progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <circle className="wc-guide__audio-track" cx="22" cy="22" r="19" />
            <circle className="wc-guide__audio-value" cx="22" cy="22" r="19" strokeDasharray="119.38" strokeDashoffset={`${119.38 * (1 - progress)}`} />
          </svg>
        )}
        <span className="wc-guide__presence"><i /> {MOOD_LABELS[safeMood]}</span>
      </div>
      {flipContent ? (
        <div className="wc-guide__flip-stage" aria-live="polite" aria-atomic="true">
          <div className={`wc-guide__flip-inner${flipped ? " is-flipped" : ""}`}>
            <div className="wc-guide__flip-face wc-guide__flip-front" aria-hidden={flipped}>
              <p className="wc-guide__message">{message}</p>
              <p className="wc-guide__context">{context}</p>
            </div>
            <div className="wc-guide__flip-face wc-guide__flip-back" aria-hidden={!flipped}>
              <div>
                <h3 className="wc-guide__flip-title">{flipContent.title}</h3>
                <p className="wc-guide__flip-copy">{flipContent.body}</p>
              </div>
              {flipContent.actionLabel && flipContent.onAction && (
                <button type="button" className="wc-guide__flip-action" onClick={flipContent.onAction} tabIndex={flipped ? 0 : -1}>
                  {flipContent.actionLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : <div className="wc-guide__voice" aria-live="polite" aria-atomic="true">
        {onAction ? (
          <button type="button" className="wc-guide__voice-action" onClick={onAction} aria-label={actionLabel} title={actionLabel}>
            <span className="wc-guide__voice-mark" aria-hidden="true"><Heart /></span>
            <span className="wc-guide__voice-action-label">{actionLabel}</span>
          </button>
        ) : <div className="wc-guide__voice-mark" aria-hidden="true"><Heart /></div>}
        <div className="min-w-0">
          {onMessageAction ? (
            <button type="button" className="wc-guide__message-action" onClick={onMessageAction} aria-label={messageActionLabel}>
              <span className="wc-guide__message">{message}</span>
              <span className="wc-guide__message-action-label">{messageActionLabel}</span>
            </button>
          ) : <p className="wc-guide__message">{message}</p>}
          <p className="wc-guide__context">{context}</p>
        </div>
      </div>}
    </section>
  );
}
