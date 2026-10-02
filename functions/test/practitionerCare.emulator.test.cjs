const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-practitioner";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const care = require("../src/practitionerCare");
const sendSupportTool = care.sendPractitionerSupportTool.run;
const listMySupport = care.listMyPractitionerSupport.run;
const markSupportSeen = care.markPractitionerSupportSeen.run;
const listDailyPractice = care.listMyDailyPractice.run;
const submitPracticeProgress = care.submitPractitionerPracticeProgress.run;
const providerOverview = care.getProviderClientOverview.run;
const listShares = care.listMyPractitionerShares.run;
const setShare = care.setPractitionerShare.run;
const exportWellnessData = care.exportMyWellnessData.run;
const connections = require("../src/practitionerConnections");
const requestConnection = connections.requestPractitionerConnection.run;
const listMyConnectionRequests = connections.listMyPractitionerConnectionRequests.run;
const listProviderConnectionRequests = connections.listPractitionerConnectionRequests.run;
const respondToConnection = connections.respondToPractitionerConnection.run;

const clientId = "consent-client";
const providerId = "consent-provider";
const unrelatedClientId = "other-client";
const assignmentId = `${clientId}-${providerId}`;

function clientRequest(data = {}) {
  return { auth: { uid: clientId, token: { email_verified: true, firebase: { sign_in_provider: "password" } } }, data };
}

function providerRequest(data = {}, uid = providerId) {
  return { auth: { uid, token: { email_verified: true, role: "provider", firebase: { sign_in_provider: "password" } } }, data };
}

async function seed() {
  await db.collection("clientProviderAssignments").doc(assignmentId).set({
    clientId,
    providerId,
    status: "active",
  });
  await db.collection("checkins").doc("consent-checkin").set({
    userId: clientId,
    completed: true,
    timestamp: admin.firestore.Timestamp.fromDate(new Date("2026-09-20T12:00:00.000Z")),
    date: "2026-09-20",
    daysSinceLastUse: 12,
    cravingStatus: "yes",
    cravingIntensity: 4,
    triggerStatus: "yes",
    triggerIntensity: 3,
    mood: "steady",
    energy: 7,
    stress: 2,
    sleep: 8,
    supportNeeded: "company",
    plannedActivities: ["walk"],
    skillsPracticed: "asked for help",
    cravingDetails: "private craving detail",
    triggerDetails: "private trigger detail",
    gratitude: "private gratitude",
    journal: "private journal",
  });
  await db.collection("checkins").doc("other-client-checkin").set({
    userId: unrelatedClientId,
    completed: true,
    timestamp: admin.firestore.Timestamp.fromDate(new Date("2026-09-21T12:00:00.000Z")),
    mood: "unrelated private record",
  });
  await db.collection("assessmentSessions").doc("consent-assessment").set({
    userId: clientId,
    createdAt: admin.firestore.Timestamp.fromDate(new Date("2026-09-20T12:00:00.000Z")),
    answers: { answerOne: "private assessment answer" },
  });
}

async function clean() {
  await db.doc("admin/systemSettings").delete();
  const collections = ["clientProviderAssignments", "client_practitioner_shares", "checkins", "assessmentSessions", "clinicalFormulations", "carePlans", "safetyFlags", "client_practitioner_practice_updates", "client_practitioner_support", "practitioner_connection_requests", "realHelpProviders", "users"];
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    if (!snapshot.empty) {
      if (collectionName === "carePlans") {
        for (const plan of snapshot.docs) {
          const items = await plan.ref.collection("items").get();
          if (!items.empty) {
            const itemBatch = db.batch();
            items.docs.forEach((item) => itemBatch.delete(item.ref));
            await itemBatch.commit();
          }
        }
      }
      const batch = db.batch();
      snapshot.docs.forEach((item) => batch.delete(item.ref));
      await batch.commit();
    }
  }
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

