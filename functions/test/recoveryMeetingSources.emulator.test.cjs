const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-meeting-sources";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const sources = require("../src/recoveryMeetingSources");
const submit = sources.submitRecoveryMeetingSource.run;
const listMine = sources.listMyRecoveryMeetingSources.run;
const listAdmin = sources.listRecoveryMeetingSourcesForAdmin.run;
const review = sources.reviewRecoveryMeetingSource.run;
const validateFeed = sources.validateRecoveryMeetingSourceFeed.run;
const stageFeed = sources.stageRecoveryMeetingSourceFeed.run;
const publishFeed = sources.publishRecoveryMeetingSourceFeed.run;
const setPublication = sources.setRecoveryMeetingSourcePublication.run;
const { _searchPublishedDirectory } = require("../src/recoveryMeetings");

const applicant = { uid: "source-owner", token: { firebase: { sign_in_provider: "password" } } };
const adminAuth = { uid: "source-reviewer", token: { godAdmin: true } };
const clientAuth = { uid: "ordinary-client", token: { role: "client" } };
const validRequest = {
  organization: "North County Intergroup", fellowship: "aa", sourceType: "meeting-guide-json",
  coverage: "North County and nearby towns", feedUrl: "https://meetings.example.org/feed.json",
  organizationUrl: "https://example.org", sourceContactName: "Service secretary",
  contactEmail: "service@example.org", permissionBasis: "The intergroup board approved public feed sharing on September 1.",
  authorizedToShare: true,
};

async function clearCollection(name) {
  const snapshot = await db.collection(name).get();
  if (snapshot.empty) return;
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

async function clean() {
  await Promise.all(["recovery_meeting_source_applications", "recovery_meeting_source_audit", "recovery_meeting_directory_sources", "recovery_meetings"].map(clearCollection));
}

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Run this suite through the Firestore emulator");
  await clean();
});
beforeEach(clean);
after(async () => { await clean(); await admin.app().delete(); });

test("submission requires an account, an authorized public HTTPS feed, and explicit attestation", async () => {
  await assert.rejects(submit({ data: validRequest }), (error) => error.code === "unauthenticated");
  await assert.rejects(submit({ auth: { uid: "guest", token: { firebase: { sign_in_provider: "anonymous" } } }, data: validRequest }), (error) => error.code === "failed-precondition");
  await assert.rejects(submit({ auth: applicant, data: { ...validRequest, feedUrl: "http://meetings.example.org/feed.json" } }), (error) => error.code === "invalid-argument");
  await assert.rejects(submit({ auth: applicant, data: { ...validRequest, feedUrl: "", sourceType: "bmlt-root-server" } }), (error) => error.code === "invalid-argument");
  await assert.rejects(submit({ auth: applicant, data: { ...validRequest, authorizedToShare: false } }), (error) => error.code === "failed-precondition");

  const result = await submit({ auth: applicant, data: validRequest });
  assert.equal(result.status, "pending");
  const stored = await db.collection("recovery_meeting_source_applications").doc(result.applicationId).get();
  assert.equal(stored.get("contactEmail"), "service@example.org");
  assert.equal(stored.get("status"), "pending");
  assert.equal((await db.collection("recovery_meeting_source_audit").get()).size, 1);

  const unsure = await submit({ auth: { ...applicant, uid: "unsure-source-owner" }, data: { ...validRequest, sourceType: "unknown", feedUrl: "" } });
  const unsureStored = await db.collection("recovery_meeting_source_applications").doc(unsure.applicationId).get();
  assert.equal(unsureStored.get("sourceType"), "unknown");
  assert.equal(unsureStored.get("feedUrl"), "");
});

test("applicants see only their own request status, not private review or contact fields", async () => {
  const result = await submit({ auth: applicant, data: validRequest });
  await submit({ auth: { ...applicant, uid: "another-owner" }, data: { ...validRequest, feedUrl: "https://second.example.org/feed.json" } });
  const mine = await listMine({ auth: applicant, data: {} });
  assert.deepEqual(mine.applications.map(({ id }) => id), [result.applicationId]);
  assert.equal(mine.applications[0].organization, "North County Intergroup");
  assert.equal("contactEmail" in mine.applications[0], false);
  assert.equal("permissionBasis" in mine.applications[0], false);
  assert.equal("feedUrl" in mine.applications[0], false);
});

