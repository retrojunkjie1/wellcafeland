// src/lib/searchEngine.js
// Smart search engine with typo correction and fuzzy matching

import { SUPPORT_RESOURCES } from "./supportDatabase";

// Levenshtein distance for typo correction
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

// Calculate similarity score (0-1, higher is better)
function similarity(str1, str2) {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLen;
}

// Tokenize and normalize search query
function tokenize(query) {
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

// Find best matching word from dictionary
function findBestMatch(word, dictionary, threshold = 0.6) {
  let bestMatch = word;
  let bestScore = 0;

  for (const dictWord of dictionary) {
    const score = similarity(word, dictWord);
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = dictWord;
    }
  }

  return { word: bestMatch, score: bestScore, corrected: bestMatch !== word };
}

// Build searchable text dictionary from resources
function buildDictionary() {
  const dictionary = new Set();
  SUPPORT_RESOURCES.forEach((resource) => {
    // Add name words
    resource.name
      .toLowerCase()
      .split(/\s+/)
      .forEach((word) => dictionary.add(word));
    // Add type words
    resource.type
      .toLowerCase()
      .split(/\s+/)
      .forEach((word) => dictionary.add(word));
    // Add category
    dictionary.add(resource.category);
    // Add tags
    resource.tags.forEach((tag) => {
      tag.split(/\s+/).forEach((word) => dictionary.add(word));
    });
  });
  return Array.from(dictionary);
}

// Auto-correct query with typo correction
export function autoCorrectQuery(query) {
  if (!query || query.trim().length === 0) return query;

  const dictionary = buildDictionary();
  const tokens = tokenize(query);
  const correctedTokens = [];
  let wasCorrected = false;

  for (const token of tokens) {
    // Skip very short tokens
    if (token.length < 3) {
      correctedTokens.push(token);
      continue;
    }

    const match = findBestMatch(token, dictionary, 0.6);
    correctedTokens.push(match.word);
    if (match.corrected) {
      wasCorrected = true;
    }
  }

  const correctedQuery = correctedTokens.join(" ");
  return {
    original: query,
    corrected: correctedQuery,
    wasCorrected,
  };
}

// Score resource relevance
function scoreResource(resource, queryTokens, correctedTokens) {
  let score = 0;
  const searchText = `${resource.name} ${resource.type} ${resource.category} ${resource.description} ${resource.tags.join(" ")}`.toLowerCase();

  // Exact matches get highest score
  queryTokens.forEach((token) => {
    if (searchText.includes(token)) {
      score += 10;
    }
  });

  // Corrected matches get medium score
  correctedTokens.forEach((token) => {
    if (searchText.includes(token)) {
      score += 5;
    }
  });

  // Name matches get bonus
  const nameLower = resource.name.toLowerCase();
  queryTokens.forEach((token) => {
    if (nameLower.includes(token)) {
      score += 15;
    }
  });

  // Tag matches
  resource.tags.forEach((tag) => {
    queryTokens.forEach((token) => {
      if (tag.toLowerCase().includes(token)) {
        score += 8;
      }
    });
  });

  return score;
}

// Smart search with typo correction
export function searchSupportResources(query, region, state = null) {
  if (!query || query.trim().length === 0) {
    return {
      results: [],
      correctedQuery: null,
      wasCorrected: false,
    };
  }

  // Auto-correct the query
  const correction = autoCorrectQuery(query);
  const originalTokens = tokenize(query);
  const correctedTokens = tokenize(correction.corrected);

  // Filter by region and state
  let filteredResources = SUPPORT_RESOURCES.filter((resource) => {
    if (!resource.regions.includes(region)) return false;
    if (state && state !== "all") {
      if (!resource.states.includes(state) && !resource.states.includes("all")) {
        return false;
      }
    }
    return true;
  });

  // Score and sort results
  const scoredResources = filteredResources
    .map((resource) => ({
      resource,
      score: scoreResource(resource, originalTokens, correctedTokens),
    }))
    .filter((item) => item.score > 0) // Only include relevant results
    .sort((a, b) => b.score - a.score)
    .map((item) => item.resource);

  return {
    results: scoredResources,
    correctedQuery: correction.wasCorrected ? correction.corrected : null,
    wasCorrected: correction.wasCorrected,
  };
}

// Get all resources for a region/state (no search query)
export function getResourcesByLocation(region, state = null) {
  return SUPPORT_RESOURCES.filter((resource) => {
    if (!resource.regions.includes(region)) return false;
    if (state && state !== "all") {
      if (!resource.states.includes(state) && !resource.states.includes("all")) {
        return false;
      }
    }
    return true;
  });
}

