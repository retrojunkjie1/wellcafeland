// Phase 44 — Full Content Activation Patch
// Replace your current "topics" page component with this implementation.

import React, { useState, useMemo, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

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

// --- Topic registry with multimillion-dollar content -----------------------

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
A craving is not a moral failure. It is a **signal** from a body and brain that have learned, over time, that a certain behavior or substance offers rapid relief.

Cravings often show up when something in you is overwhelmed, lonely, flooded, or disconnected. They spike when the nervous system is searching for safety, comfort, or escape. Seen this way, the craving is trying to help — it is just using a tool that now harms you.

In recovery, the goal is not to be a person who never feels an urge. The work is to become someone who can **notice** an urge, **name** it, ride the wave, and reach for support or tools instead of self-destruction.

When you can say, "A craving is moving through me; it is not my identity," you begin to reclaim your power. The urge rises, peaks, and falls. You are allowed to outlast it with honesty, connection, and care.
    `.trim(),
    reflection: `
When cravings show up for you, what are they usually trying to relieve or protect you from beneath the surface?
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

const EducationModule = ({ onComplete, onCancel, _initialContext, isEmbedded = false, topic: initialTopic = null }) => {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header spacer handled by OS layout */}
      <div className="px-4 pt-6 pb-3 sm:px-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Choose a Topic
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-xl">
          Select a topic and let the Living Guide walk with you through
          understanding and reflection.
        </p>
      </div>

      {/* Topic pills */}
      <div className="px-4 sm:px-8 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TOPICS.map((topic) => {
          const isActive = topic.id === selectedTopic.id;
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => { stop(); setSelectedId(topic.id); }}
              className={[
                "w-full rounded-full px-4 py-3 text-sm font-medium transition-all",
                "border border-slate-700/70 shadow-sm",
                "hover:border-amber-400/70 hover:text-amber-100",
                isActive
                  ? "bg-amber-500/15 text-amber-100 border-amber-400/80"
                  : "bg-slate-900/70 text-slate-200",
              ].join(" ")}
            >
              {topic.label}
            </button>
          );
        })}
      </div>

      {/* Content panel */}
      <div className="px-4 sm:px-8 pb-24 space-y-6">
        {/* Title + controls */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
              {selectedTopic.label}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReadAloud}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium bg-slate-900 border border-slate-700 hover:border-amber-400 hover:text-amber-100 transition-colors"
            >
              {isSpeaking ? "Stop" : "Read to me"}
            </button>
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={soundEnabled ? "Turn read-aloud audio off" : "Turn read-aloud audio on"}
              aria-pressed={soundEnabled}
              className="inline-flex items-center justify-center rounded-full p-2 bg-slate-900 border border-slate-700 hover:border-amber-400 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Understanding card */}
        <section className="rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl shadow-black/40 px-5 sm:px-6 py-5 sm:py-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3">
            Understanding
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-slate-200 whitespace-pre-line">
            {content?.understanding}
          </p>
        </section>

        {/* Reflection card */}
        <section className="rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl shadow-black/40 px-5 sm:px-6 py-5 sm:py-6">
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Reflection
          </h3>
          <p className="text-sm sm:text-base italic text-slate-300 leading-relaxed">
            {content?.reflection}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            You don&apos;t have to answer this perfectly. Let the question sit
            with you. Notice what stirs, without judging yourself.
          </p>
        </section>
      </div>
    </div>
  );
};

export default EducationModule;
