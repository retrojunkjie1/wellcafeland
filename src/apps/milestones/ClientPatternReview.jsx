import React, { useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { runWellnessExperience } from "@/ai/experience/experienceEngine";
import { listMyCheckInPatternEntries } from "@/services/checkInHistory";

const FIELDS = [
  ["mood", "Mood choices"],
  ["cravingIntensity", "Craving ratings"],
  ["triggerIntensity", "Trigger intensity ratings"],
  ["energy", "Energy ratings"],
  ["stress", "Stress ratings"],
  ["sleep", "Sleep ratings"],
];
const CONCERNS = ["anxiety", "cravings", "shame", "sleep", "grief", "self-worth"];

export default function ClientPatternReview() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [consent, setConsent] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState(null);
  const [selectedInsight, setSelectedInsight] = useState("");
  const [oracleConsent, setOracleConsent] = useState(false);
  const [oracleLoading, setOracleLoading] = useState(false);
  const [oracleResult, setOracleResult] = useState(null);
  const [concern, setConcern] = useState("cravings");
  const [healerLoading, setHealerLoading] = useState(false);
  const [healerResult, setHealerResult] = useState(null);

  const availableFields = useMemo(() => FIELDS.filter(([key]) => entries.some((entry) => entry.fields[key] !== undefined)), [entries]);
  const reviewedEntries = useMemo(() => entries.map((entry) => ({
    date: entry.date,
    fields: Object.fromEntries(selectedFields.filter((key) => entry.fields[key] !== undefined).map((key) => [key, entry.fields[key]])),
  })).filter((entry) => Object.keys(entry.fields).length > 0), [entries, selectedFields]);
  const canReview = consent && selectedFields.length > 0 && reviewedEntries.length >= 3 && !loading;

  const loadEntries = async () => {
    setLoadingEntries(true);
    setError("");
    try {
      const result = await listMyCheckInPatternEntries(20);
      setEntries(result);
      setSelectedFields([]);
      if (result.length < 3) setError("At least three saved check-ins with a selected detail are needed. You can come back after recording more.");
    } catch {
      setError("Your saved check-ins could not be loaded. They have not been changed.");
    } finally {
      setLoadingEntries(false);
    }
  };

  const requestReview = async () => {
    setLoading(true);
    setError("");
    setReview(null);
    setOracleResult(null);
    setOracleConsent(false);
    setHealerResult(null);
    try {
      const { result } = await runWellnessExperience("patterns.client-review", { consent: true, selectedFields, entries: reviewedEntries });
      setReview(result);
      setSelectedInsight(result?.insights?.[0] || result?.summary || "");
      setConsent(false);
    } catch {
      setError("The review is unavailable right now. Your saved check-ins were not changed.");
    } finally {
      setLoading(false);
    }
  };

  const askOracle = async () => {
    if (!oracleConsent || !selectedInsight) return;
    setOracleLoading(true);
    setError("");
    try {
      const { result } = await runWellnessExperience("patterns.meaning-reflection", { consent: true, insight: selectedInsight });
      setOracleResult(result);
      setOracleConsent(false);
    } catch {
      setError("The reflection is unavailable right now. The observation was not saved.");
    } finally {
      setOracleLoading(false);
    }
  };

  const askHealer = async () => {
    setHealerLoading(true);
    setError("");
    try {
      const { result } = await runWellnessExperience("recovery.affirmation", { concern });
      setHealerResult(result);
    } catch {
      setError("Optional phrases are unavailable right now. Your selections were not saved.");
    } finally {
      setHealerLoading(false);
    }
  };

  return (
    <section aria-labelledby="pattern-review-title" className="mt-4 rounded-3xl border border-violet-100/15 bg-violet-100/[0.025] p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <Sparkles aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-violet-100" />
        <div className="min-w-0 flex-1">
          <h2 id="pattern-review-title" className="text-lg font-semibold">Look back at selected check-in patterns</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/60">You choose which saved mood or rating details to share for one review. Journal writing, notes, identity, and practitioner sharing are excluded. This is an optional reflection, not a diagnosis or safety assessment.</p>
        </div>
      </div>
      {!open && <button type="button" onClick={() => setOpen(true)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-violet-100/25 px-5 text-sm font-medium text-violet-50 hover:bg-violet-100/[0.06]">Choose details to review <ArrowRight aria-hidden="true" className="h-4 w-4" /></button>}

      {open && !entries.length && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-4">
          <p className="text-sm leading-relaxed text-white/70">First, load up to 20 of your recent saved check-ins. Only supported mood and rating choices will be prepared; written reflections will not be included.</p>
          <button type="button" onClick={loadEntries} disabled={loadingEntries} className="mt-4 min-h-11 rounded-full bg-violet-100 px-5 text-sm font-semibold text-slate-950 disabled:opacity-60">{loadingEntries ? "Loading your check-ins…" : "Load my check-ins"}</button>
        </div>
      )}

      {open && entries.length > 0 && !review && (
        <div className="mt-5 space-y-4 rounded-2xl border border-white/10 bg-black/15 p-4 sm:p-5">
          <p className="text-sm leading-relaxed text-white/70">Choose only the details you want included. We found {entries.length} dated check-ins with supported ratings. Choose at least one detail present in three or more entries.</p>
          <fieldset className="grid gap-2 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold text-white">Details to include</legend>
            {availableFields.map(([key, label]) => <label key={key} className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 px-3 text-sm text-white/80"><input type="checkbox" checked={selectedFields.includes(key)} onChange={(event) => { setSelectedFields((current) => event.target.checked ? [...current, key] : current.filter((field) => field !== key)); setConsent(false); }} />{label}</label>)}
          </fieldset>
          <label className="flex items-start gap-3 rounded-xl border border-violet-100/15 bg-violet-100/[0.035] p-3 text-sm leading-relaxed text-white/75"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1" /><span>I confirm: send the selected dated choices above to Seer for this review. The result will appear here and will not be saved to my account or shared with a practitioner.</span></label>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={requestReview} disabled={!canReview} className="min-h-11 rounded-full bg-violet-100 px-5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Reviewing selected details…" : "Share selected details and review"}</button>
            <button type="button" onClick={() => { setOpen(false); setEntries([]); setConsent(false); }} className="min-h-11 rounded-full border border-white/15 px-4 text-sm text-white/75">Cancel</button>
          </div>
        </div>
      )}

      {review && (
        <div className="mt-5 space-y-4 rounded-2xl border border-violet-100/15 bg-black/15 p-4 sm:p-5">
          <div role="status"><p className="text-sm leading-relaxed text-white/80">{review.summary}</p>{review.insights?.length > 0 && <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-violet-50/85">{review.insights.map((insight) => <li key={insight}>{insight}</li>)}</ul>}{review.nextCheck && <p className="mt-3 text-sm leading-relaxed text-white/65">If useful: {review.nextCheck}</p>}</div>
          {!oracleResult && <div className="rounded-xl border border-white/10 p-3">
            <h3 className="text-sm font-semibold">Would a second perspective help?</h3>
            <label className="mt-2 block text-xs text-white/55" htmlFor="seer-observation">Choose one observation to share with Oracle</label>
            <select id="seer-observation" value={selectedInsight} onChange={(event) => { setSelectedInsight(event.target.value); setOracleConsent(false); }} className="mt-2 min-h-11 w-full rounded-lg bg-slate-900 px-3 text-sm text-white">{[...(review.insights || []), ...(review.summary ? [review.summary] : [])].map((item, index) => <option key={`${index}-${item}`} value={item}>{item}</option>)}</select>
            <label className="mt-3 flex items-start gap-3 text-xs leading-relaxed text-white/70"><input type="checkbox" checked={oracleConsent} onChange={(event) => setOracleConsent(event.target.checked)} className="mt-0.5" /><span>I choose to send only this selected Seer observation to Oracle for a brief reflection.</span></label>
            <button type="button" onClick={askOracle} disabled={!oracleConsent || oracleLoading || !selectedInsight} className="mt-3 min-h-10 rounded-full border border-white/15 px-4 text-sm text-white/80 disabled:opacity-50">{oracleLoading ? "Preparing reflection…" : "Ask Oracle"}</button>
          </div>}
          {oracleResult && <div role="status" className="rounded-xl border border-sky-100/15 bg-sky-100/[0.035] p-3"><h3 className="text-sm font-semibold">Oracle's reflection</h3><p className="mt-2 text-sm leading-relaxed text-white/75">{oracleResult.summary}</p>{oracleResult.wisdom && <p className="mt-2 text-sm leading-relaxed text-white/65">{oracleResult.wisdom}</p>}</div>}
          <div className="rounded-xl border border-white/10 p-3">
            <h3 className="text-sm font-semibold">Choose an optional practice cue</h3>
            <label className="mt-2 block text-xs text-white/55" htmlFor="pattern-practice-topic">Topic</label>
            <div className="mt-2 flex flex-wrap gap-2"><select id="pattern-practice-topic" value={concern} onChange={(event) => setConcern(event.target.value)} className="min-h-10 rounded-lg bg-slate-900 px-3 text-sm text-white">{CONCERNS.map((item) => <option key={item} value={item}>{item}</option>)}</select><button type="button" onClick={askHealer} disabled={healerLoading} className="min-h-10 rounded-full border border-white/15 px-4 text-sm text-white/80 disabled:opacity-50">{healerLoading ? "Preparing options…" : "Ask Healer for optional phrases"}</button></div>
            {healerResult && <div role="status" className="mt-3 rounded-xl bg-white/[0.04] p-3"><p className="text-sm text-white/70">{healerResult.summary}</p><ul className="mt-2 list-inside list-disc space-y-1 text-sm text-white/75">{healerResult.phrases?.map((phrase) => <li key={phrase}>{phrase}</li>)}</ul></div>}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3"><p className="text-xs text-white/50">You can stop here. If you would rather speak with a person, <Link className="text-amber-100 underline underline-offset-4" to="/support">open support options</Link>. Nothing here detects or rates safety.</p><button type="button" onClick={() => { setReview(null); setEntries([]); setOpen(false); setConsent(false); setOracleConsent(false); setOracleResult(null); setHealerResult(null); }} className="min-h-10 rounded-full border border-white/15 px-4 text-sm text-white/70">Close and clear this review</button></div>
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-100/15 bg-rose-100/[0.04] p-3 text-sm text-rose-100/80">{error}</p>}
    </section>
  );
}
