# Sheet Schema Standard — AI App Factory

Canonical schema reference for Work Queue, Agents Registry, Build Tracker, Decision Log, and Project Memory. Use exact field names in implementation. Phase 1 may implement only Work Queue, Build Tracker, and Decision Log; Project Memory is the app’s existing TODAY.json + steward context.

--------------------------------------------------

## 1. Work Queue

**Purpose:** Intake and hold candidate tasks; executor reads, scores, and updates status.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| task_id | string | Yes | Unique id (e.g. UUID or slug). |
| app_id | string | Yes | App pod id (e.g. `wellnesscafe`). |
| status | enum | Yes | PENDING \| READY \| IN_PROGRESS \| BLOCKED \| REJECTED \| DONE \| CANCELLED. |
| task_type | enum | Yes | BUGFIX \| FEATURE \| DOCS \| VERIFY \| PHASE_ADVANCE \| RELEASE \| DEPLOY \| CRISIS_AUTH_CHANGE \| FIRST_TIME_AUTOMATION \| CONSTITUTIONAL_CHANGE \| OTHER. |
| title | string | Yes | Short human-readable title. |
| description | string | No | Optional longer description. |
| target_phase | string | No | Phase this task belongs to (e.g. 55, 55A). |
| phase_hint | string | No | Hint for scorer (e.g. 55B). |
| priority | enum | No | P0 \| P1 \| P2 \| P3; default P2. |
| approval_required | boolean | No | If true, gate must PAUSE. |
| depends_on | string | No | Comma-separated or JSON array of task_ids. |
| created_at | string | Yes | ISO 8601. |
| updated_at | string | No | ISO 8601. |
| selected_at | string | No | Set when executor selects; ISO 8601. |
| packet_id | string | No | Set when build packet generated. |
| readiness_score | number | No | Last computed 0–100; executor may write. |
| completed_at | string | No | Set when status = DONE. |
| verification_status | string | No | PASS \| FAIL when DONE. |
| notes | string | No | Internal or human notes. |

**Status enum:** `PENDING` | `READY` | `IN_PROGRESS` | `BLOCKED` | `REJECTED` | `DONE` | `CANCELLED`.

**Task type enum:** `BUGFIX` | `FEATURE` | `DOCS` | `VERIFY` | `PHASE_ADVANCE` | `RELEASE` | `DEPLOY` | `CRISIS_AUTH_CHANGE` | `FIRST_TIME_AUTOMATION` | `CONSTITUTIONAL_CHANGE` | `OTHER`.

**Priority enum:** `P0` | `P1` | `P2` | `P3`.

--------------------------------------------------

## 2. Agents Registry

**Purpose:** Register agents (executor components, n8n nodes, or external tools) for audit and routing. Phase 1 may use a minimal registry (name, id, role).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| agent_id | string | Yes | Unique id. |
| name | string | Yes | Human-readable name. |
| role | enum | Yes | VISION_READER \| APP_ARCHITECT \| READINESS_SCORER \| APPROVAL_GATE \| WORK_PACKET_GENERATOR \| QA_SENTINEL \| MEMORY_UPDATER \| LOGGER. |
| version | string | No | Optional version. |
| enabled | boolean | No | Default true. |
| updated_at | string | No | ISO 8601. |

**Role enum:** `VISION_READER` | `APP_ARCHITECT` | `READINESS_SCORER` | `APPROVAL_GATE` | `WORK_PACKET_GENERATOR` | `QA_SENTINEL` | `MEMORY_UPDATER` | `LOGGER`.

--------------------------------------------------

## 3. Build Tracker

**Purpose:** Record each build packet and its execution/verification outcome.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| build_id | string | Yes | Unique id for this row. |
| packet_id | string | Yes | From build packet. |
| task_id | string | Yes | From work queue. |
| app_id | string | Yes | e.g. wellnesscafe. |
| status | enum | Yes | PACKAGED \| EXECUTING \| VERIFYING \| PASSED \| FAILED \| CANCELLED. |
| created_at | string | Yes | ISO 8601. |
| executed_at | string | No | When execution started or finished. |
| verification_status | enum | No | PASS \| FAIL. |
| memory_updated | boolean | No | True if memory update was applied. |
| notes | string | No | Optional. |

**Status enum:** `PACKAGED` | `EXECUTING` | `VERIFYING` | `PASSED` | `FAILED` | `CANCELLED`.

--------------------------------------------------

## 4. Decision Log

**Purpose:** Append-only audit trail for executor decisions, gate outcomes, and failures.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| log_id | string | Yes | Unique id. |
| run_id | string | Yes | Executor run id. |
| timestamp | string | Yes | ISO 8601. |
| step | enum | Yes | context_loaded \| context_validation_failed \| queue_loaded \| scored \| selected \| gate_result \| packet_generated \| no_selectable_task \| gate_reject \| verification_result \| verification_failed \| memory_proposed \| memory_reject. |
| task_id | string | No | When step involves a task. |
| packet_id | string | No | When step involves a packet. |
| gate_outcome | enum | No | PROCEED \| PAUSE \| REJECT. |
| failure_reason | string | No | When step is *_failed or gate_reject. |
| payload | string | No | Optional JSON or summary. |

**Step enum:** `context_loaded` | `context_validation_failed` | `queue_loaded` | `scored` | `selected` | `gate_result` | `packet_generated` | `no_selectable_task` | `gate_reject` | `verification_result` | `verification_failed` | `memory_proposed` | `memory_reject`.

**Gate outcome enum:** `PROCEED` | `PAUSE` | `REJECT`.

--------------------------------------------------

## 5. Project Memory

**Purpose:** App’s runtime state; executor reads for scoring and allowed/prohibited work; Memory Updater proposes writes per memory contract. Not a separate sheet—WellnessCafe uses existing docs.

| Source | Location | Writable by executor |
|--------|----------|----------------------|
| Steward context | docs/runtime/STEWARD_CONTEXT.json | No; only via npm run steward:build. |
| TODAY | docs/runtime/TODAY.json | Yes, only allowed fields (focus, notes, blocked_work, valid_today, etc.); phase/status with approval. |
| Current phase | docs/runtime/CURRENT_PHASE.md | Yes, only by regenerating from TODAY (e.g. currentPhase.generate.mjs). |

**TODAY.json fields (reference):** active_phase, valid_today, phase, title, status, day, focus (array), verify (array), manualTests (array), blocked_work (array), notes (array). See docs/pod/MEMORY_CONTRACT.md for which fields executor may update.

--------------------------------------------------

## 6. Implementation notes

- **Sheets (e.g. Google Sheets):** Use first row as header; column names = field names above. Store enums as exact strings.
- **JSON backend:** One file per entity or one file with keys work_queue, build_tracker, decision_log; arrays of objects with field names above.
- **IDs:** Generate task_id, build_id, log_id, packet_id as UUIDs or prefixed slugs (e.g. wq_abc123, bt_xyz789).

--------------------------------------------------

END OF DOCUMENT
