// src/utils/queryOptimizer.js

/**
 * Query Optimizer
 * Provides safe, optimized Firestore query helpers
 */

/**
 * Get a safe limit for Firestore queries
 * @param {number} requested - Requested limit
 * @param {number} max - Maximum allowed limit (default: 100)
 * @returns {number} Safe limit value
 */
export function safeLimit(requested = 50, max = 100) {
  const limit = Math.max(1, Math.min(Math.floor(requested || 50), max));
  return limit;
}

/**
 * Get a safe orderBy field
 * @param {string} field - Field name to order by
 * @param {string} direction - 'asc' or 'desc' (default: 'desc')
 * @returns {object} OrderBy configuration
 */
export function safeOrderBy(field = "createdAt", direction = "desc") {
  const validField = field || "createdAt";
  const validDirection = direction === "asc" ? "asc" : "desc";
  return {
    field: validField,
    direction: validDirection,
  };
}

/**
 * Get a safe where clause
 * @param {string} field - Field name
 * @param {string} operator - Comparison operator
 * @param {any} value - Value to compare
 * @returns {object|null} Where clause or null if invalid
 */
export function safeWhere(field, operator, value) {
  if (!field || !operator || value === undefined || value === null) {
    return null;
  }
  return {
    field: String(field),
    operator: String(operator),
    value,
  };
}

/**
 * Safely map Firestore documents to data objects
 * @param {Array} docs - Firestore document array
 * @param {Function} mapper - Optional mapper function
 * @returns {Array} Mapped data array
 */
export function safeMapping(docs, mapper = null) {
  if (!Array.isArray(docs)) {
    return [];
  }
  
  const mapped = docs
    .filter((doc) => doc && doc.exists && doc.exists())
    .map((doc) => {
      try {
        const data = doc.data();
        if (!data) return null;
        
        const base = {
          id: doc.id,
          ...data,
        };
        
        return mapper ? mapper(base) : base;
      } catch (err) {
        console.warn("Document mapping error (non-critical):", err.message);
        return null;
      }
    })
    .filter((item) => item !== null);
  
  return mapped;
}

/**
 * Execute multiple queries in parallel
 * @param {Array<Promise>} queries - Array of query promises
 * @returns {Promise<Array>} Array of results
 */
export async function parallelQueries(queries) {
  try {
    const results = await Promise.all(queries);
    return results;
  } catch (err) {
    console.warn("Parallel queries error (non-critical):", err.message);
    return queries.map(() => []);
  }
}

/**
 * Get optimized query options
 * @param {object} options - Query options
 * @returns {object} Optimized query configuration
 */
export function getOptimizedQueryOptions(options = {}) {
  const {
    limit: requestedLimit = 50,
    maxLimit = 100,
    orderBy: requestedOrderBy = "createdAt",
    orderDirection = "desc",
  } = options;

  return {
    limit: safeLimit(requestedLimit, maxLimit),
    orderBy: safeOrderBy(requestedOrderBy, orderDirection),
  };
}

