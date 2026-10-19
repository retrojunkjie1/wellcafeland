import React, { useEffect, useState } from "react";
import { Map, RotateCcw, Save, Sparkles, Trash2 } from "lucide-react";
import { runWellnessExperience } from "@/ai/experience/experienceEngine";
import { clearMySupportMap, getMySupportMap, saveMySupportMap } from "@/services/supportMap";

const CHOICE_GROUPS = [
  {
    key: "situations",
    title: "When might a map help?",
    hint: "Choose one to four situations that feel relevant to you.",
    choices: [
      ["uncertainty", "Uncertainty or too many decisions"], ["low_energy", "Low energy or exhaustion"],
      ["strong_urge", "A strong urge or craving"], ["disconnection", "Feeling disconnected"],
      ["difficult_conversation", "A difficult conversation"], ["sleep_disruption", "A disrupted night or sleep routine"],
    ],
  },
  {
    key: "helps",
    title: "What tends to support you?",
    hint: "Choose one to four options you would like to keep available.",
    choices: [
      ["one_step", "One small practical step"], ["quiet", "Quiet and less input"],
      ["grounding", "An optional sensory grounding practice"], ["natural_breath", "Breathing naturally, without counting"],
      ["trusted_person", "Considering a trusted person, when I choose"], ["writing", "Writing privately"],
      ["movement", "Gentle movement"], ["learning", "A clear explanation or learning resource"],
    ],
  },
  {
    key: "avoid",
    title: "What would you rather avoid?",
    hint: "Optional. Choose up to four; these are preferences you can change.",
    choices: [
      ["forced_positivity", "Forced positivity"], ["long_explanations", "Long explanations"],
      ["breath_counting", "Counted breathing instructions"], ["spiritual_language", "Spiritual language"],
      ["pressure_to_contact", "Pressure to contact someone"], ["advice_without_asking", "Advice before I ask"],
    ],
  },
];

function ChoiceGroup({ group, selected, onToggle }) {
  return (
    <fieldset className="rounded-2xl border border-white/10 bg-black/10 p-4">
      <legend className="px-1 text-sm font-semibold text-white">{group.title}</legend>
      <p className="mb-3 text-xs leading-relaxed text-white/50">{group.hint}</p>
      <div className="flex flex-wrap gap-2">
        {group.choices.map(([value, label]) => {
          const active = selected.includes(value);
          return <button key={value} type="button" aria-pressed={active} onClick={() => onToggle(group.key, value)} className={`min-h-10 rounded-full border px-3 text-sm transition ${active ? "border-amber-200/50 bg-amber-100/10 text-amber-50" : "border-white/10 bg-white/[0.025] text-white/65 hover:bg-white/[0.06]"}`}>{label}</button>;
        })}
      </div>
    </fieldset>
  );
}