test("only admins review; permission approval records evidence but does not import or publish listings", async () => {
  const result = await submit({ auth: applicant, data: validRequest });
  await assert.rejects(listAdmin({ auth: clientAuth, data: { status: "pending" } }), (error) => error.code === "permission-denied");
  await assert.rejects(review({ auth: clientAuth, data: { applicationId: result.applicationId, decision: "approve-permission", reviewerNote: "Checked board authorization." } }), (error) => error.code === "permission-denied");
  const requests = await listAdmin({ auth: adminAuth, data: { status: "pending" } });
  assert.equal(requests.applications.length, 1);
  assert.equal(requests.applications[0].contactEmail, "service@example.org");

  await assert.rejects(review({ auth: adminAuth, data: { applicationId: result.applicationId, decision: "approve-permission", reviewerNote: "Too short." } }), (error) => error.code === "invalid-argument");
  const approval = await review({ auth: adminAuth, data: { applicationId: result.applicationId, decision: "approve-permission", reviewerNote: "Checked board minutes and confirmed the named contact is authorized." } });
  assert.equal(approval.status, "permission-approved");
  const saved = await db.collection("recovery_meeting_source_applications").doc(result.applicationId).get();
  assert.equal(saved.get("status"), "permission-approved");
  assert.equal(saved.get("reviewedBy"), "source-reviewer");
  assert.equal((await db.collection("recovery_meetings").get()).size, 0);
  await assert.rejects(review({ auth: adminAuth, data: { applicationId: result.applicationId, decision: "decline", reviewerNote: "Second decision should be blocked for safety." } }), (error) => error.code === "failed-precondition");
  assert.equal((await db.collection("recovery_meeting_source_audit").get()).size, 2);
});

test("approved Meeting Guide files are checked without storing or publishing their records", async () => {
  const result = await submit({ auth: applicant, data: validRequest });
  const feedText = JSON.stringify([{
    name: "Sunday Serenity", slug: "sunday-serenity", day: 0, time: "18:00",
    location: "Community Center", address: "123 Main Street", city: "Anytown", state: "CO", country: "US",
    notes: "Use the north entrance.",
  }]);
  await assert.rejects(validateFeed({ auth: adminAuth, data: { applicationId: result.applicationId, feedText } }), (error) => error.code === "failed-precondition");
  await assert.rejects(validateFeed({ auth: clientAuth, data: { applicationId: result.applicationId, feedText } }), (error) => error.code === "permission-denied");
  await review({ auth: adminAuth, data: { applicationId: result.applicationId, decision: "approve-permission", reviewerNote: "Verified the service body authorization statement and contact." } });
  const checked = await validateFeed({ auth: adminAuth, data: { applicationId: result.applicationId, feedText } });
  assert.equal(checked.status, "needs-review");
  assert.equal(checked.recordCount, 1);
  assert.match(checked.warnings[0], /free-text notes/);
  const saved = await db.collection("recovery_meeting_source_applications").doc(result.applicationId).get();
  assert.equal(saved.get("feedValidationStatus"), "needs-review");
  assert.equal(saved.get("feedValidation.recordCount"), 1);
  assert.equal(JSON.stringify(saved.data()).includes("Sunday Serenity"), false);
  assert.equal((await db.collection("recovery_meetings").get()).size, 0);
  assert.equal((await db.collection("recovery_meeting_source_audit").get()).size, 3);
});

test("Meeting Guide checks reject malformed feeds and oversized uploads", async () => {
  const result = await submit({ auth: applicant, data: validRequest });
  await review({ auth: adminAuth, data: { applicationId: result.applicationId, decision: "approve-permission", reviewerNote: "Verified the service body authorization statement and contact." } });
  const malformed = await validateFeed({ auth: adminAuth, data: { applicationId: result.applicationId, feedText: "not-json" } });
  assert.equal(malformed.status, "failed");
  assert.match(malformed.errors[0], /valid JSON/);
  const tooLarge = await validateFeed({ auth: adminAuth, data: { applicationId: result.applicationId, feedText: " ".repeat(1024 * 1024 + 1) } });
  assert.equal(tooLarge.status, "failed");
  assert.match(tooLarge.errors[0], /1 MB or smaller/);
});

