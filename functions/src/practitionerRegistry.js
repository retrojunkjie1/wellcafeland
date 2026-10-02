const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { requireAdminScope, requireAdminScopeForListing, constrainQueryToAdminRegions } = require("./adminAuthorization");
const { requireVerifiedAccount } = require("./accountAccess");
const admin = require("firebase-admin");
const { isProductFeatureEnabled } = require("./agentOperations");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const REGION = "us-central1";
const TYPES = new Set([
  "therapist", "counselor", "recovery-coach", "peer-support", "yoga",
  "massage", "bodywork", "acupuncture", "spiritual-counselor", "community-supporter",
]);
const SERVICE_FORMATS = new Set(["one-to-one", "group", "community-event", "practical-giving"]);
const ACCESS_OPTIONS = new Set(["wheelchair-accessible", "interpreter-available", "low-sensory-option"]);
const DELIVERY_OPTIONS = new Set(["online", "in-person"]);
const COST_OPTIONS = new Set(["free", "paid"]);
const PUBLIC_TAXONOMIES = {
  therapist: ["Psychologist", "Clinical", "Marriage & Family Therapist"],
  counselor: ["Counselor", "Mental Health"],
  massage: ["Massage Therapist"],
  acupuncture: ["Acupuncturist"],
};
const nppesCache = new Map();

function requireUser(request) {
  return requireVerifiedAccount(request, "create or manage a practitioner profile");
}

function cleanText(value, max, label, required = false) {
  const text = typeof value === "string" ? value.trim().slice(0, max) : "";
  if (required && !text) throw new HttpsError("invalid-argument", `${label} is required.`);
  return text;
}

function normalizeLocation(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US") : "";
}

function cleanOptions(value, allowed, label, max = 6) {
  if (!Array.isArray(value)) return [];
  const options = [...new Set(value.filter((item) => typeof item === "string" && allowed.has(item)))];
  if (options.length > max) throw new HttpsError("invalid-argument", `Choose no more than ${max} ${label.toLowerCase()}.`);
  return options;
}

function normalizeApplication(data, user) {
  const type = TYPES.has(data.type) ? data.type : null;
  if (!type) throw new HttpsError("invalid-argument", "Choose the type of support you provide.");
  let publicDirectoryClaim = null;
  if (data.publicDirectoryClaim != null) {
    const claim = data.publicDirectoryClaim;
    if (!claim || claim.source !== "nppes" || typeof claim.npi !== "string" || !/^\d{10}$/.test(claim.npi)) {
      throw new HttpsError("invalid-argument", "The public directory reference is invalid. Reopen the invitation from the directory and try again.");
    }
    publicDirectoryClaim = { source: "nppes", npi: claim.npi };
  }
  const services = Array.isArray(data.services)
    ? [...new Set(data.services.map((v) => cleanText(v, 64, "Service")).filter(Boolean))].slice(0, 12)
    : [];
  if (!services.length) throw new HttpsError("invalid-argument", "Add at least one service or form of support.");
  return {
    uid: user.uid,
    email: user.token.email || "",
    type,
    name: cleanText(data.name, 100, "Display name", true),
    organization: cleanText(data.organization, 120, "Organization"),
    bio: cleanText(data.bio, 900, "Introduction", true),
    city: cleanText(data.city, 80, "City"),
    region: cleanText(data.region, 2, "State or region").toUpperCase(),
    delivery: ["in-person", "online", "both"].includes(data.delivery) ? data.delivery : "both",
    serviceStyle: ["free", "paid", "both"].includes(data.serviceStyle) ? data.serviceStyle : "both",
    services,
    serviceFormats: cleanOptions(data.serviceFormats, SERVICE_FORMATS, "Service formats"),
    accessibilityOptions: cleanOptions(data.accessibilityOptions, ACCESS_OPTIONS, "Accessibility options"),
    priceDetails: cleanText(data.priceDetails, 180, "Cost details"),
    sessionLength: ["30", "45", "60", "variable", "not-applicable"].includes(String(data.sessionLength)) ? String(data.sessionLength) : "variable",
    credentialType: cleanText(data.credentialType, 100, "Credential type"),
    credentialSummary: cleanText(data.credentialSummary, 240, "Credential summary"),
    publicDirectoryClaim,
    acceptsReferrals: data.acceptsReferrals === true,
    consentToReview: data.consentToReview === true,
  };
}

