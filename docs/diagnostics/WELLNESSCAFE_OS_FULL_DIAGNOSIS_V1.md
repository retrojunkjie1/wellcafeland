# WellnessCafe OS Full Diagnosis (v1)

**Date:** 2025-02-07  
**Scope:** Full product + engineering diagnosis  
**Stack:** React 19 + Vite 7 + Firebase (Auth, Firestore, Functions)

---

## A) System Map

### Key Apps / Pages / Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | ChatPage | Main chat home (WelcomeScreen when empty) |
| `/chat` | ChatPage | Same as `/` |
| `/home` | HomePage | Legacy home with 4 action cards + quick links |
| `/explore` | ExplorePage | Tools, recovery, learning paths |
| `/assistance` | AssistanceHubPage | Real-world help hub |
| `/workspace/real-help` | RealHelpWorkspace | Find Real Help — housing, funding, programs |
| `/resources` | ResourcesListPage | Firestore resources list |
| `/resources/:id` | ResourcesDetailPage | Resource detail (external "Visit site" link) |
| `/tools` | ToolsPageCinematic | Tools landing |
| `/tools/:toolId` | ToolDetailPage | Individual tool |
| `/guide` | GuidePage | Wellness Guide chat |
| `/dashboard` | DashboardPage | Signals, moments, insights |
| `/profile` | ProfilePage | User profile, settings |
| `/login`, `/signup` | LoginPage, SignupPage | Auth |
| `/admin/*` | AdminPage, OverseerConsolePage | Admin console |

### Key Services / Modules

| Module | Path | Purpose |
|--------|------|---------|
| Firebase | `src/firebase.js` | Auth, Firestore, Functions init; emulator wiring |
| Firebase config | `src/config/firebaseConfig.js` | Single source for project ID (wellnesscafelanding) |
| Functions URL | `src/lib/functionsUrl.js` | Resolves aiSession/globalResourceSearch base URL |
| ensureDevAuth | `src/dev/ensureAuth.js` | DEV: anonymous sign-in for emulator |
| aiClient | `src/services/aiClient.js` | callAI(), retries, correlation IDs, error handling |
| directorySearch | `src/services/directorySearch.js` | searchDirectory() → globalResourceSearch → Firestore/curated fallback |
| resourceSearch | `src/services/resourceSearch.js` | searchResources() for RealHelp |
| decisionEngine | `src/services/decisionEngine.js` | determineGuideResponse() → emotion, spirit, forecast |
| recoveryForecast | `src/services/recoveryForecast.js` | forecastRecoveryRisk() → recommendedIntervention |
| emotionalAnalysis | `src/services/emotionalAnalysis.js` | analyzeEmotionalState(), analyzeMessageEmotion() |
| phrasingEngine | `src/core/system/phrasingEngine.js` | getPhrasingStyle(), buildAssistantResponse() |
| toolRouter | `src/utils/toolRouter.js` | normalizeModeToToolId(), validateToolId(), getToolRoute() |
| linkPreview | `src/lib/linkPreview.js` | fetchLinkPreview() for metadata |
| directoryCuratedFallback | `src/lib/directoryCuratedFallback.js` | CURATED_BY_DOMAIN when API fails |

### Source of Truth

| Domain | Source |
|--------|--------|
| **Auth** | Firebase Auth (`auth` from `src/firebase.js`); AuthContext wraps app |
| **Resources** | Firestore `resources` collection; `src/data/resources.js` (listResources, getResource) |
| **Chat** | useOSStore (messages, addMessage, injectToolIntoChat); ChatPanel orchestrates |
| **Tools** | `src/apps/tools/toolsRegistry.js` + `src/utils/toolRouter.js` |
| **Directory search** | `globalResourceSearch` Cloud Function → RapidAPI → Firestore → curated fallback |

---

## B) Findings (by Severity)

### Critical

