const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("./firebaseAdminCompat.cjs");
const providerScheduling = require("./providerScheduling");
const { isProductFeatureEnabled } = require("./agentOperations");
const { SHARED_DATA_CAPABILITIES } = require("./practitionerWorkspacePolicy");
const { practitionerAuditEvent, stagePractitionerAudit } = require("./practitionerAudit");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const REGION = "us-central1";
const TOOL_IDS = new Set(["breathing", "grounding", "body-scan", "journaling", "self-surgeon", "urge-surfing", "meditation", "affirmations", "low-energy-plan"]);
const SHARE_KEYS = new Set(["recoveryProgress", "wellnessPatterns", "writtenReflections", "assessments", "visitPreparation", "careCoordination"]);
const VISIT_PREP_SHARE_KEY = "visitPreparation";
const VISIT_PREP_FIELDS = new Set(["visitPurpose", "priorities", "questions", "accessPreferences"]);
const VISIT_PREP_PREFERENCES = new Set(["interpreter", "writtenInstructions", "supportPerson", "slowerPace", "accessibility", "other"]);

function requireClient(request, action = "manage practitioner sharing") {
  const uid = request.auth?.uid;
  if (!uid || request.auth.token.firebase?.sign_in_provider === "anonymous") {
    throw new HttpsError("unauthenticated", `Sign in to ${action}.`);
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

function cleanShortText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

exports.saveMyVisitPreparation = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClient(request, "save appointment preparation");
  const supplied = request.data?.preparation && typeof request.data.preparation === "object" ? request.data.preparation : {};
  const id = typeof supplied.id === "string" && /^[A-Za-z0-9_-]{8,100}$/.test(supplied.id) ? supplied.id : db.collection("client_visit_preparations").doc().id;
  const preparationRef = db.collection("client_visit_preparations").doc(id);
  const appointmentId = cleanShortText(supplied.appointmentId, 160);
  const visitPurpose = cleanShortText(supplied.visitPurpose, 240);
  const priorities = Array.isArray(supplied.priorities) ? supplied.priorities.slice(0, 3).map((value) => cleanShortText(value, 180)).filter(Boolean) : [];
  const questions = Array.isArray(supplied.questions) ? supplied.questions.slice(0, 5).map((value) => cleanShortText(value, 240)).filter(Boolean) : [];
  const accessPreferences = Array.isArray(supplied.accessPreferences)
    ? [...new Set(supplied.accessPreferences.filter((value) => VISIT_PREP_PREFERENCES.has(value)))].slice(0, VISIT_PREP_PREFERENCES.size)
    : [];
  const afterVisit = supplied.afterVisit && typeof supplied.afterVisit === "object" ? {
    remember: cleanShortText(supplied.afterVisit.remember, 500),
    nextStep: cleanShortText(supplied.afterVisit.nextStep, 300),
    openQuestion: cleanShortText(supplied.afterVisit.openQuestion, 300),
  } : { remember: "", nextStep: "", openQuestion: "" };
  const requestedShare = supplied.share && typeof supplied.share === "object" ? supplied.share : {};
  const practitionerId = requestedShare.enabled === true ? cleanShortText(requestedShare.practitionerId, 160) : "";
  const requestedFields = [...new Set(Array.isArray(requestedShare.fields) ? requestedShare.fields.filter((field) => VISIT_PREP_FIELDS.has(field)) : [])];
  const sharedFields = requestedFields.filter((field) => {
    const value = { visitPurpose, priorities, questions, accessPreferences }[field];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
  if (!visitPurpose && !priorities.length && !questions.length && !accessPreferences.length && !afterVisit.remember && !afterVisit.nextStep && !afterVisit.openQuestion) {
    throw new HttpsError("invalid-argument", "Add a visit priority, question, or preparation note before saving.");
  }
  if (requestedShare.enabled === true && (!practitionerId || !sharedFields.length)) {
    throw new HttpsError("invalid-argument", "Choose a connected practitioner and at least one field to share.");
  }
  if (requestedShare.enabled === true && !appointmentId) {
    throw new HttpsError("failed-precondition", "Choose an upcoming appointment before sharing this preparation.");
  }

  const appointmentRef = appointmentId ? db.collection("appointments").doc(appointmentId) : null;
  const assignmentQuery = practitionerId ? db.collection("clientProviderAssignments")
    .where("clientId", "==", clientId).where("providerId", "==", practitionerId).where("status", "==", "active").limit(1) : null;
  const shareRef = practitionerId ? db.collection("client_practitioner_shares").doc(shareId(clientId, practitionerId)) : null;
  const settingsRef = db.doc("admin/systemSettings");
  const saved = await db.runTransaction(async (transaction) => {
    const reads = [transaction.get(preparationRef)];
    if (appointmentRef) reads.push(transaction.get(appointmentRef));
    if (assignmentQuery) reads.push(transaction.get(assignmentQuery), transaction.get(shareRef), transaction.get(settingsRef));
    const results = await Promise.all(reads);
    const existing = results[0];
    if (existing.exists && existing.get("clientId") !== clientId) throw new HttpsError("permission-denied", "This preparation is not available to your account.");
    let appointment = null;
    let assignmentId = "";
    if (appointmentRef) {
      appointment = results[1];
      const appointmentStart = appointment.get("startAt")?.toDate?.();
      if (!appointment.exists || appointment.get("clientId") !== clientId || !["scheduled", "confirmed"].includes(appointment.get("status")) || !appointmentStart || appointmentStart.getTime() <= Date.now()) {
        throw new HttpsError("failed-precondition", "Choose an upcoming appointment on your account.");
      }
    }
    if (practitionerId) {
      const assignments = results[2];
      const share = results[3];
      const settings = results[4];
      if (assignments.empty || (appointment && appointment.get("providerId") !== practitionerId)) {
        throw new HttpsError("permission-denied", "Choose the practitioner connected to this appointment.");
      }
      const featureEnabled = settings.data()?.settings?.features?.sessionSharing !== false;
      if (!featureEnabled) throw new HttpsError("failed-precondition", "Practitioner sharing is temporarily paused.");
      if (!share.exists || share.get("scopes")?.[VISIT_PREP_SHARE_KEY] !== true) {
        throw new HttpsError("failed-precondition", "Turn on visit-preparation sharing for this practitioner in your sharing settings first.");
      }
      assignmentId = assignments.docs[0].id;
    }
    const nextShare = practitionerId ? {
      practitionerId,
      assignmentId,
      fields: sharedFields,
      enabled: true,
      acknowledgedAt: null,
    } : { practitionerId: "", assignmentId: "", fields: [], enabled: false, acknowledgedAt: null };
    const payload = {
      clientId,
      appointmentId,
      visitPurpose,
      priorities,
      questions,
      accessPreferences,
      afterVisit,
      share: nextShare,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (!existing.exists) payload.createdAt = admin.firestore.FieldValue.serverTimestamp();
    transaction.set(preparationRef, payload, { merge: true });
    const priorShare = existing.get("share") || {};
    const priorShareEnabled = priorShare.enabled === true;
    const shareChanged = priorShareEnabled !== nextShare.enabled
      || (priorShareEnabled && nextShare.enabled && (priorShare.practitionerId !== nextShare.practitionerId
        || JSON.stringify([...(priorShare.fields || [])].sort()) !== JSON.stringify([...nextShare.fields].sort())));
    stagePractitionerAudit(transaction, db, {
      action: existing.exists ? "visit_preparation.updated" : "visit_preparation.created",
      actorUid: clientId,
      clientUid: clientId,
      preparationId: id,
      fields: nextShare.enabled ? nextShare.fields : [],
      practitionerUid: nextShare.enabled ? nextShare.practitionerId : null,
    });
    if (shareChanged) stagePractitionerAudit(transaction, db, {
      action: nextShare.enabled ? (priorShareEnabled ? "visit_preparation.share_updated" : "visit_preparation.share_granted") : "visit_preparation.share_revoked",
      actorUid: clientId,
      clientUid,
      preparationId: id,
      fields: nextShare.enabled ? nextShare.fields : priorShare.fields,
      practitionerUid: nextShare.enabled ? nextShare.practitionerId : priorShare.practitionerId,
    });
    return { id, shareEnabled: nextShare.enabled, sharedFields: nextShare.fields };
  });
  return { ok: true, ...saved };
});

exports.listMyVisitPreparations = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClient(request, "view appointment preparation");
  const snapshot = await db.collection("client_visit_preparations").where("clientId", "==", clientId).orderBy("updatedAt", "desc").limit(40).get();
  return { preparations: snapshot.docs.map((doc) => ({ id: doc.id, ...plain(doc.data()) })) };
});

exports.deleteMyVisitPreparation = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClient(request, "delete an appointment preparation");
  const preparationId = typeof request.data?.preparationId === "string" ? request.data.preparationId.trim() : "";
  if (!preparationId || preparationId.includes("/")) throw new HttpsError("invalid-argument", "Choose a preparation to delete.");
  const ref = db.collection("client_visit_preparations").doc(preparationId);
  await db.runTransaction(async (transaction) => {
    const item = await transaction.get(ref);
    if (!item.exists) return;
    if (item.get("clientId") !== clientId) throw new HttpsError("permission-denied", "This preparation is not available to your account.");
    transaction.delete(ref);
    stagePractitionerAudit(transaction, db, {
      action: "visit_preparation.deleted",
      actorUid: clientId,
      clientUid: clientId,
      preparationId,
      practitionerUid: item.get("share.practitionerId") || null,
      fields: item.get("share.fields") || [],
    });
  });
  return { ok: true };
});

