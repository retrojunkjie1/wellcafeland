// src/services/connectionsService.js
// Connections service for friends, trusted partners, blocked users, and circles

import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
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
 * Get connections for a user
 * @param {string} userId - User ID (optional, uses current user if not provided)
 * @returns {Promise<Object>}
 */
export async function getConnections(userId = null) {
  try {
    const targetUserId = userId || getCurrentUserId();
    if (!targetUserId) {
      return { friends: [], trusted: [], blocked: [], circles: [] };
    }

    if (!db) {
      return { friends: [], trusted: [], blocked: [], circles: [] };
    }

    const connectionsRef = doc(db, "connections", targetUserId);
    const connectionsDoc = await getDoc(connectionsRef);

    if (!connectionsDoc.exists()) {
      return { friends: [], trusted: [], blocked: [], circles: [] };
    }

    const data = connectionsDoc.data();
    return {
      friends: data.friends || [],
      trusted: data.trusted || [],
      blocked: data.blocked || [],
      circles: data.circles || [],
    };
  } catch (err) {
    logError("connectionsService", err, { function: "getConnections", userId });
    return { friends: [], trusted: [], blocked: [], circles: [] };
  }
}

/**
 * Add a friend
 * @param {string} userId - User ID (optional)
 * @param {string} targetId - Target user ID to add as friend
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function addFriend(userId = null, targetId) {
  try {
    const currentUserId = userId || getCurrentUserId();
    if (!currentUserId || !targetId) {
      return { ok: false, error: "Missing user ID or target ID" };
    }

    if (currentUserId === targetId) {
      return { ok: false, error: "Cannot add yourself as a friend" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    const connectionsRef = doc(db, "connections", currentUserId);
    await setDoc(connectionsRef, {
      friends: arrayUnion(targetId),
    }, { merge: true });

    logInfo("connectionsService", "Friend added", { userId: currentUserId, targetId });
    return { ok: true };
  } catch (err) {
    logError("connectionsService", err, { function: "addFriend", userId, targetId });
    return { ok: false, error: err.message };
  }
}

/**
 * Add a trusted partner
 * @param {string} userId - User ID (optional)
 * @param {string} targetId - Target user ID to add as trusted partner
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function addTrustedPartner(userId = null, targetId) {
  try {
    const currentUserId = userId || getCurrentUserId();
    if (!currentUserId || !targetId) {
      return { ok: false, error: "Missing user ID or target ID" };
    }

    if (currentUserId === targetId) {
      return { ok: false, error: "Cannot add yourself as a trusted partner" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    const connectionsRef = doc(db, "connections", currentUserId);
    await setDoc(connectionsRef, {
      trusted: arrayUnion(targetId),
    }, { merge: true });

    logInfo("connectionsService", "Trusted partner added", { userId: currentUserId, targetId });
    return { ok: true };
  } catch (err) {
    logError("connectionsService", err, { function: "addTrustedPartner", userId, targetId });
    return { ok: false, error: err.message };
  }
}

/**
 * Block a user
 * @param {string} userId - User ID (optional)
 * @param {string} targetId - Target user ID to block
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function blockUser(userId = null, targetId) {
  try {
    const currentUserId = userId || getCurrentUserId();
    if (!currentUserId || !targetId) {
      return { ok: false, error: "Missing user ID or target ID" };
    }

    if (currentUserId === targetId) {
      return { ok: false, error: "Cannot block yourself" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    const connectionsRef = doc(db, "connections", currentUserId);
    
    // Remove from friends and trusted if present, add to blocked
    const connectionsDoc = await getDoc(connectionsRef);
    const currentData = connectionsDoc.exists() ? connectionsDoc.data() : {};
    
    await updateDoc(connectionsRef, {
      friends: arrayRemove(targetId),
      trusted: arrayRemove(targetId),
      blocked: arrayUnion(targetId),
    });

    logInfo("connectionsService", "User blocked", { userId: currentUserId, targetId });
    return { ok: true };
  } catch (err) {
    logError("connectionsService", err, { function: "blockUser", userId, targetId });
    return { ok: false, error: err.message };
  }
}

/**
 * Remove a friend
 * @param {string} userId - User ID (optional)
 * @param {string} targetId - Target user ID to remove from friends
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function removeFriend(userId = null, targetId) {
  try {
    const currentUserId = userId || getCurrentUserId();
    if (!currentUserId || !targetId) {
      return { ok: false, error: "Missing user ID or target ID" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    const connectionsRef = doc(db, "connections", currentUserId);
    await updateDoc(connectionsRef, {
      friends: arrayRemove(targetId),
    });

    logInfo("connectionsService", "Friend removed", { userId: currentUserId, targetId });
    return { ok: true };
  } catch (err) {
    logError("connectionsService", err, { function: "removeFriend", userId, targetId });
    return { ok: false, error: err.message };
  }
}

/**
 * Join a circle (adds to user's circles list)
 * @param {string} userId - User ID (optional)
 * @param {string} circleId - Circle ID to join
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function joinCircle(userId = null, circleId) {
  try {
    const currentUserId = userId || getCurrentUserId();
    if (!currentUserId || !circleId) {
      return { ok: false, error: "Missing user ID or circle ID" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    const connectionsRef = doc(db, "connections", currentUserId);
    await setDoc(connectionsRef, {
      circles: arrayUnion(circleId),
    }, { merge: true });

    logInfo("connectionsService", "Circle joined", { userId: currentUserId, circleId });
    return { ok: true };
  } catch (err) {
    logError("connectionsService", err, { function: "joinCircle", userId, circleId });
    return { ok: false, error: err.message };
  }
}

/**
 * Leave a circle (removes from user's circles list)
 * @param {string} userId - User ID (optional)
 * @param {string} circleId - Circle ID to leave
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function leaveCircle(userId = null, circleId) {
  try {
    const currentUserId = userId || getCurrentUserId();
    if (!currentUserId || !circleId) {
      return { ok: false, error: "Missing user ID or circle ID" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    const connectionsRef = doc(db, "connections", currentUserId);
    await updateDoc(connectionsRef, {
      circles: arrayRemove(circleId),
    });

    logInfo("connectionsService", "Circle left", { userId: currentUserId, circleId });
    return { ok: true };
  } catch (err) {
    logError("connectionsService", err, { function: "leaveCircle", userId, circleId });
    return { ok: false, error: err.message };
  }
}

export default {
  getConnections,
  addFriend,
  addTrustedPartner,
  blockUser,
  removeFriend,
  joinCircle,
  leaveCircle,
};

