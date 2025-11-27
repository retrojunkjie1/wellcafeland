// src/services/messagingService.js
// Provider-client messaging

import { collection, addDoc, query, getDocs, orderBy, limit, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { logError, logInfo } from "./logService";

/**
 * Get or create conversation ID for client-provider pair
 * @param {string} clientId - Client ID
 * @param {string} providerId - Provider ID
 * @returns {string} Conversation ID
 */
export function getOrCreateConversationId(clientId, providerId) {
  // Deterministic conversation ID: sort IDs lexicographically
  const ids = [clientId, providerId].sort();
  return `${ids[0]}__${ids[1]}`;
}

/**
 * Send a message
 * @param {Object} data - { clientId, providerId, senderId, senderRole, content, type }
 * @returns {Promise<{ok: boolean, messageId?: string, error?: string}>}
 */
export async function sendMessage({ clientId, providerId, senderId, senderRole, content, type = "text" }) {
  try {
    if (!clientId || !providerId || !senderId || !content) {
      return { ok: false, error: "Missing required fields" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    const conversationId = getOrCreateConversationId(clientId, providerId);
    const messagesRef = collection(db, "conversations", conversationId, "messages");

    const messageData = {
      senderId,
      receiverId: senderRole === "provider" ? clientId : providerId,
      senderRole: senderRole || "client",
      clientId,
      providerId,
      content: content.trim(),
      type: type || "text",
      readBy: [],
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(messagesRef, messageData);

    logInfo("messagingService", "Message sent", { messageId: docRef.id, conversationId });
    return { ok: true, messageId: docRef.id, conversationId };
  } catch (err) {
    logError("messagingService", err, { function: "sendMessage", clientId, providerId });
    return { ok: false, error: err.message };
  }
}

/**
 * Listen to messages in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {Function} callback - Callback function (messages) => void
 * @returns {Function} Unsubscribe function
 */
export function listenToMessages(conversationId, callback) {
  try {
    if (!conversationId || !db || !callback) {
      return () => {};
    }

    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          messages.push({
            id: docSnap.id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            senderRole: data.senderRole || "client",
            clientId: data.clientId,
            providerId: data.providerId,
            content: data.content,
            type: data.type || "text",
            readBy: data.readBy || [],
            createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
          });
        });
        callback(messages);
      },
      (err) => {
        logError("messagingService", err, { function: "listenToMessages", conversationId });
        callback([]);
      }
    );

    return unsubscribe;
  } catch (err) {
    logError("messagingService", err, { function: "listenToMessages", conversationId });
    return () => {};
  }
}

/**
 * List recent messages in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} limitCount - Limit number of messages
 * @returns {Promise<Array>}
 */
export async function listRecentMessages(conversationId, limitCount = 50) {
  try {
    if (!conversationId || !db) return [];

    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);

    const messages = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      messages.push({
        id: docSnap.id,
        senderId: data.senderId,
        receiverId: data.receiverId,
        senderRole: data.senderRole || "client",
        clientId: data.clientId,
        providerId: data.providerId,
        content: data.content,
        type: data.type || "text",
        readBy: data.readBy || [],
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      });
    });

    // Reverse to get chronological order
    return messages.reverse();
  } catch (err) {
    logError("messagingService", err, { function: "listRecentMessages", conversationId });
    return [];
  }
}

export default {
  getOrCreateConversationId,
  sendMessage,
  listenToMessages,
  listRecentMessages,
};