test("admins can save a sanitized private preview only after source permission is approved", async () => {
  const result = await submit({ auth: applicant, data: validRequest });
  const feedText = JSON.stringify([{
    name: "Sunday Serenity", slug: "sunday-serenity", day: [0, 3], time: "18:00", timezone: "America/Denver",
    location: "Community Center", address: "123 Main Street", city: "Anytown", state: "CO", postal_code: "80000", country: "US",
    conference_url: "https://meetings.example.org/join", notes: "Never store this note in the preview.",
  }]);
  await assert.rejects(stageFeed({ auth: adminAuth, data: { applicationId: result.applicationId, feedText, reviewerNote: "Reviewed the notes for privacy." } }), (error) => error.code === "failed-precondition");
  await review({ auth: adminAuth, data: { applicationId: result.applicationId, decision: "approve-permission", reviewerNote: "Verified the service body authorization statement and contact." } });
  await assert.rejects(stageFeed({ auth: clientAuth, data: { applicationId: result.applicationId, feedText, reviewerNote: "Reviewed the notes for privacy and listing quality." } }), (error) => error.code === "permission-denied");
  await assert.rejects(stageFeed({ auth: adminAuth, data: { applicationId: result.applicationId, feedText, reviewerNote: "Too short." } }), (error) => error.code === "invalid-argument");

  const staged = await stageFeed({ auth: adminAuth, data: { applicationId: result.applicationId, feedText, reviewerNote: "Reviewed the sample notes and checked for identifying details." } });
  assert.equal(staged.status, "awaiting-publication-review");
  assert.equal(staged.recordCount, 1);
  assert.equal(staged.preview[0].weekdays.length, 2);
  assert.equal(staged.preview[0].venueType, 3);
  assert.equal(JSON.stringify(staged).includes("Never store this note"), false);

  const adminQueue = await listAdmin({ auth: adminAuth, data: { status: "permission-approved" } });
  assert.equal(adminQueue.applications[0].stagedFeed.status, "awaiting-publication-review");
  const privateRecords = await db.collection("recovery_meeting_source_applications").doc(result.applicationId)
    .collection("staged_feeds").doc("current").collection("meetings").get();
  assert.equal(privateRecords.size, 1);
  assert.equal(privateRecords.docs[0].get("notes"), undefined);
  assert.equal((await db.collection("recovery_meetings").get()).size, 0);
  assert.equal((await db.collection("recovery_meeting_source_audit").get()).size, 3);
});

test("publication is admin-only, activates the staged revision, and exposes only sanitized searchable records", async () => {
  const result = await submit({ auth: applicant, data: validRequest });
  const feedText = JSON.stringify([{
    name: "Sunday Serenity", slug: "sunday-serenity", day: [0, 3], time: "18:00", timezone: "America/Denver",
    location: "Community Center", address: "123 Main Street", city: "Anytown", state: "CO", postal_code: "80000", country: "US",
    conference_url: "https://meetings.example.org/join", notes: "Do not include this private host note.",
  }]);
  await review({ auth: adminAuth, data: { applicationId: result.applicationId, decision: "approve-permission", reviewerNote: "Verified the service body authorization statement and contact." } });
  await assert.rejects(publishFeed({ auth: clientAuth, data: { applicationId: result.applicationId, reviewerNote: "Confirmed permissions and reviewed each public listing for private member details." } }), (error) => error.code === "permission-denied");
  await assert.rejects(publishFeed({ auth: adminAuth, data: { applicationId: result.applicationId, reviewerNote: "Short note." } }), (error) => error.code === "invalid-argument");
  await assert.rejects(publishFeed({ auth: adminAuth, data: { applicationId: result.applicationId, reviewerNote: "Confirmed permissions and reviewed each public listing for private member details." } }), (error) => error.code === "failed-precondition");

  await stageFeed({ auth: adminAuth, data: { applicationId: result.applicationId, feedText, reviewerNote: "Reviewed sample rows and removed details about members and attendance." } });
  const published = await publishFeed({ auth: adminAuth, data: { applicationId: result.applicationId, reviewerNote: "Confirmed authorization and reviewed locations, links, and public listing content for member details." } });
  assert.equal(published.status, "published");
  assert.equal(published.recordCount, 1);
  const directory = await db.collection("recovery_meeting_directory_sources").doc(result.applicationId).get();
  assert.equal(directory.get("status"), "active");
  assert.equal(directory.get("activeRevision"), published.revisionId);
  const publicRecords = await db.collection("recovery_meetings").get();
  assert.equal(publicRecords.size, 1);
  assert.equal(publicRecords.docs[0].get("name"), "Sunday Serenity");
  assert.equal(publicRecords.docs[0].get("fellowship"), "aa");
  assert.equal(publicRecords.docs[0].get("notes"), undefined);
  assert.equal(JSON.stringify(publicRecords.docs[0].data()).includes("private host note"), false);

  const matches = await _searchPublishedDirectory("Anytown, CO", "online", "aa");
  assert.equal(matches.length, 1);
  assert.equal(matches[0].name, "Sunday Serenity");
  assert.equal(matches[0].weekdays.join(","), "0,3");
  assert.equal("sourceId" in matches[0], false);
  await assert.rejects(publishFeed({ auth: adminAuth, data: { applicationId: result.applicationId, reviewerNote: "Confirmed authorization and reviewed locations, links, and public listing content for member details." } }), (error) => error.code === "already-exists");
});

