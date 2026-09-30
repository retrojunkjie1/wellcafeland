import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartHandshake, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { listMyPractitionerSupport, markPractitionerSupportSeen } from "@/services/practitionerRegistry";
import { TOOLS } from "@/apps/tools/toolsRegistry";
import { useAuth } from "@/context/AuthContext";
import { trackSupportAction } from "@/telemetry/telemetry";

export default function PractitionerSupportInbox() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const activeUserId = user && !user.isAnonymous ? user.uid : "";
  const [inbox, setInbox] = useState({ uid: "", items: [] });
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  const requestSequence = useRef(0);
  const activeUserIdRef = useRef(activeUserId);
  const loadingUsersRef = useRef(new Set());
  const autoRefreshAtRef = useRef(0);
  const items = inbox.uid === activeUserId ? inbox.items : [];

  useLayoutEffect(() => {
    activeUserIdRef.current = activeUserId;
    requestSequence.current += 1;
    setError("");
    setWorkingId("");
  }, [activeUserId]);

  const load = useCallback(async () => {
    if (!activeUserId) return;
    const requestUid = activeUserId;
    if (loadingUsersRef.current.has(requestUid)) return;
    loadingUsersRef.current.add(requestUid);
    const requestId = ++requestSequence.current;
    setLoading(true); setError("");
    try {
      const result = await listMyPractitionerSupport();
      if (requestId === requestSequence.current && requestUid === activeUserIdRef.current) {
        setInbox({ uid: requestUid, items: result.items || [] });
      }
    } catch (err) {
      trackSupportAction("practice", "practice_action_failed", err?.code);
      if (requestId === requestSequence.current && requestUid === activeUserIdRef.current) {
        setError(err?.message || "Shared support could not be loaded.");
      }
    } finally {
      loadingUsersRef.current.delete(requestUid);
      if (requestId === requestSequence.current && requestUid === activeUserIdRef.current) setLoading(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    if (authLoading) return;
    if (activeUserId) load();
    else {
      requestSequence.current += 1;
      setLoading(false);
      setError("");
    }
  }, [authLoading, activeUserId, load]);

  useEffect(() => {
    if (authLoading || !activeUserId) return undefined;
    const refreshIfVisible = () => {
      if (document.visibilityState === "hidden") return;
      const now = Date.now();
      if (now - autoRefreshAtRef.current < 30_000) return;
      autoRefreshAtRef.current = now;
      void load();
    };
    const intervalId = window.setInterval(refreshIfVisible, 60_000);
    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [activeUserId, authLoading, load]);

  if (authLoading || !user || user.isAnonymous || (!items.length && !loading && !error)) return null;
  const open = async (item) => {
    const actionUid = activeUserId;
    setWorkingId(item.id); setError("");
    try {
      await markPractitionerSupportSeen(item.id, "opened");
      trackSupportAction("practice", "practice_opened");
      if (activeUserIdRef.current === actionUid) {
        setInbox((current) => current.uid === actionUid ? { ...current, items: current.items.filter((entry) => entry.id !== item.id) } : current);
        navigate(`/tools/${item.toolId}`);
      }
    } catch (err) { trackSupportAction("practice", "practice_action_failed", err?.code); if (activeUserIdRef.current === actionUid) setError(err?.message || "This tool could not be opened. Please try again."); }
    finally { if (activeUserIdRef.current === actionUid) setWorkingId(""); }
  };
  const addToPractice = async (item) => {
    const actionUid = activeUserId;
    setWorkingId(item.id); setError("");
    try {
      await markPractitionerSupportSeen(item.id, "added");
      trackSupportAction("practice", "practice_added");
      if (activeUserIdRef.current === actionUid) {
        setInbox((current) => current.uid === actionUid ? { ...current, items: current.items.filter((entry) => entry.id !== item.id) } : current);
        // Keep the invitation identifier in router state rather than the URL;
        // Daily Practice uses it only to spotlight the saved card.
        navigate("/tools", { state: { newlyAddedPracticeId: item.id } });
      }
    } catch (err) { trackSupportAction("practice", "practice_action_failed", err?.code); if (activeUserIdRef.current === actionUid) setError(err?.message || "This practice could not be added. Please try again."); }
    finally { if (activeUserIdRef.current === actionUid) setWorkingId(""); }
  };
  const dismiss = async (id) => {
    const actionUid = activeUserId;
    setWorkingId(id); setError("");
    try {
      await markPractitionerSupportSeen(id, "dismissed");
      trackSupportAction("practice", "practice_dismissed");
      if (activeUserIdRef.current === actionUid) {
        setInbox((current) => current.uid === actionUid ? { ...current, items: current.items.filter((item) => item.id !== id) } : current);
      }
    } catch (err) { trackSupportAction("practice", "practice_action_failed", err?.code); if (activeUserIdRef.current === actionUid) setError(err?.message || "This support item could not be dismissed. Please try again."); }
    finally { if (activeUserIdRef.current === actionUid) setWorkingId(""); }
  };
  return <section aria-label="Support from your practitioner" className="rounded-2xl border border-emerald-200/20 bg-emerald-200/[0.045] p-4 text-white sm:p-5">
    <div className="mb-3 flex items-center gap-2"><HeartHandshake className="h-5 w-5 text-emerald-200" /><div><h2 className="font-semibold">A practice was shared with you</h2><p className="text-xs text-white/50">Add it to Daily Practice, open it once, or dismiss it. You choose.</p></div></div>
    {loading && <p role="status" className="rounded-lg border border-white/10 bg-slate-950/40 p-3 text-sm text-white/55">Checking for support shared with you…</p>}
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200/20 bg-rose-300/[0.06] p-3 text-sm text-rose-100"><span>{error}</span><button type="button" onClick={load} disabled={loading || !!workingId} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/15 px-3 text-white/80 disabled:opacity-50"><RefreshCw className="h-3.5 w-3.5" />Try again</button></div>}
    <div className="space-y-2">{items.map((item) => { const tool = TOOLS.find((entry) => entry.id === item.toolId); const working = workingId === item.id; return <article key={item.id} className="rounded-xl border border-white/10 bg-slate-950/55 p-3">
      <p className="text-xs text-emerald-100/70">From {item.practitionerName}</p><h3 className="mt-1 flex items-center gap-2 text-sm font-medium"><Sparkles className="h-4 w-4 text-amber-200" />{tool?.name || "A support tool"}</h3>{item.message && <p className="mt-1 text-sm leading-relaxed text-white/65">{item.message}</p>}
      <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => addToPractice(item)} disabled={!!workingId} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-amber-200 px-3 text-sm font-semibold text-slate-950 disabled:opacity-50">{working && <Loader2 className="h-4 w-4 animate-spin" />}{working ? "Adding…" : "Add to Daily Practice"}</button><button type="button" onClick={() => open(item)} disabled={!!workingId} className="min-h-10 rounded-lg border border-white/15 px-3 text-sm text-white/75 disabled:opacity-50">Open once</button><button type="button" onClick={() => dismiss(item.id)} disabled={!!workingId} className="min-h-10 rounded-lg px-3 text-sm text-white/55 disabled:opacity-50">Dismiss</button></div>
    </article>; })}</div>
  </section>;
}
