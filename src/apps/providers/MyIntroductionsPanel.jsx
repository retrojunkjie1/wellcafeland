import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownLeft, CalendarDays, Check, Clock3, MessageCircle, RefreshCw, ShieldCheck, X } from "lucide-react";
import { listMyPractitionerConnectionRequests } from "@/services/practitionerRegistry";

const STATUS = {
  pending: { label: "Waiting for a reply", Icon: Clock3, tone: "text-amber-100 bg-amber-200/10 border-amber-200/15" },
  accepted: { label: "Connection accepted", Icon: Check, tone: "text-emerald-100 bg-emerald-200/10 border-emerald-200/15" },
  declined: { label: "Not available for a connection", Icon: X, tone: "text-white/65 bg-white/[0.04] border-white/10" },
};

function explainLoadError(error) {
  const code = String(error?.code || "").replace(/^functions\//, "");
  if (code === "unauthenticated") return "Sign in with your personal account to see your introduction history.";
  if (code === "permission-denied") return "This account can’t access that introduction history. Sign in with the account you used to contact practitioners.";
  if (["unavailable", "deadline-exceeded", "network-request-failed"].includes(code)) {
    return "We couldn’t reach your introduction history. Check your connection and refresh in a moment.";
  }
  return "We couldn’t load your introductions right now. Your request history hasn’t been changed. Please refresh in a moment.";
}

export default function MyIntroductionsPanel({ user, onRequestsLoaded }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!user || user.isAnonymous) return;
    setLoading(true);
    setError("");
    try {
      const result = await listMyPractitionerConnectionRequests();
      const nextRequests = result.requests || [];
      setRequests(nextRequests);
      onRequestsLoaded?.(nextRequests);
    } catch (err) {
      setError(explainLoadError(err));
    } finally {
      setLoading(false);
    }
  }, [onRequestsLoaded, user]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <section className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-r from-amber-100/[0.055] via-white/[0.025] to-emerald-100/[0.045] p-5 sm:p-6" aria-labelledby="my-introductions-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-amber-100/10 bg-amber-100/[0.07] text-amber-100"><ArrowDownLeft className="h-5 w-5" /></span>
          <div><h2 id="my-introductions-title" className="font-semibold text-white">Your introductions</h2><p className="mt-0.5 text-xs text-white/50">See replies to the practitioners you contacted</p></div>
        </div>
        {user && !user.isAnonymous && <button type="button" onClick={refresh} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-white/75 transition hover:bg-white/[0.06] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>}
      </div>

      {!user || user.isAnonymous ? (
        <div className="mt-4 rounded-2xl border border-white/[0.08] bg-slate-950/30 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <p className="text-sm leading-relaxed text-white/65">Sign in with your personal account to track introductions and read replies. Browsing remains open to guests.</p>
          <Link to="/login" state={{ from: { pathname: "/providers" } }} className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg bg-amber-200 px-4 text-sm font-semibold text-slate-950 sm:mt-0">Sign in</Link>
        </div>
      ) : loading && requests.length === 0 ? (
        <p className="mt-4 text-sm text-white/50" role="status">Loading your introductions…</p>
      ) : error ? (
        <div className="mt-4 rounded-xl border border-amber-200/15 bg-amber-200/[0.05] p-4 text-sm text-amber-50" role="alert"><p className="font-medium">Your introductions aren’t available right now</p><p className="mt-1 leading-relaxed text-white/65">{error}</p><button type="button" onClick={refresh} disabled={loading} className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/15 px-3 text-sm text-white/80 transition hover:bg-white/[0.06] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh request status</button></div>
      ) : requests.length ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{requests.map((request) => {
          const state = STATUS[request.status] || STATUS.pending;
          const Icon = state.Icon;
          return <li key={request.id} className="rounded-2xl border border-white/[0.08] bg-slate-950/35 p-4">
            <div className="flex items-start justify-between gap-3"><p className="font-medium text-white">{request.practitionerName}</p><span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] ${state.tone}`}><Icon className="h-3.5 w-3.5" />{state.label}</span></div>
            <p className="mt-2 text-xs leading-relaxed text-white/50">{request.status === "accepted" ? "You’re connected. Your check-ins and assessments stay private unless you choose to share them." : request.status === "pending" ? "We’ll show the reply here when you check again." : "You can explore other reviewed profiles whenever you’re ready."}</p>
            {request.createdAt && <time className="mt-3 block text-[11px] text-white/35" dateTime={request.createdAt}>{new Date(request.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</time>}
            {request.status === "accepted" && <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Link to={`/my-practitioner-messages?practitionerId=${encodeURIComponent(request.practitionerId)}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-amber-200 px-3 text-sm font-semibold text-slate-950"><MessageCircle className="h-4 w-4" />Open messages</Link>
              <Link to="/settings/practitioner-sharing" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/80 transition hover:bg-white/[0.06]"><ShieldCheck className="h-4 w-4" />Choose what to share</Link>
              <Link to="/home#client-sessions" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/80 transition hover:bg-white/[0.06] sm:col-span-2"><CalendarDays className="h-4 w-4" />Request a session</Link>
            </div>}
          </li>;
        })}</ul>
      ) : (
        <p className="mt-4 rounded-2xl border border-white/[0.08] bg-slate-950/30 p-4 text-sm leading-relaxed text-white/55">You haven’t requested an introduction yet. When you contact someone below, their reply will appear here.</p>
      )}
      {loading && requests.length > 0 && <p className="mt-3 text-xs text-white/40" role="status">Updating…</p>}
    </section>
  );
}
