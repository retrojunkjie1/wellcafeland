# Cursor Build Packet — Spec

Canonical format for the build packet produced by the Work Packet Generator and consumed by Cursor (or human) for execution. Aligns with docs/pod/TASK_PACKET_SCHEMA.json.

--------------------------------------------------

## 1. Purpose

- **Producer:** Executor (Work Packet Generator step).
- **Consumer:** Cursor (or human executor) performing the task.
- **Use:** Single unit of work: task description, scope, verification list, and context slice so execution and QA are deterministic and contract-bound.

--------------------------------------------------

## 2. Required fields

| Field | Type | Description |
|-------|------|-------------|
| packet_id | string | Unique id (e.g. UUID). |
| created_at | string | ISO 8601. |
| app_id | string | e.g. wellnesscafe. |
| task_id | string | From work queue. |
| active_phase | string | From steward context (e.g. 55, 55A). |
| task_scope | object | title, description, focus_items, allowed_work, prohibited_work. |
| verification | object | scripts (array of strings), manual_checklist (array of strings). |
| approval_required | boolean | If true, execution or completion must not proceed without human approval. |

--------------------------------------------------

## 3. Optional fields

| Field | Type | Description |
|-------|------|-------------|
| context_slice | object | Subset of steward context (e.g. allowed/prohibited excerpt, phase objective). |
| run_id | string | Executor run id. |
| task_type | string | From queue (BUGFIX, FEATURE, etc.). |
| priority | string | P0–P3. |

--------------------------------------------------

## 4. task_scope shape

| Field | Type | Description |
|-------|------|-------------|
| title | string | Short title. |
| description | string | What to do. |
| focus_items | string[] | Concrete focus items. |
| allowed_work | string[] | From CURRENT_PHASE; work that is in scope. |
| prohibited_work | string[] | From CURRENT_PHASE; work that must not be done. |

--------------------------------------------------

## 5. verification shape

| Field | Type | Description |
|-------|------|-------------|
| scripts | string[] | Commands to run (e.g. npm run phase56.verify). |
| manual_checklist | string[] | Human checklist items. |

--------------------------------------------------

## 6. Fail-closed conditions

- Packet must **not** be generated if steward context is invalid or stale.
- Packet must **not** include task_scope that intersects prohibited_work (executor must not select such a task).
- If generated, consumer (Cursor/human) must run every script in verification.scripts before marking task complete; any FAIL must block DONE and phase/status update.

--------------------------------------------------

## 7. Human approval boundaries

- If approval_required === true, consumer must not start execution (or not mark complete) until human has approved.
- Phase advance, release, crisis/auth, first-time automation, constitutional change: approval_required must be true when task_type matches.

--------------------------------------------------

## 8. Phase 1 scope only

- Packet is a JSON document. No binary or multi-part format in Phase 1.
- Single task per packet. No batch packet.
- Executor produces packet; does not invoke Cursor. Human or separate automation runs Cursor with this packet.

--------------------------------------------------

## 9. JSON example: build packet (WellnessCafe)

```json
{
  "packet_id": "pkt_wc_20260310_001",
  "created_at": "2026-03-10T12:00:00.000Z",
  "app_id": "wellnesscafe",
  "task_id": "wq_wc_voice_feedback_001",
  "run_id": "run_20260310_1200",
  "task_type": "FEATURE",
  "priority": "P1",
  "active_phase": "55",
  "task_scope": {
    "title": "Voice state feedback in dock",
    "description": "Ensure UnifiedInteractionDock reflects voice lifecycle (idle, permission, listening, processing, speaking, error) with state-aware label and optional visual feedback.",
    "focus_items": [
      "Map voiceState prop to button label and aria-label",
      "Add subtle ring or pulse when state is listening or speaking",
      "On error state, primary button shows Retry and calls onRetry when provided"
    ],
    "allowed_work": [
      "Bug fixes and stability for Phase 55A/B scope",
      "Voice/audio feedback and spoken guidance",
      "Verification script and manual checklist alignment"
    ],
    "prohibited_work": [
      "New docks or duplicate bottom bars",
      "Auth gating for crisis/support access",
      "Large new features outside CURRENT_PHASE focus"
    ]
  },
  "verification": {
    "scripts": [
      "npm run phase55a:chatActions:verify",
      "npm run phase56.verify",
      "npm run dev"
    ],
    "manual_checklist": [
      "Home dock mic visually changes when starting/stopping voice",
      "Permission denied does not break navigation",
      "Support remains reachable at all times"
    ]
  },
  "context_slice": {
    "current_objective": "Harden chat, voice, and experience surfaces; no regressions.",
    "max_context_age_minutes": 60
  },
  "approval_required": false
}
```

--------------------------------------------------

END OF DOCUMENT
