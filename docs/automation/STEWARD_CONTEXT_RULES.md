# STEWARD CONTEXT — GOVERNANCE RULES

Constitutional governance layer for the WellnessCafe Development Steward Board (n8n). This document defines what the compiled context is, how it is produced, when it is invalid or stale, and that consumers must fail closed.

--------------------------------------------------

## What STEWARD_CONTEXT.json is

`docs/runtime/STEWARD_CONTEXT.json` is the **single compiled payload** of constitutional source-of-truth documents. It is produced by the repo and consumed by n8n. It is not hand-edited. It includes:

- **Freshness metadata:** `generated_at`, `generated_by`, `manifest_version`, `steward_context_version`, `max_context_age_minutes`
- **Source documents:** For each required document, `path`, `content`, `mtime`; for TODAY.json only, `parsed`
- **Integrity:** `all_required_present`, `all_non_empty`, `today_json_valid`, `stale` (always `false` at generation time)

The n8n Development Steward Board must read only this file. It must **not** assemble truth from multiple raw files.

--------------------------------------------------

## How it is generated

1. Run from repo root: `node scripts/build_steward_context.mjs` or `npm run steward:build`
2. The script reads `docs/automation/SOURCE_OF_TRUTH_MANIFEST.json`
3. It resolves each `required_documents` entry, checks existence and non-empty content, parses TODAY.json if applicable, records each file’s `mtime`
4. It writes `docs/runtime/STEWARD_CONTEXT.json` with version and integrity metadata
5. If any validation fails, the script exits with code 1 and does **not** write the file

Regenerate after changing any source document or the manifest so that n8n always sees up-to-date context.

--------------------------------------------------

## What makes it invalid

The compiled context is **invalid** and the steward must **not** act on it when any of the following is true:

- **Missing file:** `integrity.all_required_present` is `false`
- **Empty required doc:** `integrity.all_non_empty` is `false`
- **Bad TODAY.json:** `integrity.today_json_valid` is `false`
- **Missing version:** `steward_context_version` is missing or empty
- **Incomplete source_documents:** Fewer keys in `source_documents` than required by the manifest (e.g. fewer than 6: MASTER_VISION_BLUEPRINT, CURSOR_MEMORY, DEFINITION_OF_DONE, PHASE_ROADMAP, CURRENT_PHASE, TODAY_JSON)

If the context file does not exist, treat it as invalid.

--------------------------------------------------

## What makes it stale

The compiled context is **stale** when:

- **Age:** `generated_at` is older than `max_context_age_minutes` from now. Compute: `(now - generated_at) > max_context_age_minutes` (in minutes). If the payload does not contain `generated_at` or `max_context_age_minutes`, treat it as stale.
- **Integrity flag:** `integrity.stale` is `true` (set by a consumer that re-validates; the compiler always writes `false`)

n8n must treat stale context the same as invalid: **do not act**. Fail closed.

--------------------------------------------------

## Stale-context blocking (n8n logic)

Before using the context, the Development Steward Board must:

1. **Load** `docs/runtime/STEWARD_CONTEXT.json` (or the path provided to the workflow).
2. **If file missing:** Do not proceed; fail closed.
3. **Parse JSON.** If parse fails, do not proceed; fail closed.
4. **Check validity:**
   - If `integrity.all_required_present !== true` → fail closed.
   - If `integrity.all_non_empty !== true` → fail closed.
   - If `integrity.today_json_valid !== true` → fail closed.
   - If `steward_context_version` is missing or empty → fail closed.
   - If `source_documents` is missing or does not contain all required keys (MASTER_VISION_BLUEPRINT, CURSOR_MEMORY, DEFINITION_OF_DONE, PHASE_ROADMAP, CURRENT_PHASE, TODAY_JSON) → fail closed.
5. **Check staleness:**
   - Let `maxMinutes = payload.max_context_age_minutes` (default 60 if missing).
   - Let `generatedAt = new Date(payload.generated_at)`.
   - If `(Date.now() - generatedAt.getTime()) / 60000 > maxMinutes` → fail closed (stale).
   - If `payload.integrity.stale === true` → fail closed.
6. **Only then** use the payload for steward decisions.

--------------------------------------------------

## Fail closed

When context is **missing**, **invalid**, or **stale**, the n8n Development Steward Board must:

- Refuse to act on the context
- Not run workflows that depend on constitutional truth from this payload
- Surfaces errors or alerts as appropriate so operators regenerate context or fix sources

The manifest defines `fail_closed_if_stale`, `fail_closed_if_missing`, and `fail_closed_if_invalid` as policy; the steward implementation must enforce them.

--------------------------------------------------

END OF DOCUMENT
