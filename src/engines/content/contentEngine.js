// src/engines/content/contentEngine.js
// Intelligent Content Engine - Deterministic AI-style content generation
// Phase 38: Full Intelligent Cinematic Content Engine

import { loadContentById, listContentSummaries } from "@/services/contentService";
import { CONTENT_TOPICS, getContentTopicById, getRelatedTools, getReflectionPrompts, contentTopicsRegistry } from "./contentTopicsRegistry";
import { trackEvent } from "@/services/telemetry";

/**
 * Content generation mode (static or ai)
 * @type {string}
 */
const CONTENT_MODE = 'static'; // Future: 'ai' for serverless function integration

/**
 * Generate rich understanding + reflection content for a topic
 * Uses trauma-informed, warm language
 * @param {string} topicName - Topic name or ID
 * @returns {Object} Content object with understanding and reflection
 */
export function generateContentForTopic(topicName) {
  // Normalize topic name
  const topicKey = Object.keys(CONTENT_TOPICS).find(
    key => CONTENT_TOPICS[key] === topicName || key === topicName
  ) || topicName;

  const topic = CONTENT_TOPICS[topicKey];

  if (!topic) {
    return {
      topic: topicName,
      understanding: { text: "Content not yet available for this topic." },
      reflection: { question: "What brought you here today?" },
    };
  }

  // Deterministic content per topic (trauma-informed, clinical precision)
  switch (topic) {
    case CONTENT_TOPICS.NERVOUS_SYSTEM:
      return {
        topic: CONTENT_TOPICS.NERVOUS_SYSTEM,
        understanding: {
          text: `Your nervous system isn't broken—it's doing exactly what it learned to do to keep you safe. When you've experienced trauma, chaos, or chronic stress, your nervous system can become sensitized, living in a state of high alert even when the danger has passed.

This isn't weakness. This is your body trying to protect you based on what it learned from the past.

Regulation isn't about forcing calm. It's about giving your nervous system evidence—through breath, movement, grounding—that right now, in this moment, you are safe. With practice, your system can learn to rest again.

You don't have to fix yourself. You're learning to be with yourself differently.`,
        },
        reflection: {
          question: "When you notice your nervous system activating—heart racing, mind spinning, body tense—what is one small thing that helps you feel even 5% more grounded?",
        },
      };

    case CONTENT_TOPICS.TRAUMA_RECOVERY:
      return {
        topic: CONTENT_TOPICS.TRAUMA_RECOVERY,
        understanding: {
          text: `Trauma isn't what happened to you. Trauma is what remains in your nervous system and your sense of self after what happened.

Recovery doesn't mean forgetting, and it doesn't mean you'll never feel triggered again. It means building a relationship with your nervous system where you can resource yourself, where you can stay present even when the past shows up.

You don't have to be "over it" to be healing. Healing can look like: noticing when you're triggered and not spiraling. Asking for help when you need it. Taking one breath before reacting. These aren't small things. These are profound acts of reclamation.

There is no timeline for healing. Your pace is the right pace.`,
        },
        reflection: {
          question: "What does safety feel like in your body right now—even if it's only in one small place, like your feet on the ground or your back against a chair?",
        },
      };

    case CONTENT_TOPICS.SLEEP_RECOVERY:
      return {
        topic: CONTENT_TOPICS.SLEEP_RECOVERY,
        understanding: {
          text: `Sleep is one of the first things to fracture in active addiction and early recovery. Your nervous system has been running on high alert for so long that rest can feel unsafe, or your body simply forgot how to settle.

This isn't permanent. Your nervous system can relearn rest, but it takes time and gentleness.

Sleep hygiene isn't about rules—it's about creating conditions where your body feels safe enough to let go. This might mean: dimming lights an hour before bed, avoiding screens, doing a body scan, or listening to soft sounds.

If sleep still doesn't come, that's okay. Resting your body—even if you don't sleep—is still healing. Give yourself permission to rest without pressure to "get it right."`,
        },
        reflection: {
          question: "What makes it hardest for you to sleep? Is it your mind, your body, your environment, or something else? And what is one small adjustment that might help?",
        },
      };

    case CONTENT_TOPICS.BOUNDARIES:
      return {
        topic: CONTENT_TOPICS.BOUNDARIES,
        understanding: {
          text: `Boundaries aren't walls. Boundaries are how you teach people how to be with you—and how you learn to protect your own recovery.

If you grew up without boundaries, or if you learned that your needs didn't matter, setting boundaries can feel terrifying. It can feel selfish. It can feel like you're hurting people.

You're not. You're teaching them—and yourself—that you matter.

A boundary doesn't have to be loud or harsh. It can be quiet: "I need to go," "I can't do that right now," "I need space." You don't owe anyone an explanation. You don't have to justify your limits.

Your recovery is more important than anyone's comfort with your boundaries.`,
        },
        reflection: {
          question: "Where in your life do you feel like you've been saying yes when your body is saying no? What boundary, even a small one, might protect your recovery?",
        },
      };

    case CONTENT_TOPICS.GRIEF_LOSS:
      return {
        topic: CONTENT_TOPICS.GRIEF_LOSS,
        understanding: {
          text: `Grief in recovery is layered. You might be grieving what you lost to addiction. You might be grieving the person you were before trauma. You might be grieving relationships, time, trust, or a version of life you thought you'd have.

This grief is real, and it deserves space.

Grief doesn't move in a straight line. Some days it's a dull ache. Some days it's unbearable. Some days you forget it's there, and then it crashes into you out of nowhere.

All of this is normal. Grief isn't something to fix or get over. It's something to move with, slowly, at your own pace.

You're allowed to grieve and heal at the same time. These aren't opposites.`,
        },
        reflection: {
          question: "What are you grieving right now, even if it feels too small or complicated to name? And how does that grief show up in your body?",
        },
      };

    case CONTENT_TOPICS.SELF_COMPASSION:
      return {
        topic: CONTENT_TOPICS.SELF_COMPASSION,
        understanding: {
          text: `Self-compassion isn't about pretending everything is fine or letting yourself off the hook. It's about treating yourself the way you'd treat someone you love who's struggling.

If a close friend relapsed, would you shame them? Or would you ask what happened, what they need, how you can help?

You deserve that same gentleness from yourself.

Self-compassion doesn't mean you're excusing harm you've caused. It means you're recognizing that you are human, that you've been through things, and that punishing yourself doesn't lead to healing—it just leads to more pain.

You can hold yourself accountable and still offer yourself kindness. These aren't opposites.`,
        },
        reflection: {
          question: "What would it feel like to speak to yourself the way you'd speak to someone you love who's going through what you're going through?",
        },
      };

    case CONTENT_TOPICS.CRAVINGS_URGES:
      return {
        topic: CONTENT_TOPICS.CRAVINGS_URGES,
        understanding: {
          text: `A craving isn't a failure. A craving is your nervous system trying to cope the way it learned to cope. It's not weak. It's not proof you're broken. It's old wiring that still fires when you're stressed, lonely, overwhelmed, or numb.

Cravings peak and then they pass. Always. Even when it feels like they won't.

You don't have to white-knuckle through them. You can surf them—notice them, name them, let them rise and fall without acting. You can distract yourself. You can call someone. You can use a tool.

The goal isn't to never have cravings. The goal is to not let the craving make the decision. Even waiting 10 minutes is a victory. Even noticing the craving without judgment is growth.

You're not fighting yourself. You're learning to be with yourself differently.`,
        },
        reflection: {
          question: "When a craving hits, what do you usually do? And what is one thing—even a small thing—that's helped you wait it out before?",
        },
      };

    case CONTENT_TOPICS.SHAME_GUILT:
      return {
        topic: CONTENT_TOPICS.SHAME_GUILT,
        understanding: {
          text: `Guilt says: I did something bad. Shame says: I am bad.

Guilt can be useful—it tells you when you've crossed a boundary or hurt someone, and it motivates repair. Shame doesn't motivate anything. Shame just tells you that you're defective, unworthy, unfixable.

Shame thrives in silence and isolation. The more you hide it, the louder it gets. The antidote to shame isn't perfection—it's connection, honesty, and self-compassion.

You can acknowledge harm you've caused without defining yourself by it. You are more than the worst thing you've ever done. You are more than your mistakes. You are a whole human being who is learning and trying.

Shame will tell you that you don't deserve recovery. That's the lie. The truth is: you are worthy of healing, of grace, of a second chance—and a third, and a hundredth.`,
        },
        reflection: {
          question: "What are you carrying shame about right now? Can you name it, even just to yourself? And what would it mean to separate what you did from who you are?",
        },
      };

    case CONTENT_TOPICS.ANXIETY_PANIC:
      return {
        topic: CONTENT_TOPICS.ANXIETY_PANIC,
        understanding: {
          text: `Anxiety isn't irrational. Your nervous system is responding to perceived danger—even if the danger is old, or internal, or not happening right now.

Panic feels like you're dying, but you're not. Your body is flooding you with adrenaline because it thinks you're in danger. It's trying to help. It's just...wrong.

You can't think your way out of panic. You have to ground your nervous system: breathe slowly, focus on your senses, feel your feet on the floor. You have to give your body evidence that you are safe right now.

Panic passes. Always. Even when it feels endless. The wave peaks and then it falls.

You're not weak for having anxiety. You're carrying a sensitized nervous system because of what you've been through. That's not a character flaw. That's biology. And biology can change.`,
        },
        reflection: {
          question: "When anxiety or panic shows up, where do you feel it in your body first? And what is one grounding technique that has helped you—even a little—before?",
        },
      };

    case CONTENT_TOPICS.EMOTIONAL_REGULATION:
      return {
        topic: CONTENT_TOPICS.EMOTIONAL_REGULATION,
        understanding: {
          text: `Emotional regulation doesn't mean never feeling big emotions. It means learning to be with your emotions without them consuming you or controlling you.

If you grew up in chaos, or if you used substances to numb emotions, you might not have learned how to feel feelings and stay safe at the same time. That's not your fault. But it is something you can learn now.

Regulation starts with noticing: What am I feeling? Where do I feel it? What does this feeling need?

Sometimes the answer is: to move (body scan, walking). Sometimes it's to express (journaling, talking). Sometimes it's to soothe (breathing, grounding). Sometimes it's just to be with it without fixing it.

You don't have to be good at this yet. Learning to be with your emotions is a practice, not a destination.`,
        },
        reflection: {
          question: "What emotion do you find hardest to be with right now? And what would it look like to make space for that feeling without pushing it away or letting it take over?",
        },
      };

    default:
      return {
        topic: topicName,
        understanding: { text: "Content is being prepared for this topic." },
        reflection: { question: "What brought you to explore this topic today?" },
      };
  }
}

