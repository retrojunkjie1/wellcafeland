// src/services/circlesService.js
// Recovery circles service

import { doc, getDoc, collection, query, where, getDocs, addDoc, orderBy, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { getAnonymousUserId } from "@/lib/userId";
import { logError, logInfo } from "./logService";

/**
 * Get current user ID (authenticated or anonymous)
 */
function getCurrentUserId() {
  try {
    if (auth?.currentUser?.uid) {
      return auth.currentUser.uid;
    }
    return getAnonymousUserId();
  } catch {
    return getAnonymousUserId();
  }
}

/**
 * List recovery circles
 * @param {Object} filters - { theme? }
 * @returns {Promise<Array>}
 */
export async function listCircles(filters = {}) {
  try {
    const circlesRef = collection(db, "recovery_circles");
    let q = query(circlesRef);

    if (filters.theme) {
      q = query(circlesRef, where("theme", "==", filters.theme));
    }

    const snapshot = await getDocs(q);
    const circles = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      circles.push({
        id: docSnap.id,
        theme: data.theme || "general",
        description: data.description || "",
        cadence: data.cadence || "daily",
        prompts: data.prompts || [],
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      });
    });

    return circles;
  } catch (err) {
    logError("circlesService", err, { function: "listCircles", filters });
    return [];
  }
}

/**
 * Get circle by ID
 * @param {string} circleId - Circle ID
 * @returns {Promise<Object|null>}
 */
export async function getCircle(circleId) {
  try {
    if (!circleId) return null;

    const circleRef = doc(db, "recovery_circles", circleId);
    const circleDoc = await getDoc(circleRef);

    if (!circleDoc.exists()) return null;

    const data = circleDoc.data();
    return {
      id: circleDoc.id,
      theme: data.theme || "general",
      description: data.description || "",
      cadence: data.cadence || "daily",
      prompts: data.prompts || [],
      createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
    };
  } catch (err) {
    logError("circlesService", err, { function: "getCircle", circleId });
    return null;
  }
}

/**
 * Join a circle
 * @param {string} circleId - Circle ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function joinCircle(circleId) {
  try {
    if (!circleId) {
      return { ok: false, error: "Missing circleId" };
    }

    const userId = getCurrentUserId();
    const membersRef = collection(db, "circle_members");
    
    // Check if already a member
    const existingQuery = query(
      membersRef,
      where("circleId", "==", circleId),
      where("userId", "==", userId)
    );
    const existing = await getDocs(existingQuery);

    if (!existing.empty) {
      return { ok: true, alreadyMember: true };
    }

    await addDoc(membersRef, {
      circleId,
      userId,
      joinedAt: new Date(),
    });

    logInfo("circlesService", "User joined circle", { circleId, userId });
    return { ok: true };
  } catch (err) {
    logError("circlesService", err, { function: "joinCircle", circleId });
    return { ok: false, error: err.message };
  }
}

/**
 * Leave a circle
 * @param {string} circleId - Circle ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function leaveCircle(circleId) {
  try {
    if (!circleId) {
      return { ok: false, error: "Missing circleId" };
    }

    const userId = getCurrentUserId();
    const membersRef = collection(db, "circle_members");
    
    // Find the membership document
    const existingQuery = query(
      membersRef,
      where("circleId", "==", circleId),
      where("userId", "==", userId)
    );
    const existing = await getDocs(existingQuery);

    if (existing.empty) {
      return { ok: true, alreadyLeft: true };
    }

    // Delete all membership documents (should only be one, but handle multiple)
    const deletePromises = existing.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);

    logInfo("circlesService", "User left circle", { circleId, userId });
    return { ok: true };
  } catch (err) {
    logError("circlesService", err, { function: "leaveCircle", circleId });
    return { ok: false, error: err.message };
  }
}

/**
 * Check if user is a member of a circle
 * @param {string} circleId - Circle ID
 * @returns {Promise<boolean>}
 */
