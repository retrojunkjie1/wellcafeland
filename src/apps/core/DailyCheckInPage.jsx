import React, { useState } from "react";
import { Check, HeartPulse, Flower2, HandHeart, UsersRound, ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOSStore } from "@/stores/useOSStore";
import CheckIn, { GUEST_CHECKINS_STORAGE_KEY } from "@/components/CheckIn";
import PageHeader from "@/components/navigation/PageHeader";
import { getCheckInNextStep } from "./checkInNextStep";

export default function DailyCheckInPage() {
  const navigate = useNavigate();
  const storySuggestionsEnabled = useOSStore((state) => state.settings?.recoveryStorySuggestionsEnabled === true);
  const [completed, setCompleted] = useState(false);
  const [savedTo, setSavedTo] = useState(null);
  const [clearError, setClearError] = useState("");
  const [selectedSupport, setSelectedSupport] = useState("");
  const [showOtherSteps, setShowOtherSteps] = useState(false);

  const recommendedStep = getCheckInNextStep(selectedSupport);

  const handleCheckInComplete = (data, info) => {
    setSelectedSupport(data?.supportNeeded || "");
    setSavedTo(info?.savedTo ?? "account");
    setCompleted(true);
  };

  const nextActions = [
    {
      title: "Open Daily Practice",
      detail: "See practices you chose to keep, including anything shared by your practitioner.",
      path: "/tools",
      icon: Flower2,
      color: "border-violet-300/25 text-violet-50",
    },
    {
      title: "Find practical support",
      detail: "Look for housing, food, recovery groups, treatment, and local services.",
      path: "/assistance",
      icon: HandHeart,
      color: "border-emerald-300/25 text-emerald-50",
    },
    {
      title: "Browse practitioners",
      detail: "Explore people offering professional, peer, movement, and bodywork support.",
      path: "/providers",
      icon: UsersRound,
      color: "border-sky-300/25 text-sky-50",
    },
  ];

  return (
    <main className="mx-auto min-h-full w-full max-w-3xl px-4 py-6 sm:px-6">
      <PageHeader
        title="A moment for you"
        subtitle="Check in with yourself at your own pace. You can leave any reflection blank."
        showBack
        backTo="/home"
      />
      {completed ? (
        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-[#14202a] p-5 text-center text-white shadow-[0_20px_70px_rgba(0,0,0,0.32)] sm:p-8" aria-live="polite">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200/20 bg-emerald-300/10 text-emerald-200">
            <Check aria-hidden="true" className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            {savedTo === "device" ? "Saved on this device" : "Your check-in is saved"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-300">
            {savedTo === "device"
              ? "This guest check-in is stored only in this browser on this device. You can clear guest check-ins here."
              : "Thank you for taking this moment. There’s no right way to feel, and you can return whenever it feels useful."}
          </p>
          <div className="mx-auto mt-6 max-w-2xl text-left">
            <h3 className="text-center text-lg font-semibold text-white">One next step, if you want it</h3>
            <p className="mt-1 text-center text-sm text-slate-300">Based on the kind of support you chose. You can change direction or finish here.</p>
            {selectedSupport && selectedSupport !== "I am not sure yet" && (
              <p className="mx-auto mt-3 max-w-xl rounded-xl border border-wcGold/20 bg-wcGold/[0.06] px-4 py-3 text-center text-sm text-amber-100/85">
                You chose: <span className="font-medium">{selectedSupport}</span>. That preference is saved with this check-in; choose any next step below if it feels useful.
              </p>
            )}
            <button
              type="button"
              onClick={() => navigate(recommendedStep.path, { state: { from: "daily-check-in" } })}
              className="group mt-4 flex min-h-24 w-full items-center gap-4 rounded-2xl border border-amber-200/35 bg-gradient-to-r from-amber-200/10 to-emerald-200/[0.06] p-4 text-left transition hover:border-amber-200/60 hover:bg-amber-100/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold sm:p-5"
            >
              <span className="rounded-xl bg-amber-100/10 p-3 text-amber-100"><ArrowRight aria-hidden="true" className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-white">{recommendedStep.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-300">{recommendedStep.detail}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-wcGold">{recommendedStep.action}<ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </button>
            <button
              type="button"
              aria-expanded={showOtherSteps}
              onClick={() => setShowOtherSteps((current) => !current)}
              className="mx-auto mt-3 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold"
            >
              {showOtherSteps ? "Hide other options" : "See other options"}
              <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${showOtherSteps ? "rotate-180" : ""}`} />
            </button>
            {storySuggestionsEnabled && (
              <button
                type="button"
                onClick={() => navigate("/recovery/stories", { state: { from: "daily-check-in" } })}
                className="mx-auto mt-2 inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-200/20 px-4 text-sm text-amber-100/90 transition hover:border-amber-200/45 hover:bg-amber-100/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold"
              >
                <HeartPulse aria-hidden="true" className="h-4 w-4" />Explore a recovery story
              </button>
            )}
            {showOtherSteps && <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {nextActions.filter((action) => action.path !== recommendedStep.path).map((action) => {
                const ActionIcon = action.icon;
                return (
              <button
                key={action.path}
                type="button"
                onClick={() => navigate(action.path, { state: { from: "daily-check-in" } })}
                className={`group flex min-h-36 items-start gap-3 rounded-2xl border bg-slate-800/70 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-wcGold/50 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold ${action.color}`}
              >
                <span className="rounded-xl bg-white/10 p-2 text-wcGold"><ActionIcon aria-hidden="true" className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-snug">{action.title}</span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-slate-300">{action.detail}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-wcGold">Open <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
                </span>
              </button>
                );
              })}
            </div>}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="min-h-11 rounded-full border border-white/15 px-5 text-sm font-medium text-white/80 transition hover:bg-white/10"
              >
                Check-in history
              </button>
              <button
                type="button"
                onClick={() => navigate("/milestones")}
                className="min-h-11 rounded-full border border-amber-100/25 px-5 text-sm font-medium text-amber-100/90 transition hover:bg-amber-100/[0.06]"
              >
                See my milestones
              </button>
            </div>
          </div>
          {savedTo === "device" && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem(GUEST_CHECKINS_STORAGE_KEY);
                    setClearError("");
                  } catch {
                    setClearError("Guest check-ins could not be cleared from this browser.");
                  }
                }}
                className="min-h-11 rounded-lg px-4 text-sm text-slate-300 underline underline-offset-4 hover:text-white"
              >
                Clear guest check-ins from this device
              </button>
              {clearError && <p role="alert" className="mt-2 text-xs text-rose-200">{clearError}</p>}
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="mt-5 min-h-11 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold"
          >
            I’m done for now
          </button>
        </section>
      ) : (
        <>
          <p className="mb-4 flex items-center gap-2 text-xs text-white/45">
            <HeartPulse aria-hidden="true" className="h-4 w-4 text-wcGold" />
            Your reflections are optional. Choose only what feels comfortable to share.
          </p>
          <CheckIn onComplete={handleCheckInComplete} />
        </>
      )}
    </main>
  );
}
