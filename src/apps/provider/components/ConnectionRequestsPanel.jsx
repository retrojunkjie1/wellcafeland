import React, { useCallback, useEffect, useState } from "react";
import { Check, HeartHandshake, Loader2, X } from "lucide-react";
import { listPractitionerConnectionRequests, respondToPractitionerConnection } from "@/services/practitionerRegistry";

function getLoadErrorMessage(error, isSignedIn) {
  const code = String(error?.code || "").toLowerCase();
  if (code.includes("unauthenticated") || code.includes("unauthorized")) {
    return isSignedIn
      ? "You’re signed in, but the secure connection could not be verified. Reload WellnessCafe and try again."
      : "Please sign in to load connection requests.";
  }
  if (code.includes("permission-denied")) {
    return isSignedIn
      ? "Your signed-in account doesn’t have access to connection requests. Contact your workspace administrator."
      : "Sign in with the practitioner account to load connection requests.";
  }
  return "Connection requests couldn’t load. Try again in a moment.";
}

export default function ConnectionRequestsPanel({ id, onAccepted, onSignIn, isSignedIn = false, appVerificationFailed = false, title = "Connection requests", description = "People asking to work with you", style }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPractitionerConnectionRequests();
      setRequests(data.requests || []);
      setLoadError("");
      setMessage("");
    } catch (error) {
      setLoadError(getLoadErrorMessage(error, isSignedIn));
    } finally { setLoading(false); }
  }, [isSignedIn]);

  useEffect(() => { load(); }, [load]);

  const respond = async (id, decision) => {
    setWorkingId(id);
    setMessage("");
    try {
      await respondToPractitionerConnection(id, decision);
      setRequests((current) => current.filter((item) => item.id !== id));
      if (decision === "accept") {
        setMessage("Connection accepted. Refreshing your client list… Their private check-ins remain private unless they share them.");
        try {
          await onAccepted?.();
          setMessage("Connection accepted. The client is now on your caseload. Their private check-ins remain private unless they share them.");
        } catch {
          setMessage("Connection accepted. Your client list could not refresh just now; refresh the page to see the new connection.");
        }
      } else {
        setMessage("Request declined.");
      }
    } catch (error) {
      setMessage(error?.message || "Your response couldn’t be saved.");
    } finally { setWorkingId(""); }
  };

  return <section id={id} tabIndex={id ? -1 : undefined} style={style} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5" aria-labelledby="connection-requests-title"><div className="mb-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-200/10 text-amber-100"><HeartHandshake className="h-5 w-5" /></span><div><h2 id="connection-requests-title" className="font-medium text-white">{title}</h2><p className="text-xs text-white/50">{description}</p></div><span className="ml-auto rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/75" aria-label={loadError ? "Request count unavailable" : `${requests.length} requests`}>{loadError ? "—" : requests.length}</span></div>
    {loadError ? <div role="alert" className="rounded-xl border border-amber-100/15 bg-amber-100/[0.04] p-4 text-sm text-amber-50/80"><p>{appVerificationFailed ? "You’re signed in, but WellnessCafe couldn’t verify this browser connection. Reload the page once to restart secure verification." : loadError}</p>{appVerificationFailed ? null : <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={load} className="min-h-10 rounded-lg border border-amber-100/25 px-3 text-sm text-amber-50 hover:bg-amber-100/10">Try again</button>{(/please sign in|sign in with the practitioner account/i.test(loadError) && !isSignedIn) && <button type="button" onClick={onSignIn} className="min-h-10 rounded-lg bg-amber-200 px-3 text-sm font-semibold text-slate-950 hover:bg-amber-100">Sign in</button>}</div>}</div> : <>
    {message && <p role="status" className="mb-3 rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-white/75">{message}</p>}
    {loading ? <div className="flex items-center gap-2 py-5 text-sm text-white/50"><Loader2 className="h-4 w-4 animate-spin" />Loading requests…</div> : requests.length ? <div className="space-y-3">{requests.map((request) => <article key={request.id} className="rounded-xl border border-white/10 bg-slate-950/45 p-4"><p className="font-medium text-white">{request.requesterName}</p>{request.introduction && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/65">{request.introduction}</p>}<p className="mt-2 text-xs text-white/40">Accepting connects you, but does not give access to the person’s private check-ins or assessments.</p><div className="mt-3 flex gap-2"><button type="button" disabled={!!workingId} onClick={() => respond(request.id, "accept")} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-300 px-3 text-sm font-medium text-slate-950 disabled:opacity-50">{workingId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Accept</button><button type="button" disabled={!!workingId} onClick={() => respond(request.id, "decline")} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-white/70 disabled:opacity-50"><X className="h-4 w-4" />Decline</button></div></article>)}</div> : <p className="rounded-xl bg-slate-950/35 p-4 text-sm leading-relaxed text-white/55">No new requests. When someone finds your verified profile, introductions will arrive here.</p>}
    </>}
  </section>;
}
