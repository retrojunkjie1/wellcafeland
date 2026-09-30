const crypto = require("node:crypto");
const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { requireAdminScope, requireAdminScopeForListing } = require("./adminAuthorization");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
const REGION = "us-central1";
const COLLECTION = "help_directory_listings";
const AUDIT = "help_directory_audit";
const CORRECTIONS = "help_directory_corrections";
const CATEGORIES = new Set(["housing", "food", "funding", "programs", "transport", "circles", "emergency", "other"]);
const STATES = new Set("AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC".split(" "));
const STATE_NAMES = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA", colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD", massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC", "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT", virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI", wyoming: "WY", "district of columbia": "DC",
};
const PUBLIC_SEARCH_LIMIT = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const rateLimits = new Map();
const correctionRateLimits = new Map();

function clean(value, max = 240) {
  return typeof value === "string" ? value.replace(/[<>\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";
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

function validateRecord(data = {}) {
  const record = {
    name: clean(data.name, 140), category: clean(data.category, 24).toLowerCase(),
    description: clean(data.description, 500), address: clean(data.address, 240),
    city: clean(data.city, 100), state: clean(data.state, 2).toUpperCase(),
    postalCode: clean(data.postalCode, 12), phone: clean(data.phone, 40),
    sourceName: clean(data.sourceName, 140), sourceUrl: httpsUrl(data.sourceUrl, "Source link", true),
    permissionBasis: clean(data.permissionBasis, 1000),
  };
  if (record.name.length < 2) throw new HttpsError("invalid-argument", "Enter the service name.");
  if (!CATEGORIES.has(record.category)) throw new HttpsError("invalid-argument", "Choose a supported help category.");
  if (!record.city || !STATES.has(record.state)) throw new HttpsError("invalid-argument", "Enter the city and state where this service is located.");
  if (!record.sourceName || record.permissionBasis.length < 30) throw new HttpsError("failed-precondition", "Record the source and evidence that allows WellnessCafe to display this listing.");
  if (!data.checkedAt || !Number.isFinite(Date.parse(data.checkedAt))) throw new HttpsError("invalid-argument", "Record when the source and listing details were checked.");
  const checkedAt = new Date(data.checkedAt);
  const ageDays = (Date.now() - checkedAt.getTime()) / 86400000;
  if (ageDays < -1 || ageDays > 90) throw new HttpsError("failed-precondition", "Check the source within the last 90 days before saving or publishing it.");
  return { ...record, searchTokens: makeSearchTokens(record), checkedAt: admin.firestore.Timestamp.fromDate(checkedAt) };
}

function normalizeArea(value) {
  return clean(value, 120).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function resolveState(area) {
  const normalized = normalizeArea(area);
  const words = normalized.split(" ");
  const last = words.at(-1)?.toUpperCase();
  if (STATES.has(last)) return last;
  for (const [name, code] of Object.entries(STATE_NAMES)) {
    if (normalized.endsWith(name)) return code;
  }
  return "";
}

function makeSearchTokens(record) {
  const fullState = Object.entries(STATE_NAMES).find(([, code]) => code === record.state)?.[0] || "";
  return [...new Set(normalizeArea([record.city, record.state, fullState, record.postalCode].join(" ")).split(" ").filter(Boolean))];
}

function enforceSearchRateLimit(request) {
  const ip = request.rawRequest?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() || request.rawRequest?.ip || "unknown";
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now - entry.startedAt >= RATE_LIMIT_WINDOW_MS) {
    rateLimits.set(ip, { startedAt: now, count: 1 });
    if (rateLimits.size > 1000) {
      for (const [key, value] of rateLimits) if (now - value.startedAt >= RATE_LIMIT_WINDOW_MS) rateLimits.delete(key);
    }
    return;
  }
  entry.count += 1;
  if (entry.count > PUBLIC_SEARCH_LIMIT) throw new HttpsError("resource-exhausted", "Search is being used too quickly. Please wait a minute and try again.");
}

function enforceCorrectionRateLimit(request) {
  const appId = clean(request.app?.appId, 160);
  const ip = request.rawRequest?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() || request.rawRequest?.ip || "unknown";
  const key = appId ? `app:${appId}:${ip}` : ip;
  const now = Date.now();
  const entry = correctionRateLimits.get(key);
  if (!entry || now - entry.startedAt >= 60 * 60 * 1000) {
    correctionRateLimits.set(key, { startedAt: now, count: 1 });
    if (correctionRateLimits.size > 1000) {
      for (const [rateKey, value] of correctionRateLimits) if (now - value.startedAt >= 60 * 60 * 1000) correctionRateLimits.delete(rateKey);
    }
    return;
  }
  entry.count += 1;
  if (entry.count > 5) throw new HttpsError("resource-exhausted", "Too many reports were sent from this connection. Please try again later.");
}

function publicProjection(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    category: data.category,
    description: data.description || "",
    address: data.address || "",
    city: data.city,
    state: data.state,
    postalCode: data.postalCode || "",
    phone: data.phone || "",
    checkedAt: data.checkedAt?.toDate?.().toISOString?.() || null,
    sourceManaged: true,
  };
}

function rethrowDirectoryReadError(error) {
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("requires an index") && message.includes("building")) {
    throw new HttpsError("unavailable", "The help directory is finishing setup. Please refresh in a few minutes.");
  }
  throw error;
}

const listHelpDirectoryForAdmin = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const region = clean(request.data?.region, 2).toUpperCase();
  const access = region
    ? await requireAdminScope(request, "support_directory.manage", region)
    : await requireAdminScopeForListing(request, "support_directory.manage");
  const status = clean(request.data?.status, 24);
  let query = db.collection(COLLECTION).orderBy("updatedAt", "desc").limit(100);
  if (["draft", "published", "paused", "archived"].includes(status)) {
    query = db.collection(COLLECTION).where("status", "==", status).orderBy("updatedAt", "desc").limit(100);
  }
  let snapshot;
  let eventsSnapshot;
  let correctionsSnapshot;
  try {
    snapshot = await query.get();
    eventsSnapshot = await db.collection(AUDIT).orderBy("createdAt", "desc").limit(60).get();
    correctionsSnapshot = await db.collection(CORRECTIONS).orderBy("createdAt", "desc").limit(100).get();
  } catch (error) {
    rethrowDirectoryReadError(error);
  }
  const regionalOnly = !access.isGodAdmin && !access.scopes.includes("support_directory.manage");
  const permittedRegions = access.regionalScopes?.["support_directory.manage"] || [];
  const matchesRegion = (state) => (region ? state === region : true)
    && (!regionalOnly || permittedRegions.includes("*") || permittedRegions.includes(state));
  const visibleDocs = snapshot.docs.filter((doc) => matchesRegion(doc.get("state")));
  const visibleIds = new Set(visibleDocs.map((doc) => doc.id));
  const events = eventsSnapshot.docs.filter((doc) => !regionalOnly || visibleIds.has(doc.get("listingId")))
    .map((doc) => ({ id: doc.id, ...doc.data(), createdAt: doc.get("createdAt")?.toDate?.().toISOString?.() || null }));
  const corrections = correctionsSnapshot.docs.filter((doc) => matchesRegion(doc.get("state")) && (!regionalOnly || visibleIds.has(doc.get("listingId"))))
    .map((doc) => ({ id: doc.id, ...doc.data(), createdAt: doc.get("createdAt")?.toDate?.().toISOString?.() || null }));
  return {
    listings: visibleDocs.map((doc) => ({ id: doc.id, ...doc.data(), checkedAt: doc.get("checkedAt")?.toDate?.().toISOString?.() || null, updatedAt: doc.get("updatedAt")?.toDate?.().toISOString?.() || null })),
    events,
    corrections,
  };
});

