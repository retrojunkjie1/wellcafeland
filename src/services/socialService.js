// src/services/socialService.js
// Social service for direct messages and social feed

import { doc, collection, query, where, getDocs, addDoc, orderBy, limit, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
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
 * Create a DM thread between two users
 * @param {string} userA - First user ID
 * @param {string} userB - Second user ID
 * @returns {Promise<{ok: boolean, threadId?: string, error?: string}>}
 */
export async function createDMThread(userA, userB) {
  try {
    if (!userA || !userB) {
      return { ok: false, error: "Missing user IDs" };
    }

    if (userA === userB) {
      return { ok: false, error: "Cannot create DM with yourself" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    // Check if thread already exists
    const threadsRef = collection(db, "dm_threads");
    const existingQuery = query(
      threadsRef,
      where("participants", "array-contains", userA)
    );
    const existing = await getDocs(existingQuery);
    
    for (const docSnap of existing.docs) {
      const data = docSnap.data();
      if (data.participants && data.participants.includes(userB)) {
        return { ok: true, threadId: docSnap.id, existing: true };
      }
    }

    // Create new thread
    const threadDoc = await addDoc(threadsRef, {
      participants: [userA, userB],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    logInfo("socialService", "DM thread created", { threadId: threadDoc.id, userA, userB });
    return { ok: true, threadId: threadDoc.id };
  } catch (err) {
    logError("socialService", err, { function: "createDMThread", userA, userB });
    return { ok: false, error: err.message };
  }
}

/**
 * Send a message in a DM thread
 * @param {string} threadId - Thread ID
 * @param {string} userId - User ID sending the message
 * @param {string} text - Message text
 * @returns {Promise<{ok: boolean, messageId?: string, error?: string}>}
 */
export async function sendMessage(threadId, userId, text) {
  try {
    if (!threadId || !userId || !text) {
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

    const messagesRef = collection(db, "dm_messages");
    const messageDoc = await addDoc(messagesRef, {
      threadId,
      userId,
      text: text.trim(),
      createdAt: new Date(),
    });

    // Update thread timestamp
    const threadRef = doc(db, "dm_threads", threadId);
    await setDoc(threadRef, {
      updatedAt: new Date(),
    }, { merge: true });

    logInfo("socialService", "DM message sent", { messageId: messageDoc.id, threadId });
    return { ok: true, messageId: messageDoc.id };
  } catch (err) {
    logError("socialService", err, { function: "sendMessage", threadId });
    return { ok: false, error: err.message };
  }
}

/**
 * List messages in a DM thread
 * @param {string} threadId - Thread ID
 * @returns {Promise<Array>}
 */
export async function listMessages(threadId) {
  try {
    if (!threadId) return [];

    if (!db) {
      return [];
    }

    const messagesRef = collection(db, "dm_messages");
    const q = query(
      messagesRef,
      where("threadId", "==", threadId),
      orderBy("createdAt", "asc")
    );

    const snapshot = await getDocs(q);
    const messages = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      messages.push({
        id: docSnap.id,
        threadId: data.threadId,
        userId: data.userId,
        text: data.text || "",
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      });
    });

    return messages;
  } catch (err) {
    logError("socialService", err, { function: "listMessages", threadId });
    return [];
  }
}

/**
 * List DM threads for a user
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Array>}
 */
export async function listDMThreads(userId = null) {
  try {
    const currentUserId = userId || getCurrentUserId();
    if (!currentUserId) return [];

    if (!db) {
      return [];
    }

    const threadsRef = collection(db, "dm_threads");
    const q = query(
      threadsRef,
      where("participants", "array-contains", currentUserId),
      orderBy("updatedAt", "desc")
    );

    const snapshot = await getDocs(q);
    const threads = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const otherParticipant = data.participants?.find(p => p !== currentUserId) || null;
      threads.push({
        id: docSnap.id,
        participants: data.participants || [],
        otherParticipant,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
      });
    });

    return threads;
  } catch (err) {
    logError("socialService", err, { function: "listDMThreads", userId });
    return [];
  }
}

/**
 * Post to social feed
 * @param {string} text - Post text
 * @param {string} type - Post type ("gratitude" | "win" | "reflection" | "milestone")
 * @param {boolean} anonymized - Whether post is anonymized
 * @param {string} userId - User ID (optional)
 * @returns {Promise<{ok: boolean, postId?: string, error?: string}>}
 */
export async function postToFeed(text, type = "reflection", anonymized = false, userId = null) {
  try {
    const currentUserId = userId || getCurrentUserId();
    if (!text || !currentUserId) {
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
          error: moderationResult.suggestion || "Post was blocked by safety filters" 
        };
      }
    } catch (err) {
      console.warn("Moderation check failed, allowing post:", err);
    }

    const feedRef = collection(db, "social_feed");
    const postDoc = await addDoc(feedRef, {
      userId: anonymized ? null : currentUserId,
      text: text.trim(),
      type,
      anonymized,
      createdAt: new Date(),
    });

    logInfo("socialService", "Post created", { postId: postDoc.id, type });
    return { ok: true, postId: postDoc.id };
  } catch (err) {
    logError("socialService", err, { function: "postToFeed", type });
    return { ok: false, error: err.message };
  }
}

/**
 * Get social feed posts
 * @param {number} limitCount - Limit number of posts
 * @returns {Promise<Array>}
 */
export async function getFeedPosts(limitCount = 50) {
  try {
    if (!db) {
      return [];
    }

    const feedRef = collection(db, "social_feed");
    const q = query(feedRef, orderBy("createdAt", "desc"), limit(limitCount));

    const snapshot = await getDocs(q);
    const posts = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      posts.push({
        id: docSnap.id,
        userId: data.userId || null,
        text: data.text || "",
        type: data.type || "reflection",
        anonymized: data.anonymized || false,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      });
    });

    return posts;
  } catch (err) {
    logError("socialService", err, { function: "getFeedPosts" });
    return [];
  }
}

/**
 * React to a social feed post
 * @param {string} postId - Post ID
 * @param {string} emoji - Reaction emoji
 * @param {string} userId - User ID (optional)
 * @returns {Promise<{ok: boolean, reactionId?: string, error?: string}>}
 */
export async function reactToPost(postId, emoji, userId = null) {
  try {
    const currentUserId = userId || getCurrentUserId();
    if (!postId || !emoji || !currentUserId) {
      return { ok: false, error: "Missing required fields" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    const reactionsRef = collection(db, "social_reactions");
    const reactionDoc = await addDoc(reactionsRef, {
      postId,
      userId: currentUserId,
      emoji,
      createdAt: new Date(),
    });

    logInfo("socialService", "Reaction added", { reactionId: reactionDoc.id, postId });
    return { ok: true, reactionId: reactionDoc.id };
  } catch (err) {
    logError("socialService", err, { function: "reactToPost", postId });
    return { ok: false, error: err.message };
  }
}

export default {
  createDMThread,
  sendMessage,
  listMessages,
  listDMThreads,
  postToFeed,
  getFeedPosts,
  reactToPost,
};