#### C1. Functions URL in DEV without emulators points to localhost:5001
- **Symptom:** In DEV with `VITE_USE_EMULATORS` unset, `resolveFunctionsBaseUrl()` returns `http://${hostname}:5001/...`. If emulators aren't running, requests fail or hit nothing.
- **Root cause:** `src/lib/functionsUrl.js` lines 15–18: DEV fallback uses hostname:5001 regardless of emulator state.
- **Files:** `src/lib/functionsUrl.js`
- **Reproduce:** Set `VITE_USE_EMULATORS` to empty, run `npm run dev`, send chat message. Functions call goes to localhost:5001.
- **Good:** When `VITE_USE_EMULATORS !== "true"`, use production URL or fail explicitly. Add guard: if DEV + emulators not confirmed running, warn or hard-fail.

#### C2. Firestore rules: only `resources` has explicit rules; other collections default-deny
- **Symptom:** Any collection other than `resources` (e.g. `telemetry`, `sessionTemplates`, `users`) is denied. Admin/function writes may fail.
- **Root cause:** `firestore.rules` line 19: `match /{document=**} { allow read,write: if false; }`
- **Files:** `firestore.rules`
- **Reproduce:** Deploy rules, attempt Firestore write from function to `telemetry` or `sessions`.
- **Good:** Add rules for collections used by functions (telemetry, sessions, users, etc.) with appropriate conditions.

#### C3. ResourcesDetailPage "Visit site" ejects user out of app
- **Symptom:** User clicks "Visit site" → `target="_blank"` → leaves app.
- **Root cause:** `src/apps/resources/ResourcesDetailPage.jsx` lines 122–131: raw `<a href={url} target="_blank">`.
- **Files:** `src/apps/resources/ResourcesDetailPage.jsx`
- **Reproduce:** Open any resource detail, click "Visit site".
- **Good:** Use InAppWebView modal (like RealHelpWorkspace) or LinkPreviewCard pattern; explicit "Open in new tab" as secondary action.

### High

#### H1. Chat tone repetition: phrasing engine prepends fixed openers
- **Symptom:** Assistant often starts with "Let's take this one moment at a time." or "Let's slow it down for a second."
- **Root cause:** `buildAssistantResponse()` in `src/core/system/phrasingEngine.js` prepends `phrasingStyle.opener` to every response. Openers are fixed per tone (grounded, clinical, warm).
- **Files:** `src/core/system/phrasingEngine.js`, `src/components/os/ChatPanel.jsx` (lines 467–471)
- **Reproduce:** Send several messages; observe repeated openings.
- **Good:** Rotate openers, or omit opener when model already starts well. System prompt in aiBrain already says "Vary your openings" but client-side prepending overrides it.

#### H2. Tool suggestion fires on "any discomfort" — recoveryForecast is broad
- **Symptom:** Mentioning "anxious", "overwhelmed", "can't handle" triggers recommendedIntervention (breathing/grounding) even for mild distress.
- **Root cause:** `src/services/recoveryForecast.js` lines 70–119: single keyword match (e.g. "anxious", "too much") sets recommendedIntervention and riskLevel.
- **Files:** `src/services/recoveryForecast.js`, `src/components/os/ChatPanel.jsx` (lines 554–605)
- **Reproduce:** Send "I'm a bit anxious about work" → decision engine recommends breathing → suggestion card may appear (if opt-in + cooldown).
- **Good:** Require higher confidence (e.g. intensity ≥ 4, or multiple cues). Reserve tool suggestion for explicit risk (relapse-risk, warning with high intensity).

#### H3. wc_calming_tools_opt_in never exposed in UI
- **Symptom:** Tool suggestion cards are gated by `localStorage.getItem("wc_calming_tools_opt_in") === "1"`, but users cannot set this.
- **Root cause:** Opt-in is only set in ProfilePage (`CALMING_OPT_IN_KEY`); no visible toggle or onboarding.
- **Files:** `src/apps/profile/ProfilePage.jsx`, `src/components/os/ChatPanel.jsx` (line 584)
- **Reproduce:** Receive a suggestion-worthy response; no suggestion appears because opt-in is off by default and there's no UI to turn it on.
- **Good:** Add "Suggest calming tools when relevant" toggle in Profile/Settings, or remove opt-in and rely on cooldown + soft chips only.