exports.listProviderVisitPreparations = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const practitionerId = await providerScheduling.requireProviderCapability(request, "client.visit_preparation.read");
  const clientId = typeof request.data?.clientId === "string" ? request.data.clientId.trim() : "";
  if (!clientId) throw new HttpsError("invalid-argument", "Choose a connected client.");
  return db.runTransaction(async (transaction) => {
    await providerScheduling.requireProviderCapabilityInTransaction(transaction, request, "client.visit_preparation.read");
    const [assignment, share, settings, preparations] = await Promise.all([
      transaction.get(db.collection("clientProviderAssignments").where("clientId", "==", clientId).where("providerId", "==", practitionerId).where("status", "==", "active").limit(1)),
      transaction.get(db.collection("client_practitioner_shares").doc(shareId(clientId, practitionerId))),
      transaction.get(db.doc("admin/systemSettings")),
      transaction.get(db.collection("client_visit_preparations").where("clientId", "==", clientId).where("share.practitionerId", "==", practitionerId).where("share.enabled", "==", true).limit(30)),
    ]);
    if (assignment.empty) throw new HttpsError("permission-denied", "This person is not currently connected to your account.");
    if (settings.data()?.settings?.features?.sessionSharing === false) return { preparations: [], sharingPaused: true };
    const assignmentId = assignment.docs[0].id;
    const scopeEnabled = share.exists && share.get("assignmentId") === assignmentId && share.get("scopes")?.[VISIT_PREP_SHARE_KEY] === true;
    if (!scopeEnabled) return { preparations: [], sharingPaused: false };
    const appointmentIds = [...new Set(preparations.docs.map((doc) => doc.get("appointmentId")).filter(Boolean))];
    const appointmentSnapshots = await Promise.all(appointmentIds.map((id) => transaction.get(db.collection("appointments").doc(id))));
    const appointmentById = new Map(appointmentSnapshots.map((appointment) => [appointment.id, appointment]));
    const allowed = preparations.docs.filter((doc) => {
      if (doc.get("share.assignmentId") !== assignmentId || !Array.isArray(doc.get("share.fields")) || !doc.get("share.fields").length) return false;
      const appointment = appointmentById.get(doc.get("appointmentId"));
      const startAt = appointment?.get("startAt")?.toDate?.();
      return appointment?.exists === true
        && appointment.get("clientId") === clientId
        && appointment.get("providerId") === practitionerId
        && ["scheduled", "confirmed"].includes(appointment.get("status"))
        && startAt instanceof Date
        && startAt.getTime() > Date.now();
    });
    const data = allowed.map((doc) => {
      const item = doc.data();
      const fields = new Set(item.share.fields);
      const visible = { id: doc.id, appointmentId: item.appointmentId || "", sharedFields: item.share.fields, acknowledgedAt: iso(item.share.acknowledgedAt), updatedAt: iso(item.updatedAt) };
      if (fields.has("visitPurpose")) visible.visitPurpose = item.visitPurpose || "";
      if (fields.has("priorities")) visible.priorities = Array.isArray(item.priorities) ? item.priorities : [];
      if (fields.has("questions")) visible.questions = Array.isArray(item.questions) ? item.questions : [];
      if (fields.has("accessPreferences")) visible.accessPreferences = Array.isArray(item.accessPreferences) ? item.accessPreferences : [];
      return visible;
    });
    stagePractitionerAudit(transaction, db, {
      action: "visit_preparation.read",
      actorUid: practitionerId,
      clientUid: clientId,
      practitionerUid: practitionerId,
      recordIds: data.map((item) => item.id),
      fields: [...new Set(data.flatMap((item) => item.sharedFields || []))],
      resultCount: data.length,
    });
    return { preparations: data.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")), sharingPaused: false };
  });
});