const saveHelpDirectoryDraft = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const { uid: actorUid } = await requireAdminScope(request, "support_directory.manage");
  const data = request.data || {};
  const id = clean(data.id, 120);
  const record = validateRecord(data);
  const access = await requireAdminScope(request, "support_directory.manage", record.state);
  const ref = id ? db.collection(COLLECTION).doc(id) : db.collection(COLLECTION).doc(crypto.randomUUID());
  const initial = id ? await ref.get() : null;
  if (id && !initial.exists) throw new HttpsError("not-found", "This listing is no longer available.");
  if (id && !access.isGodAdmin && !access.scopes.includes("support_directory.manage")) {
    await requireAdminScope(request, "support_directory.manage", initial.get("state"));
  }
  const now = FieldValue.serverTimestamp();
  await db.runTransaction(async (transaction) => {
    const current = id ? await transaction.get(ref) : null;
    if (id && !current.exists) throw new HttpsError("not-found", "This listing is no longer available.");
    if (id && current.get("state") !== initial.get("state")) throw new HttpsError("aborted", "The listing changed while you were editing it. Refresh and try again.");
    const wasPublished = current?.get("status") === "published";
    transaction.set(ref, {
      ...record,
      status: "draft",
      createdAt: current?.get("createdAt") || now,
      createdBy: current?.get("createdBy") || actorUid,
      updatedAt: now,
      updatedBy: actorUid,
      ...(wasPublished ? { unpublishedReason: "Record changed; review and publish again.", unpublishedAt: now } : {}),
    });
    transaction.create(db.collection(AUDIT).doc(), {
      listingId: ref.id, listingName: record.name, actorUid, action: id ? "draft_updated" : "draft_created",
      previousStatus: current?.get("status") || null, newStatus: "draft", createdAt: now,
    });
  });
  return { ok: true, id: ref.id, status: "draft" };
});

