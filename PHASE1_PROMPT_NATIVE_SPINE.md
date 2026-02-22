# Phase 1: Prompt-Native Spine — Implementation Complete

**Date:** 2025-02-07  
**Status:** ✅ Complete

---

## Summary

Implemented a stable, production-grade AI Router contract so user prompts drive dynamic UI without new pages. Tools never auto-open from generic discomfort; only explicit user request runs a tool. External links open in-app preview first.

---

## Files Changed

### New Files

| File | Reason |
|------|--------|
| `src/core/intent/intentTypes.js` | Intent allowlist, `isIntentAllowed()`, `normalizeIntent()` |
| `src/core/intent/IntentRenderer.jsx` | Renders intents: chat.message, directory.search, resource.preview, tool.suggest, tool.run, page.navigate |
| `src/lib/openInAppLink.js` | Unified in-app link handler |
| `src/components/OpenInAppButton.jsx` | Button that opens links in InAppWebView first |

### Modified Files

| File | Reason |
|------|--------|
| `functions/aiBrain.js` | `buildEnvelope()`, `detectExplicitToolRequest()`, intent allowlist, tool gating, directory.search intent, all responses use envelope |
| `src/services/aiClient.js` | Parse `assistantText`, `intent`, `links` from new envelope |
| `src/components/os/ChatPanel.jsx` | Store intent/links on messages, render IntentRenderer, tool policy (only tool.run opens; tool.suggest = chips), skip directory nav when intent directory.search, InAppWebView for resource.preview |
| `src/apps/resources/ResourcesDetailPage.jsx` | Replace `target="_blank"` with OpenInAppButton |
| `src/apps/resources/ResourcesListPage.jsx` | Replace `target="_blank"` with OpenInAppButton |
| `src/components/os/DirectoryResultBlock.jsx` | Replace `target="_blank"` with OpenInAppButton |
| `src/components/realhelp/VerifiedDestinations.jsx` | Replace `target="_blank"` with OpenInAppButton |
| `src/components/interaction/modules/SupportSearchModule.jsx` | Replace `target="_blank"` with OpenInAppButton |
| `src/apps/directory/DirectoryWorkspace.jsx` | Replace `target="_blank"` with OpenInAppButton |
| `src/apps/directory/DirectoryDetailWorkspace.jsx` | Replace `target="_blank"` with OpenInAppButton |

---

## Response Envelope (Backend)

```javascript
{
  ok: true,
  correlationId: string,
  assistantText: string,
  intent: { type: string, payload?: object },
  links: Array<{ url: string, title?: string, kind?: string, source?: string }>,
  meta: { confidence?: number, safetyFlags?: string[] }
}
```

- **Intent types:** `chat.message`, `directory.search`, `resource.preview`, `tool.suggest`, `tool.run`, `page.navigate`
- **Tool gating:** `tool.run` only when user explicitly requests a tool (server-side `detectExplicitToolRequest()`)
- **Directory:** When `dirConf >= 0.55`, returns `intent: { type: "directory.search", payload: { query, region, resources } }`

---

## Tool Policy (Frontend)

- **`intent.type === "tool.run"`:** Open tool UI
- **`intent.type === "tool.suggest"`:** Show chips only (never auto-open)
- **`localStorage wc_calming_tools_never === "1"`:** Suppress tool.suggest entirely

---

## Verification

### 1. Start emulators

```bash
firebase emulators:start --only functions,firestore,auth
```

### 2. Start app

```bash
VITE_USE_EMULATORS=true npm run dev
```

### 3. Tests

| Test | Expected |
|------|----------|
| Send: "I need help finding treatment near me" | `assistantText` + `intent.directory.search` (no breathing popup) |
| Send: "start breathing with me" | `intent.tool.run` breathing → tool UI opens |
| Click any "Visit site" → | Opens in-app preview first; if blocked, shows preview card + explicit external open |
| `localStorage.setItem("wc_calming_tools_never", "1")` | No tool suggestions |

### 4. Quick sanity

```bash
npm run build
```

---

## No New Dependencies

All changes use existing packages (`react`, `react-router-dom`, `lucide-react`, etc.).