exports.acknowledgeVisitPreparation = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const practitionerId = await providerScheduling.requireProviderCapability(request, "client.visit_preparation.acknowledge");
  const preparationId = typeof request.data?.preparationId === "string" ? request.data.preparationId.trim() : "";
  if (!preparationId || preparationId.includes("/")) throw new HttpsError("invalid-argument", "Choose a shared preparation first.");
  const ref = db.collection("client_visit_preparations").doc(preparationId);
  return db.runTransaction(async (transaction) => {
    await providerScheduling.requireProviderCapabilityInTransaction(transaction, request, "client.visit_preparation.acknowledge");
    const item = await transaction.get(ref);
    if (!item.exists || item.get("share.enabled") !== true || item.get("share.practitionerId") !== practitionerId) throw new HttpsError("permission-denied", "This visit preparation is not shared with your account.");
    const [assignment, share, settings] = await Promise.all([
      transaction.get(db.collection("clientProviderAssignments").where("clientId", "==", item.get("clientId")).where("providerId", "==", practitionerId).where("status", "==", "active").limit(1)),
      transaction.get(db.collection("client_practitioner_shares").doc(shareId(item.get("clientId"), practitionerId))),
      transaction.get(db.doc("admin/systemSettings")),
    ]);
    const appointment = item.get("appointmentId") ? await transaction.get(db.collection("appointments").doc(item.get("appointmentId"))) : null;
    const appointmentStart = appointment?.get("startAt")?.toDate?.();
    if (assignment.empty || assignment.docs[0].id !== item.get("share.assignmentId") || !share.exists || share.get("assignmentId") !== assignment.docs[0].id || share.get("scopes")?.[VISIT_PREP_SHARE_KEY] !== true || settings.data()?.settings?.features?.sessionSharing === false || !appointment?.exists || appointment.get("clientId") !== item.get("clientId") || appointment.get("providerId") !== practitionerId || !["scheduled", "confirmed"].includes(appointment.get("status")) || !appointmentStart || appointmentStart.getTime() <= Date.now()) {
      throw new HttpsError("permission-denied", "The client’s sharing choice or active connection has changed.");
    }
    const acknowledgedAt = admin.firestore.FieldValue.serverTimestamp();
    transaction.update(ref, { "share.acknowledgedAt": acknowledgedAt });
    stagePractitionerAudit(transaction, db, {
      action: "visit_preparation.acknowledged",
      actorUid: practitionerId,
      clientUid: item.get("clientId"),
      practitionerUid: practitionerId,
      preparationId,
      fields: item.get("share.fields") || [],
    });
    return { ok: true };
  });
});

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
      careCoordinationVersion: Number.isSafeInteger(share.get("careCoordinationVersion")) ? share.get("careCoordinationVersion") : 0,
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
      const previousCareCoordinationVersion = Number.isSafeInteger(existingShare.get("careCoordinationVersion")) ? existingShare.get("careCoordinationVersion") : 0;
      const careCoordinationVersion = previousCareCoordinationVersion
        + (previousScopes.careCoordination === true && scopes.careCoordination !== true ? 1 : 0);
      const addsAccess = Object.entries(scopes).some(([key, enabledScope]) => enabledScope && previousScopes[key] !== true);
      if (!enabled && addsAccess) {
        throw new HttpsError("failed-precondition", "Practitioner sharing is temporarily paused. You can still turn off any sharing choice that is already on.");
      }
      transaction.set(ref, {
        clientId,
        practitionerId,
        assignmentId: assignment.docs[0].id,
        scopes,
        careCoordinationVersion,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      const scopeChanges = [...SHARE_KEYS]
        .filter((key) => (previousScopes[key] === true) !== (scopes[key] === true))
        .map((scope) => ({ scope, enabled: scopes[scope] }));
      if (scopeChanges.length) stagePractitionerAudit(transaction, db, {
        action: "practitioner_sharing.updated",
        actorUid: clientId,
        clientUid: clientId,
        practitionerUid: practitionerId,
        scopeChanges,
      });
    });
  } catch (error) {
    // Never let an availability-read failure block a client from revoking all
    // sharing. An all-false update cannot expose new information.
    if (!(error instanceof HttpsError) && Object.values(scopes).some(Boolean)) {
      throw new HttpsError("unavailable", "Sharing availability could not be checked, so no new access was granted. Please try again.");
    }
    if (!(error instanceof HttpsError)) {
      const currentShare = await ref.get();
      const currentScopes = currentShare.exists ? currentShare.get("scopes") || {} : {};
      const currentVersion = Number.isSafeInteger(currentShare.get("careCoordinationVersion")) ? currentShare.get("careCoordinationVersion") : 0;
      const careCoordinationVersion = currentVersion + (currentScopes.careCoordination === true && scopes.careCoordination !== true ? 1 : 0);
      await ref.set({ clientId, practitionerId, scopes, careCoordinationVersion, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      const changedScopes = [...SHARE_KEYS].filter((scope) => scopes[scope] === false).map((scope) => ({ scope, enabled: false }));
      try {
        await db.collection("practitioner_data_access_audit").add(practitionerAuditEvent({
          action: "practitioner_sharing.revoked_during_settings_failure",
          actorUid: clientId,
          clientUid: clientId,
          practitionerUid: practitionerId,
          scopeChanges: changedScopes,
        }));
      } catch { /* preserve the fail-safe revoke; emit no personal content */ }
    } else throw error;
  }
  return { ok: true, scopes };
});

