// src/utils/offlineQueue.js
// Offline message queue using localStorage (fallback for IndexedDB)

const QUEUE_KEY = "wc_offline_message_queue_v1";

/**
 * Enqueue a message for later sending
 */
export function enqueueMessage(message) {
  try {
    const queue = getQueue();
    queue.push({
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: message.createdAt || Date.now(),
      payload: message.payload || message,
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return true;
  } catch (err) {
    console.warn("[OfflineQueue] Failed to enqueue:", err);
    return false;
  }
}

/**
 * Get all queued messages
 */
export function getQueue() {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    if (!stored) return [];
    const queue = JSON.parse(stored);
    return Array.isArray(queue) ? queue : [];
  } catch (err) {
    console.warn("[OfflineQueue] Failed to read queue:", err);
    return [];
  }
}

/**
 * Dequeue all messages (returns and clears)
 */
export function dequeueAll() {
  try {
    const queue = getQueue();
    localStorage.removeItem(QUEUE_KEY);
    return queue;
  } catch (err) {
    console.warn("[OfflineQueue] Failed to dequeue:", err);
    return [];
  }
}

/**
 * Get count of queued messages
 */
export function peekCount() {
  return getQueue().length;
}

/**
 * Clear queue
 */
export function clearQueue() {
  try {
    localStorage.removeItem(QUEUE_KEY);
    return true;
  } catch (err) {
    console.warn("[OfflineQueue] Failed to clear queue:", err);
    return false;
  }
}

