import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartHandshake, LockKeyhole, Users } from "lucide-react";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { listAssignmentsForProvider } from "@/services/assignmentService";
import { getProviderClientOverview } from "@/services/practitionerRegistry";
import PageHeader from "@/components/navigation/PageHeader";

export default function ProviderClientsPage() {
  const navigate = useNavigate();
  const { isProvider, isAdmin, providerId, userId, isLoading: identityLoading } = useSessionIdentity();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadedScope, setLoadedScope] = useState("");
  const scopeKey = `${providerId || userId || ""}:${isProvider ? "provider" : isAdmin ? "admin" : "guest"}`;
  useEffect(() => {
    let active = true;
    if (identityLoading) return () => { active = false; };
    if (!isProvider && !isAdmin) { navigate("/"); return () => { active = false; }; }
    setLoading(true);
    setError("");
    (async () => {
      try {
        const assignments = await listAssignmentsForProvider(providerId || userId);
        const views = await Promise.all(assignments.map((item) => getProviderClientOverview(item.clientId).catch(() => ({ unavailable: true, shared: false, checkins: [], practiceProgress: [] }))));
        if (active) {
          setClients(assignments.map((item, index) => ({ ...item, alias: `Client ${index + 1}`, view: views[index] })));
          setLoadedScope(scopeKey);
        }
      } catch (err) {
        if (active) {
          setClients([]);
          setError(err?.message || "Your connected people could not be loaded.");
          setLoadedScope(scopeKey);
        }
      }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [identityLoading, isProvider, isAdmin, providerId, userId, navigate, scopeKey]);
  if (identityLoading) return <div className="grid min-h-[45vh] place-items-center text-sm text-white/60" role="status">Checking your workspace…</div>;
  if (!isProvider && !isAdmin) return null;
  const currentScopeLoaded = loadedScope === scopeKey;
  const visibleClients = currentScopeLoaded ? clients : [];
  return <main className="min-h-screen bg-slate-950 text-white"><PageHeader title="My people" subtitle="A person’s check-ins stay private unless they choose to share them." /><div className="lux-shell py-8">
    {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200/20 bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p>}
    {loading || !currentScopeLoaded ? <p className="py-10 text-center text-white/50">Loading your connections…</p> : visibleClients.length ? <div className="grid gap-3 md:grid-cols-2">{visibleClients.map((client) => { const view = client.view; const recent = view?.checkins?.[0]; return <button key={client.id} onClick={() => navigate(`/provider/clients/${client.clientId}`)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-amber-100/25"><div className="flex items-start justify-between"><div><h2 className="font-semibold">{client.alias}</h2><p className="mt-1 text-xs capitalize text-white/45">{client.relationshipType || "Connected"}</p></div>{view?.shared ? <HeartHandshake className="h-5 w-5 text-emerald-200" /> : <LockKeyhole className="h-5 w-5 text-white/35" />}</div>{view?.unavailable ? <p className="mt-4 text-sm leading-relaxed text-amber-100/75">Sharing details couldn’t be confirmed. Open this client’s page or refresh before acting on their current sharing choices.</p> : view?.sharingPaused ? <p className="mt-4 text-sm leading-relaxed text-amber-100/75">{view.sharingStatusUnknown ? "Personal sharing is hidden because its status could not be confirmed." : "Personal sharing is temporarily paused. Existing client choices remain saved."}</p> : view?.shared ? <><p className="mt-4 text-sm text-white/65">{view.totalRecentCheckins} shared check-ins{view.latestCheckInAt ? ` · latest ${new Date(view.latestCheckInAt).toLocaleDateString()}` : ""}</p><div className="mt-3 flex flex-wrap gap-2 text-xs">{recent?.mood && <span className="rounded-lg bg-white/5 px-2 py-1">Mood: {recent.mood}</span>}{recent?.cravingStatus && <span className="rounded-lg bg-white/5 px-2 py-1">Craving: {recent.cravingStatus}</span>}{recent?.triggerStatus && <span className="rounded-lg bg-white/5 px-2 py-1">Trigger: {recent.triggerStatus}</span>}</div></> : <p className="mt-4 flex items-center gap-2 text-sm text-white/45"><LockKeyhole className="h-4 w-4" />No check-in information shared. Private by default.</p>}{view?.practiceProgress?.length > 0 && <p className="mt-3 rounded-lg border border-sky-100/10 bg-sky-100/[0.04] px-3 py-2 text-xs text-sky-50/75">{view.practiceProgress.length} progress {view.practiceProgress.length === 1 ? "update" : "updates"} shared by this person</p>}</button>; })}</div> : <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center"><Users className="mx-auto h-8 w-8 text-white/35" /><h2 className="mt-3 font-semibold">Your connections will appear here</h2><p className="mt-2 text-sm text-white/50">When a person requests a connection and you accept, you can offer support without seeing anything they have not chosen to share.</p></section>}
  </div></main>;
}