exports.getProviderClientOverview = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const practitionerId = await providerScheduling.requireProviderCapability(request, "client.shared_overview.read");
  const clientId = typeof request.data?.clientId === "string" ? request.data.clientId : "";
  if (!clientId) throw new HttpsError("permission-denied", "This person is not currently connected to your account.");
  try {
      return await db.runTransaction(async (transaction) => {
        await providerScheduling.requireProviderCapabilityInTransaction(transaction, request, "client.shared_overview.read");
        const workspaceAccess = await providerScheduling.getProviderCapabilitiesForRequest(request, transaction);
        const capabilitySet = workspaceAccess.capabilities;
        const scopeAccess = Object.fromEntries(Object.entries(SHARED_DATA_CAPABILITIES)
          .map(([scope, capability]) => [scope, capabilitySet.has(capability)]));
        const [assignment, systemSettings, share] = await Promise.all([
          transaction.get(db.collection("clientProviderAssignments")
            .where("clientId", "==", clientId)
            .where("providerId", "==", practitionerId)
            .where("status", "==", "active")
            .limit(1)),
          transaction.get(db.doc("admin/systemSettings")),
          transaction.get(db.collection("client_practitioner_shares").doc(shareId(clientId, practitionerId))),
        ]);
        if (assignment.empty) throw new HttpsError("permission-denied", "This person is not currently connected to your account.");
        const sharingFlag = systemSettings.data()?.settings?.features?.sessionSharing;
        const sharingEnabled = typeof sharingFlag === "boolean" ? sharingFlag : true;
        if (!sharingEnabled) {
          return {
            shared: false, sharingPaused: true, sharingStatusUnknown: false, scopes: {}, scopeAccess, checkins: [], assessments: [], practiceProgress: [],
            message: "Practitioner access to client-shared information is temporarily paused. Their choices remain saved and the client can still revoke them.",
          };
        }
        const scopes = share.exists && (!share.get("assignmentId") || share.get("assignmentId") === assignment.docs[0].id)
          ? share.get("scopes") || {} : {};
        const visibleScopes = Object.fromEntries(Object.keys(SHARED_DATA_CAPABILITIES)
          .filter((scope) => scope !== "practiceProgress")
          .map((scope) => [scope, scopes[scope] === true && scopeAccess[scope] === true]));
        const progressSnapshot = scopeAccess.practiceProgress
          ? await transaction.get(db.collection("client_practitioner_practice_updates")
            .where("practitionerId", "==", practitionerId)
            .where("clientId", "==", clientId)
            .orderBy("submittedAt", "desc")
            .limit(30))
          : { docs: [] };
      const practiceProgress = progressSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return { id: doc.id, toolId: data.toolId, outcome: data.outcome, note: data.note || "", submittedAt: iso(data.submittedAt) };
        });
      if (!Object.values(visibleScopes).some(Boolean)) return {
        shared: false, sharingPaused: false, sharingStatusUnknown: false, scopes: visibleScopes, scopeAccess,
        checkins: [], assessments: [], practiceProgress,
        message: Object.values(scopeAccess).some((allowed) => !allowed)
          ? "This workspace can display only the sharing categories it is authorized to use. Available information stays under the client’s control."
          : "This person has not shared check-in information with you. Their check-ins stay private.",
      };
      const [checkins, assessments] = await Promise.all([
        [visibleScopes.recoveryProgress, visibleScopes.wellnessPatterns, visibleScopes.writtenReflections].some(Boolean)
          ? transaction.get(db.collection("checkins").where("userId", "==", clientId).orderBy("timestamp", "desc").limit(14))
          : Promise.resolve({ docs: [] }),
        visibleScopes.assessments
          ? transaction.get(db.collection("assessmentSessions").where("userId", "==", clientId).orderBy("createdAt", "desc").limit(10))
          : Promise.resolve({ docs: [] }),
      ]);
      const rows = checkins.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      const allowed = (row) => {
        const item = { date: row.date || null, savedAt: iso(row.timestamp) };
        if (visibleScopes.recoveryProgress) {
          item.daysSinceLastUse = Number.isFinite(row.daysSinceLastUse) ? row.daysSinceLastUse : null;
          item.cravingStatus = row.cravingStatus || null;
          item.cravingIntensity = Number.isFinite(row.cravingIntensity) ? row.cravingIntensity : null;
          item.triggerStatus = row.triggerStatus || null;
          item.triggerIntensity = Number.isFinite(row.triggerIntensity) ? row.triggerIntensity : null;
        }
        if (visibleScopes.wellnessPatterns) {
          item.mood = row.mood || null; item.energy = row.energy ?? null; item.stress = row.stress ?? null; item.sleep = row.sleep ?? null;
          item.supportNeeded = row.supportNeeded || null; item.plannedActivities = Array.isArray(row.plannedActivities) ? row.plannedActivities.slice(0, 10) : [];
          item.skillsPracticed = row.skillsPracticed || "";
        }
        if (visibleScopes.writtenReflections) {
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
        const answerDocs = await transaction.get(doc.ref.collection("answers").limit(500));
        const subcollectionAnswers = Object.fromEntries(answerDocs.docs.map((answer) => [answer.id, plain(answer.data())]));
        return {
          id: doc.id,
          createdAt: iso(doc.get("createdAt") || doc.get("timestamp")),
          answers: Object.keys(subcollectionAnswers).length ? subcollectionAnswers : (plain(embeddedAnswers) || {}),
        };
      }));
      return {
        shared: true, sharingPaused: false, sharingStatusUnknown: false, scopes: visibleScopes, scopeAccess,
        checkins: rows.map(allowed), totalRecentCheckins: rows.length, latestCheckInAt: rows[0] ? iso(rows[0].timestamp) : null,
        assessments: sharedAssessments, practiceProgress,
      };
    });
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("[practitionerCare] Client overview could not be securely read", { code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "Shared information could not be securely checked. Please try again.");
  }
});

