# WellnessCafe Recovery Meeting Directory

## Product boundary

The A.A./N.A. finder is its own support destination at `/recovery/meetings`. It must not use the broad web-resource search or blend results with SMART Recovery, treatment programs, SAMHSA, or general assistance. A.A. and N.A. remain separately selectable, as do online and in-person meetings.

## Data ownership and trust

“WellnessCafe owns the directory” means WellnessCafe owns the normalized index, search experience, freshness monitoring, correction workflow, and audit trail. It does not mean copying meeting records from websites without permission. Meeting names, locations, times, access links, and group-level contact details can be sensitive and can change quickly. Do not invent sample listings or scrape behind access controls, terms, or technical limits.

### Source onboarding

1. Request opt-in data sharing from an A.A. intergroup/central office or N.A. local community/service body.
2. Prefer an official published feed or written permission to import a feed. For A.A., support the non-proprietary Meeting Guide JSON feed format and respect its anonymity requirements. For N.A. in-person data, work with the local community because NA World Services does not maintain a central in-person database. Use the official NAWS virtual finder until an approved structured feed is available.
3. Record source owner, feed URL, allowed use, coverage area, contact/correction path, retrieval time, source update time, and last successful import.
4. Validate records, detect removals/changes, preserve source identifiers, and expose freshness state. Do not mark a meeting “verified” merely because a page was reachable.
5. Pause stale feeds and explain the last confirmed update. Keep the official source locator available as fallback.

### WellnessCafe source requests

- `/recovery/meetings/share-source` accepts submissions from signed-in, non-anonymous accounts representing a local service entity. Requests include coverage, a private reply address, the submitter's stated authority, and an explicit attestation. A feed link is optional when the submitter chooses “I'm not sure yet”; technical names are explained in plain language.
- Requests are stored server-side in `recovery_meeting_source_applications`; clients can retrieve only their own organization, fellowship, coverage, and review status. Contact details and permission statements are never returned to meeting seekers.
- Admins review the request at `/admin/recovery-meeting-sources`. A recorded permission approval means only that an administrator documented the authority check. It does not activate a source, import records, or publish a listing.
- Admins can upload a copy of a permission-approved Meeting Guide JSON file (maximum 1 MB, 2,000 records) for an in-memory structure check. The check reports required fields, schedule/location completeness, duplicate IDs, and free-text notes that need privacy review. The check itself does not save feed contents; only a small count-and-issues summary and an audit event are retained. This does not verify the source's ownership, prove every listing accurate, import records, or publish meetings.
- After the check, an admin can record a privacy/quality review and save a sanitized private preview. It excludes free-text notes and is visible only through the admin review function. Preview status does not make listings searchable; public publishing remains a separate approval gate.
- A separate admin publication action requires a final review note. It copies only normalized public listing fields into the server-only `recovery_meetings` index, then changes that source's active revision pointer. Search uses only rows matching the active pointer, so a refreshed feed switches as one logical release; old rows are removed after the pointer changes. Re-publishing the same revision is rejected. Publication does not fetch the submitted URL or claim that the source's content is complete or independently verified.
- Admins can pause a published source with a documented reason. The server changes its source pointer to `paused`, so its records immediately stop appearing in search while remaining available for a safe re-review. Restoring requires a separate note confirming current permission and listing review; the prior pause decision remains in the audit history. A new feed revision cannot be published while paused until the currently published source has been explicitly restored after review.
- Published records and source pointers are callable-function-only in Firestore. The public finder searches A.A. and N.A. authorized feeds separately; N.A. results are combined with the existing public BMLT search. If no A.A. result is available in our approved index, the official finder remains the user-facing fallback. There are no seeded records.
- BMLT sources do not use this file check. Their connection and import flow remains a separate build item. Do not fetch submitted feed URLs from the app server until an SSRF-safe fetcher, schema validator, privacy filter, freshness monitor, and correction/removal workflow are implemented and reviewed.
- All submission and review decisions create records in `recovery_meeting_source_audit`. The permission application and audit collections are accessed through callable functions using the Firebase Admin SDK; clients must not read/write them directly.

### Rights and archive boundary

- A public web page or Wayback capture is not, by itself, permission to republish its meeting records. The Internet Archive says it does not guarantee an item's copyright status and puts reuse responsibility on the user.
- A.A.W.S. terms say A.A.W.S. copyrighted material cannot be posted online beyond the stated limited uses without written permission. Meeting listings shown through its service are supplied by third-party service entities, which are responsible for accuracy and update quality.
- The Meeting Guide JSON format is non-proprietary and encouraged for interoperability. That describes the format; it does not automatically license every meeting feed's contents. Keep source-specific permission on record.
- Import only public information the responsible service body intentionally exposes for reuse or has specifically authorized. Do not import member identities, attendance, passwords, or private meeting details.

## Canonical record shape

```ts
type RecoveryMeeting = {
  id: string;                       // stable source ID, namespaced by source
  fellowship: "AA" | "NA";
  name: string;
  schedule: Array<{ day: 0|1|2|3|4|5|6; start: string; end?: string; timezone: string }>;
  format: "in-person" | "online" | "hybrid";
  language?: string[];
  meetingTypes?: string[];
  access?: { openClosed?: string; accessibility?: string[]; notes?: string };
  location?: { label?: string; address?: string; city?: string; region?: string; postalCode?: string; country?: string; lat?: number; lng?: number; approximate?: boolean };
  online?: { joinUrl?: string; phone?: string; instructions?: string };
  source: { entity: string; url: string; recordUrl?: string; permissionRef: string; updatedAt?: string; importedAt: string };
  status: "active" | "stale" | "removed" | "needs-review";
};
```

Avoid member names, attendance, recovery status, or other personal data. Meeting search should not require sign-in and should not save a user's location without explicit consent.

## Current implementation and honest limitation

The page provides distinct A.A./N.A. and online/in-person flows. Both fellowships first search permission-approved WellnessCafe listings through the backend; the entered area is not saved. N.A. results also query public BMLT listings. If the approved directory has no A.A. match, the official finder remains available inside an in-app viewer. The viewer keeps the WellnessCafe search state underneath, has a persistent **Back to results** control, closes with Escape, and offers **Open in browser** if the source blocks embedding. The A.A. area is not automatically forwarded to another site.

No first-party meeting listings are seeded or claimed as complete. The authorized in-app index is operational for approved feeds, but its coverage depends on service entities opting in. A.A. states that local service entities maintain detailed listings and that Meeting Guide syncs participating sources. N.A. World Services states it does not maintain a central in-person meeting database. The next data milestone is feed freshness monitoring, corrections/withdrawals, and broader region-by-region source participation. A global-completeness claim requires broad participation, not web scraping.
