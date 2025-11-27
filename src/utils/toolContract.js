// src/utils/toolContract.js
// Standardized tool interface contract

/**
 * Standard tool props interface
 * @typedef {Object} ToolProps
 * @property {Function} [onComplete] - Called when tool completes with result object
 * @property {Function} [onCancel] - Called when user cancels/closes tool
 * @property {Object} [initialContext] - Initial context from chat/launch
 * @property {boolean} [isEmbedded] - Whether tool is embedded in chat
 */

/**
 * Standard tool result object
 * @typedef {Object} ToolResult
 * @property {string} type - Always "tool_result"
 * @property {string} toolId - Tool identifier (e.g., "breathing_478", "grounding_54321")
 * @property {string} title - Human-readable tool name
 * @property {string} summary - Short summary of what was done
 * @property {Object} data - Tool-specific data
 * @property {number} [durationSeconds] - Duration in seconds
 */

/**
 * Create a standard tool result object
 * @param {string} toolId - Tool identifier
 * @param {string} title - Human-readable name
 * @param {string} summary - Summary text
 * @param {Object} data - Tool-specific data
 * @param {number} [durationSeconds] - Duration in seconds
 * @returns {ToolResult}
 */
export function createToolResult(toolId, title, summary, data = {}, durationSeconds = null) {
  return {
    type: "tool_result",
    toolId,
    title,
    summary,
    data,
    durationSeconds,
  };
}

/**
 * Safely call onComplete callback
 * @param {Function} onComplete - Callback function
 * @param {ToolResult} result - Tool result object
 */
export function safeComplete(onComplete, result) {
  if (onComplete && typeof onComplete === "function") {
    try {
      onComplete(result);
    } catch (err) {
      console.error("Tool onComplete callback error:", err);
    }
  }
}

/**
 * Safely call onCancel callback
 * @param {Function} onCancel - Callback function
 */
export function safeCancel(onCancel) {
  if (onCancel && typeof onCancel === "function") {
    try {
      onCancel();
    } catch (err) {
      console.error("Tool onCancel callback error:", err);
    }
  }
}

