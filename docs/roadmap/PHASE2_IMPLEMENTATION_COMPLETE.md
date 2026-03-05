# Phase 2 Implementation — Complete

**Status:** ✅ All phases implemented  
**Constraints:** Zero new packages, emulator-safe, Prompt-Native Spine intact

---

## Files Changed

### Phase 2A — globalResourceSearch stability
| File | Changes |
|------|---------|
| `functions/src/globalResourceSearch.js` | A1: 30s TTL cache + in-flight coalescing; A2: min query 3; A3: token bucket 10/30s per fingerprint; A4: 403 → PROVIDER_NOT_SUBSCRIBED; A5: 9s timeout, 1 retry for 429/timeout |
| `src/services/directorySearch.js` | `PROVIDER_NOT_SUBSCRIBED` in NO_RETRY_CODES; calm fallback to Firestore/curated |

### Phase 2B — Frontend search behavior
| File | Changes |
|------|---------|
| `src/apps/workspace/RealHelpWorkspace.jsx` | 600ms debounce; MIN_QUERY_LEN 3; AbortController; requestId for stale responses |
| `src/apps/directory/DirectoryWorkspace.jsx` | 600ms debounce; MIN_QUERY_LEN 3; AbortController; handleSearch validates before API |
| `src/services/directorySearch.js` | Accepts `signal` (AbortSignal) for cancellation |

### Phase 2C — Chat tone
| File | Changes |
|------|---------|
| `src/core/system/phrasingEngine.js` | Opener only when baseText < 40 chars; rotation pool (3 variants) |
| `src/components/os/WelcomeScreen.jsx` | Short copy: 1 headline + 1 supporting line + action buttons |
| `src/apps/core/HomePage.jsx` | Phase 2E overhaul (see below) |

### Phase 2D — Navigation + Back
| File | Changes |
|------|---------|
| `src/lib/useSmartBack.js` | **NEW** — `navigate(-1)` if history.length > 1, else `navigate(fallbackRoute)` |
| `src/components/navigation/PageHeader.jsx` | Uses `useSmartBack(backTo \|\| "/home")` |
| `src/apps/directory/DirectoryDetailWorkspace.jsx` | Back button uses `useSmartBack(\`/directory/${domain}\`)` |
| `src/apps/workspace/RealHelpWorkspace.jsx` | `showBack` + `backTo="/assistance"` |
| `src/apps/resources/ResourcesDetailPage.jsx` | Already had `backTo="/resources"` |

### Phase 2E — Home page overhaul
| File | Changes |
|------|---------|
| `src/apps/core/HomePage.jsx` | 1) Primary Pathways (3 tiles): Talk, Find Real Help, Tools; 2) Stabilizers (collapsible): Breathing, Grounding, Sleep; 3) Real-world: Housing, Treatment, Funding, Hotlines; 4) Progress: streak, last session, resources |

---

## Verification Steps

1. **Start emulators:**
   ```bash
   firebase emulators:start --only functions,firestore,auth
   ```

2. **Run app:**
   ```bash
   VITE_USE_EMULATORS=true npm run dev
   ```

3. **Confirm:**
   - [ ] Typing "treatment center near me" in RealHelp → ≤ 2–3 API calls (600ms debounce, min 3 chars)
   - [ ] 403 "not subscribed" → UI falls back to Firestore/curated, no scary errors
   - [ ] Chat responses → no repeated opener for longer replies
   - [ ] Back button → Resources detail, Directory detail, RealHelp → predictable
   - [ ] Home page → premium layout, 3 primary tiles, collapsible stabilizers

---

## Acceptance Checklist

| Phase | Requirement | Status |
|-------|-------------|--------|
| 2A | Cache 30s TTL, in-flight coalescing | ✅ |
| 2A | Min query 3, no external API for shorter | ✅ |
| 2A | Rate limit 10/30s per fingerprint | ✅ |
| 2A | 403 → PROVIDER_NOT_SUBSCRIBED, meta.fallback | ✅ |
| 2A | 8–10s timeout, 1 retry for 429/timeout | ✅ |
| 2B | 600ms debounce | ✅ |
| 2B | Search only when query ≥ 3 or Enter | ✅ |
| 2B | AbortController cancels prior request | ✅ |
| 2B | requestId ignores stale responses | ✅ |
| 2C | Opener only when text < 40 chars | ✅ |
| 2C | Short luxury microcopy on Welcome/Home | ✅ |
| 2D | useSmartBack hook | ✅ |
| 2D | PageHeader uses useSmartBack | ✅ |
| 2D | Detail pages have fallback routes | ✅ |
| 2E | 3 primary tiles, stabilizers, real-world, progress | ✅ |

---

## Key Implementation Details

### globalResourceSearch (2A)
- Cache key: `JSON.stringify({query,domain,category,region,limit,offset})`
- Rate limit: in-memory map, 10 req/30s per `ip|user-agent` hash
- 403 "not subscribed" → circuit open 10 min, return `PROVIDER_NOT_SUBSCRIBED`
- Log once per minute max for 403/429 to avoid noisy logs

### useSmartBack (2D)
```javascript
if (window.history.length > 1) navigate(-1);
else navigate(fallbackRoute);
```

### phrasingEngine (2C)
- Opener prepended only when `baseText.trim().length < 40`
- Rotation pool: "I'm here with you.", "Let's take this one moment at a time.", "I hear you."