test("publishing a revised feed switches the active revision and retires the prior public rows", async () => {
  const result = await submit({ auth: applicant, data: validRequest });
  await review({ auth: adminAuth, data: { applicationId: result.applicationId, decision: "approve-permission", reviewerNote: "Verified the service body authorization statement and contact." } });
  const note = "Reviewed sample rows and removed details about members and attendance.";
  const publicationNote = "Confirmed authorization and reviewed locations, links, and public listing content for member details.";
  const feed = (name, city) => JSON.stringify([{ name, slug: "weekly-group", day: 2, time: "18:00", location: "Community Center", address: "123 Main Street", city, state: "CO", country: "US" }]);
  await stageFeed({ auth: adminAuth, data: { applicationId: result.applicationId, feedText: feed("First listing", "Anytown"), reviewerNote: note } });
  const first = await publishFeed({ auth: adminAuth, data: { applicationId: result.applicationId, reviewerNote: publicationNote } });
  await stageFeed({ auth: adminAuth, data: { applicationId: result.applicationId, feedText: feed("Updated listing", "Newtown"), reviewerNote: note } });
  const second = await publishFeed({ auth: adminAuth, data: { applicationId: result.applicationId, reviewerNote: publicationNote } });
  assert.notEqual(first.revisionId, second.revisionId);
  assert.equal((await _searchPublishedDirectory("Anytown, CO", "in-person", "aa")).length, 0);
  const active = await _searchPublishedDirectory("Newtown, CO", "in-person", "aa");
  assert.equal(active.length, 1);
  assert.equal(active[0].name, "Updated listing");
  const rows = await db.collection("recovery_meetings").where("sourceId", "==", result.applicationId).get();
  assert.equal(rows.size, 1);
  assert.equal(rows.docs[0].get("revisionId"), second.revisionId);
});

test("admins can pause and restore a published source with a recorded fresh review", async () => {
  const result = await submit({ auth: applicant, data: validRequest });
  await review({ auth: adminAuth, data: { applicationId: result.applicationId, decision: "approve-permission", reviewerNote: "Verified the service body authorization statement and contact." } });
  await stageFeed({ auth: adminAuth, data: {
    applicationId: result.applicationId,
    feedText: JSON.stringify([{ name: "Sunday Serenity", slug: "sunday-serenity", day: 0, time: "18:00", location: "Community Center", address: "123 Main Street", city: "Anytown", state: "CO", country: "US" }]),
    reviewerNote: "Reviewed sample rows for privacy and removed any member-identifying details.",
  } });
  await publishFeed({ auth: adminAuth, data: { applicationId: result.applicationId, reviewerNote: "Confirmed authorization and reviewed locations, links, and listing content for member details." } });

  await assert.rejects(setPublication({ auth: clientAuth, data: { applicationId: result.applicationId, action: "pause", reviewerNote: "The listing source permission needs to be reviewed now." } }), (error) => error.code === "permission-denied");
  await assert.rejects(setPublication({ auth: adminAuth, data: { applicationId: result.applicationId, action: "pause", reviewerNote: "Too short." } }), (error) => error.code === "invalid-argument");
  const paused = await setPublication({ auth: adminAuth, data: { applicationId: result.applicationId, action: "pause", reviewerNote: "The service body reported a possible feed change; hide these listings until the contact confirms current permission." } });
  assert.equal(paused.status, "paused");
  assert.equal((await _searchPublishedDirectory("Anytown, CO", "in-person", "aa")).length, 0);
  const pauseAudit = (await db.collection("recovery_meeting_source_audit").where("event", "==", "feed-paused").get()).docs[0];
  assert.equal(pauseAudit.get("actorUid"), "source-reviewer");
  assert.match(pauseAudit.get("reviewerNote"), /reported a possible feed change/);

  await assert.rejects(setPublication({ auth: adminAuth, data: { applicationId: result.applicationId, action: "pause", reviewerNote: "This is a repeated pause and should not be accepted." } }), (error) => error.code === "failed-precondition");
  await assert.rejects(setPublication({ auth: adminAuth, data: { applicationId: result.applicationId, action: "restore", reviewerNote: "Not fresh yet." } }), (error) => error.code === "invalid-argument");
  const restored = await setPublication({ auth: adminAuth, data: { applicationId: result.applicationId, action: "restore", reviewerNote: "Rechecked the service contact and confirmed permission; reviewed each published time and location for current accuracy." } });
  assert.equal(restored.status, "active");
  assert.equal((await _searchPublishedDirectory("Anytown, CO", "in-person", "aa")).length, 1);
  const directory = await db.collection("recovery_meeting_directory_sources").doc(result.applicationId).get();
  assert.equal(directory.get("status"), "active");
  assert.equal(directory.get("pauseReason"), undefined);
  assert.ok(directory.get("restoredAt"));
  assert.equal((await db.collection("recovery_meeting_source_audit").where("event", "==", "feed-restored").get()).size, 1);

  const listed = await listAdmin({ auth: adminAuth, data: { status: "permission-approved" } });
  assert.equal(listed.applications[0].directoryStatus, "active");
  assert.equal(listed.applications[0].publishedRecordCount, 1);
});
