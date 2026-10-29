# Private friend groups and invitations

## User outcome

A client can share WellnessCafe with a friend, create a small private group, and invite a person to join without automatically exposing check-ins, reflections, practitioner relationships, or other account activity.

## MVP definition of done

- A verified account can create a group with a short name and optional note.
- The group is invite-only, capped at 12 members, and visible only through callable responses to current members.
- The group owner can create a single-use invite URL that expires after seven days; a new link replaces the older link, and the owner can disable the active link.
- The invited person can preview the group before signing in, then must create/sign in to an account, verify their email, and explicitly accept before membership is created.
- The membership grant shares only group membership. It does not grant practitioner access or share private account data.
- Invalid, used, expired, replaced, and disabled links have a human-readable recovery state.
- Invite tokens are generated and hashed server-side; Firestore client access to groups, memberships, invites, and audit records stays denied.
- The UI offers native share when available and a visible copyable link fallback. The generic WellnessCafe referral link is not tracked and promises no reward.

## Source implementation status — 2026-10-13

Source now includes callable-only create/list/invite/preview/accept/revoke operations, a private group panel on `/circles`, an invitation preview that works before account creation, explicit acceptance, account verification and App Check boundaries, a 12-person limit, a seven-day single-use link, and transactional content-free audit actions. Members can read and post group messages after moderation; organizers can remove members, transfer ownership, or close a group when they are its sole member. A member can leave without organizer status. Members can block or unblock one another within a group, delete their own messages, and submit a rate-limited report. Reports save a message reference and reason without copying message text; authorized admins review and resolve reports in the God-Eye human review queue. Message writes recheck membership after moderation to prevent a removed member from posting during the review window.

Focused emulator checks cover invitation consent and verification, two-account single-use invite contention, member-only message access, block/unblock filtering, author-only deletion, report review, remove/leave/transfer/close lifecycle actions, and Firestore client rules (13 rules tests). The client suite passed (110 files, 467 tests), and the production build passed. On 2026-10-13, Hosting, Firestore rules/indexes, and the 18 private-group callables were deployed to Firebase project `wellnesscafelanding`; the live `/circles` route loaded successfully. A signed-in two-account walkthrough is still needed: the browser session used for the live check was not email-verified, so it correctly could not create or view groups. Long-term message retention policy and practitioner dashboard improvements remain separate open work.
