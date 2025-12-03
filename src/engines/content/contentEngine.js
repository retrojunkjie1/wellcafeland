// src/engines/content/contentEngine.js
// Intelligent Content Engine - Wraps existing contentService with intelligence
// Phase 38: Full Intelligent Cinematic Content Engine

import { loadContentById, listContentSummaries } from "@/services/contentService";
import { getContentTopicById, getRelatedTools, getReflectionPrompts } from "./contentTopicsRegistry";
import { logEvent } from "@/services/telemetry";

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
    logEvent('content_topic_view', {
      topicId: topic.id,
      topicName: topic.name,
      contentCount: loadedContent.length,
    });

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
  logEvent('content_read', {
    contentId,
    durationSeconds: duration,
    completionPercentage: completion,
    timestamp: Date.now(),
  });
}

/**
 * Track reflection prompt engagement
 * @param {string} topicId - Topic ID
 * @param {string} prompt - Reflection prompt text
 * @param {boolean} responded - Whether user responded
 */
export function trackReflectionPrompt(topicId, prompt, responded = false) {
  logEvent('reflection_prompt', {
    topicId,
    prompt,
    responded,
    timestamp: Date.now(),
  });
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

