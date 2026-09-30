const admin = require("firebase-admin");
const { randomUUID } = require("node:crypto");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { validateMeetingGuideText } = require("./meetingGuideValidation");
const { requireAdminScope } = require("./adminAuthorization");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const REGION = "us-central1";
const SOURCE_TYPES = new Set(["meeting-guide-json", "bmlt-root-server", "unknown"]);
const FELLOWSHIPS = new Set(["aa", "na"]);

function clean(value, max = 240) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function httpsUrl(value, label, required = false) {
  const raw = clean(value, 500);
  if (!raw && !required) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password || url.hostname === "localhost" || url.hostname.endsWith(".local")) throw new Error("invalid");
    return url.toString();
  } catch {
    throw new HttpsError("invalid-argument", `${label} must be a public HTTPS link.`);
  }
}

function requireAccount(request) {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Sign in to submit or view a source request.");
  if (request.auth.token?.firebase?.sign_in_provider === "anonymous") {
    throw new HttpsError("failed-precondition", "Use a personal account to submit a meeting source.");
  }
  return request.auth.uid;
}

function validEmail(value) {
  const email = clean(value, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpsError("invalid-argument", "Enter a work email for the service entity.");
  return email;
}

const submitRecoveryMeetingSource = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireAccount(request);
  const data = request.data || {};
  const organization = clean(data.organization, 120);
  const fellowship = clean(data.fellowship, 8).toLowerCase();
  const sourceType = clean(data.sourceType, 40);
  const coverage = clean(data.coverage, 180);
  const permissionBasis = clean(data.permissionBasis, 800);
  const contactEmail = validEmail(data.contactEmail);
  const feedUrl = httpsUrl(data.feedUrl, "Meeting-list link", sourceType !== "unknown");
  const organizationUrl = httpsUrl(data.organizationUrl, "Organization website");
  const sourceContactName = clean(data.sourceContactName, 100);

  if (organization.length < 2) throw new HttpsError("invalid-argument", "Enter the service entity or group name.");
  if (!FELLOWSHIPS.has(fellowship)) throw new HttpsError("invalid-argument", "Choose A.A. or N.A.");
  if (!SOURCE_TYPES.has(sourceType)) throw new HttpsError("invalid-argument", "Choose a meeting-list sharing option.");
  if (coverage.length < 2) throw new HttpsError("invalid-argument", "Describe the cities or regions covered by this feed.");
  if (permissionBasis.length < 20) throw new HttpsError("invalid-argument", "Describe your authority to share this feed (at least 20 characters).");
  if (data.authorizedToShare !== true) throw new HttpsError("failed-precondition", "Confirm that the service entity has authorized sharing this public feed.");

  const existing = await db.collection("recovery_meeting_source_applications")
    .where("submittedBy", "==", uid).limit(25).get();
  if (existing.docs.some((doc) => doc.get("feedUrl") === feedUrl && !["declined", "withdrawn"].includes(doc.get("status")))) {
    throw new HttpsError("already-exists", "This feed already has an active request. You can check its status below.");
  }

  const ref = db.collection("recovery_meeting_source_applications").doc();
  const now = admin.firestore.FieldValue.serverTimestamp();
  await db.runTransaction(async (transaction) => {
    transaction.create(ref, {
      organization, fellowship, sourceType, coverage, feedUrl, organizationUrl,
      contactEmail, sourceContactName, permissionBasis,
      authorizedToShare: true, status: "pending", submittedBy: uid,
      submittedAt: now, updatedAt: now,
    });
    transaction.create(db.collection("recovery_meeting_source_audit").doc(), {
      sourceId: ref.id, actorUid: uid, event: "submitted", createdAt: now,
    });
  });
  return { ok: true, applicationId: ref.id, status: "pending" };
});

const listMyRecoveryMeetingSources = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireAccount(request);
  const snapshot = await db.collection("recovery_meeting_source_applications")
    .where("submittedBy", "==", uid).orderBy("submittedAt", "desc").limit(25).get();
  return { applications: snapshot.docs.map((doc) => ({
    id: doc.id,
    organization: doc.get("organization") || "",
    fellowship: doc.get("fellowship") || "",
    coverage: doc.get("coverage") || "",
    status: doc.get("status") || "pending",
    submittedAt: doc.get("submittedAt")?.toDate?.().toISOString() || null,
  })) };
});

