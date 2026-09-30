import React, { useState, useMemo, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { createToolResult, safeComplete } from "@/utils/toolContract";

// --- Local narration hook (safe, no external imports) ----------------------

function useSimpleNarration() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (!text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stop = React.useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stop };
}

const TOPICS = [
  { id: "shame-and-recovery", label: "Shame and Recovery" },
  { id: "cravings-and-urges", label: "Cravings and Urges" },
  { id: "nervous-system-regulation", label: "Nervous System Regulation" },
  { id: "trauma-and-recovery", label: "Trauma and Recovery" },
  { id: "sleep-and-recovery", label: "Sleep and Recovery" },
  { id: "boundaries-in-recovery", label: "Boundaries in Recovery" },
  { id: "grief-and-loss", label: "Grief and Loss" },
  { id: "self-compassion", label: "Self-Compassion" },
];

const TOPIC_CONTENT = {
  "shame-and-recovery": {
    understanding: `
Shame is the quiet voice that says, "Something is wrong **with me**" — not just with what I did. In recovery, shame is one of the biggest forces that keeps people stuck in secrecy, relapse cycles, and self-attack.

Many of us were taught that being hard on ourselves is how we change. In reality, shame shrinks us. It makes us hide, lie, and isolate. When we believe we are the problem, it feels dangerous to be seen, to ask for help, or to tell the truth.

In this work, we begin to separate **who we are** from **what we've done**. You are a human being with a story, not a walking mistake. Your nervous system, your history, your coping skills — they all make sense if we zoom out and look at what you have survived.

Recovery is not about proving you are "good enough." It is about slowly letting go of the belief that you were ever unworthy in the first place.
    `.trim(),
    reflection: `
Where in your life do you feel the strongest pull to hide who you are — and if that part of you could speak freely, what would it say?
    `.trim(),
  },

  "cravings-and-urges": {
    understanding: `
A craving is not a moral failure or a verdict about your recovery. It can show up in different ways, and its strength and duration can vary. You do not need to find a hidden cause or explain the feeling before getting support.

A pause may create room for another choice, but urges do not follow a timer and no exercise can promise when one will ease. You can choose a practical next move: create distance from a trigger if safe, contact someone you trust, start a familiar activity, or look for peer or professional support.

Keep what helps, change direction, or stop. You deserve support even if the urge stays strong.
    `.trim(),
    reflection: `
Optional: choose what could help now—company, a change of setting, a familiar activity, or outside support. You can skip writing.
    `.trim(),
  },

  "nervous-system-regulation": {
    understanding: `
Your nervous system is the part of you that is always asking one quiet question: **"Am I safe right now?"** It answers not with words, but with sensations — a racing heart, a heavy chest, numbness, tension, or sudden bursts of energy.

If you've lived through trauma, chaos, oppression, or long-term stress, your system may stay in survival mode even when the danger has passed. You might call yourself "overreactive," "too sensitive," or "shut down," when in truth your body has been working overtime to keep you alive.

Regulation is not about being calm all the time. It is about widening your **window of tolerance** — the zone where you can feel feelings, think clearly, and stay present without shutting down or exploding. We practice sending your body new safety signals through breath, movement, grounding, and co-regulation with safe people.

Over time, your system can learn, "I don't have to be on guard every second anymore. I can soften… even a little."
    `.trim(),
    reflection: `
If your nervous system could describe its usual state in one sentence right now, what would it say about how safe it feels in the world?
    `.trim(),
  },

  "trauma-and-recovery": {
    understanding: `
Trauma is not only what happened — it is also **what had to stay inside you** because it was not safe to feel, speak, or process it at the time. The body remembers in ways the mind cannot always explain.

You may notice flashes of memory, numbness, startle responses, nightmares, people-pleasing, anger that feels "too big," or a constant sense that something bad is about to happen. None of this means you are broken. It means your system adapted to survive conditions that were never okay.

Recovery is the slow, courageous work of reclaiming your body, voice, and choices. We move at the speed of safety, not pressure. We honor the parts of you that protected you — even if their methods no longer serve you.

You are not defined by the worst things that happened to you or the worst things you did while trying to cope. You are allowed to build a life that makes sense **after** trauma.
    `.trim(),
    reflection: `
If you imagined your trauma not as a personal flaw but as a story your body has been carrying alone, what kind of support would that story be asking for now?
    `.trim(),
  },

  "sleep-and-recovery": {
    understanding: `
Sleep is not laziness or weakness — it is **medicine** for a brain and body in recovery. While you sleep, your nervous system processes experiences, repairs tissue, regulates hormones, and clears out stress chemicals that build up during the day.

Yet for many people in recovery, bedtime is when the noise gets loudest: racing thoughts, shame spirals, future-tripping, old memories, or the urge to numb. The body may be exhausted while the mind feels stuck in overdrive.

Treating sleep as sacred means recognizing that rest is not a reward you earn after being productive. It is a basic need, as non-negotiable as food or oxygen. Gentle routines, predictable rituals, and nervous-system calming practices can turn sleep from a battleground into a soft landing place.

You deserve rest that is not haunted. You are allowed to build evenings that help your body understand, "It is safe enough to let go for a while."
    `.trim(),
    reflection: `
If your relationship with sleep were a person standing in front of you, what would you apologize for — and what new promise would you want to make to it?
    `.trim(),
  },

  "boundaries-in-recovery": {
    understanding: `
Boundaries are not punishments or walls. They are the **shape of your self-respect**. In recovery, healthy boundaries protect your energy, your sobriety, and your sanity.

Many of us grew up in environments where saying "no" led to conflict, shame, or abandonment. We learned to over-give, over-explain, or disappear our own needs just to keep the peace. Then we wonder why resentment, burnout, or relapse keeps showing up.

A boundary is simply an honest line: what you are and are not willing to accept, do, or tolerate. It might sound like, "I can't talk about that when I'm trying to stay sober," or "I won't lend money right now," or "If you yell, I will step away."

Boundaries in recovery are acts of care — for you **and** for the relationship. They make it possible for you to show up more truthfully, without silently collapsing inside.
    `.trim(),
    reflection: `
Where in your life is your body already telling you, "Something about this is too much" — and what small boundary would honor that truth?
    `.trim(),
  },

  "grief-and-loss": {
    understanding: `
Grief is the price we pay for loving, hoping, or dreaming in a world where things end and people leave. In recovery, grief is everywhere: losses of people, relationships, time, health, opportunities, or the version of yourself you thought you would be by now.

Grief is not linear. One day you feel steady; the next, a song, smell, or memory knocks the air out of you. There is no "right way" to grieve and no moral timeline for when you should be "over it."

Instead of trying to get rid of grief, we learn to **make room** for it. We carry the love forward while slowly loosening our grip on the belief that things could have turned out differently if only you were better, smarter, or stronger.

Your tears, numbness, anger, and confusion are not signs of failure. They are signs that something — or someone — mattered deeply.
    `.trim(),
    reflection: `
What or who are you still carrying in your heart right now, and how might you honor that love or loss in a way that also cares for you?
    `.trim(),
  },

  "self-compassion": {
    understanding: `
Self-compassion is not letting yourself off the hook. It is learning how to speak to yourself like someone you are **responsible for protecting**, not someone you are trying to destroy.

Many people in recovery are fluent in self-criticism: "I ruin everything," "I should be further along," "No one else is this messed up." This inner voice may feel like motivation, but research — and lived experience — show that relentless self-attack actually increases shame and keeps us stuck.

Self-compassion has three pillars:  
1. **Mindfulness** — honestly noticing what hurts.  
2. **Common humanity** — remembering you are not the only one who struggles.  
3. **Self-kindness** — offering yourself the tone you would use with a dear friend.

You don't have to believe kind words right away. You only have to practice not abandoning yourself in the moments you need gentleness most.
    `.trim(),
    reflection: `
If you spoke to yourself today with the same tone you would use with someone you deeply love who is struggling, what is one sentence you would say differently?
    `.trim(),
  },
};

