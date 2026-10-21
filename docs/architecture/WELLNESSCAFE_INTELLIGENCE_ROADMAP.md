# WellnessCafe Intelligence Architecture: Baseline and Gates

**Reviewed:** 2026-10-13
**Status:** Active architecture; implementation is in progress
**Purpose:** Reconcile the original intelligence-engine blueprint with behavior present in this checkout. Catalog membership and a callable handler are not evidence that a complete production workflow exists.

## Product boundary

WellnessCafe owns client-facing recovery and wellness support. Sanctum owns software construction, security, release, and engineering governance. The two systems may share engineering patterns, but their human-safety and software-security roles must not be conflated.

`callAgent(agentId, payload)` remains the canonical model-agent invocation. The new Experience Engine is a deterministic, choice-led router above it: it selects a bounded workflow from an explicit user action and calls one specialist. It does not inspect prose, infer risk, or broadcast data to an agent council. Server authorization and agent availability remain authoritative.

## What is present in the current checkout

- A shared 25-entry catalog is consumed by the browser and Firebase Functions. All 25 entries currently say `readiness: implemented`; this means catalog/handler availability in the current implementation, not that each original role is fully realized or individually proven in production.
- Firebase Functions enforce persisted pause controls and apply role checks to operational and practitioner agent paths. Agent-specific request normalizers and output checks exist for multiple handlers.
- Dedicated Functions modules and focused tests exist for many specialists. Other handlers are implemented in the shared AI service rather than a same-named module.
- The God-Eye diagnostic action now builds route-valid, non-personal smoke payloads for 24 agents and calls each stable catalog ID (the client maps it to its handler ID). Witness is deliberately excluded from synthetic admin tests because it requires an authorized provider relationship and a client's active sharing permission; it must be checked from that real workflow.
- Oracle voice check-in and voice-journal requests now preserve the agent endpoint dispatch while carrying a separate task mode. The server validates bounded transcripts and supplies fixed task instructions, so they cannot fall through to generic chat or rely on client-supplied instructions.
- Client, provider, community, privacy, and admin screens already invoke specialists for bounded jobs. These are separate handoffs today; a catalog `triggersWhen` string is descriptive metadata and does not prove that an automatic trigger or longitudinal monitor is running.
- The client product now uses `runWellnessExperience()` for 15 bounded journeys: Sentinel support routing; Hearth companionship; Lighthouse early-support cues; Healer affirmations; Shepherd connection options; Compass values; Bridge contact preparation; Steward privacy explanations; Cartographer support preferences; Translator translations; Lantern education; Anchor grounding variations; Rhythm low-energy options; Breathkeeper's fixed breathing-practice cue; and Gardener reflections on aggregate counts. Direct 911/988 options remain available without an AI call. These are explicit user-triggered handoffs, not an autonomous council.
- Witness is a deterministic, server-authorized view of client-shared numeric check-ins and practice outcomes. Provider access remains bound to the applicable permission, active relationship, and client sharing choices.

## Original engines compared with current behavior

