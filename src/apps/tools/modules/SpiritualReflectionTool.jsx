import React, { useState } from "react";
import { runWellnessExperience } from "@/ai/experience/experienceEngine";

const TOPICS = [
  {
    id: "meaning",
    label: "Meaning",
    description: "Notice what feels meaningful, even in a small part of life.",
    prompts: ["What has felt meaningful to you before, even briefly?", "What matters enough to make room for today, without needing to solve everything?"],
    fallback: ["I can notice meaning without needing a complete answer.", "Small moments can matter, even when life feels uncertain.", "I can let a question stay open while I choose what matters today.", "I may take one step toward something I value, at my own pace."],
  },
  {
    id: "values",
    label: "Values",
    description: "Choose a value that you want to make room for today.",
    prompts: ["Which value feels closest today: care, courage, rest, honesty, creativity, or belonging?", "What is one small way to honor it without demanding more of yourself?"],
    fallback: ["I can choose a value that fits this moment.", "A small action can express what matters to me.", "I can honor rest, care, or another value without earning it.", "My values can guide one choice without deciding everything."],
  },
  {
    id: "connection",
    label: "Connection",
    description: "Reflect on people, places, nature, or practices that you choose.",
    prompts: ["Who or what helps you feel connected on your own terms?", "Would a small moment of connection feel welcome today, or would space feel better?"],
    fallback: ["I can choose what connection means for me.", "I may reach toward someone or something when I feel ready.", "Needing space and valuing connection can both be true.", "I can decide what kind of support feels right today."],
  },
  {
    id: "gratitude",
    label: "Gratitude",
    description: "Notice something you appreciate without denying what is hard.",
    prompts: ["Is there something small you appreciate alongside anything difficult?", "What would it be like to notice it without asking yourself to feel differently?"],
    fallback: ["I can appreciate something small without minimizing what is hard.", "More than one feeling can be present at a time.", "I do not have to turn gratitude into pressure.", "I can notice what supports me, if anything comes to mind."],
  },
  {
    id: "hope",
    label: "Hope",
    description: "Leave room for a possibility without promising an outcome.",
    prompts: ["What is one possibility you would like to leave open?", "What support could help you take the next step, or pause for now?"],
    fallback: ["I can leave a possibility open without knowing the outcome.", "I may take one next step, ask for support, or pause.", "Uncertainty does not require me to decide everything now.", "I can choose what feels manageable in this moment."],
  },
];

const FRAMES = [
  { id: "everyday", label: "Everyday language", description: "Grounded wording with no religious framing." },
  { id: "spiritual", label: "Spiritual or meaning-centered", description: "Only if this feels right; no belief or tradition is assumed." },
];