const setHelpDirectoryStatus = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const id = clean(request.data?.id, 120);
  const action = clean(request.data?.action, 20);
  const note = clean(request.data?.reviewNote, 1000);
  if (!id || !["publish", "pause", "restore", "archive"].includes(action)) throw new HttpsError("invalid-argument", "Choose a listing and a review action.");
  if (note.length < 30) throw new HttpsError("invalid-argument", "Add at least 30 characters explaining the review decision.");
  const ref = db.collection(COLLECTION).doc(id);
  const before = await ref.get();
  if (!before.exists) throw new HttpsError("not-found", "This listing is no longer available.");
  const { uid: actorUid } = await requireAdminScope(request, "support_directory.manage", before.get("state"));
  await requireAdminScope(request, "support_directory.manage", before.get("state"));
  const now = FieldValue.serverTimestamp();
  let nextStatus = "";
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new HttpsError("not-found", "This listing is no longer available.");
    if (snapshot.get("state") !== before.get("state")) throw new HttpsError("aborted", "The listing changed while you were reviewing it. Refresh and try again.");
    const previousStatus = snapshot.get("status");
    const sourceAge = snapshot.get("checkedAt")?.toDate ? (Date.now() - snapshot.get("checkedAt").toDate().getTime()) / 86400000 : Infinity;
    if (action === "publish") {
      if (!new Set(["draft", "paused"]).has(previousStatus)) throw new HttpsError("failed-precondition", "Only a draft or paused listing can be published.");
      if (sourceAge > 90 || sourceAge < -1) throw new HttpsError("failed-precondition", "Refresh the source check before publishing this listing.");
      nextStatus = "published";
    } else if (action === "pause") {
      if (previousStatus !== "published") throw new HttpsError("failed-precondition", "Only a published listing can be paused.");
      nextStatus = "paused";
    } else if (action === "restore") {
      if (previousStatus !== "paused") throw new HttpsError("failed-precondition", "Only a paused listing can be restored.");
      if (sourceAge > 90 || sourceAge < -1) throw new HttpsError("failed-precondition", "Refresh the source check before restoring this listing.");
      nextStatus = "published";
    } else {
      if (previousStatus === "archived") throw new HttpsError("already-exists", "This listing is already archived.");
      nextStatus = "archived";
    }
    transaction.update(ref, { status: nextStatus, reviewNote: note, reviewedBy: actorUid, reviewedAt: now, updatedBy: actorUid, updatedAt: now });
    transaction.create(db.collection(AUDIT).doc(), { listingId: id, listingName: snapshot.get("name") || "", actorUid, action, previousStatus, newStatus: nextStatus, note, createdAt: now });
  });
  return { ok: true, status: nextStatus };
});

