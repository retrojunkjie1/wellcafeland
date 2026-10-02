# WellnessCafe OS — User Acceptance Test Checklist

Use this checklist to find real breaks in the deployed build and sort them by risk. It is a hands-on acceptance pass, not a claim that the full Definition of Done or compliance review is complete.

## How to run the test

1. Use the current production link: [wellnesscafeland.web.app](https://wellnesscafeland.web.app/). Record the release/build identifier shown in the URL or release notes and the date tested.
2. Use separate, authorized test accounts for client, practitioner, and Alpha Owner/admin. For practitioner workflows, use one connected client and one client who has not connected. Do not change real users' access.
3. Use made-up names, notes, and appointments. Do not use a real client's private reflections or personal information in tests, screenshots, or feedback.
4. Run the **Core journey** first. Then run the relevant role and device checks. You can stop and report a P0 security/privacy problem immediately.
5. Mark each case **Pass**, **Fail**, **Blocked**, **Not tested**, or **Not applicable**. “Blocked” means the test could not be run because of setup, account access, unavailable service, or missing approved data; it is not a pass.

### What to report

For each failed or blocked case, record:

- Case ID, date/time and timezone, tester role (no email address), release/build, device, browser, screen size, and theme.
- Exact route, numbered steps, synthetic test data used, expected result, and what actually happened.
- Whether it happens every time or intermittently; the sanitized error text/code; and a screenshot only if it contains no personal or secret information.
- Classify it as **Bug** (the product behaves incorrectly), **Coverage gap** (no reviewed/current listing or configured service exists), or **Setup/access blocker** (the tester lacks required account/service setup).

Do not include passwords, verification links, API keys, private client notes, or another person's email in a report.

## Priority guide

- **P0 — Stop and report:** cross-account data exposure, unauthorized role/admin access, private information visible without consent, or a session/video room accessible to the wrong person.
- **P1 — Core journey broken:** a user cannot sign in or use their intended workspace; a session request/response is lost or misrepresented; consent or cancellation does not take effect; a critical search/action fails without a truthful explanation.
- **P2 — Usability or incomplete coverage:** confusing labels/navigation, mobile/keyboard/readability problems, stale or sparse source-backed directory coverage, or a noncritical error-state defect.

## Core journey — run these first

| ID | Action | Expected result |
|---|---|---|
| C-01 | Sign in as a client, open Home, then navigate to My Sessions, Check-in, Tools, and Find Help. | The correct client workspace opens; navigation works and each page identifies its purpose. No practitioner/admin controls appear. |
| C-02 | Sign out, then sign in as a practitioner in the separate account. | The practitioner workspace appears; no client account's content carries over. Sign-out visibly ends the session. |
| C-03 | From the client account, choose a practitioner/service and request an available appointment time. Refresh both accounts. | The client sees a pending request; the connected practitioner sees the same request once, with matching service, local time, and status. |
| C-04 | As practitioner, accept the request; revisit it as the client, refresh, and sign in again. | Both accounts show the same accepted appointment and persisted state. Acceptance does not grant access to private check-ins or reflections. |
| C-05 | Make another request and decline it as practitioner; make a third request and cancel it as client. | Declined/cancelled states are clear on both sides, persist after refresh, and cannot be joined as confirmed sessions. |
| C-06 | As an unconnected client, attempt to request a session or view practitioner-shared material. | The product explains the needed connection/consent step; it does not reveal the other client's or practitioner's private data. |

## Client workspace

| ID | Action | Expected result |
|---|---|---|
| CL-01 | Create a check-in with synthetic structured choices and a fictional reflection; save, leave, and reopen history. | The check-in persists for the right account and appears in history. Optional fields can be skipped; no unsupported diagnosis, personality label, or certainty is presented. |
| CL-02 | Open Home, milestones, and weekly progress with and without saved check-ins. | Empty and populated states are both truthful; counts align with saved data; summaries do not expose reflection text or invent progress. |
| CL-03 | Start a daily practice, choose an option, continue, stop/finish, and return later. | The practice has a meaningful end/return path, controls respond once, and any saved activity is accurate and account-scoped. No hidden diagnostic interpretation is shown. |
| CL-04 | Search Find Help using a city, a state, a place name of at least three letters, and a ZIP/postal code; change the region and search again. | Input works for supported forms; results match the entered region or are clearly marked broader/unlocated. No fabricated distance or local-match claim appears. |
| CL-05 | Open a help result and inspect its contact/location actions. | The display prioritizes useful address and available phone details. Provider/source internals and irrelevant listing metadata are not exposed as user copy. Links behave as labeled and offer a clear way back. |
| CL-06 | Search a region/category with sparse or no reviewed records. | The page does not pretend the directory has coverage. It distinguishes a genuine no-listing/coverage state from a failed search service, and gives a useful next action without presenting an empty page as live results. |
| CL-07 | Open the recovery meeting finder, choose A.A. or N.A. and online/in-person, then use a meeting-source action and return. | Choice/search context remains understandable; source navigation does not strand the user; the return action brings them back to the finder. Do not treat an external directory as WellnessCafe-owned data. |
| CL-08 | Finish a guided practice, open “Need another kind of support?”, choose a check-in or Find Help, then return to the originating practice. From Find Help, choose a category and use its return action. | Alternatives stay collapsed until requested; no reflection text is passed into help search; return navigation goes to the exact local practice and never accepts an external return URL. |

## Practitioner workspace

| ID | Action | Expected result |
|---|---|---|
| PR-01 | Complete or revisit practitioner onboarding and application status. | Status is explicit (for example, draft, submitted, pending, approved, or declined); a practitioner cannot mistake an application for approval. |
| PR-02 | Set appointment days/hours and timezone, save, leave, and return. | Settings persist, compact controls are usable, and client-facing times convert correctly between timezones. |
| PR-03 | Receive a client-created request, accept it, decline a separate request, and propose a change if offered. | Each response updates the right request once; both workspaces show consistent state; duplicate clicks/retries do not create duplicate appointments. |
| PR-04 | Share a practice/tool with a connected client, then revoke sharing. | The client receives only the intended item and scope; revocation removes access; neither action opens private check-ins by implication. |
| PR-05 | Review client progress or send a follow-up, if enabled for this account. | Only explicitly consented/sharable information appears. The user can understand what is shared and can change/revoke consent. |
| PR-06 | If an appointment has in-app video enabled, join with both authorized accounts; test camera/microphone permission, leave, reconnect, and try a stranger account. | Both participants reach the same private room; permissions and reconnect behavior are understandable; an unrelated account is denied. If the deployed media service is not configured or quota blocks this, mark **Blocked — setup/service**, not Pass. |

## Admin, roles, and privacy

| ID | Action | Expected result |
|---|---|---|
| A-01 | Try an admin route and admin action as a client and as a practitioner. | Both are denied without disclosing protected records or admin-only details. |
| A-02 | Open God-Eye as the authorized Alpha Owner; inspect telemetry, access controls, and available queues. | Alpha Owner access works. Any delegated admin controls are limited to assigned scope; empty queues are described truthfully. |
| A-03 | Search for a synthetic test account and review/assign a role only if the tester is explicitly authorized. | The exact account is clear before action; role changes are audited and visible after refresh; no access is granted by a confusing or ambiguous match. Do not perform real access changes during tester runs. |
| A-04 | Inspect activity/telemetry after synthetic client actions. | Events support troubleshooting without collecting private reflection text, credentials, secret tokens, or unnecessary location data. A risk signal is not presented as proof of identity or misconduct. |
| A-05 | Review a practitioner application or a help-directory correction using a designated test record, if available. | Authorized review actions persist and have an audit trail. Testers do not publish unverified real listings or add invented local coverage. |

## Cross-device and recovery checks

| ID | Action | Expected result |
|---|---|---|
| X-01 | Repeat C-01 to C-05 on a phone-sized screen and desktop; increase text zoom; use keyboard-only navigation. | Text and controls remain readable, focus is visible, labels are understandable, and the user can navigate forward/back without losing their place. |
| X-02 | Use the menu, role/workspace switcher, profile, sign-in, and sign-out. | The menu leads to real destinations; current identity/workspace is obvious; only assigned roles can be selected. |
| X-03 | Interrupt the network during a save, submit, or response; restore it and retry once. | The UI reports pending/failure/success honestly, preserves input when appropriate, and does not create duplicates. |
| X-04 | Let the session expire, then try a protected action and return after signing in again. | The user receives a clear sign-in recovery route; private data/actions remain protected; prior state is not falsely reported as saved. |
| X-05 | Switch light/dark theme and test on a second supported browser if available. | Text, borders, controls, and focus indicators remain distinguishable and usable. Record visual polish issues separately from broken actions. |

## Suggested feedback card

Copy one card per issue or test case:

```text
Case ID:
Status: Pass / Fail / Blocked / Not tested / Not applicable
Priority (if failed): P0 / P1 / P2
Class: Bug / Coverage gap / Setup-access blocker
Date and timezone:
Release/build:
Tester role (no email):
Device / OS / browser / screen size / theme:
Route:
Steps (numbered):
Synthetic data used:
Expected:
Actual:
Repeatable? Always / Sometimes / Once
Sanitized error or screenshot filename:
Anything needed to unblock the test:
```

## Exit rule for this pass

The first meaningful pass is complete when C-01 through C-06 have results, every P0/P1 failure has a reproducible report, and each blocked item has a named setup/data dependency. Then send the completed cards back together; we can group them into **fix now**, **needs real source/service setup**, and **second-run polish** rather than reopening unrelated screens one at a time.

The existing [roadmap acceptance plan](PHASE_ROADMAP.md#hands-on-acceptance-test-plan) and [return-to backlog](../runtime/RETURN_TO_BACKLOG.md) remain the source of release gates and known deferred work.
