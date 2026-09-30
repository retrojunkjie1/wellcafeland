const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-practitioner-registry";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const auth = admin.auth();
const registry = require("../src/practitionerRegistry");

const reviewerUid = "registry-reviewer";
const approvedUid = "registry-approved-applicant";
const declinedUid = "registry-declined-applicant";
const adminRequest = (data = {}) => ({ auth: { uid: reviewerUid, token: { godAdmin: true } }, data });
const applicantRequest = (uid, data = {}) => ({ auth: { uid, token: { email: `${uid}@example.test`, firebase: { sign_in_provider: "password" } } }, data });
const application = (uid, overrides = {}) => ({
  uid,
  email: `${uid}@example.test`,
  type: "yoga",
  name: "Jordan Lee",
  organization: "Open Door Wellness",
  bio: "Gentle movement and grounding for everyday life.",
  city: "Denver",
  region: "CO",
  delivery: "both",
  serviceStyle: "free",
  services: ["Gentle yoga", "Grounding"],
  serviceFormats: ["one-to-one"],
  accessibilityOptions: [],
  priceDetails: "Free community sessions",
  sessionLength: "45",
  credentialType: "Community practice",
  credentialSummary: "Experience-led support",
  acceptsReferrals: true,
  consentToReview: true,
  status: "pending",
  ...overrides,
});

async function deleteCollection(name) {
  const snapshot = await db.collection(name).get();
  if (snapshot.empty) return;
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

async function clean() {
  for (const uid of [reviewerUid, approvedUid, declinedUid]) {
    try { await auth.deleteUser(uid); } catch (error) { if (error.code !== "auth/user-not-found") throw error; }
  }
  for (const name of ["practitioner_applications", "realHelpProviders", "users"]) await deleteCollection(name);
  await db.doc("admin/systemSettings").delete();
  await auth.createUser({ uid: reviewerUid, email: `${reviewerUid}@example.test` });
  await auth.setCustomUserClaims(reviewerUid, { godAdmin: true });
  await Promise.all([
    auth.createUser({ uid: approvedUid, email: `${approvedUid}@example.test` }),
    auth.createUser({ uid: declinedUid, email: `${declinedUid}@example.test` }),
  ]);
  await Promise.all([
    db.collection("users").doc(approvedUid).set({ uid: approvedUid, role: "client", roles: ["client"] }),
    db.collection("users").doc(declinedUid).set({ uid: declinedUid, role: "client", roles: ["client"] }),
    db.collection("practitioner_applications").doc(approvedUid).set(application(approvedUid)),
    db.collection("practitioner_applications").doc(declinedUid).set(application(declinedUid)),
  ]);
}

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Run this suite through the Firestore emulator");
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "Run this suite through the Auth emulator");
  await clean();
});

after(async () => {
  await clean();
  await admin.app().delete();
});

test("approval publishes the reviewed profile and assigns practitioner claims without dropping client access", async () => {
  await assert.rejects(
    registry.listPractitionersForReview.run({ auth: { uid: approvedUid, token: {} }, data: {} }),
    (error) => error.code === "permission-denied",
  );
  const queue = await registry.listPractitionersForReview.run(adminRequest());
  assert.equal(queue.applications.length, 2);
  assert.ok(queue.applications.some((item) => item.uid === approvedUid));

  const reviewed = await registry.reviewPractitionerApplication.run(adminRequest({ uid: approvedUid, decision: "approve" }));
  assert.equal(reviewed.status, "approved");
  assert.equal((await registry.reviewPractitionerApplication.run(adminRequest({ uid: approvedUid, decision: "approve" }))).status, "approved");
  const [app, profile, user, authUser] = await Promise.all([
    db.collection("practitioner_applications").doc(approvedUid).get(),
    db.collection("realHelpProviders").doc(approvedUid).get(),
    db.collection("users").doc(approvedUid).get(),
    auth.getUser(approvedUid),
  ]);
  assert.equal(app.get("status"), "approved");
  assert.equal(profile.get("verification.status"), "verified");
  assert.deepEqual(user.get("roles"), ["client", "provider"]);
  assert.equal(authUser.customClaims.provider, true);
  assert.equal(authUser.customClaims.role, "provider");

  const publicProfiles = await registry.listVerifiedPractitioners.run({ data: {} });
  const published = publicProfiles.practitioners.find((item) => item.uid === approvedUid || item.id === approvedUid);
  assert.ok(published);
  assert.equal("email" in published, false);
});

