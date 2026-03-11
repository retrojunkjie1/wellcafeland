# Work Queue — Execution Contract

Strict contract for queue processing in the AI App Factory. Every executor run must comply; violations are logged and must trigger fail-closed or PAUSE.

--------------------------------------------------

## 1. Contract scope

- **Work Queue** is the single source of candidate tasks for the executor.
- **Executor** is the process (or workflow) that reads the queue, validates context, scores items, selects one, passes the gate, and generates a build packet.
- This contract defines: allowed operations, status transitions, required fields, and failure handling.

--------------------------------------------------

## 2. Queue item status enum

| Status | Value | Meaning |
|--------|--------|---------|
| PENDING | `PENDING` | New or not yet selected; eligible for scoring. |
| READY | `READY` | Explicitly marked ready (e.g. dependencies met); eligible for scoring. |
| IN_PROGRESS | `IN_PROGRESS` | Packet generated and execution started; do not select again. |
| BLOCKED | `BLOCKED` | Blocked by gate or dependency; not eligible until updated. |
| REJECTED | `REJECTED` | Human or gate rejected; not eligible. |
| DONE | `DONE` | Execution and verification complete. |
| CANCELLED | `CANCELLED` | Cancelled by human or policy; not eligible. |

**Eligible for selection:** Only `PENDING` and `READY`. All other statuses must be skipped by the scorer.

--------------------------------------------------

## 3. Allowed executor operations on the queue

| Operation | Allowed | Condition |
|-----------|---------|-----------|
| Read all rows | Yes | To score and select. |
| Update status (item) | Yes | Transition to IN_PROGRESS, BLOCKED, REJECTED, DONE, CANCELLED per rules below. |
| Append new row | Yes | Intake only; status must be PENDING or READY. |
| Update score / metadata | Yes | readiness_score, selected_at, packet_id may be written by executor. |
| Delete row | No | No deletion; use status CANCELLED or REJECTED. |
| Overwrite priority / task_type | No | Only intake or human may set at creation; executor may not change task_type or priority. |

--------------------------------------------------

## 4. Status transition rules

| From | To | Allowed when |
|------|-----|--------------|
| PENDING, READY | IN_PROGRESS | Executor has selected item and generated packet; write packet_id and selected_at. |
| PENDING, READY | BLOCKED | Gate or dependency; log reason. |
| PENDING, READY | REJECTED | Gate returned REJECT or human Reject; log reason. |
| PENDING, READY | CANCELLED | Human Cancel or policy. |
| IN_PROGRESS | DONE | Verification passed and (if applicable) memory update approved and applied. |
| IN_PROGRESS | BLOCKED | Verification failed or human blocked. |
| BLOCKED, REJECTED | PENDING or READY | Only if human or intake process explicitly re-opens; log. |
| DONE, CANCELLED | (any) | No transition; terminal. |

--------------------------------------------------

## 5. Required fields per queue item (minimal)

- `task_id` (string, unique)
- `status` (enum: PENDING | READY | IN_PROGRESS | BLOCKED | REJECTED | DONE | CANCELLED)
- `task_type` (enum, see SHEET_SCHEMA_STANDARD)
- `title` (string)
- `created_at` (ISO 8601)
- `app_id` (string, e.g. wellnesscafe)

Optional but used by executor: `target_phase`, `phase_hint`, `depends_on` (array of task_id), `priority`, `approval_required`, `updated_at`, `readiness_score`, `selected_at`, `packet_id`.

--------------------------------------------------

## 6. Execution flow (obligatory order)

1. **Load and validate context** — Steward context valid and non-stale; else fail closed, log, exit.
2. **Load Work Queue** — Read all rows; filter to status in [PENDING, READY]. If load fails, fail closed.
3. **Load Project Memory** — TODAY.json, CURRENT_PHASE (from steward context or direct read). If required for scoring and missing, fail closed.
4. **Score each eligible item** — Compute readiness_score; ineligible items get 0.
5. **Select one item** — Highest score; tie-break by created_at, then task_id. If none (all 0), log "no work," exit clean.
6. **Approval gate** — Evaluate selected item. If REJECT: update item status REJECTED or BLOCKED, log, exit. If PAUSE: write Decision Log, wait human; on Approve go to 7; on Reject/Cancel update status, log, exit.
7. **Generate build packet** — Per CURSOR_BUILD_PACKET_SPEC; write packet_id to Build Tracker and to queue item (selected_at, packet_id); set item status IN_PROGRESS.
8. **Log** — Decision Log: selected task_id, packet_id, gate outcome.

Post-execution (separate step or same workflow after Cursor/human runs):

9. **Run verification** — QA Sentinel runs scripts from packet. If any fail: log; do not set DONE; do not advance phase.
10. **Memory update** — If verification passed, Memory Updater proposes updates. If proposal includes phase/status change, Approval Gate PAUSE; human approves or rejects. Apply only allowed updates per memory contract.
11. **Update queue item** — Set status DONE; optionally write completed_at, verification_status. Update Build Tracker row.

--------------------------------------------------

## 7. Fail-closed conditions

Executor must **not** proceed past the step indicated when:

- **After step 1:** Context invalid or stale → exit; log context_validation_failed.
- **After step 2:** Work Queue unreadable or empty of eligible items after filter → exit; log queue_load_failed or no_eligible_items.
- **After step 5:** All scores 0 → exit clean; log no_selectable_task.
- **After step 6:** Gate returns REJECT → do not generate packet; update item REJECTED/BLOCKED; log gate_reject.
- **After step 9:** Verification failed → do not set DONE; do not apply phase/status memory; log verification_failed.
- **After step 10:** Memory proposal violates contract → do not apply; log memory_reject.

--------------------------------------------------

## 8. Human approval boundaries

- **Resolving PAUSE:** Only a human (or explicitly delegated authority) may set gate outcome to Approve or Reject after PAUSE. Executor must not auto-approve.
- **Re-opening BLOCKED/REJECTED:** Only human or designated intake process may set status back to PENDING/READY; executor must not.
- **Phase advance / release:** Always PAUSE; human must approve memory update or release step.

--------------------------------------------------

## 9. Phase 1 scope only

- One Work Queue per app (WellnessCafe: one queue).
- Executor runs synchronously or in a single workflow run; no distributed lock required in Phase 1.
- Queue backend: sheet (e.g. Google Sheet) or JSON file; schema as SHEET_SCHEMA_STANDARD. No database requirement for Phase 1.

--------------------------------------------------

## 10. JSON example: queue item

```json
{
  "task_id": "wq_wc_voice_feedback_001",
  "app_id": "wellnesscafe",
  "status": "PENDING",
  "task_type": "FEATURE",
  "title": "Voice state feedback in dock",
  "description": "UnifiedInteractionDock reflects voice lifecycle with state-aware label and optional visual feedback.",
  "target_phase": "55",
  "phase_hint": "55B",
  "priority": "P1",
  "approval_required": false,
  "depends_on": "",
  "created_at": "2026-03-10T10:00:00.000Z",
  "updated_at": "2026-03-10T10:00:00.000Z"
}
```

--------------------------------------------------

END OF DOCUMENT
