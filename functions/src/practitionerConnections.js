const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { createHash } = require("node:crypto");
const providerScheduling = require("./providerScheduling");
const { recordTrustedSupportActivity } = require("./supportActivity");
const { requireVerifiedAccount } = require("./accountAccess");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const REGION = "us-central1";

function requireAccount(request) {
  const uid = request.auth?.uid;
  if (!uid || request.auth.token.firebase?.sign_in_provider === "anonymous") {
    throw new HttpsError("unauthenticated", "Sign in to contact a practitioner.");
  }
  return uid;
}

exports.requestPractitionerConnection = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const requesterUid = requireVerifiedAccount(request, "request practitioner support");
  const practitionerId = typeof request.data?.practitionerId === "string" ? request.data.practitionerId : "";
  const introduction = typeof request.data?.introduction === "string" ? request.data.introduction.trim().slice(0, 500) : "";
  if (!practitionerId || practitionerId === requesterUid) throw new HttpsError("invalid-argument", "Choose a practitioner to contact.");
  const requests = db.collection("practitioner_connection_requests");
  const profileRef = db.collection("realHelpProviders").doc(practitionerId);
  const userRef = db.collection("users").doc(requesterUid);
  const pendingQuery = requests
    .where("requesterUid", "==", requesterUid)
    .where("practitionerId", "==", practitionerId)
    .where("status", "==", "pending")
    .limit(1);
  const assignmentQuery = db.collection("clientProviderAssignments")
    .where("clientId", "==", requesterUid)
    .where("providerId", "==", practitionerId)
    .where("status", "==", "active")
    .limit(1);
  // One stable record per pair makes rapid repeat submissions converge on one
  // request even when two callable invocations arrive at the same time.
  const requestId = createHash("sha256").update(`${requesterUid}:${practitionerId}`).digest("hex");
  const requestRef = requests.doc(requestId);
  const outcome = await db.runTransaction(async (transaction) => {
    const [profile, userDoc, pending, assignment, priorRequest] = await Promise.all([
      transaction.get(profileRef),
      transaction.get(userRef),
      transaction.get(pendingQuery),
      transaction.get(assignmentQuery),
      transaction.get(requestRef),
    ]);
    if (!profile.exists || profile.get("verification.status") !== "verified" || profile.get("acceptsReferrals") !== true) {
      throw new HttpsError("not-found", "This profile is not accepting connection requests right now.");
    }
    if (!assignment.empty) throw new HttpsError("already-exists", "You’re already connected with this practitioner.");
    if (!pending.empty) return { requestId: pending.docs[0].id, alreadyPending: true, changed: false };

    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    transaction.set(requestRef, {
      requesterUid,
      requesterName: (userDoc.get("displayName") || request.auth.token.name || "A WellnessCafe member").slice(0, 100),
      practitionerId,
      practitionerName: profile.get("name") || "Practitioner",
      introduction,
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return { requestId: requestRef.id, alreadyPending: false, changed: true, reopened: priorRequest.exists };
  });
  if (outcome.changed) await recordTrustedSupportActivity([
    { uid: requesterUid, feature: "providers", eventCode: "connection_request_sent" },
    { uid: practitionerId, feature: "providers", eventCode: "connection_request_received" },
  ]);
  return { ok: true, requestId: outcome.requestId, practitionerId, status: "pending", alreadyPending: outcome.alreadyPending };
});

exports.endMyPractitionerConnection = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireAccount(request);
  const practitionerId = typeof request.data?.practitionerId === "string" ? request.data.practitionerId.trim() : "";
  if (!practitionerId || practitionerId === clientId || practitionerId.includes("/")) {
    throw new HttpsError("invalid-argument", "Choose a valid practitioner connection.");
  }
  const assignmentQuery = db.collection("clientProviderAssignments")
    .where("clientId", "==", clientId)
    .where("providerId", "==", practitionerId)
    .where("status", "==", "active")
    .limit(100);
  const shareRef = db.collection("client_practitioner_shares").doc(`${clientId}_${practitionerId}`);
  const now = admin.firestore.Timestamp.now();
  const outcome = await db.runTransaction(async (transaction) => {
    const assignments = await transaction.get(assignmentQuery);
    if (assignments.empty) return { alreadyEnded: true, cancelledSessions: 0 };
    const [appointments, share] = await Promise.all([
      transaction.get(db.collection("appointments").where("clientId", "==", clientId).limit(350)),
      transaction.get(shareRef),
    ]);
    if (appointments.size >= 350 || assignments.size >= 100) {
      throw new HttpsError("resource-exhausted", "We could not safely finish ending this connection. Contact support for help.");
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    for (const assignment of assignments.docs) transaction.update(assignment.ref, {
      status: "ended",
      endedAt: timestamp,
      endedBy: clientId,
    });
    transaction.set(shareRef, {
      clientId,
      practitionerId,
      assignmentId: assignments.docs[0].id,
      scopes: { recoveryProgress: false, wellnessPatterns: false, writtenReflections: false, assessments: false },
      updatedAt: timestamp,
    }, { merge: true });

    const futureAppointments = appointments.docs.filter((appointment) =>
      appointment.get("providerId") === practitionerId
      && ["scheduled", "confirmed"].includes(appointment.get("status"))
      && appointment.get("startAt")?.toMillis?.() >= now.toMillis());
    for (const appointment of futureAppointments) transaction.update(appointment.ref, {
      status: "cancelled",
      cancelReason: "connection-ended-by-client",
      cancelledBy: clientId,
      cancelledAt: timestamp,
      updatedAt: timestamp,
    });
    return { alreadyEnded: false, cancelledSessions: futureAppointments.length };
  });

  if (!outcome.alreadyEnded) await recordTrustedSupportActivity([
    { uid: clientId, feature: "providers", eventCode: "connection_ended" },
    { uid: practitionerId, feature: "providers", eventCode: "connection_ended" },
  ]);
  return { ok: true, ...outcome };
});

