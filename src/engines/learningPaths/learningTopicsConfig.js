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
            body: "A craving is not a moral failure; it is a signal. Your nervous system has learned, through repetition, that a certain substance or behavior temporarily changes how you feel. When stress, loneliness, anger, or emptiness spike, the brain simply offers the fastest solution it remembers. The craving isn't trying to destroy you—it's trying to help you feel better. Understanding this shifts everything. Instead of fighting the craving, you can listen to it. What feeling is underneath? What need is it trying to meet? When you can identify the feeling and respond to that need directly—connection, soothing, rest, honesty—the urge often loosens its grip without a fight.",
            reflectionPrompt: "Think about your last strong craving. What feeling was underneath it?",
          },
        ],
      },
      {
        id: "three-layers",
        label: "The Three Layers of Urges",
        mood: "clarity",
        caption: "Body, emotion, story",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "Body, Emotion, Story",
            body: "Urges have three layers. The body layer: tight chest, restless hands, buzzing under the skin, racing heart. The emotion layer: shame, anger, grief, boredom, or raw emptiness. The story layer: 'I can't handle this,' 'Just this once,' 'It doesn't matter anymore.' Most people only fight at the story level and try to win with willpower: 'I just need to be stronger.' That is exhausting. A trauma-informed approach treats cravings like ocean waves: they rise, peak, and fall. Your job is not to stop the ocean. Your job is to build a board you can ride. Start with the body: breathe, move, ground. Then the emotion: name it, feel it, let it move. The story will shift when the body and emotion are regulated.",
            reflectionPrompt: "Which layer of an urge do you usually notice first?",
          },
        ],
      },
      {
        id: "wave-pattern",
        label: "Rise, Peak, Fall",
        mood: "pattern",
        caption: "The natural rhythm",
        versions: [
          {
            versionId: "v1",
            depthLevel: 2,
            title: "Riding the Wave",
            body: "Cravings follow a predictable pattern: they rise, they peak, and they fall. Most people try to fight the rise, which only makes it stronger. Instead, recovery teaches you to ride the wave. When a craving starts to rise, you don't have to act on it. You can notice it: 'Oh, a craving is here.' You can breathe through it. You can wait. The peak will come, and it will feel intense, but it will pass. The fall will come, and you'll realize you didn't need the substance or behavior after all. Each time you ride a wave without acting, you teach your nervous system a new option. You prove that you can handle discomfort without escape.",
            reflectionPrompt: "What's one tool you could use the next time a craving starts to rise?",
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
            body: "In recovery, the question shifts from 'Why am I craving?' to 'What is this craving protecting me from feeling right now?' When you can identify the feeling underneath and respond to that need—connection, soothing, rest, honesty—the urge often loosens its grip without a fight. Maybe the craving is protecting you from grief. Maybe it's protecting you from anger. Maybe it's protecting you from the emptiness of not knowing who you are without the substance or behavior. When you can meet that need directly, the craving becomes unnecessary. It was trying to help you. Now you can help yourself in a way that doesn't cost you your life.",
            reflectionPrompt: "If your last craving disappeared, what feeling would have been left in the room?",
          },
        ],
      },
      {
        id: "urge-surfing",
        label: "Urge Surfing Technique",
        mood: "practice",
        caption: "Practical tool",
        versions: [
          {
            versionId: "v1",
            depthLevel: 3,
            title: "Surfing Instead of Fighting",
            body: "Urge surfing is a mindfulness technique that treats cravings like waves. You don't try to stop the wave; you ride it. Start by noticing the craving without judgment: 'A craving is here.' Notice where you feel it in your body. Notice the thoughts that come with it. Notice the emotions. Then, breathe. Stay present. Watch the craving rise, peak, and fall. It might take 5 minutes. It might take 20. But it will pass. Each time you surf an urge without acting, you strengthen your capacity to handle discomfort. You prove to yourself that you don't have to escape every difficult feeling. You can feel it, and you can survive it.",
            reflectionPrompt: "What would it feel like to ride a craving instead of fighting it?",
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
            title: "Sleep Is Not a Luxury",
            body: "Sleep is not a luxury add-on to recovery; it is one of the main pillars holding the whole structure up. During deep sleep, the brain processes emotional material, repairs tissue, and resets many of the systems impacted by trauma and substance use. When sleep is disrupted, everything else feels ten times harder: cravings spike, patience disappears, and small irritations feel unbearable. For many people in recovery, bedtime is also when the noise gets loudest. The distractions are gone, the body is still, and the mind finally has space to bring forward what you've been outrunning all day. No wonder the nervous system resists. Recovery means rebuilding your relationship with sleep, slowly, with compassion for how hard it can be.",
            reflectionPrompt: "How does poor sleep affect your recovery?",
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
            title: "Why Your Body Resists Sleep",
            body: "For people with trauma history, sleep can feel dangerous. When you're asleep, you're vulnerable. You can't protect yourself. Your guard is down. The nervous system, trained to stay on alert, resists this vulnerability. This is why so many people in recovery struggle with sleep: it's not just about habits or routines—it's about whether your body believes it's safe enough to go offline. Recovery means teaching your nervous system that it's safe to rest. This happens through regulation practices, safety-building, trauma processing, and creating bedtime routines that signal safety to your body. Healthy sleep is not just about how long you're in bed; it's about whether your body actually believes it is safe enough to drop its guard.",
            reflectionPrompt: "What would your body need to feel safe enough to sleep deeply?",
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
            title: "Building a Sleep Routine",
            body: "Sleep hygiene isn't just about avoiding screens or caffeine. It's about creating a routine that signals safety to your nervous system. Start with the basics: consistent bedtime, dark room, cool temperature, no screens an hour before bed. But also consider: regulation practices before bed (breathing, gentle movement, meditation), creating a safe sleep environment (weighted blanket, white noise, locked doors if needed), processing the day's emotions so they don't keep you up, and having a plan for when sleep doesn't come (instead of fighting it, you can rest, read, or do a gentle practice). Recovery means treating sleep as a relationship you rebuild slowly, not a battlefield where you win or lose each night.",
            reflectionPrompt: "What's one change you could make to your sleep routine tonight?",
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
            title: "The Noise That Comes at Night",
            body: "For many people in recovery, bedtime is when the noise gets loudest. The distractions are gone. The body is still. The mind finally has space to bring forward what you've been outrunning all day: unprocessed grief, racing thoughts, anxiety, memories, shame. This is why the nervous system resists sleep—it's trying to protect you from what might come up when you're still. Recovery means learning to process these thoughts and feelings during the day so they don't ambush you at night. It means having tools for when the noise does come: journaling, breathing, grounding, reaching out for support. It means understanding that the thoughts aren't the problem—it's the fear of the thoughts that keeps you awake.",
            reflectionPrompt: "What thoughts or feelings tend to show up when you try to sleep?",
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
            title: "How Poor Sleep Fuels Cravings",
            body: "When you're sleep-deprived, your prefrontal cortex—the part of your brain responsible for decision-making and impulse control—doesn't work as well. This makes cravings stronger and harder to resist. Sleep deprivation also dysregulates your nervous system, making you more reactive, more emotional, more likely to reach for old survival strategies. Recovery means prioritizing sleep not as a nice-to-have, but as essential infrastructure. It means understanding that when sleep is good, everything else is easier. When sleep is bad, everything else is harder. It means being willing to protect your sleep like you protect your sobriety—because they're connected. Good sleep supports recovery. Poor sleep undermines it.",
            reflectionPrompt: "How does your sleep quality affect your cravings?",
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
            title: "Navigating Sleep Medications",
            body: "For some people in recovery, sleep medications are necessary, especially in early recovery when the nervous system is still adjusting. The key is working with a doctor who understands recovery and addiction, being honest about your history, and using medications as a bridge while you build other sleep supports. Over time, the goal is to rely less on medications and more on regulation practices, routines, and safety-building. But there's no shame in needing help with sleep. Sleep deprivation is its own form of torture. Recovery means doing what you need to do to get rest, while also building the capacity to sleep naturally over time. It's not either/or. It's both/and.",
            reflectionPrompt: "What's your relationship with sleep medications or supplements?",
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
            title: "Rest as a Way of Life",
            body: "Recovery means learning to rest not just at night, but throughout the day. It means understanding that rest is not laziness—it's regulation. It's repair. It's necessary. It means building a life that includes rest: taking breaks, saying no, protecting your energy, honoring your limits. It means understanding that you can't heal if you're constantly running. Recovery requires rest. It requires slowing down. It requires creating space for your nervous system to regulate, for your body to repair, for your mind to process. This is countercultural in a world that values productivity over presence. But recovery is about building a different way of living—one that honors your need for rest, for restoration, for the quiet spaces where healing happens.",
            reflectionPrompt: "What would it look like to make rest a priority in your recovery?",
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

