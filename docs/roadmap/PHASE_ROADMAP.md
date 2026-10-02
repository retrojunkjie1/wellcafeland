# WellnessCafe OS — Execution Roadmap

**Roadmap authority:** [Master Blueprint and Definition of Done](../architecture/MASTER_VISION_BLUEPRINT.md)
**Status date:** 2026-10-02
**Purpose:** sequence delivery across the whole OS without getting stuck in one role or repeating audits without closing journeys.

The blueprint defines the vision, compartments, and exit criteria. This file is the shorter execution view. `CURRENT_PHASE.md` is the release/build diary, and `RETURN_TO_BACKLOG.md` holds open/deferred work. Existing Phase 1–6 labels remain useful capability groupings, but they are not a rule that only one part of the OS may improve at a time.

## Where we are

The build has deployed meaningful work in practitioner experience, client-shared practices, resource discovery, the app shell, themes, and tool usability. The current status is **cross-phase integration**: the OS has substantial slices, but role-to-role journeys and protected account workflows still need end-to-end validation. A successful deployment is not the same as an end-to-end verified release.

Recovery Meeting Finder work is now a bounded capability track: permission requests, admin review, manual approved-feed validation/import, publication approval, search, and audited pause/restore are deployed. Do not keep polishing this slice in isolation. Remaining feed acquisition, freshness, source partnerships, and coverage stay in the backlog; return when the broader directory milestone is selected or a concrete production issue is found.

The current work is the **pre-release Definition-of-Done build**; it is not being declared Version 1. The user has configured and enabled first-party rooms through an existing free LiveKit Build project. The free media quota is a hard cap; do not upgrade or provision paid media infrastructure without explicit direction. Complete an authorized client/practitioner call test and verify usage before broader rollout. Final V1/V2 naming and scope remain to be set at the release-planning gate.

Server-side account verification is now enforced for practitioner application entry, client-practitioner connection requests, appointment and practitioner scheduling access, practitioner/client messages, practitioner-shared support actions, and video-room token issuance. The frontend gate is no longer the only enforcement layer for these paths. Emulator authorization coverage passed and the affected callable functions are deployed. Real verification-email delivery and a production unverified-account attempt remain untested; do not call the account-verification journey fully accepted until both are checked.

### 1. Now: connect and verify the built OS

Backend emulator coverage now passes for scoped-admin application approval, client/practitioner connection, consent, messaging, support, scheduling, practice follow-up, and Firestore account boundaries. Close the real authorized client → practitioner → admin browser journey next: role-aware entry, application review, connection, consent, shared practice, client choice, scheduling, and optional follow-up. Record what is blocked by missing role claims or accounts. Fix only demonstrated access or integration gaps.

**Exit:** intended roles reach the correct workspace, server-side permission checks are demonstrated in emulators and production, consent is respected, and the current release record distinguishes passed paths from blocked ones. Emulator evidence does not substitute for production role switching or a real video-call acceptance test.

### 2. Next: simplify and complete the client journey

Connect home, check-in, personal Daily Practice, optional tool catalog, real-world assistance, and the live AI guide into a low-overload flow. Keep audio capture/playback deferred. Fix inaccurate offline or AI responses before representing them as guidance.

**Exit:** a client can find one useful next action; check-ins persist with clear confirmation; practices have distinct purposes; service failure is honest; no action strands the user.

### 3. Continue: practitioner and support-giver delivery

Finish reviewed onboarding, practical offerings, timezone-aware schedules, secure communication, consent-scoped client view, service-specific practice kits, and client-controlled follow-up. Extend public discovery only with permitted data sources and in-app source details.

**Exit:** a real practitioner/giver can be reviewed, approved, discovered, connected, and provide a client-chosen support action without crossing data boundaries.

### 4. In parallel: God-Eye and intelligence operations

Server-authoritative pause/enable controls and audit events are implemented for the five agents with production handlers; `aiSession` enforces those states, and the console derives test eligibility from the same server source. The account-wide **Custom AI sessions** switch now also gates custom session generation on the server, while clearly marking the other seven settings that still lack connected runtime behavior. Next: continue the broader console review for event health, risk visibility, and application queues. Remaining registered agents must stay explicitly marked as unsupported until their production handlers exist.

