import React, { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowRight, Database, LockKeyhole, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { deleteMyCheckIns, exportMyWellnessData } from "@/services/practitionerRegistry";
import { runWellnessExperience } from "@/ai/experience/experienceEngine";
import { formatWellnessDataReport } from "./wellnessDataReport";

const STEWARD_TOPICS = [
  ["sharing", "What can a practitioner see?"],
  ["export", "What is in my download?"],
  ["deletion", "What does delete check-ins remove?"],
  ["retention", "How long is my data kept?"],
];

const PrivacySettingsPage = () => {
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [exportUrl, setExportUrl] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingCheckIns, setDeletingCheckIns] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [stewardTopic, setStewardTopic] = useState("sharing");
  const [stewardAnswer, setStewardAnswer] = useState("");
  const [stewardState, setStewardState] = useState({ loading: false, error: "" });

  useEffect(() => () => {
    if (exportUrl) URL.revokeObjectURL(exportUrl);
  }, [exportUrl]);

  const downloadData = async () => {
    setExporting(true);
    setExportMessage("");
    try {
      const data = await exportMyWellnessData();
      if (exportUrl) URL.revokeObjectURL(exportUrl);
      const url = URL.createObjectURL(new Blob([formatWellnessDataReport(data)], { type: "text/plain;charset=utf-8" }));
      setExportUrl(url);
      setExportMessage("Your readable report is ready. Select Download readable report to save it to your device.");
    } catch (error) {
      setExportMessage(error?.message || "Your account export could not be prepared. Try again when you are online.");
    } finally {
      setExporting(false);
    }
  };

  const removeCheckIns = async () => {
    if (deleteConfirmation.trim().toUpperCase() !== "DELETE") return;
    setDeletingCheckIns(true);
    setDeleteMessage("");
    try {
      let totalDeleted = 0;
      let complete = false;
      while (!complete) {
        const result = await deleteMyCheckIns();
        if (typeof result.complete !== "boolean") throw new Error("Incomplete deletion response");
        totalDeleted += Math.max(0, Number(result.deletedCount) || 0);
        complete = result.complete;
        if (!complete) setDeleteMessage(`Removing saved check-ins… ${totalDeleted} removed so far.`);
      }
      setDeleteMessage(totalDeleted
        ? `Check-in deletion is complete. ${totalDeleted} saved ${totalDeleted === 1 ? "check-in was" : "check-ins were"} removed. Refresh to update progress views.`
        : "No saved check-ins were found to remove. The request is complete.");
      setDeleteConfirmation("");
    } catch {
      setDeleteMessage("Deletion did not finish. You can run it again; check-ins already removed will stay deleted.");
    } finally {
      setDeletingCheckIns(false);
    }
  };

  const askSteward = async () => {
    setStewardState({ loading: true, error: "" });
    setStewardAnswer("");
    try {
      const { result } = await runWellnessExperience("privacy.explanation", { topicId: stewardTopic });
      setStewardAnswer(result?.answer || "");
      setStewardState({ loading: false, error: "" });
    } catch (error) {
      setStewardState({ loading: false, error: error?.message || "This explanation is unavailable right now. Please use the controls shown on this page." });
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/70">Your space</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Privacy & your data</h1>
        <p className="mt-2 text-sm text-white/60">See what you can manage here and go straight to the controls that work.</p>
      </header>

      <section className="wc-privacy-data-card mb-4 rounded-3xl border border-white/10 bg-gradient-to-br from-[#111827] to-[#0d1420] p-4 sm:p-6" aria-labelledby="data-heading">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200"><Database className="h-5 w-5" /></span>
          <div>
            <h2 id="data-heading" className="text-lg font-semibold text-white">Your account data</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/60">Download the data WellnessCafe has stored for your account. The file is prepared when you request it.</p>
          </div>
        </div>
        <button type="button" onClick={downloadData} disabled={exporting}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-200 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-100 disabled:cursor-wait disabled:opacity-60">
          <ArrowDownToLine className="h-4 w-4" />{exporting ? "Preparing your file…" : "Download my data"}
        </button>
        {exportMessage && <p role="status" className="mt-3 text-sm text-white/75">{exportMessage}</p>}
        {exportUrl && <a href={exportUrl} download={`wellnesscafe-my-data-${new Date().toISOString().slice(0, 10)}.txt`} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-200 px-5 text-sm font-semibold text-slate-950 hover:bg-amber-100"><ArrowDownToLine className="h-4 w-4" />Download readable report</a>}
        <p className="mt-3 text-sm text-white/55">Your download is a plain-text report you can read in Notes, Word, or any text editor.</p>
      </section>

      <section className="mb-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5" aria-labelledby="steward-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="steward-heading" className="text-base font-semibold text-white">Need a plain-language explanation?</h2>
            <p className="mt-1 text-sm text-white/60">Steward explains the controls on this page. Only your selected topic is sent; no account records are included.</p>
          </div>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/55">General information</span>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="steward-topic">Choose a privacy question</label>
          <select id="steward-topic" value={stewardTopic} disabled={stewardState.loading} onChange={(event) => setStewardTopic(event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/15 bg-slate-950/70 px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-amber-200/60">
            {STEWARD_TOPICS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          <button type="button" onClick={askSteward} disabled={stewardState.loading} className="min-h-11 rounded-full border border-amber-200/30 px-4 text-sm font-semibold text-amber-100 transition hover:bg-amber-100/10 disabled:cursor-wait disabled:opacity-50">{stewardState.loading ? "Preparing explanation…" : "Explain this"}</button>
        </div>
        {stewardState.error && <p role="alert" className="mt-3 text-sm text-rose-200">{stewardState.error}</p>}
        {stewardAnswer && <p aria-live="polite" className="mt-3 rounded-xl border border-emerald-200/15 bg-emerald-100/[0.04] p-3 text-sm leading-relaxed text-white/80">{stewardAnswer}</p>}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5" aria-labelledby="sharing-heading">
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200"><Users className="h-5 w-5" /></span>
          <h2 id="sharing-heading" className="text-base font-semibold text-white">Practitioner access</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/60">Choose what each connected practitioner can see. Your check-ins are not shared just because you have an account.</p>
          <Link to="/settings/practitioner-sharing" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-amber-200 hover:text-amber-100">Review sharing <ArrowRight className="h-4 w-4" /></Link>
        </section>
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5" aria-labelledby="memory-heading">
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-300/10 text-violet-200"><LockKeyhole className="h-5 w-5" /></span>
          <h2 id="memory-heading" className="text-base font-semibold text-white">Guide conversation memory</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/60">If you turn memory on, saved guide exchanges stay until you clear them. Review, switch off, or clear them in Personal support.</p>
          <Link to="/settings/wellness" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-amber-200 hover:text-amber-100">Open Personal support <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </div>

      <section className="mt-4 rounded-2xl border border-rose-200/15 bg-rose-950/10 p-4 sm:p-5" aria-labelledby="delete-checkins-heading">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-300/10 text-rose-200"><Trash2 aria-hidden="true" className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <h2 id="delete-checkins-heading" className="text-sm font-semibold text-white">Delete saved check-ins</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/65">This permanently removes check-in entries from your account. Your check-in history, milestones, and any practitioner view of those entries will change. It does not delete your account, plans, messages, appointments, or practitioner connections.</p>
            <label className="mt-4 block text-sm text-white/75" htmlFor="delete-checkins-confirmation">Type <span className="font-semibold text-white">DELETE</span> to confirm</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input id="delete-checkins-confirmation" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} autoComplete="off" className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/15 bg-slate-950/70 px-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-rose-200/60" />
              <button type="button" onClick={removeCheckIns} disabled={deletingCheckIns || deleteConfirmation.trim().toUpperCase() !== "DELETE"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-rose-200/30 px-4 text-sm font-semibold text-rose-100 transition hover:bg-rose-200/10 disabled:cursor-not-allowed disabled:opacity-45">
                <Trash2 aria-hidden="true" className="h-4 w-4" />{deletingCheckIns ? "Deleting check-ins…" : "Delete my check-ins"}
              </button>
            </div>
            {deleteMessage && <p role="status" className="mt-3 text-sm text-white/80">{deleteMessage}</p>}
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5" aria-labelledby="retention-heading">
        <h2 id="retention-heading" className="text-sm font-semibold text-white">How long is data kept?</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">Saved check-ins remain in your account until you delete them. Guide memory stays until you clear it. Automatic timed deletion is not available yet.</p>
      </section>
    </main>
  );
};

export default PrivacySettingsPage;