const listRecoveryMeetingSourcesForAdmin = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  await requireAdminScope(request, "meeting_sources.manage");
  const status = clean(request.data?.status, 32);
  let query = db.collection("recovery_meeting_source_applications").orderBy("submittedAt", "desc").limit(100);
  if (["pending", "permission-approved", "declined"].includes(status)) {
    query = db.collection("recovery_meeting_source_applications").where("status", "==", status).orderBy("submittedAt", "desc").limit(100);
  }
  const snapshot = await query.get();
  const applications = await Promise.all(snapshot.docs.map(async (doc) => {
    const staged = await doc.ref.collection("staged_feeds").doc("current").get();
    const directory = await db.collection("recovery_meeting_directory_sources").doc(doc.id).get();
    return {
      id: doc.id, ...doc.data(), submittedAt: doc.get("submittedAt")?.toDate?.().toISOString() || null,
      stagedFeed: staged.exists ? staged.data() : null,
      directoryStatus: directory.exists ? directory.get("status") : "unpublished",
      publishedRecordCount: directory.exists ? directory.get("recordCount") || 0 : 0,
      publishedAt: directory.exists ? directory.get("publishedAt")?.toDate?.().toISOString() || null : null,
      pausedAt: directory.exists ? directory.get("pausedAt")?.toDate?.().toISOString() || null : null,
      pauseReason: directory.exists ? directory.get("pauseReason") || "" : "",
    };
  }));
  return { applications };
});

const reviewRecoveryMeetingSource = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const { uid: adminUid } = await requireAdminScope(request, "meeting_sources.manage");
  const id = clean(request.data?.applicationId, 120);
  const decision = clean(request.data?.decision, 24);
  const reviewerNote = clean(request.data?.reviewerNote, 1000);
  if (!id || !["approve-permission", "decline"].includes(decision)) throw new HttpsError("invalid-argument", "Choose a source request and review outcome.");
  if (reviewerNote.length < 20) throw new HttpsError("invalid-argument", "Record what was checked before saving this decision.");
  const ref = db.collection("recovery_meeting_source_applications").doc(id);
  const now = admin.firestore.FieldValue.serverTimestamp();
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new HttpsError("not-found", "This source request is no longer available.");
    if (snapshot.get("status") !== "pending") throw new HttpsError("failed-precondition", "This source request has already been reviewed.");
    transaction.update(ref, {
      status: decision === "approve-permission" ? "permission-approved" : "declined",
      reviewerNote, reviewedBy: adminUid, reviewedAt: now, updatedAt: now,
    });
    transaction.create(db.collection("recovery_meeting_source_audit").doc(), {
      sourceId: id, actorUid: adminUid, event: decision, createdAt: now,
    });
  });
  return { ok: true, status: decision === "approve-permission" ? "permission-approved" : "declined" };
});

const validateRecoveryMeetingSourceFeed = onCall({ region: REGION, memory: "512MiB", timeoutSeconds: 30, enforceAppCheck: true }, async (request) => {
  const { uid: adminUid } = await requireAdminScope(request, "meeting_sources.manage");
  const id = clean(request.data?.applicationId, 120);
  const feedText = request.data?.feedText;
  if (!id || typeof feedText !== "string") throw new HttpsError("invalid-argument", "Choose an approved source and a feed file.");

  const ref = db.collection("recovery_meeting_source_applications").doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new HttpsError("not-found", "This source request is no longer available.");
  if (snapshot.get("status") !== "permission-approved") throw new HttpsError("failed-precondition", "Record permission approval before checking a feed file.");
  if (snapshot.get("sourceType") !== "meeting-guide-json") throw new HttpsError("failed-precondition", "This file check supports Meeting Guide JSON feeds. BMLT sources need a separate connection check.");

  const result = validateMeetingGuideText(feedText);
  if (!result.summary) throw new HttpsError("invalid-argument", result.reason || "The feed could not be checked.");
  const validationStatus = !result.ok ? "failed" : result.summary.warnings.length ? "needs-review" : "passed";
  const now = admin.firestore.FieldValue.serverTimestamp();
  await db.runTransaction(async (transaction) => {
    transaction.update(ref, {
      feedValidationStatus: validationStatus,
      feedValidation: result.summary,
      feedValidatedBy: adminUid,
      feedValidatedAt: now,
      updatedAt: now,
    });
    transaction.create(db.collection("recovery_meeting_source_audit").doc(), {
      sourceId: id, actorUid: adminUid, event: `feed-checked-${validationStatus}`,
      recordCount: result.summary.recordCount, createdAt: now,
    });
  });
  return { ok: result.ok, status: validationStatus, ...result.summary };
});

