# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
WellnessCafe OS is a React 19 + Vite 7 SPA with Tailwind CSS v3 and Firebase backend. See `.cursorrules` for the full tech stack and coding conventions.

### Definition of Done and release verification

- Follow [`docs/runtime/DEFINITION_OF_DONE.md`](docs/runtime/DEFINITION_OF_DONE.md) for every feature, correction, or release. Work is not done when it only builds: the request must have observable acceptance criteria, relevant behavior/security tests, a production build, and a verified release when deployment is requested.
- Run `npm run verify:release` before calling a feature release-ready. It runs the full UI/unit suite, Firestore Rules emulator suite, production build, Firebase predeploy checks, and whitespace/diff validation.
- When changing Cloud Functions, authorization, consent, data access, or Firestore schema/rules, also run the directly relevant Functions emulator suites listed in `functions/package.json`; a passing browser/UI suite does not cover those server boundaries.
- Do not update tests merely to silence a failure. Update stale assertions to current behavior only when the current behavior is intentional and remains covered; fix actual product regressions in the product code.
- A failed or skipped required check blocks “done” and production deploy. If a check cannot run, record why and the exact remaining acceptance step; do not report it as passed.

## Protect approved and committed behavior

- Treat behavior already approved and committed as a compatibility contract. Preserve it by default; do not remove, replace, disable, or silently narrow it while adding new work.
- Before changing an existing product path, identify its current behavior and regression coverage. Make additive changes where possible and keep prior data, IDs, routes, and user actions available.
- A change that intentionally alters or removes approved behavior requires explicit user authorization. Record the reason and migration/rollback implications in the change description, and add regression coverage for both the retained behavior and the authorized change.
- Never rewrite published history: do not amend or rebase commits already on `main`, and do not force-push shared release branches.
- Every pull request that changes an existing product file must carry the `approved-behavior-change` label. The `approved-build-protection` check enforces this and runs the UI suite and production build. Configure that check as required on protected release branches; do not merge or deploy around a failed or missing check.
- Adding the label authorizes review of the diff; it does not replace explicit user authorization for an intentional behavior change.

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
- The full release gate is `npm run verify:release`; focused Vitest and Firebase emulator scripts are also available in `package.json`.
