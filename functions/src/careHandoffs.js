const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("./firebaseAdminCompat.cjs");
const providerScheduling = require("./providerScheduling");
const { practitionerAuditEvent, stagePractitionerAudit } = require("./practitionerAudit");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const REGION = "us-central1";
const COLLECTION = "client_care_handoffs";
const SHARE_SCOPE = "careCoordination";
const SHARE_FIELDS = new Set(["needType", "goal", "context", "preferredTiming", "contactPreference"]);
const NEED_TYPES = new Set(["find-a-service", "coordinate-care", "practical-barrier", "follow-up"]);
const TIMING_OPTIONS = new Set(["as-soon-as-practical", "this-week", "flexible"]);
const CONTACT_OPTIONS = new Set(["request-tracker", "next-appointment", "either"]);
const PROVIDER_STATUSES = new Set(["acknowledged", "in_progress", "waiting_on_client", "follow_up_complete"]);

function requireClient(request) {
  const uid = request.auth?.uid;
  if (!uid || request.auth.token.firebase?.sign_in_provider === "anonymous") {
    throw new HttpsError("unauthenticated", "Sign in to ask a connected practitioner for practical support.");
  }
  return uid;
}

function cleanText(value, max) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function recordId(value) { return typeof value === "string" && /^[A-Za-z0-9_-]{8,120}$/.test(value) ? value : ""; }
function shareId(clientId, practitionerId) { return `${clientId}_${practitionerId}`; }
function iso(value) { return value?.toDate?.()?.toISOString?.() || null; }
function plain(value) {
  if (value?.toDate && typeof value.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(plain);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, plain(item)]));
  return value;
}

async function verifySharing(transaction, clientId, practitionerId, assignmentId = "") {
  const [assignment, share, settings] = await Promise.all([
    transaction.get(db.collection("clientProviderAssignments").where("clientId", "==", clientId).where("providerId", "==", practitionerId).where("status", "==", "active").limit(1)),
    transaction.get(db.collection("client_practitioner_shares").doc(shareId(clientId, practitionerId))),
    transaction.get(db.doc("admin/systemSettings")),
  ]);
  if (assignment.empty) throw new HttpsError("permission-denied", "This practitioner is not currently connected to your account.");
  const activeAssignmentId = assignment.docs[0].id;
  if (assignmentId && activeAssignmentId !== assignmentId) throw new HttpsError("permission-denied", "This connection has changed; choose the practitioner again.");
  if (settings.data()?.settings?.features?.sessionSharing === false) throw new HttpsError("failed-precondition", "Practitioner sharing is temporarily paused.");
  if (!share.exists || share.get("assignmentId") !== activeAssignmentId || share.get("scopes")?.[SHARE_SCOPE] !== true) {
    throw new HttpsError("failed-precondition", "Turn on practical-support sharing for this practitioner in your sharing settings first.");
  }
  return {
    assignmentId: activeAssignmentId,
    share,
    careCoordinationVersion: Number.isSafeInteger(share.get("careCoordinationVersion")) ? share.get("careCoordinationVersion") : 0,
  };
}

exports.createMyCareHandoff = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClient(request);
  const supplied = request.data?.handoff && typeof request.data.handoff === "object" ? request.data.handoff : {};
  const practitionerId = cleanText(supplied.practitionerId, 160);
  const needType = NEED_TYPES.has(supplied.needType) ? supplied.needType : "";
  const goal = cleanText(supplied.goal, 320);
  const context = cleanText(supplied.context, 500);
  const preferredTiming = TIMING_OPTIONS.has(supplied.preferredTiming) ? supplied.preferredTiming : "flexible";
  const contactPreference = CONTACT_OPTIONS.has(supplied.contactPreference) ? supplied.contactPreference : "either";
  const selectedFields = [...new Set(Array.isArray(supplied.fields) ? supplied.fields.filter((field) => SHARE_FIELDS.has(field)) : [])];
  const sharedFields = selectedFields.filter((field) => Boolean({ needType, goal, context, preferredTiming, contactPreference }[field]));
  if (!practitionerId || !needType || !goal) throw new HttpsError("invalid-argument", "Choose a connected practitioner, a support area, and the help you want.");
  if (!sharedFields.includes("needType") || !sharedFields.includes("goal")) throw new HttpsError("invalid-argument", "Choose to share the support area and the help you want.");

  const ref = db.collection(COLLECTION).doc();
  const result = await db.runTransaction(async (transaction) => {
    const { assignmentId, careCoordinationVersion } = await verifySharing(transaction, clientId, practitionerId);
    transaction.create(ref, {
      clientId,
      share: { practitionerId, assignmentId, fields: sharedFields, enabled: true, careCoordinationVersion },
      needType,
      goal,
      context,
      preferredTiming,
      contactPreference,
      status: "requested",
      practitionerReply: "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    stagePractitionerAudit(transaction, db, {
      action: "care_handoff.created_and_shared",
      actorUid: clientId,
      clientUid: clientId,
      practitionerUid: practitionerId,
      preparationId: ref.id,
      fields: sharedFields,
      statusChange: { from: "", to: "requested" },
    });
    return { id: ref.id, practitionerId, sharedFields, status: "requested" };
  });
  return { ok: true, ...result };
});

