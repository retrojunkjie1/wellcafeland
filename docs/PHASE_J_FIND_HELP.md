# Phase J — Find Help / RealHelp Live Discovery Restore

## Entry Points

| Type | Path |
|------|------|
| **UI pages** | `src/apps/directory/DirectoryWorkspace.jsx`, `src/apps/directory/DirectoryDetailWorkspace.jsx`, `src/apps/workspace/RealHelpWorkspace.jsx` |
| **Service layer** | `src/services/resourceSearch.js`, `src/services/directoryService.js`, `src/services/directorySearch.js` (new) |
| **Firebase function** | `functions/src/globalResourceSearch.js` → `/globalResourceSearch` |

## Files Changed

| File | Change |
|------|--------|
| `src/services/directorySearch.js` | **New** — single source of truth: `searchDirectory`, `normalizeResult`, `normalizeResponse`. 15s timeout, retry with backoff, wc_debug support. |
| `src/apps/directory/DirectoryWorkspace.jsx` | Replaced `searchResources` with `searchDirectory`. Infinite scroll, dedupe by id, summary (line-clamp-2). |
| `functions/src/globalResourceSearch.js` | Added `limit`, `pageToken` (offset). Slices results for pagination. Returns `nextPageToken`, `meta.tookMs`. |

## Endpoint

- **URL:** `{FUNCTIONS_URL}/globalResourceSearch`
- **Method:** POST
- **Body:** `{ query, domain, region?, category?, limit?, pageToken? }`
- **Response:** `{ ok, items, nextPageToken, meta }`

## Pagination

- `limit` default 20; `pageToken` decoded as offset (numeric string)
- Backend: offset = parseInt(pageToken) || 0; returns nextPageToken = String(offset + limit) when results.length >= limit
- Frontend: infinite scroll fetches nextPageToken when near bottom; dedupe by id

## Verification

- `verified: true` for SAMHSA, samhsa.gov, .gov domains, findtreatment.gov
- `verified: false` otherwise
- No scraping in browser

## Smoke Tests

- [ ] Housing: search "Steamboat", "Denver"
- [ ] Grants: search "sober living grant"
- [ ] Infinite scroll: 3+ pages, no duplicates
- [ ] Detail: actionable fields (call, website)
- [ ] No wall of text, no horizontal overflow
- [ ] Build passes
