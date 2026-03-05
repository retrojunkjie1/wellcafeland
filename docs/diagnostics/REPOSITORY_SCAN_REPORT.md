# WellnessCafe OS - Repository Scan Report

## 1. ROUTES & ENTRY POINTS

### Routes Defined in `src/App.jsx`

**All routes are wrapped in `<OSLayout />` except:**
- `/preview/:token` - Standalone (SessionPreviewPage)
- `/unauthorized` - Standalone (UnauthorizedPage)

### Route Groups by Top-Level Root

#### `/` (Root/Home)
- `/` → ChatPage
- `/chat` → ChatPage
- `/home` → HomePage

#### `/explore`
- `/explore` → ExplorePage (lazy-loaded)

#### `/tools`
- `/tools` → ToolsPageCinematic
- `/tools/classic` → ToolsPageClassic
- `/tools/:toolId` → ToolDetailPage (lazy-loaded)
- `/tools/voice-journal` → VoiceJournal
- `/tools/voice-checkin` → VoiceCheckIn

#### `/recovery`
- `/recovery` → RecoveryPage

#### `/milestones`
- `/milestones` → MilestonesPage

#### `/agents`
- `/agents` → AgentsPage

#### `/dashboard`
- `/dashboard` → DashboardPage

#### `/profile`
- `/profile` → ProfilePage

#### `/settings`
- `/settings/preferences` → PreferencesPage
- `/settings/wellness` → WellnessSettingsPage
- `/settings/notifications` → NotificationsSettingsPage
- `/settings/privacy` → PrivacySettingsPage

#### `/assistance`
- `/assistance` → AssistanceHubPage
- `/assistance/request` → AssistancePage

#### `/guide` & `/living`
- `/guide` → GuidePage
- `/living` → LivingGuidePage (not routed, exists but unused)
- `/living/v3` → LivingGuidePageV3

#### `/sequence`
- `/sequence/:id` → SequencePage

#### `/workspace`
- `/workspace/:id` → WorkspacePage
- `/workspace/real-help` → RealHelpWorkspace

#### `/directory`
- `/directory` → DirectoryWorkspace
- `/directory/:domain` → DirectoryWorkspace
- `/directory/:domain/:id` → DirectoryDetailWorkspace

#### `/command`
- `/command` → CommandConsolePage

#### `/support`
- `/support` → SupportHubPage

#### `/circles` (Social)
- `/circles` → CirclesPage
- `/circles/:circleId` → CircleDetailPage
- `/circles/:circleId/threads/new` → CircleThreadCreation
- `/circles/:circleId/threads/:threadId` → CircleThreadPage

#### `/social`
- `/social/feed` → SocialFeedPage
- `/social/dm` → DirectMessagePage
- `/social/dm/:threadId` → DirectMessagePage

#### `/connections`
- `/connections/friends` → ConnectionsPage (type="friends")
- `/connections/trusted` → ConnectionsPage (type="trusted")
- `/connections/blocked` → ConnectionsPage (type="blocked")

#### `/provider` (Provider Routes - RequireRole)
- `/provider` → ProviderDashboardPage
- `/provider/dashboard` → ProviderDashboardPage
- `/provider/clients` → ProviderClientsPage
- `/provider/clients/list` → ClientListPage
- `/provider/clients/:clientId` → ClientDetailPage
- `/provider/clients/:clientId/notes/new` → ClinicalNoteEditor
- `/provider/clients/:clientId/notes/:noteId` → ClinicalNoteEditor
- `/provider/clients/:clientId/care-plan/new` → CarePlanEditor
- `/provider/clients/:clientId/care-plan/:planId` → CarePlanEditor
- `/provider/messages` → ProviderMessagesPage
- `/provider/schedule` → ProviderSchedulePage

#### `/providers` (Legacy Provider Routes - RequireAuth)
- `/providers` → ProvidersPage
- `/providers/dashboard` → ProviderDashboardPage
- `/providers/clients/:clientId` → ClientDetailPage
- `/provider/clients/:clientId/timeline` → ClientTimelinePage

#### `/sessions` (Admin - RequireAdmin)
- `/sessions/templates` → SessionsTemplatesPage
- `/sessions/templates/:id` → SessionTemplateDetailPage
- `/sessions/templates/new` → SessionComposerPage
- `/sessions/view/:id` → SessionViewerPage

#### `/admin` (Admin Routes - RequireAdmin)
- `/admin` → AdminConsolePage
- `/admin/theme` → ThemeControlPanel
- `/admin/templates` → TemplatesManagerPage
- `/admin/sessions` → SessionsAdminPage
- `/admin/overseer` → OverseerConsolePage
- `/admin/overseer-ultra` → OverseerConsoleUltra
- `/admin/content` → ContentStudioPage
- `/admin/seed` → SeedDataPage

#### `/legal`
- `/privacy` → PrivacyPolicyPage
- `/terms` → TermsOfServicePage
- `/cookies` → CookieNoticePage