// Future AI integration point
// When CONTENT_MODE === 'ai', this function would call:
// const response = await fetch('/api/generate-topic-content', {
//   method: 'POST',
//   body: JSON.stringify({ topic: topicName, userId, context })
// });
// return response.json();

/**
 * Load topic content with intelligence layer
 * @param {string} topicId - Topic ID from registry
 * @returns {Promise<Object>} Enhanced topic data with content
 */
export async function loadTopicContent(topicId) {
  const topic = getContentTopicById(topicId);
  
  if (!topic) {
    console.warn('[ContentEngine] Topic not found:', topicId);
    return null;
  }

  try {
    // Load all content IDs for this topic
    const contentPromises = topic.contentIds.map(id => loadContentById(id));
    const contentResults = await Promise.all(contentPromises);
    
    // Filter out failed loads
    const loadedContent = contentResults.filter(c => c !== null);

    // Track topic view
    trackEvent({
      kind: 'content_topic_view',
      topicId: topic.id,
      topicName: topic.name,
      contentCount: loadedContent.length,
    }).catch(() => {}); // Non-blocking

    return {
      ...topic,
      content: loadedContent,
      relatedTools: getRelatedTools(topic.id),
      reflectionPrompts: getReflectionPrompts(topic.id),
      loadedAt: Date.now(),
    };
  } catch (error) {
    console.error('[ContentEngine] Failed to load topic content:', error);
    return {
      ...topic,
      content: [],
      relatedTools: [],
      reflectionPrompts: [],
      error: error.message,
    };
  }
}