export async function isCircleMember(circleId) {
  try {
    if (!circleId) return false;

    const userId = getCurrentUserId();
    const membersRef = collection(db, "circle_members");
    const q = query(
      membersRef,
      where("circleId", "==", circleId),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (err) {
    logError("circlesService", err, { function: "isCircleMember", circleId });
    return false;
  }
}

/**
 * Get user's circles
 * @returns {Promise<Array>}
 */
export async function getUserCircles() {
  try {
    const userId = getCurrentUserId();
    const membersRef = collection(db, "circle_members");
    const q = query(membersRef, where("userId", "==", userId));

    const snapshot = await getDocs(q);
    const circleIds = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      circleIds.push(data.circleId);
    });

    // Fetch circle details
    const circles = [];
    for (const circleId of circleIds) {
      const circle = await getCircle(circleId);
      if (circle) {
        circles.push(circle);
      }
    }

    return circles;
  } catch (err) {
    logError("circlesService", err, { function: "getUserCircles" });
    return [];
  }
}

/**
 * Get today's prompt for a circle
 * @param {string} circleId - Circle ID
 * @returns {Promise<string|null>}
 */
export async function getTodaysPrompt(circleId) {
  try {
    const circle = await getCircle(circleId);
    if (!circle || !circle.prompts || circle.prompts.length === 0) {
      return null;
    }

    // Use day of year to select a consistent prompt for the day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const promptIndex = dayOfYear % circle.prompts.length;
    
    return circle.prompts[promptIndex] || circle.prompts[0];
  } catch (err) {
    logError("circlesService", err, { function: "getTodaysPrompt", circleId });
    return null;
  }
}

/**
 * Create a new circle (Phase 13)
 * @param {string} title - Circle title
 * @param {string} description - Circle description
 * @param {string} userId - User ID creating the circle
 * @returns {Promise<{ok: boolean, circleId?: string, error?: string}>}
 */
