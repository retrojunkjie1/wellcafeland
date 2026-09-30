// src/apps/dashboard/DashboardPage.jsx

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SignalHeader from "@/components/dashboard/SignalHeader";
import CheckInWeeklyReflection from "./CheckInWeeklyReflection";
import { useAuth } from "@/context/AuthContext";
import { listMyCheckInHistoryPage } from "@/services/checkInHistory";
import { GUEST_CHECKINS_STORAGE_KEY } from "@/apps/core/checkInConstants";

function guestCheckInDate(value) {
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  }
  return new Date(value);
}



const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const historyScope = user && !user.isAnonymous ? `account:${user.uid}` : "guest";

  const [checkIns, setCheckIns] = useState([]);
  const [checkInsLoading, setCheckInsLoading] = useState(false);
  const [olderCheckInsLoading, setOlderCheckInsLoading] = useState(false);
  const [checkInsCursor, setCheckInsCursor] = useState(null);
  const [hasOlderCheckIns, setHasOlderCheckIns] = useState(false);
  const [checkInsError, setCheckInsError] = useState("");
  const historyRequestSequence = useRef(0);
  const historyScopeRef = useRef(historyScope);

  useLayoutEffect(() => {
    historyScopeRef.current = historyScope;
    historyRequestSequence.current += 1;
    setCheckIns([]);
    setCheckInsCursor(null);
    setHasOlderCheckIns(false);
    setCheckInsLoading(false);
    setOlderCheckInsLoading(false);
    setCheckInsError("");
  }, [historyScope]);

  const loadCheckIns = useCallback(async () => {
    const requestId = ++historyRequestSequence.current;
    const requestScope = historyScope;
    setCheckInsLoading(true);
    setCheckInsError("");
    setCheckIns([]);
    setCheckInsCursor(null);
    setHasOlderCheckIns(false);
    try {
      if (user && !user.isAnonymous) {
        const page = await listMyCheckInHistoryPage();
        if (requestId === historyRequestSequence.current && requestScope === historyScopeRef.current) {
          setCheckIns(page.items);
          setCheckInsCursor(page.nextCursor);
          setHasOlderCheckIns(page.hasMore);
        }
      } else {
        const localItems = JSON.parse(localStorage.getItem(GUEST_CHECKINS_STORAGE_KEY) || "[]");
        if (requestId === historyRequestSequence.current && requestScope === historyScopeRef.current) {
          setCheckIns((Array.isArray(localItems) ? localItems : []).map((item, index) => ({
            ...item,
            id: `guest-${index}`,
            displayDate: guestCheckInDate(item.timestamp || item.date),
          })).sort((a, b) => b.displayDate.getTime() - a.displayDate.getTime()));
        }
      }
    } catch (error) {
      if (requestId === historyRequestSequence.current && requestScope === historyScopeRef.current) {
        setCheckInsError(error?.message || "Your check-in history could not be loaded.");
      }
    } finally {
      if (requestId === historyRequestSequence.current && requestScope === historyScopeRef.current) setCheckInsLoading(false);
    }
  }, [user, historyScope]);

  const loadOlderCheckIns = useCallback(async () => {
    if (!checkInsCursor || olderCheckInsLoading || !hasOlderCheckIns) return;
    const requestId = ++historyRequestSequence.current;
    const requestScope = historyScope;
    const requestCursor = checkInsCursor;
    setOlderCheckInsLoading(true);
    setCheckInsError("");
    try {
      const page = await listMyCheckInHistoryPage({ cursor: requestCursor });
      if (requestId === historyRequestSequence.current && requestScope === historyScopeRef.current) {
        setCheckIns((current) => [...current, ...page.items]);
        setCheckInsCursor(page.nextCursor);
        setHasOlderCheckIns(page.hasMore);
      }
    } catch (error) {
      if (requestId === historyRequestSequence.current && requestScope === historyScopeRef.current) {
        setCheckInsError(error?.message || "Older check-ins could not be loaded.");
      }
    } finally {
      if (requestId === historyRequestSequence.current && requestScope === historyScopeRef.current) setOlderCheckInsLoading(false);
    }
  }, [checkInsCursor, hasOlderCheckIns, olderCheckInsLoading, historyScope]);

  useEffect(() => {
    if (!authLoading) loadCheckIns();
  }, [authLoading, loadCheckIns]);



  return (

    <div className="mx-auto w-full max-w-5xl flex flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-0 overflow-x-hidden">

      {/* Top header with user/session info */}

      <div className="mb-4">

        <SignalHeader />

      </div>



      <section aria-labelledby="check-in-history-title" className="flex-1 space-y-4 overflow-visible">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-slate-200 shadow-lg shadow-black/20 backdrop-blur-md">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 id="check-in-history-title" className="text-lg font-semibold text-white">Your check-ins</h2><p className="mt-1 max-w-2xl text-sm text-slate-400">Check-ins stay private unless you choose sharing categories for a connected practitioner. A connection alone does not grant access.</p></div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => navigate("/settings/practitioner-sharing")} className="min-h-10 rounded-full border border-amber-200/25 px-4 text-xs font-medium text-amber-100 hover:bg-amber-100/[0.06]">Manage sharing</button>
                <button type="button" onClick={loadCheckIns} disabled={checkInsLoading} className="min-h-10 rounded-full border border-white/15 px-4 text-xs text-white/70 disabled:opacity-50">{checkInsLoading ? "Refreshing…" : "Refresh"}</button>
              </div>
            </div>
          </div>

          {checkInsLoading && <p role="status" className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">Loading your saved check-ins…</p>}
          {checkInsError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200/20 bg-rose-200/[0.04] p-4 text-sm text-rose-100"><span>{checkInsError}</span><button type="button" onClick={checkIns.length > 0 && hasOlderCheckIns ? loadOlderCheckIns : loadCheckIns} className="min-h-10 rounded-full border border-white/15 px-4">Try again</button></div>}

          {!checkInsLoading && !checkInsError && <CheckInWeeklyReflection
            checkIns={checkIns}
            onStartCheckIn={() => navigate("/check-in")}
            emptyNote={!user || user.isAnonymous ? "Guest check-ins stay in this browser on this device." : "Your saved check-ins stay in your account."}
          />}

          {!checkInsLoading && checkIns.length > 0 && <div className="space-y-3">{checkIns.map((entry) => {
            const detailLines = [
              ["What you were craving", entry.cravingDetails],
              ["What felt triggering", entry.triggerDetails],
              ["A skill you practiced", entry.skillsPracticed],
              ["What you were grateful for", entry.gratitude],
              ["Your reflection", entry.journal],
            ].filter(([, value]) => typeof value === "string" && value.trim());
            const hasDetails = detailLines.length > 0 || (entry.plannedActivities || []).length > 0 || entry.supportNeeded;
            return <article key={entry.id} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-wide text-amber-100/65">{entry.displayDate instanceof Date && !Number.isNaN(entry.displayDate.getTime()) ? entry.displayDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "Saved check-in"}</p><h3 className="mt-1 text-base font-semibold text-white">{entry.mood ? `Mood: ${entry.mood[0].toUpperCase()}${entry.mood.slice(1)}` : "Recovery check-in"}</h3></div><span className="rounded-full border border-emerald-200/15 bg-emerald-200/[0.04] px-3 py-1 text-xs text-emerald-100/75">{user && !user.isAnonymous ? "Saved to your account" : "Saved on this device"}</span></div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/75">
                {entry.daysSinceLastUse != null && <span className="rounded-full border border-white/10 px-3 py-1.5">Days sober / clean: {entry.daysSinceLastUse}</span>}
                {entry.cravingStatus && entry.cravingStatus !== "skip" && <span className="rounded-full border border-white/10 px-3 py-1.5">Craving: {entry.cravingStatus}{entry.cravingStatus === "yes" && entry.cravingIntensity != null ? ` · ${entry.cravingIntensity}/10` : ""}</span>}
                {entry.triggerStatus && entry.triggerStatus !== "skip" && <span className="rounded-full border border-white/10 px-3 py-1.5">Trigger: {entry.triggerStatus}{entry.triggerStatus === "yes" && entry.triggerIntensity != null ? ` · ${entry.triggerIntensity}/10` : ""}</span>}
              </div>
              {hasDetails && <details className="mt-4 border-t border-white/10 pt-3"><summary className="min-h-10 cursor-pointer py-2 text-sm text-white/70">View what I chose to record</summary><dl className="mt-2 space-y-3">{detailLines.map(([label, value]) => <div key={label}><dt className="text-xs text-white/45">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-white/75">{value}</dd></div>)}{entry.plannedActivities?.length > 0 && <div><dt className="text-xs text-white/45">Activities you planned</dt><dd className="mt-1 text-sm leading-relaxed text-white/75">{entry.plannedActivities.join(", ")}</dd></div>}{entry.supportNeeded && <div><dt className="text-xs text-white/45">Support you wanted</dt><dd className="mt-1 text-sm text-white/75">{entry.supportNeeded}</dd></div>}</dl></details>}
            </article>;
          })}</div>}
          {!checkInsLoading && !checkInsError && hasOlderCheckIns && <div className="flex justify-center pt-1"><button type="button" onClick={loadOlderCheckIns} disabled={olderCheckInsLoading} className="min-h-11 rounded-full border border-white/15 px-5 text-sm font-medium text-white/75 transition hover:border-amber-100/35 hover:bg-white/[0.04] disabled:opacity-50">{olderCheckInsLoading ? "Loading older check-ins…" : "Load older check-ins"}</button></div>}
      </section>



    </div>

  );

};



export default DashboardPage;