exports.listMyPractitionerConnectionRequests = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const requesterUid = requireAccount(request);
  const snapshot = await db.collection("practitioner_connection_requests")
    .where("requesterUid", "==", requesterUid)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  return { requests: snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      practitionerId: data.practitionerId,
      practitionerName: data.practitionerName || "Practitioner",
      status: data.status,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null,
    };
  }) };
});

exports.listPractitionerConnectionRequests = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const practitionerId = await providerScheduling.requireProvider(request);
  const snapshot = await db.collection("practitioner_connection_requests")
    .where("practitionerId", "==", practitionerId)
    .where("status", "==", "pending")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  return { requests: snapshot.docs.map((doc) => {
    const data = doc.data();
    return { id: doc.id, requesterUid: data.requesterUid, requesterName: data.requesterName, introduction: data.introduction || "", createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null };
  }) };
});

exports.respondToPractitionerConnection = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const practitionerId = await providerScheduling.requireProvider(request);
  const requestId = typeof request.data?.requestId === "string" ? request.data.requestId : "";
  const decision = request.data?.decision;
  if (!requestId || !["accept", "decline"].includes(decision)) throw new HttpsError("invalid-argument", "Choose a request and a response.");
  const ref = db.collection("practitioner_connection_requests").doc(requestId);
  const assignmentCollection = db.collection("clientProviderAssignments");
  const newAssignmentRef = assignmentCollection.doc();
  const result = await db.runTransaction(async (transaction) => {
    const requestDoc = await transaction.get(ref);
    if (!requestDoc.exists || requestDoc.get("practitionerId") !== practitionerId) {
      throw new HttpsError("not-found", "This request is no longer available.");
    }
    const data = requestDoc.data();
    const resolvedStatus = decision === "accept" ? "accepted" : "declined";
    if (data.status === resolvedStatus) {
      return { ok: true, status: resolvedStatus, requesterUid: data.requesterUid, newlyResponded: false };
    }
    if (data.status !== "pending") {
      throw new HttpsError("failed-precondition", "This request has already received a different response.");
    }
    const existingAssignmentQuery = assignmentCollection
      .where("clientId", "==", data.requesterUid)
      .where("providerId", "==", practitionerId)
      .where("status", "==", "active")
      .limit(1);
    const existing = decision === "accept" ? await transaction.get(existingAssignmentQuery) : null;
    const shareRef = db.collection("client_practitioner_shares").doc(`${data.requesterUid}_${practitionerId}`);
    // A new connection is a new consent relationship. Read the old setting
    // before any writes, then clear all scopes and bind the empty choice to
    // this assignment so reconnecting never restores historical permission.
    if (decision === "accept" && existing.empty) await transaction.get(shareRef);

    if (decision === "accept" && existing.empty) {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      transaction.create(newAssignmentRef, {
        clientId: data.requesterUid,
        providerId: practitionerId,
        relationshipType: "requested_connection",
        status: "active",
        createdAt: timestamp,
        createdBy: practitionerId,
      });
      transaction.set(shareRef, {
        clientId: data.requesterUid,
        practitionerId,
        assignmentId: newAssignmentRef.id,
        scopes: { recoveryProgress: false, wellnessPatterns: false, writtenReflections: false, assessments: false },
        updatedAt: timestamp,
      }, { merge: true });
    }
    transaction.update(ref, { status: decision === "accept" ? "accepted" : "declined", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return { ok: true, status: resolvedStatus, requesterUid: data.requesterUid, newlyResponded: true };
  });
  if (result.newlyResponded) {
    const eventCode = decision === "accept" ? "connection_request_accepted" : "connection_request_declined";
    await recordTrustedSupportActivity([
      { uid: practitionerId, feature: "providers", eventCode },
      { uid: result.requesterUid, feature: "providers", eventCode },
    ]);
  }
  return { ok: true, status: result.status };
});
