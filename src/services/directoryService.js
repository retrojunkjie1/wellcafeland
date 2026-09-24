// src/services/directoryService.js
// Global Directory service for searching providers, housing, grants, assistance, hotlines, programs
// Fully supports anonymous users with localStorage fallback

import { collection, query, getDocs, orderBy, limit, doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { getAnonymousUserId } from "@/lib/userId";
import { searchResources } from "./resourceSearch";
import { getHousingProvider } from "./housingService";
import { getGrant } from "./grantsService";
import { getSupportProgram } from "./supportProgramsService";
import { getCircle } from "./circlesService";

const MIN_RESULTS = 5;
const DOMAINS = ["providers", "housing", "grants", "assistance", "hotlines", "programs", "government_assistance"];

// In-memory cache for recent search results (keyed by domain+query)
const recentSearchCache = new Map();
const CACHE_MAX_SIZE = 50; // Keep last 50 searches

/**
 * Get current user ID (authenticated or anonymous)
 * Uses Firebase Auth if available, otherwise falls back to anonymous ID
 */
export function getCurrentUserId() {
  // Try Firebase Auth first
  if (auth?.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  
  // Fall back to anonymous ID
  return getAnonymousUserId();
}

/**
 * Cache recent search results for getDirectoryItem fallback
 */
function cacheSearchResults(domain, query, results) {
  const key = `${domain}:${query}`;
  recentSearchCache.set(key, results);
  
  // Limit cache size
  if (recentSearchCache.size > CACHE_MAX_SIZE) {
    const firstKey = recentSearchCache.keys().next().value;
    recentSearchCache.delete(firstKey);
  }
}

/**
 * Get cached search results
 */
function getCachedResults(domain, query) {
  const key = `${domain}:${query}`;
  return recentSearchCache.get(key) || [];
}

/**
 * Search Firestore directory collection
 */
async function searchFirestoreDirectory(domain, searchQuery, filters = {}) {
  if (!db) {
    return [];
  }

  try {
    const collectionRef = collection(db, domain);
    let q = query(collectionRef);

    // Apply text search on title and description
    if (searchQuery) {
      q = query(collectionRef, orderBy("title"), limit(50));
    } else {
      q = query(collectionRef, orderBy("createdAt", "desc"), limit(50));
    }

    const querySnapshot = await getDocs(q);
    const results = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docId = docSnap.id;

      // Client-side filtering
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        const titleMatch = data.title?.toLowerCase().includes(queryLower);
        const descMatch = data.description?.toLowerCase().includes(queryLower);
        const tagsMatch = data.tags?.some((tag) => tag.toLowerCase().includes(queryLower));
        const regionMatch = data.region?.toLowerCase().includes(queryLower);

        if (!titleMatch && !descMatch && !tagsMatch && !regionMatch) {
          return;
        }
      }

      // Apply filters
      if (filters.region && data.region !== filters.region) {
        return;
      }
      if (filters.category && data.category !== filters.category) {
        return;
      }
      if (filters.type && data.type !== filters.type) {
        return;
      }
      if (filters.tags && filters.tags.length > 0) {
        const hasTag = filters.tags.some((tag) => data.tags?.includes(tag));
        if (!hasTag) return;
      }

      results.push({
        id: docId,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      });
    });

    return results;
  } catch (err) {
    console.error(`Error searching ${domain}:`, err);
    return [];
  }
}

/**
 * Get default search term for a domain when no query is provided
 */
function getDefaultSearchTerm(domain) {
  const domainTerms = {
    providers: "recovery therapists addiction counselors",
    housing: "sober living transitional housing recovery housing",
    grants: "recovery grants addiction treatment funding",
    assistance: "government assistance recovery support programs",
    government_assistance: "government assistance recovery support programs",
    hotlines: "crisis hotline suicide prevention addiction helpline",
    programs: "recovery programs support groups addiction treatment",
  };
  return domainTerms[domain] || domain;
}

/**
 * Map external search results to directory format
 */
