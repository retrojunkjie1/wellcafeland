# Phase 55A.2 — Control Surface Audit

## Summary

- **Layout in use:** `ExperienceShell` (not OSLayout). Bottom nav is inline in shell; composer slot `#wc-composer-dock` only on chat routes.
- **PresenceDock:** Defined in `PresenceDock.jsx` but **not rendered** anywhere (removed from ChatPanel in Phase 55A). No duplicate dock from it.
- **One primary interaction surface per route:** Chat = composer only; other routes = bottom nav only (no second dock).

---

## By route / page

| Route / page | Existing control surfaces | Duplicates? | Action |
|--------------|----------------------------|-------------|--------|
| `/`, `/chat` | Composer (ChatDock → ComposerPresenceControls + ChatComposerBar with mic). Portaled to `#wc-composer-dock`. | No | **Keep as-is.** Single surface = composer. Do not add UnifiedInteractionDock here. |
| Home `/home` | None (content only). Bottom nav only. | No | Optional: add **one** UnifiedInteractionDock for mic/tools/support if product wants global actions off-chat. |
| Explore, Tools list, Recovery, etc. | Bottom nav only. | No | Same as Home. |
| Tool detail (e.g. breathing) | ToolSessionLayout or ToolPanel (fixed bottom z-20/z-30) + shell bottom nav. | Two layers (tool panel + nav) | **Keep.** Tool panel = tool’s primary surface; nav = global. No extra mic/tools dock. |
| Assistance, Support, Resources | Bottom nav only. | No | Support/crisis reachable via nav; no duplicate help FAB. |
| Voice Check-In modal, VoiceSessionWorkspace | Mic inside modal/page content (not a floating dock). | No | Keep. |
| MessageBubble / ChatActionsRow | Inline actions (Speak, Tools, Real Help) on a message. | No | Contextual; not a second dock. |

---

## Components to keep (no replacement)

- **ChatDock + ChatComposerBar + ComposerPresenceControls** — Chat’s single surface. Do not replace with UnifiedInteractionDock on chat.
- **ToolPanel / ToolSessionLayout** — Tool session controls. Do not add another dock on top.
- **Bottom nav (ExperienceShell)** — Global nav; not an “interaction dock” in the mic/tools/support sense.

---

## Components not rendered (no change)

- **PresenceDock** — Not imported in any route. Stays unused.

---

## Where UnifiedInteractionDock is used (implemented)

- **Implemented:** Option B. `UnifiedInteractionDock` is rendered in **ExperienceShell** when `showUnifiedDock` is true: i.e. when **not** on a chat route and **not** on a tool-detail route (`/tools/:id`).
- **Chat routes** (`/`, `/chat`): Composer only; no UnifiedInteractionDock.
- **Tool detail routes** (e.g. `/tools/breathing`, `/tools/voice-checkin`): Tool panel only; no UnifiedInteractionDock (avoids stacking).
- **All other routes** (Home, Explore, Assistance, Tools list, Recovery, etc.): One UnifiedInteractionDock (Voice → /, Tools → /tools, Support → /assistance). Support is always reachable without login.

---

## Verification

- Chat: only one bar (composer); no stacked dock.
- Home/Explore/Daily/Assistance/Tools/Crisis/Account: at most one action dock (UnifiedInteractionDock if added) + bottom nav; no duplicate mic/tools/help FABs.
- Tool overlays (e.g. breathing): one tool panel; close/back works; no extra dock.
- Support/crisis reachable without login (via nav or dock support action).
