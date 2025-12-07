// src/engines/learningPaths/learningPathsEngine.js
// Phase 45: Dynamic Learning Paths Engine

import { LEARNING_TOPICS } from "./learningTopicsConfig";

const STORAGE_KEY = "wc_learning_path_state_v1";

/**
 * Load session state from sessionStorage
 */
function loadSessionState() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save session state to sessionStorage
 */
function saveSessionState(state) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

/**
 * Get a topic by ID
 * @param {string} topicId
 * @returns {object|null}
 */
export function getTopic(topicId) {
  if (!topicId) return null;
  return LEARNING_TOPICS[topicId] || null;
}

/**
 * Get list of all topics (for navigation/selection)
 * @returns {Array<{id: string, title: string, subtitle: string}>}
 */
export function getTopicList() {
  return Object.values(LEARNING_TOPICS).map(({ id, title, subtitle }) => ({
    id,
    title,
    subtitle,
  }));
}

/**
 * Selects a version for a tile.
 * Strategy:
 *  - If tile has only 1 version → return that.
 *  - If multiple versions:
 *     - Avoid repeating the same version twice in a row for this tile in this session.
 *     - Random pick among remaining.
 *
 * @param {string} topicId
 * @param {string} tileId
 * @param {boolean} forceDifferent - If true, force a different version than the last one shown
 * @returns {object|null} Insight object with topicId, tileId, and version data
 */
export function pickTileVersion(topicId, tileId, forceDifferent = false) {
  const state = loadSessionState();
  const topic = getTopic(topicId);
  if (!topic) return null;

  const tile = topic.tiles.find((t) => t.id === tileId);
  if (!tile || !tile.versions || tile.versions.length === 0) return null;

  const lastKey = `${topicId}:${tileId}`;
  const lastVersionId = state[lastKey];

  // If only one version exists, return it
  if (tile.versions.length === 1) {
    return {
      topicId,
      tileId,
      ...tile.versions[0],
      topicTitle: topic.title,
      tileLabel: tile.label,
    };
  }

  // Filter out the last version if forcing different or if we want to avoid repeats
  let candidates = tile.versions;
  if (forceDifferent || lastVersionId) {
    candidates = tile.versions.filter((v) => v.versionId !== lastVersionId);
    // If filtering left us with no candidates, use all versions (cycle complete)
    if (candidates.length === 0) {
      candidates = tile.versions;
    }
  }

  // Pick randomly from candidates
  const chosen =
    candidates[Math.floor(Math.random() * candidates.length)] ||
    tile.versions[0];

  // Save this selection for next time
  state[lastKey] = chosen.versionId;
  saveSessionState(state);

  return {
    topicId,
    tileId,
    ...chosen,
    topicTitle: topic.title,
    tileLabel: tile.label,
  };
}

/**
 * Clear session state (useful for testing or reset)
 */
export function clearSessionState() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

