# POD CONTRACT — WellnessCafe Autonomous Pod v1

Defines the responsibilities, inputs, outputs, and fail-closed behavior of the app pod. The orchestration spine and execution tools (n8n, Cursor, Linear, GitHub) must respect this contract.

--------------------------------------------------

## Pod responsibilities (seven roles)

### 1. Vision Reader

- **Responsibility:** Read compiled project truth and expose vision, constraints, and non-negotiables to downstream roles.
- **Input:** `docs/runtime/STEWARD_CONTEXT.json` (must be valid and non-stale per STEWARD_CONTEXT_RULES.md).
- **Output:** Structured view of MASTER_VISION_BLUEPRINT and CURSOR_MEMORY content (or references) for App Architect and Build Planner.
- **Fail closed:** If steward context is missing, invalid, or stale, Vision Reader must not produce output; orchestration must not proceed.

### 2. App Architect

- **Responsibility:** Interpret current phase and roadmap; determine allowed vs prohibited work; identify next valid task scope.
- **Input:** Steward context (CURRENT_PHASE, PHASE_ROADMAP, TODAY parsed), plus Vision Reader output.
- **Output:** Allowed work list, prohibited work list, current objective, suggested next task scope (or “no next task” if at gate).
- **Fail closed:** If CURRENT_PHASE or TODAY is missing or inconsistent, do not emit allowed work; treat as “pause for human.”

### 3. Build Planner

- **Responsibility:** Turn “next valid task” into an ordered list of verification steps and prerequisites; ensure no step violates DoD or phase rules.
- **Input:** App Architect output, DEFINITION_OF_DONE, phase verification script names from CURRENT_PHASE / TODAY.
- **Output:** Ordered list of verification commands or checklist items; prerequisites (e.g. steward context rebuilt); no steps that conflict with prohibited work.

### 4. Work Packet Generator

- **Responsibility:** Produce a single task packet (see TASK_PACKET_SCHEMA.json) containing task description, context slice, verification list, and metadata.
- **Input:** Task scope from App Architect, Build Planner verification list, steward context slice (e.g. allowed/prohibited, phase).
- **Output:** One JSON or structured document conforming to the task packet schema; used by Cursor or execution layer to perform work and by QA Sentinel to validate.

### 5. QA Sentinel

- **Responsibility:** Run phase verification scripts and any packet-specific checks; block completion if any fail; report pass/fail.
- **Input:** Task packet, list of verification commands (e.g. `npm run phase55a:chatActions:verify`, `npm run phase56.verify`), optional manual checklist.
- **Output:** Pass/fail result; list of failed checks; no side effects on repo except reporting.
- **Fail closed:** If any required verification fails, QA Sentinel must report fail and orchestration must not mark task complete or advance phase.

### 6. Memory Updater

- **Responsibility:** Propose updates to project memory (TODAY.json, CURRENT_PHASE) per MEMORY_CONTRACT.md; never overwrite constitutional docs or delete source-of-truth content.
- **Input:** Execution result (success/fail), task type, memory contract rules.
- **Output:** Proposed diffs or writes only to allowed paths and fields; submission to Approval Gate if change affects phase or status.
- **Fail closed:** If proposed update violates memory contract or touches prohibited fields, do not apply.

### 7. Approval Gate

- **Responsibility:** Decide when to pause for human approval; reject or allow phase advance, release, and high-risk changes.
- **Input:** APPROVAL_GATE.md rules, task type, risk flags, proposed memory updates.
- **Output:** Proceed / Pause for approval / Reject; if Pause, orchestration stops until human approves or cancels.
- **Fail closed:** If in doubt, pause. If context is stale or invalid, reject.

--------------------------------------------------

## Pod inputs (summary)

| Input | Source | Required for |
|-------|--------|--------------|
| STEWARD_CONTEXT.json | docs/runtime/ | Vision Reader, App Architect, Work Packet Generator |
| SOURCE_OF_TRUTH_MANIFEST.json | docs/automation/ | Build script; freshness policy |
| CURRENT_PHASE.md | docs/runtime/ | App Architect, Build Planner, QA Sentinel |
| TODAY.json | docs/runtime/ | App Architect, Memory Updater |
| PHASE_ROADMAP.md | docs/roadmap/ (in steward context) | App Architect |
| DEFINITION_OF_DONE.md | docs/architecture/ (in steward context) | Build Planner, Approval Gate |
| Phase verification scripts | scripts/*.verify.mjs | Build Planner, QA Sentinel |

--------------------------------------------------

## Pod outputs (summary)

| Output | Consumer | Allowed by contract |
|--------|----------|---------------------|
| Vision / constraints view | App Architect, Build Planner | Read-only from context |
| Allowed / prohibited work | Build Planner, Work Packet Generator | Derived from context |
| Verification list | Work Packet Generator, QA Sentinel | Derived from phase + DoD |
| Task packet | Cursor, n8n, execution layer | Schema-compliant; see TASK_PACKET_SCHEMA.json |
| QA pass/fail | Orchestration, Approval Gate | No repo write |
| Proposed memory updates | Approval Gate, Memory Updater | Only per MEMORY_CONTRACT.md |
| Gate decision (proceed / pause / reject) | Orchestration | No repo write |

--------------------------------------------------

## Fail-closed validation

- **Steward context:** Must exist, valid JSON, integrity.all_required_present and all_non_empty and today_json_valid true, stale false, age within max_context_age_minutes. Else do not run pod.
- **TODAY.json:** Must exist, valid JSON, required fields present. Else App Architect must not emit allowed work; treat as pause.
- **Verification scripts:** If a phase requires a script (e.g. phase56.verify), that script must exist and be runnable. If it fails, QA Sentinel must fail and task must not be marked complete.
- **Memory updates:** Only apply updates that conform to MEMORY_CONTRACT.md. Else reject and do not write.

--------------------------------------------------

END OF DOCUMENT