const stageRecoveryMeetingSourceFeed = onCall({ region: REGION, memory: "1GiB", timeoutSeconds: 120, enforceAppCheck: true }, async (request) => {
  const { uid: adminUid } = await requireAdminScope(request, "meeting_sources.manage");
  const id = clean(request.data?.applicationId, 120);
  const feedText = request.data?.feedText;
  const reviewerNote = clean(request.data?.reviewerNote, 1000);
  if (!id || typeof feedText !== "string") throw new HttpsError("invalid-argument", "Choose an approved source and a feed file.");
  if (reviewerNote.length < 20) throw new HttpsError("invalid-argument", "Record what you checked for privacy and listing quality (at least 20 characters).");

  const sourceRef = db.collection("recovery_meeting_source_applications").doc(id);
  const sourceSnapshot = await sourceRef.get();
  if (!sourceSnapshot.exists) throw new HttpsError("not-found", "This source request is no longer available.");
  const source = sourceSnapshot.data();
  if (source.status !== "permission-approved" || source.sourceType !== "meeting-guide-json") {
    throw new HttpsError("failed-precondition", "Only permission-approved Meeting Guide feeds can be staged.");
  }
  const result = validateMeetingGuideText(feedText, source);
  if (!result.ok || !result.records) {
    const details = result.summary?.errors?.slice(0, 3).join(" ") || "The feed file could not be checked.";
    throw new HttpsError("invalid-argument", details);
  }

  const stageRef = sourceRef.collection("staged_feeds").doc("current");
  const meetingsRef = stageRef.collection("meetings");
  const now = admin.firestore.FieldValue.serverTimestamp();
  const revisionId = randomUUID();
  await stageRef.set({ status: "preparing", revisionId, updatedAt: now }, { merge: true });

  for (let offset = 0; offset < result.records.length; offset += 400) {
    const batch = db.batch();
    for (const meeting of result.records.slice(offset, offset + 400)) {
      batch.set(meetingsRef.doc(meeting.slug), { ...meeting, updatedAt: now });
    }
    await batch.commit();
  }

  const stagedSnapshot = await meetingsRef.get();
  const currentSlugs = new Set(result.records.map((meeting) => meeting.slug));
  const stale = stagedSnapshot.docs.filter((doc) => !currentSlugs.has(doc.id));
  for (let offset = 0; offset < stale.length; offset += 400) {
    const batch = db.batch();
    stale.slice(offset, offset + 400).forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  const summary = { ...result.summary, preview: result.records.slice(0, 8) };
  await db.runTransaction(async (transaction) => {
    transaction.set(stageRef, {
      status: "awaiting-publication-review", revisionId, summary, reviewerNote,
      stagedBy: adminUid, stagedAt: now, updatedAt: now,
    });
    transaction.update(sourceRef, {
      feedValidationStatus: "staged-for-review", feedValidation: result.summary,
      stagedFeedRevision: revisionId, stagedAt: now, stagedBy: adminUid, updatedAt: now,
    });
    transaction.create(db.collection("recovery_meeting_source_audit").doc(), {
      sourceId: id, actorUid: adminUid, event: "feed-staged-for-publication-review",
      recordCount: result.summary.recordCount, createdAt: now,
    });
  });
  return { ok: true, status: "awaiting-publication-review", revisionId, ...summary };
});

const publishRecoveryMeetingSourceFeed = onCall({ region: REGION, memory: "1GiB", timeoutSeconds: 120, enforceAppCheck: true }, async (request) => {
  const { uid: adminUid } = await requireAdminScope(request, "meeting_sources.manage");
  const id = clean(request.data?.applicationId, 120);
  const reviewerNote = clean(request.data?.reviewerNote, 1000);
  if (!id) throw new HttpsError("invalid-argument", "Choose a source to publish.");
  if (reviewerNote.length < 30) throw new HttpsError("invalid-argument", "Record at least 30 characters about the final listing and privacy review.");

  const sourceRef = db.collection("recovery_meeting_source_applications").doc(id);
  const sourceSnapshot = await sourceRef.get();
  if (!sourceSnapshot.exists) throw new HttpsError("not-found", "This source request is no longer available.");
  const source = sourceSnapshot.data();
  if (source.status !== "permission-approved" || source.sourceType !== "meeting-guide-json") {
    throw new HttpsError("failed-precondition", "Only permission-approved Meeting Guide sources can be published.");
  }
  const stageRef = sourceRef.collection("staged_feeds").doc("current");
  const stageSnapshot = await stageRef.get();
  if (!stageSnapshot.exists || stageSnapshot.get("status") !== "awaiting-publication-review") {
    throw new HttpsError("failed-precondition", "Save and review a private preview before publishing it.");
  }
  const revisionId = stageSnapshot.get("revisionId");
  const directoryRef = db.collection("recovery_meeting_directory_sources").doc(id);
  const activeDirectory = await directoryRef.get();
  if (activeDirectory.get("activeRevision") === revisionId) {
    throw new HttpsError("already-exists", "This feed revision is already published.");
  }

  const stagedMeetings = await stageRef.collection("meetings").get();
  if (stagedMeetings.empty || stagedMeetings.size !== stageSnapshot.get("summary.recordCount")) {
    throw new HttpsError("failed-precondition", "The staged preview is incomplete. Check and save the feed again.");
  }
  const publicationAt = admin.firestore.FieldValue.serverTimestamp();
  const publishedCollection = db.collection("recovery_meetings");
  for (let offset = 0; offset < stagedMeetings.docs.length; offset += 400) {
    const batch = db.batch();
    for (const stagedDoc of stagedMeetings.docs.slice(offset, offset + 400)) {
      const meeting = stagedDoc.data();
      const docId = `${id}_${revisionId}_${stagedDoc.id}`;
      batch.set(publishedCollection.doc(docId), {
        slug: meeting.slug, name: meeting.name, weekdays: meeting.weekdays || [],
        startTime: meeting.startTime || "", endTime: meeting.endTime || "", timeZone: meeting.timeZone || "",
        venueType: meeting.venueType, location: meeting.location || "", address: meeting.address || "",
        city: meeting.city || "", region: meeting.region || "", postalCode: meeting.postalCode || "",
        country: meeting.country || "", virtualLink: meeting.virtualLink || "", virtualPhone: meeting.virtualPhone || "",
        formats: meeting.formats || [], sourceArea: clean(source.organization, 120), sourceHost: clean(meeting.sourceHost, 160),
        searchTokens: meeting.searchTokens || [], fellowship: source.fellowship,
        sourceId: id, revisionId, createdAt: publicationAt,
      });
    }
    await batch.commit();
  }

  const now = admin.firestore.FieldValue.serverTimestamp();
  await db.runTransaction(async (transaction) => {
    const freshStage = await transaction.get(stageRef);
    const freshSource = await transaction.get(sourceRef);
    const freshDirectory = await transaction.get(directoryRef);
    if (!freshStage.exists || freshStage.get("revisionId") !== revisionId
      || freshStage.get("status") !== "awaiting-publication-review"
      || freshSource.get("status") !== "permission-approved") {
      throw new HttpsError("aborted", "The source changed during publication. Review the latest feed and try again.");
    }
    if (freshDirectory.exists && freshDirectory.get("activeRevision") === revisionId) {
      throw new HttpsError("already-exists", "This feed revision is already published.");
    }
    if (freshDirectory.exists && freshDirectory.get("status") === "paused") {
      throw new HttpsError("failed-precondition", "This source is paused. Restore it after a fresh permission and listing review, then publish the revision.");
    }
    transaction.set(directoryRef, {
      organization: clean(source.organization, 120), fellowship: source.fellowship,
      coverage: clean(source.coverage, 180), sourceHost: (() => { try { return new URL(source.feedUrl).hostname; } catch { return ""; } })(),
      activeRevision: revisionId, recordCount: stagedMeetings.size, status: "active",
      publishedAt: now, updatedAt: now,
    });
    transaction.update(sourceRef, {
      feedPublicationStatus: "published", feedPublicationRevision: revisionId,
      feedPublicationNote: reviewerNote, feedPublishedBy: adminUid, feedPublishedAt: now, updatedAt: now,
    });
    transaction.create(db.collection("recovery_meeting_source_audit").doc(), {
      sourceId: id, actorUid: adminUid, event: "feed-published",
      revisionId, recordCount: stagedMeetings.size, createdAt: now,
    });
  });

  const obsolete = await publishedCollection.where("sourceId", "==", id).get();
  const stale = obsolete.docs.filter((doc) => doc.get("revisionId") !== revisionId);
  for (let offset = 0; offset < stale.length; offset += 400) {
    const batch = db.batch();
    stale.slice(offset, offset + 400).forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
  return { ok: true, status: "published", revisionId, recordCount: stagedMeetings.size };
});

const setRecoveryMeetingSourcePublication = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const { uid: adminUid } = await requireAdminScope(request, "meeting_sources.manage");
  const id = clean(request.data?.applicationId, 120);
  const action = clean(request.data?.action, 16);
  const reviewerNote = clean(request.data?.reviewerNote, 1000);
  if (!id || !["pause", "restore"].includes(action)) {
    throw new HttpsError("invalid-argument", "Choose a published source and whether to pause or restore it.");
  }
  if (reviewerNote.length < 30) {
    throw new HttpsError("invalid-argument", "Add at least 30 characters explaining the source status decision.");
  }

  const sourceRef = db.collection("recovery_meeting_source_applications").doc(id);
  const directoryRef = db.collection("recovery_meeting_directory_sources").doc(id);
  const now = admin.firestore.FieldValue.serverTimestamp();
  let recordCount = 0;
  await db.runTransaction(async (transaction) => {
    const [source, directory] = await Promise.all([
      transaction.get(sourceRef), transaction.get(directoryRef),
    ]);
    if (!source.exists || !directory.exists) throw new HttpsError("not-found", "This published source is no longer available.");
    if (source.get("status") !== "permission-approved") {
      throw new HttpsError("failed-precondition", "The source no longer has approved permission. Keep its listings paused until permission is reviewed again.");
    }
    if (!directory.get("activeRevision") || !(directory.get("recordCount") > 0)) {
      throw new HttpsError("failed-precondition", "This source has no published listings to change.");
    }
    const expectedStatus = action === "pause" ? "active" : "paused";
    if (directory.get("status") !== expectedStatus) {
      throw new HttpsError("failed-precondition", action === "pause"
        ? "This source is not currently active. Refresh the review queue before trying again."
        : "This source is not paused. Refresh the review queue before trying again.");
    }
    recordCount = directory.get("recordCount");
    if (action === "pause") {
      transaction.update(directoryRef, {
        status: "paused", pauseReason: reviewerNote, pausedBy: adminUid, pausedAt: now, updatedAt: now,
      });
    } else {
      transaction.update(directoryRef, {
        status: "active", pauseReason: admin.firestore.FieldValue.delete(),
        pausedBy: admin.firestore.FieldValue.delete(), pausedAt: admin.firestore.FieldValue.delete(),
        restoredBy: adminUid, restoredAt: now, restoreNote: reviewerNote, updatedAt: now,
      });
    }
    transaction.update(sourceRef, { updatedAt: now });
    transaction.create(db.collection("recovery_meeting_source_audit").doc(), {
      sourceId: id, actorUid: adminUid, event: action === "pause" ? "feed-paused" : "feed-restored",
      revisionId: directory.get("activeRevision"), recordCount, reviewerNote, createdAt: now,
    });
  });
  return { ok: true, status: action === "pause" ? "paused" : "active", recordCount };
});

module.exports = {
  submitRecoveryMeetingSource,
  listMyRecoveryMeetingSources,
  listRecoveryMeetingSourcesForAdmin,
  reviewRecoveryMeetingSource,
  validateRecoveryMeetingSourceFeed,
  stageRecoveryMeetingSourceFeed,
  publishRecoveryMeetingSourceFeed,
  setRecoveryMeetingSourcePublication,
  _requireAccount: requireAccount,
};