#### H4. DirectoryResultBlock "Visit site" ejects user
- **Symptom:** Chat directory results show ExternalLink icon that opens `target="_blank"`.
- **Root cause:** `src/components/os/DirectoryResultBlock.jsx` lines 99–110: `<a href={href} target="_blank">`.
- **Files:** `src/components/os/DirectoryResultBlock.jsx`
- **Reproduce:** Trigger directory search in chat, click external link on a result.
- **Good:** Use InAppWebView or LinkPreviewCard; keep "Open in new tab" as secondary.

#### H5. VerifiedDestinations fallback: direct href when onOpenLink missing
- **Symptom:** When `onOpenLink` is not passed, "View national resources" uses `<a href="https://findtreatment.gov" target="_blank">` — ejects user.
- **Root cause:** `src/components/realhelp/VerifiedDestinations.jsx` lines 104–112: conditional `onOpenLink` vs raw `<a>`.
- **Files:** `src/components/realhelp/VerifiedDestinations.jsx`
- **Good:** Always use InAppWebView pattern; require `onOpenLink` or use a shared link handler.

### Medium

#### M1. HomePage at /home duplicates value; root (/) is ChatPage
- **Symptom:** Two "home" experiences: `/` = chat welcome, `/home` = action cards. Nav "Home" goes to `/` (chat). HomePage is under Assistance tab via workspace.
- **Root cause:** Route design: `/home` exists but bottom nav "Home" points to `/`.
- **Files:** `src/App.jsx`, `src/layouts/OSLayout.jsx`
- **Reproduce:** Navigate to `/home` vs `/`; observe different UIs.
- **Good:** Clarify IA: either merge HomePage into chat welcome, or make "Home" tab go to `/home` and keep chat under a different tab.

#### M2. RealHelpWorkspace: long "What to expect" and narrative blocks
- **Symptom:** WhatToExpectAccordion expands to 4 paragraphs; VerifiedDestinations has "Staff-reviewed resources" and search UX that can feel heavy.
- **Root cause:** `src/apps/workspace/RealHelpWorkspace.jsx` WhatToExpectAccordion (lines 20–41); VerifiedDestinations copy.
- **Files:** `src/apps/workspace/RealHelpWorkspace.jsx`, `src/components/realhelp/VerifiedDestinations.jsx`
- **Reproduce:** Open Real Help, expand "What to expect".
- **Good:** Shorten to bullets; "Read more" for details. Keep page action-first: search + filters + results.

#### M3. Directory search: no minimum query length in UI; API requires query
- **Symptom:** `searchDirectory` returns "Query is required" for empty query, but RealHelpWorkspace allows search with empty query (loads curated only).
- **Root cause:** `directorySearch.js` line 182: `if (!query || !String(query).trim())` returns error. RealHelpWorkspace uses `q.length >= MIN_QUERY_LEN` (3) for API call but still loads curated when query is short.
- **Files:** `src/services/directorySearch.js`, `src/apps/workspace/RealHelpWorkspace.jsx`
- **Reproduce:** RealHelp with empty query works (curated). Direct directorySearch with empty query fails.
- **Good:** Align behavior: allow empty query for curated-only load; document when API is vs isn't called.

#### M4. aiBrain system message and client phrasing can conflict
- **Symptom:** System says "Vary your openings" but client prepends a fixed opener via buildAssistantResponse.
- **Root cause:** `functions/aiBrain.js` line 150–152: system message. ChatPanel applies phrasing post-response (line 467).
- **Files:** `functions/aiBrain.js`, `src/core/system/phrasingEngine.js`, `src/components/os/ChatPanel.jsx`
- **Reproduce:** Compare raw model output vs displayed message.
- **Good:** Either (a) let model handle variation and remove client opener prepending, or (b) pass opener instructions in system/context and let model vary within that.

#### M5. InAppWebView iframe: X-Frame-Options can block many sites
- **Symptom:** Many external sites (e.g. findtreatment.gov) set X-Frame-Options: DENY or SAMEORIGIN; iframe shows blank or error.
- **Root cause:** `src/components/InAppWebView.jsx` uses `<iframe src={url}>` with no fallback.
- **Files:** `src/components/InAppWebView.jsx`
- **Reproduce:** Open a resource that forbids framing.
- **Good:** Try iframe; on load error or blank, show metadata (fetchLinkPreview) + "Open in new tab" button.

### Low