/**
 * Get topic summary (without loading full content)
 * @param {string} topicId - Topic ID
 * @returns {Object|null} Topic summary
 */
export function getTopicSummary(topicId) {
  return getContentTopicById(topicId);
}

/**
 * Load content by section with topic metadata enrichment
 * @param {string} section - Content section (tools, recovery, education, etc.)
 * @returns {Promise<Array>} Enhanced content array
 */
export async function loadContentBySection(section) {
  const summaries = listContentSummaries(section);
  
  // Enrich with topic metadata if available
  return summaries.map(summary => {
    // Find which topic this content belongs to
    const parentTopic = Object.values(contentTopicsRegistry).find(
      topic => topic.contentIds && topic.contentIds.includes(summary.id)
    );

    return {
      ...summary,
      topicId: parentTopic?.id,
      topicName: parentTopic?.name,
      topicTheme: parentTopic?.theme,
      topicIntensity: parentTopic?.intensity,
    };
  });
}

/**
 * Get content recommendations based on user state
 * @param {Object} userState - User emotional/behavioral state
 * @returns {Array} Recommended topic IDs
 */
export function getRecommendedTopics(userState = {}) {
  const {
    emotionalState = 'neutral',
    riskLevel = 'low',
    recentTools = [],
    preferredIntensity = 'low',
  } = userState;

  const allTopics = Object.values(contentTopicsRegistry);
  let scored = [];

  allTopics.forEach(topic => {
    let score = 0;

    // Match intensity preference
    if (topic.intensity === preferredIntensity) score += 10;

    // Match emotional state to theme
    if (emotionalState === 'anxious' && topic.theme === 'calm') score += 15;
    if (emotionalState === 'distressed' && topic.theme === 'peace') score += 15;
    if (emotionalState === 'shame' && topic.id === 'shame-guilt') score += 20;
    if (emotionalState === 'grief' && topic.id === 'grief-loss') score += 20;

    // Boost low-intensity content for high-risk users
    if (riskLevel === 'high' && topic.intensity === 'low') score += 10;

    // Boost related topics if user has used related tools
    const hasUsedRelatedTool = recentTools.some(toolId => 
      topic.relatedTools && topic.relatedTools.includes(toolId)
    );
    if (hasUsedRelatedTool) score += 5;

    scored.push({ topic, score });
  });

  // Sort by score and return top 3
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(item => item.topic.id);
}