exports.listMyCareHandoffs = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClient(request);
  const snapshot = await db.collection(COLLECTION).where("clientId", "==", clientId).orderBy("updatedAt", "desc").limit(40).get();
  return { handoffs: snapshot.docs.map((doc) => ({ id: doc.id, ...plain(doc.data()) })) };
});

exports.setMyCareHandoffStatus = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClient(request);
  const id = recordId(request.data?.handoffId);
  const action = request.data?.action;
  if (!id || !["confirm", "reopen", "withdraw"].includes(action)) throw new HttpsError("invalid-argument", "Choose a valid follow-up action.");
  const ref = db.collection(COLLECTION).doc(id);
  return db.runTransaction(async (transaction) => {
    const handoff = await transaction.get(ref);
    if (!handoff.exists || handoff.get("clientId") !== clientId) throw new HttpsError("not-found", "This support request is not available to your account.");
    const prior = handoff.get("status");
    let status = prior;
    let enabled = handoff.get("share.enabled") === true;
    if (action === "withdraw") { status = "withdrawn"; enabled = false; }
    if (action === "confirm") {
      if (prior !== "follow_up_complete") throw new HttpsError("failed-precondition", "Your practitioner must first mark their follow-up complete.");
      status = "client_confirmed";
    }
    const refreshedShare = action === "reopen"
      ? await verifySharing(transaction, clientId, handoff.get("share.practitionerId"), handoff.get("share.assignmentId"))
      : null;
    if (action === "reopen") {
      const closedByEitherPerson = ["follow_up_complete", "client_confirmed", "withdrawn"].includes(prior);
      const priorShareVersion = Number.isSafeInteger(handoff.get("share.careCoordinationVersion")) ? handoff.get("share.careCoordinationVersion") : 0;
      const consentWasRevoked = priorShareVersion !== refreshedShare.careCoordinationVersion;
      if (!closedByEitherPerson && !consentWasRevoked) throw new HttpsError("failed-precondition", "This support request is already active.");
      status = "requested";
      enabled = true;
    }
    const updates = { status, "share.enabled": enabled, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (action === "reopen") updates.practitionerReply = "";
    if (refreshedShare) {
      updates["share.assignmentId"] = refreshedShare.assignmentId;
      updates["share.careCoordinationVersion"] = refreshedShare.careCoordinationVersion;
    }
    transaction.update(ref, updates);
    stagePractitionerAudit(transaction, db, {
      action: `care_handoff.client_${action}`,
      actorUid: clientId,
      clientUid: clientId,
      practitionerUid: handoff.get("share.practitionerId") || null,
      preparationId: id,
      fields: handoff.get("share.fields") || [],
      statusChange: { from: prior, to: status },
    });
    return { ok: true, status };
  });
});

