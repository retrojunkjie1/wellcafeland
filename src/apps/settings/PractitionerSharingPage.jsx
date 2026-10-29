import React, { useEffect, useState } from "react";
import { Activity, ArrowRight, BookOpen, CalendarDays, ClipboardList, Download, HeartPulse, LifeBuoy, LockKeyhole, RefreshCw, Save, ShieldCheck, UserRound } from "lucide-react";
import { listMyPractitionerShares, setPractitionerShare, endMyPractitionerConnection, exportMyWellnessData } from "@/services/practitionerRegistry";
import PageHeader from "@/components/navigation/PageHeader";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatWellnessDataReport } from "./wellnessDataReport";

const SCOPE_OPTIONS = [
  ["recoveryProgress", "Recovery progress", "Sober or clean days, craving and trigger ratings. Written details stay private.", Activity],
  ["wellnessPatterns", "Wellness patterns", "Mood, energy, stress, sleep, support needs, activities, and skills you choose to record.", HeartPulse],
  ["writtenReflections", "Written reflections", "Your written craving or trigger details, gratitude, and journal entries.", BookOpen],
  ["assessments", "Assessment answers", "Your saved assessment answers and completion dates. Assessment summaries are not a diagnosis.", ClipboardList],
  ["visitPreparation", "Visit-preparation sheets", "Only the fields you select on each sheet, shared with that practitioner for an upcoming visit. Private after-visit notes are never shared.", CalendarDays],
  ["careCoordination", "Practical-help requests", "Requests you create and explicitly share with this practitioner, including only selected fields. Turning this off revokes access to existing requests; turning it back on does not reshare them. You can reshare each request from its tracker.", LifeBuoy],
];

function SharingFlowVisual({ share, scopes, isDirty = false, sharingPaused = false }) {
  const enabled = SCOPE_OPTIONS.filter(([key]) => scopes?.[key] === true);
  const status = !share
    ? "No connection yet. Nothing is shared."
    : sharingPaused
      ? "Sharing is paused. Practitioners cannot view these categories right now."
      : isDirty
        ? `Draft: ${enabled.length} of ${SCOPE_OPTIONS.length} categories selected. Changes apply when you save.`
        : enabled.length
          ? `${enabled.length} of ${SCOPE_OPTIONS.length} categories selected for ${share.name}.`
          : `Nothing is shared with ${share.name}.`;

  return (
    <section aria-label={share ? `Sharing map for ${share.name}` : "How practitioner sharing works"} className="rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900 to-slate-950 p-4 sm:p-5">
      <div className="grid items-center gap-3 md:grid-cols-[minmax(8rem,1fr)_auto_minmax(18rem,2fr)_auto_minmax(8rem,1fr)]">
        <div className="flex min-h-[4.5rem] items-center gap-3 rounded-xl border border-sky-200/15 bg-sky-100/[0.04] px-3 py-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-100/10 text-sky-100"><UserRound className="h-5 w-5" /></span>
          <span><span className="block text-sm font-semibold text-white">Your account</span><span className="block text-sm text-slate-300">Private by default</span></span>
        </div>
        <ArrowRight aria-hidden="true" className="mx-auto h-5 w-5 rotate-90 text-slate-500 md:rotate-0" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Sharing categories">
          {SCOPE_OPTIONS.map(([key, title, , _Icon]) => {
            const selected = scopes?.[key] === true;
            const showLock = !selected || sharingPaused;
            return <div key={key} title={title} className={`flex min-h-[3.5rem] items-center gap-2 rounded-xl border px-2.5 py-2 ${selected && !sharingPaused ? "border-amber-200/45 bg-amber-100/[0.09] text-amber-50" : "border-white/10 bg-black/15 text-slate-300"}`}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.05]"><_Icon className="h-4 w-4" /></span>
              <span className="min-w-0 flex-1 text-sm leading-snug">{title}</span>
              {showLock && <LockKeyhole aria-label="Private" className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
            </div>;
          })}
        </div>
        <ArrowRight aria-hidden="true" className="mx-auto h-5 w-5 rotate-90 text-slate-500 md:rotate-0" />
        <div className={`flex min-h-[4.5rem] items-center gap-3 rounded-xl border px-3 py-2.5 ${share ? "border-emerald-200/15 bg-emerald-100/[0.04]" : "border-white/10 bg-black/15"}`}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-emerald-100">{sharingPaused ? <LockKeyhole className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}</span>
          <span><span className="block text-sm font-semibold text-white">{share?.name || "No connection"}</span><span className="block text-sm text-slate-300">{share ? (sharingPaused ? "Access paused" : "Only selected items") : "Connect to begin"}</span></span>
        </div>
      </div>
      <p aria-live="polite" className="mt-3 text-base leading-relaxed text-slate-200">{status}</p>
    </section>
  );
}

