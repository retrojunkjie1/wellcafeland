# Phase Fix: API and Tools

## Run Emulators

```bash
firebase emulators:start --only functions,firestore,auth
```

## Expected Network Calls

- **Browser** → `POST /api/aiSession` (relative)
- **Browser** → `POST /api/globalResourceSearch` (relative)
- **Vite proxy (dev)** → `http://localhost:5001/wellnesscafelanding/us-central1/aiSession`
- **Vite proxy (dev)** → `http://localhost:5001/wellnesscafelanding/us-central1/globalResourceSearch`
- **Firebase Hosting (prod)** rewrites `/api/aiSession` and `/api/globalResourceSearch` to the corresponding functions

## RAPIDAPI for Emulator

In `functions/.env`:

```
RAPIDAPI_KEY=your-rapidapi-key
RAPIDAPI_HOST=real-time-web-search.p.rapidapi.com
```

For production, set `RAPIDAPI_KEY` in Firebase Secret Manager.

## Tool Detail (Seed by Slug)

1. Open `/tools/box-breathing-4x4` (or any seed slug).
2. In dev console: `window.__wc_tool_loader_debug = true` then reload.
3. Console will show `[toolLoader] resolved via Firestore` or `[toolLoader] resolved via seed`.
4. Tool detail should render the protocol runner with steps.

## PROVIDER_NOT_SUBSCRIBED Response

When RapidAPI returns 403 "not subscribed":

```json
{
  "ok": false,
  "code": "PROVIDER_NOT_SUBSCRIBED",
  "message": "Provider not enabled",
  "provider": "RapidAPI",
  "retryAt": 1730000000000,
  "nextSteps": ["Subscribe in RapidAPI", "Set RAPIDAPI_KEY", "Set RAPIDAPI_HOST"],
  "query": "treatment near me",
  "results": [],
  "meta": { "fallback": true, "retryAt": 1730000000000, "provider": "RapidAPI" }
}
```
