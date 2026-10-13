# WellnessCafe OS Definition of Done

Use this checklist for every new feature, bug fix, and correction. A task is complete when its user-visible outcome works, its relevant safety and data boundaries hold, and its verification evidence is recorded.

## 1. Outcome and acceptance criteria

- State the user problem and intended outcome in plain language.
- Write observable acceptance criteria before implementation. Include expected behavior, important failure/empty/loading states, and the behavior that must remain unchanged.
- Identify the affected roles, routes, services, data, and practitioner capabilities. Do not treat a generic role label as authorization.
- For a correction, reproduce the reported issue or encode it as a regression test before changing the behavior.

## 2. Product behavior and experience

- Every visible control works, has a clear accessible name, and provides feedback for success, failure, and loading where relevant.
- Check mobile and desktop layouts, keyboard use, focus visibility, semantic structure, and screen-reader labels for the changed flow.
- Respect reduced-motion preferences and keep visual, spoken, and timed guidance synchronized when the feature uses them.
- Preserve WellnessCafe's calm, trauma-informed tone: choices remain optional, users can stop or skip, and copy does not promise clinical outcomes.
- Keep tests aligned to current product behavior. Do not preserve obsolete copy or interaction assumptions in tests.

## 3. Privacy, security, and reliability

- For sensitive or practitioner-facing features, verify authorization on the server and test both allowed and denied access.
- For consent and sharing changes, verify default-private behavior, scope boundaries, revocation, and any explicit action required to share again.
- Do not collect, log, or expose sensitive content beyond the documented purpose. Test account-switching and stale-response behavior when identity changes can race requests.
- For external services, audio, media, or network-dependent behavior, provide a truthful unavailable state and ensure the core flow remains usable when the dependency fails.
- For Firestore changes, update and validate rules and indexes; for callable changes, run the relevant emulator suite.

## 4. Required verification

Run `npm run verify:release`. It must pass:

1. Full frontend/unit regression suite (`npm test`).
2. Firestore Rules emulator suite (`npm run test:rules`).
3. Production Vite build (`npm run build`).
4. Firebase project/configuration preflight (`npm run predeploy:check`).
5. `git diff --check`.

Also run the focused tests that cover the changed behavior. For Functions, use the matching emulator scripts in `functions/package.json`; for auth, access control, consent, or data-sharing work, include positive and negative authorization cases. If no focused test exists, add one as part of the change.

## 5. Release and handoff

- A failed required check blocks release readiness. Fix the cause; do not waive a failing check by weakening/removing its assertion. A check that cannot run must be named with its blocker and remaining manual acceptance step.
- When deployment is requested, deploy the required targets and confirm the deployment command reports completion.
- Independently verify the live route or callable behavior relevant to the change. HTTP 200 alone verifies route availability, not authenticated functionality.
- Record the change, exact verification results, deployment targets, live checks, and any remaining limitations in `docs/runtime/CURRENT_PHASE.md`.
- Do not describe the overall system as HIPAA/42 CFR Part 2 compliant or clinically validated based on feature-level verification.