#### `/auth`
- `/login` → LoginPage
- `/signup` → SignupPage
- `/onboarding` → OnboardingPage

### Route Classification

**User-Facing (Public/Guest):**
- `/`, `/chat`, `/home`
- `/explore`
- `/tools/*`
- `/recovery`
- `/milestones`
- `/agents`
- `/dashboard`
- `/profile`
- `/settings/*`
- `/assistance/*`
- `/guide`, `/living/v3`
- `/sequence/:id`
- `/workspace/*`
- `/directory/*`
- `/command`
- `/support`
- `/circles/*`
- `/social/*`
- `/connections/*`
- `/privacy`, `/terms`, `/cookies`
- `/login`, `/signup`, `/onboarding`

**Provider-Facing (RequireRole: provider/admin):**
- `/provider/*`
- `/providers/*`

**Admin-Facing (RequireAdmin):**
- `/admin/*`
- `/sessions/*`

**Technical/Standalone:**
- `/preview/:token` (no OSLayout)
- `/unauthorized` (no OSLayout)
- AccessDeniedPage (component exists but no route defined)

---

## 2. OS LAYOUT & UI SHELL

### OSLayout Definition
- **File:** `src/layouts/OSLayout.jsx`
- **Usage:** Wraps all routes except `/preview/:token` and `/unauthorized`

### Global UI Components in OSLayout

**Top App Bar (Header):**
- BackButton (left side, auto-hides on roots)
- Logo/Home button (WellnessCafe OS branding)
- Anonymous badge (right side, controlled by `featureFlags.showAnonymousBadge`)
- Live Session indicator (right side, controlled by `isLiveSessionActive` - currently always false)

**Global Banners:**
- Guest mode banner (top-level, shows when `isGuest === true`)

**Navigation:**
- Bottom tab navigation (5 tabs: Home, Explore, Assistance, Signals, Profile)
- OSPageChrome (breadcrumbs + page title, via NavigationContext)

**Main Content:**
- `<Outlet />` (renders route components)
- Wrapped in `<NavigationProvider>` for smart back navigation

### Pages Bypassing OSLayout
- `/preview/:token` → SessionPreviewPage (standalone preview)
- `/unauthorized` → UnauthorizedPage (standalone error page)

---

## 3. THEME & VISUAL SYSTEM

### Theme Engine Location
- **Primary:** `src/theme/themeStore.js` (single source of truth)
  - `getTheme()` - reads from localStorage key "wc_theme"
  - `setTheme(theme)` - writes to localStorage and applies to `<html>` class
  - `initTheme()` - called in `src/main.jsx` before first render
  - Default: "dark"

- **Legacy:** `src/hooks/useThemeEngine.js` (still imported and called in App.jsx line 106)
  - Uses localStorage key "wc-theme" (different key!)
  - Uses React state (`useState`)
  - **CONFLICT:** Two different localStorage keys exist ("wc_theme" vs "wc-theme")
  - **STATUS:** Both systems active simultaneously, potential race condition

### Theme Toggle Status
- **Wired to:** `themeStore.js` (static functions, no React state)
- **Location:** ProfilePage.jsx uses `getTheme()` and `setTheme()` directly
- **State:** Theme is global, not component-local

### Glassmorphism/Blur Utilities

**CSS Classes (in `src/index.css`):**
- `.glass-panel` - `rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-xl`
- `backdrop-blur` - Tailwind utility (used in header, nav)
- `backdrop-blur-md` - Tailwind utility (used in bottom nav)

**Usage Count:**
- `glass-panel`: 137 files reference it
- `backdrop-blur`: Used in OSLayout header and bottom nav

**CSS Variables (in `src/index.css`):**
- `--wc-glass: rgba(255, 255, 255, 0.05)`
- `--wc-glass-soft: rgba(255, 255, 255, 0.03)`
- `--wc-glass-border: rgba(255, 255, 255, 0.08)`

---

## 4. AI / AGENT ENTRY POINTS

### Backend Functions (Firebase Functions)

**v2 Functions (functions/src/index.js):**
- `multimodalChat` - POST `/multimodalChat` (CORS enabled, secrets: OPENAI_API_KEY)
- `multimodalTts` - POST `/multimodalTts` (CORS enabled, secrets: OPENAI_API_KEY)
- `multimodalStt` - POST `/multimodalStt` (CORS enabled, secrets: OPENAI_API_KEY)
- `globalResourceSearch` - POST `/globalResourceSearch` (CORS enabled, secrets: RAPIDAPI_KEY)
- `onClientUpdate` - Firestore trigger (milestones)

**v1 Legacy Functions:**
- `aiSession` - POST `/aiSession` (functions.https.onRequest, no CORS config visible)
- `aiMedia` - POST `/aiMedia` (functions.https.onRequest, no CORS config visible)
- `globalResourceSearchV1` - POST `/globalResourceSearchV1` (manual CORS headers)