| Original engine | Current behavior in this checkout | Remaining work |
|---|---|---|
| Overseer | Admin operational-review planner | Build the client experience conductor as a separately scoped workflow; do not expose admin powers to client sessions. |
| Seer | Aggregate operational trend review | Add a distinct, opt-in client pattern workflow over explicitly selected/shared client data; no diagnosis or hidden monitoring. |
| Oracle | General guided response handler | Define bounded reasoning inputs/outputs and explicit handoff from any permitted pattern/safety result; validate with adversarial and regression cases. |
| Sentinel | Choice-led fixed human-support routes | Preserve explicit-choice behavior. Automated crisis classification, continuous monitoring, and clinical risk levels are not implemented or claimed. |
| Cherubim | Peer-content moderation | Add shared privacy/consent policy enforcement outside the moderation-only role; keep it deterministic where feasible. |
| Healer | Optional supportive phrases for selected topics | Grow into an intervention router only after protocol, contraindication, safety fallback, and outcome contracts exist. |
| Breathkeeper / Anchor | Separate guided breathing and grounding journeys/tools | Connect only through user choice; keep natural-breathing/stop guidance and a non-AI fallback. |
| Urge Surfing | Dedicated recovery tool; values reflection may call Compass | Register the tool as a workflow capability if needed, while keeping progress private unless separately shared. |
| Trigger Tracker | Trigger-related signals and separate check-in/journal tools | Define one client-owned capture model, consent, review/edit/delete, and explicit Seer handoff. |
| Mindfulness | Meditation/practice content exists | Give it an explicit practice contract and route; avoid implying a separate AI engine exists. |
| Spiritual Council | Spiritual content/routes exist; Healer has a legacy spiritual handler ID | Restore optional, non-imposing spiritual reflection as a clearly scoped experience. Herbalist is not present as a distinct capability. |
| Scribe / Mirror | Journal prompts and user-requested reflection calls | Define the user action and content consent at each handoff; do not treat a single entry as a longitudinal pattern. |
| Cartographer | Client-selected support preferences/map | Finish user-owned review, edit, delete, and explicit sharing controls. |
| Compass / Rhythm / Gardener / Lantern / Translator | Bounded values, micro-practice, progress, education, and translation calls exist | Connect into named user journeys and validate per route; avoid claiming background habit or progress monitoring. |
| Hearth / Lighthouse | Choice-led support moments now route through the Experience Engine | Keep non-clinical and non-monitoring scope; measure workflow outcomes only with a privacy-reviewed plan. |
| Bridge | Contact-preparation assistant; separate resource directories/search exist | Connect verified resource results to preparation without claiming availability or contacting services. |
| Gatekeeper | Practitioner-selected pathway conversation aid | Provider matching, level-of-care routing, and live availability remain separate, unimplemented capabilities. |
| Witness | Consent-scoped factual timeline for providers | Preserve its no-free-text/no-inference contract and validate sharing revocation end-to-end. |
| Shepherd | User-selected community/connection support; friend groups exist | Add community governance, moderation workflows, reporting, and role-specific access before calling it community safety. |
| Towncrier | Drafts admin-reviewed announcements | Delivery/scheduling is not implemented; approval and recipient consent are required before adding it. |
| CSR | Real-help and assistance directories exist | Add a distinct barrier-navigation workflow and connect it to verified Bridge resources. |
| Pulse | Admin-requested aggregate operations review | Continuous health checks/alerts are not implemented; never imply always-on monitoring. |
| Steward | Fixed-topic privacy explanation | Retention, deletion, data quality, and lifecycle automation need independently tested controls. |
| Herald | External integrations exist | No named central integration gateway is proven. Establish allowlists, provenance, rate limits, freshness, and failure contracts before consolidation. |
| Judge | Deterministic server gates enforce authorization and agent availability before sensitive reads; Witness checks active relationship and explicit share scopes before returning client-shared data. | Extend precedence regression coverage across all sensitive workflows. Safety, authorization, and consent remain deterministic server decisions and cannot be overridden by model output. |
| Build Guardian / Deployment Guardian | Sanctum engineering responsibilities | Keep these out of the client wellness-agent roster. |
| UI/UX Director / Content Consistency | Shared design, accessibility, and content patterns exist | Turn these into release checks and content lint/evaluation rules rather than claim autonomous agents. |

## Experience Engine contract

The first wired vertical has these acceptance criteria:

1. An action ID must be allowlisted; unknown actions fail before any network request.
2. The user must choose a supported option before a model-agent call can occur.
3. The engine forwards only route-specific, validated fields. This may be a fixed choice, an allowlisted selection list, a bounded user-selected product question, or approved aggregate counts after the existing confirmation. Extra message text, history, identity, and unrelated client data are discarded.
4. One user action calls at most one specialist. No parallel council fan-out or hidden trigger is permitted.
5. The server remains authoritative for sign-in, agent pause state, App Check, and any role/data access.
6. A failed or malformed assistant response gives a truthful unavailable state; direct support links remain usable.
7. Each new route adds route-contract tests for valid choices, invalid choices, payload minimization, expected output, and unavailable behavior.

The current implementation covers the 15 named client routes above. Free-text chat, text journaling, provider/admin workflows, and automatic longitudinal monitoring are not part of this router pass. Oracle voice workflows and God-Eye diagnostics use their explicit existing server paths. These routes are a foundation, not a claim that the 25 agents are all orchestrated or production-behavior verified.

## Maturity states to use going forward

Track each engine with separate fields or evidence for:

