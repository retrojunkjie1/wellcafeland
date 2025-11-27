// src/services/providerNotes.js
// Provider notes service for client notes and session documentation

import { collection, query, getDocs, orderBy, addDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

/**
 * List notes for a client
 * @param {string} providerId - Provider's user ID
 * @param {string} clientId - Client's user ID
 * @returns {Promise<{ok: boolean, notes?: Array, error?: string}>}
 */
export async function listClientNotes(providerId, clientId) {
  if (!providerId || !clientId) {
    return { ok: false, error: "Provider ID and Client ID required", notes: [] };
  }

  if (!db) {
    // Return mock data if Firestore not available
    return {
      ok: false,
      error: "Database not available",
      notes: [
        {
          id: "note-1",
          createdAt: new Date().toISOString(),
          authorId: providerId,
          clientId,
          noteType: "session_note",
          content: "Initial check-in. Client expressed concerns about housing stability.",
          tags: ["housing", "check-in"],
        },
      ],
    };
  }

  try {
    const notesRef = collection(db, "providers", providerId, "clientNotes", clientId, "notes");
    const q = query(notesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const notes = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      notes.push({
        id: docSnap.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        authorId: data.authorId || providerId,
        clientId: data.clientId || clientId,
        noteType: data.noteType || "session_note",
        content: data.content || "",
        tags: data.tags || [],
      });
    });

    return { ok: true, notes };
  } catch (err) {
    console.error("Error listing client notes:", err);
    return { ok: false, error: err.message || "Failed to load notes", notes: [] };
  }
}

/**
 * Create a new note for a client
 * @param {string} providerId - Provider's user ID
 * @param {string} clientId - Client's user ID
 * @param {Object} noteData - { noteType, content, tags? }
 * @returns {Promise<{ok: boolean, noteId?: string, error?: string}>}
 */
export async function createClientNote(providerId, clientId, noteData) {
  if (!providerId || !clientId) {
    return { ok: false, error: "Provider ID and Client ID required" };
  }

  if (!noteData || !noteData.content || !noteData.content.trim()) {
    return { ok: false, error: "Note content is required" };
  }

  if (!db) {
    return { ok: false, error: "Database not available" };
  }

  try {
    const currentUser = auth?.currentUser;
    const authorId = currentUser?.uid || providerId;

    const note = {
      authorId,
      clientId,
      noteType: noteData.noteType || "session_note",
      content: noteData.content.trim(),
      tags: Array.isArray(noteData.tags) ? noteData.tags : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const notesRef = collection(db, "providers", providerId, "clientNotes", clientId, "notes");
    const docRef = await addDoc(notesRef, note);

    return { ok: true, noteId: docRef.id };
  } catch (err) {
    console.error("Error creating client note:", err);
    return { ok: false, error: err.message || "Failed to create note" };
  }
}

/**
 * Update an existing note
 * @param {string} providerId - Provider's user ID
 * @param {string} clientId - Client's user ID
 * @param {string} noteId - Note document ID
 * @param {Object} updates - { content?, tags? }
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function updateClientNote(providerId, clientId, noteId, updates) {
  if (!providerId || !clientId || !noteId) {
    return { ok: false, error: "Provider ID, Client ID, and Note ID required" };
  }

  if (!db) {
    return { ok: false, error: "Database not available" };
  }

  try {
    const noteRef = doc(db, "providers", providerId, "clientNotes", clientId, "notes", noteId);
    
    const updateData = {
      updatedAt: new Date(),
    };

    if (updates.content !== undefined) {
      updateData.content = updates.content.trim();
    }

    if (updates.tags !== undefined) {
      updateData.tags = Array.isArray(updates.tags) ? updates.tags : [];
    }

    await setDoc(noteRef, updateData, { merge: true });

    return { ok: true };
  } catch (err) {
    console.error("Error updating client note:", err);
    return { ok: false, error: err.message || "Failed to update note" };
  }
}

export default {
  listClientNotes,
  createClientNote,
  updateClientNote,
};