### Frontend AI Client Functions

**Primary (src/services/multimodalClient.js):**
- `guideEngine(query, options)` - Main chat endpoint, uses `ENDPOINTS.chat()` → `/multimodalChat`
- `sendChatMultimodal({ messages, metadata, mode })` - Uses `ENDPOINTS.chat()` → `/multimodalChat`
- `speakText(text, options)` - Uses `ENDPOINTS.tts()` → `/multimodalTts`
- `transcribeAudio(audio, mimeType)` - Uses `ENDPOINTS.stt()` → `/multimodalStt`
- `callWellnessChat({ messages, mode })` - **DEPRECATED**, tries `/multimodalChat` then falls back to `/aiSession`

**Legacy (still referenced):**
- `/aiSession` - Referenced in:
  - `src/apps/ai/SessionsTemplatesPage.jsx` (mode: "templates")
  - `src/lib/apiClient.js` (may have references)
- `/aiMedia` - Referenced in:
  - Various components (needs verification)

### Active vs Legacy Endpoints

**Actively Called:**
- `/multimodalChat` - Used by `guideEngine()`, `sendChatMultimodal()`
- `/multimodalTts` - Used by `speakText()`
- `/multimodalStt` - Used by `transcribeAudio()`
- `/globalResourceSearch` - Used by search services

**Legacy (Still Referenced):**
- `/aiSession` - Used by SessionsTemplatesPage, possibly others
- `/aiMedia` - Exists but usage unclear
- `/globalResourceSearchV1` - Exists but v2 is primary

**Duplication:**
- `globalResourceSearch` (v2) and `globalResourceSearchV1` (v1) both exist
- `callWellnessChat()` is deprecated but still exported

---

## 5. DEAD OR DISCONNECTED UI

### Pages Not Linked from Navigation

**Unlinked Pages (exist but no nav links found):**
- `/living` → LivingGuidePage (component exists in `src/apps/living/LivingGuidePage.jsx` but NO route defined in App.jsx; only `/living/v3` is routed)
- `/providers` → ProvidersPage (requires auth, no nav link)
- `/providers/dashboard` → ProviderDashboardPage (duplicate of `/provider/dashboard`)
- `/providers/clients/:clientId` → ClientDetailPage (duplicate of `/provider/clients/:clientId`)
- `/sessions/templates` → SessionsTemplatesPage (admin-only, no nav link)
- `/sessions/templates/:id` → SessionTemplateDetailPage (admin-only, no nav link)
- `/sessions/templates/new` → SessionComposerPage (admin-only, no nav link)
- `/sessions/view/:id` → SessionViewerPage (admin-only, no nav link)
- `/admin/*` routes (admin-only, no nav links, direct URL access only)
- `/tools/classic` → ToolsPageClassic (has link from ToolsPageCinematic)
- `/assistance/request` → AssistancePage (has link from AssistanceHubPage)
- `/living/v3` → LivingGuidePageV3 (has link from LivingGuidePage)
- `/provider/clients/list` → ClientListPage (has link from ProviderClientsPage)

### UI Elements Without Meaningful Actions

**Static/Placeholder Elements:**
- "LIVE SESSION" indicator in header (always hidden, `isLiveSessionActive = false`)
- "Living Guide Online" text (hidden when `isLiveSessionActive = false`)
- Emotion badge (controlled by `featureFlags.showEmotionTelemetry = false`, currently hidden)
- Anonymous badge (controlled by `featureFlags.showAnonymousBadge = true`, visible)

**Feature Flags (src/config/featureFlags.js):**
- `showLiveSessionStatus: false` - Live session indicator hidden
- `showEmotionTelemetry: false` - Emotion badge hidden
- `showAnonymousBadge: true` - Anonymous badge visible
- `showExperimentalTools: false` - Experimental tools hidden

### Pages with Duplicate Routes

**Provider Routes (duplication):**
- `/provider/dashboard` and `/providers/dashboard` → Both point to ProviderDashboardPage
- `/provider/clients/:clientId` and `/providers/clients/:clientId` → Both point to ClientDetailPage

**Note:** `/providers/*` routes require RequireAuth + RequireRole, while `/provider/*` routes only require RequireRole.

---

## SUMMARY

**Total Routes:** ~70+ routes defined
**OSLayout Coverage:** ~68 routes (97% coverage)
**Standalone Pages:** 2 (`/preview/:token`, `/unauthorized`)
**Theme System:** Dual system exists (themeStore.js + useThemeEngine.js) with conflicting localStorage keys
**AI Endpoints:** 7 backend functions (3 v2 active, 2 v1 legacy, 2 search variants)
**Dead/Unlinked Pages:** ~10+ pages (mostly admin/provider routes, some duplicates)
**Glassmorphism:** Extensively used (137+ files reference `.glass-panel`)

