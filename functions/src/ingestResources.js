// functions/src/ingestResources.js
// Scheduled ingestion pipeline: Cloud Scheduler → Function → Firestore

const { searchFindTreatment } = require("./findTreatmentClient");
const { batchUpsertResources } = require("./resourceIndex");
const admin = require("firebase-admin");

// State codes (start with configurable list)
const DEFAULT_STATES = [
  "CA", "NY", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "MI",
  "NJ", "VA", "WA", "AZ", "MA", "TN", "IN", "MO", "MD", "WI",
];

/**
 * Ingest resources for a single state
 */
async function ingestState(stateCode, options = {}) {
  const maxPages = options.maxPages || 5; // Safety limit
  const startTime = Date.now();

  try {
    // Query FindTreatment.gov by state
    const ftParams = {
      limitType: 0, // State search
      limitValue: stateCode.toUpperCase().substring(0, 2),
      pageSize: 100,
      maxPages,
      sType: "both", // Both substance abuse and mental health
    };

    const facilities = await searchFindTreatment(ftParams);
    const normalized = facilities.map(f => ({
      ...f,
      state: stateCode.toUpperCase().substring(0, 2), // Ensure state is set
    }));

    // Batch upsert to Firestore
    const upsertResult = await batchUpsertResources(normalized);

    const duration = Date.now() - startTime;

    // Log telemetry (no PII)
    await logIngestionTelemetry({
      state: stateCode,
      success: true,
      facilitiesProcessed: normalized.length,
      batches: upsertResult.batches,
      durationMs: duration,
    });

    return {
      success: true,
      state: stateCode,
      facilitiesProcessed: normalized.length,
      batches: upsertResult.batches,
      durationMs: duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log error telemetry
    await logIngestionTelemetry({
      state: stateCode,
      success: false,
      error: error.message,
      durationMs: duration,
    });

    throw error;
  }
}

/**
 * Log ingestion telemetry (no PII)
 */
async function logIngestionTelemetry(data) {
  try {
    const db = admin.firestore();
    await db.collection("telemetry_events").add({
      event: "resource_ingestion",
      category: "ingestion",
      metadata: {
        state: data.state,
        success: data.success,
        facilitiesProcessed: data.facilitiesProcessed || 0,
        batches: data.batches || 0,
        durationMs: data.durationMs || 0,
        error: data.error || null,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      // No PII - no uid, email, etc.
    });
  } catch (err) {
    // Non-blocking - don't fail ingestion if telemetry fails
    console.error("[ingestResources] Failed to log telemetry:", err.message);
  }
}

/**
 * Main ingestion handler (called by Cloud Scheduler)
 */
async function ingestResources(options = {}) {
  const states = options.states || DEFAULT_STATES;
  const results = [];

  for (const state of states) {
    try {
      const result = await ingestState(state, {
        maxPages: options.maxPagesPerState || 5,
      });
      results.push(result);

      // Small delay between states to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[ingestResources] Failed to ingest ${state}:`, error.message);
      results.push({
        success: false,
        state,
        error: error.message,
      });
    }
  }

  const summary = {
    totalStates: states.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    totalFacilities: results.reduce((sum, r) => sum + (r.facilitiesProcessed || 0), 0),
    results,
  };

  // Log summary telemetry
  await logIngestionTelemetry({
    summary: true,
    ...summary,
  });

  return summary;
}

module.exports = {
  ingestResources,
  ingestState,
};

