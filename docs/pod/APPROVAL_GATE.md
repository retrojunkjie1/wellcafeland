# APPROVAL GATE — WellnessCafe Autonomous Pod v1

Defines when the pod must pause for human approval and when it may proceed automatically. The orchestration spine (n8n or other) must enforce these rules; fail closed when in doubt.

--------------------------------------------------

## Always pause for

1. **Phase advance:** Any change that moves the app to the next phase (e.g. 55 → 55B, or 55A.2 → 55B). This includes updating TODAY.json or CURRENT_PHASE.md to a new phase identifier or status COMPLETE for the current phase.
2. **Release or deploy:** Any step that triggers production deploy, release tag, or go-live.
3. **Crisis or auth behavior:** Any code or config change that affects crisis support routes, assistance access, or auth gating. Human must confirm crisis access is preserved and auth does not block support.
4. **First-time automation:** The first time a previously manual action is performed by the pod or spine, pause and confirm before applying.
5. **Constitutional or manifest change:** Any edit to MASTER_VISION_BLUEPRINT, CURSOR_MEMORY, DEFINITION_OF_DONE, PHASE_ROADMAP, or SOURCE_OF_TRUTH_MANIFEST.json. (Pod contract forbids pod from writing these; if orchestration allows, it must require approval.)

--------------------------------------------------

## No pause required for

1. **Read-only operations:** Loading steward context, reading CURRENT_PHASE, TODAY, roadmap; Vision Reader and App Architect outputs.
2. **Running verification scripts:** QA Sentinel running phase verify scripts; reporting pass/fail.
3. **Generating a task packet:** Work Packet Generator producing a packet for human or Cursor to use. The packet itself is not an execution; execution or phase change may still require approval.
4. **Updating TODAY.json focus, notes, blocked_work, valid_today:** When within MEMORY_CONTRACT and no phase/status change.
5. **Regenerating CURRENT_PHASE.md from TODAY:** When TODAY phase/status is unchanged (e.g. syncing focus and checklist).

--------------------------------------------------

## Reject (do not proceed)

1. **Stale or invalid steward context:** If STEWARD_CONTEXT.json is missing, invalid, or stale per STEWARD_CONTEXT_RULES.md, do not proceed; do not approve. Rebuild context first and re-validate.
2. **Prohibited work in task scope:** If the task packet or planned change includes work listed in CURRENT_PHASE “Prohibited work,” reject the packet or pause for human override.
3. **Memory contract violation:** If a proposed write violates MEMORY_CONTRACT.md (e.g. writing to a prohibited file or field), reject the update.
4. **Verification failed:** If QA Sentinel reports fail for a required verification script, do not mark task complete and do not advance phase; reject until checks pass or human explicitly overrides (documented).

--------------------------------------------------

## Gate flow (orchestration)

1. **Before execution:** If task type or payload has `approval_required: true`, or matches “Always pause for,” orchestration pauses and requests human approval. Optionally present packet and context slice.
2. **After execution, before memory write:** If the proposed memory update includes phase/status change or release, pause and request approval for the write.
3. **On reject:** Do not write; do not advance; log reason; optionally notify. Human may fix context or override after review.

--------------------------------------------------

## Cloneability

For another app pod, copy this doc and adjust “Crisis or auth behavior” to that app’s critical surface (e.g. payment, PII, or their equivalent of crisis access). Keep the structure: always pause / no pause / reject.

--------------------------------------------------

END OF DOCUMENT