exports.submitPractitionerApplication = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireUser(request);
  const user = { uid, token: request.auth.token };
  const profile = normalizeApplication(request.data || {}, user);
  if (!profile.consentToReview) throw new HttpsError("failed-precondition", "Agree to a human review before submitting.");
  const ref = db.collection("practitioner_applications").doc(uid);
  const existing = await ref.get();
  if (existing.exists && existing.get("status") === "approved") {
    throw new HttpsError("failed-precondition", "This practitioner account is already approved. Update your profile from the practitioner dashboard.");
  }
  await ref.set({
    ...profile,
    status: "pending",
    submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  return { ok: true, status: "pending" };
});

exports.getMyPractitionerApplication = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireUser(request);
  const [application, profile] = await Promise.all([
    db.collection("practitioner_applications").doc(uid).get(),
    db.collection("realHelpProviders").doc(uid).get(),
  ]);
  const profileData = profile.exists ? profile.data() : null;
  const safeProfile = profileData ? {
    id: profile.id,
    name: profileData.name || "",
    organization: profileData.organization || "",
    category: profileData.category || profileData.type || "",
    bio: profileData.bio || "",
    city: profileData.city || "",
    region: profileData.region || "",
    delivery: profileData.delivery || "both",
    serviceStyle: profileData.serviceStyle || "both",
    services: Array.isArray(profileData.services) ? profileData.services : [],
    serviceFormats: Array.isArray(profileData.serviceFormats) ? profileData.serviceFormats : [],
    accessibilityOptions: Array.isArray(profileData.accessibilityOptions) ? profileData.accessibilityOptions : [],
    priceDetails: profileData.priceDetails || "",
    sessionLength: profileData.sessionLength || "variable",
    verificationType: profileData.verification?.type || "profile-reviewed",
    acceptsReferrals: profileData.acceptsReferrals === true,
  } : null;
  const applicationData = application.exists ? application.data() : null;
  const profileDraft = applicationData ? { ...applicationData } : null;
  if (profileDraft) {
    delete profileDraft.uid;
    delete profileDraft.email;
    delete profileDraft.submittedAt;
    delete profileDraft.updatedAt;
    delete profileDraft.reviewedAt;
    delete profileDraft.reviewedBy;
  }
  return {
    application: applicationData ? { status: applicationData.status, reviewNote: applicationData.reviewNote || "", profileDraft } : null,
    profile: safeProfile,
  };
});

exports.listPractitionersForReview = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const access = await requireAdminScopeForListing(request, "practitioner.review");
  const assignedRegions = access.regionalScopes?.["practitioner.review"] || [];
  const regionalOnly = !access.isGodAdmin && !access.scopes.includes("practitioner.review");
  let applicationsQuery = db.collection("practitioner_applications");
  applicationsQuery = constrainQueryToAdminRegions(applicationsQuery, access, "practitioner.review", "region");
  const snapshot = await applicationsQuery.get();
  return {
    applications: snapshot.docs.filter((doc) => !regionalOnly || assignedRegions.includes("*") || assignedRegions.includes(String(doc.get("region") || "").toUpperCase())).map((doc) => {
      const { email, credentialSummary, ...publicFields } = doc.data();
      return { ...publicFields, id: doc.id, uid: doc.id, email, credentialSummary };
    }).sort((a, b) => {
      const order = { pending: 0, declined: 1, approved: 2 };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3)
        || (b.submittedAt?.toMillis?.() || 0) - (a.submittedAt?.toMillis?.() || 0);
    }),
  };
});

