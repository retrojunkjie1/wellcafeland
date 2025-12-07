// Phase 46 — Interactive Journey Engine
// Provides nodes (angles), non-repeating logic, session tracking, and
// a plug-in-ready architecture for future upgrades: narration, video,
// soundscapes, progress-tracking, emotional routing, etc.

import { getTopic } from "./learningPathsEngine";

const STORAGE_KEY = "wc_interactive_journey_v1";

function loadState() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveState(s) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore storage errors
  }
}

/**
 * Build clickable "nodes" from tile versions
 * @param {string} topicId
 * @param {string} tileId
 * @returns {Array} Array of node objects
 */
export function getJourneyNodes(topicId, tileId) {
  const topic = getTopic(topicId);
  if (!topic) return [];

  const tile = topic.tiles.find((t) => t.id === tileId);
  if (!tile || !tile.versions) return [];

  return tile.versions.map((v, i) => ({
    nodeId: `${tileId}::${v.versionId || `v${i + 1}`}`,
    tileId,
    topicId,
    topicTitle: topic.title,
    tileLabel: tile.label,
    angleTitle: v.title,
    body: v.body,
    reflectionPrompt: v.reflectionPrompt,
    versionId: v.versionId || `v${i + 1}`,
    depthLevel: v.depthLevel || 1,
  }));
}

/**
 * Non-repeating angle picker
 * Strategy:
 * 1. Filter out visited nodes
 * 2. If all visited, filter out last shown
 * 3. If still empty, use all nodes (cycle complete)
 * @param {string} topicId
 * @param {string} tileId
 * @returns {object|null} Selected node
 */
export function pickNextJourneyNode(topicId, tileId) {
  const nodes = getJourneyNodes(topicId, tileId);
  if (!nodes.length) return null;

  const state = loadState();
  const key = `${topicId}::${tileId}`;
  const entry = state[key] || { last: null, visited: [] };

  const visitedSet = new Set(entry.visited);
  const fresh = nodes.filter((n) => !visitedSet.has(n.nodeId));

  // Try fresh nodes first, then unvisited (excluding last), then all
  let pool = fresh.length ? fresh : nodes.filter((n) => n.nodeId !== entry.last);
  if (!pool.length) pool = nodes;

  const chosen = pool[Math.floor(Math.random() * pool.length)];

  state[key] = {
    last: chosen.nodeId,
    visited: Array.from(new Set([...visitedSet, chosen.nodeId])),
  };
  saveState(state);

  return chosen;
}

/**
 * Remember that a node was viewed
 * @param {string} topicId
 * @param {string} tileId
 * @param {string} nodeId
 */
export function rememberNode(topicId, tileId, nodeId) {
  const state = loadState();
  const key = `${topicId}::${tileId}`;
  const entry = state[key] || { last: null, visited: [] };

  entry.last = nodeId;
  entry.visited = Array.from(new Set([...entry.visited, nodeId]));

  state[key] = entry;
  saveState(state);
}

/**
 * Get visited nodes for a tile (for progress tracking)
 * @param {string} topicId
 * @param {string} tileId
 * @returns {Array<string>} Array of visited nodeIds
 */
export function getVisitedNodes(topicId, tileId) {
  const state = loadState();
  const key = `${topicId}::${tileId}`;
  const entry = state[key] || { last: null, visited: [] };
  return entry.visited || [];
}

/**
 * Clear journey state (useful for testing or reset)
 */
export function clearJourneyState() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