test("provider receives only the check-in fields the client selected", async () => {
  await setShare(clientRequest({
    practitionerId: providerId,
    scopes: { recoveryProgress: true, wellnessPatterns: false, writtenReflections: false, assessments: false, unexpected: true },
  }));

  const result = await providerOverview(providerRequest({ clientId }));
  assert.equal(result.shared, true);
  assert.deepEqual(result.scopes, {
    recoveryProgress: true,
    wellnessPatterns: false,
    writtenReflections: false,
    assessments: false,
  });
  assert.equal(result.checkins.length, 1);
  assert.equal(result.checkins[0].daysSinceLastUse, 12);
  assert.equal(result.checkins[0].cravingIntensity, 4);
  assert.equal("mood" in result.checkins[0], false);
  assert.equal("gratitude" in result.checkins[0], false);
  assert.equal("journal" in result.checkins[0], false);
  assert.equal("unexpected" in result.scopes, false);
  assert.deepEqual(result.assessments, []);
});

test("revoking every sharing scope immediately removes check-ins and assessment answers", async () => {
  await setShare(clientRequest({ practitionerId: providerId, scopes: { recoveryProgress: true, assessments: true } }));
  const beforeRevoke = await providerOverview(providerRequest({ clientId }));
  assert.equal(beforeRevoke.checkins.length, 1);
  assert.equal(beforeRevoke.assessments.length, 1);

  await setShare(clientRequest({ practitionerId: providerId, scopes: {} }));
  const afterRevoke = await providerOverview(providerRequest({ clientId }));
  assert.equal(afterRevoke.shared, false);
  assert.deepEqual(afterRevoke.checkins, []);
  assert.equal("assessments" in afterRevoke, false);
});

test("pausing session sharing hides personal records, preserves saved choices, and still permits revocation", async () => {
  await setShare(clientRequest({ practitionerId: providerId, scopes: { recoveryProgress: true, assessments: true } }));
  await db.collection("client_practitioner_practice_updates").doc("paused-progress").set({
    clientId, practitionerId: providerId, outcome: "tried", note: "Client-selected practice update",
    submittedAt: admin.firestore.Timestamp.fromDate(new Date("2026-09-22T12:00:00.000Z")),
  });
  await db.doc("admin/systemSettings").set({ settings: { features: { sessionSharing: false } } });

  const clientView = await listShares(clientRequest());
  assert.equal(clientView.sharingPaused, true);
  assert.equal(clientView.sharingStatusUnknown, false);
  assert.equal(clientView.shares[0].scopes.recoveryProgress, true);
  assert.equal(clientView.shares[0].scopes.assessments, true);

  const hidden = await providerOverview(providerRequest({ clientId }));
  assert.equal(hidden.shared, false);
  assert.equal(hidden.sharingPaused, true);
  assert.deepEqual(hidden.checkins, []);
  assert.deepEqual(hidden.assessments, []);
  assert.deepEqual(hidden.practiceProgress, []);

  await assert.rejects(
    setShare(clientRequest({ practitionerId: providerId, scopes: { recoveryProgress: true, assessments: true, wellnessPatterns: true } })),
    (error) => error.code === "failed-precondition",
  );

  const revoked = await setShare(clientRequest({ practitionerId: providerId, scopes: {} }));
  assert.deepEqual(revoked.scopes, { recoveryProgress: false, wellnessPatterns: false, writtenReflections: false, assessments: false });
  const afterRevoke = await listShares(clientRequest());
  assert.equal(afterRevoke.shares[0].scopes.recoveryProgress, false);
  assert.equal(afterRevoke.shares[0].scopes.assessments, false);
});

test("an unconnected or unrelated practitioner cannot view a client's shared workspace", async () => {
  await setShare(clientRequest({ practitionerId: providerId, scopes: { recoveryProgress: true } }));
  await assert.rejects(
    providerOverview(providerRequest({ clientId }, "different-provider")),
    (error) => error.code === "permission-denied",
  );
  await assert.rejects(
    providerOverview(providerRequest({ clientId: unrelatedClientId })),
    (error) => error.code === "permission-denied",
  );
});

