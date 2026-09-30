const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const providerScheduling = require("./providerScheduling");
const { isProductFeatureEnabled } = require("./agentOperations");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const REGION = "us-central1";
const TOOL_IDS = new Set(["breathing", "grounding", "body-scan", "journaling", "self-surgeon", "urge-surfing", "meditation", "affirmations", "low-energy-plan"]);
const SHARE_KEYS = new Set(["recoveryProgress", "wellnessPatterns", "writtenReflections", "assessments"]);

function requireClient(request) {
  const uid = request.auth?.uid;
  if (!uid || request.auth.token.firebase?.sign_in_provider === "anonymous") {
    throw new HttpsError("unauthenticated", "Sign in to manage practitioner sharing.");
  }
  return uid;
}

function shareId(clientId, practitionerId) { return `${clientId}_${practitionerId}`; }
function iso(value) { return value?.toDate?.()?.toISOString?.() || (value instanceof Date ? value.toISOString() : null); }
function plain(value) {
  if (value?.toDate && typeof value.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(plain);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, plain(item)]));
  return value;
}

async function hasActiveAssignment(clientId, practitionerId) {
  const match = await db.collection("clientProviderAssignments")
    .where("clientId", "==", clientId).where("providerId", "==", practitionerId).where("status", "==", "active").limit(1).get();
  return !match.empty;
}

exports.listMyPractitionerShares = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClient(request);
  let sharingPaused = false;
  let sharingStatusUnknown = false;
  try { sharingPaused = !(await isProductFeatureEnabled("sessionSharing", db)); }
  catch { sharingPaused = true; sharingStatusUnknown = true; }
  const assignments = await db.collection("clientProviderAssignments").where("clientId", "==", clientId).where("status", "==", "active").limit(100).get();
  const shares = await Promise.all(assignments.docs.map(async (assignment) => {
    const practitionerId = assignment.get("providerId");
    const [profile, share] = await Promise.all([
      db.collection("realHelpProviders").doc(practitionerId).get(),
      db.collection("client_practitioner_shares").doc(shareId(clientId, practitionerId)).get(),
    ]);
    return {
      practitionerId,
      name: profile.get("name") || "Practitioner",
      type: profile.get("type") || "support practitioner",
      // Keep existing active relationships compatible, but never carry
      // consent forward after a reconnect to a new assignment record.
      scopes: share.exists && (!share.get("assignmentId") || share.get("assignmentId") === assignment.id)
        ? share.get("scopes") || {} : {},
      updatedAt: share.exists ? iso(share.get("updatedAt")) : null,
    };
  }));
  return { shares, sharingPaused, sharingStatusUnknown };
});