export default function CartographerMap({ userId }) {
  const [selection, setSelection] = useState({ situations: [], helps: [], avoid: [] });
  const [mapResult, setMapResult] = useState(null);
  const [savedMap, setSavedMap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clearArmed, setClearArmed] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = getMySupportMap(userId);
    setSavedMap(saved);
    if (saved) {
      setSelection(saved.selection);
      setMapResult(saved.map);
    } else {
      setSelection({ situations: [], helps: [], avoid: [] });
      setMapResult(null);
    }
    setStatus("");
    setError("");
  }, [userId]);

  const toggleChoice = (group, value) => {
    setSelection((current) => {
      const currentValues = current[group];
      const next = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : currentValues.length >= 4 ? currentValues : [...currentValues, value];
      return { ...current, [group]: next };
    });
    setMapResult(null);
    setStatus("");
    setError("");
  };

  const createMap = async () => {
    if (!selection.situations.length || !selection.helps.length || loading) return;
    setLoading(true);
    setError("");
    setStatus("");
    setMapResult(null);
    try {
      const { result } = await runWellnessExperience("preferences.map", selection);
      if (typeof result.overview !== "string" || !result.overview.trim() || typeof result.firstStep !== "string" || !result.firstStep.trim()) {
        throw new Error("Cartographer did not return a complete map.");
      }
      setMapResult({
        overview: result.overview.trim().slice(0, 300),
        helpfulSupports: Array.isArray(result.helpfulSupports) ? result.helpfulSupports.filter((item) => typeof item === "string").slice(0, 4) : [],
        avoid: Array.isArray(result.avoid) ? result.avoid.filter((item) => typeof item === "string").slice(0, 4) : [],
        firstStep: result.firstStep.trim().slice(0, 220),
      });
    } catch {
      setError("Your map could not be prepared right now. Your choices are still here; try again when you’re ready.");
    } finally {
      setLoading(false);
    }
  };

  const saveMap = () => {
    if (!mapResult) return;
    const snapshot = { savedAt: Date.now(), selection, map: mapResult };
    if (saveMySupportMap(userId, snapshot)) {
      setSavedMap(snapshot);
      setStatus("Your support map is saved on this device. It is not shared with practitioners or other guide conversations.");
      setError("");
    } else {
      setError("This device could not save your map. You can still use the preview above.");
    }
  };

  const clearMap = () => {
    if (!clearArmed) {
      setClearArmed(true);
      return;
    }
    if (clearMySupportMap(userId)) {
      setSavedMap(null);
      setMapResult(null);
      setSelection({ situations: [], helps: [], avoid: [] });
      setStatus("Your saved map was cleared from this device.");
      setError("");
    } else {
      setError("This device could not clear the saved map. Try again.");
    }
    setClearArmed(false);
  };

  return (
    <section className="mt-6 rounded-3xl border border-violet-200/15 bg-gradient-to-br from-[#121726] to-[#0d1420] p-4 shadow-xl shadow-black/20 sm:p-6" aria-labelledby="cartographer-heading">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-300/10 text-violet-100"><Map className="h-5 w-5" /></span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-100/70">Your choices, in one place</p>
          <h2 id="cartographer-heading" className="mt-1 text-lg font-semibold text-white">My support map</h2>
          <p className="mt-1 text-sm leading-relaxed text-white/60">Choose what fits. Cartographer turns only those choices into a short reference you can review, change, or clear.</p>
        </div>
      </div>
      <p className="mb-4 rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-xs leading-relaxed text-white/55">This is not a diagnosis. Your selections go to Cartographer only when you ask it to build the map. Saving keeps it on this device; it is not shared with practitioners or automatically sent to other agents.</p>
      <div className="space-y-3">
        {CHOICE_GROUPS.map((group) => <ChoiceGroup key={group.key} group={group} selected={selection[group.key]} onToggle={toggleChoice} />)}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={createMap} disabled={!selection.situations.length || !selection.helps.length || loading} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-200 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"><Sparkles className="h-4 w-4" />{loading ? "Building your map…" : "Build my map"}</button>
        {mapResult && <button type="button" onClick={saveMap} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-medium text-white/85 hover:bg-white/5"><Save className="h-4 w-4" />Save on this device</button>}
        {(savedMap || clearArmed) && <button type="button" onClick={clearMap} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-rose-200/15 px-4 text-sm text-rose-100/75 hover:bg-rose-300/5"><Trash2 className="h-4 w-4" />{clearArmed ? "Confirm clear" : "Clear saved map"}</button>}
        {clearArmed && <button type="button" onClick={() => setClearArmed(false)} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-white/50 hover:text-white"><RotateCcw className="h-4 w-4" />Keep it</button>}
      </div>
      {savedMap && <p className="mt-3 text-xs text-emerald-100/70">Saved on this device · {new Date(savedMap.savedAt).toLocaleDateString()}</p>}
      {mapResult && <article className="mt-4 rounded-2xl border border-violet-100/15 bg-black/15 p-4" aria-live="polite"><h3 className="text-sm font-semibold text-violet-50">A map you can revise</h3><p className="mt-2 text-sm leading-relaxed text-white/85">{mapResult.overview}</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-100/70">Supports you chose</p><ul className="mt-2 list-inside list-disc space-y-1 text-sm text-white/70">{mapResult.helpfulSupports.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></div>{mapResult.avoid.length > 0 && <div><p className="text-xs font-semibold uppercase tracking-wide text-amber-100/70">You asked us to avoid</p><ul className="mt-2 list-inside list-disc space-y-1 text-sm text-white/70">{mapResult.avoid.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></div>}</div><p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-white/80"><span className="font-medium text-white">Optional first step: </span>{mapResult.firstStep}</p></article>}
      {status && <p role="status" className="mt-3 text-sm text-emerald-100/80">{status}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-amber-100">{error}</p>}
    </section>
  );
}
