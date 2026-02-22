# Phase 0 — Repo Map

## FILES FOUND

| Category | File Path |
|----------|-----------|
| **Router source-of-truth** | `src/App.jsx` (BrowserRouter, Routes, Route) |
| **Firebase hosting config** | `firebase.json` |
| **Firebase client init** | `src/firebase.js`, `src/config/firebaseConfig.js` |
| **Functions entry** | `functions/index.js` |
| **aiSession handler** | `functions/aiBrain.js` → `handleSession` (line ~352) |
| **Resource directory UI** | `src/apps/directory/DirectoryWorkspace.jsx`, `DirectoryDetailWorkspace.jsx` |
| **Directory data layer** | `src/services/directorySearch.js` (globalResourceSearch HTTP), `src/services/directoryService.js` (Firestore domains) |
| **ErrorBoundary** | `src/components/ErrorBoundary.jsx` |
| **OSLayout** | `src/layouts/OSLayout.jsx` (renders `<Outlet />`) |
| **Vite build output** | `dist` (from vite.config.js) |

## Firestore Collections (existing)

- `housing_providers`, `grants`, `support_programs`, `recovery_circles`, `realHelpProviders`
- `users`, `telemetry_events`, `admin_actions`, etc.
- **resources** (new): title, type, tags[], verified, location?, contact?, updatedAt

## Firestore Index (resources)

Single-field `updatedAt` desc is auto-created. `firestore.indexes.json` added for future composite indexes.
