# Prompt-Native Spine — Root Cause & Fixes

**Date:** 2025-02-22  
**Status:** ✅ Implemented

---

## 1) Root Cause: "food" Returns Nothing

### Diagnosis

**Backend (`functions/aiBrain.js`):**
- `DIRECTORY_KEYWORDS` did not include `food`, `meals`, `hunger`, `shelter`, etc.
- `evaluateDirectoryIntent("food")` → confidence 0 (no keyword matches)
- `evaluateDirectoryIntent("I need some food")` → ~0.15 (only "need (a|some)" matched) < 0.55 threshold
- Result: `dirConf < 0.55` → either clarifying message (when 0 < conf < 0.55) or generic chat (when conf = 0)
- For "food" alone: conf = 0 → falls through to `runSimpleChat` with no directory context
- `queryResourcesForContext` was never called for food; when called, it filtered by exact substring match only

**Frontend:**
- `aiClient` correctly parses `assistantText`, `intent`, `links` from envelope
- `ChatPanel` stores `intent` and `links` on messages; `IntentRenderer` is mounted
- `IntentRenderer` for `directory.search` with empty resources called `onDirectorySearch` but **ChatPanel did not pass `onDirectorySearch`** — so no navigation to RealHelp when no Firestore results

### Summary

1. **"food" not in DIRECTORY_KEYWORDS** → dirConf never reaches 0.55
2. **No domain mapping for food** → directory.search payload lacked `domain: "food.essentials"`
3. **queryResourcesForContext** did not expand food-related terms (food bank, SNAP, pantry)
4. **ChatPanel missing onDirectorySearch** → when directory.search had no resources, no "Find resources" action

---

## 2) File Edits (Precise List)

### functions/aiBrain.js

**A. Add food/shelter to directory keywords**
```javascript
// DIRECTORY_STRONG_PHRASES — add food patterns
/\b(food|meals?|something to eat|food bank|soup kitchen)\b/i,
/\bneed (a|some) (housing|grant|program|resource|treatment|food|shelter|meals?)\b/i,

// DIRECTORY_KEYWORDS — add
/\bfood\b/i, /\bmeals?\b/i, /\bhunger\b/i, /\bnutrition\b/i, /\bshelter\b/i,
/\bfood bank\b/i, /\bsoup kitchen\b/i, /\bsnap\b/i, /\bwic\b/i,
```

**B. Expand query for food matching**
```javascript
const FOOD_QUERY_EXPANSIONS = ["food", "meal", "hunger", ...];
function expandQueryForMatch(queryText) { ... }
// In queryResourcesForContext: use searchTerms for broader matching
```

**C. Add domain to directory.search payload**
```javascript
const domain = /\bfood\b|.../.test(q) ? "food.essentials" : 
  /\bhousing\b|.../.test(q) ? "housing" : ...;
intent = { type: "directory.search", payload: { query, region, domain, resources } };
```

### src/services/aiClient.js

**DEV logging**
```javascript
if (import.meta.env.DEV && typeof window !== "undefined") {
  console.debug("[AIClient] envelope", {
    correlationId: responseCorrelationId,
    intentType: intent?.type || null,
    assistantTextPreview: (assistantText || "").slice(0, 80),
  });
}
```

### src/components/os/ChatPanel.jsx

**Add onDirectorySearch to IntentRenderer**
```javascript
onDirectorySearch={({ query, region }) => {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (region) params.set("region", region);
  navigate(`/workspace/real-help?${params.toString()}`);
}}
```

### src/core/intent/IntentRenderer.jsx

**directory.search with empty resources: show button instead of auto-navigate**
```javascript
if (onDirectorySearch && q) {
  return (
    <div className="mt-3">
      <button type="button" onClick={() => onDirectorySearch({ query: q, region })} ...>
        Find resources for "{q.slice(0, 40)}…"
      </button>
    </div>
  );
}
```

**Pass domain to DirectoryResultBlock**
```javascript
const directoryData = { results: resources, domain: domain || "programs", query: q };
```

### src/services/recoveryForecast.js

**Remove broad tool triggers (Step 5)**
- Removed: `panic`/`anxious` alone → breathing
- Removed: `overwhelm`/`too much`/`can't handle` → grounding
- Removed: `dissociation`/`numb`/`disconnected` → grounding
- Removed: video/audio recommendations
- Kept: explicit craving/relapse (urge, craving, tempted, using, relapse)
- Kept: high-risk compound patterns (can't breathe, drowning, panic+confused, etc.)

---

## 3) Verification

| Test | Expected |
|------|----------|
| "I need some food" | assistantText + intent.directory.search; if resources empty, "Find resources" button |
| "start breathing with me" | intent.tool.run → breathing tool opens |
| Click "Visit site" | InAppWebView (OpenInAppButton) — already in place |
| `localStorage.setItem("wc_calming_tools_never","1")` | No tool.suggest chips |
| `npm run build` | Passes |

---

## 4) TODOs (Tight Scope)

1. **Curated food resources** — Add food bank, SNAP, WIC, soup kitchen entries to Firestore `resources` for "food" queries to return results.
2. **RealHelp food tab** — If `domain: "food.essentials"` is used, ensure RealHelp/globalResourceSearch supports it or map to `government_assistance`.
3. **generate_session response** — Still returns legacy `message.text`; aiClient falls back correctly. Consider migrating to `buildEnvelope` for consistency.

---

## 5) Envelope Contract (Reference)

```javascript
{
  ok: true,
  correlationId: string,
  assistantText: string,
  intent: { type: string, payload: object },
  links: [],
  meta: {}
}
```

- `chat.message` — render nothing extra
- `directory.search` — DirectoryResultBlock or "Find resources" button
- `tool.suggest` — chips only (respect wc_calming_tools_never)
- `tool.run` — open tool UI (only when user explicitly requests)
