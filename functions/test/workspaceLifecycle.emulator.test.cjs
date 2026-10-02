const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-workspace-lifecycle";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });
process.env.LIVEKIT_URL = "wss://video.test.invalid";
process.env.LIVEKIT_API_KEY = "test-livekit-key";
process.env.LIVEKIT_API_SECRET = "test-livekit-secret-not-for-production";
process.env.WELLNESSCAFE_VIDEO_ENABLED = "true";

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const auth = admin.auth();
const registry = require("../src/practitionerRegistry");
const adminAuthorization = require("../src/adminAuthorization");
const communitySupport = require("../src/communitySupport");
const connections = require("../src/practitionerConnections");
const care = require("../src/practitionerCare");
const scheduling = require("../src/providerScheduling");
const issueVideoToken = require("../src/videoSessions").createAppointmentVideoToken.run;

const suffix = `${process.pid}-${Date.now()}`;
const ownerUid = `lifecycle-owner-${suffix}`;
const reviewerUid = `lifecycle-reviewer-${suffix}`;
const applicantUid = `lifecycle-applicant-${suffix}`;
const otherApplicantUid = `lifecycle-out-of-region-${suffix}`;
const clientUid = `lifecycle-client-${suffix}`;
const strangerUid = `lifecycle-stranger-${suffix}`;
const createdAppointmentIds = new Set();
const createdAppointmentRequestIds = new Set();
const createdConnectionRequestIds = new Set();

const signedIn = (uid, data = {}, claims = {}) => ({
  auth: { uid, token: { email_verified: true, firebase: { sign_in_provider: "password" }, ...claims } },
  data,
});
const ownerRequest = (data = {}) => signedIn(ownerUid, data, { godAdmin: true });
const applicationData = (region) => ({
  type: "yoga",
  name: "Jordan Lee",
  organization: "Open Door Wellness",
  bio: "Gentle movement and grounding for everyday life.",
  city: region === "CO" ? "Denver" : "Dallas",
  region,
  delivery: "both",
  serviceStyle: "free",
  services: ["Gentle yoga", "Grounding"],
  serviceFormats: ["one-to-one"],
  accessibilityOptions: ["low-sensory-option"],
  priceDetails: "Free community sessions",
  sessionLength: "45",
  credentialType: "Community practice",
  credentialSummary: "Experience-led support",
  acceptsReferrals: true,
  consentToReview: true,
});

async function deleteQuery(collection, field, value) {
  const snapshot = await db.collection(collection).where(field, "==", value).get();
  if (snapshot.empty) return;
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

async function cleanup() {
  for (const id of createdAppointmentIds) await db.collection("appointments").doc(id).delete().catch(() => {});
  for (const id of createdAppointmentRequestIds) await db.collection("appointment_requests").doc(id).delete().catch(() => {});
  for (const id of createdConnectionRequestIds) await db.collection("practitioner_connection_requests").doc(id).delete().catch(() => {});
  for (const uid of [ownerUid, reviewerUid, applicantUid, otherApplicantUid, clientUid, strangerUid]) {
  for (const collection of ["users", "practitioner_applications", "realHelpProviders", "provider_availability", "admin_access_assignments"]) {
      await db.collection(collection).doc(uid).delete().catch(() => {});
    }
    try { await auth.deleteUser(uid); } catch (error) { if (error.code !== "auth/user-not-found") throw error; }
  }
  for (const id of [`lifecycle-giver-co-${suffix}`, `lifecycle-giver-tx-${suffix}`]) {
    await db.collection("community_supporter_applications").doc(id).delete().catch(() => {});
  }
  await db.collection("client_practitioner_shares").doc(`${clientUid}_${applicantUid}`).delete().catch(() => {});
  await db.collection("checkins").doc(`lifecycle-checkin-${suffix}`).delete().catch(() => {});
  await deleteQuery("support_activity_events", "uid", clientUid);
  await deleteQuery("support_activity_events", "uid", applicantUid);
  await deleteQuery("admin_access_audit", "actorUid", ownerUid);
  await deleteQuery("admin_access_audit", "targetUid", reviewerUid);
  createdAppointmentIds.clear();
  createdAppointmentRequestIds.clear();
  createdConnectionRequestIds.clear();
}

async function createVerifiedUser(uid, email) {
  await auth.createUser({ uid, email, emailVerified: true });
}

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Run this suite through the Firestore emulator");
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "Run this suite through the Auth emulator");
  await cleanup();
  await Promise.all([
    createVerifiedUser(ownerUid, `${ownerUid}@example.test`),
    createVerifiedUser(reviewerUid, `${reviewerUid}@example.test`),
    createVerifiedUser(applicantUid, `${applicantUid}@example.test`),
    createVerifiedUser(otherApplicantUid, `${otherApplicantUid}@example.test`),
    createVerifiedUser(clientUid, `${clientUid}@example.test`),
    createVerifiedUser(strangerUid, `${strangerUid}@example.test`),
  ]);
  await auth.setCustomUserClaims(ownerUid, { godAdmin: true });
  await Promise.all([
    db.collection("users").doc(applicantUid).set({ uid: applicantUid, role: "client", roles: ["client"] }),
    db.collection("users").doc(clientUid).set({ uid: clientUid, displayName: "Casey Client", role: "client", roles: ["client"] }),
    db.collection("users").doc(otherApplicantUid).set({ uid: otherApplicantUid, role: "client", roles: ["client"] }),
  ]);
});

