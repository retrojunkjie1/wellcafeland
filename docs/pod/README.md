# WellnessCafe Autonomous Pod v1

Reference implementation for app pods in a multi-app AI production company. The pod is the app-specific execution unit that reads project truth, identifies the next valid task, prepares build packets, pauses at approval gates, and updates project memory—without breaking existing product behavior or duplicating UI.

--------------------------------------------------

## A. Current-state assessment (WellnessCafe as pilot pod)

### What already exists and serves as pod foundations

| Layer | Existing artifact | Pod use |
|-------|-------------------|---------|
| **Project truth** | `docs/runtime/STEWARD_CONTEXT.json` | Single compiled context; Vision Reader and App Architect consume this. |
| **Truth compiler** | `scripts/build_steward_context.mjs`, `npm run steward:build` | Rebuild before orchestration runs; fail-closed on invalid sources. |
| **Manifest** | `docs/automation/SOURCE_OF_TRUTH_MANIFEST.json` | Defines required source documents and freshness policy. |
| **Governance rules** | `docs/automation/STEWARD_CONTEXT_RULES.md` | Stale/invalid handling; n8n and pod must fail closed. |
| **Vision & architecture** | `docs/architecture/MASTER_VISION_BLUEPRINT.md`, `CURSOR_MEMORY.md`, `DEFINITION_OF_DONE.md` | Company Brain / App Architect inputs (via steward context). |
| **Phase & roadmap** | `docs/runtime/CURRENT_PHASE.md`, `docs/roadmap/PHASE_ROADMAP.md`, `docs/runtime/TODAY.json` | Current phase, allowed/prohibited work, next valid scope. |
| **Phase verification** | `scripts/phase55.verify.mjs`, `phase55a.chatActions.verify.mjs`, `phase56.verify.mjs`, etc. | QA Sentinel and gate checks; must pass before phase closeout. |
| **Phase doc generator** | `scripts/currentPhase.generate.mjs` | Can be used by Memory Updater to sync TODAY → CURRENT_PHASE. |

### What is missing

- **Explicit pod contract:** Defined inputs, outputs, and responsibilities for Vision Reader, App Architect, Build Planner, Work Packet Generator, QA Sentinel, Memory Updater, Approval Gate.
- **Task packet schema:** Standard shape for a “clean build packet” (task + context slice + verification list).
- **Approval gate logic:** Documented rules for when the pod must pause for human approval and what constitutes a major decision or release gate.
- **Memory update contract:** What the pod may write, where, and under what validation (no blind overwrites).
- **Pod-level verification:** A single check that steward context is valid and phase/TODAY are consistent before orchestration runs.
- **Cloneability guide:** How to copy this pod pattern to another app (which files to replicate, which to replace with app-specific content).

### Safest implementation order

1. Document only: pod contract, memory contract, approval gate logic, task packet schema (no new automation that could break builds).
2. Add a read-only pod context verifier script that validates steward context + TODAY; exit 1 if invalid so orchestration can fail closed.
3. Add cloneability notes and a minimal “how this pod works” doc.
4. Leave Work Packet Generator, Build Planner, and n8n integration as contract-defined; implement in orchestration layer (n8n or spine) using these contracts.

--------------------------------------------------

## B. Proposed pod structure and file locations

```
docs/pod/
  README.md                 # This file: assessment, structure, cloneability
  POD_CONTRACT.md           # Pod responsibilities, inputs, outputs
  MEMORY_CONTRACT.md        # What may be updated, where, validation
  TASK_PACKET_SCHEMA.json   # Schema for a single work packet
  APPROVAL_GATE.md          # When to pause; what needs human approval

docs/automation/            # (existing) Steward + governance
docs/architecture/         # (existing) Vision, DoD, CURSOR_MEMORY
docs/roadmap/              # (existing) PHASE_ROADMAP
docs/runtime/              # (existing) CURRENT_PHASE, TODAY.json, STEWARD_CONTEXT.json

scripts/
  build_steward_context.mjs # (existing) Compile steward context
  pod/
    verify_pod_context.mjs # Optional: verify context + TODAY valid
```

The orchestration spine (e.g. n8n) lives outside the app repo; it calls into the repo for steward context, verification, and (per memory contract) proposed updates. The app pod does not implement the spine; it defines the contract the spine and tools must follow.