test("a signed-in client without a practitioner role cannot call the provider overview", async () => {
  await assert.rejects(
    providerOverview({ auth: { uid: "ordinary-client", token: { email_verified: true, firebase: { sign_in_provider: "password" } } }, data: { clientId } }),
    (error) => error.code === "permission-denied",
  );
});

test("a client can choose whether a practitioner-shared practice enters their Daily Practice", async () => {
  await sendSupportTool(providerRequest({ clientId, toolId: "grounding", message: "Try this when it feels useful.", followUpDays: 7 }));

  const inbox = await listMySupport(clientRequest());
  assert.equal(inbox.items.length, 1);
  assert.equal(inbox.items[0].toolId, "grounding");
  assert.equal(inbox.items[0].message, "Try this when it feels useful.");
  assert.deepEqual((await listDailyPractice(clientRequest())).items, []);

  await markSupportSeen(clientRequest({ supportId: inbox.items[0].id, action: "added" }));
  const saved = await listDailyPractice(clientRequest());
  assert.equal(saved.items.length, 1);
  assert.equal(saved.items[0].toolId, "grounding");
  assert.equal(saved.items[0].followUpDays, 7);

  await assert.rejects(
    markSupportSeen(clientRequest({ supportId: inbox.items[0].id, action: "added" })),
    (error) => error.code === "failed-precondition",
  );
});

test("practice follow-up is sent only by its client while the connection is active", async () => {
  await sendSupportTool(providerRequest({ clientId, toolId: "breathing", followUpDays: 7 }));
  const [item] = (await listMySupport(clientRequest())).items;
  await markSupportSeen(clientRequest({ supportId: item.id, action: "added" }));

  const progress = await submitPracticeProgress(clientRequest({ supportId: item.id, outcome: "tried", note: "Used it after work." }));
  assert.ok(progress.updateId);
  const overview = await providerOverview(providerRequest({ clientId }));
  assert.equal(overview.practiceProgress.length, 1);
  assert.equal(overview.practiceProgress[0].outcome, "tried");
  assert.equal(overview.practiceProgress[0].note, "Used it after work.");

  await db.collection("clientProviderAssignments").doc(assignmentId).update({ status: "ended" });
  const safeRetry = await submitPracticeProgress(clientRequest({ supportId: item.id, outcome: "not-yet" }));
  assert.equal(safeRetry.alreadySubmitted, true, "a retry must acknowledge the existing update without creating another after disconnection");
});

test("a practitioner cannot send a shared practice to an unconnected client", async () => {
  await assert.rejects(
    sendSupportTool(providerRequest({ clientId: unrelatedClientId, toolId: "grounding" })),
    (error) => error.code === "permission-denied",
  );
  assert.deepEqual((await listMySupport(clientRequest())).items, []);
});

test("account export includes the complete private care plan and account safety record", async () => {
  await db.collection("carePlans").doc("private-plan").set({
    userId: clientId,
    sessionId: "private-plan",
    firstThree: [{ title: "Start here" }],
    horizon72h: "Try one small step",
    itemCount: 2,
  });
  await db.collection("carePlans").doc("private-plan").collection("items").doc("plan-item-1").set({
    title: "Contact a trusted person",
    createdAt: admin.firestore.Timestamp.fromDate(new Date("2026-09-28T12:00:00.000Z")),
  });
  await db.collection("safetyFlags").doc("private-plan").set({
    userId: clientId,
    riskLevel: "yellow",
    drivers: ["self-reported distress"],
    createdAt: admin.firestore.Timestamp.fromDate(new Date("2026-09-28T12:00:00.000Z")),
  });
  await db.collection("carePlans").doc("another-person-plan").set({ userId: unrelatedClientId, itemCount: 1 });
  await db.collection("safetyFlags").doc("another-person-plan").set({ userId: unrelatedClientId, riskLevel: "red" });

  const result = await exportWellnessData(clientRequest());
  assert.equal(result.carePlans.length, 1);
  assert.equal(result.carePlans[0].planItems[0].title, "Contact a trusted person");
  assert.equal(result.carePlans[0].planItems[0].createdAt, "2026-09-28T12:00:00.000Z");
  assert.equal(result.safetyFlags.length, 1);
  assert.deepEqual(result.safetyFlags[0].drivers, ["self-reported distress"]);
  assert.equal(JSON.stringify(result).includes("another-person-plan"), false);
});