exports.setPractitionerShare = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClient(request);
  const practitionerId = typeof request.data?.practitionerId === "string" ? request.data.practitionerId : "";
  if (!practitionerId || !(await hasActiveAssignment(clientId, practitionerId))) {
    throw new HttpsError("permission-denied", "You can share with a practitioner only after you are connected.");
  }
  const supplied = request.data?.scopes || {};
  const scopes = Object.fromEntries([...SHARE_KEYS].map((key) => [key, supplied[key] === true]));
  const ref = db.collection("client_practitioner_shares").doc(shareId(clientId, practitionerId));
  const settingsRef = db.doc("admin/systemSettings");
  try {
    await db.runTransaction(async (transaction) => {
      const [settings, existingShare, assignment] = await Promise.all([
        transaction.get(settingsRef),
        transaction.get(ref),
        transaction.get(db.collection("clientProviderAssignments")
          .where("clientId", "==", clientId)
          .where("providerId", "==", practitionerId)
          .where("status", "==", "active")
          .limit(1)),
      ]);
      if (assignment.empty) throw new HttpsError("failed-precondition", "This practitioner connection has ended. Sharing was not changed.");
      const storedFlag = settings.data()?.settings?.features?.sessionSharing;
      const enabled = typeof storedFlag === "boolean" ? storedFlag : true;
      const previousScopes = existingShare.exists ? existingShare.get("scopes") || {} : {};
      const addsAccess = Object.entries(scopes).some(([key, enabledScope]) => enabledScope && previousScopes[key] !== true);
      if (!enabled && addsAccess) {
        throw new HttpsError("failed-precondition", "Practitioner sharing is temporarily paused. You can still turn off any sharing choice that is already on.");
      }
      transaction.set(ref, {
        clientId,
        practitionerId,
        assignmentId: assignment.docs[0].id,
        scopes,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
  } catch (error) {
    // Never let an availability-read failure block a client from revoking all
    // sharing. An all-false update cannot expose new information.
    if (!(error instanceof HttpsError) && Object.values(scopes).some(Boolean)) {
      throw new HttpsError("unavailable", "Sharing availability could not be checked, so no new access was granted. Please try again.");
    }
    if (!(error instanceof HttpsError)) {
      await ref.set({ clientId, practitionerId, scopes, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    } else throw error;
  }
  return { ok: true, scopes };
});

exports.getProviderClientOverview = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const practitionerId = await providerScheduling.requireProvider(request);
  const clientId = typeof request.data?.clientId === "string" ? request.data.clientId : "";
  if (!clientId) throw new HttpsError("permission-denied", "This person is not currently connected to your account.");
  const assignment = await db.collection("clientProviderAssignments")
    .where("clientId", "==", clientId)
    .where("providerId", "==", practitionerId)
    .where("status", "==", "active")
    .limit(1)
    .get();
  if (assignment.empty) throw new HttpsError("permission-denied", "This person is not currently connected to your account.");
  let sharingEnabled = false;
  let sharingStatusUnknown = false;
  try { sharingEnabled = await isProductFeatureEnabled("sessionSharing", db); }
  catch { sharingStatusUnknown = true; }
  if (!sharingEnabled) {
    return {
      shared: false, sharingPaused: true, sharingStatusUnknown, scopes: {}, checkins: [], assessments: [], practiceProgress: [],
      message: sharingStatusUnknown ? "Client sharing availability could not be confirmed. Personal information is hidden until it can be checked." : "Practitioner access to client-shared information is temporarily paused. Their choices remain saved and the client can still revoke them.",
    };
  }
  const share = await db.collection("client_practitioner_shares").doc(shareId(clientId, practitionerId)).get();
  const scopes = share.exists && (!share.get("assignmentId") || share.get("assignmentId") === assignment.docs[0].id)
    ? share.get("scopes") || {} : {};
  const progressSnapshot = await db.collection("client_practitioner_practice_updates")
    .where("practitionerId", "==", practitionerId)
    .where("clientId", "==", clientId)
    .orderBy("submittedAt", "desc")
    .limit(30)
    .get();
  const practiceProgress = progressSnapshot.docs
    .map((doc) => {
      const data = doc.data();
      return { id: doc.id, toolId: data.toolId, outcome: data.outcome, note: data.note || "", submittedAt: iso(data.submittedAt) };
    });
  if (!Object.values(scopes).some(Boolean)) return { shared: false, sharingPaused: false, sharingStatusUnknown: false, scopes: {}, checkins: [], practiceProgress, message: "This person has not shared check-in information with you. Their check-ins stay private." };
  const [checkins, assessments] = await Promise.all([
    [scopes.recoveryProgress, scopes.wellnessPatterns, scopes.writtenReflections].some(Boolean)
      ? db.collection("checkins").where("userId", "==", clientId).orderBy("timestamp", "desc").limit(14).get()
      : Promise.resolve({ docs: [] }),
    scopes.assessments
      ? db.collection("assessmentSessions").where("userId", "==", clientId).orderBy("createdAt", "desc").limit(10).get()
      : Promise.resolve({ docs: [] }),
  ]);
  const rows = checkins.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  const allowed = (row) => {
    const item = { date: row.date || null, savedAt: iso(row.timestamp) };
    if (scopes.recoveryProgress) {
      item.daysSinceLastUse = Number.isFinite(row.daysSinceLastUse) ? row.daysSinceLastUse : null;
      item.cravingStatus = row.cravingStatus || null;
      item.cravingIntensity = Number.isFinite(row.cravingIntensity) ? row.cravingIntensity : null;
      item.triggerStatus = row.triggerStatus || null;
      item.triggerIntensity = Number.isFinite(row.triggerIntensity) ? row.triggerIntensity : null;
    }
    if (scopes.wellnessPatterns) {
      item.mood = row.mood || null; item.energy = row.energy ?? null; item.stress = row.stress ?? null; item.sleep = row.sleep ?? null;
      item.supportNeeded = row.supportNeeded || null; item.plannedActivities = Array.isArray(row.plannedActivities) ? row.plannedActivities.slice(0, 10) : [];
      item.skillsPracticed = row.skillsPracticed || "";
    }
    if (scopes.writtenReflections) {
      item.cravingDetails = row.cravingDetails || ""; item.triggerDetails = row.triggerDetails || "";
      item.gratitude = row.gratitude || ""; item.journal = row.journal || "";
    }
    return item;
  };
  const sharedAssessments = await Promise.all(assessments.docs.map(async (doc) => {
    // Older assessment records keep answers in a subcollection; newer records
    // may embed them on the parent document. Support both shapes so consented
    // assessment sharing does not silently look empty.
    const embeddedAnswers = doc.get("answers");
    const answerDocs = await doc.ref.collection("answers").limit(500).get();
    const subcollectionAnswers = Object.fromEntries(answerDocs.docs.map((answer) => [answer.id, plain(answer.data())]));
    return {
      id: doc.id,
      createdAt: iso(doc.get("createdAt") || doc.get("timestamp")),
      answers: Object.keys(subcollectionAnswers).length ? subcollectionAnswers : (plain(embeddedAnswers) || {}),
    };
  }));
  return {
    shared: true, sharingPaused: false, sharingStatusUnknown: false, scopes, checkins: rows.map(allowed), totalRecentCheckins: rows.length, latestCheckInAt: rows[0] ? iso(rows[0].timestamp) : null,
    assessments: sharedAssessments, practiceProgress,
  };
});

exports.sendPractitionerSupportTool = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const practitionerId = await providerScheduling.requireProvider(request);
  const clientId = typeof request.data?.clientId === "string" ? request.data.clientId : "";
  const toolId = typeof request.data?.toolId === "string" ? request.data.toolId : "";
  const message = typeof request.data?.message === "string" ? request.data.message.trim().slice(0, 240) : "";
  const followUpDays = request.data?.followUpDays === 7 ? 7 : 0;
  if (!TOOL_IDS.has(toolId)) throw new HttpsError("invalid-argument", "Choose an available support tool.");
  if (!clientId || !(await hasActiveAssignment(clientId, practitionerId))) throw new HttpsError("permission-denied", "You can send a tool only to someone currently connected to you.");
  const profile = await db.collection("realHelpProviders").doc(practitionerId).get();
  const ref = await db.collection("client_practitioner_support").add({ clientId, practitionerId, practitionerName: profile.get("name") || "Your practitioner", toolId, message, followUpDays, status: "new", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { ok: true, supportId: ref.id };
});

exports.listMyPractitionerSupport = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClient(request);
  const snapshot = await db.collection("client_practitioner_support").where("clientId", "==", clientId).where("status", "==", "new").orderBy("createdAt", "desc").limit(20).get();
  return { items: snapshot.docs.map((doc) => { const data = doc.data(); return { id: doc.id, practitionerName: data.practitionerName, toolId: data.toolId, message: data.message || "", createdAt: iso(data.createdAt) }; }) };
});

