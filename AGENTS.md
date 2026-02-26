# AGENTS.md — WellnessCafe OS

> Instructions for AI coding agents working on this codebase.

## Project Identity

WellnessCafe OS is a luxury, fully responsive React SPA — an AI-guided wellness sanctuary designed for addiction recovery, trauma-informed care, and holistic human restoration. Every change must serve healing, stability, and compassion. Treat the system as clinical-grade software: no regressions, no breaking changes, no careless edits.

## Tech Stack

| Layer            | Technology                                      |
|------------------|--------------------------------------------------|
| Framework        | React 19 + Vite 7                                |
| Styling          | Tailwind CSS v3.4.18 (PostCSS, **not** v4)       |
| Routing          | React Router DOM v7                               |
| State            | Zustand 5                                         |
| UI Primitives    | Radix UI (`@radix-ui/react-slot`)                 |
| Animation        | Framer Motion                                     |
| Icons            | Lucide React                                      |
| Backend          | Firebase 12 (Auth + Firestore + Cloud Functions)  |
| HTTP Client      | Axios                                             |
| Language         | JavaScript (ES Modules, `.js` / `.jsx`)           |

## Source Layout

```
src/
├── apps/            # Feature modules — pages grouped by domain
│   ├── ai/          # AI sessions, composer, templates, assistant
│   ├── admin/       # Overseer, templates manager, content studio
│   ├── assistance/  # Assistance hub and request flow
│   ├── auth/        # Login, signup, access denied
│   ├── chat/        # Main chat interface
│   ├── circles/     # Community circles and threads
│   ├── command/     # Command console
│   ├── core/        # HomePage
│   ├── dashboard/   # User & admin dashboards
│   ├── directory/   # Directory workspace and details
│   ├── guide/       # Guide page
│   ├── legal/       # Privacy, terms, cookies
│   ├── living/      # Living Guide (V3 canonical)
│   ├── milestones/  # Milestone tracking
│   ├── onboarding/  # User onboarding
│   ├── overseer/    # Overseer Console Ultra
│   ├── profile/     # User profile
│   ├── provider/    # Provider dashboard, clients, notes, care plans
│   ├── providers/   # Legacy provider views
│   ├── recovery/    # Recovery page
│   ├── sequences/   # Sequence player
│   ├── settings/    # Preferences, wellness, notifications, privacy
│   ├── social/      # Social feed, DMs, connections
│   ├── support/     # Support hub
│   ├── tools/       # Wellness tools (breathing, grounding, journaling…)
│   └── workspace/   # Workspace pages
├── components/      # Reusable UI (ui/, os/, tools/, dashboard/, analysis/, nav/…)
├── hooks/           # Custom React hooks (26 files)
├── services/        # Service layer (54 files — telemetry, memory, providers…)
├── engines/         # Business logic engines (40 files — memory, ritual, learning…)
├── core/            # Core system logic (emotion, risk, tone, pattern engines)
├── stores/          # Zustand stores (useOSStore, useAIStore, etc.)
├── theme/           # Theme store (themeStore.js)
├── context/         # React contexts (AuthContext)
├── navigation/      # Navigation context, route meta, smart nav
├── config/          # Feature flags
├── data/            # Static data (session maps, ritual sequences, templates)
├── utils/           # Utility functions (roles, safety, formatting, rate limiters)
├── lib/             # Core utilities (apiClient, utils/cn, logger, userId)
├── layouts/         # OSLayout — main app shell
├── admin/           # ThemeControlPanel
├── agents/          # AI agent wrappers (aiAgents.js)
├── firebase.js      # Firebase initialization
├── App.jsx          # Root component with 80+ routes
├── main.jsx         # Entry point
└── index.css        # Global styles, theme tokens, animations
```

## Critical Rules

### Tailwind CSS — v3 Only
- **Never** use Tailwind v4 syntax. We are on v3.4.18.
- Config uses CommonJS: `module.exports = { ... }` in `tailwind.config.js`.
- Dark mode strategy: `darkMode: "class"`.
- Opacity syntax: use `bg-white/[0.08]`, **not** `bg-white/10`.
- Use theme tokens (`bg-background`, `text-foreground`, `border-border`) — never raw colors for themed surfaces.

### Imports
- Always use the `@/` path alias for `src/` (e.g., `@/hooks/useThemeEngine`).
- Group imports: React first, then external libraries, then internal modules.
- Named exports for hooks and utilities. Default exports for page/component files.

### Components
- Functional components with hooks only.
- Use `className`, never `class`.
- Keep components focused and single-purpose; prefer composition.

### State Management
- Zustand for global/shared state (`useOSStore`, `useAIStore`, `useInteractionCanvasStore`, etc.).
- React `useState` for local component state.
- State should live as close to its consumer as possible.

### CSS / Styling
- All styling via Tailwind utility classes.
- Theme tokens are CSS custom properties defined in `src/index.css` `:root` and `.dark`.
- Use `hsl(var(--variable-name))` when referencing tokens directly in CSS.
- `@apply` only in `src/index.css` — never in component files.
- `src/main.jsx` must import `./index.css` as its **first** import. Never duplicate this import elsewhere.

### API & Backend
- Use `src/lib/apiClient.js` for all backend calls.
- AI endpoints: `/aiSession` (POST with `mode`, `intent`, `prompt`).
- Always handle errors with try/catch and provide user-friendly messages.
- Firebase config comes from `VITE_*` environment variables.

