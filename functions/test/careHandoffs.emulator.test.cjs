const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-care-handoffs";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("../src/firebaseAdminCompat.cjs");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const care = require("../src/practitionerCare");
const handoffs = require("../src/careHandoffs");

const clientId = "handoff-client";
const providerId = "handoff-provider";
const otherProviderId = "handoff-other-provider";
const primaryCareId = "handoff-primary-care";
const assignmentId = `${clientId}-${providerId}`;
const primaryCareAssignmentId = `${clientId}-${primaryCareId}`;

function clientRequest(data = {}) {
  return { auth: { uid: clientId, token: { email_verified: true, firebase: { sign_in_provider: "password" } } }, data };
}

function providerRequest(data = {}, uid = providerId) {
  return { auth: { uid, token: { email_verified: true, role: "provider", firebase: { sign_in_provider: "password" } } }, data };
}

async function clean() {
  for (const name of ["admin/systemSettings", `clientProviderAssignments/${assignmentId}`, `clientProviderAssignments/${primaryCareAssignmentId}`, `client_practitioner_shares/${clientId}_${providerId}`, `client_practitioner_shares/${clientId}_${primaryCareId}`, `users/${providerId}`, `users/${otherProviderId}`, `users/${primaryCareId}`, `realHelpProviders/${providerId}`, `realHelpProviders/${otherProviderId}`, `realHelpProviders/${primaryCareId}`, `appointments/pcp-visit`, "client_visit_preparations/pcp-preparation"]) {
    await db.doc(name).delete();
  }
  for (const name of ["client_care_handoffs", "practitioner_data_access_audit"]) {
    const snapshot = await db.collection(name).get();
    for (let offset = 0; offset < snapshot.docs.length; offset += 400) {
      const batch = db.batch();
      snapshot.docs.slice(offset, offset + 400).forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }
}

async function seed() {
  await Promise.all([
    db.collection("clientProviderAssignments").doc(assignmentId).set({ clientId, providerId, status: "active" }),
    db.collection("users").doc(providerId).set({ uid: providerId, role: "provider", providerType: "case-manager" }),
    db.collection("users").doc(otherProviderId).set({ uid: otherProviderId, role: "provider", providerType: "therapist" }),
    db.collection("realHelpProviders").doc(providerId).set({ type: "case-manager", verification: { status: "verified" } }),
    db.collection("realHelpProviders").doc(otherProviderId).set({ type: "therapist", verification: { status: "verified" } }),
  ]);
}

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Run this suite through the Firestore emulator");
  await clean();
});

beforeEach(async () => {
  await clean();
  await seed();
});

after(async () => {
  await clean();
  await admin.app().delete();
});

test("revoking then restoring scope requires explicit client reshare before practitioner access returns", async () => {
  await care.setPractitionerShare.run(clientRequest({ practitionerId: providerId, scopes: { careCoordination: true } }));
  const created = await handoffs.createMyCareHandoff.run(clientRequest({ handoff: {
    practitionerId: providerId,
    needType: "find-a-service",
    goal: "Help me locate an evening support group.",
    preferredTiming: "this-week",
    contactPreference: "request-tracker",
    fields: ["needType", "goal", "preferredTiming", "contactPreference"],
  } }));
  assert.equal(created.status, "requested");

  const visibleBeforeRevoke = await handoffs.listProviderCareHandoffs.run(providerRequest({ clientId }));
  assert.equal(visibleBeforeRevoke.handoffs.length, 1);
  assert.equal(visibleBeforeRevoke.handoffs[0].goal, "Help me locate an evening support group.");

  await care.setPractitionerShare.run(clientRequest({ practitionerId: providerId, scopes: {} }));
  await care.setPractitionerShare.run(clientRequest({ practitionerId: providerId, scopes: { careCoordination: true } }));

  const hiddenAfterReenable = await handoffs.listProviderCareHandoffs.run(providerRequest({ clientId }));
  assert.deepEqual(hiddenAfterReenable.handoffs, []);
  await assert.rejects(
    handoffs.updateProviderCareHandoff.run(providerRequest({ handoffId: created.id, status: "acknowledged" })),
    (error) => error.code === "permission-denied",
  );

  const clientList = await handoffs.listMyCareHandoffs.run(clientRequest());
  assert.equal(clientList.handoffs.length, 1);
  assert.equal(clientList.handoffs[0].share.careCoordinationVersion, 0);
  await handoffs.setMyCareHandoffStatus.run(clientRequest({ handoffId: created.id, action: "reopen" }));

  const visibleAfterReshare = await handoffs.listProviderCareHandoffs.run(providerRequest({ clientId }));
  assert.equal(visibleAfterReshare.handoffs.length, 1);
  assert.equal(visibleAfterReshare.handoffs[0].status, "requested");
});