exports.reviewPractitionerApplication = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = cleanText(request.data?.uid, 128, "Practitioner account", true);
  const decision = request.data?.decision;
  if (!["approve", "decline"].includes(decision)) throw new HttpsError("invalid-argument", "Choose approve or decline.");
  const ref = db.collection("practitioner_applications").doc(uid);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new HttpsError("not-found", "This application is no longer available.");
  const applicationRegion = String(snapshot.get("region") || "").toUpperCase();
  const { uid: reviewerUid } = await requireAdminScope(request, "practitioner.review", applicationRegion || undefined);
  const reviewNote = cleanText(request.data?.reviewNote, 500, "Review note");
  if (decision === "decline") {
    return db.runTransaction(async (transaction) => {
      const current = await transaction.get(ref);
      if (!current.exists) throw new HttpsError("not-found", "This application is no longer available.");
      if (String(current.get("region") || "").toUpperCase() !== applicationRegion) throw new HttpsError("aborted", "The application location changed. Refresh and review it again.");
      if (current.get("status") === "declined") return { ok: true, status: "declined" };
      if (current.get("status") !== "pending") {
        throw new HttpsError("failed-precondition", "Only a pending application can be declined. Approved profiles need a separate suspension review.");
      }
      transaction.update(ref, {
        status: "declined",
        reviewNote,
        reviewedBy: reviewerUid,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { ok: true, status: "declined" };
    });
  }

  const userRef = db.collection("users").doc(uid);
  const authUser = await admin.auth().getUser(uid);
  const profileRef = db.collection("realHelpProviders").doc(uid);
  const approved = await db.runTransaction(async (transaction) => {
    const current = await transaction.get(ref);
    if (!current.exists) throw new HttpsError("not-found", "This application is no longer available.");
    const application = current.data();
    if (String(application.region || "").toUpperCase() !== applicationRegion) throw new HttpsError("aborted", "The application location changed. Refresh and review it again.");
    if (application.status === "declined") {
      throw new HttpsError("failed-precondition", "This application was declined. The applicant must update and resubmit it before approval.");
    }
    if (!["pending", "approved"].includes(application.status)) {
      throw new HttpsError("failed-precondition", "This application is not ready for review.");
    }
    if (application.publicDirectoryClaim && request.data?.confirmPublicDirectoryClaim !== true) {
      throw new HttpsError("failed-precondition", "Confirm that the applicant matches the public NPI record before approving this linked listing.");
    }

    const userDoc = await transaction.get(userRef);
    const storedRoles = userDoc.exists && Array.isArray(userDoc.get("roles")) ? userDoc.get("roles") : [];
    const isCommunity = application.type === "community-supporter";
    const reviewedAt = admin.firestore.FieldValue.serverTimestamp();
    const profile = {
      uid,
      name: application.name,
      organization: application.organization || "",
      category: application.type,
      type: application.type,
      bio: application.bio,
      city: application.city || "",
      region: application.region || "",
      regionKey: application.region || "",
      delivery: application.delivery,
      serviceStyle: application.serviceStyle,
      services: application.services,
      serviceFormats: application.serviceFormats || [],
      accessibilityOptions: application.accessibilityOptions || [],
      priceDetails: application.priceDetails || "",
      sessionLength: application.sessionLength || "variable",
      tags: application.services,
      acceptsReferrals: application.acceptsReferrals,
      credentialType: application.credentialType || "",
      credentialSummary: application.credentialSummary || "",
      ...(application.publicDirectoryClaim ? { publicDirectoryClaim: application.publicDirectoryClaim } : {}),
      verification: {
        status: "verified",
        type: isCommunity ? "community-identity-reviewed" : "profile-reviewed",
        reviewedAt,
        reviewedBy: reviewerUid,
      },
      updatedAt: reviewedAt,
    };

    transaction.set(profileRef, profile, { merge: true });
    transaction.set(userRef, {
      role: "provider",
      providerId: uid,
      roles: [...new Set([...storedRoles, "provider"])],
      updatedAt: reviewedAt,
    }, { merge: true });
    if (application.status === "pending") {
      transaction.update(ref, {
        status: "approved",
        reviewNote,
        reviewedBy: reviewerUid,
        reviewedAt,
      });
    }
    return { status: "approved", providerType: application.type };
  });

  // Auth claims are outside Firestore transactions. A retry of the same approval
  // repairs the claims if the Firestore commit succeeded but Auth was unavailable.
  const customClaims = {
    ...(authUser.customClaims || {}),
    provider: true,
    role: "provider",
    providerType: approved.providerType,
  };
  await admin.auth().setCustomUserClaims(uid, customClaims);
  return { ok: true, status: "approved" };
});

