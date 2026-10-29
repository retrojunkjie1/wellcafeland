// src/engines/learningPaths/learningTopicsConfig.js
// Phase 45: Dynamic Learning Paths - Topic & Tile Definitions

/**
 * LEARNING_TOPICS structure:
 * - Each topic has exactly 7 tiles
 * - Each tile has multiple versions (designed for 8+ variants)
 * - Versions are selected non-repeating within a session
 */

export const LEARNING_TOPICS = {
  "shame-and-recovery": {
    id: "shame-and-recovery",
    title: "Shame and Recovery",
    subtitle: "Understanding the hidden architect of self-attack",
    tiles: [
      {
        id: "what-shame-really-is",
        label: "What Shame Really Is",
        mood: "deep",
        caption: "The foundation",
        versions: [
          {
            versionId: "v1",
            depthLevel: 1,
            title: "Shame as a Survival Strategy",
            body: "Shame is not a moral failure; it is a nervous system survival strategy. When you were young and vulnerable, shame taught you to shrink, to hide, to make yourself smaller so you wouldn't be seen as a threat. Your body learned: 'If I disappear, maybe I'll be safe.' Years later, that same pattern activates when you make a mistake, when someone criticizes you, when you start to succeed. The nervous system doesn't know the war is over. It still acts as if shrinking will save you. Understanding this is the first step toward renegotiating your relationship with shame.",
            reflectionPrompt: "When you notice shame show up, what does it seem to be trying to protect you from?",
          },
          {
            versionId: "v2",
            depthLevel: 1,
            title: "Shame vs. Guilt: The Critical Distinction",
            body: "Guilt says: 'I did something wrong.' Shame says: 'I am something wrong.' One is about behavior; the other is about identity. Guilt can guide change because it separates who you are from what you did. Shame collapses the person inside the behavior. In recovery, this distinction is life-saving. When you slip, guilt says: 'That action didn't align with my values. What do I need to repair?' Shame says: 'See? You're hopeless. You'll never change.' Recovery requires learning to feel guilt without collapsing into shame.",
            reflectionPrompt: "Think of a recent mistake. Can you separate what you did from who you are?",
          },
        ],
      },
      {
        id: "origin-story",
        label: "Where Shame Learned Its Script",
        mood: "exploration",
        caption: "The roots",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "The First Time Shame Showed Up",
            body: "Shame didn't start as an abstract concept. It started as a specific moment: someone's face when you told the truth, the way a room went quiet when you expressed a need, the look in someone's eyes that said you were too much or not enough. Your nervous system recorded that moment and created a rule: 'This is what happens when I'm seen.' Every subsequent shame experience reinforced that original script. Recovery means going back to that first moment—not to blame, but to understand. To see that shame was a child's best attempt at safety in an unsafe world.",
            reflectionPrompt: "What's the earliest memory you have of feeling shame? What was happening?",
          },
        ],
      },
      {
        id: "shame-vs-guilt",
        label: "The Difference Between 'I Am Bad' and 'I Did Something Bad'",
        mood: "clarity",
        caption: "Essential distinction",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "Guilt Can Guide; Shame Only Destroys",
            body: "Guilt is a compass. It points toward repair, amends, and alignment with your values. Shame is a sledgehammer. It doesn't guide—it just destroys. When you feel guilt, you can ask: 'What do I need to do differently?' When you feel shame, you can only collapse. In recovery, we practice feeling guilt without letting it become shame. We learn to say: 'Yes, I made a mistake. And I am still worth protecting. What do I need to repair this and keep going?' This is the difference between accountability and self-destruction.",
            reflectionPrompt: "Can you think of a time when guilt helped you make a better choice?",
          },
        ],
      },
      {
        id: "shame-and-nervous-system",
        label: "How Shame Lives in the Body",
        mood: "embodiment",
        caption: "Somatic awareness",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "Shame as a Physical Experience",
            body: "Shame isn't just a thought—it's a full-body experience. Your shoulders drop. Your chest tightens. Your eyes look down. Your voice gets smaller. Your body is trying to make you disappear because shame taught it that visibility equals danger. When shame activates, your nervous system goes into shutdown: freeze, collapse, disconnect. Recovery means learning to notice these physical signals and respond with regulation instead of further collapse. You can't think your way out of shame. You have to feel your way through it, with support, with tools, with the understanding that your body is trying to protect you in the only way it knows how.",
            reflectionPrompt: "Where in your body do you feel shame most strongly?",
          },
        ],
      },
      {
        id: "shame-in-relationships",
        label: "How Shame Sabotages Connection",
        mood: "relational",
        caption: "Impact on connection",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "The Shame Paradox",
            body: "Shame makes you believe you're unlovable, then it makes you act in ways that push love away. It's a self-fulfilling prophecy. When shame is running the show, you might: avoid eye contact, assume people will leave, test relationships to prove they'll fail, or push people away before they can reject you. Shame convinces you that you're protecting yourself by staying alone, but isolation only deepens the shame. Recovery means learning to let people see you—not the perfect version, but the real one. It means trusting that some people can handle your truth, your mistakes, your humanity.",
            reflectionPrompt: "How does shame show up in your closest relationships?",
          },
        ],
      },
      {
        id: "shame-loop",
        label: "The Shame → Escape → Regret Loop",
        mood: "pattern",
        caption: "Breaking cycles",
        versions: [
          {
            versionId: "v1",
            depthLevel: 4,
            title: "The Shame Spiral",
            body: "Here's how it works: Shame activates. The body feels unbearable. The mind offers escape: substances, behaviors, numbing, distraction. You take the escape. It works temporarily. Then the shame comes back stronger because now you've 'proven' you're hopeless. Regret. More shame. The cycle repeats. Recovery means interrupting this loop at any point. You can notice the shame without acting on it. You can feel the urge without following it. You can choose a different response: connection instead of isolation, regulation instead of escape, honesty instead of hiding. The loop doesn't have to be your only option.",
            reflectionPrompt: "What's one way you could interrupt the shame loop next time it starts?",
          },
        ],
      },
      {
        id: "integrating-shame",
        label: "What Healing With Shame Looks Like",
        mood: "integration",
        caption: "The path forward",
        versions: [
          {
            versionId: "v1",
            depthLevel: 5,
            title: "Shame Doesn't Disappear; It Transforms",
            body: "Healing with shame doesn't mean it goes away. It means you develop a new relationship with it. Instead of shame being the voice that runs your life, it becomes information: 'Oh, shame is here. What does it need me to know?' Instead of collapsing, you can get curious. Instead of hiding, you can reach out. Instead of self-attack, you can offer self-compassion. This takes practice. It takes support. It takes time. But it's possible. You can learn to hold shame without being consumed by it. You can learn to see it as a wounded part of you that needs care, not as proof that you're broken beyond repair.",
            reflectionPrompt: "What would it feel like to have a different relationship with shame?",
          },
        ],
      },
    ],
  },

  "cravings-and-urges": {
    id: "cravings-and-urges",
    title: "Cravings and Urges",
    subtitle: "Understanding the signal beneath the surface",
    tiles: [
      {
        id: "what-cravings-really-are",
        label: "What Cravings Really Are",
        mood: "deep",
        caption: "The foundation",
        versions: [
          {
            versionId: "v1",
            depthLevel: 1,
            title: "Cravings as Signals, Not Commands",
            body: "A craving is not a moral failure or a verdict about your recovery. It can show up as thoughts, feelings, physical sensations, or several things together. You do not have to identify a hidden cause to deserve support. Urges differ from person to person and from moment to moment; no timer or technique can promise when one will ease. If useful, choose a practical next move: create distance from a trigger when safe, contact someone you trust, start a familiar activity, or find peer or professional support.",
            reflectionPrompt: "Optional: choose the kind of support that would help now. No written answer is needed.",
          },
        ],
      },
      {
        id: "three-layers",
        label: "Different Ways Urges Can Show Up",
        mood: "clarity",
        caption: "Body, emotion, story",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "Thoughts, Feelings, and Situations",
            body: "An urge may come with thoughts, emotions, memories, sensations, or a situation around you. The mix is personal and can change. You do not have to inspect your body or name every part of the experience. If noticing sensations is uncomfortable, skip it. You can move straight to practical support: contact a trusted person, leave a triggering setting if safe, or choose a familiar activity.",
            reflectionPrompt: "Optional: choose a practical next move or leave this blank.",
          },
        ],
      },
      {
        id: "wave-pattern",
        label: "Urges Do Not Follow a Timer",
        mood: "pattern",
        caption: "Your experience can vary",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "A Pause Can Make Room for Choice",
            body: "Some people find the wave metaphor useful, but urges do not follow a reliable schedule. They may ease, stay steady, or intensify. A three-minute pause is not a promise that a craving will pass. It can simply give you a little time to choose: change your surroundings if safe, contact someone supportive, begin a familiar task, or find live help. You can stop any exercise that does not fit.",
            reflectionPrompt: "Optional: select one kind of support you could reach for.",
          },
        ],
      },
      {
        id: "what-it-protects",
        label: "What the Craving Is Protecting You From",
        mood: "exploration",
        caption: "Beneath the surface",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "The Question That Changes Everything",
            body: "You do not have to interpret an urge or decide what it means. Sometimes an immediate practical need is easier to address; sometimes connection or professional support is what helps. You can choose one small action without explaining yourself: ask for company, get away from a trigger if it is safe, or search for a peer group or service. It is okay if you are unsure what would help.",
            reflectionPrompt: "Optional: choose company, a change of setting, a familiar activity, or outside support.",
          },
        ],
      },
      {
        id: "urge-surfing",
        label: "Practical Support for an Urge",
        mood: "practice",
        caption: "Practical tool",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "Choose What Helps in This Moment",
            body: "There is no single correct response to a craving. If it feels safe, you might create some distance from a trigger, ask a trusted person or peer for company, or start an ordinary task. A short pause can be optional; it does not measure progress or predict how you will feel afterward. If you need more support, connect with a counselor, support group, or local service.",
            reflectionPrompt: "Optional: choose one next move. You do not need to write about the craving.",
          },
        ],
      },
      {
        id: "triggers",
        label: "Understanding Your Triggers",
        mood: "awareness",
        caption: "Pattern recognition",
        versions: [
          {
            versionId: "v1",
            depthLevel: 4,
            title: "Triggers Are Information",
            body: "Triggers aren't random. They're patterns. Certain people, places, times of day, emotions, or situations reliably activate cravings. Recovery means getting curious about your triggers instead of being ashamed of them. What patterns do you notice? What situations make cravings stronger? What times of day? What emotions? When you understand your triggers, you can prepare. You can have tools ready. You can reach out for support before the craving gets too strong. You can change your environment. You can change your routine. Triggers don't have to be your enemy. They can be your teacher, showing you where you need more support, more tools, more care.",
            reflectionPrompt: "What are your top three triggers, and how could you prepare for them?",
          },
        ],
      },
      {
        id: "long-term-shift",
        label: "The Long-Term Shift",
        mood: "integration",
        caption: "Lasting change",
        versions: [
          {
            versionId: "v1",
            depthLevel: 5,
            title: "When Cravings Become Less Powerful",
            body: "Over time, with practice, cravings become less powerful. Not because you're stronger, but because you've built alternatives. You've learned to meet your needs directly. You've learned to regulate your nervous system. You've learned to ride waves instead of fighting them. You've built a life that doesn't require escape. The cravings might still show up, but they don't have the same pull. They become background noise instead of a command. This doesn't happen overnight. It happens through thousands of small choices: choosing connection over isolation, choosing regulation over escape, choosing honesty over hiding. Each choice builds the new pattern. Each choice proves you can handle life without the old survival strategy.",
            reflectionPrompt: "What's one alternative to using that you've discovered works for you?",
          },
        ],
      },
    ],
  },

  "nervous-system-regulation": {
    id: "nervous-system-regulation",
    title: "Nervous System Regulation",
    subtitle: "Teaching your body new options",
    tiles: [
      {
        id: "what-regulation-is",
        label: "What Regulation Really Means",
        mood: "deep",
        caption: "The foundation",
        versions: [
          {
            versionId: "v1",
            depthLevel: 1,
            title: "Recovery as Nervous System Retraining",
            body: "Recovery is not just a mindset shift; it is a nervous system retraining project. Many of us grew up in environments where calm was rare and unpredictability was normal. The body adapted by staying on guard. Years later, the nervous system still acts as if danger is always one step away. Regulation means teaching the body new options: learning how to move from panic back into presence, from freeze back into choice. Grounding, breath work, movement, and safe connection are not cute self-care tricks—they are re-coding tools for your entire system. Over time, the goal is not to never get triggered. The goal is to recognize when your system is out of its window of tolerance and have real, practical ways to come back to center.",
            reflectionPrompt: "How does your body usually tell you that it has left its 'okay zone'?",
          },
        ],
      },
      {
        id: "window-of-tolerance",
        label: "Your Window of Tolerance",
        mood: "clarity",
        caption: "Understanding capacity",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "The Window of Tolerance",
            body: "Everyone has a window of tolerance—a range of arousal where you can think clearly, feel your feelings, and respond instead of react. When you're in your window, you can handle stress, process emotions, and make choices. When you're outside your window—either too high (hyperarousal: panic, rage, overwhelm) or too low (hypoarousal: numb, collapsed, dissociated)—you can't think clearly. You can only react. Recovery means learning to recognize when you're outside your window and having tools to bring yourself back. It means expanding your window over time through regulation practices, safe connection, and trauma processing. It means knowing your limits and respecting them.",
            reflectionPrompt: "What does it feel like when you're in your window of tolerance?",
          },
        ],
      },
      {
        id: "hyperarousal",
        label: "When You're Too High",
        mood: "awareness",
        caption: "Hyperarousal",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "Hyperarousal: The Overdrive State",
            body: "When your nervous system is in hyperarousal, everything feels too much. Small problems feel catastrophic. Neutral faces look threatening. Your heart races. Your thoughts spiral. You can't sleep. You can't sit still. You're wired, anxious, on edge. This is not you being 'dramatic.' This is your nervous system stuck in fight-or-flight, acting as if danger is everywhere. Recovery means learning to recognize this state and having tools to bring yourself down: breath work, cold water, movement, grounding, connection. You can't think your way out of hyperarousal. You have to regulate your way out of it, through the body, with patience and practice.",
            reflectionPrompt: "What's one tool that helps you when you're in hyperarousal?",
          },
        ],
      },
      {
        id: "hypoarousal",
        label: "When You're Too Low",
        mood: "awareness",
        caption: "Hypoarousal",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "Hypoarousal: The Shutdown State",
            body: "When your nervous system is in hypoarousal, everything feels numb. You're tired, checked out, disconnected. You can't feel your feelings. You can't think clearly. You just want to disappear. This is not you being 'lazy.' This is your nervous system in freeze, collapse, or shutdown. It's your body's way of protecting you when fight-or-flight wasn't enough. Recovery means learning to recognize this state and having tools to bring yourself up: movement, sound, connection, gentle stimulation. You have to wake up the nervous system slowly, with care, without overwhelming it. Regulation is about finding the middle ground—not too high, not too low, but present and available.",
            reflectionPrompt: "What helps you come out of shutdown or numbness?",
          },
        ],
      },
      {
        id: "regulation-tools",
        label: "Regulation Tools That Work",
        mood: "practice",
        caption: "Practical tools",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "Tools for Every State",
            body: "Different states need different tools. When you're too high (hyperarousal), you need tools that bring you down: slow breathing, cold water, weighted blankets, gentle movement, connection with a safe person. When you're too low (hypoarousal), you need tools that bring you up: faster movement, sound, music, social connection, stimulation. When you're in your window, you need tools that keep you there: regular breath work, movement, connection, routine. The key is having a toolkit and knowing which tool to use when. This takes practice. It takes experimentation. It takes support. But over time, you build a reliable set of practices that help you stay regulated, or get back to regulation when you've left your window.",
            reflectionPrompt: "What's one regulation practice you're willing to treat as non-negotiable for the next seven days?",
          },
        ],
      },
      {
        id: "co-regulation",
        label: "The Power of Co-Regulation",
        mood: "relational",
        caption: "Connection as regulation",
        versions: [
          {
            versionId: "v1",
            depthLevel: 4,
            title: "We Regulate Together",
            body: "Humans are not meant to regulate alone. Our nervous systems are designed to co-regulate—to borrow calm from others when we can't find it ourselves. This is why connection is so important in recovery. When you're dysregulated, being with a safe, regulated person can help bring you back to your window. Their calm nervous system can help calm yours. This is not weakness. This is biology. Recovery means building relationships with people who can hold space for your dysregulation without trying to fix it, who can offer presence when you're overwhelmed, who can help you find your way back to center. It means learning to ask for help. It means learning to receive support. It means understanding that regulation is a relational practice, not just an individual one.",
            reflectionPrompt: "Who in your life helps you feel more regulated just by being present?",
          },
        ],
      },
      {
        id: "long-term-regulation",
        label: "Building Lasting Regulation",
        mood: "integration",
        caption: "The path forward",
        versions: [
          {
            versionId: "v1",
            depthLevel: 5,
            title: "Regulation as a Way of Life",
            body: "Over time, regulation becomes less about managing crises and more about building a life that supports your nervous system. It means creating routines that keep you in your window. It means setting boundaries that protect your capacity. It means choosing relationships that help you stay regulated. It means processing trauma so your system doesn't have to stay on guard. It means learning to recognize your limits and respecting them. Regulation isn't something you do once and you're done. It's a practice, a way of life, a commitment to staying present and available to life without being overwhelmed by it. This is the long-term work of recovery: not just stopping substances or behaviors, but building a nervous system that can handle life without needing to escape.",
            reflectionPrompt: "What would a life that supports your nervous system look like?",
          },
        ],
      },
    ],
  },

  "trauma-and-recovery": {
    id: "trauma-and-recovery",
    title: "Trauma and Recovery",
    subtitle: "Re-negotiating the past, building the future",
    tiles: [
      {
        id: "what-trauma-is",
        label: "What Trauma Really Is",
        mood: "deep",
        caption: "The foundation",
        versions: [
          {
            versionId: "v1",
            depthLevel: 1,
            title: "Trauma Is More Than What Happened",
            body: "Trauma is not only about 'what happened.' It is also about what didn't happen afterward: the support you didn't get, the safety that never came, the apology that never arrived. Trauma leaves the body holding stories it never had a chance to finish telling. Because of this, people often blame themselves for reactions that actually make sense. Startle easily? That was your body learning to survive unpredictability. Go numb in conflict? That was your system protecting you when fighting back wasn't safe. Use substances or behaviors to escape? That was your best available strategy when you had no language, no power, and no safe witness. Recovery is not about erasing the past; it's about re-negotiating it.",
            reflectionPrompt: "If your body could tell the truth about one moment from your past, what moment would it choose first?",
          },
        ],
      },
      {
        id: "trauma-responses",
        label: "How Trauma Shows Up",
        mood: "awareness",
        caption: "Understanding responses",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "Fight, Flight, Freeze, Fawn",
            body: "Trauma responses are not choices; they are survival strategies. Fight: anger, aggression, pushing back. Flight: running, avoiding, escaping. Freeze: numbness, dissociation, collapse. Fawn: people-pleasing, losing yourself to keep others happy. Most people have a primary response, but you might use different ones in different situations. Understanding your trauma responses helps you stop blaming yourself for reactions that make sense given your history. Recovery means learning to recognize when you're in a trauma response and having tools to come back to the present. It means understanding that these responses were once necessary for survival, and now you're learning new options.",
            reflectionPrompt: "Which trauma response do you notice yourself using most often?",
          },
        ],
      },
      {
        id: "trauma-and-addiction",
        label: "The Trauma-Addiction Connection",
        mood: "clarity",
        caption: "Understanding the link",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "Addiction as a Survival Strategy",
            body: "For many people, addiction starts as a way to survive trauma. Substances or behaviors help you escape unbearable feelings, numb overwhelming memories, or create a sense of control when life feels chaotic. The problem is that what starts as survival becomes its own trauma. The addiction creates more pain, more shame, more isolation. Recovery means understanding that your addiction wasn't a moral failure—it was a survival strategy. It means learning to meet your needs in ways that don't cost you your life. It means processing the original trauma so you don't need the escape anymore. It means building a life that doesn't require numbing because you can handle what's real.",
            reflectionPrompt: "How did your addiction or behavior help you survive at first?",
          },
        ],
      },
      {
        id: "processing-trauma",
        label: "Processing Trauma Safely",
        mood: "practice",
        caption: "The healing path",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "Trauma Processing Is Not Reliving",
            body: "Processing trauma doesn't mean reliving it. It means telling the story in a safe container, with support, at a pace your nervous system can handle. It means giving your body a chance to complete the response it couldn't complete at the time. It means understanding what happened, how it affected you, and what you need now to heal. This work requires a skilled therapist, a safe environment, and a regulated nervous system. You can't rush it. You can't force it. You have to move at the pace of your body, respecting your limits, honoring your capacity. Recovery means building the capacity to process trauma without being retraumatized by the process itself.",
            reflectionPrompt: "What would you need to feel safe enough to process your trauma?",
          },
        ],
      },
      {
        id: "trauma-triggers",
        label: "Understanding Trauma Triggers",
        mood: "awareness",
        caption: "Pattern recognition",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "Triggers Are Memory Fragments",
            body: "Trauma triggers are not random. They're memory fragments—sights, sounds, smells, feelings, or situations that remind your nervous system of the original trauma. When triggered, your body reacts as if the trauma is happening now, even though it's in the past. Recovery means learning to recognize your triggers and having tools to regulate when they activate. It means understanding that being triggered doesn't mean you're broken—it means your body remembers. It means creating safety in the present so your nervous system can learn that the danger is over. Over time, with support and regulation, triggers become less powerful. They become information instead of commands.",
            reflectionPrompt: "What are your main trauma triggers, and how do you respond when they activate?",
          },
        ],
      },
      {
        id: "post-traumatic-growth",
        label: "Post-Traumatic Growth",
        mood: "hope",
        caption: "Beyond survival",
        versions: [
          {
            versionId: "v1",
            depthLevel: 4,
            title: "Growth After Trauma",
            body: "Post-traumatic growth doesn't mean the trauma was good or necessary. It means that after processing trauma, some people develop strengths they wouldn't have had otherwise: deeper empathy, stronger boundaries, clearer values, more authentic relationships, greater resilience. This doesn't happen automatically. It happens through intentional healing work: processing the trauma, building regulation capacity, creating safety, connecting with others, finding meaning. Recovery from trauma is not just about surviving—it's about thriving. It's about building a life that honors what happened without being defined by it. It's about using your experience to help others. It's about turning pain into purpose.",
            reflectionPrompt: "What strengths have you developed through your trauma and recovery?",
          },
        ],
      },
      {
        id: "trauma-informed-recovery",
        label: "Trauma-Informed Recovery",
        mood: "integration",
        caption: "The complete path",
        versions: [
          {
            versionId: "v1",
            depthLevel: 5,
            title: "Recovery That Honors Your History",
            body: "Trauma-informed recovery means understanding that addiction, mental health struggles, and relationship patterns often have trauma at their roots. It means treating trauma responses with compassion instead of judgment. It means moving at the pace of your nervous system, not someone else's timeline. It means building safety before pushing for change. It means understanding that healing is not linear, that setbacks are part of the process, that progress looks different for everyone. A trauma-informed recovery path gives you three things: language for what happened, skills for what your body does now, and permission to move at a pace that respects your history instead of shaming it. This is recovery that honors your whole story.",
            reflectionPrompt: "What would trauma-informed recovery look like for you?",
          },
        ],
      },
    ],
  },

  "sleep-and-recovery": {
    id: "sleep-and-recovery",
    title: "Sleep and Recovery",
    subtitle: "Rebuilding the foundation of rest",
    tiles: [
      {
        id: "why-sleep-matters",
        label: "Why Sleep Matters in Recovery",
        mood: "deep",
        caption: "The foundation",
        versions: [
          {
            versionId: "v1",
            depthLevel: 1,
            title: "What Sleep Supports",
            body: "Sleep supports attention, mood, learning, and physical health. In recovery, a difficult night can make the next day feel harder, but it does not erase your progress or predict what you will do. Rest is one useful part of care, alongside connection, treatment, and the routines that work for you.",
            reflectionPrompt: "What feels harder after a short or disrupted night?",
            followUps: [
              { title: "Sleep and Learning", body: "Sleep helps the brain strengthen and organize learning. If you are practicing a new coping skill, a tired day may make recall harder; a written reminder or support person can help bridge that gap." },
              { title: "Progress Is Bigger Than Sleep", body: "Sleep is one part of recovery, not a measure of commitment. Connection, treatment, safer choices, and asking for help still count on a night when rest was difficult." },
            ],
          },
          {
            versionId: "v2",
            depthLevel: 2,
            title: "One Night Is Not the Whole Story",
            body: "Sleep naturally varies. A rough night does not mean you have failed or that tonight will be the same. If you can, return to a steady wake time and your usual supportive routine; avoid judging recovery by a single night. If sleep problems persist or affect daily life, a clinician can help you explore what is contributing.",
            reflectionPrompt: "What would a kinder measure of progress look like tomorrow?",
            followUps: [
              { title: "Look for a Pattern, Not a Verdict", body: "One night can be unusual. If you choose to notice sleep, look at several days and the context around them. A pattern may offer a useful question to discuss; it does not prove a cause." },
              { title: "When It Keeps Affecting Your Day", body: "If sleep difficulty continues or makes daily life harder, consider talking with a healthcare professional. You can describe what you notice without needing to arrive with a diagnosis or a perfect sleep log." },
            ],
          },
          {
            versionId: "v3",
            depthLevel: 3,
            title: "Rest Has More Than One Form",
            body: "If sleep is not coming, you can still reduce demands where possible: sit quietly, listen to something soothing, or rest your body. These choices do not replace sleep, and they do not need to become another task to do perfectly. Pick the option that feels comfortable and safe in your space.",
            reflectionPrompt: "What kind of low-pressure rest feels available to you?",
            followUps: [
              { title: "Rest Is Not a Substitute for Sleep", body: "Quiet rest can make a moment less demanding, but it does not provide all the functions of sleep. If lack of sleep is persistent, support from a healthcare professional may help you explore why." },
              { title: "Make the Choice Fit Your Body", body: "Rest might mean lying down, sitting with support, or listening to familiar audio. You do not need to close your eyes, focus on breathing, or stay still if that feels uncomfortable." },
            ],
          },
        ],
      },
      {
        id: "sleep-and-nervous-system",
        label: "Sleep and Your Nervous System",
        mood: "clarity",
        caption: "The connection",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "Why Settling Can Take Time",
            body: "A busy mind or alert body can make it harder to settle, especially during stress or change. That response is not proof that you are doing sleep wrong. Notice what is present without forcing calm, then choose one small cue that feels supportive: softer light, a familiar sound, or a brief grounding practice.",
            reflectionPrompt: "Which small cue feels settling rather than demanding?",
            followUps: [
              { title: "A Transition Can Be Enough", body: "Some people find a familiar, low-stimulation transition helpful before bed. It could be washing up, dimming a light, or listening to the same calm track. Keep only what feels workable." },
              { title: "You Do Not Have to Force Calm", body: "Trying hard to make yourself sleep can add pressure. A gentle cue is an invitation, not a test; if it increases tension, choose a neutral activity or another form of support." },
            ],
          },
          {
            versionId: "v2",
            depthLevel: 3,
            title: "Safety Is Personal",
            body: "There is no single bedtime setup that feels safe for everyone. A closed door, an open door, a light on, or another person nearby may matter to you—or may not. You can adapt your environment to your real circumstances; you do not need to follow a routine that makes you less comfortable.",
            reflectionPrompt: "What would make your sleep space feel a little more workable?",
            followUps: [
              { title: "Work With the Space You Have", body: "A shared room, shelter, shift work, caregiving, or neighborhood noise can limit options. Choose a small adjustment that is safe and available; this is not a failure of sleep habits." },
              { title: "Comfort Does Not Need One Formula", body: "Sleep advice is not universal. A light, sound, door position, or comfort item may help one person and bother another. Your own sense of comfort is relevant information." },
            ],
          },
          {
            versionId: "v3",
            depthLevel: 4,
            title: "When Alertness Keeps Returning",
            body: "If nighttime alertness, nightmares, or fear keeps disrupting sleep, you deserve support that takes it seriously. A primary-care or mental-health professional can help you consider possible causes and options. You can share only what feels appropriate; you do not have to solve the pattern alone.",
            reflectionPrompt: "Who could help you explore this without judgment?",
            followUps: [
              { title: "Bring One Clear Observation", body: "You might tell a clinician how often this happens, what it changes the next day, and any patterns you have noticed. You can keep the conversation focused on sleep if that feels safer." },
              { title: "Support Can Be Collaborative", body: "A clinician can help consider stress, medication effects, health conditions, schedule, or other contributors. You can ask about options and decide together what feels appropriate to explore." },
            ],
          },
        ],
      },
      {
        id: "sleep-hygiene",
        label: "Sleep Hygiene That Works",
        mood: "practice",
        caption: "Practical tools",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "Build a Routine You Can Keep",
            body: "A regular sleep and wake schedule can help your body recognize its rhythm. Start with one realistic cue—such as a wind-down activity or a consistent morning start—rather than changing everything at once. Adapt for work, caregiving, housing, and safety; a useful routine has to fit your life.",
            reflectionPrompt: "What is one small cue you could realistically repeat?",
            followUps: [
              { title: "A Morning Anchor", body: "For some people, a fairly consistent wake time is easier to protect than a strict bedtime. It can be one point of rhythm to discuss or experiment with, adjusted for shift work, health, and caregiving." },
              { title: "Small Beats Perfect", body: "A routine can be two minutes long and still be yours. Repeating one manageable cue may feel more sustainable than adding rules that create stress or are impossible to follow." },
            ],
          },
          {
            versionId: "v2",
            depthLevel: 3,
            title: "Light, Caffeine, and Timing",
            body: "Daylight and activity during the day can support a steadier sleep rhythm. Caffeine can affect people differently and may linger, so notice whether timing changes your rest. If you work nights or rotating shifts, standard bedtime advice may not fit; a clinician can help tailor options to your schedule.",
            reflectionPrompt: "Is there one timing pattern you want to notice this week?",
            followUps: [
              { title: "Notice Your Own Caffeine Window", body: "Caffeine sensitivity and schedules differ. If you suspect it affects your sleep, you might notice timing and effects before making a change; there is no single cutoff that fits everyone." },
              { title: "Shift Work Changes the Equation", body: "Night and rotating shifts can put sleep at a different time of day. Light-blocking or quieting strategies may be options when available, but your work and home constraints matter." },
            ],
          },
          {
            versionId: "v3",
            depthLevel: 3,
            title: "When the Routine Breaks",
            body: "Travel, stress, illness, or an unpredictable schedule can interrupt routines. You can restart with the next manageable cue instead of trying to make up for lost sleep. Keep the plan flexible; consistency is a support, not a test you have to pass.",
            reflectionPrompt: "What is a gentle first step after a disrupted night?",
            followUps: [
              { title: "Resume, Do Not Punish", body: "After a disrupted night, you do not need to compensate with a rigid plan or criticize yourself. Return to one familiar cue when your circumstances allow." },
              { title: "Leave Room for Real Life", body: "Illness, caregiving, housing changes, and work can interrupt sleep. A useful routine bends around those realities instead of making them feel like personal failure." },
            ],
          },
        ],
      },
      {
        id: "nighttime-anxiety",
        label: "When Nighttime Gets Loud",
        mood: "awareness",
        caption: "Understanding resistance",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "When Thoughts Get Louder",
            body: "Quiet can leave more room to notice worries or unfinished thoughts. You do not have to argue with every thought or force it away. If it helps, write a short note for tomorrow, name what can wait, or return attention to a neutral sound in the room.",
            reflectionPrompt: "Would a note, a sound, or simply noticing feel most useful?",
            followUps: [
              { title: "Park One Thought for Tomorrow", body: "A brief note can capture a reminder without requiring you to solve it at night. If writing makes thoughts louder, skip it; an external sound or another neutral focus may fit better." },
              { title: "Thoughts Can Be Present Without a Response", body: "A thought does not always need an answer right now. You can notice it, let it be unfinished, and choose whether to return attention to a comfortable sound or sensation." },
            ],
          },
          {
            versionId: "v2",
            depthLevel: 3,
            title: "A Small Grounding Reset",
            body: "Try orienting to the present: notice the support beneath you, name a few ordinary things you can see, and let your breathing stay natural. Stop if focusing inward feels uncomfortable. You can choose an external anchor instead, such as a familiar song or the feel of a blanket.",
            reflectionPrompt: "Which external or sensory anchor feels comfortable?",
            followUps: [
              { title: "Choose an Outside Anchor", body: "A steady sound, a familiar object, or the feel of fabric can offer attention something concrete. There is no need to scan your body or close your eyes." },
              { title: "Stop When It Does Not Help", body: "Grounding is optional. If an exercise increases discomfort, open your eyes, change the focus, or stop and reach for a person or support that feels safer." },
            ],
          },
          {
            versionId: "v3",
            depthLevel: 4,
            title: "If Distress Feels Too Big",
            body: "You do not have to handle intense memories or distress alone at bedtime. It may help to contact someone you trust or discuss recurring nighttime distress with a qualified professional. If you feel in immediate danger, use local emergency or crisis support.",
            reflectionPrompt: "Who is a safe person or service you could reach out to?",
            followUps: [
              { title: "Make Support Easier to Reach", body: "If it feels useful, keep a trusted contact or support number somewhere accessible. You can decide what to say in advance, such as: ‘I am having a hard night; can you stay with me for a few minutes?’" },
              { title: "Urgent Safety Comes First", body: "If you may harm yourself or someone else, or cannot stay safe, contact local emergency services or a crisis line now. This guide is not emergency support." },
            ],
          },
        ],
      },
      {
        id: "sleep-and-cravings",
        label: "Sleep and Cravings",
        mood: "clarity",
        caption: "The connection",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "Sleep and Urges Can Interact",
            body: "Being tired can make it harder to pause, focus, or use familiar coping strategies. That does not mean a craving is inevitable or that sleep alone determines recovery. If an urge shows up, try adding support: delay a decision, move to a safer setting, or contact someone on your recovery team.",
            reflectionPrompt: "What support helps you pause when you are tired?",
            followUps: [
              { title: "Add Support Before Making a Decision", body: "When your energy is low, a planned contact or safer setting can reduce how much you have to manage alone. Use the recovery supports that already fit your care plan." },
              { title: "An Urge Is Not a Forecast", body: "A craving is an experience in the present, not a reliable prediction of what you will do. A pause can create room to use support, even if the feeling has not gone away." },
            ],
          },
          {
            versionId: "v2",
            depthLevel: 4,
            title: "Plan for a Low-Energy Day",
            body: "After a difficult night, make the next step smaller if you can. Keep an easy meal, a check-in, or a short walk within reach. If you have a recovery plan, use the parts that help and ask for extra support when needed. A hard day is a reason to add care, not a verdict on your progress.",
            reflectionPrompt: "What is one low-effort support you can keep available?",
            followUps: [
              { title: "Prepare One Easy Option", body: "A small plan can be practical: a simple meal, a reminder to check in, or the name of a person to contact. Choose something available to you rather than an ideal routine." },
              { title: "Lower the Demand, Keep the Connection", body: "You may need to reduce tasks and still stay connected to support. A brief message or planned check-in can be enough for today if that is what feels manageable." },
            ],
          },
          {
            versionId: "v3",
            depthLevel: 4,
            title: "Track Patterns Without Blame",
            body: "If you choose, notice sleep, stress, and urges over time without treating a pattern as proof of cause. A brief note can help you and a clinician or recovery supporter spot questions worth exploring. Skip tracking if it adds pressure or does not feel private enough.",
            reflectionPrompt: "Would a simple pattern note feel helpful or burdensome?",
            followUps: [
              { title: "Keep Notes Minimal", body: "If you track, a few words about timing and how you felt may be enough to support a conversation. Avoid collecting more detail than you want to keep." },
              { title: "Patterns Raise Questions, Not Diagnoses", body: "A diary can help you discuss observations with a professional, but it cannot establish why sleep or urges changed. You can stop tracking at any time." },
            ],
          },
        ],
      },
      {
        id: "sleep-medications",
        label: "Sleep Medications and Recovery",
        mood: "clarity",
        caption: "Navigating options",
        versions: [
          {
            versionId: "v1",
            depthLevel: 4,
            title: "Review Options With Your Clinician",
            body: "Sleep medicines and supplements can have different effects, risks, and interactions. If you use them—or are considering them—review the full list with a clinician or pharmacist who understands your health and recovery history. Do not start, stop, or change a prescribed medicine based on this guide.",
            reflectionPrompt: "What question would you like to bring to a clinician or pharmacist?",
            followUps: [
              { title: "Include Nonprescription Products", body: "Tell your clinician or pharmacist about over-the-counter sleep aids, supplements, alcohol, and other medicines you use. Interactions and safety depend on your individual situation." },
              { title: "Ask for a Review Plan", body: "If you and a prescriber decide to try a treatment, ask when you will review whether it helps and what side effects or changes should prompt contact." },
            ],
          },
          {
            versionId: "v2",
            depthLevel: 4,
            title: "Prepare for a Medication Conversation",
            body: "You can ask what benefit to expect, how soon to review it, possible side effects, interactions, and what to do if it is not helping. Sharing recovery history can help a prescriber weigh options, but you can ask about privacy and how your information is used.",
            reflectionPrompt: "Which question would help you feel informed in that conversation?",
            followUps: [
              { title: "Make the Visit More Useful", body: "Bring the names and doses of medicines and supplements, how long sleep has been difficult, and what you have already tried—only what you are comfortable sharing." },
              { title: "A Shared Decision Can Include Saying No", body: "You can ask about benefits, risks, alternatives, and the option to wait. A treatment conversation should help you make an informed choice with your clinician." },
            ],
          },
          {
            versionId: "v3",
            depthLevel: 4,
            title: "Behavioral Care Is an Option Too",
            body: "For ongoing insomnia, cognitive behavioral therapy for insomnia (CBT-I) is a structured, non-medication treatment recommended in clinical guidance. Sleep-habit tips alone may not be enough for chronic insomnia. A clinician can help determine whether CBT-I or another approach fits your needs and access.",
            reflectionPrompt: "Would you like to ask a clinician about CBT-I or other support?",
            followUps: [
              { title: "What CBT-I Can Include", body: "CBT-I may combine sleep education, cognitive strategies, relaxation, and behavioral changes. A trained provider can tailor the approach and explain what it involves before you decide." },
              { title: "Access Can Be Discussed", body: "CBT-I may be offered in different formats, including in-person, group, telephone, or online options. A clinician can help you ask what is available and appropriate locally." },
            ],
          },
        ],
      },
      {
        id: "rest-as-practice",
        label: "Rest as a Recovery Practice",
        mood: "integration",
        caption: "The path forward",
        versions: [
          {
            versionId: "v1",
            depthLevel: 5,
            title: "Rest Without Earning It",
            body: "Rest does not have to be a reward for finishing everything. A brief pause between responsibilities can be worthwhile even if sleep is not possible. Choose a form that fits your body and circumstances: sitting, stretching gently, listening, or doing nothing for a moment.",
            reflectionPrompt: "What kind of short pause is realistic today?",
            followUps: [
              { title: "A Pause Can Be Small", body: "Rest does not need a special room or long break. A few quiet minutes or a comfortable position may be what is available; you do not need to turn it into a performance." },
              { title: "Rest and Sleep Are Different Needs", body: "A pause may help you reduce demands, while sleep supports functions rest alone cannot replace. If you are persistently exhausted, consider discussing it with a healthcare professional." },
            ],
          },
          {
            versionId: "v2",
            depthLevel: 5,
            title: "Protect One Small Boundary",
            body: "A more restful evening may start with one practical boundary: moving a task to tomorrow, muting a non-urgent alert, or asking someone to share a responsibility. Not every situation allows this, and you do not need to justify a choice that protects your capacity.",
            reflectionPrompt: "Is there one small demand you can safely postpone or share?",
            followUps: [
              { title: "Choose a Safe, Realistic Boundary", body: "A boundary should fit your situation. If saying no could create conflict or risk, consider another kind of support or a smaller change that keeps you safe." },
              { title: "Ask for a Specific Kind of Help", body: "A concrete request—such as handling one task or keeping an alert quiet for a while—can make support easier to understand. You can decide whether to ask." },
            ],
          },
          {
            versionId: "v3",
            depthLevel: 5,
            title: "Make Room for Support",
            body: "If tiredness is constant, affects daily functioning, or comes with other concerning symptoms, consider discussing it with a healthcare professional. Many factors can affect sleep and energy. Getting support is practical care, not a failure to rest well enough.",
            reflectionPrompt: "What would make it easier to ask for support?",
            followUps: [
              { title: "Bring the Impact Into the Conversation", body: "It may help to mention how tiredness affects daily tasks, how long it has been happening, and any changes you have noticed. A clinician can help decide what to evaluate." },
              { title: "You Deserve More Than ‘Try Harder’", body: "Persistent tiredness can have many contributors. Practical sleep habits may help some people, but ongoing symptoms deserve a thoughtful conversation about broader causes and options." },
            ],
          },
        ],
      },
    ],
  },

  "boundaries-in-recovery": {
    id: "boundaries-in-recovery",
    title: "Boundaries in Recovery",
    subtitle: "Agreements that protect your healing",
    tiles: [
      {
        id: "what-boundaries-are",
        label: "What Boundaries Really Are",
        mood: "deep",
        caption: "The foundation",
        versions: [
          {
            versionId: "v1",
            depthLevel: 1,
            title: "Boundaries Are Not Walls",
            body: "Boundaries are not walls to punish people; they are agreements that protect your healing. In addiction and trauma, boundaries often get blurred in both directions: others cross lines with you, and you cross lines with yourself. Over time, you stop trusting your own 'no' and doubt whether you are allowed to have one. In recovery, boundaries must do three jobs: protect your nervous system (limiting chaos, drama, and triggers), protect your time and energy (so recovery work is not squeezed into the leftovers), and protect your values (so you stop living in ways that betray what matters to you). Setting boundaries will almost always stir up guilt at first, especially if you grew up being rewarded for self-abandonment. That discomfort does not mean you're wrong; it means the system is adjusting.",
            reflectionPrompt: "Where in your life do you feel the quiet anger or exhaustion that usually shows up when a boundary is needed?",
          },
        ],
      },
      {
        id: "boundaries-and-guilt",
        label: "Boundaries and Guilt",
        mood: "clarity",
        caption: "Navigating discomfort",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "Why Boundaries Feel Wrong at First",
            body: "If you grew up being rewarded for self-abandonment—for saying yes when you meant no, for putting others' needs first, for being 'easy' and 'not causing trouble'—then boundaries will feel wrong at first. People who benefited from your lack of boundaries may call you selfish when you start honoring yourself. That discomfort does not mean you're wrong; it means the system is adjusting. Recovery means learning to tolerate the guilt that comes with boundaries. It means understanding that guilt is information, not a command. It means choosing your healing over others' comfort, even when it's hard. Over time, as you practice boundaries, the guilt lessens. You start to trust your 'no.' You start to believe you're allowed to have limits.",
            reflectionPrompt: "What would it feel like to set a boundary without feeling guilty?",
          },
        ],
      },
      {
        id: "types-of-boundaries",
        label: "Types of Boundaries",
        mood: "clarity",
        caption: "Understanding options",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "Physical, Emotional, Time, Energy",
            body: "Boundaries come in many forms. Physical boundaries: who can touch you, how close people can get, what environments you'll enter. Emotional boundaries: what you'll take responsibility for, what conversations you'll have, what energy you'll absorb. Time boundaries: when you're available, how long you'll stay, what you'll commit to. Energy boundaries: what drains you, what you'll say yes to, what you'll protect. Recovery means learning to set boundaries in all these areas. It means being clear on what you will participate in, what you will no longer tolerate, and how you will take care of yourself when others choose not to change. Healthy boundaries are not about controlling other people's behavior. They're about being clear on your own limits and honoring them.",
            reflectionPrompt: "Which type of boundary is hardest for you to set?",
          },
        ],
      },
      {
        id: "boundaries-with-family",
        label: "Boundaries with Family",
        mood: "relational",
        caption: "The hardest ones",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "Family Boundaries Are Often the Hardest",
            body: "Family boundaries are often the hardest because these are the relationships where boundaries were first violated. Setting boundaries with family can feel like betrayal, especially if you were taught that family comes first no matter what. But recovery means understanding that you can love someone and still have limits with them. You can care about someone and still protect yourself from their behavior. You can want connection and still say no to what harms you. Family boundaries might look like: limiting contact with people who trigger you, not discussing your recovery with people who don't support it, leaving situations that feel unsafe, or choosing not to attend events where you'll be retraumatized. These boundaries protect your healing, and that's not selfish—it's necessary.",
            reflectionPrompt: "What boundary would you need to set with family to protect your recovery?",
          },
        ],
      },
      {
        id: "boundaries-with-self",
        label: "Boundaries with Yourself",
        mood: "self-care",
        caption: "Internal boundaries",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "The Boundaries You Set with Yourself",
            body: "Recovery also means setting boundaries with yourself. This might look like: not engaging with certain thoughts or memories when you're not regulated enough to handle them, not making big decisions when you're dysregulated, not pushing yourself past your limits, not abandoning yourself to please others. These are internal boundaries—agreements you make with yourself about how you'll treat yourself, what you'll participate in, and what you'll protect. They're just as important as external boundaries. Recovery means learning to say no to yourself when saying yes would harm you. It means choosing your healing over your impulses, your values over your cravings, your long-term wellbeing over short-term relief.",
            reflectionPrompt: "What boundary do you need to set with yourself?",
          },
        ],
      },
      {
        id: "enforcing-boundaries",
        label: "Enforcing Boundaries",
        mood: "practice",
        caption: "The follow-through",
        versions: [
          {
            versionId: "v1",
            depthLevel: 4,
            title: "Boundaries Without Enforcement Are Suggestions",
            body: "Setting a boundary is only half the work. The other half is enforcing it. This means following through when someone crosses the line. It might mean leaving a situation, ending a conversation, limiting contact, or cutting ties if necessary. Enforcing boundaries is hard because people will push back. They'll test your limits. They'll try to make you feel guilty. Recovery means being willing to enforce your boundaries even when it's uncomfortable. It means understanding that a boundary without consequences is just a suggestion. It means choosing your healing over others' comfort, even when that choice is painful. Over time, as you consistently enforce boundaries, people learn to respect them. Or they leave. Either way, you're protected.",
            reflectionPrompt: "What boundary have you set but not yet enforced?",
          },
        ],
      },
      {
        id: "boundaries-as-love",
        label: "Boundaries as an Act of Love",
        mood: "integration",
        caption: "The deeper truth",
        versions: [
          {
            versionId: "v1",
            depthLevel: 5,
            title: "Boundaries Are Love, Not Punishment",
            body: "Boundaries are not about punishing people or being mean. They're about protecting your capacity to show up, to heal, to be present. When you set boundaries, you're saying: 'I care enough about this relationship to protect it. I care enough about myself to honor my limits. I care enough about my recovery to do what's necessary.' Boundaries create space for healthier relationships. They prevent resentment. They allow you to show up fully instead of showing up resentful, exhausted, or checked out. Recovery means understanding that boundaries are an act of love—for yourself, and sometimes for the relationship. They're not walls. They're agreements. They're protection. They're necessary for healing.",
            reflectionPrompt: "How could boundaries be an act of love in your life?",
          },
        ],
      },
    ],
  },

  "grief-and-loss": {
    id: "grief-and-loss",
    title: "Grief and Loss",
    subtitle: "Honoring what was, making room for what's possible",
    tiles: [
      {
        id: "what-grief-is",
        label: "What Grief Really Is",
        mood: "deep",
        caption: "The foundation",
        versions: [
          {
            versionId: "v1",
            depthLevel: 1,
            title: "Grief Is Not Just One Event",
            body: "Grief in recovery is rarely just about one event. It is layered: grief for people you've lost, for time that's gone, for relationships damaged, for versions of yourself that never got a chance to live. Many people secretly fear that if they ever start crying, they will never stop. Our culture teaches 'move on.' The nervous system, however, does not work on social timelines. It stores unfinished goodbyes in the body: a tight throat when a certain song plays, sudden tears in the grocery store, anger that seems out of proportion to the moment. In recovery, grief can feel dangerous because it seems connected to relapse: 'If I let myself feel this, I'll use.' But unacknowledged grief leaks out sideways anyway—through irritability, numbness, or self-sabotage.",
            reflectionPrompt: "What losses have you been carrying that you almost never talk about?",
          },
        ],
      },
      {
        id: "types-of-grief",
        label: "The Many Types of Grief",
        mood: "clarity",
        caption: "Understanding layers",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "Grief for What Was and What Never Was",
            body: "Recovery brings up grief for what was: the relationships you damaged, the time you lost, the opportunities that passed. But it also brings up grief for what never was: the childhood you didn't get, the safety you never had, the support you needed but didn't receive. This is complicated grief—grieving something you never actually had. It can feel confusing because how do you grieve something that wasn't there? But the body knows. The body remembers what it needed and didn't get. The body holds the grief for the parent who wasn't present, the friend who wasn't safe, the version of yourself that never got to exist. Recovery means making space for all of it: the grief for what was, and the grief for what never was.",
            reflectionPrompt: "What are you grieving that you never actually had?",
          },
        ],
      },
      {
        id: "grief-and-relapse",
        label: "Grief and the Fear of Relapse",
        mood: "awareness",
        caption: "Understanding the fear",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "Why Grief Feels Dangerous",
            body: "In recovery, grief can feel dangerous because it seems connected to relapse: 'If I let myself feel this, I'll use.' But unacknowledged grief leaks out sideways anyway—through irritability, numbness, or self-sabotage. The grief doesn't go away just because you don't feel it. It waits. It accumulates. It finds other ways to express itself. Recovery means learning to feel grief with support, with tools, with the understanding that feeling it won't destroy you. It means creating safe containers for grief: therapy, support groups, journaling, art, connection with others who understand. It means understanding that grief is not the enemy of recovery—suppressed grief is. Honoring your losses is part of healing.",
            reflectionPrompt: "How have you been avoiding grief, and what would it feel like to honor it?",
          },
        ],
      },
      {
        id: "grieving-in-recovery",
        label: "How to Grieve in Recovery",
        mood: "practice",
        caption: "Practical guidance",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "Grieving Without Escaping",
            body: "Grieving in recovery means feeling the feelings without reaching for escape. It means creating safe spaces to cry, to rage, to feel the full weight of what you've lost. It means having support people who can hold space for your grief without trying to fix it or rush you through it. It means understanding that grief doesn't follow a timeline. Some days it's heavy. Some days it's light. Some days you don't feel it at all, and that's okay too. Recovery means learning to grieve with your whole self: your body, your emotions, your mind. It means letting grief move through you instead of getting stuck. It means honoring your losses while also making room for what's still possible.",
            reflectionPrompt: "What would you need to feel safe enough to grieve fully?",
          },
        ],
      },
      {
        id: "complicated-grief",
        label: "Complicated Grief",
        mood: "awareness",
        caption: "When it's complex",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "When Grief Is Complicated",
            body: "Some grief is complicated: you're grieving someone who hurt you, or something that was both good and bad, or a relationship that was toxic but also the only love you knew. Complicated grief doesn't fit into neat categories. You might feel relief and sadness at the same time. You might miss someone and also be glad they're gone. You might grieve the loss of a substance or behavior that was destroying you. This is all valid. Recovery means making space for the complexity. It means understanding that you can grieve something that was harmful. You can miss something that wasn't good for you. You can feel multiple things at once. Grief doesn't have to make sense. It just has to be felt.",
            reflectionPrompt: "What complicated grief are you carrying?",
          },
        ],
      },
      {
        id: "grief-and-future",
        label: "Grieving While Building a Future",
        mood: "integration",
        caption: "Both/and",
        versions: [
          {
            versionId: "v1",
            depthLevel: 4,
            title: "You Can Grieve and Build at the Same Time",
            body: "Honoring loss does not mean drowning in it. It means telling the truth about what happened, naming what will never be the same, and also making room for what is still possible. You are allowed to build a future while still loving who and what you lost. You are allowed to move forward while still honoring the past. You are allowed to create new relationships while still grieving old ones. Recovery means understanding that grief and hope can coexist. You can feel the full weight of what you've lost and still believe in what's possible. You can honor the past without being trapped by it. You can grieve and grow at the same time.",
            reflectionPrompt: "How can you honor your grief while also building your future?",
          },
        ],
      },
      {
        id: "grief-as-healing",
        label: "Grief as Part of Healing",
        mood: "integration",
        caption: "The path forward",
        versions: [
          {
            versionId: "v1",
            depthLevel: 5,
            title: "Grief Is Not the Enemy of Recovery",
            body: "Grief is not the enemy of recovery—suppressed grief is. When you honor your losses, you make room for healing. When you feel your grief, you let it move through you instead of getting stuck. When you create safe spaces for grief, you prove to yourself that you can handle difficult feelings without escape. Recovery means understanding that grief is part of the healing process. It's not something to get over or move past. It's something to integrate, to honor, to carry with you as you build your new life. The goal is not to stop grieving. The goal is to learn to grieve in a way that doesn't destroy you, in a way that honors what was lost while also making room for what's possible.",
            reflectionPrompt: "What would it feel like to honor your grief as part of your healing?",
          },
        ],
      },
    ],
  },

  "self-compassion": {
    id: "self-compassion",
    title: "Self-Compassion",
    subtitle: "Replacing the inner persecutor with an inner advocate",
    tiles: [
      {
        id: "what-self-compassion-is",
        label: "What Self-Compassion Really Is",
        mood: "deep",
        caption: "The foundation",
        versions: [
          {
            versionId: "v1",
            depthLevel: 1,
            title: "Self-Compassion Is Not Letting Yourself Off the Hook",
            body: "Many people in recovery are far more comfortable with self-attack than self-kindness. The belief is: 'If I go soft on myself, I'll lose control.' So the inner voice becomes a drill sergeant: harsh, unforgiving, always pointing out what went wrong. The problem is that shame and self-contempt do not create sustainable change; they create collapse. Self-compassion is not letting yourself off the hook. It is staying with yourself while you tell the truth. It sounds like: 'Yes, I messed up. And I am still worth protecting. What do I need to repair this and keep going?' It treats you as a human learning new skills, not as a monster who should already know how to do everything perfectly.",
            reflectionPrompt: "If you spoke to a friend the way you speak to yourself after a mistake, what would you notice?",
          },
        ],
      },
      {
        id: "self-compassion-research",
        label: "The Science of Self-Compassion",
        mood: "clarity",
        caption: "Why it works",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "Research-Backed Benefits",
            body: "Research is clear: people who practice self-compassion are more likely to take responsibility, make amends, and stick with difficult change over time. In recovery, this skill is survival equipment. Without it, every slip becomes proof that you are hopeless. With it, every slip becomes information you can learn from. Self-compassion doesn't make you weak or lazy. It makes you resilient. It gives you the capacity to face your mistakes, learn from them, and keep going instead of collapsing into shame. It's the difference between accountability and self-destruction. It's the difference between growth and stagnation. It's the foundation of sustainable recovery.",
            reflectionPrompt: "How could self-compassion help you stay in recovery longer?",
          },
        ],
      },
      {
        id: "self-compassion-practice",
        label: "Practicing Self-Compassion",
        mood: "practice",
        caption: "How to do it",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "The Three Components",
            body: "Self-compassion has three components: mindfulness (noticing your suffering without judgment), common humanity (recognizing that suffering is part of being human), and self-kindness (responding to yourself with warmth instead of criticism). When you make a mistake, instead of attacking yourself, you can practice: 'This is hard. Many people struggle with this. How can I be kind to myself right now?' This doesn't mean excusing harmful behavior. It means responding to yourself the way you would respond to a friend who made a mistake: with honesty, with warmth, with the belief that they can learn and grow. Recovery means slowly replacing the inner persecutor with an inner advocate who speaks with honesty and warmth.",
            reflectionPrompt: "What would it sound like to speak to yourself with self-compassion after a mistake?",
          },
        ],
      },
      {
        id: "self-compassion-and-accountability",
        label: "Self-Compassion and Accountability",
        mood: "clarity",
        caption: "They work together",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "Compassion Enables Accountability",
            body: "Self-compassion doesn't mean avoiding accountability. It means creating the safety needed to take responsibility. When you're attacking yourself, you can't think clearly. You can't see what needs to change. You can only collapse. When you're practicing self-compassion, you can face your mistakes with clarity. You can see what happened, what you need to repair, and what you need to do differently. Self-compassion creates the emotional safety needed for honest self-reflection. It allows you to take responsibility without self-destruction. It enables growth instead of collapse. Recovery means learning to hold both: compassion for yourself and accountability for your actions. They're not opposites. They're partners.",
            reflectionPrompt: "How could self-compassion help you take more responsibility?",
          },
        ],
      },
      {
        id: "self-compassion-and-shame",
        label: "Self-Compassion as Shame Antidote",
        mood: "clarity",
        caption: "Breaking the cycle",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "Compassion Breaks the Shame Cycle",
            body: "Self-compassion is one of the most powerful antidotes to shame. When shame activates, self-compassion can interrupt the spiral. Instead of 'I'm hopeless,' you can say: 'This is hard. Many people struggle with this. How can I be kind to myself?' Instead of collapsing, you can offer yourself warmth. Instead of hiding, you can reach out for support. Self-compassion doesn't make shame disappear, but it changes your relationship with it. It allows you to see shame as information instead of truth. It gives you the capacity to respond to shame with care instead of further collapse. Recovery means practicing self-compassion especially when shame is loud—because that's when you need it most.",
            reflectionPrompt: "How could self-compassion interrupt your shame cycle?",
          },
        ],
      },
      {
        id: "self-compassion-challenges",
        label: "Why Self-Compassion Feels Hard",
        mood: "awareness",
        caption: "Understanding resistance",
        versions: [
          {
            versionId: "v1",
            depthLevel: 4,
            title: "The Resistance to Self-Kindness",
            body: "Self-compassion can feel wrong at first, especially if you grew up being criticized or if you learned that self-attack was the only way to stay safe. The inner critic might say: 'If I'm kind to myself, I'll become lazy. If I'm soft, I'll lose control. If I'm compassionate, I'll make more mistakes.' But the opposite is true. Self-compassion gives you the capacity to face your mistakes, learn from them, and keep going. Self-attack just makes you want to hide, escape, or collapse. Recovery means practicing self-compassion even when it feels wrong. It means trusting the research. It means being willing to try a different way, even if it feels uncomfortable at first. Over time, self-compassion becomes more natural. The inner advocate gets stronger. The inner persecutor gets quieter.",
            reflectionPrompt: "What resistance do you feel to self-compassion?",
          },
        ],
      },
      {
        id: "self-compassion-as-foundation",
        label: "Self-Compassion as Recovery Foundation",
        mood: "integration",
        caption: "The path forward",
        versions: [
          {
            versionId: "v1",
            depthLevel: 5,
            title: "The Foundation of Sustainable Recovery",
            body: "Self-compassion is not a nice-to-have in recovery; it's a foundation. Without it, every mistake becomes proof that you're hopeless. Every slip becomes evidence that you can't change. Every challenge becomes a reason to give up. With self-compassion, mistakes become information. Slips become learning opportunities. Challenges become growth edges. Recovery means building a relationship with yourself based on compassion instead of contempt. It means treating yourself as a human learning new skills, not as a monster who should already know everything. It means creating an inner advocate who speaks with honesty and warmth. This is the work. This is the foundation. This is what makes recovery sustainable.",
            reflectionPrompt: "What would recovery look like if self-compassion was your foundation?",
          },
        ],
      },
    ],
  },
};