// --- Main Component ---------------------------------------------------------

const EducationModule = ({ onComplete, topic: initialTopic = null }) => {
  const [selectedId, setSelectedId] = useState(
    initialTopic 
      ? TOPICS.find(t => t.label === initialTopic)?.id || TOPICS[0].id
      : TOPICS[0].id
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { isSpeaking, speak, stop } = useSimpleNarration();

  useEffect(() => () => stop(), [stop]);

  const selectedTopic = useMemo(
    () => TOPICS.find((t) => t.id === selectedId) || TOPICS[0],
    [selectedId]
  );

  const content = useMemo(
    () => TOPIC_CONTENT[selectedTopic.id],
    [selectedTopic.id]
  );
  const paragraphs = useMemo(
    () => (content?.understanding || "").split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean),
    [content]
  );

  const renderInlineEmphasis = (text) => text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => (
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={`${part}-${index}`} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
      : part
  ));

  const handleReadAloud = () => {
    if (!content || !content.understanding) return;
    if (!soundEnabled) return;

    if (isSpeaking) {
      stop();
      return;
    }

    const textToRead = `${selectedTopic.label}. ${content.understanding}`;
    speak(textToRead);
  };

  const handleToggleSound = () => {
    if (isSpeaking) stop();
    setSoundEnabled((prev) => !prev);
  };

  const handleComplete = () => safeComplete(onComplete, createToolResult(
    "education",
    `Read: ${selectedTopic.label}`,
    "Finished a self-paced learning topic.",
    { topicId: selectedTopic.id },
  ));

  return (
    <div className="wc-education space-y-5 px-4 pb-24 pt-5 text-foreground sm:space-y-6 sm:px-8 sm:pt-7">
      <header className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Learn at your pace</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Choose a topic</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Start with one short idea. Open the deeper read or optional reflection only if it helps.
        </p>
      </header>

      <nav aria-label="Learning topics" className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-2 sm:flex-wrap">
          {TOPICS.map((topic) => {
            const isActive = topic.id === selectedTopic.id;
            return (
              <button
                key={topic.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => { stop(); setSelectedId(topic.id); }}
                className="min-h-11 rounded-full border border-border bg-background/60 px-4 text-sm font-medium text-foreground transition hover:border-amber-400/70 hover:bg-muted aria-pressed:border-amber-400/70 aria-pressed:bg-amber-400/10 aria-pressed:text-foreground"
              >
                {topic.label}
              </button>
            );
          })}
        </div>
      </nav>

      <article className="lux-card max-w-4xl space-y-5 p-5 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">A short starting point</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{selectedTopic.label}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleReadAloud}
              disabled={!soundEnabled}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background/60 px-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {isSpeaking ? "Stop reading" : "Read aloud"}
            </button>
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={soundEnabled ? "Turn read-aloud off" : "Turn read-aloud on"}
              aria-pressed={soundEnabled}
              className="min-h-11 rounded-full border border-border bg-background/60 px-4 text-sm text-foreground transition hover:bg-muted"
            >
              {soundEnabled ? "Voice on" : "Voice off"}
            </button>
          </div>
        </div>

        <section aria-labelledby="lesson-start-title" className="rounded-2xl border border-border bg-background/45 p-4 sm:p-5">
          <h3 id="lesson-start-title" className="text-sm font-semibold text-foreground">The key idea</h3>
          <p className="mt-2 max-w-[68ch] text-base leading-7 text-foreground sm:text-lg sm:leading-8">
            {renderInlineEmphasis(paragraphs[0] || "Choose a topic to begin.")}
          </p>
        </section>

        {paragraphs.length > 1 && (
          <details className="group rounded-2xl border border-border bg-background/30 p-4 sm:p-5">
            <summary className="min-h-11 cursor-pointer list-none py-2 text-sm font-semibold text-foreground marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">
              Read the fuller explanation <span className="ml-1 text-muted-foreground group-open:hidden">+</span><span className="ml-1 hidden text-muted-foreground group-open:inline">−</span>
            </summary>
            <div className="mt-3 max-w-[68ch] space-y-4 border-t border-border pt-4 text-base leading-7 text-foreground sm:text-lg sm:leading-8">
              {paragraphs.slice(1).map((paragraph, index) => (
                <p key={`${selectedTopic.id}-paragraph-${index}`}>{renderInlineEmphasis(paragraph)}</p>
              ))}
            </div>
          </details>
        )}

        <details className="group rounded-2xl border border-border bg-background/30 p-4 sm:p-5">
          <summary className="min-h-11 cursor-pointer list-none py-2 text-sm font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">
            Optional reflection <span className="ml-1 text-muted-foreground group-open:hidden">+</span><span className="ml-1 hidden text-muted-foreground group-open:inline">−</span>
          </summary>
          <div className="mt-3 max-w-[68ch] border-t border-border pt-4">
            <p className="text-base italic leading-7 text-foreground sm:text-lg sm:leading-8">{content?.reflection}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">You can think about this, write privately, skip it, or close this section.</p>
          </div>
        </details>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">Reflect privately, or move on without answering.</p>
          <button type="button" onClick={handleComplete} className="min-h-11 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90">Done with this topic</button>
        </div>
      </article>
    </div>
  );
};

export default EducationModule;