function mapExternalResultsToDirectory(externalResults, domain, query) {
  return externalResults.map((result) => {
    let category = domain;
    const tags = [];
    const queryLower = query.toLowerCase();

    if (queryLower.includes("colorado") || queryLower.includes("co")) {
      tags.push("colorado");
    }
    if (queryLower.includes("men")) {
      tags.push("men");
    }
    if (queryLower.includes("women")) {
      tags.push("women");
    }
    if (queryLower.includes("family") || queryLower.includes("families")) {
      tags.push("families");
    }

    if (domain === "providers") {
      if (queryLower.includes("therapist") || queryLower.includes("therapy")) {
        category = "Therapist";
      } else if (queryLower.includes("coach")) {
        category = "Coach";
      } else if (queryLower.includes("peer")) {
        category = "Peer Support";
      }
    } else if (domain === "housing") {
      category = "Housing";
    } else if (domain === "grants") {
      category = "Grant";
    }

    return {
      id: `external-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: result.title || result.name || result.headline || "Untitled Resource",
      description: result.snippet || result.description || result.abstract || "",
      category,
      tags,
      region: result.address || result.location || result.region || "Nationwide",
      link: result.url || result.link || result.uri || "",
      url: result.url || result.link || result.uri || "",
      source: "rapidapi",
      snippet: result.snippet || result.description || result.abstract || "",
      type: domain,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

/**
 * Rank and merge results
 */
function mergeAndRank(internalResults, externalResults = []) {
  const allResults = [...internalResults, ...externalResults];
  const seen = new Set();

  const uniqueResults = allResults.filter((result) => {
    const key = `${result.title?.toLowerCase()}_${result.link?.toLowerCase() || result.url?.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  return uniqueResults.sort((a, b) => {
    if (a.isVerified && !b.isVerified) return -1;
    if (!a.isVerified && b.isVerified) return 1;
    if (a.source === "internal" && b.source !== "internal") return -1;
    if (a.source !== "internal" && b.source === "internal") return 1;
    return 0;
  });
}

/**
 * Main directory search function
 */
export async function searchDirectory({ domain, query: searchQuery = "", filters = {} }) {
  if (!DOMAINS.includes(domain)) {
    throw new Error(`Invalid domain: ${domain}. Must be one of: ${DOMAINS.join(", ")}`);
  }

  // Step 1: Search Firestore
  const internalResults = await searchFirestoreDirectory(domain, searchQuery, filters);

  // Step 2: Always search externally if there's a query, or if internal results < MIN_RESULTS
  let externalResults = [];
  const shouldSearchExternal = searchQuery || internalResults.length < MIN_RESULTS;
  
  if (shouldSearchExternal) {
    try {
      let searchTerm = searchQuery || getDefaultSearchTerm(domain);
      
      if (searchQuery) {
        const domainTerms = {
          housing: "sober living transitional housing recovery",
          providers: "recovery therapist addiction counselor",
          grants: "recovery grant funding assistance",
          assistance: "government assistance recovery support",
          government_assistance: "government assistance recovery support",
          hotlines: "crisis hotline suicide prevention",
          programs: "recovery program support group",
        };
        const domainContext = domainTerms[domain] || "";
        if (domainContext && !searchQuery.toLowerCase().includes(domainContext.split(" ")[0])) {
          searchTerm = `${searchQuery} ${domainContext}`;
        }
      }
      
      if (filters.region && filters.region !== "All regions" && filters.region !== "" && filters.region !== "Nationwide") {
        searchTerm = `${searchTerm} ${filters.region}`;
      }
      if (filters.type && filters.type !== "All types" && filters.type !== "") {
        searchTerm = `${searchTerm} ${filters.type}`;
      }
      if (filters.category && filters.category !== "All categories" && filters.category !== "") {
        searchTerm = `${searchTerm} ${filters.category}`;
      }
      
      // Import searchResources from resourceSearch (which uses Firebase Function + fallback)
      const searchResponse = await searchResources({
        query: searchTerm.trim(),
        domain,
        region: filters.region,
        category: filters.category,
      });
      
      if (searchResponse.ok && searchResponse.results && searchResponse.results.length > 0) {
        externalResults = searchResponse.results;
        
        // Cache results for getDirectoryItem fallback
        cacheSearchResults(domain, searchTerm, externalResults);
      }
    } catch (err) {
      console.error("External search failed:", err);
    }
  }

  // Step 3: Merge and rank
  const mergedResults = mergeAndRank(internalResults, externalResults);
  
  // Cache merged results
  if (searchQuery) {
    cacheSearchResults(domain, searchQuery, mergedResults);
  }

  return mergedResults;
}

/**
 * Get a single directory item by ID
 * Tries Firestore first, then cached search results, then reconstructs from URL
 * Handles URL-encoded IDs
 * Phase 12: Supports housing, grants, programs, circles domains
 */
export async function getDirectoryItem(domain, id) {
  if (!id) {
    return null;
  }

  // Decode URL-encoded ID if needed
  let decodedId = id;
  try {
    decodedId = decodeURIComponent(id);
  } catch {
    // If decoding fails, use original ID
    decodedId = id;
  }

  // Phase 12: Try specialized services for new domains
  if (domain === "housing") {
    try {
      const item = await getHousingProvider(decodedId);
      if (item) {
        return {
          id: item.id,
          domain,
          title: item.name || "Housing Provider",
          description: item.description || "",
          url: item.website || "",
          source: "curated",
          snippet: item.description || "",
          region: item.region || null,
          phone: item.contact?.phone || null,
          address: item.contact?.address || null,
          category: item.type || null,
          tags: item.tags || [],
          capacity_status: item.capacity_status || null,
        };
      }
    } catch (err) {
      console.error("Error getting housing provider:", err);
    }
  }

  if (domain === "grants") {
    try {
      const item = await getGrant(decodedId);
      if (item) {
        return {
          id: item.id,
          domain,
          title: item.name || "Grant",
          description: item.description || "",
          url: item.website || "",
          source: "curated",
          snippet: item.description || "",
          region: item.region || null,
          phone: item.contact?.phone || null,
          tags: item.tags || [],
        };
      }
    } catch (err) {
      console.error("Error getting grant:", err);
    }
  }

  if (domain === "programs" || domain === "assistance") {
    try {
      const item = await getSupportProgram(decodedId);
      if (item) {
        return {
          id: item.id,
          domain,
          title: item.name || "Support Program",
          description: item.description || "",
          url: item.website || "",
          source: "curated",
          snippet: item.description || "",
          region: item.region || null,
          category: item.category || null,
          tags: item.tags || [],
        };
      }
    } catch (err) {
      console.error("Error getting support program:", err);
    }
  }

  if (domain === "circles") {
    try {
      const item = await getCircle(decodedId);
      if (item) {
        return {
          id: item.id,
          domain,
          title: `${item.theme.charAt(0).toUpperCase() + item.theme.slice(1)} Circle`,
          description: item.description || "",
          url: "",
          source: "curated",
          snippet: item.description || "",
          category: item.theme || null,
          cadence: item.cadence || null,
          prompts: item.prompts || [],
        };
      }
    } catch (err) {
      console.error("Error getting circle:", err);
    }
  }

  // Try Firestore first
  if (db) {
    try {
      // Try with decoded ID first
      let docRef = doc(db, domain, decodedId);
      let docSnap = await getDoc(docRef);

      // If not found and ID was encoded, try with original ID
      if (!docSnap.exists() && decodedId !== id) {
        docRef = doc(db, domain, id);
        docSnap = await getDoc(docRef);
      }

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          domain,
          title: data.title || data.name || "Untitled Resource",
          description: data.description || data.snippet || "",
          url: data.url || data.link || data.website || "",
          source: data.source || "internal",
          snippet: data.snippet || data.description || "",
          region: data.region || null,
          phone: data.phone || data.contact?.phone || null,
          address: data.address || data.contact?.address || null,
          category: data.category || null,
          tags: data.tags || [],
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        };
      }
    } catch (err) {
      console.error(`Error getting ${domain}/${decodedId} from Firestore:`, err);
    }
  }

  // Try cached search results (check both encoded and decoded IDs)
  for (const [key, results] of recentSearchCache.entries()) {
    const [cachedDomain] = key.split(":");
    if (cachedDomain === domain) {
      // Try to find by ID (both encoded and decoded)
      let item = results.find((r) => r.id === id || r.id === decodedId);
      
      // If not found by ID, try to find by URL match
      if (!item) {
        const urlMatch = decodedId.startsWith("http") ? decodedId : null;
        if (urlMatch) {
          item = results.find((r) => r.url === urlMatch || r.link === urlMatch);
        }
      }

      if (item) {
        return {
          id: item.id || decodedId,
          domain,
          title: item.title || "Untitled Resource",
          description: item.description || item.snippet || "",
          url: item.url || item.link || decodedId,
          source: item.source || "rapidapi",
          snippet: item.snippet || item.description || "",
          region: item.region || null,
          phone: item.phone || null,
          address: item.address || null,
          category: item.category || null,
          tags: item.tags || [],
        };
      }
    }
  }

  // If ID looks like a URL (encoded or decoded), reconstruct minimal item
  const urlPattern = /^https?:\/\//i;
  if (urlPattern.test(decodedId) || urlPattern.test(id)) {
    const url = urlPattern.test(decodedId) ? decodedId : id;
    return {
      id: decodedId,
      domain,
      title: "External Resource",
      description: "",
      url,
      source: "web",
      snippet: "",
      region: null,
      phone: null,
      address: null,
    };
  }

  return null;
}

/**
 * Save a resource to favorites
 * Works for anonymous users with localStorage fallback
 */
export async function saveFavoriteResource(domain, item) {
  const userId = getCurrentUserId();
  
  if (!userId) {
    return { ok: false, error: "Unable to identify user" };
  }

  try {
    const favoriteData = {
      domain,
      itemId: item.id,
      title: item.title || "Untitled Resource",
      url: item.url || item.link || "",
      description: item.description || item.snippet || "",
      createdAt: new Date().toISOString(),
    };

    // Try Firestore first
    if (db) {
      try {
        const favoriteId = `${domain}_${item.id}`;
        const favoriteRef = doc(db, "users", userId, "favorites", favoriteId);
        await setDoc(favoriteRef, favoriteData, { merge: true });
        return { ok: true };
      } catch (err) {
        console.warn("Failed to save favorite to Firestore, using localStorage:", err);
      }
    }

    // Fallback to localStorage
    try {
      const key = `wc-favorites-${userId}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const favoriteId = `${domain}_${item.id}`;
      const updated = existing.filter((f) => f.id !== favoriteId);
      updated.push({ id: favoriteId, ...favoriteData });
      localStorage.setItem(key, JSON.stringify(updated));
      return { ok: true };
    } catch (err) {
      console.error("Failed to save favorite to localStorage:", err);
      return { ok: false, error: "Failed to save favorite" };
    }
  } catch (err) {
    console.error("Error saving favorite:", err);
    return { ok: false, error: err.message || "Unknown error" };
  }
}

/**
 * List user's favorite resources
 * Works for anonymous users
 */
export async function listFavorites(domain) {
  const userId = getCurrentUserId();
  
  if (!userId) {
    return [];
  }

  try {
    // Try Firestore first
    if (db) {
      try {
        const favoritesRef = collection(db, "users", userId, "favorites");
        const q = query(favoritesRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const favorites = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!domain || data.domain === domain) {
            favorites.push({
              id: docSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || data.createdAt,
            });
          }
        });

        return favorites;
      } catch (err) {
        console.warn("Failed to load favorites from Firestore, using localStorage:", err);
      }
    }

    // Fallback to localStorage
    try {
      const key = `wc-favorites-${userId}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      return domain
        ? existing.filter((f) => f.domain === domain)
        : existing;
    } catch (err) {
      console.error("Failed to load favorites from localStorage:", err);
      return [];
    }
  } catch (err) {
    console.error("Error listing favorites:", err);
    return [];
  }
}

/**
 * Save a resource plan (notes about a resource)
 * Works for anonymous users with localStorage fallback
 */
export async function saveResourcePlan(domain, item, planData) {
  const userId = getCurrentUserId();
  
  if (!userId) {
    return { ok: false, error: "Unable to identify user" };
  }

  try {
    const plan = {
      domain,
      itemId: item.id,
      itemTitle: item.title || "Untitled Resource",
      itemUrl: item.url || item.link || "",
      status: planData.status || "interested",
      notes: planData.notes || "",
      nextStep: planData.nextStep || "",
      followUpDate: planData.followUpDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Try Firestore first
    if (db) {
      try {
        const planId = `${domain}_${item.id}`;
        const planRef = doc(db, "users", userId, "plans", planId);
        await setDoc(planRef, plan, { merge: true });
        return { ok: true };
      } catch (err) {
        console.warn("Failed to save plan to Firestore, using localStorage:", err);
      }
    }

    // Fallback to localStorage
    try {
      const key = `wc-plans-${userId}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const planId = `${domain}_${item.id}`;
      const updated = existing.filter((p) => p.id !== planId);
      updated.push({ id: planId, ...plan });
      localStorage.setItem(key, JSON.stringify(updated));
      return { ok: true };
    } catch (err) {
      console.error("Failed to save plan to localStorage:", err);
      return { ok: false, error: "Failed to save plan" };
    }
  } catch (err) {
    console.error("Error saving resource plan:", err);
    return { ok: false, error: err.message || "Unknown error" };
  }
}

export default {
  searchDirectory,
  getDirectoryItem,
  saveFavoriteResource,
  listFavorites,
  saveResourcePlan,
  getCurrentUserId,
};