// Public directory reads are available to guests but require a valid app
// attestation to reduce scraping and automated request floods.
const searchPublicHelpListings = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  enforceSearchRateLimit(request);
  const category = clean(request.data?.category, 24).toLowerCase();
  const area = clean(request.data?.area, 120);
  if (!CATEGORIES.has(category)) throw new HttpsError("invalid-argument", "Choose a help category.");
  if (normalizeArea(area).length < 3) throw new HttpsError("invalid-argument", "Enter at least three letters for a town, state, or ZIP code.");
  const state = resolveState(area);
  const stateName = Object.entries(STATE_NAMES).find(([, code]) => code === state)?.[0] || "";
  const stateParts = new Set([state.toLowerCase(), ...stateName.split(" ")].filter(Boolean));
  const tokens = normalizeArea(area).split(" ").filter((token) => token && !stateParts.has(token));
  if (tokens.length > 30) throw new HttpsError("invalid-argument", "Shorten the location to a town, state, or ZIP code.");
  let query = db.collection(COLLECTION).where("status", "==", "published").where("category", "==", category);
  if (state) query = query.where("state", "==", state);
  if (tokens.length) query = query.where("searchTokens", "array-contains-any", tokens);
  query = query.where("checkedAt", ">=", admin.firestore.Timestamp.fromDate(new Date(Date.now() - 90 * 86400000)));
  let snapshot;
  try {
    snapshot = await query.limit(1000).get();
  } catch (error) {
    rethrowDirectoryReadError(error);
  }
  const listings = snapshot.docs.filter((doc) => {
    const data = doc.data();
    const location = normalizeArea([data.city, data.state, data.postalCode].join(" "));
    return tokens.every((token) => location.includes(token));
  }).slice(0, 50).map(publicProjection);
  return { listings };
});

const reportHelpListingIssue = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  enforceCorrectionRateLimit(request);
  const listingId = clean(request.data?.listingId, 120);
  const submissionId = clean(request.data?.submissionId, 80);
  const issue = clean(request.data?.issue, 32);
  const details = clean(request.data?.details, 400);
  const allowedIssues = new Set(["wrong_address", "wrong_phone", "hours_or_availability", "services_changed", "closed", "other"]);
  if (!listingId || !/^[A-Za-z0-9_-]{1,120}$/.test(listingId)) throw new HttpsError("invalid-argument", "Choose a valid directory listing.");
  if (!/^[0-9a-f-]{36}$/i.test(submissionId)) throw new HttpsError("invalid-argument", "Refresh the report form and try again.");
  if (!allowedIssues.has(issue)) throw new HttpsError("invalid-argument", "Choose what needs attention.");
  const ref = db.collection(CORRECTIONS).doc(submissionId);
  const now = FieldValue.serverTimestamp();
  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);
    if (existing.exists) {
      if (existing.get("listingId") === listingId && existing.get("issue") === issue && existing.get("details") === details) return;
      throw new HttpsError("failed-precondition", "This report was already sent with different details.");
    }
    const current = await transaction.get(db.collection(COLLECTION).doc(listingId));
    if (!current.exists || current.get("status") !== "published") throw new HttpsError("not-found", "This listing is no longer available for reports.");
    transaction.create(ref, {
      listingId,
      listingName: current.get("name"),
      category: current.get("category"),
      city: current.get("city"),
      state: current.get("state"),
      issue,
      details,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });
    transaction.create(db.collection(AUDIT).doc(), { listingId, listingName: current.get("name"), correctionId: ref.id, action: "correction_reported", createdAt: now });
  });
  return { ok: true, reportId: ref.id };
});