exports.listVerifiedPractitioners = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  // Only reviewed, public profile fields are returned here. Browsing is public;
  // contacting a practitioner still requires a personal account.
  if (!(await isProductFeatureEnabled("providersMarketplace", db))) {
    return { available: false, practitioners: [] };
  }
  const snapshot = await db.collection("realHelpProviders")
    .where("verification.status", "==", "verified")
    .limit(200)
    .get();
  const type = cleanText(request.data?.type, 48, "Support type");
  const search = cleanText(request.data?.search, 100, "Search").toLowerCase();
  const serviceFormat = SERVICE_FORMATS.has(request.data?.serviceFormat) ? request.data.serviceFormat : "";
  const accessibilityOption = ACCESS_OPTIONS.has(request.data?.accessibilityOption) ? request.data.accessibilityOption : "";
  const deliveryOption = DELIVERY_OPTIONS.has(request.data?.deliveryOption) ? request.data.deliveryOption : "";
  const costOption = COST_OPTIONS.has(request.data?.costOption) ? request.data.costOption : "";
  const city = cleanText(request.data?.city, 80, "City").toLowerCase();
  const region = cleanText(request.data?.region, 16, "State or region").toLowerCase();
  const acceptingNewClients = request.data?.acceptingNewClients === true;
  const practitioners = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      organization: data.organization || "",
      category: data.category,
      bio: data.bio,
      city: data.city || "",
      region: data.region || "",
      delivery: data.delivery || "both",
      serviceStyle: data.serviceStyle || "both",
      services: Array.isArray(data.services) ? data.services : [],
      serviceFormats: Array.isArray(data.serviceFormats) ? data.serviceFormats.filter((item) => SERVICE_FORMATS.has(item)) : [],
      accessibilityOptions: Array.isArray(data.accessibilityOptions) ? data.accessibilityOptions.filter((item) => ACCESS_OPTIONS.has(item)) : [],
      priceDetails: cleanText(data.priceDetails, 180, "Cost details"),
      sessionLength: data.sessionLength || "variable",
      verificationType: data.verification?.type || "profile-reviewed",
      acceptsReferrals: data.acceptsReferrals === true,
    };
  });
  return {
    available: true,
    practitioners: practitioners.filter((item) => {
      const matchesType = !type || item.category === type || item.services.includes(type);
      const haystack = `${item.name} ${item.organization} ${item.bio} ${item.city} ${item.region} ${item.services.join(" ")}`.toLowerCase();
      return matchesType
        && (!serviceFormat || item.serviceFormats.includes(serviceFormat))
        && (!accessibilityOption || item.accessibilityOptions.includes(accessibilityOption))
        && (!deliveryOption || item.delivery === deliveryOption || item.delivery === "both")
        && (!costOption || item.serviceStyle === costOption || item.serviceStyle === "both")
        && (!city || item.city.toLowerCase().includes(city))
        && (!region || item.region.toLowerCase() === region)
        && (!acceptingNewClients || item.acceptsReferrals)
        && (!search || haystack.includes(search));
    }),
  };
});

