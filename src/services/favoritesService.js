// src/services/favoritesService.js
// Favorites/pinned practices service
// Works for anonymous + logged-in users

import { doc, getDoc, setDoc, collection, query, orderBy, getDocs, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { getAnonymousUserId } from "@/lib/userId";
import { logError, logInfo } from "./logService";

const FAVORITES_STORAGE_KEY = "wc-favorites-tools-v1";

/**
 * Get current user ID
 */
function getCurrentUserId() {
  try {
    return auth?.currentUser?.uid || getAnonymousUserId();
  } catch {
    return getAnonymousUserId();
  }
}

/**
 * Add a favorite/pinned item
 */
export async function addFavorite(item) {
  const userId = getCurrentUserId();
  if (!userId || !item) {
    return { ok: false, error: "User ID and item required" };
  }

  try {
    const favoriteData = {
      type: item.type || "tool", // "tool" | "session" | "directory_resource"
      ref: item.ref || { toolKey: item.toolKey || item.id },
      label: item.label || item.title || "Untitled",
      lastUsedAt: new Date().toISOString(),
      usageCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const favoriteId = item.id || `${item.type || "tool"}_${Date.now()}`;

    // Try Firestore first
    if (db) {
      try {
        const favoriteRef = doc(db, "users", userId, "favoritesTools", favoriteId);
        const existing = await getDoc(favoriteRef);
        
        if (existing.exists()) {
          // Update usage count and last used
          await setDoc(favoriteRef, {
            ...favoriteData,
            usageCount: (existing.data().usageCount || 0) + 1,
          }, { merge: true });
        } else {
          await setDoc(favoriteRef, favoriteData);
        }
        
        logInfo("favoritesService", "Favorite added to Firestore", { userId, favoriteId });
        return { ok: true, favoriteId };
      } catch (err) {
        logError("favoritesService", err, { function: "addFavorite", step: "firestore" });
      }
    }

    // Fallback to localStorage
    try {
      const key = `${FAVORITES_STORAGE_KEY}-${userId}`;
      const stored = JSON.parse(localStorage.getItem(key) || "{}");
      const existing = stored[favoriteId];
      
      stored[favoriteId] = {
        ...favoriteData,
        usageCount: existing ? (existing.usageCount || 0) + 1 : 1,
      };
      
      localStorage.setItem(key, JSON.stringify(stored));
      logInfo("favoritesService", "Favorite added to localStorage", { userId, favoriteId });
      return { ok: true, favoriteId };
    } catch (err) {
      logError("favoritesService", err, { function: "addFavorite", step: "localStorage" });
      return { ok: false, error: "Failed to save favorite" };
    }
  } catch (err) {
    logError("favoritesService", err, { function: "addFavorite" });
    return { ok: false, error: err.message || "Unknown error" };
  }
}

/**
 * Remove a favorite
 */
export async function removeFavorite(itemId) {
  const userId = getCurrentUserId();
  if (!userId || !itemId) {
    return { ok: false, error: "User ID and item ID required" };
  }

  try {
    // Try Firestore first
    if (db) {
      try {
        const favoriteRef = doc(db, "users", userId, "favoritesTools", itemId);
        await deleteDoc(favoriteRef);
        logInfo("favoritesService", "Favorite removed from Firestore", { userId, itemId });
        return { ok: true };
      } catch (err) {
        logError("favoritesService", err, { function: "removeFavorite", step: "firestore" });
      }
    }

    // Fallback to localStorage
    try {
      const key = `${FAVORITES_STORAGE_KEY}-${userId}`;
      const stored = JSON.parse(localStorage.getItem(key) || "{}");
      delete stored[itemId];
      localStorage.setItem(key, JSON.stringify(stored));
      logInfo("favoritesService", "Favorite removed from localStorage", { userId, itemId });
      return { ok: true };
    } catch (err) {
      logError("favoritesService", err, { function: "removeFavorite", step: "localStorage" });
      return { ok: false, error: "Failed to remove favorite" };
    }
  } catch (err) {
    logError("favoritesService", err, { function: "removeFavorite" });
    return { ok: false, error: err.message || "Unknown error" };
  }
}

/**
 * List all favorites
 */
export async function listFavorites() {
  const userId = getCurrentUserId();
  if (!userId) {
    return [];
  }

  try {
    let favorites = [];

    // Try Firestore first
    if (db) {
      try {
        const favoritesRef = collection(db, "users", userId, "favoritesTools");
        const q = query(favoritesRef, orderBy("lastUsedAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          favorites.push({
            id: docSnap.id,
            ...data,
          });
        });
      } catch (err) {
        logError("favoritesService", err, { function: "listFavorites", step: "firestore" });
      }
    }

    // Fallback to localStorage
    if (favorites.length === 0) {
      try {
        const key = `${FAVORITES_STORAGE_KEY}-${userId}`;
        const stored = JSON.parse(localStorage.getItem(key) || "{}");
        favorites = Object.entries(stored).map(([id, data]) => ({
          id,
          ...data,
        }));
        
        // Sort by lastUsedAt
        favorites.sort((a, b) => {
          const dateA = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
          const dateB = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
          return dateB - dateA;
        });
      } catch (err) {
        logError("favoritesService", err, { function: "listFavorites", step: "localStorage" });
      }
    }

    return favorites;
  } catch (err) {
    logError("favoritesService", err, { function: "listFavorites" });
    return [];
  }
}

/**
 * Check if an item is favorited
 */
export async function isFavorite(itemId) {
  const favorites = await listFavorites();
  return favorites.some(fav => fav.id === itemId || fav.ref?.toolKey === itemId);
}

export default {
  addFavorite,
  removeFavorite,
  listFavorites,
  isFavorite,
};

