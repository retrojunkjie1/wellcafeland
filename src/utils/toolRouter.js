// src/utils/toolRouter.js
// Tool routing utility: normalizes mode/tool ID mappings

import { getToolById } from "@/apps/tools/toolsRegistry";

/**
 * Map mode values to tool IDs
 */
const MODE_TO_TOOL_ID = {
  "breathing": "breathing",
  "grounding": "grounding",
  "self_surgeon": "self-surgeon",
  "urge-surfing": "urge-surfing",
  "journaling": "journaling",
  "body-scan": "body-scan",
  "meditation": "meditation",
  "education": "education",
};

/**
 * Normalize mode to tool ID
 */
export function normalizeModeToToolId(mode) {
  if (!mode || typeof mode !== "string") return null;
  
  // Direct match
  if (MODE_TO_TOOL_ID[mode]) {
    return MODE_TO_TOOL_ID[mode];
  }
  
  // Already a tool ID?
  const tool = getToolById(mode);
  if (tool) {
    return mode;
  }
  
  return null;
}

/**
 * Validate tool exists in registry
 */
export function validateToolId(toolId) {
  if (!toolId || typeof toolId !== "string") return false;
  const tool = getToolById(toolId);
  return tool !== null;
}

/**
 * Get tool route path
 */
export function getToolRoute(toolId) {
  if (!validateToolId(toolId)) return null;
  return `/tools/${toolId}`;
}

/**
 * Circuit-breaker: Check if tool is available
 */
export function isToolAvailable(toolId) {
  return validateToolId(toolId);
}

