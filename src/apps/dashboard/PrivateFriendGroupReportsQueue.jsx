import React, { useCallback, useEffect, useState } from "react";
import { Flag, RefreshCw } from "lucide-react";
import { listOpenPrivateFriendCircleReports, reviewPrivateFriendCircleReport } from "@/services/friendCirclesService";

export default function PrivateFriendGroupReportsQueue() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState("");
  const [notes, setNotes] = useState({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setReports(await listOpenPrivateFriendCircleReports());
    } catch (loadError) {
      setError(loadError?.code === "functions/permission-denied"
        ? "Your admin role does not include platform operations review."
        : "Private group reports could not be loaded. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const review = async (report, action) => {
    const reviewNote = (notes[report.id] || "").trim();
    if (reviewNote.length < 15) {
      setError("Add a short review note of at least 15 characters before closing a report.");
      return;
    }
    setWorking(report.id);
    setError("");
    try {
      await reviewPrivateFriendCircleReport(report.id, action, reviewNote);
      setReports((current) => current.filter((item) => item.id !== report.id));
    } catch (reviewError) {
      setError(reviewError?.message || "The review was not saved. Refresh and try again.");
    } finally {
      setWorking("");
    }
  };

  return <section className="mt-4 rounded-2xl border border-amber-100/15 bg-amber-100/[0.025] p-4" aria-labelledby="private-friend-group-reports-title">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2"><Flag className="h-4 w-4 text-amber-100" /><div><h3 id="private-friend-group-reports-title" className="font-semibold text-foreground">Private group safety reports</h3><p className="mt-1 text-xs text-muted-foreground">Reports include a message reference and reason, not copied message text.</p></div></div>
      <button type="button" onClick={refresh} disabled={loading} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-white/70 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Refresh</button>
    </div>
    {error && <p role="alert" className="mt-3 rounded-lg border border-rose-100/15 p-3 text-sm text-rose-100/80">{error}</p>}
    {loading ? <p className="mt-3 text-sm text-white/45">Loading reports…</p> : reports.length === 0 ? <p className="mt-3 rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/50">No open private group reports.</p> : <div className="mt-3 space-y-3">{reports.map((report) => <article key={report.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
      <div className="flex flex-wrap justify-between gap-2 text-xs text-white/55"><span>{report.reason.replaceAll("_", " ")}</span><time>{report.createdAt ? new Date(report.createdAt).toLocaleString() : "Time unavailable"}</time></div>
      <p className="mt-2 text-xs text-white/50">Group {report.circleId} · message {report.messageId} · reported account {report.reportedUid}</p>
      {report.details && <p className="mt-2 text-sm text-white/75">Reporter note: {report.details}</p>}
      <label className="mt-3 block text-xs text-white/60">Review note<textarea value={notes[report.id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [report.id]: event.target.value }))} minLength={15} maxLength={500} rows={2} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white" placeholder="Record the action taken or why the report was dismissed." /></label>
      <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => review(report, "dismiss")} disabled={!!working} className="min-h-9 rounded-lg border border-white/10 px-3 text-xs text-white/70 disabled:opacity-50">Dismiss</button><button type="button" onClick={() => review(report, "resolve")} disabled={!!working} className="min-h-9 rounded-lg bg-amber-100 px-3 text-xs font-semibold text-slate-950 disabled:opacity-50">{working === report.id ? "Saving…" : "Resolve"}</button></div>
    </article>)}</div>}
  </section>;
}