const reviewHelpDirectoryCorrection = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const reportId = clean(request.data?.reportId, 120);
  const action = clean(request.data?.action, 24);
  const note = clean(request.data?.reviewNote, 1000);
  if (!reportId || !["resolve", "dismiss", "pause_listing"].includes(action)) throw new HttpsError("invalid-argument", "Choose a report and a review action.");
  if (note.length < 30) throw new HttpsError("invalid-argument", "Add at least 30 characters explaining the review decision.");
  const reportRef = db.collection(CORRECTIONS).doc(reportId);
  const reportBefore = await reportRef.get();
  if (!reportBefore.exists) throw new HttpsError("not-found", "This correction report is no longer available.");
  const linkedBefore = await db.collection(COLLECTION).doc(reportBefore.get("listingId")).get();
  if (!linkedBefore.exists) throw new HttpsError("not-found", "The reported service is no longer available.");
  const { uid: actorUid } = await requireAdminScope(request, "support_directory.manage", linkedBefore.get("state") || reportBefore.get("state"));
  await requireAdminScope(request, "support_directory.manage", linkedBefore.get("state") || reportBefore.get("state"));
  const now = FieldValue.serverTimestamp();
  let status = "";
  await db.runTransaction(async (transaction) => {
    const reportSnapshot = await transaction.get(reportRef);
    if (!reportSnapshot.exists) throw new HttpsError("not-found", "This correction report is no longer available.");
    if (reportSnapshot.get("status") !== "open") throw new HttpsError("failed-precondition", "This correction report has already been reviewed.");
    const listingRef = db.collection(COLLECTION).doc(reportSnapshot.get("listingId"));
    const listingSnapshot = await transaction.get(listingRef);
    if (reportSnapshot.get("state") !== reportBefore.get("state")
      || !listingSnapshot.exists || listingSnapshot.get("state") !== linkedBefore.get("state")) {
      throw new HttpsError("aborted", "This report changed while you were reviewing it. Refresh and try again.");
    }
    if (action === "pause_listing") {
      if (!listingSnapshot.exists || listingSnapshot.get("status") !== "published") throw new HttpsError("failed-precondition", "The listing is no longer public; review it before resolving this report.");
      transaction.update(listingRef, { status: "paused", reviewNote: note, reviewedBy: actorUid, reviewedAt: now, updatedBy: actorUid, updatedAt: now });
      transaction.create(db.collection(AUDIT).doc(), { listingId: listingRef.id, listingName: reportSnapshot.get("listingName") || "", actorUid, action: "pause_after_correction", previousStatus: "published", newStatus: "paused", correctionId: reportId, note, createdAt: now });
      status = "resolved_listing_paused";
    } else {
      status = action === "dismiss" ? "dismissed" : "resolved";
    }
    transaction.update(reportRef, { status, reviewNote: note, reviewedBy: actorUid, reviewedAt: now, updatedAt: now });
    transaction.create(db.collection(AUDIT).doc(), { listingId: reportSnapshot.get("listingId"), listingName: reportSnapshot.get("listingName") || "", actorUid, correctionId: reportId, action: `correction_${action}`, newStatus: status, note, createdAt: now });
  });
  return { ok: true, status };
});

module.exports = { listHelpDirectoryForAdmin, saveHelpDirectoryDraft, setHelpDirectoryStatus, searchPublicHelpListings, reportHelpListingIssue, reviewHelpDirectoryCorrection, _validateRecord: validateRecord, _resolveState: resolveState, _makeSearchTokens: makeSearchTokens, _rateLimits: rateLimits, _correctionRateLimits: correctionRateLimits };
