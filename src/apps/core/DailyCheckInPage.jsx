import React, { useState } from "react";
import { Check, HeartPulse, Mountain, Wind } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CheckIn, { GUEST_CHECKINS_STORAGE_KEY } from "@/components/CheckIn";
import PageHeader from "@/components/navigation/PageHeader";

export default function DailyCheckInPage() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);
  const [savedTo, setSavedTo] = useState(null);
  const [clearError, setClearError] = useState("");

  return (
    <main className="mx-auto min-h-full w-full max-w-3xl px-4 py-6 sm:px-6">
      <PageHeader
        title="A moment for you"
        subtitle="Check in with yourself at your own pace. You can leave any reflection blank."
        showBack
        backTo="/home"
      />
      {completed ? (
        <section className="rounded-2xl border border-emerald-200/15 bg-emerald-100/[0.04] p-6 text-center sm:p-8" aria-live="polite">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200/10 text-emerald-200">
            <Check aria-hidden="true" className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-medium text-white">
            {savedTo === "device" ? "Saved on this device" : "Your check-in is saved"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/60">
            {savedTo === "device"
              ? "This guest check-in is stored only in this browser on this device. You can clear guest check-ins here."
              : "Thank you for taking this moment. There’s no right way to feel, and you can return whenever it feels useful."}
          </p>
          <div className="mx-auto mt-7 max-w-lg rounded-xl border border-white/10 bg-black/10 p-4 text-left">
            <h3 className="text-sm font-medium text-white">Would a short practice feel helpful?</h3>
            <p className="mt-1 text-xs leading-5 text-white/55">Choose one if you’d like, or head home. There’s no need to do anything next.</p>
            <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/tools/grounding", { state: { from: "daily-check-in" } })}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-3 text-sm text-white/85 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold"
              >
                <Mountain aria-hidden="true" className="h-4 w-4 text-wcGold" />
                Try grounding
              </button>
              <button
                type="button"
                onClick={() => navigate("/tools/breathing", { state: { from: "daily-check-in" } })}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-3 text-sm text-white/85 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold"
              >
                <Wind aria-hidden="true" className="h-4 w-4 text-wcGold" />
                Try breathing
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
                className="min-h-11 rounded-lg px-4 text-xs text-white/55 underline underline-offset-4 hover:text-white"
              >
                Clear guest check-ins from this device
              </button>
              {clearError && <p role="alert" className="mt-2 text-xs text-rose-200">{clearError}</p>}
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="mt-4 rounded-lg px-5 py-3 text-sm text-white/65 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold"
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
          <CheckIn onComplete={(_data, info) => { setSavedTo(info?.savedTo ?? "account"); setCompleted(true); }} />
        </>
      )}
    </main>
  );
}