exports.listProviderCareHandoffs = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const practitionerId = await providerScheduling.requireProviderCapability(request, "client.care_handoffs.read");
  const clientId = cleanText(request.data?.clientId, 160);
  if (!clientId) throw new HttpsError("invalid-argument", "Choose a connected client.");
  return db.runTransaction(async (transaction) => {
    await providerScheduling.requireProviderCapabilityInTransaction(transaction, request, "client.care_handoffs.read");
    const [assignment, share, settings] = await Promise.all([
      transaction.get(db.collection("clientProviderAssignments").where("clientId", "==", clientId).where("providerId", "==", practitionerId).where("status", "==", "active").limit(1)),
      transaction.get(db.collection("client_practitioner_shares").doc(shareId(clientId, practitionerId))),
      transaction.get(db.doc("admin/systemSettings")),
    ]);
    if (assignment.empty) throw new HttpsError("permission-denied", "This person is not currently connected to your account.");
    if (settings.data()?.settings?.features?.sessionSharing === false) return { handoffs: [], sharingPaused: true };
    const assignmentId = assignment.docs[0].id;
    if (!share.exists || share.get("assignmentId") !== assignmentId || share.get("scopes")?.[SHARE_SCOPE] !== true) return { handoffs: [], sharingPaused: false };
    const currentConsentVersion = Number.isSafeInteger(share.get("careCoordinationVersion")) ? share.get("careCoordinationVersion") : 0;
    const handoffs = await transaction.get(db.collection(COLLECTION)
      .where("clientId", "==", clientId)
      .where("share.practitionerId", "==", practitionerId)
      .where("share.enabled", "==", true)
      .where("share.careCoordinationVersion", "==", currentConsentVersion)
      .limit(50));
    const allowed = handoffs.docs.filter((doc) => doc.get("share.assignmentId") === assignmentId
      && Array.isArray(doc.get("share.fields")) && doc.get("share.fields").length);
    const projected = allowed.map((doc) => {
      const item = doc.data();
      const fields = new Set(item.share.fields);
      const visible = { id: doc.id, status: item.status, practitionerReply: item.practitionerReply || "", updatedAt: iso(item.updatedAt), sharedFields: item.share.fields };
      for (const field of fields) if (SHARE_FIELDS.has(field)) visible[field] = item[field] ?? "";
      return visible;
    });
    stagePractitionerAudit(transaction, db, {
      action: "care_handoff.practitioner_read",
      actorUid: practitionerId,
      clientUid: clientId,
      practitionerUid: practitionerId,
      recordIds: projected.map((item) => item.id),
      fields: [...new Set(projected.flatMap((item) => item.sharedFields || []))],
      resultCount: projected.length,
    });
    return { handoffs: projected, sharingPaused: false };
  });
});

exports.updateProviderCareHandoff = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const practitionerId = await providerScheduling.requireProviderCapability(request, "client.care_handoffs.update");
  const id = recordId(request.data?.handoffId);
  const nextStatus = request.data?.status;
  const reply = cleanText(request.data?.reply, 500);
  if (!id || !PROVIDER_STATUSES.has(nextStatus)) throw new HttpsError("invalid-argument", "Choose a valid follow-up update.");
  const ref = db.collection(COLLECTION).doc(id);
  return db.runTransaction(async (transaction) => {
    await providerScheduling.requireProviderCapabilityInTransaction(transaction, request, "client.care_handoffs.update");
    const handoff = await transaction.get(ref);
    if (!handoff.exists || handoff.get("share.enabled") !== true || handoff.get("share.practitionerId") !== practitionerId || !handoff.get("share.fields")?.length) {
      throw new HttpsError("permission-denied", "This support request is not shared with your account.");
    }
    const { assignmentId, careCoordinationVersion } = await verifySharing(transaction, handoff.get("clientId"), practitionerId, handoff.get("share.assignmentId"));
    const handoffVersion = Number.isSafeInteger(handoff.get("share.careCoordinationVersion")) ? handoff.get("share.careCoordinationVersion") : 0;
    if (handoffVersion !== careCoordinationVersion) throw new HttpsError("permission-denied", "The client has revoked sharing for this request. They must explicitly share it again before you can update it.");
    const prior = handoff.get("status");
    const allowedTransitions = {
      requested: new Set(["acknowledged", "in_progress", "waiting_on_client"]),
      acknowledged: new Set(["in_progress", "waiting_on_client", "follow_up_complete"]),
      in_progress: new Set(["in_progress", "waiting_on_client", "follow_up_complete"]),
      waiting_on_client: new Set(["in_progress", "follow_up_complete"]),
    };
    if (!allowedTransitions[prior]?.has(nextStatus)) throw new HttpsError("failed-precondition", "This support request needs a client update before it can move forward.");
    transaction.update(ref, { status: nextStatus, practitionerReply: reply, updatedAt: admin.firestore.FieldValue.serverTimestamp(), lastPractitionerUpdateAt: admin.firestore.FieldValue.serverTimestamp(), lastPractitionerId: practitionerId, "share.assignmentId": assignmentId });
    stagePractitionerAudit(transaction, db, {
      action: "care_handoff.practitioner_updated",
      actorUid: practitionerId,
      clientUid: handoff.get("clientId"),
      practitionerUid: practitionerId,
      preparationId: id,
      fields: handoff.get("share.fields") || [],
      statusChange: { from: prior, to: nextStatus },
    });
    return { ok: true, status: nextStatus };
  });
});
