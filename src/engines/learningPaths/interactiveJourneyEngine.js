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
    followUps: Array.isArray(v.followUps) ? v.followUps : [],
    versionId: v.versionId || `v${i + 1}`,
    depthLevel: v.depthLevel || 1,
  }));
}

/** Build detail nodes that belong to one selected perspective. */
export function getJourneyFollowUps(parentNode) {
  const followUps = Array.isArray(parentNode?.followUps) ? parentNode.followUps : [];
  return followUps.map((followUp, index) => ({
    ...parentNode,
    ...followUp,
    nodeId: `${parentNode.nodeId}::detail-${index + 1}`,
    versionId: `${parentNode.versionId}-detail-${index + 1}`,
    angleTitle: followUp.title,
    parentAngleTitle: parentNode.angleTitle,
    detailPosition: index + 1,
    detailCount: followUps.length,
    depthLevel: (parentNode.depthLevel || 1) + 1,
  }));
}

/**
 * Move to the next visible perspective for the separate “Surprise me” action.
 * The “Show me another angle” action must use getJourneyFollowUps instead.
 */
export function pickNextTopicJourneyNode(topicId, currentTileId, currentNodeId = null) {
  const topic = getTopic(topicId);
  if (!topic?.tiles?.length) return null;

  const nodes = topic.tiles.flatMap((tile) => getJourneyNodes(topicId, tile.id));
  if (nodes.length < 2) return null;

  const currentNodeIndex = currentNodeId
    ? nodes.findIndex((node) => node.nodeId === currentNodeId)
    : -1;
  const currentTileIndexes = nodes
    .map((node, index) => (node.tileId === currentTileId ? index : -1))
    .filter((index) => index >= 0);
  const startIndex = currentNodeIndex >= 0
    ? currentNodeIndex + 1
    : (currentTileIndexes.at(-1) ?? -1) + 1;

  return nodes[startIndex % nodes.length] || null;
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