exports.sendPractitionerSupportTool = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const practitionerId = await providerScheduling.requireProviderCapability(request, "client.support_tool.send");
  const clientId = typeof request.data?.clientId === "string" ? request.data.clientId : "";
  const toolId = typeof request.data?.toolId === "string" ? request.data.toolId : "";
  const message = typeof request.data?.message === "string" ? request.data.message.trim().slice(0, 240) : "";
  const followUpDays = request.data?.followUpDays === 7 ? 7 : 0;
  if (!TOOL_IDS.has(toolId)) throw new HttpsError("invalid-argument", "Choose an available support tool.");
  if (!clientId) throw new HttpsError("permission-denied", "You can send a tool only to someone currently connected to you.");
  const ref = db.collection("client_practitioner_support").doc();
  await db.runTransaction(async (transaction) => {
    await providerScheduling.requireProviderCapabilityInTransaction(transaction, request, "client.support_tool.send");
    const [assignment, profile] = await Promise.all([
      transaction.get(db.collection("clientProviderAssignments")
        .where("clientId", "==", clientId)
        .where("providerId", "==", practitionerId)
        .where("status", "==", "active")
        .limit(1)),
      transaction.get(db.collection("realHelpProviders").doc(practitionerId)),
    ]);
    if (assignment.empty) throw new HttpsError("permission-denied", "You can send a tool only to someone currently connected to you.");
    transaction.create(ref, {
      clientId, practitionerId, practitionerName: profile.get("name") || "Your practitioner",
      toolId, message, followUpDays, status: "new", createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
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
  const [checkins, assessments, formulations, carePlans, safetyFlags, visitPreparations, careHandoffs] = await Promise.all([
    db.collection("checkins").where("userId", "==", uid).limit(1000).get(),
    db.collection("assessmentSessions").where("userId", "==", uid).limit(500).get(),
    db.collection("clinicalFormulations").where("userId", "==", uid).limit(500).get(),
    db.collection("carePlans").where("userId", "==", uid).limit(500).get(),
    db.collection("safetyFlags").where("userId", "==", uid).limit(500).get(),
    db.collection("client_visit_preparations").where("clientId", "==", uid).limit(500).get(),
    db.collection("client_care_handoffs").where("clientId", "==", uid).limit(500).get(),
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
    visitPreparations: visitPreparations.docs.map((doc) => plain({ id: doc.id, ...doc.data() })),
    careHandoffs: careHandoffs.docs.map((doc) => plain({ id: doc.id, ...doc.data() })),
  };
});

exports.deleteMyCheckIns = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireClient(request, "delete your saved check-ins");
  const checkins = db.collection("checkins");
  let deletedCount = 0;
  let batches = 0;

  try {
    // Re-read the first bounded owner-scoped page after each batch. Capping
    // work per invocation avoids long-running unbounded calls; the client can
    // repeat safely until complete if the account has a large history.
    while (batches < 10) {
      const snapshot = await checkins.where("userId", "==", uid).limit(400).get();
      if (snapshot.empty) break;
      const batch = db.batch();
      snapshot.docs.forEach((document) => batch.delete(document.ref));
      await batch.commit();
      deletedCount += snapshot.size;
      batches += 1;
    }
    const remaining = await checkins.where("userId", "==", uid).limit(1).get();
    return { ok: true, deletedCount, complete: remaining.empty };
  } catch (error) {
    console.error("Could not finish account-owned check-in deletion:", error?.code || "unknown");
    throw new HttpsError("unavailable", "Check-in deletion did not finish. You can run it again; records already removed will stay deleted.");
  }
});
