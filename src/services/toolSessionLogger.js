/**
 * Tool Session Logger - Outcomes logging for Daily Practice tools
 * Firestore-first, localStorage fallback when offline.
 */

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase";

const TOOL_SESSIONS_COLLECTION = "toolSessions";
const STORAGE_KEY = "wc_tool_sessions_pending";

/**
 * Create a session record on begin.
 * @param {string} slug - Tool slug
 * @returns {Promise<{sessionId?: string, savedTo: 'firestore'|'localStorage'}>}
 */
export async function logToolSessionBegin(slug) {
  const payload = {
    slug,
    startAt: new Date().toISOString(),
    distressBefore: null,
    distressAfter: null,
    completed: false,
  };

  try {
    if (db && auth?.currentUser) {
      const ref = await addDoc(collection(db, TOOL_SESSIONS_COLLECTION), {
        ...payload,
        uid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      return { sessionId: ref.id, savedTo: "firestore" };
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.debug("[toolSessionLogger] Firestore write failed, using localStorage", err?.message);
    }
  }

  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const pending = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  pending.push({ id, ...payload });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  return { sessionId: id, savedTo: "localStorage" };
}

/**
 * Update session with outcomes on complete.
 * @param {object} opts
 * @param {string} opts.slug - Tool slug
 * @param {number} [opts.distressBefore] - 0-10 before
 * @param {number} [opts.distressAfter] - 0-10 after
 * @param {boolean} [opts.completed] - Whether user completed the protocol
 */
export async function logToolSessionComplete({ slug, distressBefore, distressAfter, completed }) {
  const payload = { slug, distressBefore, distressAfter, completed };
  try {
    if (db && auth?.currentUser) {
      await addDoc(collection(db, TOOL_SESSIONS_COLLECTION), {
        ...payload,
        uid: auth.currentUser.uid,
        completedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
      return { savedTo: "firestore" };
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.debug("[toolSessionLogger] Firestore complete write failed", err?.message);
    }
  }

  const pending = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const last = pending.find((p) => p.slug === slug && !p.completed);
  if (last) {
    last.distressBefore = distressBefore;
    last.distressAfter = distressAfter;
    last.completed = completed;
    last.completedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } else {
    pending.push({
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      ...payload,
      startAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  }
  return { savedTo: "localStorage" };
}