- **Cataloged:** stable identity, scope, purpose, and owner are documented.
- **Handler-ready:** server handler exists, validates input, has access controls, and returns a bounded output.
- **Workflow-wired:** a named product journey invokes it through the approved entry point and provides success/failure behavior.
- **Behavior-verified:** focused positive, negative, privacy, safety, and unavailable cases pass against the real handler contract.
- **Production-observed:** authenticated live behavior, operational telemetry, and recovery behavior are verified for a defined window.

Do not collapse these into one `implemented` label. Do not call the complete 25+ agent system production-grade until the relevant workflow and production-observation evidence exists for each claimed capability.

## Next implementation gates

1. Voice Journal and Voice Session now gate their model handoffs behind clear user choices; Voice Session keeps a recording local until the user reviews and sends it. Privacy copy now distinguishes browser-saved chat, account conversation memory, feature-specific transcription, and practitioner sharing. Keep per-action consent for free-text routes, verify deletion/retention controls against each data store, and document the configured processors' current terms before expanding context. Keep peer-content moderation purpose-bound.
2. Specify deterministic Seer → Oracle → Healer handoffs and Sentinel precedence, with per-field consent, server-side authorization, safe fallbacks, and adversarial contract cases. Do not infer clinical risk or launch background monitoring through this work.
3. Close role-specific practitioner and organization workflows independently. Provider/admin-only handlers must stay behind server capabilities and must not be reachable through client experience IDs.
4. ✅ God-Eye now displays handler registration, local handler-contract tests, authenticated emulator workflow coverage, and production observation separately from pause state and measured run health. The static evidence ledger is separate from `useAgentsRegistryStore`; production remains 0/25 until the guarded smoke workflow supplies per-agent evidence. Keep this ledger synchronized when evidence changes.
5. Fill remaining capability gaps only where a real user workflow and data boundary exist (including trigger capture, opt-in spiritual support, herbal wellness education, and practical social-needs navigation).
6. Test each claimed workflow with authenticated production behavior and record the exact evidence; a successful handler inventory or UI button is not a passed production workflow.

## Release note for this slice

The initial three Support Hub routes have been expanded to 15 named client journeys routed through the deterministic engine, with focused UI and route-contract tests. Oracle voice dispatch and God-Eye smoke requests also have explicit contracts. Combined verification for the current source: frontend suite 113 files / 492 tests; Firestore Rules emulator 13/13; production build, Firebase predeploy checks, and `git diff --check` passed; targeted Oracle/God-Eye/Experience Engine contracts 25/25. No deployment or authenticated live workflow is included in these iterations. This architecture does not establish clinical validation, HIPAA/42 CFR Part 2 compliance, or 25/25 production workflow completion.

## Production release update — 2026-10-13

The later verified voice-consent/privacy-notice slice is now deployed to Firebase Hosting and the declared Cloud Functions, including `aiSession`; Firestore rules were released and were already current. Public home and onboarding routes returned HTTP 200, and deployed Voice Journal, Voice Session, and Privacy Policy chunks were confirmed present. This verifies release availability and the delivered consent UX, not authenticated AI behavior. The guarded 25-agent live production smoke remains pending dedicated synthetic identity/App Check credentials and pre-consented Witness records. No compliance certification or clinical validation is claimed.

## Companion direction — supplemental, not the active iteration

The long-term product direction now includes a voice-enabled wellness companion available through the web, iPhone, Android, and eventually a purpose-built physical device. This supplements the existing blueprint and does not change the active production-agent smoke gate or its acceptance criteria.

For current work, preserve the sole `callAgent(agentId, payload)` invocation boundary, `useAgentsRegistryStore` as the agent-state source of truth, reusable shared wellness journeys, and server-side authorization. Where an iteration touches voice or conversation, keep text available, require explicit microphone/send actions, show listening and playback state, and keep sensitive journals or health content out of automatic memory and spoken output. Ordinary preferences remain distinct from sensitive records.

Mobile delivery, companion-specific persistent memory with explicit consent/correction/deletion/retention controls, opt-in proactive check-ins, and physical-device evaluation belong to separately scoped future iterations. Always-on listening, background monitoring, cameras, robotics, and autonomous physical actions remain deferred. The current production smoke still requires dedicated synthetic accounts, a pre-consented synthetic Witness relationship, fresh credentials, and an evidenced 25/25 result.
