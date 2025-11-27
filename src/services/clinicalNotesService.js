// src/services/clinicalNotesService.js
// Clinical notes management

import { collection, addDoc, doc, getDoc, query, where, getDocs, updateDoc, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { logError, logInfo } from "./logService";

/**
 * Create a clinical note
 * @param {Object} data - { clientId, providerId, orgId, noteType, title, content, tags }
 * @returns {Promise<{ok: boolean, noteId?: string, error?: string}>}
 */
export async function createNote({ clientId, providerId, orgId, noteType = "general", title, content, tags = [] }) {
  try {
    if (!clientId || !providerId || !title || !content) {
      return { ok: false, error: "Missing required fields: clientId, providerId, title, content" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    const notesRef = collection(db, "clinicalNotes");
    const noteData = {
      clientId,
      providerId,
      orgId: orgId || null,
      noteType: noteType || "general",
      title: title.trim(),
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(notesRef, noteData);

    logInfo("clinicalNotesService", "Clinical note created", { noteId: docRef.id, clientId, providerId });
    return { ok: true, noteId: docRef.id };
  } catch (err) {
    logError("clinicalNotesService", err, { function: "createNote", clientId, providerId });
    return { ok: false, error: err.message };
  }
}

/**
 * Update a clinical note
 * @param {string} noteId - Note ID
 * @param {Object} data - Partial update data
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function updateNote(noteId, data) {
  try {
    if (!noteId || !db) {
      return { ok: false, error: "Missing noteId or database not available" };
    }

    const noteRef = doc(db, "clinicalNotes", noteId);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(noteRef, updateData);

    logInfo("clinicalNotesService", "Clinical note updated", { noteId });
    return { ok: true };
  } catch (err) {
    logError("clinicalNotesService", err, { function: "updateNote", noteId });
    return { ok: false, error: err.message };
  }
}

/**
 * List notes for a client
 * @param {string} clientId - Client ID
 * @param {string} providerId - Provider ID (optional, filter by provider)
 * @returns {Promise<Array>}
 */
export async function listNotesForClient(clientId, providerId = null) {
  try {
    if (!clientId || !db) return [];

    const notesRef = collection(db, "clinicalNotes");
    let q = query(notesRef, where("clientId", "==", clientId), orderBy("createdAt", "desc"));

    if (providerId) {
      q = query(notesRef, where("clientId", "==", clientId), where("providerId", "==", providerId), orderBy("createdAt", "desc"));
    }

    const snapshot = await getDocs(q);
    const notes = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      notes.push({
        id: docSnap.id,
        clientId: data.clientId,
        providerId: data.providerId,
        orgId: data.orgId || null,
        noteType: data.noteType || "general",
        title: data.title || "",
        content: data.content || "",
        tags: data.tags || [],
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
      });
    });

    return notes;
  } catch (err) {
    logError("clinicalNotesService", err, { function: "listNotesForClient", clientId, providerId });
    return [];
  }
}

/**
 * Get a single note
 * @param {string} noteId - Note ID
 * @returns {Promise<Object|null>}
 */
export async function getNote(noteId) {
  try {
    if (!noteId || !db) return null;

    const noteRef = doc(db, "clinicalNotes", noteId);
    const noteDoc = await getDoc(noteRef);

    if (!noteDoc.exists()) return null;

    const data = noteDoc.data();
    return {
      id: noteDoc.id,
      clientId: data.clientId,
      providerId: data.providerId,
      orgId: data.orgId || null,
      noteType: data.noteType || "general",
      title: data.title || "",
      content: data.content || "",
      tags: data.tags || [],
      createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
    };
  } catch (err) {
    logError("clinicalNotesService", err, { function: "getNote", noteId });
    return null;
  }
}

export default {
  createNote,
  updateNote,
  listNotesForClient,
  getNote,
};

