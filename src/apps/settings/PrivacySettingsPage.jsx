import React, { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowRight, Database, LockKeyhole, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { exportMyWellnessData } from "@/services/practitionerRegistry";

const PrivacySettingsPage = () => {
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [exportUrl, setExportUrl] = useState("");

  useEffect(() => () => {
    if (exportUrl) URL.revokeObjectURL(exportUrl);
  }, [exportUrl]);

  const downloadData = async () => {
    setExporting(true);
    setExportMessage("");
    try {
      const data = await exportMyWellnessData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      setExportUrl(url);
      setExportMessage("Your file is ready. Select Download ready file to save it to your device.");
    } catch (error) {
      setExportMessage(error?.message || "Your account export could not be prepared. Try again when you are online.");
    } finally {
      setExporting(false);
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
        {exportUrl && <a href={exportUrl} download={`wellnesscafe-data-${new Date().toISOString().slice(0, 10)}.json`} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-200 px-5 text-sm font-semibold text-slate-950 hover:bg-amber-100"><ArrowDownToLine className="h-4 w-4" />Download ready file</a>}
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

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5" aria-labelledby="retention-heading">
        <h2 id="retention-heading" className="text-sm font-semibold text-white">How long is data kept?</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">Guide memory stays in your account until you clear it. A timed delete option is not available yet, so this page does not show a retention dropdown that could imply automatic deletion.</p>
      </section>
    </main>
  );
};

export default PrivacySettingsPage;