--------------------------------------------------

## C. Pod inputs and outputs

| Role | Inputs | Outputs |
|------|--------|---------|
| **Vision Reader** | `STEWARD_CONTEXT.json` (valid, non-stale) | Extracted vision/constraints for downstream |
| **App Architect** | Steward context, CURRENT_PHASE, PHASE_ROADMAP | Allowed vs prohibited work; next valid scope |
| **Build Planner** | Current phase, TODAY.focus, verification list | Ordered list of verification steps; build packet prerequisites |
| **Work Packet Generator** | Task + context slice + verification list | One TASK_PACKET (see schema) |
| **QA Sentinel** | Task packet, phase verification scripts | Pass/fail; blocks completion if fail |
| **Memory Updater** | Execution result, memory contract | Proposed edits to TODAY.json / CURRENT_PHASE (only per contract) |
| **Approval Gate** | Gate rules, task type, risk flags | Pause and request human approval when required |

Inputs are read from the repo (or from steward context compiled from repo). Outputs are either consumed by the next step in the spine or written back to the repo only as allowed by MEMORY_CONTRACT.md.

--------------------------------------------------

## D. Approval gate logic

See **docs/pod/APPROVAL_GATE.md**. Summary:

- **Always pause for:** Phase advance, release/deploy, any change to crisis or auth-related behavior, first-time automation of a previously manual action.
- **No pause required for:** Reading context, running verification scripts, generating a task packet for human review, updating TODAY.notes or focus when contract allows.
- **Fail closed:** If context is stale or invalid, do not proceed; do not approve.

--------------------------------------------------

## E. Memory update contract

See **docs/pod/MEMORY_CONTRACT.md**. Summary:

- Only listed fields in listed files may be updated by the pod (or by automation on behalf of the pod).
- TODAY.json: focus, notes, blocked_work, valid_today may be updated under validation; phase/status changes follow approval gate.
- CURRENT_PHASE.md: may be regenerated from TODAY via currentPhase.generate.mjs; phase closeout requires approval.
- No deletion of source-of-truth content; no overwrite of MASTER_VISION_BLUEPRINT, CURSOR_MEMORY, or DEFINITION_OF_DONE by the pod.

--------------------------------------------------

## F. Cloneability notes for future apps

1. **Copy pod docs:** Clone `docs/pod/` (README, POD_CONTRACT, MEMORY_CONTRACT, TASK_PACKET_SCHEMA, APPROVAL_GATE) into the new app repo.
2. **Copy automation pattern:** Create `docs/automation/SOURCE_OF_TRUTH_MANIFEST.json` and list that app’s source-of-truth docs; add a `build_steward_context.mjs` equivalent that writes to `docs/runtime/STEWARD_CONTEXT.json`.
3. **App-specific sources:** Replace WellnessCafe’s MASTER_VISION_BLUEPRINT, CURSOR_MEMORY, DEFINITION_OF_DONE, PHASE_ROADMAP, CURRENT_PHASE, TODAY.json with the new app’s equivalents (same roles: vision, memory, DoD, roadmap, current phase, daily state).
4. **Verification scripts:** Each app has its own phase/feature verifiers; wire them into the pod’s QA Sentinel and approval gate (run scripts, pass/fail, pause on phase advance).
5. **Orchestration spine:** One spine can drive multiple app pods by loading each repo’s STEWARD_CONTEXT (or building it from manifest), then applying the same POD_CONTRACT and APPROVAL_GATE logic per app.
6. **Company Brain:** Shared standards (luxury, safety, architecture) live outside app repos or in a shared manifest; the spine injects them into context when building packets. The pod stays app-scoped.

--------------------------------------------------

## How to run pod verification (repo-side)

From repo root:

```bash
npm run steward:build   # Rebuild compiled context
npm run pod:verify      # Verify context + TODAY valid (fail-closed)
```

Orchestration (n8n or spine) should run `steward:build` (or ensure context is fresh) before loading context, then run `pod:verify` or validate per STEWARD_CONTEXT_RULES.md. If invalid or stale, fail closed and do not execute.

--------------------------------------------------

END OF DOCUMENT