**Exit:** authorized admins can complete a review and operate the central agent system with auditable outcomes and no unnecessary access to private client content.

**Governance gate status (partially production-verified):** Alpha Owner authority is separated from delegated admin assignments. The verified Alpha Owner account is provisioned, and the live God-Eye console plus its App Check-enforced access, operations, settings, queue-count, and review callables have been confirmed. Queue counts disclose only aggregates; the meeting-source total also checks its dedicated review scope. Regional practitioner, giver, and local-help review queues now constrain Firestore reads to assigned service areas, with emulator coverage for mixed-region data. Admin access changes are recorded server-side; the Alpha Owner-only, bounded history view is now deployed and loaded successfully in the live Roles workspace. Delegated assignment lifecycle, the full Firestore Rules release, production scoped-admin access, and multi-account role tests remain open; private reflections and broad user-profile reads remain out of scope. Do not mark the governance gate complete until those boundaries have production or Rules Emulator evidence.

**Security gate status (local implementation):** Firebase App Check protects 86 callable endpoints and all nine HTTP exports from the current `functions/src/index.js` package entrypoint. A read-only live inventory found 90 active Functions (87 Gen 2 including one event trigger, 3 Gen 1: `aiMedia`, `aiSession`, `globalResourceSearchV1`) and no active broad legacy admin callables. Link preview DNS is validated and pinned to a public address, with redirects disabled and response size limited. The separate `functions/index.js` contains 12 broad v1 admin callables source-hardened for Alpha Owner + App Check, but is not the current package main or present in the live inventory. Keep guest discovery available while requiring app attestation; continue to require Firebase identity and server authorization separately. **Next:** validate emulator/debug-token workflows, inventory additional entrypoints, and verify deployed acceptance/rejection with authorized accounts. App Check is attestation, not identity verification or a replacement for authorization and rate limits. The live inventory showed names, not current App Check behavior. This gate is not released until production token behavior is verified and Functions + Hosting are deployed together.

### 5. In parallel: privacy, reliability, and compliance readiness

Finish callable/rules/Storage authorization review, secure AI endpoint identity and cost controls, account verification/recovery, retention/deletion, incident readiness, and migrate legacy Firebase Runtime Config before its March 2027 shutdown. Node.js 22 Functions runtime maintenance is deployed. Conduct formal HIPAA and 42 CFR Part 2 gap analysis; do not claim certification prematurely.

**Exit:** relevant security tests pass; privacy and operational controls are documented and reviewed; compliance claims match qualified assessment.

### 6. Finish: cohesive design, accessibility, and launch

Audit every client, practitioner, and admin route for responsive layouts, dark/light theme, legibility, keyboard/screen-reader support, useful empty/error states, and real control behavior. Remove remaining fake content and dead actions; document extension points for new tools, services, resources, and agents.

**Exit:** critical journeys pass in the deployed build for each supported role, accessibility/release gates are recorded, and limitations are visible and truthful.

## Phase 1–6 traceability

- **Phase 1 — Agent Intelligence Core:** execution roadmap item 4 and shared AI/agent criteria.
- **Phase 2 — Admin / Overseer Console:** item 4.
- **Phase 3 — Client Experience:** items 1 and 2.
- **Phase 4 — Practitioner Experience:** items 1 and 3.
- **Phase 5 — Compliance & Production:** item 5.
- **Phase 6 — Polish, Launch & Extensibility:** item 6.

## Selection rule

Pick the next tranche from the highest-risk or most-blocking end-to-end journey, then include the roles and platform services it touches. Do not reopen finished leaf screens without new evidence. Do not call a phase complete until its blueprint exit gate is evidenced in the release log.

## Hands-on acceptance test plan

For the tester-ready case list, priorities, and copyable defect report, use the [User Acceptance Test Checklist](USER_ACCEPTANCE_TEST_CHECKLIST.md).

