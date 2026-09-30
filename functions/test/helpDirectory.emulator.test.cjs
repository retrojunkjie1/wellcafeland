const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-help-directory";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const directory = require("../src/helpDirectory");
const listAdmin = directory.listHelpDirectoryForAdmin.run;
const save = directory.saveHelpDirectoryDraft.run;
const setStatus = directory.setHelpDirectoryStatus.run;
const search = directory.searchPublicHelpListings.run;
const reportIssue = directory.reportHelpListingIssue.run;
const reviewCorrection = directory.reviewHelpDirectoryCorrection.run;
const adminAuth = { uid: "directory-reviewer", token: { godAdmin: true } };
const clientAuth = { uid: "directory-client", token: { role: "client" } };
const base = {
  name: "Northside Community Pantry", category: "food", description: "Weekly grocery support.",
  address: "12 Elm Street", city: "Denver", state: "CO", postalCode: "80202", phone: "303-555-0100",
  sourceName: "Northside Community Pantry", sourceUrl: "https://northside.example.org/locations",
  permissionBasis: "The organization publishes these service details for community use on its public location page.",
  checkedAt: new Date().toISOString(),
};

async function clear(name) {
  const snapshot = await db.collection(name).get();
  if (snapshot.empty) return;
  const batch = db.batch(); snapshot.docs.forEach((doc) => batch.delete(doc.ref)); await batch.commit();
}
async function clean() { await Promise.all(["help_directory_listings", "help_directory_audit", "help_directory_corrections"].map(clear)); }