test("case managers can see client-authorized handoffs without gaining shared recovery records", async () => {
  await db.collection("checkins").doc("case-manager-private-checkin").set({
    userId: clientId, timestamp: admin.firestore.Timestamp.now(), mood: "private fixture", journal: "private fixture",
  });
  try {
    await care.setPractitionerShare.run(clientRequest({ practitionerId: providerId, scopes: { careCoordination: true, recoveryProgress: true, writtenReflections: true } }));
    const created = await handoffs.createMyCareHandoff.run(clientRequest({ handoff: {
      practitionerId: providerId, needType: "find-a-service", goal: "Help me find a place to call.", fields: ["needType", "goal"],
    } }));
    const handoffView = await handoffs.listProviderCareHandoffs.run(providerRequest({ clientId }));
    const overview = await care.getProviderClientOverview.run(providerRequest({ clientId }));

    assert.equal(handoffView.handoffs[0].id, created.id);
    assert.equal(handoffView.handoffs[0].goal, "Help me find a place to call.");
    assert.equal(overview.scopeAccess.recoveryProgress, false);
    assert.equal(overview.scopeAccess.writtenReflections, false);
    assert.deepEqual(overview.checkins, []);
  } finally {
    await db.collection("checkins").doc("case-manager-private-checkin").delete();
  }
});

test("primary care can review selected visit preparation without recovery data or practical-help requests", async () => {
  const visitDate = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
  await Promise.all([
    db.collection("clientProviderAssignments").doc(primaryCareAssignmentId).set({ clientId, providerId: primaryCareId, status: "active" }),
    db.collection("users").doc(primaryCareId).set({ uid: primaryCareId, role: "provider", providerType: "primary-care" }),
    db.collection("realHelpProviders").doc(primaryCareId).set({ type: "primary-care", verification: { status: "verified" } }),
    db.collection("client_practitioner_shares").doc(`${clientId}_${primaryCareId}`).set({
      clientId, practitionerId: primaryCareId, assignmentId: primaryCareAssignmentId,
      scopes: { visitPreparation: true, recoveryProgress: true, writtenReflections: true },
    }),
    db.collection("appointments").doc("pcp-visit").set({
      clientId, providerId: primaryCareId, status: "scheduled", startAt: visitDate,
    }),
    db.collection("client_visit_preparations").doc("pcp-preparation").set({
      clientId, appointmentId: "pcp-visit", visitPurpose: "Discuss sleep changes", questions: ["What should I track?"],
      share: { practitionerId: primaryCareId, enabled: true, assignmentId: primaryCareAssignmentId, fields: ["visitPurpose", "questions"] },
    }),
  ]);

  const preparations = await care.listProviderVisitPreparations.run(providerRequest({ clientId }, primaryCareId));
  const overview = await care.getProviderClientOverview.run(providerRequest({ clientId }, primaryCareId));
  assert.equal(preparations.preparations[0].visitPurpose, "Discuss sleep changes");
  assert.equal(preparations.preparations[0].questions[0], "What should I track?");
  assert.equal(overview.scopeAccess.recoveryProgress, false);
  assert.equal(overview.scopeAccess.writtenReflections, false);
  assert.deepEqual(overview.checkins, []);
  await assert.rejects(
    handoffs.listProviderCareHandoffs.run(providerRequest({ clientId }, primaryCareId)),
    (error) => error.code === "permission-denied",
  );
});