test("connection request through consent and practitioner-shared support works as one journey", async () => {
  const nextProviderId = "new-consent-provider";
  await db.collection("realHelpProviders").doc(nextProviderId).set({
    name: "A verified recovery coach",
    type: "recovery-coach",
    acceptsReferrals: true,
    verification: { status: "verified" },
  });

  const sent = await requestConnection(clientRequest({ practitionerId: nextProviderId, introduction: "I would like help building a steady routine." }));
  assert.equal(sent.status, "pending");
  const duplicate = await requestConnection(clientRequest({ practitionerId: nextProviderId, introduction: "A duplicate request." }));
  assert.equal(duplicate.requestId, sent.requestId);
  assert.equal(duplicate.alreadyPending, true, "retries converge on the original pending request");
  assert.equal((await listMyConnectionRequests(clientRequest())).requests[0].status, "pending");

  const [inboxRequest] = (await listProviderConnectionRequests(providerRequest({}, nextProviderId))).requests;
  assert.equal(inboxRequest.id, sent.requestId);
  assert.equal(inboxRequest.introduction, "I would like help building a steady routine.");

  const decisions = await Promise.allSettled([
    respondToConnection(providerRequest({ requestId: sent.requestId, decision: "accept" }, nextProviderId)),
    respondToConnection(providerRequest({ requestId: sent.requestId, decision: "accept" }, nextProviderId)),
  ]);
  assert.equal(decisions.filter((result) => result.status === "fulfilled").length, 2, "a duplicate accept safely returns the accepted state");
  assert.ok(decisions.every((result) => result.value.status === "accepted"));
  const activeAssignments = await db.collection("clientProviderAssignments")
    .where("clientId", "==", clientId)
    .where("providerId", "==", nextProviderId)
    .where("status", "==", "active")
    .get();
  assert.equal(activeAssignments.size, 1);
  assert.equal((await listMyConnectionRequests(clientRequest())).requests[0].status, "accepted");

  await setShare(clientRequest({
    practitionerId: nextProviderId,
    scopes: { recoveryProgress: true, wellnessPatterns: false, writtenReflections: false, assessments: false },
  }));
  const sharedWorkspace = await providerOverview(providerRequest({ clientId }, nextProviderId));
  assert.equal(sharedWorkspace.shared, true);
  assert.equal(sharedWorkspace.checkins[0].daysSinceLastUse, 12);
  assert.equal("journal" in sharedWorkspace.checkins[0], false);
  assert.equal("gratitude" in sharedWorkspace.checkins[0], false);

  await sendSupportTool(providerRequest({ clientId, toolId: "grounding", message: "Try this when you want a brief pause.", followUpDays: 7 }, nextProviderId));
  const [offeredPractice] = (await listMySupport(clientRequest())).items;
  assert.equal(offeredPractice.practitionerName, "A verified recovery coach");
  await markSupportSeen(clientRequest({ supportId: offeredPractice.id, action: "added" }));
  assert.equal((await listDailyPractice(clientRequest())).items[0].toolId, "grounding");
  await submitPracticeProgress(clientRequest({ supportId: offeredPractice.id, outcome: "tried" }));
  assert.equal((await providerOverview(providerRequest({ clientId }, nextProviderId))).practiceProgress[0].outcome, "tried");
});
