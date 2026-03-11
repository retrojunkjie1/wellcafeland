# WellnessCafe — Pilot Pod Pattern

WellnessCafe is the first reusable autonomous pod pattern for the AI App Factory. This doc describes how one task moves through the system end-to-end, and how to duplicate this pattern for other app pods.

--------------------------------------------------

## 1. Pod pattern overview

| Component | WellnessCafe (pilot) | Duplication for next app |
|-----------|----------------------|---------------------------|
| **Project truth** | docs/runtime/STEWARD_CONTEXT.json | Same: build from manifest; app-specific source docs. |
| **Manifest** | docs/automation/SOURCE_OF_TRUTH_MANIFEST.json | New manifest listing that app’s MASTER_VISION, CURSOR_MEMORY, DoD, PHASE_ROADMAP, CURRENT_PHASE, TODAY. |
| **Build script** | scripts/build_steward_context.mjs | Copy and point at new manifest path or reuse with manifest path param. |
| **Pod contract** | docs/pod/POD_CONTRACT.md | Copy docs/pod/; adjust prohibited/allowed per app. |
| **Memory contract** | docs/pod/MEMORY_CONTRACT.md | Copy; set writable paths (e.g. their TODAY equivalent). |
| **Approval gate** | docs/pod/APPROVAL_GATE.md | Copy; adjust “crisis/auth” to that app’s critical surface. |
| **Verification** | scripts/pod/verify_pod_context.mjs | Copy; same logic (context + TODAY valid). |
| **Work Queue** | One queue (e.g. sheet) with app_id = wellnesscafe | New queue or new app_id column; same schema. |
| **Executor** | One workflow (e.g. n8n) | Same workflow; load context from repo; app_id selects which queue/pod. |

--------------------------------------------------

## 2. One WellnessCafe task through the system

**Task:** “Voice state feedback in dock” — ensure the dock reflects voice lifecycle (idle, permission, listening, etc.) with state-aware label and optional visual feedback.

### 2.1 Queue intake

**Queue item (JSON example):**

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

### 2.2 Executor run

1. **Context validation:** Load STEWARD_CONTEXT.json (or run npm run steward:build then pod:verify). Check valid and non-stale. **Pass.**
2. **Load queue:** Read Work Queue; filter status in [PENDING, READY]. Item above is eligible.
3. **Load memory:** CURRENT_PHASE and TODAY from steward context. Allowed work includes “Voice/audio feedback and spoken guidance”; prohibited includes “New docks or duplicate bottom bars.”
4. **Score:** Phase match (55); no prohibited overlap; priority P1. Readiness score e.g. 70. Item is selectable.
5. **Select:** Only one eligible item; selected.
6. **Gate:** task_type FEATURE, no phase advance, no crisis/auth change. **PROCEED.**
7. **Packet generation:** Build packet generated per CURSOR_BUILD_PACKET_SPEC (see example in that doc). packet_id = pkt_wc_20260310_001.
8. **Log:** Decision Log: step = selected, task_id = wq_wc_voice_feedback_001, packet_id = pkt_wc_20260310_001, gate_outcome = PROCEED. Build Tracker: new row PACKAGED.

### 2.3 Execution (Cursor / human)

- Consumer runs Cursor (or human implements) using the build packet. Changes: UnifiedInteractionDock receives voiceState and onRetry; state-aware labels and optional ring/pulse; DockWithVoice passes voice?.state and onRetry.
- No approval_required; execution proceeds.

### 2.4 Post-execution

1. **QA Sentinel:** Run npm run phase55a:chatActions:verify, npm run phase56.verify, npm run dev. **All pass.**
2. **Memory:** Update only focus/notes if needed; no phase/status change. **No approval needed.** Apply allowed updates.
3. **Queue and tracker:** Set task status DONE; completed_at, verification_status = PASS. Build Tracker row: status = PASSED, memory_updated = true.

### 2.5 Result

- Task moves from PENDING → IN_PROGRESS (at packet gen) → DONE (after verify + memory).
- Decision Log and Build Tracker hold full audit trail.
- No human pause required for this task type and scope.

--------------------------------------------------

## 3. Example where human approval is required

**Task:** “Close Phase 55A.2 and advance to 55B.” task_type = PHASE_ADVANCE, approval_required = true.

- Executor selects item; gate evaluates → **PAUSE.**
- Executor writes Decision Log (step = gate_result, gate_outcome = PAUSE); does not generate packet until human approves.
- Human approves → executor generates packet (or next run generates after approval flag set). After execution and verification, Memory Updater proposes TODAY phase/status change → gate **PAUSE** again for memory write. Human approves write → executor applies update; task set DONE.

--------------------------------------------------

## 4. Duplication model (next app pod)

1. **Create app repo** (or use existing).
2. **Copy pod docs:** docs/pod/ (README, POD_CONTRACT, MEMORY_CONTRACT, TASK_PACKET_SCHEMA, APPROVAL_GATE) from WellnessCafe.
3. **Create app source-of-truth docs:** Their MASTER_VISION, CURSOR_MEMORY, DoD, PHASE_ROADMAP, CURRENT_PHASE, TODAY equivalent.
4. **Create manifest:** docs/automation/SOURCE_OF_TRUTH_MANIFEST.json listing those paths.
5. **Add build script:** scripts/build_steward_context.mjs (copy or reuse); output docs/runtime/STEWARD_CONTEXT.json.
6. **Add pod verify:** scripts/pod/verify_pod_context.mjs (copy); same logic.
7. **Work Queue:** Add rows with app_id = new_app (or separate queue per app); same schema.
8. **Executor:** Same workflow; parameterize by app_id to load that repo’s context (or clone repo and run steward:build + pod:verify in that clone). Generate packet from that context; write to same Build Tracker and Decision Log with app_id.

Company Brain (shared standards) can be injected by the executor when building the context slice for the packet, without storing it inside each app repo.

--------------------------------------------------

## 5. Fail-closed conditions (recap)

- Steward context missing, invalid, or stale → executor does not select, does not generate packet.
- Task in prohibited work → score 0; not selected (or REJECT if selected by mistake).
- Gate REJECT → packet not generated; task set REJECTED/BLOCKED.
- Verification failed → task not set DONE; phase/status not updated.
- Memory contract violation → proposed update not applied; log memory_reject.

--------------------------------------------------

## 6. Human approval boundaries (recap)

- PAUSE resolved only by human (Approve / Reject / Cancel).
- Phase advance and release always PAUSE.
- Crisis/auth and first-time automation PAUSE.
- Executor never auto-approves; never writes constitutional docs.

--------------------------------------------------

## 7. Phase 1 scope only

- Pilot: WellnessCafe only. One queue, one executor run per app.
- No multi-app scheduler; no automated Cursor invocation from executor.
- Duplication is documented and schema is shared; second app pod is a follow-on phase.

--------------------------------------------------

END OF DOCUMENT