test("an unrelated practitioner cannot read or update a client handoff", async () => {
  await care.setPractitionerShare.run(clientRequest({ practitionerId: providerId, scopes: { careCoordination: true } }));
  const created = await handoffs.createMyCareHandoff.run(clientRequest({ handoff: {
    practitionerId: providerId, needType: "follow-up", goal: "Help me follow up on a resource.", fields: ["needType", "goal"],
  } }));

  await assert.rejects(
    handoffs.listProviderCareHandoffs.run(providerRequest({ clientId }, otherProviderId)),
    (error) => error.code === "permission-denied",
  );
  await assert.rejects(
    handoffs.updateProviderCareHandoff.run(providerRequest({ handoffId: created.id, status: "acknowledged" }, otherProviderId)),
    (error) => error.code === "permission-denied",
  );
});

test("the client-selected fields stay scoped through practitioner follow-up, confirmation, and withdrawal", async () => {
  await care.setPractitionerShare.run(clientRequest({ practitionerId: providerId, scopes: { careCoordination: true } }));
  const privateContext = "Keep this private context out of the practitioner view.";
  const created = await handoffs.createMyCareHandoff.run(clientRequest({ handoff: {
    practitionerId: providerId,
    needType: "follow-up",
    goal: "Help me contact the evening group.",
    context: privateContext,
    preferredTiming: "this-week",
    contactPreference: "next-appointment",
    fields: ["needType", "goal", "preferredTiming"],
  } }));

  const providerProjection = await handoffs.listProviderCareHandoffs.run(providerRequest({ clientId }));
  assert.equal(providerProjection.handoffs.length, 1);
  assert.equal(providerProjection.handoffs[0].goal, "Help me contact the evening group.");
  assert.equal(providerProjection.handoffs[0].preferredTiming, "this-week");
  assert.equal(Object.hasOwn(providerProjection.handoffs[0], "context"), false);
  assert.equal(Object.hasOwn(providerProjection.handoffs[0], "contactPreference"), false);

  await handoffs.updateProviderCareHandoff.run(providerRequest({ handoffId: created.id, status: "acknowledged", reply: "I’ll bring options to our next check-in." }));
  await handoffs.updateProviderCareHandoff.run(providerRequest({ handoffId: created.id, status: "follow_up_complete", reply: "We reviewed two options together." }));
  const clientView = await handoffs.listMyCareHandoffs.run(clientRequest());
  assert.equal(clientView.handoffs[0].status, "follow_up_complete");
  assert.equal(clientView.handoffs[0].practitionerReply, "We reviewed two options together.");
  assert.equal(clientView.handoffs[0].context, privateContext);

  await handoffs.setMyCareHandoffStatus.run(clientRequest({ handoffId: created.id, action: "confirm" }));
  assert.equal((await handoffs.listProviderCareHandoffs.run(providerRequest({ clientId }))).handoffs[0].status, "client_confirmed");
  await handoffs.setMyCareHandoffStatus.run(clientRequest({ handoffId: created.id, action: "withdraw" }));
  assert.deepEqual((await handoffs.listProviderCareHandoffs.run(providerRequest({ clientId }))).handoffs, []);

  const audit = await db.collection("practitioner_data_access_audit").get();
  const auditText = JSON.stringify(audit.docs.map((doc) => doc.data()));
  assert.equal(auditText.includes(privateContext), false);
  assert.equal(auditText.includes("Help me contact the evening group."), false);
});