#### L1. HomePage uses "Talk to your Wellness Guide" but nav Home goes to chat
- **Symptom:** HomePage button says "Talk to your Wellness Guide" and navigates to `/guide`; main Home tab goes to `/` (ChatPage). Potential confusion.
- **Files:** `src/apps/core/HomePage.jsx`, `src/layouts/OSLayout.jsx`
- **Good:** Align naming: "Wellness Guide" vs "Chat" vs "Home".

#### L2. ResourcesListPage uses raw external link
- **Symptom:** `href={normalizeExternalUrl(r.contact.url)}` with target="_blank" in list view.
- **Files:** `src/apps/resources/ResourcesListPage.jsx` line 174
- **Good:** Use InAppWebView or preview pattern for consistency.

#### L3. SupportSearchModule, DirectoryWorkspace, DirectoryDetailWorkspace: external links
- **Symptom:** Various "Visit site" / external links open in new tab.
- **Files:** `src/components/interaction/modules/SupportSearchModule.jsx`, `src/apps/directory/DirectoryWorkspace.jsx`, `src/apps/directory/DirectoryDetailWorkspace.jsx`
- **Good:** Standardize on in-app preview where possible.

#### L4. ErrorBoundary shows "Something went wrong" — acceptable but generic
- **Symptom:** No correlation ID or recovery hint in fallback UI.
- **Files:** `src/components/ErrorBoundary.jsx`
- **Good:** Add "Copy error ID" or support link when showDetails is true.

---

## C) Deep Dives

### 1) Chat Tone + Repetition

**Where the repeated opening comes from**

1. **System message** (`functions/aiBrain.js` lines 149–152):
   ```
   "You are WellnessCafe OS. Be concise. Short paragraphs. No repetitive empathy boilerplate. 
   Vary your openings—avoid starting with the same phrase twice. Ask at most one clarifying question when needed. 
   Never push tools unless the user explicitly asks."
   ```
   The model is instructed to vary, but the next step overrides that.

2. **Client-side wrapper** (`src/core/system/phrasingEngine.js`):
   - `getPhrasingStyle(toneProfile)` returns fixed openers per tone, e.g.:
     - grounded: "Let's take this one moment at a time."
     - clinical: "I hear you clearly."
     - default: "Let's slow it down for a second."
   - `buildAssistantResponse(baseText, phrasingStyle)` prepends `opener` + `softener` + baseText + `closer`.

3. **ChatPanel** (`src/components/os/ChatPanel.jsx` lines 464–471):
   ```javascript
   if (currentPhrasingStyle && processedText) {
     processedText = buildAssistantResponse(processedText, currentPhrasingStyle);
   }
   ```

**Root cause:** Client prepending forces a script. The model may already start well; we add a fixed opener on top.

**Tone system recommendation**