export default function SpiritualReflectionTool() {
  const [topicId, setTopicId] = useState("");
  const [frame, setFrame] = useState("everyday");
  const [phrases, setPhrases] = useState([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const topic = TOPICS.find((item) => item.id === topicId);

  const preparePhrases = async () => {
    if (!topic) return;
    setBusy(true);
    setNotice("");
    setPhrases([]);
    try {
      const { result } = await runWellnessExperience("recovery.affirmation", { concern: topic.id, frame });
      const candidate = Array.isArray(result?.phrases)
        ? result.phrases.filter((phrase) => typeof phrase === "string" && phrase.trim()).slice(0, 6)
        : [];
      if (candidate.length < 4) throw new Error("INCOMPLETE_RESPONSE");
      setPhrases(candidate);
    } catch (error) {
      setPhrases(topic.fallback);
      const offlineFrameNote = frame === "spiritual"
        ? " The offline phrases use general, meaning-centered wording and do not assume a belief or tradition."
        : "";
      const serviceNote = error?.code === "AGENT_PAUSED" || error?.code === "AGENT_CONTROL_UNAVAILABLE"
        ? "Healer is temporarily unavailable."
        : "Personalized phrases are unavailable right now.";
      setNotice(`${serviceNote}${offlineFrameNote} These local phrases are optional; use what fits or leave them.`);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setTopicId("");
    setFrame("everyday");
    setPhrases([]);
    setNotice("");
    setFinished(false);
  };

  return (
    <section className="space-y-6" aria-labelledby="spiritual-reflection-title">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Private · self-paced · no belief assumed</p>
        <h2 id="spiritual-reflection-title" className="text-2xl font-medium">Meaning & spiritual reflection</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">Choose a question that feels useful, or leave it. This is space for your own reflection, not spiritual direction or clinical care. You will not type or submit a reflection here. If you request phrases, only your selected focus and language choice are sent to Healer.</p>
      </header>

      {!topic && !finished && (
        <fieldset className="lux-card space-y-3 p-4" disabled={busy}>
          <legend className="px-1 text-sm font-medium">What would you like to reflect on?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {TOPICS.map((item) => (
              <button key={item.id} type="button" onClick={() => setTopicId(item.id)}
                className="min-h-20 rounded-2xl border border-border p-4 text-left transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                <span className="block text-sm font-medium text-foreground">{item.label}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{item.description}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {topic && !finished && (
        <div className="space-y-4">
          <div className="lux-card space-y-4 p-5 sm:p-6" aria-labelledby="reflection-questions-title">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your choice</p><h3 id="reflection-questions-title" className="mt-1 text-xl font-medium">{topic.label}</h3></div>
              <button type="button" onClick={reset} className="min-h-10 rounded-full border border-border px-4 text-sm text-muted-foreground hover:bg-muted">Choose another focus</button>
            </div>
            <ol className="space-y-3">
              {topic.prompts.map((prompt, index) => <li key={prompt} className="rounded-xl border border-border/70 bg-background/30 p-4 text-base leading-relaxed"><span className="mr-2 text-xs font-semibold text-muted-foreground">{index + 1}.</span>{prompt}</li>)}
            </ol>
            <p className="text-sm leading-relaxed text-muted-foreground">You can reflect silently, skip a question, or stop here. You do not need to type or share an answer.</p>
          </div>

          <fieldset className="lux-card space-y-3 p-4" disabled={busy}>
            <legend className="px-1 text-sm font-medium">Choose language for optional phrases</legend>
            <p className="text-sm leading-relaxed text-muted-foreground">Reflection questions above stay on this device. Only the selected focus and language frame are sent if you request phrases below.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {FRAMES.map((item) => <button key={item.id} type="button" onClick={() => setFrame(item.id)} aria-pressed={frame === item.id}
                className={`min-h-16 rounded-xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${frame === item.id ? "border-foreground bg-foreground/10 text-foreground" : "border-border text-muted-foreground hover:bg-muted"}`}>
                <span className="block text-sm font-medium">{item.label}</span><span className="mt-1 block text-xs leading-relaxed">{item.description}</span>
              </button>)}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={preparePhrases} disabled={busy} className="min-h-11 rounded-full bg-foreground px-5 text-sm font-semibold text-background disabled:opacity-60">{busy ? "Preparing optional phrases…" : "Prepare optional phrases"}</button>
            <button type="button" onClick={() => setFinished(true)} disabled={busy} className="min-h-11 rounded-full border border-border px-5 text-sm text-foreground hover:bg-muted disabled:opacity-60">Finish reflection</button>
          </div>

          {notice && <p role="status" aria-live="polite" className="rounded-xl border border-amber-200/20 bg-amber-100/[0.06] p-4 text-sm leading-relaxed text-foreground">{notice}</p>}
          {phrases.length > 0 && <section className="lux-card space-y-3 p-5" aria-labelledby="optional-phrases-title" aria-live="polite">
            <h3 id="optional-phrases-title" className="text-lg font-medium">Optional phrases to consider or leave</h3>
            <ul className="space-y-2">{phrases.map((phrase, index) => <li key={`${index}-${phrase}`} className="rounded-xl border border-border/70 p-3 text-sm leading-relaxed">{phrase}</li>)}</ul>
            <p className="text-xs leading-relaxed text-muted-foreground">These are suggestions, not facts, instructions, or promises. Nothing here diagnoses or replaces support from a person you trust.</p>
          </section>}
        </div>
      )}

      {finished && <div className="lux-card space-y-4 p-5" role="status" aria-live="polite">
        <h3 className="text-lg font-medium">You can leave this here</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">Your answers were never collected. If you requested phrases, only your selected focus and language choice were sent to Healer. Nothing from this reflection was saved or shared.</p>
        <button type="button" onClick={reset} className="min-h-11 rounded-full border border-border px-5 text-sm text-foreground hover:bg-muted">Begin another reflection</button>
      </div>}
    </section>
  );
}
