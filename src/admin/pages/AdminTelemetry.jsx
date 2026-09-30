import React, { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { Activity, Search, RotateCw, ShieldCheck, ShieldAlert, Eye } from "lucide-react";
import { functions } from "@/firebase";

const FEATURE_LABELS = {
  home: "Home",
  assistance: "Find help",
  providers: "Practitioner directory",
  schedule: "Scheduling",
  sessions: "Sessions",
  check_in: "Check-ins",
  practice: "Daily practice",
  guide: "AI guide",
  profile: "Profile",
  settings: "Settings",
  admin: "Admin workspace",
  account: "Account & workspace",
  other: "Other area",
};
const EVENT_LABELS = {
  page_opened: "Opened a page",
  action_started: "Started an action",
  action_succeeded: "Action completed",
  action_failed: "Action did not complete",
  connection_lost: "Connection interrupted",
  connection_restored: "Connection restored",
  runtime_error: "Page error",
  account_event: "Account activity",
  search_results: "Search returned results",
  search_empty: "Search returned no results",
  workspace_changed: "Switched workspace",
  check_in_saved: "Saved a recovery check-in",
  check_in_save_failed: "Recovery check-in did not save",
  practice_added: "Added a shared practice",
  practice_opened: "Opened a shared practice once",
  practice_dismissed: "Dismissed a shared practice",
  practice_action_failed: "Shared-practice action did not complete",
  session_request_sent: "Requested a practitioner session",
  session_request_received: "Received a client session request",
  session_request_failed: "Session request did not send",
  session_request_accepted: "Practitioner accepted a session request",
  session_request_declined: "Practitioner declined a session request",
  session_response_failed: "Practitioner response did not save",
  message_sent: "Sent a practitioner message",
  message_received: "Received a practitioner message",
  message_send_failed: "Practitioner message did not send",
  connection_request_sent: "Requested a practitioner connection",
  connection_request_received: "Received a client connection request",
  connection_request_failed: "Practitioner connection request did not send",
  connection_request_accepted: "Practitioner accepted a connection request",
  connection_request_declined: "Practitioner declined a connection request",
  connection_ended: "Client ended a practitioner connection",
  connection_response_failed: "Practitioner connection response did not save",
};
const WORKSPACE_LABELS = {
  client: "Client space",
  practitioner: "Practitioner space",
  giver: "Community giver space",
  admin: "God-Eye admin",
};
const SECURITY_SIGNAL_LABELS = {
  ai_quota_blocks: "Repeated AI request limits ·",
  message_quota_blocks: "Repeated message rate limits ·",
};

function humanErrorCode(code) {
  if (!code) return "";
  const suffix = code.split("/").pop().replaceAll("-", " ");
  return suffix ? ` · ${suffix}` : "";
}

export function AdminTelemetry() {
  const [email, setEmail] = useState("");
  const [account, setAccount] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [signals, setSignals] = useState([]);
  const [signalsLoaded, setSignalsLoaded] = useState(false);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [signalsError, setSignalsError] = useState("");
  const [reviewingSignalId, setReviewingSignalId] = useState("");

  async function loadSignals() {
    setSignalsLoading(true);
    setSignalsError("");
    try {
      const list = httpsCallable(functions, "listOpenAccountSecuritySignals");
      const result = await list({});
      setSignals(Array.isArray(result.data?.signals) ? result.data.signals : []);
      setSignalsLoaded(true);
    } catch (cause) {
      setSignalsError(cause?.code === "functions/permission-denied"
        ? "Your administrator account is not authorized to view security signals."
        : "Security review signals could not be loaded. Try again.");
    } finally {
      setSignalsLoading(false);
    }
  }

  async function reviewSignal(signalId, outcome) {
    setReviewingSignalId(signalId);
    setSignalsError("");
    try {
      const review = httpsCallable(functions, "reviewAccountSecuritySignal");
      const result = await review({ id: signalId, outcome });
      if (result.data?.status === "open") {
        setSignals((current) => current.map((signal) => signal.id === signalId ? { ...signal, monitorRequested: true } : signal));
      } else {
        setSignals((current) => current.filter((signal) => signal.id !== signalId));
      }
    } catch {
      setSignalsError("That review could not be saved. Refresh the queue and try again.");
    } finally {
      setReviewingSignalId("");
    }
  }

  async function searchAccount(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setAccount(null);
    setEvents([]);
    setSearched(true);
    try {
      const lookup = httpsCallable(functions, "findAdminWorkspaceAccount");
      const { data } = await lookup({ email: email.trim() });
      if (!data?.found || !data.account?.uid) {
        setError("No account was found for that email address.");
        return;
      }
      setAccount({ uid: data.account.uid, email: data.account.email || email.trim() });
      const list = httpsCallable(functions, "listSupportActivityForAdmin");
      const result = await list({ uid: data.account.uid });
      setEvents(Array.isArray(result.data?.events) ? result.data.events : []);
    } catch (cause) {
      setError(cause?.code === "functions/permission-denied"
        ? "Your administrator account is not authorized to view support activity."
        : "Support activity could not be loaded. Check access and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (!account) return;
    setLoading(true);
    setError("");
    try {
      const list = httpsCallable(functions, "listSupportActivityForAdmin");
      const result = await list({ uid: account.uid });
      setEvents(Array.isArray(result.data?.events) ? result.data.events : []);
    } catch {
      setError("Support activity could not be refreshed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-5" aria-labelledby="support-activity-title">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-200">
            <Activity className="h-4 w-4" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">Support workspace</p>
          </div>
          <h2 id="support-activity-title" className="mt-1 text-xl font-semibold text-white">Account activity</h2>
          <p className="mt-1 max-w-2xl text-sm text-white/60">Find a member’s recent app activity when they report a problem. Records are limited to the last 30 days.</p>
        </div>
        {account && (
          <button type="button" onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-50">
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
          </button>
        )}
      </header>

      <section className="rounded-xl border border-amber-200/15 bg-amber-100/[0.035] p-4 sm:p-5" aria-labelledby="security-review-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
            <div>
              <h3 id="security-review-title" className="font-semibold text-white">Security review signals</h3>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/60">Repeated AI or message rate-limit blocks can point to automation or a stuck client. Signals identify an account for human review; they do not prove a person’s identity or intent, and do not automatically suspend anyone.</p>
            </div>
          </div>
          <button type="button" onClick={loadSignals} disabled={signalsLoading} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/80 hover:bg-white/10 disabled:opacity-50">
            {signalsLoaded ? <RotateCw className={`h-4 w-4 ${signalsLoading ? "animate-spin" : ""}`} aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            {signalsLoading ? "Loading…" : signalsLoaded ? "Refresh signals" : "Review signals"}
          </button>
        </div>
        {signalsError && <p role="alert" className="mt-3 rounded-lg border border-rose-300/20 bg-rose-400/[0.06] p-3 text-sm text-rose-100">{signalsError}</p>}
        {signalsLoaded && !signalsLoading && signals.length === 0 && <p className="mt-4 rounded-lg border border-white/10 bg-slate-950/25 p-4 text-sm text-white/60">No accounts currently meet the review threshold.</p>}
        {signals.length > 0 && <ul className="mt-4 divide-y divide-white/10 rounded-lg border border-white/10 bg-slate-950/25">{signals.map((signal) => <li key={signal.id} className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="break-all text-sm font-medium text-white">{signal.email}</p>
            <span className={`rounded-full border px-2.5 py-1 text-xs ${signal.emailVerified ? "border-emerald-200/20 text-emerald-100" : "border-amber-200/20 text-amber-100"}`}>{signal.emailVerified ? "Email verified" : "Email not verified"}</span>
          </div>
          <p className="mt-2 text-sm text-white/70">{SECURITY_SIGNAL_LABELS[signal.signalCode] || "Repeated request limits ·"} {signal.countInWindow} recorded windows in 24 hours</p>
          <p className="mt-1 text-xs text-white/45">Last signal {signal.lastSeenAt ? new Date(signal.lastSeenAt).toLocaleString() : "time unavailable"}. Review the account’s support activity before deciding what to do.</p>
          {signal.monitorRequested && <p role="status" className="mt-2 text-sm text-amber-100">Review saved. This signal remains in the queue for continued monitoring.</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={reviewingSignalId === signal.id} onClick={() => reviewSignal(signal.id, "monitor")} className="min-h-9 rounded-lg border border-amber-100/20 px-3 text-xs font-medium text-amber-100 hover:bg-amber-100/[0.06] disabled:opacity-50">Keep under review</button>
            <button type="button" disabled={reviewingSignalId === signal.id} onClick={() => reviewSignal(signal.id, "no_action")} className="min-h-9 rounded-lg border border-white/10 px-3 text-xs text-white/75 hover:bg-white/[0.05] disabled:opacity-50">No further action</button>
            <button type="button" disabled={reviewingSignalId === signal.id} onClick={() => reviewSignal(signal.id, "false_positive")} className="min-h-9 rounded-lg border border-white/10 px-3 text-xs text-white/75 hover:bg-white/[0.05] disabled:opacity-50">False positive</button>
          </div>
        </li>)}</ul>}
        <p className="mt-3 text-xs leading-relaxed text-white/40">Only the account email, whether Firebase verified that email, signal type, count, and timestamps are shown. No message contents, recovery reflections, IP address, location, device fingerprint, or inferred cross-account identity is collected here. Signals expire after 30 days.</p>
      </section>

      <form onSubmit={searchAccount} className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="support-account-email">Member account email</label>
        <input
          id="support-account-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Member account email"
          className="min-w-0 flex-1 rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-200/30"
        />
        <button type="submit" disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-200 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-100 disabled:opacity-50">
          <Search className="h-4 w-4" aria-hidden="true" /> Find activity
        </button>
      </form>

      <div className="flex items-start gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm text-white/70">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" aria-hidden="true" />
        <p>Completed connection, session, and message actions are system-recorded; app-reported failures are labeled. Introductions, message or check-in content, appointment details, exact searches, and location are excluded.</p>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-300/25 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>}

      {account && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-3">
            <h3 className="font-medium text-white">{account.email}</h3>
            <span className="text-xs text-white/50">Recent activity · up to 100 records</span>
          </div>
          {loading ? <p className="py-6 text-center text-sm text-white/60">Loading activity…</p> : events.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/65">No support activity was recorded for this account in the last 30 days.</div>
          ) : (
            <ol className="divide-y divide-white/10">
              {events.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{item.eventCode === "workspace_changed" && WORKSPACE_LABELS[item.workspace]
                      ? `Switched to ${WORKSPACE_LABELS[item.workspace]}`
                      : EVENT_LABELS[item.eventCode] || "App activity"}{humanErrorCode(item.errorCode)}</p>
                    <p className="mt-0.5 text-sm text-white/60">
                      {FEATURE_LABELS[item.feature] || FEATURE_LABELS.other}
                      {item.source === "server" ? " · System-recorded" : item.source === "reported" ? " · App-reported" : ""}
                    </p>
                  </div>
                  <time className="text-sm tabular-nums text-white/55" dateTime={item.createdAt || undefined}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Time unavailable"}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {!account && !error && !searched && <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/55">Search by the email the member uses to sign in.</div>}
    </section>
  );
}