// This anonymous lookup fans out to the public NPI registry. App Check
// reduces scripted calls while leaving discovery available without sign-in.
exports.searchPublicPractitionerDirectory = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  // Pause upstream public registry lookups as well as WellnessCafe-reviewed
  // discovery. Existing connections, appointments, and applications remain
  // available; this switch only controls new directory discovery.
  if (!(await isProductFeatureEnabled("providersMarketplace", db))) {
    return { available: false, listings: [] };
  }
  const city = cleanText(request.data?.city, 80, "City", true);
  const region = cleanText(request.data?.region, 2, "State", true).toUpperCase();
  if (!/^[A-Z]{2}$/.test(region)) throw new HttpsError("invalid-argument", "Enter a two-letter US state code.");
  const requestedCategory = cleanText(request.data?.category, 32, "Support type");
  if (requestedCategory && !PUBLIC_TAXONOMIES[requestedCategory]) {
    throw new HttpsError("invalid-argument", "Choose a healthcare provider category available in the public registry.");
  }
  const categories = requestedCategory && PUBLIC_TAXONOMIES[requestedCategory]
    ? [requestedCategory]
    : Object.keys(PUBLIC_TAXONOMIES);
  const cacheKey = `${city.toLowerCase()}|${region}|${categories.join(",")}`;
  const cached = nppesCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return { available: true, listings: cached.listings, source: "NPPES NPI Registry", cached: true };

  try {
    const searchSpecs = categories.flatMap((category) => PUBLIC_TAXONOMIES[category]
      .slice(0, requestedCategory ? 3 : 1)
      .map((taxonomyDescription) => ({ category, taxonomyDescription })));
    const records = await Promise.all(searchSpecs.map(async ({ category, taxonomyDescription }) => {
      const params = new URLSearchParams({ version: "2.1", city, state: region, enumeration_type: "NPI-1", limit: "10" });
      params.set("taxonomy_description", taxonomyDescription);
      const response = await fetch(`https://npiregistry.cms.hhs.gov/api/?${params.toString()}`, { signal: AbortSignal.timeout(9000) });
      if (!response.ok) throw new Error(`NPPES returned ${response.status}`);
      const body = await response.json();
      return (Array.isArray(body.results) ? body.results : []).map((record) => {
        const basic = record.basic || {};
        // Search results must use an actual practice location. Mailing/contact
        // addresses can be far from the requested city and must never be shown
        // as nearby results.
        const address = (record.addresses || []).find((item) => item.address_purpose === "LOCATION");
        if (!address?.city || !address?.state
          || normalizeLocation(address.city) !== normalizeLocation(city)
          || String(address.state).trim().toUpperCase() !== region) return null;
        const taxonomy = (record.taxonomies || []).find((item) => item.primary) || record.taxonomies?.[0] || {};
        const name = [basic.first_name, basic.middle_name, basic.last_name].filter(Boolean).join(" ")
          || basic.organization_name || "Healthcare professional";
        return {
          id: String(record.number || ""), name,
          credential: basic.credential || "",
          category, specialty: taxonomy.desc || PUBLIC_TAXONOMIES[category][0],
          city: address.city.trim(), region: address.state.trim().toUpperCase(),
          postalCode: address.postal_code ? String(address.postal_code).slice(0, 5) : "",
          phone: address.telephone_number || "",
          sourceUpdated: basic.last_updated || "",
          sourceUrl: `https://npiregistry.cms.hhs.gov/provider-view/${encodeURIComponent(record.number)}`,
        };
      });
    }));
    const listings = records.flat().filter((item) => item && item.id && item.name)
      .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
      .slice(0, 30);
    nppesCache.set(cacheKey, { listings, expiresAt: Date.now() + 15 * 60 * 1000 });
    return { available: true, listings, source: "NPPES NPI Registry", cached: false };
  } catch (error) {
    console.error("[searchPublicPractitionerDirectory] NPPES lookup failed", error.message);
    throw new HttpsError("unavailable", "The public provider registry is temporarily unavailable. Please try again.");
  }
});
