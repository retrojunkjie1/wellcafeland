// src/engines/education/recoveryBasicsEngine.js
// Phase 44: Deep, trauma-informed recovery content engine

// Canonical IDs your UI can use
export const RECOVERY_BASICS_TOPICS = [
  "shame-and-recovery",
  "cravings-and-urges",
  "nervous-system-regulation",
  "trauma-and-recovery",
  "sleep-and-recovery",
  "boundaries-in-recovery",
  "grief-and-loss",
  "self-compassion",
];

const TOPIC_MAP = {
  "shame-and-recovery": {
    id: "shame-and-recovery",
    title: "Shame and Recovery",
    understanding: `
Shame is not the same thing as guilt. Guilt says, "I did something wrong." Shame says, "I *am* something wrong." One is about behavior; the other is about identity. Recovery collapses when shame is running the story in the background.

Most people don't wake up thinking, "I feel deep shame today." It hides in the small moments: the way your shoulders drop when someone praises you, the way you avoid eye contact when telling the truth, the way you assume people will leave once they "really know you." Shame is a nervous system response and a story at the same time – the body contracts, and the mind whispers, "You are too much, or not enough, or beyond repair."

In recovery, shame often shows up after slips, during conflict, or when you start doing well. Progress can actually *trigger* shame because it confronts the old belief that you are undeserving of good things. If we don't name this, treatment can feel like self-betrayal: you're doing "the right things" while secretly believing you don't deserve any of it.

Real healing starts when we separate **who you are** from **what you've done**, and when we treat shame itself as a wound – not as proof that the worst stories about you are true.
    `.trim(),
    reflection: `
If shame was a voice sitting across from you at the table, what exact lines would it repeat – and whose voice does it secretly sound like?
    `.trim(),
  },

  "cravings-and-urges": {
    id: "cravings-and-urges",
    title: "Cravings and Urges",
    understanding: `
A craving is not a moral failure; it is a **signal**. The nervous system has learned, through repetition, that a certain substance or behavior temporarily changes how you feel. When stress, loneliness, anger, or emptiness spike, the brain simply offers the fastest solution it remembers.

Urges usually have three layers:

1) **Body** – tight chest, restless hands, buzzing under the skin.

2) **Emotion** – shame, anger, grief, boredom, or raw emptiness.

3) **Story** – "I can't handle this," "Just this once," "It doesn't matter anymore."

Most people only fight at the story level and try to win with willpower: "I just need to be stronger." That is exhausting. A trauma-informed approach treats cravings like ocean waves: they rise, peak, and fall. Your job is not to stop the ocean. Your job is to build a board you can ride.

In recovery, the question shifts from "Why am I craving?" to "What is this craving *protecting me from feeling right now*?" When you can identify the feeling underneath and respond to *that* need – connection, soothing, rest, honesty – the urge often loosens its grip without a fight.
    `.trim(),
    reflection: `
Think about your last strong craving: if the substance or behavior disappeared from the earth in that moment, what feeling would have been left sitting in the room with you?
    `.trim(),
  },

  "nervous-system-regulation": {
    id: "nervous-system-regulation",
    title: "Nervous System Regulation",
    understanding: `
Recovery is not just a mindset shift; it is a **nervous system retraining project**. Many of us grew up in environments where calm was rare and unpredictability was normal. The body adapted by staying on guard. Years later, the nervous system still acts as if danger is always one step away.

When your system is dysregulated, small problems feel catastrophic and neutral faces look threatening. You might flip between shutdown ("I'm numb, tired, checked-out") and overdrive ("I'm wired, can't sleep, can't stop thinking"). This is not you being "dramatic" or "lazy." It is biology doing exactly what it was taught.

Regulation means teaching the body new options: learning how to move from panic back into presence, from freeze back into choice. Grounding, breath work, movement, and safe connection are not cute self-care tricks – they are **re-coding** tools for your entire system.

Over time, the goal is not to never get triggered. The goal is to recognize, "My system is out of its window of tolerance right now," and have real, practical ways to come back to center without reaching for old survival strategies that cost you your life.
    `.trim(),
    reflection: `
How does your body usually tell you that it has left its "okay zone" – and what is one regulation practice you're willing to treat as non-negotiable for the next seven days?
    `.trim(),
  },

  "trauma-and-recovery": {
    id: "trauma-and-recovery",
    title: "Trauma and Recovery",
    understanding: `
Trauma is not only about "what happened." It is also about what **didn't** happen afterward: the support you didn't get, the safety that never came, the apology that never arrived. Trauma leaves the body holding stories it never had a chance to finish telling.

Because of this, people often blame themselves for reactions that actually make sense. Startle easily? That was your body learning to survive unpredictability. Go numb in conflict? That was your system protecting you when fighting back wasn't safe. Use substances or behaviors to escape? That was your best available strategy when you had no language, no power, and no safe witness.

Recovery is not about erasing the past; it's about **re-negotiating** it. You are teaching the nervous system that the war is over while also honoring that, for a long time, it truly wasn't. That's delicate work.

A trauma-aware recovery path gives you three things: language for what happened, skills for what your body does now, and permission to move at a pace that respects your history instead of shaming it.
    `.trim(),
    reflection: `
If your body could tell the truth about one moment from your past – without being rushed, judged, or fixed – what moment would it choose first?
    `.trim(),
  },

  "sleep-and-recovery": {
    id: "sleep-and-recovery",
    title: "Sleep and Recovery",
    understanding: `
Sleep is not a luxury add-on to recovery; it is one of the main pillars holding the whole structure up. During deep sleep, the brain processes emotional material, repairs tissue, and resets many of the systems impacted by trauma and substance use. When sleep is disrupted, everything else feels ten times harder: cravings spike, patience disappears, and small irritations feel unbearable.

For many people in recovery, bedtime is also when the noise gets loudest. The distractions are gone, the body is still, and the mind finally has space to bring forward what you've been outrunning all day. No wonder the nervous system resists.

Instead of treating sleep as a battlefield where you "win" or "lose" each night, recovery reframes it as a **relationship** you rebuild slowly. Caffeine, late-night scrolling, and constant blue light are one layer. Unprocessed grief, racing thoughts, and a hyper-vigilant nervous system are another.

Healthy sleep is not just about how long you're in bed; it's about whether your body actually believes it is safe enough to go offline. Recovery work aims at both: the practical habits and the deeper sense of safety that lets you truly drop your guard.
    `.trim(),
    reflection: `
If your nights were a friend sending you a message about what still needs attention, what would that message be trying to say?
    `.trim(),
  },

  "boundaries-in-recovery": {
    id: "boundaries-in-recovery",
    title: "Boundaries in Recovery",
    understanding: `
Boundaries are not walls to punish people; they are agreements that protect your healing. In addiction and trauma, boundaries often get blurred in both directions: others cross lines with you, and you cross lines with yourself. Over time, you stop trusting your own "no" and doubt whether you are allowed to have one.

In recovery, boundaries must do three jobs:

1) **Protect your nervous system** – limiting chaos, drama, and triggers.

2) **Protect your time and energy** – so recovery work is not squeezed into the leftovers.

3) **Protect your values** – so you stop living in ways that betray what matters to you.

Setting boundaries will almost always stir up guilt at first, especially if you grew up being rewarded for self-abandonment. People who benefited from your lack of boundaries may call you selfish when you start honoring yourself. That discomfort does not mean you're wrong; it means the system is adjusting.

Healthy boundaries are not about controlling other people's behavior. They are about being clear on what you will participate in, what you will no longer tolerate, and how you will take care of yourself when others choose not to change.
    `.trim(),
    reflection: `
Where in your life do you feel the quiet anger or exhaustion that usually shows up when a boundary is needed but has not yet been spoken?
    `.trim(),
  },

  "grief-and-loss": {
    id: "grief-and-loss",
    title: "Grief and Loss",
    understanding: `
Grief in recovery is rarely just about one event. It is layered: grief for people you've lost, for time that's gone, for relationships damaged, for versions of yourself that never got a chance to live. Many people secretly fear that if they ever start crying, they will never stop.

Our culture teaches "move on." The nervous system, however, does not work on social timelines. It stores unfinished goodbyes in the body: a tight throat when a certain song plays, sudden tears in the grocery store, anger that seems out of proportion to the moment.

In recovery, grief can feel dangerous because it seems connected to relapse: "If I let myself feel this, I'll use." But unacknowledged grief leaks out sideways anyway – through irritability, numbness, or self-sabotage.

Honoring loss does not mean drowning in it. It means telling the truth about what happened, naming what will never be the same, and also making room for what is still possible. You are allowed to build a future while still loving who and what you lost.
    `.trim(),
    reflection: `
What is one loss you almost never talk about, and what might change if that grief finally had a safe place to be witnessed instead of hidden?
    `.trim(),
  },

  "self-compassion": {
    id: "self-compassion",
    title: "Self-Compassion",
    understanding: `
Many people in recovery are far more comfortable with self-attack than self-kindness. The belief is, "If I go soft on myself, I'll lose control." So the inner voice becomes a drill sergeant: harsh, unforgiving, always pointing out what went wrong. The problem is that shame and self-contempt do not create sustainable change; they create collapse.

Self-compassion is not letting yourself off the hook. It is staying *with* yourself while you tell the truth. It sounds like: "Yes, I messed up. And I am still worth protecting. What do I need to repair this and keep going?" It treats you as a human learning new skills, not as a monster who should already know how to do everything perfectly.

Research is clear: people who practice self-compassion are more likely to take responsibility, make amends, and stick with difficult change over time. In recovery, this skill is survival equipment. Without it, every slip becomes proof that you are hopeless. With it, every slip becomes information you can learn from.

The work is to slowly replace the inner persecutor with an inner advocate who speaks with honesty *and* warmth.
    `.trim(),
    reflection: `
If you spoke to a friend you deeply respect the way you usually speak to yourself after a mistake, what would you notice in their face – and what does that tell you about what needs to change inside?
    `.trim(),
  },
};

/**
 * Main API – use this in the Recovery Basics UI.
 *
 * @param {string} topicId one of RECOVERY_BASICS_TOPICS
 * @returns {{id:string,title:string,understanding:string,reflection:string}}
 */
export function getRecoveryBasicsContent(topicId) {
  const fallback = TOPIC_MAP["shame-and-recovery"];

  if (!topicId) return fallback;

  const normalized =
    topicId.toLowerCase().replace(/\s+/g, "-") ||
    "shame-and-recovery";

  return TOPIC_MAP[normalized] ?? fallback;
}