export default function PractitionerSharingPage() {
  const { user, loading: authLoading } = useAuth();
  const [shares, setShares] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [confirmEnd, setConfirmEnd] = useState("");
  const [ending, setEnding] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [sharingPaused, setSharingPaused] = useState(false);
  const [sharingStatusUnknown, setSharingStatusUnknown] = useState(false);

  useEffect(() => () => {
    if (exportUrl) URL.revokeObjectURL(exportUrl);
  }, [exportUrl]);

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await listMyPractitionerShares();
      setShares(result.shares || []);
      setDrafts(Object.fromEntries((result.shares || []).map((share) => [share.practitionerId, share.scopes || {}])));
      setSharingPaused(result.sharingPaused === true);
      setSharingStatusUnknown(result.sharingStatusUnknown === true);
    } catch { setLoadError("Your sharing settings could not be loaded."); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (!authLoading && user && !user.isAnonymous) load(); else if (!authLoading) setLoading(false); }, [authLoading, user]);

  const save = async (practitionerId) => {
    setSaving(practitionerId); setError(""); setNotice("");
    try {
      const savedScopes = drafts[practitionerId] || {};
      await setPractitionerShare(practitionerId, savedScopes);
      setShares((current) => current.map((share) => share.practitionerId === practitionerId
        ? { ...share, scopes: savedScopes }
        : share));
      setNotice("Your sharing choices were saved. You can change them at any time.");
    } catch (err) { setError(err?.message || "We could not save your choices. Please try again."); }
    finally { setSaving(""); }
  };

  const endConnection = async (practitionerId) => {
    setEnding(practitionerId); setError(""); setNotice("");
    try {
      const result = await endMyPractitionerConnection(practitionerId);
      setConfirmEnd("");
      setNotice(result.cancelledSessions
        ? `Connection ended. Sharing is off and ${result.cancelledSessions} future ${result.cancelledSessions === 1 ? "session was" : "sessions were"} cancelled.`
        : "Connection ended. Sharing is off and there were no future sessions to cancel.");
      await load();
    } catch (err) { setError(err?.message || "The connection could not be ended. Please try again."); }
    finally { setEnding(""); }
  };

  const download = async () => {
    setExporting(true); setError(""); setNotice("");
    try {
      const data = await exportMyWellnessData();
      if (exportUrl) URL.revokeObjectURL(exportUrl);
      const blob = new Blob([formatWellnessDataReport(data)], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      setExportUrl(url);
      setNotice("Your readable report is ready. Select Download readable report to save it to your device.");
    } catch (err) { setError(err?.message || "Your export could not be prepared."); }
    finally { setExporting(false); }
  };

  if (authLoading) return <main className="min-h-[50vh] grid place-items-center bg-slate-950 text-white">Checking your account…</main>;
  if (!user || user.isAnonymous) return <main className="min-h-[70vh] bg-slate-950 px-4 py-12 text-white sm:px-6"><section className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-9"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-100/70">Private account tools</p><h1 className="mt-3 text-3xl font-semibold">Your sharing and data</h1><p className="mt-3 leading-relaxed text-white/65">This screen needs a personal account so we can safely find your saved check-ins and keep sharing choices attached to you.</p><div className="mt-6 flex flex-wrap gap-3"><Link to="/login" state={{ from: { pathname: "/settings/practitioner-sharing" } }} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-200 px-5 font-semibold text-slate-950">Sign in</Link><Link to="/signup" state={{ from: { pathname: "/settings/practitioner-sharing" } }} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-5 text-sm text-white/80">Create an account</Link></div></section></main>;

  return <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6">
    <div className="mx-auto max-w-3xl"><PageHeader title="Your practitioner sharing" subtitle="You choose what each connected practitioner can see." showBack backTo="/settings/privacy" />
      <section className="mb-5 rounded-2xl border border-sky-200/15 bg-sky-200/[0.045] p-4 text-base leading-relaxed text-white/85"><LockKeyhole className="mr-2 inline h-4 w-4 text-sky-200" />Check-ins and assessments are private by default. A connection alone does not share them. You choose each category and can turn it off whenever you choose.</section>
      {sharingPaused && <section role="status" className="mb-5 rounded-2xl border border-amber-200/20 bg-amber-100/[0.06] p-4 text-sm leading-relaxed text-amber-50/85"><strong className="block font-semibold text-amber-50">Sharing is temporarily paused{sharingStatusUnknown ? " while availability is checked" : ""}.</strong><span className="mt-1 block">Practitioners cannot view anything you have shared right now, including visit preparations and practical-help requests. Your saved choices stay on your account, and you can still turn any active choice off. New sharing choices will be available when sharing resumes.</span></section>}
      {error && <p role="alert" className="mb-4 rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">{notice}</p>}
      {loading ? <p className="py-10 text-center text-white/70" role="status">Loading your choices…</p> : loadError ? <section className="rounded-2xl border border-amber-200/15 bg-amber-200/[0.05] p-5" role="alert"><h2 className="font-semibold text-amber-50">Your sharing choices couldn’t load</h2><p className="mt-2 text-base leading-relaxed text-white/80">Your existing choices have not been changed. Try again to check which practitioners you’re connected with.</p><button type="button" onClick={load} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm text-white/85 hover:bg-white/[0.05]"><RefreshCw className="h-4 w-4" />Try again</button></section> : shares.length ? <div className="space-y-4">{shares.map((share) => {
        const scopes = drafts[share.practitionerId] || {};
        const isDirty = SCOPE_OPTIONS.some(([key]) => (scopes[key] === true) !== (share.scopes?.[key] === true));
        return <section key={share.practitionerId} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{share.name}</h2><p className="mt-1 text-sm capitalize text-white/50">{share.type}</p></div><ShieldCheck className="h-5 w-5 text-emerald-200" /></div>
        <div className="mt-4"><SharingFlowVisual share={share} scopes={scopes} isDirty={isDirty} sharingPaused={sharingPaused} /></div>
        <div className="mt-5 space-y-3">{SCOPE_OPTIONS.map(([key, title, detail]) => { const checked = scopes[key] === true; const lockedFromEnabling = sharingPaused && !checked; return <label key={key} className={`flex items-start gap-3 rounded-xl border border-white/8 bg-slate-950/35 p-3 ${lockedFromEnabling ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}><input type="checkbox" className="mt-1 h-4 w-4 accent-amber-300" checked={checked} disabled={lockedFromEnabling} onChange={(event) => setDrafts((current) => ({ ...current, [share.practitionerId]: { ...current[share.practitionerId], [key]: event.target.checked } }))} /><span><span className="block text-base font-medium">{title}</span><span className="mt-1 block text-sm leading-relaxed text-white/70">{detail}</span></span></label>; })}</div>
        <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={() => save(share.practitionerId)} disabled={saving === share.practitionerId || ending === share.practitionerId} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950 disabled:opacity-50"><Save className="h-4 w-4" />{saving === share.practitionerId ? "Saving…" : "Save sharing choices"}</button><button type="button" onClick={() => setConfirmEnd((current) => current === share.practitionerId ? "" : share.practitionerId)} disabled={saving === share.practitionerId || ending === share.practitionerId} className="inline-flex min-h-11 items-center rounded-xl border border-rose-200/20 px-4 text-sm text-rose-100/80 hover:bg-rose-200/[0.06] disabled:opacity-50">End connection</button></div>
        {confirmEnd === share.practitionerId && <div className="mt-3 rounded-xl border border-rose-200/20 bg-rose-200/[0.05] p-4"><p className="text-sm leading-relaxed text-white/75">This turns off sharing and cancels future sessions with this practitioner. Your personal check-ins remain yours.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => endConnection(share.practitionerId)} disabled={ending === share.practitionerId} className="min-h-10 rounded-lg bg-rose-200 px-3 text-sm font-semibold text-slate-950 disabled:opacity-50">{ending === share.practitionerId ? "Ending connection…" : "Confirm and end connection"}</button><button type="button" onClick={() => setConfirmEnd("")} disabled={ending === share.practitionerId} className="min-h-10 rounded-lg border border-white/15 px-3 text-sm text-white/75">Keep connection</button></div></div>}
      </section>;
      })}</div> : <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-100/80">Your privacy boundary</p><h2 className="mt-2 text-xl font-semibold">No connected practitioners yet</h2><p className="mt-2 max-w-2xl text-base leading-relaxed text-white/80">Nothing is shared. After you connect, you can choose exactly which categories a practitioner may see.</p><div className="mt-4"><SharingFlowVisual share={null} scopes={{}} /></div><Link to="/providers" state={{ from: { pathname: "/settings/practitioner-sharing" } }} className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl border border-amber-200/35 px-4 text-base font-medium text-amber-100 hover:bg-amber-100/[0.06]">Explore practitioners <ArrowRight className="h-4 w-4" /></Link></section>}
      <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-5"><h2 className="text-lg font-semibold">Take a copy of your data</h2><p className="mt-2 text-base leading-relaxed text-white/75">Download a readable report of the information available in your signed-in account. It is not sent to a practitioner.</p><button type="button" onClick={download} disabled={exporting} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white disabled:opacity-50"><Download className="h-4 w-4" />{exporting ? "Preparing your file…" : "Prepare my data download"}</button>{exportUrl && <a href={exportUrl} download={`wellnesscafe-my-data-${new Date().toISOString().slice(0, 10)}.txt`} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950"><Download className="h-4 w-4" />Download readable report</a>}<p className="mt-3 text-sm text-white/55">Open it in Notes, Word, or any text editor.</p></section>
    </div>
  </main>;
}
