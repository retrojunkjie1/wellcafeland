const { randomUUID } = require("node:crypto");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { addCommunityGiverRole } = require("./workspaceRoles");
const { requireAdminScope, requireAdminScopeForListing, constrainQueryToAdminRegions } = require("./adminAuthorization");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
const REGION = "us-central1";

const NEED_CATALOG = {
  transport: { label: "Bus fare or pass", amounts: ["One trip", "One week", "Two weeks", "One month"] },
  food: { label: "Food or groceries", amounts: ["One grocery bag", "One week of groceries", "One grocery delivery"] },
  milk: { label: "Milk or everyday essentials", amounts: ["One item", "A few items", "One week of essentials"] },
  "medication-cost": { label: "Medication costs", amounts: ["One-time help", "One month of help"] },
  "temporary-stay": { label: "A safe place to stay", amounts: ["One night", "One week", "Two weeks"] },
  "housing-start": { label: "Starting sober or stable housing", amounts: ["Application fee", "Move-in essentials", "Deposit help"] },
  clothing: { label: "Clothing or basic supplies", amounts: ["One outfit", "Shoes", "Basic supplies"] },
  "wellness-session": { label: "A wellness session", amounts: ["One yoga session", "One massage or bodywork session", "One coaching session"] },
  "other-essential": { label: "Another basic need", amounts: ["One-time help", "One week of help", "Two weeks of help"] },
};
const NEED_TYPES = new Set(Object.keys(NEED_CATALOG));
const ZONES = new Set(["metro", "north", "south", "east", "west", "central", "rural", "unsure"]);
const STATES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
]);
const SUPPORTER_TYPES = new Set(["individual", "organization", "recovery-coach", "therapist", "bodywork", "yoga"]);

function requireUser(request) {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Continue as a guest or sign in to use community support.");
  return request.auth.uid;
}

function cleanString(value, maxLength, field, required = false) {
  const result = typeof value === "string" ? value.trim().slice(0, maxLength) : "";
  if (required && !result) throw new HttpsError("invalid-argument", `${field} is required.`);
  return result;
}

async function requireActiveSupporter(uid) {
  const snapshot = await db.collection("community_supporters").doc(uid).get();
  if (!snapshot.exists || snapshot.get("status") !== "active") {
    throw new HttpsError("permission-denied", "Giving requests are available to approved supporters.");
  }
  return snapshot.data();
}

function safeNeed(data, id) {
  return {
    id,
    type: data.type,
    item: data.item,
    amount: data.amount,
    state: data.state,
    zone: data.zone,
    fulfillment: data.fulfillment,
    status: data.status,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
  };
}

exports.createCommunityNeed = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireUser(request);
  const data = request.data || {};
  const type = cleanString(data.type, 40, "Need type", true);
  const item = cleanString(data.item, 80, "Item", true);
  const amount = cleanString(data.amount, 60, "Amount", true);
  const state = cleanString(data.state, 2, "State", true).toUpperCase();
  const zone = cleanString(data.zone, 16, "Area", true);
  const fulfillment = cleanString(data.fulfillment, 20, "Delivery preference", true);

  if (!NEED_TYPES.has(type)) throw new HttpsError("invalid-argument", "Choose one of the listed support types.");
  if (item !== NEED_CATALOG[type].label || !NEED_CATALOG[type].amounts.includes(amount)) {
    throw new HttpsError("invalid-argument", "Choose a need and amount from the available options.");
  }
  if (data.publish !== true) throw new HttpsError("failed-precondition", "Confirm that this anonymous need can be shown to approved givers.");
  if (!STATES.has(state)) throw new HttpsError("invalid-argument", "Choose a state from the list.");
  if (!ZONES.has(zone)) throw new HttpsError("invalid-argument", "Choose an area from the list.");
  if (!["digital", "public-pickup", "delivery", "flexible"].includes(fulfillment)) {
    throw new HttpsError("invalid-argument", "Choose a delivery preference.");
  }

  const active = await db.collection("community_support_private")
    .where("requesterUid", "==", uid)
    .where("status", "==", "open")
    .limit(5)
    .get();
  if (active.size >= 5) throw new HttpsError("resource-exhausted", "You already have several open requests. Close one before adding another.");

  const id = randomUUID();
  const now = FieldValue.serverTimestamp();
  const batch = db.batch();
  batch.set(db.collection("community_support_listings").doc(id), {
    type, item, amount, state, zone, fulfillment,
    status: "open", createdAt: now,
  });
  batch.set(db.collection("community_support_private").doc(id), {
    requesterUid: uid,
    status: "open",
    acceptedSupporterUid: null,
    shareDetailsWithUid: null,
    deliveryAddress: null,
    phone: null,
    createdAt: now,
    updatedAt: now,
  });
  batch.set(db.collection("community_support_audit").doc(), {
    actorUid: uid, requestId: id, action: "need_created", createdAt: now,
  });
  await batch.commit();
  return { ok: true, need: { id, type, item, amount, state, zone, fulfillment, status: "open" } };
});

