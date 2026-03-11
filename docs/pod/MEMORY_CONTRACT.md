# MEMORY CONTRACT — WellnessCafe Autonomous Pod v1

Defines what the pod (or automation on behalf of the pod) may write, where, and under what validation. Prevents drift and protects constitutional source-of-truth documents.

--------------------------------------------------

## Principles

1. **No blind overwrites:** Only listed fields in listed files may be updated by the pod.
2. **No deletion of source-of-truth content:** Pod must not delete or truncate MASTER_VISION_BLUEPRINT, CURSOR_MEMORY, DEFINITION_OF_DONE, PHASE_ROADMAP.
3. **Phase and status changes require approval:** Changing phase, advancing to next phase, or marking phase complete must go through Approval Gate (human or explicit policy).
4. **Validation before write:** TODAY.json must remain valid JSON; CURRENT_PHASE.md may be regenerated from TODAY via a defined script only.

--------------------------------------------------

## Allowed writable targets

### 1. docs/runtime/TODAY.json

| Field | May pod update? | Notes |
|-------|-----------------|------|
| active_phase | Only with Approval Gate | Phase advance requires approval. |
| valid_today | Yes | Set to current date (ISO) when starting a new day context. |
| phase | Only with Approval Gate | Sub-phase (e.g. 55A.2) change with approval. |
| title | Only with Approval Gate | When phase/sub-phase changes. |
| status | Only with Approval Gate | COMPLETE or similar only after gate. |
| day | Yes | Increment or set per run policy. |
| focus | Yes | Update to reflect current focus; keep aligned with CURRENT_PHASE. |
| verify | Yes | List of verification commands; keep in sync with phase. |
| manualTests | Yes | Checklist items; keep in sync with phase. |
| blocked_work | Yes | Add/remove items; do not drop field. |
| notes | Yes | Append or replace; do not delete constitutional notes. |

**Validation before write:** JSON must parse; required fields (e.g. active_phase, valid_today, focus, verify, notes) must exist. If adding a field, use schema from existing TODAY.json or TASK_PACKET_SCHEMA.

### 2. docs/runtime/CURRENT_PHASE.md

- **Allowed:** Regenerate from TODAY.json using the existing script `scripts/currentPhase.generate.mjs` (or equivalent) so that CURRENT_PHASE.md reflects TODAY.
- **Not allowed:** Free-form overwrite that contradicts TODAY or DEFINITION_OF_DONE. Phase closeout or “Completion Evidence” sections that mark phase complete require Approval Gate.

### 3. docs/runtime/STEWARD_CONTEXT.json

- **Allowed:** Only overwrite by running `scripts/build_steward_context.mjs` (or `npm run steward:build`). No hand edits; no partial writes.
- **Not allowed:** Manual edits; writing from orchestration without running the build script.

--------------------------------------------------

## Prohibited writes

- **docs/architecture/MASTER_VISION_BLUEPRINT.md** — Pod must not write. Company Brain or human only.
- **docs/architecture/CURSOR_MEMORY.md** — Pod must not write. Human or designated memory steward.
- **docs/architecture/DEFINITION_OF_DONE.md** — Pod must not write. Governance only.
- **docs/roadmap/PHASE_ROADMAP.md** — Pod must not write. Roadmap changes are governance.
- **docs/automation/SOURCE_OF_TRUTH_MANIFEST.json** — Pod must not write. Manifest changes are governance.
- **Deletion or truncation** of any required source document listed in the manifest.

--------------------------------------------------

## Memory update flow

1. **Execution completes** (success or fail).
2. **Memory Updater** proposes changes only to allowed fields in TODAY.json (and optionally triggers CURRENT_PHASE.md regeneration).
3. If proposal touches **phase, status, title** (phase advance or closeout), **Approval Gate** must run; if gate says Pause, human approves before write.
4. **Validation:** TODAY.json validated (valid JSON, required keys). If regeneration of CURRENT_PHASE.md, run `currentPhase.generate.mjs` only; do not hand-edit.
5. **Write** to repo only after validation and gate (if required).

--------------------------------------------------

## Cloneability

For another app pod, copy this contract and replace:

- Writable targets with that app’s equivalent (e.g. their TODAY.json path and schema).
- Prohibited list with that app’s constitutional docs.
- Script name for “regenerate current phase” if different (e.g. `currentPhase.generate.mjs`).

--------------------------------------------------

END OF DOCUMENT