after(async () => {
  await cleanup();
  await admin.app().delete();
});

test("scoped admin approval unlocks a consented client-practitioner video-session lifecycle", async () => {
  const unverifiedApplicantRequest = signedIn(applicantUid, applicationData("CO"), {
    email: `${applicantUid}@example.test`, email_verified: false,
  });
  await assert.rejects(
    registry.submitPractitionerApplication.run(unverifiedApplicantRequest),
    (error) => error.code === "failed-precondition" && /verify your email/i.test(error.message),
  );
  // Both applicants use the same real submission path; only the assigned CO
  // reviewer may see and approve the Colorado application.
  await registry.submitPractitionerApplication.run(signedIn(applicantUid, applicationData("CO"), { email: `${applicantUid}@example.test` }));
  await registry.submitPractitionerApplication.run(signedIn(otherApplicantUid, applicationData("TX"), { email: `${otherApplicantUid}@example.test` }));
  const assignment = await adminAuthorization.setAdminAssignment.run(ownerRequest({
    email: `${reviewerUid}@example.test`,
    scopes: ["practitioner.review", "giving.review"],
    regions: ["CO"],
    reason: "Review practitioner applications in Colorado.",
  }));
  assert.equal(assignment.active, true);
  assert.deepEqual(assignment.regionalScopes["practitioner.review"], ["CO"]);
  assert.deepEqual(assignment.regionalScopes["giving.review"], ["CO"]);

  const reviewerRequest = signedIn(reviewerUid);
  const reviewQueue = await registry.listPractitionersForReview.run(reviewerRequest);
  assert.deepEqual(reviewQueue.applications.map((item) => item.uid), [applicantUid]);
  await Promise.all([
    db.collection("community_supporter_applications").doc(`lifecycle-giver-co-${suffix}`).set({
      status: "pending", state: "CO", email: "colorado-giver@example.test", submittedAt: admin.firestore.Timestamp.now(),
    }),
    db.collection("community_supporter_applications").doc(`lifecycle-giver-tx-${suffix}`).set({
      status: "pending", state: "TX", email: "texas-giver@example.test", submittedAt: admin.firestore.Timestamp.now(),
    }),
  ]);
  const giverQueue = await communitySupport.listCommunityGiverApplications.run(reviewerRequest);
  assert.deepEqual(giverQueue.applications.map((item) => item.state), ["CO"]);
  await assert.rejects(
    registry.reviewPractitionerApplication.run(signedIn(reviewerUid, { uid: otherApplicantUid, decision: "approve" })),
    (error) => error.code === "permission-denied",
  );
  await assert.rejects(
    registry.listPractitionersForReview.run(signedIn(clientUid)),
    (error) => error.code === "permission-denied",
  );

  const reviewed = await registry.reviewPractitionerApplication.run(signedIn(reviewerUid, { uid: applicantUid, decision: "approve" }));
  assert.equal(reviewed.status, "approved");
  const [user, authUser, publicDirectory] = await Promise.all([
    db.collection("users").doc(applicantUid).get(),
    auth.getUser(applicantUid),
    registry.listVerifiedPractitioners.run({ data: {} }),
  ]);
  assert.deepEqual(user.get("roles"), ["client", "provider"]);
  assert.equal(authUser.customClaims.provider, true);
  assert.equal(authUser.customClaims.role, "provider");
  const publicProfile = publicDirectory.practitioners.find((item) => item.id === applicantUid || item.uid === applicantUid);
  assert.ok(publicProfile, "reviewed practitioner should be discoverable");
  assert.equal("email" in publicProfile, false, "private account email must not appear in public discovery");

  const providerClaims = { ...authUser.customClaims, email: authUser.email };
  const clientRequest = (data = {}) => signedIn(clientUid, data);
  const providerRequest = (data = {}) => signedIn(applicantUid, data, providerClaims);

  await assert.rejects(
    connections.requestPractitionerConnection.run(signedIn(clientUid, {
      practitionerId: applicantUid,
      introduction: "An unverified request should not enter the practitioner queue.",
    }, { email_verified: false })),
    (error) => error.code === "failed-precondition" && /verify your email/i.test(error.message),
  );

  const hours = Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: true, start: "00:00", end: "23:59" }));
  await db.collection("provider_availability").doc(applicantUid).set({ providerId: applicantUid, timezone: "UTC", weeklyHours: hours });
  await db.collection("checkins").doc(`lifecycle-checkin-${suffix}`).set({
    userId: clientUid, date: "2026-09-29", daysSinceLastUse: 12, mood: "steady", gratitude: "private note",
    timestamp: admin.firestore.Timestamp.now(),
  });

  const connection = await connections.requestPractitionerConnection.run(clientRequest({
    practitionerId: applicantUid,
    introduction: "I would like support with a steady weekly routine.",
  }));
  createdConnectionRequestIds.add(connection.requestId);
  assert.equal(connection.status, "pending");
  const acceptedConnection = await connections.respondToPractitionerConnection.run(providerRequest({ requestId: connection.requestId, decision: "accept" }));
  assert.equal(acceptedConnection.status, "accepted");

  const share = await care.setPractitionerShare.run(clientRequest({
    practitionerId: applicantUid,
    scopes: { recoveryProgress: true },
  }));
  assert.equal(share.scopes.recoveryProgress, true);
  const overview = await care.getProviderClientOverview.run(providerRequest({ clientId: clientUid }));
  assert.equal(overview.shared, true);
  assert.equal(overview.checkins.length, 1);
  assert.equal(overview.checkins[0].daysSinceLastUse, 12);
  assert.equal("gratitude" in overview.checkins[0], false, "unshared written reflection must remain private");

  const startAt = new Date(Date.now() + 8 * 60_000);
  startAt.setSeconds(0, 0);
  const endAt = new Date(startAt.getTime() + 45 * 60_000);
  await assert.rejects(
    scheduling.requestProviderAppointment.run(signedIn(clientUid, {
      providerId: applicantUid,
      requestedStartAt: startAt,
      requestedEndAt: endAt,
    }, { email_verified: false })),
    (error) => error.code === "failed-precondition" && /verify your email/i.test(error.message),
  );
  const request = await scheduling.requestProviderAppointment.run(clientRequest({
    providerId: applicantUid,
    requestedStartAt: startAt,
    requestedEndAt: endAt,
    note: "Video session requested.",
  }));
  createdAppointmentRequestIds.add(request.requestId);
  assert.equal(request.status, "pending");

  const previousVideoGate = process.env.WELLNESSCAFE_VIDEO_ENABLED;
  process.env.WELLNESSCAFE_VIDEO_ENABLED = "true";
  let response;
  try {
    response = await scheduling.respondToProviderAppointmentRequest.run(providerRequest({
      requestId: request.requestId,
      decision: "accept",
      sessionFormat: "wellnesscafe-video",
    }));
  } finally {
    if (previousVideoGate === undefined) delete process.env.WELLNESSCAFE_VIDEO_ENABLED;
    else process.env.WELLNESSCAFE_VIDEO_ENABLED = previousVideoGate;
  }
  createdAppointmentIds.add(response.appointmentId);
  assert.equal(response.status, "accepted");
  assert.equal((await scheduling.respondToMyAppointment.run(clientRequest({ appointmentId: response.appointmentId }))).status, "confirmed");

  const [clientToken, practitionerToken] = await Promise.all([
    issueVideoToken(signedIn(clientUid, { appointmentId: response.appointmentId })),
    issueVideoToken(signedIn(applicantUid, { appointmentId: response.appointmentId }, providerClaims)),
  ]);
  const tokenClaims = (token) => JSON.parse(Buffer.from(token.participantToken.split(".")[1], "base64url").toString("utf8"));
  assert.equal(clientToken.role, "client");
  assert.equal(practitionerToken.role, "practitioner");
  assert.equal(tokenClaims(clientToken).video.room, tokenClaims(practitionerToken).video.room);
  assert.notEqual(tokenClaims(clientToken).sub, tokenClaims(practitionerToken).sub);
  await assert.rejects(
    issueVideoToken(signedIn(strangerUid, { appointmentId: response.appointmentId })),
    (error) => error.code === "permission-denied",
  );

  const connectionRecord = await db.collection("clientProviderAssignments")
    .where("clientId", "==", clientUid).where("providerId", "==", applicantUid).limit(1).get();
  assert.equal(connectionRecord.size, 1);
  await connectionRecord.docs[0].ref.update({ status: "ended" });
  await assert.rejects(
    issueVideoToken(signedIn(clientUid, { appointmentId: response.appointmentId })),
    (error) => error.code === "permission-denied" && /connection.*no longer active/i.test(error.message),
  );
});