before(async () => { assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Run this suite through the Firestore emulator"); await clean(); });
beforeEach(clean);
after(async () => { await clean(); await admin.app().delete(); });

test("draft intake is admin-only, requires source permission evidence and recent checking", async () => {
  await assert.rejects(save({ data: base }), (error) => error.code === "unauthenticated");
  await assert.rejects(save({ auth: clientAuth, data: base }), (error) => error.code === "permission-denied");
  await assert.rejects(save({ auth: adminAuth, data: { ...base, permissionBasis: "public listing" } }), (error) => error.code === "failed-precondition");
  await assert.rejects(save({ auth: adminAuth, data: { ...base, sourceUrl: "http://northside.example.org" } }), (error) => error.code === "invalid-argument");
  await assert.rejects(save({ auth: adminAuth, data: { ...base, checkedAt: "2020-01-01" } }), (error) => error.code === "failed-precondition");
  const result = await save({ auth: adminAuth, data: base });
  assert.equal(result.status, "draft");
  const saved = await db.collection("help_directory_listings").doc(result.id).get();
  assert.equal(saved.get("status"), "draft");
  assert.equal((await db.collection("help_directory_audit").get()).size, 1);
  const adminList = await listAdmin({ auth: adminAuth, data: { status: "draft" } });
  assert.equal(adminList.events[0].listingName, base.name);
  assert.equal(adminList.events[0].action, "draft_created");
  await assert.rejects(listAdmin({ auth: clientAuth, data: {} }), (error) => error.code === "permission-denied");
});

test("published help listings automatically leave search when the source check ages past 90 days", async () => {
  const created = await save({ auth: adminAuth, data: base });
  await setStatus({ auth: adminAuth, data: { id: created.id, action: "publish", reviewNote: "Confirmed the source is public and checked the location, contact number, and current service details." } });
  assert.equal((await search({ data: { category: "food", area: "Denver, CO" } })).listings.length, 1);
  await db.collection("help_directory_listings").doc(created.id).update({ checkedAt: admin.firestore.Timestamp.fromDate(new Date("2020-01-01")) });
  assert.equal((await search({ data: { category: "food", area: "Denver, CO" } })).listings.length, 0);
  assert.equal((await db.collection("help_directory_listings").doc(created.id).get()).get("status"), "published");
});

test("public search returns only published location/contact fields and matches city, full state, or ZIP", async () => {
  const draft = await save({ auth: adminAuth, data: base });
  await assert.rejects(search({ data: { category: "food", area: "CO" } }), (error) => error.code === "invalid-argument");
  assert.deepEqual((await search({ data: { category: "food", area: "Denver" } })).listings, []);
  assert.deepEqual((await search({ data: { category: "food", area: "Denver, CO" } })).listings, []);

  await setStatus({ auth: adminAuth, data: { id: draft.id, action: "publish", reviewNote: "Confirmed the source is public and checked the location, contact number, and current service details." } });
  const byCity = await search({ data: { category: "food", area: "Denver, CO" } });
  assert.equal(byCity.listings.length, 1);
  assert.equal(byCity.listings[0].name, base.name);
  assert.equal(byCity.listings[0].phone, base.phone);
  assert.equal(byCity.listings[0].sourceManaged, true);
  assert.equal("sourceUrl" in byCity.listings[0], false);
  assert.equal("permissionBasis" in byCity.listings[0], false);
  assert.equal("reviewNote" in byCity.listings[0], false);
  assert.equal("distanceMiles" in byCity.listings[0], false);
  assert.equal((await search({ data: { category: "food", area: "80202" } })).listings.length, 1);
  assert.equal((await search({ data: { category: "food", area: "Mississippi" } })).listings.length, 0);
  assert.equal((await search({ data: { category: "housing", area: "Denver, CO" } })).listings.length, 0);
});

test("editing a published record withdraws it to draft and status actions are audited", async () => {
  const created = await save({ auth: adminAuth, data: base });
  await setStatus({ auth: adminAuth, data: { id: created.id, action: "publish", reviewNote: "Confirmed the source is public and checked the location, contact number, and current service details." } });
  await save({ auth: adminAuth, data: { ...base, id: created.id, city: "Aurora" } });
  assert.equal((await search({ data: { category: "food", area: "Denver, CO" } })).listings.length, 0);
  assert.equal((await search({ data: { category: "food", area: "Aurora, CO" } })).listings.length, 0);
  const draft = await db.collection("help_directory_listings").doc(created.id).get();
  assert.equal(draft.get("status"), "draft");
  await setStatus({ auth: adminAuth, data: { id: created.id, action: "publish", reviewNote: "Reviewed the corrected city and rechecked the source and the currently listed phone number." } });
  await setStatus({ auth: adminAuth, data: { id: created.id, action: "pause", reviewNote: "The organization reports that the listing needs an update; hide it until a fresh review is completed." } });
  assert.equal((await search({ data: { category: "food", area: "Aurora, CO" } })).listings.length, 0);
  await db.collection("help_directory_listings").doc(created.id).update({ checkedAt: admin.firestore.Timestamp.fromDate(new Date("2020-01-01")) });
  await assert.rejects(setStatus({ auth: adminAuth, data: { id: created.id, action: "restore", reviewNote: "Recheck is required because this source record is older than the allowed freshness window." } }), (error) => error.code === "failed-precondition");
  assert.equal((await db.collection("help_directory_audit").get()).size, 5);
});

test("public correction reports accept only published listings and safe issue fields", async () => {
  const draft = await save({ auth: adminAuth, data: base });
  const submissionId = crypto.randomUUID();
  await assert.rejects(reportIssue({ data: { listingId: draft.id, issue: "wrong_phone", submissionId } }), (error) => error.code === "not-found");
  await setStatus({ auth: adminAuth, data: { id: draft.id, action: "publish", reviewNote: "Confirmed the source is public and checked the location, contact number, and current service details." } });
  await assert.rejects(reportIssue({ data: { listingId: draft.id, issue: "urgent_client_risk", submissionId: crypto.randomUUID() } }), (error) => error.code === "invalid-argument");
  const result = await reportIssue({ data: { listingId: draft.id, issue: "wrong_phone", details: "The listed line is disconnected.", submissionId } });
  const retried = await reportIssue({ data: { listingId: draft.id, issue: "wrong_phone", details: "The listed line is disconnected.", submissionId } });
  assert.equal(result.ok, true);
  assert.equal(retried.reportId, result.reportId);
  const report = await db.collection("help_directory_corrections").doc(result.reportId).get();
  assert.equal(report.get("status"), "open");
  assert.equal(report.get("issue"), "wrong_phone");
  assert.equal(report.get("listingName"), base.name);
  assert.equal("reporterUid" in report.data(), false);
  assert.equal("ip" in report.data(), false);
  const queue = await listAdmin({ auth: adminAuth, data: { status: "draft" } });
  assert.equal(queue.corrections.length, 1);
  assert.equal(queue.corrections[0].details, "The listed line is disconnected.");
  await assert.rejects(listAdmin({ auth: clientAuth, data: {} }), (error) => error.code === "permission-denied");
});

test("admin can resolve, dismiss, or pause a reported public listing with an audit note", async () => {
  const created = await save({ auth: adminAuth, data: base });
  await setStatus({ auth: adminAuth, data: { id: created.id, action: "publish", reviewNote: "Confirmed the source is public and checked the location, contact number, and current service details." } });
  const report = await reportIssue({ data: { listingId: created.id, issue: "closed", details: "The organization says this site no longer operates.", submissionId: crypto.randomUUID() } });
  await assert.rejects(reviewCorrection({ auth: clientAuth, data: { reportId: report.reportId, action: "pause_listing", reviewNote: "A sufficiently long note for this test." } }), (error) => error.code === "permission-denied");
  await assert.rejects(reviewCorrection({ auth: adminAuth, data: { reportId: report.reportId, action: "pause_listing", reviewNote: "Short note." } }), (error) => error.code === "invalid-argument");
  const result = await reviewCorrection({ auth: adminAuth, data: { reportId: report.reportId, action: "pause_listing", reviewNote: "Verified the service closure report against the current organization contact and paused this listing pending source correction." } });
  assert.equal(result.status, "resolved_listing_paused");
  assert.equal((await db.collection("help_directory_listings").doc(created.id).get()).get("status"), "paused");
  assert.equal((await db.collection("help_directory_corrections").doc(report.reportId).get()).get("status"), "resolved_listing_paused");
  await assert.rejects(reviewCorrection({ auth: adminAuth, data: { reportId: report.reportId, action: "resolve", reviewNote: "Reviewed again and verified the source and current listing details." } }), (error) => error.code === "failed-precondition");
  const audit = await db.collection("help_directory_audit").where("correctionId", "==", report.reportId).get();
  assert.equal(audit.size, 3);
  assert.ok(audit.docs.some((entry) => entry.get("action") === "pause_after_correction"));
});
