// src/stores/cacheStore.js

/**
 * Cache Store
 * Provides intelligent caching with expiry and invalidation
 */

const CACHE_PREFIX = "wc_cache_";
const DEFAULT_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached value
 * @param {string} key - Cache key
 * @returns {any|null} Cached value or null if expired/missing
 */
export function getCache(key) {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return null;
    }

    const { value, expiry } = JSON.parse(cached);
    
    // Check if expired
    if (expiry && Date.now() > expiry) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return value;
  } catch (err) {
    console.warn("Cache read error (non-critical):", err.message);
    return null;
  }
}

/**
 * Set cached value
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} expiryMs - Expiry in milliseconds (default: 5 minutes)
 */
export function setCache(key, value, expiryMs = DEFAULT_EXPIRY_MS) {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const expiry = Date.now() + expiryMs;
    
    const cacheData = {
      value,
      expiry,
      cachedAt: Date.now(),
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (err) {
    // Cache failures are non-critical
    console.warn("Cache write error (non-critical):", err.message);
  }
}

/**
 * Check if valid cache exists
 * @param {string} key - Cache key
 * @returns {boolean} True if valid cache exists
 */
export function hasValidCache(key) {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return false;
    }

    const { expiry } = JSON.parse(cached);
    
    if (expiry && Date.now() > expiry) {
      localStorage.removeItem(cacheKey);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Clear cached value
 * @param {string} key - Cache key
 */
export function clearCache(key) {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    localStorage.removeItem(cacheKey);
  } catch (err) {
    console.warn("Cache clear error (non-critical):", err.message);
  }
}

/**
 * Clear all cache entries
 */
export function clearAllCache() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.warn("Cache clear all error (non-critical):", err.message);
  }
}

/**
 * Get cache statistics
 * @returns {object} Cache stats
 */
export function getCacheStats() {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    
    let validCount = 0;
    let expiredCount = 0;
    
    cacheKeys.forEach((key) => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const { expiry } = JSON.parse(cached);
          if (expiry && Date.now() > expiry) {
            expiredCount++;
          } else {
            validCount++;
          }
        }
      } catch {
        expiredCount++;
      }
    });

    return {
      total: cacheKeys.length,
      valid: validCount,
      expired: expiredCount,
    };
  } catch {
    return { total: 0, valid: 0, expired: 0 };
  }
}