Use this checklist during the later hands-on testing phase. Automated checks and a successful deployment do not replace these real, role-separated workflows. Record each item as **Pass**, **Fail**, **Blocked**, or **Not tested**; do not count a blocker as a pass.

### Test setup and reporting

- Use separate, authorized test accounts for a client, a practitioner, and an admin. Prepare one client with an active practitioner connection and another with no connection.
- Use test data and consented test accounts only. Do not put real clients' private reflections into tester notes or screenshots.
- Record the deployed version, account role, device/browser, theme, steps, expected result, actual result, and any error or screenshot. Keep observed defects separate from setup or access blockers.
- Test both the empty state and a real request created through the client workflow. An empty practitioner queue is correct when no eligible client request exists; it is not evidence that the accept/decline flow works.

### Client: request and manage a session

- Sign in as a client and confirm the client workspace and empty **My Sessions** state are clear and accurate.
- Find a practitioner, review their service and availability, and request an available time. Confirm the selected time is understandable in the client's timezone and the request appears as pending.
- Change practitioner, date, or session length and confirm stale or unavailable times cannot be submitted.
- Submit the same request twice or retry after a slow response. Confirm there is one request, no false success, and a clear status.
- Confirm the practitioner's accept, decline, or proposed change appears with the right status. Confirm a declined or cancelled request cannot be joined as an appointment.
- Cancel or change a request and confirm both workspaces show the same current state after refresh and a new sign-in.

### Practitioner: receive and respond

- Sign in as a practitioner and confirm the practitioner workspace is distinct from the client workspace. A practitioner without requests sees an accurate empty queue.
- Configure appointment hours and timezone, save, leave, and return. Confirm the saved settings persist and displayed appointment times convert correctly for the client.
- Create a real test request from the connected client account. Confirm it appears once in the right queue with the correct service, time, and status.
- Accept and decline separate requests. Confirm each action updates both accounts, survives refresh, and cannot be applied twice to create duplicate appointments.
- Exercise supported session formats. Check that an external link is validated and only shared with the session participants; treat an in-app video room as available only when the configured service is actually enabled.
- Confirm an unconnected client's private check-ins and reflections are not exposed in the practitioner workspace. Verify only explicitly shared information is visible and that revoked sharing is no longer accessible.

### Admin, privacy, and access boundaries

- Confirm an authorized admin can reach the God-Eye console and relevant practitioner/application review tools; a client or practitioner cannot access admin routes or data.
- Check that admin account lookup, role assignment, application review, and audit actions give clear outcomes and preserve the correct account identity.
- Verify session scheduling does not silently grant access to check-ins, AI conversations, recordings, or other sensitive client data.
- Confirm export, sharing, and consent controls apply to the correct account, can be revoked, and do not expose one client's data to another client or practitioner.

### Failure, device, and release checks

- Repeat key actions with offline/network interruption, expired sign-in, wrong role, unavailable practitioner, conflicting slot, and a retry. The app must report the actual state, preserve entered information where appropriate, and avoid duplicate or misleading success states.
- Check timezone boundaries, including a daylight-saving transition, and verify the intended local appointment time on both accounts.
- On desktop and mobile, check layout, readable type, keyboard operation, visible focus, accessible control names, and clear navigation back to the originating workspace.
- For every failed or blocked item, capture the exact route and steps. Retest the same scenario after a fix; keep separate results for client, practitioner, and admin roles.

### Completion gate

Do not mark the session workflow accepted until a tester has completed a real client request through practitioner response and verified the resulting state from both accounts, including refresh/sign-in persistence, privacy boundaries, and failure/retry behavior. Record what was not tested for the next quality pass.

## Verification record pointers

- Shipped work and verification evidence: [Current build log](../runtime/CURRENT_PHASE.md)
- Unresolved, deferred, and user-return items: [Return-to backlog](../runtime/RETURN_TO_BACKLOG.md)
- Definitions and final acceptance gates: [Master Blueprint](../architecture/MASTER_VISION_BLUEPRINT.md)
