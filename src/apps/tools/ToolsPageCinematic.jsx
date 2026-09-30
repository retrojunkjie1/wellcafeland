import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, BookOpen, CheckCircle2, ChevronDown, Compass, HeartHandshake, Loader2, RefreshCw, Send, Sprout, Trash2, Waves } from "lucide-react";
import { trackPageView } from "@/services/telemetry";
import CinematicContainer from "@/components/tools/CinematicContainer";
import { TOOLS as clientFacingTools } from "./toolsRegistry";
import PractitionerSupportInbox from "@/components/PractitionerSupportInbox";
import { listMyDailyPractice, markPractitionerSupportSeen, submitPractitionerPracticeProgress } from "@/services/practitionerRegistry";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/system/RouteGuard";
import { getPublicPracticeAvailability } from "@/services/practiceAvailability";

const PRACTICE_GROUPS = [
  { id: "body-breath", title: "Body & Breath", description: "Breath, orientation, gentle movement, and self-care choices.", Icon: Waves },
  { id: "mind-thoughts", title: "Mind & Reflection", description: "Write, understand a situation, learn, or find words that feel true.", Icon: Compass },
  { id: "stress-crisis", title: "Urges & Stress", description: "Find one practical next move when pressure or an urge is present.", Icon: HeartHandshake },
  { id: "sleep-winddown", title: "Sleep & Rest", description: "A quiet imagery practice for easing toward rest, at your own pace.", Icon: BookOpen },
  { id: "everyday-support", title: "Everyday Support", description: "Make a practical task or daily need feel more manageable.", Icon: Sprout },
];

