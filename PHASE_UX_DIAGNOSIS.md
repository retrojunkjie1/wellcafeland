# Phase UX — Spine Diagnosis Report

**Date:** 2025-02-07  
**Status:** Inspection only (no refactor)

---

## A) HEADER/DOCK OWNERSHIP

### Top header bar (Guest / Sign in / Anonymous)

| Component | File | Renders |
|-----------|------|---------|
| **OSLayout** | `src/layouts/OSLayout.jsx` | Guest banner (lines 147–156), Top App Bar (lines 159–219) with logo, back, God-Eye, Anonymous/email badge |
| **OSPageChrome** | `src/components/nav/OSPageChrome.jsx` | Sticky page chrome (back, title, crumbs) — **hidden on root routes** |

- **OSLayout** is the single global header (Guest mode / Sign in / Anonymous).
- **ExperienceShell** does not exist (`src/system/ExperienceShell.jsx` not found).
- **OSPageChrome** is a secondary, route-dependent header; no double-header risk from ExperienceShell.

### BottomNav

- **File:** `src/layouts/OSLayout.jsx`
- **Component:** `OSLayoutInner` (lines 239–261)
- **Location:** In main layout, below `<main>`, with `pb-[env(safe-area-inset-bottom)]`

### Chat composer

- **Definition:** `src/components/system/ChatComposerBar.jsx`
- **Usage:** `src/components/os/ChatPanel.jsx` (lines 1703–1713)
- **Placement:** Inside ChatPanel scroll area, `sticky bottom-0 z-20` — **docked at bottom of chat**, not inside page scroll
- **Composer:** Inside chat panel scroll; sticky to bottom of its container

---

## B) OVERLAP ROOT CAUSES

| File | Line/Ref | Issue |
|------|----------|-------|
| `src/components/nav/OSPageChrome.jsx` | 25 | `sticky top-0 z-40` — can overlap OSLayout header when main scrolls |
| `src/components/Header.css` | 142 | `position:absolute` |
| `src/components/Navbar.css` | 11, 86 | `z-index: 1000`, `position: absolute` |
| `src/components/TopFold.css` | 5, 20 | `position: fixed`, `z-index: 1001` |
| `src/components/NavigationButtons.css` | 2, 9 | `position: fixed`, `z-index: 1000` |
| `src/components/LiveUpdateBanner.css` | 9 | `z-index: 1000` |

### Truncation / flex

- OSLayout header right cluster (lines 194–217): no `min-w-0` on flex children; long email can overflow.
- OSPageChrome title (line 41): has `min-w-0` and `truncate` — OK.
- ChatComposerBar (line 67): has `min-w-0` — OK.

### Right-side cluster

- OSLayout header right: `flex items-center gap-2` with no `flex-wrap` or `max-width`; God-Eye + Anonymous + email can overflow on narrow screens.

---

## C) VOICE ROOT CAUSES

| Item | Location | Finding |
|------|----------|---------|
| **Launch** | `src/components/os/ChatPanel.jsx:1708` | `onMic={() => navigate("/tools/voice-checkin")}` — in-app navigation |
| **Launch** | `src/apps/core/StabilizationEntryPage.jsx:69` | `onClick={() => navigate("/tools/voice-checkin")}` |
| **Launch** | `src/components/os/Sidebar.jsx:361` | `navigate("/tools/voice-checkin")` |
| **Route** | `src/App.jsx:182` | `<Route path="/tools/voice-checkin" element={<VoiceCheckIn />} />` |

- **New tab:** No `window.open` or `target="_blank"` for voice; all use `navigate()`.
- **Mic errors:** `src/apps/tools/VoiceCheckIn.jsx:80` — `alert("Microphone access denied. Please enable microphone permissions.")`.
- **getUserMedia:** `VoiceCheckIn.jsx:57` — `startRecording` calls `getUserMedia` on **user gesture** (onMouseDown/onTouchStart) — correct.

---

## D) AUTH + 401 ROOT CAUSES

### aiSession

| Item | Location |
|------|----------|
| **Client** | `src/services/aiSessionClient.js` |
| **Auth** | `waitForUser(auth)` → `user.getIdToken()` |
| **Header** | Line 51: `"Authorization": "Bearer ${idToken}"` |
| **Anon** | Uses Firebase `signInAnonymously` when no user |

- **401 causes:** Token refresh timing (getIdToken may return cached stale token), race between auth state and first request, or missing `await` on token refresh.

### globalResourceSearch

| Item | Location |
|------|----------|
| **Client** | `src/services/directorySearch.js` → `globalResourceSearch` (from `globalResourceSearchClient`) |
| **Auth** | `apiHelpers.apiFetch` for globalResourceSearch path — **no Authorization header**, only `userId` in body |
| **Backend** | May require auth; 401 if backend expects Bearer token |

- **Gap:** `globalResourceSearch` path does not attach `Authorization: Bearer`; uses `userId` only. If backend requires Firebase auth, this can cause 401.

---

## E) CSS RISK

- **`wc-breath-*` blocks:** None in `src/index.css`.
- **Brace balance:** `src/index.css` — all blocks closed.
- **Suspicious selectors:** None found.

---

## F) VERIFIER SCRIPT

**File:** `scripts/phaseUX.diagnose.mjs`  
**Script:** `npm run phaseUX:diagnose`

**Output (sample):**
```json
{
  "headerRenderLocations": ["layouts/OSLayout.jsx", "components/nav/OSPageChrome.jsx"],
  "bottomNavRenderLocations": ["layouts/OSLayout.jsx (OSLayoutInner)"],
  "composerRenderLocations": ["components/os/ChatPanel.jsx", "components/system/ChatComposerBar.jsx (def)"],
  "windowOpenCount": 0,
  "targetBlankCount": 7,
  "positionAbsoluteInHeaderFiles": 2,
  "experienceShellActive": false
}
```

---

## G) TOP 3 HIGH-LEVERAGE FIXES (in order)

1. **OSPageChrome overlap** — Adjust `sticky top-0` so it does not overlap OSLayout header (e.g. `top: 48px` or move into main with correct offset).
2. **Header right cluster overflow** — Add `min-w-0` and `flex-wrap` or `max-width` to the right-side header cluster in `OSLayout.jsx` (lines 194–217).
3. **Voice mic errors** — Replace `alert()` in `VoiceCheckIn.jsx` with an in-app error UI (e.g. toast or inline message).

---

## PACKAGE.JSON SNIPPET

```json
"phaseUX:diagnose": "node scripts/phaseUX.diagnose.mjs"
```

(Already present in `package.json`.)