exports.listMyCommunityNeeds = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireUser(request);
  const snapshot = await db.collection("community_support_private")
    .where("requesterUid", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(30)
    .get();
  const needs = await Promise.all(snapshot.docs.map(async (privateDoc) => {
    const [listing, offerSnapshot] = await Promise.all([
      db.collection("community_support_listings").doc(privateDoc.id).get(),
      db.collection("community_support_offers").where("needId", "==", privateDoc.id).where("status", "==", "pending").get(),
    ]);
    const privateData = privateDoc.data();
    if (!listing.exists) return null;
    const offers = await Promise.all(offerSnapshot.docs.map(async (offerDoc) => {
      const offer = offerDoc.data();
      const supporter = await db.collection("community_supporters").doc(offer.supporterUid).get();
      return {
        id: offerDoc.id,
        supporterUid: offer.supporterUid,
        status: offer.status,
        displayName: supporter.get("displayName") || "Approved community giver",
        organization: supporter.get("organization") || "",
        type: supporter.get("type") || "individual",
      };
    }));
    const acceptedSupporter = privateData.status === "matched" && privateData.acceptedSupporterUid
      ? await db.collection("community_supporters").doc(privateData.acceptedSupporterUid).get()
      : null;
    return {
      ...safeNeed(listing.data(), listing.id),
      hasDeliveryAddress: Boolean(privateData.deliveryAddress),
      hasPhone: Boolean(privateData.phone),
      detailsShared: Boolean(privateData.shareDetailsWithUid),
      acceptedSupporter: acceptedSupporter?.exists ? {
        displayName: acceptedSupporter.get("displayName") || "Approved community giver",
        organization: acceptedSupporter.get("organization") || "",
        contactEmail: acceptedSupporter.get("contactEmail") || "",
      } : null,
      offers,
    };
  }));
  return { ok: true, needs: needs.filter(Boolean) };
});

