# Phase 51 Snapshot

**Date:** 2025-02-07  
**Phase:** Phase 51 — Experience Spine Hardening  
**Status:** Snapshot complete

---

## Summary: What Changed

Phase 51 hardened the experience spine:

- **Auth:** `aiSessionClient.js` with `waitForUser` + `callAiSession`; all aiSession traffic flows through it
- **Backend:** `isEmulator(req)` in `functions/aiBrain.js` detects emulator via `FUNCTIONS_EMULATOR`, `FIREBASE_AUTH_EMULATOR_HOST`, `FIRESTORE_EMULATOR_HOST`, and LAN patterns
- **Telemetry:** `serverTimestampSafe()` used instead of raw `admin.firestore.FieldValue.serverTimestamp()`
- **Aliases:** `searchLiveResources` and `searchLiveResourcesV1` exported as aliases to `globalResourceSearch` in `functions/src/index.js`
- **Vite proxy:** `/api/searchLiveResources` → `/searchLiveResources` in `vite.config.js`
- **globalResourceSearchClient:** `src/services/globalResourceSearchClient.js` as single entrypoint
- **ErrorBoundary:** Wraps app in `main.jsx`
- **NotReady:** `src/pages/NotReady.jsx` added

---

## URLs to Verify

| URL | Purpose |
|-----|---------|
| `http://localhost:5173` | Vite dev server |
| `http://127.0.0.1:5001/<projectId>/us-central1/aiSession` | aiSession (emulator) |
| `http://127.0.0.1:5001/<projectId>/us-central1/globalResourceSearch` | globalResourceSearch (emulator) |
| `http://127.0.0.1:4000` | Emulator UI |

---

## Network Proof

| Endpoint | Method | Expected Status | Observed |
|----------|--------|-----------------|----------|
| `/api/aiSession` | POST | 200 | 401 (auth required; token verification may fail in emulator) |
| `/api/globalResourceSearch` | POST | 200 | 200 ✓ |

---

## Emulator Proof

*Function initialized lines will be captured when emulators run.*

```
# Run: firebase emulators:start --only functions,auth
# Copy "function initialized" lines here after smoke run
```

---

## Known Limitations

1. **aiSession requires auth:** POST must include `Authorization: Bearer <idToken>`. Smoke script uses anonymous sign-in against Auth emulator.
2. **Emulators required:** Smoke test expects Functions + Auth emulators and (optionally) Vite dev server.
3. **globalResourceSearch:** Returns 200 with fallback when `RAPIDAPI_KEY` is missing; full live search needs key in `functions/.env` or Secret Manager.
4. **Vite proxy:** Smoke targets `http://localhost:5173`; if Vite is not running, use `BASE_URL` env to point at emulator directly.

---

## Rollback Instructions

```bash
git checkout phase-51
# or
git checkout <commit-hash-before-snapshot>
```

**Tag:** `phase-51`

---

## Next Phase Entry Criteria

- [ ] Smoke test passes: `npm run smoke:phase-51`
- [ ] Emulators running: `firebase emulators:start --only functions,auth`
- [ ] Vite dev server running (or `BASE_URL` set to emulator)
- [ ] `VITE_FIREBASE_PROJECT_ID` and `VITE_FIREBASE_API_KEY` set (no secrets in repo)
- [ ] `functions/.env` has `OPENAI_API_KEY` for aiSession (optional for globalResourceSearch)

---

## Smoke Test Output

```
[smoke] Env check OK (projectId present, apiKey present)
[smoke] POST http://localhost:5173/api/aiSession -> 401 FAIL
[smoke] POST http://localhost:5173/api/globalResourceSearch -> 200 PASS
[smoke] FAIL
```

**Note:** aiSession returns 401 when auth token verification fails (emulator/project mismatch or Admin SDK config). globalResourceSearch passes. For full PASS, ensure Auth + Functions emulators use the same project and `admin.auth().verifyIdToken` accepts emulator tokens.