exports.listMyDailyPractice = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClient(request);
  const snapshot = await db.collection("client_practitioner_support")
    .where("clientId", "==", clientId)
    .where("status", "==", "added")
    .orderBy("savedAt", "desc")
    .limit(100)
    .get();
  const items = snapshot.docs.map((doc) => {
    const data = doc.data();
    return { id: doc.id, practitionerName: data.practitionerName || "Your practitioner", toolId: data.toolId, message: data.message || "", savedAt: iso(data.savedAt || data.createdAt), followUpDays: data.followUpDays || 0, followUpDueAt: iso(data.followUpDueAt), lastProgressAt: iso(data.lastProgressAt) };
  });
  return { items };
});

exports.markPractitionerSupportSeen = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClient(request);
  const id = typeof request.data?.supportId === "string" ? request.data.supportId : "";
  const action = request.data?.action;
  if (!id || !["opened", "dismissed", "added", "removed"].includes(action)) throw new HttpsError("invalid-argument", "Choose an item and an action.");
  const ref = db.collection("client_practitioner_support").doc(id);
  const doc = await ref.get();
  if (!doc.exists || doc.get("clientId") !== clientId) throw new HttpsError("not-found", "This support item is unavailable.");
  const currentStatus = doc.get("status");
  const validTransition = (action === "added" && currentStatus === "new")
    || (["opened", "dismissed"].includes(action) && currentStatus === "new")
    || (action === "removed" && currentStatus === "added");
  if (!validTransition) throw new HttpsError("failed-precondition", "This practice has already been handled. Refresh your Daily Practice.");
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  const followUpDays = doc.get("followUpDays") === 7 ? 7 : 0;
  await ref.update({
    status: action === "removed" ? "removed" : action,
    seenAt: timestamp,
    ...(action === "added" ? { savedAt: timestamp, ...(followUpDays ? { followUpDueAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 86400000)) } : {}) } : {}),
  });
  return { ok: true };
});