/**
 * Track content reading event
 * @param {string} contentId - Content ID
 * @param {number} duration - Reading duration in seconds
 * @param {number} completion - Completion percentage (0-100)
 */
export function trackContentRead(contentId, duration, completion) {
  trackEvent({
    kind: 'content_read',
    contentId,
    durationSeconds: duration,
    completionPercentage: completion,
    timestamp: Date.now(),
  }).catch(() => {}); // Non-blocking
}

/**
 * Track reflection prompt engagement
 * @param {string} topicId - Topic ID
 * @param {string} prompt - Reflection prompt text
 * @param {boolean} responded - Whether user responded
 */
export function trackReflectionPrompt(topicId, prompt, responded = false) {
  trackEvent({
    kind: 'reflection_prompt',
    topicId,
    prompt,
    responded,
    timestamp: Date.now(),
  }).catch(() => {}); // Non-blocking
}

/**
 * Get user's content engagement stats
 * @param {string} userId - User ID
 * @returns {Object} Engagement statistics
 */
export function getContentEngagementStats(userId = 'anonymous') {
  try {
    const storageKey = `wc-content-engagement-${userId}`;
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');

    return {
      topicsViewed: data.topicsViewed || [],
      totalReadTime: data.totalReadTime || 0,
      reflectionsCompleted: data.reflectionsCompleted || 0,
      favoriteTopics: data.favoriteTopics || [],
    };
  } catch (error) {
    console.error('[ContentEngine] Failed to load engagement stats:', error);
    return {
      topicsViewed: [],
      totalReadTime: 0,
      reflectionsCompleted: 0,
      favoriteTopics: [],
    };
  }
}

/**
 * Update user's content engagement stats
 * @param {string} userId - User ID
 * @param {Object} updates - Stats updates
 */
export function updateContentEngagementStats(userId = 'anonymous', updates = {}) {
  try {
    const storageKey = `wc-content-engagement-${userId}`;
    const current = JSON.parse(localStorage.getItem(storageKey) || '{}');

    const updated = {
      topicsViewed: updates.topicId 
        ? [...new Set([...(current.topicsViewed || []), updates.topicId])]
        : current.topicsViewed || [],
      totalReadTime: (current.totalReadTime || 0) + (updates.readTime || 0),
      reflectionsCompleted: (current.reflectionsCompleted || 0) + (updates.reflectionCompleted ? 1 : 0),
      favoriteTopics: current.favoriteTopics || [],
      lastUpdated: Date.now(),
    };

    localStorage.setItem(storageKey, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('[ContentEngine] Failed to update engagement stats:', error);
    return null;
  }
}