- **Option A (minimal):** Stop prepending opener in `buildAssistantResponse` when the model output already starts with a natural opener (e.g. first 50 chars don't look like a fragment).
- **Option B (richer):** Maintain a small pool of openers per tone; randomly choose one and only prepend when the model output is short or fragment-like.
- **Option C:** Move opener instruction into the system message and remove client prepending entirely. Add to context: "Start with a brief, varied acknowledgment (e.g. one of: I hear you. / Let's slow down. / I'm here.). Then respond concisely."

**Files to change**

- `src/core/system/phrasingEngine.js`: Change `buildAssistantResponse` to conditionally prepend or not.
- `src/components/os/ChatPanel.jsx`: Optionally pass a flag to skip phrasing for certain response types.
- `functions/aiBrain.js`: Strengthen system message with explicit opener examples and "one crisp question" rule.

---

### 2) Tool Popups (Breathing / Urge / Grounding)

**Trigger logic**

1. **recoveryForecast.js** (lines 70–119): Keyword-based. Examples:
   - "panic", "anxious" → breathing
   - "craving", "tempted" → urge-surfing
   - "overwhelm", "too much", "can't handle" → grounding
   - "numb", "disconnected" → grounding
   Single match can set `recommendedIntervention`.

2. **decisionEngine.js** (lines 36–43): Uses `forecast.recommendedIntervention` as intent.

3. **ChatPanel.jsx** (lines 554–605):
   - `directToolRequest`: user explicitly asks (e.g. "help me breathe") → inject immediately.
   - Server/decision suggestion: never auto-open. Only show inline suggestion if `wc_calming_tools_opt_in === "1"` AND cooldown (10 min) passed.

**Why it feels like "any discomfort"**

- recoveryForecast uses broad keywords ("anxious", "overwhelmed", "can't handle") with no intensity gate.
- emotionalAnalysis can set intensity 2–3 for a single keyword; recoveryForecast doesn't require high intensity.

**Recommended policy**

1. **Tools are user-invoked by default** — already true for auto-open.
2. **Soft suggestion chips only, no modal** — already true; we use inline recommendation card.
3. **Cooldown** — already 10 min via `wc_calming_last_suggested_at`.
4. **"Never show again" toggle** — add in Profile/Settings; store in localStorage.
5. **Escalate to modal only for explicit risk** — e.g. `riskLevel === "relapse-risk"` or crisis phrases. Today we show crisis banner (988) but don't auto-open tools.

**Define "explicit risk"**

- `forecast.riskLevel === "relapse-risk"` with `recommendedIntervention`
- `detectRiskPhrases(text)` true (crisis)
- For crisis: keep current 988 banner; do not auto-open tools.

**Files to edit**

- `src/services/recoveryForecast.js`: Add intensity/confidence threshold; require multiple cues or intensity ≥ 4 for non-crisis suggestions.
- `src/components/os/ChatPanel.jsx`: Add "Never suggest tools" option; respect it in the suggestion branch.
- `src/apps/profile/ProfilePage.jsx`: Expose "Suggest calming tools when relevant" and "Never suggest tools" toggles.

---

### 3) RealHelp Page Copy + Placeholder Cleanup

**Placeholder / long blocks**

1. **WhatToExpectAccordion** (`RealHelpWorkspace.jsx` lines 20–41): 4 paragraphs (Right now, Next week, Next month, Ongoing) + 988 note.
2. **VerifiedDestinations** (`VerifiedDestinations.jsx`): "Verified Destinations Near You", "Staff-reviewed resources", tag filters, provider dropdown.
3. **Empty state** (lines 339–367): "No results yet" with two buttons.
4. **Crisis bar** (lines 213–222): Compact, acceptable.

**Recommendations**

- **What to expect:** Shorten to 3–4 bullets. Add "Read more" that expands to full timeline.
- **VerifiedDestinations:** Reduce to one line: "Staff-reviewed resources." Collapse tag filters by default.
- **Empty state:** Keep as is; it's action-oriented.
- **Overall:** Lead with search + filters + results; keep narrative minimal.

**Files**

- `src/apps/workspace/RealHelpWorkspace.jsx`
- `src/components/realhelp/VerifiedDestinations.jsx`

---

### 4) In-App Link Preview (No Eject)

**Outbound links and "Visit site"**

| Location | Behavior |
|----------|----------|
| RealHelpWorkspace | InAppWebView via `setWebViewUrl` for VerifiedDestinations |
| ResourcesDetailPage | `<a target="_blank">` Visit site |
| ResourcesListPage | `<a target="_blank">` on contact URL |
| DirectoryResultBlock | `<a target="_blank">` ExternalLink icon |
| VerifiedDestinations | `onOpenLink` → InAppWebView, else `<a target="_blank">` |
| LinkPreviewCard | Uses InAppWebView |
| SupportSearchModule | `<a target="_blank">` |
| DirectoryWorkspace, DirectoryDetailWorkspace | `<a target="_blank">` |

**Recommended pattern**

1. **Primary:** Open InAppWebView modal (iframe) with title + "Open in new tab" button.
2. **Fallback:** If iframe fails (X-Frame-Options, CSP) or loads blank:
   - Call `fetchLinkPreview(url)` for metadata.
   - Show a preview card: title, description, domain, image if available.
   - Button: "Open in new tab" (`target="_blank"`).

**Implementation**

- Add `useInAppLink(url, title)` hook or shared handler that:
  - Opens InAppWebView.
  - Listens for iframe load/error; on failure, fetches preview and shows fallback card.
- Replace raw `<a target="_blank">` with a button/link that calls this handler in:
  - `ResourcesDetailPage.jsx`
  - `ResourcesListPage.jsx`
  - `DirectoryResultBlock.jsx`
  - `VerifiedDestinations.jsx` (when onOpenLink absent)
  - `SupportSearchModule.jsx`
  - `DirectoryWorkspace.jsx`, `DirectoryDetailWorkspace.jsx`

**Files**

- `src/components/InAppWebView.jsx` — add fallback UI
- `src/lib/linkPreview.js` — already has fetchLinkPreview
- All components listed above

---

### 5) Directory Search Reliability

**Fallback chain**

1. **API:** `POST /globalResourceSearch` (RapidAPI-backed).
2. **On 4xx/5xx or rate limit:** `firestoreFallback()` — listResources with type/tag.
3. **If Firestore empty:** `getCuratedFallback(domain, query)` — CURATED_BY_DOMAIN.

**Why results can be irrelevant**

- **Category mapping:** Client sends `domain` (housing, grants, assistance, programs). Backend/API may map differently.
- **Query normalization:** No stemming or synonym expansion; raw substring match in Firestore fallback.
- **Tag/type mismatch:** Firestore uses `type`, `tags`; API uses different schema. `normalizeResult` tries to unify.

**Improvements (no new packages)**

1. **Debounced search** — RealHelpWorkspace already uses 450ms.
2. **Minimum query length** — RealHelpWorkspace uses 3 chars for API; keep.
3. **Request cancellation** — AbortController used in RealHelpWorkspace and directorySearch.
4. **Caching per query** — directorySearch has 10s TTL client cache.
5. **Category-specific shaping:** For housing, append "sober living" or "recovery housing" when query is generic. For grants, append "substance use" or "mental health" when relevant.

**Files**

- `src/services/directorySearch.js` — optional query shaping
- `src/apps/workspace/RealHelpWorkspace.jsx` — ensure abort and debounce are correct
- `functions/` (globalResourceSearch) — if accessible, improve category/query mapping

---

### 6) Firebase / Emulators & Safety

**Emulator gating**

- `src/firebase.js` (lines 28–32): When `DEV` and `VITE_USE_EMULATORS === "true"`, connects Auth (9099), Firestore (8080), Functions (5001) to localhost.
- `src/lib/functionsUrl.js`: When `VITE_USE_EMULATORS === "true"`, uses `hostname:5001`. Otherwise in DEV uses `hostname:5001` (problematic when emulators off).
- `src/dev/ensureAuth.js`: Only runs when `VITE_USE_EMULATORS === "true"`; signs in anonymously for Firestore.

**Rules**

- `firestore.rules`: `resources` read requires `isSignedIn()`; write requires `isAdmin()`. All other collections denied.
- Auth: Required for resources. ensureDevAuth provides anonymous auth in emulator.

**Risks**

1. **DEV without emulators:** functionsUrl still points to hostname:5001; requests fail or go nowhere.
2. **Auth emulator not started:** ensureDevAuth fails; ResourcesDetailPage shows "Auth emulator not ready."
3. **Production:** aiClient hard-fails if URL contains localhost in PROD.

**Recommendations**

1. **Guard:** When `VITE_USE_EMULATORS === "true"`, add a startup check that Auth emulator is reachable (e.g. fetch auth emulator health). If not, show banner or block.
2. **functionsUrl:** When `VITE_USE_EMULATORS !== "true"` in DEV, use production URL (or explicit env) instead of hostname:5001.
3. **Firestore rules:** Add rules for `telemetry`, `sessions`, `users`, `sessionTemplates` as used by functions.

**Files**

- `src/lib/functionsUrl.js`
- `src/main.jsx` or a bootstrap module
- `firestore.rules`

---

## D) Fix Plan (Phased)

### Phase 0: Quick Wins (1–2 days)

| Task | Files | Steps | Acceptance |
|------|-------|-------|------------|
| Remove or shorten phrasing opener prepending | `phrasingEngine.js` | In `buildAssistantResponse`, only prepend opener when baseText is very short (< 40 chars) or looks like a fragment | No repeated "Let's take this one moment at a time" on normal replies |
| Add "Never suggest tools" toggle | ProfilePage.jsx, ChatPanel.jsx | Add localStorage key `wc_calming_tools_never`; when set, skip suggestion branch | Toggle off → no suggestion cards |
| Back button consistency | PageHeader, OSLayout | Audit `showBack` and `backTo`; ensure predictable behavior | Back goes to previous or canonical parent |
| ResourcesDetailPage in-app preview | ResourcesDetailPage.jsx | Replace "Visit site" with button that opens InAppWebView | Clicking opens modal, not new tab |

### Phase 1: Core UX Integrity (3–5 days)

| Task | Files | Steps | Acceptance |
|------|-------|-------|------------|
| Chat tone system | phrasingEngine.js, aiBrain.js, ChatPanel.jsx | Implement opener rotation or removal; strengthen system message | Varied openings; one crisp question; no filler |
| Tool policy | recoveryForecast.js, ChatPanel.jsx | Add intensity threshold; expose opt-in/never in Profile | Suggestions only for higher distress; user control |
| In-app preview everywhere | InAppWebView.jsx, Resources*, Directory*, VerifiedDestinations, SupportSearchModule | Use shared handler; fallback to metadata + "Open in new tab" | No eject on first click; explicit "Open in new tab" when needed |
| RealHelp copy cleanup | RealHelpWorkspace.jsx, VerifiedDestinations.jsx | Shorten What to expect; collapse VerifiedDestinations copy | Action-first; minimal narrative |

### Phase 2: Data Integrity (2–3 days)

| Task | Files | Steps | Acceptance |
|------|-------|-------|------------|
| Directory category mapping | directorySearch.js, functions | Document and align domain/category; add query shaping for housing/grants | Relevant results for "housing" and "grants" |
| Verified semantics | directorySearch.js, RealHelpWorkspace | Clarify "verified" = staff-reviewed vs official source; show badge consistently | Clear meaning of Verified badge |
| Firestore rules | firestore.rules | Add rules for telemetry, sessions, users, sessionTemplates | Functions can write; clients only where intended |

### Phase 3: Hardening (2–4 days)

| Task | Files | Steps | Acceptance |
|------|-------|-------|------------|
| Emulator guard | functionsUrl.js, main.jsx | When VITE_USE_EMULATORS=true, verify auth emulator; else use prod URL in DEV | No silent failure; clear error if emulators expected but down |
| Error handling | aiClient.js, ErrorBoundary.jsx | Ensure all user-facing errors are calm; add correlation ID to boundary | No scary stack traces; "Tap Retry" or similar |
| Performance | Bundle analysis | Lazy-load heavy routes; check for unnecessary rerenders | Initial load < 3s; no obvious jank |
| Security | firestore.rules, aiBrain.js | Review rules; ensure no PHI in logs | Rules deny by default; logs free of PII |

---

## Appendix: File Reference

| Area | Key Files |
|------|-----------|
| Routing | `src/App.jsx`, `src/layouts/OSLayout.jsx` |
| Chat | `src/components/os/ChatPanel.jsx`, `src/apps/chat/ChatPage.jsx` |
| Welcome | `src/components/os/WelcomeScreen.jsx`, `src/apps/home/components/PrimaryPathways.jsx` |
| Tools | `src/utils/toolRouter.js`, `src/stores/useOSStore.js` (injectToolIntoChat) |
| AI | `src/services/aiClient.js`, `functions/aiBrain.js` |
| Decision | `src/services/decisionEngine.js`, `src/services/recoveryForecast.js`, `src/services/emotionalAnalysis.js` |
| Phrasing | `src/core/system/phrasingEngine.js`, `src/core/system/toneEngine.js` |
| Directory | `src/services/directorySearch.js`, `src/lib/directoryCuratedFallback.js` |
| RealHelp | `src/apps/workspace/RealHelpWorkspace.jsx`, `src/components/realhelp/VerifiedDestinations.jsx` |
| Links | `src/components/InAppWebView.jsx`, `src/components/LinkPreviewCard.jsx`, `src/lib/linkPreview.js` |
| Firebase | `src/firebase.js`, `src/config/firebaseConfig.js`, `src/lib/functionsUrl.js`, `firestore.rules` |
| Auth | `src/context/AuthContext.jsx`, `src/dev/ensureAuth.js` |