const ToolsPageCinematic = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [savedShelf, setSavedShelf] = useState({ uid: "", items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState("");
  const [progressDrafts, setProgressDrafts] = useState({});
  const [progressState, setProgressState] = useState({});
  const [openProgressId, setOpenProgressId] = useState("");
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogAvailable, setCatalogAvailable] = useState(true);
  const [openGroupId, setOpenGroupId] = useState("");
  const [handoff, setHandoff] = useState({ targetId: "", status: "" });
  const [spotlightPracticeId, setSpotlightPracticeId] = useState("");
  const activeUserId = user && !user.isAnonymous ? user.uid : "";
  const requestSequence = useRef(0);
  const activeUserIdRef = useRef(activeUserId);
  const handoffTargetId = location.state?.newlyAddedPracticeId || "";
  const handoffTargetRef = useRef(handoffTargetId);
  const practiceCardRefs = useRef(new Map());
  const savedItems = savedShelf.uid === activeUserId ? savedShelf.items : [];

  useLayoutEffect(() => {
    // Invalidate in-flight reads before the next account's screen is painted.
    activeUserIdRef.current = activeUserId;
    requestSequence.current += 1;
  }, [activeUserId]);

  useLayoutEffect(() => {
    handoffTargetRef.current = handoffTargetId;
    if (handoffTargetId) setHandoff({ targetId: handoffTargetId, status: "loading" });
  }, [handoffTargetId]);

  const toolCatalog = useMemo(() => {
    return clientFacingTools.map((tool) => ({
      id: tool.id,
      title: tool.name,
      summary: tool.description,
      categoryId: tool.category,
      duration: tool.duration || "Self-paced",
    }));
  }, []);

  const practiceGroups = useMemo(() => PRACTICE_GROUPS.map((group) => ({
    ...group,
    tools: toolCatalog.filter((tool) => tool.categoryId === group.id),
  })).filter((group) => group.tools.length > 0), [toolCatalog]);

  const loadDailyPractice = useCallback(async () => {
    if (!activeUserId) return;
    const requestId = ++requestSequence.current;
    const requestUid = activeUserId;
    setLoading(true);
    setError("");
    try {
      const result = await listMyDailyPractice();
      if (requestId === requestSequence.current && requestUid === activeUserIdRef.current) {
        const items = result.items || [];
        setSavedShelf({ uid: requestUid, items });
        const targetId = handoffTargetRef.current;
        if (targetId) {
          const found = items.find((item) => item.id === targetId);
          setHandoff({ targetId, status: found ? "ready" : "missing" });
          if (found) setSpotlightPracticeId(found.id);
        }
      }
    } catch (err) {
      if (requestId === requestSequence.current && requestUid === activeUserIdRef.current) {
        setError(err?.message || "Your Daily Practice could not be loaded.");
      }
    } finally {
      if (requestId === requestSequence.current && requestUid === activeUserIdRef.current) setLoading(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    if (!spotlightPracticeId) return;
    const card = practiceCardRefs.current.get(spotlightPracticeId);
    card?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  }, [spotlightPracticeId, savedItems.length]);

  useEffect(() => {
    if (handoff.status !== "ready" || !handoff.targetId || !handoffTargetId) return;
    // Consume the navigation cue after the saved card has been found so a
    // refresh does not replay the handoff indefinitely.
    navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true, state: null });
  }, [handoff, handoffTargetId, location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    document.title = "Daily Practice - WellnessCafe";
    trackPageView("daily-practice");
  }, []);

  useEffect(() => {
    let active = true;
    getPublicPracticeAvailability()
      .then((availability) => {
        if (active && availability.toolsCatalog === false) {
          setCatalogAvailable(false);
          setShowCatalog(false);
          setOpenGroupId("");
        }
      })
      // If the public availability read fails, preserve access to the optional
      // library. A visibility control must not strand clients or shared tools.
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    setError("");
    setProgressDrafts({});
    setProgressState({});
    setOpenProgressId("");
    setHandoff({ targetId: "", status: "" });
    setSpotlightPracticeId("");
    setWorkingId("");
    if (activeUserId) {
      setSavedShelf((current) => current.uid === activeUserId ? current : { uid: activeUserId, items: [] });
      loadDailyPractice();
    } else {
      requestSequence.current += 1;
      setSavedShelf({ uid: "", items: [] });
      setLoading(false);
    }
  }, [authLoading, activeUserId, loadDailyPractice]);

  const removePractice = async (item) => {
    const actionUid = activeUserId;
    setWorkingId(item.id);
    setError("");
    try {
      await markPractitionerSupportSeen(item.id, "removed");
      if (activeUserIdRef.current === actionUid) setSavedShelf((current) => current.uid === actionUid
        ? { ...current, items: current.items.filter((saved) => saved.id !== item.id) }
        : current);
    } catch (err) {
      if (activeUserIdRef.current === actionUid) setError(err?.message || "This practice could not be removed. Please try again.");
    } finally {
      if (activeUserIdRef.current === actionUid) setWorkingId("");
    }
  };

  const sendProgressUpdate = async (item) => {
    const actionUid = activeUserId;
    const draft = progressDrafts[item.id] || { outcome: "tried", note: "" };
    setWorkingId(item.id);
    setError("");
    try {
      await submitPractitionerPracticeProgress(item.id, draft.outcome, draft.note || "");
      if (activeUserIdRef.current === actionUid) {
        setProgressState((current) => ({ ...current, [item.id]: "sent" }));
        setOpenProgressId("");
      }
    } catch (err) {
      if (activeUserIdRef.current === actionUid) setProgressState((current) => ({ ...current, [item.id]: err?.message || "Your update could not be sent. Please try again." }));
    } finally { if (activeUserIdRef.current === actionUid) setWorkingId(""); }
  };

  return (
    <RouteGuard ready={true}>
      <CinematicContainer theme="calm" className="wc-daily-practice">
        <main className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 py-5 sm:py-8">
          <header className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-200/80">Your support, gathered in one place</p>
            <h1 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">Daily Practice</h1>
            <p className="max-w-2xl text-base leading-relaxed text-white/65">Practices shared by your practitioner show up here when you choose to add them. You decide what to keep and when to use it.</p>
          </header>

          <PractitionerSupportInbox />

          {!authLoading && (!user || user.isAnonymous) && (
            <section className="rounded-3xl border border-amber-200/15 bg-amber-100/[0.035] p-5 sm:p-7">
              <div className="flex items-start gap-4"><HeartHandshake aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-amber-200" /><div><h2 className="text-lg font-medium text-white">Keep a practitioner’s practice here</h2><p className="mt-2 text-sm leading-relaxed text-white/65">Sign in to add and keep practices your practitioner shares with you. You can still explore the optional library below.</p><button type="button" onClick={() => navigate("/login")} className="mt-4 min-h-11 rounded-full bg-amber-200 px-5 text-sm font-semibold text-slate-950 hover:bg-amber-100">Sign in</button></div></div>
            </section>
          )}

          {user && !user.isAnonymous && (
            <section aria-labelledby="my-daily-practice-title" className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="my-daily-practice-title" className="text-xl font-medium text-white">My Daily Practice</h2><p className="mt-1 text-sm text-white/55">Only practices you chose to keep are listed here.</p></div>{!loading && <span className="text-sm text-white/45">{savedItems.length} saved</span>}</div>

              {loading && <p role="status" className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-white/60">Loading your saved practices…</p>}
              {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200/20 bg-rose-200/[0.04] p-4 text-sm text-rose-100"><span>{error}</span><button type="button" onClick={loadDailyPractice} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 disabled:opacity-50"><RefreshCw aria-hidden="true" className="h-4 w-4" />Try again</button></div>}

              {!loading && !error && savedItems.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
                  <div className="flex items-start gap-4"><HeartHandshake aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-emerald-200" /><div><h3 className="text-lg font-medium text-white">Your practice space is ready</h3><p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">When a practitioner shares a practice with you, you can add it here. Until then, this space stays simple. The optional library is there whenever you want it.</p></div></div>
                </div>
              )}

              {savedItems.length > 0 && <div className="grid gap-3 md:grid-cols-2">{savedItems.map((item) => {
                const tool = toolCatalog.find((entry) => entry.id === item.toolId);
                const working = workingId === item.id;
                const spotlighted = spotlightPracticeId === item.id;
                return <article key={item.id} ref={(node) => { if (node) practiceCardRefs.current.set(item.id, node); else practiceCardRefs.current.delete(item.id); }} aria-labelledby={`saved-practice-${item.id}`} className={`rounded-3xl border p-5 transition-colors ${spotlighted ? "border-amber-200/55 bg-amber-100/[0.075] shadow-[0_0_0_2px_rgba(253,230,138,0.12)]" : "border-emerald-200/15 bg-emerald-100/[0.035]"}`}>
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-100/65">Shared by {item.practitionerName || "your practitioner"}{item.savedAt ? ` · added ${new Date(item.savedAt).toLocaleDateString()}` : ""}</p>
                  <h3 id={`saved-practice-${item.id}`} className="mt-2 text-xl font-medium text-white">{tool?.title || "A support practice"}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{tool?.summary || "A practice selected for you. Open it whenever you choose."}</p>
                  {item.message && <p className="mt-3 rounded-xl border border-white/10 bg-black/10 p-3 text-sm leading-relaxed text-white/75">“{item.message}”</p>}
                  {item.followUpDays === 7 && <div className="mt-4 rounded-2xl border border-sky-200/15 bg-sky-100/[0.035] p-4"><div className="flex items-start gap-3"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-sky-100" /><div><h4 className="text-sm font-medium text-white">A check-in was invited for after a week</h4><p className="mt-1 text-xs leading-relaxed text-white/55">Your practitioner will not know whether you used this. You can choose to send them a brief update here, only when you feel ready.</p>{item.followUpDueAt && <p className="mt-2 text-xs text-sky-100/65">Suggested check-in: {new Date(item.followUpDueAt).toLocaleDateString()}</p>}</div></div>{progressState[item.id] === "sent" ? <p role="status" className="mt-3 text-sm text-emerald-200">Your update was sent to {item.practitionerName || "your practitioner"}.</p> : <><button type="button" onClick={() => setOpenProgressId((current) => current === item.id ? "" : item.id)} className="mt-3 min-h-10 rounded-full border border-sky-100/20 px-4 text-sm text-sky-50 hover:bg-sky-100/[0.06]">{openProgressId === item.id ? "Close update" : "Share a progress update"}</button>{openProgressId === item.id && <div className="mt-3 space-y-3 border-t border-white/10 pt-3"><fieldset><legend className="text-xs font-medium text-white/70">How did this practice fit for you?</legend><div className="mt-2 flex flex-wrap gap-2">{[["tried", "I tried it"], ["not-yet", "Not yet"], ["not-a-fit", "It wasn’t a fit"], ["prefer-not-to-say", "I’d rather not say"]].map(([value, label]) => <label key={value} className={`cursor-pointer rounded-full border px-3 py-2 text-xs ${((progressDrafts[item.id]?.outcome || "tried") === value) ? "border-sky-100/40 bg-sky-100/10 text-sky-50" : "border-white/10 text-white/60"}`}><input type="radio" name={`progress-${item.id}`} value={value} checked={(progressDrafts[item.id]?.outcome || "tried") === value} onChange={() => setProgressDrafts((current) => ({ ...current, [item.id]: { outcome: value, note: current[item.id]?.note || "" } }))} className="sr-only" />{label}</label>)}</div></fieldset><label className="block text-xs text-white/65">Anything you want them to know? <span className="text-white/40">(optional)</span><textarea maxLength={600} rows={3} value={progressDrafts[item.id]?.note || ""} onChange={(event) => setProgressDrafts((current) => ({ ...current, [item.id]: { outcome: current[item.id]?.outcome || "tried", note: event.target.value } }))} className="mt-1 w-full resize-y rounded-xl border border-white/10 bg-slate-950/65 p-3 text-sm text-white placeholder:text-white/35" placeholder="A sentence is enough. You can leave this blank." /></label><p className="text-xs leading-relaxed text-white/45">This update is sent to {item.practitionerName || "your practitioner"} only when you press send. It does not share your other check-ins.</p>{progressState[item.id] && progressState[item.id] !== "sent" && <p role="alert" className="text-sm text-rose-200">{progressState[item.id]}</p>}<button type="button" onClick={() => sendProgressUpdate(item)} disabled={workingId === item.id} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-sky-100 px-4 text-sm font-semibold text-slate-950 disabled:opacity-50"><Send aria-hidden="true" className="h-4 w-4" />{workingId === item.id ? "Sending…" : "Send update"}</button></div>}</>}</div>}
                  <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => navigate(`/tools/${encodeURIComponent(item.toolId)}`)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-200 px-5 text-sm font-semibold text-slate-950 hover:bg-amber-100">{spotlighted ? "Open this practice" : "Open practice"} <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></button><button type="button" onClick={() => removePractice(item)} disabled={!!workingId} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/65 hover:bg-white/[0.06] disabled:opacity-50"><Trash2 aria-hidden="true" className="h-4 w-4" />{working ? "Removing…" : "Remove"}</button></div>
                </article>;
              })}</div>}
              {handoff.status === "ready" && (
                <div role="status" className="rounded-2xl border border-amber-200/30 bg-amber-100/[0.06] p-4 text-sm text-amber-50">
                  <p className="font-medium">Added to your Daily Practice</p>
                  <p className="mt-1 text-white/65">Your practitioner’s practice is highlighted above. Open it whenever you’re ready.</p>
                </div>
              )}
              {handoff.status === "missing" && (
                <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200/25 bg-amber-100/[0.04] p-4 text-sm text-amber-50">
                  <span>The practice was accepted, but it has not appeared in your saved list yet. Refresh your saved practices to check again.</span>
                  <button type="button" onClick={loadDailyPractice} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 disabled:opacity-50"><RefreshCw aria-hidden="true" className="h-4 w-4" />{loading ? "Refreshing…" : "Refresh practices"}</button>
                </div>
              )}
            </section>
          )}

          {catalogAvailable ? <section className="border-t border-white/10 pt-5">
            <button type="button" aria-expanded={showCatalog} onClick={() => setShowCatalog((current) => !current)} className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3 text-left transition hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
              <span className="inline-flex items-center gap-3"><BookOpen aria-hidden="true" className="h-5 w-5 shrink-0 text-amber-200" /><span><span className="block text-sm font-medium text-white/90">Explore practice collections</span><span className="mt-1 block text-sm font-normal leading-snug text-white/55">Five support areas. Open one to see the practices inside.</span></span></span><ChevronDown aria-hidden="true" className={`h-5 w-5 shrink-0 transition-transform ${showCatalog ? "rotate-180" : ""}`} />
            </button>
            {showCatalog && <div id="practice-collections" className="mt-4 space-y-3">
              {practiceGroups.map(({ id, title, description, Icon, tools }) => {
                const isOpen = openGroupId === id;
                return <section key={id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
                  <button type="button" aria-expanded={isOpen} onClick={() => setOpenGroupId((current) => current === id ? "" : id)} className="flex min-h-20 w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-amber-300 sm:px-5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-200/[0.09] text-amber-100"><Icon aria-hidden="true" className="h-5 w-5" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-base font-medium text-white">{title}</span><span className="mt-1 block text-sm leading-relaxed text-white/60">{description}</span></span>
                    <span className="ml-1 flex shrink-0 flex-col items-end gap-1"><span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/55">{tools.length} {tools.length === 1 ? "practice" : "practices"}</span><ChevronDown aria-hidden="true" className={`h-4 w-4 text-white/45 transition-transform ${isOpen ? "rotate-180" : ""}`} /></span>
                  </button>
                  {isOpen && <div id={`practice-group-${id}`} className="space-y-2 border-t border-white/10 px-3 py-3 sm:px-4">
                    {tools.map((tool) => <button key={tool.id} type="button" onClick={() => navigate(`/tools/${encodeURIComponent(tool.id)}`)} className="flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-slate-950/25 px-3 py-3 text-left transition hover:border-amber-200/25 hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 sm:px-4"><span className="min-w-0"><span className="block text-base font-medium text-white">{tool.title}</span><span className="mt-1 block text-sm leading-relaxed text-white/55">{tool.summary}</span><span className="mt-1.5 block text-xs text-amber-100/60">{tool.duration}</span></span><ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0 text-white/45" /></button>)}
                  </div>}
                </section>;
              })}
            </div>}
          </section> : <section className="border-t border-white/10 pt-5"><p role="status" className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-relaxed text-white/60">Optional practice collections are paused for now. Your saved and practitioner-shared practices above are still available.</p></section>}
        </main>
      </CinematicContainer>
    </RouteGuard>
  );
};

export default ToolsPageCinematic;