export async function createCircle(title, description, userId = null) {
  try {
    const currentUserId = userId || getCurrentUserId();
    if (!currentUserId || !title || !description) {
      return { ok: false, error: "Missing required fields" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    const circlesRef = collection(db, "circles");
    const circleDoc = await addDoc(circlesRef, {
      title: title.trim(),
      description: description.trim(),
      ownerId: currentUserId,
      members: [currentUserId],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    logInfo("circlesService", "Circle created", { circleId: circleDoc.id, userId: currentUserId });
    return { ok: true, circleId: circleDoc.id };
  } catch (err) {
    logError("circlesService", err, { function: "createCircle", title });
    return { ok: false, error: err.message };
  }
}

/**
 * Create a thread in a circle (Phase 13)
 * @param {string} circleId - Circle ID
 * @param {string} title - Thread title
 * @param {string} userId - User ID creating the thread
 * @param {string} weeklyTheme - Optional weekly theme
 * @returns {Promise<{ok: boolean, threadId?: string, error?: string}>}
 */
export async function createThread(circleId, title, userId = null, weeklyTheme = null) {
  try {
    const currentUserId = userId || getCurrentUserId();
    if (!circleId || !title || !currentUserId) {
      return { ok: false, error: "Missing required fields" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    const threadsRef = collection(db, "circle_threads");
    const threadDoc = await addDoc(threadsRef, {
      circleId,
      title: title.trim(),
      createdBy: currentUserId,
      weeklyTheme: weeklyTheme || null,
      createdAt: new Date(),
    });

    logInfo("circlesService", "Thread created", { threadId: threadDoc.id, circleId });
    return { ok: true, threadId: threadDoc.id };
  } catch (err) {
    logError("circlesService", err, { function: "createThread", circleId, title });
    return { ok: false, error: err.message };
  }
}

/**
 * Post a message to a circle thread (Phase 13)
 * @param {string} circleId - Circle ID
 * @param {string} threadId - Thread ID
 * @param {string} text - Message text
 * @param {boolean} anonymous - Whether message is anonymous
 * @param {string} userId - User ID (optional)
 * @returns {Promise<{ok: boolean, messageId?: string, error?: string}>}
 */
export async function postMessage(circleId, threadId, text, anonymous = false, userId = null) {
  try {
    const currentUserId = userId || getCurrentUserId();
    if (!circleId || !threadId || !text || !currentUserId) {
      return { ok: false, error: "Missing required fields" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    // AI moderation check
    try {
      const { moderateText } = await import("./aiModeration");
      const moderationResult = await moderateText(text);
      if (!moderationResult.ok || moderationResult.blocked) {
        return { 
          ok: false, 
          error: moderationResult.suggestion || "Message was blocked by safety filters" 
        };
      }
    } catch (err) {
      console.warn("Moderation check failed, allowing message:", err);
    }

    const messagesRef = collection(db, "circle_messages");
    const messageDoc = await addDoc(messagesRef, {
      circleId,
      threadId,
      userId: anonymous ? null : currentUserId,
      text: text.trim(),
      anonymous,
      createdAt: new Date(),
    });

    logInfo("circlesService", "Message posted", { messageId: messageDoc.id, circleId, threadId });
    return { ok: true, messageId: messageDoc.id };
  } catch (err) {
    logError("circlesService", err, { function: "postMessage", circleId, threadId });
    return { ok: false, error: err.message };
  }
}

/**
 * React to a message (Phase 13)
 * @param {string} circleId - Circle ID
 * @param {string} threadId - Thread ID
 * @param {string} messageId - Message ID
 * @param {string} emoji - Emoji reaction
 * @param {string} userId - User ID (optional)
 * @returns {Promise<{ok: boolean, reactionId?: string, error?: string}>}
 */
export async function reactToMessage(circleId, threadId, messageId, emoji, userId = null) {
  try {
    const currentUserId = userId || getCurrentUserId();
    if (!circleId || !threadId || !messageId || !emoji || !currentUserId) {
      return { ok: false, error: "Missing required fields" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    const reactionsRef = collection(db, "circle_reactions");
    const reactionDoc = await addDoc(reactionsRef, {
      circleId,
      threadId,
      messageId,
      userId: currentUserId,
      emoji,
      createdAt: new Date(),
    });

    logInfo("circlesService", "Reaction added", { reactionId: reactionDoc.id, messageId });
    return { ok: true, reactionId: reactionDoc.id };
  } catch (err) {
    logError("circlesService", err, { function: "reactToMessage", messageId });
    return { ok: false, error: err.message };
  }
}

/**
 * Get threads for a circle (Phase 13)
 * @param {string} circleId - Circle ID
 * @returns {Promise<Array>}
 */
export async function getCircleThreads(circleId) {
  try {
    if (!circleId) return [];

    if (!db) {
      return [];
    }

    const threadsRef = collection(db, "circle_threads");
    const q = query(threadsRef, where("circleId", "==", circleId), orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);
    const threads = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      threads.push({
        id: docSnap.id,
        circleId: data.circleId,
        title: data.title || "",
        createdBy: data.createdBy || null,
        weeklyTheme: data.weeklyTheme || null,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      });
    });

    return threads;
  } catch (err) {
    logError("circlesService", err, { function: "getCircleThreads", circleId });
    return [];
  }
}

/**
 * Get messages for a thread (Phase 13)
 * @param {string} circleId - Circle ID
 * @param {string} threadId - Thread ID
 * @returns {Promise<Array>}
 */
export async function getThreadMessages(circleId, threadId) {
  try {
    if (!circleId || !threadId) return [];

    if (!db) {
      return [];
    }

    const messagesRef = collection(db, "circle_messages");
    const q = query(
      messagesRef,
      where("circleId", "==", circleId),
      where("threadId", "==", threadId),
      orderBy("createdAt", "asc")
    );

    const snapshot = await getDocs(q);
    const messages = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      messages.push({
        id: docSnap.id,
        circleId: data.circleId,
        threadId: data.threadId,
        userId: data.userId || null,
        text: data.text || "",
        anonymous: data.anonymous || false,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      });
    });

    return messages;
  } catch (err) {
    logError("circlesService", err, { function: "getThreadMessages", circleId, threadId });
    return [];
  }
}

export default {
  listCircles,
  getCircle,
  joinCircle,
  leaveCircle,
  isCircleMember,
  getUserCircles,
  getTodaysPrompt,
  createCircle,
  createThread,
  postMessage,
  reactToMessage,
  getCircleThreads,
  getThreadMessages,
};