test("the God-Eye practitioner-directory switch pauses both reviewed and public discovery", async () => {
  await db.doc("admin/systemSettings").set({ settings: { features: { providersMarketplace: false } } });
  const reviewed = await registry.listVerifiedPractitioners.run({ data: {} });
  const publicRecords = await registry.searchPublicPractitionerDirectory.run({ data: { city: "Denver", region: "CO" } });
  assert.deepEqual(reviewed, { available: false, practitioners: [] });
  assert.deepEqual(publicRecords, { available: false, listings: [] });
});

test("nearby practitioner search returns only exact practice-location city and state matches", async () => {
  await db.doc("admin/systemSettings").set({ settings: { features: { providersMarketplace: true } } });
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ results: [
      {
        number: "1234567890",
        basic: { first_name: "Casey", last_name: "Local" },
        addresses: [{ address_purpose: "LOCATION", city: " Denver ", state: "CO", postal_code: "80202", telephone_number: "3035550100" }],
        taxonomies: [{ primary: true, desc: "Counselor" }],
      },
      {
        number: "1234567891",
        basic: { first_name: "Taylor", last_name: "NearbyElsewhere" },
        addresses: [{ address_purpose: "LOCATION", city: "Boulder", state: "CO", postal_code: "80301" }],
        taxonomies: [{ primary: true, desc: "Counselor" }],
      },
      {
        number: "1234567892",
        basic: { first_name: "Robin", last_name: "MailingAddress" },
        addresses: [
          { address_purpose: "MAILING", city: "Denver", state: "CO", postal_code: "80202" },
          { address_purpose: "LOCATION", city: "Boston", state: "MA", postal_code: "02108" },
        ],
        taxonomies: [{ primary: true, desc: "Counselor" }],
      },
      {
        number: "1234567893",
        basic: { first_name: "Alex", last_name: "NoPracticeAddress" },
        addresses: [{ address_purpose: "MAILING", city: "Denver", state: "CO", postal_code: "80202" }],
        taxonomies: [{ primary: true, desc: "Counselor" }],
      },
    ] }),
  });
  try {
    const result = await registry.searchPublicPractitionerDirectory.run({ data: { city: "Denver", region: "CO" } });
    assert.equal(result.listings.length, 1);
    assert.equal(result.listings[0].id, "1234567890");
    assert.equal(result.listings[0].city, " Denver ".trim());
    assert.equal(result.listings[0].region, "CO");
  } finally {
    global.fetch = originalFetch;
  }
});

test("declined applications remain private and conflicting decisions cannot desynchronize publication", async () => {
  const declined = await registry.reviewPractitionerApplication.run(adminRequest({ uid: declinedUid, decision: "decline", reviewNote: "Please add a clearer service description." }));
  assert.equal(declined.status, "declined");
  assert.equal((await registry.reviewPractitionerApplication.run(adminRequest({ uid: declinedUid, decision: "decline" }))).status, "declined");

  await assert.rejects(
    registry.reviewPractitionerApplication.run(adminRequest({ uid: declinedUid, decision: "approve" })),
    (error) => error.code === "failed-precondition",
  );
  await assert.rejects(
    registry.reviewPractitionerApplication.run(adminRequest({ uid: approvedUid, decision: "decline" })),
    (error) => error.code === "failed-precondition",
  );

  const [declinedApp, declinedProfile, declinedAuth, approvedApp, approvedProfile] = await Promise.all([
    db.collection("practitioner_applications").doc(declinedUid).get(),
    db.collection("realHelpProviders").doc(declinedUid).get(),
    auth.getUser(declinedUid),
    db.collection("practitioner_applications").doc(approvedUid).get(),
    db.collection("realHelpProviders").doc(approvedUid).get(),
  ]);
  assert.equal(declinedApp.get("status"), "declined");
  assert.equal(declinedProfile.exists, false);
  assert.equal(declinedAuth.customClaims?.provider, undefined);
  assert.equal(approvedApp.get("status"), "approved");
  assert.equal(approvedProfile.get("verification.status"), "verified");
});
