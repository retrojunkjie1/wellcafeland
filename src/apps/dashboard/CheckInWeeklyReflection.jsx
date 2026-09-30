import React from "react";
import { Award, Heart, Sparkles } from "lucide-react";
import { summarizeCheckIns } from "./checkInProgress";

function countLabel(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatRating(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function CheckInWeeklyReflection({ checkIns, now = new Date(), onStartCheckIn, emptyNote = "" }) {
  const summary = summarizeCheckIns(checkIns, now);
  const hasHistory = checkIns.length > 0;

  return (
    <section aria-labelledby="weekly-reflection-title" className="overflow-hidden rounded-3xl border border-amber-200/15 bg-gradient-to-br from-amber-100/[0.07] via-white/[0.035] to-emerald-100/[0.04] p-4 shadow-lg shadow-black/10 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="rounded-xl border border-amber-200/15 bg-amber-100/[0.07] p-2.5 text-amber-100"><Sparkles aria-hidden="true" className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <h3 id="weekly-reflection-title" className="text-base font-semibold text-white">Your week</h3>
          <p className="mt-1 text-sm text-white/55">A reflection from the check-ins you chose to save.</p>
        </div>
      </div>

      {!hasHistory ? (
        <>
          <p className="mt-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm leading-relaxed text-white/70">
            No check-ins are saved yet. You can start whenever you want; a gap does not erase your progress.
          </p>
          {emptyNote && <p className="mt-2 text-xs leading-relaxed text-white/50">{emptyNote}</p>}
          {onStartCheckIn && <button type="button" onClick={onStartCheckIn} className="mt-3 min-h-11 rounded-full bg-amber-200 px-5 text-sm font-semibold text-slate-950 hover:bg-amber-100">Start a check-in</button>}
        </>
      ) : summary.weekCheckInCount === 0 ? (
        <p className="mt-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm leading-relaxed text-white/70">
          No check-ins recorded this week. You can begin again any time. Nothing is lost by taking a break.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            You checked in {countLabel(summary.weekCheckInCount, "time")} this week.
            {summary.skillEntries > 0 && ` You named a skill or strategy in ${countLabel(summary.skillEntries, "check-in")}.`}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
              <Heart aria-hidden="true" className="h-4 w-4 text-rose-200/80" />
              <p className="mt-2 text-xl font-semibold text-white">{summary.gratitudeEntries}</p>
              <p className="text-xs leading-snug text-white/55">gratitude {summary.gratitudeEntries === 1 ? "note" : "notes"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
              <Sparkles aria-hidden="true" className="h-4 w-4 text-amber-100/80" />
              <p className="mt-2 text-xl font-semibold text-white">{summary.skillEntries}</p>
              <p className="text-xs leading-snug text-white/55">check-ins with a skill named</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/10 bg-black/10 p-3 sm:col-span-1">
              <Award aria-hidden="true" className="h-4 w-4 text-emerald-100/80" />
              <p className="mt-2 text-xl font-semibold text-white">{summary.plannedSupportEntries}</p>
              <p className="text-xs leading-snug text-white/55">times you noted a plan or support</p>
            </div>
          </div>
          {summary.moodCount > 0 && <p className="mt-3 text-sm leading-relaxed text-white/65">
            Your check-ins used these mood words: {summary.moodChoices.map(({ mood, count }) => `${mood[0].toUpperCase()}${mood.slice(1)} (${count})`).join(" · ")}.
          </p>}
        </>
      )}

      {hasHistory && summary.weekCheckInCount > 0 && (
        (summary.cravingYesCount > 0 || summary.cravingRating || summary.triggerYesCount > 0 || summary.triggerRating || summary.supportChoices.length > 0)
      ) && <details className="mt-4 border-t border-white/10 pt-3">
        <summary className="min-h-10 cursor-pointer py-2 text-sm text-white/70 hover:text-white/90">See patterns you chose to share</summary>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed text-white/75">
          {summary.cravingYesCount > 0 && <li>You marked a craving in {countLabel(summary.cravingYesCount, "check-in")}.</li>}
          {summary.cravingRating && <li>Your self-rated craving intensity averaged {formatRating(summary.cravingRating.average)}/10 across {countLabel(summary.cravingRating.count, "rating")}.</li>}
          {summary.triggerYesCount > 0 && <li>You marked a trigger in {countLabel(summary.triggerYesCount, "check-in")}.</li>}
          {summary.triggerRating && <li>Your self-rated trigger intensity averaged {formatRating(summary.triggerRating.average)}/10 across {countLabel(summary.triggerRating.count, "rating")}.</li>}
          {summary.supportChoices.map(({ choice, count }) => <li key={choice}>You chose “{choice}” as useful support in {countLabel(count, "check-in")}.</li>)}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-white/50">These counts and averages reflect the answers you selected. They are not a diagnosis, prediction, or clinical rating.</p>
      </details>}

      {summary.recoveryMarker && <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200/20 bg-emerald-100/[0.05] p-3.5">
        <Award aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-100" />
        <p className="text-sm leading-relaxed text-emerald-50/85">
          You recorded {summary.recoveryMarker.recordedDays} sober / clean days in a check-in{summary.recoveryMarker.date ? ` on ${summary.recoveryMarker.date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}` : ""}. That includes the {summary.recoveryMarker.days}-day marker. This honors what you chose to record; your progress is yours to define.
        </p>
      </div>}

      <details className="mt-4 border-t border-white/10 pt-3">
        <summary className="min-h-10 cursor-pointer py-2 text-sm text-white/60 hover:text-white/85">How this reflection works</summary>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-white/50">
          Calculated here from saved dates, selected moods, numbers, and check-in choices. It counts whether you added a skill or gratitude note, but does not interpret their words or analyze your journal. It does not use Guide chats, diagnose you, predict relapse, or train an AI model. The summary is not sent to a practitioner; sharing stays under your control.
        </p>
      </details>
    </section>
  );
}
