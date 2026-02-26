# WellnessCafe OS — Agent Guide (AGENTS.md)

This file is the operational guide for autonomous coding agents and contributors working in this repo. **Follow `.cursorrules` first**; this document adds repo-specific “how to work here” details (commands, architecture landmarks, safety constraints).

## Product intent (non-negotiable)

WellnessCafe OS is a luxury, AI-guided wellness sanctuary. Changes must preserve:

- **Safety + compassion**: UI copy must be non-judgmental, trauma-informed, and avoid shaming language.
- **Clinical precision**: don’t overclaim outcomes; avoid “diagnosing”; prefer supportive language and clear next steps.
- **Stability**: avoid breaking changes, route churn, or theme token drift unless explicitly requested.
- **Privacy**: never log or persist sensitive user content unnecessarily; never commit secrets.

## Tech stack (current)

- **Frontend**: React 19 + Vite 7 (ESM)
- **Styling**: Tailwind CSS v3.4.x (PostCSS classic stack)
- **Routing**: `react-router-dom` v7
- **State**: Zustand (global), React state (local)
- **Backend**: Firebase (Firestore/Auth/Hosting) + Firebase Functions (`functions/`)
- **Icons/UI**: Lucide React, Radix Slot, Framer Motion

## Repo quickstart (frontend)

Run from repo root:

```bash
npm install
npm run dev
```

Common scripts (root `package.json`):

```bash
npm run dev      # Vite dev server
npm run build    # Production build to dist/
npm run preview  # Preview the production build
npm run lint     # ESLint (flat config)
```

### Important: this is a Vite repo

Some legacy docs may mention `npm start` (Create React App). **Use `npm run dev`** here.

## Firebase Functions (`functions/`)

The `functions/` directory is a separate Node project (runtime `nodejs20`).

```bash
cd functions
npm install
npm run serve     # functions emulator
npm run deploy    # deploy functions (requires Firebase auth)
```

The frontend uses a Vite proxy for `/aiSession` (see `vite.config.js`). Hosting rewrites are in `firebase.json`.

## Environment variables

Frontend env vars are Vite-prefixed. Use `.env.example` as the template and create a local `.env`.

- **Firebase (frontend)**: `VITE_FIREBASE_*`
- **Functions base URL**: `VITE_FIREBASE_FUNCTIONS_URL` (used by dev proxy logic)
- **RapidAPI directory search**: `VITE_RAPIDAPI_*`

Never commit `.env` files or API keys.

## Architecture map (where to change things)

High-signal landmarks:

- **App entry**: `src/main.jsx` (imports `./index.css` first; initializes theme)
- **Router**: `src/App.jsx` (canonical; `src/App.js` exists but is not the entry)
- **Shell/layout**: `src/layouts/OSLayout.jsx` (top bar, bottom nav, `<Outlet />`)
- **Feature modules**: `src/apps/**` (pages and workspaces)
- **Engines** (behavioral logic): `src/engines/**`
- **Hooks** (orchestration): `src/hooks/**`
- **Theme**: `src/index.css` (tokens), `src/theme/**` (store/config)
- **AI/agents wrappers**: `src/agents/**`

When adding a new page/feature, prefer:

- UI in `src/apps/<domain>/...`
- shared UI in `src/components/...`
- logic in `src/engines/...` (pure-ish) + `src/hooks/...` (React integration)

## Conventions that matter here

### Imports

- Use the alias **`@/` → `src/`** (configured in `vite.config.js`).
- Group imports: React → third-party → internal (`@/` or relative).

### Styling (Tailwind v3)

- Use Tailwind utilities and **theme tokens**: `bg-background`, `text-foreground`, `border-border`, etc.
- Dark mode is via `.dark` class on `<html>` (Tailwind `darkMode: "class"`).
- Opacity format: use `bg-white/[0.08]` (not Tailwind v4 shorthand).

### Routing

- Most routes render inside `<OSLayout />` via `<Outlet />`.
- Add/adjust routes in `src/App.jsx`.
- Keep navigation behavior consistent with `OSLayout`’s active-path logic.

### State

- Use Zustand for cross-cutting state (AI console, global settings, etc.).
- Keep state local when it’s only used by a single page/component.

### Errors & loading

- Wrap async calls in `try/catch` and show user-safe messages.
- Prefer resilient UX: optimistic UI only when failure states are clear and reversible.

### Content safety (copy, prompts, AI flows)

When modifying prompts, AI “guide” copy, or recovery-oriented UI:

- Avoid shame/pressure language (“you failed”, “relapse is your fault”).
- Prefer grounding, choice, and autonomy (“Would it help to…”, “You’re not alone”).
- If adding any crisis/self-harm related content, include clear guidance to seek local emergency help; keep it brief and non-alarming.

## Linting/testing notes (current reality)

- Root lint is `eslint.config.js` (flat config).
- **Some folders are currently ignored by ESLint** (see ignore list in `eslint.config.js`). If you change ignored areas, lint may not catch issues—validate by running:

```bash
npm run build
```

There is no dedicated root test script in `package.json` right now.

## Performance expectations

- Prefer route-level lazy loading for heavy pages/components (see `React.lazy` usage in `src/App.jsx`).
- Keep Tailwind class strings readable; avoid deeply nested conditional class soup—use small helpers where appropriate.
- Don’t add large dependencies unless essential and explicitly requested.

## Git hygiene (agent behavior)

- Make **small, logical commits** with descriptive messages.
- Don’t commit build output (`dist/`), `node_modules/`, or secrets.
- Keep changes aligned with existing patterns; avoid broad refactors unless asked.