exports.submitPractitionerPracticeProgress = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClient(request);
  const supportId = typeof request.data?.supportId === "string" ? request.data.supportId : "";
  const outcome = request.data?.outcome;
  const note = typeof request.data?.note === "string" ? request.data.note.trim().slice(0, 600) : "";
  if (!supportId || supportId.includes("/") || !["tried", "not-yet", "not-a-fit", "prefer-not-to-say"].includes(outcome)) {
    throw new HttpsError("invalid-argument", "Choose how the shared practice went before sending your update.");
  }
  const supportRef = db.collection("client_practitioner_support").doc(supportId);
  // One invitation accepts one intentional update. A stable document ID makes
  // retries safe if the client loses the response after the server commits.
  const updateRef = db.collection("client_practitioner_practice_updates").doc(`support_${supportId}`);
  const assignmentQuery = db.collection("clientProviderAssignments")
    .where("clientId", "==", clientId).where("status", "==", "active");
  const submittedAt = admin.firestore.FieldValue.serverTimestamp();
  const result = await db.runTransaction(async (transaction) => {
    const [support, existingUpdate] = await Promise.all([
      transaction.get(supportRef),
      transaction.get(updateRef),
    ]);
    if (!support.exists || support.get("clientId") !== clientId || support.get("followUpDays") !== 7 || !["added", "removed"].includes(support.get("status"))) {
      throw new HttpsError("permission-denied", "This practice does not have a follow-up request for your account.");
    }
    if (existingUpdate.exists) return { updateId: updateRef.id, alreadySubmitted: true };

    const practitionerId = support.get("practitionerId");
    const assignments = await transaction.get(assignmentQuery);
    const stillConnected = assignments.docs.some((assignment) => assignment.get("providerId") === practitionerId);
    if (!stillConnected) throw new HttpsError("failed-precondition", "This practitioner connection is no longer active.");
    transaction.create(updateRef, {
      clientId, practitionerId, supportId, toolId: support.get("toolId"), outcome, note, submittedAt,
    });
    transaction.update(supportRef, { lastProgressAt: submittedAt });
    return { updateId: updateRef.id, alreadySubmitted: false };
  });
  return { ok: true, ...result };
});

exports.exportMyWellnessData = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireClient(request);
  const [checkins, assessments, formulations, carePlans, safetyFlags] = await Promise.all([
    db.collection("checkins").where("userId", "==", uid).limit(1000).get(),
    db.collection("assessmentSessions").where("userId", "==", uid).limit(500).get(),
    db.collection("clinicalFormulations").where("userId", "==", uid).limit(500).get(),
    db.collection("carePlans").where("userId", "==", uid).limit(500).get(),
    db.collection("safetyFlags").where("userId", "==", uid).limit(500).get(),
  ]);
  const sessions = await Promise.all(assessments.docs.map(async (doc) => {
    const answers = await doc.ref.collection("answers").limit(500).get();
    return { id: doc.id, ...doc.data(), answers: answers.docs.map((answer) => ({ id: answer.id, ...answer.data() })) };
  }));
  const plans = await Promise.all(carePlans.docs.map(async (doc) => {
    const items = await doc.ref.collection("items").limit(500).get();
    return plain({
      id: doc.id,
      ...doc.data(),
      planItems: items.docs.map((item) => ({ id: item.id, ...item.data() })),
    });
  }));
  return {
    exportedAt: new Date().toISOString(),
    checkins: checkins.docs.map((doc) => plain({ id: doc.id, ...doc.data() })),
    assessments: plain(sessions),
    clinicalFormulations: formulations.docs.map((doc) => plain({ id: doc.id, ...doc.data() })),
    carePlans: plans,
    safetyFlags: safetyFlags.docs.map((doc) => plain({ id: doc.id, ...doc.data() })),
  };
});
