# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
WellnessCafe OS is a React 19 + Vite 7 SPA with Tailwind CSS v3 and Firebase backend. See `.cursorrules` for the full tech stack and coding conventions.

### Running the frontend
- **Dev server**: `npm run dev` (serves on `http://localhost:5173`, binds to `0.0.0.0`)
- **Build**: `npm run build` (outputs to `dist/`)
- **Lint**: `npm run lint` (ESLint 9 flat config; note: the codebase has pre-existing lint errors)
- **Preview prod build**: `npm run preview`

### Environment variables
Copy `.env.example` to `.env` before starting the dev server. The app renders its UI without valid Firebase credentials (runs in "Guest mode"), but AI features, auth, and data persistence require a live Firebase project or emulators.

### Firebase Cloud Functions (optional)
Functions live in `/functions` with their own `package.json`. Install separately: `cd functions && npm install`. Start emulators with `npm run serve` (requires `firebase-tools` CLI and optionally Java for Firestore emulator).

### Gotchas
- The `.eslintignore` file triggers a deprecation warning; the eslint config already uses `globalIgnores`.
- Vite proxy in `vite.config.js` forwards `/aiSession` to the Firebase Functions emulator by default; set `VITE_FIREBASE_FUNCTIONS_URL` in `.env` to override.
- The `sharp` dev dependency triggers a native build; if `npm install` fails on `sharp`, ensure build tools are available (`apt install build-essential`).
- No automated test framework is configured (no test runner in `package.json` scripts).