exports.closeCommunityNeed = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireUser(request);
  const needId = cleanString(request.data?.needId, 64, "Request", true);
  const privateRef = db.collection("community_support_private").doc(needId);
  const listingRef = db.collection("community_support_listings").doc(needId);
  await db.runTransaction(async (transaction) => {
    const [privateNeed, listing] = await Promise.all([transaction.get(privateRef), transaction.get(listingRef)]);
    if (!privateNeed.exists || privateNeed.get("requesterUid") !== uid) {
      throw new HttpsError("permission-denied", "Only the person who requested this help can close it.");
    }
    if (privateNeed.get("status") !== "open" || !listing.exists || listing.get("status") !== "open") {
      throw new HttpsError("failed-precondition", "Only an unmatched request can be closed here.");
    }
    const pendingOffers = await transaction.get(
      db.collection("community_support_offers").where("needId", "==", needId).where("status", "==", "pending"),
    );
    transaction.update(privateRef, { status: "closed", updatedAt: FieldValue.serverTimestamp() });
    transaction.update(listingRef, { status: "closed", closedAt: FieldValue.serverTimestamp() });
    pendingOffers.docs.forEach((offer) => transaction.update(offer.ref, { status: "closed", respondedAt: FieldValue.serverTimestamp() }));
    transaction.set(db.collection("community_support_audit").doc(), {
      actorUid: uid, requestId: needId, action: "need_closed", createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { ok: true };
});

exports.finishCommunityNeed = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireUser(request);
  const needId = cleanString(request.data?.needId, 64, "Request", true);
  const outcome = cleanString(request.data?.outcome, 16, "Outcome", true);
  if (!["fulfilled", "cancelled"].includes(outcome)) {
    throw new HttpsError("invalid-argument", "Choose whether the help arrived or the request was cancelled.");
  }

  const privateRef = db.collection("community_support_private").doc(needId);
  const listingRef = db.collection("community_support_listings").doc(needId);
  await db.runTransaction(async (transaction) => {
    const [privateNeed, listing] = await Promise.all([transaction.get(privateRef), transaction.get(listingRef)]);
    if (!privateNeed.exists || privateNeed.get("requesterUid") !== uid) {
      throw new HttpsError("permission-denied", "Only the person who requested this help can close it.");
    }
    if (privateNeed.get("status") !== "matched" || !listing.exists || listing.get("status") !== "matched") {
      throw new HttpsError("failed-precondition", "Only a matched request can be finished here.");
    }

    const acceptedUid = privateNeed.get("acceptedSupporterUid");
    const offerRef = acceptedUid
      ? db.collection("community_support_offers").doc(`${needId}_${acceptedUid}`)
      : null;
    const acceptedOffer = offerRef ? await transaction.get(offerRef) : null;
    const finalStatus = outcome === "fulfilled" ? "fulfilled" : "closed";
    transaction.update(privateRef, {
      status: finalStatus,
      deliveryAddress: null,
      phone: null,
      shareDetailsWithUid: null,
      detailsSharedAt: null,
      finishedAt: FieldValue.serverTimestamp(),
      finishReason: outcome,
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(listingRef, {
      status: finalStatus,
      closedAt: FieldValue.serverTimestamp(),
    });
    if (acceptedOffer?.exists) {
      transaction.update(offerRef, {
        status: outcome === "fulfilled" ? "completed" : "closed_by_requester",
        completedAt: FieldValue.serverTimestamp(),
      });
    }
    transaction.set(db.collection("community_support_audit").doc(), {
      actorUid: uid,
      requestId: needId,
      action: outcome === "fulfilled" ? "need_fulfilled" : "matched_need_cancelled",
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  return { ok: true, status: outcome };
});

exports.listOpenCommunityNeeds = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireUser(request);
  const supporter = await requireActiveSupporter(uid);
  const categories = new Set(Array.isArray(supporter.categories) ? supporter.categories : []);
  const state = request.data?.state ? cleanString(request.data.state, 2, "State").toUpperCase() : null;
  const zone = request.data?.zone ? cleanString(request.data.zone, 16, "Area") : null;
  const type = request.data?.type ? cleanString(request.data.type, 40, "Need type") : null;
  if (state && !STATES.has(state)) throw new HttpsError("invalid-argument", "Choose a state from the list.");
  if (zone && !ZONES.has(zone)) throw new HttpsError("invalid-argument", "Choose an area from the list.");
  if (type && !NEED_TYPES.has(type)) throw new HttpsError("invalid-argument", "Choose a support type from the list.");

  const snapshot = await db.collection("community_support_listings")
    .where("status", "==", "open")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();
  const needs = snapshot.docs
    .map((doc) => safeNeed(doc.data(), doc.id))
    .filter((need) => categories.has(need.type) && (!state || need.state === state) && (!zone || need.zone === zone) && (!type || need.type === type));
  return { ok: true, needs };
});

exports.applyToCommunityGiving = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireUser(request);
  if (request.auth.token.firebase?.sign_in_provider === "anonymous" || request.auth.token.email_verified !== true) {
    throw new HttpsError("failed-precondition", "Use a verified email account to apply as a giver.");
  }
  const data = request.data || {};
  const displayName = cleanString(data.displayName, 80, "Name", true);
  const organization = cleanString(data.organization, 100, "Organization");
  const type = cleanString(data.type, 32, "Giver type", true);
  const state = cleanString(data.state, 2, "State", true).toUpperCase();
  const zone = cleanString(data.zone, 16, "Area", true);
  const categories = Array.isArray(data.categories) ? [...new Set(data.categories.map((item) => String(item).slice(0, 40)))].filter((item) => NEED_TYPES.has(item)).slice(0, 9) : [];
  if (!SUPPORTER_TYPES.has(type) || !STATES.has(state) || !ZONES.has(zone) || !categories.length) {
    throw new HttpsError("invalid-argument", "Choose your giver type, service area, and at least one support category.");
  }
  const ref = db.collection("community_supporter_applications").doc(uid);
  const existing = await ref.get();
  if (existing.exists && ["pending", "approved"].includes(existing.get("status"))) {
    return { ok: true, status: existing.get("status") };
  }
  await ref.set({
    uid, displayName, organization, type, state, zone, categories,
    email: cleanString(request.auth.token.email, 254, "Email"),
    status: "pending", submittedAt: FieldValue.serverTimestamp(), reviewedAt: null,
  });
  return { ok: true, status: "pending" };
});

exports.getMyCommunityGivingStatus = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireUser(request);
  const [application, supporter] = await Promise.all([
    db.collection("community_supporter_applications").doc(uid).get(),
    db.collection("community_supporters").doc(uid).get(),
  ]);
  return {
    ok: true,
    status: supporter.get("status") === "active" ? "active" : application.get("status") || "not_applied",
  };
});

