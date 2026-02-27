/**
 * Tool Loader - Firestore-first with seed fallback
 * Loads Daily Practice tools by slug. Offline-safe.
 */

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import seedTools from "@/data/tools.seed.json";

const TOOLS_COLLECTION = "tools";

/**
 * Load tool by slug. Tries Firestore first, falls back to seed.
 * @param {string} slug - Tool slug (doc id in Firestore, id in seed)
 * @returns {Promise<object|null>} Tool object or null
 */
// Enable with: window.__wc_tool_loader_debug = true in dev console
const TOOL_LOADER_DEBUG = import.meta.env.DEV && typeof window !== "undefined" && window.__wc_tool_loader_debug;

export async function loadToolBySlug(slug) {
  if (!slug || typeof slug !== "string") return null;
  const trimmed = slug.trim();
  if (!trimmed) return null;

  try {
    if (db) {
      const ref = doc(db, TOOLS_COLLECTION, trimmed);
      const snap = await getDoc(ref);
      if (snap?.exists?.()) {
        const data = snap.data();
        if (TOOL_LOADER_DEBUG) {
          console.debug("[toolLoader] resolved via Firestore", { slug: trimmed });
        }
        return {
          slug: trimmed,
          ...data,
          id: data.slug ?? trimmed,
        };
      }
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.debug("[toolLoader] Firestore read failed, using seed", { slug: trimmed, err: err?.message });
    }
  }

  const fromSeed = seedTools.find((t) => (t.slug || t.id) === trimmed);
  if (fromSeed) {
    if (TOOL_LOADER_DEBUG) {
      console.debug("[toolLoader] resolved via seed", { slug: trimmed });
    }
    return { ...fromSeed, id: fromSeed.slug ?? trimmed };
  }
  if (TOOL_LOADER_DEBUG) {
    console.debug("[toolLoader] not found", { slug: trimmed });
  }
  return null;
}

/**
 * Get all seed tools (for ToolsIndex / Daily Practice grid).
 * @returns {Array} Tools in display format
 */
export function getSeedToolsForDisplay() {
  return seedTools.map((t) => ({
    id: t.slug,
    slug: t.slug,
    title: t.title,
    summary: t.clinicalIntent?.slice(0, 120) || t.title,
    category: Array.isArray(t.category) ? t.category[0] : t.category || "Practice",
    tags: [
      ...(Array.isArray(t.category) ? t.category : [t.category]),
      t.intensity,
      ...(t.indications || []),
    ].filter(Boolean),
    intensity: t.intensity,
    durationSec: t.durationSec,
  }));
}
