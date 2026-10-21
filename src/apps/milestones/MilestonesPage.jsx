import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Award, ArrowRight, BookHeart, CalendarCheck2, Heart, RefreshCw, Sparkles, HandHeart } from "lucide-react";
import PageHeader from "@/components/navigation/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { GUEST_CHECKINS_STORAGE_KEY } from "@/apps/core/checkInConstants";
import { getMyCheckInMilestoneSummary } from "@/services/checkInHistory";
import { getGuestPrivatePracticeProgress, getPrivatePracticeProgress, transferGuestPracticeProgressToAccount } from "@/services/privatePracticeProgress";
import { RECOVERY_MARKERS, summarizeMilestoneProgress, SUPPORT_CHOICE_OPTIONS } from "./milestoneProgress";
import { getPracticeReturnTarget } from "@/apps/assistance/assistanceReturnPath";
import { returnFromTool } from "@/navigation/toolReturn";
import { runWellnessExperience } from "@/ai/experience/experienceEngine";
import ClientPatternReview from "./ClientPatternReview";

function readGuestCheckIns() {
  try {
    const items = JSON.parse(localStorage.getItem(GUEST_CHECKINS_STORAGE_KEY) || "[]");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function ProgressCount({ icon: Icon, label, count }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
      {React.createElement(Icon, { "aria-hidden": "true", className: "h-5 w-5 text-amber-100/80" })}
      <p className="mt-3 text-2xl font-semibold text-white">{count}</p>
      <p className="mt-1 text-sm leading-snug text-white/60">{label}</p>
    </div>
  );
}

function MarkerCard({ days, reached, isNext }) {
  return (
    <li className={`rounded-2xl border p-4 ${reached ? "border-emerald-200/25 bg-emerald-100/[0.06]" : isNext ? "border-amber-200/25 bg-amber-100/[0.05]" : "border-white/10 bg-white/[0.025]"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-lg font-semibold text-white">{days} days</span>
        {reached ? <Award aria-label="Recorded" className="h-5 w-5 text-emerald-200" /> : isNext ? <Sparkles aria-label="Next marker" className="h-5 w-5 text-amber-100" /> : null}
      </div>
      <p className={`mt-1 text-sm ${reached ? "text-emerald-100/75" : isNext ? "text-amber-100/70" : "text-white/45"}`}>
        {reached ? "You recorded this marker" : isNext ? "Next marker in your record" : "Not recorded yet"}
      </p>
    </li>
  );
}

function SupportChoices({ counts = {} }) {
  const choices = SUPPORT_CHOICE_OPTIONS
    .map((label) => ({ label, count: Number(counts[label]) || 0 }))
    .filter((choice) => choice.count > 0)
    .sort((a, b) => b.count - a.count || SUPPORT_CHOICE_OPTIONS.indexOf(a.label) - SUPPORT_CHOICE_OPTIONS.indexOf(b.label));
  const highest = Math.max(1, ...choices.map((choice) => choice.count));

  return (
    <section aria-labelledby="support-choices-title" className="mt-4 rounded-3xl border border-sky-100/15 bg-sky-100/[0.025] p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <HandHeart aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-sky-100" />
        <div className="min-w-0 flex-1">
          <h2 id="support-choices-title" className="text-lg font-semibold">Support you chose</h2>
          <p className="mt-1 text-sm leading-relaxed text-white/60">A private summary of the support options you selected in check-ins. It does not read your reflections or share this with a practitioner.</p>
        </div>
      </div>
      {choices.length ? (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {choices.map(({ label, count }) => (
            <li key={label} className="rounded-2xl border border-white/[0.08] bg-black/10 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium leading-snug text-white/85">{label}</span>
                <span className="shrink-0 rounded-full bg-sky-100/[0.08] px-2.5 py-1 text-sm font-semibold text-sky-100">{count}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]" aria-hidden="true">
                <span className="block h-full rounded-full bg-gradient-to-r from-sky-200/80 to-emerald-200/80" style={{ width: `${Math.max(8, (count / highest) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-2xl border border-white/[0.08] bg-black/10 p-4 text-sm leading-relaxed text-white/65">No support type has been selected in your saved check-ins. You can choose one next time, or leave it blank.</p>
      )}
    </section>
  );
}

export default function MilestonesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnToPractice = getPracticeReturnTarget(location.state);
  const { user, loading: authLoading } = useAuth();
  const progressScope = user && !user.isAnonymous ? `account:${user.uid}` : "guest";
  const [summaryState, setSummaryState] = useState({ scope: "", value: null });
  const [practiceState, setPracticeState] = useState({ scope: "", loading: true, error: "", value: null });
  const [guestPracticeProgress, setGuestPracticeProgress] = useState({ totalCompleted: 0, activeDaysLast7: 0 });
  const [transferringGuestProgress, setTransferringGuestProgress] = useState(false);
  const [guestTransferError, setGuestTransferError] = useState("");
  const [gardenerConsentOpen, setGardenerConsentOpen] = useState(false);
  const [gardenerLoading, setGardenerLoading] = useState(false);
  const [gardenerResponse, setGardenerResponse] = useState(null);
  const [gardenerError, setGardenerError] = useState("");
  const progressSummary = summaryState.scope === progressScope ? summaryState.value : null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestSequence = useRef(0);
  const progressScopeRef = useRef(progressScope);

  useLayoutEffect(() => {
    progressScopeRef.current = progressScope;
    requestSequence.current += 1;
    setSummaryState({ scope: progressScope, value: null });
    setPracticeState({ scope: progressScope, loading: true, error: "", value: null });
    setGuestPracticeProgress({ totalCompleted: 0, activeDaysLast7: 0 });
    setGuestTransferError("");
    setLoading(true);
    setError("");
  }, [progressScope]);

  const loadProgress = useCallback(async () => {
    const requestId = ++requestSequence.current;
    const requestScope = progressScope;
    setLoading(true);
    setPracticeState({ scope: requestScope, loading: true, error: "", value: null });
    setError("");
    try {
      const checkInPromise = user && !user.isAnonymous
        ? getMyCheckInMilestoneSummary()
        : Promise.resolve(summarizeMilestoneProgress(readGuestCheckIns()));
      const [checkInResult, practiceResult] = await Promise.allSettled([
        checkInPromise,
        getPrivatePracticeProgress(),
      ]);
      if (requestId === requestSequence.current && requestScope === progressScopeRef.current) {
        if (checkInResult.status === "fulfilled") {
          setSummaryState({ scope: requestScope, value: checkInResult.value });
        } else {
          setError(checkInResult.reason?.message || "Your check-in progress could not be loaded.");
        }
        setGuestPracticeProgress(user && !user.isAnonymous
          ? getGuestPrivatePracticeProgress()
          : { totalCompleted: 0, activeDaysLast7: 0 });
        setPracticeState(practiceResult.status === "fulfilled"
          ? { scope: requestScope, loading: false, error: "", value: practiceResult.value }
          : { scope: requestScope, loading: false, error: "Practice progress could not load.", value: null });
      }
    } catch (loadError) {
      if (requestId === requestSequence.current && requestScope === progressScopeRef.current) {
        setError(loadError?.message || "Your check-in progress could not be loaded.");
        setPracticeState({ scope: requestScope, loading: false, error: "Practice progress could not load.", value: null });
      }
    } finally {
      if (requestId === requestSequence.current && requestScope === progressScopeRef.current) setLoading(false);
    }
  }, [user, progressScope]);

  const transferGuestProgress = useCallback(async () => {
    setTransferringGuestProgress(true);
    setGuestTransferError("");
    try {
      await transferGuestPracticeProgressToAccount();
      await loadProgress();
    } catch (transferError) {
      setGuestTransferError(transferError?.message || "This device's practice count could not be added. Please try again.");
    } finally {
      setTransferringGuestProgress(false);
    }
  }, [loadProgress]);

  useEffect(() => {
    if (!authLoading) loadProgress();
  }, [authLoading, loadProgress]);

  const recordedDays = progressSummary?.highestReportedDays;
  const progress = {
    ...summarizeMilestoneProgress([]),
    ...(progressSummary || {}),
    reachedRecoveryMarkers: recordedDays === null || recordedDays === undefined
      ? []
      : RECOVERY_MARKERS.filter((days) => recordedDays >= days),
    nextRecoveryMarker: recordedDays === null || recordedDays === undefined
      ? null
      : RECOVERY_MARKERS.find((days) => recordedDays < days) || null,
  };
  const isGuest = !user || user.isAnonymous;
  const practiceProgress = practiceState.scope === progressScope ? practiceState.value : null;
  const practiceProgressLoading = authLoading || practiceState.scope !== progressScope || practiceState.loading;
  const practiceProgressError = practiceState.scope === progressScope ? practiceState.error : "";
  const completedPractices = Number(practiceProgress?.totalCompleted) || 0;
  const practiceDaysLast7 = Number(practiceProgress?.activeDaysLast7) || 0;
  const hasReflectableProgress = progress.checkInsSaved > 0 || completedPractices > 0;

  const askGardenerToReflect = async () => {
    const sharedCounts = {
      savedCheckIns: Number(progress.checkInsSaved) || 0,
      checkInsNamingASkill: Number(progress.skillCheckIns) || 0,
      gratitudeNotes: Number(progress.gratitudeCheckIns) || 0,
      plansOrSupportNotes: Number(progress.plannedSupportCheckIns) || 0,
      recoveryDaysRecorded: Number.isFinite(progress.highestReportedDays) ? progress.highestReportedDays : null,
      completedPractices,
      practiceDaysLast7,
    };
    setGardenerLoading(true);
    setGardenerError("");
    setGardenerResponse(null);
    try {
      const { result } = await runWellnessExperience("progress.reflection", { counts: sharedCounts });
      setGardenerResponse(result);
      setGardenerConsentOpen(false);
    } catch (error) {
      setGardenerError(error?.message || "The reflection could not load. You can try again when ready.");
    } finally {
      setGardenerLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 pb-10 text-white">
      <PageHeader title="Your milestones" subtitle="Progress, in the words and choices you saved" showBack={Boolean(returnToPractice)} backTo="/home" onBack={returnToPractice ? () => returnFromTool(navigate, returnToPractice) : undefined} />
      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
        <header className="mb-6 rounded-3xl border border-amber-200/15 bg-gradient-to-br from-amber-100/[0.08] via-slate-900/80 to-slate-950 p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100/75">Your path, your pace</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Every step you choose to record counts.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">These markers come from your saved check-ins. A break does not erase what you have built, and you never have to share more than you want.</p>
        </header>

        {authLoading || loading ? (
          <p role="status" className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm text-white/60">Loading your saved progress…</p>
        ) : error ? (
          <section role="alert" className="rounded-2xl border border-rose-200/20 bg-rose-100/[0.05] p-5">
            <h2 className="font-semibold text-white">Your progress could not load</h2>
            <p className="mt-2 text-sm text-white/65">Your check-ins have not been changed. Try again when you are ready.</p>
            <button type="button" onClick={loadProgress} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm text-white/85 hover:bg-white/[0.05]"><RefreshCw className="h-4 w-4" />Try again</button>
          </section>
        ) : progress.checkInsSaved === 0 ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <CalendarCheck2 aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-amber-100" />
              <div>
                <h2 className="text-lg font-semibold">Your first check-in can start this page</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/60">There is no streak to catch up on. When you save a check-in, this space can reflect the steps and recovery markers you chose to record.</p>
                {isGuest && <p className="mt-2 text-xs text-white/45">As a guest, check-ins stay in this browser on this device.</p>}
                <button type="button" onClick={() => navigate("/check-in")} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-200 px-5 text-sm font-semibold text-slate-950 hover:bg-amber-100">Start a check-in <ArrowRight className="h-4 w-4" /></button>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section aria-labelledby="recovery-marker-title" className="rounded-3xl border border-emerald-200/15 bg-emerald-100/[0.035] p-5 sm:p-7">
              <div className="flex items-start gap-3">
                <Award aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-emerald-100" />
                <div className="min-w-0 flex-1">
                  <h2 id="recovery-marker-title" className="text-lg font-semibold">Sober / clean day markers</h2>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">Based only on the numbers you chose to enter in check-ins. These are personal records, not a judgment or diagnosis.</p>
                </div>
              </div>
              {progress.highestReportedDays === null ? (
                <p className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-white/65">You have not saved a day count yet. You can leave that check-in question blank; it is always optional.</p>
              ) : (
                <>
                  <p className="mt-5 text-3xl font-semibold text-white">{progress.highestReportedDays} <span className="text-base font-medium text-white/60">days recorded</span></p>
                  <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Recovery day markers">
                    {RECOVERY_MARKERS.map((days) => <MarkerCard key={days} days={days} reached={progress.reachedRecoveryMarkers.includes(days)} isNext={progress.nextRecoveryMarker === days} />)}
                  </ul>
                  {progress.nextRecoveryMarker === null && <p className="mt-4 text-sm text-emerald-100/80">Your saved record includes the one-year marker. Take a moment to recognize that milestone.</p>}
                </>
              )}
            </section>

            <section aria-labelledby="steps-title" className="mt-4 rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <BookHeart aria-hidden="true" className="h-6 w-6 text-amber-100" />
                <div><h2 id="steps-title" className="text-lg font-semibold">The steps you have been taking</h2><p className="mt-1 text-sm text-white/55">A count of what you chose to include—not an analysis of your writing.</p></div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <ProgressCount icon={CalendarCheck2} label="saved check-ins" count={progress.checkInsSaved} />
                <ProgressCount icon={Sparkles} label="check-ins naming a skill" count={progress.skillCheckIns} />
                <ProgressCount icon={Heart} label="gratitude notes added" count={progress.gratitudeCheckIns} />
                <ProgressCount icon={ArrowRight} label="plans or support noted" count={progress.plannedSupportCheckIns} />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-white/45">Calculated from saved check-in choices and numbers. Reflection text is not analyzed for this summary. It does not infer a personality, predict relapse, or share this summary with a practitioner.</p>
            </section>

            <SupportChoices counts={progress.supportChoiceCounts} />
            {!isGuest && progress.checkInsSaved >= 3 && <ClientPatternReview key={progressScope} />}
          </>
        )}

        <section aria-labelledby="practice-progress-title" className="mt-4 rounded-3xl border border-sky-100/15 bg-gradient-to-br from-sky-100/[0.05] via-white/[0.025] to-white/[0.015] p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <Sparkles aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-sky-100" />
            <div className="min-w-0 flex-1">
              <h2 id="practice-progress-title" className="text-lg font-semibold">Practices you completed</h2>
              <p className="mt-1 text-sm leading-relaxed text-white/60">A private count of completed practices. It does not include your choices, notes, or reflections, and is not shared with practitioners.</p>
            </div>
          </div>
          {user && !user.isAnonymous && guestPracticeProgress.totalCompleted > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-amber-100/15 bg-amber-100/[0.035] p-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-amber-100/20 bg-amber-100/[0.06] text-xl font-semibold tabular-nums text-amber-100" aria-label={`${guestPracticeProgress.totalCompleted} practices saved on this device`}>
                {guestPracticeProgress.totalCompleted}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white/85">Practice count saved on this device</p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">Add this private count to your account. Only totals and practice days move.</p>
              </div>
              <button type="button" onClick={transferGuestProgress} disabled={transferringGuestProgress} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-amber-100/25 px-4 text-sm font-medium text-amber-50 transition hover:bg-amber-100/[0.07] disabled:cursor-wait disabled:opacity-60">
                {transferringGuestProgress ? "Adding…" : "Add to my account"}
              </button>
              {guestTransferError && <p role="alert" className="basis-full text-sm text-rose-100/80">{guestTransferError}</p>}
            </div>
          )}
          {practiceProgressLoading ? (
            <p role="status" className="mt-4 text-sm text-white/55">Loading your practice count…</p>
          ) : practiceProgressError ? (
            <div role="alert" className="mt-4 rounded-2xl border border-rose-200/15 bg-rose-100/[0.04] p-4">
              <p className="text-sm text-white/75">Practice progress is unavailable right now.</p>
              <button type="button" onClick={loadProgress} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/80 hover:bg-white/[0.05]"><RefreshCw aria-hidden="true" className="h-4 w-4" />Try again</button>
            </div>
          ) : practiceProgress?.totalCompleted > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ProgressCount icon={BookHeart} label="practices completed" count={practiceProgress.totalCompleted} />
              <ProgressCount icon={CalendarCheck2} label="days with a practice in the last 7 days" count={practiceProgress.activeDaysLast7} />
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="max-w-xl text-sm leading-relaxed text-white/65">No completed practices are recorded yet. This count starts from now; there is no streak to keep.</p>
              <button type="button" onClick={() => navigate("/tools")} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-sky-100/20 px-4 text-sm font-medium text-sky-50 hover:bg-sky-100/[0.06]">Explore practices <ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
            </div>
          )}
        </section>

        {!practiceProgressLoading && hasReflectableProgress && (
          <section aria-labelledby="gardener-title" className="mt-4 rounded-3xl border border-lime-100/15 bg-lime-100/[0.025] p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <Sparkles aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-lime-100" />
              <div className="min-w-0 flex-1">
                <h2 id="gardener-title" className="text-lg font-semibold">A reflection on the steps you recorded</h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/60">Gardener can help put your saved progress counts into words. It will not read your check-in answers or journal entries.</p>
              </div>
            </div>

            {!gardenerResponse && !gardenerConsentOpen && (
              <button type="button" onClick={() => setGardenerConsentOpen(true)} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-lime-100/25 px-5 text-sm font-medium text-lime-50 transition hover:bg-lime-100/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-100">
                Ask Gardener to reflect
              </button>
            )}

            {gardenerConsentOpen && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-white">Review what will be shared</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">With your confirmation, WellnessCafe sends Gardener these aggregate numbers: {sharedCountDescription(progress, completedPractices, practiceDaysLast7)}. It does not send check-in answers, journal text, or support-choice details.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={askGardenerToReflect} disabled={gardenerLoading} className="inline-flex min-h-11 items-center justify-center rounded-full bg-lime-100 px-5 text-sm font-semibold text-slate-950 transition hover:bg-lime-50 disabled:cursor-wait disabled:opacity-60">
                    {gardenerLoading ? "Preparing reflection…" : "Share these counts and continue"}
                  </button>
                  <button type="button" onClick={() => setGardenerConsentOpen(false)} disabled={gardenerLoading} className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm text-white/75 transition hover:bg-white/[0.05] disabled:opacity-50">Cancel</button>
                </div>
              </div>
            )}

            {gardenerError && <p role="alert" className="mt-4 rounded-2xl border border-rose-200/15 bg-rose-100/[0.04] p-4 text-sm text-rose-100/85">{gardenerError}</p>}

            {gardenerResponse && (
              <div role="status" className="mt-5 rounded-2xl border border-lime-100/15 bg-black/15 p-4 sm:p-5">
                <p className="text-sm leading-relaxed text-white/75">{gardenerResponse.summary}</p>
                {gardenerResponse.win && <p className="mt-3 text-base font-medium leading-relaxed text-lime-50">{gardenerResponse.win}</p>}
                {gardenerResponse.reinforcement && <p className="mt-2 text-sm leading-relaxed text-white/65">{gardenerResponse.reinforcement}</p>}
                {gardenerResponse.nextStep && <p className="mt-3 text-sm leading-relaxed text-white/65"><span className="font-medium text-white/80">If useful: </span>{gardenerResponse.nextStep}</p>}
                <button type="button" onClick={() => setGardenerResponse(null)} className="mt-4 min-h-10 rounded-full border border-white/15 px-4 text-sm text-white/70 hover:bg-white/[0.05]">Close reflection</button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function sharedCountDescription(progress, completedPractices, practiceDaysLast7) {
  const counts = [
    `${Number(progress.checkInsSaved) || 0} saved check-ins`,
    `${Number(progress.skillCheckIns) || 0} check-ins naming a skill`,
    `${Number(progress.gratitudeCheckIns) || 0} gratitude notes`,
    `${Number(progress.plannedSupportCheckIns) || 0} plans or support notes`,
    `${completedPractices} completed practices`,
    `${practiceDaysLast7} practice days in the last seven days`,
  ];
  if (Number.isFinite(progress.highestReportedDays)) counts.push(`${progress.highestReportedDays} recovery days you recorded`);
  return counts.join(", ");
}