exports.createCommunitySupportOffer = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireUser(request);
  const supporter = await requireActiveSupporter(uid);
  const needId = cleanString(request.data?.needId, 64, "Request", true);
  const listingRef = db.collection("community_support_listings").doc(needId);
  const offerRef = db.collection("community_support_offers").doc(`${needId}_${uid}`);
  await db.runTransaction(async (transaction) => {
    const [listing, existingOffer] = await Promise.all([transaction.get(listingRef), transaction.get(offerRef)]);
    if (!listing.exists || listing.get("status") !== "open") throw new HttpsError("failed-precondition", "This need is no longer open.");
    if (!Array.isArray(supporter.categories) || !supporter.categories.includes(listing.get("type"))) {
      throw new HttpsError("permission-denied", "Your giver profile is not approved for this type of need.");
    }
    if (existingOffer.exists) throw new HttpsError("already-exists", "You already offered to help with this need.");
    transaction.set(offerRef, {
      needId, supporterUid: uid, status: "pending", createdAt: FieldValue.serverTimestamp(),
    });
    transaction.set(db.collection("community_support_audit").doc(), {
      actorUid: uid, requestId: needId, action: "offer_created", createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { ok: true };
});

exports.respondToCommunityOffer = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireUser(request);
  const needId = cleanString(request.data?.needId, 64, "Request", true);
  const supporterUid = cleanString(request.data?.supporterUid, 128, "Giver", true);
  const decision = cleanString(request.data?.decision, 16, "Decision", true);
  if (!["accept", "decline"].includes(decision)) throw new HttpsError("invalid-argument", "Choose accept or decline.");
  const privateRef = db.collection("community_support_private").doc(needId);
  const listingRef = db.collection("community_support_listings").doc(needId);
  const offerRef = db.collection("community_support_offers").doc(`${needId}_${supporterUid}`);
  await db.runTransaction(async (transaction) => {
    const [privateNeed, listing, offer] = await Promise.all([
      transaction.get(privateRef), transaction.get(listingRef), transaction.get(offerRef),
    ]);
    if (!privateNeed.exists || privateNeed.get("requesterUid") !== uid) throw new HttpsError("permission-denied", "Only the person who requested this help can respond.");
    if (!offer.exists || offer.get("status") !== "pending") throw new HttpsError("not-found", "This offer is no longer available.");
    if (decision === "decline") {
      transaction.update(offerRef, { status: "declined", respondedAt: FieldValue.serverTimestamp() });
      transaction.set(db.collection("community_support_audit").doc(), {
        actorUid: uid, requestId: needId, action: "offer_declined", createdAt: FieldValue.serverTimestamp(),
      });
      return;
    }
    if (!listing.exists || listing.get("status") !== "open") throw new HttpsError("failed-precondition", "This need has already been matched or closed.");
    const otherOffers = await transaction.get(db.collection("community_support_offers").where("needId", "==", needId).where("status", "==", "pending"));
    transaction.update(listingRef, { status: "matched", matchedAt: FieldValue.serverTimestamp() });
    transaction.update(privateRef, { status: "matched", acceptedSupporterUid: supporterUid, updatedAt: FieldValue.serverTimestamp() });
    transaction.update(offerRef, { status: "accepted", respondedAt: FieldValue.serverTimestamp() });
    otherOffers.docs.forEach((otherOffer) => {
      if (otherOffer.id !== offerRef.id) transaction.update(otherOffer.ref, { status: "closed", respondedAt: FieldValue.serverTimestamp() });
    });
    transaction.set(db.collection("community_support_audit").doc(), {
      actorUid: uid, requestId: needId, action: "offer_accepted", createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { ok: true, decision };
});

exports.shareCommunityDeliveryDetails = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireUser(request);
  const needId = cleanString(request.data?.needId, 64, "Request", true);
  const address = cleanString(request.data?.address, 250, "Delivery address");
  const phone = cleanString(request.data?.phone, 40, "Phone number");
  if (!address && !phone) throw new HttpsError("invalid-argument", "Add an address or phone number to share.");
  const ref = db.collection("community_support_private").doc(needId);
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.get("requesterUid") !== uid || snapshot.get("status") !== "matched" || !snapshot.get("acceptedSupporterUid")) {
      throw new HttpsError("permission-denied", "Only the requester can share details after a giver accepts.");
    }
    const acceptedUid = snapshot.get("acceptedSupporterUid");
    transaction.update(ref, {
      ...(address && { deliveryAddress: address }),
      ...(phone && { phone }),
      shareDetailsWithUid: acceptedUid,
      detailsSharedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.set(db.collection("community_support_audit").doc(), {
      actorUid: uid,
      requestId: needId,
      action: "fulfillment_details_shared",
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { ok: true };
});

exports.listMyCommunityOffers = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireUser(request);
  await requireActiveSupporter(uid);
  const snapshot = await db.collection("community_support_offers")
    .where("supporterUid", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  const offers = await Promise.all(snapshot.docs.map(async (offerDoc) => {
    const offer = offerDoc.data();
    const [listing, privateNeed] = await Promise.all([
      db.collection("community_support_listings").doc(offer.needId).get(),
      db.collection("community_support_private").doc(offer.needId).get(),
    ]);
    if (!listing.exists) return null;
    const details = privateNeed.exists && privateNeed.get("shareDetailsWithUid") === uid
      ? { address: privateNeed.get("deliveryAddress") || "", phone: privateNeed.get("phone") || "" }
      : null;
    return { id: offerDoc.id, status: offer.status, ...safeNeed(listing.data(), listing.id), details };
  }));
  return { ok: true, offers: offers.filter(Boolean) };
});

exports.listCommunityGiverApplications = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const access = await requireAdminScopeForListing(request, "giving.review");
  const assignedRegions = access.regionalScopes?.["giving.review"] || [];
  const regionalOnly = !access.isGodAdmin && !access.scopes.includes("giving.review");
  let applicationsQuery = db.collection("community_supporter_applications").where("status", "==", "pending");
  applicationsQuery = constrainQueryToAdminRegions(applicationsQuery, access, "giving.review", "state");
  const snapshot = await applicationsQuery.orderBy("submittedAt", "asc").limit(100).get();
  return { ok: true, applications: snapshot.docs
    .filter((doc) => !regionalOnly || assignedRegions.includes("*") || assignedRegions.includes(String(doc.get("state") || "").toUpperCase()))
    .map((doc) => ({ id: doc.id, ...doc.data(), submittedAt: doc.get("submittedAt")?.toDate?.()?.toISOString?.() || null })) };
});

exports.reviewCommunityGiverApplication = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const applicantUid = cleanString(request.data?.applicantUid, 128, "Applicant", true);
  const decision = cleanString(request.data?.decision, 16, "Decision", true);
  if (!["approve", "decline"].includes(decision)) throw new HttpsError("invalid-argument", "Choose approve or decline.");
  const applicationRef = db.collection("community_supporter_applications").doc(applicantUid);
  const application = await applicationRef.get();
  if (!application.exists || application.get("status") !== "pending") throw new HttpsError("not-found", "This application has already been reviewed.");
  const data = application.data();
  const { uid: adminUid } = await requireAdminScope(request, "giving.review", String(data.state || "").toUpperCase() || undefined);
  const batch = db.batch();
  batch.update(applicationRef, { status: decision === "approve" ? "approved" : "declined", reviewedAt: FieldValue.serverTimestamp(), reviewedBy: adminUid });
  if (decision === "approve") {
    const userRef = db.collection("users").doc(applicantUid);
    const userSnapshot = await userRef.get();
    const userData = userSnapshot.exists ? userSnapshot.data() : {};
    const workspaceRoles = addCommunityGiverRole(userData);
    batch.set(db.collection("community_supporters").doc(applicantUid), {
      uid: applicantUid,
      displayName: data.displayName,
      organization: data.organization,
      contactEmail: data.email,
      type: data.type,
      state: data.state,
      zone: data.zone,
      categories: data.categories,
      status: "active",
      approvedAt: FieldValue.serverTimestamp(),
      approvedBy: adminUid,
    });
    batch.set(userRef, {
      uid: applicantUid,
      email: userData.email || data.email || "",
      ...workspaceRoles,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  }
  batch.set(db.collection("community_support_audit").doc(), {
    actorUid: adminUid, subjectUid: applicantUid, action: `giver_application_${decision}d`, createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
  return { ok: true };
});
