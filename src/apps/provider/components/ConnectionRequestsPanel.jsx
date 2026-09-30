import React, { useCallback, useEffect, useState } from "react";
import { Check, HeartHandshake, Loader2, X } from "lucide-react";
import { listPractitionerConnectionRequests, respondToPractitionerConnection } from "@/services/practitionerRegistry";

export default function ConnectionRequestsPanel({ onAccepted }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPractitionerConnectionRequests();
      setRequests(data.requests || []);
      setMessage("");
    } catch (error) {
      setMessage(error?.message || "Connection requests couldn’t load.");
    } finally { setLoading(false); }
  }, []);

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

  return <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5" aria-labelledby="connection-requests-title"><div className="mb-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-200/10 text-amber-100"><HeartHandshake className="h-5 w-5" /></span><div><h2 id="connection-requests-title" className="font-medium text-white">Connection requests</h2><p className="text-xs text-white/50">People asking to work with you</p></div><span className="ml-auto rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/75">{requests.length}</span></div>
    {message && <p role="status" className="mb-3 rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-white/75">{message}</p>}
    {loading ? <div className="flex items-center gap-2 py-5 text-sm text-white/50"><Loader2 className="h-4 w-4 animate-spin" />Loading requests…</div> : requests.length ? <div className="space-y-3">{requests.map((request) => <article key={request.id} className="rounded-xl border border-white/10 bg-slate-950/45 p-4"><p className="font-medium text-white">{request.requesterName}</p>{request.introduction && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/65">{request.introduction}</p>}<p className="mt-2 text-xs text-white/40">Accepting connects you, but does not give access to the person’s private check-ins or assessments.</p><div className="mt-3 flex gap-2"><button type="button" disabled={!!workingId} onClick={() => respond(request.id, "accept")} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-300 px-3 text-sm font-medium text-slate-950 disabled:opacity-50">{workingId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Accept</button><button type="button" disabled={!!workingId} onClick={() => respond(request.id, "decline")} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-white/70 disabled:opacity-50"><X className="h-4 w-4" />Decline</button></div></article>)}</div> : <p className="rounded-xl bg-slate-950/35 p-4 text-sm leading-relaxed text-white/55">No new requests. When someone finds your verified profile, introductions will arrive here.</p>}
  </section>;
}