### Routing
- All pages render inside `<OSLayout />` via `<Outlet />` (except `/preview/:token` and `/unauthorized`).
- Protected routes use `RequireAuth`, `RequireRole`, or `RequireAdmin` wrappers.
- Add new pages in `src/apps/<domain>/`, register the route in `src/App.jsx`, and optionally add nav in `src/layouts/OSLayout.jsx`.

### File Naming
- Components: `PascalCase.jsx`
- Hooks: `useCamelCase.js`
- Services / utilities / engines: `camelCase.js`

## Provider Hierarchy (main.jsx)

```
StrictMode
  └── ErrorBoundary
       └── WcOsProvider        (OS-level context)
            └── AuthProvider    (Firebase auth context)
                 └── App        (Router + routes)
```

Theme is initialized **before** React renders via `initTheme()` from `@/theme/themeStore`.

## Environment Variables

All client-side env vars must be prefixed with `VITE_`. Key variables:

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_FUNCTIONS_URL` | Cloud Functions URL (optional, defaults to emulator) |
| `VITE_API_BASE_URL` | API base URL (default `http://localhost:3000`) |
| `VITE_RAPIDAPI_KEY` | RapidAPI key for directory search |
| `VITE_WC_MASTER_ADMIN_KEY` | Master admin key |

Feature flags: `VITE_ENABLE_VOICE`, `VITE_ENABLE_VIDEO`, `VITE_ENABLE_DIRECTORY`, `VITE_ENABLE_PROVIDER_MODE`, `VITE_ENABLE_EXPERIMENTAL_TOOLS`.

## Build & Dev

```bash
npm run dev       # Start dev server (0.0.0.0:5173)
npm run build     # Production build
npm run lint      # ESLint (flat config, ESLint 9)
npm run preview   # Preview production build
```

The dev server proxies `/aiSession` to Firebase Functions (emulator or production URL via env vars).

## Linting

ESLint 9 flat config with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`. The following directories are **ignored** by lint (legacy code):

- `src/Views/`, `src/features/`, `src/components/`, `src/services/`, `src/lib/`
- `dist/`, `functions/`, `scripts/`, `tests/`

Always run `npm run lint` before committing.

## Theme System

- CSS variables in `:root` and `.dark` within `src/index.css`.
- Tailwind config maps variables to utility classes in `tailwind.config.js`.
- Theme toggle via `src/theme/themeStore.js` (localStorage key: `wc_theme`).
- Dark mode applied by toggling `.dark` class on `<html>`.
- Luxury tokens: `--wc-bg-deep`, `--wc-glass`, `--wc-gold`, `--wc-text-soft`, etc.
- Font: Space Grotesk (loaded from Google Fonts in `index.css`).
- Font sizes are intentionally larger than Tailwind defaults for accessibility.

## Architecture Patterns

### Engines (`src/engines/`)
Domain-specific business logic — memory orchestration, ritual sequences, learning paths, trauma pattern analysis, emotion adaptation, cinematic sessions, narration. These are pure logic modules consumed by hooks and services.

### Services (`src/services/`)
Data access and external integrations — Firebase CRUD, telemetry, AI moderation, provider workflows, social features, search, consent management. Services are consumed by hooks and components.

### Hooks (`src/hooks/`)
React integration layer — hooks wire engines and services into component lifecycle. Examples: `useSessionMemory`, `useRiskRadar`, `useAdaptiveContent`, `useSequenceRunner`.

### Stores (`src/stores/`)
Zustand global state — `useOSStore` (chat/workspace modes), `useAIStore` (AI console), `useInteractionCanvasStore`, `agentsRegistryStore`, `systemSettingsStore`, `adminConfigStore`.

### Core (`src/core/`)
System-level intelligence — emotion engine, tone engine, risk engine, pattern engine, behavioral drift detection, face signal processing, message normalization.

## Key Conventions

1. **Never break the theme** — all UI must use theme tokens, not hardcoded colors.
2. **Never introduce Tailwind v4 syntax** — we are locked to v3.
3. **Never add CSS imports** outside `src/main.jsx`.
4. **Always use `@/` alias** for src-relative imports.
5. **Always handle async errors** with try/catch and user-facing feedback.
6. **Preserve the provider hierarchy** in `main.jsx` — order matters.
7. **Lazy load** heavy routes where appropriate (see `React.lazy` usage in `App.jsx`).
8. **Run lint before committing** — `npm run lint` must pass cleanly.

## Adding New Features

### New Page
1. Create component in `src/apps/<domain>/YourPage.jsx`.
2. Add route in `src/App.jsx` inside the appropriate `<Route>` group.
3. Wrap with `RequireAuth`/`RequireRole` if needed.
4. Add navigation entry in `src/layouts/OSLayout.jsx` if it's a top-level destination.

### New Hook
1. Create `src/hooks/useYourHook.js`.
2. Use named export: `export function useYourHook() { ... }`.
3. Import with `@/hooks/useYourHook`.

### New Theme Token
1. Add CSS variable to `:root` and `.dark` in `src/index.css`.
2. Add mapping in `tailwind.config.js` → `theme.extend.colors`.
3. Use via Tailwind class (e.g., `bg-yourToken`).

### New Service
1. Create `src/services/yourService.js`.
2. Use `src/lib/apiClient.js` for HTTP calls.
3. Export functions, consume from hooks or components.

### New Engine
1. Create `src/engines/yourEngine.js`.
2. Keep it pure logic (no React imports).
3. Consume from hooks that bridge into the component tree.
