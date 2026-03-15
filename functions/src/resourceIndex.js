// functions/src/resourceIndex.js
// Firestore resourceIndex collection management with idempotent upserts

const admin = require("firebase-admin");
const db = admin.firestore();

const COLLECTION_NAME = "resourceIndex";

/**
 * Idempotent upsert to resourceIndex collection
 * Uses externalSourceId or dedupeHash as key
 */
async function upsertResource(resource) {
  if (!resource || !resource.source) {
    throw new Error("Resource must have source field");
  }

  // Determine document ID: prefer externalSourceId, fallback to dedupeHash
  const docId = resource.externalSourceId || `hash-${resource.dedupeHash}`;

  const docRef = db.collection(COLLECTION_NAME).doc(docId);

  // Prepare document data (ensure timestamps are proper)
  const docData = {
    ...resource,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Preserve createdAt if document already exists
  const existingDoc = await docRef.get();
  if (existingDoc.exists) {
    const existingData = existingDoc.data();
    if (existingData.createdAt) {
      docData.createdAt = existingData.createdAt;
    }
    // Update, don't overwrite
    await docRef.update(docData);
  } else {
    // Create new
    docData.createdAt = admin.firestore.FieldValue.serverTimestamp();
    await docRef.set(docData);
  }

  return { id: docId, success: true };
}

/**
 * Batch upsert resources (max 500 per batch per Firestore limit)
 */
async function batchUpsertResources(resources) {
  const batch = db.batch();
  const batches = [];
  let currentBatch = batch;
  let count = 0;
  const BATCH_SIZE = 500;

  for (const resource of resources) {
    if (count >= BATCH_SIZE) {
      batches.push(currentBatch);
      currentBatch = db.batch();
      count = 0;
    }

    const docId = resource.externalSourceId || `hash-${resource.dedupeHash}`;
    const docRef = db.collection(COLLECTION_NAME).doc(docId);

    const docData = {
      ...resource,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Check if exists (we'll handle this in a transaction for true idempotency)
    const existingDoc = await docRef.get();
    if (existingDoc.exists) {
      const existingData = existingDoc.data();
      if (existingData.createdAt) {
        docData.createdAt = existingData.createdAt;
      }
      currentBatch.update(docRef, docData);
    } else {
      docData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      currentBatch.set(docRef, docData);
    }

    count++;
  }

  if (count > 0) {
    batches.push(currentBatch);
  }

  // Commit all batches
  const results = [];
  for (const b of batches) {
    await b.commit();
  }

  return { success: true, count: resources.length, batches: batches.length };
}

/**
 * Search resourceIndex by query, filters
 */
async function searchResourceIndex({ query, state, city, serviceTags, limit = 50 }) {
  let q = db.collection(COLLECTION_NAME);

  // Apply filters
  if (state) {
    q = q.where("state", "==", state.toUpperCase().substring(0, 2));
  }
  if (city) {
    q = q.where("city", "==", city);
  }
  if (serviceTags && serviceTags.length > 0) {
    // Firestore array-contains-any (limit 10 tags)
    const tags = serviceTags.slice(0, 10);
    q = q.where("serviceTags", "array-contains-any", tags);
  }

  // Apply limit
  q = q.limit(limit);

  const snapshot = await q.get();

  let results = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Client-side text search if query provided (Firestore text search requires index)
  if (query && query.trim()) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(r =>
      (r.name || "").toLowerCase().includes(lowerQuery) ||
      (r.address || "").toLowerCase().includes(lowerQuery) ||
      (r.city || "").toLowerCase().includes(lowerQuery)
    );
  }

  return results;
}

/**
 * Mark resources as stale (older than threshold)
 */
async function markStaleResources(thresholdDays = 90) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

  const q = db.collection(COLLECTION_NAME)
    .where("fetchedAt", "<", admin.firestore.Timestamp.fromDate(thresholdDate))
    .where("verificationStatus", "==", "unverified")
    .limit(1000);

  const snapshot = await q.get();
  const batch = db.batch();
  let count = 0;

  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      verificationStatus: "stale",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    count++;
  });

  if (count > 0) {
    await batch.commit();
  }

  return { markedStale: count };
}

module.exports = {
  upsertResource,
  batchUpsertResources,
  searchResourceIndex,
  markStaleResources,
};

